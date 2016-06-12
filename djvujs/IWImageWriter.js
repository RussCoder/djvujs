'use strict';
class IWImageWriter {
    constructor(slicenumber) {
        // число кусочков кодируемых
        this.slicenumber = slicenumber || 100;
    }
    get width() {
        return this.imageData.width;
    }
    get height() {
        return this.imageData.height;
    }

    createOnePageDocument(imageData) {
        this.imageData = imageData;
        var bsw = new ByteStreamWriter(10 * 1024);
        var zp = new ZPEncoder(bsw);
        var ycodec = new IWEncoder(this.RGBtoY(imageData));

        // пропускаем 4 байта для длины файла
        bsw.writeStr('AT&T').writeStr('FORM').jump(4).writeStr('DJVU');
        this.writeINFOChunk(bsw);
        bsw.writeStr('BG44').jump(4);
        //пишем заголовок
        bsw.writeByte(0)
            .writeByte(this.slicenumber)
            .writeByte(129)
            .writeByte(2)
            .writeUint16(this.width)
            .writeUint16(this.height)
            .writeByte(0);

        for (var i = 0; i < this.slicenumber; i++) {
            ycodec.encodeSlice(zp);
        }
        zp.eflush();
        bsw.rewriteInt32(8, bsw.offset - 12);
        bsw.rewriteInt32(38, bsw.offset - 42);
        // возвращаем новый одностраничный документ
        return new DjVuDocument(bsw.getBuffer());
    }

    writeINFOChunk(bsw) {
        bsw.writeStr('INFO')
            .writeInt32(10)
            .writeInt16(this.width)
            .writeInt16(this.height)
            .writeByte(24).writeByte(0)
            .writeByte(100 & 0xff)
            .writeByte(100 >> 8)
            .writeByte(22).writeByte(1);
    } 

    test() {
        this.RGBtoY();
        this.inverseWaveletTransform(this.y);
        this.createBlocks(this.y);
        var buf = this.encodeChunk(this.bs);
        console.log('Coded buffer length', buf.byteLength);
        var doc = new DjVuDocument(buf);
        return doc;
    }
    RGBtoY(imageData) {
        var rmul = new Int32Array(256);
        var gmul = new Int32Array(256);
        var bmul = new Int32Array(256);
        var rgb_to_ycc = [[0.304348, 0.608696, 0.086956], [0.463768, -0.405797, -0.057971], [-0.173913, -0.347826, 0.521739]];
        var data = imageData.data;
        var width = imageData.width;
        var height = imageData.height;
        var bytemap = new Bytemap(width, height);
        for (var k = 0; k < 256; k++) {
            rmul[k] = (k * 0x10000 * rgb_to_ycc[0][0]);
            gmul[k] = (k * 0x10000 * rgb_to_ycc[0][1]);
            bmul[k] = (k * 0x10000 * rgb_to_ycc[0][2]);
        }
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                //сразу разворачиваем в прямые координаты
                var index = ((height - i - 1) * width + j) << 2;
                var y = rmul[255 - data[index]] + gmul[255 - data[index + 1]] + bmul[255 - data[index + 2]] + 32768;
                bytemap[i][j] = ((y >> 16) - 128) << 6;
            }
        }
        return bytemap;
    }
    YtoRGB() {
        var image = document.createElement('canvas').getContext('2d').createImageData(this.width, this.height);
        for (var i = 0; i < this.imageData.height; i++) {
            for (var j = 0; j < this.imageData.height; j++) {
                var v = (this.y[i][j] + 32) >> 6;
                //v = this.y[i][j];
                if (v < -128) {
                    v = -128;
                } else if (v >= 128) {
                    v = 127;
                }
                v = 127 - v;
                var index = (i * this.width + j) << 2;
                image.data[index] = v;
                image.data[index + 1] = v;
                image.data[index + 2] = v;
                image.data[index + 3] = 255;
            }
        }
        return image;
    }

   

    
}

IWImageWriter.prototype.rgb_to_ycc = [
    [0.304348, 0.608696, 0.086956],
    [0.463768, -0.405797, -0.057971],
    [-0.173913, -0.347826, 0.521739]];
