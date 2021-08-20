import React from "react";
import styled from "styled-components";

const ProgressBar = styled.div`
    border: 1px solid var(--color);
    width: 25em;
    max-width: 90%;
    height: 3px;
    margin-top: 0.5em;

    div:first-child {
        background: var(--color);
        height: 100%;
    }
`;

export default ({ percentage, className }) => (
    <ProgressBar className={className}>
        <div style={{ width: percentage + "%" }} />
    </ProgressBar>
);