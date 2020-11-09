import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import CanvasImage from './CanvasImage';
import TextLayer from './TextLayer';
import Consts from '../../constants/consts';
import styled from 'styled-components';
import LoadingPhrase from '../LoadingPhrase';

const Root = styled.div`
    position: relative;
    border: 1px solid darkgray;
    overflow: hidden;
    margin: 0 auto;

    .complex_image_content {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);

        img {
            display: block;
        }

        &>canvas {
            display: block;
        }

        &.rotate90 {
            transform: translateX(-50%) translateY(-50%) rotate(90deg);
        }

        &.rotate180 {
            transform: translateX(-50%) translateY(-50%) rotate(180deg);
        }

        &.rotate270 {
            transform: translateX(-50%) translateY(-50%) rotate(270deg);
        }
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
    };

    render() {
        const initialWidth = this.props.imageWidth || this.props.imageData.width;
        const initialHeight = this.props.imageHeight || this.props.imageData.height;

        const scaleFactor = Consts.DEFAULT_DPI / this.props.imageDpi * this.props.userScale;

        let width, height;
        let scaledWidth = width = Math.floor(initialWidth * scaleFactor);
        let scaledHeight = height = Math.floor(initialHeight * scaleFactor);

        if (this.props.rotation === 90 || this.props.rotation === 270) {
            [width, height] = [height, width];
        }

        const contentClasses = {
            complex_image_content: true,
            rotate90: this.props.rotation === 90,
            rotate180: this.props.rotation === 180,
            rotate270: this.props.rotation === 270,
        };

        return (
            <Root
                style={{
                    width: width + "px",
                    height: height + "px"
                }}
                ref={this.props.outerRef}
            >
                <div className={cx(contentClasses)}>
                    {this.props.imageData ?
                        <CanvasImage {...this.props} /> :
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