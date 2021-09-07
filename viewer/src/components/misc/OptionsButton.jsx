import React from 'react';
import { useDispatch } from 'react-redux';
import { faCog } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from "../Translation";
import { ControlButton, ControlButtonWrapper } from '../StyledPrimitives';
import { ActionTypes } from "../../constants";

const OptionsButton = ({ withLabel = false, onClick = () => {} }) => {
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <ControlButtonWrapper
            title={t("Show options window")}
            data-djvujs-class="options_button"
            onClick={() => {
                dispatch({ type: ActionTypes.TOGGLE_OPTIONS_WINDOW, payload: true })
                onClick();
            }}
        >
            <ControlButton icon={faCog} />
            {withLabel ? <span>{t('Options')}</span> : null}
        </ControlButtonWrapper>
    );
};

export default OptionsButton;