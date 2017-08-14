'use strict';

class Bitmap {
    constructor(width, height) {
        var length = Math.ceil(width * height / 8); // число бит необходимых для кодировки черно-белого изображенияы
        this.height = height;
        this.width = width;
        this.innerArray = new Uint8Array(length);
    }
    get(i, j) {
        if (!this.hasRow(i) || j < 0 || j >= this.width) {
            return 0;
        }
        var tmp = i * this.width + j;
        var index = tmp >> 3;
        var bitIndex = tmp & 7;
        var mask = 128 >> bitIndex;
        var answ = (this.innerArray[index] & mask) ? 1 : 0;
        return answ;
    }
    set(i, j) { // сделать "пиксель" черным
        var tmp = i * this.width + j;
        var index = tmp >> 3;
        var bitIndex = tmp & 7;
        var mask = 128 >> bitIndex;
        this.innerArray[index] |= mask;
        return;
    }
    hasRow(r) {
        return r >= 0 && r < this.height;
    }

    removeEmptyEdges() {
        var bottomShift = 0;
        var topShift = 0;
        var leftShift = 0;
        var rightShift = 0;

        main_cycle: for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            bottomShift++;
        }

        main_cycle: for (var i = this.height - 1; i >= 0; i--) {
            for (var j = 0; j < this.width; j++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            topShift++;
        }

        main_cycle: for (var j = 0; j < this.width; j++) {
            for (var i = 0; i < this.height; i++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            leftShift++;
        }

        main_cycle: for (var j = this.width - 1; j >= 0; j--) {
            for (var i = 0; i < this.height; i++) {
                if (this.get(i, j)) {
                    break main_cycle;
                }
            }
            rightShift++;
        }

        if (topShift || bottomShift || leftShift || rightShift) {
            var newWidth = this.width - leftShift - rightShift;
            var newHeight = this.height - topShift - bottomShift;
            var newBitMap = new Bitmap(newWidth, newHeight);
            for (var i = bottomShift, p = 0; p < newHeight; p++ , i++) {
                for (var j = leftShift, q = 0; q < newWidth; q++ , j++) {
                    if (this.get(i, j)) {
                        newBitMap.set(p, q);
                    }
                }
            }
            return newBitMap;
        }

        return this;
    }
}
/*
// Более простой и гораздо менее эффективный класс.
class BitmapX {
    constructor(width, height) {
        this.height = height;
        this.width = width;
        this.innerArray = new Array(height);
        for (var i = 0; i < height; i++) {
            this.innerArray[i] = new Uint8Array(width);
        }
    }
    get(i, j) {
        if (!this.hasRow(i) || j < 0 || j >= this.width) {
            return 0;
        }
        
        return this.innerArray[i][j];
    }
    set(i, j) {
        this.innerArray[i][j] = 1;
        if (!this.get(i, j))
            throw new Error("descrepancy!!!");
        return;
    }
    hasRow(r) {
        return r >= 0 && r < this.height;
    }
}*/

class NumContext {
    constructor() {
        this.ctx = [0];
        this._left = null;
        this._right = null;
    }
    get left() {
        if (!this._left) {
            this._left = new NumContext();
        }
        return this._left;
    }
    get right() {
        if (!this._right) {
            this._right = new NumContext();
        }
        return this._right;
    }
}

class JB2Codec extends IFFChunk {
    constructor(bs) {
        super(bs);
        this.zp = new ZPDecoder(this.bs);
        this.directBitmapCtx = new Uint8Array(1024);
        this.refinementBitmapCtx = new Uint8Array(2048);
        this.offsetTypeCtx = [0];
        this.resetNumContexts();
    }

