## How to use it

Create a folder with all 3 files, that you have downloaded here (`djvu.js`, `djvu_viewer.js` and `djvu_viewer.css`). Then in the same folder create an .html file (let's say `index.html`) with the following content.

```markup
<!DOCTYPE html>
<html>

<header>
	<meta charset="utf-8">
	<script id="djvu_js_lib" src="djvu.js"></script>
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

>Note that it's important to add `id` attribute `djvu_js_lib` to the script with `djvu.js`. Otherwise, the DjVuWorker may not be able to find the script url and create a Web Worker object.  

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