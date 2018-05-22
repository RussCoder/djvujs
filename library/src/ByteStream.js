import { utf8ToCodePoints, createStringFromUtf8Array } from './DjVu'

/**
 * Объект байтового потока. Предоставляет API для чтения сырого ArrayBuffer как потока байт.
 * После вызова каждого метода чтения, внутренный указатель смещается автоматически.
 * Можно читать числа, строки, массив байт разной длины. 
 */
export default class ByteStream {
    constructor(buffer, offsetx, length) {
        this.buffer = buffer;
        this.offsetx = offsetx || 0;
        this.offset = 0;
        this.length = length || buffer.byteLength;
        if (this.length + offsetx > buffer.byteLength) {
            this.length = buffer.byteLength - offsetx;
            console.error("Incorrect length in ByteStream!");
        }
        this.viewer = new DataView(this.buffer, this.offsetx, this.length);
    }

    // "читает" следующие length байт в массив, возвращает массив основанный на том же ArrayBuffer
    getUint8Array(length) {
        length = length || this.restLength();
        var off = this.offset;
        this.offset += length;
        return new Uint8Array(this.buffer, this.offsetx + off, length);
    }

    // возвращает массив полностью представляющий весь поток
    toUint8Array() {
        return new Uint8Array(this.buffer, this.offsetx, this.length);
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
        var tmp = this.viewer.getInt16(this.offset);
        this.offset += 2;
        return tmp;
    }
    getUint16() {
        var tmp = this.viewer.getUint16(this.offset);
        this.offset += 2;
        return tmp;
    }
    getInt32() {
        var tmp = this.viewer.getInt32(this.offset);
        this.offset += 4;
        return tmp;
    }
    getUint8() {
        return this.viewer.getUint8(this.offset++);
    }

    getInt24() {
        var uint = this.getUint24();
        return (uint & 0x800000) ? (0xffffff - val + 1) * -1 : uint
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
        var array = [];
        var byte = this.getUint8();
        while (byte) {
            array.push(byte);
            byte = this.getUint8();
        }
        return createStringFromUtf8Array(array);
    }

    readStrUTF(byteLength) {
        return createStringFromUtf8Array(this.getUint8Array(byteLength));
    }

    fork(_length) {
        var length = _length || (this.length - this.offset);
        return new ByteStream(this.buffer, this.offsetx + this.offset, length);
    }

    clone() {
        return new ByteStream(this.buffer, this.offsetx, this.length);
    }

    isEmpty() {
        return this.offset >= this.length;
    }


    /*bit() {
        var bit = (this.curbyte & this.bitmask) >>> this.shift;
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
