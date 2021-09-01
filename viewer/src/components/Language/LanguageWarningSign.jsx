import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";
import IncompleteTranslationWindow from "./IncompleteTranslationWindow";
import dictionaries from '../../locales';

const Warning = styled.span`
    color: var(--color);
    cursor: pointer;
    margin-right: 0.5em;

    :hover {
        color: var(--highlight-color);
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
                <FontAwesomeIcon icon={faExclamationTriangle} transform={'shrink-4'} />
            </Warning>
            {isWindowOpened ? <IncompleteTranslationWindow
                missedPhrases={notTranslatedPhrases}
                onClose={() => toggleWindow(false)}
            /> : null}
        </>
    );
}