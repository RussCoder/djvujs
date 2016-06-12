'use strict';

//класс для общих таблиц кодеков хранящихся в прототипе
class ZPCodecBaseClass {
}

class ZPEncoder extends ZPCodecBaseClass {
    constructor(bsw) {
        super();
        //byteStreamWriter
        this.bsw = bsw || new ByteStreamWriter();
        this.a = 0;
        this.scount = 0;
        this.byte = 0;
        this.delay = 25;
        this.subend = 0;
        this.buffer = 0xffffff;
        this.nrun = 0;
        
        //this.pzp = new PseudoZP();
    }
    
    outbit(bit) 
    {
        if (this.delay > 0) 
        {
            if (this.delay < 0xff)
                // delay=0xff suspends emission forever
                this.delay -= 1;
        } 
        else 
        {
            /* Insert a bit */
            this.byte = (this.byte << 1) | bit;
            /* Output a byte */
            if (++this.scount == 8) 
            {
                this.bsw.writeByte(this.byte);
                this.scount = 0;
                this.byte = 0;
            }
        }
    }
    
    zemit(b) 
    {
        /* Shift new bit into 3bytes buffer */
        this.buffer = (this.buffer << 1) + b;
        /* Examine bit going out of the 3bytes buffer */
        b = (this.buffer >> 24);
        this.buffer = (this.buffer & 0xffffff);
        switch (b) 
        {
            /* Similar to WN&C upper renormalization */
        case 1:
            this.outbit(1);
            while (this.nrun-- > 0)
                this.outbit(0);
            this.nrun = 0;
            break;
            /* Similar to WN&C lower renormalization */
        case 0xff:
            this.outbit(0);
            while (this.nrun-- > 0)
                this.outbit(1);
            this.nrun = 0;
            break;
            /* Similar to WN&C central renormalization */
        case 0:
            this.nrun += 1;
            break;
        default:
            //assert(0);
            throw new Exception('ZPEncoder::zemit() error!');
        }
    }
    
    //откопировано из djvulibre
    encode(bit, ctx, n) 
    {
        //this.pzp.encode(bit, ctx, n);
        bit = +bit;
        if (!ctx) {
            //return this.IWencode(bit);
            // можно было бы использовать IWencode всегда, но так сделано в djvulibre видимо для оптимизации
            return this._ptencode(bit,  0x8000 + (this.a >> 1));
        }
        var z = this.a + this.p[ctx[n]];
        if (bit != (ctx[n] & 1)) 
        {
            //encode_lps(ctx, z);
            var d = 0x6000 + ((z + this.a) >> 2);
            if (z > d) {
                z = d;
            }
            /* Adaptation */
            ctx[n] = this.dn[ctx[n]];
            /* Code LPS */
            z = 0x10000 - z;
            this.subend += z;
            this.a += z;
        
        } else if (z >= 0x8000) 
        {
            //encode_mps
            var d = 0x6000 + ((z + this.a) >> 2);
            if (z > d) {
                z = d;
            }
            /* Adaptation */
            if (this.a >= this.m[ctx[n]])
                ctx[n] = this.up[ctx[n]];
            /* Code MPS */
            this.a = z;
        
        } else 
        {
            this.a = z;
            // чтобы выйти тут
            return;
        }
        
        /* Export bits */// выполнится только для первых 2 случаев
        while (this.a >= 0x8000) 
        {
            this.zemit(1 - (this.subend >> 15));
            // 0xffff & ... вместо (unsigned short) в С++
            this.subend = 0xffff & (this.subend << 1);
            this.a = 0xffff & (this.a << 1);
        }
    }
    
    //используется для кодирования изображений, может всегда использоваться как показала практика
    IWencode(bit) {
        //this.pzp.encode(bit);
        this._ptencode(bit, 0x8000 + ((this.a + this.a + this.a) >> 3));
    }

    // тут скопировано с IWEncoder() может нужен просто Encoder()
    _ptencode(bit, z) 
    {
        // IWEncoder()
        //var z = 0x8000 + ((this.a + this.a + this.a) >> 3);
        // просто Encoder()
        //var z = 0x8000 + (this.a >> 1);
        
        if (bit) 
        {
            //encode_lps_simple(z);
            /* Code LPS */
            z = 0x10000 - z;
            this.subend += z;
            this.a += z;
        } else 
        {
            //encode_mps_simple(z);
            /* Code MPS */
            this.a = z;
        }
        /* Export bits */// выполнится только для первыйх 2 случаев
        while (this.a >= 0x8000) 
        {
            this.zemit(1 - (this.subend >> 15));
            // 0xffff & ... вместо (unsigned short) в С++
            this.subend = 0xffff & (this.subend << 1);
            this.a = 0xffff & (this.a << 1);
        }
    }
    
