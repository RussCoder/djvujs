'use strict';
class IWCodec extends IWCodecBaseClass {
    constructor() {
        super();
    }
    init(imageinfo) {
        // инициализируем на первой порции данных
        this.info = imageinfo;
        let blockCount = Math.ceil(this.info.width / 32) * Math.ceil(this.info.height / 32);
        this.blocks = new Array(blockCount);
        for (let i = 0; i < this.blocks.length; i++) {
            this.blocks[i] = new Block();
        }
    }
    decodeSlice(zp, imageinfo) {
        if (!this.info) {
            this.init(imageinfo);
        } else {
            this.info.slices = imageinfo.slices;
        }
        this.zp = zp;
        if (Globals.iwiw) {
            Globals.iwiw.encodeSlice();
        }
        if (!this.is_null_slice()) {
            // по блокам идем        
            for (var i = 0; i < this.blocks.length; i++) {
                var block = this.blocks[i];
                this.preliminaryFlagComputation(block);
                // четыре подхода декодирования
                if (this.blockBandDecodingPass(block, this.curband)) {
                    this.bucketDecodingPass(block, this.curband);
                    this.newlyActiveCoefficientDecodingPass(block, this.curband);
                }
                this.previouslyActiveCoefficientDecodingPass(block, this.curband);
            }
        }
        // уменьшаем шаги 
        this.finish_code_slice();
    }
    previouslyActiveCoefficientDecodingPass(block) {
        var boff = 0;
        var step = this.quant_hi[this.curband];
        var indices = this.getBandBuckets(this.curband);
        for (var i = indices.from; i <= indices.to; i++,
        boff++) {
            for (var j = 0; j < 16; j++) {
                if (this.coeffstate[boff][j] & this.ACTIVE) {
                    if (!this.curband) {
                        step = this.quant_lo[j];
                    }
                    var des = 0;
                    var coef = Math.abs(block.buckets[i][j]);
                    if (coef <= 3 * step) {
                        des = this.zp.decode(this.inreaseCoefCtx, 0);
                        coef += step >> 2;
                    } else {
                        des = this.zp.IWdecode();
                    }
                    if (!coef)
                        console.log("!!");
                    if (des) {
                        coef += step >> 1;
                    } else {
                        coef += -step + (step >> 1);
                    }
                    block.buckets[i][j] = block.buckets[i][j] < 0 ? -coef : coef;
                }
            }
        }
    }
    newlyActiveCoefficientDecodingPass(block, band) {
        //bucket offset
        var boff = 0;
        var indices = this.getBandBuckets(band);
        //проверка на 0 группу позже
        var step = this.quant_hi[this.curband];
        for (var i = indices.from; i <= indices.to; i++,
        boff++) {
            if (this.bucketstate[boff] & this.NEW) {
                var shift = 0;
                if (this.bucketstate[boff] & this.ACTIVE) {
                    shift = 8;
                }
                var bucket = block.buckets[i];
                var np = 0;
                for (var j = 0; j < 16; j++) {
                    if (this.coeffstate[boff][j] & this.UNK) {
                        np++;
                    }
                }
                for (var j = 0; j < 16; j++) {
                    if (this.coeffstate[boff][j] & this.UNK) {
                        var ip = Math.min(7, np);
                        var des = this.zp.decode(this.activateCoefCtx, shift + ip);
                        if (des) {
                            var sign = this.zp.IWdecode() ? -1 : 1;
                            np = 0;
                            if (!this.curband) {
                                step = this.quant_lo[j];
                            }
                            //todo сравнить нужно ли 2 слагаемое
                            bucket[j] = sign * (step + (step >> 1) - (step >> 3));
                        }
                        if (np) {
                            np--;
                        }
                    }
                }
            }
        }
    }
    bucketDecodingPass(block, band) {
        var indices = this.getBandBuckets(band);
        // смещение сегмента
        var boff = 0;
        for (var i = indices.from; i <= indices.to; i++,
        boff++) {
            // проверка потенциального флага сегмента         
            if (!(this.bucketstate[boff] & this.UNK)) {
                continue;
            }
            //вычисляем номер контекста
            var n = 0;
            if (band) {
                var t = 4 * i;
                for (var j = t; j < t + 4; j++) {
                    if (block.getCoef(j)) {
                        n++;
                    }
                }
                if (n === 4) {
                    n--;
                }
            }
            if (this.bbstate & this.ACTIVE) {
                //как и + 4
                n |= 4;
            }
            if (this.zp.decode(this.decodeCoefCtx, n + band * 8)) {
                this.bucketstate[boff] |= this.NEW;
            }
        }
    }
    blockBandDecodingPass() {
        var indices = this.getBandBuckets(this.curband);
        var bcount = indices.to - indices.from + 1;
        if (bcount < 16 || (this.bbstate & this.ACTIVE)) {
            this.bbstate |= this.NEW;
        } else if (this.bbstate & this.UNK) {
            if (this.zp.decode(this.decodeBucketCtx, 0)) {
                this.bbstate |= this.NEW;
            }
        }
        return this.bbstate & this.NEW;
    }
    preliminaryFlagComputation(block) {
        this.bbstate = 0;
        var bstatetmp = 0;
        var indices = this.getBandBuckets(this.curband);
        if (this.curband) {
            //смещение сегмента в массиве флагов
            var boff = 0;
            for (var j = indices.from; j <= indices.to; j++,
            boff++) {
                bstatetmp = 0;
                var bucket = block.buckets[j];
                for (var k = 0; k < bucket.length; k++) {
                    //var index = k + 16 * boff;
                    if (bucket[k] === 0) {
                        this.coeffstate[boff][k] = this.UNK;
                    } else {
                        this.coeffstate[boff][k] = this.ACTIVE;
                    }
                    bstatetmp |= this.coeffstate[boff][k];
                }
                this.bucketstate[boff] = bstatetmp;
                this.bbstate |= bstatetmp;
            }
        } else {
            //если нулевая группа            
            var bucket = block.buckets[0];
            for (var k = 0; k < bucket.length; k++) {
                //если шаг в допустимых пределах
                if (this.coeffstate[0][k] !== this.ZERO) {
                    if (bucket[k] === 0) {
                        this.coeffstate[0][k] = this.UNK;
                    } else {
                        this.coeffstate[0][k] = this.ACTIVE;
                    }
                }
                bstatetmp |= this.coeffstate[0][k];
            }
            this.bucketstate[0] = bstatetmp;
            this.bbstate |= bstatetmp;
        }
        /*block.activeBandFlags[this.curband] = 0;
        block.potentialBandFlags[this.curband] = 0;
        for (var j = indices.from; j <= indices.to; j++) {
            block.activeBandFlags[this.curband] = block.activeBucketFlags[j] || block.activeBandFlags[this.curband];
            block.potentialBandFlags[this.curband] = block.potentialBandFlags[this.curband] || block.potentialBucketFlags[j];
        }
        
        
        var indices = this.getBandBuckets(this.curband);
        for (let j = indices.from; j <= indices.to; j++) {
            let bucket = block.buckets[j];
            //снимаем флаги для тукущего ведра
            block.potentialBucketFlags[j] = 0;
            block.activeBucketFlags[j] = 0;
            
            for (let k = 0; k < bucket.length; k++) {
                let index = k + 16 * j;
                let step = this.getStep(index);
                //опускаем все флаги
                block.activeCoefFlags[index] = 0;
                block.potentialCoefFlags[index] = 0;
                
                if (step === 0 || step >= 0x8000) {
                    block.activeCoefFlags[index] = 0;
                    block.potentialCoefFlags[index] = 0;
                } 
                else {
                    if (bucket[k] === 0) {
                        block.potentialCoefFlags[index] = 1;
                        block.potentialBucketFlags[j] = 1;
                    } 
                    else {
                        block.activeCoefFlags[index] = 1;
                        block.activeBucketFlags[j] = 1;
                    }
                }
            }
        }
        
        block.activeBandFlags[this.curband] = 0;
        block.potentialBandFlags[this.curband] = 0;
        for (let j = indices.from; j <= indices.to; j++) {
            block.activeBandFlags[this.curband] = block.activeBucketFlags[j] || block.activeBandFlags[this.curband];
            block.potentialBandFlags[this.curband] = block.potentialBandFlags[this.curband] || block.potentialBucketFlags[j];
        }
    */
    }
    getBytemap(noInverse) {
        var fullWidth = Math.ceil(this.info.width / 32) * 32;
        var fullHeight = Math.ceil(this.info.height / 32) * 32;
        var blockRows = Math.ceil(this.info.height / 32);
        var blockCols = Math.ceil(this.info.width / 32);
        // полный двумерный массив пикселей
        var bitmap = new Array(fullHeight);
        for (var i = 0; i < fullHeight; i++) {
            bitmap[i] = new Float32Array(fullWidth);
        }
        for (var r = 0; r < blockRows; r++) {
            for (var c = 0; c < blockCols; c++) {
                let block = this.blocks[r * blockCols + c];
                for (var i = 0; i < 1024; i++) {
                    /*var bits = [];
                    for (let j = 0; j < 10; j++) {
                        bits.push((i & Math.pow(2, j)) >> j);
                    }
                    let row = 16 * bits[1] + 8 * bits[3] + 4 * bits[5] + 2 * bits[7] + bits[9];
                    let col = 16 * bits[0] + 8 * bits[2] + 4 * bits[4] + 2 * bits[6] + bits[8];*/
                    bitmap[this.zigzagRow[i] + 32 * r][this.zigzagCol[i] + 32 * c] = block.getCoef(i);
                }
            }
        }
        if (!noInverse) {
            this.inverseWaveletTransform(bitmap);
        }
        return bitmap;
    }
    inverseWaveletTransform(bitmap) {
        //return;
        var s = 16;
        while (s) {
            //для столбцов
            var kmax = Math.floor((this.info.height - 1) / s);
            for (var i = 0; i < this.info.width; i += s) {
                //Lifting
                for (var k = 0; k <= kmax; k += 2) {
                    var a, b, c, d;
                    //-------------
                    if (k - 1 < 0) {
                        a = 0;
                    } else {
                        a = bitmap[(k - 1) * s][i];
                    }
                    //-------------
                    if (k - 3 < 0) {
                        c = 0;
                    } else {
                        c = bitmap[(k - 3) * s][i];
                    }
                    //-------------
                    if (k + 1 > kmax) {
                        b = 0;
                    } else {
                        b = bitmap[(k + 1) * s][i];
                    }
                    //-------------
                    if (k + 3 > kmax) {
                        d = 0;
                    } else {
                        d = bitmap[(k + 3) * s][i];
                    }
                    //-------------
                    bitmap[k * s][i] -= (9 * (a + b) - (c + d) + 16) >> 5;
                }
                //Prediction 
                for (var k = 1; k <= kmax; k += 2) {
                    if ((k - 3 >= 0) && (k + 3 <= kmax)) {
                        bitmap[k * s][i] += (9 * (bitmap[(k - 1) * s][i] + bitmap[(k + 1) * s][i]) - (bitmap[(k - 3) * s][i] + bitmap[(k + 3) * s][i]) + 8) >> 4;
                    } else if (k + 1 <= kmax) {
                        bitmap[k * s][i] += (bitmap[(k - 1) * s][i] + bitmap[(k + 1) * s][i] + 1) >> 1;
                    } else {
                        bitmap[k * s][i] += bitmap[(k - 1) * s][i];
                    }
                }
            }
            //для строк
            kmax = Math.floor((this.info.width - 1) / s);
            for (var i = 0; i < this.info.height; i += s) {
                //Lifting
                for (var k = 0; k <= kmax; k += 2) {
                    var a, b, c, d;
                    if (k - 1 < 0) {
                        a = 0;
                    } else {
                        a = bitmap[i][(k - 1) * s];
                    }
                    if (k - 3 < 0) {
                        c = 0;
                    } else {
                        c = bitmap[i][(k - 3) * s];
                    }
                    if (k + 1 > kmax) {
                        b = 0;
                    } else {
                        b = bitmap[i][(k + 1) * s];
                    }
                    if (k + 3 > kmax) {
                        d = 0;
                    } else {
                        d = bitmap[i][(k + 3) * s];
                    }
                    bitmap[i][k * s] -= (9 * (a + b) - (c + d) + 16) >> 5;
                }
                //Prediction 
                for (var k = 1; k <= kmax; k += 2) {
                    if ((k - 3 >= 0) && (k + 3 <= kmax)) {
                        bitmap[i][k * s] += (9 * (bitmap[i][(k - 1) * s] + bitmap[i][(k + 1) * s]) - (bitmap[i][(k - 3) * s] + bitmap[i][(k + 3) * s]) + 8) >> 4;
                    } else if (k + 1 <= kmax) {
                        bitmap[i][k * s] += (bitmap[i][(k - 1) * s] + bitmap[i][(k + 1) * s] + 1) >> 1;
                    } else {
                        bitmap[i][k * s] += bitmap[i][(k - 1) * s];
                    }
                }
            }
            s >>= 1;
            // деление на 2
        }
    }
}