    resetNumContexts() {
        this.recordTypeCtx = new NumContext();
        this.imageSizeCtx = new NumContext();
        this.symbolWidthCtx = new NumContext();
        this.symbolHeightCtx = new NumContext();
        this.inheritDictSizeCtx = new NumContext();
        //гориз смещение
        this.hoffCtx = new NumContext();
        //вертикальное смещение
        this.voffCtx = new NumContext();
        //гориз смещение
        this.shoffCtx = new NumContext();
        //вертикальное смещение
        this.svoffCtx = new NumContext();
        this.symbolIndexCtx = new NumContext();
        this.symbolHeightDiffCtx = new NumContext();
        this.symbolWidthDiffCtx = new NumContext();
        this.commentLengthCtx = new NumContext();
        this.commentOctetCtx = new NumContext();

        this.horizontalAbsLocationCtx = new NumContext();
        this.verticalAbsLocationCtx = new NumContext();
    }

    decodeNumX(low, high, numctx) {
        var v = 0;
        var decision = 0;
        var range = 0xffffffff;

        if (low === high) {
            return low;
        }

        //phase 1
        decision = (low >= 0) || ((high >= 0) && this.zp.decode(numctx.ctx, 0));
        // раскодировали знак
        var negative = !decision;
        numctx = negative ? numctx.left : numctx.right;

        if (negative) { // переводим границы в положительную полуось
            var temp = -low - 1;
            low = -high - 1;
            high = temp;
        }

        //phase 2
        decision = (low > (v << 1) + 1) || ((high >= (v << 1) + 1) && this.zp.decode(numctx.ctx, 0));
        while (decision) {
            v += v + 1;
            numctx = numctx.right;
            decision = (low > (v << 1) + 1) || ((high >= (v << 1) + 1) && this.zp.decode(numctx.ctx, 0));
        }
        numctx = numctx.left;
        //phase 3
        range = (v + 1) >> 1;
        while (range) {
            decision = (low > v) || ((high >= (v + range)) && this.zp.decode(numctx.ctx, 0));
            v += decision ? range : 0;
            numctx = decision ? numctx.right : numctx.left;
            range >>= 1;
        }
        //phase 4
        return negative ? (-v - 1) : v;
    }

    decodeNum(low, high, numctx) {
        let negative = false;
        let cutoff;

        // Start all phases
        cutoff = 0;
        for (let phase = 1, range = 0xffffffff; range != 1;) {
            // encode
            let decision = (low >= cutoff) || ((high >= cutoff) && this.zp.decode(numctx.ctx, 0));
            // context for new bit
            numctx = decision ? numctx.right : numctx.left;
            // phase dependent part
            switch (phase) {
                case 1:
                    negative = !decision;
                    if (negative) {
                        let temp = - low - 1;
                        low = - high - 1;
                        high = temp;
                    }
                    phase = 2; cutoff = 1;
                    break;

                case 2:
                    if (!decision) {
                        phase = 3;
                        range = (cutoff + 1) / 2;
                        if (range == 1)
                            cutoff = 0;
                        else
                            cutoff -= range / 2;
                    }
                    else {
                        cutoff += cutoff + 1;
                    }
                    break;

                case 3:
                    range /= 2;
                    if (range != 1) {
                        if (!decision)
                            cutoff -= range / 2;
                        else
                            cutoff += range / 2;
                    }
                    else if (!decision) {
                        cutoff--;
                    }
                    break;
            }
        }
        return (negative) ? (- cutoff - 1) : cutoff;
    }

    toString() {
        var str = super.toString();
        return str;
    }

    decodeBitmap(width, height) {
        var bitmap = new Bitmap(width, height);
        /*for (let i = 0; i < height; i++) {
            bitmap[i] = new Uint8Array(width);
        }*/
        for (let i = height - 1; i >= 0; i--) {
            for (let j = 0; j < width; j++) {
                var ind = this.getCtxIndex(bitmap, i, j);
                this.zp.decode(this.directBitmapCtx, ind) ? bitmap.set(i, j) : 0;
            }
        }
        return bitmap;
    }

