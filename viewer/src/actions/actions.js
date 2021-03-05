import Constants, { ActionTypes } from '../constants';
import { get } from '../reducers';
import DjVu from '../DjVu';

const Actions = {

    dropPageAction: pageNumber => ({ type: Constants.DROP_PAGE_ACTION, pageNumber: pageNumber }),

    pagesSizesAreGottenAction: (pagesSizes) => ({
        type: Constants.PAGES_SIZES_ARE_GOTTEN,
        sizes: pagesSizes,
    }),

    pageIsLoadedAction: (pageData, pageNumber) => ({
        type: Constants.PAGE_IS_LOADED_ACTION,
        pageNumber: pageNumber,
        pageData: pageData,
    }),

    setPageRotationAction: rotation => dispatch => {
        if (rotation === 0 || rotation === 90 || rotation === 180 || rotation === 270) {
            dispatch({
                type: Constants.SET_PAGE_ROTATION_ACTION,
                pageRotation: rotation
            });
        }
    },

    closeDocumentAction: () => ({ type: Constants.CLOSE_DOCUMENT_ACTION }),

    setCursorModeAction: cursorMode => ({ type: Constants.SET_CURSOR_MODE_ACTION, cursorMode: cursorMode }),

    closeHelpWindowAction: () => ({ type: Constants.CLOSE_HELP_WINDOW_ACTION }),

    showHelpWindowAction: () => ({ type: Constants.SHOW_HELP_WINDOW_ACTION }),

    tryToSaveDocument: () => (dispatch, getState) => {
        if (get.isIndirect(getState())) {
            dispatch({ type: ActionTypes.OPEN_SAVE_DIALOG });
        } else {
            dispatch({ type: ActionTypes.SAVE_DOCUMENT });
        }
    },

    startFileLoadingAction: () => ({ type: Constants.START_FILE_LOADING_ACTION }),

    endFileLoadingAction: () => ({ type: Constants.END_FILE_LOADING_ACTION }),

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
        type: Constants.FILE_LOADING_PROGRESS_ACTION,
        loaded: loaded,
        total: total
    }),

    errorAction: error => {
        console.error(error);

        return {
            type: ActionTypes.ERROR,
            payload: error,
        }
    },

    createDocumentFromArrayBufferAction: (arrayBuffer, fileName = "***", config = {}) => ({
        type: Constants.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION,
        arrayBuffer: arrayBuffer,
        fileName: fileName,
        config: config,
    }),

    setNewPageNumberAction: (pageNumber, shouldScrollToPage = false) => ({
        type: Constants.SET_NEW_PAGE_NUMBER_ACTION,
        pageNumber: pageNumber,
        shouldScrollToPage: shouldScrollToPage,
    }),

    setPageByUrlAction(url) {
        return {
            type: Constants.SET_PAGE_BY_URL_ACTION,
            url: url
        };
    },

    setUserScaleAction: (scale) => ({
        type: Constants.SET_USER_SCALE_ACTION,
        scale: scale < 0.1 ? 0.1 : scale > 6 ? 6 : scale
    }),

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
            type: Constants.TOGGLE_FULL_PAGE_VIEW_ACTION,
            isFullPageView: isFullPageView
        });
    },
};

export default Actions;