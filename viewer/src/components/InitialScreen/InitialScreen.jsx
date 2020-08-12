import React from 'react';

import HelpButton from '../Footer/HelpButton';
import FileZone from './FileZone';
import DjVu from '../../DjVu';
import Options from '../Options';
import { inExtension } from '../../utils';
import LinkBlock from './LinkBlock';
import { useTranslation } from '../Translation';
import { LanguagePanel } from "../LanguagePanel";

export default () => {
    const t = useTranslation();

    return (
        <div className="initial_screen">
            <LanguagePanel />
            <div className="content">

                <div css={`text-align: center; font-size: 2em`}>
                    {`DjVu.js Viewer v.${DjVu.Viewer.VERSION}`}
                </div>
                <div css={`font-style: italic; margin-top: 0.5em; margin-bottom: 1em; font-size: 0.8em`}>
                    {`(${t('powered with')} DjVu.js v.${DjVu.VERSION})`}
                </div>

                {inExtension ? <div className="central">
                    <Options />
                </div> : null}
                <div style={{ clear: 'both', margin: '1em' }}>
                    {t('Click the #helpButton button to know more about the app', { '#helpButton': <HelpButton /> })}
                </div>
                {inExtension ? <LinkBlock /> : null}
                <FileZone />
            </div>
        </div>
    );
};