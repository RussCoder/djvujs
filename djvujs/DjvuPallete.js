'use strict';

class DjVuPallete extends IFFChunk {

    /** @param {ByteStream} bs */
    constructor(bs) {
        //var time = performance.now();
        super(bs);
        this.version = bs.getUint8();
        if (this.version & 0x7f) {
            throw "Bad Djvu Pallete version!";
        }
        this.palleteSize = bs.getInt16();
        if (this.palleteSize < 0 || this.palleteSize > 65535) {
            throw "Bad Djvu Pallete size!";
        }
        this.colorArray = bs.getUint8Array(this.palleteSize * 3);
        if (this.version & 0x80) {
            this.dataSize = bs.getInt24();
            if (this.dataSize < 0) {
                throw "Bad Djvu Pallete data size!";
            }
            var bsz = BZZDecoder.decodeByteStream(bs.fork());
            this.colorIndices = new Int16Array(this.dataSize);
            for (var i = 0; i < this.dataSize; i++) {
                var index = bsz.getInt16();
                if (index < 0 || index >= this.palleteSize) {
                    throw "Bad Djvu Pallete index! " + index;
                }
                this.colorIndices[i] = index;
            }
        }
        //console.log('DjvuPallete time ', performance.now() - time);
    }

    toString() {
        var str = super.toString();
        str += "Pallete size: " + this.palleteSize + "\n";
        str += "Data size: " + this.dataSize + "\n";
        return str;
    }
}