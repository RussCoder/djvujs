'use strict';

class IWImageWriter {

    constructor(slicenumber, delayInit, grayscale) {
        // число кусочков кодируемых
        this.slicenumber = slicenumber || 100;
        // серые ли изображения
        this.grayscale = grayscale || 0;
        // задержка кодирования цветовой информации
        this.delayInit = (delayInit & 127) || 0;
    }

    get width() {
        return this.imageData.width;
    }
    get height() {
        return this.imageData.height;
    }

    createMultyPageDocument(imageArray) {
        var bsw = new ByteStreamWriter();
        bsw.writeStr('AT&T').writeStr('FORM')
            .saveOffsetMark('fileSize').jump(4)
            .writeStr('DJVM');

        var pageBuffers = new Array(imageArray.length);
        var dirm = {};
        this.dirm = dirm;
        dirm.offsets = [];
        dirm.dflags = 129; // 1000 0001
        dirm.flags = new Array(imageArray.length);
        dirm.ids = new Array(imageArray.length);
        dirm.sizes = new Array(imageArray.length);
        var tbsw = new ByteStreamWriter(); // временный буфер для записи
        // генерируем все необходимые данные
        for (var i = 0; i < imageArray.length; i++) {
            this.writeImagePage(tbsw, imageArray[i]);
            var buffer = tbsw.getBuffer();
            pageBuffers[i] = buffer;
            tbsw.reset();
            dirm.flags[i] = 1; // страница без имени и заголовка
            dirm.ids[i] = 'p' + i; // просто уникальный id
            dirm.sizes[i] = buffer.byteLength; // размеры
        }
        this.bsw = bsw;
        this.writeDirmChunk(dirm);
        for (var i = 0; i < imageArray.length; i++) {
            this.writeFormChunkBuffer(pageBuffers[i]);
        }

        for (var i = 0; i < imageArray.length; i++) {
            bsw.rewriteInt32('DIRMoffsets', this.dirm.offsets[i]);
        }

        bsw.rewriteInt32('fileSize', bsw.offset - 4);
        return new DjVuDocument(bsw.getBuffer());
    }

    writeFormChunkBuffer(buffer) {
        //проверка на четную границу
        if (this.bsw.offset & 1) {
            this.bsw.writeByte(0);
        }
        var off = this.bsw.offset;
        this.dirm.offsets.push(off);
        this.bsw.writeBuffer(buffer);

    }


    //выполняет предварительную запись dirm без записи его длины и смещений
    writeDirmChunk(dirm) {
        this.dirm = dirm;
        this.bsw.writeStr('DIRM').jump(4);

        var startOffset = this.bsw.offset;
        this.dirm.lengthOffset = startOffset - 4;
        this.dirm.offsets = [];

        this.bsw.writeByte(dirm.dflags)
            .writeInt16(dirm.flags.length)
            .saveOffsetMark('DIRMoffsets')
            .jump(4 * dirm.flags.length);
        this.dirm.offsetsOffset = startOffset + 3;

        //начинаем фазу кодирования bzz;

        var tmpBS = new ByteStreamWriter();
        for (var i = 0; i < dirm.sizes.length; i++) {
            tmpBS.writeInt24(dirm.sizes[i]);
        }
        for (var i = 0; i < dirm.flags.length; i++) {
            tmpBS.writeByte(dirm.flags[i]);
        }
        for (var i = 0; i < dirm.ids.length; i++) {
            tmpBS.writeStrNT(dirm.ids[i]);
        }
        //todo для BWT конечный символ EOB - временный код
        tmpBS.writeByte(0);

        var tmpBuffer = tmpBS.getBuffer();

        var bzzBS = new ByteStreamWriter();
        var zp = new ZPEncoder(bzzBS);
        var bzz = new BZZEncoder(zp);
        bzz.encode(tmpBuffer);
        var encodedBuffer = bzzBS.getBuffer();

        //записываем полученный буфер в основной поток
        var tmpBS = new ByteStream(encodedBuffer);
        this.bsw.writeByteStream(tmpBS);

        //записали длину 
        this.bsw.rewriteInt32(this.dirm.lengthOffset, this.bsw.offset - startOffset);
    }

    /**
     * Кодирует и записывает в поток 1 картинку
     */
    writeImagePage(bsw, imageData) {
        // пропускаем 4 байта для длины файла
        bsw.writeStr('FORM').saveOffsetMark('formSize').jump(4).writeStr('DJVU');
        // записываем порцию информации
        bsw.writeStr('INFO')
            .writeInt32(10)
            .writeInt16(imageData.width)
            .writeInt16(imageData.height)
            .writeByte(24).writeByte(0)
            .writeByte(100 & 0xff)
            .writeByte(100 >> 8)
            .writeByte(22).writeByte(1);

        //начинаем запись порции цветной
        bsw.writeStr('BG44').saveOffsetMark('BG44Size').jump(4);
        //пишем заголовок
        bsw.writeByte(0)
            .writeByte(this.slicenumber)
            //majver
            .writeByte((this.grayscale << 7) | 1) // это 129 или 1 в зависимости от this.grayscale
            //minver
            .writeByte(2)
            .writeUint16(imageData.width)
            .writeUint16(imageData.height)
            .writeByte(this.delayInit);

        var ycodec = new IWEncoder(this.RGBtoY(imageData));
        var crcodec, cbcodec;
        if (!this.grayscale) {
            cbcodec = new IWEncoder(this.RGBtoCb(imageData));
            crcodec = new IWEncoder(this.RGBtoCr(imageData));
        }

        var zp = new ZPEncoder(bsw);
        for (var i = 0; i < this.slicenumber; i++) {
            ycodec.encodeSlice(zp);
            if (cbcodec && crcodec && i >= this.delayInit) {
                cbcodec.encodeSlice(zp);
                crcodec.encodeSlice(zp);
            }
        }
        zp.eflush();
        bsw.rewriteInt32('formSize', bsw.offset - bsw.offsetMarks['formSize'] - 4);
        bsw.rewriteInt32('BG44Size', bsw.offset - bsw.offsetMarks['BG44Size'] - 4);
    }

