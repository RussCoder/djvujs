"use strict";

/**
 * Скрипт для тестирования библиотеки непосредственно в синхронном режиме
 */

DjVu.setDebugMode(true);

var fileSize = 0;
var output;
var djvuArrayBuffer;
var djvuDocument;
var timeOutput = document.querySelector('#time_output');
var renderTimeOutput = document.querySelector('#render_time_output');
var rerunButton = document.querySelector('#rerun');
rerunButton.onclick = rerun;
document.querySelector('#redraw').onclick = redrawPage;

var pageNumber = 1;
var djvuUrl = 'assets/carte.djvu';

document.querySelector('#next').onclick = () => {
    pageNumber++;
    redrawPage();
};

document.querySelector('#prev').onclick = () => {
    pageNumber--;
    redrawPage();
}

function saveStringAsFile(string) {
    var link = document.createElement('a');
    link.download = 'string.txt';
    var blob = new Blob([string], { type: 'text/plain' });
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

function saveStringAsBinFile(string) {
    var link = document.createElement('a');
    link.download = 'string.bin';
    var array = new Uint16Array(string.length);
    for (var i = 0; i < string.length; i++) {
        array[i] = string.charCodeAt(i);
    }
    var blob = new Blob([array], { type: 'application/octet-binary' });
    link.href = window.URL.createObjectURL(blob);
    link.click();
}

function rerun() {
    Globals.init();
    Globals.clearCanvas();

    setTimeout(() => {
        var start = performance.now();
        readDjvu(djvuArrayBuffer);
        var time = performance.now() - start;
        timeOutput.innerText = Math.round(time);
    }, 0);
}

window.onload = function () {
    output = document.getElementById("output");
    Globals.init();
    // testFunc();
    loadDjVu();
    //loadPicture(); 
}

function loadDjVu() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", djvuUrl);
    xhr.responseType = "arraybuffer";
    xhr.onload = function (e) {
        console.log(e.loaded);
        fileSize = e.loaded;
        djvuArrayBuffer = xhr.response;
        rerun();
        //splitDjvu(buf);
    }
    xhr.send();
}

function loadPicture() {
    Globals.loadFile('samples/csl.djvu').then(buffer => {
        readDjvu(buffer);
    });
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
    var link = document.querySelector('#dochref');
    var time = performance.now();
    console.log("Buffer length = " + buf.byteLength);
    djvuDocument = new DjVu.Document(buf);
    Globals.counter = 0;

    writeln(djvuDocument.toString(true));
    //return;
    //saveStringAsFile(JSON.stringify(djvuDocument.getContents()));

    //writeln(djvuDocument.pages[pageNumber].getText());
    //redrawPage();
    //saveStringAsBinFile(djvuDocument.toString());
    // doc.countFiles();
    //console.log(Globals.Timer.toString());
    console.log("Total execution time = ", performance.now() - time);
}

function redrawPage() {
    console.log('**** Render Page ****');
    var time = performance.now();
    var page = djvuDocument.getPage(pageNumber);
    Globals.drawImage(
        page.getImageData(),
        page.getDpi() * 1.5
    );
    //console.log(doc.pages[pageNumber].getText());
    time = performance.now() - time;
    console.log("Redraw time", time);
    console.log('**** ***** **** ****');

    renderTimeOutput.innerText = Math.round(time);

    // setTimeout(() => {
    //     console.log('**** Refine Page ****');
    //     var time = performance.now();
    //     Globals.drawImage(
    //         page.getImageData(),
    //         page.getDpi() * 1.5
    //     );
    //     time = performance.now() - time;
    //     console.log("Refine time", time);
    //     console.log('**** ***** **** ****');
    // }, 50);

}

function splitDjvu(buf) {
    var link = document.querySelector('#dochref');
    console.log("Buffer length = " + buf.byteLength);
    var doc = new DjVuDocument(buf);
    var slice = doc.slice(0, 11);
    link.href = slice.createObjectURL();
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
