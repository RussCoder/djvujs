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
        imageUrl: PropTypes.string,
        userScale: PropTypes.number
    };

    constructor(props) {
        super(props);
        this.tmpCanvas = document.createElement('canvas');
        this.tmpCanvasCtx = this.tmpCanvas.getContext('2d');
        this.state = { isCanvasMode: true };
        this.changeImageTimeout = null;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.imageData !== nextProps.imageData) {
            this.setState({ isCanvasMode: true });
            clearTimeout(this.changeImageTimeout);
        }
    }

    componentDidUpdate() {
        this.updateImageIfRequired();
    }

    componentDidMount() {
        this.updateImageIfRequired();
    }

    getScaledImageWidth() {
        if (this.props.imageDPI) {
            const stdScale = this.props.imageDPI ? this.props.imageDPI / DEFAULT_DPI : 1
            return this.props.imageWidth / stdScale * this.props.userScale;
        } else {
            return null;
        }
    }

    getScaledImageHeight() {
        if (this.props.imageDPI) {
            const stdScale = this.props.imageDPI ? this.props.imageDPI / DEFAULT_DPI : 1
            return this.props.imageHeight / stdScale * this.props.userScale;
        } else {
            return null;
        }
    }

    updateImageIfRequired() {
        if (!(this.canvas && this.props.imageData) && !(this.img && this.props.dataUrl)) {
            return;
        }
        if (!this.props.dataUrl && this.props.imageData) {
            this.drawImageOnCanvas();
        } else if (this.state.isCanvasMode) {
            this.changeImageTimeout = setTimeout(() => {
                this.setState({ isCanvasMode: false });
            }, 250);
        } else {
            this.canvas.height = this.canvas.width = 0;
        }
    }

    drawImageOnCanvas() {
        const { imageData, imageDPI, userScale } = this.props;

        var image = imageData.a;
        var scale = imageDPI ? imageDPI / DEFAULT_DPI : 1;
        scale /= userScale

        this.stdWidth = image.width / scale * userScale;
        this.stdHeight = image.height / scale * userScale;

        this.tmpCanvas.width = image.width;
        this.tmpCanvas.height = image.height;
        this.tmpCanvasCtx.putImageData(image, 0, 0);

        var tmpH, tmpW, tmpH2, tmpW2;
        tmpH = tmpH2 = this.tmpCanvas.height;
        tmpW = tmpW2 = this.tmpCanvas.width;

        if (scale > 4) {
            tmpH = this.tmpCanvas.height / scale * 4;
            tmpW = this.tmpCanvas.width / scale * 4;
            //первое сжатие
            this.tmpCanvasCtx.drawImage(this.tmpCanvas, 0, 0, tmpW, tmpH);
        }
        if (scale > 2) {
            tmpH2 = this.tmpCanvas.height / scale * 2;
            tmpW2 = this.tmpCanvas.width / scale * 2;
            //второе сжатие
            this.tmpCanvasCtx.drawImage(this.tmpCanvas, 0, 0, tmpW, tmpH, 0, 0, tmpW2, tmpH2);
        }
        //итоговое сжатие
        this.canvas.width = image.width / scale;
        this.canvas.height = image.height / scale;
        this.canvasCtx.drawImage(this.tmpCanvas, 0, 0, tmpW2, tmpH2,
            0, 0, this.canvas.width, this.canvas.height);
        this.tmpCanvas.width = this.tmpCanvas.height = 0;
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
        if (!this.state.initialGrabbingState) {
            return;
        }
        const { clientX, clientY, scrollLeft, scrollTop } = this.state.initialGrabbingState;
        const deltaX = clientX - e.clientX;
        const deltaY = clientY - e.clientY;

        this.wrapper.scrollLeft = scrollLeft + deltaX;
        this.wrapper.scrollTop = scrollTop + deltaY;
    };

    startMoving = (e) => {
        this.setState({
            initialGrabbingState: {
                clientX: e.clientX,
                clientY: e.clientY,
                scrollLeft: this.wrapper.scrollLeft,
                scrollTop: this.wrapper.scrollTop
            }
        });
        this.wrapper.addEventListener('mousemove', this.handleMoving);
    };

    finishMoving = (e) => {
        this.setState({ initialGrabbingState: null });
        this.wrapper.removeEventListener('mousemove', this.handleMoving);
    };

    render() {
        const isCanvasMode = this.state.isCanvasMode;
        const grabbingStyle = this.state.initialGrabbingState ? " grabbing" : "";

        return (
            <div
                className={"image_wrapper" + grabbingStyle}
                onWheel={this.onWheel}
                ref={this.wrapperRef}
                onMouseDown={this.startMoving}
                onMouseUp={this.finishMoving}
                onMouseOut={this.finishMoving}
            >
                <div className="image">
                    <div style={{ opacity: 0, width: this.getScaledImageWidth(), height: this.getScaledImageHeight() }} />
                    <img
                        style={{ zIndex: isCanvasMode ? 1 : 2, display: this.props.dataUrl ? "inline" : "none" }}
                        width={this.getScaledImageWidth()}
                        ref={this.imageRef}
                        src={this.props.dataUrl}
                        alt='DjVu.js Viewer'
                    />
                    <canvas
                        style={isCanvasMode ? { zIndex: 2 } : { zIndex: 1 }}
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