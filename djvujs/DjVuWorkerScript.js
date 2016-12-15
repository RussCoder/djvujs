'use strict';

/**
 * Это скрипт для выполнения в фоновом потоке. 
 */
// подгружаем всю библиотеку, адреса относительно директории DjVuWorkerScript    
importScripts(
  "DjVuGlobals.js",
  'ByteStream.js',
  "ZPCodec.js",
  "IFFChunks.js",
  "BZZDecoder.js",
  "BZZEncoder.js",
  "IWCodecBaseClass.js",
  "IWDecoder.js",
  "IWEncoder.js",
  "IWImage.js",
  "JB2Codec.js",
  "JB2Dict.js",
  "JB2Image.js",
  "DjViChunk.js",
  "DjVuPage.js",
  "DjVuDocument.js",
  "debug.js",
  "ByteStreamWriter.js",
  "IWImageWriter.js",
  "DjVuWriter.js");
/** @type {DjVuDocument} */
var djvuDocument; // главный объект документа
var iwiw; // объект записи документов
var Globals = {};
Globals.Timer = new DebugTimer();

// обрабочик приема событий
onmessage = function (oEvent) {
  try { // отлавливаем все исключения 
    var obj = oEvent.data;
    handlers[obj.command](obj);
  } catch (error) {
    postMessage({ command: 'Error', id: obj.id, message: error.message });
  }
};

var handlers = {
  getPageImageDataWithDPI(obj) {
    var pagenum = +obj.pagenumber;
    console.log(djvuDocument, pagenum);
    var imageData = djvuDocument.pages[pagenum].getImageData();
    var dpi = djvuDocument.pages[pagenum].dpi;
    postMessage({
      command: 'getPageImageDataWithDPI',
      id: obj.id,
      buffer: imageData.data.buffer,
      width: imageData.width,
      height: imageData.height,
      dpi: dpi
    }, [imageData.data.buffer]);
  },

  getPageNumber(obj) {
    postMessage({
      command: 'getPageNumber',
      id: obj.id,
      pageNumber: djvuDocument.pages.length
    });
  },

  getDocumentMetaData(obj) {
    var str = djvuDocument.toString(obj.html);
    postMessage({ command: 'getDocumentMetaData', id: obj.id, str: str });
  },

  startMultyPageDocument(obj) {
    iwiw = new IWImageWriter(obj.slicenumber, obj.delayInit, obj.grayscale);
    iwiw.startMultyPageDocument();
    postMessage({ command: 'createDocumentFromPictures', id: obj.id });
  },

  addPageToDocument(obj) {
    var imageData = new ImageData(new Uint8ClampedArray(obj.simpleImage.buffer), obj.simpleImage.width, obj.simpleImage.height);
    iwiw.addPageToDocument(imageData);
    postMessage({ command: 'addPageToDocument', id: obj.id });
  },

  endMultyPageDocument(obj) {
    var buffer = iwiw.endMultyPageDocument();
    postMessage({ command: 'endMultyPageDocument', id: obj.id, buffer: buffer }, [buffer]);
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
    }
    var ndoc = iw.createMultyPageDocument(imageArray);
    postMessage({ command: 'createDocumentFromPictures', id: obj.id, buffer: ndoc.buffer }, [ndoc.buffer]);
  },

  slice(obj) {
    var ndoc = djvuDocument.slice(obj.from, obj.to);
    postMessage({ command: 'slice', id: obj.id, buffer: ndoc.buffer }, [ndoc.buffer]);
  },

  createDocument(obj) {
    djvuDocument = new DjVuDocument(obj.buffer);
    postMessage({ command: 'createDocument', id: obj.id, pagenumber: djvuDocument.pages.length });
  }
};