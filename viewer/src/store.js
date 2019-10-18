import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './reducers/rootReducer';
import createRootSaga from './sagas/rootSaga';
import initHotkeys from './hotkeys';

const configureStore = () => {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(rootReducer, applyMiddleware(
        thunkMiddleware,
        sagaMiddleware
    ));
    sagaMiddleware.run(createRootSaga());
    initHotkeys(store);
    return store;
};

export default configureStore;