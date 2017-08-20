'use strict';

class DjVuViewer {
    constructor(selector, worker) {
        this.defaultDPI = 100;
        this.selector = selector;
        this.element = document.querySelector(selector);
        this.fileReader = new FileReader();
        this.tmpCanvas = document.createElement('canvas');
        this.tmpCanvasCtx = this.tmpCanvas.getContext('2d');
        this.prevBut = this.element.querySelector('.controls .navbut.prev');
        this.nextBut = this.element.querySelector('.controls .navbut.next');
        this.pageNumberBox = this.element.querySelector('.controls .page_number');
        this.scaleSlider = this.element.querySelector('.controls .scale');
        this.scaleLabel = this.element.querySelector('.controls .scale_label');
        this.img = this.element.querySelector('.image_wrapper img');
        this.img.style.display = 'none';
        this.canvas = this.element.querySelector('.image_wrapper canvas');
        this.canvasCtx = this.canvas.getContext('2d');
        this.imgWrapper = this.element.querySelector('.image_wrapper');
        this._curPage = 0;
        this.pageNumber = null;
        this.stdWidth
        /** @type {DjVuWorker} */
        this.worker = worker || new DjVuWorker();

        this.isCanvasMode = true;

        this.element.style.width = window.innerWidth * 0.9 + 'px';
        this.element.style.height = window.innerHeight * 0.9 + 'px';

        this.nextBut.onclick = () => this.showNextPage();
        this.prevBut.onclick = () => this.showPrevPage();
        this.pageNumberBox.onblur = (e) => this.renderEnteredPage(e);
        this.pageNumberBox.onkeypress = (e) => this.renderEnteredPageByEnter(e);
        this.scaleSlider.oninput = () => this.changeScale();
    }

    reset() {
        clearTimeout(this.improveImageTimeout);
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
        this.isCanvasMode ? this.drawImageOnCanvas() : this.rescaleImageOnImg();
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

    getScaledImageWidth() {
        return this.imageData.width / this.standardScale * (+this.scaleSlider.value / 100);
    }

    renderCurPage() {
        clearTimeout(this.improveImageTimeout);
        return this.worker.getPageImageDataWithDPI(this._curPage).then(obj => {
            this.imageData = obj.imageData;
            this.imageDPI = obj.dpi;
            this.standardScale = this.imageDPI ? this.imageDPI / this.defaultDPI : 1;
            this.drawImageOnCanvas();

            this.improveImageTimeout = setTimeout(() => {
                this.drawImageViaImg();
            }, 1000);
        });
    }

    /**
     * @returns {Promise<ArrayBuffer>}
     */
    loadFile(url) {
        return new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = "arraybuffer";
            xhr.onload = (e) => {
                DjVu.IS_DEBUG && console.log("File loaded: ", e.loaded);
                resolve(xhr.response);
            };
            xhr.send();
        });
    }

    loadDjVu(url) { // debug functions
        return this.loadFile(url)
            .then(buffer => this.worker.createDocument(buffer))
            .then(() => this.worker.getPageNumber())
            .then(number => {
                this.pageNumber = number;
                this.curPage = 1;
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

    _switchToImageMode() {
        this.img.style.display = 'block';
        this.canvas.style.display = 'none';
        this.isCanvasMode = false;
    }

    _switchToCanvasMode() {
        this.img.style.display = 'none';
        this.canvas.style.display = 'block';
        this.isCanvasMode = true;
    }

    getImageDataURL() {
        this.tmpCanvas.width = this.imageData.width;
        this.tmpCanvas.height = this.imageData.height;
        this.tmpCanvasCtx.putImageData(this.imageData, 0, 0);
        return this.tmpCanvas.toDataURL();
    }

    getImageDataURLAsync() {
        return new Promise(resolve => {
            this.tmpCanvas.width = this.imageData.width;
            this.tmpCanvas.height = this.imageData.height;
            this.tmpCanvasCtx.putImageData(this.imageData, 0, 0);
            this.tmpCanvas.toBlob(imageBlob => {
                this.fileReader.onload = event => {
                    resolve(event.target.result);
                };
                this.fileReader.readAsDataURL(imageBlob);
            });
        });
    }

    drawImageViaImg() {
        this.img.src = this.getImageDataURL();
        this.rescaleImageOnImg();
        this._switchToImageMode();
    }

    rescaleImageOnImg() {
        this.img.width = this.getScaledImageWidth();
    }

    drawImageOnCanvas() {
        //var time = performance.now();
        var image = this.imageData;
        var scale = this.imageDPI ? this.imageDPI / this.defaultDPI : 1;
        scale /= (+this.scaleSlider.value / 100)
        this.stdWidth = image.width / scale * (+this.scaleSlider.value / 100);
        this.stdHeight = image.height / scale * (+this.scaleSlider.value / 100);

        this.tmpCanvas.width = image.width;
        this.tmpCanvas.height = image.height;
        this.tmpCanvasCtx.putImageData(image, 0, 0);

        var tmpH, tmpW, tmpH2, tmpW2;
        tmpH = tmpH2 = this.tmpCanvas.height;
        tmpW = tmpW2 = this.tmpCanvas.width;

        if (scale > 4) {
            tmpH = this.tmpCanvas.height / scale * 4;
            tmpW = this.tmpCanvas.width / scale * 4;
            //первое сжатие
            this.tmpCanvasCtx.drawImage(this.tmpCanvas, 0, 0, tmpW, tmpH);
        }
        if (scale > 2) {
            tmpH2 = this.tmpCanvas.height / scale * 2;
            tmpW2 = this.tmpCanvas.width / scale * 2;
            //второе сжатие
            this.tmpCanvasCtx.drawImage(this.tmpCanvas, 0, 0, tmpW, tmpH, 0, 0, tmpW2, tmpH2);
        }
        //итоговое сжатие
        this.canvas.width = image.width / scale;
        this.canvas.height = image.height / scale;
        this.canvasCtx.drawImage(this.tmpCanvas, 0, 0, tmpW2, tmpH2,
            0, 0, this.canvas.width, this.canvas.height);
        this._switchToCanvasMode();
        //console.log('Render time', performance.now() - time, scale);
    }
}