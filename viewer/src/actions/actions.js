import Consts from '../constants/consts.js';
import setDataUrlTimeout from './dataUrlCreator';

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

    renderCurrentPageAction: () => (dispatch, getState) => {
        const { currentPageNumber, djvuWorker } = getState();
        djvuWorker.getPageImageDataWithDPI(currentPageNumber - 1).then(obj => {
            dispatch({
                type: Consts.IMAGE_DATA_RECIEVED_ACTION,
                imageDataUrlTimeout: setDataUrlTimeout(obj.imageData, dispatch),
                imageData: obj.imageData,
                imageDPI: obj.dpi
            });
        })
    },

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