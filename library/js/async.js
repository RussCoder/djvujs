"use strict";

/**
 * Скрипт для тестирования библиотеки через Web Worker
 */

var fileSize = 0;
var output;
var djvuWorker;

var timeOutput = document.querySelector('#time_output');
var renderTimeOutput = document.querySelector('#render_time_output');
var rerunButton = document.querySelector('#rerun');
rerunButton.onclick = rerun;
document.querySelector('#redraw').onclick = redrawPage;

var pageNumber = 4;
var djvuUrl = 'assets/boy.png';

document.querySelector('#next').onclick = () => {
    pageNumber++;
    redrawPage();
};

document.querySelector('#prev').onclick = () => {
    pageNumber--;
    redrawPage();
};

window.onload = function () {
    output = document.getElementById("output");
    var canvas = document.getElementById('canvas');
    var c = canvas.getContext('2d');
    Globals.defaultDPI = 100;
    Globals.Timer = new DebugTimer();
    Globals.canvas = canvas;
    Globals.canvasCtx = c;
    Globals.dict = [];
    Globals.img = document.getElementById('img');
    // testFunc();
    //loadPicture();
    renderDjVu();
    //initViewer();
    //Globals.loadFile('samples/csl.djvu').then(buf => showMetaData(buf));
}

function initViewer() {
    /** @type {DjVuViewer} */
    var viewer = new DjVuViewer('.djvu_viewer');
    viewer.loadDjVu('samples/csl.djvu');
}

function renderDjVu() {
    /** @type {DjVuWorker} */
    djvuWorker = new DjVu.Worker();
    Globals.loadFile(djvuUrl)
        .then(buffer => djvuWorker.createDocument(buffer))
        .then(() => redrawPage());
}

function redrawPage() {
    console.log('**** Render Page ****');
    var time = performance.now();
    return Promise.all([
        djvuWorker.getPageText(pageNumber), 
        djvuWorker.getPageImageDataWithDpi(pageNumber, true)
    ]).then(data => {
        output.innerText = data[0];
        Globals.drawImage(data[1].imageData, data[1].dpi * 1.5);
        time = performance.now() - time;
        console.log("Redraw time", time);
        console.log('**** ***** **** ****');
        renderTimeOutput.innerText = Math.round(time);
        time = performance.now();
        return djvuWorker.getPageImageDataWithDpi(pageNumber);
    }).then(data => {
        Globals.drawImage(data.imageData, data.dpi * 1.5);
        console.log("Refine time", performance.now() - time);
        console.log('**** ***** **** ****');
    })
}

function loadPicture() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "samples/bear.jpg");
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
        var iwiw = new IWImageWriter(90, 0, 0);
        var doc = iwiw.createMultyPageDocument([imageData, imageData, imageData]);
        // var doc = iwiw.createOnePageDocument(imageData);
        console.log('docCreateTime = ', performance.now() - pictureTotalTime);
        var link = document.querySelector('#dochref');
        link.href = doc.createObjectURL();

        c.putImageData(doc.pages[0].getImage(), 0, 0);
        console.log('Counter', Globals.counter);
        //console.log('PZP', Globals.pzp.log.length, ' ', Globals.pzp.offset );
        writeln(doc.toString());
        console.log('pictureTotalTime = ', performance.now() - pictureTotalTime);
    });

}

function showMetaData(buffer) {
    var worker = new DjVuWorker();
    worker.createDocument(buffer)
        .then(() => worker.getDocumentMetaData(true))
        .then(text => writeln(text));
}

function readDjvu(buf) {
    console.log("DJ1");
    var link = document.querySelector('#dochref');
    var time = performance.now();
    console.log("Buffer length = " + buf.byteLength);
    //var doc = new DjVuDocument(buf);
    Globals.counter = 0;
    var worker = new DjVuWorker();

    setTimeout(() => {
        Globals.Timer.start('TotalTime');
        worker.createDocument(buf)
            .then(() => {
                Globals.Timer.end('TotalTime', true);
                return worker.getDocumentMetaData(true);
            })
            .then((str) => {
                //link.href = DjVuWorker.createArrayBufferURL(buffer)
                writeln(str);
                Globals.Timer.end('TotalTime', true);
            });

    }, 1000);


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
