
export class Pixelmap {
    constructor(ybytemap, cbbytemap, crbytemap) {
        this.width = ybytemap.width;

        var length = ybytemap.array.length;
        this.r = new Uint8ClampedArray(length);
        this.g = new Uint8ClampedArray(length);
        this.b = new Uint8ClampedArray(length);

        if (cbbytemap) {
            for (var i = 0; i < length; i++) {
                var y = this._normalize(ybytemap.byIndex(i));
                var b = this._normalize(cbbytemap.byIndex(i));
                var r = this._normalize(crbytemap.byIndex(i));

                var t2 = r + (r >> 1);
                var t3 = y + 128 - (b >> 2);

                this.r[i] = y + 128 + t2;
                this.g[i] = t3 - (t2 >> 1);
                this.b[i] = t3 + (b << 1);
            }
        } else {
            for (var i = 0; i < length; i++) {
                var v = this._normalize(ybytemap.byIndex(i));
                v = 127 - v;
                this.r[i] = v;
                this.g[i] = v;
                this.b[i] = v;
            }
        }
    }

    _normalize(val) {
        val = (val + 32) >> 6;   // убираем 6 дробных бит в этом псевдо дробном числе
        if (val < -128) {
            return -128;
        } else if (val >= 128) {
            return 127;
        }
        return val;
    }

    writePixel(index, pixelArray, pixelIndex) {
        //var index = this.width * i + j;
        pixelArray[pixelIndex] = this.r[index];
        pixelArray[pixelIndex | 1] = this.g[index];
        pixelArray[pixelIndex | 2] = this.b[index];
    }

    // writeLayer(maskPixelArray, scaleFactor, imageWidth, imageHeight, checker) {

    //     var maskRowOffset = (imageHeight - 1) * imageWidth << 2;
    //     var width4 = imageWidth << 2;
    //     var widthStep = width4 * scaleFactor;

    //     var layerRowOffset = 0;
    //     for (var i = 0, li = 0; i < imageHeight; i += scaleFactor, li++) {

    //         for (var j = 0, lj = 0; j < imageWidth; j += scaleFactor, lj++) {
    //             var layerIndex = layerRowOffset + lj;
    //             var intermediateMaskRowOffset = maskRowOffset;
    //             for (var k = 0; k < scaleFactor; k++) {

    //                 for (var m = 0; m < scaleFactor; m++) {
    //                     var index = intermediateMaskRowOffset + ((m + j) << 2);
    //                     if (maskPixelArray[index] === checker) {
    //                         maskPixelArray[index] = this.r[layerIndex];
    //                         maskPixelArray[index | 1] = this.g[layerIndex];
    //                         maskPixelArray[index | 2] = this.b[layerIndex];
    //                     }
    //                 }

    //                 intermediateMaskRowOffset -= width4;
    //             }
    //         }

    //         layerRowOffset += this.width;
    //         maskRowOffset -= widthStep;
    //     }
    // }
}

export class LinearBytemap {
    constructor(width, height) {
        this.width = width;
        this.array = new Int16Array(width * height);
    }

    byIndex(i) {
        return this.array[i];
    }

    get(i, j) {
        return this.array[i * this.width + j];
    }

    set(i, j, val) {
        this.array[i * this.width + j] = val;
    }

    sub(i, j, val) {
        this.array[i * this.width + j] -= val;
    }

    add(i, j, val) {
        this.array[i * this.width + j] += val;
    }
}

export class Bytemap extends Array {
    constructor(width, height) {
        super(height);
        this.height = height;
        this.width = width;
        for (var i = 0; i < height; i++) {
            this[i] = new Int16Array(width);
        }
    }
}

//блок - структурная единица исходного изображения
export class Block {
    constructor(buffer, offset, withBuckets = false) {
        this.array = new Int16Array(buffer, offset, 1024);

        if (withBuckets) { // just for IWEncoder, чтобы не переписывать код
            this.buckets = new Array(64);
            for (var i = 0; i < 64; i++) {
                this.buckets[i] = new Int16Array(buffer, offset, 16);
                offset += 32;
            }
        }
    }

    setBucketCoef(bucketNumber, index, value) {
        this.array[(bucketNumber << 4) | index] = value; // index from 0 to 15
    }

    getBucketCoef(bucketNumber, index) {
        return this.array[(bucketNumber << 4) | index]; // index from 0 to 15
    }

    getCoef(n) {
        return this.array[n];
    }

    setCoef(n, val) {
        this.array[n] = val;
    }

    /**
     * Функция создания массива блоков на основе одного буфера, более быстрого выделения памяти
     * @returns {Array<Block>}
     */
    static createBlockArray(length) {
        var blocks = new Array(length);
        var buffer = new ArrayBuffer(length << 11);  // выделяем память под все блоки
        for (var i = 0; i < length; i++) {
            blocks[i] = new Block(buffer, i << 11);
        }
        return blocks;
    }
}