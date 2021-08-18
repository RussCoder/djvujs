import React from "react";
import { ControlButton } from "../StyledPrimitives";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import SaveNotification from "./SaveNotification";
import { useDispatch, useSelector } from "react-redux";
import { get } from "../../reducers";
import Actions from "../../actions/actions";
import { useTranslation } from "../Translation";

export default () => {
    const t = useTranslation();
    const dispatch = useDispatch();
    const [isNotificationShown, showNotification] = React.useState(false);
    const { onSaveNotification } = useSelector(get.uiOptions);
    const saveHandler = () => dispatch(Actions.tryToSaveDocument());

    return (
        <>
            <ControlButton
                onClick={() => {
                    if (onSaveNotification && onSaveNotification.text) {
                        showNotification(true);
                    } else {
                        saveHandler();
                    }
                }}
                icon={faDownload}
                title={t("Save document")}
            />
            {isNotificationShown ?
                <SaveNotification onSave={saveHandler} onClose={() => showNotification(false)} /> : null}
        </>
    )
};