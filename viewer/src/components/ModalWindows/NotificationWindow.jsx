import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ModalWindow from './ModalWindow';
import Actions from '../../actions/actions';
import { TranslationContext } from "../Translation";
import styled from "styled-components";

const Header = styled.div`
    text-align: center;
    padding: 0.5em;
    border-bottom: 1px solid gray;
`;

const Body = styled.div`
    padding: 0.5em;
    padding-right: 0;
`;

class NotificationWindow extends React.Component {

    static propTypes = {
        header: PropTypes.string,
        message: PropTypes.string,
        type: PropTypes.string,
        closeNotificationWindow: PropTypes.func.isRequired
    };

    static contextType = TranslationContext;

    render() {
        const { header, message, closeNotificationWindow } = this.props;

        if (!header) {
            return null;
        }
        const isError = this.props.type === 'error';
        const t = this.context;

        return (
            <ModalWindow isError={isError} onClose={closeNotificationWindow}>
                <div>
                    <Header>
                        {isError ? t("Error") + ": " + header : header}
                    </Header>
                    <Body>{message}</Body>
                </div>
            </ModalWindow>
        );
    }
}

export default connect(null, {
    closeNotificationWindow: Actions.closeModalWindowAction
})(NotificationWindow);