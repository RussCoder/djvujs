import React from "react";
import ModalWindow from "../ModalWindows/ModalWindow";
import { TextButton } from "../StyledPrimitives";
import { useSelector } from "react-redux";
import { get } from "../../reducers";
import styled from "styled-components";

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

export default ({ onSave = () => {}, onClose = () => {} }) => {
    const { onSaveNotification } = useSelector(get.uiOptions);

    return (
        <ModalWindow
            onClose={() => {
                if (!onSaveNotification.yesButton && !onSaveNotification.noButton) {
                    onSave();
                }
                onClose();
            }}
            usePortal={true}
        >
            <SaveNotification>
                <div>{onSaveNotification.text}</div>
                <ButtonBlock>
                    {onSaveNotification.yesButton ?
                        <TextButton
                            onClick={() => {
                                onClose();
                                onSave();
                            }}
                        >
                            {onSaveNotification.yesButton}
                        </TextButton> : null}
                    {onSaveNotification.noButton ?
                        <TextButton onClick={onClose}>
                            {onSaveNotification.noButton}
                        </TextButton> : null}
                </ButtonBlock>
            </SaveNotification>
        </ModalWindow>
    )
};