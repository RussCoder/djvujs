import React from 'react';
import { connect } from 'react-redux';

import ContentsPanel from './ContentsPanel';
import { get } from '../../reducers';
import styled from 'styled-components';
import { ActionTypes } from "../../constants";

const closeWidth = 40;

const Root = styled.div`
    flex: 0 0 auto;
    border: 1px solid var(--border-color);
    border-radius: 1em 0 1em 0;
    box-sizing: border-box;
    width: 20%;
    max-width: 80%;
`;

const Border = styled.div`
    box-sizing: border-box;
    float: right;
    height: 100%;
    position: relative;
    width: 7px;
    left: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    --point-size: 5px;

    div {
        width: var(--point-size);
        height: var(--point-size);
        transform: scaleX(0.75) scaleY(1.25) rotateZ(45deg);
        background: var(--border-color);
        margin-bottom: var(--point-size);
    }

    &:hover {
        cursor: col-resize;
    }
`;

class LeftPanel extends React.Component {

    onBeginResizing = (e) => {
        e.preventDefault();
        const width = this.topNode.getBoundingClientRect().width;
        this.setState({ width });
        this.initialState = {
            clientX: e.clientX,
            width: width
        };
        window.addEventListener('mousemove', this.onResizing);
        window.addEventListener('mouseup', this.onEndResizing);
    };

    onResizing = (e) => {
        e.preventDefault();
        if (!this.initialState) {
            return;
        }
        const diff = e.clientX - this.initialState.clientX;
        this.topNode.style.width = this.initialState.width + diff + 'px';
    };

    onEndResizing = (e) => {
        e.preventDefault();
        window.removeEventListener('mousemove', this.onResizing);
        window.removeEventListener('mouseup', this.onEndResizing);
        this.initialState = null;

        if (this.topNode.getBoundingClientRect().width < closeWidth) {
            this.props.dispatch({ type: ActionTypes.CLOSE_CONTENTS });
        }
    };

    ref = node => this.topNode = node;

    render() {
        const { contents, isContentsOpened } = this.props;

        if (!isContentsOpened) return null;

        return (
            <Root ref={this.ref}>
                <Border onMouseDown={this.onBeginResizing}>
                    <div />
                    <div />
                    <div />
                </Border>
                <div style={{ height: '100%', overflow: "hidden" }}>
                    <ContentsPanel contents={contents} />
                </div>
            </Root>
        );
    }
}

export default connect(state => ({
    contents: get.contents(state),
    isContentsOpened: get.isContentsOpened(state),
}))(LeftPanel);