import React from 'react';

import PageNumberBlock from './PageNumberBlock'
import ScaleGizmo from './ScaleGizmo';
import TextModeButton from './TextModeButton';
import CursorModeButtonGroup from './CursorModeButtonGroup';

const DownPanel = () => (
    <div className="down_panel">
        <TextModeButton />
        <CursorModeButtonGroup />
        <PageNumberBlock />
        <ScaleGizmo />
    </div>
);

export default DownPanel;