import React from 'react';
import PropTypes from 'prop-types';

import Consts from '../constants/consts';

/**
 * A component containing logic of rendering ImageData on canvas element.
 * Scales itself via css and via logarithmic scale method. 
 */
export default class CanvasImage extends React.Component {

    static propTypes = {
        imageData: PropTypes.object.isRequired,
        imageDPI: PropTypes.number.isRequired,
        userScale: PropTypes.number.isRequired
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

    componentDidUpdate() {
        this.updateImageIfRequired();
    }

    componentDidMount() {
        this.updateImageIfRequired();
    }

    getScaleFactor() {
        return (this.props.imageDPI ? this.props.imageDPI / Consts.DEFAULT_DPI : 1) / this.props.userScale;
    }

    getScaledImageWidth() {
        return Math.floor(this.props.imageData.width / this.getScaleFactor());
    }

    getScaledImageHeight() {
        return Math.floor(this.props.imageData.height / this.getScaleFactor());
    }

    updateImageIfRequired() {
        if (!(this.canvas && this.props.imageData)) {
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

        var image = imageData;
        var scale = imageDPI ? imageDPI / Consts.DEFAULT_DPI : 1;
        scale /= userScale; // current scale factor compared with the initial size of the image

        if (scale <= 1) {
            return image; // when it's scaled up, it will be just scaled with css
        }

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
        if (!this.canvas) {
            return;
        }
        this.canvas.width = imageData.width;
        this.canvas.height = imageData.height;
        this.canvasCtx.putImageData(imageData, 0, 0);

        if (this.getScaleFactor() >= 1) { // if it's not scaled only with css
            this.canvas.style.width = imageData.width + 'px'; // just in case, since there may be a rounding error
            this.canvas.style.height = imageData.height + 'px';
        }
    }

    canvasRef = (node) => {
        this.canvas = node;
        if (this.canvas) {
            this.canvasCtx = this.canvas.getContext('2d');
        }
    };

    render() {
        return (
            // <div className="canvas_image" style={{ width: this.getScaledImageWidth(), height: this.getScaledImageHeight() }}>
            <canvas
                style={{ width: this.getScaledImageWidth(), height: this.getScaledImageHeight() }}
                ref={this.canvasRef}
            />
            // </div>
        );
    }
}
