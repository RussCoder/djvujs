## How to use it

Create a folder with files that you downloaded from here (`djvu.js`, `djvu_viewer.js`). Then in the same folder create an .html file (let's say `index.html`) with the following content.

```html
<!DOCTYPE html>
<html>

<header>
    <meta charset="utf-8">
    <script src="djvu.js"></script>
    <script src="djvu_viewer.js"></script>

    <style>
        #for_viewer {
            height: 80vh;
            width: 90vw;
            margin: 5vh auto;
            border: 1px solid black;
        }
    </style>

    <script>
        window.onload = function() {
            // save as a global value
            window.ViewerInstance = new DjVu.Viewer();
            // render into the element
            window.ViewerInstance.render(
                document.querySelector("#for_viewer")
            );
        };
    </script>

</header>

<body>
    <div id="for_viewer"></div>
</body>

</html>

```

If you use Mozilla Firefox web browser, then you can just open the `index.html` and you will see the DjVu.js viewer, which will work absolutely the same way
as it does on the main page of this website. But if you use Google Chrome or Opera, you won't see anything except for some errors in the console. It's concerned with that the 
DjVu.js uses the Web Workers API of the web browsers and Chrome doesn't allow the script to create a Worker, when the file is loaded from the file system directly. In other words, you just need
to start a local web server in order to make everything work as it works on the Internet. Any static web server will do. 

For example, if you have Node.js installed, you can just use the `serve` package to run a simple static web server. Run the following commands in your shell. 

```
npm install -g serve
```

to install the `serve` package globally and then head to the directory, where our files are kept, and run

```
serve -p 5000
```

in order to start the local server (you may change the port as you wish). Then just open [http://localhost:5000/](http://localhost:5000/) and you will see the viewer.

## Programmatic API

Furthermore, the viewer has an API, which allows to open djvu files programmatically:

- `loadDocument(buffer, name = "***", config = null)` - accepts the `ArrayBuffer` and a name of a document which should be shown at footer (it's optional).
- `async loadDocumentByUrl(url, config = null)` - loads the documents as an `ArrayBuffer` and then invokes the previous method.
- `configure(config)` - just sets the options. Note, that when a document is loaded some option are reset to the initial ones, so you have to call the method again or use the last parameter of the two previous methods.
- `getPageNumber()` - returns the current page number.
- `on(eventName, handler)` - to add an event handler.
- `off(eventName)` - to remove an event handler.

The `config` is an object containing options for the viewer. It's an optional parameter. It has the following shape:
```json5
// any of the parameters may be omitted, use only those you need
{
  pageNumber: 10,
  pageRotation: 90,
  pageScale: 2,
  language: 'ru',
  theme: 'dark',
  djvuOptions: {
    baseUrl: "/url/to/directory/with/indirect/djvu/"
  },
  uiOptions: {
    hideFullPageSwitch: true,
    changePageOnScroll: false,
    showContentsAutomatically: false,
    onSaveNotification: {
      text: "Here is your notification/agreement for the user",
      yesButton: "Text on the yes button", // optional
      noButton: "Text on the no button", // optional
    },
  },
}
```

- `pageNumber` - the number of a currently opened page. Greater than or equal to 1. If it's less than 1, 1 will be used, if it's greater than the 
  total number of pages in a document, then the last page number will be used.
- `pageRotation` - the rotation of a page, it can be 0, 90, 180, 270.
- `pageScale` - the scale of a page, it is a number from 0.1 to 6 (~ 10% to 600%). Numbers less/greater than the limits are replaced by the limits themselves, to wit, 8 will be treated as 6, and 0.001 as 0.1, 0 will be ignored at all and the default scale value (which is 1) will be used.  
- `language` - 2-character language code like `ru`, `en`, `sv` etc.
Use `DjVu.Viewer.getAvailableLanguages()`to get the full list of languages which can be used.
Note, you also can [add your own language](https://github.com/RussCoder/djvujs/blob/master/TRANSLATION.md).
- `theme` - the color theme. Either `light` or `dark`. By default the browser's color scheme is used (or the value save in the local storage).
- `djvuOptions` - an object which is passed to the library. Now there is only one option - the base url, which is the url to the directory containing the files of an indirect djvu. For bundled djvu this parameter is not required. The base url is extracted automatically from a url to the index.djvu, when the `loadDocumentByUrl` is called, but in case of `loadDocument` method, this parameter should be provided manually.
- `uiOptions` - options to adjust the UI of the viewer:
  - `hideFullPageSwitch` - if `true` there will be no full-page mode switch. It
    may be used, if the viewer takes the whole page by default, so the switch is
    useless.
  - `changePageOnScroll` - relevant only for single-page view mode. By default,
    if you continue to scroll, when a page has been already scrolled to the very
    bottom, there will be a transition to the next page. When this option
    is `false` this behavior is disabled.
  - `showContentsAutomatically` - by default, if there is a table of contents in
    a document, it's shown automatically right after the document has been
    opened. When this parameter is `false`, the table of contents is kept
    minimized.
  - `onSaveNotification` - an object containing 3 fields: `text` - the main
    text, `yesButton` (optional) - what is written on the "yes" button,
    `noButton` (optional) - what is written on the "no" button. It's needed if
    you want to show some notification/agreement to the user when he tries to
    download a document.

There are several static methods and properties:

- `DjVu.Viewer.VERSION` - the current version of the viewer.
- `DjVu.Viewer.getAvailableLanguages()` - a method to get the list of languages added to the viewer.
- `DjVu.Viewer.Events` - an object containing events which are fired by the viewer (see further examples):
  - `PAGE_NUMBER_CHANGED` - fired when the number of a currently opened page is changed. The event handler receives no arguments.

## More examples

If you want to load file, select the page number and keep track of what page is currently open, you can do the following:

```js
async function loadDocument() {
    const viewer = new DjVu.Viewer();
    viewer.render(document.getElementById('for_viewer'));
    await viewer.loadDocumentByUrl('assets/my-djvu-file.djvu');

    viewer.configure({ // you also can pass the same object as a second parameter to .loadDocumentByUrl()
        pageNumber: 10,
    });

    viewer.on(Djvu.Viewer.Events.PAGE_NUMBER_CHANGED, () => { // no args are passed here
        console.log('Page number changed to', viewer.getPageNumber());
    })
}
```

Also you can load the file by your own (as an `ArrayBuffer`) and then use the `loadDocument` method. However, in case of the `loadDocumentByUrl` you will see the progress bar of loading, if your file is rather big.

You can create several links to djvu files and open them in the viewer, when a user clicks on them. Here is the complete example:

```html
<!DOCTYPE html>
<html>

<header>
    <meta charset="utf-8">
    <script id="djvu_js_lib" src="djvu.js"></script>
    <script src="djvu_viewer.js"></script>
    <script src="reloader.js"></script>

    <script>
        window.onload = function() {
            // save as a global value
            window.ViewerInstance = new DjVu.Viewer();
            // render into the element
            window.ViewerInstance.render(
                document.querySelector("#for_viewer")
            );

            // get all special links
            document.querySelectorAll('a.djvu').forEach(link => {
                link.addEventListener('click', e => {
                    // we don't want to download the file
                    e.preventDefault();
                    // open the file in the viewer by its url
                    ViewerInstance.loadDocumentByUrl(link.href);
                });
            });
        };
    </script>

    <style>
        /* make it pretty-looking */

        body {
            height: 100vh;
            margin: 0;
        }

        #for_viewer {
            height: 80vh;
            width: 90vw;
            margin: 5vh auto;
            border: 1px solid black;
        }

        a.djvu {
            display: inline-block;
            margin: 2vh 2vw;
            border: 1px solid gray;
            text-decoration: none;
            color: inherit;
            padding: 1vh 1vw;
            border-radius: 0.5em;
        }

        a.djvu:hover {
            background: lightgray;
        }
    </style>

</header>

<body>
    <a href="DjVu3Spec.djvu" class="djvu">Open DjVu3Spec.djvu</a>
    <a href="colorbook.djvu" class="djvu">Open colorbook.djvu</a>
    <div id="for_viewer"></div>
</body>

</html>
```

The same technique is used on the main page of this website. You can open both `DjVu3Spec.djvu` and `colorbook.djvu` in the viewer on the main page, then save them through the viewer (Ctrl+S) and run the example posted above. Note that you have to run a local server to make everything work. 
