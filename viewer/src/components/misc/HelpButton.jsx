import React from 'react';
import { useDispatch } from 'react-redux';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';

import Actions from '../../actions/actions';
import { useTranslation } from "../Translation";
import { ControlButton, ControlButtonWrapper } from '../StyledPrimitives';

const HelpButton = ({ withLabel = null, onClick = () => {} }) => {
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <ControlButtonWrapper
            title={t("Show help window")}
            data-djvujs-class="help_button"
            onClick={() => {
                dispatch(Actions.showHelpWindowAction());
                onClick();
            }}
        >
            <ControlButton icon={faQuestionCircle} />
            {withLabel ? <span>{t('About')}</span> : null}
        </ControlButtonWrapper>
    );
};

export default HelpButton;