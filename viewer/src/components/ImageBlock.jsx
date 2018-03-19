import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Actions from '../actions/actions';
import CanvasImage from './CanvasImage';

/**
 * CanvasImage wrapper. Handles user scaling of the image and grabbing.
 */
class ImageBlock extends React.Component {

    static propTypes = {
        imageData: PropTypes.object,
        imageDPI: PropTypes.number,
        userScale: PropTypes.number
    };

    componentWillUpdate() {
        this.horizontalRatio = null;
        if (this.wrapper.scrollWidth > this.wrapper.clientWidth) {
            this.horizontalRatio = (this.wrapper.scrollLeft + this.wrapper.clientWidth / 2) / this.wrapper.scrollWidth;
        }
        this.verticalRatio = null;
        if (this.wrapper.scrollHeight > this.wrapper.clientHeight && this.wrapper.scrollTop) {
            this.verticalRatio = (this.wrapper.scrollTop + this.wrapper.clientHeight / 2) / this.wrapper.scrollHeight;
        }
    }

    componentDidUpdate() {
        var widthDiff = this.wrapper.scrollWidth - this.wrapper.clientWidth;
        if (widthDiff > 0) {
            this.wrapper.scrollLeft = this.horizontalRatio ? (this.horizontalRatio * this.wrapper.scrollWidth - this.wrapper.clientWidth / 2) : (widthDiff / 2);
        }
        var heightDiff = this.wrapper.scrollHeight - this.wrapper.clientHeight;
        if (heightDiff > 0 && this.wrapper.scrollTop) {
            this.wrapper.scrollTop = this.verticalRatio ? (this.verticalRatio * this.wrapper.scrollHeight - this.wrapper.clientHeight / 2) : (heightDiff / 2);
        }
    }

    componentDidMount() {
        this.componentDidUpdate();
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
                className="image_wrapper"
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
        imageData: state.imageData,
        imageDPI: state.imageDPI,
        userScale: state.userScale
    })
)(ImageBlock);