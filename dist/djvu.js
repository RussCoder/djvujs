var DjVu = (function () {
'use strict';

var DjVu = {
    VERSION: '0.0.6',
    IS_DEBUG: false
};
DjVu.Utils = {
    loadFile(url, responseType = 'arraybuffer') {
        return new Promise(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = responseType;
            xhr.onload = (e) => {
                DjVu.IS_DEBUG && console.log("File loaded: ", e.loaded);
                resolve(xhr.response);
            };
            xhr.send();
        });
    }
};

class ByteStreamWriter {
    constructor(length) {
        this.growStep = length || 4096;
        this.buffer = new ArrayBuffer(this.growStep);
        this.viewer = new DataView(this.buffer);
        this.offset = 0;
        this.offsetMarks = {};
    }
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
    rewriteInt32(off, val) {
        var xoff = off;
        if (typeof (xoff) === 'string') {
            xoff = this.offsetMarks[off];
            this.offsetMarks[off] += 4;
        }
        this.viewer.setInt32(xoff, val);
    }
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
        var newlength = this.bufferLength + this.buffer.byteLength;
        var nb = new ArrayBuffer(newlength);
        new Uint8Array(nb).set(new Uint8Array(this.buffer));
        this.buffer = nb;
        this.viewer = new DataView(this.buffer);
    }
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

class ZPEncoder {
    constructor(bsw) {
        this.bsw = bsw || new ByteStreamWriter();
        this.a = 0;
        this.scount = 0;
        this.byte = 0;
        this.delay = 25;
        this.subend = 0;
        this.buffer = 0xffffff;
        this.nrun = 0;
    }
    outbit(bit) {
        if (this.delay > 0) {
            if (this.delay < 0xff)
                this.delay -= 1;
        }
        else {
            this.byte = (this.byte << 1) | bit;
            if (++this.scount == 8) {
                this.bsw.writeByte(this.byte);
                this.scount = 0;
                this.byte = 0;
            }
        }
    }
    zemit(b) {
        this.buffer = (this.buffer << 1) + b;
        b = (this.buffer >> 24);
        this.buffer = (this.buffer & 0xffffff);
        switch (b) {
            case 1:
                this.outbit(1);
                while (this.nrun-- > 0)
                    this.outbit(0);
                this.nrun = 0;
                break;
            case 0xff:
                this.outbit(0);
                while (this.nrun-- > 0)
                    this.outbit(1);
                this.nrun = 0;
                break;
            case 0:
                this.nrun += 1;
                break;
            default:
                throw new Exception('ZPEncoder::zemit() error!');
        }
    }
    encode(bit, ctx, n) {
        bit = +bit;
        if (!ctx) {
            return this._ptencode(bit, 0x8000 + (this.a >> 1));
        }
        var z = this.a + this.p[ctx[n]];
        if (bit != (ctx[n] & 1)) {
            var d = 0x6000 + ((z + this.a) >> 2);
            if (z > d) {
                z = d;
            }
            ctx[n] = this.dn[ctx[n]];
            z = 0x10000 - z;
            this.subend += z;
            this.a += z;
        } else if (z >= 0x8000) {
            var d = 0x6000 + ((z + this.a) >> 2);
            if (z > d) {
                z = d;
            }
            if (this.a >= this.m[ctx[n]])
                ctx[n] = this.up[ctx[n]];
            this.a = z;
        } else {
            this.a = z;
            return;
        }
        while (this.a >= 0x8000) {
            this.zemit(1 - (this.subend >> 15));
            this.subend = 0xffff & (this.subend << 1);
            this.a = 0xffff & (this.a << 1);
        }
    }
    IWencode(bit) {
        this._ptencode(bit, 0x8000 + ((this.a + this.a + this.a) >> 3));
    }
    _ptencode(bit, z) {
        if (bit) {
            z = 0x10000 - z;
            this.subend += z;
            this.a += z;
        } else {
            this.a = z;
        }
        while (this.a >= 0x8000) {
            this.zemit(1 - (this.subend >> 15));
            this.subend = 0xffff & (this.subend << 1);
            this.a = 0xffff & (this.a << 1);
        }
    }
    eflush() {
        if (this.subend > 0x8000)
            this.subend = 0x10000;
        else if (this.subend > 0)
            this.subend = 0x8000;
        while (this.buffer != 0xffffff || this.subend) {
            this.zemit(1 - (this.subend >> 15));
            this.subend = 0xffff & (this.subend << 1);
        }
        this.outbit(1);
        while (this.nrun-- > 0)
            this.outbit(0);
        this.nrun = 0;
        while (this.scount > 0)
            this.outbit(1);
        this.delay = 0xff;
    }
}
class ZPDecoder {
    constructor(bs) {
        this.bs = bs;
        this.a = 0x0000;
        this.c = this.bs.byte();
        this.c <<= 8;
        var tmp = this.bs.byte();
        this.c |= tmp;
        this.z = 0;
        this.d = 0;
        this.f = Math.min(this.c, 0x7fff);
        this.ffzt = new Int8Array(256);
        for (var i = 0; i < 256; i++) {
            this.ffzt[i] = 0;
            for (var j = i; j & 0x80; j <<= 1)
                this.ffzt[i] += 1;
        }
        this.delay = 25;
        this.scount = 0;
        this.buffer = 0;
        this.preload();
    }
    preload() {
        while (this.scount <= 24) {
            var byte = this.bs.byte();
            this.buffer = (this.buffer << 8) | byte;
            this.scount += 8;
        }
    }
    ffz(x) {
        return (x >= 0xff00) ? (this.ffzt[x & 0xff] + 8) : (this.ffzt[(x >> 8) & 0xff]);
    }
    decode(ctx, n) {
        if (!ctx) {
            return this._ptdecode(0x8000 + (this.a >> 1));
        }
        this.b = ctx[n] & 1;
        this.z = this.a + this.p[ctx[n]];
        if (this.z <= this.f) {
            this.a = this.z;
            return this.b;
        }
        this.d = 0x6000 + ((this.a + this.z) >> 2);
        if (this.z > this.d) {
            this.z = this.d;
        }
        if (this.z > this.c) {
            this.b = 1 - this.b;
            this.z = 0x10000 - this.z;
            this.a += this.z;
            this.c += this.z;
            ctx[n] = this.dn[ctx[n]];
            var shift = this.ffz(this.a);
            this.scount -= shift;
            this.a = 0xffff & (this.a << shift);
            this.c = 0xffff & (
                (this.c << shift) | (this.buffer >> this.scount) & ((1 << shift) - 1)
            );
        }
        else {
            if (this.a >= this.m[ctx[n]]) {
                ctx[n] = this.up[ctx[n]];
            }
            this.scount--;
            this.a = 0xffff & (this.z << 1);
            this.c = 0xffff & (
                (this.c << 1) | ((this.buffer >> this.scount) & 1)
            );
        }
        if (this.scount < 16)
            this.preload();
        this.f = Math.min(this.c, 0x7fff);
        return this.b;
    }
    IWdecode() {
        return this._ptdecode(0x8000 + ((this.a + this.a + this.a) >> 3));
    }
    _ptdecode(z) {
        this.b = 0;
        if (z > this.c) {
            this.b = 1;
            z = 0x10000 - z;
            this.a += z;
            this.c += z;
            var shift = this.ffz(this.a);
            this.scount -= shift;
            this.a = 0xffff & (this.a << shift);
            this.c = 0xffff & (
                (this.c << shift) | (this.buffer >> this.scount) & ((1 << shift) - 1)
            );
        }
        else {
            this.b = 0;
            this.scount--;
            this.a = 0xffff & (z << 1);
            this.c = 0xffff & (
                (this.c << 1) | ((this.buffer >> this.scount) & 1)
            );
        }
        if (this.scount < 16)
            this.preload();
        this.f = Math.min(this.c, 0x7fff);
        return this.b;
    }
}
ZPEncoder.prototype.p = ZPDecoder.prototype.p = Uint16Array.of(
    0x8000, 0x8000, 0x8000, 0x6bbd, 0x6bbd, 0x5d45, 0x5d45, 0x51b9, 0x51b9, 0x4813,
    0x4813, 0x3fd5, 0x3fd5, 0x38b1, 0x38b1, 0x3275, 0x3275, 0x2cfd, 0x2cfd, 0x2825,
    0x2825, 0x23ab, 0x23ab, 0x1f87, 0x1f87, 0x1bbb, 0x1bbb, 0x1845, 0x1845, 0x1523,
    0x1523, 0x1253, 0x1253, 0xfcf, 0xfcf, 0xd95, 0xd95, 0xb9d, 0xb9d, 0x9e3,
    0x9e3, 0x861, 0x861, 0x711, 0x711, 0x5f1, 0x5f1, 0x4f9, 0x4f9, 0x425,
    0x425, 0x371, 0x371, 0x2d9, 0x2d9, 0x259, 0x259, 0x1ed, 0x1ed, 0x193,
    0x193, 0x149, 0x149, 0x10b, 0x10b, 0xd5, 0xd5, 0xa5, 0xa5, 0x7b,
    0x7b, 0x57, 0x57, 0x3b, 0x3b, 0x23, 0x23, 0x13, 0x13, 0x7,
    0x7, 0x1, 0x1, 0x5695, 0x24ee, 0x8000, 0xd30, 0x481a, 0x481, 0x3579,
    0x17a, 0x24ef, 0x7b, 0x1978, 0x28, 0x10ca, 0xd, 0xb5d, 0x34, 0x78a,
    0xa0, 0x50f, 0x117, 0x358, 0x1ea, 0x234, 0x144, 0x173, 0x234, 0xf5,
    0x353, 0xa1, 0x5c5, 0x11a, 0x3cf, 0x1aa, 0x285, 0x286, 0x1ab, 0x3d3,
    0x11a, 0x5c5, 0xba, 0x8ad, 0x7a, 0xccc, 0x1eb, 0x1302, 0x2e6, 0x1b81,
    0x45e, 0x24ef, 0x690, 0x2865, 0x9de, 0x3987, 0xdc8, 0x2c99, 0x10ca, 0x3b5f,
    0xb5d, 0x5695, 0x78a, 0x8000, 0x50f, 0x24ee, 0x358, 0xd30, 0x234, 0x481,
    0x173, 0x17a, 0xf5, 0x7b, 0xa1, 0x28, 0x11a, 0xd, 0x1aa, 0x34,
    0x286, 0xa0, 0x3d3, 0x117, 0x5c5, 0x1ea, 0x8ad, 0x144, 0xccc, 0x234,
    0x1302, 0x353, 0x1b81, 0x5c5, 0x24ef, 0x3cf, 0x2b74, 0x285, 0x201d, 0x1ab,
    0x1715, 0x11a, 0xfb7, 0xba, 0xa67, 0x1eb, 0x6e7, 0x2e6, 0x496, 0x45e,
    0x30d, 0x690, 0x206, 0x9de, 0x155, 0xdc8, 0xe1, 0x2b74, 0x94, 0x201d,
    0x188, 0x1715, 0x252, 0xfb7, 0x383, 0xa67, 0x547, 0x6e7, 0x7e2, 0x496,
    0xbc0, 0x30d, 0x1178, 0x206, 0x19da, 0x155, 0x24ef, 0xe1, 0x320e, 0x94,
    0x432a, 0x188, 0x447d, 0x252, 0x5ece, 0x383, 0x8000, 0x547, 0x481a, 0x7e2,
    0x3579, 0xbc0, 0x24ef, 0x1178, 0x1978, 0x19da, 0x2865, 0x24ef, 0x3987, 0x320e,
    0x2c99, 0x432a, 0x3b5f, 0x447d, 0x5695, 0x5ece, 0x8000, 0x8000, 0x5695, 0x481a, 0x481a
);
ZPEncoder.prototype.m = ZPDecoder.prototype.m = Uint16Array.of(
    0x0, 0x0, 0x0, 0x10a5, 0x10a5, 0x1f28, 0x1f28, 0x2bd3, 0x2bd3, 0x36e3,
    0x36e3, 0x408c, 0x408c, 0x48fd, 0x48fd, 0x505d, 0x505d, 0x56d0, 0x56d0, 0x5c71,
    0x5c71, 0x615b, 0x615b, 0x65a5, 0x65a5, 0x6962, 0x6962, 0x6ca2, 0x6ca2, 0x6f74,
    0x6f74, 0x71e6, 0x71e6, 0x7404, 0x7404, 0x75d6, 0x75d6, 0x7768, 0x7768, 0x78c2,
    0x78c2, 0x79ea, 0x79ea, 0x7ae7, 0x7ae7, 0x7bbe, 0x7bbe, 0x7c75, 0x7c75, 0x7d0f,
    0x7d0f, 0x7d91, 0x7d91, 0x7dfe, 0x7dfe, 0x7e5a, 0x7e5a, 0x7ea6, 0x7ea6, 0x7ee6,
    0x7ee6, 0x7f1a, 0x7f1a, 0x7f45, 0x7f45, 0x7f6b, 0x7f6b, 0x7f8d, 0x7f8d, 0x7faa,
    0x7faa, 0x7fc3, 0x7fc3, 0x7fd7, 0x7fd7, 0x7fe7, 0x7fe7, 0x7ff2, 0x7ff2, 0x7ffa,
    0x7ffa, 0x7fff, 0x7fff, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0
);
ZPEncoder.prototype.up = ZPDecoder.prototype.up = Uint8Array.of(
    84, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
    32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
    42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
    52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
    62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
    72, 73, 74, 75, 76, 77, 78, 79, 80, 81,
    82, 81, 82, 9, 86, 5, 88, 89, 90, 91,
    92, 93, 94, 95, 96, 97, 82, 99, 76, 101,
    70, 103, 66, 105, 106, 107, 66, 109, 60, 111,
    56, 69, 114, 65, 116, 61, 118, 57, 120, 53,
    122, 49, 124, 43, 72, 39, 60, 33, 56, 29,
    52, 23, 48, 23, 42, 137, 38, 21, 140, 15,
    142, 9, 144, 141, 146, 147, 148, 149, 150, 151,
    152, 153, 154, 155, 70, 157, 66, 81, 62, 75,
    58, 69, 54, 65, 50, 167, 44, 65, 40, 59,
    34, 55, 30, 175, 24, 177, 178, 179, 180, 181,
    182, 183, 184, 69, 186, 59, 188, 55, 190, 51,
    192, 47, 194, 41, 196, 37, 198, 199, 72, 201,
    62, 203, 58, 205, 54, 207, 50, 209, 46, 211,
    40, 213, 36, 215, 30, 217, 26, 219, 20, 71,
    14, 61, 14, 57, 8, 53, 228, 49, 230, 45,
    232, 39, 234, 35, 138, 29, 24, 25, 240, 19,
    22, 13, 16, 13, 10, 7, 244, 249, 10, 89, 230
);
ZPEncoder.prototype.dn = ZPDecoder.prototype.dn = Uint8Array.of(
    145, 4, 3, 1, 2, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
    28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
    38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
    58, 59, 60, 61, 62, 63, 64, 65, 66, 67,
    68, 69, 70, 71, 72, 73, 74, 75, 76, 77,
    78, 79, 80, 85, 226, 6, 176, 143, 138, 141,
    112, 135, 104, 133, 100, 129, 98, 127, 72, 125,
    102, 123, 60, 121, 110, 119, 108, 117, 54, 115,
    48, 113, 134, 59, 132, 55, 130, 51, 128, 47,
    126, 41, 62, 37, 66, 31, 54, 25, 50, 131,
    46, 17, 40, 15, 136, 7, 32, 139, 172, 9,
    170, 85, 168, 248, 166, 247, 164, 197, 162, 95,
    160, 173, 158, 165, 156, 161, 60, 159, 56, 71,
    52, 163, 48, 59, 42, 171, 38, 169, 32, 53,
    26, 47, 174, 193, 18, 191, 222, 189, 218, 187,
    216, 185, 214, 61, 212, 53, 210, 49, 208, 45,
    206, 39, 204, 195, 202, 31, 200, 243, 64, 239,
    56, 237, 52, 235, 48, 233, 44, 231, 38, 229,
    34, 227, 28, 225, 22, 223, 16, 221, 220, 63,
    8, 55, 224, 51, 2, 47, 87, 43, 246, 37,
    244, 33, 238, 27, 236, 21, 16, 15, 8, 241,
    242, 7, 10, 245, 2, 1, 83, 250, 2, 143, 246
);

class BZZEncoder {
    constructor(zp) {
        this.zp = zp || new ZPEncoder();
        this.FREQMAX = 4;
        this.CTXIDS = 3;
        this.ctx = new Uint8Array(300);
        this.size = 0;
        this.blocksize = 0;
        this.FREQS0 = 100000;
        this.FREQS1 = 1000000;
    }
    blocksort(arr) {
        var length = arr.length;
        var offs = new Array(arr.length);
        for (var i = 0; i < length; offs[i] = i++) { }
        offs.sort((a, b) => {
            for (var i = 0; i < length; i++) {
                if (a === this.markerpos) {
                    return -1;
                }
                else if (b === this.markerpos) {
                    return 1;
                }
                var res = arr[a % length] - arr[b % length];
                if (res) {
                    return res;
                }
                a++;
                b++;
            }
            return 0;
        });
        var narr = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            var pos = offs[i] - 1;
            if (pos >= 0) {
                narr[i] = arr[pos];
            }
            else {
                narr[i] = 0;
                this.markerpos = i;
            }
        }
        return narr;
    }
    encode_raw(bits, x) {
        var n = 1;
        var m = (1 << bits);
        while (n < m) {
            x = (x & (m - 1)) << 1;
            var b = (x >> bits);
            this.zp.encode(b);
            n = (n << 1) | b;
        }
    }
    encode_binary(cxtoff, bits, x) {
        var n = 1;
        var m = (1 << bits);
        cxtoff--;
        while (n < m) {
            x = (x & (m - 1)) << 1;
            var b = (x >> bits);
            this.zp.encode(b, this.ctx, cxtoff + n);
            n = (n << 1) | b;
        }
    }
    encode(buffer) {
        var data = new Uint8Array(buffer);
        var size = data.length;
        var markerpos = size - 1;
        this.markerpos = markerpos;
        data = this.blocksort(data);
        markerpos = this.markerpos;
        this.encode_raw(24, size);
        var fshift = 0;
        if (size < this.FREQS0) {
            fshift = 0;
            this.zp.encode(0);
        }
        else if (size < this.FREQS1) {
            fshift = 1;
            this.zp.encode(1);
            this.zp.encode(0);
        }
        else {
            fshift = 2;
            this.zp.encode(1);
            this.zp.encode(1);
        }
        var mtf = new Uint8Array(256);
        var rmtf = new Uint8Array(256);
        var freq = new Uint32Array(this.FREQMAX);
        var m = 0;
        for (m = 0; m < 256; m++)
            mtf[m] = m;
        for (m = 0; m < 256; m++)
            rmtf[mtf[m]] = m;
        var fadd = 4;
        for (m = 0; m < this.FREQMAX; m++)
            freq[m] = 0;
        var i;
        var mtfno = 3;
        for (i = 0; i < size; i++) {
            var c = data[i];
            var ctxid = this.CTXIDS - 1;
            if (ctxid > mtfno)
                ctxid = mtfno;
            mtfno = rmtf[c];
            if (i == markerpos)
                mtfno = 256;
            var b;
            var ctxoff = 0;
            switch (0)
            {
                default:
                    b = (mtfno == 0);
                    this.zp.encode(b, this.ctx, ctxoff + ctxid);
                    if (b)
                        break;
                    ctxoff += this.CTXIDS;
                    b = (mtfno == 1);
                    this.zp.encode(b, this.ctx, ctxoff + ctxid);
                    if (b)
                        break;
                    ctxoff += this.CTXIDS;
                    b = (mtfno < 4);
                    this.zp.encode(b, this.ctx, ctxoff);
                    if (b) {
                        this.encode_binary(ctxoff + 1, 1, mtfno - 2);
                        break;
                    }
                    ctxoff += 1 + 1;
                    b = (mtfno < 8);
                    this.zp.encode(b, this.ctx, ctxoff);
                    if (b) {
                        this.encode_binary(ctxoff + 1, 2, mtfno - 4);
                        break;
                    }
                    ctxoff += 1 + 3;
                    b = (mtfno < 16);
                    this.zp.encode(b, this.ctx, ctxoff);
                    if (b) {
                        this.encode_binary(ctxoff + 1, 3, mtfno - 8);
                        break;
                    }
                    ctxoff += 1 + 7;
                    b = (mtfno < 32);
                    this.zp.encode(b, this.ctx, ctxoff);
                    if (b) {
                        this.encode_binary(ctxoff + 1, 4, mtfno - 16);
                        break;
                    }
                    ctxoff += 1 + 15;
                    b = (mtfno < 64);
                    this.zp.encode(b, this.ctx, ctxoff);
                    if (b) {
                        this.encode_binary(ctxoff + 1, 5, mtfno - 32);
                        break;
                    }
                    ctxoff += 1 + 31;
                    b = (mtfno < 128);
                    this.zp.encode(b, this.ctx, ctxoff);
                    if (b) {
                        this.encode_binary(ctxoff + 1, 6, mtfno - 64);
                        break;
                    }
                    ctxoff += 1 + 63;
                    b = (mtfno < 256);
                    this.zp.encode(b, this.ctx, ctxoff);
                    if (b) {
                        this.encode_binary(ctxoff + 1, 7, mtfno - 128);
                        break;
                    }
                    continue;
            }
            fadd = fadd + (fadd >> fshift);
            if (fadd > 0x10000000) {
                fadd = fadd >> 24;
                freq[0] >>= 24;
                freq[1] >>= 24;
                freq[2] >>= 24;
                freq[3] >>= 24;
                for (var k = 4; k < this.FREQMAX; k++)
                    freq[k] = freq[k] >> 24;
            }
            var fc = fadd;
            if (mtfno < this.FREQMAX)
                fc += freq[mtfno];
            var k;
            for (k = mtfno; k >= this.FREQMAX; k--) {
                mtf[k] = mtf[k - 1];
                rmtf[mtf[k]] = k;
            }
            for (; k > 0 && fc >= freq[k - 1]; k--) {
                mtf[k] = mtf[k - 1];
                freq[k] = freq[k - 1];
                rmtf[mtf[k]] = k;
            }
            mtf[k] = c;
            freq[k] = fc;
            rmtf[mtf[k]] = k;
        }
        this.encode_raw(24, 0);
        this.zp.eflush();
        return 0;
    }
}

