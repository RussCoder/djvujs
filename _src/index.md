<link rel="stylesheet" href="dist/djvu_viewer.css"/>

<script src="dist/djvu.js"></script>
<script src="dist/djvu_viewer.js"></script>
<script>
    window.onload = function() { 
        DjVu.Viewer.init(document.querySelector("#for_viewer"));
    }
</script>

# The DjVu Viewer demo
DjVu.js is a program library for working with djvu files online.
It's written in JavaScript and can be run in the web browsers without any connection with the server.
It's absolutely open sourse and you can see the source code on [GitHub](https://github.com/RussCoder/djvujs)
Also there is the DjVu.js Viewer wirtten in ReactJS and powered with DjVu.js library.

Here you can see the Viewer and try it out. 

<div id="for_viewer"></div>

