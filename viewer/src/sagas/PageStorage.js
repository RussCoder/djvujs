/**
 * All URLs should be revoked after they are not needed any more.
 * Also these URLs can be used not only in the continuous scroll mode,
 * but for printing too.
 * Therefore, for convenience, they are all stored in one place.
 */

export default class PageStorage {
    constructor() {
        this.pages = {};
    }

    reset() {
        this.removeAllPages();
    }

    getAllPageNumbers() {
        return Object.keys(this.pages);
    }

    getPage(number) {
        return this.pages[number];
    }

    addPage(number, data) {
        this.pages[number] = data;
    }

    removePage(number) {
        const page = this.pages[number];
        if (!page) return;
        URL.revokeObjectURL(page.url);
        delete this.pages[number];
    }

    removeAllPages() {
        for (const pageNumber of Object.keys(this.pages)) {
            URL.revokeObjectURL(this.pages[pageNumber].url);
        }
        this.pages = {};
    }
}