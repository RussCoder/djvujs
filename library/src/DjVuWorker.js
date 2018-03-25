/**
 * Объект создающий фоновый поток. Предоставляет интерфейс и инкапсулирует логику связи с 
 * объектом DjVuDocument в фоновом потоке выполнения.
 */
export default class DjVuWorker {
    constructor(path) {
        if (!path) {
            var script = document.querySelector('script#djvu_js_lib, script[src*="djvu."]');
            this.path = script ? script.src : '/src/DjVuWorkerScript.js';
        } else {
            this.path = path;
        }
        this.reset();
    }

    reset() {
        this.worker && this.worker.terminate();
        this.worker = new Worker(this.path);
        this.worker.onmessage = (e) => this.messageHandler(e);
        this.worker.onerror = (e) => this.errorHandler(e);
        this.callbacks = null;
        this.currentPromise = null;
        this.promiseMap = new Map();
        this.isTaskInProcess = false;
    }

    errorHandler(event) {
        console.error("DjVu.js Worker error!", event);
    }

    cancelTask(promise) {
        if (!this.promiseMap.delete(promise)) {
            if (this.currentPromise === promise) {
                this.currentPromise = null;
                this.callbacks = null;
            }
        }
    }

    cancelAllTasks() {
        this.promiseMap.clear();
        this.currentPromise = null;
        this.callbacks = null;
    }

    createNewPromise(commandObj, transferList) {
        var callbacks;
        var promise = new Promise((resolve, reject) => {
            callbacks = { resolve, reject };
        });
        this.promiseMap.set(promise, { callbacks, commandObj, transferList });
        this.runNextTask();
        return promise;
    }

    runNextTask() {
        if (this.isTaskInProcess) {
            return;
        }
        var next = this.promiseMap.entries().next().value;
        if (next) {
            var obj = next[1];
            var key = next[0];
            this.callbacks = obj.callbacks;
            this.currentPromise = key;
            this.worker.postMessage(obj.commandObj, obj.transferList);
            this.isTaskInProcess = true;
            this.promiseMap.delete(key);
        } else {
            this.currentPromise = null;
            this.callbacks = null;
        }
    }

    messageHandler(event) {
        this.isTaskInProcess = false;
        var callbacks = this.callbacks;
        this.runNextTask();

        if (!callbacks) {
            return;
        }

        var obj = event.data;
        switch (obj.command) {
            case 'Error':
                callbacks.reject(obj.error);
                break;
            case 'Process':
                this.onprocess ? this.onprocess(obj.percent) : 0;
                break;
            case 'getPageImageDataWithDpi':
                callbacks.resolve({
                    // производим "сборку" ImageData
                    imageData: new ImageData(new Uint8ClampedArray(obj.buffer), obj.width, obj.height),
                    dpi: obj.dpi
                });
                break;
            case 'createDocument':
                callbacks.resolve();
                break;
            case 'slice':
                callbacks.resolve(obj.buffer);
                break;
            case 'createDocumentFromPictures':
                callbacks.resolve(obj.buffer);
                break;
            case 'startMultiPageDocument':
                callbacks.resolve();
                break;
            case 'addPageToDocument':
                callbacks.resolve();
                break;
            case 'endMultiPageDocument':
                callbacks.resolve(obj.buffer);
                break;
            case 'getDocumentMetaData':
                callbacks.resolve(obj.str);
                break;
            case 'getPageCount':
                callbacks.resolve(obj.pageNumber);
                break;
            case 'getPageText':
                callbacks.resolve(obj.text);
                break;
            default:
                console.error("Unexpected message from DjVuWorker: ", obj);
        }
    }

    getPageCount() {
        return this.createNewPromise({ command: 'getPageCount' });
    }

    getDocumentMetaData(html) {
        return this.createNewPromise({
            command: 'getDocumentMetaData',
            html: html
        });
    }

    startMultiPageDocument(slicenumber, delayInit, grayscale) {
        return this.createNewPromise({
            command: 'startMultiPageDocument',
            slicenumber: slicenumber,
            delayInit: delayInit,
            grayscale: grayscale
        });
    }

    addPageToDocument(imageData) {
        var simpleImage = {
            buffer: imageData.data.buffer,
            width: imageData.width,
            height: imageData.height
        };
        return this.createNewPromise({
            command: 'addPageToDocument',
            simpleImage: simpleImage
        }, [simpleImage.buffer]);
    }

    endMultiPageDocument() {
        return this.createNewPromise({ command: 'endMultiPageDocument' });
    }

    createDocument(buffer) {
        return this.createNewPromise({ command: 'createDocument', buffer: buffer }, [buffer]);
    }

    getPageImageDataWithDpi(pagenumber, onlyFirstBgChunk = false) {
        return this.createNewPromise({
            command: 'getPageImageDataWithDpi',
            pagenumber: pagenumber,
            onlyFirstBgChunk: onlyFirstBgChunk
        });
    }

    getPageText(pagenumber) {
        return this.createNewPromise({ command: 'getPageText', pagenumber: pagenumber });
    }

    slice(_from, _to) {
        return this.createNewPromise({ command: 'slice', from: _from, to: _to });
    }

    createDocumentFromPictures(imageArray, slicenumber, delayInit, grayscale) {
        var simpleImages = new Array(imageArray.length);
        var buffers = new Array(imageArray.length);
        for (var i = 0; i < imageArray.length; i++) {
            // разлагаем картинки для передачи в фоновый поток по частям
            simpleImages[i] = {
                buffer: imageArray[i].data.buffer,
                width: imageArray[i].width,
                height: imageArray[i].height
            };
            buffers[i] = imageArray[i].data.buffer;
        }

        return this.createNewPromise({
            command: 'createDocumentFromPictures',
            images: simpleImages,
            slicenumber: slicenumber,
            delayInit: delayInit,
            grayscale: grayscale
        }, buffers);
    }

    static createArrayBufferURL(buffer) {
        var blob = new Blob([buffer]);
        var url = URL.createObjectURL(blob);
        return url;
    }
}