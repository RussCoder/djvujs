'use strict';

class IWImageWriter extends IWCodecBaseClass {
    constructor(imageData) {
        super();
        this.imageData = imageData;
        this.bs = new ByteStreamWriter(10 * 1024);
        this.zp = new ZPEncoder(this.bs);
    }
    
    get width() {
        return this.imageData.width;
    }
    
    get height() {
        return this.imageData.height;
    }
    
    RGBtoY() {
        var rmul = new Int32Array(256);
        var gmul = new Int32Array(256);
        var bmul = new Int32Array(256);
        var rgb_to_ycc = 
        [[0.304348, 0.608696, 0.086956], 
        [0.463768, -0.405797, -0.057971], 
        [-0.173913, -0.347826, 0.521739]];
        
        var data = this.imageData.data;
        var width = this.imageData.width;
        var height = this.imageData.height;
        
        this.y = new Bytemap(width,height);
        
        for (var k = 0; k < 256; k++) 
        {
            rmul[k] = (k * 0x10000 * rgb_to_ycc[0][0]);
            gmul[k] = (k * 0x10000 * rgb_to_ycc[0][1]);
            bmul[k] = (k * 0x10000 * rgb_to_ycc[0][2]);
        }
        for (var i = 0; i < height; i++) 
        {
            for (var j = 0; j < width; j++) 
            {
                var index = (i * width + j) << 2;
                var y = rmul[255 - data[index]] + gmul[255 - data[index + 1]] + bmul[255 - data[index + 2]] + 32768;
                this.y[i][j] = (y >> 16) - 128;
            }
        }
    }
    
    YtoRGB() {
        var image = document.createElement('canvas')
        .getContext('2d')
        .createImageData(this.width, this.height);
        for (var i = 0; i < this.imageData.height; i++) {
            for (var j = 0; j < this.imageData.height; j++) {
                var v = (this.y[i][j] + 32) >> 6;
                v = this.y[i][j];
                if (v < -128) {
                    v = -128;
                } 
                else if (v >= 128) {
                    v = 127;
                }
                v = 127 - v;
                var index = (i * this.width + j) << 2;
                image.data[index] = v;
                image.data[index + 1] = v;
                image.data[index + 2] = v;
                image.data[index + 3] = 255;
            }
        }
        return image;
    }
    
    inverseWaveletTransform() 
    {
        // LOOP ON SCALES
        for (var scale = 1; scale < 32; scale <<= 1) {
            //сначала строки
            this.filter_fh(scale, this.y);
            //потом столбцы
            this.filter_fv(scale, this.y);
        
        }
    }
    
