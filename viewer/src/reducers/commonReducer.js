import { createGetObjectByState } from '../utils';
import Consts from '../constants/consts';

const DjVu = window.DjVu;

const initialState = {
    djvuWorker: new DjVu.Worker(),
    fileName: null,
    //dataUrl: null,
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
    errorHeader: null,
    contents: null,
    errorMessage: null,
};

export default (state = initialState, action) => {
    switch (action.type) {

        case Consts.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION:
            return {
                ...state,
                isLoading: true
            }

        case Consts.IMAGE_DATA_RECEIVED_ACTION:
            return {
                ...state,
                imageWidth: action.imageData.width,
                imageHeight: action.imageData.height,
                imageData: action.imageData,
                //dataUrl: null,
                isLoading: false,
                imageDPI: action.imageDPI
            };

        // case Consts.DATA_URL_CREATED_ACTION:
        //     return {
        //         ...state,
        //         dataUrl: action.dataUrl,
        //         imageData: null
        //     }

        case Consts.DOCUMENT_CREATED_ACTION:
            return {
                ...initialState,
                isLoading: true,
                isFullPageView: state.isFullPageView,
                pagesCount: action.pagesCount,
                fileName: action.fileName
            };

        case Consts.CONTENTS_IS_GOTTEN_ACTION:
            return {
                ...state,
                contents: action.contents
            };

        case Consts.SET_NEW_PAGE_NUMBER_ACTION:
            return {
                ...state,
                pageText: null,
                isLoading: true,
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

        case Consts.ERROR_ACTION:
            return {
                ...state,
                isLoading: false,
                errorHeader: action.errorHeader,
                errorMessage: action.errorMessage,
            }

        case Consts.CLOSE_MODAL_WINDOW_ACTION:
            return {
                ...state,
                errorHeader: null,
                errorMessage: null,
            }

        default:
            return state;
    }
}

export const get = createGetObjectByState(initialState);