var DjVu = {
    VERSION: '0.1.5',
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

/**
 * Creates an array of Unicode code points from an array, representing a utf8 encoded string
 */
export function utf8ToCodePoints(utf8array) {
    var i, c;
    var codePoints = [];

    i = 0;
    while (i < utf8array.length) {
        c = utf8array[i++];
        switch (c >> 4) {
            case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                // 0xxx xxxx
                codePoints.push(c);
                break;
            case 12: case 13:
                // 110x xxxx   10xx xxxx
                codePoints.push(((c & 0x1F) << 6) | (utf8array[i++] & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx      
                codePoints.push(
                    ((c & 0x0F) << 12) |
                    ((utf8array[i++] & 0x3F) << 6) |
                    (utf8array[i++] & 0x3F)
                );
                break;
            case 15:
                // 1111 0xxx  10xx xxxx  10xx xxxx  10xx xxxx
                codePoints.push(
                    ((c & 0x07) << 18) |
                    ((utf8array[i++] & 0x3F) << 12) |
                    ((utf8array[i++] & 0x3F) << 6) |
                    (utf8array[i++] & 0x3F)
                );
                break;
        }
    }
    return codePoints;
}

export default DjVu;