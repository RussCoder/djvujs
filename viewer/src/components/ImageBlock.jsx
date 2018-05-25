import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';

import Actions from '../actions/actions';
import CanvasImage from './CanvasImage';
import { get } from '../reducers/rootReducer';
import TextLayer from './TextLayer';
import Consts from '../constants/consts';

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
                <div className="complex_image">
                    {this.props.imageData ? <CanvasImage {...this.props} /> : null}
                    {this.props.textZones ? <TextLayer
                        textZones={this.props.textZones}
                        imageHeight={this.props.imageData.height}
                        imageWidth={this.props.imageData.width}
                        imageDpi={this.props.imageDPI}
                        userScale={this.props.userScale}
                    /> : null}
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        imageData: get.imageData(state),
        imageDPI: get.imageDpi(state),
        userScale: get.userScale(state),
        textZones: get.textZones(state),
        cursorMode: get.cursorMode(state),
    })
)(ImageBlock);