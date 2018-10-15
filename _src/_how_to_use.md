## How to use it

Create a folder with all 3 files, that you have downloaded here (`djvu.js`, `djvu_viewer.js` and `djvu_viewer.css`). Then in the same folder create an .html file (let's say `index.html`) with the following content.

```markup
<!DOCTYPE html>
<html>

<header>
	<meta charset="utf-8">
	<script src="djvu.js"></script>
	<script src="djvu_viewer.js"></script>
	<link href="djvu_viewer.css" rel="stylesheet">

	<script>
		window.onload = function () {
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

Furthermore, the viewer has a program API, which allows to open djvu files programmatically:

- `loadDocument(buffer, name = "***", config = null)` - accepts the `ArrayBuffer` and a name of a document which should be shown at footer (it's optional).
- `async loadDocumentByUrl(url, config = null)` - loads the documents as an `ArrayBuffer` and then invokes the previous method.
- `configure(config)` - just sets the options. Note, that when a document is loaded some option are reset to the initial ones, so you have to call the method again or use the last parameter of the two previous methods.

The `config` is an object containing options for the viewer. It's an optional parameter. It has the following shape:
```json

{
    pageRotation: 90,
    djvuOptions: {
        baseUrl: "/url/to/directory/with/indirect/djvu/"
    }
}

```

- `pageRotation` - the rotation of a page, it can be 0, 90, 180, 270.
- `djvuOptions` - an object which is passed to the library. Now there is only one option - the base url, which is the url to a directory which contains the files of an indirect djvu. For bundled djvu this parameter is not required. The base url is extracted automatically from a url to the index.djvu, when the `loadDocumentByUrl` is called, but in case of `loadDocument` method, this parameter should be provided manually.

Thus, to load a document programmatically you can do the following:

```
var viewer = new DjVu.Viewer();
viewer = render(document.getElementById('for_viewer'));
viewer.loadDocumentByUrl('assets/my-djvu-file.djvu');
```

Also you can load the file by your own and then use the `loadDocument` method. However, in case of the `loadDocumentByUrl` you will see a progress bar of loading, if your file is rather big.

You can create several links to djvu files and open them in the viewer, when a user clicks on them. Here is the complete example:

```markup
<!DOCTYPE html>
<html>

<header>
    <meta charset="utf-8">
    <script id="djvu_js_lib" src="djvu.js"></script>
    <script src="djvu_viewer.js"></script>
    <link href="djvu_viewer.css" rel="stylesheet">
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
