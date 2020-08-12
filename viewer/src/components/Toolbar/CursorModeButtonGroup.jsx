import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPaper } from '@fortawesome/free-regular-svg-icons';
import { faICursor } from '@fortawesome/free-solid-svg-icons';

import { get } from '../../reducers/rootReducer';
import Consts from '../../constants/consts';
import Actions from '../../actions/actions';
import { useTranslation } from "../Translation";

const CursorModeButtonGroup = () => {
    const cursorMode = useSelector(get.cursorMode);
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <div className="button_group">
            <span title={t("Text cursor mode")} className={cursorMode === Consts.TEXT_CURSOR_MODE ? "active" : null}>
                <FontAwesomeIcon
                    className="control_button"
                    icon={faICursor}
                    onClick={() => dispatch(Actions.setCursorModeAction(Consts.TEXT_CURSOR_MODE))}
                />
            </span>
            <span title={t("Grab cursor mode")} className={cursorMode === Consts.GRAB_CURSOR_MODE ? "active" : null}>
                <FontAwesomeIcon
                    className="control_button"
                    icon={faHandPaper}
                    onClick={() => dispatch(Actions.setCursorModeAction(Consts.GRAB_CURSOR_MODE))}
                />
            </span>
        </div>
    );
};

export default CursorModeButtonGroup;