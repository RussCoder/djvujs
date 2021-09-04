import React from 'react';
import PageNumberBlock from './PageNumberBlock'
import ScaleGizmo from './ScaleGizmo';
import ViewModeButtons from './ViewModeButtons';
import CursorModeButtonGroup from './CursorModeButtonGroup';
import RotationControl from './RotationControl';
import styled, { css } from 'styled-components';
import { ControlButton } from '../StyledPrimitives';
import ContentsButton from "./ContentsButton";
import FullPageViewButton from "../misc/FullPageViewButton";
import MenuButton from "./MenuButton";
import PinButton from "./PinButton";
import Menu from "../Menu";
import { useAppContext } from "../AppContext";

const toolbarHeight = '3em';

const mobileStyle = css`
    & > * {
        margin-right: 0;
        margin-left: 0;
    }
`

const Root = styled.div`
    position: relative;
    flex: 0 0 auto;
    border: 1px solid var(--border-color);
    border-radius: 0 0.5em 0 0.5em;
    padding: 0.5em 0.3em;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    height: ${toolbarHeight};
    box-sizing: border-box;
    align-self: stretch;
    margin-top: var(--app-padding);
    z-index: 2;

    font-size: 14px;
    --button-basic-size: 1.5em;

    ${ControlButton} {
        font-size: var(--button-basic-size);
    }

    margin-bottom: 0;
    transition: margin-bottom 0.5s;
    ${p => p.$hidden ? `margin-bottom: calc(-${toolbarHeight} - var(--app-padding) - 1px)` : ''}; // -1px just for cypress
    
    ${p => p.$mobile ? mobileStyle : ''};
`;

const CentralPanel = styled.div`
    height: 100%;
    max-width: 45em;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    
    & > * {
        margin: 0 0.8em;
    }
`;

const RightPanel = styled.div`
    height: 100%;
    display: flex;
    align-items: center;
`;

const InvisibleLayer = styled.div`
    position: absolute;
    bottom: 0;
    height: calc(${toolbarHeight} + var(--app-padding) * 2);
    width: 100%;
    z-index: 1;
`;

export default () => {
    const [pinned, setPinned] = React.useState(true);
    const [hidden, setHidden] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const onMouseEnter = React.useCallback(() => setHidden(false), [setHidden]);
    const onMouseLeave = React.useCallback(() => setHidden(true), [setHidden]);
    const handlePin = React.useCallback(() => {
        setPinned(!pinned);
    }, [pinned, setPinned]);

    const { isMobile } = useAppContext();
    const reallyPinned = isMobile || pinned;
    const reallyHidden = hidden && !reallyPinned;

    return (
        <>
            {reallyPinned ? null : <InvisibleLayer
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />}
            <Root
                $hidden={reallyHidden}
                $pinned={reallyPinned}
                onMouseEnter={reallyPinned ? null : onMouseEnter}
                onMouseLeave={reallyPinned ? null : onMouseLeave}
                data-djvujs-id="toolbar"
                $mobile={isMobile}
            >
                <ContentsButton />
                <CentralPanel>
                    {isMobile ? null : <ViewModeButtons />}
                    {isMobile ? null : <CursorModeButtonGroup />}
                    <PageNumberBlock />
                    {isMobile ? null : <ScaleGizmo />}
                    {isMobile ? null : <RotationControl />}
                </CentralPanel>
                <RightPanel>
                    {isMobile ? null :<PinButton isPinned={pinned} onClick={handlePin} />}
                    {isMobile ? null :<FullPageViewButton />}
                    <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)} />
                </RightPanel>
                <Menu isOpened={isMenuOpen && !reallyHidden} onClose={() => setIsMenuOpen(false)} />
            </Root>
        </>
    );
}