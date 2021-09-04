import React from 'react';
import { useSelector } from "react-redux";
import { get } from "../reducers";
import dictionaries from '../locales';

export const TranslationContext = React.createContext((text, insertions = null) => text);

export const TranslationProvider = ({ children }) => {
    const dict = useSelector(get.dictionary);

    return (
        <TranslationContext.Provider value={createTranslator(dict)}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => {
    return React.useContext(TranslationContext);
};

const escapingRegex = /[.*+\-?^${}()|[\]\\]/g;
const escapeRegExp = (string) => string.replace(escapingRegex, '\\$&');
const untranslatedPhrases = {};
let warningTimeout = 0;

export function createTranslator(dict) {
    return (text, insertions = null) => {
        const translatedText = dict[text] || dictionaries.en[text] || text;

        if (!dictionaries.en[text]) {
            untranslatedPhrases[text] = "";
            clearTimeout(warningTimeout);
            warningTimeout = setTimeout(() => {
                console.warn(`\nThere are untranslated phrases (missing from the English dictionary):`);
                console.warn('\n' + JSON.stringify(untranslatedPhrases, null, 2)
                    .replaceAll('""', '\n      ""'));
            }, 1000); // timeout to collect many phrases to show them as JSON
        }

        if (!insertions) return translatedText;

        const st = Object.keys(insertions).map(escapeRegExp).join('|');
        const regex = new RegExp(`(${st})`, 'g');

        const textParts = translatedText.split(regex);

        const textWithInsertions = textParts.map(entry => {
            if (entry in insertions) {
                return <React.Fragment key={entry}>{insertions[entry]}</React.Fragment>;
            } else {
                return entry;
            }
        });

        return textWithInsertions;
    };
}