'use strict';

/*
* Псевдо ZPСoder для того чтобы видеть битовый поток.
*/
class PseudoZP {
    constructor() {
        this.log = [];
        this.offset = 0;
    }
    
    encode(bit, ctx, n) {
        bit = +bit;
        if (ctx) {
            var tmp = {
                bit: bit,
                ctx: ctx[n],
                off: n,
                len: this.log.length
            };
        } 
        else {
            var tmp = {
                bit: bit,
                ctx: -1,
                off: -1,
                len: this.log.length
            };
        }
        this.log.push(tmp);
    }
    
    decode(ctx, n) {
        var tmp = this.log[this.offset++];
        if (ctx) {
            var cv = ctx[n];
            if (!(tmp.ctx === cv && n === tmp.off && tmp.len === (this.offset - 1))) {
                throw new Exception("Context dismatch");
            }
        } 
        else {
            if (!(tmp.ctx === -1 && tmp.off === -1 && tmp.len === (this.offset - 1))) {
                throw new Exception("Context dismatch");
            }
        }
        return tmp.bit;
    
    }
    
    eflush() {
        console.log("PseudoZP eflushed");
    }
}

function tmpFunc(doc) {
    var writer = new DjVuWriter(1000000);
    writer.writeStr("AT&T");
    
    writer.writeStr("FORM");
    //todo переделать
    writer.writeInt32(0);
    writer.writeStr("DJVU");
    var page = doc.pages[3];
    writer.writeChunk(page.info);
    for (var i = 0; i < page.bg44arr.length; i++) {
        writer.writeChunk(page.bg44arr[i]);
    }
    
    var bs = writer.getByteStream();
    console.log(bs.readStr4());
    var link = document.querySelector('#dochref');
    var nb = writer.getBuffer();
    var blob = new Blob([nb]);
    var url = URL.createObjectURL(blob);
    link.href = url;
    var dd = new DjVuDocument(nb);
    Globals.drawImage(dd.pages[0].getImage())
}

function ZPtest() {
    var bsw = new ByteStreamWriter(100000);
    var zp = new ZPEncoder(bsw);
    var n = 64;
    var ctx = [0];
    var arr = [];
    for (var i = 0; i < n; arr.push(Math.random() * 2 >> 0),
    i++) {}
    for (i = 0; i < n; i++) {
        var byte = arr[i];
        var mask = 128;
        for (var j = 7; j >= 0; j--) {
            var bit = (byte & mask) >> j;
            mask >>= 1;
            zp.encode(bit, ctx, 0);
        }
    }
    zp.eflush();
    console.log(arr);
    ctx = [0];
    var bs = new ByteStream(bsw.getBuffer());
    var zp = new ZPCoder(bs);
    for (i = 0; i < n; i++) {
        var byte = 0;
        for (var j = 7; j >= 0; j--) {
            var bit = zp.decode(ctx, 0);
            byte = (byte << 1) | bit;
        }
        arr[i] = byte;
    }
    console.log(arr);
    console.log("Full length = ", n, " Coded length = ", bs.length);
}


function BZZtest() {
    var bs = new ByteStreamWriter();
    var zp = new ZPEncoder(bs);
    var pzp = new PseudoZP();
    var bzz = new BZZEncoder(zp);
    
    var data = Uint8Array.of(11, 3, 2, 10, 2, 10, 2, 0);
    bzz.encode(data.buffer);
    
    var bsbs = new ByteStream(bs.getBuffer());
    var zp2 = new ZPCoder(bsbs);
    zp2.pzp = zp.pzp;
    var bzz = new BZZCodec(zp2);
    bzz.decode();
    var bsz = bzz.getByteStream();
    data = new Uint8Array(bsz.buffer);
    console.log(data);
}

