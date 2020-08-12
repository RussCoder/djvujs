import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get } from '../reducers/rootReducer';
import Toolbar from "./Toolbar/Toolbar";
import ImageBlock from "./ImageBlock";
import InitialScreen from './InitialScreen/InitialScreen';
import FileLoadingScreen from './FileLoadingScreen';
import Footer from './Footer/Footer';
import LeftPanel from './LeftPanel';
import NotificationWindow from './NotificationWindow';
import HelpWindow from './HelpWindow';
import ErrorPage from './ErrorPage';
import LoadingLayer from './LoadingLayer';
import { TranslationProvider, useTranslation } from './Translation';

const TextBlock = ({ text }) => {
    const t = useTranslation();

    return (
        <div className="text_block">
            <pre className="text">
                {text === null ? t("Loading") + "..." : text || <em>{t("No text provided")}</em>}
            </pre>
        </div>
    );
};

class App extends Component {
    static propTypes = {
        isFullPageView: PropTypes.bool.isRequired,
        isFileLoaded: PropTypes.bool.isRequired
    };

    render() {
        const fullPageViewClass = this.props.isFullPageView ? " full_page_view" : "";

        return (
            <TranslationProvider>
                <div className={"djvu_js_viewer" + fullPageViewClass}>
                    {this.props.isFileLoading ?
                        <FileLoadingScreen /> :

                        !this.props.isFileLoaded ? <InitialScreen /> :
                            <React.Fragment>
                                <div className="central_block">
                                    <LeftPanel />
                                    <div className="page_zone">
                                        {this.props.pageError ? <ErrorPage pageNumber={this.props.pageNumber}
                                                                           error={this.props.pageError} /> :
                                            this.props.isContinuousScrollMode ? <ImageBlock /> :
                                                this.props.isTextMode ? <TextBlock text={this.props.pageText} /> :
                                                    this.props.imageData ? <ImageBlock /> : null}
                                        {(this.props.isLoading && !this.props.isTextMode && !this.props.isContinuousScrollMode) ?
                                            <LoadingLayer /> : null}
                                    </div>
                                </div>
                                <Toolbar />
                            </React.Fragment>
                    }
                    {this.props.isFileLoading ? null : <Footer />}

                    <NotificationWindow header={this.props.errorHeader} message={this.props.errorMessage}
                                        type={"error"} />
                    <HelpWindow />
                </div>
            </TranslationProvider>
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
        errorMessage: get.errorMessage(state),
        isContinuousScrollMode: get.isContinuousScrollMode(state),
    })
)(App);