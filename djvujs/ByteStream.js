'use strict';

class ByteStream {
    constructor(buffer, offsetx, length) {
        this.buffer = buffer;
        this.offsetx = offsetx || 0;
        this.offset = 0;
        this.length = length || buffer.byteLength;
        if (this.length + offsetx > buffer.byteLength) {
            this.length = buffer.byteLength - offsetx;
            console.error("Incorrect length in ByteStream!");
        }
        this.viewer = new DataView(this.buffer,this.offsetx,this.length);
    }
    
    // "читает" следующие length байт в массив 
    getUint8Array(length) {
        length = length || this.restLength();
        var off = this.offset;
        this.offset += length;
        return new Uint8Array(this.buffer,this.offsetx + off,length);
    }
    
    // возвращает массив полностью представляющий весь поток
    toUint8Array() {
        return new Uint8Array(this.buffer,this.offsetx,this.length);
    }
    
    restLength() {
        return this.length - this.offset;
    }
    
    reset() {
        this.offset = 0;
    }
    
    byte() {
        if (this.offset >= this.length) {
            this.offset++;
            return 0xff;
        }
        return this.viewer.getUint8(this.offset++);
    }
    
    getInt8() {
        return this.viewer.getInt8(this.offset++);
    }
    getInt16() {
        let tmp = this.viewer.getInt16(this.offset);
        this.offset += 2;
        return tmp;
    }
    getUint16() {
        let tmp = this.viewer.getUint16(this.offset);
        this.offset += 2;
        return tmp;
    }
    getInt32() {
        let tmp = this.viewer.getInt32(this.offset);
        this.offset += 4;
        return tmp;
    }
    getUint8() {
        return this.viewer.getUint8(this.offset++);
    }
    getUint24() {
        return (this.byte() << 16) | (this.byte() << 8) | this.byte();
    }
    
    jump(length) {
        this.offset += length;
    }
    
    setOffset(offset) {
        this.offset = offset;
    }
    
    readChunkName() {
        return this.readStr4();
    }
    
    readStr4() {
        var str = "";
        for (var i = 0; i < 4; i++) {
            var byte = this.viewer.getUint8(this.offset++);
            str += String.fromCharCode(byte);
        }
        return str;
    }
    
    readStrNT() {
        var str = "";
        var byte = this.viewer.getUint8(this.offset++);
        while (byte) {
            str += String.fromCharCode(byte);
            byte = this.viewer.getUint8(this.offset++);
        }
        return str;
    }
    
    
    fork(_length) {
        var length = _length || (this.length - this.offset);
        var tmp = new ByteStream(this.buffer,this.offsetx + this.offset,length);
        return tmp;
    }

    clone() {
        return new ByteStream(this.buffer, this.offsetx, this.length);
    }

    isEmpty() {
        return this.offset >= this.length;
    }
    
    
    /*bit() {
        let bit = (this.curbyte & this.bitmask) >>> this.shift;
        this.shift--;
        this.bitmask >>= 1;
        if (this.shift < 0) {
            this.bitmask = 128;
            this.shift = 7;
            this.offset++;
            if (this.offset >= this.length) {
                this.curbyte = 255;
            } 
            else {
                this.curbyte = this.viewer.getUint8(this.offset);
            }
        
        }
        return bit;
    }*/
}
