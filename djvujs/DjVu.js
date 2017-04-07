'use strict';

var DjVu = {};

DjVu.Utils = {
    /**
     *  @returns {Promise<ArrayBuffer>}
     */
    loadFile(url) {
        return new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = "arraybuffer";
            xhr.onload = (e) => {
                console.log("File loaded: ", e.loaded);
                resolve(xhr.response);
            };
            xhr.send();
        });
    }
};