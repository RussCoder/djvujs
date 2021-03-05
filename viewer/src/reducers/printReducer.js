import { createSelector } from 'reselect';
import { ActionTypes } from '../constants';

const initialState = Object.freeze({
    isPrintDialogOpened: false,
    isPreparingForPrinting: false,
    printProgress: 0,
    pagesForPrinting: null,
});

export default function fileProcessingReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
        case ActionTypes.OPEN_PRINT_DIALOG:
            // initial state is used just in case if there are pagesForPrinting from a previous attempt
            // (if the saga wasn't cancelled, but it should be cancelled)
            return { ...initialState, isPrintDialogOpened: true };

        case ActionTypes.PREPARE_PAGES_FOR_PRINTING:
            return { ...state, isPreparingForPrinting: true };

        case ActionTypes.UPDATE_PRINT_PROGRESS:
            return { ...state, printProgress: payload };

        case ActionTypes.START_PRINTING:
            return { ...state, pagesForPrinting: payload };

        case ActionTypes.ERROR:
        case ActionTypes.CLOSE_PRINT_DIALOG:
            return initialState;

        default:
            return state;
    }
}

const $ = selector => createSelector(state => state.printState, selector);

export const get = {
    isPrintDialogOpened: $(s => s.isPrintDialogOpened),
    isPreparingForPrinting: $(s => s.isPreparingForPrinting),
    printProgress: $(s => s.printProgress),
    pagesForPrinting: $(s => s.pagesForPrinting),
};