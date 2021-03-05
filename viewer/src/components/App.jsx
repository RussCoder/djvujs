import React from 'react';
import { useSelector } from 'react-redux';
import { createGlobalStyle, css } from 'styled-components';

import { get } from '../reducers';
import Toolbar from "./Toolbar/Toolbar";
import InitialScreen from './InitialScreen/InitialScreen';
import FileLoadingScreen from './FileLoadingScreen';
import Footer from './Footer/Footer';
import ErrorWindow from './ModalWindows/ErrorWindow';
import HelpWindow from './ModalWindows/HelpWindow';
import { TranslationProvider } from './Translation';
import Main from './Main';
import SaveDialog from "./ModalWindows/SaveDialog";
import OptionsWindow from "./ModalWindows/OptionsWindow";
import PrintDialog from "./ModalWindows/PrintDialog";

const GlobalStyle = createGlobalStyle`
    html.disable_scroll_djvujs,
    body.disable_scroll_djvujs {
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
    }
`;

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
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: initial;

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

const fullPageStyle = css`
    top: 0;
    left: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 100;
`;

export default () => {
    const isFileLoaded = useSelector(get.isDocumentLoaded);
    const isFileLoading = useSelector(get.isFileLoading);
    const isFullPageView = useSelector(get.isFullPageView);
    const theme = useSelector(get.options).theme;
    const isPrintDialogOpened = useSelector(get.isPrintDialogOpened);

    return (
        <TranslationProvider>
            <GlobalStyle />
            <div
                css={`
                    ${theme === 'dark' ? darkTheme : lightTheme};
                    ${style};
                    ${isFullPageView ? fullPageStyle : ''};
                `}
                data-djvujs-id="root"
            >
                {isFileLoading ?
                    <FileLoadingScreen /> :

                    !isFileLoaded ? <InitialScreen /> :
                        <React.Fragment>
                            <Main />
                            <Toolbar />
                        </React.Fragment>
                }
                {isFileLoading ? null : <Footer />}

                <ErrorWindow />
                <HelpWindow />
                <SaveDialog />
                <OptionsWindow />
                {isPrintDialogOpened ? <PrintDialog /> : null}
                <div id="djvujs-modal-windows-container" />
            </div>
        </TranslationProvider>
    );
}