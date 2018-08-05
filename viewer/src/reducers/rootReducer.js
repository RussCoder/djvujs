import { composeHighOrderGet } from '../utils';
import fileLoadingReducer, { get as fileLoadingGet } from './fileLoadingReducer';
import pageReducer, { get as pageGet } from './pageReducer';
import commonReducer, { get as commonGet } from './commonReducer';
import DjVu from '../DjVu';

export const get = {
    djvuWorker: state => state.djvuWorker,
    ...commonGet,
    ...composeHighOrderGet({
        fileLoadingState: fileLoadingGet,
        pageState: pageGet,
    })
};

const rootReducer = (state, action) => {
    const worker = (state && state.djvuWorker) || new DjVu.Worker();
    state = commonReducer(state, action);
    return {
        djvuWorker: worker,
        ...state,
        fileLoadingState: fileLoadingReducer(state.fileLoadingState, action),
        pageState: pageReducer(state.pageState, action)
    }
}

export default rootReducer;
