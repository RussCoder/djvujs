/**
 * The logic of extracting and caching pages of a document in the discrete page mode.
 * The current, the previous and the next pages are fetched (and pre-fetched).
 * A page in the format of ImageData may take about 30 MB of RAM, 
 * so it's not good to cache more than 3 ones.
 */

import { fork } from 'redux-saga/effects';
//import { delay } from 'redux-saga';

export default class PagesCache {

    constructor(djvuWorker) {
        this.djvuWorker = djvuWorker;
        this.pages = {};
        this.imageDataPromise = null;
        this.imageDataPromisePageNumber = null;

        this.currentPageNumber = null;
        this.prevPageNumber = null;
        this.nextPageNumber = null;

        this.lastCachingTask = null;

        //window.pc = this;
    }

    cancelCachingTask() {
        this.lastCachingTask && this.lastCachingTask.cancel();
        this.lastCachingTask = null;
    }

    resetPagesCache() {
        this.cancelCachingTask();
        this.pages = {};
        this.imageDataPromise = null;
        this.imageDataPromisePageNumber = null;
    }

    * fetchCurrentPageByNumber(currentPageNumber, pagesQuantity) {
        const newPages = {
            [currentPageNumber]: this.pages[currentPageNumber]
        };
        var pageNumbersToCache = null;

        if (currentPageNumber > 1 && currentPageNumber < pagesQuantity) {
            pageNumbersToCache = [currentPageNumber + 1, currentPageNumber - 1];
        } else if (currentPageNumber === 1) {
            pageNumbersToCache = pagesQuantity >= 3 ? [2, 3]
                : pagesQuantity >= 2 ? [2] : null;
        } else if (currentPageNumber === pagesQuantity) {
            pageNumbersToCache = pagesQuantity >= 3 ? [currentPageNumber - 1, currentPageNumber - 2]
                : pagesQuantity >= 2 ? [currentPageNumber - 1] : null;
        }

        if (pageNumbersToCache) {
            for (var pageNumber of pageNumbersToCache) {
                newPages[pageNumber] = this.pages[pageNumber];
            }
        }

        this.pages = newPages;

        this.cancelCachingTask(); // it should kind of be cancelled automatically, since it is forked rather than spawned, but auto cancellation doesn't work
        yield* this.fetchImageDataByPageNumber(currentPageNumber);

        if (pageNumbersToCache) {
            // load other pages in a parallel task
            this.lastCachingTask = yield fork([this, this.cachePages], pageNumbersToCache);
        }

        return this.pages[currentPageNumber];
    }

    * cachePages(pageNumbersToCache) {
        for (var pageNumber of pageNumbersToCache) {
            yield* this.fetchImageDataByPageNumber(pageNumber);
        }
    }

    * fetchImageDataByPageNumber(pageNumber) {
        if (pageNumber !== null && (!this.pages[pageNumber] || this.pages[pageNumber].error)) {
            if (this.imageDataPromisePageNumber !== pageNumber) {
                if (this.imageDataPromise) {
                    this.djvuWorker.cancelAllTasks();
                }

                this.imageDataPromisePageNumber = pageNumber;
                this.imageDataPromise = this.djvuWorker.run(
                    this.djvuWorker.doc.getPage(pageNumber).getImageData(),
                    this.djvuWorker.doc.getPage(pageNumber).getDpi(),
                );
            }

            try {
                //yield delay(2000);
                let res = yield this.imageDataPromise;
                const [imageData, dpi] = res;
                this.pages[pageNumber] = { imageData, dpi };
            } catch (e) {
                this.pages[pageNumber] = { error: e };
            }

            // not in finally block, because the finally block is executed when a saga task is cancelled, but it's not needed
            this.imageDataPromise = null;
            this.imageDataPromisePageNumber = null;
        }
    }
}