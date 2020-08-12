import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';

import Actions from '../../actions/actions';
import { get } from '../../reducers/rootReducer';
import { useTranslation } from "../Translation";

const RotationControl = () => {
    const dispatch = useDispatch();
    const rotation = useSelector(get.pageRotation);
    const t = useTranslation();

    const rotateLeft = () => {
        dispatch(Actions.setPageRotationAction(rotation ? rotation - 90 : 270));
    };

    const rotateRight = () => {
        dispatch(Actions.setPageRotationAction(rotation === 270 ? 0 : rotation + 90));
    };

    return (
        <div className="rotation_control" title={t("Rotate the page")}>
            <FontAwesomeIcon icon={faUndo} className="rotate_left_button" onClick={rotateLeft} />
            <span className="rotation_value">{rotation}&deg;</span>
            <FontAwesomeIcon icon={faUndo} className="rotate_right_button" onClick={rotateRight} />
        </div>
    );
};

export default RotationControl;