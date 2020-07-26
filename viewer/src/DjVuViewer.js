import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './components/App.jsx';
import Actions from './actions/actions';
import configureStore from './store';
import { loadFile } from './utils';
import EventEmitter from 'eventemitter3';
import Consts, { constant } from './constants/consts';
import { get } from './reducers';

const Events = constant({
    PAGE_NUMBER_CHANGED: null,
    DOCUMENT_CHANGED: null,
    DOCUMENT_CLOSED: null,
});

export default class DjVuViewer extends EventEmitter {

    static VERSION = '0.3.5';

    static Events = Events;

    constructor() {
        super();
        this.store = configureStore(this.eventMiddleware);

        if (process.env.NODE_ENV === 'development') {
            if (module.hot) {
                module.hot.accept('./components/App', () => {
                    this.render(this.htmlElement);
                });
            }
        }
    }

    eventMiddleware = store => next => action => {
        let result;
        switch (action.type) {
            case Consts.SET_NEW_PAGE_NUMBER_ACTION:
                const oldPageNumber = this.getPageNumber();
                result = next(action);
                const newPageNumber = this.getPageNumber();
                if (oldPageNumber !== newPageNumber) {
                    this.emit(Events.PAGE_NUMBER_CHANGED);
                }
                break;

            case Consts.DOCUMENT_CREATED_ACTION:
                result = next(action);
                this.emit(Events.DOCUMENT_CHANGED);
                break;

            case Consts.CLOSE_DOCUMENT_ACTION:
                result = next(action);
                this.emit(Events.DOCUMENT_CLOSED);
                break;

            default:
                result = next(action);
                break;
        }

        return result;
    };

    getPageNumber() {
        return get.currentPageNumber(this.store.getState());
    }

    getDocumentName() {
        return get.fileName(this.store.getState());
    }

    render(element) {
        this.htmlElement = element;
        ReactDOM.render(
            <Provider store={this.store}>
                <App />
            </Provider>
            , element
        );
    }

    configure({ pageNumber, pageRotation, pageScale } = {}) {
        const dispatch = this.store.dispatch.bind(this.store);

        pageNumber && dispatch(Actions.setNewPageNumberAction(pageNumber, true));
        pageRotation && dispatch(Actions.setPageRotationAction(pageRotation));
        pageScale && dispatch(Actions.setUserScaleAction(pageScale));

        return this;
    }

    loadDocument(buffer, name = "***", config = {}) {
        return new Promise(resolve => {
            this.store.dispatch(Actions.setApiCallbackAction('document_created', () => {
                config && this.configure(config);
                resolve();
            }));
            this.store.dispatch(Actions.createDocumentFromArrayBufferAction(buffer, name, config.djvuOptions));
        });
    }

    _getFileNameFromUrl(url) {
        try {
            const res = /[^/#]*(?=#|$)/.exec(url.trim());
            return res ? decodeURIComponent(res[0]) : '***';
        } catch (e) {
            return '***';
        }
    }

    async loadDocumentByUrl(url, config = null) {
        config = config || {};
        try {
            var a = document.createElement('a');
            a.href = url;
            url = a.href; // converting of a relative url to an absolute one
            this.store.dispatch(Actions.startFileLoadingAction());
            var buffer = await loadFile(url, (e) => {
                this.store.dispatch(Actions.fileLoadingProgressAction(e.loaded, e.total));
            });

            var baseUrl = new URL('./', url).href;
            config.djvuOptions = { baseUrl: baseUrl };
            await this.loadDocument(buffer, config.name || this._getFileNameFromUrl(url), config);
            // now we should process #page=some_number case
            const hash = new URL(url.toLowerCase()).hash;
            if (hash) {
                const page = /(?:page=)(\d+)$/.exec(hash);
                const pageNumber = page ? +page[1] : null;
                if (pageNumber) {
                    this.store.dispatch(Actions.setNewPageNumberAction(pageNumber, true));
                }
            }
        } catch (e) {
            this.store.dispatch(Actions.errorAction(e));
        } finally {
            this.store.dispatch(Actions.endFileLoadingAction());
        }
    }
}
