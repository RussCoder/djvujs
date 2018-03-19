import Consts from '../constants/consts';

const DjVu = window.DjVu;

const initialState = {
    djvuWorker: new DjVu.Worker(),
    fileName: null,
    arrayBuffer: null,
    dataUrl: null,
    imageWidth: null,
    imageHeight: null,
    imageData: null,
    imageDPI: null,
    pageText: null,
    userScale: 1,
    isLoading: false,
    isTextMode: false,
    currentPageNumber: 1,
    pagesCount: null,
    isFullPageView: false,
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case Consts.IMAGE_DATA_RECEIVED_ACTION:
            return {
                ...state,
                imageWidth: action.imageData.width,
                imageHeight: action.imageData.height,
                imageData: action.imageData,
                dataUrl: null,
                imageDPI: action.imageDPI
            };

        case Consts.DATA_URL_CREATED_ACTION:
            return {
                ...state,
                dataUrl: action.dataUrl,
                imageData: null
            }

        case Consts.DOCUMENT_CREATED_ACTION:
            return {
                ...initialState,
                isFullPageView: state.isFullPageView,
                pagesCount: action.pagesCount,
                fileName: action.fileName
            };

        case Consts.SET_NEW_PAGE_NUMBER_ACTION:
            return {
                ...state,
                pageText: null,
                currentPageNumber: action.pageNumber
            };

        case Consts.SET_USER_SCALE_ACTION:
            return {
                ...state,
                userScale: action.scale
            }

        case Consts.TOGGLE_FULL_PAGE_VIEW_ACTION:
            return {
                ...state,
                isFullPageView: action.isFullPageView
            }

        case Consts.TOGGLE_TEXT_MODE_ACTION:
            return {
                ...state,
                isTextMode: action.isTextMode
            }

        case Consts.PAGE_TEXT_FETCHED_ACTION:
            return {
                ...state,
                pageText: action.pageText
            }

        default:
            return state;
    }
}

export default rootReducer;
