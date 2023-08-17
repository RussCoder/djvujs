import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { FaRegFileAlt, FaRegFileImage, FaCaretLeft, FaCaretRight } from "react-icons/fa";

import { get } from '../../reducers';
import Constants, { ActionTypes } from '../../constants';
import { useTranslation } from '../Translation';
import styled from 'styled-components';
import { controlButton } from "../cssMixins";
import { ControlButton } from "../StyledPrimitives";
import { useAppContext } from '../AppContext.jsx';

const ContinuousScrollButton = styled.span`
    ${controlButton};
    display: inline-flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    overflow: hidden;
    max-height: 100%;

    svg {
        flex: 0 0 auto;
    }
`;

const ContinuousScrollButtonWrapper = styled.span`
    height: 100%;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    opacity: 1;
`;

const Root = styled.span`
    display: inline-flex;
    align-items: center;
    height: calc(var(--button-basic-size) * 1.2);

    & > span:not(${ContinuousScrollButtonWrapper}), ${ContinuousScrollButton} {
        opacity: 0.5;
    }
`;

const PageCount = ({ value, max, onChange, title, style }) => {
    return (
        <span
            title={title}
            style={style}
            css={`
                display: inline-flex;
                align-items: center;

                svg {
                    font-size: 2em;
                    cursor: pointer;

                    &[djvujs-disabled] {
                        opacity: 0.5;
                        cursor: not-allowed;
                        pointer-events: none;
                    }

                    &:hover {
                        transform: scale(1.1);
                    }
                }
            `}>
            <FaCaretLeft djvujs-disabled={value < 2 ? 1 : null} onClick={() => onChange(value - 1)} />
            <span>{value}</span>
            <FaCaretRight djvujs-disabled={value >= max ? 1 : null} onClick={() => onChange(value + 1)} />
        </span>
    );
}

const ViewModeButtons = () => {
    const dispatch = useDispatch();
    const viewMode = useSelector(get.viewMode);
    const isIndirect = useSelector(get.isIndirect);
    const pageCountInRow = useSelector(get.pageCountInRow);
    const firstRowPageCount = useSelector(get.firstRowPageCount);
    const isContScroll = viewMode === Constants.CONTINUOUS_SCROLL_MODE;
    const t = useTranslation();
    const { isMobile } = useAppContext();

    const enableContinuousScrollMode = () => {
        dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: Constants.CONTINUOUS_SCROLL_MODE });
    };

    const enableSinglePageMode = () => {
        dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: Constants.SINGLE_PAGE_MODE });
    };

    const enableTextMode = () => {
        dispatch({ type: ActionTypes.SET_VIEW_MODE, payload: Constants.TEXT_MODE });
    };

    return (
        <Root data-djvujs-id="view_mode_buttons">
                <span
                    title={t("Text view mode")}
                    style={viewMode === Constants.TEXT_MODE ? { opacity: 1 } : null}
                >
                    <ControlButton
                        as={FaRegFileAlt}
                        onClick={enableTextMode}
                    />
                </span>
            <span
                title={t("Single page view mode")}
                style={viewMode === Constants.SINGLE_PAGE_MODE ? { opacity: 1 } : null}
            >
                    <ControlButton
                        as={FaRegFileImage}
                        onClick={enableSinglePageMode}
                    />
                </span>
            {isIndirect ? null :
                <ContinuousScrollButtonWrapper>
                    <ContinuousScrollButton
                        style={isContScroll ? { opacity: 1 } : null}
                        title={t("Continuous scroll view mode")}
                        onClick={enableContinuousScrollMode}
                    >
                        <FaRegFileImage />
                        <FaRegFileImage />
                    </ContinuousScrollButton>
                    {isMobile ? null : <>
                        <PageCount
                            style={!isContScroll ? { visibility: 'hidden' } : null}
                            title={t("Number of pages in a row")}
                            max={Constants.MAX_PAGE_COUNT_IN_ROW}
                            value={pageCountInRow}
                            onChange={(value) => dispatch({
                                type: ActionTypes.UPDATE_OPTIONS,
                                payload: {
                                    pageCountInRow: value,
                                    firstRowPageCount: Math.min(
                                        firstRowPageCount === pageCountInRow ? value : firstRowPageCount,
                                        value
                                    ),
                                }
                            })}
                        />
                        <PageCount
                            style={!isContScroll ? { visibility: 'hidden' } : null}
                            title={t("Number of pages in the first row")}
                            max={Math.min(Constants.MAX_PAGE_COUNT_IN_ROW, pageCountInRow)}
                            value={firstRowPageCount}
                            onChange={(value) => dispatch({
                                type: ActionTypes.UPDATE_OPTIONS,
                                payload: {
                                    firstRowPageCount: value,
                                }
                            })}
                        />
                    </>}
                </ContinuousScrollButtonWrapper>
            }
        </Root>
    );
};

export default connect(state => ({
    viewMode: get.viewMode(state),
    isIndirect: get.isIndirect(state),
    pageCountInRow: get.pageCountInRow(state),
    firstRowPageCount: get.firstRowPageCount(state),
}))(ViewModeButtons);