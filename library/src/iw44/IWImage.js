import IWDecoder from './IWDecoder';
import { Pixelmap } from './IWStructures';

export default class IWImage {
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
        var ybitmap = this.ycodec.getBytemap();
        var cbbitmap = this.cbcodec ? this.cbcodec.getBytemap() : null;
        var crbitmap = this.crcodec ? this.crcodec.getBytemap() : null;
        this.pixelmap = new Pixelmap(ybitmap, cbbitmap, crbitmap);
    }

    /**
     * @returns {ImageData}
     */
    getImage() {
        if (!this.pixelmap) {
            this.createPixelmap();
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