    getCtxIndex(bm, i, j) {
        var index = 0;
        let r = i + 2;
        if (bm.hasRow(r)) {
            index = ((bm.get(r, j - 1) || 0) << 9) | (bm.get(r, j) << 8) | ((bm.get(r, j + 1) || 0) << 7);
        }
        r--;
        if (bm.hasRow(r)) {
            index |= ((bm.get(r, j - 2) || 0) << 6) | ((bm.get(r, j - 1) || 0) << 5) |
                (bm.get(r, j) << 4) | ((bm.get(r, j + 1) || 0) << 3) | ((bm.get(r, j + 2) || 0) << 2);
        }
        index |= ((bm.get(i, j - 2) || 0) << 1) | (bm.get(i, j - 1) || 0);
        return index;
    }

    // don't forget to remove empty edges of the result bitmap before it is added to the dictionary
    decodeBitmapRef(width, height, mbm) {
        //current bitmap
        let cbm = new Bitmap(width, height);
        var alignInfo = this.alignBitmaps(cbm, mbm);
        for (let i = height - 1; i >= 0; i--) {
            for (let j = 0; j < width; j++) {
                this.zp.decode(this.refinementBitmapCtx,
                    this.getCtxIndexRef(cbm, mbm, alignInfo, i, j)) ? cbm.set(i, j) : 0;
            }
        }
        return cbm;
    }

    getCtxIndexRef(cbm, mbm, alignInfo, i, j) {
        var index = 0;
        let r = i + 1;
        if (cbm.hasRow(r)) {
            index = ((cbm.get(r, j - 1) || 0) << 10) | (cbm.get(r, j) << 9) | ((cbm.get(r, j + 1) || 0) << 8);
        }
        index |= (cbm.get(i, j - 1) || 0) << 7;

        r = i + alignInfo.rowshift + 1;
        let c = j + alignInfo.colshift;
        index |= mbm.hasRow(r) ? mbm.get(r, c) << 6 : 0;
        r--;
        if (mbm.hasRow(r)) {
            index |= ((mbm.get(r, c - 1) || 0) << 5) | (mbm.get(r, c) << 4) | ((mbm.get(r, c + 1) || 0) << 3);
        }
        r--;
        if (mbm.hasRow(r)) {
            index |= ((mbm.get(r, c - 1) || 0) << 2) | (mbm.get(r, c) << 1) | (mbm.get(r, c + 1) || 0);
        }
        return index;
    }

    alignBitmaps(cbm, mbm) {
        let cwidth = cbm.width - 1;
        let cheight = cbm.height - 1;
        let crow, ccol, mrow, mcol;
        crow = cheight >> 1;
        ccol = cwidth >> 1;
        mrow = (mbm.height - 1) >> 1;
        mcol = (mbm.width - 1) >> 1;
        return {
            'rowshift': mrow - crow,
            'colshift': mcol - ccol
        };
    }

    decodeComment() {
        var length = this.decodeNum(0, 262142, this.commentLengthCtx);
        var comment = new Uint8Array(length);
        for (let i = 0; i < length; comment[i++] = this.decodeNum(0, 255, this.commentOctetCtx)) { }
        return comment;
    }

    /**
     * Отладочная функция для просмотра символов.
     */
    drawBitmap(bm) {
        var image = document.createElement('canvas')
            .getContext('2d')
            .createImageData(bm.width, bm.height);
        for (let i = 0; i < bm.height; i++) {
            for (let j = 0; j < bm.width; j++) {
                let v = bm.get(i, j) ? 0 : 255;
                let index = ((bm.height - i - 1) * bm.width + j) * 4;
                image.data[index] = v;
                image.data[index + 1] = v;
                image.data[index + 2] = v;
                image.data[index + 3] = 255;

            }
        }
        // Globals.canvas.width = Globals.canvas.width;
        //Globals.canvasCtx.putImageData(image, 0, 0);
        Globals.drawImage(image);
    }
}
