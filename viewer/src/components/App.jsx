import React, { Component } from 'react';
import DownPanel from "./DownPanel";
import ImageBlock from "./ImageBlock";
import '../css/styles.css';

class App extends Component {
    render() {
        return (
            <div className="djvu_viewer">
                <ImageBlock />
                <DownPanel />
            </div>
        );
    }
}

export default App;