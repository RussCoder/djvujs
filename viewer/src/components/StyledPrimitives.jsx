import styled, { keyframes } from 'styled-components';
import { controlButton } from './cssMixins';
import { FaSpinner } from "react-icons/fa";

export const ControlButton = styled.span`
    ${controlButton};
`;

export const ControlButtonWrapper = styled.span`
    cursor: pointer;

    :hover {
        ${ControlButton} {
            transform: scale(1.1);
        }
    }
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

const rotateDiscrete = keyframes`
    0% { transform: rotate(0turn); }
    100% { transform: rotate(1turn); }
`;

export const Spinner = styled(FaSpinner)`
    animation: ${rotateDiscrete} 1s infinite steps(9, end);
`;