    // функция выполняемая в деструкторе в С++. Надо вызывать вручную в js чтобы записать последние байты
    eflush() 
    {
        /* adjust subend */
        if (this.subend > 0x8000)
            this.subend = 0x10000;
        else if (this.subend > 0)
            this.subend = 0x8000;
        /* zemit many mps bits */
        while (this.buffer != 0xffffff || this.subend) 
        {
            this.zemit(1 - (this.subend >> 15));
            this.subend = 0xffff & (this.subend << 1);
        }
        /* zemit pending run */
        this.outbit(1);
        while (this.nrun-- > 0)
            this.outbit(0);
        this.nrun = 0;
        /* zemit 1 until full byte */
        while (this.scount > 0)
            this.outbit(1);
        /* prevent further emission */
        this.delay = 0xff;
    }
}



class ZPCoder extends ZPCodecBaseClass {
    constructor(bs) {
        super();
        this.bs = bs;
        this.a = 0x0000;
        this.c = this.bs.byte();
        //code
        this.c <<= 8;
        var tmp = this.bs.byte();
        this.c |= tmp;
        this.z = 0;
        this.d = 0;
        //fence
        this.f = Math.min(this.c, 0x7fff);
        this.ffzt = new Int8Array(256);
        // Create machine independent ffz table
        for (var i = 0; i < 256; i++) 
        {
            this.ffzt[i] = 0;
            for (var j = i; j & 0x80; j <<= 1)
                this.ffzt[i] += 1;
        }
        /* Preload buffer */
        this.delay = 25;
        this.scount = 0;
        this.buffer = 0;
        // буфер на 4 байта
        this.preload();
    }
    
    preload() {
        // загрузка байтов из потока в буфер
        while (this.scount <= 24) 
        {
            var byte = this.bs.byte();
            this.buffer = (this.buffer << 8) | byte;
            this.scount += 8;
        }
    }
    
    ffz(x) {
        return (x >= 0xff00) ? (this.ffzt[x & 0xff] + 8) : (this.ffzt[(x >> 8) & 0xff]);
    }
    
    /* Функции реализованы не как в документации, а скопированы из djvulibre */
    decode(ctx, n) {
        if (!ctx) {
            //упрощенный декодер, но можно было использовать IWdecode
            return this._ptdecode(0x8000 + (this.a >> 1));
        }
        this.b = ctx[n] & 1;
        this.z = this.a + this.p[ctx[n]];
        if (this.z <= this.f) {
            this.a = this.z;
            //console.log("123");
            
            if (this.pzp) {
                var tmp = this.pzp.decode(ctx, n);
                if (tmp != this.b) {
                    throw new Exception('Bit dismatch');
                }
            }
            
            return this.b;
        }
        this.d = 0x6000 + ((this.a + this.z) >> 2);
        
        if (this.z > this.d) {
            this.z = this.d;
        }
        
        if (this.z > this.c) {
            this.b = 1 - this.b;
            if (this.pzp) {
                var tmp = this.pzp.decode(ctx, n);
                if (tmp != this.b) {
                    throw new Exception('Bit dismatch');
                }
            }
            this.z = 0x10000 - this.z;
            this.a += this.z;
            this.c += this.z;
            ctx[n] = this.dn[ctx[n]];
            
            var shift = this.ffz(this.a);
            this.scount -= shift;
            this.a = 0xffff & (this.a << shift);
            this.c = 0xffff & (
            (this.c << shift) | (this.buffer >> this.scount) & ((1 << shift) - 1)
            );
        } 
        else {
            if (this.pzp) {
                var tmp = this.pzp.decode(ctx, n);
                if (tmp != this.b) {
                    throw new Exception('Bit dismatch');
                }
            }
            if (this.a >= this.m[ctx[n]]) {
                ctx[n] = this.up[ctx[n]];
            }
            this.scount--;
            this.a = 0xffff & (this.z << 1);
            this.c = 0xffff & (
            (this.c << 1) | ((this.buffer >> this.scount) & 1)
            );
        }
        
        if (this.scount < 16)
            this.preload();
        this.f = Math.min(this.c, 0x7fff);
        
        return this.b;
    }

    // для раскодирования картинок, но вообще можно всегда использовать
    IWdecode() {
        return this._ptdecode(0x8000 + ((this.a + this.a + this.a) >> 3));
    }
    
