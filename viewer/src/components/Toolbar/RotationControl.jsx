import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaUndo } from "react-icons/all";

import Actions from '../../actions/actions';
import { get } from '../../reducers';
import { useTranslation } from "../Translation";
import styled from 'styled-components';

const Root = styled.span`
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin: 0 0.5em;
    text-align: center;

    svg {
        font-size: calc(var(--button-basic-size) * 0.7);
    }

    svg:first-child {
        &:hover {
            transform: scale(1.1);
        }
    }

    svg:last-child {
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
        <Root data-djvujs-id="rotation_control" title={t("Rotate the page")}>
            <FaUndo onClick={rotateLeft} />
            <span css={`width: 2.5em;`}>{rotation}&deg;</span>
            <FaUndo onClick={rotateRight} />
        </Root>
    );
};

export default RotationControl;