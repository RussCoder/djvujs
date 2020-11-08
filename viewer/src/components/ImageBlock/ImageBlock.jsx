import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import memoize from 'memoize-one';

import Actions from '../../actions/actions';
import { get } from '../../reducers/rootReducer';
import Consts from '../../constants/consts';
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
    ${p => p.$grab ? 'cursor: grab' : ''};

    ${grabbingCursor};
`;

const ContinuousScrollItem = styled.div`
    box-sizing: border-box;
    min-width: 100%;
    padding: 2px 0;
    transform: translate3d(0, 0, 0); // just for performance optimization when continuos mode is enabled
`;

/**
 * CanvasImage wrapper. Handles user scaling of the image and grabbing.
 */
class ImageBlock extends React.Component {

    static propTypes = {
        imageData: PropTypes.object,
        imageDpi: PropTypes.number,
        userScale: PropTypes.number
    };

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

    scrollCurrentPageIntoViewIfRequired() {
        if (this.props.viewMode === Consts.CONTINUOUS_SCROLL_MODE
            && this.props.isPageNumberSetManually
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

    componentDidMount() {
        this.componentDidUpdate({}, {}, {});
    }

    onWheel = (e) => {
        if (this.scrollTimeStamp) {
            if (e.timeStamp - this.scrollTimeStamp < 100) {
                e.preventDefault();
                this.scrollTimeStamp = e.timeStamp;
                return;
            } else {
                this.wrapper.style.overflow = null;
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
            return;
        }
        if (e.ctrlKey) {
            e.preventDefault();
            const scaleDelta = 0.05 * (-Math.sign(e.deltaY));
            const newScale = this.props.userScale + scaleDelta;
            this.props.dispatch(Actions.setUserScaleAction(newScale));
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
        this.wrapper.addEventListener('mousemove', this.handleMoving);
    };

    finishMoving = (e) => {
        if (!this.isGrabMode()) {
            return;
        }
        e.preventDefault();
        this.initialGrabbingState = null;
        this.wrapper.classList.remove('djvujs_grabbing');
        this.wrapper.removeEventListener('mousemove', this.handleMoving);
    };

    wrapperRef = (node) => {
        this.wrapper = node;
        if (node) {
            node.removeEventListener('mousedown', this.startMoving);
            node.removeEventListener('mouseup', this.finishMoving);
            node.removeEventListener('mouseleave', this.finishMoving);

            node.addEventListener('mousedown', this.startMoving);
            node.addEventListener('mouseup', this.finishMoving);
            node.addEventListener('mouseleave', this.finishMoving);
            node.removeEventListener('wheel', this.onWheel);
            node.addEventListener('wheel', this.onWheel);

            if (this.props.viewMode === Consts.CONTINUOUS_SCROLL_MODE) {
                node.removeEventListener('scroll', this.onScroll);
                node.addEventListener('scroll', this.onScroll);
            }
        }
    }

    isGrabMode() {
        return this.props.cursorMode === Consts.GRAB_CURSOR_MODE;
    }

    complexImageRef = node => this.complexImage = node;

    setNewPageNumber(pageNumber) {
        if (pageNumber && pageNumber !== this.props.currentPageNumber) {
            this.props.dispatch(Actions.setNewPageNumberAction(pageNumber));
        }
    }

    _onScroll = e => {
        this._firstScrollTimestamp = null;
        this.setNewPageNumber(this.virtualList.getCurrentVisibleItemIndex() + 1);
    }

    onScroll = createDeferredHandler(this._onScroll)

    getItemSizes = memoize((pageList, userScale, rotation) => {
        const isRotated = rotation === 90 || rotation === 270;
        return this.props.pageList.map(page => {
            const scaleFactor = Consts.DEFAULT_DPI / page.dpi * userScale;
            return Math.floor((isRotated ? page.width : page.height) * scaleFactor) + 6; // 2px for top and bottom image borders, 4px for vertical paddings of the wrapper element
        })
    });

    virtualListRef = component => this.virtualList = component;

    itemRenderer = React.memo(({ index, style, data: pageData }) => {
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
        const isGrabMode = this.props.cursorMode === Consts.GRAB_CURSOR_MODE;

        const { documentId, pageSizeList, pageList, userScale, rotation } = this.props;
        return this.props.viewMode === Consts.CONTINUOUS_SCROLL_MODE ?
            <VirtualList
                ref={this.virtualListRef}
                outerRef={this.wrapperRef}
                css={`${grabbingCursor}; ${isGrabMode ? 'cursor: grab;' : ''}`}
                itemSizes={this.getItemSizes(pageSizeList, userScale, rotation)}
                data={pageList}
                itemRenderer={this.itemRenderer}
                key={documentId}
            />
            : this.props.imageData ?
                <div
                    css={style}
                    $grab={isGrabMode}
                    ref={this.wrapperRef}
                >
                    <div
                        ref={this.complexImageRef}
                        css={`padding: 1em, margin: auto`}
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
        isPageNumberSetManually: get.isPageNumberSetManually(state),
        viewMode: get.viewMode(state),
        pageList: get.pageList(state),
        pageSizeList: get.pageSizeList(state),
        imageData: get.imageData(state),
        imageDpi: get.imageDpi(state),
        userScale: get.userScale(state),
        textZones: get.textZones(state),
        cursorMode: get.cursorMode(state),
        rotation: get.pageRotation(state),
    })
)(ImageBlock);