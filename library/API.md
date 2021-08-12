# DjVu.js Library API

> The library is supposed to work in the browser. Theoretically, it should work
> in Node.js too (with some limitations), but I have never did it, and the
> current bundle is just an IIFE. 

The whole API is available in two forms - synchronous, when all operations are
run in the main thread, and the asynchronous, when all operations are run in the
Web Worker. The last one is preferred in case of browsers, because it may take
up to several seconds to render a page, and no one wants to freeze the UI for
such a long time.

However, the async API is mostly a wrapper around the sync one, so all methods are
described in their sync version.

The library adds one object to the global scope - `DjVu`. 

## Synchronous API 

The sync API is represented via the `DjVu.Document` constructor:

```js
DjVu.Document(arrayBuffer, { baseUrl = null, memoryLimit = MEMORY_LIMIT } = {})
```

Arguments:
- `arrayBuffer` is an `ArrayBuffer` object representing the file. 
- `baseUrl` is the URL to the folder where the indirect djvu is stored. It's
  required only in case of indirect djvu documents (the documents where each
  page is a separate file) to construct an absolute URL to the pages (cause
  inside the document all references are relative).
- `memoryLimit` - shouldn't be provided at all in most cases. The default value
  is 50 MB. This value is the upper border of the memory used to store pages of
  an indirect djvu. If the total size of downloaded pages exceeds this limit,
  the library removes some of them before downloading new pages. 

And example for a bundled (one file) djvu document: 

```js
const bundledDjVuArrayBuffer = await fetch('/bundled.djvu').then(r => r.arrayBuffer());
const doc = new DjVu.Document(bundledDjVuArrayBuffer);
```

And example for an indirect (multi-file) djvu document:

```js
const indexFileBuffer = await fetch('/some_indirect_djvu/index.djvu').then(r => r.arrayBuffer());
const doc = new DjVu.Document(indexFileBuffer, { baseUrl: '/some_indirect_djvu' });
```

The constructor creates a `DjVuDocument` instance which has the following methods:

- `getPagesSizes(): Array<{width: number, height: number, dpi: number}>` -
  returns an array of pages sizes. Needed for the continuous scroll view mode in
  the viewer to determine the total height of the view area and of each page.
- `isBundled(): boolean` - returns `true` if the document is bundled (one-file).
  `false` if it's indirect (multi-file).
- `getPagesQuantity(): number` - returns the total number of pages in the
  document.
- `getContents(): Array<Bookmark>`, where `Bookmark` is   
  `{description: string, url: string, children?: Array<Bookmark>}` - returns the
  table of contents, if it exists in the document.
- `getMemoryUsage(): number` - returns the amount of the memory used to store
   parts of an indirect djvu document.
- `getMemoryLimit(): number` - returns the current memory limit for an indirect
  djvu.
- `setMemoryLimit(limit = MEMORY_LIMIT): void` - sets the memory limit.
- `getPageNumberByUrl(url: string): ?number` - returns the page number
  corresponding to the `url` from a `Bookmark`, that is, from the table of
  contents. If the page cannot be found, `null` is returned. 
- `async getPage(number: number): Promise<DjVuPage>` - this method is async,
  cause it works both in case of a single-file djvu and an indirect one, and in
  the latter case the page and its dependencies have to be downloaded first. It
  accepts the page number starting from 1 (not from 0). What's more, this method
  automatically reset the previously requested page (read about it in the
  methods of `DjVuPage`), which allows you not to care about memory leaks.
- `getPageUnsafe(number: number): DjVuPage` - in case of a bundled djvu, you can
  get a page synchronously. But you will have to `page.reset()` manually after
  you finished working with the page. Otherwise, you risk overusing memory.
  Prefer `getPage()` to this method.
- `createObjectURL(): string` - creates a url to download the file (it should be
  revoked afterwards).
- `slice(from = 1, to = this.getPagesQuantity()): DjVuDocument` - creates a
  document from a subset of pages, including the first and the last page. Pages
  are counted from 1. This method isn't production-ready. It may work
  incorrectly in some cases, and it doesn't split the table of contents, but
  copies it completely to the new document.
- `async bundle(progressCallback: (progress: number) => void): Promise<DjVuDocument>`
  \- downloads and bundles an indirect djvu into one-file document. Accepts a
  callback which is invoked with a number parameter which takes values from 0 to
  1 and provides an ability to track the progress.
