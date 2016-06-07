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
        } 
        else {
            this.info.slices = imageinfo.slices;
        }
        this.zpcoder = zp;
        
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
    
    
    
    previouslyActiveCoefficientDecodingPass(block, band) {
        var indices = this.getBandBuckets(band);
        for (var i = indices.from; i <= indices.to; i++) {
            for (var j = 0; j < 16; j++) {
                var index = j + i * 16;
                if (block.activeCoefFlags[index]) {
                    var step = this.getStep(index);
                    var des = 0;
                    var coef = Math.abs(block.buckets[i][j]);
                    if (coef <= 3 * step) {
                        des = this.zpcoder.decode(this.inreaseCoefCtx, 0);
                        //djvulibre не делает этого
                        coef += step >> 2;
                    } 
                    else {
                        des = this.zpcoder.decode();
                    }
                    
                    if (!coef)
                        console.log("!!");
                    
                    if (des) {
                        coef += step >> 1;
                    } 
                    else {
                        coef += -step + (step >> 1);
                    }
                    block.buckets[i][j] = block.buckets[i][j] < 0 ? -coef : coef;
                }
            }
        }
    }
    
    newlyActiveCoefficientDecodingPass(block, band) {
        var indices = this.getBandBuckets(band);
        for (let i = indices.from; i <= indices.to; i++) {
            if (block.coefDecodingFlags[i]) {
                let shift = 0;
                if (block.activeBucketFlags[i]) {
                    shift = 8;
                }
                let bucket = block.buckets[i];
                let np = 0;
                for (let j = 0; j < 16; j++) {
                    if (block.potentialCoefFlags[j + i * 16]) {
                        np++;
                    }
                }
                
                for (let j = 0; j < 16; j++) {
                    let index = j + i * 16;
                    if (block.potentialCoefFlags[index]) {
                        let ip = Math.min(7, np);
                        let des = this.zpcoder.decode(this.activateCoefCtx, shift + ip);
                        if (des) {
                            let sign = this.zpcoder.decode() ? -1 : 1;
                            np = 0;
                            let step = this.getStep(index);
                            //todo сравнить нужно ли 2 слагаемое
                            bucket[j] = sign * (step + (step >> 1) - (step >> 3));
                            //console.log("!");
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
        for (var i = indices.from; i <= indices.to; i++) {
            // опускаем флаг
            block.coefDecodingFlags[i] = 0;
            // проверка потенциального флага ведра         
            if (!block.potentialBucketFlags[i]) {
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
            if (block.activeBandFlags[band]) {
                //как и + 4
                n |= 4;
            }
            block.coefDecodingFlags[i] = this.zpcoder.decode(this.decodeCoefCtx, n + band * 8);
        }
    }
    
    blockBandDecodingPass(block, band) {
        let indices = this.getBandBuckets(band);
        let bcount = indices.to - indices.from + 1;
        if (bcount < 16 || block.activeBandFlags[band])
            return 1;
        if (block.potentialBandFlags[band]) {
            return this.zpcoder.decode(this.decodeBucketCtx, 0);
        }
        //console.log("//");
        return 0;
    }
    
    preliminaryFlagComputation(block) {
        var indices = this.getBandBuckets(this.curband);
        
        for (var j = indices.from; j <= indices.to; j++) {
            var bucket = block.buckets[j];
            //снимаем флаги для тукущего ведра
            block.potentialBucketFlags[j] = 0;
            block.activeBucketFlags[j] = 0;
            
            for (var k = 0; k < bucket.length; k++) {
                var index = k + 16 * j;
                var step = this.getStep(index);
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
        for (var j = indices.from; j <= indices.to; j++) {
            block.activeBandFlags[this.curband] = block.activeBucketFlags[j] || block.activeBandFlags[this.curband];
            block.potentialBandFlags[this.curband] = block.potentialBandFlags[this.curband] || block.potentialBucketFlags[j];
        }
    
    }
    
    
    getBytemap(noInverse) {
        
        let fullWidth = Math.ceil(this.info.width / 32) * 32;
        let fullHeight = Math.ceil(this.info.height / 32) * 32;
        
        let blockRows = Math.ceil(this.info.height / 32);
        let blockCols = Math.ceil(this.info.width / 32);
        // полный двумерный массив пикселей
        var bitmap = new Array(fullHeight);
        for (let i = 0; i < fullHeight; i++) {
            bitmap[i] = new Float32Array(fullWidth);
        }
        
        for (let r = 0; r < blockRows; r++) {
            for (let c = 0; c < blockCols; c++) {
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
        return;
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
                    } 
                    else {
                        a = bitmap[(k - 1) * s][i];
                    }
                    //-------------
                    if (k - 3 < 0) {
                        c = 0;
                    } 
                    else {
                        c = bitmap[(k - 3) * s][i];
                    }
                    //-------------
                    if (k + 1 > kmax) {
                        b = 0;
                    } 
                    else {
                        b = bitmap[(k + 1) * s][i];
                    }
                    //-------------
                    if (k + 3 > kmax) {
                        d = 0;
                    } 
                    else {
                        d = bitmap[(k + 3) * s][i];
                    }
                    //-------------
                    bitmap[k * s][i] -= (9 * (a + b) - (c + d) + 16) >> 5;
                }
                //Prediction 
                for (var k = 1; k <= kmax; k += 2) {
                    if ((k - 3 >= 0) && (k + 3 <= kmax)) {
                        bitmap[k * s][i] += (9 * (bitmap[(k - 1) * s][i] 
                        + bitmap[(k + 1) * s][i]) - (bitmap[(k - 3) * s][i] 
                        + bitmap[(k + 3) * s][i]) + 8) >> 4;
                    } 
                    else if (k + 1 <= kmax) {
                        bitmap[k * s][i] += (bitmap[(k - 1) * s][i] 
                        + bitmap[(k + 1) * s][i] + 1) >> 1;
                    } 
                    else {
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
                    } 
                    else {
                        a = bitmap[i][(k - 1) * s];
                    }
                    if (k - 3 < 0) {
                        c = 0;
                    } 
                    else {
                        c = bitmap[i][(k - 3) * s];
                    }
                    if (k + 1 > kmax) {
                        b = 0;
                    } 
                    else {
                        b = bitmap[i][(k + 1) * s];
                    }
                    if (k + 3 > kmax) {
                        d = 0;
                    } 
                    else {
                        d = bitmap[i][(k + 3) * s];
                    }
                    bitmap[i][k * s] -= (9 * (a + b) - (c + d) + 16) >> 5;
                }
                //Prediction 
                for (var k = 1; k <= kmax; k += 2) {
                    if ((k - 3 >= 0) && (k + 3 <= kmax)) {
                        bitmap[i][k * s] += (9 * (bitmap[i][(k - 1) * s] 
                        + bitmap[i][(k + 1) * s]) - (bitmap[i][(k - 3) * s] 
                        + bitmap[i][(k + 3) * s]) + 8) >> 4;
                    } 
                    else if (k + 1 <= kmax) {
                        bitmap[i][k * s] += (bitmap[i][(k - 1) * s] 
                        + bitmap[i][(k + 1) * s] + 1) >> 1;
                    } 
                    else {
                        bitmap[i][k * s] += bitmap[i][(k - 1) * s];
                    }
                }
            }
            
            s >>= 1;
            // деление на 2
        }
    }
}
