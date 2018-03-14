var DjVu = {
    VERSION: '0.1.0',
    IS_DEBUG: false,
    setDebugMode: (flag) => DjVu.IS_DEBUG = flag
};

DjVu.Utils = {
    /**
     *  @returns {Promise<ArrayBuffer>}
     */
    loadFile(url, responseType = 'arraybuffer') {
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = responseType;
            xhr.onload = (e) => {
                if (xhr.status !== 200) {
                    return reject({ message: "Something went wrong!", xhr: xhr })
                }
                DjVu.IS_DEBUG && console.log("File loaded: ", e.loaded);
                resolve(xhr.response);
            };
            xhr.send();
        });
    }
};

export default DjVu;