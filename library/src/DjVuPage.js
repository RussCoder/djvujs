import { INCLChunk, DIRMChunk, ColorChunk, CIDaChunk, IFFChunk, INFOChunk, CompositeChunk } from './chunks/IFFChunks';
import JB2Dict from './jb2/JB2Dict';
import JB2Image from './jb2/JB2Image';
import DjVuPalette from './chunks/DjVuPalette';
import IWImage from './iw44/IWImage';
import DjVuText from './chunks/DjVuText';
import { ZPDecoder } from './ZPCodec';
import DjVu from './DjVu';
import { CorruptedFileDjVuError } from './DjVuErrors';

/**
 * Страница документа
 */
export default class DjVuPage extends CompositeChunk {
    /**
     * Принимает байтовый поток и id из машинного оглавления документа. 
     */
    constructor(bs, getINCLChunkCallback) {
        super(bs);
        this.getINCLChunkCallback = getINCLChunkCallback; // метод для получения глобальной порции данных (словарь обычно) от документа по id
        this.reset();
    }

    reset() {
        this.bs.setOffset(12); // skip id, length and secondary id
        this.djbz = null;
        this.bg44arr = new Array();
        this.fg44 = null;

        /**
         * @type {IWImage}
         */
        this.bgimage = null;
        /**
         * @type {IWImage}
         */
        this.fgimage = null;
        /**
         * @type {JB2Image}
         */
        this.sjbz = null;
        /**
         * @type {DjvuPallete}
         */
        this.fgbz = null;

        /** @type {DjvuText} */
        this.text = null;

        this.decoded = false;
        this.isBackgroundCompletelyDecoded = false;
        this.isFirstBgChunkDecoded = false;
        this.info = null;


        // список всех порций данных - для toString
        this.iffchunks = [];
        // id разделяемых данных (в частности словарей)
        this.dependencies = null;
        //this.init();
    }

