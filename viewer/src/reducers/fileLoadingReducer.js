import { createSelector } from 'reselect';
import Constants, { ActionTypes } from '../constants';

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
        case ActionTypes.ERROR:
            return initialState;

        default:
            return state;
    }
}

const $ = selector => createSelector(state => state.fileLoadingState, selector);

export const get = {
    isFileLoading: $(s => s.isFileLoading),
    loadedBytes: $(s => s.loadedBytes),
    totalBytes: $(s => s.totalBytes),
};