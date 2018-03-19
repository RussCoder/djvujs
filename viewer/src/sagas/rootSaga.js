import { put, select, takeLatest } from 'redux-saga/effects';
// import { delay } from 'redux-saga';

import Consts from "../constants/consts";
// import Actions from "../actions/actions"

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
    const { isTextMode } = yield select();
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

export default function* rootSaga() {
    yield takeLatest(Consts.RENDER_CURRENT_PAGE_ACTION, getImageData);
    yield takeLatest(Consts.TOGGLE_TEXT_MODE_ACTION, fetchPageTextIfRequired);
    yield takeLatest(Consts.SET_NEW_PAGE_NUMBER_ACTION, fetchPageData)
}