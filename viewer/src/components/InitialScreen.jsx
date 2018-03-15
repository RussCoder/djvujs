import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/fontawesome-free-solid';

import FileBlock from './FileBlock';
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
                        Note that you can switch the viewer to the full page mode and back - just click on the <FontAwesomeIcon icon={faExpand} /> icon on the down panel.
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