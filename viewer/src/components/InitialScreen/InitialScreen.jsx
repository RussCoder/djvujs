import React from 'react';

import HelpButton from '../misc/HelpButton';
import FileZone from './FileZone';
import DjVu from '../../DjVu';
import { inExtension } from '../../utils';
import LinkBlock from './LinkBlock';
import { useTranslation } from '../Translation';
import { LanguagePanel } from "../Language/LanguagePanel";
import styled from 'styled-components';
import ThemeSwitcher from './ThemeSwitcher';
import OptionsButton from "../misc/OptionsButton";
import FullPageViewButton from "../misc/FullPageViewButton";
import { useAppContext } from "../AppContext";
import LanguageSelector from "../Language/LanguageSelector";

const Root = styled.div`
    font-size: ${p => p.theme.isMobile ? 1.5 : 2}em;
    text-align: center;
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const InfoBlock = styled.div`
    width: max-content;
    margin: 0 auto 1em auto;
    text-align: left;
    font-size: 0.8em;

    svg {
        font-size: 1.5em;
    }

    div {
        display: flex;
        align-items: center;
        margin-bottom: 0.25em;
    }
`;

const Footer = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-end;
`;

export default () => {
    const t = useTranslation();
    const { isMobile } = useAppContext();

    return (
        <Root>
            {isMobile ? <LanguageSelector /> : <LanguagePanel />}
            <ThemeSwitcher />
            <div css={`margin: auto;`}>

                <div css={`text-align: center; font-size: 2em`}>
                    {`DjVu.js Viewer v.${DjVu.Viewer.VERSION}`}
                </div>
                <div css={`font-style: italic; margin-top: 0.5em; margin-bottom: 1em; font-size: 0.8em`}>
                    {`(${t('powered with')} DjVu.js v.${DjVu.VERSION})`}
                </div>

                <InfoBlock>
                    <div>{t('#optionsButton - see the available options', {
                        '#optionsButton': <OptionsButton />
                    })}</div>
                    <div>{t('#helpButton - learn more about the app', { '#helpButton': <HelpButton /> })}</div>
                </InfoBlock>
                {inExtension ? <LinkBlock /> : null}
                <FileZone />
            </div>
            <Footer><FullPageViewButton /></Footer>
        </Root>
    );
};