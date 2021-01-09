import { stringToCodePoints, codePointsToUtf8 } from './DjVu';

const pageSize = 64 * 1024;
const growthLimit = 20 * 1024 * 1024 / pageSize;

export default class ByteStreamWriter {
    constructor(length = 0) {
        // As the practice has shown, usage of WebAssembly.Memory and its grow() method
        // is more robust than the manual expansion of ArrayBuffer 
        // via `new Uint8Array(newBuffer).set(new Uint8Array(oldBuffer))`.
        // In particular, with WebAssembly.Memory it's possible to download and bundle
        // a document that is about 1.7 GB in size, while with raw ArrayBuffers 
        // a browser tab crashes (in Chrome) when the buffer reaches about 1.5 GB 
        // (or there is an error that a buffer cannot be allocated).
        this.memory = new WebAssembly.Memory({ initial: Math.ceil(length / pageSize), maximum: 65536 });
        this.assignBufferFromMemory();

        this.offset = 0;
        this.offsetMarks = {};
    }

    assignBufferFromMemory() {
        this.buffer = this.memory.buffer;
        this.viewer = new DataView(this.buffer);
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

    writeByte(byte) {
        this.checkOffset(1);
        this.viewer.setUint8(this.offset++, byte);
        return this;
    }

    writeStr(str) {
        this.writeArray(codePointsToUtf8(stringToCodePoints(str)));
        return this;
    }

    writeInt32(val) {
        this.checkOffset(4);
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

    checkOffset(requiredBytesNumber = 0) {
        const bool = this.offset + requiredBytesNumber > this.buffer.byteLength;
        if (bool) {
            this._expand(requiredBytesNumber);
        }
        return bool;
    }

    _expand(requiredBytesNumber) {
        this.memory.grow(Math.max(
            Math.ceil(requiredBytesNumber / pageSize),
            Math.min(this.memory.buffer.byteLength / pageSize, growthLimit)
        ));
        this.assignBufferFromMemory();
    }

    //смещение на length байт
    jump(length) {
        length = +length;
        if (length > 0) {
            this.checkOffset(length);
        }
        this.offset += length;
        return this;
    }

    writeByteStream(bs) {
        this.writeArray(bs.toUint8Array());
    }

    writeArray(arr) {
        while (this.checkOffset(arr.length)) { }
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
        this.checkOffset(2);
        this.viewer.setInt16(this.offset, val);
        this.offset += 2;
        return this;
    }

    writeUint16(val) {
        this.checkOffset(2);
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
