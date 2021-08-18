import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import CloseButton from "../misc/CloseButton";

const style = css`
    z-index: 0; // to make windows with their dark layers lie one on top of another when they are created in sequence 
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
`;

const ModalWindowRoot = styled.div`
    color: var(--color);
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
    width: max-content;
    height: max-content;
    z-index: 2;
    padding: 0;
    overflow: hidden;
    display: flex; // to enable overflow: auto in the content wrapper
    flex-direction: column;
    --closeButtonBlockHeight: 28px;

    ${p => p.$fixedSize ? `
        height: 80%;
        width: 80%;
    ` : ''};

    ${p => p.$error ? `
       background: rgb(255, 209, 212);
       color: black;
    ` : ''};
`;

const ContentWrapper = styled.div`
    overflow: auto;
    padding-bottom: var(--closeButtonBlockHeight);
`

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
        isError: PropTypes.bool,
        isFixedSize: PropTypes.bool,
        usePortal: PropTypes.bool,
        onClose: PropTypes.func.isRequired
    };

    render() {
        const { onClose, isError, isFixedSize, className = '', usePortal = false } = this.props;

        const component = (
            <div css={style} data-djvujs-class="modal_window">
                <DarkLayer onClick={onClose} data-djvujs-class="dark_layer" />
                <ModalWindowRoot
                    className={className}
                    $error={isError}
                    $fixedSize={isFixedSize}
                >
                    <CloseButton
                        onClick={onClose}
                        css={`
                            height: var(--closeButtonBlockHeight);
                            margin-left: auto;
                            margin-right: 0.25em;
                        `}
                    />
                    <ContentWrapper>
                        {this.props.children}
                    </ContentWrapper>
                </ModalWindowRoot>
            </div>
        );

        if (usePortal) { // portal is needed to a modal window from another modal window.
            // In the first render, when the app is mounted, there is no container element,
            // but in normal case a modal window should be shown before the app is mounted.
            const container = document.getElementById('djvujs-modal-windows-container');
            return container ? ReactDOM.createPortal(component, container) : component;
        } else {
            return component;
        }
    }
}