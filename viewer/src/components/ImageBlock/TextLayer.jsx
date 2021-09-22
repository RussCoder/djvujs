import React, { useEffect, useRef } from 'react';
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
    text-align-last: justify;
    text-align: justify;
    position: absolute;
    box-sizing: border-box;
    font-family: 'Times New Roman', Garamond, Times, serif;

    span {
        white-space: pre;
    }
`;

const TextLayer = ({ textZones, imageHeight, imageWidth, userScale, imageDpi }) => {
    const wrapper = useRef(null);

    useEffect(() => {
        if (!wrapper.current) return;

        for (const textZone of wrapper.current.children) {
            const span = textZone.firstChild;
            if (span.offsetWidth < textZone.offsetWidth) {
                const letterSpacing = (textZone.offsetWidth - span.offsetWidth) / span.innerText.length;
                span.style.letterSpacing = letterSpacing + 'px';
            }
        }
    }, [textZones, wrapper.current]);

    if (!textZones) return null;

    const scaleFactor = Constants.DEFAULT_DPI / imageDpi * userScale;
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
                ref={wrapper}
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
                        <span>{zone.text}</span>
                    </TextZone>
                ))}
            </div>
        </Root>
    );
}

export default TextLayer;