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
      createDocument(obj);
      break;
    case 'getPageImageData':
      getPageImageData(obj);
      break;
    default:
      postMessage({ command: 'Error', data: 'Undefiend command' });
  }
};

function createDocument(obj) {
  var time = performance.now();
  console.log(+new Date());
  djvuDocument = new DjVuDocument(obj.buffer);
  console.log('Creation Worker', performance.now() - time);
  postMessage({ command: 'createDocument', id: obj.id });
}

function getPageImageData(obj) {
  var pagenum = +obj.pagenumber;
  var imageData = djvuDocument.pages[pagenum].getImage();
  console.log('ImageDataSize ', imageData.data.byteLength);
  console.log(+new Date());
  postMessage({
    command: 'getPageImageData',
    id: obj.id,
    buffer: imageData.data.buffer,
    width: imageData.width,
    height: imageData.height
  }, [imageData.data.buffer]);
  console.log('ImageDataSize ', imageData.data.byteLength);
}