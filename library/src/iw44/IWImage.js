import IWDecoder from './IWDecoder';
import { Pixelmap } from './IWStructures';
import DjVu from '../DjVu';

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
        var time = performance.now();

        var ybitmap = this.ycodec.getBytemap();
        var cbbitmap = this.cbcodec ? this.cbcodec.getBytemap() : null;
        var crbitmap = this.crcodec ? this.crcodec.getBytemap() : null;

        var pixelMapTime = performance.now();

        this.pixelmap = new Pixelmap(ybitmap, cbbitmap, crbitmap);

        DjVu.IS_DEBUG && console.log('Pixelmap constructor time = ', performance.now() - pixelMapTime);
        DjVu.IS_DEBUG && console.log('IWImage.createPixelmap time = ', performance.now() - time);
    }

    /**
     * @returns {ImageData}
     */
    getImage() {
        const time = performance.now();
        if (!this.pixelmap) {
            this.createPixelmap();
        }

        const width = this.info.width;
        const height = this.info.height;
        const image = new ImageData(width, height);

        const processRow = (i) => {
            const rowOffset = i * this.pixelmap.width;
            let pixelIndex = ((height - i - 1) * width) << 2;
            for (let j = 0; j < width; j++) {
                this.pixelmap.writePixel(rowOffset + j, image.data, pixelIndex);
                image.data[pixelIndex | 3] = 255;
                pixelIndex += 4;
            }
        }

        //const imageConstructTime = performance.now();
        for (let i = 0; i < height; i++) {
            // Optimization for Chrome
            // When the loop body is a function, it can be easily optimized
            // In case of the last page of assets/slow.djvu, the whole loop takes
            // 69ms now, but when the loop body wasn't wrapped into a function it took 
            // 21063ms in case of async mode, and usually in the viewer. Such a big difference
            // didn't reproduce always, but most frequently. It was a strange case of deoptimization of code by Chrome.
            // Without that arbitrary deoptimization, the time was the same - about 70ms, but it was unstable.
            // It seems that now it works more stable.
            processRow(i);
        }
        //DjVu.IS_DEBUG && console.log('***imageConstructTime = ', performance.now() - imageConstructTime);

        DjVu.IS_DEBUG && console.log('IWImage.getImage time = ', performance.now() - time);
        return image;
    }
}