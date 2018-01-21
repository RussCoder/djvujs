'use strict';

class BZZDecoder {
    constructor(zp) {
        this.zp = zp;
        // this.minblock = 10; // нигде не используется, оставлено для документации
        this.maxblock = 4096;
        this.FREQMAX = 4;
        this.CTXIDS = 3;
        this.mtf = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            this.mtf[i] = i;
        }
        this.ctx = new Uint8Array(300);
        this.size = 0;
        this.blocksize = 0;
        this.data = null;
    }

    decode_raw(bits) {
        let n = 1;
        let m = (1 << bits);
        while (n < m) {
            let b = this.zp.decode();
            n = (n << 1) | b;
        }
        return n - m;
    }

    decode_binary(ctxoff, bits) {
        let n = 1;
        let m = (1 << bits);
        ctxoff--;

        while (n < m) {
            let b = this.zp.decode(this.ctx, ctxoff + n);
            n = (n << 1) | b;
        }

        return n - m;
    }

    _decode() {
        this.size = this.decode_raw(24);
        if (!this.size) {
            //сработать должно если читать несколько блоков
            return 0;
        }
        if (this.size > this.maxblock * 1024) {
            throw new Error("Too big block. Error");
        }
        // Allocate
        if (this.blocksize < this.size) {
            this.blocksize = this.size;
            this.data = new Uint8Array(this.blocksize);
        } else if (this.data == null) {
            this.data = new Uint8Array(this.blocksize);
        }

        // Decode Estimation Speed
        let fshift = 0;

        if (this.zp.decode()) {
            fshift++;

            if (this.zp.decode()) {
                fshift++;
            }
        }

        // Prepare Quasi MTF ** уже есть

        let freq = new Array(this.FREQMAX);

        for (let i = 0; i < this.FREQMAX; freq[i++] = 0);

        let fadd = 4;

        // Decode
        let mtfno = 3;
        let markerpos = -1;

        for (let i = 0; i < this.size; i++) {
            let ctxid = this.CTXIDS - 1;

            if (ctxid > mtfno) {
                ctxid = mtfno;
            }

            var ctxoff = 0;

            switch (0) // чтобы можно было использовать break
            {
                default:

                    if (this.zp.decode(this.ctx, ctxoff + ctxid) != 0) {
                        mtfno = 0;
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }

                    ctxoff += this.CTXIDS;

                    if (this.zp.decode(this.ctx, ctxoff + ctxid) != 0) {
                        mtfno = 1;
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }

                    ctxoff += this.CTXIDS;

                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 2 + this.decode_binary(ctxoff + 1, 1);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }

                    ctxoff += (1 + 1);

                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 4 + this.decode_binary(ctxoff + 1, 2);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }

                    ctxoff += (1 + 3);

                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 8 + this.decode_binary(ctxoff + 1, 3);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }

                    ctxoff += (1 + 7);

                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 16 + this.decode_binary(ctxoff + 1, 4);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }

                    ctxoff += (1 + 15);

                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 32 + this.decode_binary(ctxoff + 1, 5);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }

                    ctxoff += (1 + 31);

                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 64 + this.decode_binary(ctxoff + 1, 6);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }

                    ctxoff += (1 + 63);

                    if (this.zp.decode(this.ctx, ctxoff + 0) != 0) {
                        mtfno = 128 + this.decode_binary(ctxoff + 1, 7);
                        this.data[i] = this.mtf[mtfno];
                        break;
                    }

                    mtfno = 256;
                    this.data[i] = 0;
                    markerpos = i;
                    continue;
            }

            // Rotate mtf according to empirical frequencies (new!)
            // Adjust frequencies for overflow
            let k;
            fadd = fadd + (fadd >> fshift);

            if (fadd > 0x10000000) {
                fadd >>= 24;
                freq[0] >>= 24;
                freq[1] >>= 24;
                freq[2] >>= 24;
                freq[3] >>= 24;

                for (k = 4; k < this.FREQMAX; k++) {
                    freq[k] >>= 24;
                }
            }

            // Relocate new char according to new freq
            let fc = fadd;

            if (mtfno < this.FREQMAX) {
                fc += freq[mtfno];
            }

            for (k = mtfno; k >= this.FREQMAX; k--) {
                this.mtf[k] = this.mtf[k - 1];
            }

            for (; (k > 0) && ((0xffffffff & fc) >= (0xffffffff & freq[k - 1])); k--) {
                this.mtf[k] = this.mtf[k - 1];
                freq[k] = freq[k - 1];
            }

            this.mtf[k] = this.data[i];
            freq[k] = fc;
        }

        /////////////////////////////////
        ////////// Reconstruct the string
        if ((markerpos < 1) || (markerpos >= this.size)) {
            throw new Error("ByteStream.corrupt");
        }

        // Allocate poleters
        let pos = new Uint32Array(this.size);

        for (let j = 0; j < this.size; pos[j++] = 0);

        // Prepare count buffer
        let count = new Array(256);

        for (let i = 0; i < 256; count[i++] = 0);

        // Fill count buffer
        for (let i = 0; i < markerpos; i++) {
            let c = this.data[i];
            pos[i] = (c << 24) | (count[0xff & c] & 0xffffff);
            count[0xff & c]++;
        }

        for (let i = markerpos + 1; i < this.size; i++) {
            let c = this.data[i];
            pos[i] = (c << 24) | (count[0xff & c] & 0xffffff);
            count[0xff & c]++;
        }

        // Compute sorted char positions
        let last = 1;

        for (let i = 0; i < 256; i++) {
            let tmp = count[i];
            count[i] = last;
            last += tmp;
        }

        // Undo the sort transform
        let j = 0;
        last = this.size - 1;

        while (last > 0) {
            let n = pos[j];
            let c = pos[j] >> 24;
            this.data[--last] = 0xff & c;
            j = count[0xff & c] + (n & 0xffffff);
        }

        // Free and check
        if (j != markerpos) {
            throw new Error("ByteStream.corrupt");
        }

        return this.size;
    }

    /** @return {ByteStream} */
    getByteStream() {
        var bsw, size;
        while (size = this._decode()) {
            if (!bsw) {
                bsw = new ByteStreamWriter(size - 1);
                var arr = new Uint8Array(this.data.buffer, 0, this.data.length - 1);
                bsw.writeArray(arr);
            }
        }
        // для высвобождения памяти.
        this.data = null;
        return new ByteStream(bsw.getBuffer());
    }

    /**
     * @param {ByteStream} bs 
     * @return {ByteStream}
     */
    static decodeByteStream(bs) {
        return new BZZDecoder(new ZPDecoder(bs)).getByteStream();
    }

}
