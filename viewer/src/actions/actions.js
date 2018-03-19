import Consts from '../constants/consts.js';

const Actions = {

    createDocumentFromArrayBufferAction: (arrayBuffer, fileName = "***") => (dispatch, getState) => {
        const worker = getState().djvuWorker;
        worker.createDocument(arrayBuffer)
            .then(() => worker.getPageCount())
            .then(pagesCount => {
                dispatch({
                    type: Consts.DOCUMENT_CREATED_ACTION,
                    pagesCount: pagesCount,
                    fileName: fileName
                });
                dispatch(Actions.renderCurrentPageAction());
            });
    },

    renderCurrentPageAction: () => ({
        type: Consts.RENDER_CURRENT_PAGE_ACTION
    }),

    setNewPageNumberAction: (pageNumber) => ({
        type: Consts.SET_NEW_PAGE_NUMBER_ACTION,
        pageNumber: pageNumber
    }),

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