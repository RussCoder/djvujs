import fileLoadingReducer, { get as fileLoadingGet } from './fileLoadingReducer';
import pageReducer, { get as pageGet } from './pageReducer';
import commonReducer, { get as commonGet } from './commonReducer';
import fileProcessingReducer, { get as fileProcessingGet } from "./fileProcessingReducer";
import printReducer, { get as printGet } from './printReducer';

export const get = {
    ...commonGet,
    ...pageGet,
    ...fileLoadingGet,
    ...fileProcessingGet,
    ...printGet,
};

export default (state, action) => {
    state = commonReducer(state, action);
    return {
        ...state,
        fileLoadingState: fileLoadingReducer(state.fileLoadingState, action),
        pageState: pageReducer(state.pageState, action),
        fileProcessingState: fileProcessingReducer(state.fileProcessingState, action),
        printState: printReducer(state.printState, action),
    }
};