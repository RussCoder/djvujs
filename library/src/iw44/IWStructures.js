function _normalize(val) {
    val = (val + 32) >> 6;   // убираем 6 дробных бит в этом псевдо дробном числе
    if (val < -128) {
        return -128;
    } else if (val >= 128) {
        return 127;
    }
    return val;
}

export class LazyPixelmap {
    constructor(ybytemap, cbbytemap, crbytemap) {
        this.width = ybytemap.width; // required as outer property
        this.yArray = ybytemap.array;
        this.cbArray = cbbytemap ? cbbytemap.array : null;
        this.crArray = crbytemap ? crbytemap.array : null;
        this.writePixel = cbbytemap ? this.writeColoredPixel : this.writeGrayScalePixel;
    }

    writeGrayScalePixel(index, pixelArray, pixelIndex) {
        const value = 127 - _normalize(this.yArray[index]);
        pixelArray[pixelIndex] = value;
        pixelArray[pixelIndex | 1] = value;
        pixelArray[pixelIndex | 2] = value;
    }

    writeColoredPixel(index, pixelArray, pixelIndex) {
        const y = _normalize(this.yArray[index]);
        const b = _normalize(this.cbArray[index]);
        const r = _normalize(this.crArray[index]);

        const t2 = r + (r >> 1);
        const t3 = y + 128 - (b >> 2);

        pixelArray[pixelIndex] = y + 128 + t2;
        pixelArray[pixelIndex | 1] = t3 - (t2 >> 1);
        pixelArray[pixelIndex | 2] = t3 + (b << 1);
    }
}

export class Pixelmap {
    constructor(ybytemap, cbbytemap, crbytemap) {
        this.width = ybytemap.width; // required as outer property

        var length = ybytemap.array.length;
        this.r = new Uint8ClampedArray(length);
        this.g = new Uint8ClampedArray(length);
        this.b = new Uint8ClampedArray(length);

        if (cbbytemap) {
            this._constructColorfulPixelMap(ybytemap.array, cbbytemap.array, crbytemap.array);
        } else {
            this._constructGrayScalePixelMap(ybytemap.array);
        }
    }

    _constructGrayScalePixelMap(yArray) {
        yArray.forEach((v, i) => {
            this.r[i] = this.g[i] = this.b[i] = 127 - _normalize(v);
        });
    }

    _constructColorfulPixelMap(yArray, cbArray, crArray) {
        // using forEach instead of for loop to make the loop body a function - 
        // it helps Chrome not to deoptimize code. It was added for slow.djvu (the last page). 
        yArray.forEach((val, i) => {
            const y = _normalize(val);
            const b = _normalize(cbArray[i]);
            const r = _normalize(crArray[i]);

            const t2 = r + (r >> 1);
            const t3 = y + 128 - (b >> 2);

            this.r[i] = y + 128 + t2;
            this.g[i] = t3 - (t2 >> 1);
            this.b[i] = t3 + (b << 1);
        });
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


/**
 * A square variant (extends Array and keep an array of rows)
 * works about 15-20% slower (in case of inverse transform)
 */
export class LinearBytemap {
    constructor(width, height) {
        this.width = width;
        this.array = new Int16Array(width * height);
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

/** Needed for IWImageWriter - should be replaced there with the LinearBytemap too */
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

class BlockMemoryManager {
    constructor() {
        this.buffer = null;
        this.offset = 0;
        this.retainedMemory = 0;
        this.usedMemory = 0;
    }

    ensureBuffer() {
        if (!this.buffer || this.offset >= this.buffer.byteLength) {
            this.buffer = new ArrayBuffer(10 << 20); // 10MB
            this.offset = 0;
            this.retainedMemory += this.buffer.byteLength;
        }
        return this.buffer;
    }

    allocateBucket() {
        this.ensureBuffer();
        const array = new Int16Array(this.buffer, this.offset, 16);
        this.offset += 32;
        this.usedMemory += 32;
        return array;
    }
}

export class LazyBlock {
    constructor(memoryManager) {
        this.buckets = new Array(64);
        this.mm = memoryManager;
    }

    setBucketCoef(bucketNumber, index, value) {
        if (!this.buckets[bucketNumber]) {
            this.buckets[bucketNumber] = this.mm.allocateBucket();
        }
        this.buckets[bucketNumber][index] = value; // index from 0 to 15
    }

    getBucketCoef(bucketNumber, index) {
        return this.buckets[bucketNumber] ? this.buckets[bucketNumber][index] : 0;
    }

    getCoef(n) {
        return this.getBucketCoef(n >> 4, n & 15);
    }

    setCoef(n, val) {
        return this.setBucketCoef(n >> 4, n & 15, val);
    }

    /**
     * Функция создания массива блоков на основе одного буфера, более быстрого выделения памяти
     * @returns {Array<LazyBlock>}
     */
    static createBlockArray(length) {
        const mm = new BlockMemoryManager();
        const blocks = new Array(length);
        for (var i = 0; i < length; i++) {
            blocks[i] = new LazyBlock(mm);
        }
        return blocks;
    }
}