'use strict';

class DjVuViewer {
    constructor(selector) {
        this.defaultDPI = 100;
        this.selector = selector;
        this.element = document.querySelector(selector);
        this.canvas = document.createElement('canvas');
        this.canvasCtx = this.canvas.getContext('2d');
        this.prevBut = this.element.querySelector('.navbut.prev');
        this.nextBut = this.element.querySelector('.navbut.next');
        this.pageNumberBox = this.element.querySelector('.page_number');
        this.scaleSlider = this.element.querySelector('.scale');
        this.scaleLabel = this.element.querySelector('.scale_label');
        this.img = this.element.querySelector('.image_wrapper img');
        this._curPage = 0;
        this.pageNumber = null;
        /** @type {DjVuWorker} */
        this.worker = new DjVuWorker();

        this.nextBut.onclick = () => this.showNextPage();
        this.prevBut.onclick = () => this.showPrevPage();
    }

    get curPage() {
        return this._curPage;
    }

    set curPage(value) {
        this.setPage(value);
    }

    showNextPage() {
        this.curPage += 1;
    }

    showPrevPage() {
        this.curPage -= 1;
    }

    lockNavButtons() {
        this.nextBut.disabled = true;
        this.prevBut.disabled = true;
    }

    unlockNavButtons() {
        this.nextBut.disabled = false;
        this.prevBut.disabled = false;
    }

    renderCurPage() {
        return this.worker.getPageImageDataWithDPI(this.curPage).then(obj => {
            this.drawImage(obj.imageData, obj.dpi);
        });
    }

    loadDjVu(url) {
        Globals.loadFile(url)
            .then(buffer => this.worker.createDocument(buffer))
            .then(() => this.worker.getPageNumber())
            .then(number => {
                this.pageNumber = number;
                return this.worker.getPageImageDataWithDPI(this.curPage);
            })
            .then(obj => {
                this.drawImage(obj.imageData, obj.dpi);
            });
    }

    setPage(page) {
        if (page < 0 || page > this.pageNumber) {
            return false;
        }
        this._curPage = page;
        if (this._curPage === 0) {
            this.prevBut.disabled = true;
        } else if (this._curPage === this.pageNumber) {
            this.nextBut.disabled = true;
        } else {
            this.unlockNavButtons();
        }
        this.lockNavButtons();
        this.renderCurPage().then(() => {
            this.unlockNavButtons();
            if (this._curPage === 0) {
                this.prevBut.disabled = true;
            } else if (this._curPage === this.pageNumber) {
                this.nextBut.disabled = true;
            }
        });
    }

    drawImage(image, dpi) {
        var time = performance.now();
        var tmp;
        var scale = dpi ? dpi / this.defaultDPI : 1;

        this.canvas.width = image.width;
        this.canvas.height = image.height;

        this.canvasCtx.putImageData(image, 0, 0);

        this.img.src = this.canvas.toDataURL();
        console.log("DataURL creating time = ", performance.now() - time);
        this.img.width = image.width / scale;
        //(tmp = this.canvas.parentNode) ? tmp.removeChild(this.canvas) : 0;
        console.log("DataURL creating time = ", performance.now() - time);
    }
}