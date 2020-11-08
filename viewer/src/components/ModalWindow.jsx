import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { css } from 'styled-components';
import { iconButton } from './cssMixins';

const style = css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    .modal_window {
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

        &.fixed_size {
            height: 80%;
            width: 80%;
        }

        &.error {
            background: rgb(255, 209, 212);
            color: black;
        }

        .close_button {
            ${iconButton};
            font-size: 25px;
            float: right;
            padding: 0.2em;
        }

        .content {
            overflow: auto;

            .notification_window {

                .header {
                    text-align: center;
                    padding: 0.5em;
                    border-bottom: 1px solid gray;
                }

                .body {
                    padding: 0.5em;
                    padding-right: 0;
                }
            }

            .help_window {
                padding: 0.5em;
        
                .header {
                    font-size: 1.2em;
                    width: 100%;
                    font-weight: 600;
                    border-bottom: 1px solid var(--border-color);
                    margin: 0.5em 0;
                }
            }
        }
    }

    .dark_layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--alternative-background-color);
        backdrop-filter: blur(2px);
        opacity: 0.8;
        z-index: 1;
    }
`;


export default class ModalWindow extends React.Component {

    static propTypes = {
        additionalClasses: PropTypes.string,
        isError: PropTypes.bool,
        isFixedSize: PropTypes.bool,
        onClose: PropTypes.func.isRequired
    };

    render() {
        const { onClose, additionalClasses, isError, isFixedSize } = this.props;

        const classes = {
            modal_window: true,
            error: isError,
            fixed_size: isFixedSize
        };

        return (
            <div css={style}>
                <div className="dark_layer" onClick={onClose} />
                <div className={`${cx(classes)} ${additionalClasses || ''}`}>
                    <FontAwesomeIcon
                        className="close_button"
                        icon={faTimesCircle}
                        onClick={onClose}
                    />
                    <div className="content">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}