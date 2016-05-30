'use strict';

class DjVuWriter {
    constructor(length) {
        this.bsw = new ByteStreamWriter(length || 1024*1024);
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
        
        //записали длину 
        this.bsw.rewriteInt32(this.dirm.lengthOffset, this.bsw.offset - startOffset);         
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
        this.bsw.writeByteStream(chunk.bs);
    }
        
    /*getByteStream() {
        var bs = new ByteStream(this.buffer);
        return bs;
    }*/
    
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