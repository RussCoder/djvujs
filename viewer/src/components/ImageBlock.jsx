import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';

import Actions from '../actions/actions';
import { get } from '../reducers/rootReducer';
import Consts from '../constants/consts';
import ComplexImage from './ComplexImage';

/**
 * CanvasImage wrapper. Handles user scaling of the image and grabbing.
 */
class ImageBlock extends React.Component {

    static propTypes = {
        imageData: PropTypes.object,
        imageDpi: PropTypes.number,
        userScale: PropTypes.number
    };

    pageElementList = {};
    _pageRefs = {};

    getSnapshotBeforeUpdate() {
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
        const currentPageElement = this.pageElementList[this.props.currentPageNumber];
        if (!currentPageElement || this.props.currentPageNumber === prevProps.currentPageNumber) {
            return;
        }
        const pageRect = currentPageElement.getBoundingClientRect();
        const wrapperRect = this.wrapper.getBoundingClientRect();

        if (!this.isVisible(pageRect, wrapperRect)) {
            currentPageElement.scrollIntoView();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
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
        console.log(e.nativeEvent.cancelable);
        if (this.scrollTimeStamp) {
            if (e.nativeEvent.timeStamp - this.scrollTimeStamp < 100) {
                e.nativeEvent.preventDefault();
                this.scrollTimeStamp = e.nativeEvent.timeStamp;
                return;
            } else {
                this.wrapper.style.overflow = null;
                this.scrollTimeStamp = null;
            }
        }
        if (!e.ctrlKey && e.nativeEvent.cancelable) {
            if ((this.wrapper.scrollHeight === this.wrapper.scrollTop + this.wrapper.clientHeight) && e.deltaY > 0) {
                e.preventDefault();
                this.scrollTimeStamp = e.nativeEvent.timeStamp;
                this.props.dispatch(Actions.goToNextPageAction());
            } else if (this.wrapper.scrollTop === 0 && e.deltaY < 0) {
                e.preventDefault();
                this.scrollTimeStamp = e.nativeEvent.timeStamp;
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
        e.preventDefault();
        this.initialGrabbingState = {
            clientX: e.clientX,
            clientY: e.clientY,
            scrollLeft: this.wrapper.scrollLeft,
            scrollTop: this.wrapper.scrollTop
        };
        this.wrapper.classList.add('grabbing');
        this.wrapper.addEventListener('mousemove', this.handleMoving);
    };

    finishMoving = (e) => {
        e.preventDefault();
        this.initialGrabbingState = null;
        this.wrapper.classList.remove('grabbing');
        this.wrapper.removeEventListener('mousemove', this.handleMoving);
    };

    wrapperRef = (node) => this.wrapper = node;

    complexImageRef = node => this.complexImage = node;

    downSearch(wrapperRect) {
        console.log('DOWN SEARCH');
        for (let number = this.props.currentPageNumber + 1; ; number++) {
            const page = this.pageElementList[number];
            if (!page) {
                return null;
            }
            const pageRect = page.getBoundingClientRect();
            if (this.isVisible(pageRect, wrapperRect)) {
                return number;
            }
        }
    }

    upSearch(wrapperRect, currentPageVisibility) {
        console.log('UP SEARCH');
        let lastVisiblePageNumber = currentPageVisibility ? this.props.currentPageNumber : null;

        for (let number = this.props.currentPageNumber - 1; ; number--) {
            const page = this.pageElementList[number];
            if (!page) {
                return lastVisiblePageNumber;
            }
            const pageRect = page.getBoundingClientRect();

            if (this.isVisible(pageRect, wrapperRect)) {
                lastVisiblePageNumber = number;
            } else if (lastVisiblePageNumber) {
                return lastVisiblePageNumber;
            }
        }
    }

    /**
     * A page is considered visible, if there is at least 25% of it is shown and it's at the top of the viewport (actual when there are many small pages, or a scale is small)
     * or if it takes more than 50% if the viewport (actual when there are bigger pages, the most common situation)
     */
    isVisible(pageRect, wrapperRect) {
        return (
            ((pageRect.bottom - wrapperRect.top) >= 0.25 * pageRect.height && pageRect.bottom <= wrapperRect.bottom)
            || (pageRect.top > wrapperRect.top && (wrapperRect.bottom - pageRect.top) >= wrapperRect.height * 0.5)
            || (pageRect.bottom < wrapperRect.bottom && (pageRect.bottom - wrapperRect.top) >= wrapperRect.height * 0.5)
        );
    }

    setNewPageNumber(pageNumber) {
        if (pageNumber && pageNumber !== this.props.currentPageNumber) {
            this.props.dispatch(Actions.setNewPageNumberAction(pageNumber));
        }
    }

    _onScroll = e => {
        this._lastScrollTimestamp = null;
        const wrapperRect = this.wrapper.getBoundingClientRect();
        const currentPage = this.pageElementList[this.props.currentPageNumber];
        if(!currentPage) {
            return;
        }
        const pageRect = currentPage.getBoundingClientRect();

        const currentPageVisibility = this.isVisible(pageRect, wrapperRect);
        let newCurrentPageNumber = null;
        if (currentPageVisibility) {
            newCurrentPageNumber = this.upSearch(wrapperRect, currentPageVisibility);
        } else if (pageRect.top < wrapperRect.top) {
            newCurrentPageNumber = this.downSearch(wrapperRect, currentPageVisibility);
        } else {
            newCurrentPageNumber = this.upSearch(wrapperRect, currentPageVisibility);
        }

        this.setNewPageNumber(newCurrentPageNumber);
    }

    onScroll = (e) => { // invoke on last scroll event, but not less frequently than once within 500 ms
        if (this._lastScrollTimestamp && e.nativeEvent.timeStamp - this._lastScrollTimestamp > 500) {
            clearTimeout(this.scrollTimeout);
            this._onScroll();
        } else {
            if (!this._lastScrollTimestamp) {
                this._lastScrollTimestamp = e.nativeEvent.timeStamp;
            }
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(this._onScroll, 50);
        }
    }

    getPageRef = (number) => { // as optimization to avoid recreation of an arrow function on each render
        if (!this._pageRefs[number]) {
            this._pageRefs[number] = node => this.pageElementList[number] = node;
        }

        return this._pageRefs[number];
    }

    render() {
        const isGrabMode = this.props.cursorMode === Consts.GRAB_CURSOR_MODE;
        const classes = {
            image_block: !this.props.continuousMode,
            continuous_image_block: this.props.continuousMode,
            grab: isGrabMode
        };
        return (
            <div
                className={cx(classes)}
                onWheel={this.onWheel}
                onScroll={this.onScroll}
                ref={this.wrapperRef}
                onMouseDown={isGrabMode ? this.startMoving : null}
                onMouseUp={isGrabMode ? this.finishMoving : null}
                onMouseLeave={isGrabMode ? this.finishMoving : null}
            >
                {this.props.continuousMode ? this.props.pagesList.map((pageData, i) => {
                    return (
                        <div className="complex_image_wrapper" key={i}>
                            <ComplexImage
                                imageUrl={pageData.url}
                                imageDpi={pageData.dpi}
                                imageWidth={pageData.width}
                                imageHeight={pageData.height}
                                userScale={this.props.userScale}
                                rotation={this.props.rotation}
                                outerRef={this.getPageRef(i + 1)}
                                textZones={pageData.textZones}
                            />
                        </div>
                    );
                }) :
                    this.props.imageData ?
                        <div
                            className="complex_image_wrapper"
                            ref={this.complexImageRef}
                            style={{ opacity: 0 }} // is changed in the ComponentDidUpdate
                        >
                            <ComplexImage {...this.props} />
                        </div> : null}
            </div>
        );
    }
}

export default connect(
    state => ({
        currentPageNumber: get.currentPageNumber(state),
        continuousMode: get.continuousMode(state),
        pagesList: get.pagesList(state),
        imageData: get.imageData(state),
        imageDpi: get.imageDpi(state),
        userScale: get.userScale(state),
        textZones: get.textZones(state),
        cursorMode: get.cursorMode(state),
        rotation: get.pageRotation(state),
    })
)(ImageBlock);