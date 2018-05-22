import React from 'react';
import PropTypes from 'prop-types';

import Consts from '../constants/consts';

class TextLayer extends React.Component {

    static propTypes = {
        zone: PropTypes.object,
        imageHeight: PropTypes.number
    };

    render() {
        const { textZones, imageHeight, imageWidth } = this.props;
        if (!textZones) {
            return null;
        }
        const scaleFactor = Consts.DEFAULT_DPI / this.props.imageDpi * this.props.userScale;

        return (
            <div className="text_layer_wrapper"
                style={{
                    width: (imageWidth * scaleFactor) + 'px',
                    height: (imageHeight * scaleFactor) + 'px'
                }}
            >
                <div
                    className="text_layer"
                    style={{
                        left: (-(imageWidth - imageWidth * scaleFactor) / 2) + 'px',
                        top: (-(imageHeight - imageHeight * scaleFactor) / 2) + 'px',
                        width: imageWidth + 'px',
                        height: imageHeight + 'px',
                        transform: `scale(${scaleFactor})`
                    }}
                >
                    {textZones.map((zone, i) => (
                        <div
                            key={i}
                            className="text_zone"
                            style={{
                                left: zone.x + 'px',
                                bottom: zone.y + 'px',
                                width: zone.width + 'px',
                                height: zone.height + 'px',
                                fontSize: zone.height * 0.9 + 'px'
                            }}
                        >
                            {zone.text}
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default TextLayer;