class DjVuWriter {
    constructor(length) {
        this.bsw = new ByteStreamWriter(length || 1024 * 1024);
    }
    startDJVM() {
        this.bsw.writeStr('AT&T').writeStr('FORM').saveOffsetMark('fileSize')
            .jump(4).writeStr('DJVM');
    }
    writeDirmChunk(dirm) {
        this.dirm = dirm;
        this.bsw.writeStr('DIRM').saveOffsetMark('DIRMsize').jump(4);
        this.dirm.offsets = [];
        this.bsw.writeByte(dirm.dflags)
            .writeInt16(dirm.flags.length)
            .saveOffsetMark('DIRMoffsets')
            .jump(4 * dirm.flags.length);
        var tmpBS = new ByteStreamWriter();
        for (var i = 0; i < dirm.sizes.length; i++) {
            tmpBS.writeInt24(dirm.sizes[i]);
        }
        for (var i = 0; i < dirm.flags.length; i++) {
            tmpBS.writeByte(dirm.flags[i]);
        }
        for (var i = 0; i < dirm.ids.length; i++) {
            tmpBS.writeStrNT(dirm.ids[i]);
            if (dirm.flags[i] & 128) {
                tmpBS.writeStrNT(dirm.names[i]);
            }
            if (dirm.flags[i] & 64) {
                tmpBS.writeStrNT(dirm.titles[i]);
            }
        }
        tmpBS.writeByte(0);
        var tmpBuffer = tmpBS.getBuffer();
        var bzzBS = new ByteStreamWriter();
        var zp = new ZPEncoder(bzzBS);
        var bzz = new BZZEncoder(zp);
        bzz.encode(tmpBuffer);
        var encodedBuffer = bzzBS.getBuffer();
        this.bsw.writeBuffer(encodedBuffer);
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
        if (this.bsw.offset & 1) {
            this.bsw.writeByte(0);
        }
        var off = this.bsw.offset;
        this.dirm.offsets.push(off);
        this.bsw.writeByteStream(bs);
    }
    writeFormChunkBuffer(buffer) {
        if (this.bsw.offset & 1) {
            this.bsw.writeByte(0);
        }
        var off = this.bsw.offset;
        this.dirm.offsets.push(off);
        this.bsw.writeBuffer(buffer);
    }
    writeChunk(chunk) {
        if (this.bsw.offset & 1) {
            this.bsw.writeByte(0);
        }
        this.bsw.writeByteStream(chunk.bs);
    }
    getBuffer() {
        this.bsw.rewriteSize('fileSize');
        if (this.dirm.offsets.length !== (this.dirm.flags.length)) {
            throw new Error("Записаны не все страницы и словари !!!");
        }
        for (var i = 0; i < this.dirm.offsets.length; i++) {
            this.bsw.rewriteInt32('DIRMoffsets', this.dirm.offsets[i]);
        }
        return this.bsw.getBuffer();
    }
}

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
        this.viewer = new DataView(this.buffer, this.offsetx, this.length);
    }
    getUint8Array(length) {
        length = length || this.restLength();
        var off = this.offset;
        this.offset += length;
        return new Uint8Array(this.buffer, this.offsetx + off, length);
    }
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
        var str = "";
        var byte = this.viewer.getUint8(this.offset++);
        while (byte) {
            str += String.fromCharCode(byte);
            byte = this.viewer.getUint8(this.offset++);
        }
        return str;
    }
    readStrUTF(byteLength) {
        var array = this.getUint8Array(byteLength);
        return String.fromCodePoint ? String.fromCodePoint(...array) : String.fromCharCode(...array);
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
}

class Bytemap extends Array {
    constructor(width, height) {
        super(height);
        this.height = height;
        this.width = width;
        for (var i = 0; i < height; i++) {
            this[i] = new Int16Array(width);
        }
    }
}
class Block extends Int16Array {
    constructor(buffer, offset) {
        super(buffer, offset, 1024);
        this.buckets = new Array(64);
        var boff = 0;
        for (var i = 0; i < 64; i++) {
            this.buckets[i] = new Int16Array(buffer, offset | boff, 16);
            offset += 32;
        }
    }
    getCoef(n) {
        return this[n];
    }
    setCoef(n, val) {
        this[n] = val;
    }
    static createBlockArray(length) {
        var blocks = new Array(length);
        var buffer = new ArrayBuffer(length << 11);
        for (var i = 0; i < length; i++) {
            blocks[i] = new Block(buffer, i << 11);
        }
        return blocks;
    }
}
class IWCodecBaseClass {
    constructor() {
        this.quant_lo = [0x004000, 0x008000, 0x008000, 0x010000, 0x010000, 0x010000, 0x010000, 0x010000, 0x010000, 0x010000, 0x010000, 0x010000, 0x020000, 0x020000, 0x020000, 0x020000];
        this.quant_hi = [0, 0x020000, 0x020000, 0x040000, 0x040000, 0x040000, 0x080000, 0x040000, 0x040000, 0x080000];
        this.bucketstate = new Uint8Array(16);
        this.coeffstate = new Array(16);
        for (var i = 0; i < 16; this.coeffstate[i++] = new Uint8Array(16)) { }
        this.bbstate = 0;
        this.decodeBucketCtx = new Uint8Array(1);
        this.decodeCoefCtx = new Uint8Array(80);
        this.activateCoefCtx = new Uint8Array(16);
        this.inreaseCoefCtx = new Uint8Array(1);
        this.curband = 0;
    }
    getBandBuckets(band) {
        return this.bandBuckets[band];
    }
    is_null_slice() {
        if (this.curband == 0)
        {
            var is_null = 1;
            for (var i = 0; i < 16; i++) {
                var threshold = this.quant_lo[i];
                this.coeffstate[0][i] = 1        ;
                if (threshold > 0 && threshold < 0x8000) {
                    this.coeffstate[0][i] = 8       ;
                    is_null = 0;
                }
            }
            return is_null;
        } else
        {
            var threshold = this.quant_hi[this.curband];
            return (!(threshold > 0 && threshold < 0x8000));
        }
    }
    finish_code_slice() {
        this.quant_hi[this.curband] = this.quant_hi[this.curband] >> 1;
        if (this.curband === 0) {
            for (var i = 0; i < 16; i++)
                this.quant_lo[i] = this.quant_lo[i] >> 1;
        }
        this.curband++;
        if (this.curband === 10) {
            this.curband = 0;
        }
    }
}
IWCodecBaseClass.prototype.ZERO = 1;
IWCodecBaseClass.prototype.ACTIVE = 2;
IWCodecBaseClass.prototype.NEW = 4;
IWCodecBaseClass.prototype.UNK = 8;
IWCodecBaseClass.prototype.zigzagRow = Uint8Array.of(0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31);
IWCodecBaseClass.prototype.zigzagCol = Uint8Array.of(0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31);
IWCodecBaseClass.prototype.bandBuckets = [
    { from: 0, to: 0 },
    { from: 1, to: 1 },
    { from: 2, to: 2 },
    { from: 3, to: 3 },
    { from: 4, to: 7 },
    { from: 8, to: 11 },
    { from: 12, to: 15 },
    { from: 16, to: 31 },
    { from: 32, to: 47 },
    { from: 48, to: 63 }
];

