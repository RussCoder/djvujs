'use strict';

class IWImage {
    constructor() {
        this.ycodec = new IWDecoder();
        this.cslice = 0;
        // current slice
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
        }
        else {
            this.info.slices = header.slices;
        }

        /*if(Globals.pzp) {
            //zp.pzp = Globals.pzp;
            console.log("PZP in doing !!!!");
        }*/

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
                var pixel = this.pixelmap.getPixel(i, j);
                let index = ((height - i - 1) * width + j) * 4;
                image.data[index] = pixel.r;
                image.data[index + 1] = pixel.g;
                image.data[index + 2] = pixel.b;
                image.data[index + 3] = 255;
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
    }

    getPixel(i, j) {
        const normalize = (val) => {
            val = (val + 32) >> 6;   // убираем 6 дробных бит в этом псевдо дробном числе
            if (val < -128) {
                val = -128;
            } else if (val >= 128) {
                val = 127;
            }
            return val;
        };

        if (this.cbbytemap) { // случай цветного изображения
            // данный код откопирован из djvulibre, не совпадает со спецификацией
            var y = normalize(this.ybytemap[i][j]);
            var b = normalize(this.cbbytemap[i][j]);
            var r = normalize(this.crbytemap[i][j]);

            var t1 = b >> 2;
            var t2 = r + (r >> 1);
            var t3 = y + 128 - t1;

            var tr = y + 128 + t2;
            var tg = t3 - (t2 >> 1);
            var tb = t3 + (b << 1);

            return {
                r: Math.max(0, Math.min(255, tr)),
                g: Math.max(0, Math.min(255, tg)),
                b: Math.max(0, Math.min(255, tb))
            }
        } else { // серое изображение
            var v = normalize(this.ybytemap[i][j]);
            v = 127 - v;

            return {
                r: v,
                g: v,
                b: v
            }
        }
    }
}
