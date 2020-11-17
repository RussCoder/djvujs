import { CorruptedFileDjVuError } from '../DjVuErrors';

/** @typedef {import('../ByteStream').ByteStream} ByteStream */

// простейший шаблон порции данных
export class IFFChunk {

    /** @param {ByteStream} bs */
    constructor(bs) {
        this.id = bs.readStr4();
        this.length = bs.getInt32();
        this.bs = bs;
    }
    toString() {
        return this.id + " " + this.length + '\n';
    }
}

export class CompositeChunk extends IFFChunk {

    /** @param {ByteStream} bs */
    constructor(bs) {
        super(bs);
        this.id += ':' + bs.readStr4(); // read secondary id
    }

    toString(innerString = '') {
        return super.toString() + '    ' + innerString.replace(/\n/g, '\n    ') + '\n';
    }
}

export class ColorChunk extends IFFChunk {

    /** @param {ByteStream} bs */
    constructor(bs) {
        super(bs);
        this.header = new ColorChunkDataHeader(bs);
    }
    toString() {
        return this.id + " " + this.length + this.header.toString();
    }
}

/**
 * Порция данных содержащая в себе параметры изображения (всей страницы)
 */
export class INFOChunk extends IFFChunk {

    /** @param {ByteStream} bs */
    constructor(bs) {
        super(bs);
        if (this.length < 5) {  // the cases when there are less than 10 bytes are not mentioned in the specification, but they are handled in DjVuLibre
            throw new CorruptedFileDjVuError("The INFO chunk is shorter than 5 bytes!")
        }
        this.width = bs.getInt16();
        this.height = bs.getInt16();
        this.minver = bs.getInt8();
        this.majver = this.length > 5 ? bs.getInt8() : 0;

        if (this.length > 7) {
            this.dpi = bs.getUint8();
            this.dpi |= bs.getUint8() << 8;
        } else {
            this.dpi = 300;
        }
        this.gamma = this.length > 8 ? bs.getInt8() : 22;
        this.flags = this.length > 9 ? bs.getInt8() : 0;

        // Fixup - copied from DjVuLibre
        if (this.dpi < 25 || this.dpi > 6000) {
            this.dpi = 300;
        }
        if (this.gamma < 3) {
            this.gamma = 3;
        }
        if (this.gamma > 50) {
            this.gamma = 50;
        }
    }

    toString() {
        var str = super.toString();
        str += "{" + 'width:' + this.width + ', '
            + 'height:' + this.height + ', '
            + 'minver:' + this.minver + ', '
            + 'majver:' + this.majver + ', '
            + 'dpi:' + this.dpi + ', '
            + 'gamma:' + this.gamma + ', '
            + 'flags:' + this.flags + '}\n';
        return str;
    }
}

/**
 * Заголовок порции цветовых порций данных. Содержит сведения о закодированном изображении.
 * Предоставляет основную информацию о порции данных.
 */
class ColorChunkDataHeader {

    /** @param {ByteStream} bs */
    constructor(bs) {
        this.serial = bs.getUint8(); // номер порции 
        this.slices = bs.getUint8(); // количество кусочков данных
        if (!this.serial) { // если это первая порция данных изображения
            this.majver = bs.getUint8(); // номер версии кодироващика (первая цифра) вообще 1
            this.grayscale = this.majver >> 7; // серое ли изображение
            this.minver = bs.getUint8(); // номер версии кодировщика (вторая цифра) вообще 2
            // ширина (высота) изображения.
            // должна быть равна ширине(высоте) в INFOChunk или быть от 2 до 12 раз меньше
            this.width = bs.getUint16();
            this.height = bs.getUint16();

            var byte = bs.getUint8();
            // задержка декодирования цветовой информации (старший бит должен быть 1, но вообще игнорируется)
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

export class INCLChunk extends IFFChunk {

    /** @param {ByteStream} bs */
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

/**
 * Нестандартная порция данных. 
 * Обычно содержит в себе информацию о программе-кодировщике
 */
export class CIDaChunk extends INCLChunk { }

export class ErrorChunk {
    constructor(id, e) {
        this.id = id;
        this.e = e;
    }

    toString() {
        return `Error creating ${this.id}: ${this.e.toString()}\n`;
    }
}
