import Constants from '../constants';
import { ActionTypes } from "../constants";
import dictionaries from '../locales';

const initialState = Object.freeze({
    documentId: 0, // required to detect the document change in the UI components
    fileName: null,
    userScale: 1,
    pageRotation: 0,
    isLoading: false,
    viewMode: Constants.SINGLE_PAGE_MODE,
    pagesQuantity: null,
    isFullPageView: false,
    error: null,
    contents: null,
    isHelpWindowShown: false,
    isOptionsWindowOpened: false,
    isIndirect: false,
    isContentsOpened: false,
    options: { // all these options are saved in localStorage
        interceptHttpRequests: true, // this value MUST BE DUPLICATED in the extension code
        analyzeHeaders: false, // this value MUST BE DUPLICATED in the extension code
        locale: 'en',
        theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        preferContinuousScroll: false,
        pageCountInRow: 1,
        firstRowPageCount: 1,
    },
    uiOptions: { // aren't saved, should be set programmatically, if required
        hideFullPageSwitch: false,
        changePageOnScroll: true,
        showContentsAutomatically: true,
        hideOpenAndCloseButtons: false,
        hidePrintButton: false,
        hideSaveButton: false,
    },
    appContext: {},
});

function getInitialStateWithOptions(state) {
    return {
        ...initialState,
        appContext: state.appContext,
        isFullPageView: state.isFullPageView,
        options: state.options,
        uiOptions: state.uiOptions,
    };
}

export default (state = initialState, action) => {
    const payload = action.payload;
    switch (action.type) {

        case ActionTypes.SET_UI_OPTIONS:
            return { ...state, uiOptions: { ...state.uiOptions, ...payload } };

        case ActionTypes.UPDATE_OPTIONS:
            return { ...state, options: { ...state.options, ...payload } };

        case ActionTypes.SET_VIEW_MODE:
            return {
                ...state,
                viewMode: payload,
                isLoading: payload === Constants.TEXT_MODE ? false : state.isLoading
            };

        case Constants.SET_PAGE_ROTATION_ACTION:
            return {
                ...state,
                pageRotation: action.pageRotation
            };

        case ActionTypes.TOGGLE_OPTIONS_WINDOW:
            return { ...state, isOptionsWindowOpened: payload };

        case Constants.SHOW_HELP_WINDOW_ACTION:
            return { ...state, isHelpWindowShown: true };

        case Constants.CLOSE_HELP_WINDOW_ACTION:
            return { ...state, isHelpWindowShown: false };

        case Constants.SET_NEW_PAGE_NUMBER_ACTION:
        case Constants.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION:
            return { ...state, isLoading: true }

        case Constants.IMAGE_DATA_RECEIVED_ACTION:
        case Constants.PAGE_TEXT_FETCHED_ACTION:
        case Constants.PAGE_ERROR_ACTION:
        case Constants.PAGES_SIZES_ARE_GOTTEN:
        case ActionTypes.SET_IMAGE_PAGE_ERROR:
            return { ...state, isLoading: false, };

        case Constants.DOCUMENT_CREATED_ACTION:
            return {
                ...getInitialStateWithOptions(state),
                documentId: state.documentId + 1,
                isLoading: true,
                viewMode: state.options.preferContinuousScroll ? Constants.CONTINUOUS_SCROLL_MODE : initialState.viewMode,
                pagesQuantity: action.pagesQuantity,
                fileName: action.fileName,
                isIndirect: action.isIndirect,
            };

        case Constants.CLOSE_DOCUMENT_ACTION:
            return getInitialStateWithOptions(state);

        case Constants.CONTENTS_IS_GOTTEN_ACTION:
            return {
                ...state,
                contents: action.contents,
                isContentsOpened: state.uiOptions.showContentsAutomatically && !state.appContext.isMobile
                    && !!action.contents,
            };

        case Constants.SET_USER_SCALE_ACTION:
            return {
                ...state,
                userScale: action.scale
            }

        case Constants.TOGGLE_FULL_PAGE_VIEW_ACTION:
            return {
                ...state,
                isFullPageView: action.isFullPageView
            }

        case ActionTypes.CLOSE_CONTENTS:
            return { ...state, isContentsOpened: false };

        case ActionTypes.TOGGLE_CONTENTS:
            return { ...state, isContentsOpened: !state.isContentsOpened };

        case ActionTypes.ERROR:
            return {
                ...state,
                isLoading: false,
                error: payload,
            };

        case ActionTypes.CLOSE_ERROR_WINDOW:
            return { ...state, error: null }

        case ActionTypes.UPDATE_APP_CONTEXT:
            return { ...state, appContext: payload };

        default:
            return state;
    }
}

export const get = {
    pageCountInRow: state => {
        return Math.max(1, Math.min(state.options.pageCountInRow, state.pagesQuantity, Constants.MAX_PAGE_COUNT_IN_ROW));
    },
    firstRowPageCount: state => {
        return Math.max(1, Math.min(state.options.firstRowPageCount, get.pageCountInRow(state)));
    },
    isContentsOpened: state => state.isContentsOpened,
    dictionary: state => dictionaries[get.options(state).locale] || dictionaries.en,
    isOptionsWindowOpened: state => state.isOptionsWindowOpened,
    uiOptions: state => state.uiOptions,
    documentId: state => state.documentId,
    userScale: state => state.userScale,
    pageRotation: state => state.pageRotation,
    pagesQuantity: state => state.pagesQuantity,
    contents: state => state.contents,
    isIndirect: state => state.isIndirect,
    isHelpWindowShown: state => state.isHelpWindowShown,
    fileName: state => state.fileName,
    error: state => state.error,
    options: state => state.options,
    isFullPageView: state => state.isFullPageView,
    isLoading: state => state.isLoading,
    isDocumentLoaded: state => !!state.pagesQuantity,
    viewMode: state => {
        if (state.isIndirect && state.viewMode === Constants.CONTINUOUS_SCROLL_MODE) {
            return Constants.SINGLE_PAGE_MODE;
        }
        return state.viewMode;
    }
};