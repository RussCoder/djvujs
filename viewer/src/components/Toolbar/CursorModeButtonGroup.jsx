import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { faHandPaper } from '@fortawesome/free-regular-svg-icons';
import { faICursor } from '@fortawesome/free-solid-svg-icons';

import { get } from '../../reducers';
import Constants from '../../constants';
import Actions from '../../actions/actions';
import { useTranslation } from "../Translation";
import { ControlButton } from '../StyledPrimitives';
import styled from "styled-components";

const Root = styled.div`
    white-space: nowrap;
    padding: 0 0.1em;

    span {
        opacity: 0.5;
        display: inline-block;

        &.active {
            opacity: 1;
        }
    }
`;

const CursorModeButtonGroup = () => {
    const cursorMode = useSelector(get.cursorMode);
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <Root>
            <span title={t("Text cursor mode")} className={cursorMode === Constants.TEXT_CURSOR_MODE ? "active" : null}>
                <ControlButton
                    icon={faICursor}
                    onClick={() => dispatch(Actions.setCursorModeAction(Constants.TEXT_CURSOR_MODE))}
                />
            </span>
            <span title={t("Grab cursor mode")} className={cursorMode === Constants.GRAB_CURSOR_MODE ? "active" : null}>
                <ControlButton
                    icon={faHandPaper}
                    onClick={() => dispatch(Actions.setCursorModeAction(Constants.GRAB_CURSOR_MODE))}
                />
            </span>
        </Root>
    );
};

export default CursorModeButtonGroup;