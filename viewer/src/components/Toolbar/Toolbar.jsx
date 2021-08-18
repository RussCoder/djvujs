import React from 'react';
import PageNumberBlock from './PageNumberBlock'
import ScaleGizmo from './ScaleGizmo';
import ViewModeButtons from './ViewModeButtons';
import CursorModeButtonGroup from './CursorModeButtonGroup';
import RotationControl from './RotationControl';
import styled from 'styled-components';
import { ControlButton } from '../StyledPrimitives';
import ContentsButton from "./ContentsButton";
import FullPageViewButton from "../Footer/FullPageViewButton";
import MenuButton from "./MenuButton";

const Root = styled.div`
    flex: 0 0 auto;
    border: 1px solid var(--border-color);
    border-radius: 0 0.5em 0 0.5em;
    padding: 0.5em 0.3em;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    height: 2em;
    text-align: center;
    align-self: stretch;
    margin-top: var(--app-padding);
    
    --button-basic-size: 1.5em;

    ${ControlButton} {
        font-size: var(--button-basic-size);
    }
`;

const CentralPanel = styled.div`
    height: 100%;
    max-width: 45em;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    
    & > * {
        margin: 0 0.5em;
    }
`;

const RightPanel = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
`;

export default () => (
    <Root>
        <ContentsButton />
        <CentralPanel>
            <ViewModeButtons />
            <CursorModeButtonGroup />
            <PageNumberBlock />
            <ScaleGizmo />
            <RotationControl />
        </CentralPanel>
        <RightPanel>
            <FullPageViewButton />
            <MenuButton />
        </RightPanel>
    </Root>
);