class IWDecoder extends IWCodecBaseClass {
    constructor() {
        super();
    }
    init(imageinfo) {
        this.info = imageinfo;
        let blockCount = Math.ceil(this.info.width / 32) * Math.ceil(this.info.height / 32);
        this.blocks = Block.createBlockArray(blockCount);
    }
    decodeSlice(zp, imageinfo) {
        if (!this.info) {
            this.init(imageinfo);
        } else {
            this.info.slices = imageinfo.slices;
        }
        this.zp = zp;
        if (!this.is_null_slice()) {
            for (var i = 0; i < this.blocks.length; i++) {
                var block = this.blocks[i];
                this.preliminaryFlagComputation(block);
                if (this.blockBandDecodingPass(block, this.curband)) {
                    this.bucketDecodingPass(block, this.curband);
                    this.newlyActiveCoefficientDecodingPass(block, this.curband);
                }
                this.previouslyActiveCoefficientDecodingPass(block, this.curband);
            }
        }
        this.finish_code_slice();
    }
    previouslyActiveCoefficientDecodingPass(block) {
        var boff = 0;
        var step = this.quant_hi[this.curband];
        var indices = this.getBandBuckets(this.curband);
        for (var i = indices.from; i <= indices.to; i++ ,
            boff++) {
            for (var j = 0; j < 16; j++) {
                if (this.coeffstate[boff][j] & 2           ) {
                    if (!this.curband) {
                        step = this.quant_lo[j];
                    }
                    var des = 0;
                    var coef = Math.abs(block.buckets[i][j]);
                    if (coef <= 3 * step) {
                        des = this.zp.decode(this.inreaseCoefCtx, 0);
                        coef += step >> 2;
                    } else {
                        des = this.zp.IWdecode();
                    }
                    if (des) {
                        coef += step >> 1;
                    } else {
                        coef += -step + (step >> 1);
                    }
                    block.buckets[i][j] = block.buckets[i][j] < 0 ? -coef : coef;
                }
            }
        }
    }
    newlyActiveCoefficientDecodingPass(block, band) {
        var boff = 0;
        var indices = this.getBandBuckets(band);
        var step = this.quant_hi[this.curband];
        for (var i = indices.from; i <= indices.to; i++ ,
            boff++) {
            if (this.bucketstate[boff] & 4       ) {
                var shift = 0;
                if (this.bucketstate[boff] & 2          ) {
                    shift = 8;
                }
                var bucket = block.buckets[i];
                var np = 0;
                for (var j = 0; j < 16; j++) {
                    if (this.coeffstate[boff][j] & 8       ) {
                        np++;
                    }
                }
                for (var j = 0; j < 16; j++) {
                    if (this.coeffstate[boff][j] & 8       ) {
                        var ip = Math.min(7, np);
                        var des = this.zp.decode(this.activateCoefCtx, shift + ip);
                        if (des) {
                            var sign = this.zp.IWdecode() ? -1 : 1;
                            np = 0;
                            if (!this.curband) {
                                step = this.quant_lo[j];
                            }
                            bucket[j] = sign * (step + (step >> 1) - (step >> 3));
                        }
                        if (np) {
                            np--;
                        }
                    }
                }
            }
        }
    }
    bucketDecodingPass(block, band) {
        var indices = this.getBandBuckets(band);
        var boff = 0;
        for (var i = indices.from; i <= indices.to; i++ ,
            boff++) {
            if (!(this.bucketstate[boff] & 8       )) {
                continue;
            }
            var n = 0;
            if (band) {
                var t = 4 * i;
                for (var j = t; j < t + 4; j++) {
                    if (block.getCoef(j)) {
                        n++;
                    }
                }
                if (n === 4) {
                    n--;
                }
            }
            if (this.bbstate & 2          ) {
                n |= 4;
            }
            if (this.zp.decode(this.decodeCoefCtx, n + band * 8)) {
                this.bucketstate[boff] |= 4       ;
            }
        }
    }
    blockBandDecodingPass() {
        var indices = this.getBandBuckets(this.curband);
        var bcount = indices.to - indices.from + 1;
        if (bcount < 16 || (this.bbstate & 2          )) {
            this.bbstate |= 4        ;
        } else if (this.bbstate & 8       ) {
            if (this.zp.decode(this.decodeBucketCtx, 0)) {
                this.bbstate |= 4       ;
            }
        }
        return this.bbstate & 4       ;
    }
    preliminaryFlagComputation(block) {
        this.bbstate = 0;
        var bstatetmp = 0;
        var indices = this.getBandBuckets(this.curband);
        if (this.curband) {
            var boff = 0;
            for (var j = indices.from; j <= indices.to; j++ ,
                boff++) {
                bstatetmp = 0;
                var bucket = block.buckets[j];
                for (var k = 0; k < bucket.length; k++) {
                    if (bucket[k] === 0) {
                        this.coeffstate[boff][k] = 8       ;
                    } else {
                        this.coeffstate[boff][k] = 2          ;
                    }
                    bstatetmp |= this.coeffstate[boff][k];
                }
                this.bucketstate[boff] = bstatetmp;
                this.bbstate |= bstatetmp;
            }
        } else {
            var bucket = block.buckets[0];
            for (var k = 0; k < bucket.length; k++) {
                if (this.coeffstate[0][k] !== 1        ) {
                    if (bucket[k] === 0) {
                        this.coeffstate[0][k] = 8       ;
                    } else {
                        this.coeffstate[0][k] = 2          ;
                    }
                }
                bstatetmp |= this.coeffstate[0][k];
            }
            this.bucketstate[0] = bstatetmp;
            this.bbstate |= bstatetmp;
        }
    }
    getBytemap(noInverse) {
        var fullWidth = Math.ceil(this.info.width / 32) * 32;
        var fullHeight = Math.ceil(this.info.height / 32) * 32;
        var blockRows = Math.ceil(this.info.height / 32);
        var blockCols = Math.ceil(this.info.width / 32);
        var bitmap = new Array(fullHeight);
        for (var i = 0; i < fullHeight; i++) {
            bitmap[i] = new Float32Array(fullWidth);
        }
        for (var r = 0; r < blockRows; r++) {
            for (var c = 0; c < blockCols; c++) {
                var block = this.blocks[r * blockCols + c];
                for (var i = 0; i < 1024; i++) {
                    bitmap[this.zigzagRow[i] + 32 * r][this.zigzagCol[i] + 32 * c] = block.getCoef(i);
                }
            }
        }
        if (!noInverse) {
            this.inverseWaveletTransform(bitmap);
        }
        return bitmap;
    }
    inverseWaveletTransform(bitmap) {
        var s = 16;
        while (s) {
            var kmax = Math.floor((this.info.height - 1) / s);
            for (var i = 0; i < this.info.width; i += s) {
                for (var k = 0; k <= kmax; k += 2) {
                    var a, b, c, d;
                    if (k - 1 < 0) {
                        a = 0;
                    } else {
                        a = bitmap[(k - 1) * s][i];
                    }
                    if (k - 3 < 0) {
                        c = 0;
                    } else {
                        c = bitmap[(k - 3) * s][i];
                    }
                    if (k + 1 > kmax) {
                        b = 0;
                    } else {
                        b = bitmap[(k + 1) * s][i];
                    }
                    if (k + 3 > kmax) {
                        d = 0;
                    } else {
                        d = bitmap[(k + 3) * s][i];
                    }
                    bitmap[k * s][i] -= (9 * (a + b) - (c + d) + 16) >> 5;
                }
                for (var k = 1; k <= kmax; k += 2) {
                    if ((k - 3 >= 0) && (k + 3 <= kmax)) {
                        bitmap[k * s][i] += (9 * (bitmap[(k - 1) * s][i] + bitmap[(k + 1) * s][i]) - (bitmap[(k - 3) * s][i] + bitmap[(k + 3) * s][i]) + 8) >> 4;
                    } else if (k + 1 <= kmax) {
                        bitmap[k * s][i] += (bitmap[(k - 1) * s][i] + bitmap[(k + 1) * s][i] + 1) >> 1;
                    } else {
                        bitmap[k * s][i] += bitmap[(k - 1) * s][i];
                    }
                }
            }
            kmax = Math.floor((this.info.width - 1) / s);
            for (var i = 0; i < this.info.height; i += s) {
                for (var k = 0; k <= kmax; k += 2) {
                    var a, b, c, d;
                    if (k - 1 < 0) {
                        a = 0;
                    } else {
                        a = bitmap[i][(k - 1) * s];
                    }
                    if (k - 3 < 0) {
                        c = 0;
                    } else {
                        c = bitmap[i][(k - 3) * s];
                    }
                    if (k + 1 > kmax) {
                        b = 0;
                    } else {
                        b = bitmap[i][(k + 1) * s];
                    }
                    if (k + 3 > kmax) {
                        d = 0;
                    } else {
                        d = bitmap[i][(k + 3) * s];
                    }
                    bitmap[i][k * s] -= (9 * (a + b) - (c + d) + 16) >> 5;
                }
                for (var k = 1; k <= kmax; k += 2) {
                    if ((k - 3 >= 0) && (k + 3 <= kmax)) {
                        bitmap[i][k * s] += (9 * (bitmap[i][(k - 1) * s] + bitmap[i][(k + 1) * s]) - (bitmap[i][(k - 3) * s] + bitmap[i][(k + 3) * s]) + 8) >> 4;
                    } else if (k + 1 <= kmax) {
                        bitmap[i][k * s] += (bitmap[i][(k - 1) * s] + bitmap[i][(k + 1) * s] + 1) >> 1;
                    } else {
                        bitmap[i][k * s] += bitmap[i][(k - 1) * s];
                    }
                }
            }
            s >>= 1;
        }
    }
}

class IWImage {
    constructor() {
        this.ycodec = new IWDecoder();
        this.cslice = 0;
        this.info = null;
        this.pixelmap = null;
    }
    decodeChunk(zp, header) {
        if (!this.info) {
            this.info = header;
            if (!header.grayscale) {
                this.crcodec = new IWDecoder();
                this.cbcodec = new IWDecoder();
            }
        } else {
            this.info.slices = header.slices;
        }
        for (var i = 0; i < this.info.slices; i++) {
            this.cslice++;
            this.ycodec.decodeSlice(zp, header);
            if (this.crcodec && this.cbcodec && this.cslice > this.info.delayInit) {
                this.cbcodec.decodeSlice(zp, header);
                this.crcodec.decodeSlice(zp, header);
            }
        }
    }
    createPixelmap() {
        if (!this.pixelmap) {
            var ybitmap = this.ycodec.getBytemap();
            var cbbitmap = this.cbcodec ? this.cbcodec.getBytemap() : null;
            var crbitmap = this.crcodec ? this.crcodec.getBytemap() : null;
            this.pixelmap = new Pixelmap(ybitmap, cbbitmap, crbitmap);
        }
    }
    getImage() {
        if (!this.pixelmap) {
            this.pixelmap = this.createPixelmap();
        }
        var width = this.info.width;
        var height = this.info.height;
        var image = new ImageData(width, height);
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var pixel = this.pixelmap.getPixel(i, j);
                let index = ((height - i - 1) * width + j) * 4;
                image.data[index] = pixel.r;
                image.data[index + 1] = pixel.g;
                image.data[index + 2] = pixel.b;
                image.data[index + 3] = 255;
            }
        }
        return image;
    }
}
class Pixelmap {
    constructor(ybytemap, cbbytemap, crbytemap) {
        this.ybytemap = ybytemap;
        this.cbbytemap = cbbytemap;
        this.crbytemap = crbytemap;
        this.pixel = { r: 0, g: 0, b: 0 };
    }
    _normalize(val) {
        val = (val + 32) >> 6;
        if (val < -128) {
            val = -128;
        } else if (val >= 128) {
            val = 127;
        }
        return val;
    }
    getPixel(i, j) {
        if (this.cbbytemap) {
            var y = this._normalize(this.ybytemap[i][j]);
            var b = this._normalize(this.cbbytemap[i][j]);
            var r = this._normalize(this.crbytemap[i][j]);
            var t1 = b >> 2;
            var t2 = r + (r >> 1);
            var t3 = y + 128 - t1;
            this.pixel.r = y + 128 + t2;
            this.pixel.g = t3 - (t2 >> 1);
            this.pixel.b = t3 + (b << 1);
        } else {
            var v = this._normalize(this.ybytemap[i][j]);
            v = 127 - v;
            this.pixel.r = v;
            this.pixel.g = v;
            this.pixel.b = v;
        }
        return this.pixel;
    }
}

