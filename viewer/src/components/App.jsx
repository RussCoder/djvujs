import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import '../css/styles.css';

import { get } from '../reducers/rootReducer';
import DownPanel from "./DownPanel";
import ImageBlock from "./ImageBlock";
import InitialScreen from './InitialScreen';
import FileLoadingScreen from './FileLoadingScreen';
import ModalWindow from './ModalWindow';
import StatusBar from './StatusBar';
import LeftPanel from './LeftPanel';

const TextBlock = ({ text }) => (
    <pre className="text_block">
        {text === null ? "Loading ..." : text || <em>No text provided</em>}
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
                {this.props.isFileLoading ?
                    <FileLoadingScreen /> :

                    !this.props.isFileLoaded ? <InitialScreen /> : (
                        <div className="central_block">
                            <LeftPanel />
                            {this.props.isTextMode ? <TextBlock text={this.props.pageText} /> : <ImageBlock />}
                        </div>
                    )
                }
                {this.props.isFileLoading ? null : <DownPanel />}
                {this.props.isFileLoading ? null : <StatusBar />}

                <ModalWindow header={this.props.errorHeader} message={this.props.errorMessage} type={"error"} />
            </div>
        );
    }
}

export default connect(
    state => ({
        isFileLoaded: !!get.fileName(state),
        isFileLoading: get.isFileLoading(state),
        isFullPageView: get.isFullPageView(state),
        isTextMode: get.isTextMode(state),
        pageText: get.pageText(state),
        errorHeader: get.errorHeader(state),
        errorMessage: get.errorMessage(state)
    })
)(App);