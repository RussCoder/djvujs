import { createSelector } from 'reselect';
import { ActionTypes } from '../constants';

const initialState = Object.freeze({
    progress: 0,
    buffer: null,
    isBundling: false,
    isSaveDialogShown: false,
});

export default function fileProcessingReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case ActionTypes.OPEN_SAVE_DIALOG:
            return { ...state, isSaveDialogShown: true };

        case ActionTypes.START_TO_BUNDLE:
            return { ...state, isBundling: true };

        case ActionTypes.UPDATE_FILE_PROCESSING_PROGRESS:
            return { ...state, progress: payload };

        case ActionTypes.FINISH_TO_BUNDLE:
            return { ...state, buffer: payload };

        case ActionTypes.ERROR:
        case ActionTypes.CLOSE_SAVE_DIALOG:
            return initialState;

        default:
            return state;
    }
}

const $ = selector => createSelector(state => state.fileProcessingState, selector);

export const get = {
    isSaveDialogShown: $(s => s.isSaveDialogShown),
    isBundling: $(s => s.isBundling),
    resultBuffer: $(s => s.buffer),
    fileProcessingProgress: $(s => s.progress),
};