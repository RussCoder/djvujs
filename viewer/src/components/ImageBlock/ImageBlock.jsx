import React from 'react';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import memoize from 'memoize-one';

import Actions from '../../actions/actions';
import { get } from '../../reducers';
import Constants from '../../constants';
import ComplexImage from './ComplexImage';
import VirtualList from './VirtualList';
import { createDeferredHandler } from '../helpers';
import styled, { css } from 'styled-components';

const grabbingCursor = css`
    &.djvujs_grabbing {
        cursor: grabbing;
    }
`;

const style = css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
    touch-action: pan-x pan-y;
    ${p => p.$grab ? 'cursor: grab' : ''};

    ${grabbingCursor};
`;

const ContinuousScrollItem = styled.div`
    box-sizing: border-box;
    min-width: 100%;
    padding: 2px 0;
    transform: translate3d(0, 0, 0); // just for performance optimization when continuos mode is enabled
`;

function resetEventListener(node, event, handler, options = undefined) {
    node.removeEventListener(event, handler, options);
    node.addEventListener(event, handler, options);
}

/**
 * CanvasImage wrapper. Handles user scaling of the image and grabbing.
 */
class ImageBlock extends React.Component {

    static propTypes = {
        imageData: PropTypes.object,
        imageDpi: PropTypes.number,
        userScale: PropTypes.number
    };

    initialGrabbingState = null;
    pointerEventCache = {};
    lastPointerDiff = -1;

    getSnapshotBeforeUpdate() {
        if (!this.wrapper) {
            return null;
        }
        let horizontalRatio = null;
        if (this.wrapper.scrollWidth > this.wrapper.clientWidth) {
            horizontalRatio = (this.wrapper.scrollLeft + this.wrapper.clientWidth / 2) / this.wrapper.scrollWidth;
        }
        let verticalRatio = null;
        if (this.wrapper.scrollHeight > this.wrapper.clientHeight && this.wrapper.scrollTop) {
            // the position of the central point of a scroll bar
            verticalRatio = (this.wrapper.scrollTop + this.wrapper.clientHeight / 2) / this.wrapper.scrollHeight;
        }

        return { horizontalRatio, verticalRatio };
    }

    scrollCurrentPageIntoViewIfRequired(prevProps) {
        if (this.props.viewMode === Constants.CONTINUOUS_SCROLL_MODE
            && this.props.shouldScrollToPage
            && (prevProps.currentPageNumber !== this.props.currentPageNumber
                || prevProps.viewMode !== Constants.CONTINUOUS_SCROLL_MODE)
            && this.virtualList
            && !this.virtualList.isItemVisible(this.props.currentPageNumber - 1)) {
            this.virtualList.scrollToItem(this.props.currentPageNumber - 1);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.wrapper) {
            return;
        }
        var widthDiff = this.wrapper.scrollWidth - this.wrapper.clientWidth;
        if (widthDiff > 0) {
            this.wrapper.scrollLeft = snapshot.horizontalRatio ? (snapshot.horizontalRatio * this.wrapper.scrollWidth - this.wrapper.clientWidth / 2) : (widthDiff / 2);
        }
        if (prevProps.imageData !== this.props.imageData) { // when a page was changed     
            if (this.scrollToBottomOnUpdate) {
                this.wrapper.scrollTop = this.wrapper.scrollHeight;
                this.scrollToBottomOnUpdate = false;
            } else {
                this.wrapper.scrollTop = 0;
            }
        } else {
            var heightDiff = this.wrapper.scrollHeight - this.wrapper.clientHeight;
            if (heightDiff > 0 && this.wrapper.scrollTop) {
                this.wrapper.scrollTop = snapshot.verticalRatio ? (snapshot.verticalRatio * this.wrapper.scrollHeight - this.wrapper.clientHeight / 2) : (heightDiff / 2);
            }
        }

        this.scrollCurrentPageIntoViewIfRequired(prevProps);

        this.complexImage && (this.complexImage.style.opacity = 1); // show the content after the scroll bars were adjusted
    }

    enableScaleHandler = e => {
        if (this.isScaleHandlerEnabled || e.key !== 'Control' || !this.wrapper) return;
        this.wrapper.addEventListener('wheel', this.wheelScaleHandler);
        this.isScaleHandlerEnabled = true;
    }

    disableScaleHandler = e => {
        if (!this.isScaleHandlerEnabled || e.key !== 'Control') return;
        this.wrapper.removeEventListener('wheel', this.wheelScaleHandler);
        this.isScaleHandlerEnabled = false;
    }

    componentDidMount() {
        window.addEventListener('keydown', this.enableScaleHandler);
        window.addEventListener('keyup', this.disableScaleHandler);

        this.componentDidUpdate({}, {}, {});
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.enableScaleHandler);
        window.removeEventListener('keyup', this.disableScaleHandler);
    }

    wheelScaleHandler = e => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        const scaleDelta = 0.05 * (-Math.sign(e.deltaY));
        const newScale = this.props.userScale + scaleDelta;
        this.props.dispatch(Actions.setUserScaleAction(newScale));
    }

    singlePageWheelHandler = (e) => {
        if (e.ctrlKey) return;

        if (!this.props.changePageOnScroll) return;

        // scrollTimeStamp is needed to ignore scroll events following immediately after the event which
        // caused the page change.
        if (this.scrollTimeStamp) {
            if (e.timeStamp - this.scrollTimeStamp < 100) {
                e.preventDefault();
                this.scrollTimeStamp = e.timeStamp;
                return;
            } else {
                this.scrollTimeStamp = null;
            }
        }
        if (!e.ctrlKey && e.cancelable) {
            if ((this.wrapper.scrollHeight === this.wrapper.scrollTop + this.wrapper.clientHeight) && e.deltaY > 0) {
                e.preventDefault();
                this.scrollTimeStamp = e.timeStamp;
                this.props.dispatch(Actions.goToNextPageAction());
            } else if (this.wrapper.scrollTop === 0 && e.deltaY < 0) {
                e.preventDefault();
                this.scrollTimeStamp = e.timeStamp;
                this.scrollToBottomOnUpdate = true;
                this.props.dispatch(Actions.goToPreviousPageAction());
            }
        }
    };

    handleMoving = (e) => {
        e.preventDefault();
        if (!this.initialGrabbingState) {
            return;
        }
        const { clientX, clientY, scrollLeft, scrollTop } = this.initialGrabbingState
        const deltaX = clientX - e.clientX;
        const deltaY = clientY - e.clientY;

        this.wrapper.scrollLeft = scrollLeft + deltaX;
        this.wrapper.scrollTop = scrollTop + deltaY;
    };

    startMoving = (e) => {
        if (!this.isGrabMode()) {
            return;
        }
        e.preventDefault();
        this.initialGrabbingState = {
            clientX: e.clientX,
            clientY: e.clientY,
            scrollLeft: this.wrapper.scrollLeft,
            scrollTop: this.wrapper.scrollTop
        };
        this.wrapper.classList.add('djvujs_grabbing');
    };

    finishMoving = (e) => {
        if (!this.isGrabMode()) {
            return;
        }
        e.preventDefault();
        this.initialGrabbingState = null;
        this.wrapper.classList.remove('djvujs_grabbing');
    };

    onPointerDown = (e) => {
        this.wrapper.addEventListener('pointermove', this.onPointerMove);

        if (e.pointerType === 'mouse') {
            return this.startMoving(e);
        }

        this.pointerEventCache[e.pointerId] = e;
    };

    onPointerMove = (e) => {
        if (e.pointerType === 'mouse') {
            return this.handleMoving(e);
        }

        this.pointerEventCache[e.pointerId] = e;

        const events = Object.values(this.pointerEventCache);
        if (events.length === 2) {
            e.preventDefault();
            e.stopPropagation(); // isn't needed for mobile chrome, but maybe for other browsers

            const pointerDiff = Math.hypot(events[0].clientX - events[1].clientX, events[0].clientY - events[1].clientY);
            if (this.lastPointerDiff > 0) {
                const blockSize = Math.hypot(this.wrapper.offsetWidth, this.wrapper.offsetHeight);
                this.props.dispatch(Actions.setUserScaleAction(
                    this.props.userScale + (pointerDiff - this.lastPointerDiff) / blockSize
                ));
            }

            this.lastPointerDiff = pointerDiff;
        }
    }

    onPointerUp = (e) => {
        if (e.pointerType === 'mouse') {
            this.finishMoving(e);
        }

        delete this.pointerEventCache[e.pointerId];
        const events = Object.values(this.pointerEventCache);
        if (events.length < 2) {
            this.lastPointerDiff = -1;
        }

        if (events.length === 0) {
            this.wrapper.removeEventListener('pointermove', this.onPointerMove);
        }
    }


    wrapperRef = (node) => {
        this.wrapper = node;
        if (!node) return;

        resetEventListener(node, 'pointerdown', this.onPointerDown);
        resetEventListener(node, 'pointerup', this.onPointerUp);
        resetEventListener(node, 'pointerleave', this.onPointerUp);
        resetEventListener(node, 'pointercancel', this.onPointerUp);

        if (this.props.viewMode === Constants.CONTINUOUS_SCROLL_MODE) {
            resetEventListener(node, 'scroll', this.onScroll, { passive: true });
        } else {
            resetEventListener(node, 'wheel', this.singlePageWheelHandler);
        }
    }

    isGrabMode() {
        return this.props.cursorMode === Constants.GRAB_CURSOR_MODE;
    }

    complexImageRef = node => this.complexImage = node;

    setNewPageNumber(pageNumber) {
        if (pageNumber && pageNumber !== this.props.currentPageNumber) {
            this.props.dispatch(Actions.setNewPageNumberAction(pageNumber));
        }
    }

    onScroll = createDeferredHandler(() => {
        this.setNewPageNumber(this.virtualList.getCurrentVisibleItemIndex() + 1);
    });

    getItemSizes = memoize((pageList, userScale, rotation) => {
        const isRotated = rotation === 90 || rotation === 270;
        return pageList.map(page => {
            const scaleFactor = Constants.DEFAULT_DPI / page.dpi * userScale;
            return Math.floor((isRotated ? page.width : page.height) * scaleFactor) + 6; // 2px for top and bottom image borders, 4px for vertical paddings of the wrapper element
        })
    });

    virtualListRef = component => this.virtualList = component;

    itemRenderer = React.memo(({ index, style }) => {
        const pageData = useSelector(state => get.pageList(state)[index]);

        return (
            <ContinuousScrollItem style={style} key={index}>
                <ComplexImage
                    imageUrl={pageData.url}
                    imageDpi={pageData.dpi}
                    imageWidth={pageData.width}
                    imageHeight={pageData.height}
                    userScale={this.props.userScale}
                    rotation={this.props.rotation}
                    textZones={pageData.textZones}
                />
            </ContinuousScrollItem>
        )
    });

    render() {
        const isGrabMode = this.props.cursorMode === Constants.GRAB_CURSOR_MODE;
        const { documentId, pageSizeList, userScale, rotation, viewMode, imageData } = this.props;

        return (viewMode === Constants.CONTINUOUS_SCROLL_MODE && pageSizeList.length) ?
            <VirtualList
                ref={this.virtualListRef}
                outerRef={this.wrapperRef}
                css={`${grabbingCursor}; ${isGrabMode ? 'cursor: grab;' : ''}`}
                itemSizes={this.getItemSizes(pageSizeList, userScale, rotation)}
                //data={pageList}
                itemRenderer={this.itemRenderer}
                key={documentId}
            />
            : imageData ?
                <div
                    css={style}
                    $grab={isGrabMode}
                    ref={this.wrapperRef}
                >
                    <div
                        ref={this.complexImageRef}
                        css={`padding: 1em; margin: auto`}
                        style={{ opacity: 0 }} // is changed in the ComponentDidUpdate
                    >
                        <ComplexImage {...this.props} />
                    </div>
                </div> : null;
    }
}

export default connect(
    state => ({
        documentId: get.documentId(state),
        currentPageNumber: get.currentPageNumber(state),
        shouldScrollToPage: get.shouldScrollToPage(state),
        viewMode: get.viewMode(state),
        //pageList: get.pageList(state),
        pageSizeList: get.pageSizeList(state),
        imageData: get.imageData(state),
        imageDpi: get.imageDpi(state),
        userScale: get.userScale(state),
        textZones: get.textZones(state),
        cursorMode: get.cursorMode(state),
        rotation: get.pageRotation(state),
        changePageOnScroll: get.uiOptions(state).changePageOnScroll,
    })
)(ImageBlock);