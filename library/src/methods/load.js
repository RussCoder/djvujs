/** 
 * Logic related to loading pages and dictionaries
 * for indirect djvu documents.
 */

import { loadFileViaXHR } from "../DjVu";
import ByteStream from '../ByteStream';
import {
    NetworkDjVuError,
    UnsuccessfulRequestDjVuError,
    CorruptedFileDjVuError
} from "../DjVuErrors";

/** @returns {ByteStream} */
async function loadByteStream(url, errorData = {}) {
    let xhr;

    try {
        xhr = await loadFileViaXHR(url);
    } catch (e) {
        throw new NetworkDjVuError({ url: url, ...errorData });
    }

    if (xhr.status && xhr.status !== 200) {
        throw new UnsuccessfulRequestDjVuError(xhr, { ...errorData });
    }

    return new ByteStream(xhr.response);
}

function checkAndCropByteStream(bs, compositeChunkId = null, errorData = null) {
    if (bs.readStr4() !== 'AT&T') {
        throw new CorruptedFileDjVuError(`The byte stream isn't a djvu file.`, errorData);
    }

    if (!compositeChunkId) {
        return bs.fork(); // we should skip format id in the page byte stream
    }

    let chunkId = bs.readStr4();
    const length = bs.getInt32();
    chunkId += bs.readStr4();
    if (chunkId !== compositeChunkId) {
        throw new CorruptedFileDjVuError(
            `Unexpected chunk id. Expected "${compositeChunkId}", but got "${chunkId}"`,
            errorData
        );
    }

    return bs.jump(-12).fork(length + 8);
}

/** @returns {ByteStream} */
export async function loadPage(number, url) {
    const errorData = { pageNumber: number };
    return checkAndCropByteStream(await loadByteStream(url, errorData), null, errorData);
}

/** @returns {ByteStream} */
export async function loadPageDependency(id, name, baseUrl, pageNumber = null) {
    const errorData = { pageNumber: pageNumber, dependencyId: id };
    return checkAndCropByteStream(await loadByteStream(baseUrl + name, errorData), 'FORMDJVI', errorData);
}

/** @returns {ByteStream} */
export async function loadThumbnail(url, id = null) {
    const errorData = { thumbnailId: id };
    return checkAndCropByteStream(await loadByteStream(url, errorData), 'FORMTHUM', errorData);
}