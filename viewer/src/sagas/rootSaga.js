import { put, select, takeLatest } from 'redux-saga/effects';
import { get } from '../reducers/rootReducer';
// import { delay } from 'redux-saga';

import Consts from "../constants/consts";
import Actions from "../actions/actions";

// const tmpCanvas = document.createElement('canvas');
// const getImageDataURL = (imageData) => {
//     tmpCanvas.width = imageData.width;
//     tmpCanvas.height = imageData.height;
//     tmpCanvas.getContext('2d').putImageData(imageData, 0, 0);
//     const dataUrl = tmpCanvas.toDataURL();
//     tmpCanvas.width = tmpCanvas.height = 0; // free data
//     return dataUrl;
// };

function* getImageData() {
    const state = yield select();
    const currentPageNumber = get.currentPageNumber(state);
    const djvuWorker = get.djvuWorker(state);

    const obj = yield djvuWorker.getPageImageDataWithDpi(currentPageNumber);

    yield put({
        type: Consts.IMAGE_DATA_RECEIVED_ACTION,
        imageData: obj.imageData,
        imageDPI: obj.dpi
    });

    // yield delay(1000);
    // const dataUrl = getImageDataURL(imageData);
    // yield put(Actions.dataUrlCreatedAction(dataUrl));
}

function* fetchPageData(action) {
    const state = yield select();
    const isTextMode = get.isTextMode(state);
    const djvuWorker = get.djvuWorker(state);

    djvuWorker.cancelAllTasks();
    const pageNumber = action.pageNumber;

    if (isTextMode) {
        yield* fetchPageText(pageNumber);
    }

    yield* getImageData();
}

function* fetchPageText(pageNumber) {
    const state = yield select();
    const djvuWorker = get.djvuWorker(state);

    const text = yield djvuWorker.getPageText(pageNumber);

    yield put({
        type: Consts.PAGE_TEXT_FETCHED_ACTION,
        pageText: text
    });
}

function* fetchPageTextIfRequired(action) {
    if (!action.isTextMode) {
        return;
    }

    const state = yield select();
    const currentPageNumber = get.currentPageNumber(state);
    const pageText = get.pageText(state);

    if (pageText !== null) {
        return; // already fetched
    }

    yield* fetchPageText(currentPageNumber);
}

function* createDocumentFromArrayBufferAction(action) {
    const state = yield select();
    const djvuWorker = get.djvuWorker(state);

    yield djvuWorker.createDocument(action.arrayBuffer);
    const pagesCount = yield djvuWorker.getPageCount();
    yield put({
        type: Consts.DOCUMENT_CREATED_ACTION,
        pagesCount: pagesCount,
        fileName: action.fileName
    });

    const contents = yield djvuWorker.getContents();
    yield put({
        type: Consts.CONTENTS_IS_GOTTEN_ACTION,
        contents: contents
    });

    yield* getImageData();
}

function* setPageByUrl(action) {
    const state = yield select();
    const djvuWorker = get.djvuWorker(state);

    const pageNumber = yield djvuWorker.getPageNumberByUrl(action.url);
    if (pageNumber !== null) {
        yield put(Actions.setNewPageNumberAction(pageNumber));
    }
}

function withErrorHandler(func) {
    return function* (action) {
        try {
            yield* func(action);
        } catch (error) {
            yield put(Actions.errorAction(error))
        }
    }
}

function* saveDocument() {
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
}

export default function* rootSaga() {
    yield takeLatest(Consts.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION, withErrorHandler(createDocumentFromArrayBufferAction));
    yield takeLatest(Consts.TOGGLE_TEXT_MODE_ACTION, withErrorHandler(fetchPageTextIfRequired));
    yield takeLatest(Consts.SET_NEW_PAGE_NUMBER_ACTION, withErrorHandler(fetchPageData));
    yield takeLatest(Consts.SET_PAGE_BY_URL_ACTION, withErrorHandler(setPageByUrl));
    yield takeLatest(Consts.SAVE_DOCUMENT_ACTION, withErrorHandler(saveDocument));
}