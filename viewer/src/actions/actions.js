import Consts from '../constants/consts.js';

const Actions = {

    createDocumentFromArrayBufferAction: (arrayBuffer, fileName = "***") => (dispatch, getState) => {
        const worker = getState().djvuWorker;
        worker.createDocument(arrayBuffer)
            .then(() => worker.getPageNumber())
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

    setNewPageNumberAction: (pageNumber) => (dispatch, getState) => {
        dispatch({
            type: Consts.SET_NEW_PAGE_NUMBER_ACTION,
            pageNumber: pageNumber
        });

        dispatch(Actions.renderCurrentPageAction());
    },

    setUserScaleAction: (scale) => ({
        type: Consts.SET_USER_SCALE_ACTION,
        scale: scale
    }),

    dataUrlCreatedAction: (dataUrl) => ({
        type: Consts.DATA_URL_CREATED_ACTION,
        dataUrl: dataUrl
    }),

    toggleFullPageViewAction: (isFullPageView) => ({
        type: Consts.TOGGLE_FULL_PAGE_VIEW_ACTION,
        isFullPageView: isFullPageView
    })
};

export default Actions;