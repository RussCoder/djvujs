import React from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';

import Actions from '../../actions/actions';
import { useTranslation } from "../Translation";

const HelpButton = () => {
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <span title={t("Show help window")}>
            <FontAwesomeIcon
                className="control_button"
                icon={faQuestionCircle}
                onClick={() => dispatch(Actions.showHelpWindowAction())}
            />
        </span>
    );
};

export default HelpButton;