import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './components/App.jsx';
import configureStore from './store';
import Actions from './actions/actions';
import { loadFile } from './utils';

const DjVu = window.DjVu;

if (!DjVu) {
    throw new Error("There is no DjVu object! You have to include the DjVu.js library first!");
}

const store = configureStore();

DjVu.Viewer = {
    VERSION: '0.1.6',
    init(element) {
        //element.style.width = window.innerWidth * 0.9 + 'px';
        element.style.height = window.innerHeight * 0.95 + 'px';
        ReactDOM.render(
            <Provider store={store}>
                <App />
            </Provider>
            , element
        );
    },

    loadDocument(buffer, name) {
        store.dispatch(Actions.createDocumentFromArrayBufferAction(buffer, name));
    },

    async loadDocumentByUrl(url) {
        try {
            store.dispatch(Actions.startFileLoadingAction());
            var buffer = await loadFile(url, (e) => {
                store.dispatch(Actions.fileLoadingProgressAction(e.loaded, e.total));
            });
            var res = /[^/]*$/.exec(url.trim());
            DjVu.Viewer.loadDocument(buffer, res ? res[0] : '***');
        } catch (e) {
            store.dispatch(Actions.errorAction(e));
        } finally {
            store.dispatch(Actions.endFileLoadingAction());
        }
    }
}

if (process.env.NODE_ENV !== 'production') {
    DjVu.Viewer.loadDocumentByUrl("/tmp/DjVu3Spec.djvu");
}