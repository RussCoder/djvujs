import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './reducers';
import createRootSaga from './sagas/rootSaga';
import initHotkeys from './hotkeys';

const configureStore = (eventMiddleware = undefined) => {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(rootReducer, applyMiddleware(
        // store => next => action => {
        //     const state = store.getState();
        //     console.log(action);
        //     next(action);
        // },
        thunkMiddleware,
        sagaMiddleware,
        eventMiddleware
    ));
    sagaMiddleware.run(createRootSaga(store.dispatch));
    initHotkeys(store);
    return store;
};

export default configureStore;