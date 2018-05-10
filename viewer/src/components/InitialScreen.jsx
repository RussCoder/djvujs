import React from 'react';

import FileBlock from './FileBlock';
import HelpButton from './HelpButton';
const DjVu = window.DjVu;

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
                    <div className="file_block_wrapper">
                        <FileBlock />
                    </div>
                </div>
            </div>
        );
    }
}

export default InitialScreen;