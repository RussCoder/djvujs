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
        this.curPage = 0;

        this.nextBut.onclick = () => this.showNextPage();
        this.prevBut.onclick = () => this.showPrevPage();
    }

    showNextPage() {
        this.curPage++;
        this.renderCurPage();
    }

    showPrevPage() {
        this.curPage--;
        this.renderCurPage();
    }

    renderCurPage() {
        this.nextBut.disabled = true;
        this.prevBut.disabled = true;
        this.worker.getPageImageDataWithDPI(this.curPage).then(obj => {
            this.drawImage(obj.imageData, obj.dpi);
            this.nextBut.disabled = false;
            this.prevBut.disabled = false;
        });
    }

    loadDjVu(url) {
        /** @type {DjVuWorker} */
        this.worker = new DjVuWorker();
        Globals.loadFile(url)
            .then(buffer => this.worker.createDocument(buffer))
            .then(() => this.worker.getPageImageDataWithDPI(this.curPage))
            .then(obj => {
                this.drawImage(obj.imageData, obj.dpi);
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