- `toString(): string` - returns metadata describing the structure of the
  document. Useful if you are familiar with the DjVu Specification.

The most important method is `async getPage(number)` which returns `DjVuPage`
with the following methods: 

- `getWidth(): number` - width in pixels.
- `getHeight(): number` - height in pixels.
- `getDpi(): number` - returns the dpi value. This value is required to
  determine the "100%" scale factor. E.g. a usual monitor has 96 dots per inch
  (let's say 100). If a document has 300 dpi (more precisely, it was scanned
  with the resolution of 300 dpi), it means that its "real size" is 300 / 100 =
  3 times smaller than its full size in pixels.
- `getRotation(): 0 | 90 | 180 | 270` - the rotation of the page. It's needed
  only to show it properly to the user.
- `getImageData(rotate = true): ImageData` - returns `ImageData` object
  representing the page. By default, it has been already rotated (if it's
  required), and you do not need `getRotation()` at all.
- `async createPngObjectUrl(): Promise<PngObjectData>` - creates a PNG image of
  the page, and forms a URL via `URL.createObjectURL()`. It means that you have
  to `URL.revokeObjectURL(url)` (or `worker.revokeObjectURL(url)` in case of the
  async API) once you need it no longer, otherwise there will be memory leaks.
  The `PngObjectData` has the following structure:

  ```ts
  {
    url: string, // do not forget to revoke it
    byteLength: number, // the size of the PNG image retained by the URL
    width: number,
    height: number,
    dpi: number,
  }
  ```
  This method uses `OffscreenCanvas`, but if it's not available (as in Firefox)
  it uses `png.js` library as a fallback. `png.js` is the only dependency of the
  library, and it takes more than 50% of the eventual bundle.

  The method itself is very useful, because a djvu page can easily take 30 MB of
  memory (and more) as a raw `ImageData` object (4 bytes per a pixel), while the
  same image in the PNG format takes less than 0.5 MB. Also, images are much
  better scaled via CSS than canvases. The continuous scroll mode would be
  impossible without this method, because it would take too much memory to
  render many pages on canvases.

- `getText(): string` - returns the page's text as one string, if it exists on
  the page.
- `getNormalizedTextZones(): ?Array<TextZone>` - returns the array of text zones
  to form a text layer above the page's image. The `TextZone` object is the
  following:

  ```ts
  {
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
  }
  ```

  Its coordinates are relative to the page's top left corner, that is, all zones
  should be absolutely positioned.
- `toString(): string` - returns metadata describing the structure of the page.
  Useful if you are familiar with the DjVu Specification.
- `reset(): void` - resets the page's inner structures. During the decoding
  phase, which is called lazily when different parts of the page's data are
  requested, a lot of temporary structures are allocated. To release the memory,
  you have to reset the page. Otherwise, it will retain a lot of memory for that
  structures. Page objects are created in the constructor of the document, so
  they are not garbage collected, until the document is removed. If you get
  pages via `await doc.getPage(number)` method, you can do nothing since it
  takes care to reset a page when the next one is requested.


## Asynchronous API

The asynchronous API is represented via the `DjVu.Worker` constructor: 

```js
new DjVu.Worker(urlToTheLibrary = DEFAULT_VALUE);
```

It may accept a URL to the DjVu.js Library, but in a normal case you do not have
to provide it explicitly at all, since the library creates an ObjectURL from its
code automatically. This param can be required only if you run the code in some
environment which prohibits to execute code from ObjectURL or data URIs, e.g. in
case of a browser extension. But in case of a usual web page it's not needed.

So the example is:

```js
const worker = new DjVu.Worker();
```

The `DjVuWorker` instance has the following methods and props: 

- `async createDocument(buffer: ArrayBuffer, options: Object): Promise` -
  invokes the
  `DjVu.Document` constructor in the Web Worker. Accepts the same parameters.
  Note that `buffer` is transferred to the Web Worker, so it will be unavailable
  after you call his method.
- `async run(): Promise` - a special methods to execute a `DjVuWorkerTask`
  object (or several). Read about the `doc` property to understand how to use
  it.
