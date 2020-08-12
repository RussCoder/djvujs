import React from 'react';
import FilePanel from './FilePanel';
import StatusBar from './StatusBar';
import HelpButton from './HelpButton';
import FullPageViewButton from './FullPageViewButton';

class Footer extends React.Component {
    render() {
        return (
            <div className="footer">
                <StatusBar />
                <FilePanel />
                <HelpButton />
                <FullPageViewButton />
            </div>
        );
    }
}

export default Footer;