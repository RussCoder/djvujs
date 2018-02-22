import { put, select, takeLatest } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import Consts from "../constants/consts";
import Actions from "../actions/actions"

const tmpCanvas = document.createElement('canvas');
const getImageDataURL = (imageData) => {
    tmpCanvas.width = imageData.width;
    tmpCanvas.height = imageData.height;
    tmpCanvas.getContext('2d').putImageData(imageData, 0, 0);
    const dataUrl = tmpCanvas.toDataURL();
    tmpCanvas.width = tmpCanvas.height = 0; // free data
    return dataUrl;
};

function* createImageDataUrl(action) {
    const { currentPageNumber, djvuWorker } = yield select();
    const obj = yield djvuWorker.getPageImageDataWithDpi(currentPageNumber);
    const imageData = obj.imageData;

    yield put({
        type: Consts.IMAGE_DATA_RECEIVED_ACTION,
        imageData: obj.imageData,
        imageDPI: obj.dpi
    });

    yield delay(1000);
    const dataUrl = getImageDataURL(imageData);
    yield put(Actions.dataUrlCreatedAction(dataUrl));
}

export default function* rootSaga() {
    yield takeLatest(Consts.RENDER_CURRENT_PAGE_ACTION, createImageDataUrl);
}