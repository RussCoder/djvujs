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
    xhr.open("GET", "samples/cs.djvu");
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
    Globals.Timer = new DebugTimer();
    Globals.canvas = canvas;
    Globals.canvasCtx = c;
    Globals.dict = [];
    Globals.img = document.getElementById('img');
    Globals.drawImage = function(image, scale) {
        var tmp;
        scale = scale || 4;
        Globals.canvas.width = image.width;
        this.canvas.height = image.height;
        Globals.canvasCtx.putImageData(image, 0, 0);
        var time = performance.now();
        this.img.src = this.canvas.toDataURL();
        console.log("DataURL creating time = ", performance.now() - time);
        this.img.width = image.width / scale;
        // console.log(this.canvas.parentNode);
        (tmp = this.canvas.parentNode) ? tmp.removeChild(this.canvas) : 0;
    }

    //BZZtest();
    var doc = new DjVuDocument(buf);
    console.log("REAL COUNT ", doc.countFiles());
    //var ndoc = doc.slice(0, (doc.pages.length / 2) >> 2);
    //Globals.drawImage(ndoc.pages[16].getImage());
    
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

