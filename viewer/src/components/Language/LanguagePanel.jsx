import React from 'react';
import styled, { css } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { get } from "../../reducers";
import { ActionTypes } from "../../constants";
import dictionaries from '../../locales';
import LanguageWarningSign from "./LanguageWarningSign";
import AddLanguageButton from "./AddLanguageButton";

const LanguagePanelRoot = styled.div`
    display: flex;
    font-size: 20px;
    margin-top: 0.5em;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
`;

const selectedLanguageItem = css`
    border-bottom: 3px solid var(--highlight-color);
    color: var(--highlight-color);
    cursor: default;
`;

const LanguageItem = styled.div`
    margin-left: 0.5em;
    cursor: pointer;
    white-space: nowrap;

    ${p => p.$selected ? selectedLanguageItem : `
        :hover {
            border-bottom: 1px solid var(--color);
        }
    `};
`;

export const LanguagePanel = () => {
    const { locale } = useSelector(get.options);
    const dispatch = useDispatch();

    return (
        <LanguagePanelRoot>
            {Object.entries(dictionaries).map(([code, dict]) => {
                return (
                    <LanguageItem
                        key={code}
                        $selected={locale === code}
                        data-djvujs-class={'language_name ' + (locale === code ? 'selected' : '')}
                        onClick={() => dispatch({
                            type: ActionTypes.UPDATE_OPTIONS,
                            payload: { locale: code },
                        })}
                    >
                        {dict.nativeName}
                        <LanguageWarningSign languageCode={code} />
                    </LanguageItem>
                );
            })}
            <AddLanguageButton css={`font-size: 1.5em;`} />
        </LanguagePanelRoot>
    );
};