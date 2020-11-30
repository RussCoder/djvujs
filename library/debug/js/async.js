"use strict";

/**
 * Скрипт для тестирования библиотеки через Web Worker
 */

var fileSize = 0;
var output;
var worker;

var timeOutput = document.querySelector('#time_output');
var renderTimeOutput = document.querySelector('#render_time_output');
var rerunButton = document.querySelector('#rerun');
rerunButton.onclick = rerun;
document.querySelector('#redraw').onclick = redrawPage;

var pageNumber = 1;
var djvuUrl = '/assets/DjVu3Spec_indirect/index.djvu';
var baseUrl = '/assets/DjVu3Spec_indirect/';

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

async function renderDjVu() {
    /** @type {DjVuWorker} */
    worker = new DjVu.Worker();
    const buffer = await fetch(djvuUrl).then(r => r.arrayBuffer());
    await worker.createDocument(buffer, { baseUrl });

    // const bundle = await worker.doc.bundle(progress => {
    //     console.log(progress);
    // }).run();

    await redrawPage();
}

async function redrawPage() {
    console.log('**** Render Page ****');
    var time = performance.now();
    var [imageData, dpi] = await worker.run(
        worker.doc.getPage(pageNumber).getImageData(),
        worker.doc.getPage(pageNumber).getDpi()
    );
    Globals.drawImage(imageData, dpi * 1.5);
    time = performance.now() - time;
    console.log("Redraw time", time);
    console.log('**** ***** **** ****');
    renderTimeOutput.innerText = Math.round(time);
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
                //link.href = URL.createObjectURL(new Blob([buffer]))
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
