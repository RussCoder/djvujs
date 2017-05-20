'use strict';

// структура для вычисления позиции символов на картинке
class Baseline {
    constructor() {
        this.arr = new Array(3);
    }
    add(val) {
        this.arr.shift();
        this.arr.push(val);
    }
    getVal() {
        if (!this.arr[0]) {
            return this.arr[1] ? this.arr[1] : this.arr[2];
        }
        if (this.arr[0] >= this.arr[1] && this.arr[0] <= this.arr[2]
            || this.arr[0] <= this.arr[1] && this.arr[0] >= this.arr[2]) {
            return this.arr[0];
        }
        else if (this.arr[1] >= this.arr[0] && this.arr[1] <= this.arr[2]
            || this.arr[1] <= this.arr[0] && this.arr[1] >= this.arr[2]) {
            return this.arr[1];
        }
        else {
            return this.arr[2];
        }
    }
    reinit() {
        this.arr[0] = this.arr[1] = this.arr[2] = 0;
    }
}

class JB2Image extends JB2Codec {
    constructor(bs) {
        super(bs);
        //словарь (может быть заменен диной словаря на некоторое время)
        this.dict = [];
        this.init();
    }

    //раскодируем первую запись в потоке
    init() {
        let type = this.decodeNum(0, 11, this.recordTypeCtx);
        if (type == 9) {
            // длина словаря
            this.dict = this.decodeNum(0, 262142, this.inheritDictSizeCtx);
            //тип следующей записи (должен быть 0)
            type = this.decodeNum(0, 11, this.recordTypeCtx);
            //console.log("Zero", type);
        }

        this.width = this.decodeNum(0, 262142, this.imageSizeCtx) || 200;
        this.height = this.decodeNum(0, 262142, this.imageSizeCtx) || 200;
        // инициализация когда будет надо
        this.bitmap = false;
        //позиции первого и предыдущего символа на строке
        this.lastLeft = 0;
        this.lastBottom = this.height - 1;
        this.firstLeft = -1; // получено экспериментально, чтобы не вычитать 1 каждый раз из x как это делается в javadjvu
        this.firstBottom = this.height - 1;
        // флаг всегда должен быть = 0 
        let flag = this.zp.decode([0], 0);
        if (flag) {
            throw new Error("Bad flag!!!");
        }

        this.baseline = new Baseline();
    }

    toString() {
        let str = super.toString();
        str += "{width: " + this.width + ", height: " + this.height + '}\n';
        return str;
    }