class BZZDecoder {
    constructor(zp) {
        this.zp = zp;
        this.maxblock = 4096;
        this.FREQMAX = 4;
        this.CTXIDS = 3;
        this.mtf = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            this.mtf[i] = i;
        }
        this.ctx = new Uint8Array(300);
        this.size = 0;
        this.blocksize = 0;
        this.data = null;
    }
    decode_raw(bits) {
        let n = 1;
        let m = (1 << bits);
        while (n < m) {
            let b = this.zp.decode();
            n = (n << 1) | b;
        }
        return n - m;
    }
    decode_binary(ctxoff, bits) {
        let n = 1;
        let m = (1 << bits);
        ctxoff--;
        while (n < m) {
            let b = this.zp.decode(this.ctx, ctxoff + n);
            n = (n << 1) | b;
        }
        return n - m;
    }
    _decode() {
        this.size = this.decode_raw(24);
        if (!this.size) {
            return 0;
        }
        if (this.size > this.maxblock * 1024) {
            throw new Error("Too big block. Error");
        }
        if (this.blocksize < this.size) {
            this.blocksize = this.size;
            this.data = new Uint8Array(this.blocksize);
        } else if (this.data == null) {
            this.data = new Uint8Array(this.blocksize);
        }
        let fshift = 0;
        if (this.zp.decode()) {
            fshift++;
            if (this.zp.decode()) {
                fshift++;
            }
        }
        let freq = new Array(this.FREQMAX);
        for (let i = 0; i < this.FREQMAX; freq[i++] = 0);
        let fadd = 4;
        let mtfno = 3;
        let markerpos = -1;
        for (let i = 0; i < this.size; i++) {
            let ctxid = this.CTXIDS - 1;
            if (ctxid > mtfno) {
                ctxid = mtfno;
            }
            var ctxoff = 0;
            switch (0)
            {
                default:
                    if (this.zp.decode(this.ctx, ctxoff + ctxid) != 0) {
                        mtfno = 0;
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }
                    ctxoff += this.CTXIDS;
                    if (this.zp.decode(this.ctx, ctxoff + ctxid) != 0) {
                        mtfno = 1;
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }
                    ctxoff += this.CTXIDS;
                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 2 + this.decode_binary(ctxoff + 1, 1);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }
                    ctxoff += (1 + 1);
                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 4 + this.decode_binary(ctxoff + 1, 2);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }
                    ctxoff += (1 + 3);
                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 8 + this.decode_binary(ctxoff + 1, 3);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }
                    ctxoff += (1 + 7);
                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 16 + this.decode_binary(ctxoff + 1, 4);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }
                    ctxoff += (1 + 15);
                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 32 + this.decode_binary(ctxoff + 1, 5);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }
                    ctxoff += (1 + 31);
                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 64 + this.decode_binary(ctxoff + 1, 6);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }
                    ctxoff += (1 + 63);
                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 128 + this.decode_binary(ctxoff + 1, 7);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }
                    mtfno = 256;
                    this.data[i] = 0;
                    markerpos = i;
                    continue;
            }
            let k;
            fadd = fadd + (fadd >> fshift);
            if (fadd > 0x10000000) {
                fadd >>= 24;
                freq[0] >>= 24;
                freq[1] >>= 24;
                freq[2] >>= 24;
                freq[3] >>= 24;
                for (k = 4; k < this.FREQMAX; k++) {
                    freq[k] >>= 24;
                }
            }
            let fc = fadd;
            if (mtfno < this.FREQMAX) {
                fc += freq[mtfno];
            }
            for (k = mtfno; k >= this.FREQMAX; k--) {
                this.mtf[k] = this.mtf[k - 1];
            }
            for (; (k > 0) && ((0xffffffff & fc) >= (0xffffffff & freq[k - 1])); k--) {
                this.mtf[k] = this.mtf[k - 1];
                freq[k] = freq[k - 1];
            }
            this.mtf[k] = this.data[i];
            freq[k] = fc;
        }
        if ((markerpos < 1) || (markerpos >= this.size)) {
            throw new Error("ByteStream.corrupt");
        }
        let pos = new Uint32Array(this.size);
        for (let j = 0; j < this.size; pos[j++] = 0);
        let count = new Array(256);
        for (let i = 0; i < 256; count[i++] = 0);
        for (let i = 0; i < markerpos; i++) {
            let c = this.data[i];
            pos[i] = (c << 24) | (count[0xff & c] & 0xffffff);
            count[0xff & c]++;
        }
        for (let i = markerpos + 1; i < this.size; i++) {
            let c = this.data[i];
            pos[i] = (c << 24) | (count[0xff & c] & 0xffffff);
            count[0xff & c]++;
        }
        let last = 1;
        for (let i = 0; i < 256; i++) {
            let tmp = count[i];
            count[i] = last;
            last += tmp;
        }
        let j = 0;
        last = this.size - 1;
        while (last > 0) {
            let n = pos[j];
            let c = pos[j] >> 24;
            this.data[--last] = 0xff & c;
            j = count[0xff & c] + (n & 0xffffff);
        }
        if (j != markerpos) {
            throw new Error("ByteStream.corrupt");
        }
        return this.size;
    }
    getByteStream() {
        var bsw, size;
        while (size = this._decode()) {
            if (!bsw) {
                bsw = new ByteStreamWriter(size - 1);
                var arr = new Uint8Array(this.data.buffer, 0, this.data.length - 1);
                bsw.writeArray(arr);
            }
        }
        this.data = null;
        return new ByteStream(bsw.getBuffer());
    }
    static decodeByteStream(bs) {
        return new BZZDecoder(new ZPDecoder(bs)).getByteStream();
    }
}

class DjVuError {
    constructor(message) {
        this.message = message;
    }
}
class IFFChunk {
    constructor(bs) {
        this.id = bs.readStr4();
        this.length = bs.getInt32();
        this.bs = bs;
    }
    toString() {
        return this.id + " " + this.length + '\n';
    }
}
class ColorChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.header = new СolorChunkDataHeader(bs);
    }
    toString() {
        return this.id + " " + this.length + this.header.toString();
    }
}
class INFOChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.width = bs.getInt16();
        this.height = bs.getInt16();
        this.minver = bs.getInt8();
        this.majver = bs.getInt8();
        this.dpi = bs.getUint8();
        this.dpi |= bs.getUint8() << 8;
        this.gamma = bs.getInt8();
        this.flags = bs.getInt8();
    }
    toString() {
        var str = super.toString();
        str += "{" + 'width:' + this.width + ', '
            + 'height:' + this.height + ', '
            + 'minver:' + this.minver + ', '
            + 'majver:' + this.majver + ', '
            + 'dpi:' + this.dpi + ','
            + 'gamma:' + this.gamma + ', '
            + 'flags:' + this.flags + '}\n';
        return str;
    }
}
class СolorChunkDataHeader {
    constructor(bs) {
        this.serial = bs.getUint8();
        this.slices = bs.getUint8();
        if (!this.serial) {
            this.majver = bs.getUint8();
            this.grayscale = this.majver >> 7;
            this.minver = bs.getUint8();
            this.width = bs.getUint16();
            this.height = bs.getUint16();
            var byte = bs.getUint8();
            this.delayInit = byte & 127;
            if (!byte & 128) {
                console.warn('Old image reconstruction should be applied!');
            }
        }
    }
    toString() {
        return '\n' + JSON.stringify(this) + "\n";
    }
}
class INCLChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.ref = this.bs.readStrUTF();
    }
    toString() {
        var str = super.toString();
        str += "{Reference: " + this.ref + '}\n';
        return str;
    }
}
class CIDaChunk extends INCLChunk { }
class NAVMChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
    }
    toString() {
        return super.toString() + '\n';
    }
}
class DIRMChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.dflags = bs.byte();
        this.nfiles = bs.getInt16();
        this.offsets = new Array(this.nfiles);
        this.sizes = new Array(this.nfiles);
        this.flags = new Array(this.nfiles);
        this.ids = new Array(this.nfiles);
        this.names = new Array(this.nfiles);
        this.titles = new Array(this.nfiles);
        for (var i = 0; i < this.nfiles; i++) {
            this.offsets[i] = bs.getInt32();
        }
        var bsbs = bs.fork(this.length - 3 - 4 * this.nfiles);
        var bsz = BZZDecoder.decodeByteStream(bsbs);
        for (var i = 0; i < this.nfiles; i++) {
            this.sizes[i] = bsz.getUint24();
        }
        for (var i = 0; i < this.nfiles; i++) {
            this.flags[i] = bsz.byte();
        }
        for (var i = 0; i < this.nfiles && !bsz.isEmpty(); i++) {
            this.ids[i] = bsz.readStrNT();
            this.names[i] = this.flags[i] & 128 ? bsz.readStrNT() : this.ids[i];
            this.titles[i] = this.flags[i] & 64 ? bsz.readStrNT() : this.ids[i];
        }
    }
    toString() {
        var str = super.toString();
        str += "{Files: " + this.nfiles + '}\n';
        return str + '\n';
    }
}

class DjVuText extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.isParsed = false;
        this.dbs = this.id === 'TXTz' ? null : this.bs;
    }
    decode() {
        if (this.isParsed) {
            return;
        }
        if (!this.dbs) {
            this.dbs = BZZDecoder.decodeByteStream(this.bs);
        }
        this.textLength = this.dbs.getInt24();
        this.text = this.dbs.readStrUTF(this.textLength);
        this.version = this.dbs.getUint8();
        if (this.version !== 1) {
            console.warn("The version in " + this.id + " isn't equal to 1!");
        }
        this.isParsed = true;
    }
    getText() {
        this.decode();
        return this.text;
    }
    toString() {
        this.decode();
        var st = "Text length = " + this.textLength + "\n";
        return super.toString() + st;
    }
}

class DjVuPalette extends IFFChunk {
    constructor(bs) {
        var time = performance.now();
        super(bs);
        this.pixel = { r: 0, g: 0, b: 0 };
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
        DjVu.IS_DEBUG && console.log('DjvuPalette time ', performance.now() - time);
    }
    getDataSize() {
        return this.dataSize;
    }
    getPixelByBlitIndex(index) {
        var colorIndex = this.colorIndices[index] * 3;
        this.pixel.r = this.colorArray[colorIndex + 2];
        this.pixel.g = this.colorArray[colorIndex + 1];
        this.pixel.b = this.colorArray[colorIndex];
        return this.pixel;
    }
    toString() {
        var str = super.toString();
        str += "Pallete size: " + this.palleteSize + "\n";
        str += "Data size: " + this.dataSize + "\n";
        return str;
    }
}

class Bitmap$1 {
    constructor(width, height) {
        var length = Math.ceil(width * height / 8);
        this.height = height;
        this.width = width;
        this.innerArray = new Uint8Array(length);
    }
    get(i, j) {
        if (!this.hasRow(i) || j < 0 || j >= this.width) {
            return 0;
        }
        var tmp = i * this.width + j;
        var index = tmp >> 3;
        var bitIndex = tmp & 7;
        var mask = 128 >> bitIndex;
        var answ = (this.innerArray[index] & mask) ? 1 : 0;
        return answ;
    }
    set(i, j) {
        var tmp = i * this.width + j;
        var index = tmp >> 3;
        var bitIndex = tmp & 7;
        var mask = 128 >> bitIndex;
        this.innerArray[index] |= mask;
        return;
    }
    hasRow(r) {
        return r >= 0 && r < this.height;
    }
    removeEmptyEdges() {
        var bottomShift = 0;
        var topShift = 0;
        var leftShift = 0;
        var rightShift = 0;
        main_cycle: for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            bottomShift++;
        }
        main_cycle: for (var i = this.height - 1; i >= 0; i--) {
            for (var j = 0; j < this.width; j++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            topShift++;
        }
        main_cycle: for (var j = 0; j < this.width; j++) {
            for (var i = 0; i < this.height; i++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            leftShift++;
        }
        main_cycle: for (var j = this.width - 1; j >= 0; j--) {
            for (var i = 0; i < this.height; i++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            rightShift++;
        }
        if (topShift || bottomShift || leftShift || rightShift) {
            var newWidth = this.width - leftShift - rightShift;
            var newHeight = this.height - topShift - bottomShift;
            var newBitMap = new Bitmap$1(newWidth, newHeight);
            for (var i = bottomShift, p = 0; p < newHeight; p++ , i++) {
                for (var j = leftShift, q = 0; q < newWidth; q++ , j++) {
                    if (this.get(i, j)) {
                        newBitMap.set(p, q);
                    }
                }
            }
            return newBitMap;
        }
        return this;
    }
}
class NumContext {
    constructor() {
        this.ctx = [0];
        this._left = null;
        this._right = null;
    }
    get left() {
        if (!this._left) {
            this._left = new NumContext();
        }
        return this._left;
    }
    get right() {
        if (!this._right) {
            this._right = new NumContext();
        }
        return this._right;
    }
}
class JB2Codec extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.zp = new ZPDecoder(this.bs);
        this.directBitmapCtx = new Uint8Array(1024);
        this.refinementBitmapCtx = new Uint8Array(2048);
        this.offsetTypeCtx = [0];
        this.resetNumContexts();
    }
    resetNumContexts() {
        this.recordTypeCtx = new NumContext();
        this.imageSizeCtx = new NumContext();
        this.symbolWidthCtx = new NumContext();
        this.symbolHeightCtx = new NumContext();
        this.inheritDictSizeCtx = new NumContext();
        this.hoffCtx = new NumContext();
        this.voffCtx = new NumContext();
        this.shoffCtx = new NumContext();
        this.svoffCtx = new NumContext();
        this.symbolIndexCtx = new NumContext();
        this.symbolHeightDiffCtx = new NumContext();
        this.symbolWidthDiffCtx = new NumContext();
        this.commentLengthCtx = new NumContext();
        this.commentOctetCtx = new NumContext();
        this.horizontalAbsLocationCtx = new NumContext();
        this.verticalAbsLocationCtx = new NumContext();
    }
    decodeNum(low, high, numctx) {
        let negative = false;
        let cutoff;
        cutoff = 0;
        for (let phase = 1, range = 0xffffffff; range != 1;) {
            let decision = (low >= cutoff) || ((high >= cutoff) && this.zp.decode(numctx.ctx, 0));
            numctx = decision ? numctx.right : numctx.left;
            switch (phase) {
                case 1:
                    negative = !decision;
                    if (negative) {
                        let temp = - low - 1;
                        low = - high - 1;
                        high = temp;
                    }
                    phase = 2; cutoff = 1;
                    break;
                case 2:
                    if (!decision) {
                        phase = 3;
                        range = (cutoff + 1) / 2;
                        if (range == 1)
                            cutoff = 0;
                        else
                            cutoff -= range / 2;
                    }
                    else {
                        cutoff += cutoff + 1;
                    }
                    break;
                case 3:
                    range /= 2;
                    if (range != 1) {
                        if (!decision)
                            cutoff -= range / 2;
                        else
                            cutoff += range / 2;
                    }
                    else if (!decision) {
                        cutoff--;
                    }
                    break;
            }
        }
        return (negative) ? (- cutoff - 1) : cutoff;
    }
    toString() {
        var str = super.toString();
        return str;
    }
    decodeBitmap(width, height) {
        var bitmap = new Bitmap$1(width, height);
        for (let i = height - 1; i >= 0; i--) {
            for (let j = 0; j < width; j++) {
                var ind = this.getCtxIndex(bitmap, i, j);
                this.zp.decode(this.directBitmapCtx, ind) ? bitmap.set(i, j) : 0;
            }
        }
        return bitmap;
    }
    getCtxIndex(bm, i, j) {
        var index = 0;
        let r = i + 2;
        if (bm.hasRow(r)) {
            index = ((bm.get(r, j - 1) || 0) << 9) | (bm.get(r, j) << 8) | ((bm.get(r, j + 1) || 0) << 7);
        }
        r--;
        if (bm.hasRow(r)) {
            index |= ((bm.get(r, j - 2) || 0) << 6) | ((bm.get(r, j - 1) || 0) << 5) |
                (bm.get(r, j) << 4) | ((bm.get(r, j + 1) || 0) << 3) | ((bm.get(r, j + 2) || 0) << 2);
        }
        index |= ((bm.get(i, j - 2) || 0) << 1) | (bm.get(i, j - 1) || 0);
        return index;
    }
    decodeBitmapRef(width, height, mbm) {
        let cbm = new Bitmap$1(width, height);
        var alignInfo = this.alignBitmaps(cbm, mbm);
        for (let i = height - 1; i >= 0; i--) {
            for (let j = 0; j < width; j++) {
                this.zp.decode(this.refinementBitmapCtx,
                    this.getCtxIndexRef(cbm, mbm, alignInfo, i, j)) ? cbm.set(i, j) : 0;
            }
        }
        return cbm;
    }
    getCtxIndexRef(cbm, mbm, alignInfo, i, j) {
        var index = 0;
        let r = i + 1;
        if (cbm.hasRow(r)) {
            index = ((cbm.get(r, j - 1) || 0) << 10) | (cbm.get(r, j) << 9) | ((cbm.get(r, j + 1) || 0) << 8);
        }
        index |= (cbm.get(i, j - 1) || 0) << 7;
        r = i + alignInfo.rowshift + 1;
        let c = j + alignInfo.colshift;
        index |= mbm.hasRow(r) ? mbm.get(r, c) << 6 : 0;
        r--;
        if (mbm.hasRow(r)) {
            index |= ((mbm.get(r, c - 1) || 0) << 5) | (mbm.get(r, c) << 4) | ((mbm.get(r, c + 1) || 0) << 3);
        }
        r--;
        if (mbm.hasRow(r)) {
            index |= ((mbm.get(r, c - 1) || 0) << 2) | (mbm.get(r, c) << 1) | (mbm.get(r, c + 1) || 0);
        }
        return index;
    }
    alignBitmaps(cbm, mbm) {
        let cwidth = cbm.width - 1;
        let cheight = cbm.height - 1;
        let crow, ccol, mrow, mcol;
        crow = cheight >> 1;
        ccol = cwidth >> 1;
        mrow = (mbm.height - 1) >> 1;
        mcol = (mbm.width - 1) >> 1;
        return {
            'rowshift': mrow - crow,
            'colshift': mcol - ccol
        };
    }
    decodeComment() {
        var length = this.decodeNum(0, 262142, this.commentLengthCtx);
        var comment = new Uint8Array(length);
        for (let i = 0; i < length; comment[i++] = this.decodeNum(0, 255, this.commentOctetCtx)) { }
        return comment;
    }
    drawBitmap(bm) {
        var image = document.createElement('canvas')
            .getContext('2d')
            .createImageData(bm.width, bm.height);
        for (let i = 0; i < bm.height; i++) {
            for (let j = 0; j < bm.width; j++) {
                let v = bm.get(i, j) ? 0 : 255;
                let index = ((bm.height - i - 1) * bm.width + j) * 4;
                image.data[index] = v;
                image.data[index + 1] = v;
                image.data[index + 2] = v;
                image.data[index + 3] = 255;
            }
        }
        Globals.drawImage(image);
    }
}

