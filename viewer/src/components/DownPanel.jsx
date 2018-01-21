import React from 'react';
import PropTypes from 'prop-types';
import PageNumberBlock from './PageNumberBlock'

class DownPanel extends React.Component {


    render() {
        return (
            <div className="down_panel">
                <PageNumberBlock />
                <input className="scale" type="range" min="0" max="200" step="1" value="100" onChange={() => { }} />
                <span className="scale_label">100</span>%
             </div>
        );
    }
}

export default DownPanel;