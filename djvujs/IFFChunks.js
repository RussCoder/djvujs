'use strict';

// простейший шаблон порции данных
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

class ColorChunk extends IFFChunk{
    constructor(bs) {
        super(bs);
        this.header = new СolorChunkDataHeader(bs);
    }
    toString() {
        return this.id + " " + this.length + this.header.toString();
    }
}

class InfoChunk extends IFFChunk {
    constructor(bs) {
        //let viewer = new DataView(blob,offset,10);
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
        // let str = "<br>INFO<br>" + "Width: " + this.width + "<br>" + "Height: " + this.height;
        return "INFO 10" + '\n' + JSON.stringify(this) + "\n";
    }
}

class СolorChunkDataHeader {
    constructor(bs) {
        //let viewer = new DataView(blob,offset,9);
        this.serial = bs.getUint8();
        this.slices = bs.getUint8();
        if (!this.serial) {
            this.majver = bs.getUint8();
            this.grayscale = this.majver >> 7;
            this.minver = bs.getUint8();
            this.width = bs.getUint16();
            this.height = bs.getUint16();
            this.delayInit = bs.getUint8() & 127;
            //console.log(bs.getUint8(8) >> 7);
        }
    }
    toString() {
        return "\n" + JSON.stringify(this) + "\n";
    }
}

class INCLChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.ref = '';
        var byte;
        var tmp = this.bs.getUint8Array().slice(0);
        this.ref = String.fromCharCode(...tmp);
    }
    toString() {
        var str = super.toString();
        str += "Ref: " + this.ref + '\n';
        return str;
    }
}

class CIDaChunk extends INCLChunk {}

// оглавление человеко-читаемое
class NAVMChunk extends IFFChunk{
    constructor(bs) {
        super(bs);
    }
    toString() {
        return super.toString();
    }
}