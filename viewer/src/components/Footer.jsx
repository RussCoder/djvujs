import React from 'react';
import FilePanel from './FilePanel';
import StatusBar from './StatusBar';

class Footer extends React.Component {
    render() {
        return (
            <div className="footer">
                <StatusBar />
                <FilePanel />
            </div>
        );
    }
}

export default Footer;