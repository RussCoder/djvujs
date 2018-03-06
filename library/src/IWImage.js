'use strict';

class IWImage {
    constructor() {
        this.ycodec = new IWDecoder();
        this.cslice = 0; // current slice
        this.info = null;
        this.pixelmap = null;
    }

    decodeChunk(zp, header) {
        if (!this.info) {
            this.info = header;
            if (!header.grayscale) {
                this.crcodec = new IWDecoder();
                this.cbcodec = new IWDecoder();
            }
        } else {
            this.info.slices = header.slices;
        }

        for (var i = 0; i < this.info.slices; i++) {
            this.cslice++;
            this.ycodec.decodeSlice(zp, header);
            if (this.crcodec && this.cbcodec && this.cslice > this.info.delayInit) {
                this.cbcodec.decodeSlice(zp, header);
                this.crcodec.decodeSlice(zp, header);
            }
        }
    }

    createPixelmap() {
        if (!this.pixelmap) {
            var ybitmap = this.ycodec.getBytemap();
            var cbbitmap = this.cbcodec ? this.cbcodec.getBytemap() : null;
            var crbitmap = this.crcodec ? this.crcodec.getBytemap() : null;
            this.pixelmap = new Pixelmap(ybitmap, cbbitmap, crbitmap);
        }
    }

    /**
     * @returns {ImageData}
     */
    getImage() {
        if (!this.pixelmap) {
            this.pixelmap = this.createPixelmap();
        }

        var width = this.info.width;
        var height = this.info.height;
        var image = new ImageData(width, height);

        var width4 = width << 2;
        for (var i = 0; i < height; i++) {
            var rowOffset = i * this.pixelmap.width;
            var pixelIndex = ((height - i - 1) * width) << 2;
            for (var j = 0; j < width; j++) {
                this.pixelmap.writePixel(rowOffset + j, image.data, pixelIndex);
                image.data[pixelIndex | 3] = 255;
                pixelIndex += 4;
            }
        }
        return image;
    }
}


class Pixelmap {
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
