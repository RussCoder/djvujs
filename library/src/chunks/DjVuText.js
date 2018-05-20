import { IFFChunk } from './IFFChunks';
import BZZDecoder from '../bzz/BZZDecoder';

/**
 * Класс для порций TXTa и TXTz.
 */
export default class DjVuText extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.isDecoded = false;
        /** @type {ByteStream} */
        this.dbs = this.id === 'TXTz' ? null : this.bs; // decoded byte stream
    }

    decode() {
        if (this.isDecoded) {
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

        this.pageZone = this.dbs.isEmpty() ? null : this.decodeZone();

        this.isDecoded = true;
    }

    decodeZone(parent = null, prev = null) {

        var type = this.dbs.getUint8();
        var x = this.dbs.getUint16() - 0x8000;
        var y = this.dbs.getUint16() - 0x8000;
        var width = this.dbs.getUint16() - 0x8000;
        var height = this.dbs.getUint16() - 0x8000;
        var textStart = this.dbs.getUint16() - 0x8000; // must be always 0
        var textLength = this.dbs.getInt24();

        if (prev) {
            if (type === 1 /*PAGE*/ || type === 4 /*PARAGRAPH*/ || type === 5 /*LINE*/) {
                x = x + prev.x;
                y = prev.y - (y + height);
            } else // Either COLUMN or WORD or CHARACTER
            {
                x = x + prev.x + prev.width;
                y = y + prev.y;
            }
            textStart += prev.textStart + prev.textLength;
        } else if (parent) {
            x = x + parent.x;
            y = parent.y + parent.height - (y + height);
            textStart += parent.textStart;
        }

        var zone = { type, x, y, width, height, textStart, textLength };

        var childrenCount = this.dbs.getInt24();
        if (childrenCount) {
            var children = new Array(childrenCount);
            var childZone = null;
            for (var i = 0; i < childrenCount; i++) {
                childZone = this.decodeZone(zone, childZone);
                children[i] = childZone;
            }
            zone.children = children;
        }

        return zone;
    }

    getText() {
        this.decode();
        return this.text;
    }

    getTextZones() {
        this.decode();
        return this.pageZone;
    }

    toString() {
        this.decode();
        var st = "Text length = " + this.textLength + "\n";
        return super.toString() + st;
    }
}