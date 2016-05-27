'use strict';

class DjVuWriter {
    constructor(length) {
        this.bsw = new ByteStreamWriter();
    }
    
    startDJVM() {
        // пропускаем 4 байта для длины файла
        this.bsw.writeStr('AT&T').writeStr('FORM').jump(4).writeStr('DJVM');
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
        //todo для BWT конечный символ EOB не учитываем - временный код
        //this.bsw.jump(-1);
        
        //записали длину 
        this.bsw.rewriteInt32(this.dirm.lengthOffset, this.bsw.offset - startOffset);
        
        //проверка на четную границу
        if (this.bsw.offset & 1) {
            this.bsw.writeByte(0);
        }
    }
    
    get offset() {
        return this.bsw.offset;
    }
    
    writeByte(byte) {
        this.bsw.writeByte(byte);
    }
    
    writeStr(str) {
        this.bsw.writeStr(str);
    }
    
    writeInt32(val) {
        this.bsw.writeInt32(val);
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
    
    writeChunk(chunk) {
        //проверка на четную границу
        if (this.bsw.offset & 1) {
            this.bsw.writeByte(0);
        }
        //this.writeStr(chunk.id);
        //this.writeInt32(chunk.length);
        this.bsw.writeByteStream(chunk.bs);
    }
    
    
    
    getByteStream() {
        var bs = new ByteStream(this.buffer);
        return bs;
    }
    
    getBuffer() {
        //пишем длину файла
        this.bsw.rewriteInt32(8, this.bsw.offset - 8);
        if (this.dirm.offsets.length !== (this.dirm.flags.length)) {
            throw new Error("Записаны не все страницы и словари !!!");
        }
        for (var i = 0; i < this.dirm.offsets.length; i++) {
            this.bsw.rewriteInt32(this.dirm.offsetsOffset, this.dirm.offsets[i]);
            this.dirm.offsetsOffset += 4;
        }
        return this.bsw.getBuffer();
    }
}

class ByteStreamWriter {
    constructor(length) {
        //размер шага роста используемой памяти
        //должен быть кратен 8 для быстрого копирования буферов
        this.growStep = length || 1024 * 1024 * 2;
        //this.fullBuffers = [];
        this.buffer = new ArrayBuffer(this.growStep);
        this.viewer = new DataView(this.buffer);
        this.offset = 0;
    }
    
    get bufferLength() {
        return this.buffer.byteLength;
    }
    
    writeByte(byte) {
        this.checkOffset();
        this.viewer.setUint8(this.offset++, byte);
        return this;
    }
    
    writeStr(str) {
        var byte;
        for (var i = 0; i < str.length; i++) {
            byte = str.charCodeAt(i);
            this.writeByte(byte);
        }
        return this;
    }
    
    writeInt32(val) {
        this.checkOffset(3);
        this.viewer.setInt32(this.offset, val);
        this.offset += 4;
        return this;
    }
    rewriteInt32(off, val) {
        this.viewer.setInt32(off, val);
    }
    
    getBuffer() {
        return this.buffer.slice(0, this.offset);
    }
    
    checkOffset(bytes) {
        bytes = bytes || 0;
        var bool = this.offset + bytes >= this.bufferLength;
        if (bool) {
            this.extense();
        }
        return bool;
    }
    
    extense() {
        //this.fullBuffers.push(this.buffer);
        Globals.Timer.start("extenseTime");
        var newlength = this.bufferLength + this.buffer.byteLength;
        var nb = new ArrayBuffer(newlength);
        /*var oldViewer = this.viewer;
        this.buffer = nb;
        this.viewer = new DataView(this.buffer)
        
        for (var i = 0; i < this.offset; i+=8) {
            this.viewer.setFloat64(i, oldViewer.getFloat64(i));
        }*/
        new Uint8Array(nb).set(new Uint8Array(this.buffer));
        //console.log("BL ", this.buffer.byteLength);
        this.buffer = nb;
        this.viewer = new DataView(this.buffer);       
        //console.log("BL ", oldViewer.byteLength);
        // console.log('ByteStream extensed in ', performance.now() - time);
        Globals.Timer.end("extenseTime");
    }
    
    //смещение на length байт
    jump(length) {
        length = +length;
        if(length > 0) {
            this.checkOffset(length - 1);
        }
        this.offset += length;
        return this;
    }
    
    writeByteStream(bs) {
        var arr = bs.toUint8Array();
        while (this.checkOffset(arr.length - 1)) {}
        new Uint8Array(this.buffer).set(arr, this.offset);
        this.offset += arr.length;
    }
    
    writeStrNT(str) {
        this.writeStr(str);
        this.writeByte(0);
    }
    
    writeInt16(val) {
        this.checkOffset(1);
        this.viewer.setInt16(this.offset, val);
        this.offset += 2;
        return this;
    }
    
    writeInt24(val) {
        this.writeByte((val >> 16) & 0xff)
        .writeByte((val >> 8) & 0xff)
        .writeByte(val & 0xff);
        return this;
    }
}
