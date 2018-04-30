import Consts from '../constants/consts.js';
const DjVu = window.DjVu;

const Actions = {

    startFileLoadingAction: () => ({ type: Consts.START_FILE_LOADING_ACTION }),

    endFileLoadingAction: () => ({ type: Consts.END_FILE_LOADING_ACTION }),

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

    createDocumentFromArrayBufferAction: (arrayBuffer, fileName = "***") => ({
        type: Consts.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION,
        arrayBuffer: arrayBuffer,
        fileName: fileName
    }),

    setNewPageNumberAction: (pageNumber) => ({
        type: Consts.SET_NEW_PAGE_NUMBER_ACTION,
        pageNumber: pageNumber
    }),

    setPageByUrlAction(url) {
        return {
            type: Consts.SET_PAGE_BY_URL_ACTION,
            url: url
        };
    },

    setUserScaleAction: (scale) => ({
        type: Consts.SET_USER_SCALE_ACTION,
        scale: scale
    }),

    dataUrlCreatedAction: (dataUrl) => ({
        type: Consts.DATA_URL_CREATED_ACTION,
        dataUrl: dataUrl
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
            type: Consts.TOGGLE_FULL_PAGE_VIEW_ACTION,
            isFullPageView: isFullPageView
        });
    },

    toggleTextModeAction: (isTextMode) => ({
        type: Consts.TOGGLE_TEXT_MODE_ACTION,
        isTextMode: isTextMode
    })
};

export default Actions;