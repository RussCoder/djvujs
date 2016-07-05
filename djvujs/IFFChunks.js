'use strict';

/**
 * Простейший класс ошибки, не содержит рекурсивных данных, чтобы иметь возможность копироваться
 * между потоками в сообщениях
 */
class DjVuError {
    constructor(message) {
        this.message = message;
    }
}

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

class ColorChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.header = new СolorChunkDataHeader(bs);
    }
    toString() {
        return this.id + " " + this.length + this.header.toString();
    }
}

/**
 * Порция данных содержащая в себе параметры изображения (всей страницы)
 */
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

/**
 * Заголовок порции цветовых порций данных. Содержит сведения о закодированном изображении.
 * Предоставляет основную информацию о порции данных.
 */
class СolorChunkDataHeader {
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
            // задержка декодирования цветовой информации (старший бит должен быть 1, но вообще игнорируется)
            this.delayInit = bs.getUint8() & 127;
        }
    }
    toString() {
        return '\n' + JSON.stringify(this) + "\n";
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
        str += "{Reference: " + this.ref + '}\n';
        return str;
    }
}

/**
 * Нестандартная порция данных. 
 * Обычно содержит в себе информацию о программе-кодировщике
 */
class CIDaChunk extends INCLChunk { }

/**
 * Оглавление человеко-читаемое
 */
class NAVMChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
    }
    toString() {
        return super.toString() + '\n';
    }
}


/**
 * Порция данных машинного оглавления документа. 
 * Содержит сведения о структуре многостраничного документа
 */
class DIRMChunk extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.dflags = bs.byte();
        this.nfiles = bs.getInt16();
        this.offsets = [];
        this.sizes = [];
        this.flags = [];
        this.ids = [];
        for (var i = 0; i < this.nfiles; i++) {
            this.offsets.push(bs.getInt32());
        }
        var bsbs = bs.fork(this.length - 3 - 4 * this.nfiles);
        var bzz = new BZZDecoder(new ZPDecoder(bsbs));
        var bsz = bzz.getByteStream();
        for (var i = 0; i < this.nfiles; i++) {
            this.sizes.push(bsz.getUint24());
        }
        for (var i = 0; i < this.nfiles; i++) {
            this.flags.push(bsz.byte());
        }
        for (var i = 0; i < this.nfiles && !bsz.isEmpty(); i++) {
            //todo проверять hasname и hastitle
            this.ids.push(bsz.readStrNT());
        }
    }

    toString() {
        var str = super.toString();
        str += "{Files: " + this.nfiles + '}\n';
        /* str += "offsets: ";
         this.offsets.forEach(item => str += item + " ");
         str += '\n';
         str += "sizes: ";
         str += this.sizes.join(' ') + '\n';
         str += "flags: ";
         str += this.flags.join(' ') + '\n';
         str += "ids: ";
         str += this.ids.join(' ') + '\n\n'; */
        return str + '\n';
    }
}