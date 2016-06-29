'use strict';

/**
 * Объект создающий фоновый поток. Предоставляет интерфейс и инкапсулирует логику связи с 
 * объектом DjVuDocument в фоновом потоке выполнения.
 */
class DjVuWorker {
    constructor(path) {
        path = path || 'djvujs/DjVuWorkerScript.js';
        this.worker = new Worker(path);
        this.worker.onmessage = (event) => {
            this.messageHandler(event);
        };

        this.worker.onerror = (event) => {
            this.errorHandler(event);
        };
        this.callbacks = new TempRepository();
        this.pagenumber;
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
            case 'getPageImageData':
                console.log(+new Date());
                // производим "сборку" ImageData
                callback.resolve(new ImageData(new Uint8ClampedArray(obj.buffer), obj.width, obj.height));
                console.log('--**', +new Date());
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
            default:
                console.log("Unexpected message from DjVuWorker: ", obj);
        }
    }

    createDocument(buffer) {
        return new Promise((resolve, reject) => {
            console.log(buffer.byteLength);
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({ command: 'createDocument', id: id, buffer: buffer }, [buffer]);

        });
    }

    getPageImageData(pagenumber) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({ command: 'getPageImageData', id: id, pagenumber: pagenumber });
        });
    }

    slice(_from, _to) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({ command: 'slice', id: id, from: _from, to: _to });
        });
    }

    createDocumentFromPictures(imageArray) {
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
        if(id === undefined) {
            return null;
        }
        id = +id;
        var obj = this.data[id];
        delete this.data[id];
        return obj;
    }
}