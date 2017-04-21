'use strict';

var DjVu = {
    VERSION: '0.0.1',
    IS_DEBUG: false
};

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
                DjVu.IS_DEBUG && console.log("File loaded: ", e.loaded);
                resolve(xhr.response);
            };
            xhr.send();
        });
    }
};