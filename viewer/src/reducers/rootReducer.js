import { combineReducers } from 'redux';
import Consts from '../constants/consts';

const DjVu = window.DjVu;

const initialState = {
    djvuWorker: new DjVu.Worker(),
    arrayBuffer: null,
    dataUrl: null,
    imageWidth: null,
    imageHeight: null,
    imageData: null,
    imageDPI: null,
    userScale: 1,
    isLoading: false,
    currentPageNumber: 1,
    pagesCount: null,
    isFullPageView: false,
    imageDataUrlTimeout: null
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case Consts.IMAGE_DATA_RECIEVED_ACTION:
            clearTimeout(state.imageDataUrlTimeout);
            return {
                ...state,
                imageDataUrlTimeout: action.imageDataUrlTimeout,
                imageWidth: action.imageData.width,
                imageHeight: action.imageData.height,
                imageData: { a: action.imageData },
                dataUrl: null,
                imageDPI: action.imageDPI
            };

        case Consts.DATA_URL_CREATED_ACTION:
            clearTimeout(state.imageDataUrlTimeout);
            state.imageData.a = null;
            return {
                ...state,
                imageDataUrlTimeout: null,
                dataUrl: action.dataUrl,
                imageData: null
            }

        case Consts.DOCUMENT_CREATED_ACTION:
            return {
                ...initialState,
                isFullPageView: state.isFullPageView,
                pagesCount: action.pagesCount
            };

        case Consts.SET_NEW_PAGE_NUMBER_ACTION:
            return {
                ...state,
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

        default:
            return state;
    }
}

export default rootReducer;
