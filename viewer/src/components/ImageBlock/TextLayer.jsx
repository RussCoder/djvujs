import React from 'react';
import PropTypes from 'prop-types';
import Constants from '../../constants';
import styled from 'styled-components';

const Root = styled.div`
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;

    & > div:first-child {
        top: 0;
        left: 0;
        position: absolute;
    }
`;

const TextZone = styled.div`
    line-height: initial;
    color: rgba(0, 0, 0, 0);
    white-space: nowrap;
    text-align-last: justify;
    text-align: justify;
    position: absolute;
    box-sizing: border-box;
    font-family: 'Times New Roman', Times, serif;
`;

class TextLayer extends React.Component {

    static propTypes = {
        zone: PropTypes.object,
        imageHeight: PropTypes.number,
        imageWidth: PropTypes.number
    };

    render() {
        const { textZones, imageHeight, imageWidth } = this.props;
        if (!textZones) {
            return null;
        }
        const scaleFactor = Constants.DEFAULT_DPI / this.props.imageDpi * this.props.userScale;
        const scaledWidth = Math.floor(imageWidth * scaleFactor);
        const scaledHeight = Math.floor(imageHeight * scaleFactor);

        return (
            <Root
                style={{
                    width: scaledWidth + 'px',
                    height: scaledHeight + 'px'
                }}
            >
                <div
                    style={{
                        left: (-(imageWidth - scaledWidth) / 2) + 'px',
                        top: (-(imageHeight - scaledHeight) / 2) + 'px',
                        width: imageWidth + 'px',
                        height: imageHeight + 'px',
                        transform: `scale(${scaleFactor})`
                    }}
                >
                    {textZones.map((zone, i) => (
                        <TextZone
                            key={i}
                            style={{
                                left: zone.x + 'px',
                                bottom: zone.y + 'px',
                                width: zone.width + 'px',
                                height: zone.height + 'px',
                                fontSize: zone.height * 0.9 + 'px'
                            }}
                        >
                            {zone.text}
                        </TextZone>
                    ))}
                </div>
            </Root>
        );
    }
}

export default TextLayer;