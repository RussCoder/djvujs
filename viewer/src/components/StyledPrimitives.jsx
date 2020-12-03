import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { iconButton } from './cssMixins';

export const ControlButton = styled(FontAwesomeIcon)`
    ${iconButton};
    margin: 0 0.5em;
`;

export const TextButton = styled.button`
    background: inherit;
    color: var(--color);
    border: 1px solid var(--color);
    border-radius: 3px;
    padding: 0.2em;
    cursor: pointer;

    &:hover {
        background: var(--alternative-background-color);
    }

    &:focus {
        outline: none;
    }
`;