import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import styled, { css } from 'styled-components';
import { iconButton } from '../cssMixins';

const style = css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`;

const ModalWindowRoot = styled.div`
    box-shadow: 0 0 2px var(--color);
    background: var(--modal-window-background-color);
    border-radius: 0.5em;
    font-size: 1.5em;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    max-width: 80%;
    max-height: 80%;
    z-index: 2;
    padding: 0;
    overflow: hidden;

    ${p => p.$fixedSize ? `
        height: 80%;
        width: 80%;
    ` : ''};

    ${p => p.$error ? `
       background: rgb(255, 209, 212);
       color: black;
    ` : ''};
`;

const closeButtonStyle = css`
    ${iconButton};
    font-size: 25px;
    float: right;
    padding: 0.2em;
`;

const DarkLayer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--alternative-background-color);
    backdrop-filter: blur(2px);
    opacity: 0.8;
    z-index: 1;
`;

export default class ModalWindow extends React.Component {

    static propTypes = {
        additionalClasses: PropTypes.string,
        isError: PropTypes.bool,
        isFixedSize: PropTypes.bool,
        onClose: PropTypes.func.isRequired
    };

    render() {
        const { onClose, isError, isFixedSize, className = '' } = this.props;

        return (
            <div css={style}>
                <DarkLayer onClick={onClose} />
                <ModalWindowRoot
                    className={className}
                    $error={isError}
                    $fixedSize={isFixedSize}
                >
                    <FontAwesomeIcon
                        css={closeButtonStyle}
                        icon={faTimesCircle}
                        onClick={onClose}
                    />
                    <div css={`overflow: auto;`}>
                        {this.props.children}
                    </div>
                </ModalWindowRoot>
            </div>
        );
    }
}