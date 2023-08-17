import React from "react";
import { ControlButton, ControlButtonWrapper } from "../StyledPrimitives";
import { FaDownload } from "react-icons/fa";
import SaveNotification from "./SaveNotification";
import { useDispatch, useSelector } from "react-redux";
import { get } from "../../reducers";
import Actions from "../../actions/actions";
import { useTranslation } from "../Translation";

export default ({ withLabel = false, onClick = () => {} }) => {
    const t = useTranslation();
    const dispatch = useDispatch();
    const [isNotificationShown, showNotification] = React.useState(false);
    const { onSaveNotification } = useSelector(get.uiOptions);
    const saveHandler = () => dispatch(Actions.tryToSaveDocument());

    return (
        <>
            <ControlButtonWrapper
                title={t("Save document")}
                onClick={() => {
                    if (onSaveNotification && onSaveNotification.text) {
                        showNotification(true);
                    } else {
                        saveHandler();
                    }
                    onClick();
                }}
            >
                <ControlButton as={FaDownload} />
                {withLabel ? <span>{t('Save')}</span> : null}
            </ControlButtonWrapper>
            {isNotificationShown ?
                <SaveNotification onSave={saveHandler} onClose={() => showNotification(false)} /> : null}
        </>
    );
};