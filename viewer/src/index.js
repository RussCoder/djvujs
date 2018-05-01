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

function loadFile(url, progressHandler) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = 'arraybuffer';
        xhr.onload = (e) => {
            if (xhr.status !== 200) {
                return reject({
                    header: `${xhr.status} code`,
                    message: "Requested resource was not found"
                });
            }
            DjVu.IS_DEBUG && console.log("File loaded: ", e.loaded);
            resolve(xhr.response);
        };

        xhr.onerror = (e) => {
            reject({
                header: "Web request error",
                message: "An error occurred, the file wasn't loaded. XHR status " + e.xhr.status
            })
        }

        xhr.onprogress = progressHandler;
        xhr.send();
    });
}

DjVu.Viewer = {
    VERSION: '0.1.2',
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