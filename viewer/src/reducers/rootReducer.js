import { composeHighOrderGet } from '../utils';
import fileLoadingReducer, { get as fileLoadingGet } from './fileLoadingReducer';
import pageReducer, { get as pageGet } from './pageReducer';
import commonReducer, { get as commonGet } from './commonReducer';

export const get = {
    ...commonGet,
    ...composeHighOrderGet({
        fileLoadingState: fileLoadingGet,
        pageState: pageGet,
    })
};

const rootReducer = (state, action) => {
    state = commonReducer(state, action);
    return {
        ...state,
        fileLoadingState: fileLoadingReducer(state.fileLoadingState, action),
        pageState: pageReducer(state.pageState, action)
    }
}

export default rootReducer;
