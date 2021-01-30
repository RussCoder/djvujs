import React from 'react';

import HelpButton from '../Footer/HelpButton';
import FileZone from './FileZone';
import DjVu from '../../DjVu';
import { inExtension } from '../../utils';
import LinkBlock from './LinkBlock';
import { useTranslation } from '../Translation';
import { LanguagePanel } from "../Language/LanguagePanel";
import styled from 'styled-components';
import ThemeSwitcher from './ThemeSwitcher';
import OptionsButton from "../Footer/OptionsButton";

const Root = styled.div`
    font-size: 2em;
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

export default () => {
    const t = useTranslation();

    return (
        <Root>
            <LanguagePanel />
            <ThemeSwitcher />
            <div css={`max-height: 100%; margin: auto;`}>

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
        </Root>
    );
};