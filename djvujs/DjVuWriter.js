'use strict';

/**
 * Класс предназначенный для создания итогового файла. 
 * Определяет более высокоуровневые функции, нежели ByteStreamWriter
 */
class DjVuWriter {
    constructor(length) {
        this.bsw = new ByteStreamWriter(length || 1024 * 1024);
    }

    startDJVM() {
        // пропускаем 4 байта для длины файла
        this.bsw.writeStr('AT&T').writeStr('FORM').saveOffsetMark('fileSize')
            .jump(4).writeStr('DJVM');
    }

    //выполняет предварительную запись dirm без записи его длины и смещений
    writeDirmChunk(dirm) {
        this.dirm = dirm;
        this.bsw.writeStr('DIRM').saveOffsetMark('DIRMsize').jump(4);

        var startOffset = this.bsw.offset;
        this.dirm.offsets = [];

        this.bsw.writeByte(dirm.dflags)
            .writeInt16(dirm.flags.length)
            .saveOffsetMark('DIRMoffsets')
            .jump(4 * dirm.flags.length);

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
            if (dirm.names && dirm.names[i]) {
                tmpBS.writeStrNT(dirm.names[i]);
            }
            if (dirm.title && dirm.titles[i]) {
                tmpBS.writeStrNT(dirm.titles[i]);
            }
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
        this.bsw.writeBuffer(encodedBuffer);

        //записали длину 
        this.bsw.rewriteSize('DIRMsize');
    }

    get offset() {
        return this.bsw.offset;
    }

    writeByte(byte) {
        this.bsw.writeByte(byte);
        return this;
    }

    writeStr(str) {
        this.bsw.writeStr(str);
        return this;
    }

    writeInt32(val) {
        this.bsw.writeInt32(val);
        return this;
    }

    writeFormChunkBS(bs) {
        //проверка на четную границу
        if (this.bsw.offset & 1) {
            this.bsw.writeByte(0);
        }
        var off = this.bsw.offset;
        this.dirm.offsets.push(off);
        this.bsw.writeByteStream(bs);

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

    writeChunk(chunk) {
        //проверка на четную границу
        if (this.bsw.offset & 1) {
            this.bsw.writeByte(0);
        }
        this.bsw.writeByteStream(chunk.bs);
    }

    /*getByteStream() {
        var bs = new ByteStream(this.buffer);
        return bs;
    }*/

    getBuffer() {
        //пишем длину файла
        this.bsw.rewriteSize('fileSize');
        if (this.dirm.offsets.length !== (this.dirm.flags.length)) {
            throw new Error("Записаны не все страницы и словари !!!");
        }
        for (var i = 0; i < this.dirm.offsets.length; i++) {
            this.bsw.rewriteInt32('DIRMoffsets', this.dirm.offsets[i]);
            this.dirm.offsetsOffset += 4;
        }
        return this.bsw.getBuffer();
    }
}