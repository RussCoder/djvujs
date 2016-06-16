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

// обрабочик приема событий
onmessage = function (oEvent) {
  var obj = oEvent.data;
  switch (obj.command) {
    case 'createDocument':
      djvuDocument = new DjVuDocument(obj.buffer);
      break;
    case 'getPageImageData':
      getPageImageData(obj);
      break;
    default:
      postMessage({ command: 'Error', data: 'Undefiend command' });
  }
};

function getPageImageData(obj) {
  var pagenum = +obj.pagenumber;
  var imageData = djvuDocument.pages[pagenum].getImage();
  postMessage({ command: 'getPageImageData', imageData: imageData });
}