class JB2Dict extends JB2Codec {
    constructor(bs) {
        super(bs);
        this.dict = [];
    }
    decode(djbz) {
        var type = this.decodeNum(0, 11, this.recordTypeCtx);
        if (type == 9) {
            var size = this.decodeNum(0, 262142, this.inheritDictSizeCtx);
            djbz.decode();
            this.dict = djbz.dict.slice(0, size);
            type = this.decodeNum(0, 11, this.recordTypeCtx);
        }
        this.decodeNum(0, 262142, this.imageSizeCtx);
        this.decodeNum(0, 262142, this.imageSizeCtx);
        var flag = this.zp.decode([0], 0);
        if (flag) {
            throw new Error("Bad flag!!!");
        }
        type = this.decodeNum(0, 11, this.recordTypeCtx);
        var width, widthdiff, heightdiff, symbolIndex;
        var height;
        var bm;
        while (type !== 11) {
            switch (type) {
                case 2:
                    width = this.decodeNum(0, 262142, this.symbolWidthCtx);
                    height = this.decodeNum(0, 262142, this.symbolHeightCtx);
                    bm = this.decodeBitmap(width, height);
                    this.dict.push(bm);
                    break;
                case 5:
                    symbolIndex = this.decodeNum(0, this.dict.length - 1, this.symbolIndexCtx);
                    widthdiff = this.decodeNum(-262143, 262142, this.symbolWidthDiffCtx);
                    heightdiff = this.decodeNum(-262143, 262142, this.symbolHeightDiffCtx);
                    var mbm = this.dict[symbolIndex];
                    var cbm = this.decodeBitmapRef(mbm.width + widthdiff, heightdiff + mbm.height, mbm);
                    this.dict.push(cbm.removeEmptyEdges());
                    break;
                case 9:
                    console.log("RESET DICT");
                    this.resetNumContexts();
                    break;
                case 10:
                                      this.decodeComment();
                    break;
                default:
                    throw new Error("Unsupported type in JB2Dict: " + type);
            }
            type = this.decodeNum(0, 11, this.recordTypeCtx);
            if (type > 11) {
                console.error("TYPE ERROR " + type);
                break;
            }
        }
    }
}

class Baseline {
    constructor() {
        this.arr = new Array(3);
    }
    add(val) {
        this.arr.shift();
        this.arr.push(val);
    }
    getVal() {
        if (!this.arr[0]) {
            return this.arr[1] ? this.arr[1] : this.arr[2];
        }
        if (this.arr[0] >= this.arr[1] && this.arr[0] <= this.arr[2]
            || this.arr[0] <= this.arr[1] && this.arr[0] >= this.arr[2]) {
            return this.arr[0];
        }
        else if (this.arr[1] >= this.arr[0] && this.arr[1] <= this.arr[2]
            || this.arr[1] <= this.arr[0] && this.arr[1] >= this.arr[2]) {
            return this.arr[1];
        }
        else {
            return this.arr[2];
        }
    }
    reinit() {
        this.arr[0] = this.arr[1] = this.arr[2] = 0;
    }
}
class JB2Image extends JB2Codec {
    constructor(bs) {
        super(bs);
        this.dict = [];
        this.blitList = [];
        this.init();
    }
    addBlit(bitmap, x, y) {
        this.blitList.push({ bitmap, x, y });
    }
    init() {
        let type = this.decodeNum(0, 11, this.recordTypeCtx);
        if (type == 9) {
            this.dict = this.decodeNum(0, 262142, this.inheritDictSizeCtx);
            type = this.decodeNum(0, 11, this.recordTypeCtx);
        }
        this.width = this.decodeNum(0, 262142, this.imageSizeCtx) || 200;
        this.height = this.decodeNum(0, 262142, this.imageSizeCtx) || 200;
        this.bitmap = false;
        this.lastLeft = 0;
        this.lastBottom = this.height - 1;
        this.firstLeft = -1;
        this.firstBottom = this.height - 1;
        let flag = this.zp.decode([0], 0);
        if (flag) {
            throw new Error("Bad flag!!!");
        }
        this.baseline = new Baseline();
    }
    toString() {
        let str = super.toString();
        str += "{width: " + this.width + ", height: " + this.height + '}\n';
        return str;
    }
    decode(djbz) {
        if (+this.dict) {
            djbz.decode();
            this.dict = djbz.dict.slice(0, this.dict);
        }
        var type = this.decodeNum(0, 11, this.recordTypeCtx);
        let width, hoff, voff, flag;
        let height, index;
        let bm;
        while (type !== 11                                   ) {
            switch (type) {
                case 1:
                    width = this.decodeNum(0, 262142, this.symbolWidthCtx);
                    height = this.decodeNum(0, 262142, this.symbolHeightCtx);
                    bm = this.decodeBitmap(width, height);
                    var coords = this.decodeSymbolCoords(bm.width, bm.height);
                    this.addBlit(bm, coords.x, coords.y);
                    this.dict.push(bm);
                    break;
                case 2:
                    width = this.decodeNum(0, 262142, this.symbolWidthCtx);
                    height = this.decodeNum(0, 262142, this.symbolHeightCtx);
                    bm = this.decodeBitmap(width, height);
                    this.dict.push(bm);
                    break;
                case 3:
                    width = this.decodeNum(0, 262142, this.symbolWidthCtx);
                    height = this.decodeNum(0, 262142, this.symbolHeightCtx);
                    bm = this.decodeBitmap(width, height);
                    var coords = this.decodeSymbolCoords(bm.width, bm.height);
                    this.addBlit(bm, coords.x, coords.y);
                    break;
                case 4:
                    index = this.decodeNum(0, this.dict.length - 1, this.symbolIndexCtx);
                    var widthdiff = this.decodeNum(-262143, 262142, this.symbolWidthDiffCtx);
                    var heightdiff = this.decodeNum(-262143, 262142, this.symbolHeightDiffCtx);
                    var mbm = this.dict[index];
                    var cbm = this.decodeBitmapRef(mbm.width + widthdiff, heightdiff + mbm.height, mbm);
                    var coords = this.decodeSymbolCoords(cbm.width, cbm.height);
                    this.addBlit(cbm, coords.x, coords.y);
                    this.dict.push(cbm.removeEmptyEdges());
                    break;
                case 5:
                    index = this.decodeNum(0, this.dict.length - 1, this.symbolIndexCtx);
                    widthdiff = this.decodeNum(-262143, 262142, this.symbolWidthDiffCtx);
                    heightdiff = this.decodeNum(-262143, 262142, this.symbolHeightDiffCtx);
                    var mbm = this.dict[index];
                    var cbm = this.decodeBitmapRef(mbm.width + widthdiff, heightdiff + mbm.height, mbm);
                    this.dict.push(cbm.removeEmptyEdges());
                    break;
                case 6:
                    index = this.decodeNum(0, this.dict.length - 1, this.symbolIndexCtx);
                    var widthdiff = this.decodeNum(-262143, 262142, this.symbolWidthDiffCtx);
                    var heightdiff = this.decodeNum(-262143, 262142, this.symbolHeightDiffCtx);
                    var mbm = this.dict[index];
                    var cbm = this.decodeBitmapRef(mbm.width + widthdiff, heightdiff + mbm.height, mbm);
                    var coords = this.decodeSymbolCoords(cbm.width, cbm.height);
                    this.addBlit(cbm, coords.x, coords.y);
                    break;
                case 7:
                    index = this.decodeNum(0, this.dict.length - 1, this.symbolIndexCtx);
                    bm = this.dict[index];
                    var coords = this.decodeSymbolCoords(bm.width, bm.height);
                    this.addBlit(bm, coords.x, coords.y);
                    break;
                case 8:
                    width = this.decodeNum(0, 262142, this.symbolWidthCtx);
                    height = this.decodeNum(0, 262142, this.symbolHeightCtx);
                    bm = this.decodeBitmap(width, height);
                    var coords = this.decodeAbsoluteLocationCoords(bm.width, bm.height);
                    this.addBlit(bm, coords.x, coords.y);
                    break;
                case 9:
                    console.log("RESET NUM CONTEXTS");
                    this.resetNumContexts();
                    break;
                case 10:
                    this.decodeComment();
                    break;
                default:
                    throw new Error("Unsupported type in JB2Image: " + type);
            }
            type = this.decodeNum(0, 11, this.recordTypeCtx);
            if (type > 11) {
                console.error("TYPE ERROR " + type);
                break;
            }
        }
    }
    decodeAbsoluteLocationCoords(width, height) {
        var left = this.decodeNum(1, this.width, this.horizontalAbsLocationCtx);
        var top = this.decodeNum(1, this.height, this.verticalAbsLocationCtx);
        return {
            x: left,
            y: top - height
        }
    }
    decodeSymbolCoords(width, height) {
        var flag = this.zp.decode(this.offsetTypeCtx, 0);
        var horizontalOffsetCtx = flag ? this.hoffCtx : this.shoffCtx;
        var verticalOffsetCtx = flag ? this.voffCtx : this.svoffCtx;
        var horizontalOffset = this.decodeNum(-262143, 262142, horizontalOffsetCtx);
        var verticalOffset = this.decodeNum(-262143, 262142, verticalOffsetCtx);
        var x, y;
        if (flag) {
            x = this.firstLeft + horizontalOffset;
            y = this.firstBottom + verticalOffset - height + 1;
            this.firstLeft = x;
            this.firstBottom = y;
            this.baseline.reinit();
        }
        else {
            x = this.lastRight + horizontalOffset;
            y = this.baseline.getVal() + verticalOffset;
        }
        this.baseline.add(y);
        this.lastRight = x + width - 1;
        return {
            'x': x,
            'y': y
        };
    }
    copyToBitmap(bm, x, y) {
        if (!this.bitmap) {
            this.bitmap = new Bitmap(this.width, this.height);
        }
        for (var i = y, k = 0; k < bm.height; k++ , i++) {
            for (var j = x, t = 0; t < bm.width; t++ , j++) {
                if (bm.get(k, t)) {
                    this.bitmap.set(i, j);
                }
            }
        }
    }
    getBitmap() {
        if (!this.bitmap) {
            this.blitList.forEach(blit => this.copyToBitmap(blit.bitmap, blit.x, blit.y));
        }
        return this.bitmap;
    }
    getMaskImage() {
        var imageData = new ImageData(this.width, this.height);
        var pixelArray = imageData.data;
        var time = performance.now();
        pixelArray.fill(255);
        for (var blitIndex = 0; blitIndex < this.blitList.length; blitIndex++) {
            var blit = this.blitList[blitIndex];
            var bm = blit.bitmap;
            for (var i = blit.y, k = 0; k < bm.height; k++ , i++) {
                for (var j = blit.x, t = 0; t < bm.width; t++ , j++) {
                    if (bm.get(k, t)) {
                        var pixelIndex = ((this.height - i - 1) * this.width + j) * 4;
                        pixelArray[pixelIndex] = 0;
                    }
                }
            }
        }
        DjVu.IS_DEBUG && console.log("JB2Image mask image creating time = ", performance.now() - time);
        return imageData;
    }
    getImage(palette = null, isMarkMaskPixels = false) {
        if (palette && palette.getDataSize() !== this.blitList.length) {
            palette = null;
        }
        var pixelArray = new Uint8ClampedArray(this.width * this.height * 4);
        var time = performance.now();
        pixelArray.fill(255);
        var blackPixel = { r: 0, g: 0, b: 0 };
        var alpha = isMarkMaskPixels ? 0 : 255;
        for (var blitIndex = 0; blitIndex < this.blitList.length; blitIndex++) {
            var blit = this.blitList[blitIndex];
            var pixel = palette ? palette.getPixelByBlitIndex(blitIndex) : blackPixel;
            var bm = blit.bitmap;
            for (var i = blit.y, k = 0; k < bm.height; k++ , i++) {
                for (var j = blit.x, t = 0; t < bm.width; t++ , j++) {
                    if (bm.get(k, t)) {
                        var pixelIndex = ((this.height - i - 1) * this.width + j) * 4;
                        pixelArray[pixelIndex] = pixel.r;
                        pixelArray[pixelIndex + 1] = pixel.g;
                        pixelArray[pixelIndex + 2] = pixel.b;
                        pixelArray[pixelIndex + 3] = alpha;
                    }
                }
            }
        }
        DjVu.IS_DEBUG && console.log("JB2Image creating time = ", performance.now() - time);
        return new ImageData(pixelArray, this.width, this.height);
    }
    getImageFromBitmap() {
        this.getBitmap();
        var time = performance.now();
        var image = new ImageData(this.width, this.height);
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                var v = this.bitmap.get(i, j) ? 0 : 255;
                var index = ((this.height - i - 1) * this.width + j) * 4;
                image.data[index] = v;
                image.data[index + 1] = v;
                image.data[index + 2] = v;
                image.data[index + 3] = 255;
            }
        }
        DjVu.IS_DEBUG && console.log("JB2Image creating time = ", performance.now() - time);
        return image;
    }
}

