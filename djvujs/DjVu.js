'use strict';

var DjVu = {
    VERSION: '0.0.4',
    IS_DEBUG: false
};

DjVu.Utils = {
    /**
     *  @returns {Promise<ArrayBuffer>}
     */
    loadFile(url, responseType = 'arraybuffer') {
        return new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = responseType;
            xhr.onload = (e) => {
                DjVu.IS_DEBUG && console.log("File loaded: ", e.loaded);
                resolve(xhr.response);
            };
            xhr.send();
        });
    }
};