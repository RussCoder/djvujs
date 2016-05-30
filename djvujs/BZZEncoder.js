'use strict';

/*
* Предполагается, что все данные будут закодированы одним блоком.
* Причем блок уже будет оканчиваться дополнительным 0 в качестве конечного символа
*/
class BZZEncoder {
    constructor(zp) {
        this.zp = zp || new ZPEncoder();
        this.minblock = 10;
        this.maxblock = 4096;
        this.FREQMAX = 4;
        this.CTXIDS = 3;
        this.ctx = new Uint8Array(300);
        this.size = 0;
        this.blocksize = 0;
        this.FREQS0 = 100000;
        this.FREQS1 = 1000000;    
    }
    
    // сортировка на основе встроенной функции, может быть не очень оптимальна
    blocksort(arr) {
        var length = arr.length;
        //массив смещений
        var offs = new Array(arr.length);
        //var markerpos = this.markerpos;
        for (var i = 0; i < length; offs[i] = i++) {}
        // сортируем массив смещений
        offs.sort((a,b)=>{
            for (var i = 0; i < length; i++) {
                // <EOB> конечный символ предполагается самым маленьким, 
                // то есть идет первым при сортировке по возрастанию
                if (a === this.markerpos) {
                    return -1;
                } 
                else if (b === this.markerpos) {
                    return 1;
                }
                var res = arr[a % length] - arr[b % length];
                if (res) {
                    return res;
                }
                a++;
                b++;
            }
            return 0;
        }
        );
        
        var narr = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            var pos = offs[i] - 1;
            if (pos >= 0) {
                narr[i] = arr[pos];
            } 
            else {
                narr[i] = 0;
                this.markerpos = i;
            }
        }
        return narr;
    
    }
    
    
    encode_raw(bits, x) 
    {
        var n = 1;
        var m = (1 << bits);
        while (n < m) 
        {
            x = (x & (m - 1)) << 1;
            var b = (x >> bits);
            this.zp.encode(b);
            n = (n << 1) | b;
        }
    }
    
    encode_binary(cxtoff, bits, x) 
    {
        // Require 2^bits-1  contexts
        var n = 1;
        var m = (1 << bits);
        cxtoff--;
        while (n < m) 
        {
            x = (x & (m - 1)) << 1;
            var b = (x >> bits);
            this.zp.encode(b, this.ctx, cxtoff + n);
            n = (n << 1) | b;
        }
    }
    
    encode(buffer) 
    {
        /////////////////////////////////
        ////////////  Block Sort Tranform
        var data = new Uint8Array(buffer);
        var size = data.length;
        var markerpos = size - 1;
        this.markerpos = markerpos;
        data = this.blocksort(data);
        markerpos = this.markerpos;
        
        /////////////////////////////////
        //////////// Encode Output Stream
        
        // Header
        this.encode_raw(24, size);
        // Determine and Encode Estimation Speed
        var fshift = 0;
        if (size < this.FREQS0) 
        {
            fshift = 0;
            this.zp.encode(0);
        } 
        else if (size < this.FREQS1) 
        {
            fshift = 1;
            this.zp.encode(1);
            this.zp.encode(0);
        } 
        else 
        {
            fshift = 2;
            this.zp.encode(1);
            this.zp.encode(1);
        }
        // MTF
        var mtf = new Uint8Array(256);
        var rmtf = new Uint8Array(256);
        var freq = new Uint32Array(this.FREQMAX);
        var m = 0;
        for (m = 0; m < 256; m++)
            mtf[m] = m;
        for (m = 0; m < 256; m++)
            rmtf[mtf[m]] = m;
        var fadd = 4;
        for (m = 0; m < this.FREQMAX; m++)
            freq[m] = 0;
        // Encode
        var i;
        var mtfno = 3;
        for (i = 0; i < size; i++) 
        {
            // Get MTF data
            var c = data[i];
            var ctxid = this.CTXIDS - 1;
            if (ctxid > mtfno)
                ctxid = mtfno;
            mtfno = rmtf[c];
            if (i == markerpos)
                mtfno = 256;
            // Encode using ZPEncoder
            var b;
            //вместо BitContext *cx = ctx; на С++
            var ctxoff = 0;
            
            switch (0) // чтобы можно было использовать break
            {
            default:
                b = (mtfno == 0);
                this.zp.encode(b, this.ctx, ctxoff + ctxid);
                if (b)
                    // вместо goto rotate;
                    break;
                ctxoff += this.CTXIDS;
                b = (mtfno == 1);
                this.zp.encode(b, this.ctx, ctxoff + ctxid);
                if (b)
                    break;
                ctxoff += this.CTXIDS;
                b = (mtfno < 4);
                this.zp.encode(b, this.ctx, ctxoff);
                if (b) {
                    this.encode_binary(ctxoff + 1, 1, mtfno - 2);
                    break;
                }
                ctxoff += 1 + 1;
                b = (mtfno < 8);
                this.zp.encode(b, this.ctx, ctxoff);
                if (b) {
                    this.encode_binary(ctxoff + 1, 2, mtfno - 4);
                    break;
                }
                ctxoff += 1 + 3;
                b = (mtfno < 16);
                this.zp.encode(b, this.ctx, ctxoff);
                if (b) {
                    this.encode_binary(ctxoff + 1, 3, mtfno - 8);
                    break;
                }
                ctxoff += 1 + 7;
                b = (mtfno < 32);
                this.zp.encode(b, this.ctx, ctxoff);
                if (b) {
                    this.encode_binary(ctxoff + 1, 4, mtfno - 16);
                    break;
                }
                ctxoff += 1 + 15;
                b = (mtfno < 64);
                this.zp.encode(b, this.ctx, ctxoff);
                if (b) {
                    this.encode_binary(ctxoff + 1, 5, mtfno - 32);
                    break;
                }
                ctxoff += 1 + 31;
                b = (mtfno < 128);
                this.zp.encode(b, this.ctx, ctxoff);
                if (b) {
                    this.encode_binary(ctxoff + 1, 6, mtfno - 64);
                    break;
                }
                ctxoff += 1 + 63;
                b = (mtfno < 256);
                this.zp.encode(b, this.ctx, ctxoff);
                if (b) {
                    this.encode_binary(ctxoff + 1, 7, mtfno - 128);
                    break;
                }
                continue;
                // Rotate MTF according to empirical frequencies (new!)
            }
            // Adjust frequencies for overflow
            fadd = fadd + (fadd >> fshift);
            if (fadd > 0x10000000) 
            {
                fadd = fadd >> 24;
                freq[0] >>= 24;
                freq[1] >>= 24;
                freq[2] >>= 24;
                freq[3] >>= 24;
                for (var k = 4; k < this.FREQMAX; k++)
                    freq[k] = freq[k] >> 24;
            }
            // Relocate new char according to new freq
            var fc = fadd;
            if (mtfno < this.FREQMAX)
                fc += freq[mtfno];
            var k;
            for (k = mtfno; k >= this.FREQMAX; k--) 
            {
                mtf[k] = mtf[k - 1];
                rmtf[mtf[k]] = k;
            }
            for (; k > 0 && fc >= freq[k - 1]; k--) 
            {
                mtf[k] = mtf[k - 1];
                freq[k] = freq[k - 1];
                rmtf[mtf[k]] = k;
            }
            mtf[k] = c;
            freq[k] = fc;
            rmtf[mtf[k]] = k;
        }
        
        // Encode EOF marker
        this.encode_raw(24, 0);
        this.zp.eflush();
        // Terminate
        return 0;
    }
}
