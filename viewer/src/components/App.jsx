import React from 'react';
import { useSelector } from 'react-redux';
import { createGlobalStyle, css, /* StyleSheetManager */ } from 'styled-components';

import { get } from '../reducers';
import Toolbar from "./Toolbar/Toolbar";
import InitialScreen from './InitialScreen/InitialScreen';
import FileLoadingScreen from './FileLoadingScreen';
import ErrorWindow from './ModalWindows/ErrorWindow';
import HelpWindow from './ModalWindows/HelpWindow';
import { TranslationProvider } from './Translation';
import Main from './Main';
import SaveDialog from "./ModalWindows/SaveDialog";
import OptionsWindow from "./ModalWindows/OptionsWindow";
import PrintDialog from "./ModalWindows/PrintDialog";
import AppContextProvider from "./AppContext";

const GlobalStyle = createGlobalStyle`
    html.disable_scroll_djvujs,
    body.disable_scroll_djvujs {
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
    }

    /*
     Reset styles to get rid of default global styles provided by some frameworks, 
     e.g. https://tailwindcss.com/docs/preflight that adds "svg {display: block}".
     The specificity is (0, 0, 2) for tags and (0, 1, 1) for pseudo elements to both override the default styles,
     but not override class-based styles from styled-components. 
     :not(span) and :not(html) are added to increased the specificity.
     
     We cannot use "all: revert" for svg and its children, because it will override all svg attributes, 
     including "d" prop of <path>, which will make all icons invisible. 
     */
    :where(.djvujs-viewer-root) *:not(svg *):not(svg),
    div:not(span):where(.djvujs-viewer-root),
    :where(.djvujs-viewer-root, .djvujs-viewer-root *):not(html)::before,
    :where(.djvujs-viewer-root, .djvujs-viewer-root *):not(html)::after {
        all: revert;
    }

    :where(.djvujs-viewer-root) :is(svg:not(span), svg *) {
        display: revert;
        position: revert;
        vertical-align: revert;
        border: revert;
        box-sizing: revert;
        background: revert;
        margin: revert;
        padding: revert;
    }

    // -------------------------- end of styles reset --------------------------
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
    font-size: ${p => p.theme.isMobile ? 10 : 14}px;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: initial;
    writing-mode: horizontal-tb;
    
    --app-padding: 5px;
    padding: var(--app-padding);

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

const AppRoot = React.forwardRef(({ shadowRoot }, ref) => {
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
                data-djvujs-id="root" // used in E2E tests
                className="djvujs-viewer-root" // used to reset styles
                ref={ref}
            >
                {isFileLoading ?
                    <FileLoadingScreen /> :

                    !isFileLoaded ? <InitialScreen /> :
                        <React.Fragment>
                            <Main />
                            <Toolbar />
                        </React.Fragment>
                }
                {/*{isFileLoading ? null : <Footer />}*/}

                <ErrorWindow />
                <HelpWindow />
                <SaveDialog />
                <OptionsWindow />
                {isPrintDialogOpened ? <PrintDialog /> : null}
                <div id="djvujs-modal-windows-container" />
            </div>
        </TranslationProvider>
    );
});

export default ({ shadowRoot }) => {
    return (
        //<StyleSheetManager target={shadowRoot}>
        <AppContextProvider AppRoot={AppRoot} shadowRoot={shadowRoot} />
        //</StyleSheetManager>
    );
}