import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import CanvasImage from './CanvasImage';
import TextLayer from './TextLayer';
import Consts from '../constants/consts';

/**
 * A component encapsulating the text layer, the canvas image, and adding additional wrapper to fix the size of the block,
 * when the element is rotated.
 */
class ComplexImage extends React.Component {

    static propTypes = {
        imageData: PropTypes.object.isRequired,
        imageDpi: PropTypes.number,
        userScale: PropTypes.number,
        textZones: PropTypes.array,
        rotation: PropTypes.oneOf([0, 90, 180, 270])
    };

    render() {
        const scaleFactor = Consts.DEFAULT_DPI / this.props.imageDpi * this.props.userScale;
        let width = Math.floor(this.props.imageData.width * scaleFactor);
        let height = Math.floor(this.props.imageData.height * scaleFactor);
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
            <div
                className="complex_image"
                style={{
                    width: width + "px",
                    height: height + "px"
                }}
                ref={this.props.outerRef}
            >
                <div className={cx(contentClasses)}>
                    <CanvasImage {...this.props} />
                    {this.props.textZones ? <TextLayer
                        textZones={this.props.textZones}
                        imageHeight={this.props.imageData.height}
                        imageWidth={this.props.imageData.width}
                        imageDpi={this.props.imageDpi}
                        userScale={this.props.userScale}
                    /> : null}
                </div>
            </div>
        );
    }
}

export default ComplexImage;