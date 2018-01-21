import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import rootReducer from './reducers/rootReducer';

const configureStore = () => {
    const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
    return store;
};

export default configureStore;