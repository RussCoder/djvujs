import { put, select, takeLatest } from 'redux-saga/effects';
import { get } from '../reducers/rootReducer';
// import { delay } from 'redux-saga';

import Consts from "../constants/consts";
import Actions from "../actions/actions";
import PagesCache from './PagesCache';
import DjVu from '../DjVu';
import PageDataManager from './PageDataManager';
import { inExtension } from '../utils';

class RootSaga {
    constructor() {
        this.callbacks = {};

        // Firefox's extension moderators asked me not to use "content_security_policy": "script-src blob:" permission,
        // so just for them on the main page of the extension a script url should be provided manually.
        // In all other cases no libURL is required - a blob URL will be generated automatically for the worker.
        const libURL = inExtension ? document.querySelector('script#djvu_js_lib').src : undefined;
        this.djvuWorker = new DjVu.Worker(libURL);

        this.pagesCache = new PagesCache(this.djvuWorker);
        this.pageDataManager = null;
    }

    * getImageData() {
        const state = yield select();
        const currentPageNumber = get.currentPageNumber(state);
        const pagesQuantity = get.pagesQuantity(state);

        const currentPageData = yield* this.pagesCache.fetchCurrentPageByNumber(currentPageNumber, pagesQuantity);

        if (currentPageData.error) {
            yield put(Actions.pageErrorAction(currentPageData.error));
        } else {
            //console.log('put Consts.IMAGE_DATA_RECEIVED_ACTION');
            yield put({
                type: Consts.IMAGE_DATA_RECEIVED_ACTION,
                imageData: currentPageData.imageData,
                imageDpi: currentPageData.dpi
            });
        }
    }

    * fetchPageData() {
        const state = yield select();

        if (get.isContinuousScrollMode(state)) {
            yield* this.pageDataManager.startDataFetching(Date.now());
        } else {
            const isTextMode = get.isTextMode(state);
            const pageNumber = get.currentPageNumber(state);

            if (isTextMode) {
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
                type: Consts.PAGE_TEXT_FETCHED_ACTION,
                pageText: text,
                textZones: textZones
            });
        } catch (e) {
            yield put(Actions.pageErrorAction(e));
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
        this.pageDataManager = new PageDataManager(this.djvuWorker, pagesSizes.length);
        yield put(Actions.pagesSizesAreGottenAction(pagesSizes));
    }

    * createDocumentFromArrayBufferAction(action) {
        this.djvuWorker.cancelAllTasks();
        this.resetWorker();

        yield this.djvuWorker.createDocument(action.arrayBuffer, action.options);
        const [pagesQuantity, isBundled] = yield this.djvuWorker.run(
            this.djvuWorker.doc.getPagesQuantity(),
            this.djvuWorker.doc.isBundled(),
        );

        yield put({
            type: Consts.DOCUMENT_CREATED_ACTION,
            pagesQuantity: pagesQuantity,
            fileName: action.fileName,
            isIndirect: !isBundled,
        });

        if (this.callbacks['document_created']) { // for outer API
            this.callbacks['document_created']();
            delete this.callbacks['document_created'];
        }

        const state = yield select();
        this.pageDataManager = null; // we don't have to reset it, since the worker was recreated and all memory was release in any case
        if (get.isContinuousScrollMode(state)) {
            yield* this.prepareForContinuousMode();
        }

        const contents = yield this.djvuWorker.getContents();
        yield put({
            type: Consts.CONTENTS_IS_GOTTEN_ACTION,
            contents: contents
        });

        yield* this.resetCurrentPageNumber();
    }

    * resetCurrentPageNumber() {
        // set the current number to start page fetching saga
        // fetchPageData should be called via yield* directly, otherwise it won't be cancelled by takeLatest effect
        const state = yield select();
        yield put(Actions.setNewPageNumberAction(get.currentPageNumber(state), true)); // set the current number to start page fetching saga   
    }

