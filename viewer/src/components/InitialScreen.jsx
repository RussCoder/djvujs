import React from 'react';

import HelpButton from './HelpButton';
import FileZone from './FileZone';
import DjVu from '../DjVu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-regular-svg-icons';

class InitialScreen extends React.Component {

    render() {
        const isChromeExtension = window.chrome && window.chrome.runtime && window.chrome.runtime.id && !/Firefox/.test(navigator.userAgent);

        return (
            <div className="initial_screen">
                <div className="content">
                    <div className="header">{`DjVu.js Viewer v.${DjVu.Viewer.VERSION} welcomes you!`}</div>
                    <div className="djvujs_version">{`(powered with DjVu.js v.${DjVu.VERSION})`}</div>

                    <div className="update_message">
                        NEW!
                        The continuous scroll mode was added. It's not enabled by default, since there still may be bugs,
                        but you can try it out by by clicking on
                        <span
                            className={`continuous_scroll_button control_button`}
                            title="Continuous scroll view mode"       
                        >
                            <FontAwesomeIcon icon={faFileImage} />
                            <FontAwesomeIcon icon={faFileImage} />
                        </span> icon.
                    </div>
                    {isChromeExtension ? <div className="previous_update_message">
                        UPDATE:
                        Now the Google Chrome version of the extension allows to open local files by a browser directly (via a double-click)!
                        But you have to enable the <strong>"Allow access to file URLs"</strong> option on the extension's options page.
                        Otherwise, the new feature won't work!
                    </div> : null}

                    <div>Choose a .djvu file to view it! </div>
                    <div>
                        Click the <HelpButton /> button to know more about the app!
                    </div>
                    <FileZone />
                </div>
            </div>
        );
    }
}

export default InitialScreen;