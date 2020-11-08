import React from 'react';

import HelpButton from '../Footer/HelpButton';
import FileZone from './FileZone';
import DjVu from '../../DjVu';
import Options from '../Options';
import { inExtension } from '../../utils';
import LinkBlock from './LinkBlock';
import { useTranslation } from '../Translation';
import { LanguagePanel } from "../LanguagePanel";
import styled from 'styled-components';
import ThemeSwitcher from './ThemeSwitcher';

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

const Central = styled.div`
    margin-bottom: 2em;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
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

                {inExtension ? <Central><Options /></Central> : null}
                <div style={{ clear: 'both', margin: '1em' }}>
                    {t('Click the #helpButton button to know more about the app', { '#helpButton': <HelpButton /> })}
                </div>
                {inExtension ? <LinkBlock /> : null}
                <FileZone />
            </div>
        </Root>
    );
};