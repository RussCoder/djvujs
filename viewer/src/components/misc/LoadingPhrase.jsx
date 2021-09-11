import React from 'react';
import { useTranslation } from '../Translation';
import { Spinner } from "../StyledPrimitives";
import styled from "styled-components";

const Root = styled.div`
    display: flex;
    align-items: center;

    span {
        margin-left: 0.5em;
    }
`;

export default ({ style, className }) => {
    const t = useTranslation();

    return (
        <Root style={style} className={className}>
            <Spinner />
            <span>{t('Loading')}...</span>
        </Root>
    );
};