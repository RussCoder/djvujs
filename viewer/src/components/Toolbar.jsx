import React from 'react';
import PageNumberBlock from './PageNumberBlock'
import ScaleGizmo from './ScaleGizmo';
import TextModeButton from './TextModeButton';
import CursorModeButtonGroup from './CursorModeButtonGroup';
import RotationControl from './RotationControl';

export default () => (
    <div className="toolbar">
        <TextModeButton />
        <CursorModeButtonGroup />
        <PageNumberBlock />
        <ScaleGizmo />
        <RotationControl />
    </div>
);