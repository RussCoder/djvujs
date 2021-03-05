import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { get } from '../../reducers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-regular-svg-icons';
import { ActionTypes } from '../../constants/index';

const Root = styled.span`
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
                data-djvujs-id={'light_theme_button'}
                data-djvujs-class={theme === 'light' ? 'active' : null}
            />
            <FontAwesomeIcon
                icon={faMoon}
                css={theme === 'dark' ? activeStyle : null}
                onClick={createClickHandler('dark')}
                data-djvujs-id={'dark_theme_button'}
                data-djvujs-class={theme === 'dark' ? 'active' : null}
            />
        </Root>
    )
};