import Consts from '../constants/consts.js';
import { get } from '../reducers/rootReducer';
import DjVu from '../DjVu';

const Actions = {

    dropPageAction: pageNumber => ({ type: Consts.DROP_PAGE_ACTION, pageNumber: pageNumber }),

    pagesSizesAreGottenAction: (pagesSizes) => ({
        type: Consts.PAGES_SIZES_ARE_GOTTEN,
        sizes: pagesSizes,
    }),

    pageIsLoadedAction: (pageData, pageNumber) => ({
        type: Consts.PAGE_IS_LOADED_ACTION,
        pageNumber: pageNumber,
        pageData: pageData,
    }),

    pageErrorAction: error => {
        //console.error(error);
        return ({
            type: Consts.PAGE_ERROR_ACTION,
            error: error,
        });
    },

    setApiCallbackAction: (callbackName, callback) => ({
        type: Consts.SET_API_CALLBACK_ACTION,
        callbackName: callbackName,
        callback: callback
    }),

    setPageRotationAction: rotation => dispatch => {
        if (rotation === 0 || rotation === 90 || rotation === 180 || rotation === 270) {
            dispatch({
                type: Consts.SET_PAGE_ROTATION_ACTION,
                pageRotation: rotation
            });
        }
    },

    closeDocumentAction: () => ({ type: Consts.CLOSE_DOCUMENT_ACTION }),

    setCursorModeAction: cursorMode => ({ type: Consts.SET_CURSOR_MODE_ACTION, cursorMode: cursorMode }),

    closeHelpWindowAction: () => ({ type: Consts.CLOSE_HELP_WINDOW_ACTION }),

    showHelpWindowAction: () => ({ type: Consts.SHOW_HELP_WINDOW_ACTION }),

    saveDocumentAction: () => ({ type: Consts.SAVE_DOCUMENT_ACTION }),

    startFileLoadingAction: () => ({ type: Consts.START_FILE_LOADING_ACTION }),

    endFileLoadingAction: () => ({ type: Consts.END_FILE_LOADING_ACTION }),

    goToNextPageAction: () => (dispatch, getState) => {
        const state = getState();
        if (get.currentPageNumber(state) < get.pagesQuantity(state)) {
            dispatch(Actions.setNewPageNumberAction(get.currentPageNumber(state) + 1, true));
        }
    },

    goToPreviousPageAction: () => (dispatch, getState) => {
        const state = getState();
        if (get.currentPageNumber(state) > 1) {
            dispatch(Actions.setNewPageNumberAction(get.currentPageNumber(state) - 1, true));
        }
    },

    fileLoadingProgressAction: (loaded, total) => ({
        type: Consts.FILE_LOADING_PROGRESS_ACTION,
        loaded: loaded,
        total: total
    }),

    errorAction: error => {
        var { header, message } = error;

        if (!header || !message) {
            switch (error.code) {
                case DjVu.ErrorCodes.INCORRECT_FILE_FORMAT:
                    header = "Incorrect file format!";
                    message = "The provided file isn't a .djvu file!";
                    break;
                default:
                    header = "Unexpected error ocurred!";
                    message = JSON.stringify(error);
            }
        }

        return {
            type: Consts.ERROR_ACTION,
            errorHeader: header,
            errorMessage: message
        }
    },

    closeModalWindowAction() {
        return { type: Consts.CLOSE_MODAL_WINDOW_ACTION };
    },

    createDocumentFromArrayBufferAction: (arrayBuffer, fileName = "***", options = {}) => ({
        type: Consts.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION,
        arrayBuffer: arrayBuffer,
        options: options,
        fileName: fileName
    }),

    setNewPageNumberAction: (pageNumber, isPageNumberSetManually = false) => ({
        type: Consts.SET_NEW_PAGE_NUMBER_ACTION,
        pageNumber: pageNumber,
        isPageNumberSetManually: isPageNumberSetManually,
    }),

    setPageByUrlAction(url) {
        return {
            type: Consts.SET_PAGE_BY_URL_ACTION,
            url: url
        };
    },

    setUserScaleAction: (scale) => ({
        type: Consts.SET_USER_SCALE_ACTION,
        scale: scale < 0.1 ? 0.1 : scale > 6 ? 6 : scale
    }),

    // dataUrlCreatedAction: (dataUrl) => ({
    //     type: Consts.DATA_URL_CREATED_ACTION,
    //     dataUrl: dataUrl
    // }),

    toggleFullPageViewAction: (isFullPageView) => (dispatch) => {
        const disableScrollClass = 'disable_scroll_djvujs';
        if (isFullPageView) {
            document.querySelector('html').classList.add(disableScrollClass);
            document.body.classList.add(disableScrollClass);
        } else {
            document.querySelector('html').classList.remove(disableScrollClass);
            document.body.classList.remove(disableScrollClass);
        }

        dispatch({
            type: Consts.TOGGLE_FULL_PAGE_VIEW_ACTION,
            isFullPageView: isFullPageView
        });
    },
};

export default Actions;