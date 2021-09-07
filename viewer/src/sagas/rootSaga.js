/**
 * All side-effect logic is here (all logic which isn't related directly to the UI)
 */
import contentDisposition from 'content-disposition';
import { put, select, takeLatest, take, cancel, fork } from 'redux-saga/effects';
import { get } from '../reducers';
// import { delay } from 'redux-saga';

import Constants, { ActionTypes } from '../constants';
import Actions from "../actions/actions";
import PagesCache from './PagesCache';
import DjVu from '../DjVu';
import ContinuousScrollManager from './ContinuousScrollManager';
import { normalizeFileName, inExtension } from '../utils';
import { loadFile } from '../utils';
import dictionaries from "../locales";
import { createTranslator } from "../components/Translation";
import PrintManager from './PrintManager';
import PageStorage from "./PageStorage";

class RootSaga {
    constructor(dispatch) {
        this.dispatch = dispatch;
        this.callbacks = {};

        // Firefox's extension moderators asked me not to use "content_security_policy": "script-src blob:" permission,
        // so just for them on the main page of the extension a script url should be provided manually.
        // In all other cases no libURL is required - a blob URL will be generated automatically for the worker.
        const libURL = inExtension ? document.querySelector('script#djvu_js_lib').src : undefined;
        this.djvuWorker = new DjVu.Worker(libURL);

        // it's needed to recreate the worker when the bundle() operation is cancelled (but save the document),
        // because bundle() may take quite a while, if there are many pages in the document.
        this.isBundling = false;
        this.documentContructorData = null;

        this.pageStorage = new PageStorage();
        this.pagesCache = new PagesCache(this.djvuWorker);
        this.printManager = new PrintManager(this.djvuWorker, this.pageStorage);
        this.printTask = null;
        this.continuousScrollManager = null;
    }

    * getImageData() {
        const state = yield select();
        const currentPageNumber = get.currentPageNumber(state);
        const pagesQuantity = get.pagesQuantity(state);

        const currentPageData = yield* this.pagesCache.fetchCurrentPageByNumber(currentPageNumber, pagesQuantity);

        if (currentPageData.error) {
            yield put({ type: ActionTypes.SET_IMAGE_PAGE_ERROR, payload: currentPageData.error });
        } else {
            //console.log('put Consts.IMAGE_DATA_RECEIVED_ACTION');
            yield put({
                type: Constants.IMAGE_DATA_RECEIVED_ACTION,
                imageData: currentPageData.imageData,
                imageDpi: currentPageData.dpi
            });
        }
    }

    * fetchPageData() {
        const state = yield select();
        const viewMode = get.viewMode(state);

        if (viewMode === Constants.CONTINUOUS_SCROLL_MODE) {
            yield* this.continuousScrollManager.startDataFetching();
        } else {
            const pageNumber = get.currentPageNumber(state);

            if (viewMode === Constants.TEXT_MODE) {
                this.pagesCache.cancelCachingTask();
                this.djvuWorker.cancelAllTasks();
                yield* this.fetchPageText(pageNumber);
            }

            yield* this.getImageData();
            yield* this.fetchPageText(pageNumber);
        }
    }

    * fetchPageText(pageNumber) {
        try {
            //console.log('text ', pageNumber);
            const [text, textZones] = yield this.djvuWorker.run(
                this.djvuWorker.doc.getPage(pageNumber).getText(),
                this.djvuWorker.doc.getPage(pageNumber).getNormalizedTextZones(),
            );

            yield put({
                type: Constants.PAGE_TEXT_FETCHED_ACTION,
                pageText: text,
                textZones: textZones
            });
        } catch (e) {
            yield put({ type: ActionTypes.SET_TEXT_PAGE_ERROR, payload: e });
        }
    }

    * fetchPageTextIfRequired() {
        const state = yield select();
        const currentPageNumber = get.currentPageNumber(state);
        const pageText = get.pageText(state);

        if (pageText !== null) {
            return; // already fetched
        }

        yield* this.fetchPageText(currentPageNumber);
    }

    * prepareForContinuousMode() {
        const pagesSizes = yield this.djvuWorker.doc.getPagesSizes().run();
        this.continuousScrollManager = new ContinuousScrollManager(this.djvuWorker, pagesSizes.length, this.pageStorage);
        yield put(Actions.pagesSizesAreGottenAction(pagesSizes));
    }

