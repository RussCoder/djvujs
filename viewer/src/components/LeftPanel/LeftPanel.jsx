import React from 'react';
import { connect } from 'react-redux';

import ContentsPanel from './ContentsPanel';
import { get } from '../../reducers/rootReducer';
import styled, { css } from 'styled-components';

const style = css`
    flex: 0 0 auto;
    border: 1px solid var(--border-color);
    border-radius: 1em 0 1em 0;
    overflow: hidden;
    box-sizing: border-box;
    width: 20%;
    max-width: 90%;
    min-width: 0.4em;
`;

const Border = styled.div`
    box-sizing: border-box;
    float: right;
    opacity: 0.7;
    width: 4px;
    height: 100%;

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
    };

    ref = node => this.topNode = node;

    render() {
        const contents = this.props.contents;
        return (
            <div
                css={style}
                ref={this.ref}
                style={contents ? null : { width: "0.4em" }} // use the min-width from styles
            >
                <Border onMouseDown={this.onBeginResizing} />
                <div style={{ height: '100%' }}>
                    <ContentsPanel contents={contents} />
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    contents: get.contents(state)
}))(LeftPanel);