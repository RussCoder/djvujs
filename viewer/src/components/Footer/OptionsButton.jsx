import React from 'react';
import { useDispatch } from 'react-redux';
import { faCog } from '@fortawesome/free-solid-svg-icons';

import { useTranslation } from "../Translation";
import { ControlButton } from '../StyledPrimitives';
import { ActionTypes } from "../../constants";

const OptionsButton = () => {
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <span title={t("Show options window")} data-djvujs-class="options_button">
            <ControlButton
                icon={faCog}
                onClick={() => dispatch({ type: ActionTypes.TOGGLE_OPTIONS_WINDOW, payload: true })}
            />
        </span>
    );
};

export default OptionsButton;