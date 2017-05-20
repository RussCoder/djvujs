'use strict';

class DjVuViewer {
    constructor(selector, worker) {
        this.defaultDPI = 100;
        this.selector = selector;
        this.element = document.querySelector(selector);
        this.canvas = document.createElement('canvas');
        this.canvasCtx = this.canvas.getContext('2d');
        this.prevBut = this.element.querySelector('.controls .navbut.prev');
        this.nextBut = this.element.querySelector('.controls .navbut.next');
        this.pageNumberBox = this.element.querySelector('.controls .page_number');
        this.scaleSlider = this.element.querySelector('.controls .scale');
        this.scaleLabel = this.element.querySelector('.controls .scale_label');
        this.img = this.element.querySelector('.image_wrapper img');
        this.imgWrapper = this.element.querySelector('.image_wrapper');
        this._curPage = 0;
        this.pageNumber = null;
        this.stdWidth
        /** @type {DjVuWorker} */
        this.worker = worker || new DjVuWorker();

        this.element.style.width = window.innerWidth * 0.9 + 'px';
        this.element.style.height = window.innerHeight * 0.9 + 'px';

        this.nextBut.onclick = () => this.showNextPage();
        this.prevBut.onclick = () => this.showPrevPage();
        this.pageNumberBox.onblur = (e) => this.renderEnteredPage(e);
        this.pageNumberBox.onkeypress = (e) => this.renderEnteredPageByEnter(e);
        this.scaleSlider.oninput = () => this.changeScale();
    }

    reset() {
        if (this.nextBut) {
            this.nextBut.onclick = null;
            this.prevBut.onclick = null;
            this.pageNumberBox.onblur = null;
            this.pageNumberBox.onkeypress = null;
            this.scaleSlider.oninput = null;
            this.worker = null;
            this.img.src = '';
        }
    }

    changeScale() {
        this.scaleLabel.innerText = this.scaleSlider.value;
        this.img.width = this.stdWidth * (+this.scaleSlider.value / 100);
    }

    renderEnteredPageByEnter(e) {
        if (e.keyCode === 13) {
            this.pageNumberBox.blur(); // it will call showEnteredPage() as the event handler
        }
    }

    renderEnteredPage(e) {
        var page = +this.pageNumberBox.value;
        this.curPage = page;
    }

    get curPage() {
        return this._curPage + 1;
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
        return this.worker.getPageImageDataWithDPI(this._curPage).then(obj => {
            this.drawImage(obj.imageData, obj.dpi);
        });
    }

    loadDjVu(url) {
        return Globals.loadFile(url)
            .then(buffer => this.worker.createDocument(buffer))
            .then(() => this.worker.getPageNumber())
            .then(number => {
                this.pageNumber = number;
                this.curPage = 4;
            });
    }

    loadDjVuFromBuffer(buffer) {
        return this.worker.createDocument(buffer)
            .then(() => this.worker.getPageNumber())
            .then(number => {
                this.pageNumber = number;
                this.curPage = 1;
            });
    }

    relockNavButtons() {
        this.unlockNavButtons();
        if (this._curPage === 0) {
            this.prevBut.disabled = true;
        }
        if (this._curPage === this.pageNumber - 1) {
            this.nextBut.disabled = true;
        }
    }

    setPage(page) {
        page--;
        if (page < 0) {
            page = 0;
        } else if (page > this.pageNumber - 1) {
            page = this.pageNumber - 1;
        }
        this._curPage = page;
        this.relockNavButtons();
        this.pageNumberBox.value = this.curPage;
        this.lockNavButtons();
        this.renderCurPage().then(() => {
            this.relockNavButtons();
        });
    }

    drawImage(image, dpi) {
        var scale = dpi ? dpi / this.defaultDPI : 1;

        this.canvas.width = image.width;
        this.canvas.height = image.height;

        this.canvasCtx.putImageData(image, 0, 0);
        this.img.src = this.canvas.toDataURL();
        this.stdWidth = image.width / scale;
        this.img.width = this.stdWidth * (+this.scaleSlider.value / 100);
    }
}