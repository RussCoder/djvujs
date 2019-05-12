import Consts from '../constants/consts';
import { createGetObjectByState } from '../utils';

const initialState = Object.freeze({
    //dataUrl: null,
    imageData: null,
    imageDpi: null,
    pageText: null,
    textZones: null,
    cursorMode: Consts.GRAB_CURSOR_MODE,
    currentPageNumber: 1,
    isPageNumberSetManually: false,
    pageError: null,
    pageList: [],
    pageSizeList: [],
});

export default function pageReducer(state = initialState, action) {
    switch (action.type) {

        case Consts.DROP_PAGE_ACTION: {
            const newPagesList = [...state.pageList];
            const index = action.pageNumber - 1;
            if (newPagesList[index]) { // some pages (loaded as "last pages" of the previous saga) can not be in the state, but only in the registry in the saga class
                newPagesList[index] = {
                    width: newPagesList[index].width,
                    height: newPagesList[index].height,
                    dpi: newPagesList[index].dpi,
                };
            }
            return { ...state, pageList: newPagesList };
        }

        case Consts.DROP_ALL_PAGES_ACTION:
            return {
                ...state,
                pageList: [...state.pageSizeList],
            }
        
        case Consts.PAGES_SIZES_ARE_GOTTEN:
            return {
                ...state,
                isLoading: false,
                pageSizeList: action.sizes,
                pageList: action.sizes,
            };

        case Consts.PAGE_IS_LOADED_ACTION:
            if (state.pageList[action.pageNumber - 1].url) { // if it has been already loaded we should avoid unnecessary updates
                return state;
            }
            const newPagesList = [...state.pageList];
            newPagesList[action.pageNumber - 1] = action.pageData;
            return {
                ...state,
                pageList: newPagesList
            };

        case Consts.SET_CURSOR_MODE_ACTION:
            return {
                ...state,
                cursorMode: action.cursorMode
            };

        case Consts.IMAGE_DATA_RECEIVED_ACTION:
            return {
                ...state,
                imageData: action.imageData,
                //dataUrl: null,
                imageDpi: action.imageDpi
            };

        // case Consts.DATA_URL_CREATED_ACTION:
        //     return {
        //         ...state,
        //         dataUrl: action.dataUrl,
        //         imageData: null
        //     }

        case Consts.SET_NEW_PAGE_NUMBER_ACTION:
            if (state.pageError) {
                return {
                    ...initialState,
                    isPageNumberSetManually: action.isPageNumberSetManually,
                    currentPageNumber: action.pageNumber,
                };
            } else {
                return {
                    ...state,
                    isPageNumberSetManually: action.isPageNumberSetManually,
                    currentPageNumber: action.pageNumber
                };
            }

        case Consts.PAGE_TEXT_FETCHED_ACTION:
            return {
                ...state,
                pageText: action.pageText,
                textZones: action.textZones
            };

        case Consts.PAGE_ERROR_ACTION:
            return {
                ...state,
                pageError: action.error,
            };

        default:
            return state;
    }
}

export const get = createGetObjectByState(initialState);