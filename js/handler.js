'use strict';
(function() {
var canvas = document.getElementById("canvas");
var output = document.getElementById("output2");
function write(str) {
    output.innerText = str;
}
canvas.onclick = function (e) {
    var rect = this.getBoundingClientRect();
    write((e.clientX - rect.left) + " " + (e.clientY - rect.top));
}
})();