    * setPageByUrl(action) {
        const pageNumber = yield this.djvuWorker.getPageNumberByUrl(action.url);
        if (pageNumber !== null) {
            yield put(Actions.setNewPageNumberAction(pageNumber, true));
        }
    }

    withErrorHandler(func) {
        func = func.bind(this);
        return function* (action) {
            try {
                yield* func(action);
            } catch (error) {
                console.error(error);
                yield put(Actions.errorAction(error))
            }
        }
    }

    * saveDocument() {
        const state = yield select();
        const fileName = get.fileName(state);

        if (fileName) {
            const url = yield this.djvuWorker.createDocumentUrl();
            const a = document.createElement('a');
            a.href = url;
            a.download = /\.(djv|djvu)$/.test(fileName) ? fileName : (fileName + '.djvu');
            a.dispatchEvent(new MouseEvent("click"));
        }
    }

    resetWorker() {
        this.pagesCache.resetPagesCache();
        this.djvuWorker.reset();
    }

    setCallback(action) {
        this.callbacks[action.callbackName] = action.callback;
    }

    * switchToContinuosScrollMode() {
        this.djvuWorker.cancelAllTasks();
        if (!this.pageDataManager) {
            yield* this.prepareForContinuousMode();
        }
        this.pagesCache.resetPagesCache();
        yield* this.resetCurrentPageNumber();
    }

    * switchToSinglePageMode() {
        this.djvuWorker.cancelAllTasks();
        if (this.pageDataManager) {
            yield* this.pageDataManager.reset();
        }
        yield* this.resetCurrentPageNumber();
    }

    * switchToTextMode() {
        this.djvuWorker.cancelAllTasks();
        if (this.pageDataManager) {
            yield* this.pageDataManager.reset();
        }
        yield* this.fetchPageTextIfRequired();
    }

    * updateOptions() {
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
            let options;
            if (inExtension) {
                options = yield new Promise(resolve => window.chrome.storage.local.get('djvu_js_options', resolve));
                options = options['djvu_js_options'];
            } else {
                options = localStorage.getItem('djvu_js_options');
            }

            if (options) {
                options = JSON.parse(options);
                yield put({
                    type: Consts.UPDATE_OPTIONS_ACTION,
                    payload: options,
                })
            }
        } catch (e) { }
    }

    * main() {
        yield takeLatest(Consts.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION, this.withErrorHandler(this.createDocumentFromArrayBufferAction));
        yield takeLatest(Consts.SET_NEW_PAGE_NUMBER_ACTION, this.withErrorHandler(this.fetchPageData));
        yield takeLatest(Consts.SET_PAGE_BY_URL_ACTION, this.withErrorHandler(this.setPageByUrl));
        yield takeLatest(Consts.SAVE_DOCUMENT_ACTION, this.withErrorHandler(this.saveDocument));
        yield takeLatest(Consts.CLOSE_DOCUMENT_ACTION, this.withErrorHandler(this.resetWorker));
        yield takeLatest(Consts.SET_API_CALLBACK_ACTION, this.withErrorHandler(this.setCallback));
        yield takeLatest(Consts.ENABLE_CONTINUOUS_SCROLL_MODE_ACTION, this.withErrorHandler(this.switchToContinuosScrollMode));
        yield takeLatest(Consts.ENABLE_SINGLE_PAGE_MODE_ACTION, this.withErrorHandler(this.switchToSinglePageMode));
        yield takeLatest(Consts.ENABLE_TEXT_MODE_ACTION, this.withErrorHandler(this.switchToTextMode));
        yield takeLatest(Consts.UPDATE_OPTIONS_ACTION, this.withErrorHandler(this.updateOptions));

        yield* this.withErrorHandler(this.loadOptions)();
    }
}

// a new object should be created each time in order to provide an ability to create many independent instances of the viewer
export default () => RootSaga.prototype.main.bind(new RootSaga());