import BZZDecoder from '../bzz/BZZDecoder';
import { CorruptedFileDjVuError } from '../DjVuErrors';

// простейший шаблон порции данных
export class IFFChunk {
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
    constructor(bs) {
        super(bs);
        this.id += ':' + bs.readStr4(); // read secondary id
    }

    toString(innerString = '') {
        return super.toString() + '    ' + innerString.replace(/\n/g, '\n    ') + '\n';
    }
}

export class ColorChunk extends IFFChunk {
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
        this.flags = this.length > 9 ? bs.getInt8() : 0; // todo: it defines rotations, should be used

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

/**
 * Порция данных машинного оглавления документа. 
 * Содержит сведения о структуре многостраничного документа
 */
export class DIRMChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.dflags = bs.byte();
        this.nfiles = bs.getInt16();
        this.offsets = new Int32Array(this.nfiles);
        this.sizes = new Uint32Array(this.nfiles);
        this.flags = new Uint8Array(this.nfiles);
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
            this.names[i] = this.flags[i] & 128 ? bsz.readStrNT() : this.ids[i]; // check hasname flag
            this.titles[i] = this.flags[i] & 64 ? bsz.readStrNT() : this.ids[i]; // check hastitle flag
        }
    }

    getFilesCount() {
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