'use strict';
//класс для измерения времени с точностью до микросекунд
class DebugTimer {
    constructor() {
        this.timers = {};
    }
    start(id) {
        var timer;
        if (this.timers[id]) {
            timer = this.timers[id];
        } else {
            timer = {
                totalTime: 0,
                timeArray: [],
                startTime: 0
            };
            this.timers[id] = timer;
        }
        timer.startTime = performance.now();
    }
    end(id, print) {
        if (!this.timers[id]) {
            console.log("Несуществующий таймер: ", id);
        }
        var timer = this.timers[id];
        var time = performance.now() - timer.startTime
        timer.totalTime += time;
        timer.timeArray.push(time);
        if (print) {
            console.log("Timer '", id, "'", time);
        }
    }
    toString() {
        var str = '**DebugTimer**\n';
        for (var p in this.timers) {
            str += ">>" + p + " " + this.timers[p].totalTime + "\n" + JSON.stringify(this.timers[p].timeArray) + '\n' + '<<\n';
        }
        str += "**DebugTimer**\n";
        return str;
    }
}
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
        } else {
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
        if(!tmp) { Globals.counter++; return 1;}
        if (ctx) {
            var cv = ctx[n];
            if (!(tmp.ctx === cv && n === tmp.off && tmp.len === (this.offset - 1))) {
                4;
                throw new Error("Context dismatch");
            }
        } else {
            if (!(tmp.ctx === -1 && tmp.off === -1 && tmp.len === (this.offset - 1))) {
                throw new Error("Context dismatch");
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

}*/
