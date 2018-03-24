import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './components/App.jsx';
import configureStore from './store';
import Actions from './actions/actions';

const DjVu = window.DjVu;

if (!DjVu) {
    throw new Error("There is no DjVu object! You have to include the DjVu.js library first!");
}

const store = configureStore();

DjVu.Viewer = {
    VERSION: '0.0.6',
    init(element) {
        //element.style.width = window.innerWidth * 0.9 + 'px';
        element.style.height = window.innerHeight * 0.95 + 'px';
        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>
            , element
        );
    }
}

if (process.env.NODE_ENV !== 'production') {
    DjVu.Utils.loadFile("/tmp/DjVu3Spec.djvu").then(buffer => {
        store.dispatch(Actions.createDocumentFromArrayBufferAction(buffer));
    });
}