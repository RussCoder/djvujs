import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './components/App.jsx';
import Actions from './actions/actions';
import configureStore from './store';
import EventEmitter from 'eventemitter3';
import Consts, { constant } from './constants/consts';
import { get } from './reducers';
import { ActionTypes } from './constants/index.js';
import dictionaries from './locales';

const Events = constant({
    PAGE_NUMBER_CHANGED: null,
    DOCUMENT_CHANGED: null,
    DOCUMENT_CLOSED: null,
});

export default class DjVuViewer extends EventEmitter {

    static VERSION = '0.5.0';

    static Events = Events;

    static getAvailableLanguages() {
        return Object.keys(dictionaries);
    };

    constructor({ language = null } = {}) {
        super();
        this.store = configureStore(this.eventMiddleware);

        if (language) {
            this.configure({ language: language });
        }

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

            case Consts.END_FILE_LOADING_ACTION: // use in this.loadDocumentByUrl only
                result = next(action);
                this.emit(Consts.END_FILE_LOADING_ACTION);
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

    configure({ pageNumber, pageRotation, pageScale, language, theme } = {}) {
        this.store.dispatch({
            type: ActionTypes.CONFIGURE,
            pageNumber, pageRotation, pageScale, language, theme,
        });

        return this;
    }

    loadDocument(buffer, name = "***", config = {}) {
        return new Promise(resolve => {
            this.once(Events.DOCUMENT_CHANGED, () => resolve());
            // the buffer is transferred to the worker, so we copy it 
            this.store.dispatch(Actions.createDocumentFromArrayBufferAction(buffer.slice(0), name, config));
        });
    }

    loadDocumentByUrl(url, config = null) {
        return new Promise(resolve => {
            this.once(Consts.END_FILE_LOADING_ACTION, () => resolve());
            this.store.dispatch({
                type: ActionTypes.LOAD_DOCUMENT_BY_URL,
                url: url,
                config: config
            });
        });
    }
}
