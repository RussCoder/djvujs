import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { css } from 'styled-components';

import { get } from '../reducers/rootReducer';
import Toolbar from "./Toolbar/Toolbar";
import ImageBlock from "./ImageBlock/ImageBlock";
import InitialScreen from './InitialScreen/InitialScreen';
import FileLoadingScreen from './FileLoadingScreen';
import Footer from './Footer/Footer';
import LeftPanel from './LeftPanel/LeftPanel';
import NotificationWindow from './NotificationWindow';
import HelpWindow from './HelpWindow';
import ErrorPage from './ErrorPage';
import LoadingLayer from './LoadingLayer';
import TextBlock from './TextBlock';
import { TranslationProvider } from './Translation';

const lightTheme = css`
    --background-color: #fcfcfc;
    --alternative-background-color: #eee;
    --modal-window-background-color: var(--background-color);
    --color: #000;
    --border-color: #555;
    --highlight-color: #084475;
    --scrollbar-track-color: var(--alternative-background-color);
    --scrollbar-thumb-color: #cccccc;
`;

const darkTheme = css`
    --background-color: #1e1e1e;
    --alternative-background-color: #333333;
    --modal-window-background-color: var(--background-color);
    --color: #CCCCCC;
    --border-color: #999999;
    --highlight-color: #d89416;
    --scrollbar-track-color: var(--alternative-background-color);
    --scrollbar-thumb-color: #858585;
`;

const style = css`
    background: var(--background-color);
    color: var(--color);

    a {
        color: var(--highlight-color);
    }

    *::-webkit-scrollbar {
        background-color: var(--scrollbar-track-color);
    }

    *::-webkit-scrollbar-thumb {
        background-color: var(--scrollbar-thumb-color);
    }
    
    *::-webkit-scrollbar-corner {
        background-color: var(--background-color);
    }
`;

class App extends Component {
    static propTypes = {
        isFullPageView: PropTypes.bool.isRequired,
        isFileLoaded: PropTypes.bool.isRequired
    };

    render() {
        const fullPageViewClass = this.props.isFullPageView ? " full_page_view" : "";
        const theme = this.props.options.theme;

        return (
            <TranslationProvider>
                <div
                    className={"djvu_js_viewer " + fullPageViewClass}
                    css={`
                        ${theme === 'dark' ? darkTheme : lightTheme};
                        ${style};
                    `}
                >
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

                    <NotificationWindow
                        header={this.props.errorHeader}
                        message={this.props.errorMessage}
                        type={"error"}
                    />
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
        options: get.options(state),
    })
)(App);