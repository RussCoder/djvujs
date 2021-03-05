/**
 * The logic related to page caching in the continuous scroll mode.
 * It pre-fetches pages depending on the current page number and the radius
 * (a number of pages before and after the current one).
 * All pages outside the radius are removed from the cache in order not to retain
 * too much memory, although each page is encoded as an Object URL to a PNG,
 * so it takes only several kilobytes.
 */

import { put, select } from 'redux-saga/effects';
import Actions from "../actions/actions";
import { get } from '../reducers';
import Constants from '../constants';

const radius = 15;

export default class ContinuousScrollManager {
    constructor(djvuWorker, pagesCount, pageStorage) {
        this._reset(djvuWorker, pagesCount, pageStorage);
    }

    _reset(djvuWorker, pagesCount, pageStorage) {
        this.pagesCount = pagesCount;
        this.pageStorage = pageStorage;
        this.djvuWorker = djvuWorker;
        this.obsoletePageNumbers = [];

        // a previous saga is cancelled on a new action, so we should keep the last promise in order to avoid fetching the same page twice
        this.lastLoadPagePromise = null;
        this.lastLoadPageNumber = null;
    }

    * reset() {
        yield* this.dropAllPages();
        this._reset(this.djvuWorker, this.pagesCount, this.pageStorage);
    }

    setPageNumber(pageNumber) {
        var unusedLength = 0;
        this.pageNumber = pageNumber;

        this.leftNumber = pageNumber - radius;
        if (this.leftNumber < 1) {
            unusedLength += 1 - this.leftNumber;
            this.leftNumber = 1;
        }

        this.rightNumber = pageNumber + radius;
        if (this.rightNumber > this.pagesCount) {
            unusedLength += this.rightNumber - this.pagesCount;
            this.rightNumber = this.pagesCount;
        }

        if (unusedLength) {
            if (this.leftNumber > 1) {
                this.leftNumber = Math.max(1, this.leftNumber - unusedLength);
            } else if (this.rightNumber < this.pagesCount) {
                this.rightNumber = Math.min(this.pagesCount, this.rightNumber + unusedLength);
            }
        }
    }

    updateRegistries() {
        this.obsoletePageNumbers = [];
        for (const pageNumber of this.pageStorage.getAllPageNumbers()) {
            if (pageNumber < this.leftNumber || pageNumber > this.rightNumber) {
                this.obsoletePageNumbers.push(pageNumber);
            }
        }
    }

    * dropAllPages() {
        yield put({ type: Constants.DROP_ALL_PAGES_ACTION });
        this.pageStorage.removeAllPages();
    }

    * dropPage(pageNumber) {
        yield put(Actions.dropPageAction(pageNumber));
        this.pageStorage.removePage(pageNumber);
    }

    * removeObsoletePagesIfRequired() {
        const excess = this.pageStorage.getAllPageNumbers().length - 2 * radius - 1;
        if (excess > 0) {
            for (let i = 0; i < excess; i++) {
                yield* this.dropPage(this.obsoletePageNumbers[i]);
            }
            this.obsoletePageNumbers.splice(0, excess);
        }
    }

    * loadPageFromLastPromise() {
        try {
            const [page, textZones] = yield this.lastLoadPagePromise;
            page.textZones = textZones;
            this.pageStorage.addPage(this.lastLoadPageNumber, page);
        } finally { // it's executed when the saga is cancelled too, so it won't hang on the "lastLoadPagePromise" if it's cancelled
            this.lastLoadPagePromise = null;
            this.lastLoadPageNumber = null;
        }
    }

    * loadPage(pageNumber) {
        const page = this.pageStorage.getPage(pageNumber);
        if (!page || !page.hasOwnProperty('textZones')) {
            this.lastLoadPagePromise = page ? Promise.all([
                Promise.resolve(page),
                this.djvuWorker.doc.getPage(pageNumber).getNormalizedTextZones().run(),
            ]) : this.djvuWorker.run(
                this.djvuWorker.doc.getPage(pageNumber).createPngObjectUrl(),
                this.djvuWorker.doc.getPage(pageNumber).getNormalizedTextZones(),
            );
            this.lastLoadPageNumber = pageNumber;

            yield* this.loadPageFromLastPromise();
            yield* this.removeObsoletePagesIfRequired();
        }

        yield put(Actions.pageIsLoadedAction(this.pageStorage.getPage(pageNumber), pageNumber));
    }

    * startDataFetching() {
        // the process of loading can't be stopped so it's by all means better
        // to save the page to the registry, even if it will not be used soon
        if (this.lastLoadPagePromise) {
            yield* this.loadPageFromLastPromise();
        }

        const state = yield select();
        const pageNumber = get.currentPageNumber(state);
        this.setPageNumber(pageNumber);
        this.updateRegistries();
        this.djvuWorker.emptyTaskQueue();

        const span = Math.min(this.pageNumber - this.leftNumber, this.rightNumber - this.pageNumber);

        yield* this.loadPage(this.pageNumber);

        for (let i = 1; i <= span; i++) {
            yield* this.loadPage(this.pageNumber + i);
            yield* this.loadPage(this.pageNumber - i);
        }

        if (this.pageNumber - this.leftNumber < this.rightNumber - this.pageNumber) { // if we are nearer to the beginning
            for (let i = this.leftNumber + 2 * span + 1; i <= this.rightNumber; i++) { // load pages in a usual order
                yield* this.loadPage(i);
            }
        } else {
            for (let i = this.rightNumber - 2 * span - 1; i >= this.leftNumber; i--) { // else load pages in a reversed order
                yield* this.loadPage(i);
            }
        }
    }

}