'use strict';

class DjVuDocument {
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
        }
        Globals._doc = this;
        Globals.getINCLChunk = function (id) {
            return Globals._doc.djvi[id].innerChunk;
        }
        
        /**
         * @type {Array<DjVuPage>}
         */
        this.pages = []; //страницы FORMDJVU
        //разделяемые ресурсы
        this.djvi = {};

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
                        this.pages.push(new DjVuPage(this.bs.fork(length + 8), this.dirm.ids[i]));
                        break;
                    case "FORMDJVI":
                        //через строчку id chunk INCL ссылается на нужный ресурс
                        this.djvi[this.dirm.ids[i]] = new DjViChunk(this.bs.fork(length + 8), this.dirm.ids[i]);
                        break;
                    default:
                        console.log(id);
                }
            }
        }
        else {
            this.bs.jump(-12);
            // 4 - так как есть 4 байта формата
            this.pages.push(new DjVuPage(this.bs.fork(this.length + 4)));
        }
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
        if (this.dirm) {
            str += this.id + " " + this.length + '\n\n';
            str += this.dirm.toString();
        }
        if (this.navm) {
            str += this.navm.toString();
        }
        for (var prop in this.djvi) {
            str += this.djvi[prop];
        }
        this.pages.forEach(item => str += item.toString());
        return html ? str.replace(/\n/g, '<br>') : str;
    }

    /**
     * Создает ссылку для скачивания документа
     */
    createObjectURL() {
        var blob = new Blob([this.bs.buffer]);
        var url = URL.createObjectURL(blob);
        return url;
    }

    // создает новый документ со страницы from включая ее до to не включая
    slice(from, to) {
        Globals.Timer.start('sliceTime');
        from = from || 0;
        to = to || this.pages.length;
        var djvuWriter = new DjVuWriter();
        djvuWriter.startDJVM();
        var dirm = {};
        dirm.dflags = this.dirm.dflags;
        var pageNumber = to - from;
        dirm.flags = [];
        dirm.names = [];
        dirm.titles = [];
        dirm.sizes = [];
        dirm.ids = [];
        var chuckBS = [];
        var pageCount = 0;
        var addedPageCount = 0;
        // все зависимости страниц в новом документе
        // нужно чтобы не копировать лишние словари
        var dependencies = {};

        // находим все зависимости в первом проходе
        for (var i = 0; i < this.dirm.nfiles && addedPageCount < pageNumber; i++) {
            //если это страница
            if (this.dirm.flags[i] & 1) {
                pageCount++;
                //если она не входит в заданный дапазон
                if (!(addedPageCount < pageNumber && pageCount > from)) {
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

        pageCount = 0;
        addedPageCount = 0;
        // теперь все словари и страницы, которые нужны
        for (var i = 0; i < this.dirm.nfiles && addedPageCount < pageNumber; i++) {
            //если это страница
            if (this.dirm.flags[i] & 1) {
                pageCount++;
                //если она не входит в заданный дапазон
                if (!(addedPageCount < pageNumber && pageCount > from)) {
                    continue;
                }
                else {
                    addedPageCount++;
                }
            }

            //копируем страницы и словари. Эскизы пропускаем - пока что это не реализовано
            if (this.dirm.ids[i] in dependencies || this.dirm.flags[i] & 1) {
                dirm.flags.push(this.dirm.flags[i]);
                dirm.sizes.push(this.dirm.sizes[i]);
                dirm.ids.push(this.dirm.ids[i]);
                dirm.names.push(this.dirm.names[i]);
                dirm.titles.push(this.dirm.titles[i]);
                var cbs = new ByteStream(this.buffer, this.dirm.offsets[i], this.dirm.sizes[i]);
                chuckBS.push(cbs);
            }

            if (!(this.dirm.ids[i] in dependencies) && !(this.dirm.flags[i] & 1)) {
                console.log("Excess dict ", this.dirm.ids[i]);
            }
        }

        djvuWriter.writeDirmChunk(dirm);
        if (this.navm) {
            djvuWriter.writeChunk(this.navm);
        }

        for (var i = 0; i < chuckBS.length; i++) {
            djvuWriter.writeFormChunkBS(chuckBS[i]);
        }
        var newbuffer = djvuWriter.getBuffer();
        console.log("New Buffer size = ", newbuffer.byteLength);
        var doc = new DjVuDocument(newbuffer);
        Globals.Timer.end('sliceTime');
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
