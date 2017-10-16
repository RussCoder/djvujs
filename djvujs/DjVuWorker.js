'use strict';

/**
 * Объект создающий фоновый поток. Предоставляет интерфейс и инкапсулирует логику связи с 
 * объектом DjVuDocument в фоновом потоке выполнения.
 */
class DjVuWorker {
    constructor(path) {
        if (!path) {
            var script = document.querySelector('script[src*="djvu."]');
            this.path = script ? script.src : '/djvujs/DjVuWorkerScript.js';
        } else {
            this.path = path;
        }
        this.worker = new Worker(this.path);
        this.worker.onmessage = (event) => {
            this.messageHandler(event);
        };

        this.worker.onerror = (event) => {
            this.errorHandler(event);
        };
        this.callbacks = new TempRepository();
        this.pagenumber;
    }

    reset() {
        this.worker.terminate();
        this.worker = new Worker(this.path);
        this.worker.onmessage = (event) => {
            this.messageHandler(event);
        };

        this.worker.onerror = (event) => {
            this.errorHandler(event);
        };
    }

    _postMessage(message) {
        this.worker.postMessage(message);
    }

    errorHandler(event) {

    }

    messageHandler(event) {
        var obj = event.data;
        var callback = this.callbacks.fetch(obj.id);
        switch (obj.command) {
            case 'Error':
                callback.reject(obj);
                break;
            case 'Process':
                this.onprocess ? this.onprocess(obj.percent) : 0;
                break;
            case 'getPageImageDataWithDPI':
                callback.resolve({
                    // производим "сборку" ImageData
                    imageData: new ImageData(new Uint8ClampedArray(obj.buffer), obj.width, obj.height),
                    dpi: obj.dpi
                });
                break;
            case 'createDocument':
                this.pagenumber = obj.pagenumber;
                callback.resolve();
                break;
            case 'slice':
                callback.resolve(obj.buffer);
                break;
            case 'createDocumentFromPictures':
                callback.resolve(obj.buffer);
                break;
            case 'startMultyPageDocument':
                callback.resolve();
                break;
            case 'addPageToDocument':
                callback.resolve();
                break;
            case 'endMultyPageDocument':
                callback.resolve(obj.buffer);
                break;
            case 'getDocumentMetaData':
                callback.resolve(obj.str);
                break;
            case 'getPageNumber':
                callback.resolve(obj.pageNumber);
                break;
            default:
                console.error("Unexpected message from DjVuWorker: ", obj);
        }
    }

    getPageNumber() {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve, reject });
            this.worker.postMessage({
                command: 'getPageNumber',
                id: id
            });
        });
    }

    getDocumentMetaData(html) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({
                command: 'getDocumentMetaData',
                id: id,
                html: html
            });
        });
    }

    startMultyPageDocument(slicenumber, delayInit, grayscale) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({
                command: 'startMultyPageDocument',
                id: id,
                slicenumber: slicenumber,
                delayInit: delayInit,
                grayscale: grayscale
            });
        });
    }

    addPageToDocument(imageData) {
        var simpleImage = {
            buffer: imageData.data.buffer,
            width: imageData.width,
            height: imageData.height
        };
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({
                command: 'addPageToDocument',
                id: id,
                simpleImage: simpleImage
            }, [simpleImage.buffer]);
        });
    }

    endMultyPageDocument() {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({
                command: 'endMultyPageDocument',
                id: id
            });
        });
    }

    createDocument(buffer) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({ command: 'createDocument', id: id, buffer: buffer }, [buffer]);

        });
    }

    getPageImageDataWithDPI(pagenumber) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({ command: 'getPageImageDataWithDPI', id: id, pagenumber: pagenumber });
        });
    }

    slice(_from, _to) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({ command: 'slice', id: id, from: _from, to: _to });
        });
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

        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({
                command: 'createDocumentFromPictures',
                id: id,
                images: simpleImages,
                slicenumber: slicenumber,
                delayInit: delayInit,
                grayscale: grayscale
            }, buffers);
        });
    }

    static createArrayBufferURL(buffer) {
        var blob = new Blob([buffer]);
        var url = URL.createObjectURL(blob);
        return url;
    }
}

/**
 * Класс для временного хранения объекта с уникальным id.
 */
class TempRepository {
    constructor() {
        this.data = {};
        this.id = 0;
    }

    get lastID() {
        return this.id - 1;
    }

    add(obj) {
        var id = this.id++;
        this.data[id] = obj;
        return id;
    }

    fetch(id) {
        if (id === undefined) {
            return null;
        }
        id = +id;
        var obj = this.data[id];
        delete this.data[id];
        return obj;
    }
}