    * configure({ pageNumber, pageRotation, pageScale, language, theme, uiOptions }) {
        if (pageNumber) yield put(Actions.setNewPageNumberAction(pageNumber, true));
        if (pageRotation) yield put(Actions.setPageRotationAction(pageRotation));
        if (pageScale) yield put(Actions.setUserScaleAction(pageScale));
        if (uiOptions) yield put({
            type: ActionTypes.SET_UI_OPTIONS,
            payload: uiOptions,
        });

        const options = {};
        if (language) {
            if (language in dictionaries) {
                options.locale = language;
            } else {
                console.warn(`DjVu.js Viewer: only ${Object.keys(dictionaries)} languages are available! Got ${language}`);
            }
        }
        if (theme) {
            if (theme === 'dark' || theme === 'light') {
                options.theme = theme;
            } else {
                console.warn('DjVu.js Viewer: only "dark" or "light" themes are supported! Got ' + theme);
            }
        }

        if (Object.keys(options).length) {
            yield put({
                type: ActionTypes.UPDATE_OPTIONS,
                payload: options,
                notSave: true,
            });
        }
    }

    * createDocumentFromArrayBuffer({ arrayBuffer, fileName, config }) {
        this.resetWorkerAndStorages();

        this.documentContructorData = {
            buffer: arrayBuffer.slice(0),
            options: config && config.djvuOptions,
        };
        yield this.djvuWorker.createDocument(arrayBuffer, config && config.djvuOptions);
        const [pagesQuantity, isBundled] = yield this.djvuWorker.run(
            this.djvuWorker.doc.getPagesQuantity(),
            this.djvuWorker.doc.isBundled(),
        );
        if (isBundled) {
            this.documentContructorData = null;
        }

        yield put({
            type: Constants.DOCUMENT_CREATED_ACTION,
            pagesQuantity: pagesQuantity,
            fileName: fileName,
            isIndirect: !isBundled,
        });

        // perhaps it's better to configure the viewer before DOCUMENT_CREATED_ACTION 
        // (since the promise of the viewer.loadDocument is resolved on this action)
        // But currently DOCUMENT_CREATED_ACTION reset the state of the viewer, so the configuration is done after it.
        // The optimal variant is to resolve the promise on another action, but I'm not sure is it needed to anybody at all.
        if (config) {
            yield* this.configure(config);
        }

        const state = yield select();
        this.continuousScrollManager = null; // we don't have to reset it, since the worker was recreated and all memory was release in any case
        if (get.viewMode(state) === Constants.CONTINUOUS_SCROLL_MODE) {
            yield* this.prepareForContinuousMode();
        }

        const contents = yield this.djvuWorker.doc.getContents().run();
        yield put({
            type: Constants.CONTENTS_IS_GOTTEN_ACTION,
            contents: contents
        });

        yield* this.resetCurrentPageNumber();
    }

    * resetCurrentPageNumber() {
        // set the current number to start page fetching saga
        // fetchPageData shouldn't be called via yield* directly, otherwise it won't be cancelled by takeLatest effect
        const state = yield select();
        yield put(Actions.setNewPageNumberAction(get.currentPageNumber(state), true)); // set the current number to start page fetching saga
    }

    * setPageByUrl(action) {
        const url = action.url;
        if (url && url[0] !== '#') { // urls can be empty strings sometimes
            // right now the constructor options are saved for indirect documents only
            const data = this.documentContructorData;
            const baseUrl = data && data.options && data.options.baseUrl;
            const absoluteUrl = (
                /^https?:\/\/.+/.test(url) ? url :
                    baseUrl ? new URL(url, baseUrl).href :
                        !inExtension ? new URL(url, location.href) : null
            );

            if (absoluteUrl) {
                if (inExtension) {
                    chrome.runtime.sendMessage({ command: 'open_viewer_tab', url: absoluteUrl });
                } else {
                    const t = createTranslator(yield select(get.dictionary));
                    if (confirm(t('The link points to another document. Do you want to proceed?'))) {
                        yield put({
                            type: ActionTypes.LOAD_DOCUMENT_BY_URL,
                            url: absoluteUrl,
                        })
                    }
                }
                return;
            }
        }

        const pageNumber = yield this.djvuWorker.doc.getPageNumberByUrl(action.url).run();
        if (pageNumber !== null) {
            yield put(Actions.setNewPageNumberAction(pageNumber, true));
            if (action.closeContentsOnSuccess) {
                yield put({ type: ActionTypes.CLOSE_CONTENTS });
            }
        }
    }

    withErrorHandler(func) {
        func = func.bind(this);
        return function* (action) {
            try {
                const gen = func(action);
                if (gen && gen.next) yield* gen;
            } catch (error) {
                yield put(Actions.errorAction(error))
            }
        }
    }

