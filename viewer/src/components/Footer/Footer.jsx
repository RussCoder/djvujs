import React from 'react';
import FilePanel from './FilePanel';
import StatusBar from './StatusBar';
import HelpButton from './HelpButton';
import FullPageViewButton from './FullPageViewButton';
import styled from 'styled-components';
import { ControlButton } from '../StyledPrimitives';
import { useSelector } from "react-redux";
import { get } from "../../reducers";
import OptionsButton from "./OptionsButton";

const Root = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-start;
    padding: 0.4em 0;
    align-items: center;

    ${ControlButton} {
        font-size: 1.5em;
    }
`;

function Footer() {
    const { hideFullPageSwitch } = useSelector(get.uiOptions);

    return (
        <Root>
            <StatusBar />
            <FilePanel />
            <HelpButton />
            <OptionsButton />
            {hideFullPageSwitch ? null : <FullPageViewButton />}
        </Root>
    );
}

export default Footer;