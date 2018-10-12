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
    pageError: null,
});

export default function pageReducer(state = initialState, action) {
    switch (action.type) {

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
                    currentPageNumber: action.pageNumber,
                };
            } else {
                return {
                    ...state,
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