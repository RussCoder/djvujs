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
        this.complexImage && (this.complexImage.style.opacity = 1); // show the content after the scroll bars were adjusted
    }

    componentDidMount() {
        this.componentDidUpdate({}, {}, {});
    }

    onWheel = (e) => {
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

    render() {
        const isGrabMode = this.props.cursorMode === Consts.GRAB_CURSOR_MODE;
        const classes = {
            image_block: true,
            grab: isGrabMode
        };
        return (
            <div
                className={cx(classes)}
                onWheel={this.onWheel}
                ref={this.wrapperRef}
                onMouseDown={isGrabMode ? this.startMoving : null}
                onMouseUp={isGrabMode ? this.finishMoving : null}
                onMouseLeave={isGrabMode ? this.finishMoving : null}
            >
                {this.props.imageData ?
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
        imageData: get.imageData(state),
        imageDpi: get.imageDpi(state),
        userScale: get.userScale(state),
        textZones: get.textZones(state),
        cursorMode: get.cursorMode(state),
        rotation: get.pageRotation(state),
    })
)(ImageBlock);