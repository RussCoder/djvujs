import React from 'react';
import { connect } from 'react-redux';

import ContentsPanel from './ContentsPanel';
import { get } from '../../reducers';
import styled, { css } from 'styled-components';
import { ActionTypes } from "../../constants";
import { AppContext } from "../AppContext";
import { DarkLayer } from "../ModalWindows/ModalWindow";

const closeWidth = 40;

const mobileStyle = css`
    position: absolute;
    z-index: 1;
    height: 100%;
    background: var(--background-color);
    max-width: 90%;
`;

const Root = styled.div`
    flex: 0 0 auto;
    border: 1px solid var(--border-color);
    border-radius: 1em 0 1em 0;
    box-sizing: border-box;
    max-width: 80%;
    transition: margin-left 0.5s, width 0.5s;
    font-size: 14px;

    ${p => p.theme.isMobile ? mobileStyle : ''};
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

    static contextType = AppContext;

    prevIsMobile = null;
    lastContents = null;
    contentsWasClosed = null;

    onBeginResizing = (e) => {
        e.preventDefault();
        const width = this.topNode.getBoundingClientRect().width;
        this.topNode.style.transition = 'none';
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
        this.topNode.style.transition = null;
        this.initialState = null;

        if (this.topNode.getBoundingClientRect().width < closeWidth) {
            this.closeContents();
        }
    };

    closeContents = () => this.props.dispatch({ type: ActionTypes.CLOSE_CONTENTS });

    ref = node => this.topNode = node;

    // just to beautifully close contents when the window is resized and the app switches to the mobile version
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.prevIsMobile !== this.context.isMobile) {
            if (this.context.isMobile && this.props.isContentsOpened) {
                this.closeContents()
                this.contentsWasClosed = true;
            } else if (!this.context.isMobile && this.contentsWasClosed) {
                if (!this.props.isContentsOpened) {
                    this.props.dispatch({ type: ActionTypes.TOGGLE_CONTENTS });
                }
                this.contentsWasClosed = false;
            }
        }

        this.prevIsMobile = this.context.isMobile;
    }

    render() {
        const { contents, isContentsOpened } = this.props;
        const isMobile = this.context.isMobile;
        const firstRender = contents && this.lastContents !== contents;
        this.lastContents = contents;

        const currentWidth = this.topNode ? this.topNode.getBoundingClientRect().width : 0;
        const getCloseShift = (width) => `calc(-${width}px - var(--app-padding))`;

        const initialWidth = isMobile ? '90%' : '20%';

        return (
            <>
                {isMobile && isContentsOpened ? <DarkLayer onClick={this.closeContents} /> : null}
                <Root
                    ref={this.ref}
                    style={isContentsOpened && !(isMobile && firstRender) ? {
                        width: initialWidth,
                        marginLeft: 0,
                        transition: firstRender ? 'none' : null
                    } : {
                        width: currentWidth,
                        marginLeft: getCloseShift(currentWidth),
                    }}
                    onTransitionEnd={e => {
                        if (e.propertyName === 'margin-left' && !isContentsOpened) {
                            this.topNode.style.width = initialWidth;
                            this.topNode.style.marginLeft = `calc(-${initialWidth} - var(--app-padding))`;
                            this.topNode.style.transition = `none`;
                        }
                    }}>
                    <Border onMouseDown={this.onBeginResizing}>
                        <div />
                        <div />
                        <div />
                    </Border>
                    <div style={{ height: '100%', overflow: "hidden" }}>
                        <ContentsPanel contents={contents} />
                    </div>
                </Root>
            </>
        );
    }
}

export default connect(state => ({
    contents: get.contents(state),
    isContentsOpened: get.isContentsOpened(state),
}))(LeftPanel);