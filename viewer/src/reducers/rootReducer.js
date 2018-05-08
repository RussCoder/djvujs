import { composeHighOrderGet } from '../utils';
import fileLoadingReducer, { get as fileLoadingGet } from './fileLoadingReducer';
import commonReducer, { get as commonGet } from './commonReducer';

export const get = {
    ...commonGet,
    ...composeHighOrderGet({ fileLoadingState: fileLoadingGet })
};

const rootReducer = (state = commonReducer(undefined, {}), action) => {
    return {
        ...commonReducer(state, action),
        fileLoadingState: fileLoadingReducer(state.fileLoadingState, action)
    }
}

export default rootReducer;
