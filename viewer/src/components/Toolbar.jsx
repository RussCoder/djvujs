import React from 'react';
import PageNumberBlock from './PageNumberBlock'
import ScaleGizmo from './ScaleGizmo';
import ViewModeButtons from './ViewModeButtons';
import CursorModeButtonGroup from './CursorModeButtonGroup';
import RotationControl from './RotationControl';

export default () => (
    <div className="toolbar">
        <ViewModeButtons />
        <CursorModeButtonGroup />
        <PageNumberBlock />
        <ScaleGizmo />
        <RotationControl />
    </div>
);