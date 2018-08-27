/**
 * Creates an object containing properties which are manipulated by sagas and methods relating to them.
 */
export default () => ({
    pages: {},
    imageDataPromise: null,
    imageDataPromisePageNumber: null,

    callbacks: {},

    resetPagesCache() {
        this.pages = {};
        this.imageDataPromise = null;
        this.imageDataPromisePageNumber = null;
    },

    updatePagesCache(currentPageNumber, pagesCount) {
        const newPages = {
            [currentPageNumber]: this.pages[currentPageNumber]
        };
        let nextPageNumber = null, prevPageNumber = null;

        if (currentPageNumber + 1 <= pagesCount) {
            nextPageNumber = currentPageNumber + 1;
            newPages[nextPageNumber] = this.pages[nextPageNumber];
        } else if (currentPageNumber - 2 > 0) {
            nextPageNumber = currentPageNumber - 2;
            newPages[nextPageNumber] = this.pages[nextPageNumber];
        }

        if (currentPageNumber - 1 > 0) {
            prevPageNumber = currentPageNumber - 1;
            newPages[currentPageNumber - 1] = this.pages[currentPageNumber - 1];
        } else if (currentPageNumber + 2 <= this.pagesCount) {
            prevPageNumber = currentPageNumber + 2;
            newPages[prevPageNumber] = this.pages[prevPageNumber];
        }

        this.pages = newPages;

        return { prevPageNumber, nextPageNumber };
    }
});