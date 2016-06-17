'use strict';

class ByteStreamWriter {
    constructor(length) {
        //размер шага роста используемой памяти
        this.growStep = length || 4096;
        this.buffer = new ArrayBuffer(this.growStep);
        this.viewer = new DataView(this.buffer);
        this.offset = 0;
        this.offsetMarks = {};
    }

    /**
     * Переводит смещение на начало и зачищает сохраненные смещения
     */
    reset() {
        this.offset = 0;
        this.offsetMarks = {};
    }

    saveOffsetMark(mark) {
        this.offsetMarks[mark] = this.offset;
        return this;
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

    /**
     * Перезапись числа. Принимает смещение или метку смещения и число
     */
    rewriteInt32(off, val) {
        var xoff = off;
        if (typeof (xoff) === 'string') {
            xoff = this.offsetMarks[off];
            this.offsetMarks[off] += 4;
        }
        this.viewer.setInt32(xoff, val);
    }


    /**
     * Перезапись размера в 4 байта по сохраненной метке
     */
    rewriteSize(offmark) {
        if (!this.offsetMarks[offmark]) throw new Error('Unexisting offset mark');
        var xoff = this.offsetMarks[offmark];
        this.viewer.setInt32(xoff, this.offset - xoff - 4);
    }

    getBuffer() {
        if (this.offset === this.buffer.byteLength) {
            return this.buffer;
        }
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
        if (length > 0) {
            this.checkOffset(length - 1);
        }
        this.offset += length;
        return this;
    }

    writeByteStream(bs) {
        this.writeArray(bs.toUint8Array());
    }

    writeArray(arr) {
        while (this.checkOffset(arr.length - 1)) { }
        new Uint8Array(this.buffer).set(arr, this.offset);
        this.offset += arr.length;
    }

    writeBuffer(buffer) {
        this.writeArray(new Uint8Array(buffer));
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

    writeUint16(val) {
        this.checkOffset(1);
        this.viewer.setUint16(this.offset, val);
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
