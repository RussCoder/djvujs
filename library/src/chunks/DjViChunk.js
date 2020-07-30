import JB2Dict from '../jb2/JB2Dict';
import { IFFChunk, CompositeChunk } from './IFFChunks';
import DjVuAnno from './DjVuAnno';

export default class DjViChunk extends CompositeChunk {
    constructor(bs) {
        super(bs);
        this.innerChunk = null;
        this.init();
    }

    init() {
        // In some cases there maybe only DJVI headers and nothing else (assets/polish_indirect/shared_anno.iff),
        // so the innerChunk can remain null
        while (!this.bs.isEmpty()) {
            var id = this.bs.readStr4();
            var length = this.bs.getInt32();
            this.bs.jump(-8);
            // вернулись назад
            var chunkBs = this.bs.fork(length + 8);
            // перепрыгнули к следующей порции
            this.bs.jump(8 + length + (length & 1 ? 1 : 0));
            switch (id) {
                case 'Djbz':
                    this.innerChunk = new JB2Dict(chunkBs);
                    break;

                case 'ANTa':
                case 'ANTz':
                    this.innerChunk = new DjVuAnno(chunkBs);
                    break;

                default:
                    this.innerChunk = new IFFChunk(chunkBs);
                    console.error("Unsupported chunk inside the DJVI chunk: ", id);
                    break;
            }
        }
    }

    toString() {
        return super.toString(this.innerChunk.toString());
    }
}
