import React from 'react';

import PageNumberBlock from './PageNumberBlock'
import ScaleGizmo from './ScaleGizmo';
import TextModeButton from './TextModeButton';
import CursorModeButtonGroup from './CursorModeButtonGroup';
import RotationControl from './RotationControl';

const DownPanel = () => (
    <div className="down_panel">
        <TextModeButton />
        <CursorModeButtonGroup />
        <PageNumberBlock />
        <ScaleGizmo />
        <RotationControl />
    </div>
);

export default DownPanel;