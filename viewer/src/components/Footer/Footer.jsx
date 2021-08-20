import React from 'react';
import FilePanel from './FilePanel';
import StatusBar from './StatusBar';
import HelpButton from '../misc/HelpButton';
import FullPageViewButton from '../misc/FullPageViewButton';
import styled from 'styled-components';
import { ControlButton } from '../StyledPrimitives';
import { useSelector } from "react-redux";
import { get } from "../../reducers";
import OptionsButton from "../misc/OptionsButton";

const Root = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-start;
    padding: 0.2em 0;
    align-items: center;

    ${ControlButton} {
        font-size: 1.5em;
    }
`;

const RightButtonsBlock = styled.div`
    margin-left: auto;
    display: flex;
    align-items: center;
`;

function Footer() {
    const { hideFullPageSwitch } = useSelector(get.uiOptions);

    return (
        <Root data-djvujs-id="footer">
            <StatusBar />
            <FilePanel />
            <RightButtonsBlock>
                <HelpButton />
                <OptionsButton />
                {hideFullPageSwitch ? null : <FullPageViewButton />}
            </RightButtonsBlock>
        </Root>
    );
}

export default Footer;