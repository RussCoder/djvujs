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
        this.callbacks = new TempRepository();
    }

    _postMessage(message) {
        this.worker.postMessage(message);
    }

    messageHandler(event) {
        var obj = event.data;
        var callback = this.callbacks.fetch(obj.id);
        switch (obj.command) {
            case 'getPageImageData':
                console.log(+new Date());
                // производим "сборку" ImageData
                callback(new ImageData(new Uint8ClampedArray(obj.buffer), obj.width, obj.height));
                console.log('--**', +new Date());
            case 'createDocument':
                callback();
                break;
            default:
                console.log("Unexpected message from DjVuWorker: ", obj);
        }
    }

    createDocument(buffer) {
        return new Promise((resolve, reject) => {
            console.log(buffer.byteLength);
            var id = this.callbacks.add(resolve);
            console.log(+new Date());
            this.worker.postMessage({ command: 'createDocument', id: id, buffer: buffer }, [buffer]);
            console.log(buffer.byteLength);
            console.log('/**/', +new Date());
        });
    }

    getPageImageData(pagenumber) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add(resolve);
            this.worker.postMessage({ command: 'getPageImageData', id: id, pagenumber: pagenumber });
        });
    }
}

class TempRepository {
    constructor() {
        this.data = {};
        this.id = 0;
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