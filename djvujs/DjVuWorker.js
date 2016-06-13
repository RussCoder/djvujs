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
        this.getPageImageDataCallback = null;
    }

    _postMessage(message) {
        this.worker.postMessage(message);
    }

    messageHandler(event) {
        var obj = event.data;
        switch (obj.command) {
            case 'getPageImageData':
                if (this.getPageImageDataCallback)
                    this.getPageImageDataCallback(obj.imageData);
                break;
            default:
                console.log("Unexpected message from DjVuWorker: ", obj);
        }
    }

    createDocument(buffer) {
        console.log(buffer.byteLength);
        this.worker.postMessage({ command: 'createDocument', buffer: buffer }, [buffer]);
        console.log(buffer.byteLength);
    }

    getPageImageData(pagenumber, callback) {
        this.worker.postMessage({ command: 'getPageImageData', pagenumber: pagenumber });
        this.getPageImageDataCallback = callback;
    }
}