    decode(djbz) {
        // если затребован словарь 
        if (+this.dict) {
            //декодируем словарь (он может быть уже декодирован)
            djbz.decode();
            //копируем затребованное число символов
            this.dict = djbz.dict.slice(0, this.dict);
        }
        var type = this.decodeNum(0, 11, this.recordTypeCtx);
        let width, hoff, voff, flag;
        let height, index;
        let bm;
        var count = 0; // degug code
        //var maxInterationNumber = 370;
        while (type !== 11 /*&& count < maxInterationNumber*/) { // 11 means "End of data"
            //count++;
            // DjVu.IS_DEBUG && console.log('count', count);
            // DjVu.IS_DEBUG && console.log(type);
            switch (type) {

                case 1: // New symbol, add to image and library 
                    width = this.decodeNum(0, 262142, this.symbolWidthCtx);
                    height = this.decodeNum(0, 262142, this.symbolHeightCtx);
                    bm = this.decodeBitmap(width, height);
                    //this.drawBitmap(bm);
                    var coords = this.decodeSymbolCoords(bm.width, bm.height);
                    this.copyToBitmap(bm, coords.x, coords.y);
                    this.dict.push(bm);
                    break;

                case 2: // New symbol, add to library only
                    width = this.decodeNum(0, 262142, this.symbolWidthCtx);
                    height = this.decodeNum(0, 262142, this.symbolHeightCtx);
                    bm = this.decodeBitmap(width, height);
                    this.dict.push(bm);
                    break;

                case 3: // New symbol, add to image only 
                    width = this.decodeNum(0, 262142, this.symbolWidthCtx);
                    height = this.decodeNum(0, 262142, this.symbolHeightCtx);
                    bm = this.decodeBitmap(width, height);
                    //this.drawBitmap(bm);
                    var coords = this.decodeSymbolCoords(bm.width, bm.height);
                    this.copyToBitmap(bm, coords.x, coords.y);
                    break;

                case 4: // Matched symbol with refinement, add to image and library
                    index = this.decodeNum(0, this.dict.length - 1, this.symbolIndexCtx);
                    var widthdiff = this.decodeNum(-262143, 262142, this.symbolWidthDiffCtx);
                    var heightdiff = this.decodeNum(-262143, 262142, this.symbolHeightDiffCtx);
                    var mbm = this.dict[index];
                    var cbm = this.decodeBitmapRef(mbm.width + widthdiff, heightdiff + mbm.height, mbm);
                    var coords = this.decodeSymbolCoords(cbm.width, cbm.height);
                    this.copyToBitmap(cbm, coords.x, coords.y);
                    //this.drawBitmap(cbm);
                    this.dict.push(cbm);
                    break;

                case 5: // Matched symbol with refinement, add to library only
                    index = this.decodeNum(0, this.dict.length - 1, this.symbolIndexCtx);
                    widthdiff = this.decodeNum(-262143, 262142, this.symbolWidthDiffCtx);
                    heightdiff = this.decodeNum(-262143, 262142, this.symbolHeightDiffCtx);
                    var mbm = this.dict[index];
                    var cbm = this.decodeBitmapRef(mbm.width + widthdiff, heightdiff + mbm.height, mbm);
                    this.dict.push(cbm);
                    break;

                case 6: // Matched symbol with refinement, add to image only
                    index = this.decodeNum(0, this.dict.length - 1, this.symbolIndexCtx);
                    var widthdiff = this.decodeNum(-262143, 262142, this.symbolWidthDiffCtx);
                    var heightdiff = this.decodeNum(-262143, 262142, this.symbolHeightDiffCtx);
                    var mbm = this.dict[index];
                    var cbm = this.decodeBitmapRef(mbm.width + widthdiff, heightdiff + mbm.height, mbm);
                    var coords = this.decodeSymbolCoords(cbm.width, cbm.height);
                    this.copyToBitmap(cbm, coords.x, coords.y);
                    break;

                case 7: // Matched symbol, copy to image without refinement
                    index = this.decodeNum(0, this.dict.length - 1, this.symbolIndexCtx);
                    bm = this.dict[index];
                    var coords = this.decodeSymbolCoords(bm.width, bm.height);
                    this.copyToBitmap(bm, coords.x, coords.y);
                    //this.drawBitmap(bm);
                    break;

                case 8: // Non-symbol data 
                    width = this.decodeNum(0, 262142, this.symbolWidthCtx);
                    height = this.decodeNum(0, 262142, this.symbolHeightCtx);
                    bm = this.decodeBitmap(width, height);
                    //this.drawBitmap(bm);
                    var coords = this.decodeAbsoluteLocationCoords(bm.width, bm.height);
                    this.copyToBitmap(bm, coords.x, coords.y);
                    break;

                case 9: // Numcoder reset
                    console.log("RESET IMAGE");
                    this.resetNumContexts();
                    break;

                default:
                    throw new Error("Unsupported type in JB2Image: " + type);
            }


            type = this.decodeNum(0, 11, this.recordTypeCtx);

            /*if( DjVu.IS_DEBUG && count > maxInterationNumber -50 ) {
                console.log(type);
            }*/
            if (type > 11) {
                console.error("TYPE ERROR " + type);
                break;
            }
        }
        /*if(DjVu.IS_DEBUG && count >= maxInterationNumber) {
            console.warn("Too many inerations in JB2 decoding!");
        } */
    }

    decodeAbsoluteLocationCoords(width, height) {
        var left = this.decodeNum(1, this.width, this.horizontalAbsLocationCtx);
        var top = this.decodeNum(1, this.height, this.verticalAbsLocationCtx);
        return {
            x: left,
            y: top - height
        }
    }

    decodeSymbolCoords(width, height) {
        var flag = this.zp.decode(this.offsetTypeCtx, 0); // флаг новой строки
        var horizontalOffsetCtx = flag ? this.hoffCtx : this.shoffCtx;
        var verticalOffsetCtx = flag ? this.voffCtx : this.svoffCtx;
        var horizontalOffset = this.decodeNum(-262143, 262142, horizontalOffsetCtx);
        var verticalOffset = this.decodeNum(-262143, 262142, verticalOffsetCtx);
        var x, y;
        if (flag) {
            x = this.firstLeft + horizontalOffset;
            y = this.firstBottom + verticalOffset - height + 1;
            this.firstLeft = x;
            this.firstBottom = y;
            this.baseline.reinit();
        }
        else {
            x = this.lastRight + horizontalOffset;
            y = this.baseline.getVal() + verticalOffset;
        }
        this.baseline.add(y);
        this.lastRight = x + width - 1;
        return {
            'x': x,  // не вычитаем 1, так как firstLeft инициализирован -1, а Baseline и так выдает верный результат
            'y': y
        };

    }

    // принимает битмап и координаты левого нижнего угла в обычной системе координат
    copyToBitmap(bm, x, y) {
        if (!this.bitmap) {
            this.bitmap = new Bitmap(this.width, this.height);
        }

        for (var i = y, k = 0; k < bm.height; k++ , i++) {
            for (var j = x, t = 0; t < bm.width; t++ , j++) {
                if (bm.get(k, t)) {
                    this.bitmap.set(i, j);
                }
            }
        }
    }

    getImage() {
        var time = performance.now();
        var image = new ImageData(this.width, this.height);
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                var v = this.bitmap.get(i, j) ? 0 : 255;
                var index = ((this.height - i - 1) * this.width + j) * 4;
                image.data[index] = v;
                image.data[index + 1] = v;
                image.data[index + 2] = v;
                image.data[index + 3] = 255;
            }
        }
        DjVu.IS_DEBUG && console.log("JB2Image creating time = ", performance.now() - time);
        return image;
    }
}
