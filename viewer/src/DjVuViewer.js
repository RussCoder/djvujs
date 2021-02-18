import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './components/App.jsx';
import Actions from './actions/actions';
import configureStore from './store';
import EventEmitter from 'eventemitter3';
import Constants, { constant, ActionTypes } from './constants';
import { get } from './reducers';
import dictionaries from './locales';

const Events = constant({
    PAGE_NUMBER_CHANGED: null,
    DOCUMENT_CHANGED: null,
    DOCUMENT_CLOSED: null,
});

export default class DjVuViewer extends EventEmitter {

    static VERSION = '0.5.5';

    static Events = Events;

    static getAvailableLanguages() {
        return Object.keys(dictionaries);
    };

    /**
     * Technically, we can pass the same config as to the configure() method.
     * But all other options are reset when a new document is loaded.
     * So there is no sense to pass them into the constructor.
     */
    constructor({ language = null, uiOptions = null } = {}) {
        super();
        this.store = configureStore(this.eventMiddleware);

        if (language || uiOptions) {
            this.configure({
                language: language,
                uiOptions: uiOptions,
            });
        }
    }

    eventMiddleware = store => next => action => {
        let result;
        switch (action.type) {
            case Constants.SET_NEW_PAGE_NUMBER_ACTION:
                const oldPageNumber = this.getPageNumber();
                result = next(action);
                const newPageNumber = this.getPageNumber();
                if (oldPageNumber !== newPageNumber) {
                    this.emit(Events.PAGE_NUMBER_CHANGED);
                }
                break;

            case Constants.DOCUMENT_CREATED_ACTION:
                result = next(action);
                this.emit(Events.DOCUMENT_CHANGED);
                break;

            case Constants.CLOSE_DOCUMENT_ACTION:
                result = next(action);
                this.emit(Events.DOCUMENT_CLOSED);
                break;

            case Constants.END_FILE_LOADING_ACTION: // use in this.loadDocumentByUrl only
                result = next(action);
                this.emit(Constants.END_FILE_LOADING_ACTION);
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

    /**
     * The config object is destructed merely for the purpose of documentation
     * @param {number} pageNumber
     * @param {0|90|180|270} pageRotation
     * @param {number} pageScale
     * @param {string} language
     * @param {'dark'|'light'} theme
     * @param {{
          hideFullPageSwitch: boolean,
          changePageOnScroll: boolean,
          showContentsAutomatically: boolean,
       }} uiOptions
     * @returns {DjVuViewer}
     */
    configure({ pageNumber, pageRotation, pageScale, language, theme, uiOptions } = {}) {
        this.store.dispatch({
            type: ActionTypes.CONFIGURE,
            pageNumber, pageRotation, pageScale, language, theme, uiOptions,
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
            this.once(Constants.END_FILE_LOADING_ACTION, () => resolve());
            this.store.dispatch({
                type: ActionTypes.LOAD_DOCUMENT_BY_URL,
                url: url,
                config: config
            });
        });
    }
}
