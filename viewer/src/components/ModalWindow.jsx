import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';

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
            <div className="modal_window_wrapper">
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