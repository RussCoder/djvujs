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

let pages = {};
let imageDataPromise = null;
let imageDataPromisePageNumber = null;

function updatePagesCache(currentPageNumber, pagesCount) {
    const newPages = {
        [currentPageNumber]: pages[currentPageNumber]
    };
    let nextPageNumber = null, prevPageNumber = null;

    if (currentPageNumber + 1 <= pagesCount) {
        nextPageNumber = currentPageNumber + 1;
        newPages[nextPageNumber] = pages[nextPageNumber];
    } else if (currentPageNumber - 2 > 0) {
        nextPageNumber = currentPageNumber - 2;
        newPages[nextPageNumber] = pages[nextPageNumber];
    }

    if (currentPageNumber - 1 > 0) {
        prevPageNumber = currentPageNumber - 1;
        newPages[currentPageNumber - 1] = pages[currentPageNumber - 1];
    } else if (currentPageNumber + 2 <= pagesCount) {
        prevPageNumber = currentPageNumber + 2;
        newPages[prevPageNumber] = pages[prevPageNumber];
    }

    pages = newPages;

    return { prevPageNumber, nextPageNumber };
}

function* fetchImageDataByPageNumber(pageNumber, djvuWorker) {
    if (pageNumber !== null & !pages[pageNumber]) {
        if (imageDataPromisePageNumber !== pageNumber) {
            if (imageDataPromise) {
                djvuWorker.cancelAllTasks();
            }

            imageDataPromisePageNumber = pageNumber;
            imageDataPromise = djvuWorker.run(
                djvuWorker.doc.getPage(pageNumber).getImageData(),
                djvuWorker.doc.getPage(pageNumber).getDpi(),
            );
        }

        const [imageData, dpi] = yield imageDataPromise;
        pages[pageNumber] = { imageData, dpi };
        imageDataPromisePageNumber = null;
        imageDataPromise = null;
    }
}

function* getImageData() {
    const state = yield select();
    const currentPageNumber = get.currentPageNumber(state);
    const djvuWorker = get.djvuWorker(state);
    const pagesCount = get.pagesCount(state);

    const { nextPageNumber, prevPageNumber } = updatePagesCache(currentPageNumber, pagesCount);

    yield* fetchImageDataByPageNumber(currentPageNumber, djvuWorker);

    yield put({
        type: Consts.IMAGE_DATA_RECEIVED_ACTION,
        imageData: pages[currentPageNumber].imageData,
        imageDpi: pages[currentPageNumber].dpi
    });

    if (nextPageNumber > prevPageNumber) { // when the current page is the last one. 
        yield* fetchImageDataByPageNumber(nextPageNumber, djvuWorker);
        yield* fetchImageDataByPageNumber(prevPageNumber, djvuWorker);
    } else {
        yield* fetchImageDataByPageNumber(prevPageNumber, djvuWorker);
        yield* fetchImageDataByPageNumber(nextPageNumber, djvuWorker);
    }

    // yield delay(1000);
    // const dataUrl = getImageDataURL(imageData);
    // yield put(Actions.dataUrlCreatedAction(dataUrl));
}

function* fetchPageData() {
    const state = yield select();
    const isTextMode = get.isTextMode(state);
    const djvuWorker = get.djvuWorker(state);
    const pageNumber = get.currentPageNumber(state);

    if (isTextMode) {
        djvuWorker.cancelAllTasks();
        imageDataPromisePageNumber = null;
        imageDataPromise = null;
        yield* fetchPageText(pageNumber);
    }

    yield* getImageData();
    yield* fetchPageText(pageNumber);
}

function* fetchPageText(pageNumber) {
    const state = yield select();
    const djvuWorker = get.djvuWorker(state);

    const [text, textZones] = yield djvuWorker.run(
        djvuWorker.doc.getPage(pageNumber).getText(),
        djvuWorker.doc.getPage(pageNumber).getNormalizedTextZones(),
    );

    yield put({
        type: Consts.PAGE_TEXT_FETCHED_ACTION,
        pageText: text,
        textZones: textZones
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

    djvuWorker.cancelAllTasks();
    pages = {};
    imageDataPromise = null;
    imageDataPromisePageNumber = null;

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

    yield* fetchPageData();
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