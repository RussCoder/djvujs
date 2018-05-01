# DjVu.js

## About

DjVu.js is a program library for working with djvu online. It's written in JavaScript and can be run in the web browsers without any connection with the server. DjVu.js can be used for splitting (and concatenation) of djvu files, rendering pages of a djvu document, converting (and compressing) images into djvu documents and for analyzing of metadata of djvu documents.

Also, there is a DjVu.js Viewer, an app which uses DjVu.js in order to render DjVu documents. The app may be easily included into any html page. You can look at it and try it out on the official website (the link is below). 

The library is only being developed and may be noticeably changed in the future. Any contribution is welcome :)

<hr>

DjVu.js - это программная библиотека написанная на JavaScript и предназначенная для работы с файлами формата djvu онлайн. DjVu.js ориентирована на исполнение в браузере пользователя без связи с сервером. Библиотека может быть использована для разделения (объединения) файлов djvu, преобразования картинок в документы djvu, отрисовки страниц документов djvu, а также для анализа мета данных и структуры djvu документов. 

Кроме того, был создан DjVu.js Viewer - приложение, которое можно легко встроить в любую html-страницу. Данное приложение служит для просмотра документов DjVu непосредственно в браузере. Вы можете ознакомиться с ним по ссылке ниже. 

Библиотека djvu.js находится в процессе разработки и может быть значительно изменена в будущем. Любое содействие в развитии библиотеки приветствуется :)

## How to build it

If you have Node.js (v.8.7.0) installed, after you clone the repository, run 
```
npm run make
```` 
in the root folder of the repository. The command will install all dependencies and create bundles of the library and of the viewer (the build folder should appear). 

If you have some problems, read the technical documentation or create an issue. Also you can download the library from the official website. (All links are below).

## Links

- The **official website** with the DjVu.js Viewer demo is https://djvu.js.org
- You may **download the library** and the viewer on https://djvu.js.org/downloads
- The **technical documentation** of the library is available [in the wiki](https://github.com/RussCoder/djvujs/wiki/DjVu.js-Documentation).
- [CHANGELOG of the library](library/CHANGELOG.md)
- [CHANGELOG of the viewer](viewer/CHANGELOG.md)