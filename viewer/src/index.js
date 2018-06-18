import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './components/App.jsx';
import configureStore from './store';
import Actions from './actions/actions';
import { loadFile } from './utils';
import DjVu from './DjVu';

const store = configureStore();

DjVu.Viewer = {
    VERSION: '0.1.7',
    init(element) {
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