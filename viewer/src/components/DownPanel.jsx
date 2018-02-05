import React from 'react';
import PropTypes from 'prop-types';
import PageNumberBlock from './PageNumberBlock'
import ScaleGizmo from './ScaleGizmo';
import FileBlock from './FileBlock';
import FullPageViewButton from './FullPageViewButton';

class DownPanel extends React.Component {

    render() {
        return (
            <div className="down_panel">
                <FileBlock />
                <PageNumberBlock />
                <ScaleGizmo />
                <FullPageViewButton />
            </div>
        );
    }
}

export default DownPanel;