import Consts from '../constants/consts';
import { createGetObjectByState } from '../utils';

const initialState = Object.freeze({
    isFileLoading: false,
    loadedBytes: 0,
    totalBytes: 0
});

export default function fileLoadingReducer(state = initialState, action) {
    switch (action.type) {
        case Consts.START_FILE_LOADING_ACTION:
            return {
                ...state,
                isFileLoading: true,
            }

        case Consts.FILE_LOADING_PROGRESS_ACTION:
            return {
                ...state,
                loadedBytes: action.loaded,
                totalBytes: action.total
            }

        case Consts.END_FILE_LOADING_ACTION:
            return initialState;

        default:
            return state;
    }
}

export const get = createGetObjectByState(initialState);