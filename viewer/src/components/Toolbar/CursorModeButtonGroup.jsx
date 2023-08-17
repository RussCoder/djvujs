import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegHandPaper, FaICursor } from "react-icons/fa";

import { get } from '../../reducers';
import Constants from '../../constants';
import Actions from '../../actions/actions';
import { useTranslation } from "../Translation";
import styled from "styled-components";
import { controlButton } from "../cssMixins";

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
        <Root data-djvujs-id="cursor_mode_buttons">
            <span title={t("Text cursor mode")} className={cursorMode === Constants.TEXT_CURSOR_MODE ? "active" : null}>
                <FaICursor
                    css={controlButton}
                    onClick={() => dispatch(Actions.setCursorModeAction(Constants.TEXT_CURSOR_MODE))}
                />
            </span>
            <span title={t("Grab cursor mode")} className={cursorMode === Constants.GRAB_CURSOR_MODE ? "active" : null}>
                <FaRegHandPaper
                    css={controlButton}
                    onClick={() => dispatch(Actions.setCursorModeAction(Constants.GRAB_CURSOR_MODE))}
                />
            </span>
        </Root>
    );
};

export default CursorModeButtonGroup;