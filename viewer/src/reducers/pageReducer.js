import Constants from '../constants';
import { ActionTypes } from '../constants/index';
import { createGetObjectByState } from '../utils';

const initialState = Object.freeze({
    imageData: null,
    imageDpi: null,
    pageText: null,
    textZones: null,
    cursorMode: Constants.GRAB_CURSOR_MODE,
    currentPageNumber: 1,
    isPageNumberSetManually: false,
    imagePageError: null,
    textPageError: null,
    pageList: [],
    pageSizeList: [],
});

export default function pageReducer(state = initialState, action) {
    const payload = action.payload;
    switch (action.type) {
        case Constants.DROP_PAGE_ACTION: {
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

        case Constants.DROP_ALL_PAGES_ACTION:
            return {
                ...state,
                pageList: [...state.pageSizeList],
            }

        case Constants.PAGES_SIZES_ARE_GOTTEN:
            return {
                ...state,
                isLoading: false,
                pageSizeList: action.sizes,
                pageList: action.sizes,
            };

        case Constants.PAGE_IS_LOADED_ACTION:
            if (state.pageList[action.pageNumber - 1].url) { // if it has been already loaded we should avoid unnecessary updates
                return state;
            }
            const newPagesList = [...state.pageList];
            newPagesList[action.pageNumber - 1] = action.pageData;
            return {
                ...state,
                pageList: newPagesList
            };

        case Constants.SET_CURSOR_MODE_ACTION:
            return {
                ...state,
                cursorMode: action.cursorMode
            };

        case Constants.IMAGE_DATA_RECEIVED_ACTION:
            return {
                ...state,
                imageData: action.imageData,
                imageDpi: action.imageDpi
            };

        case Constants.SET_NEW_PAGE_NUMBER_ACTION:
            return {
                ...((state.textPageError || state.imagePageError) ? initialState : state),
                isPageNumberSetManually: action.isPageNumberSetManually,
                currentPageNumber: action.pageNumber
            };

        case Constants.PAGE_TEXT_FETCHED_ACTION:
            return {
                ...state,
                pageText: action.pageText,
                textZones: action.textZones
            };

        case ActionTypes.SET_IMAGE_PAGE_ERROR:
            return { ...state, imagePageError: payload };

        case ActionTypes.SET_TEXT_PAGE_ERROR:
            return { ...state, textPageError: payload };

        default:
            return state;
    }
}

export const get = createGetObjectByState(initialState);