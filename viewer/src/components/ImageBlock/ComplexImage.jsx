import React from 'react';
import PropTypes from 'prop-types';

import CanvasImage from './CanvasImage';
import TextLayer from './TextLayer';
import Constants from '../../constants';
import styled from 'styled-components';
import LoadingPhrase from '../misc/LoadingPhrase';
import memoize from "memoize-one";

const Root = styled.div`
    position: relative;
    border: 1px solid darkgray;
    overflow: hidden;
    margin: 0 auto;

    & > div:first-child {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);

        img {
            display: block;
        }

        & > canvas {
            display: block;
        }

        ${p => p.$rotation ? `transform: translateX(-50%) translateY(-50%) rotate(${p.$rotation}deg)` : ''};
    }
`;

/**
 * A component encapsulating the text layer, the canvas image, and adding additional wrapper to fix the size of the block,
 * when the element is rotated.
 */
class ComplexImage extends React.PureComponent {

    static propTypes = {
        imageData: PropTypes.object,
        imageUrl: PropTypes.string,
        imageWidth: PropTypes.number,
        imageHeight: PropTypes.number,
        imageDpi: PropTypes.number,
        userScale: PropTypes.number,
        textZones: PropTypes.array,
        rotation: PropTypes.oneOf([0, 90, 180, 270]),
        outerRef: PropTypes.func,
        currentPageNumber: PropTypes.number,
    };

    /**
     * Firefox cannot putImageData() bigger than about 12_000 * 12_000 pixels.
     * createImageBitmap() fails too.
     * Chrome fails on 25_000 * 22_000.
     * So the solution is just to scale down an image once, as if it were of a smaller size.
     * The current solution should be replaced with createImageBitmap() scaling
     * once it's supported by Firefox and Safari. Now images up to 20K * 20K pixels are supported:
     * the image is downscaled to half being divided into 4 quarters, using 4 canvases.
     * Theoretically, the image can be split into more than 4 equal blocks, so that even bigger ones are processed.
     * But there is a doubt the library will be able to decode bigger images,
     * since it sometimes fails with an out of memory error on a 16K * 12K image.
     */
    resizeImageIfRequired = memoize((image) => {
        const dimensionThreshold = 10000;
        const { width, height } = image;
        const maxDimension = Math.max(width, height);

        if (maxDimension <= dimensionThreshold) return image;

        const createTempCanvas = (image, x, y, width, height) => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d', { alpha: false });
            ctx.putImageData(image, -x, -y, x, y, width, height);
            return canvas;
        };

        const outputCanvas = document.createElement('canvas');
        const outputCtx = outputCanvas.getContext('2d', { alpha: false });

        const halfWidth = Math.floor(width / 2);
        const halfHeight = Math.floor(height / 2);

        const width1 = Math.floor(halfWidth / 2);
        const width2 = Math.floor((width - halfWidth) / 2);
        const height1 = Math.floor(halfHeight / 2);
        const height2 = Math.floor((height - halfHeight) / 2);

        outputCanvas.width = width1 + width2;
        outputCanvas.height = height1 + height2;

        const drawImage = (x, y, width, height, destX, destY, destWidth, destHeight) => outputCtx.drawImage(
            createTempCanvas(image, x, y, width, height),
            0, 0, width, height,
            destX, destY, destWidth, destHeight,
        );

        drawImage(
            0, 0, halfWidth, halfHeight,
            0, 0, width1, height1,
        );
        drawImage(
            halfWidth, 0, width - halfWidth, halfHeight,
            width1, 0, width2, height1,
        );
        drawImage(
            0, halfHeight, halfWidth, height - halfHeight,
            0, height1, width1, height2,
        );
        drawImage(
            halfWidth, halfHeight, width - halfWidth, height - halfHeight,
            width1, height1, width2, height2,
        );

        return outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    });

    render() {
        const imageData = this.props.imageData && this.resizeImageIfRequired(this.props.imageData);

        const initialWidth = this.props.imageWidth || imageData.width;
        const initialHeight = this.props.imageHeight || imageData.height;

        const scaleFactor = Constants.DEFAULT_DPI / this.props.imageDpi * this.props.userScale;

        let width, height;
        let scaledWidth = width = Math.floor(initialWidth * scaleFactor);
        let scaledHeight = height = Math.floor(initialHeight * scaleFactor);

        if (this.props.rotation === 90 || this.props.rotation === 270) {
            [width, height] = [height, width];
        }

        return (
            <Root
                style={{
                    width: width + "px",
                    height: height + "px"
                }}
                $rotation={this.props.rotation}
                ref={this.props.outerRef}
            >
                <div>
                    {imageData ?
                        <CanvasImage
                            imageData={imageData}
                            imageDpi={this.props.imageDpi}
                            userScale={this.props.userScale}
                            key={this.props.currentPageNumber}
                        /> :
                        this.props.imageUrl ?
                            <img
                                src={this.props.imageUrl}
                                style={{
                                    width: scaledWidth + "px",
                                    height: scaledHeight + "px"
                                }}
                                alt="djvu_page"
                            />
                            :
                            <LoadingPhrase
                                style={{
                                    fontSize: Math.min(scaledWidth * 0.1, scaledHeight * 0.1) + 'px',
                                    whiteSpace: 'nowrap',
                                }}
                            />
                    }
                    {this.props.textZones ?
                        <TextLayer
                            textZones={this.props.textZones}
                            imageHeight={initialHeight}
                            imageWidth={initialWidth}
                            imageDpi={this.props.imageDpi}
                            userScale={this.props.userScale}
                        /> : null}
                </div>
            </Root>
        );
    }
}

export default ComplexImage;