class DjVuPage {
    constructor(bs, dirmID, getINCLChunkCallback) {
        this.id = "FORM:DJVU";
        this.length = bs.length - 8;
        this.dirmID = dirmID;
        this.bs = bs;
        this.bs.jump(12);
        this.djbz = null;
        this.bg44arr = new Array();
        this.fg44 = null;
        this.getINCLChunkCallback = getINCLChunkCallback;
        this.bgimage = null;
        this.fgimage = null;
        this.sjbz = null;
        this.fgbz = null;
        this.text = null;
        this.decoded = false;
        this.info = null;
        this.iffchunks = [];
        this.dependencies = null;
    }
    get dpi() {
        return this.info ? this.info.dpi : undefined;
    }
    getDependencies() {
        if (this.info || this.dependencies) {
            return this.dependencies;
        }
        this.dependencies = [];
        var bs = this.bs.fork();
        while (!bs.isEmpty()) {
            var chunk;
            var id = bs.readStr4();
            var length = bs.getInt32();
            bs.jump(-8);
            var chunkBs = bs.fork(length + 8);
            bs.jump(8 + length + (length & 1 ? 1 : 0));
            if (id === "INCL") {
                chunk = new INCLChunk(chunkBs);
                this.dependencies.push(chunk.ref);
            }
        }
        return this.dependencies;
    }
    init() {
        if (this.info) {
            return this;
        }
        this.dependencies = [];
        this.info = new INFOChunk(this.bs.fork(18));
        this.bs.jump(18);
        this.iffchunks.push(this.info);
        while (!this.bs.isEmpty()) {
            var chunk;
            var id = this.bs.readStr4();
            var length = this.bs.getInt32();
            this.bs.jump(-8);
            var chunkBs = this.bs.fork(length + 8);
            this.bs.jump(8 + length + (length & 1 ? 1 : 0));
            if (id == "FG44") {
                chunk = this.fg44 = new ColorChunk(chunkBs);
            } else if (id == "BG44") {
                this.bg44arr.push(chunk = new ColorChunk(chunkBs));
            } else if (id == 'Sjbz') {
                chunk = this.sjbz = new JB2Image(chunkBs);
            } else if (id === "INCL") {
                chunk = this.incl = new INCLChunk(chunkBs);
                var inclChunk = this.getINCLChunkCallback(this.incl.ref);
                inclChunk.id === "Djbz" ? this.djbz = inclChunk : this.iffchunks.push(inclChunk);
                this.dependencies.push(chunk.ref);
            } else if (id === "CIDa") {
                chunk = new CIDaChunk(chunkBs);
            } else if (id === 'Djbz') {
                chunk = this.djbz = new JB2Dict(chunkBs);
            } else if (id === 'FGbz') {
                chunk = this.fgbz = new DjVuPalette(chunkBs);
            } else if (id === 'TXTa' || id === 'TXTz') {
                chunk = this.text = new DjVuText(chunkBs);
            } else {
                chunk = new IFFChunk(chunkBs);
            }
            this.iffchunks.push(chunk);
        }
        return this;
    }
    getImageData() {
        this.decode();
        var time = performance.now();
        if (!this.sjbz) {
            if (this.bgimage) {
                return this.bgimage.getImage();
            }
            else if (this.fgimage) {
                return this.fgimage.getImage();
            } else {
                return null;
            }
        }
        if (!this.bgimage && !this.fgimage) {
            return this.sjbz.getImage(this.fgbz);
        }
        var fgscale, bgscale, fgpixelmap, bgpixelmap;
        if (this.bgimage) {
            bgscale = Math.round(this.info.width / this.bgimage.info.width);
            bgpixelmap = this.bgimage.pixelmap;
        } else {
            bgscale = 1;
            var whitePixel = { r: 255, g: 255, b: 255 };
            bgpixelmap = {
                getPixel() {
                    return whitePixel;
                }
            };
        }
        if (this.fgimage) {
            fgscale = Math.round(this.info.width / this.fgimage.info.width);
            fgpixelmap = this.fgimage.pixelmap;
        } else {
            fgscale = 1;
            var blackPixel = { r: 0, g: 0, b: 0 };
            fgpixelmap = {
                getPixel() {
                    return blackPixel;
                }
            };
        }
        var image;
        if (!this.fgbz) {
            image = this.createImageFromMaskImageAndPixelMaps(
                this.sjbz.getMaskImage(),
                fgpixelmap,
                bgpixelmap,
                fgscale,
                bgscale
            );
        } else {
            image = this.createImageFromMaskImageAndBackgroundPixelMap(
                this.sjbz.getImage(this.fgbz, true),
                bgpixelmap,
                bgscale
            );
        }
        DjVu.IS_DEBUG && console.log("DataImage creating time = ", performance.now() - time);
        return image;
    }
    createImageFromMaskImageAndPixelMaps(maskImage, fgpixelmap, bgpixelmap, fgscale, bgscale) {
        var image = maskImage;
        var pixelArray = image.data;
        for (var i = 0; i < this.info.height; i++) {
            for (var j = 0; j < this.info.width; j++) {
                var pixel;
                var index = ((this.info.height - i - 1) * this.info.width + j) << 2;
                if (pixelArray[index]) {
                    var is = Math.floor(i / bgscale);
                    var js = Math.floor(j / bgscale);
                    pixel = bgpixelmap.getPixel(is, js);
                } else {
                    var is = Math.floor(i / fgscale);
                    var js = Math.floor(j / fgscale);
                    pixel = fgpixelmap.getPixel(is, js);
                }
                pixelArray[index] = pixel.r;
                pixelArray[index + 1] = pixel.g;
                pixelArray[index + 2] = pixel.b;
            }
        }
        return image;
    }
    createImageFromMaskImageAndBackgroundPixelMap(maskImage, bgpixelmap, bgscale) {
        var pixelArray = maskImage.data;
        var pixel;
        for (var i = 0; i < this.info.height; i++) {
            for (var j = 0; j < this.info.width; j++) {
                var index = ((this.info.height - i - 1) * this.info.width + j) * 4;
                if (pixelArray[index + 3]) {
                    var is = Math.floor(i / bgscale);
                    var js = Math.floor(j / bgscale);
                    pixel = bgpixelmap.getPixel(is, js);
                    pixelArray[index] = pixel.r;
                    pixelArray[index + 1] = pixel.g;
                    pixelArray[index + 2] = pixel.b;
                } else {
                    pixelArray[index + 3] = 255;
                }
            }
        }
        return maskImage;
    }
    decode() {
        if (this.decoded) {
            return this;
        }
        this.init();
        var time = performance.now();
        this.sjbz ? this.sjbz.decode(this.djbz) : 0;
        DjVu.IS_DEBUG && console.log("Mask decoding time = ", performance.now() - time);
        time = performance.now();
        if (this.bg44arr.length) {
            this.bgimage = new IWImage();
            this.bg44arr.forEach((chunk) => {
                var zp = new ZPDecoder(chunk.bs);
                this.bgimage.decodeChunk(zp, chunk.header);
            }
            );
            this.bgimage.createPixelmap();
        }
        DjVu.IS_DEBUG && console.log("Background decoding time = ", performance.now() - time);
        time = performance.now();
        if (this.fg44) {
            this.fgimage = new IWImage();
            let zp = new ZPDecoder(this.fg44.bs);
            this.fgimage.decodeChunk(zp, this.fg44.header);
            this.fgimage.createPixelmap();
        }
        DjVu.IS_DEBUG && console.log("Foreground decoding time = ", performance.now() - time);
        this.decoded = true;
        return this;
    }
    getBackgroundImageData() {
        this.decode();
        if (this.bg44arr.length) {
            this.bg44arr.forEach((chunk) => {
                let zp = new ZPDecoder(chunk.bs);
                this.bgimage.decodeChunk(zp, chunk.header);
            }
            );
            return this.bgimage.getImage();
        } else {
            return null;
        }
    }
    getForegroundImageData() {
        this.decode();
        if (this.fg44) {
            this.fgimage = new IWImage();
            let zp = new ZPDecoder(this.fg44.bs);
            this.fgimage.decodeChunk(zp, this.fg44.header);
            return this.fgimage.getImage();
        } else {
            return null;
        }
    }
    getMaskImageData() {
        this.decode();
        return this.sjbz && this.sjbz.getImage(this.fgbz);
    }
    getText() {
        this.decode();
        if (this.text) {
            return this.text.getText();
        } else {
            return "";
        }
    }
    toString() {
        var str = '[DirmID: "' + this.dirmID + '"]\n';
        str += this.id + ' ' + this.length + "\n";
        this.init();
        for (var i = 0; i < this.iffchunks.length; i++) {
            str += this.iffchunks[i].toString();
        }
        return str + '\n';
    }
}

class DjViChunk {
    constructor(bs, dirmID) {
        this.bs = bs;
        this.id = bs.readStr4();
        this.dirmID = dirmID;
        this.length = bs.getInt32();
        this.id += bs.readStr4();
        this.innerChunk = null;
        this.init();
    }
    init() {
        while (!this.bs.isEmpty()) {
            let id = this.bs.readStr4();
            let length = this.bs.getInt32();
            this.bs.jump(-8);
            let chunkBs = this.bs.fork(length + 8);
            this.bs.jump(8 + length + (length & 1 ? 1 : 0));
            this.innerChunk = id === 'Djbz' ? new JB2Dict(chunkBs) : new IFFChunk(chunkBs);
            if (id != 'Djbz') {
                console.error("Unsupported chunk inside the DJVI chunk: ", id);
            }
        }
    }
    toString() {
        var str = '[DirmID: "' + this.dirmID + '"]\n';
        str += this.id + ' ' + this.length + "\n";
        str += this.innerChunk.toString();
        return str + '\n';
    }
}

class DjVuDocument {
    constructor(arraybuffer) {
        this.buffer = arraybuffer;
        this.bs = new ByteStream(arraybuffer);
        this.formatID = this.bs.readStr4();
        if (this.formatID !== 'AT&T') {
            throw new DjVuError("Incorrect file format");
        }
        this.id = this.bs.readStr4();
        this.length = this.bs.getInt32();
        this.id += this.bs.readStr4();
        if (this.id == 'FORMDJVM') {
            var id = this.bs.readStr4();
            var length = this.bs.getInt32();
            this.bs.jump(-8);
            this.dirm = new DIRMChunk(this.bs.fork(length + 8));
            this.bs.jump(8 + length + (length & 1 ? 1 : 0));
        }
        this.getINCLChunkCallback = id => this.djvi[id].innerChunk;
        this.pages = [];
        this.djvi = {};
        if (this.dirm) {
            var id = this.bs.readStr4();
            var length = this.bs.getInt32();
            this.bs.jump(-8);
            if (id == 'NAVM') {
                this.navm = new NAVMChunk(this.bs.fork(length + 8));
            }
            for (var i = 0; i < this.dirm.offsets.length; i++) {
                this.bs.setOffset(this.dirm.offsets[i]);
                var id = this.bs.readStr4();
                var length = this.bs.getInt32();
                id += this.bs.readStr4();
                this.bs.jump(-12);
                switch (id) {
                    case "FORMDJVU":
                        this.pages.push(new DjVuPage(
                            this.bs.fork(length + 8),
                            this.dirm.ids[i],
                            this.getINCLChunkCallback
                        ));
                        break;
                    case "FORMDJVI":
                        this.djvi[this.dirm.ids[i]] = new DjViChunk(this.bs.fork(length + 8), this.dirm.ids[i]);
                        break;
                    default:
                        console.error("Incorrectr chunk ID: ", id);
                }
            }
        }
        else {
            this.bs.jump(-12);
            this.pages.push(new DjVuPage(this.bs.fork(this.length + 4)));
        }
    }
    countFiles() {
        var count = 0;
        var bs = this.bs.clone();
        bs.jump(16);
        while (!bs.isEmpty()) {
            var chunk;
            var id = bs.readStr4();
            var length = bs.getInt32();
            bs.jump(-8);
            var chunkBs = bs.fork(length + 8);
            bs.jump(8 + length + (length & 1 ? 1 : 0));
            if (id === 'FORM') {
                count++;
            }
        }
        return count;
    }
    toString(html) {
        var str = this.formatID + '\n';
        if (this.dirm) {
            str += this.id + " " + this.length + '\n\n';
            str += this.dirm.toString();
        }
        if (this.navm) {
            str += this.navm.toString();
        }
        for (var prop in this.djvi) {
            str += this.djvi[prop];
        }
        this.pages.forEach(item => str += item.toString());
        return html ? str.replace(/\n/g, '<br>') : str;
    }
    createObjectURL() {
        var blob = new Blob([this.bs.buffer]);
        var url = URL.createObjectURL(blob);
        return url;
    }
    slice(from, to) {
        from = from || 0;
        to = to || this.pages.length;
        var djvuWriter = new DjVuWriter();
        djvuWriter.startDJVM();
        var dirm = {};
        dirm.dflags = this.dirm.dflags;
        var pageNumber = to - from;
        dirm.flags = [];
        dirm.names = [];
        dirm.titles = [];
        dirm.sizes = [];
        dirm.ids = [];
        var chuckBS = [];
        var pageCount = 0;
        var addedPageCount = 0;
        var dependencies = {};
        for (var i = 0; i < this.dirm.nfiles && addedPageCount < pageNumber; i++) {
            if (this.dirm.flags[i] & 1) {
                pageCount++;
                if (!(addedPageCount < pageNumber && pageCount > from)) {
                    continue;
                }
                else {
                    addedPageCount++;
                    var cbs = new ByteStream(this.buffer, this.dirm.offsets[i], this.dirm.sizes[i]);
                    var deps = new DjVuPage(cbs).getDependencies();
                    cbs.reset();
                    for (var j = 0; j < deps.length; j++) {
                        dependencies[deps[j]] = 1;
                    }
                }
            }
        }
        pageCount = 0;
        addedPageCount = 0;
        for (var i = 0; i < this.dirm.nfiles && addedPageCount < pageNumber; i++) {
            if (this.dirm.flags[i] & 1) {
                pageCount++;
                if (!(addedPageCount < pageNumber && pageCount > from)) {
                    continue;
                }
                else {
                    addedPageCount++;
                }
            }
            if ((this.dirm.ids[i] in dependencies) || (this.dirm.flags[i] & 1)) {
                dirm.flags.push(this.dirm.flags[i]);
                dirm.sizes.push(this.dirm.sizes[i]);
                dirm.ids.push(this.dirm.ids[i]);
                dirm.names.push(this.dirm.names[i]);
                dirm.titles.push(this.dirm.titles[i]);
                var cbs = new ByteStream(this.buffer, this.dirm.offsets[i], this.dirm.sizes[i]);
                chuckBS.push(cbs);
            }
            if (!(this.dirm.ids[i] in dependencies) && !(this.dirm.flags[i] & 1)) {
                console.warn("Excess dict ", this.dirm.ids[i]);
            }
        }
        djvuWriter.writeDirmChunk(dirm);
        if (this.navm) {
            djvuWriter.writeChunk(this.navm);
        }
        for (var i = 0; i < chuckBS.length; i++) {
            djvuWriter.writeFormChunkBS(chuckBS[i]);
        }
        var newbuffer = djvuWriter.getBuffer();
        DjVu.IS_DEBUG && console.log("New Buffer size = ", newbuffer.byteLength);
        var doc = new DjVuDocument(newbuffer);
        return doc;
    }
    static concat(doc1, doc2) {
        var dirm = {};
        var length = doc1.pages.length + doc2.pages.length;
        dirm.dflags = 129;
        dirm.flags = [];
        dirm.sizes = [];
        dirm.ids = [];
        var pages = [];
        var idset = new Set();
        if (!doc1.dirm) {
            dirm.flags.push(1);
            dirm.sizes.push(doc1.pages[0].bs.length);
            dirm.ids.push('single');
            idset.add('single');
            pages.push(doc1.pages[0]);
        }
        else {
            for (var i = 0; i < doc1.pages.length; i++) {
                dirm.flags.push(doc1.dirm.flags[i]);
                dirm.sizes.push(doc1.dirm.sizes[i]);
                dirm.ids.push(doc1.dirm.ids[i]);
                idset.add(doc1.dirm.ids[i]);
                pages.push(doc1.pages[i]);
            }
        }
        if (!doc2.dirm) {
            dirm.flags.push(1);
            dirm.sizes.push(doc2.pages[0].bs.length);
            var newid = 'single2';
            var tmp = 0;
            while (idset.has(newid)) {
                newid = 'single2' + tmp.toString();
                tmp++;
            }
            dirm.ids.push(newid);
            pages.push(doc2.pages[0]);
        }
        else {
            for (var i = 0; i < doc2.pages.length; i++) {
                dirm.flags.push(doc2.dirm.flags[i]);
                dirm.sizes.push(doc2.dirm.sizes[i]);
                var newid = doc2.dirm.ids[i];
                var tmp = 0;
                while (idset.has(newid)) {
                    newid = doc2.dirm.ids[i] + tmp.toString();
                    tmp++;
                }
                dirm.ids.push(newid);
                idset.add(newid);
                pages.push(doc2.pages[i]);
            }
        }
        var dw = new DjVuWriter();
        dw.startDJVM();
        dw.writeDirmChunk(dirm);
        for (var i = 0; i < length; i++) {
            dw.writeFormChunkBS(pages[i].bs);
        }
        return new DjVuDocument(dw.getBuffer());
    }
}

