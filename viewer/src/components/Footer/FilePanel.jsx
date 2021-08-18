/* not used anymore */

import React from 'react';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { faPrint } from '@fortawesome/free-solid-svg-icons';

import Actions from '../../actions/actions';
import { get } from '../../reducers';
import FileBlock from '../FileBlock';
import styled from 'styled-components';
import { ControlButton, TextButton } from '../StyledPrimitives';
import { useTranslation } from '../Translation';
import { useDispatch, useSelector } from 'react-redux';
import { ActionTypes } from "../../constants";
import SaveNotification from "../misc/SaveNotification";

const Root = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default () => {
    const t = useTranslation();
    const dispatch = useDispatch();
    const fileName = useSelector(get.fileName);
    const isDocumentLoaded = useSelector(get.isDocumentLoaded);
    const [isNotificationShown, showNotification] = React.useState(false);
    const { onSaveNotification, hideOpenAndCloseButtons, hidePrintButton, hideSaveButton } = useSelector(get.uiOptions);

    const saveHandler = () => dispatch(Actions.tryToSaveDocument());

    if (!isDocumentLoaded) return null;

    return (
        <Root>
            {hideOpenAndCloseButtons ? fileName ? <span>{fileName}</span> : null :
                <FileBlock fileName={fileName || ''} />}
            {hideOpenAndCloseButtons ? null :
                <span title={t("Close document")}>
                    <ControlButton
                        onClick={() => dispatch(Actions.closeDocumentAction())}
                        icon={faTimesCircle}
                    />
                </span>}


            {hidePrintButton ? null : <ControlButton
                icon={faPrint} title={t('Print document')}
                onClick={() => dispatch({ type: ActionTypes.OPEN_PRINT_DIALOG })}
            />}

            {hideSaveButton ? null : <TextButton
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
            </TextButton>}

            {isNotificationShown ?
                <SaveNotification onSave={saveHandler} onClose={() => showNotification(false)} /> : null}
        </Root>
    );
}