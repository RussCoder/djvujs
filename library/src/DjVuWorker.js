/**
 * Объект создающий фоновый поток. Предоставляет интерфейс и инкапсулирует логику связи с
 * объектом DjVuDocument в фоновом потоке выполнения.
 * DjVuScript is a function which containing the whole build of the library.
 * It's an additional wrapper added in the build process. Look at the build config file.
 */
export default class DjVuWorker {
    constructor(path = URL.createObjectURL(new Blob(["(" + DjVuScript.toString() + ")();"], { type: 'application/javascript' }))) {
        if (typeof DjVuScript !== "function") { // just in case
            console.warn("No DjVu Scripted detected!");
            var script = document.querySelector('script#djvu_js_lib, script[src*="djvu."]');
            path = script ? script.src : '/src/DjVuWorkerScript.js';
        }
        this.path = path;
        this.reset();
    }

    reset() {
        this.terminate();
        this.worker = new Worker(this.path);
        this.worker.onmessage = (e) => this.messageHandler(e);
        this.worker.onerror = (e) => this.errorHandler(e);
        this.promiseCallbacks = null;
        this.currentPromise = null;
        this.promiseMap = new Map();
        this.isWorking = false;
        this.commandCounter = 0;
        this.currentCommandId = null;

        // Hyper callback is a callback working even from inside the Worker :)
        this.hyperCallbacks = {};
        this.hyperCallbackCounter = 0;
    }

    registerHyperCallback(func) {
        const id = this.hyperCallbackCounter++;
        this.hyperCallbacks[id] = func;
        return { hyperCallback: true, id: id };
    }

    unregisterHyperCallback(id) {
        delete this.hyperCallbacks[id];
    }

    terminate() {
        this.worker && this.worker.terminate();
    }

    get doc() {
        return DjVuWorkerTask.instance(this);
    }

    errorHandler(event) {
        console.error("DjVu.js Worker error!", event);
    }

    cancelTask(promise) {
        if (!this.promiseMap.delete(promise)) {
            if (this.currentPromise === promise) {
                this.dropCurrentTask();
            }
        }
    }

    dropCurrentTask() {
        this.currentPromise = null;
        this.promiseCallbacks = null;
        this.currentCommandId = null;
    }

    emptyTaskQueue() {
        this.promiseMap.clear();
    }

    cancelAllTasks() {
        this.emptyTaskQueue();
        this.dropCurrentTask();
    }

    /**
     * @param {Array<Transferable>} transferList - the list of objects to transfer
     * ownership of the the Web Worker (like ArrayBuffer).
     */
    createNewPromise(commandObj, transferList = undefined) {
        var callbacks;
        var promise = new Promise((resolve, reject) => {
            callbacks = { resolve, reject };
        });
        this.promiseMap.set(promise, { callbacks, commandObj, transferList });
        this.runNextTask();
        return promise;
    }

    prepareCommandObject(commandObj) {
        if (!(commandObj.data instanceof Array)) return commandObj;

        const hyperCallbackIds = [];

        for (const { args: argsList } of commandObj.data) {
            for (const args of argsList) {
                for (let i = 0; i < args.length; i++) {
                    if (typeof args[i] === 'function') {
                        const hyperCallback = this.registerHyperCallback(args[i]);
                        args[i] = hyperCallback;
                        hyperCallbackIds.push(hyperCallback.id);
                    }
                }
            }
        }

        if (hyperCallbackIds.length) {
            commandObj.sendBackData = {
                ...commandObj.sendBackData,
                hyperCallbackIds
            };
        }

        return commandObj;
    }

    runNextTask() {
        if (this.isWorking) {
            return;
        }
        var next = this.promiseMap.entries().next().value;
        if (next) {
            const [promise, { callbacks, commandObj, transferList }] = next;
            this.promiseCallbacks = callbacks;
            this.currentPromise = promise;
            this.currentCommandId = this.commandCounter++;
            commandObj.sendBackData = {
                commandId: this.currentCommandId,
            };
            this.worker.postMessage(this.prepareCommandObject(commandObj), transferList);
            this.isWorking = true;
            this.promiseMap.delete(promise);
        } else {
            this.dropCurrentTask();
        }
    }

    isTaskInProcess(promise) {
        return this.currentPromise === promise;
    }

