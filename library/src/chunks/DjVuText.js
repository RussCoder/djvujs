import { IFFChunk } from './IFFChunks';
import BZZDecoder from '../bzz/BZZDecoder';
import { createStringFromUtf8Array } from '../DjVu';

/**
 * @typedef {Object} TextZone
 * @property {number} x - top left corner x coordinate relative to the page
 * @property {number} y - top left corner y coordinate relative to the page
 * @property {number} width
 * @property {number} height
 * @property {string} text
 */

/**
 * @typedef {Object} RawTextZone
 * @property {number} type
 * @property {number} x - top left corner x coordinate relative to the page
 * @property {number} y - top left corner y coordinate relative to the page
 * @property {number} width
 * @property {number} height
 * @property {number} textStart - offset of text in bytes in the raw UTF8 array.
 * @property {number} textLength - length of text in bytes in the raw UTF8 array.
 * @property {Array<RawTextZone>} [children] - nested raw text zones.
 */

/**
 * Класс для порций TXTa и TXTz.
 */
export default class DjVuText extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.isDecoded = false;
        /** @type {import('../ByteStream').ByteStream} */
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
        this.utf8array = this.dbs.getUint8Array(this.textLength);

        this.version = this.dbs.getUint8();
        if (this.version !== 1) {
            console.warn("The version in " + this.id + " isn't equal to 1!");
        }

        this.pageZone = this.dbs.isEmpty() ? null : this.decodeZone();

        this.isDecoded = true;
    }

    /** @returns {RawTextZone} */
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

    /** @returns {string} */
    getText() {
        this.decode();
        this.text = this.text || createStringFromUtf8Array(this.utf8array);
        return this.text;
    }

    /** @returns {?RawTextZone} */
    getPageZone() {
        this.decode();
        return this.pageZone;
    }

    /** @returns {?Array<TextZone} */
    getNormalizedZones() {
        this.decode();

        if (!this.pageZone) {
            return null;
        }

        if (this.normalizedZones) {
            return this.normalizedZones;
        }

        this.normalizedZones = [];
        var registry = {};

        const process = (zone) => {
            if (zone.children) {
                zone.children.forEach(zone => process(zone));
            } else {
                var key = zone.x.toString() + zone.y + zone.width + zone.height;
                var zoneText = createStringFromUtf8Array(this.utf8array.slice(zone.textStart, zone.textStart + zone.textLength));
                if (registry[key]) { // unite text of the same zone
                    registry[key].text += zoneText
                } else {
                    registry[key] = {
                        x: zone.x,
                        y: zone.y,
                        width: zone.width,
                        height: zone.height,
                        text: zoneText
                    };
                    this.normalizedZones.push(registry[key]);
                }
            }
        }

        process(this.pageZone);

        return this.normalizedZones;
    }

    toString() {
        this.decode();
        var st = "Text length = " + this.textLength + "\n";
        return super.toString() + st;
    }
}