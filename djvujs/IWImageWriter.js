'use strict';

class IWImageWriter extends IWCodecBaseClass  {
    constructor(imageData) {
        super();
        this.imageData = imageData;
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
        for(var i=0; i<this.eblocks.length;i++) {
            this.eblocks[i] = new Block();
        }
    }
    
    test() {
        this.RGBtoY();
        this.inverseWaveletTransform();
        this.createBlocks(this.y);
        console.log(this.blocks.length);
        return this.YtoRGB();
    }


    preliminaryFlagComputation(band) {
        var indices = this.getBandBuckets(band);
        for (var i = 0; i < this.blocks.length; i++) {
            var block = this.blocks[i];
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
            
            block.activeBandFlags[band] = 0;
            block.potentialBandFlags[band] = 0;
            for (var j = indices.from; j <= indices.to; j++) {
                block.activeBandFlags[band] = block.activeBucketFlags[j] || block.activeBandFlags[band];
                block.potentialBandFlags[band] = block.potentialBandFlags[band] || block.potentialBucketFlags[j];
            }
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
