import { createStringFromUtf8Array } from './DjVu'

/** @typedef {ByteStream} ByteStream */

/**
 * Объект байтового потока. Предоставляет API для чтения сырого ArrayBuffer как потока байт.
 * После вызова каждого метода чтения, внутренний указатель смещается автоматически.
 * Можно читать числа, строки, массив байт разной длины. 
 */
export default class ByteStream {
    constructor(buffer, offsetx, length) {
        this._buffer = buffer;
        this.offsetx = offsetx || 0;
        this.offset = 0;
        this._length = length || buffer.byteLength;
        if (this._length + offsetx > buffer.byteLength) {
            this._length = buffer.byteLength - offsetx;
            console.error("Incorrect length in ByteStream!");
        }
        this.viewer = new DataView(this._buffer, this.offsetx, this._length);
    }

    /** @returns {number} */
    get length() { return this._length; }

    /** @returns {ArrayBuffer} */
    get buffer() { return this._buffer; }

    // "читает" следующие length байт в массив, возвращает массив основанный на том же ArrayBuffer
    getUint8Array(length = this.remainingLength()) {
        var off = this.offset;
        this.offset += length;
        return new Uint8Array(this._buffer, this.offsetx + off, length);
    }

    // возвращает массив полностью представляющий весь поток
    toUint8Array() {
        return new Uint8Array(this._buffer, this.offsetx, this._length);
    }

    remainingLength() {
        return this._length - this.offset;
    }

    reset() {
        this.offset = 0;
    }

    byte() { // the function is used inside other codecs (look at ZPCodec)
        if (this.offset >= this._length) {
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
        return this;
    }

    setOffset(offset) {
        this.offset = offset;
    }

    readStr4() { // used to read chunk names, just ASCII characters
        return String.fromCharCode(...this.getUint8Array(4));
    }

    readStrNT() {
        var array = [];
        var byte = this.getUint8();
        while (byte) {
            array.push(byte);
            byte = this.getUint8();
        }
        return createStringFromUtf8Array(new Uint8Array(array));
    }

    readStrUTF(byteLength) {
        return createStringFromUtf8Array(this.getUint8Array(byteLength));
    }

    fork(length = this.remainingLength()) {
        return new ByteStream(this._buffer, this.offsetx + this.offset, length);
    }

    clone() {
        return new ByteStream(this._buffer, this.offsetx, this._length);
    }

    isEmpty() {
        return this.offset >= this._length;
    }
}
