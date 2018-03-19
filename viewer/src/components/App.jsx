import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import '../css/styles.css';

import DownPanel from "./DownPanel";
import ImageBlock from "./ImageBlock";
import InitialScreen from './InitialScreen';

const TextBlock = ({ text }) => (
    <pre className="text_block">
        {text === null ? "Loading ..." : text}
    </pre>
);

class App extends Component {
    static propTypes = {
        isFullPageView: PropTypes.bool.isRequired,
        isFileLoaded: PropTypes.bool.isRequired
    };

    render() {
        const fullPageViewClass = this.props.isFullPageView ? " full_page_view" : "";

        return (
            <div className={"djvu_js_viewer" + fullPageViewClass}>
                {!this.props.isFileLoaded ? <InitialScreen /> : (
                    this.props.isTextMode ? <TextBlock text={this.props.pageText} /> : <ImageBlock />
                )}
                <DownPanel />
            </div>
        );
    }
}

export default connect(
    state => ({
        isFileLoaded: !!state.fileName,
        isFullPageView: state.isFullPageView,
        isTextMode: state.isTextMode,
        pageText: state.pageText
    })
)(App);