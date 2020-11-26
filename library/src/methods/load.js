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
export async function loadPage(number, url) {
    let xhr;

    try {
        xhr = await loadFileViaXHR(url);
    } catch (e) {
        throw new NetworkDjVuError({ pageNumber: number, url: url });
    }

    if (xhr.status && xhr.status !== 200) {
        throw new UnsuccessfulRequestDjVuError(xhr, { pageNumber: number });
    }

    const pageBuffer = xhr.response;
    const bs = new ByteStream(pageBuffer);
    if (bs.readStr4() !== 'AT&T') {
        throw new CorruptedFileDjVuError(`The file gotten as the page number ${number} isn't a djvu file!`);
    }

    return bs.fork(); // we should skip format id in the page byte stream
}

/** @returns {ByteStream} */
export async function loadPageDependency(id, name, baseUrl, pageNumber) {
    const url = baseUrl + name;
    let xhr;

    try {
        xhr = await loadFileViaXHR(url);
    } catch (e) {
        throw new NetworkDjVuError({ pageNumber: pageNumber, dependencyId: id, url: url });
    }

    if (xhr.status && xhr.status !== 200) {
        throw new UnsuccessfulRequestDjVuError(xhr, { pageNumber: pageNumber, dependencyId: id });
    }

    const bs = new ByteStream(xhr.response);
    if (bs.readStr4() !== 'AT&T') {
        throw new CorruptedFileDjVuError(
            `The file gotten as a dependency ${id} ` +
            (pageNumber ? `for the page number ${pageNumber}` : '') +
            ` isn't a djvu file!`
        );
    }

    let chunkId = bs.readStr4();
    const length = bs.getInt32();
    chunkId += bs.readStr4();
    if (chunkId !== "FORMDJVI") {
        throw new CorruptedFileDjVuError(
            `The file gotten as a dependency ${id} ` +
            (pageNumber ? `for the page number ${pageNumber}` : '') +
            ` isn't a djvu file with shared data!`
        );
    }

    return bs.jump(-12).fork(length + 8);
}