    _ptdecode(z) {
        //z = 0x8000 + ((this.a + this.a + this.a) >> 3);
        this.b = 0;
        if (z > this.c) {
            this.b = 1;
            z = 0x10000 - z;
            this.a += z;
            this.c += z;
            
            var shift = this.ffz(this.a);
            this.scount -= shift;
            this.a = 0xffff & (this.a << shift);
            this.c = 0xffff & (
            (this.c << shift) | (this.buffer >> this.scount) & ((1 << shift) - 1)
            );
        } 
        else {
            this.b = 0;
            this.scount--;
            this.a = 0xffff & (z << 1);
            this.c = 0xffff & (
            (this.c << 1) | ((this.buffer >> this.scount) & 1)
            );
        }
        if (this.scount < 16)
            this.preload();
        this.f = Math.min(this.c, 0x7fff);
        
        if (this.pzp) {
            var tmp = this.pzp.decode();
            if (tmp != this.b) {
                throw new Exception('Bit dismatch');
            }
        }
        
        return this.b;
    }
    
    /*decodex(ctx, n) {
        if (!ctx) {
            return this.ptdecode();
        }
        this.b = ctx[n] & 1;
        this.z = this.a + this.p[ctx[n]];
        if (this.z <= this.f) {
            this.a = this.z;
            //console.log("123");
            return this.b;
        }
        this.d = 0x6000 + ((this.a + this.z) >> 2);
        
        if (this.z > this.d) {
            this.z = this.d;
        }
        if (this.c > this.z) {
            if (this.a > this.m[ctx[n]]) {
                ctx[n] = this.up[ctx[n]];
            }
            this.a = this.z;
        } 
        else {
            this.b = 1 - this.b;
            this.z = 0x10000 - this.z;
            this.a += this.z;
            this.c += this.z;
            ctx[n] = this.dn[ctx[n]];
        }
        let flag = 0;
        while (this.a > 0x8000) {
            flag = 1;
            this.a += this.a - 0x10000;
            this.c += this.c - 0x10000 + this.bs.bit();
            //console.log("+");
        }
        if (flag) {
            this.f = Math.min(this.c, 0x7fff);
        } 
        else {
            console.log("()");
        }
        return this.b;
    }*/
    
    /*ptdecodex() {
        this.z = 0x8000 + ((this.a + this.a + this.a) >> 3);
        if (this.c > this.z) {
            this.b = 0;
            this.a = this.z;
        } 
        else {
            this.b = 1;
            this.z = 0x10000 - this.z;
            this.a += this.z;
            this.c += this.z;
        }
        while (this.a > 0x8000) {
            this.a += this.a - 0x10000;
            this.c += this.c - 0x10000 + this.bs.bit();
        }
        return this.b;
    }*/
}



