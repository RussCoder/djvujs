var DjVu = {
    VERSION: '0.3.0',
    IS_DEBUG: false,
    setDebugMode: (flag) => DjVu.IS_DEBUG = flag
};

DjVu.Utils = {
    /**
     *  @returns {Promise<ArrayBuffer>}
     */
    loadFile(url, responseType = 'arraybuffer') {
        console.warn("loadFile is a deprecated function!");
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

export function createStringFromUtf8Array(utf8array) {
    var codePoints = utf8ToCodePoints(utf8array);
    return String.fromCodePoint ? String.fromCodePoint(...codePoints) : String.fromCharCode(...codePoints);
}

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

export function codePointsToUtf8(codePoints) {
    var utf8array = [];
    codePoints.forEach(codePoint => {
        if (codePoint < 0x80) {
            utf8array.push(codePoint);
        } else if (codePoint < 0x800) {
            utf8array.push(0xC0 | (codePoint >> 6));
            utf8array.push(0x80 | (codePoint & 0x3F));
        } else if (codePoint < 0x10000) {
            utf8array.push(0xE0 | (codePoint >> 12));
            utf8array.push(0x80 | ((codePoint >> 6) & 0x3F));
            utf8array.push(0x80 | (codePoint & 0x3F));
        } else {
            utf8array.push(0xF0 | (codePoint >> 18));
            utf8array.push(0x80 | ((codePoint >> 12) & 0x3F));
            utf8array.push(0x80 | ((codePoint >> 6) & 0x3F));
            utf8array.push(0x80 | (codePoint & 0x3F));
        }
    });

    return new Uint8Array(utf8array);
}

export function stringToCodePoints(str) {
    var codePoints = [];
    for (var i = 0; i < str.length; i++) {
        var code = str.codePointAt(i);
        codePoints.push(code);
        if (code > 65535) {
            i++; // skip the second part of 4 byte symbol
        }
    }

    return codePoints;
}

// unicode test: symbols of 1, 2, 4 and 3 bytes (in utf8 encoding) are encoded and decoded
// var str = 'szвф' + String.fromCodePoint(0x1F702) + String.fromCodePoint(0x1F704) + String.fromCodePoint(0x2C00) + String.fromCodePoint(0x2C08);
// var str2 = String.fromCodePoint(...utf8ToCodePoints(codePointsToUtf8(stringToCodePoints(str))));
// console.log(str, str2, str === str2);

export default DjVu;