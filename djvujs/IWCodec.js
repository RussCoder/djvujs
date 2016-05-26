'use strict';

class IWCodec {
    constructor() {
        
        this.steps = [0x004000, 
        0x008000, 0x008000, 0x010000, 
        0x010000, 0x010000, 0x020000, 
        0x020000, 0x020000, 0x040000, 
        0x040000, 0x040000, 0x080000, 
        0x040000, 0x040000, 0x080000];
        
        this.decodeBucketCtx = new Uint8Array(1);
        this.decodeCoefCtx = new Uint8Array(80);
        this.activateCoefCtx = new Uint8Array(16);
        this.inreaseCoefCtx = new Uint8Array(1);
        this.curBand = 0;
        
        this.initTables();
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
        
        // по slice'ам идем
        this.preliminaryFlagComputation(this.curBand);
        for (let i = 0; i < this.blocks.length; i++) {
            let block = this.blocks[i];
            
            // четыре подхода декодирования
            if (this.blockBandDecodingPass(block, this.curBand)) {
                this.bucketDecodingPass(block, this.curBand);
                this.newlyActiveCoefficientDecodingPass(block, this.curBand);
            }
            this.previouslyActiveCoefficientDecodingPass(block, this.curBand);
        }
        // уменьшаем шаги 
        this.reduceSteps(this.curBand);
        this.curBand++;
        if (this.curBand === 10) {
            this.curBand = 0;
        }
    }
    