    /**
     * Свойство необходимое для корректного отображения страницы - влияет на 100% масштаб.
     */
    getDpi() {
        if (this.info) {
            return this.info.dpi;
        } else {
            return this.init().info.dpi;
        }
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
     * @returns {DjVuPage}
     */
    init() {
        //чтобы не вызывалось более 1 раза
        if (this.info) {
            return this;
        }
        this.dependencies = [];

        var id = this.bs.readStr4();
        if (id !== 'INFO') {
            throw new CorruptedFileDjVuError("The very first chunk must be INFO chunk, but we got " + id + '!')
        }
        var length = this.bs.getInt32();
        this.bs.jump(-8);
        this.info = new INFOChunk(this.bs.fork(length + 8));
        this.bs.jump(8 + length + (this.info.length & 1));
        this.iffchunks.push(this.info);

        while (!this.bs.isEmpty()) {
            var chunk;
            var id = this.bs.readStr4();
            var length = this.bs.getInt32();

            this.bs.jump(-8); // вернулись назад
            var chunkBs = this.bs.fork(length + 8); // создали поток включающий только 1 порцию
            this.bs.jump(8 + length + (length & 1)); // перепрыгнули к следующей порции

            if (id == "FG44") {
                chunk = this.fg44 = new ColorChunk(chunkBs);
            } else if (id == "BG44") {
                this.bg44arr.push(chunk = new ColorChunk(chunkBs));
            } else if (id == 'Sjbz') {
                chunk = this.sjbz = new JB2Image(chunkBs);
            } else if (id === "INCL") {
                chunk = this.incl = new INCLChunk(chunkBs);
                var inclChunk = this.getINCLChunkCallback(this.incl.ref);
                inclChunk.id === "Djbz" ? this.djbz = inclChunk : this.iffchunks.push(inclChunk);
                this.dependencies.push(chunk.ref);
            } else if (id === "CIDa") {
                chunk = new CIDaChunk(chunkBs);
            } else if (id === 'Djbz') {
                chunk = this.djbz = new JB2Dict(chunkBs);
            } else if (id === 'FGbz') {
                chunk = this.fgbz = new DjVuPalette(chunkBs);
            } else if (id === 'TXTa' || id === 'TXTz') {
                chunk = this.text = new DjVuText(chunkBs);
            } else {
                chunk = new IFFChunk(chunkBs);
            }
            //тут все порции в том порядке, в каком встретились при разборе 
            this.iffchunks.push(chunk);
        }
        return this;
    }

    getRotation() {
        switch (this.info.flags) {
            case 5: return 90;
            case 2: return 180;
            case 6: return 270;
            default: return 0;
        }
    }

    rotateIfRequired(imageData) {
        if (this.info.flags === 5 || this.info.flags === 6) {
            var newImageData = new ImageData(this.info.height, this.info.width);
            var newPixelArray = new Uint32Array(newImageData.data.buffer);
            var oldPixelArray = new Uint32Array(imageData.data.buffer);
            var height = this.info.height;
            var width = this.info.width;

            if (this.info.flags === 6) { // 270
                for (var i = 0; i < width; i++) {
                    var rowOffset = (width - i - 1) * height;
                    var to = height + rowOffset;
                    for (var newIndex = rowOffset, oldIndex = i; newIndex < to; newIndex++ , oldIndex += width) {
                        newPixelArray[newIndex] = oldPixelArray[oldIndex];
                    }
                }
            } else { // 90
                for (var i = 0; i < width; i++) {
                    var rowOffset = i * height;
                    var from = height + rowOffset - 1;
                    for (var newIndex = from, oldIndex = i; newIndex >= rowOffset; newIndex-- , oldIndex += width) {
                        newPixelArray[newIndex] = oldPixelArray[oldIndex];
                    }
                }
            }

            return newImageData;
        }

        if (this.info.flags === 2) { // 180
            new Uint32Array(imageData.data.buffer).reverse();
            return imageData;
        }

        return imageData;
    }

    getImageData(rotate = true) {
        var image = this._getImageData();
        return rotate ? this.rotateIfRequired(image) : image;
    }

    /**
     * Метод генерации изображения для общего случая (все 3 слоя) без разворота
     * @returns {ImageData}
     */
    _getImageData() {
        this.decode();
        var time = performance.now();
        //достаем маску
        if (!this.sjbz) {
            //если только фоновый слой
            if (this.bgimage) {
                return this.bgimage.getImage();
            }//это вряд ли может быть но на всякий случай   
            else if (this.fgimage) {
                return this.fgimage.getImage();
            } else {
                var emptyImage = new ImageData(this.info.width, this.info.height);
                emptyImage.data.fill(255);
                return emptyImage;
            }
        }
        if (!this.bgimage && !this.fgimage) {
            return this.sjbz.getImage(this.fgbz);
        }

        var fgscale, bgscale, fgpixelmap, bgpixelmap;

        function fakePixelMap(r, g, b) { // ??? нужно ли это вообще ??? Пока что не встречал таких примеров
            return {
                writePixel(index, pixelArray, pixelIndex) {
                    pixelArray[pixelIndex] = r;
                    pixelArray[pixelIndex | 1] = g;
                    pixelArray[pixelIndex | 2] = b;
                }
            }
        }

        if (this.bgimage) {
            //масштабы на случай если закодированы в более меньшем разрешении
            bgscale = Math.round(this.info.width / this.bgimage.info.width);
            bgpixelmap = this.bgimage.pixelmap;
        } else {
            bgscale = 1;
            bgpixelmap = fakePixelMap(255, 255, 255);
        }

        if (this.fgimage) {
            //масштабы на случай если закодированы в более меньшем разрешении
            fgscale = Math.round(this.info.width / this.fgimage.info.width);
            fgpixelmap = this.fgimage.pixelmap;
        } else {
            fgscale = 1;
            fgpixelmap = fakePixelMap(0, 0, 0);
        }


        var image;
        if (!this.fgbz) { // если нет палитры
            image = this.createImageFromMaskImageAndPixelMaps(
                this.sjbz.getMaskImage(),
                fgpixelmap,
                bgpixelmap,
                fgscale,
                bgscale
            );
        } else { // тут уже предполагается, что переднего плана нет, а только палитра (in DjVu_Tech_Primer it is so)
            image = this.createImageFromMaskImageAndBackgroundPixelMap(
                this.sjbz.getImage(this.fgbz, true),
                bgpixelmap,
                bgscale
            );
        }

        DjVu.IS_DEBUG && console.log("DataImage creating time = ", performance.now() - time);
        return image;
    }

    createImageFromMaskImageAndPixelMaps(maskImage, fgpixelmap, bgpixelmap, fgscale, bgscale) {
        var image = maskImage;
        var pixelArray = image.data;
        //набираем изображение по пикселям
        var rowIndexOffset = ((this.info.height - 1) * this.info.width) << 2;
        var width4 = this.info.width << 2;
        for (var i = 0; i < this.info.height; i++) {
            var bis = i / bgscale >> 0;
            var fis = i / fgscale >> 0;
            var bgIndexOffset = bgpixelmap.width * bis;
            var fgIndexOffset = fgpixelmap.width * fis;

            var index = rowIndexOffset;
            for (var j = 0; j < this.info.width; j++) {
                if (pixelArray[index]) {
                    bgpixelmap.writePixel(bgIndexOffset + (j / bgscale >> 0), pixelArray, index);
                } else {
                    fgpixelmap.writePixel(fgIndexOffset + (j / fgscale >> 0), pixelArray, index);
                }
                index += 4;
            }
            rowIndexOffset -= width4;
        }

        return image;
    }

    createImageFromMaskImageAndBackgroundPixelMap(maskImage, bgpixelmap, bgscale) {
        var pixelArray = maskImage.data;
        //набираем изображение по пикселям
        var rowOffset = (this.info.height - 1) * this.info.width << 2;
        var width4 = this.info.width << 2;
        for (var i = 0; i < this.info.height; i++) {
            var bgRowOffset = (i / bgscale >> 0) * bgpixelmap.width;
            var index = rowOffset;
            for (var j = 0; j < this.info.width; j++) {
                if (pixelArray[index | 3]) {
                    bgpixelmap.writePixel(bgRowOffset + (j / bgscale >> 0), pixelArray, index);
                } else {
                    pixelArray[index | 3] = 255;
                }
                index += 4;
            }
            rowOffset -= width4;
        }

        return maskImage;
    }

    decodeForeground() {
        if (this.fg44) {
            this.fgimage = new IWImage();
            var zp = new ZPDecoder(this.fg44.bs);
            this.fgimage.decodeChunk(zp, this.fg44.header);
            var pixelMapTime = performance.now();
            this.fgimage.createPixelmap();
            DjVu.IS_DEBUG && console.log("Foreground pixelmap creating time = ", performance.now() - pixelMapTime);
        }
    }

    decodeBackground(isOnlyFirstChunk = false) {
        if (this.isBackgroundCompletelyDecoded || this.isFirstBgChunkDecoded && isOnlyFirstChunk) {
            return;
        }

        if (this.bg44arr.length) {
            this.bgimage = this.bgimage || new IWImage();
            var to = isOnlyFirstChunk ? 1 : this.bg44arr.length;
            var from = this.isFirstBgChunkDecoded ? 1 : 0;
            for (var i = from; i < to; i++) {
                var chunk = this.bg44arr[i];
                var zp = new ZPDecoder(chunk.bs);
                var time = performance.now();
                this.bgimage.decodeChunk(zp, chunk.header);
                DjVu.IS_DEBUG && console.log("Background chunk decoding time = ", performance.now() - time);
            }

            var pixelMapTime = performance.now();
            this.bgimage.createPixelmap();
            DjVu.IS_DEBUG && console.log("Background pixelmap creating time = ", performance.now() - pixelMapTime);

            if (isOnlyFirstChunk) {
                this.isFirstBgChunkDecoded = true;
            } else {
                this.isBackgroundCompletelyDecoded = true;
            }
        }
    }

    /**
     * Раскодирование всех 3 слоев изображения страницы, вызыват init()
     * @returns {DjVuPage}
     */
    decode() {
        if (this.decoded) {
            this.decodeBackground();
            return this;
        }
        this.init();

        var time = performance.now();
        this.sjbz ? this.sjbz.decode(this.djbz) : 0;
        DjVu.IS_DEBUG && console.log("Mask decoding time = ", performance.now() - time);

        time = performance.now();
        this.decodeForeground();
        DjVu.IS_DEBUG && console.log("Foreground decoding time = ", performance.now() - time);

        time = performance.now();
        this.decodeBackground();
        DjVu.IS_DEBUG && console.log("Background decoding time = ", performance.now() - time);

        this.decoded = true;
        return this;
    }

    /**
     * Фоновой слой
     * @returns {ImageData}
     */
    getBackgroundImageData() {
        this.decode();
        if (this.bg44arr.length) {
            this.bg44arr.forEach((chunk) => {
                var zp = new ZPDecoder(chunk.bs);
                this.bgimage.decodeChunk(zp, chunk.header);
            }
            );
            return this.bgimage.getImage();
        } else {
            return null;
        }
    }

    /**
     * @returns {ImageData}
     */
    getForegroundImageData() {
        this.decode();
        if (this.fg44) {
            this.fgimage = new IWImage();
            var zp = new ZPDecoder(this.fg44.bs);
            this.fgimage.decodeChunk(zp, this.fg44.header);
            return this.fgimage.getImage();
        } else {
            return null;
        }
    }

    /** @return {ImageData} */
    getMaskImageData() {
        this.decode();
        return this.sjbz && this.sjbz.getImage(this.fgbz);
    }

    getText() {
        this.init();
        return this.text ? this.text.getText() : "";
    }

    getPageTextZone() { // returns the top text zone of the whole page (which contains nested zones)
        this.init();
        return this.text ? this.text.getPageZone() : null;
    }

    getNormalizedTextZones() { // returns a flat array of zones without nested zones
        this.init();
        return this.text ? this.text.getNormalizedZones() : null;
    }

    toString() {
        this.init();
        var str = this.iffchunks.reduce((str, chunk) => str + chunk.toString(), '');
        return super.toString(str);
    }
}
