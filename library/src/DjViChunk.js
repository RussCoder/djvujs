'use strict';

class DjViChunk {
    constructor(bs, dirmID) {
        this.bs = bs;
        this.id = bs.readStr4();
        this.dirmID = dirmID;
        this.length = bs.getInt32();
        this.id += bs.readStr4();
        this.innerChunk = null;
        this.init();
    }

    init() {
        while (!this.bs.isEmpty()) {
            let id = this.bs.readStr4();
            let length = this.bs.getInt32();
            this.bs.jump(-8);
            // вернулись назад
            let chunkBs = this.bs.fork(length + 8);
            // перепрыгнули к следующей порции
            this.bs.jump(8 + length + (length & 1 ? 1 : 0));
            this.innerChunk = id === 'Djbz' ? new JB2Dict(chunkBs) : new IFFChunk(chunkBs);
            if (id != 'Djbz') {
                console.error("Unsupported chunk inside the DJVI chunk: ", id);
            }
        }
    }

    toString() {
        var str = '[DirmID: "' + this.dirmID + '"]\n';
        str += this.id + ' ' + this.length + "\n";
        str += this.innerChunk.toString();
        //this.innerChunk.decode();        
        //Globals.canvasCtx.putImageData(this.innerChunk.getImage(), 0, 0);
        return str + '\n';
    }
}
