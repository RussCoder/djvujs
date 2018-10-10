import { IFFChunk } from './IFFChunks';
import BZZDecoder from '../bzz/BZZDecoder';

/**
 * Порция данных машинного оглавления документа. 
 * Содержит сведения о структуре многостраничного документа
 */
export default class DIRMChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.dflags = bs.byte(); // saved just to copy to a new file in the DjVuDocument::slice() method (look at DjVuWriter)
        this.isBundled = this.dflags >> 7;
        this.nfiles = bs.getInt16();

        if (this.isBundled) {
            this.offsets = new Int32Array(this.nfiles);
            for (var i = 0; i < this.nfiles; i++) {
                this.offsets[i] = bs.getInt32();
            }
        }

        this.sizes = new Uint32Array(this.nfiles);
        this.flags = new Uint8Array(this.nfiles);
        this.ids = new Array(this.nfiles);
        this.names = new Array(this.nfiles);
        this.titles = new Array(this.nfiles);
        var bsz = BZZDecoder.decodeByteStream(bs.fork());

        for (var i = 0; i < this.nfiles; i++) {
            this.sizes[i] = bsz.getUint24();
        }
        for (var i = 0; i < this.nfiles; i++) {
            this.flags[i] = bsz.byte();
        }

        this.pagesIds = [];
        this.idToNameRegistry = {};
        for (var i = 0; i < this.nfiles && !bsz.isEmpty(); i++) {
            this.ids[i] = bsz.readStrNT();
            this.names[i] = this.flags[i] & 128 ? bsz.readStrNT() : this.ids[i]; // check hasname flag
            this.titles[i] = this.flags[i] & 64 ? bsz.readStrNT() : this.ids[i]; // check hastitle flag

            if (this.flags[i] & 1) {
                this.pagesIds.push(this.ids[i]);
            }
            this.idToNameRegistry[this.ids[i]] = this.names[i];
        }
    }

    getPageNameByItsNumber(number) {
        return this.getComponentNameByItsId(this.pagesIds[number - 1]);
    }

    getComponentNameByItsId(id) {
        return this.idToNameRegistry[id];
    }

    getPagesQuantity() {
        return this.pagesIds.length;
    }

    getFilesQuantity() {
        return this.nfiles;
    }

    getMetadataStringByIndex(i) {
        return `[id: "${this.ids[i]}", flag: ${this.flags[i]}, offset: ${this.offsets[i]}, size: ${this.sizes[i]}]\n`;
    }

    toString() {
        var str = super.toString();
        str += "FilesCount: " + this.nfiles + '\n';
        return str + '\n';
    }
}