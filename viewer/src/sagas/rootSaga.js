import { put, select, takeLatest } from 'redux-saga/effects';
import { get } from '../reducers/rootReducer';
// import { delay } from 'redux-saga';

import Consts from "../constants/consts";
import Actions from "../actions/actions";
import PagesCache from './PagesCache';
import DjVu from '../DjVu';

class RootSaga {
    constructor() {
        this.callbacks = {};
        this.djvuWorker = new DjVu.Worker();
        this.pagesCache = new PagesCache(this.djvuWorker);
    }

    * getImageData() {
        const state = yield select();
        const currentPageNumber = get.currentPageNumber(state);
        const pagesCount = get.pagesCount(state);

        const currentPageData = yield* this.pagesCache.fetchCurrentPageByNumber(currentPageNumber, pagesCount);

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

    * fetchPageTextIfRequired(action) {
        if (!action.isTextMode) {
            return;
        }

        const state = yield select();
        const currentPageNumber = get.currentPageNumber(state);
        const pageText = get.pageText(state);

        if (pageText !== null) {
            return; // already fetched
        }

        yield* this.fetchPageText(currentPageNumber);
    }

    * createDocumentFromArrayBufferAction(action) {
        this.djvuWorker.cancelAllTasks();
        this.pagesCache.resetPagesCache();

        yield this.djvuWorker.createDocument(action.arrayBuffer, action.options);
        const pagesCount = yield this.djvuWorker.getPageCount();
        yield put({
            type: Consts.DOCUMENT_CREATED_ACTION,
            pagesCount: pagesCount,
            fileName: action.fileName
        });

        if (this.callbacks['document_created']) {
            this.callbacks['document_created']();
            delete this.callbacks['document_created'];
        }

        const contents = yield this.djvuWorker.getContents();
        yield put({
            type: Consts.CONTENTS_IS_GOTTEN_ACTION,
            contents: contents
        });

        yield* this.fetchPageData();
    }

    * setPageByUrl(action) {
        const pageNumber = yield this.djvuWorker.getPageNumberByUrl(action.url);
        if (pageNumber !== null) {
            yield put(Actions.setNewPageNumberAction(pageNumber));
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

    * main() {
        yield takeLatest(Consts.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION, this.withErrorHandler(this.createDocumentFromArrayBufferAction));
        yield takeLatest(Consts.TOGGLE_TEXT_MODE_ACTION, this.withErrorHandler(this.fetchPageTextIfRequired));
        yield takeLatest(Consts.SET_NEW_PAGE_NUMBER_ACTION, this.withErrorHandler(this.fetchPageData));
        yield takeLatest(Consts.SET_PAGE_BY_URL_ACTION, this.withErrorHandler(this.setPageByUrl));
        yield takeLatest(Consts.SAVE_DOCUMENT_ACTION, this.withErrorHandler(this.saveDocument));
        yield takeLatest(Consts.CLOSE_DOCUMENT_ACTION, this.withErrorHandler(this.resetWorker));
        yield takeLatest(Consts.SET_API_CALLBACK_ACTION, this.withErrorHandler(this.setCallback));
    }
}

// a new object should be created each time in order to provide an ability to create many independent instances of the viewer
export default () => RootSaga.prototype.main.bind(new RootSaga());