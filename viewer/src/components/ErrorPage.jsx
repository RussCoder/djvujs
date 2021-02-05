import React from 'react';
import { useTranslation } from "./Translation";
import styled from 'styled-components';
import { getHeaderAndErrorMessage } from "./helpers";

const Root = styled.div`
    background: pink;
    color: black;
    padding: 1em;
    font-family: monospace;
    border: 1px solid gray;
    overflow: auto;
    height: 100%;
    box-sizing: border-box;
`;

const Header = styled.div`
    font-weight: 600;
    font-size: 1.5em;
    margin-bottom: 0.5em;
`;
export default ({ pageNumber, error }) => {
    const t = useTranslation();
    const { header, message } = getHeaderAndErrorMessage(t, error);

    return (
        <Root>
            <Header>{`${t("Error on page")} №${pageNumber}`}</Header>
            <div>
                <div css={`font-size: 1.2em; margin-bottom: 0.5em;`}>{header}</div>
                <div css={`white-space: pre; font-size: 1.2em;`}>{message}</div>
            </div>
        </Root>
    );
}