    * saveDocument() {
        const state = yield select();
        const fileName = get.fileName(state);

        if (fileName) {
            const url = yield this.djvuWorker.doc.createObjectURL().run();
            const a = document.createElement('a');
            a.href = url;
            a.download = normalizeFileName(fileName);
            a.dispatchEvent(new MouseEvent("click"));
        }
    }

    resetWorkerAndStorages() {
        this.pageStorage.reset();
        this.pagesCache.resetPagesCache();
        this.djvuWorker.reset();
        this.isBundling = false;
        this.documentContructorData = null;
    }

    setCallback(action) {
        this.callbacks[action.callbackName] = action.callback;
    }

    * switchToContinuousScrollMode() {
        this.djvuWorker.cancelAllTasks();
        if (!this.continuousScrollManager) {
            yield* this.prepareForContinuousMode();
        }
        this.pagesCache.resetPagesCache();
        yield* this.resetCurrentPageNumber();
        yield put({ type: ActionTypes.UPDATE_OPTIONS, payload: { preferContinuousScroll: true } });
    }

    * switchToSinglePageMode() {
        this.djvuWorker.cancelAllTasks();
        if (this.continuousScrollManager) {
            yield* this.continuousScrollManager.reset();
        }
        yield* this.resetCurrentPageNumber();
        yield put({ type: ActionTypes.UPDATE_OPTIONS, payload: { preferContinuousScroll: false } });
    }

    * switchToTextMode() {
        this.djvuWorker.cancelAllTasks();
        if (this.continuousScrollManager) {
            yield* this.continuousScrollManager.reset();
        }
        yield* this.fetchPageTextIfRequired();
    }

    * updateOptions(action) {
        if (action.notSave) return;

        const state = yield select();
        const options = get.options(state);

        if (inExtension) {
            yield new Promise(resolve => window.chrome.storage.local.set({ 'djvu_js_options': JSON.stringify(options) }, resolve));
        } else {
            localStorage.setItem('djvu_js_options', JSON.stringify(options));
        }
    }

    * loadOptions() {
        try {
            let options = {};
            if (inExtension) {
                options = yield new Promise(resolve => window.chrome.storage.local.get('djvu_js_options', resolve));
                options = options['djvu_js_options'];
            } else {
                options = localStorage.getItem('djvu_js_options');
            }

            try {
                options = options ? JSON.parse(options) : {};
            } catch (e) {
                options = {};
            }

            if (!options.locale) {
                for (const code of navigator.languages) {
                    const shortCode = code.slice(0, 2);
                    if (shortCode in dictionaries) {
                        options.locale = shortCode;
                        break;
                    }
                }
            }

            if (Object.keys(options).length) {
                yield put({
                    type: ActionTypes.UPDATE_OPTIONS,
                    payload: options,
                    notSave: true,
                });
            }
        } catch (e) { }
    }