    //уменьшение шага после обработки одной порции данных
    reduceSteps(band) {
        if (band === 0) {
            for (let i = 0; i <= 6; i++) {
                this.steps[i] = Math.floor(this.steps[i] / 2);
            }
        } 
        else {
            this.steps[band + 6] = Math.floor(this.steps[band + 6] / 2);
        }
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
            var n = 0;
            var shift = 0;
            if (block.activeBandFlags[band]) {
                shift = 4;
            }
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
            block.coefDecodingFlags[i] = this.zpcoder.decode(this.decodeCoefCtx, shift + n + band * 8);
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
    
    preliminaryFlagComputation(band) {
        var indices = this.getBandBuckets(band);
        for (let i = 0; i < this.blocks.length; i++) {
            let block = this.blocks[i];
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
            
            block.activeBandFlags[band] = 0;
            block.potentialBandFlags[band] = 0;
            for (let j = indices.from; j <= indices.to; j++) {
                block.activeBandFlags[band] = block.activeBucketFlags[j] || block.activeBandFlags[band];
                block.potentialBandFlags[band] = block.potentialBandFlags[band] || block.potentialBucketFlags[j];
            }        
        }
    }
    
    getBandBuckets(band) {
        let a = 0;
        let b = 0;
        switch (band) {
        case 0:
            break;
        case 1:
            a = 1;
            b = 1;
            break;
        case 2:
            a = 2;
            b = 2;
            break;
        case 3:
            a = 3;
            b = 3;
            break;
        case 4:
            a = 4;
            b = 7;
            break;
        case 5:
            a = 8;
            b = 11;
            break;
        case 6:
            a = 12;
            b = 15;
            break;
        case 7:
            a = 16;
            b = 31;
            break;
        case 8:
            a = 32;
            b = 47;
            break;
        case 9:
            a = 48;
            b = 63;
            break;
        default:
            throw new Error("Incorrect band index: " + band);
            break;
        }
        return {
            from: a,
            to: b
        };
    }
    
    //возвращает шаг коэффициентов по их индексу от 0 до 1023
    getStep(i) {
        if (i === 0) {
            return this.steps[0];
        } else if (i === 1) {
            return this.steps[1];
        } else if (i === 2) {
            return this.steps[2];
        } else if (i === 3) {
            return this.steps[3];
        } else if (i >= 4 && i <= 7) {
            return this.steps[4];
        } else if (i >= 8 && i <= 11) {
            return this.steps[5];
        } else if (i >= 12 && i <= 15) {
            return this.steps[6];
        } else if (i >= 16 && i <= 31) {
            return this.steps[7];
        } else if (i >= 32 && i <= 47) {
            return this.steps[8];
        } else if (i >= 48 && i <= 63) {
            return this.steps[9];
        } else if (i >= 64 && i <= 127) {
            return this.steps[10];
        } else if (i >= 128 && i <= 191) {
            return this.steps[11];
        } else if (i >= 192 && i <= 255) {
            return this.steps[12];
        } else if (i >= 256 && i <= 511) {
            return this.steps[13];
        } else if (i >= 512 && i <= 767) {
            return this.steps[14];
        } else if (i >= 768 && i <= 1023) {
            return this.steps[15];
        } 
        else {
            throw new Error("Too big coefficient index!");
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
    
    initTables() {
        this.zigzagRow = new Uint8Array(
        [0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 
        0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 
        4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 
        4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 
        0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 
        0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 
        4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 
        4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 
        2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 
        2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 
        6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 
        6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 
        2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 
        2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 
        6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 
        6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 
        0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 
        0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 
        4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 
        4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 
        0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 
        0, 0, 16, 16, 0, 0, 16, 16, 8, 8, 24, 24, 8, 8, 24, 24, 
        4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 
        4, 4, 20, 20, 4, 4, 20, 20, 12, 12, 28, 28, 12, 12, 28, 28, 
        2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 
        2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 
        6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 
        6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 
        2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 
        2, 2, 18, 18, 2, 2, 18, 18, 10, 10, 26, 26, 10, 10, 26, 26, 
        6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 
        6, 6, 22, 22, 6, 6, 22, 22, 14, 14, 30, 30, 14, 14, 30, 30, 
        1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 
        1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 
        5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 
        5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 
        1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 
        1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 
        5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 
        5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 
        3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 
        3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 
        7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 
        7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 
        3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 
        3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 
        7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 
        7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 
        1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 
        1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 
        5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 
        5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 
        1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 
        1, 1, 17, 17, 1, 1, 17, 17, 9, 9, 25, 25, 9, 9, 25, 25, 
        5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 
        5, 5, 21, 21, 5, 5, 21, 21, 13, 13, 29, 29, 13, 13, 29, 29, 
        3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 
        3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 
        7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 
        7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 
        3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 
        3, 3, 19, 19, 3, 3, 19, 19, 11, 11, 27, 27, 11, 11, 27, 27, 
        7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31, 
        7, 7, 23, 23, 7, 7, 23, 23, 15, 15, 31, 31, 15, 15, 31, 31]);
        
        this.zigzagCol = new Uint8Array(
        [0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 
        4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 
        0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 
        4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 
        2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 
        6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 
        2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 
        6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 
        0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 
        4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 
        0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 
        4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 
        2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 
        6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 
        2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 
        6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 
        1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 
        5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 
        1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 
        5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 
        3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 
        7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 
        3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 
        7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 
        1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 
        5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 
        1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 
        5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 
        3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 
        7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 
        3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 
        7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 
        0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 
        4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 
        0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 
        4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 
        2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 
        6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 
        2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 
        6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 
        0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 
        4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 
        0, 16, 0, 16, 8, 24, 8, 24, 0, 16, 0, 16, 8, 24, 8, 24, 
        4, 20, 4, 20, 12, 28, 12, 28, 4, 20, 4, 20, 12, 28, 12, 28, 
        2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 
        6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 
        2, 18, 2, 18, 10, 26, 10, 26, 2, 18, 2, 18, 10, 26, 10, 26, 
        6, 22, 6, 22, 14, 30, 14, 30, 6, 22, 6, 22, 14, 30, 14, 30, 
        1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 
        5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 
        1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 
        5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 
        3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 
        7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 
        3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 
        7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 
        1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 
        5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 
        1, 17, 1, 17, 9, 25, 9, 25, 1, 17, 1, 17, 9, 25, 9, 25, 
        5, 21, 5, 21, 13, 29, 13, 29, 5, 21, 5, 21, 13, 29, 13, 29, 
        3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 
        7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31, 
        3, 19, 3, 19, 11, 27, 11, 27, 3, 19, 3, 19, 11, 27, 11, 27, 
        7, 23, 7, 23, 15, 31, 15, 31, 7, 23, 7, 23, 15, 31, 15, 31]);
    }

}

class Block {
    constructor() {
        this.buckets = [];
        for (var i = 0; i < 64; i++) {
            this.buckets.push(new Int16Array(16));
        }
        this.activeCoefFlags = new Uint8Array(1024);
        this.potentialCoefFlags = new Uint8Array(1024);
        this.activeBucketFlags = new Uint8Array(64);
        this.potentialBucketFlags = new Uint8Array(64);
        this.coefDecodingFlags = new Uint8Array(64);
        this.activeBandFlags = new Uint8Array(10);
        this.potentialBandFlags = new Uint8Array(10);
    }
    
    getCoef(n) {
        let b = n >> 4;
        let i = n % 16;
        return this.buckets[b][i];
    }
}
