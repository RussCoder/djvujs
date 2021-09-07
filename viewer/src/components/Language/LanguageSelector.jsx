import { ActionTypes } from "../../constants";
import dictionaries from "../../locales";
import LanguageWarningSign from "./LanguageWarningSign";
import AddLanguageButton from "./AddLanguageButton";
import React from "react";
import styled from "styled-components";
import { styledInput } from "../cssMixins";
import { useTranslation } from "../Translation";
import { useDispatch, useSelector } from "react-redux";
import { get } from "../../reducers";

const Select = styled.select`
    font-size: 1em;
    margin-right: 0.5em;
    padding-right: 0.5em;
    ${styledInput};
`;

const Root = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
`;

export default () => {
    const { locale } = useSelector(get.options);
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <Root>
            <span style={{ marginRight: '0.5em' }}>{t('Language')}:</span>
            <Select
                value={locale}
                onChange={(e) => dispatch({
                    type: ActionTypes.UPDATE_OPTIONS,
                    payload: { locale: e.target.value }
                })}
            >
                {Object.entries(dictionaries).map(([code, dic]) => (
                    <option value={code} key={code}>{dic.nativeName}</option>
                ))}
            </Select>
            <LanguageWarningSign languageCode={locale} />
            <AddLanguageButton css={`font-size: 1.2em`} />
        </Root>
    )
};