/**
 * This code serves as an example of the API provided by the DjVu.js library.
 * This very API is used by the DjVu.js Viewer.
 * 
 * Start to read the code form the main() function in the same direction as it is executed.
 */

'use strict';

async function syncInterfaceExamples(djvuDocument) {
    // The method is async just because it can be used for indirect djvu files, and then 
    // different parts of a document are loaded lazily. 
    // In case of bundled djvu (one file djvu) there are no async operations actually.
    const djvuPage = await djvuDocument.getPage(1); // note that pages start with 1 NOT WITH 0

    // we can get page size even before it's decoded
    console.log("Page width", djvuPage.getWidth());
    console.log("Page height", djvuPage.getHeight());

    // get the standard ImageData object representing the page
    const imageData = djvuPage.getImageData(); // it's the longest operation, here the page is decoded and image is created.

    // Let's draw the ImageData on a canvas
    const canvas = document.querySelector('#sync-canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0); // But it will be much 

    // In fact, our image is very large, so we need to scale it somehow. Let's use its DPI.
    // DPI is needed to render an image in so called 100% scale.
    // A usual monitor has 96 dpi (let's say 100). Thus, if an image save with 300 dpi, then
    // on a usual monitor you should decrease it 300 / 100 = 3 times.
    // The DjVu.js Viewer uses css scaling only for the initial render. Then it rewrites imageData
    // on the canvas several times, decreasing it 2 times on each render (or less on the last render). 
    // Such manual scaling gives much better quality, than css scaling. 
    // In case of continuous scroll mode, it uses <img>'s rather than canvases, and imgs are scaled via css much better.
    // But here we use only css scaling on a canvas.
    const imageDpi = djvuPage.getDpi();
    canvas.style.width = imageData.width / (imageDpi / 100) + 'px';

    // when a document has a contents table you can get it
    const contents = djvuDocument.getContents();
    console.log('DjVu Document contents \n\n', contents);

    // if you want a raw text of the page. This text is used in the DjVu.js Viewer's text mode.
    const text = djvuPage.getText();
    console.log('DjVu Page text \n\n', text);

    // if you want a structured text zones to create a text layer over an image.
    const topTextZone = djvuPage.getPageTextZone();
    console.log('DjVu Page top text zone \n\n', topTextZone);

    // or another variant (more convenient for absolute positioning, look at the structure of output to understand the difference) 
    const textZones = djvuPage.getNormalizedTextZones();
    console.log('DjVu Page text zones \n\n', textZones);

    // get the number of page in a document
    const pageCount = djvuDocument.getPagesQuantity();
    console.log("There are ", pageCount, " pages in the document");

    // we can get sizes of all pages too. E.g. to render empty pages of an appropriate size while they are being loaded.
    const pageSizes = djvuDocument.getPagesSizes();
    console.log("Pages sizes ", pageSizes);
}

async function asyncInterfaceExamples(djvuWorker) {
    // In case of the worker, you cannot get a DjVuPage object explicitly.
    // You can get only eventual results. 
    // The async interface is similar to the sync one. 
    // djvuWorker.doc is a proxy object, called DjVuTask, which remembers what methods you have called.
    // Each method of the task returns another task. When it's run, the consequence of methods is executed on 
    // a DjVuDocument object which is created inside the Web Worker, and the result is transferred to the main thread.

    // You can execute task in batches (it's faster than one by one)
    // You will get an array of results.
    const [width, height] = await djvuWorker.run(
        djvuWorker.doc.getPage(60).getWidth(),
        djvuWorker.doc.getPage(60).getHeight(),
        // here you can add more tasks
    );

    console.log('Page size is', width, height)

    // But there is a convenience method .run() to execute one task
    const imageData = await djvuWorker.doc.getPage(60).getImageData().run();

    // Let's draw the ImageData on a canvas
    const canvas = document.querySelector('#async-canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0); // But it will be much 

    // You can execute only one task via djvuWorker.run() too.
    // In this case you will get only the result, not an array of results. 
    const imageDpi = await djvuWorker.run(djvuWorker.doc.getPage(60).getDpi()); // actually could be executed in one batch with getImageData()
    canvas.style.width = imageData.width / (imageDpi / 100) + 'px';

    // let's execute more operations 
    const [contents, count, sizes, test, textZones] = await djvuWorker.run(
        djvuWorker.doc.getContents(),
        djvuWorker.doc.getPagesQuantity(),
        djvuWorker.doc.getPagesSizes(),
        djvuWorker.doc.getPage(60).getText(),
        djvuWorker.doc.getPage(60).getNormalizedTextZones(),
    );

    console.log('More data from async interface: ', contents, count, sizes, test, textZones);

    // What's more is that the async interface allow you to create image URLs in a Web Worker
    // asynchronously. If you get an ImageData and then create a URL from it via a canvas element,
    // you still execute a rather costly operation on the main thread. So it's better to do it on the background thread.
    // Namely for this feature, DjVu.js is bundled with Png.js. In Chrome, an image URL can be created via OffscreenCanvas
    // in a web worker, but since Firefox hasn't supported OffscreenCanvas yet, Png.js is used as a polyfill.

    // The Viewer's continuous scroll mode is based on this very feature.
    // This method returns not a simple URL, but an object with some additional data
    // to simplify rendering and memory management.
    const pageData = await djvuWorker.doc.getPage(21).createPngObjectUrl().run();
    console.log('Page image URL with some data', pageData);

    const img = document.querySelector('#async-image');
    img.src = pageData.url;
    img.style.width = pageData.width / (pageData.dpi / 100) + 'px'; // scale it as well as canvases

    // Internally URL.createObjectURL is used. It doesn't create a dataURI, but a short url to a blob inside the worker's memory.
    // It's much faster than to create a dataURI string, but such a URL should be revoked manually after it is used, 
    // otherwise you will get a memory leak. Also, as practice has shown, you can't revoke a URL, created in a web worker,
    // on the main thread, so you should revoke it in a web worker via djvuWorker.revokeObjectURL() method.
    // The byteLength property allow you to count how much memory image blobs occupy in the memory now. Since png format is used,
    // blobs are rather small compared to raw ImageData objects, but still if you don't revoke URLs at all you can get a
    // noticeable memory leak. It should be mentioned, that you will not see this memory leak in a JS profiler - it can be seen
    // only in an OS task manager.
    img.onload = () => {
        djvuWorker.revokeObjectURL(pageData.url);
        console.log(pageData.byteLength, 'bytes were released in the worker memory after the image URL was revoked');
    }

    // In fact this feature with Object URL of pages can be used in the sync interface too.
    // However there is not much sense in it, because it uses OffscreenCanvas or Png.js, while on the main thread you can
    // just use a normal canvas element and control the process by yourself.
}

async function main() {
    // A DjVuDocument is built on top of an ArrayBuffer representing a file. 
    // In case of one-file bundled djvu an ArrayBuffer is all you need to construct a document.
    const arrayBuffer = await fetch('/assets/DjVu3Spec.djvu').then(res => res.arrayBuffer());

    // The sync interface is represented by DjVu.Document.
    // Usually, you should use DjVu.Document only for debug purposes or maybe on server side (don't know will it work there).
    // Synchronous operations on the main thread block UI and it spoils user experience badly.
    // The DjVu.js Viewer uses only async interface (DjVu.Worker).
    // But since the async API is based on the sync one, you should look at the sync interface first.
    console.log('%c\n\n\n Sync Interface results \n\n\n\n', "font-size: 3em; color: blue");
    const djvuDocument = new DjVu.Document(arrayBuffer);

    await syncInterfaceExamples(djvuDocument);

    // The async interface is represented by DjVu.Worker.
    // DjVu.Worker implicitly creates a Web Worker and all operations are executed on a background thread, 
    // not blocking the UI. For this reason, in case of the browser, 
    // it's by all means recommended to always use DjVu.Worker instead of DjVu.Document.
    // We copy the array buffer, since the buffer is transferred to the worker and will not be available on the main thread anymore.
    // Read about Transferable object here https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage
    console.log('%c\n\n\n Async Interface results \n\n\n\n', "font-size: 3em; color: green");
    const arrayBufferCopy = arrayBuffer.slice(0);
    const djvuWorker = new DjVu.Worker(); // do not pass anything to the constructor!
    await djvuWorker.createDocument(arrayBufferCopy);

    await asyncInterfaceExamples(djvuWorker);

    // After all operation are done or you want to load another document to the worker, 
    // you may reset it to free inner structure and recreate a Web Worker. 
    // Right now there is no method to destroy it, but you can do it via djvuWorker.worker.terminate().
    djvuWorker.reset();

    // When you work with both async or sync interfaces you should remember about one thing.
    // When a page is decoded, a lot of memory is allocated for inner structures during a decoding process.
    // So a decoded page object takes about 30 MB of memory 
    // (by the way, an ImageData of 2539 * 3295 pixels takes 2539 * 3295 * 4 / 1024 / 1024 = 31.9 MB too).
    // So if you decode 10 pages you get an overhead of 300 MB. It is pretty much.
    // For this reason, .getPage() method saves the last requested page and reset it (clearing all inner buffers),
    // when another page is requested. Thus, if you access pages only via .getPage() you will not get 300 MB overhead.
    // But such behaviour means, that you should avoid accessing pages arbitrary. In other words, try to get all required data
    // from one page before getting the second, otherwise a page will be decoded several times, every time you access it, and 
    // it's a rather long process, it can take from 100 to 1100 ms depending on a document.
    // Actually, if you want to get something like width, height or dpi of a page, it's not decoded fully, and this metadata
    // is extracted rather quickly, but you should remember: once you requested another page your current one is reset, and needs a full
    // decoding to create an ImageData one more time.
}

void main();