ZPCodecBaseClass.prototype.p = new Uint16Array([0x8000, 0x8000, 0x8000, 0x6bbd, 0x6bbd, 
0x5d45, 0x5d45, 0x51b9, 0x51b9, 0x4813, 
0x4813, 0x3fd5, 0x3fd5, 0x38b1, 0x38b1, 
0x3275, 0x3275, 0x2cfd, 0x2cfd, 0x2825, 
0x2825, 0x23ab, 0x23ab, 0x1f87, 0x1f87, 
0x1bbb, 0x1bbb, 0x1845, 0x1845, 0x1523, 
0x1523, 0x1253, 0x1253, 0x0fcf, 0x0fcf, 
0x0d95, 0x0d95, 0x0b9d, 0x0b9d, 0x09e3, 
0x09e3, 0x0861, 0x0861, 0x0711, 0x0711, 
0x05f1, 0x05f1, 0x04f9, 0x04f9, 0x0425, 
0x0425, 0x0371, 0x0371, 0x02d9, 0x02d9, 
0x0259, 0x0259, 0x01ed, 0x01ed, 0x0193, 
0x0193, 0x0149, 0x0149, 0x010b, 0x010b, 
0x00d5, 0x00d5, 0x00a5, 0x00a5, 0x007b, 
0x007b, 0x0057, 0x0057, 0x003b, 0x003b, 
0x0023, 0x0023, 0x0013, 0x0013, 0x0007, 
0x0007, 0x0001, 0x0001, 0x5695, 0x24ee, 
0x8000, 0x0d30, 0x481a, 0x0481, 0x3579, 
0x017a, 0x24ef, 0x007b, 0x1978, 0x0028, 
0x10ca, 0x000d, 0x0b5d, 0x0034, 0x078a, 
0x00a0, 0x050f, 0x0117, 0x0358, 0x01ea, 
0x0234, 0x0144, 0x0173, 0x0234, 0x00f5, 
0x0353, 0x00a1, 0x05c5, 0x011a, 0x03cf, 
0x01aa, 0x0285, 0x0286, 0x01ab, 0x03d3, 
0x011a, 0x05c5, 0x00ba, 0x08ad, 0x007a, 
0x0ccc, 0x01eb, 0x1302, 0x02e6, 0x1b81, 
0x045e, 0x24ef, 0x0690, 0x2865, 0x09de, 
0x3987, 0x0dc8, 0x2c99, 0x10ca, 0x3b5f, 
0x0b5d, 0x5695, 0x078a, 0x8000, 0x050f, 
0x24ee, 0x0358, 0x0d30, 0x0234, 0x0481, 
0x0173, 0x017a, 0x00f5, 0x007b, 0x00a1, 
0x0028, 0x011a, 0x000d, 0x01aa, 0x0034, 
0x0286, 0x00a0, 0x03d3, 0x0117, 0x05c5, 
0x01ea, 0x08ad, 0x0144, 0x0ccc, 0x0234, 
0x1302, 0x0353, 0x1b81, 0x05c5, 0x24ef, 
0x03cf, 0x2b74, 0x0285, 0x201d, 0x01ab, 
0x1715, 0x011a, 0x0fb7, 0x00ba, 0x0a67, 
0x01eb, 0x06e7, 0x02e6, 0x0496, 0x045e, 
0x030d, 0x0690, 0x0206, 0x09de, 0x0155, 
0x0dc8, 0x00e1, 0x2b74, 0x0094, 0x201d, 
0x0188, 0x1715, 0x0252, 0x0fb7, 0x0383, 
0x0a67, 0x0547, 0x06e7, 0x07e2, 0x0496, 
0x0bc0, 0x030d, 0x1178, 0x0206, 0x19da, 
0x0155, 0x24ef, 0x00e1, 0x320e, 0x0094, 
0x432a, 0x0188, 0x447d, 0x0252, 0x5ece, 
0x0383, 0x8000, 0x0547, 0x481a, 0x07e2, 
0x3579, 0x0bc0, 0x24ef, 0x1178, 0x1978, 
0x19da, 0x2865, 0x24ef, 0x3987, 0x320e, 
0x2c99, 0x432a, 0x3b5f, 0x447d, 0x5695, 
0x5ece, 0x8000, 0x8000, 0x5695, 0x481a, 0x481a]);

ZPCodecBaseClass.prototype.m = new Uint16Array([0x0000, 
0x0000, 
0x0000, 
0x10a5, 
0x10a5, 
0x1f28, 
0x1f28, 
0x2bd3, 
0x2bd3, 
0x36e3, 
0x36e3, 
0x408c, 
0x408c, 
0x48fd, 
0x48fd, 
0x505d, 
0x505d, 
0x56d0, 
0x56d0, 
0x5c71, 
0x5c71, 
0x615b, 
0x615b, 
0x65a5, 
0x65a5, 
0x6962, 
0x6962, 
0x6ca2, 
0x6ca2, 
0x6f74, 
0x6f74, 
0x71e6, 
0x71e6, 
0x7404, 
0x7404, 
0x75d6, 
0x75d6, 
0x7768, 
0x7768, 
0x78c2, 
0x78c2, 
0x79ea, 
0x79ea, 
0x7ae7, 
0x7ae7, 
0x7bbe, 
0x7bbe, 
0x7c75, 
0x7c75, 
0x7d0f, 
0x7d0f, 
0x7d91, 
0x7d91, 
0x7dfe, 
0x7dfe, 
0x7e5a, 
0x7e5a, 
0x7ea6, 
0x7ea6, 
0x7ee6, 
0x7ee6, 
0x7f1a, 
0x7f1a, 
0x7f45, 
0x7f45, 
0x7f6b, 
0x7f6b, 
0x7f8d, 
0x7f8d, 
0x7faa, 
0x7faa, 
0x7fc3, 
0x7fc3, 
0x7fd7, 
0x7fd7, 
0x7fe7, 
0x7fe7, 
0x7ff2, 
0x7ff2, 
0x7ffa, 
0x7ffa, 
0x7fff, 
0x7fff, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000, 
0x0000]);

