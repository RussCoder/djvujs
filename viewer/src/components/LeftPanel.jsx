import React from 'react';
import { connect } from 'react-redux';

import ContentsPanel from './ContentsPanel';
import { get } from '../reducers/rootReducer';

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
                className="left_panel"
                ref={this.ref}
                style={contents ? null : { width: "0.4em" }} // use the min-width from styles
            >
                <div
                    onMouseDown={this.onBeginResizing}
                    className="border"
                />
                <div className="content">
                    <ContentsPanel contents={contents} />
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    contents: get.contents(state)
}))(LeftPanel);