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

        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {          
                let index = ((height - i - 1) * width + j) << 2;
                this.pixelmap.writePixel(i, j, image.data, index);
                // image.data[index] = pixel.r;
                // image.data[index + 1] = pixel.g;
                // image.data[index + 2] = pixel.b;
                image.data[index | 3] = 255;
            }
        }
        return image;
    }
}


class Pixelmap {
    constructor(ybytemap, cbbytemap, crbytemap) {
        this.ybytemap = ybytemap;
        this.cbbytemap = cbbytemap;
        this.crbytemap = crbytemap;
        //this.pixel = { r: 0, g: 0, b: 0 }; // промежуточный объект, чтобы не создавать каждый раз
    }

    _normalize(val) {
        val = (val + 32) >> 6;   // убираем 6 дробных бит в этом псевдо дробном числе
        if (val < -128) {
            val = -128;
        } else if (val >= 128) {
            val = 127;
        }
        return val;
    }

    writePixel(i, j, pixelArray, pixelIndex) {

        var index = this.ybytemap.width * i + j;

        if (this.cbbytemap) { // случай цветного изображения
            // данный код откопирован из djvulibre, не совпадает со спецификацией
            var y = this._normalize(this.ybytemap.byIndex(index));
            var b = this._normalize(this.cbbytemap.byIndex(index));
            var r = this._normalize(this.crbytemap.byIndex(index));

            //var t1 = b >> 2;
            var t2 = r + (r >> 1);
            var t3 = y + 128 - (b >> 2);

            pixelArray[pixelIndex] = y + 128 + t2;
            pixelArray[pixelIndex | 1] = t3 - (t2 >> 1);
            pixelArray[pixelIndex | 2] = t3 + (b << 1);

            /*return { // Uint8ClampsedArray должен сам обработать это
                r: Math.max(0, Math.min(255, tr)),
                g: Math.max(0, Math.min(255, tg)),
                b: Math.max(0, Math.min(255, tb))
            }*/
        } else { // серое изображение
            var v = this._normalize(this.ybytemap.byIndex(index));
            v = 127 - v;
            pixelArray[pixelIndex] = v;
            pixelArray[pixelIndex | 1] = v;
            pixelArray[pixelIndex | 2] = v;
        }

        //return this.pixel;
    }

}
