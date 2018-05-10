import React from 'react';

import PageNumberBlock from './PageNumberBlock'
import ScaleGizmo from './ScaleGizmo';
import FullPageViewButton from './FullPageViewButton';
import TextModeButton from './TextModeButton';
import HelpButton from './HelpButton';

const DownPanel = () => (
    <div className="down_panel">
        <HelpButton />
        <TextModeButton />
        <PageNumberBlock />
        <ScaleGizmo />
        <FullPageViewButton />
    </div>
);

export default DownPanel;