import { combineReducers } from 'redux';
import Consts from '../constants/consts';


const DjVu = window.DjVu;

const initialState = {
    djvuWorker: new DjVu.Worker(),
    arrayBuffer: null,
    dataUrl: null,
    imageData: null,
    imageDPI: null,
    userScale: 1,
    isLoading: false,
    currentPageNumber: 1,
    pagesCount: null
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case Consts.IMAGE_DATA_RECIEVED_ACTION:
            return {
                ...state,
                imageData: action.imageData,
                imageDPI: action.imageDPI
            };

        case Consts.DOCUMENT_CREATED_ACTION:
            return {
                ...state,
                pagesCount: action.pagesCount
            };

        default:
            return state;
    }
}

export default rootReducer;
