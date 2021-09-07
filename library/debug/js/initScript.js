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
var djvuUrl = 'assets/DjVu3Spec_5-10.djvu';
// var djvuUrl = 'assets/carte.djvu';
var baseUrl = 'assets/DjVu3Spec_indirect/';

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

function saveImage(imageData) {
    var canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    var ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    var link = document.createElement('a');
    link.download = 'image.png';
    link.href = canvas.toDataURL();
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

    setTimeout(async () => {
        var start = performance.now();
        await readDjvu(djvuArrayBuffer);
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
        link.href = URL.createObjectURL(new Blob([buffer]));

        // c.putImageData(doc.pages[0].getImage(), 0, 0);
        console.log('Counter', Globals.counter);
        //console.log('PZP', Globals.pzp.log.length, ' ', Globals.pzp.offset );
        // writeln(doc.toString());
        console.log('pictureTotalTime = ', performance.now() - pictureTotalTime);
    });
}

const sleep = (timeout = 0) => new Promise(resolve => setTimeout(resolve, timeout));

async function readDjvu(buf) {
    console.log('redraw');
    var link = document.querySelector('#dochref');
    var time = performance.now();
    console.log("Buffer length = " + buf.byteLength);
    djvuDocument = new DjVu.Document(buf, { baseUrl: baseUrl });
    //console.log(djvuDocument.toString());
    Globals.counter = 0;

    // console.time('Document bundle');
    // const bundle = await djvuDocument.bundle(p => {
    //     console.log(p  * 100);
    // });
    // console.timeEnd('Document bundle');

    // link.href = bundle.createObjectURL();

    //writeln(djvuDocument.toString(true));

    //saveStringAsFile(djvuDocument.toString())
    //return;
    //saveStringAsFile(JSON.stringify(djvuDocument.getContents()));

    // const text = (await djvuDocument.getPage(pageNumber)).getText();
    // console.log(text.length, text);
    // writeln(text);
    await redrawPage();
    //saveStringAsBinFile(djvuDocument.toString());
    // doc.countFiles();
    //console.log(Globals.Timer.toString());
    console.log("Total execution time = ", performance.now() - time);
}

async function redrawPage() {
    console.log('**** Render Page ****');
    var time = performance.now();
    var page = await djvuDocument.getPage(pageNumber);
    var imageData = page.getImageData();
    const dpi = page.getDpi();
    //page.reset();
    //saveImage(imageData);
    Globals.drawImage(
        imageData,
        dpi * 4
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

function prepareIframe() {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
        width: 0;
        height: 0;
        position: absolute;
        left: 0;
        top: 0;
        opacity: 0;
    `;
    document.body.appendChild(iframe);
    return iframe;
}

document.querySelector(('#print_button')).onclick = async () => {
    const iframe = prepareIframe();

    // await sleep(1);

    console.log(iframe.contentWindow);
    const promises = [];
    for (let i = 1; i <= 2; i++) {
        const page = await djvuDocument.getPage(i);
        const image = await page.createPngObjectUrl();

        const img = iframe.contentWindow.document.createElement('img');
        promises.push(new Promise(resolve => img.onload = resolve));
        img.style.display = 'block';
        img.style.breakAfter = 'page';
        img.style.breakInside = 'avoid';
        img.style.margin = '0 auto';
        img.src = image.url;
        img.width = image.width;
        img.height = image.height;
        img.style.width = (image.width / image.dpi) + 'in';
        img.style.height = (image.height / image.dpi) + 'in';
        iframe.contentWindow.document.body.appendChild(img);
    }

    window.w = iframe.contentWindow;

    if (/Firefox/.test(navigator.userAgent)) {
        iframe.contentWindow.print();
    } else {
        await Promise.all(promises);
        iframe.contentWindow.print();
    }
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
