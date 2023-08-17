import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import styled from "styled-components";
import IncompleteTranslationWindow from "./IncompleteTranslationWindow";
import dictionaries from '../../locales';

const Warning = styled.span`
    color: var(--color);
    cursor: pointer;
    margin-right: 0.5em;
    display: inline-flex;
    align-items: center;

    :hover {
        color: var(--highlight-color);
    }
    
    svg {
        margin-left: 0.5em;
        font-size: 0.8em;
    }
`;

export default ({ languageCode }) => {
    const dict = dictionaries[languageCode];
    const notTranslatedPhrases = Object.keys(dictionaries.en).filter(key => {
        return dict[key] == null;
    });
    let [isWindowOpened, toggleWindow] = React.useState(false);

    if (!notTranslatedPhrases.length) return null;

    return (
        <>
            <Warning onClick={e => {
                e.stopPropagation();
                toggleWindow(true);
            }}>
                <FaExclamationTriangle />
            </Warning>
            {isWindowOpened ? <IncompleteTranslationWindow
                missedPhrases={notTranslatedPhrases}
                onClose={() => toggleWindow(false)}
            /> : null}
        </>
    );
}