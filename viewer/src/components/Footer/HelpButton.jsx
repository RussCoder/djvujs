import React from 'react';
import { useDispatch } from 'react-redux';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';

import Actions from '../../actions/actions';
import { useTranslation } from "../Translation";
import { ControlButton } from '../StyledPrimitives';

const HelpButton = () => {
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <span title={t("Show help window")}>
            <ControlButton
                icon={faQuestionCircle}
                onClick={() => dispatch(Actions.showHelpWindowAction())}
            />
        </span>
    );
};

export default HelpButton;