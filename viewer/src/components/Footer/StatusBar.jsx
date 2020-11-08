import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { get } from '../../reducers/rootReducer';
import { useTranslation } from '../Translation';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import Consts from '../../constants/index';

const Root = styled.div`
    flex: 0 0 auto;
    font-size: 1em;
    padding-left: 0.5em;
    text-align: left;
    font-style: italic;
    align-self: flex-end;
    white-space: nowrap;
    width: 7em;
`;

const StatusBar = () => {
    const inContinuosScroll = useSelector(get.viewMode) === Consts.CONTINUOUS_SCROLL_MODE;
    const isLoading = useSelector(get.isLoading) && !inContinuosScroll;
    const t = useTranslation();

    return (
        <Root>
            <FontAwesomeIcon
                icon={isLoading ? faSpinner : faCheck}
                pulse={isLoading ? true : false}
            />
            <span css={`margin-left: 0.5em`}>
                {isLoading ? t("Loading") + "..." : t("Ready")}
            </span>
        </Root>
    );
};

export default StatusBar;