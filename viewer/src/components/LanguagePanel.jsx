import React from 'react';
import styled, { css } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { get } from "../reducers";
import { dictionaries } from "./Translation";
import { ActionTypes } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const LanguagePanelRoot = styled.div`
    display: flex;
    font-size: 0.8em;
`;

const selectedLanguageItem = css`
    border-bottom: 3px solid black;
    color: black;
`;

const LanguageItem = styled.div`
    margin-left: 0.5em;
    cursor: pointer;
    color: gray;
    
    ${p => p.$selected ? selectedLanguageItem : `
        :hover {
            border-bottom: 1px solid black;
        }
    `};
`;

const Warning = styled.span`
    color: gray;

    :hover {
        color: black;
    }
`;

export const LanguagePanel = () => {
    const { locale } = useSelector(get.options);
    const dispatch = useDispatch();
    const allPhrases = Object.keys(dictionaries.en);

    return (
        <LanguagePanelRoot>
            {Object.entries(dictionaries).map(([code, dict]) => {
                const notTranslatedPhrases = allPhrases.filter(key => {
                    return !(key in dict);
                });

                console.log(notTranslatedPhrases);

                return (
                    <React.Fragment key={code}>
                        <LanguageItem

                            $selected={locale === code}
                            onClick={() => dispatch({
                                type: ActionTypes.UPDATE_OPTIONS,
                                payload: { locale: code },
                            })}
                        >
                            {dict.nativeName}
                            {notTranslatedPhrases.length ?
                                <Warning>
                                    <FontAwesomeIcon icon={faExclamationTriangle} transform={'shrink-4'} />
                                </Warning>
                                : null}
                        </LanguageItem>
                    </React.Fragment>
                );
            })}
        </LanguagePanelRoot>
    );
};