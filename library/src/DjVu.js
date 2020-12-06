var DjVu = {
    VERSION: '0.5.0',
    IS_DEBUG: false,
    setDebugMode: (flag) => DjVu.IS_DEBUG = flag
};

export function pLimit(limit = 4) {
    const queue = [];
    let running = 0;

    const runNext = async () => {
        if (!queue.length || running >= limit) return;
        const func = queue.shift();

        try {
            running++;
            await func();
        } finally {
            running--;
            runNext();
        }
    };

    return func => new Promise((resolve, reject) => {
        queue.push(() => func().then(resolve, reject));
        runNext();
    });
}

/**
 *  @returns {Promise<ArrayBuffer>}
 */
export function loadFileViaXHR(url, responseType = 'arraybuffer') {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = responseType;
        xhr.onload = (e) => resolve(xhr);
        xhr.onerror = (e) => reject(xhr);
        xhr.send();
    });
}

const utf8Decoder = self.TextDecoder ? new self.TextDecoder() : {
    decode(utf8array) {
        const codePoints = utf8ToCodePoints(utf8array);
        return String.fromCodePoint(...codePoints);
    }
};

export function createStringFromUtf8Array(utf8array) {
    return utf8Decoder.decode(utf8array);
}

/**
 * Creates an array of Unicode code points from an array, representing a utf8 encoded string
 * The code assumes that the utf-8 input is well formed. Otherwise, can produce illegal code 
 * points. As the practice has shown, there are ill-formed utf-8 arrays in some djvu files.
 * 
 * This function should be removed in the future. The standard TextDecoder/TextEncoder should
 * be used instead. Its was initially written only for the old Edge browser 
 * which didn't support TextDecoder.
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
    return codePoints.map(codePoint => {
        return codePoint > 0x10FFFF ? 120 : codePoint; // replace all bad code points with "x"
    });
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