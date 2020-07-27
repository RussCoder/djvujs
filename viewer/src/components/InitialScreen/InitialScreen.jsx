import React from 'react';

import HelpButton from '../HelpButton';
import FileZone from './FileZone';
import DjVu from '../../DjVu';
import Options from '../Options';
import { inExtension } from '../../utils';
import LinkBlock from './LinkBlock';

export default () => (
    <div className="initial_screen">
        <div className="content">
            <div css={`text-align: center; font-size: 2em`}>
                {`DjVu.js Viewer v.${DjVu.Viewer.VERSION} welcomes you!`}
            </div>
            <div css={`font-style: italic; margin-top: 0.5em; margin-bottom: 1em; font-size: 0.8em`}>
                {`(powered with DjVu.js v.${DjVu.VERSION})`}
            </div>

            {inExtension ? <div className="central">
                <Options />
                {/* <div className="update_message">
                    Now you can open links to .djvu files automatically (with a click) when the corresponding option is enabled.
                    Just try to click the link
                    "<a target="_blank" rel="noopener noreferrer" href="https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu">
                        Some DjVu file
                    </a>"
                    with the option enabled and disabled to understand what it is about.
                </div> */}
            </div> : null}
            {/* {isChromeExtension ? <div className="previous_update_message">
                The Google Chrome's version of the extension allows to open local files by a browser directly (via a double-click)!
                But you have to enable the <strong>"Allow access to file URLs"</strong> option on the extension's options page.
                Otherwise, the feature won't work!
            </div> : null} */}
            <div style={{ clear: 'both', margin: '1em' }}>
                Click the <HelpButton /> button to know more about the app.
            </div>
            {inExtension ? <LinkBlock /> : null}
            <FileZone />
        </div>
    </div>
);