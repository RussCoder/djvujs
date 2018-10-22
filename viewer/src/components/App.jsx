import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import '../css/styles.css';

import { get } from '../reducers/rootReducer';
import DownPanel from "./DownPanel";
import ImageBlock from "./ImageBlock";
import InitialScreen from './InitialScreen';
import FileLoadingScreen from './FileLoadingScreen';
import Footer from './Footer';
import LeftPanel from './LeftPanel';
import NotificationWindow from './NotificationWindow';
import HelpWindow from './HelpWindow';
import ErrorPage from './ErrorPage';
import LoadingLayer from './LoadingLayer';

const TextBlock = ({ text }) => (
    <div className="text_block">
        <pre className="text">
            {text === null ? "Loading ..." : text || <em>No text provided</em>}
        </pre>
    </div>
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

                    !this.props.isFileLoaded ? <InitialScreen /> :
                        <React.Fragment>
                            <div className="central_block">
                                <LeftPanel />
                                <div className="page_zone">
                                    {this.props.pageError ? <ErrorPage pageNumber={this.props.pageNumber} error={this.props.pageError} /> :
                                        this.props.isTextMode ? <TextBlock text={this.props.pageText} /> :
                                            this.props.imageData ? <ImageBlock /> : null}
                                    {(this.props.isLoading && !this.props.isTextMode) ? <LoadingLayer /> : null}
                                </div>
                            </div>
                            <DownPanel />
                        </React.Fragment>
                }
                {this.props.isFileLoading ? null : <Footer />}

                <NotificationWindow header={this.props.errorHeader} message={this.props.errorMessage} type={"error"} />
                <HelpWindow />
            </div>
        );
    }
}

export default connect(
    state => ({
        isLoading: get.isLoading(state),
        imageData: get.imageData(state),
        pageError: get.pageError(state),
        pageNumber: get.currentPageNumber(state),
        isFileLoaded: get.isDocumentLoaded(state),
        isFileLoading: get.isFileLoading(state),
        isFullPageView: get.isFullPageView(state),
        isTextMode: get.isTextMode(state),
        pageText: get.pageText(state),
        errorHeader: get.errorHeader(state),
        errorMessage: get.errorMessage(state)
    })
)(App);