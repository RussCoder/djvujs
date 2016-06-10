'use strict';

class IWImage {
    constructor() {
        this.ycodec = new IWCodec();
        this.cslice = 0;
        // current slice
        this.info = null ;
        this.pixelmap = null ;
    }
    
    decodeChunk(zp, header) {
        if (!this.info) {
            this.info = header;
            if (!header.grayscale) {
                this.crcodec = new IWCodec();
                this.cbcodec = new IWCodec();
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
            //Globals.iwiw.blocks =Globals.iwiw.eblocks;
            if(Globals.iwiw) {
            //ybitmap = this.ycodec.getBytemap.call(Globals.iwiw);
            }
            var cbbitmap = this.cbcodec ? this.cbcodec.getBytemap() : null ;
            var crbitmap = this.crcodec ? this.crcodec.getBytemap() : null ;
            this.pixelmap = new Pixelmap(ybitmap,cbbitmap,crbitmap);
        }
    }
    
    getImage() {
        this.pixelmap ? this.createPixelmap() : 0;
        var width = this.info.width;
        var height = this.info.height;
        var image = Globals.canvasCtx.createImageData(width, height);
        
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
        if (this.cbbytemap) {
            // убираем 6 дробных бит в этом псевдо дробном числе
            var y = (this.ybytemap[i][j] + 32) >> 6;
            if (y < -128) {
                y = -128;
            } 
            else if (y >= 128) {
                y = 127;
            }
            y += 128;
            var cb = (this.cbbytemap[i][j] + 32) >> 6;
            if (cb < -128) {
                cb = -128;
            } 
            else if (cb >= 128) {
                cb = 127;
            }
            var cr = (this.crbytemap[i][j] + 32) >> 6;
            if (cr < -128) {
                cr = -128;
            } 
            else if (cr >= 128) {
                cr = 127;
            }
            
            return {
                r: y + 3 / 2 * cr,
                g: y - 1 / 4 * cb - 3 / 4 * cr,
                b: y + 7 / 4 * cb
            }
        
        } 
        else {
            
            // убираем 6 дробных бит в этом псевдо дробном числе
            var v = (this.ybytemap[i][j] + 32) >> 6;
            if (v < -128) {
                v = -128;
            } 
            else if (v >= 128) {
                v = 127;
            }
            v = 127 - v;
            
            return {
                r: v,
                g: v,
                b: v
            }
        }
    }
}
