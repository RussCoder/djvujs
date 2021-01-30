import ModalWindow from "../ModalWindows/ModalWindow";
import React from "react";
import styled from "styled-components";
import { useTranslation } from "../Translation";
import Constants from "../../constants";

const Root = styled.div`
    font-size: 18px;
    min-width: 20em;
    text-align: left;
    padding: 1em;
    color: var(--color);
`;

const NotTranslatedList = styled.ul`
    max-height: 15em;
    overflow: auto;
    padding: 1em 2em;
    font-style: italic;
`;

export default ({ onClose, missedPhrases }) => {
    const t = useTranslation();

    return (
        <ModalWindow onClose={() => onClose(null)} usePortal={true}>
            <Root>
                <div>
                    <strong>{t("The translation isn't complete.")} </strong>
                    {t("The following phrases are not translated:")}
                </div>
                <NotTranslatedList>
                    {missedPhrases.map((phrase, i) => <li key={i}>{phrase}</li>)}
                </NotTranslatedList>
                <a target="_blank" rel="noopener noreferrer" href={Constants.TRANSLATION_PAGE_URL}>
                    {t('You can improve the translation here')}
                </a>
            </Root>
        </ModalWindow>
    );
};