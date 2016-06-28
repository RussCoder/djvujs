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
        id = +id;
        var obj = this.data[id];
        delete this.data[id];
        return obj;
    }
}