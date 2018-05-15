import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Actions from '../actions/actions';
import CanvasImage from './CanvasImage';
import { get } from '../reducers/rootReducer';

/**
 * CanvasImage wrapper. Handles user scaling of the image and grabbing.
 */
class ImageBlock extends React.Component {

    static propTypes = {
        imageData: PropTypes.object,
        imageDPI: PropTypes.number,
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
            this.wrapper.scrollTop = 0;
            return;
        }
        var heightDiff = this.wrapper.scrollHeight - this.wrapper.clientHeight;
        if (heightDiff > 0 && this.wrapper.scrollTop) {
            this.wrapper.scrollTop = snapshot.verticalRatio ? (snapshot.verticalRatio * this.wrapper.scrollHeight - this.wrapper.clientHeight / 2) : (heightDiff / 2);
        }
    }

    componentDidMount() {
        this.componentDidUpdate({}, {}, {});
    }

    wrapperRef = (node) => this.wrapper = node;

    onWheel = (e) => {
        if (!e.ctrlKey) {
            return;
        }
        e.preventDefault();
        const scaleDelta = 0.05 * (-Math.sign(e.deltaY));
        const newScale = this.props.userScale + scaleDelta;
        this.props.dispatch(Actions.setUserScaleAction(newScale));
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
        this.initialGrabbingState = null;
        this.wrapper.classList.remove('grabbing');
        this.wrapper.removeEventListener('mousemove', this.handleMoving);
    };

    render() {
        return (
            <div
                className="image_block"
                onWheel={this.onWheel}
                ref={this.wrapperRef}
                onMouseDown={this.startMoving}
                onMouseUp={this.finishMoving}
                onMouseOut={this.finishMoving}
            >
                {this.props.imageData ? <CanvasImage {...this.props} /> : null}
            </div>
        );
    }
}

export default connect(
    state => ({
        imageData: get.imageData(state),
        imageDPI: get.imageDpi(state),
        userScale: get.userScale(state)
    })
)(ImageBlock);