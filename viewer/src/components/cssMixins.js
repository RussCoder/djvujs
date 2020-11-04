import { css } from "styled-components";

export const iconButton = css`
    cursor: pointer;

    &:hover {
        transform: scale(1.1);
    }
`;

export const styledInput = css`
    background: var(--background-color);
    border: 1px solid var(--border-color);
    border-radius: 2px;
    color: var(--color);
`;