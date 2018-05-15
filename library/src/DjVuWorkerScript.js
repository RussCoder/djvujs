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

    // обрабочик приема событий
    onmessage = function (oEvent) {
        try { // отлавливаем все исключения
            var obj = oEvent.data;
            handlers[obj.command](obj);
        } catch (error) {
            // we can't pass the native Error object between workers, so only several properties are copied
            var errorObj = error instanceof DjVuError ? error : {
                code: DjVuErrorCodes.UNEXPECTED_ERROR,
                name: error.name,
                message: error.message
            };
            errorObj.lastCommandObject = obj;
            postMessage({
                command: 'Error',
                error: errorObj
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
        return value;
    }

    var handlers = {

        run(obj) {
            //console.log("Got task request", Date.now() - obj.time);
            const results = obj.data.map(task => {
                try {
                    return task.funcs.reduce((res, func, i) => {
                        return res[func](...task.args[i]);
                    }, djvuDocument);
                } catch (e) {
                    if (e instanceof TypeError) {
                        throw new IncorrectTaskDjVuError(task);
                    }
                    throw e;
                }
            });

            //var time = Date.now();
            var transferList = [];
            var processedResults = results.map(result => processValueBeforeTransfer(result, transferList));

            try {
                transferList.length ? postMessage({
                    command: 'run',
                    //time: time,
                    result: processedResults.length === 1 ? processedResults[0] : processedResults
                }, transferList) : postMessage({
                    command: 'run',
                    //time: time,
                    result: processedResults.length === 1 ? processedResults[0] : processedResults
                });
            } catch (e) {
                throw new UnableToTransferDataDjVuError(obj.data);
            }
        },

        createDocumentUrl() {
            postMessage({
                command: 'createDocumentUrl',
                url: djvuDocument.createObjectURL()
            });
        },

        getContents() {
            postMessage({
                command: 'getContents',
                contents: djvuDocument.getContents()
            });
        },

        getPageNumberByUrl(obj) {
            postMessage({
                command: 'getPageNumberByUrl',
                pageNumber: djvuDocument.getPageNumberByUrl(obj.url)
            });
        },

        getPageText(obj) {
            var pagenum = +obj.pagenumber;
            var text = djvuDocument.getPage(pagenum).getText();
            postMessage({
                command: 'getPageText',
                text: text
            });
        },

        getPageImageDataWithDpi(obj) {
            var pagenum = +obj.pagenumber;
            var page = djvuDocument.getPage(pagenum);
            var imageData = page.getImageData(obj.onlyFirstBgChunk);
            var dpi = page.getDpi();
            postMessage({
                command: 'getPageImageDataWithDpi',
                buffer: imageData.data.buffer,
                width: imageData.width,
                height: imageData.height,
                dpi: dpi
            }, [imageData.data.buffer]);
        },

        getPageCount(obj) {
            postMessage({
                command: 'getPageCount',
                pageNumber: djvuDocument.pages.length
            });
        },

        getDocumentMetaData(obj) {
            var str = djvuDocument.toString(obj.html);
            postMessage({ command: 'getDocumentMetaData', str: str });
        },

        startMultiPageDocument(obj) {
            iwiw = new IWImageWriter(obj.slicenumber, obj.delayInit, obj.grayscale);
            iwiw.startMultiPageDocument();
            postMessage({ command: 'startMultiPageDocument' });
        },

        addPageToDocument(obj) {
            var imageData = new ImageData(new Uint8ClampedArray(obj.simpleImage.buffer), obj.simpleImage.width, obj.simpleImage.height);
            iwiw.addPageToDocument(imageData);
            postMessage({ command: 'addPageToDocument' });
        },

        endMultiPageDocument(obj) {
            var buffer = iwiw.endMultiPageDocument();
            postMessage({ command: 'endMultiPageDocument', buffer: buffer }, [buffer]);
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
                postMessage({ command: 'Process', percent: percent });
            };
            var ndoc = iw.createMultyPageDocument(imageArray);
            postMessage({ command: 'createDocumentFromPictures', buffer: ndoc.buffer }, [ndoc.buffer]);
        },

        slice(obj) {
            var ndoc = djvuDocument.slice(obj.from, obj.to);
            postMessage({ command: 'slice', buffer: ndoc.buffer }, [ndoc.buffer]);
        },

        createDocument(obj) {
            djvuDocument = new DjVuDocument(obj.buffer);
            postMessage({ command: 'createDocument', pagenumber: djvuDocument.pages.length });
        },

        reloadDocument() {
            djvuDocument = new DjVuDocument(djvuDocument.buffer);
        }
    };
}