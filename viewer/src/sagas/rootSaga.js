import { put, select, takeLatest } from 'redux-saga/effects';
import { get } from '../reducers/rootReducer';
// import { delay } from 'redux-saga';

import Consts from "../constants/consts";
import Actions from "../actions/actions";
import createSagaDataObject from "./sagaData";

// const tmpCanvas = document.createElement('canvas');
// const getImageDataURL = (imageData) => {
//     tmpCanvas.width = imageData.width;
//     tmpCanvas.height = imageData.height;
//     tmpCanvas.getContext('2d').putImageData(imageData, 0, 0);
//     const dataUrl = tmpCanvas.toDataURL();
//     tmpCanvas.width = tmpCanvas.height = 0; // free data
//     return dataUrl;
// };

const sagas = {
    * fetchImageDataByPageNumber(pageNumber, djvuWorker) {
        if (pageNumber !== null && (!this.pages[pageNumber] || this.pages[pageNumber].error)) {
            if (this.imageDataPromisePageNumber !== pageNumber) {
                if (this.imageDataPromise) {
                    djvuWorker.cancelAllTasks();
                }

                this.imageDataPromisePageNumber = pageNumber;
                this.imageDataPromise = djvuWorker.run(
                    djvuWorker.doc.getPage(pageNumber).getImageData(),
                    djvuWorker.doc.getPage(pageNumber).getDpi(),
                );
            }

            try {
                const [imageData, dpi] = yield this.imageDataPromise;
                this.pages[pageNumber] = { imageData, dpi };
            } catch (e) {
                this.pages[pageNumber] = { error: e };
            } finally {
                this.imageDataPromisePageNumber = null;
                this.imageDataPromise = null;
            }
        }
    },

    * getImageData() {
        const state = yield select();
        const currentPageNumber = get.currentPageNumber(state);
        const djvuWorker = get.djvuWorker(state);
        const pagesCount = get.pagesCount(state);

        const { nextPageNumber, prevPageNumber } = this.updatePagesCache(currentPageNumber, pagesCount);

        yield* this.fetchImageDataByPageNumber(currentPageNumber, djvuWorker);

        const currentPageData = this.pages[currentPageNumber];

        if (currentPageData.error) {
            yield put(Actions.pageErrorAction(currentPageData.error));
        } else {
            yield put({
                type: Consts.IMAGE_DATA_RECEIVED_ACTION,
                imageData: this.pages[currentPageNumber].imageData,
                imageDpi: this.pages[currentPageNumber].dpi
            });
        }

        if (nextPageNumber > prevPageNumber) { // when the current page is the last one. 
            yield* this.fetchImageDataByPageNumber(nextPageNumber, djvuWorker);
            yield* this.fetchImageDataByPageNumber(prevPageNumber, djvuWorker);
        } else {
            yield* this.fetchImageDataByPageNumber(prevPageNumber, djvuWorker);
            yield* this.fetchImageDataByPageNumber(nextPageNumber, djvuWorker);
        }

        // yield delay(1000);
        // const dataUrl = getImageDataURL(imageData);
        // yield put(Actions.dataUrlCreatedAction(dataUrl));
    },

    * fetchPageData() {
        const state = yield select();
        const isTextMode = get.isTextMode(state);
        const djvuWorker = get.djvuWorker(state);
        const pageNumber = get.currentPageNumber(state);

        if (isTextMode) {
            djvuWorker.cancelAllTasks();
            this.imageDataPromisePageNumber = null;
            this.imageDataPromise = null;
            yield* this.fetchPageText(pageNumber);
        }

        yield* this.getImageData();
        yield* this.fetchPageText(pageNumber);
    },

    * fetchPageText(pageNumber) {
        const state = yield select();
        const djvuWorker = get.djvuWorker(state);

        try {
            const [text, textZones] = yield djvuWorker.run(
                djvuWorker.doc.getPage(pageNumber).getText(),
                djvuWorker.doc.getPage(pageNumber).getNormalizedTextZones(),
            );

            yield put({
                type: Consts.PAGE_TEXT_FETCHED_ACTION,
                pageText: text,
                textZones: textZones
            });
        } catch (e) {
            yield put(Actions.pageErrorAction(e));
        }
    },

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
    },

    * createDocumentFromArrayBufferAction(action) {
        const state = yield select();
        const djvuWorker = get.djvuWorker(state);

        djvuWorker.cancelAllTasks();
        this.resetPagesCache();

        yield djvuWorker.createDocument(action.arrayBuffer, action.options);
        const pagesCount = yield djvuWorker.getPageCount();
        yield put({
            type: Consts.DOCUMENT_CREATED_ACTION,
            pagesCount: pagesCount,
            fileName: action.fileName
        });

        if (this.callbacks['document_created']) {
            this.callbacks['document_created']();
            delete this.callbacks['document_created'];
        }

        const contents = yield djvuWorker.getContents();
        yield put({
            type: Consts.CONTENTS_IS_GOTTEN_ACTION,
            contents: contents
        });

        yield* this.fetchPageData();
    },

    * setPageByUrl(action) {
        const state = yield select();
        const djvuWorker = get.djvuWorker(state);

        const pageNumber = yield djvuWorker.getPageNumberByUrl(action.url);
        if (pageNumber !== null) {
            yield put(Actions.setNewPageNumberAction(pageNumber));
        }
    },

    withErrorHandler(func) {
        func = func.bind(this);
        return function* (action) {
            try {
                yield* func(action);
            } catch (error) {
                yield put(Actions.errorAction(error))
            }
        }
    },

    * saveDocument() {
        const state = yield select();
        const djvuWorker = get.djvuWorker(state);
        const fileName = get.fileName(state);

        if (fileName) {
            const url = yield djvuWorker.createDocumentUrl();
            const a = document.createElement('a');
            a.href = url;
            a.download = /\.(djv|djvu)$/.test(fileName) ? fileName : (fileName + '.djvu');
            a.dispatchEvent(new MouseEvent("click"));
        }
    },

    * resetWorker() {
        const state = yield select();
        const djvuWorker = get.djvuWorker(state);
        this.resetPagesCache();
        djvuWorker.reset();
    },

    setCallback(action) {
        this.callbacks[action.callbackName] = action.callback;
    },
};

function* rootSaga() {
    yield takeLatest(Consts.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION, this.withErrorHandler(this.createDocumentFromArrayBufferAction));
    yield takeLatest(Consts.TOGGLE_TEXT_MODE_ACTION, this.withErrorHandler(this.fetchPageTextIfRequired));
    yield takeLatest(Consts.SET_NEW_PAGE_NUMBER_ACTION, this.withErrorHandler(this.fetchPageData));
    yield takeLatest(Consts.SET_PAGE_BY_URL_ACTION, this.withErrorHandler(this.setPageByUrl));
    yield takeLatest(Consts.SAVE_DOCUMENT_ACTION, this.withErrorHandler(this.saveDocument));
    yield takeLatest(Consts.CLOSE_DOCUMENT_ACTION, this.withErrorHandler(this.resetWorker));
    yield takeLatest(Consts.SET_API_CALLBACK_ACTION, this.withErrorHandler(this.setCallback));
}

// all sagas and data are packed into a single object in order to provide an ability to create many independent instances of the viewer
export default () => rootSaga.bind({ ...createSagaDataObject(), ...sagas });