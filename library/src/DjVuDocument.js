import DjViChunk from './chunks/DjViChunk';
import DjVuPage from './DjVuPage';
import { DjVuError, DIRMChunk, NAVMChunk } from './chunks/IFFChunks';
import DjVuWriter from './DjVuWriter';
import DjVu from './DjVu';
import ThumChunk from './chunks/ThumChunk';
import ByteStream from './ByteStream';

export default class DjVuDocument {
    constructor(arraybuffer) {
        this.buffer = arraybuffer;
        this.bs = new ByteStream(arraybuffer);
        this.formatID = this.bs.readStr4();
        if (this.formatID !== 'AT&T') {
            throw new DjVuError("Incorrect file format");
        }
        this.id = this.bs.readStr4();
        this.length = this.bs.getInt32();
        this.id += this.bs.readStr4();
        if (this.id == 'FORMDJVM') {
            var id = this.bs.readStr4();
            var length = this.bs.getInt32();
            this.bs.jump(-8);
            this.dirm = new DIRMChunk(this.bs.fork(length + 8));
            this.bs.jump(8 + length + (length & 1 ? 1 : 0));

            // all chunks of the file in the order which they are listed in the DIRM chunk
            this.dirmOrderedChunks = new Array(this.dirm.getFilesCount());
        }
        this.getINCLChunkCallback = id => this.djvi[id].innerChunk;

        /**
         * @type {Array<DjVuPage>}
         */
        this.pages = []; //страницы FORMDJVU
        this.thumbs = [];
        //разделяемые ресурсы
        this.djvi = {};
        this.navm = null; // человеческое оглавление 

        this.init();
    }

    init() {
        if (this.dirm) {
            var id = this.bs.readStr4();
            var length = this.bs.getInt32();
            this.bs.jump(-8);
            if (id == 'NAVM') {
                this.navm = new NAVMChunk(this.bs.fork(length + 8))
            }
            for (var i = 0; i < this.dirm.offsets.length; i++) {
                this.bs.setOffset(this.dirm.offsets[i]);
                var id = this.bs.readStr4();
                var length = this.bs.getInt32();
                id += this.bs.readStr4();
                this.bs.jump(-12);
                switch (id) {
                    case "FORMDJVU":
                        this.pages.push(this.dirmOrderedChunks[i] = new DjVuPage(
                            this.bs.fork(length + 8),
                            this.getINCLChunkCallback
                        ));
                        break;
                    case "FORMDJVI":
                        //через строчку id chunk INCL ссылается на нужный ресурс
                        this.dirmOrderedChunks[i] = this.djvi[this.dirm.ids[i]] = new DjViChunk(this.bs.fork(length + 8));
                        break;
                    case "FORMTHUM":
                        this.thumbs.push(this.dirmOrderedChunks[i] = new ThumChunk(this.bs.fork(length + 8)));
                        break;
                    default:
                        console.error("Incorrectr chunk ID: ", id);
                }
            }
        }
        else {
            this.bs.jump(-12);
            // 4 - так как есть 4 байта формата
            this.pages.push(new DjVuPage(this.bs.fork(this.length + 4)));
        }
    }

    getPage(number) {
        var page = this.pages[number - 1];
        if (this.lastRequestedPage && this.lastRequestedPage !== page) {
            this.lastRequestedPage.reset();
        }
        this.lastRequestedPage = page;
        return this.lastRequestedPage;
    }

    getPageUnsafe(number) {
        return this.pages[number - 1];
    }

    resetLastRequestedPage() {
        this.lastRequestedPage && this.lastRequestedPage.reset();
        this.lastRequestedPage = null;
    }

    countFiles() {
        var count = 0;
        var bs = this.bs.clone();
        bs.jump(16);
        while (!bs.isEmpty()) {
            var chunk;
            var id = bs.readStr4();
            var length = bs.getInt32();
            bs.jump(-8);
            // вернулись назад
            var chunkBs = bs.fork(length + 8);
            // перепрыгнули к следующей порции
            bs.jump(8 + length + (length & 1 ? 1 : 0));
            if (id === 'FORM') {
                count++;
            }
        }
        return count;
    }

    /**
     * Возвращает метаданные документа. 
     * @param {Boolean} html - заменять ли \n на <br>
     * @returns {string} строка метаданных
     */
    toString(html) {
        var str = this.formatID + '\n';
        if (this.dirm) { // multi page document
            str += this.id + " " + this.length + '\n\n';
            str += this.dirm.toString();
            this.dirmOrderedChunks.forEach((chunk, i) => {
                str += this.dirm.getMetadataStringByIndex(i) + chunk.toString();
            });
        } else { // single page document
            str += this.pages[0].toString();
        }

        return html ? str.replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;') : str;
    }

    /**
     * Создает ссылку для скачивания документа
     */
    createObjectURL() {
        var blob = new Blob([this.bs.buffer]);
        var url = URL.createObjectURL(blob);
        return url;
    }

