import { loadPage, loadPageDependency, loadThumbnail } from './load';
import DjVuWriter from '../DjVuWriter';
import { pLimit } from '../DjVu';

/**
 * A method to download and bundle an indirect djvu document
 * @this import('../DjVuDocument').DjVuDocument
 */
export default async function bundle(progressCallback = () => { }) {
    const djvuWriter = new DjVuWriter();
    djvuWriter.startDJVM();
    const dirm = {
        dflags: this.dirm.dflags | 128,
        flags: [],
        names: [],
        titles: [],
        sizes: [],
        ids: [],
    };
    const chunkByteStreams = [];
    const filesQuantity = this.dirm.getFilesQuantity();

    const totalOperations = filesQuantity + 3;

    let pageNumber = 0;

    const limit = pLimit(4);
    let downloadedNumber = 0;
    const promises = [];

    for (let i = 0; i < filesQuantity; i++) {
        promises.push(limit(async () => {
            let bs;
            if (this.dirm.isPageIndex(i)) {
                pageNumber++;
                bs = await loadPage(pageNumber, this._getUrlByPageNumber(pageNumber));
            } else if (this.dirm.isThumbnailIndex(i)) {
                bs = await loadThumbnail(
                    this.baseUrl + this.dirm.getComponentNameByItsId(this.dirm.ids[i]),
                    this.dirm.ids[i]
                );
            } else {
                bs = await loadPageDependency(
                    this.dirm.ids[i],
                    this.dirm.getComponentNameByItsId(this.dirm.ids[i]),
                    this.baseUrl,
                );
            }

            downloadedNumber++;
            progressCallback(downloadedNumber / totalOperations);

            //await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                flags: this.dirm.flags[i],
                id: this.dirm.ids[i],
                name: this.dirm.names[i],
                title: this.dirm.titles[i],
                bs: bs,
            };
        }));
    }

    for (const data of await Promise.all(promises)) {
        dirm.flags.push(data.flags);
        dirm.ids.push(data.id);
        dirm.names.push(data.names);
        dirm.titles.push(data.title);
        dirm.sizes.push(data.bs.length);
        chunkByteStreams.push(data.bs);
    }

    djvuWriter.writeDirmChunk(dirm);
    if (this.navm) {
        djvuWriter.writeChunk(this.navm);
    }

    progressCallback((totalOperations - 2) / totalOperations);

    for (let i = 0; i < chunkByteStreams.length; i++) {
        djvuWriter.writeFormChunkBS(chunkByteStreams[i]);
        chunkByteStreams[i] = null; // release memory
    }

    progressCallback((totalOperations - 1) / totalOperations);

    const newBuffer = djvuWriter.getBuffer();

    progressCallback(1);

    return new this.constructor(newBuffer);
}
