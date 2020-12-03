import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';

import Actions from '../../actions/actions';
import { get } from '../../reducers';
import { useTranslation } from "../Translation";
import styled from 'styled-components';

const Root = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    margin: 0 0.5em;

    svg:first-child {
        font-size: 1.2em;
        &:hover {
            transform: scale(1.1);
        }
    }

    svg:last-child {
        font-size: 1.2em;
        transform: scale(-1, 1);
        &:hover {
            transform: scale(-1.1, 1.1);
        }
    }
`;

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
        <Root className="rotation_control" title={t("Rotate the page")}>
            <FontAwesomeIcon icon={faUndo} onClick={rotateLeft} />
            <span css={`width: 2.5em;`}>{rotation}&deg;</span>
            <FontAwesomeIcon icon={faUndo} onClick={rotateRight} />
        </Root>
    );
};

export default RotationControl;