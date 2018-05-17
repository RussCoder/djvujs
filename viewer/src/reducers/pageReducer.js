import Consts from '../constants/consts';
import { createGetObjectByState } from '../utils';

const initialState = {
    //dataUrl: null,
    imageData: null,
    imageDpi: null,
    pageText: null,
    currentPageNumber: 1,
};

export default function pageReducer(state = initialState, action) {
    switch (action.type) {

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
            return {
                ...state,
                currentPageNumber: action.pageNumber
            };

        case Consts.PAGE_TEXT_FETCHED_ACTION:
            return {
                ...state,
                pageText: action.pageText
            }

        default:
            return state;
    }
}

export const get = createGetObjectByState(initialState);