class DjVuWorker {
    constructor(path) {
        if (!path) {
            var script = document.querySelector('script[src*="djvu."]');
            this.path = script ? script.src : '/src/DjVuWorkerScript.js';
        } else {
            this.path = path;
        }
        this.worker = new Worker(this.path);
        this.worker.onmessage = (event) => {
            this.messageHandler(event);
        };
        this.worker.onerror = (event) => {
            this.errorHandler(event);
        };
        this.callbacks = new TempRepository();
        this.pagenumber;
    }
    reset() {
        this.worker.terminate();
        this.worker = new Worker(this.path);
        this.worker.onmessage = (event) => {
            this.messageHandler(event);
        };
        this.worker.onerror = (event) => {
            this.errorHandler(event);
        };
    }
    _postMessage(message) {
        this.worker.postMessage(message);
    }
    errorHandler(event) {
    }
    messageHandler(event) {
        var obj = event.data;
        var callback = this.callbacks.fetch(obj.id);
        switch (obj.command) {
            case 'Error':
                callback.reject(obj);
                break;
            case 'Process':
                this.onprocess ? this.onprocess(obj.percent) : 0;
                break;
            case 'getPageImageDataWithDPI':
                callback.resolve({
                    imageData: new ImageData(new Uint8ClampedArray(obj.buffer), obj.width, obj.height),
                    dpi: obj.dpi
                });
                break;
            case 'createDocument':
                this.pagenumber = obj.pagenumber;
                callback.resolve();
                break;
            case 'slice':
                callback.resolve(obj.buffer);
                break;
            case 'createDocumentFromPictures':
                callback.resolve(obj.buffer);
                break;
            case 'startMultyPageDocument':
                callback.resolve();
                break;
            case 'addPageToDocument':
                callback.resolve();
                break;
            case 'endMultyPageDocument':
                callback.resolve(obj.buffer);
                break;
            case 'getDocumentMetaData':
                callback.resolve(obj.str);
                break;
            case 'getPageNumber':
                callback.resolve(obj.pageNumber);
                break;
            case 'getPageText':
                callback.resolve(obj.text);
                break;
            default:
                console.error("Unexpected message from DjVuWorker: ", obj);
        }
    }
    getPageNumber() {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve, reject });
            this.worker.postMessage({
                command: 'getPageNumber',
                id: id
            });
        });
    }
    getDocumentMetaData(html) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({
                command: 'getDocumentMetaData',
                id: id,
                html: html
            });
        });
    }
    startMultyPageDocument(slicenumber, delayInit, grayscale) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({
                command: 'startMultyPageDocument',
                id: id,
                slicenumber: slicenumber,
                delayInit: delayInit,
                grayscale: grayscale
            });
        });
    }
    addPageToDocument(imageData) {
        var simpleImage = {
            buffer: imageData.data.buffer,
            width: imageData.width,
            height: imageData.height
        };
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({
                command: 'addPageToDocument',
                id: id,
                simpleImage: simpleImage
            }, [simpleImage.buffer]);
        });
    }
    endMultyPageDocument() {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({
                command: 'endMultyPageDocument',
                id: id
            });
        });
    }
    createDocument(buffer) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({ command: 'createDocument', id: id, buffer: buffer }, [buffer]);
        });
    }
    getPageImageDataWithDPI(pagenumber) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({ command: 'getPageImageDataWithDPI', id: id, pagenumber: pagenumber });
        });
    }
    getPageText(pagenumber) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({ command: 'getPageText', id: id, pagenumber: pagenumber });
        });
    }
    slice(_from, _to) {
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({ command: 'slice', id: id, from: _from, to: _to });
        });
    }
    createDocumentFromPictures(imageArray, slicenumber, delayInit, grayscale) {
        var simpleImages = new Array(imageArray.length);
        var buffers = new Array(imageArray.length);
        for (var i = 0; i < imageArray.length; i++) {
            simpleImages[i] = {
                buffer: imageArray[i].data.buffer,
                width: imageArray[i].width,
                height: imageArray[i].height
            };
            buffers[i] = imageArray[i].data.buffer;
        }
        return new Promise((resolve, reject) => {
            var id = this.callbacks.add({ resolve: resolve, reject: reject });
            this.worker.postMessage({
                command: 'createDocumentFromPictures',
                id: id,
                images: simpleImages,
                slicenumber: slicenumber,
                delayInit: delayInit,
                grayscale: grayscale
            }, buffers);
        });
    }
    static createArrayBufferURL(buffer) {
        var blob = new Blob([buffer]);
        var url = URL.createObjectURL(blob);
        return url;
    }
}
class TempRepository {
    constructor() {
        this.data = {};
        this.id = 0;
    }
    get lastID() {
        return this.id - 1;
    }
    add(obj) {
        var id = this.id++;
        this.data[id] = obj;
        return id;
    }
    fetch(id) {
        if (id === undefined) {
            return null;
        }
        id = +id;
        var obj = this.data[id];
        delete this.data[id];
        return obj;
    }
}

class IWEncoder extends IWCodecBaseClass {
    constructor(bytemap) {
        super();
        this.width = bytemap.width;
        this.height = bytemap.height;
        this.inverseWaveletTransform(bytemap);
        this.createBlocks(bytemap);
    }
    inverseWaveletTransform(bytemap) {
        for (var scale = 1; scale < 32; scale <<= 1) {
            this.filter_fh(scale, bytemap);
            this.filter_fv(scale, bytemap);
        }
        return bytemap;
    }
    filter_fv(s, bitmap) {
        var kmax = Math.floor((bitmap.height - 1) / s);
        for (var i = 0; i < bitmap.width; i += s) {
            for (var k = 1; k <= kmax; k += 2) {
                if ((k - 3 >= 0) && (k + 3 <= kmax)) {
                    bitmap[k * s][i] -= (9 * (bitmap[(k - 1) * s][i] + bitmap[(k + 1) * s][i]) - (bitmap[(k - 3) * s][i] + bitmap[(k + 3) * s][i]) + 8) >> 4;
                } else if (k + 1 <= kmax) {
                    bitmap[k * s][i] -= (bitmap[(k - 1) * s][i] + bitmap[(k + 1) * s][i] + 1) >> 1;
                } else {
                    bitmap[k * s][i] -= bitmap[(k - 1) * s][i];
                }
            }
            for (var k = 0; k <= kmax; k += 2) {
                var a, b, c, d;
                if (k - 1 < 0) {
                    a = 0;
                } else {
                    a = bitmap[(k - 1) * s][i];
                }
                if (k - 3 < 0) {
                    c = 0;
                } else {
                    c = bitmap[(k - 3) * s][i];
                }
                if (k + 1 > kmax) {
                    b = 0;
                } else {
                    b = bitmap[(k + 1) * s][i];
                }
                if (k + 3 > kmax) {
                    d = 0;
                } else {
                    d = bitmap[(k + 3) * s][i];
                }
                bitmap[k * s][i] += (9 * (a + b) - (c + d) + 16) >> 5;
            }
        }
    }
    filter_fh(s, bitmap) {
        var kmax = Math.floor((bitmap.width - 1) / s);
        for (var i = 0; i < bitmap.height; i += s) {
            for (var k = 1; k <= kmax; k += 2) {
                if ((k - 3 >= 0) && (k + 3 <= kmax)) {
                    bitmap[i][k * s] -= (9 * (bitmap[i][(k - 1) * s] + bitmap[i][(k + 1) * s]) - (bitmap[i][(k - 3) * s] + bitmap[i][(k + 3) * s]) + 8) >> 4;
                } else if (k + 1 <= kmax) {
                    bitmap[i][k * s] -= (bitmap[i][(k - 1) * s] + bitmap[i][(k + 1) * s] + 1) >> 1;
                } else {
                    bitmap[i][k * s] -= bitmap[i][(k - 1) * s];
                }
            }
            for (var k = 0; k <= kmax; k += 2) {
                var a, b, c, d;
                if (k - 1 < 0) {
                    a = 0;
                } else {
                    a = bitmap[i][(k - 1) * s];
                }
                if (k - 3 < 0) {
                    c = 0;
                } else {
                    c = bitmap[i][(k - 3) * s];
                }
                if (k + 1 > kmax) {
                    b = 0;
                } else {
                    b = bitmap[i][(k + 1) * s];
                }
                if (k + 3 > kmax) {
                    d = 0;
                } else {
                    d = bitmap[i][(k + 3) * s];
                }
                bitmap[i][k * s] += (9 * (a + b) - (c + d) + 16) >> 5;
            }
        }
    }
    createBlocks(bitmap) {
        var blockRows = Math.ceil(this.height / 32);
        var blockCols = Math.ceil(this.width / 32);
        var length = blockRows * blockCols;
        var buffer = new ArrayBuffer(length << 11);
        this.blocks = [];
        for (var r = 0; r < blockRows; r++) {
            for (var c = 0; c < blockCols; c++) {
                var block = new Block(buffer, (r * blockCols + c) << 11);
                for (var i = 0; i < 1024; i++) {
                    var val = 0;
                    if (bitmap[this.zigzagRow[i] + 32 * r]) {
                        val = bitmap[this.zigzagRow[i] + 32 * r][this.zigzagCol[i] + 32 * c];
                        val = val || 0;
                    }
                    block.setCoef(i, val);
                }
                this.blocks.push(block);
            }
        }
        buffer = new ArrayBuffer(length << 11);
        this.eblocks = new Array(length);
        for (var i = 0; i < length; i++) {
            this.eblocks[i] = new Block(buffer, i << 11);
        }
    }
    encodeSlice(zp) {
        this.zp = zp;
        if (!this.is_null_slice()) {
            for (var i = 0; i < this.blocks.length; i++) {
                var block = this.blocks[i];
                var eblock = this.eblocks[i];
                this.preliminaryFlagComputation(block, eblock);
                if (this.blockBandEncodingPass()) {
                    this.bucketEncodingPass(eblock);
                    this.newlyActiveCoefficientEncodingPass(block, eblock);
                }
                this.previouslyActiveCoefficientEncodingPass(block, eblock);
            }
        }
        return this.finish_code_slice();
    }
    previouslyActiveCoefficientEncodingPass(block, eblock) {
        var boff = 0;
        var step = this.quant_hi[this.curband];
        var indices = this.getBandBuckets(this.curband);
        for (var i = indices.from; i <= indices.to; i++ ,
            boff++) {
            for (var j = 0; j < 16; j++) {
                if (this.coeffstate[boff][j] & this.ACTIVE) {
                    if (!this.curband) {
                        step = this.quant_lo[j];
                    }
                    var des = 0;
                    var coef = Math.abs(block.buckets[i][j]);
                    var ecoef = eblock.buckets[i][j];
                    var pix = coef >= ecoef ? 1 : 0;
                    if (ecoef <= 3 * step) {
                        this.zp.encode(pix, this.inreaseCoefCtx, 0);
                    } else {
                        this.zp.IWencode(pix);
                    }
                    eblock.buckets[i][j] = ecoef - (pix ? 0 : step) + (step >> 1);
                }
            }
        }
    }
    newlyActiveCoefficientEncodingPass(block, eblock) {
        var boff = 0;
        var indices = this.getBandBuckets(this.curband);
        var step = this.quant_hi[this.curband];
        for (var i = indices.from; i <= indices.to; i++ ,
            boff++) {
            if (this.bucketstate[boff] & this.NEW) {
                var shift = 0;
                if (this.bucketstate[boff] & this.ACTIVE) {
                    shift = 8;
                }
                var bucket = block.buckets[i];
                var ebucket = eblock.buckets[i];
                var np = 0;
                for (var j = 0; j < 16; j++) {
                    if (this.coeffstate[boff][j] & this.UNK) {
                        np++;
                    }
                }
                for (var j = 0; j < 16; j++) {
                    if (this.coeffstate[boff][j] & this.UNK) {
                        var ip = Math.min(7, np);
                        this.zp.encode((this.coeffstate[boff][j] & this.NEW) ? 1 : 0, this.activateCoefCtx, shift + ip);
                        if (this.coeffstate[boff][j] & this.NEW) {
                            this.zp.IWencode((bucket[j] < 0) ? 1 : 0);
                            np = 0;
                            if (!this.curband) {
                                step = this.quant_lo[j];
                            }
                            ebucket[j] = (step + (step >> 1) - (step >> 3));
                            ebucket[j] = (step + (step >> 1));
                        }
                        if (np) {
                            np--;
                        }
                    }
                }
            }
        }
    }
    bucketEncodingPass(eblock) {
        var indices = this.getBandBuckets(this.curband);
        var boff = 0;
        for (var i = indices.from; i <= indices.to; i++ ,
            boff++) {
            if (!(this.bucketstate[boff] & this.UNK)) {
                continue;
            }
            var n = 0;
            if (this.curband) {
                var t = 4 * i;
                for (var j = t; j < t + 4; j++) {
                    if (eblock.getCoef(j)) {
                        n++;
                    }
                }
                if (n === 4) {
                    n--;
                }
            }
            if (this.bbstate & this.ACTIVE) {
                n |= 4;
            }
            this.zp.encode((this.bucketstate[boff] & this.NEW) ? 1 : 0, this.decodeCoefCtx, n + this.curband * 8);
        }
    }
    blockBandEncodingPass() {
        var indices = this.getBandBuckets(this.curband);
        var bcount = indices.to - indices.from + 1;
        if (bcount < 16 || (this.bbstate & this.ACTIVE)) {
            this.bbstate |= this.NEW;
        } else if (this.bbstate & this.UNK) {
            this.zp.encode(this.bbstate & this.NEW ? 1 : 0, this.decodeBucketCtx, 0);
        }
        return this.bbstate & this.NEW;
    }
    preliminaryFlagComputation(block, eblock) {
        this.bbstate = 0;
        var bstatetmp = 0;
        var indices = this.getBandBuckets(this.curband);
        var step = this.quant_hi[this.curband];
        if (this.curband) {
            var boff = 0;
            for (var j = indices.from; j <= indices.to; j++ , boff++) {
                bstatetmp = 0;
                var bucket = block.buckets[j];
                var ebucket = eblock.buckets[j];
                for (var k = 0; k < bucket.length; k++) {
                    if (ebucket[k]) {
                        this.coeffstate[boff][k] = this.ACTIVE;
                    } else if (bucket[k] >= step || bucket[k] <= -step) {
                        this.coeffstate[boff][k] = this.UNK | this.NEW;
                    } else {
                        this.coeffstate[boff][k] = this.UNK;
                    }
                    bstatetmp |= this.coeffstate[boff][k];
                }
                this.bucketstate[boff] = bstatetmp;
                this.bbstate |= bstatetmp;
            }
        } else {
            var bucket = block.buckets[0];
            var ebucket = eblock.buckets[0];
            for (var k = 0; k < bucket.length; k++) {
                step = this.quant_lo[k];
                if (this.coeffstate[0][k] !== this.ZERO) {
                    if (ebucket[k]) {
                        this.coeffstate[0][k] = this.ACTIVE;
                    } else if (bucket[k] >= step || bucket[k] <= -step) {
                        this.coeffstate[0][k] = this.UNK | this.NEW;
                    } else {
                        this.coeffstate[0][k] = this.UNK;
                    }
                }
                bstatetmp |= this.coeffstate[0][k];
            }
            this.bucketstate[0] = bstatetmp;
            this.bbstate |= bstatetmp;
        }
    }
}

