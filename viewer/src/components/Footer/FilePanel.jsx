import React from 'react';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { faPrint } from '@fortawesome/free-solid-svg-icons';

import Actions from '../../actions/actions';
import { get } from '../../reducers';
import FileBlock from '../FileBlock';
import styled, { css } from 'styled-components';
import { ControlButton, TextButton } from '../StyledPrimitives';
import { useTranslation } from '../Translation';
import { useDispatch, useSelector } from 'react-redux';
import ModalWindow from "../ModalWindows/ModalWindow";
import { ActionTypes } from "../../constants";

const style = css`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const SaveNotification = styled.div`
    padding: 1em;
`;

const ButtonBlock = styled.div`
    margin-top: 1em;
    display: flex;
    justify-content: space-around;

    ${TextButton} {
        font-size: 0.8em;
    }
`;

export default () => {
    const t = useTranslation();
    const dispatch = useDispatch();
    const fileName = useSelector(get.fileName);
    const [isNotificationShown, showNotification] = React.useState(false);
    const { onSaveNotification } = useSelector(get.uiOptions);

    const saveHandler = () => dispatch(Actions.tryToSaveDocument());

    return (
        <div css={style}>
            {fileName ? (
                <span title={t("Close document")}>
                    <ControlButton
                        onClick={() => dispatch(Actions.closeDocumentAction())}
                        icon={faTimesCircle}
                    />
                </span>
            ) : null}
            <FileBlock fileName={fileName} />
            {fileName ? (
                <>
                    <ControlButton
                        icon={faPrint} title={t('Print document')}
                        onClick={() => dispatch({ type: ActionTypes.OPEN_PRINT_DIALOG })}
                    />
                    <TextButton
                        onClick={() => {
                            if (onSaveNotification && onSaveNotification.text) {
                                showNotification(true);
                            } else {
                                saveHandler();
                            }
                        }}
                        title={t("Save document")}
                    >
                        {t('Save')}
                    </TextButton>
                </>
            ) : null}
            {isNotificationShown ?
                <ModalWindow
                    onClose={() => {
                        if (!onSaveNotification.yesButton && !onSaveNotification.noButton) {
                            saveHandler();
                        }
                        showNotification(false);
                    }}
                    usePortal={true}
                >
                    <SaveNotification>
                        <div>{onSaveNotification.text}</div>
                        <ButtonBlock>
                            {onSaveNotification.yesButton ?
                                <TextButton
                                    onClick={() => {
                                        showNotification(false);
                                        saveHandler();
                                    }}
                                >
                                    {onSaveNotification.yesButton}
                                </TextButton> : null}
                            {onSaveNotification.noButton ?
                                <TextButton onClick={() => showNotification(false)}>
                                    {onSaveNotification.noButton}
                                </TextButton> : null}
                        </ButtonBlock>
                    </SaveNotification>
                </ModalWindow> : null}
        </div>
    );
}