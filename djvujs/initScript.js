"use strict";

var fileSize = 0;
var output;

function include(url) {
    var script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
    console.log("included: " + url);
}

function writeln(str) {
    str = str || "";
    output.innerHTML += str + "<br>";
}
function write(str) {
    output.innerHTML += str;
}
function clear() {
    output.innerHTML = "";
}

window.onload = function() {
    output = document.getElementById("output");
    var canvas = document.getElementById('canvas');
    var c = canvas.getContext('2d');
    Globals.defaultDPI = 100;
    Globals.Timer = new DebugTimer();
    Globals.canvas = canvas;
    Globals.canvasCtx = c;
    Globals.dict = [];
    Globals.img = document.getElementById('img');
    //loadDjVu();
    loadPicture();
}

function loadDjVu() {
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "samples/js.djvu");
    xhr.responseType = "arraybuffer";
    xhr.onload = function(e) {
        console.log(e.loaded);
        fileSize = e.loaded;
        var buf = xhr.response;
        readDjvu(buf);
    }
    xhr.send();
}

function loadPicture() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "samples/r.jpg");
    xhr.responseType = "arraybuffer";
    xhr.onload = function(e) {
        console.log(e.loaded);
        fileSize = e.loaded;
        var buf = xhr.response;
        readPicture(buf);
    }
    xhr.send();
}


function readPicture(buffer) {
    var pictureTotalTime = performance.now();
    createImageBitmap(new Blob([buffer]))
    .then(function(image) {
        Globals.canvasCtx.drawImage(image, 0, 0);
        var imageData = Globals.canvasCtx.getImageData(0, 0, 192, 256);
        var  iwiw = new IWImageWriter(imageData);
        Globals.canvasCtx.putImageData(iwiw.test(), 0, 0);
    });
    console.log('pictureTotalTime = ', performance.now() - pictureTotalTime);
}

function readDjvu(buf) {
    var link = document.querySelector('#dochref');
    var time = performance.now();
    console.log("Buffer length = " + buf.byteLength);
    
    
    //BZZtest();
    var doc = new DjVuDocument(buf);
    //console.log("REAL COUNT ", doc.countFiles());
    //var ndoc = doc.slice(0, doc.pages.length / 2);
    //var page = doc.pages[10];
    //Globals.drawImageSmooth(page.getImage(), page.dpi);
    //Globals.drawImageSmooth(page.getImage(), page.dpi);
    
    //link.href = ndoc.createObjectURL();
    
    writeln(doc.toString());
    // c.putImageData(doc.pages[0].getImage(), 0, 0);
    //writeln(djvuPage.toString());
    //ZPtest();
    console.log(Globals.Timer.toString());
    console.log("Total execution time = ", performance.now() - time)

}

function main(file) {
    clear();
    readFile(file);
    writeln(file.size);
}
