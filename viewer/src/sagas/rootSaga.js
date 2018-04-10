import { put, select, takeLatest } from 'redux-saga/effects';
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
    const { currentPageNumber, djvuWorker } = yield select();
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
    const { isTextMode, djvuWorker } = yield select();
    djvuWorker.cancelAllTasks();
    const pageNumber = action.pageNumber;

    if (isTextMode) {
        yield* fetchPageText(pageNumber);
    }

    yield* getImageData();
}

function* fetchPageText(pageNumber) {
    const { djvuWorker } = yield select();
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

    const { currentPageNumber, pageText } = yield select();

    if (pageText !== null) {
        return; // already fetched
    }

    yield* fetchPageText(currentPageNumber);
}

function* createDocumentFromArrayBufferAction(action) {
    const { djvuWorker } = yield select();
    try {
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
    } catch (error) {
        yield put(Actions.errorAction(error));
    }
}

function* setPageByUrl(action) {
    const { djvuWorker } = yield select();
    const pageNumber = yield djvuWorker.getPageNumberByUrl(action.url);
    if (pageNumber !== null) {
        yield put(Actions.setNewPageNumberAction(pageNumber));
    }
}

export default function* rootSaga() {
    yield takeLatest(Consts.CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION, createDocumentFromArrayBufferAction);
    yield takeLatest(Consts.TOGGLE_TEXT_MODE_ACTION, fetchPageTextIfRequired);
    yield takeLatest(Consts.SET_NEW_PAGE_NUMBER_ACTION, fetchPageData);
    yield takeLatest(Consts.SET_PAGE_BY_URL_ACTION, setPageByUrl);
}