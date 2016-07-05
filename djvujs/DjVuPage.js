'use strict';

/**
 * Страница документа
 */
class DjVuPage {
    /**
     * Принимает байтовый поток и id из машинного оглавлени документа. 
     */
    constructor(bs, dirmID) {
        this.id = "FORM:DJVU"; // данная информация была проверена в DjVuDocument
        this.length = bs.length - 8;
        this.dirmID = dirmID; // нужно для метаданных
        this.bs = bs;
        this.bs.jump(12);
        this.djbz = null;
        this.bg44arr = new Array();
        this.fg44 = null;
        this.bgimage = null;

        // список всех порций данных - для toString
        this.iffchunks = [];
        // id разделяемых данных (в частности словарей)
        this.dependencies = null;
        //this.init();
    }

    /**
     * Свойство необходимое для корректного отображения страницы - влияет на 100% масштаб.
     */
    get dpi() {
        return this.info ? this.info.dpi : undefined;
    }

    // метод поиска зависимостей, то есть INCLChunk
    // возвращает массив id 
    getDependencies() {
        //чтобы не вызывалось более 1 раза
        if (this.info || this.dependencies) {
            return this.dependencies;
        }
        this.dependencies = [];
        var bs = this.bs.fork();
        while (!bs.isEmpty()) {
            var chunk;
            var id = bs.readStr4();
            var length = bs.getInt32();
            bs.jump(-8);
            // вернулись назад
            var chunkBs = bs.fork(length + 8);
            bs.jump(8 + length + (length & 1 ? 1 : 0));
            // перепрыгнули к следующей порции
            if (id === "INCL") {
                chunk = new INCLChunk(chunkBs);
                this.dependencies.push(chunk.ref);
            }
        }
        return this.dependencies;
    }

    /**
     * Метод предварительного разбора страницы.
     * Вызывается вручную или автоматически
     */
    init() {
        //чтобы не вызывалось более 1 раза
        if (this.info) {
            return this;
        }
        this.dependencies = [];
        this.info = new INFOChunk(this.bs.fork(18));
        this.bs.jump(18);
        this.iffchunks.push(this.info);
        while (!this.bs.isEmpty()) {
            var chunk;
            let id = this.bs.readStr4();
            let length = this.bs.getInt32();
            this.bs.jump(-8);
            // вернулись назад
            let chunkBs = this.bs.fork(length + 8);
            this.bs.jump(8 + length + (length & 1 ? 1 : 0));
            // перепрыгнули к следующей порции
            if (id == "FG44") {
                chunk = this.fg44 = new ColorChunk(chunkBs);
            } else if (id == "BG44") {
                this.bg44arr.push(chunk = new ColorChunk(chunkBs));
            } else if (id == 'Sjbz') {
                chunk = this.sjbz = new JB2Image(chunkBs);
            } else if (id === "INCL") {
                chunk = this.incl = new INCLChunk(chunkBs);
                var inclChunk = Globals.getINCLChunk(this.incl.ref);
                inclChunk.id === "Djbz" ? this.djbz = inclChunk : this.iffchunks.push(inclChunk);
                this.dependencies.push(chunk.ref);
            } else if (id === "CIDa") {
                chunk = new CIDaChunk(chunkBs);
            } else {
                chunk = new IFFChunk(chunkBs);
            }
            //тут все порции в том порядке, в каком встретились при разборе 
            this.iffchunks.push(chunk);
        }
        return this;
    }

    /**
     * Метод генерации изображения для общего случая (все 3 слоя)
     */
    getImageData() {
        this.init();
        var image = new ImageData(this.info.width, this.info.height);
        this.decode();
        var time = performance.now();
        //достаем маску
        if (this.sjbz) {
            var bm = this.sjbz.bitmap;
        } else {
            //если только фоновый слой
            if (this.bgimage) {
                return this.bgimage.getImage();
            }//это вряд ли может быть но на всякий случай   
            else if (this.fgimage) {
                return this.fgimage.getImage();
            } else {
                return null;
            }
        }
        if (!this.bgimage && !this.fgimage) {
            return this.sjbz.getImage();
        }
        //масштабы на случай если закодированы в более меньшем разрешении
        var fgscale = Math.round(this.info.width / this.fgimage.info.width);
        var bgscale = Math.round(this.info.width / this.bgimage.info.width);
        //набираем изображение по пикселям
        for (var i = 0; i < this.info.height; i++) {
            for (var j = 0; j < this.info.width; j++) {
                var pixel;
                if (bm.get(i, j)) {
                    var is = Math.floor(i / fgscale);
                    var js = Math.floor(j / fgscale);
                    pixel = this.fgimage.pixelmap.getPixel(is, js);
                } else {
                    var is = Math.floor(i / bgscale);
                    var js = Math.floor(j / bgscale);
                    pixel = this.bgimage.pixelmap.getPixel(is, js);
                }
                var index = ((this.info.height - i - 1) * this.info.width + j) * 4;
                image.data[index] = pixel.r;
                image.data[index + 1] = pixel.g;
                image.data[index + 2] = pixel.b;
                image.data[index + 3] = 255;
            }
        }
        console.log("DataImage creating time = ", performance.now() - time);
        return image;
    }
    //раскодируем все слои
    decode() {
        var time = performance.now();
        this.sjbz ? this.sjbz.decode(this.djbz) : 0;
        console.log("Mask decoding time = ", performance.now() - time);
        time = performance.now();
        if (this.bg44arr.length) {
            this.bgimage = new IWImage();
            this.bg44arr.forEach((chunk) => {
                var zp = new ZPDecoder(chunk.bs);
                this.bgimage.decodeChunk(zp, chunk.header);
            }
            );
            this.bgimage.createPixelmap();
        }
        console.log("Background decoding time = ", performance.now() - time);
        time = performance.now();
        if (this.fg44) {
            this.fgimage = new IWImage();
            let zp = new ZPDecoder(this.fg44.bs);
            this.fgimage.decodeChunk(zp, this.fg44.header);
            this.fgimage.createPixelmap();
        }
        console.log("Foreground decoding time = ", performance.now() - time);
    }
    //фоновое изображение
    getBackgroundImage() {
        if (this.bg44arr.length) {
            this.bg44arr.forEach((chunk) => {
                let zp = new ZPCoder(chunk.bs);
                this.bgimage.decodeChunk(zp, chunk.header);
            }
            );
            return this.bgimage.getImage();
        } else {
            return null;
        }
    }
    getForegroundImage() {
        if (this.fg44) {
            this.fgimage = new IWImage();
            let zp = new ZPCoder(this.fg44.bs);
            this.fgimage.decodeChunk(zp, this.fg44.header);
            return this.fgimage.getImage();
        } else {
            return null;
        }
    }
    toString() {
        var str = '[DirmID: "' + this.dirmID + '"]\n';
        str += this.id + ' ' + this.length + "\n";
        this.init();
        for (var i = 0; i < this.iffchunks.length; i++) {
            str += this.iffchunks[i].toString();
        }
        return str + '\n';
    }
}
