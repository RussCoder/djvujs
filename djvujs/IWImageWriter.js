'use strict';

class IWImageWriter {
    constructor(imageData) {
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
                var y = rmul[data[index]] + gmul[data[index + 1]] + bmul[data[index + 2]] + 32768;
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
                v = 128 + this.y[i][j];
                var index = (i * this.width + j) << 2;
                image.data[index] = v;
                image.data[index + 1] = v;
                image.data[index + 2] = v;
                image.data[index + 3] = 255;
            }
        }
        return image;
    }

    test() {
        this.RGBtoY();
        return this.YtoRGB();
    }
}

class Bytemap extends Array {
    constructor(width, height) {
        super(height);
        for (var i = 0; i < height; i++) {
            this[i] = new Int32Array(width);
        }
    }
}

IWImageWriter.prototype.rgb_to_ycc = 
[[0.304348, 0.608696, 0.086956], 
[0.463768, -0.405797, -0.057971], 
[-0.173913, -0.347826, 0.521739]];
