import React from 'react';
import FilePanel from './FilePanel';
import StatusBar from './StatusBar';
import HelpButton from './HelpButton';
import FullPageViewButton from './FullPageViewButton';
import styled from 'styled-components';
import { ControlButton } from '../StyledPrimitives';

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

class Footer extends React.Component {
    render() {
        return (
            <Root>
                <StatusBar />
                <FilePanel />
                <HelpButton />
                <FullPageViewButton />
            </Root>
        );
    }
}

export default Footer;