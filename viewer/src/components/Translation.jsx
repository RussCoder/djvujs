import React from 'react';
import { useSelector } from "react-redux";
import { get } from "../reducers";
import dictionaries from '../locales';

export const TranslationContext = React.createContext(text => text);

export const TranslationProvider = ({ children }) => {
    const { locale } = useSelector(get.options);
    const dict = dictionaries[locale] || dictionaries.en;

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

export function createTranslator(dict) {
    return (text, insertions = null) => {
        const translatedText = dict[text] || dictionaries.en[text] || text;

        if (!dictionaries.en[text]) {
            console.warn(`The phrase \n-------------\n ${text} \n-------------\n isn't added to the English dictionary!`);
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