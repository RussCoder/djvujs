import React from 'react';
import styled from 'styled-components';
import { useTranslation } from './Translation';

const Root = styled.div`
    overflow: auto;
    max-height: 100%;
    padding: 0.5em;
    box-sizing: border-box;

    pre {
        width: fit-content;
        margin: auto;
        background: inherit;
        border: 1px solid var(--border-color);
        padding: 0.5em;
    } 
`;

export default ({ text }) => {
    const t = useTranslation();

    return (
        <Root>
            <pre>
                {text === null ?
                    t("Loading") + "..." :
                    text || <em>{t("No text on this page")}</em>}
            </pre>
        </Root>
    );
};
