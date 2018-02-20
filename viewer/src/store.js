import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createSagaMiddleware from 'redux-saga';

import rootReducer from './reducers/rootReducer';
import rootSaga from './sagas/rootSaga';

const sagaMiddleware = createSagaMiddleware();
const configureStore = () => {
    const store = createStore(rootReducer, applyMiddleware(
        thunkMiddleware,
        sagaMiddleware
    ));
    sagaMiddleware.run(rootSaga);
    return store;
};

export default configureStore;