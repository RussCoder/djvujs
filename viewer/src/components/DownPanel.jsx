import React from 'react';

import PageNumberBlock from './PageNumberBlock'
import ScaleGizmo from './ScaleGizmo';
import FullPageViewButton from './FullPageViewButton';
import TextModeButton from './TextModeButton';

const DownPanel = () => (
    <div className="down_panel">
        <TextModeButton />
        <PageNumberBlock />
        <ScaleGizmo />
        <FullPageViewButton />
    </div>
);

export default DownPanel;