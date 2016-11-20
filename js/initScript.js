"use strict";

/**
 * Скрипт для тестирования библиотеки непосредственно в синхронном режиме
 */

var fileSize = 0;
var output;

window.onload = function () {
    output = document.getElementById("output");
    Globals.init();
    // testFunc();
    loadDjVu();
    //loadPicture();
}
function loadDjVu() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "samples/colorbook.djvu");
    xhr.responseType = "arraybuffer";
    xhr.onload = function (e) {
        console.log(e.loaded);
        fileSize = e.loaded;
        var buf = xhr.response;
        readDjvu(buf);
    }
    xhr.send();
}
function loadPicture() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "samples/bigfoto.jpg");
    xhr.responseType = "arraybuffer";
    xhr.onload = function (e) {
        console.log(e.loaded);
        fileSize = e.loaded;
        var buf = xhr.response;
        readPicture(buf);
    }
    xhr.send();
}
function readPicture(buffer) {

    createImageBitmap(new Blob([buffer])).then(function (image) {
        var pictureTotalTime = performance.now();
        var canvas = document.getElementById('canvas2');
        var c = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;

        c.drawImage(image, 0, 0);
        var imageData = c.getImageData(0, 0, image.width, image.height);
        var iwiw = new IWImageWriter(90, 0, 1);
        // var doc = iwiw.createMultyPageDocument([imageData, imageData, imageData]);
        iwiw.startMultyPageDocument();
        iwiw.addPageToDocument(imageData);
        //for (var i = 0; i < 5; i++) 
        var buffer = iwiw.endMultyPageDocument();
        //var doc = new DjVuDocument(buffer);
        // var doc = iwiw.createOnePageDocument(imageData);
        console.log('docCreateTime = ', performance.now() - pictureTotalTime);
        var link = document.querySelector('#dochref');
        link.href = DjVuWorker.createArrayBufferURL(buffer);

        // c.putImageData(doc.pages[0].getImage(), 0, 0);
        console.log('Counter', Globals.counter);
        //console.log('PZP', Globals.pzp.log.length, ' ', Globals.pzp.offset );
        // writeln(doc.toString());
        console.log('pictureTotalTime = ', performance.now() - pictureTotalTime);
    });

}
function readDjvu(buf) {
    console.log("DJ1");
    var link = document.querySelector('#dochref');
    var time = performance.now();
    console.log("Buffer length = " + buf.byteLength);
    var doc = new DjVuDocument(buf);
    Globals.counter = 0;
    /*var worker = new DjVuWorker();
    worker.createDocument(buf);*/
    /*worker.getPageImageData(3, function (imageData) {
        //Globals.canvasCtx.putImageData(imageData, 0, 0);
        Globals.drawImageSmooth(imageData, 600);
        console.log("Total execution time = ", performance.now() - time);
    });*/
    //Globals.canvasCtx.putImageData(doc.pages[0].getImage(), 0, 0);
    //link.href = ndoc.createObjectURL();
    //writeln(doc.toString());
    //writeln(djvuPage.toString());

    /*var dpi = doc.pages[0].init().dpi;
    var image = doc.pages[0].getImageData();
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    var scale = dpi / 100;

    ctx.putImageData(image, 0, 0);
    canvas.style.maxWidth = image.width * 2 / scale + "px";
    canvas.style.maxWidth = image.width  / scale + "px";*/

    Globals.drawImageSmooth(doc.pages[0].getImageData(), doc.pages[0].dpi);
    writeln(doc.toString());
    console.log(Globals.Timer.toString());
    console.log("Total execution time = ", performance.now() - time);
}

/**
 * Функция для работы с файлами загруженными вручную.
 */
function main(files) {
    clear();
    console.log(files.length);
    //readFile(file);
    var fileReader = new FileReader();
    var doc1, doc2;
    fileReader.onload = function () {
        if (!doc1) {
            doc1 = new DjVuDocument(this.result);
            fileReader.readAsArrayBuffer(files[1]);
            return;
        }

        doc2 = new DjVuDocument(this.result);
        testFunc(doc1, doc2);

    };
    if (files.length > 0) {
        fileReader.readAsArrayBuffer(files[0]);
    }
}

function testFunc(doc1, doc2) {
    var doc = DjVuDocument.concat(doc1, doc2);
    Globals.drawImageSmooth(doc.pages[0].getImage(), 600);
    writeln(doc.toString());
    var link = document.querySelector('#dochref');
    link.href = doc.createObjectURL();
}