    * loadDocumentByUrl({ url, config }) {
        config = config || {};

        const getFileNameFromUrl = (url) => {
            try {
                const res = /[^/#]*(?=#|$)/.exec(url.trim());
                return res ? decodeURIComponent(res[0]) : '***';
            } catch (e) {
                return '***';
            }
        };

        try {
            const a = document.createElement('a');
            a.href = url;
            url = a.href; // converting of a relative url to an absolute one
            yield put(Actions.startFileLoadingAction());

            const xhr = yield loadFile(url, (e) => {
                this.dispatch(Actions.fileLoadingProgressAction(e.loaded, e.total));
            });
            const { response: buffer, responseURL } = xhr;

            // Try to get file name from Content-Disposition header if it's there
            const cdHeader = xhr.getResponseHeader('Content-Disposition');
            if (cdHeader) {
                const parsedCd = contentDisposition.parse(cdHeader);
                if (parsedCd.parameters.filename) {
                    config.name = parsedCd.parameters.filename;
                }
            }

            // responseUrl is the URL after all redirects
            config.djvuOptions = { baseUrl: new URL('./', responseURL).href };
            yield* this.createDocumentFromArrayBuffer({
                arrayBuffer: buffer,
                fileName: config.name === undefined ? getFileNameFromUrl(url) : config.name,
                config: config
            });

            // now we should process #page=page_number and ?page=page_number
            const urlObject = new URL(url.toLowerCase());
            const pageNumber = +urlObject.searchParams.get('page') || +new URLSearchParams(urlObject.hash).get('#page');

            if (pageNumber) {
                yield put(Actions.setNewPageNumberAction(pageNumber, true));
            }
        } catch (e) {
            yield put(Actions.errorAction(e));
        } finally {
            yield put(Actions.endFileLoadingAction());
        }
    }

    * bundleDocument() {
        try {
            this.djvuWorker.cancelAllTasks();
            this.isBundling = true;
            const buffer = yield this.djvuWorker.doc.bundle(progress => {
                this.dispatch({
                    type: ActionTypes.UPDATE_FILE_PROCESSING_PROGRESS,
                    payload: progress,
                });
            }).run();
            yield put({
                type: ActionTypes.FINISH_TO_BUNDLE,
                payload: buffer,
            });
        } finally {
            this.isBundling = false;
        }
    }

    * hardReloadIfRequired() {
        if (this.isBundling && this.documentContructorData) {
            this.djvuWorker.reset();
            this.isBundling = false;
            yield this.djvuWorker.createDocument(
                this.documentContructorData.buffer.slice(0),
                this.documentContructorData.options
            );
            //console.warn('HARD RELOAD');
            yield* this.resetCurrentPageNumber();
        }
    }

    * preparePagesForPrinting(action) {
        const { from, to } = action.payload;
        this.printTask = yield fork(this.printManager.preparePagesForPrinting.bind(this.printManager), from, to);
    }

    * cancelPrintTaskIfRequired() {
        if (this.printTask) {
            this.printTask.cancel();
            this.printTask = null;
            const viewMode = yield select(get.viewMode);
            if (viewMode !== Constants.CONTINUOUS_SCROLL_MODE) {
                // in the continuous scroll mode redundant pages will be removed automatically
                this.pageStorage.removeAllPages();
            }
            yield* this.resetCurrentPageNumber();
        }
    }

    * main() {
        yield takeLatest(Constants.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION, this.withErrorHandler(this.createDocumentFromArrayBuffer));
        yield takeLatest(Constants.SET_NEW_PAGE_NUMBER_ACTION, this.withErrorHandler(this.fetchPageData));
        yield takeLatest(Constants.SET_PAGE_BY_URL_ACTION, this.withErrorHandler(this.setPageByUrl));
        yield takeLatest(ActionTypes.SAVE_DOCUMENT, this.withErrorHandler(this.saveDocument));
        yield takeLatest(Constants.CLOSE_DOCUMENT_ACTION, this.withErrorHandler(this.resetWorkerAndStorages));
        yield takeLatest(Constants.SET_API_CALLBACK_ACTION, this.withErrorHandler(this.setCallback));
        yield takeLatest(Constants.ENABLE_CONTINUOUS_SCROLL_MODE_ACTION, this.withErrorHandler(this.switchToContinuousScrollMode));
        yield takeLatest(Constants.ENABLE_SINGLE_PAGE_MODE_ACTION, this.withErrorHandler(this.switchToSinglePageMode));
        yield takeLatest(Constants.ENABLE_TEXT_MODE_ACTION, this.withErrorHandler(this.switchToTextMode));
        yield takeLatest(ActionTypes.UPDATE_OPTIONS, this.withErrorHandler(this.updateOptions));
        yield takeLatest(ActionTypes.CONFIGURE, this.withErrorHandler(this.configure));
        yield takeLatest(ActionTypes.LOAD_DOCUMENT_BY_URL, this.loadDocumentByUrl.bind(this));

        yield takeLatest(ActionTypes.START_TO_BUNDLE, this.withErrorHandler(this.bundleDocument));
        yield takeLatest([
                ActionTypes.ERROR,
                ActionTypes.CLOSE_SAVE_DIALOG,
            ],
            this.withErrorHandler(this.hardReloadIfRequired)
        );

        yield takeLatest([
                ActionTypes.ERROR,
                ActionTypes.CLOSE_PRINT_DIALOG,
            ], this.withErrorHandler(this.cancelPrintTaskIfRequired)
        );

        yield takeLatest(ActionTypes.PREPARE_PAGES_FOR_PRINTING, this.withErrorHandler(this.preparePagesForPrinting));

        yield* this.withErrorHandler(this.loadOptions)();

        yield take(ActionTypes.DESTROY);
        this.djvuWorker.terminate();
        // actually it's not needed since, all URLs will be revoked when the worker is terminated
        // this.pageStorage.removeAllPages();
        yield cancel();
    }
}

// a new object should be created each time in order to provide an ability to create many independent instances of the viewer
export default (dispatch) => RootSaga.prototype.main.bind(new RootSaga(dispatch));