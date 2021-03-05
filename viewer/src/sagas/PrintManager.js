import { put } from "redux-saga/effects";
import { ActionTypes } from "../constants";

export default class PrintManager {
    constructor(worker, pageStorage) {
        this.djvuWorker = worker;
        this.pageStorage = pageStorage;
    }

    * preparePagesForPrinting(from, to) {
        this.djvuWorker.cancelAllTasks();
        let loaded = 0;
        const total = to - from + 1;
        for (let i = from; i <= to; i++) {
            if (this.pageStorage.getPage(i)) {
                loaded++;
            }
        }

        function* updateProgress() {
            yield put({ type: ActionTypes.UPDATE_PRINT_PROGRESS, payload: Math.round(loaded / total * 100) });
        }

        yield* updateProgress();

        if (loaded !== total) {
            for (let i = from; i <= to; i++) {
                if (!this.pageStorage.getPage(i)) {
                    const page = yield this.djvuWorker.doc.getPage(i).createPngObjectUrl().run();
                    this.pageStorage.addPage(i, page);
                    loaded++;
                    yield* updateProgress();
                }
            }
        }

        const pagesArray = [];
        for (let i = from; i <= to; i++) {
            pagesArray.push(this.pageStorage.getPage(i));
        }

        yield put({ type: ActionTypes.START_PRINTING, payload: pagesArray });
    }
}