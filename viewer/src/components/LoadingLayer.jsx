import React from 'react';
import styled from 'styled-components';
import LoadingPhrase from './misc/LoadingPhrase';

const DarkLayer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--alternative-background-color);
    opacity: 0.7;
`;

const MessageWrapper = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.8;
    font-size: 3em;
    flex: 1 1 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
`;

export default class LoadingLayer extends React.Component {
    constructor(props) {
        super(props);
        this.showTimeout = null;
        this.rootRef = React.createRef();
    }

    componentDidMount() {
        this.showTimeout = setTimeout(() => {
            if (this.rootRef.current) this.rootRef.current.style.display = null;
            this.showTimeout = null;
        }, 500);
    }

    componentWillUnmount() {
        this.showTimeout && clearTimeout(this.showTimeout);
    }

    render() {
        return (
            <div
                style={{ display: 'none' }}
                ref={this.rootRef}
            >
                <DarkLayer />
                <MessageWrapper><LoadingPhrase /></MessageWrapper>
            </div>
        );
    }
}