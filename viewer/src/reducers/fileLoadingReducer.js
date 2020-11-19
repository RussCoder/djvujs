import Constants from '../constants';
import { createGetObjectByState } from '../utils';

const initialState = Object.freeze({
    isFileLoading: false,
    loadedBytes: 0,
    totalBytes: 0
});

export default function fileLoadingReducer(state = initialState, action) {
    switch (action.type) {
        case Constants.START_FILE_LOADING_ACTION:
            return {
                ...state,
                isFileLoading: true,
            }

        case Constants.FILE_LOADING_PROGRESS_ACTION:
            return {
                ...state,
                loadedBytes: action.loaded,
                totalBytes: action.total
            }

        case Constants.END_FILE_LOADING_ACTION:
        case Constants.ERROR_ACTION:
            return initialState;

        default:
            return state;
    }
}

export const get = createGetObjectByState(initialState);