class IWImageWriter {
    constructor(slicenumber, delayInit, grayscale) {
        this.slicenumber = slicenumber || 100;
        this.grayscale = grayscale || 0;
        this.delayInit = (delayInit & 127) || 0;
        this.onprocess = undefined;
    }
    get width() {
        return this.imageData.width;
    }
    get height() {
        return this.imageData.height;
    }
    startMultyPageDocument() {
        this.dw = new DjVuWriter();
        this.dw.startDJVM();
        this.pageBuffers = [];
        var dirm = {};
        this.dirm = dirm;
        dirm.offsets = [];
        dirm.dflags = 129;
        dirm.flags = [];
        dirm.ids = [];
        dirm.sizes = [];
    }
    addPageToDocument(imageData) {
        var tbsw = new ByteStreamWriter();
        this.writeImagePage(tbsw, imageData);
        var buffer = tbsw.getBuffer();
        this.pageBuffers.push(buffer);
        this.dirm.flags.push(1);
        this.dirm.ids.push('p' + this.dirm.ids.length);
        this.dirm.sizes.push(buffer.byteLength);
    }
    endMultyPageDocument() {
        this.dw.writeDirmChunk(this.dirm);
        var len = this.pageBuffers.length;
        for (var i = 0; i < len; i++) {
            this.dw.writeFormChunkBuffer(this.pageBuffers.shift());
        }
        var buffer = this.dw.getBuffer();
        delete this.dw;
        delete this.pageBuffers;
        delete this.dirm;
        return buffer;
    }
    createMultyPageDocument(imageArray) {
        var dw = new DjVuWriter();
        dw.startDJVM();
        var length = imageArray.length;
        var pageBuffers = new Array(imageArray.length);
        var dirm = {};
        this.dirm = dirm;
        dirm.offsets = [];
        dirm.dflags = 129;
        dirm.flags = new Array(imageArray.length);
        dirm.ids = new Array(imageArray.length);
        dirm.sizes = new Array(imageArray.length);
        var tbsw = new ByteStreamWriter();
        for (var i = 0; i < imageArray.length; i++) {
            this.writeImagePage(tbsw, imageArray[i]);
            var buffer = tbsw.getBuffer();
            pageBuffers[i] = buffer;
            tbsw.reset();
            dirm.flags[i] = 1;
            dirm.ids[i] = 'p' + i;
            dirm.sizes[i] = buffer.byteLength;
            this.onprocess ? this.onprocess((i + 1) / length) : 0;
        }
        dw.writeDirmChunk(dirm);
        for (var i = 0; i < imageArray.length; i++) {
            dw.writeFormChunkBuffer(pageBuffers[i]);
        }
        return new DjVuDocument(dw.getBuffer());
    }
    writeImagePage(bsw, imageData) {
        bsw.writeStr('FORM').saveOffsetMark('formSize').jump(4).writeStr('DJVU');
        bsw.writeStr('INFO')
            .writeInt32(10)
            .writeInt16(imageData.width)
            .writeInt16(imageData.height)
            .writeByte(24).writeByte(0)
            .writeByte(100 & 0xff)
            .writeByte(100 >> 8)
            .writeByte(22).writeByte(1);
        bsw.writeStr('BG44').saveOffsetMark('BG44Size').jump(4);
        bsw.writeByte(0)
            .writeByte(this.slicenumber)
            .writeByte((this.grayscale << 7) | 1)
            .writeByte(2)
            .writeUint16(imageData.width)
            .writeUint16(imageData.height)
            .writeByte(this.delayInit);
        var ycodec = new IWEncoder(this.RGBtoY(imageData));
        var crcodec, cbcodec;
        if (!this.grayscale) {
            cbcodec = new IWEncoder(this.RGBtoCb(imageData));
            crcodec = new IWEncoder(this.RGBtoCr(imageData));
        }
        var zp = new ZPEncoder(bsw);
        for (var i = 0; i < this.slicenumber; i++) {
            ycodec.encodeSlice(zp);
            if (cbcodec && crcodec && i >= this.delayInit) {
                cbcodec.encodeSlice(zp);
                crcodec.encodeSlice(zp);
            }
        }
        zp.eflush();
        bsw.rewriteSize('formSize');
        bsw.rewriteSize('BG44Size');
    }
    createOnePageDocument(imageData) {
        var bsw = new ByteStreamWriter(10 * 1024);
        bsw.writeStr('AT&T');
        this.writeImagePage(bsw, imageData);
        return new DjVuDocument(bsw.getBuffer());
    }
    RGBtoY(imageData) {
        var rmul = new Int32Array(256);
        var gmul = new Int32Array(256);
        var bmul = new Int32Array(256);
        var data = imageData.data;
        var width = imageData.width;
        var height = imageData.height;
        var bytemap = new Bytemap(width, height);
        if (this.grayscale) {
            for (var i = 0; i < data.length; i++) {
                data[i] = 255 - data[i];
            }
        }
        for (var k = 0; k < 256; k++) {
            rmul[k] = (k * 0x10000 * this.rgb_to_ycc[0][0]);
            gmul[k] = (k * 0x10000 * this.rgb_to_ycc[0][1]);
            bmul[k] = (k * 0x10000 * this.rgb_to_ycc[0][2]);
        }
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var index = ((height - i - 1) * width + j) << 2;
                var y = rmul[data[index]] + gmul[data[index + 1]] + bmul[data[index + 2]] + 32768;
                bytemap[i][j] = ((y >> 16) - 128) << this.iw_shift;
            }
        }
        return bytemap;
    }
    RGBtoCb(imageData) {
        var rmul = new Int32Array(256);
        var gmul = new Int32Array(256);
        var bmul = new Int32Array(256);
        var data = imageData.data;
        var width = imageData.width;
        var height = imageData.height;
        var bytemap = new Bytemap(width, height);
        for (var k = 0; k < 256; k++) {
            rmul[k] = (k * 0x10000 * this.rgb_to_ycc[2][0]);
            gmul[k] = (k * 0x10000 * this.rgb_to_ycc[2][1]);
            bmul[k] = (k * 0x10000 * this.rgb_to_ycc[2][2]);
        }
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var index = ((height - i - 1) * width + j) << 2;
                var y = rmul[data[index]] + gmul[data[index + 1]] + bmul[data[index + 2]] + 32768;
                bytemap[i][j] = Math.max(-128, Math.min(127, y >> 16)) << this.iw_shift;
            }
        }
        return bytemap;
    }
    RGBtoCr(imageData) {
        var rmul = new Int32Array(256);
        var gmul = new Int32Array(256);
        var bmul = new Int32Array(256);
        var data = imageData.data;
        var width = imageData.width;
        var height = imageData.height;
        var bytemap = new Bytemap(width, height);
        for (var k = 0; k < 256; k++) {
            rmul[k] = (k * 0x10000 * this.rgb_to_ycc[1][0]);
            gmul[k] = (k * 0x10000 * this.rgb_to_ycc[1][1]);
            bmul[k] = (k * 0x10000 * this.rgb_to_ycc[1][2]);
        }
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var index = ((height - i - 1) * width + j) << 2;
                var y = rmul[data[index]] + gmul[data[index + 1]] + bmul[data[index + 2]] + 32768;
                bytemap[i][j] = Math.max(-128, Math.min(127, y >> 16)) << this.iw_shift;
            }
        }
        return bytemap;
    }
}
IWImageWriter.prototype.iw_shift = 6;
IWImageWriter.prototype.rgb_to_ycc = [
    [0.304348, 0.608696, 0.086956],
    [0.463768, -0.405797, -0.057971],
    [-0.173913, -0.347826, 0.521739]];

function initWorker() {
    var djvuDocument;
    var iwiw;
    onmessage = function (oEvent) {
        try {
            var obj = oEvent.data;
            handlers[obj.command](obj);
        } catch (error) {
            postMessage({
                command: 'Error',
                id: obj.id,
                message: error.message,
                lastCommandObject: obj
            });
        }
    };
    var handlers = {
        getPageText(obj) {
            return new Promise((resolve, reject) => {
                var pagenum = +obj.pagenumber;
                var text = djvuDocument.pages[pagenum].getText();
                postMessage({
                    command: 'getPageText',
                    id: obj.id,
                    text: text
                });
            });
        },
        getPageImageDataWithDPI(obj) {
            var pagenum = +obj.pagenumber;
            var imageData = djvuDocument.pages[pagenum].getImageData();
            var dpi = djvuDocument.pages[pagenum].dpi;
            postMessage({
                command: 'getPageImageDataWithDPI',
                id: obj.id,
                buffer: imageData.data.buffer,
                width: imageData.width,
                height: imageData.height,
                dpi: dpi
            }, [imageData.data.buffer]);
            this.reloadDocument();
        },
        getPageNumber(obj) {
            postMessage({
                command: 'getPageNumber',
                id: obj.id,
                pageNumber: djvuDocument.pages.length
            });
        },
        getDocumentMetaData(obj) {
            var str = djvuDocument.toString(obj.html);
            postMessage({ command: 'getDocumentMetaData', id: obj.id, str: str });
        },
        startMultyPageDocument(obj) {
            iwiw = new IWImageWriter(obj.slicenumber, obj.delayInit, obj.grayscale);
            iwiw.startMultyPageDocument();
            postMessage({ command: 'createDocumentFromPictures', id: obj.id });
        },
        addPageToDocument(obj) {
            var imageData = new ImageData(new Uint8ClampedArray(obj.simpleImage.buffer), obj.simpleImage.width, obj.simpleImage.height);
            iwiw.addPageToDocument(imageData);
            postMessage({ command: 'addPageToDocument', id: obj.id });
        },
        endMultyPageDocument(obj) {
            var buffer = iwiw.endMultyPageDocument();
            postMessage({ command: 'endMultyPageDocument', id: obj.id, buffer: buffer }, [buffer]);
        },
        createDocumentFromPictures(obj) {
            var sims = obj.images;
            var imageArray = new Array(sims.length);
            for (var i = 0; i < sims.length; i++) {
                imageArray[i] = new ImageData(new Uint8ClampedArray(sims[i].buffer), sims[i].width, sims[i].height);
            }
            var iw = new IWImageWriter(obj.slicenumber, obj.delayInit, obj.grayscale);
            iw.onprocess = (percent) => {
                postMessage({ command: 'Process', percent: percent });
            };
            var ndoc = iw.createMultyPageDocument(imageArray);
            postMessage({ command: 'createDocumentFromPictures', id: obj.id, buffer: ndoc.buffer }, [ndoc.buffer]);
        },
        slice(obj) {
            var ndoc = djvuDocument.slice(obj.from, obj.to);
            postMessage({ command: 'slice', id: obj.id, buffer: ndoc.buffer }, [ndoc.buffer]);
        },
        createDocument(obj) {
            djvuDocument = new DjVuDocument(obj.buffer);
            postMessage({ command: 'createDocument', id: obj.id, pagenumber: djvuDocument.pages.length });
        },
        reloadDocument() {
            djvuDocument = new DjVuDocument(djvuDocument.buffer);
        }
    };
}
if (!Function('return this;')().document) {
    initWorker();
}

var index = Object.assign({}, DjVu, {
    Worker: DjVuWorker,
    Document: DjVuDocument
});

return index;

}());