- `get doc: DjVuWorkerTask` - a read only property which is the heart of the
  async API. It mimics the `DjVuDocument` object, but in fact it's
  a `DjVuWorkerTask` (which is a  `Proxy`), and you can call any method on it,
  and it always returns another `DjVuWorkerTask` (until you call the `run()`
  method). It's better to look at the examples first:

  ```js
  const [text, textZones] = await worker.run(
    worker.doc.getPage(pageNumber).getText(),
    worker.doc.getPage(pageNumber).getNormalizedTextZones(),
  );

  const pagesSizes = await worker.doc.getPagesSizes().run();
  ```

  In the first example two tasks are run in one bunch, and the array of results
  is returned (inside a `Promise` of course). In the second example only one
  task is executed via a special method `run()` which is the same as to do:

  ```js
  const pagesSizes = await worker.run(worker.doc.getPagesSizes());
  ```

  Using this API you can call any chain of methods on the `DjVuDocument` inside
  the Web Worker. However, you should remember, that you **cannot get complex
  objects like `DjVuPage`** (but you still **can pass callbacks to the worker**,
  e.g. in case of the `bundle()` method). You can only get the eventual results
  like  `ArrayBuffer`'s, `ImageData`'s, strings, plain objects and numbers.
  Also, despite the fact `DjVuDocument.getPage()` method is async, you can use
  in as a sync one in the methods chain. The same takes place in case of any
  other async methods.

  The fact we cannot access the `DjVuPage` directly via the async API conditions
  the current architecture, due to which we have to `reset()` pages manually in
  case of the sync API - otherwise two tasks in one bunch would require to
  decode the page twice, while now it's decoded lazily and only once.

  In essence, when you call methods on a `DjVuWorkerTask` object it just pushes
  the method's name and its arguments into an array, which is passed to the Web
  Worker when you call the `run()` method. All those methods are applied to the
  `DjVuDocument` instance one by one, and the eventual result is passed back.

- `cancelTask(promise: Promise): void` - cancels the task. Accept the promise
  returned by the `run()` method. 
- `emptyTaskQueue(): void` - cancels all tasks except the current one.
- `dropCurrentTask(): void` - forgets about the current task (it cannot be
  really stopped once it began to execute).
- `cancelAllTasks(): void` - invokes two previous methods.

  It's worth saying that if you initiate a lot of tasks via the `run()` method,
  they are not passed to the Web Worker at once, so they can be just deleted
  from the queue. But when a task has been sent, there is no way to stop it,
  except for the Web Worker termination and recreation, but in this case you
  will lose the `DjVuDocument` created inside. 

  Since the library doesn't work too fast, these "cancel task" methods are
  useful in some cases, e.g. the DjVu.js Viewer renders the current page, the
  previous and the next in case of the single page mode, and 15 pages back and
  forward in case of the continuous scroll mode. If a user looks at the
  current page, the viewer at the same time may be rendering other pages to
  show them quickly when the user turns a page over. But if he just jumps in
  100 pages, there is no use in those pages which were to be rendered, so
  those tasks have to be cancelled and new tasks are to be initiated. The same
  need to cancel a task occurs when the user quickly clicks on the next page
  button.

- `isTaskInQueue(promise: Promise): boolean` - checks whether the task is in the
  queue.
- `isTaskInProcess(promise: Promise): boolean` - checks whether the task has
  been already started.
- `revokeObjectURL(url: string): void` - formerly, if an ObjectURL had been
  created inside a worker it could be revoked only inside this very worker. I
  checked it by myself, but now it seems that this behavior has been fixed and
  usual `URL.revokeObjectURL()` works too. But this method is still available if
  you wish to revoke the URL inside the worker in which it was created.
- `reset(): void` - recreates the worker.

## Additional Notes

Besides `DjVu.Worker` and `DjVu.Document`, there are also:

- `DjVu.VERSION` - a string with the current version.
- `DjVu.ErrorCodes` - an object with all possible error codes created by the
  library. Perhaps, it's worth describing them more profoundly. But for now,
  just print it to the console to see the codes. These error codes I use mostly
  in tests, they are not something too important.

If you want more practical examples of the library usage, you can take a look at
`viewer/src/sagas` files. There are real examples of the async API usage.

If you want to know more about the inner DjVu structure, it's worth reading the
[DjVu Specification](./assets/DjVu3Spec.djvu?raw=true).

If something isn't intelligible enough, feel free to create an issue.
