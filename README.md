# DjVu.js

## About / О проекте

**DjVu.js** is a program library for working with `.djvu` online. It's written
in JavaScript and can be run in the web browsers without any connection with the
server. DjVu.js can be used for splitting (and concatenation) of `.djvu` files,
rendering pages of a `.djvu` document, converting (and compressing) images
into `.djvu` documents and for analyzing of metadata of `.djvu` documents.

**DjVu.js Viewer** is an app which uses DjVu.js in order to render DjVu
documents. The app may be easily included into any html page. You can look at it
and try it out on the official website (the link is below).

**DjVu.js Viewer browser extension**. By and large it's a copy of the viewer,
but also it allows opening links to `.djvu` files right in the browser without
explicit downloading of a file. The links to the extension are below.

<hr>

**DjVu.js** - это программная библиотека написанная на JavaScript и
предназначенная для работы с файлами формата `.djvu` онлайн. DjVu.js
ориентирована на исполнение в браузере пользователя без связи с сервером.
Библиотека может быть использована для разделения (объединения) файлов `.djvu`,
преобразования картинок в документы `.djvu`, отрисовки страниц
документов `.djvu`, а также для анализа мета данных и структуры `.djvu`
документов.

**DjVu.js Viewer** - приложение, которое можно легко встроить в любую
html-страницу. Данное приложение служит для просмотра документов DjVu
непосредственно в браузере. Вы можете ознакомиться с ним по ссылке ниже.

**Расширение для браузера DjVu.js Viewer**. По большей части это копия
приложения DjVu.js Viewer, однако также расширение позволяет открывать ссылки
на `.djvu` файлы прямо в браузере, не скачивая файл явно. Ссылки на расширение
доступны ниже.

## Translation (localization)

If you want to add a new translation to the viewer [read here](TRANSLATION.md)
how to do it.

## How to build it

If you have Node.js (10.x or higher) installed, after you cloned the repository,
run

```
npm run install
npm run build
```` 

in the root folder of the repository. The command will install all dependencies
and create bundles of the library and of the viewer (the build folder should
appear).

Also there is another way to do the same operations:

```
npm run make
```

The command will clean all git-ignored files, install all the dependencies and
build the library and the viewer. However, you should have `git` installed of
course and the repository should have the `.git` folder (there is no one in the
source code uploaded to the browser extensions websites).

## How to start the viewer in the dev mode

You have to build the library once. You can archive it via `npm run make`. Then
you can start the viewer:

```
cd viewer
npm start
```

### How to pack the extension

After the two commands above are executed (`install` and `build`), the extension
folder will contain all the necessary files, that is to say, the folder is an
unpacked extension. If you want to pack the extension, you should have
the `web-ext` module installed globally, to wit, `npm install web-ext -g`, and
then just change the directory:

```
cd extension
```

and run

```
web-ext build
```

and the packed version of the extension will appear in the extension folder.

If you have some problems, read the technical documentation or create an issue.
Also you can download the library from the official website. (All links are
below).

## Links

- The **official website** with the DjVu.js Viewer demo is https://djvu.js.org
- You may **download the library** and the viewer
  on https://djvu.js.org/downloads
- The **browser extension**
  for [Mozilla Firefox](https://addons.mozilla.org/en-US/firefox/addon/djvu-js-viewer/)
- The **browser extension**
  for [Google Chrome](https://chrome.google.com/webstore/detail/djvujs-viewer/bpnedgjmphmmdgecmklcopblfcbhpefm)
- The **technical documentation** of the library is
  available [in the wiki](https://github.com/RussCoder/djvujs/wiki/DjVu.js-Documentation)
- [CHANGELOG of the library](library/CHANGELOG.md)
- [CHANGELOG of the viewer](viewer/CHANGELOG.md)

## License / Лицензия

The DjVu.js Library is distributed under the terms of [GNU GPL v2](GNU_GPL_v2).
Everything else in this repository (including the DjVu.js Viewer and the browser
extension) is under [The Unlicense](THE_UNLICENSE). Read more in
the [LICENSE file](LICENSE.md).

<hr>

Библиотека DjVu.js распространяется под лицензией [GNU GPL v2](GNU_GPL_v2). Все
остальное в этом репозитории (включая DjVu.js Viewer и расширение для браузера)
является общественным достоянием ([The Unlicense](THE_UNLICENSE)). Читайте
подробнее в [файле лицензии](LICENSE.md).