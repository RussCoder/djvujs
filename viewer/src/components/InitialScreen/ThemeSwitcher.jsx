import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { get } from '../../reducers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-regular-svg-icons';
import { ActionTypes } from '../../constants/index';

const Root = styled.div`
    margin-top: 1.5em;

    svg {
        margin: 0 0.5em;
        cursor: pointer;
    }
`;

const activeStyle = css`
    transform: scale(1.5);
    color: var(--highlight-color);
`;

export default () => {
    const { theme } = useSelector(get.options);
    const dispatch = useDispatch();
    const createClickHandler = theme => () => dispatch({ type: ActionTypes.UPDATE_OPTIONS, payload: { theme } });

    return (
        <Root>
            <FontAwesomeIcon
                icon={faSun}
                css={theme === 'light' ? activeStyle : null}
                onClick={createClickHandler('light')}
            />
            <FontAwesomeIcon
                icon={faMoon}
                css={theme === 'dark' ? activeStyle : null}
                onClick={createClickHandler('dark')}
            />
        </Root>
    )
};