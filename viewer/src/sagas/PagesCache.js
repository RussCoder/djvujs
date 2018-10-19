import { fork } from 'redux-saga/effects';
//import { delay } from 'redux-saga';

/**
 * An object encapsulating all the logic of extracting and caching pages of a document
 */
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

    resetPagesCache() {
        this.lastCachingTask && this.lastCachingTask.cancel();
        this.lastCachingTask = null;
        this.pages = {};
        this.imageDataPromise = null;
        this.imageDataPromisePageNumber = null;
    }

    * fetchCurrentPageByNumber(currentPageNumber, pagesCount) {
        const newPages = {
            [currentPageNumber]: this.pages[currentPageNumber]
        };
        var pageNumbersToCache = [];

        if (currentPageNumber > 1 && currentPageNumber < pagesCount) {
            pageNumbersToCache = [currentPageNumber + 1, currentPageNumber - 1];
        } else if (currentPageNumber === 1) {
            pageNumbersToCache = pagesCount >= 3 ? [2, 3]
                : pagesCount >= 2 ? [2] : null;
        } else if (currentPageNumber === pagesCount) {
            pageNumbersToCache = pagesCount >= 3 ? [currentPageNumber - 1, currentPageNumber - 2]
                : pagesCount >= 2 ? [currentPageNumber - 1] : null;
        }

        for (var pageNumber of pageNumbersToCache) {
            newPages[pageNumber] = this.pages[pageNumber];
        }

        this.pages = newPages;

        yield* this.fetchImageDataByPageNumber(currentPageNumber);
        // load other pages in a parallel task
        this.lastCachingTask = yield fork([this, this.cachePages], pageNumbersToCache);

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
                const [imageData, dpi] = yield this.imageDataPromise;
                //console.log('fetchImageDataByPageNumber', pageNumber);      
                this.pages[pageNumber] = { imageData, dpi };
            } catch (e) {
                this.pages[pageNumber] = { error: e };
            } finally {
                this.imageDataPromisePageNumber = null;
                this.imageDataPromise = null;
            }
        }
    }
}