import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Actions from '../actions/actions';

const DEFAULT_DPI = 100;

class ImageBlock extends React.Component {

    static propTypes = {
        imageWidth: PropTypes.number,
        imageHeight: PropTypes.number,
        imageData: PropTypes.object,
        imageDPI: PropTypes.number,
        userScale: PropTypes.number
    };

    constructor(props) {
        super(props);
        this.tmpCanvas = document.createElement('canvas');
        this.tmpCanvasCtx = this.tmpCanvas.getContext('2d');
        this.lastUserScale = null;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.imageData !== nextProps.imageData) {
            this.lastUserScale = null;
            clearTimeout(this.redrawImageTimeout);
        }
    }

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
        this.updateImageIfRequired();
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
        this.updateImageIfRequired();
    }

    getScaleFactor() {
        return (this.props.imageDPI ? this.props.imageDPI / DEFAULT_DPI : 1) / this.props.userScale;
    }

    getScaledImageWidth() {
        if (this.props.imageDPI) {
            return this.props.imageWidth / this.getScaleFactor();
        } else {
            return null;
        }
    }

    getScaledImageHeight() {
        if (this.props.imageDPI) {
            return this.props.imageHeight / this.getScaleFactor();
        } else {
            return null;
        }
    }

    updateImageIfRequired() {
        if (!(this.canvas && this.props.imageData) && !(this.img && this.props.dataUrl)) {
            return;
        }
        if (this.props.imageData && this.lastUserScale !== this.props.userScale) {
            if (this.lastUserScale === null) { // if there is no image at all
                this.drawImageOnCanvas();
            }
            clearTimeout(this.redrawImageTimeout);
            this.redrawImageTimeout = setTimeout(() => {
                this.drawImageOnCanvas();
            }, 200);
        }
    }

    logarithmicScale() {
        const { imageData, imageDPI, userScale } = this.props;
        var tmpH, tmpW, tmpH2, tmpW2;

        var image = imageData.a;
        var scale = imageDPI ? imageDPI / DEFAULT_DPI : 1;
        scale /= userScale; // current scale factor compared with the initial size of the image

        this.tmpCanvas.width = tmpW = tmpW2 = image.width;
        this.tmpCanvas.height = tmpH = tmpH2 = image.height;
        this.tmpCanvasCtx.putImageData(image, 0, 0);
        while (Math.abs(scale - 1) >= 0.001 && tmpW > 1 && tmpH > 1) {
            var divisor = scale > 2 ? 2 : scale;
            scale /= divisor;
            tmpH2 /= divisor;
            tmpW2 /= divisor;
            this.tmpCanvasCtx.drawImage(this.tmpCanvas, 0, 0, tmpW, tmpH, 0, 0, tmpW2, tmpH2);
            tmpH = tmpH2;
            tmpW = tmpW2;
        }

        const newImageData = this.tmpCanvasCtx.getImageData(0, 0, Math.max(tmpW, 1), Math.max(tmpH, 1));
        this.tmpCanvas.width = this.tmpCanvas.height = 0;
        return newImageData;
    }

    drawImageOnCanvas() {
        this.putImageData(this.logarithmicScale());
        this.lastUserScale = this.props.userScale;
    }

    putImageData(imageData) {
        this.canvas.width = imageData.width;
        this.canvas.height = imageData.height;
        this.canvasCtx.putImageData(imageData, 0, 0);
    }

    canvasRef = (node) => {
        this.canvas = node;
        if (this.canvas) {
            this.canvasCtx = this.canvas.getContext('2d');
        }
    };

    imageRef = (node) => {
        this.img = node;
    };

    wrapperRef = (node) => this.wrapper = node;

    onWheel = (e) => {
        if (!e.ctrlKey) {
            return;
        }
        e.preventDefault();
        const scaleCoef = 0.0005;
        const scaleDelta = scaleCoef * (-e.deltaY);
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
                <div className="image">
                    <div style={{ opacity: 0, width: this.getScaledImageWidth(), height: this.getScaledImageHeight() }} />
                    <canvas
                        style={{ width: this.getScaledImageWidth(), height: this.getScaledImageHeight() }}
                        ref={this.canvasRef}
                    />
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        imageWidth: state.imageWidth,
        imageHeight: state.imageHeight,
        imageData: state.imageData,
        dataUrl: state.dataUrl,
        imageDPI: state.imageDPI,
        userScale: state.userScale
    })
)(ImageBlock);