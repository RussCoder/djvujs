import Consts from '../constants/consts.js';

const Actions = {

    createDocumentFromArrayBufferAction: (arrayBuffer) => (dispatch, getState) => {
        const worker = getState().djvuWorker;
        worker.createDocument(arrayBuffer)
            .then(() => worker.getPageNumber())
            .then(pagesCount => {
                dispatch({
                    type: Consts.DOCUMENT_CREATED_ACTION,
                    pagesCount: pagesCount
                });
                dispatch(Actions.renderCurrentPageAction());
            });        
    },

    renderCurrentPageAction: () => (dispatch, getState) => {
        const { currentPageNumber, djvuWorker } = getState();
        djvuWorker.getPageImageDataWithDPI(currentPageNumber).then(obj => {
            dispatch({
                type: Consts.IMAGE_DATA_RECIEVED_ACTION,
                imageData: obj.imageData,
                imageDPI: obj.dpi
            });
        })
    },

    setNewPageNumberAction: (pageNumber) => ({
        type: Consts.SET_NEW_PAGE_NUMBER_ACTION,
        pageNumber: pageNumber
    })
};

export default Actions;