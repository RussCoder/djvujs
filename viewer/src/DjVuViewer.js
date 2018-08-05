import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './components/App.jsx';
import Actions from './actions/actions';
import configureStore from './store';
import { loadFile } from './utils';

export default class DjVuViewer {

    static VERSION = '0.2.0';

    constructor() {
        this.store = configureStore();
    }

    render(element) {
        ReactDOM.render(
            <Provider store={this.store}>
                <App />
            </Provider>
            , element
        );
    }

    loadDocument(buffer, name) {
        this.store.dispatch(Actions.createDocumentFromArrayBufferAction(buffer, name));
    }

    async loadDocumentByUrl(url) {
        try {
            this.store.dispatch(Actions.startFileLoadingAction());
            var buffer = await loadFile(url, (e) => {
                this.store.dispatch(Actions.fileLoadingProgressAction(e.loaded, e.total));
            });
            var res = /[^/]*$/.exec(url.trim());
            this.loadDocument(buffer, res ? res[0] : '***');
        } catch (e) {
            this.store.dispatch(Actions.errorAction(e));
        } finally {
            this.store.dispatch(Actions.endFileLoadingAction());
        }
    }
}