    /**
     *  Creates a new DjVuDocument with pages from "from" to "to", including first and last pages.
     */
    slice(from = 1, to = this.pages.length) {
        //Globals.Timer.start('sliceTime');
        var djvuWriter = new DjVuWriter();
        djvuWriter.startDJVM();
        var dirm = {};
        dirm.dflags = this.dirm.dflags;
        var pageNumber = to - from + 1;
        dirm.flags = [];
        dirm.names = [];
        dirm.titles = [];
        dirm.sizes = [];
        dirm.ids = [];
        var chunkBS = [];
        var pageIndex = 0;
        var addedPageCount = 0;
        // все зависимости страниц в новом документе
        // нужно чтобы не копировать лишние словари
        var dependencies = {};

        // находим все зависимости в первом проходе
        for (var i = 0; i < this.dirm.nfiles && addedPageCount < pageNumber; i++) {
            var isPage = (this.dirm.flags[i] & 63) === 1;
            if (isPage) {
                pageIndex++;
                if (pageIndex < from) {
                    continue;
                }
                else {
                    addedPageCount++;
                    var cbs = new ByteStream(this.buffer, this.dirm.offsets[i], this.dirm.sizes[i]);
                    var deps = new DjVuPage(cbs).getDependencies();
                    cbs.reset();
                    for (var j = 0; j < deps.length; j++) {
                        dependencies[deps[j]] = 1;
                    }
                }
            }
        }

        pageIndex = 0;
        addedPageCount = 0;
        // теперь все словари и страницы, которые нужны
        for (var i = 0; i < this.dirm.nfiles && addedPageCount < pageNumber; i++) {
            var isPage = (this.dirm.flags[i] & 63) === 1;
            if (isPage) {
                pageIndex++;
                //если она не входит в заданный дапазон
                if (pageIndex < from) {
                    continue;
                } else {
                    addedPageCount++;
                }
            }


            //копируем страницы и словари. Эскизы пропускаем - пока что это не реализовано
            if ((this.dirm.ids[i] in dependencies) || isPage) {
                dirm.flags.push(this.dirm.flags[i]);
                dirm.sizes.push(this.dirm.sizes[i]);
                dirm.ids.push(this.dirm.ids[i]);
                dirm.names.push(this.dirm.names[i]);
                dirm.titles.push(this.dirm.titles[i]);
                var cbs = new ByteStream(this.buffer, this.dirm.offsets[i], this.dirm.sizes[i]);
                chunkBS.push(cbs);
            }
        }

        djvuWriter.writeDirmChunk(dirm);
        if (this.navm) {
            djvuWriter.writeChunk(this.navm);
        }

        for (var i = 0; i < chunkBS.length; i++) {
            djvuWriter.writeFormChunkBS(chunkBS[i]);
        }
        var newbuffer = djvuWriter.getBuffer();
        DjVu.IS_DEBUG && console.log("New Buffer size = ", newbuffer.byteLength);
        var doc = new DjVuDocument(newbuffer);
        //Globals.Timer.end('sliceTime');
        return doc;
    }

    /**
     * Функция склейки двух документов
     */
    static concat(doc1, doc2) {
        var dirm = {};
        var length = doc1.pages.length + doc2.pages.length;
        dirm.dflags = 129;
        dirm.flags = [];
        dirm.sizes = [];
        dirm.ids = [];
        var pages = [];
        var idset = new Set(); // чтобы убрать повторяющиеся id

        if (!doc1.dirm) { // тогда  записываем свой id
            dirm.flags.push(1);
            dirm.sizes.push(doc1.pages[0].bs.length);
            dirm.ids.push('single');
            idset.add('single');
            pages.push(doc1.pages[0]);
        }
        else {
            for (var i = 0; i < doc1.pages.length; i++) {
                dirm.flags.push(doc1.dirm.flags[i]);
                dirm.sizes.push(doc1.dirm.sizes[i]);
                dirm.ids.push(doc1.dirm.ids[i]);
                idset.add(doc1.dirm.ids[i]);
                pages.push(doc1.pages[i]);
            }
        }
        if (!doc2.dirm) { // тогда  записываем свой id
            dirm.flags.push(1);
            dirm.sizes.push(doc2.pages[0].bs.length);

            var newid = 'single2';
            var tmp = 0;
            while (idset.has(newid)) { // генерируем уникальный id
                newid = 'single2' + tmp.toString();
                tmp++;
            }
            dirm.ids.push(newid);
            pages.push(doc2.pages[0]);
        }
        else {
            for (var i = 0; i < doc2.pages.length; i++) {
                dirm.flags.push(doc2.dirm.flags[i]);
                dirm.sizes.push(doc2.dirm.sizes[i]);
                var newid = doc2.dirm.ids[i];
                var tmp = 0;
                while (idset.has(newid)) { // генерируем уникальный id
                    newid = doc2.dirm.ids[i] + tmp.toString();
                    tmp++;
                }
                dirm.ids.push(newid);
                idset.add(newid);
                pages.push(doc2.pages[i]);
            }
        }

        var dw = new DjVuWriter();
        dw.startDJVM();
        dw.writeDirmChunk(dirm);
        for (var i = 0; i < length; i++) {
            dw.writeFormChunkBS(pages[i].bs);
        }

        return new DjVuDocument(dw.getBuffer());

    }
}
