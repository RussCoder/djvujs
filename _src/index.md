<link rel="stylesheet" href="dist/djvu_viewer.css"/>

<script src="dist/djvu.js"></script>
<script src="dist/djvu_viewer.js"></script>
<script>
    window.onload = function() { 
        DjVu.Viewer.init(document.querySelector("#for_viewer"));
    }
</script>

# The DjVu.js Viewer demo
DjVu.js is a program library for working with `.djvu` files online.
It's written in JavaScript and can be run in web browsers without any connection with the server.
It's absolutely open source and you can see the source code on [GitHub](https://github.com/RussCoder/djvujs)
Also there is the DjVu.js Viewer, which allows you to view .djvu files online right in the browser.
It's written in ReactJS and powered with DjVu.js library.

Here you can see the Viewer and try it out. 

<div id="for_viewer"></div>