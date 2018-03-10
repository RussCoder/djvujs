import { IFFChunk } from './IFFChunks';
import BZZDecoder from './bzz/BZZDecoder';

/**
 * Класс для порций TXTa и TXTz.
 * Реализован не полностью, пока что только сырой текст декодируется и читается
 */
export default class DjVuText extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.isParsed = false;
        /** @type {ByteStream} */
        this.dbs = this.id === 'TXTz' ? null : this.bs; // decoded byte stream
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

        /**
         * Тут следует написать код парсинга информации о текстовых зонах
         */

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