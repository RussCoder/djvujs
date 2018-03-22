import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { connect } from 'react-redux';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/fontawesome-free-regular';

import Actions from '../actions/actions';

class ModalWindow extends React.Component {

    static propTypes = {
        header: PropTypes.string,
        message: PropTypes.string,
        type: PropTypes.string,
        closeModalWindow: PropTypes.func.isRequired
    };

    render() {
        const { header, message, closeModalWindow } = this.props;

        if (!header) {
            return null;
        }
        const isError = this.props.type === 'error';
        const classes = cx({
            "modal_window": true,
            "error": isError
        });
        return (
            <div className="modal_window_wrapper">
                <div className="dark_layer" onClick={closeModalWindow} />
                <div className={classes}>
                    <div className="header">
                        {isError ? "Error: " + header : header}
                        <FontAwesomeIcon
                            className="close_button"
                            icon={faTimesCircle}
                            onClick={closeModalWindow}
                        />
                    </div>
                    <div className="body">{message}</div>
                </div>
            </div>
        );
    }
}

export default connect(null, {
    closeModalWindow: Actions.closeModalWindowAction
})(ModalWindow);