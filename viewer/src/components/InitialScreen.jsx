import React from 'react';

import HelpButton from './HelpButton';
import FileZone from './FileZone';
import DjVu from '../DjVu';

class InitialScreen extends React.Component {

    render() {
        return (
            <div className="initial_screen">
                <div className="content">
                    <div className="header">{`DjVu.js Viewer v.${DjVu.Viewer.VERSION} welcomes you!`}</div>
                    <div className="djvujs_version">{`(powered with DjVu.js v.${DjVu.VERSION})`}</div>
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