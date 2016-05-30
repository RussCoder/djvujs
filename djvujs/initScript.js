"use strict";
var fileSize = 0;

function include(url) {
    var script = document.createElement('script');
    script.src = url;
    document.head.appendChild(script);
    console.log("included: " + url);
}

var output;
window.onload = function() {
    output = document.getElementById("output");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "samples/js.djvu");
    xhr.responseType = "arraybuffer";
    xhr.onload = function(e) {
        console.log(e.loaded);
        fileSize = e.loaded;
        var buf = xhr.response;
        var viewer = new DataView(buf);
        readDjvu(buf);
    }
    xhr.send();
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
function readDjvu(buf) {
    var link = document.querySelector('#dochref');
    var time = performance.now();
    console.log("Buffer length = " + buf.byteLength);
    var canvas = document.getElementById('canvas');
    var c = canvas.getContext('2d');
    Globals.defaultDPI = 100;
    Globals.Timer = new DebugTimer();
    Globals.canvas = canvas;
    Globals.canvasCtx = c;
    Globals.dict = [];
    Globals.img = document.getElementById('img');  
    
    //BZZtest();
    var doc = new DjVuDocument(buf);
    //console.log("REAL COUNT ", doc.countFiles());
    var ndoc = doc.slice(0, doc.pages.length / 2);
    //var page = doc.pages[10];
    //Globals.drawImageSmooth(page.getImage(), page.dpi);
    //Globals.drawImageSmooth(page.getImage(), page.dpi);
    
    link.href = ndoc.createObjectURL();
    
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