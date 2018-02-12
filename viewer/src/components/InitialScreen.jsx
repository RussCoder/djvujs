import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/fontawesome-free-solid';

import FileBlock from './FileBlock';

class InitialScreen extends React.Component {

    render() {
        return (
            <div class="initial_screen">
                <div className="content">
                    <div className="header">DjVu.js Viewer welcomes you!</div>
                    <div>Choose a .djvu file to view it! </div>
                    <div>
                        Note that you can switch the viwer to the full page mode and back - just click on the <FontAwesomeIcon icon={faExpand} /> icon on the down panel.
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