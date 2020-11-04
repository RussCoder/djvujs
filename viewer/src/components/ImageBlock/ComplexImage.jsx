import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import CanvasImage from './CanvasImage';
import TextLayer from './TextLayer';
import Consts from '../../constants/consts';

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
            <div
                className="complex_image"
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
                            <div style={{
                                fontSize: Math.min(scaledWidth * 0.1, scaledHeight * 0.1) + 'px',
                                whiteSpace: 'nowrap',
                            }}>
                                <FontAwesomeIcon
                                    icon={faSpinner}
                                    pulse={true}
                                />
                                <span> Loading...</span>
                            </div>
                    }
                    {this.props.textZones ? <TextLayer
                        textZones={this.props.textZones}
                        imageHeight={initialHeight}
                        imageWidth={initialWidth}
                        imageDpi={this.props.imageDpi}
                        userScale={this.props.userScale}
                    /> : null}
                </div>
            </div>
        );
    }
}

export default ComplexImage;