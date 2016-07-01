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

var djvuDocument; // главный объект документа
var iwiw; // объект записи документов
var Globals = {};
Globals.Timer = new DebugTimer();

// обрабочик приема событий
onmessage = function (oEvent) {
  try { // отлавливаем все исключения 
    var obj = oEvent.data;
    switch (obj.command) {
      case 'createDocument':
        createDocument(obj);
        break;
      case 'getPageImageData':
        getPageImageData(obj);
        break;
      case 'slice':
        slice(obj);
        break;
      case 'createDocumentFromPictures':
        createDocumentFromPictures(obj);
        break;
      case 'startMultyPageDocument':
        startMultyPageDocument(obj)
        break;
      case 'addPageToDocument':
        addPageToDocument(obj);
        break;
      case 'endMultyPageDocument':
        endMultyPageDocument(obj);
        break;
    }
  } catch (error) {
    postMessage({ command: 'Error', id: obj.id, message: error.message });
  }
};

function startMultyPageDocument(obj) {
  iwiw = new IWImageWriter(obj.slicenumber, obj.delayInit, obj.grayscale);
  iwiw.startMultyPageDocument();
  postMessage({ command: 'createDocumentFromPictures', id: obj.id });
}

function addPageToDocument(obj) {
  var imageData = new ImageData(new Uint8ClampedArray(obj.simpleImage.buffer), obj.simpleImage.width, obj.simpleImage.height);
  iwiw.addPageToDocument(imageData);
  postMessage({ command: 'addPageToDocument', id: obj.id });
}

function endMultyPageDocument(obj) {
  var buffer = iwiw.endMultyPageDocument();
  postMessage({ command: 'endMultyPageDocument', id: obj.id, buffer: buffer}, [buffer]);
}

function createDocumentFromPictures(obj) {
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
}


function slice(obj) {
  var ndoc = djvuDocument.slice(obj.from, obj.to);
  postMessage({ command: 'slice', id: obj.id, buffer: ndoc.buffer }, [ndoc.buffer]);
}

function createDocument(obj) {
  djvuDocument = new DjVuDocument(obj.buffer);
  postMessage({ command: 'createDocument', id: obj.id, pagenumber: djvuDocument.pages.length });
}

function getPageImageData(obj) {
  var pagenum = +obj.pagenumber;
  var imageData = djvuDocument.pages[pagenum].getImage();
  postMessage({
    command: 'getPageImageData',
    id: obj.id,
    buffer: imageData.data.buffer,
    width: imageData.width,
    height: imageData.height
  }, [imageData.data.buffer]);
}