import React from 'react';
import styled, { css } from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { get } from "../reducers";
import { useTranslation } from "./Translation";
import { ActionTypes } from "../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faPlus } from "@fortawesome/free-solid-svg-icons";
import ModalWindow from "./ModalWindows/ModalWindow";
import dictionaries from '../locales';

const LanguagePanelRoot = styled.div`
    display: flex;
    font-size: 0.8em;
    margin-top: 0.5em;
`;

const selectedLanguageItem = css`
    border-bottom: 3px solid var(--highlight-color);
    color: var(--highlight-color);
    cursor: default;
`;

const LanguageItem = styled.div`
    margin-left: 0.5em;
    cursor: pointer;
    
    ${p => p.$selected ? selectedLanguageItem : `
        :hover {
            border-bottom: 1px solid var(--color);
        }
    `};
`;

const Warning = styled.span`
    color: var(--color);
    cursor: pointer;

    :hover {
        color: var(--highlight-color);
    }
`;

const NotCompleteTranslationWindow = styled.div`
    font-size: 18px;
    min-width: 20em;
    text-align: left;
    padding: 1em;
`;

const NotTranslatedList = styled.ul`
    max-height: 15em;
    overflow: auto;
    padding: 1em 2em;
    font-style: italic;
`;

const URL = "https://github.com/RussCoder/djvujs/blob/master/TRANSLATION.md";

const AddMoreButton = ({ t }) => (
    <a
        href={URL}
        target="_blank"
        rel="noopener noreferrer"
        title={t("Add more")}
        css={`
            margin: 0 1em;
            color: var(--color) !important;
            border: 2px solid var(--color);
            border-radius: 100px;
            padding: 2px;
            height: 20px;
            width: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            
            :hover {
                transform: scale(1.2);
            }
        `}
    >
        <FontAwesomeIcon
            icon={faPlus}
            css="height: 16px; width: 16px"
        />
    </a>
);

export const LanguagePanel = () => {
    const { locale } = useSelector(get.options);
    const dispatch = useDispatch();
    const allPhrases = Object.keys(dictionaries.en);
    let [missedPhrases, setMissedPhrases] = React.useState(null);

    const t = useTranslation();

    return (
        <LanguagePanelRoot>
            {Object.entries(dictionaries).map(([code, dict]) => {
                const notTranslatedPhrases = allPhrases.filter(key => {
                    return !(key in dict);
                });

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
                                <Warning onClick={e => {
                                    e.stopPropagation();
                                    setMissedPhrases(notTranslatedPhrases);
                                }}>
                                    <FontAwesomeIcon icon={faExclamationTriangle} transform={'shrink-4'} />
                                </Warning>
                                : null}
                        </LanguageItem>
                    </React.Fragment>
                );
            })}
            <AddMoreButton t={t} />
            {missedPhrases ?
                <ModalWindow onClose={() => setMissedPhrases(null)}>
                    <NotCompleteTranslationWindow>
                        <div>
                            <strong>{t("The translation isn't complete.")} </strong>
                            {t("The following phrases are not translated:")}
                        </div>
                        <NotTranslatedList>
                            {missedPhrases.map((phrase, i) => <li key={i}>{phrase}</li>)}
                        </NotTranslatedList>
                        <a target="_blank" rel="noopener noreferrer" href={URL}>
                            {t('You can improve the translation here')}
                        </a>
                    </NotCompleteTranslationWindow>
                </ModalWindow>
                : null}
        </LanguagePanelRoot>
    );
};