    // по сути то же преобразование что и при раскодировании, только в обратном порядке
    filter_fv(s, bitmap) {
        //для столбцов
        var kmax = Math.floor((bitmap.height - 1) / s);
        for (var i = 0; i < bitmap.width; i += s) {
            //Prediction 
            for (var k = 1; k <= kmax; k += 2) {
                if ((k - 3 >= 0) && (k + 3 <= kmax)) {
                    bitmap[k * s][i] -= (9 * (bitmap[(k - 1) * s][i] 
                    + bitmap[(k + 1) * s][i]) - (bitmap[(k - 3) * s][i] 
                    + bitmap[(k + 3) * s][i]) + 8) >> 4;
                } 
                else if (k + 1 <= kmax) {
                    bitmap[k * s][i] -= (bitmap[(k - 1) * s][i] 
                    + bitmap[(k + 1) * s][i] + 1) >> 1;
                } 
                else {
                    bitmap[k * s][i] -= bitmap[(k - 1) * s][i];
                }
            }
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
                bitmap[k * s][i] += (9 * (a + b) - (c + d) + 16) >> 5;
            }
        
        }
    }
    
    filter_fh(s, bitmap) {
        //для строк
        var kmax = Math.floor((bitmap.width - 1) / s);
        for (var i = 0; i < bitmap.height; i += s) {
            //Prediction 
            for (var k = 1; k <= kmax; k += 2) {
                if ((k - 3 >= 0) && (k + 3 <= kmax)) {
                    bitmap[i][k * s] -= (9 * (bitmap[i][(k - 1) * s] 
                    + bitmap[i][(k + 1) * s]) - (bitmap[i][(k - 3) * s] 
                    + bitmap[i][(k + 3) * s]) + 8) >> 4;
                } 
                else if (k + 1 <= kmax) {
                    bitmap[i][k * s] -= (bitmap[i][(k - 1) * s] 
                    + bitmap[i][(k + 1) * s] + 1) >> 1;
                } 
                else {
                    bitmap[i][k * s] -= bitmap[i][(k - 1) * s];
                }
            }
            
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
                bitmap[i][k * s] += (9 * (a + b) - (c + d) + 16) >> 5;
            }
        
        }
    
    }
    
    // переводим матрицу в блоки
    createBlocks(bitmap) {
        var blockRows = Math.ceil(this.height / 32);
        var blockCols = Math.ceil(this.width / 32);
        // блоки исходного изображения
        this.blocks = [];
        
        for (var r = 0; r < blockRows; r++) {
            for (var c = 0; c < blockCols; c++) {
                var block = new Block();
                for (var i = 0; i < 1024; i++) {
                    /*var bits = [];
                    for (var j = 0; j < 10; j++) {
                        bits.push((i & Math.pow(2, j)) >> j);
                    }
                    var row = 16 * bits[1] + 8 * bits[3] + 4 * bits[5] + 2 * bits[7] + bits[9];
                    var col = 16 * bits[0] + 8 * bits[2] + 4 * bits[4] + 2 * bits[6] + bits[8];*/
                    block.setCoef(i, bitmap[this.zigzagRow[i] + 32 * r][this.zigzagCol[i] + 32 * c]);
                }
                this.blocks.push(block);
            }
        }
        
        // блоки в которые будем класть закодированные биты
        this.eblocks = new Array(this.blocks.length);
        for (var i = 0; i < this.eblocks.length; i++) {
            this.eblocks[i] = new Block();
        }
    }
    
    test() {
        this.RGBtoY();
        this.inverseWaveletTransform();
        this.createBlocks(this.y);
        var buf = this.encodeChunk(this.bs);
        console.log('Coded buffer length', buf.byteLength);
        var doc = new DjVuDocument(buf);
        return doc.pages[0].getImage();
        console.log(this.blocks.length);
        return this.YtoRGB();
    }
    
    writeINFOChunk(bsw) {
        bsw.writeStr('INFO').writeInt32(10)
        .writeInt16(this.imageData.width)
        .writeInt16(this.imageData.height)
        .writeByte(24).writeByte(0)
        .writeByte(100 & 0xff)
        .writeByte(100 >> 8)
        .writeByte(22).writeByte(1);
        /*this.width = bs.getInt16();
        this.height = bs.getInt16();
        this.minver = bs.getInt8();
        this.majver = bs.getInt8();
        this.dpi = bs.getUint8();
        this.dpi |= bs.getUint8() << 8;
        this.gamma = bs.getInt8();
        this.flags = bs.getInt8();*/
    }
    
    encodeChunk(bsw) {
        // пропускаем 4 байта для длины файла
        bsw.writeStr('AT&T').writeStr('FORM').jump(4).writeStr('DJVU');
        this.writeINFOChunk(bsw);

        bsw.writeStr('BG44').jump(4);
        //пишем заголовок
        bsw.writeByte(0).writeByte(100).writeByte(129)
        .writeByte(2).writeUint16(192).writeUint16(256).writeByte(0);
        
        /*this.serial = bs.getUint8();
        this.slices = bs.getUint8();
        if (!this.serial) {
            this.majver = bs.getUint8();
            this.grayscale = this.majver >> 7;
            this.minver = bs.getUint8();
            this.width = bs.getUint16();
            this.height = bs.getUint16();
            this.delayInit = bs.getUint8() & 127;
            //console.log(bs.getUint8(8) >> 7);
        }*/

        this.zp = new ZPEncoder(bsw);
        for(var i = 0; i<100; i++) {
            this.encodeSlice();
        }
        this.zp.eflush();
        bsw.rewriteInt32(8, bsw.offset - 12); 
        bsw.rewriteInt32(38, bsw.offset - 42);
        return bsw.getBuffer();
    }
    
    encodeSlice(zp, imageinfo) {
        /*if (!this.info) {
            this.init(imageinfo);
        } 
        else {
            this.info.slices = imageinfo.slices;
        }
        this.zp = zp;*/
        
        if (!this.is_null_slice()) {
            // по блокам идем        
            for (var i = 0; i < this.blocks.length; i++) {
                var block = this.blocks[i];
                var eblock = this.eblocks[i];
                
                this.preliminaryFlagComputation(block, eblock);
                // четыре подхода декодирования
                if (this.blockBandEncodingPass()) {
                    this.bucketEncodingPass(eblock);
                    this.newlyActiveCoefficientEncodingPass(block, eblock);
                }
                this.previouslyActiveCoefficientEncodingPass(block, eblock);
            }
        }
        // уменьшаем шаги 
        this.finish_code_slice();
    
    }
    
    previouslyActiveCoefficientEncodingPass(block, eblock) {
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
                    // и так всегда > 0 в процессе кодирования 
                    var ecoef = eblock.buckets[i][j];
                    
                    var pix = coef >= ecoef ? 1 : 0;
                    if (coef <= 3 * step) {
                        this.zp.encode(pix, this.inreaseCoefCtx, 0);
                        //djvulibre не делает этого
                        //coef += step >> 2;
                    } 
                    else {
                        //тут IWEncoder но и так он по умолчанию
                        this.zp.encode(pix);
                    }
                    
                    eblock.buckets[i][j] = ecoef - (pix ? 0 : step) + (step >> 1);
                }
            }
        }
    }
    
    
    
    newlyActiveCoefficientEncodingPass(block, eblock) {
        //bucket offset
        var boff = 0;
        var indices = this.getBandBuckets(this.curband);
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
                var ebucket = eblock.buckets[i];
                var np = 0;
                for (var j = 0; j < 16; j++) {
                    if (this.coeffstate[boff][j] & this.UNK) {
                        np++;
                    }
                }
                
                for (var j = 0; j < 16; j++) {
                    if (this.coeffstate[boff][j] & this.UNK) {
                        var ip = Math.min(7, np);
                        this.zp.encode(this.coeffstate[boff][j] & this.NEW ? 1 : 0, this.activateCoefCtx, shift + ip);
                        if (this.coeffstate[boff][j] & this.NEW) {
                            this.zp.encode((bucket[j] < 0) ? 1 : 0);
                            np = 0;
                            if (!this.curband) {
                                step = this.quant_lo[j];
                            }
                            //todo сравнить нужно ли 2 слагаемое
                            ebucket[j] = (step + (step >> 1) - (step >> 3));
                        }
                        if (np) {
                            np--;
                        }
                    }
                }
            }
        }
    }
    
    
    bucketEncodingPass(eblock) {
        var indices = this.getBandBuckets(this.curband);
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
            if (this.curband) {
                var t = 4 * i;
                for (var j = t; j < t + 4; j++) {
                    if (eblock.getCoef(j)) {
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
            this.zp.encode((this.bucketstate[boff] & this.NEW) ? 1 : 0, this.decodeCoefCtx, n + this.curband * 8);
        }
    }
    
    blockBandEncodingPass() {
        var indices = this.getBandBuckets(this.curband);
        var bcount = indices.to - indices.from + 1;
        if (bcount < 16 || (this.bbstate & this.ACTIVE)) {
            this.bbstate |= this.NEW;
        } 
        else if (this.bbstate & this.UNK) {
            //this.bbstate может быть NEW на этапе preliminaryFlagComputation
            this.zp.encode(this.bbstate & this.NEW ? 1 : 0, this.decodeBucketCtx, 0);
        }
        return this.bbstate & this.NEW;
    }
    
    // принимает исходный блок и кодируемый блок. Взято из djvulibre
    preliminaryFlagComputation(block, eblock) {
        this.bbstate = 0;
        var bstatetmp = 0;
        var indices = this.getBandBuckets(this.curband);
        var step = this.quant_hi[this.curband];
        if (this.curband) {
            //смещение сегмента в массиве флагов
            var boff = 0;
            for (var j = indices.from; j <= indices.to; j++,
            boff++) {
                bstatetmp = 0;
                var bucket = block.buckets[j];
                var ebucket = eblock.buckets[j];
                
                for (var k = 0; k < bucket.length; k++) {
                    //var index = k + 16 * boff;
                    if (ebucket[k]) {
                        this.coeffstate[boff][k] = this.ACTIVE;
                    } 
                    else if (bucket[k] >= step || bucket[k] <= -step) {
                        this.coeffstate[boff][k] = this.UNK | this.NEW;
                    } 
                    else {
                        this.coeffstate[boff][k] = this.UNK;
                    }
                    bstatetmp |= this.coeffstate[boff][k];
                }
                this.bucketstate[boff] = bstatetmp;
                this.bbstate |= bstatetmp;
            }
        } 
        else {
            //если нулевая группа            
            var bucket = block.buckets[0];
            var ebucket = eblock.buckets[0];
            for (var k = 0; k < bucket.length; k++) {
                step = this.quant_lo[k];
                //если шаг в допустимых пределах
                if (this.coeffstate[0][k] !== this.ZERO) {
                    if (ebucket[k]) {
                        this.coeffstate[0][k] = this.ACTIVE;
                    } 
                    else if (bucket[k] >= step || bucket[k] <= -step) {
                        this.coeffstate[0][k] = this.UNK | this.NEW;
                    } 
                    else {
                        this.coeffstate[0][k] = this.UNK;
                    }
                }
                bstatetmp |= this.coeffstate[0][k];
            }
            this.bucketstate[0] = bstatetmp;
            this.bbstate |= bstatetmp;
        }
    }

}

class Bytemap extends Array {
    constructor(width, height) {
        super(height);
        this.height = height;
        this.width = width;
        for (var i = 0; i < height; i++) {
            this[i] = new Int16Array(width);
        }
    }
}

IWImageWriter.prototype.rgb_to_ycc = 
[[0.304348, 0.608696, 0.086956], 
[0.463768, -0.405797, -0.057971], 
[-0.173913, -0.347826, 0.521739]];