    createOnePageDocument(imageData) {
        var bsw = new ByteStreamWriter(10 * 1024);
        bsw.writeStr('AT&T');
        this.writeImagePage(bsw, imageData);
        // возвращаем новый одностраничный документ
        return new DjVuDocument(bsw.getBuffer());
    }


    /**
     * Перевод RGB в Y откопировано из djvulibre
     * @param {ImageData} imageData
     * @returns {Bytemap} двумерный байтовый массив
     */
    RGBtoY(imageData) {
        var rmul = new Int32Array(256);
        var gmul = new Int32Array(256);
        var bmul = new Int32Array(256);
        var data = imageData.data;
        var width = imageData.width;
        var height = imageData.height;
        var bytemap = new Bytemap(width, height);
        //преобразование необходимое при кодировании серых изображений, чтобы усилить цвет. 
        if (this.grayscale) {
            for (var i = 0; i < data.length; i++) {
                data[i] = 255 - data[i];
            }
        }
        for (var k = 0; k < 256; k++) {
            rmul[k] = (k * 0x10000 * this.rgb_to_ycc[0][0]);
            gmul[k] = (k * 0x10000 * this.rgb_to_ycc[0][1]);
            bmul[k] = (k * 0x10000 * this.rgb_to_ycc[0][2]);
        }
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                //сразу разворачиваем в прямые координаты
                var index = ((height - i - 1) * width + j) << 2;
                var y = rmul[data[index]] + gmul[data[index + 1]] + bmul[data[index + 2]] + 32768;
                bytemap[i][j] = ((y >> 16) - 128) << this.iw_shift;
            }
        }
        return bytemap;
    }

    /**
     * Перевод RGB в Cb откопировано из djvulibre
     * @param {ImageData} imageData
     * @returns {Bytemap} двумерный байтовый массив
     */
    RGBtoCb(imageData) {
        var rmul = new Int32Array(256);
        var gmul = new Int32Array(256);
        var bmul = new Int32Array(256);
        var data = imageData.data;
        var width = imageData.width;
        var height = imageData.height;
        var bytemap = new Bytemap(width, height);
        for (var k = 0; k < 256; k++) {
            rmul[k] = (k * 0x10000 * this.rgb_to_ycc[2][0]);
            gmul[k] = (k * 0x10000 * this.rgb_to_ycc[2][1]);
            bmul[k] = (k * 0x10000 * this.rgb_to_ycc[2][2]);
        }
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                //сразу разворачиваем в прямые координаты
                var index = ((height - i - 1) * width + j) << 2;
                var y = rmul[data[index]] + gmul[data[index + 1]] + bmul[data[index + 2]] + 32768;
                bytemap[i][j] = Math.max(-128, Math.min(127, y >> 16)) << this.iw_shift;
            }
        }
        return bytemap;
    }

    /**
     * Перевод RGB в Cr откопировано из djvulibre
     * @param {ImageData} imageData
     * @returns {Bytemap} двумерный байтовый массив
     */
    RGBtoCr(imageData) {
        var rmul = new Int32Array(256);
        var gmul = new Int32Array(256);
        var bmul = new Int32Array(256);
        var data = imageData.data;
        var width = imageData.width;
        var height = imageData.height;
        var bytemap = new Bytemap(width, height);
        for (var k = 0; k < 256; k++) {
            rmul[k] = (k * 0x10000 * this.rgb_to_ycc[1][0]);
            gmul[k] = (k * 0x10000 * this.rgb_to_ycc[1][1]);
            bmul[k] = (k * 0x10000 * this.rgb_to_ycc[1][2]);
        }
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                //сразу разворачиваем в прямые координаты
                var index = ((height - i - 1) * width + j) << 2;
                var y = rmul[data[index]] + gmul[data[index + 1]] + bmul[data[index + 2]] + 32768;
                bytemap[i][j] = Math.max(-128, Math.min(127, y >> 16)) << this.iw_shift;
            }
        }
        return bytemap;
    }
}

//сдвиг для кодирования изображений
IWImageWriter.prototype.iw_shift = 6;
IWImageWriter.prototype.rgb_to_ycc = [
    [0.304348, 0.608696, 0.086956],
    [0.463768, -0.405797, -0.057971],
    [-0.173913, -0.347826, 0.521739]];