/*
function tmpFunc() {
    var zigzagRow = [];
    var zigzagCol = [];
    for (var i = 0; i < 1024; i++) {
        var bits = [];
        for (let j = 0; j < 10; j++) {
            bits.push((i & Math.pow(2, j)) >> j);
        }
        let row = 16 * bits[1] + 8 * bits[3] + 4 * bits[5] + 2 * bits[7] + bits[9];
        let col = 16 * bits[0] + 8 * bits[2] + 4 * bits[4] + 2 * bits[6] + bits[8];
        zigzagRow.push(row);
        zigzagCol.push(col);
    }
    //console.log(JSON.stringify(zigzagRow));
    //console.log(JSON.stringify(zigzagCol));
    let r = "[";
    let c = "[";
    let k = 0;
    for (let i = 0; i < 1024; i++) {
        r += zigzagRow[i] + ',';
        c += zigzagCol[i] + ',';
        k++;
        if (k === 16) {
            k = 0;
            r += '\n';
            c += '\n';
        }
    }
    r += ']';
    c += ']';
    console.log(r);
    console.log(c);

}
/*
class TMP {
    constructor() {
        this.a = +(new Date());
    }
    get b() {
        return 1;
    }
    write() {
        console.log(this.a + this.field);
    }

}

TMP.prototype.field = "FieLD";

class TMP2 extends TMP {
    constructor(a) {
        super();
       // if(a) this.a = a;
    }
    write() {
        console.log(this.a + this.field);
    }
}
var tmp = new TMP2();
tmp.write();
var tmp2 = new TMP2(3);
tmp2.write();
console.log(tmp.hasOwnProperty('field'));
console.log(tmp2.hasOwnProperty('field'));

TMP.prototype.field = "FieLD++";

tmp.write();
tmp2.write();
console.log(tmp.hasOwnProperty('field'));
console.log(tmp2.hasOwnProperty('field'));
*/



/*

class ByteStreamWriter {
    constructor(length) {
        //должен быть кратен 8 для быстрого копирования буферов
        length = length ? length - lengt % 2 : 0;
        //начальная длина
        this.initLength = length || 1024 * 1024 * 2;
        //шаг роста длины
        //this.lengthStep = lengthStep || this.initLength;
        this.fullBuffersViewers = [];
        this.fullBuffersOffsets = [];
        //коэф роста буффера отноительно шага роста длины
        this.growStep = 1;
        //ограничение на рост шага роста
        this.stepLimit = 4;
        this.buffer = new ArrayBuffer(this.initLength);
        this.viewer = new DataView(this.buffer);
        this.offset = 0;
        this.fullBuffersLength = 0;
    }
    
    get length() {
        return this.fullBuffersLength + this.offset;
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
        var time = performance.now();
        //return this.buffer.slice(0, this.offset);
        var eBuff = new ArrayBuffer(this.length);
        var rw = new ByteStreamRewriter(eBuff);
        for (var i = 0; i < this.fullBuffersViewers.length; i++) {
            var v = this.fullBuffersViewers[i];
            var off = this.fullBuffersOffsets[i];
            for (var j = 0; j < off; j++) {
                rw.rewriteByte(v.getUint8(j));
            }
        }        
        for (var j = 0; j < this.offset; j++) {
            rw.rewriteByte(this.viewer.getUint8(j));
        }
        
        time = performance.now() - time;
        console.log('Buffer created in ', time);
        return eBuff;
    }
    
    checkOffset(bytes) {
        bytes = bytes || 0;
        if (this.offset + bytes >= this.bufferLength) {
            this.extense();
        }
    }
    
    extense() {
        var time = performance.now();
        /*var newlength = this.growStep * this.lengthStep + this.buffer.byteLength;
        if (this.growStep < this.stepLimit) {
            this.growStep++;
        }
        this.fullBuffersViewers.push(this.viewer);
        this.fullBuffersOffsets.push(this.offset);
        this.fullBuffersLength += this.offset;
        this.offset = 0;
        this.buffer = new ArrayBuffer(this.initLength);
        this.viewer = new DataView(this.buffer);
        
        time = performance.now() - time;
        //console.log('ByteStream extensed in ', time);
        Globals.time.extenseTime = (Globals.time.extenseTime ? Globals.time.extenseTime : 0) + time;
    }
    
    //смещение на length байт
    jump(length) {
        length = +length;
        while(length > 0) {
            this.writeByte(0);
            length--;
        }
        return this;
    }
    
    writeByteStream(bs) {
        //не трогаем исходный объект
        bs = new ByteStream(bs.buffer,bs.offsetx,bs.length);
        while (!bs.isEmpty()) {
            this.writeByte(bs.getUint8());
        }
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


class ByteStreamRewriter {
    constructor(buffer) {
        this.buffer = buffer;
        this.viewer = new DataView(buffer);
        this.offset = 0;
    }
    
    setOffset(off) {
        this.offset = off;
    }
    
    rewriteByte(val) {
        this.viewer.setUint8(this.offset++, val);
    }

    rewriteInt32(val) {
        this.viewer.setInt32(this.offset, val);
        this.offset += 4;
    }

    rewriteFloat64(val) {
        this.viewer.setFloat64(this.offset, val);
        this.offset += 8;
    }
}
*/