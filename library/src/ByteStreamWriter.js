import { stringToCodePoints, codePointsToUtf8 } from './DjVu';

export default class ByteStreamWriter {
    constructor(length) {
        //размер шага роста используемой памяти
        this.growthStep = length || 4096; // not used now
        this.buffer = new ArrayBuffer(this.growthStep);
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

    writeByte(byte) {
        this.checkOffset();
        this.viewer.setUint8(this.offset++, byte);
        return this;
    }

    writeStr(str) {
        this.writeArray(codePointsToUtf8(stringToCodePoints(str)));
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

    checkOffset(requiredBytesNumber = 0) {
        var bool = this.offset + requiredBytesNumber >= this.buffer.byteLength;
        if (bool) {
            this._expand(requiredBytesNumber);
        }
        return bool;
    }

    _expand(requiredBytesNumber) {
        //Globals.Timer.start("expandTime");

        var newLength = 2 * this.buffer.byteLength; // perhaps it's not the best strategy but still it works
        if (newLength < this.buffer.byteLength + requiredBytesNumber) {
            newLength += requiredBytesNumber;
        }
        var nb = new ArrayBuffer(newLength);
        new Uint8Array(nb).set(new Uint8Array(this.buffer)); // быстрое копирование ArrayBuffer
        this.buffer = nb;
        this.viewer = new DataView(this.buffer);

        //Globals.Timer.end("expandTime");
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