ZPCodecBaseClass.prototype.up =  Uint8Array.of(84, 
3, 
4, 
5, 
6, 
7, 
8, 
9, 
10, 
11, 
12, 
13, 
14, 
15, 
16, 
17, 
18, 
19, 
20, 
21, 
22, 
23, 
24, 
25, 
26, 
27, 
28, 
29, 
30, 
31, 
32, 
33, 
34, 
35, 
36, 
37, 
38, 
39, 
40, 
41, 
42, 
43, 
44, 
45, 
46, 
47, 
48, 
49, 
50, 
51, 
52, 
53, 
54, 
55, 
56, 
57, 
58, 
59, 
60, 
61, 
62, 
63, 
64, 
65, 
66, 
67, 
68, 
69, 
70, 
71, 
72, 
73, 
74, 
75, 
76, 
77, 
78, 
79, 
80, 
81, 
82, 
81, 
82, 
9, 
86, 
5, 
88, 
89, 
90, 
91, 
92, 
93, 
94, 
95, 
96, 
97, 
82, 
99, 
76, 
101, 
70, 
103, 
66, 
105, 
106, 
107, 
66, 
109, 
60, 
111, 
56, 
69, 
114, 
65, 
116, 
61, 
118, 
57, 
120, 
53, 
122, 
49, 
124, 
43, 
72, 
39, 
60, 
33, 
56, 
29, 
52, 
23, 
48, 
23, 
42, 
137, 
38, 
21, 
140, 
15, 
142, 
9, 
144, 
141, 
146, 
147, 
148, 
149, 
150, 
151, 
152, 
153, 
154, 
155, 
70, 
157, 
66, 
81, 
62, 
75, 
58, 
69, 
54, 
65, 
50, 
167, 
44, 
65, 
40, 
59, 
34, 
55, 
30, 
175, 
24, 
177, 
178, 
179, 
180, 
181, 
182, 
183, 
184, 
69, 
186, 
59, 
188, 
55, 
190, 
51, 
192, 
47, 
194, 
41, 
196, 
37, 
198, 
199, 
72, 
201, 
62, 
203, 
58, 
205, 
54, 
207, 
50, 
209, 
46, 
211, 
40, 
213, 
36, 
215, 
30, 
217, 
26, 
219, 
20, 
71, 
14, 
61, 
14, 
57, 
8, 
53, 
228, 
49, 
230, 
45, 
232, 
39, 
234, 
35, 
138, 
29, 
24, 
25, 
240, 
19, 
22, 
13, 
16, 
13, 
10, 
7, 
244, 
249, 
10, 
89, 
230);

ZPCodecBaseClass.prototype.dn =  Uint8Array.of(145, 
4, 
3, 
1, 
2, 
3, 
4, 
5, 
6, 
7, 
8, 
9, 
10, 
11, 
12, 
13, 
14, 
15, 
16, 
17, 
18, 
19, 
20, 
21, 
22, 
23, 
24, 
25, 
26, 
27, 
28, 
29, 
30, 
31, 
32, 
33, 
34, 
35, 
36, 
37, 
38, 
39, 
40, 
41, 
42, 
43, 
44, 
45, 
46, 
47, 
48, 
49, 
50, 
51, 
52, 
53, 
54, 
55, 
56, 
57, 
58, 
59, 
60, 
61, 
62, 
63, 
64, 
65, 
66, 
67, 
68, 
69, 
70, 
71, 
72, 
73, 
74, 
75, 
76, 
77, 
78, 
79, 
80, 
85, 
226, 
6, 
176, 
143, 
138, 
141, 
112, 
135, 
104, 
133, 
100, 
129, 
98, 
127, 
72, 
125, 
102, 
123, 
60, 
121, 
110, 
119, 
108, 
117, 
54, 
115, 
48, 
113, 
134, 
59, 
132, 
55, 
130, 
51, 
128, 
47, 
126, 
41, 
62, 
37, 
66, 
31, 
54, 
25, 
50, 
131, 
46, 
17, 
40, 
15, 
136, 
7, 
32, 
139, 
172, 
9, 
170, 
85, 
168, 
248, 
166, 
247, 
164, 
197, 
162, 
95, 
160, 
173, 
158, 
165, 
156, 
161, 
60, 
159, 
56, 
71, 
52, 
163, 
48, 
59, 
42, 
171, 
38, 
169, 
32, 
53, 
26, 
47, 
174, 
193, 
18, 
191, 
222, 
189, 
218, 
187, 
216, 
185, 
214, 
61, 
212, 
53, 
210, 
49, 
208, 
45, 
206, 
39, 
204, 
195, 
202, 
31, 
200, 
243, 
64, 
239, 
56, 
237, 
52, 
235, 
48, 
233, 
44, 
231, 
38, 
229, 
34, 
227, 
28, 
225, 
22, 
223, 
16, 
221, 
220, 
63, 
8, 
55, 
224, 
51, 
2, 
47, 
87, 
43, 
246, 
37, 
244, 
33, 
238, 
27, 
236, 
21, 
16, 
15, 
8, 
241, 
242, 
7, 
10, 
245, 
2, 
1, 
83, 250, 2, 143, 246);
