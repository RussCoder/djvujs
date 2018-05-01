import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './reducers/rootReducer';
import rootSaga from './sagas/rootSaga';
import initHotkeys from './hotkeys';

const sagaMiddleware = createSagaMiddleware();
const configureStore = () => {
    const store = createStore(rootReducer, applyMiddleware(
        thunkMiddleware,
        sagaMiddleware
    ));
    sagaMiddleware.run(rootSaga);
    initHotkeys(store);
    return store;
};

export default configureStore;