    isTaskInQueue(promise) {
        return this.promiseMap.has(promise) || this.isTaskInProcess(promise);
    }

    processAction(obj) { // usually progress messages, not the commands' finish
        switch (obj.action) {
            case 'Process':
                this.onprocess ? this.onprocess(obj.percent) : 0;
                break;
            case 'hyperCallback':
                if (this.hyperCallbacks[obj.id]) this.hyperCallbacks[obj.id](...obj.args);
                break;
        }
    }

    messageHandler({ data: obj }) {
        if (obj.action) return this.processAction(obj);

        this.isWorking = false;
        const callbacks = this.promiseCallbacks;
        const commandId = obj.sendBackData && obj.sendBackData.commandId;

        // either a result or a forgotten command returned
        if (commandId === this.currentCommandId || this.currentCommandId === null) {
            // in fact, this invocation is essential, since this.isWorking
            // isn't reset when all tasks are cancelled.
            // So we still wait for a cancelled task to finish - it's important, because otherwise
            // cancelAllTasks() would have no sense - the real worker's queue would be overwhelmed with "current" tasks,
            // which cannot be cancelled once sent, while now it's possible to really cancel all tasks several times
            // while some other task is being processed in the worker.
            // Real example: a user is quickly turning over pages in the single page mode in the viewer.
            // commandIds only prevent us from forgetting current task
            // in case when something comes from the worker and it's not an action
            // (it shouldn't happen, just an additional measure)
            this.runNextTask();
        } else {
            // it shouldn't happen, it means that one more task has been already sent
            // without waiting for a forgotten one. Or an action is sent incorrectly.
            console.warn('DjVu.js: Something strange came from the worker.', obj);
            return;
        }

        if (!callbacks) return; // in case of all tasks cancellation

        const { resolve, reject } = callbacks;
        switch (obj.command) {
            case 'Error':
                reject(obj.error);
                break;
            case 'createDocument':
            case 'startMultiPageDocument':
            case 'addPageToDocument':
                resolve();
                break;
            case 'createDocumentFromPictures':
            case 'endMultiPageDocument':
                resolve(obj.buffer);
                break;
            case 'run':
                var restoredResult = !obj.result ? obj.result :
                    obj.result.length && obj.result.map ? obj.result.map(result => this.restoreValueAfterTransfer(result)) :
                        this.restoreValueAfterTransfer(obj.result);
                resolve(restoredResult);
                break;
            default:
                console.error("Unexpected message from DjVuWorker: ", obj);
        }

        if (obj.sendBackData && obj.sendBackData.hyperCallbackIds) {
            obj.sendBackData.hyperCallbackIds.forEach(id => this.unregisterHyperCallback(id));
        }
    }

    restoreValueAfterTransfer(value) {
        if (value) {
            if (value.width && value.height && value.buffer) {
                return new ImageData(new Uint8ClampedArray(value.buffer), value.width, value.height);
            }
        }
        return value;
    }

    /** @param {Array<DjVuWorkerTask} tasks */
    run(...tasks) {
        const data = tasks.map(task => task._);
        return this.createNewPromise({
            command: 'run',
            data: data,
            //time: Date.now(),
        });
    }

    revokeObjectURL(url) { // if an ObjectURL was created inside a worker it can be revoked only inside this very worker
        this.worker.postMessage({
            action: this.revokeObjectURL.name,
            url: url,
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

    createDocument(buffer, options) {
        return this.createNewPromise({ command: 'createDocument', buffer: buffer, options: options }, [buffer]);
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
}

class DjVuWorkerTask {

    /**
     * @param {DjVuWorker} worker
     */
    static instance(worker, funcs = [], args = []) {
        var proxy = new Proxy(DjVuWorkerTask.emptyFunc, {
            get: (target, key) => {
                switch (key) {
                    case '_':
                        return { funcs, args };
                    case 'run':
                        return () => worker.run(proxy);
                    default:
                        return DjVuWorkerTask.instance(worker, [...funcs, key], args);
                }
            },
            apply: (target, that, _args) => { // when method is called, just add args to the array
                return DjVuWorkerTask.instance(worker, funcs, [...args, _args]);
            }
        });
        return proxy;
    }

    static emptyFunc() { }
}