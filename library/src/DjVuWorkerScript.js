import DjVuDocument from './DjVuDocument';
import IWImageWriter from './iw44/IWImageWriter';
import { DjVuError, DjVuErrorCodes, IncorrectTaskDjVuError, UnableToTransferDataDjVuError } from './DjVuErrors';

/**
 * Это скрипт для выполнения в фоновом потоке.
 */
export default function initWorker() {

    /** @type {DjVuDocument} */
    var djvuDocument; // главный объект документа
    /** @type {IWImageWriter} */
    var iwiw; // объект записи документов

    addEventListener("error", e => {
        console.error(e);
        postMessage("error");
    });

    addEventListener("unhandledrejection", e => {
        console.error(e);
        postMessage("unhandledrejection");
    });

    // обработчик приема событий
    onmessage = async function ({ data: obj }) {
        if (obj.action) return handlers[obj.action](obj); // action that doesn't require response

        try { // отлавливаем все исключения
            const { data, transferList } = await handlers[obj.command](obj) || {};
            try {
                postMessage({
                    command: obj.command,
                    ...data,
                    ...(obj.sendBackData ? { sendBackData: obj.sendBackData } : null),
                }, transferList && transferList.length ? transferList : undefined);
            } catch (e) {
                throw new UnableToTransferDataDjVuError(obj.data);
            }
        } catch (error) {
            console.error(error);
            // we can't pass the native Error object between workers, so only several properties are copied
            var errorObj = error instanceof DjVuError ? error : {
                code: DjVuErrorCodes.UNEXPECTED_ERROR,
                name: error.name,
                message: error.message
            };
            errorObj.commandObject = obj;
            postMessage({
                command: 'Error',
                error: errorObj,
                ...(obj.sendBackData ? { sendBackData: obj.sendBackData } : null),
            });
        }
    };

    function processValueBeforeTransfer(value, transferList) {
        if (value instanceof ArrayBuffer) {
            transferList.push(value);
            return value;
        }
        if (value instanceof ImageData) {
            transferList.push(value.data.buffer);
            return {
                width: value.width,
                height: value.height,
                buffer: value.data.buffer
            };
        }
        if (value instanceof DjVuDocument) {
            transferList.push(value.buffer);
            return value.buffer;
        }
        return value;
    }

    function restoreHyperCallbacks(args) {
        // we should not change the initial array,
        // cause it is sent back in case of error, and a function cannot be sent
        return args.map(arg => {
            if (arg && (typeof arg === 'object') && arg.hyperCallback) {
                return (...params) => postMessage({
                    action: 'hyperCallback',
                    id: arg.id,
                    args: params
                });
            }
            return arg;
        });
    }

    var handlers = {

        /* A universal command which handles all tasks created via doc proxy property of the DjVuWorker class */
        async run(obj) {
            //console.log("Got task request", Date.now() - obj.time);
            const results = await Promise.all(obj.data.map(async task => {
                var res = djvuDocument;
                for (var i = 0; i < task.funcs.length; i++) {
                    if (typeof res[task.funcs[i]] !== 'function') {
                        throw new IncorrectTaskDjVuError(task);
                    }
                    res = await res[task.funcs[i]](...restoreHyperCallbacks(task.args[i]));
                }
                return res;
            }));

            //var time = Date.now();
            var transferList = [];
            var processedResults = results.map(result => processValueBeforeTransfer(result, transferList));

            return {
                data: {
                    result: processedResults.length === 1 ? processedResults[0] : processedResults
                },
                transferList
            };
        },

        revokeObjectURL(obj) {
            URL.revokeObjectURL(obj.url);
        },

        startMultiPageDocument(obj) {
            iwiw = new IWImageWriter(obj.slicenumber, obj.delayInit, obj.grayscale);
            iwiw.startMultiPageDocument();
        },

        addPageToDocument(obj) {
            var imageData = new ImageData(new Uint8ClampedArray(obj.simpleImage.buffer), obj.simpleImage.width, obj.simpleImage.height);
            iwiw.addPageToDocument(imageData);
        },

        endMultiPageDocument(obj) {
            var buffer = iwiw.endMultiPageDocument();
            return {
                data: { buffer: buffer },
                transferList: [buffer]
            };
        },

        createDocumentFromPictures(obj) {
            var sims = obj.images;
            var imageArray = new Array(sims.length);
            // собираем объекты ImageData
            for (var i = 0; i < sims.length; i++) {
                imageArray[i] = new ImageData(new Uint8ClampedArray(sims[i].buffer), sims[i].width, sims[i].height);
            }
            var iw = new IWImageWriter(obj.slicenumber, obj.delayInit, obj.grayscale);
            iw.onprocess = (percent) => {
                postMessage({ action: 'Process', percent: percent });
            };
            var ndoc = iw.createMultyPageDocument(imageArray);
            return {
                data: { buffer: ndoc.buffer },
                transferList: [ndoc.buffer]
            };
        },

        createDocument(obj) {
            djvuDocument = new DjVuDocument(obj.buffer, obj.options);
        },
    };
}