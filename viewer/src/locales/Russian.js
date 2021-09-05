/**
 * The exemplary dictionary which should be used for the creation of other localizations.
 * Copy this file and change all Russian strings to your own.
 * Remove this (the topmost) comment, but leave other comments in place.
 *
 * Another way to create a template file with nulls instead of translated strings is to
 * run the following command inside the `viewer` directory:
 *
 * npm run syncLocales EnglishNameOfNewLanguage
 *
 * It will generate the EnglishNameOfNewLanguage.js file in the locales folder.
 */

/**
 * Some phrases contain insertions, e.g. icons and buttons, which are inserted in the code.
 * Here instead of visual components we use placeholders, e.g. #helpButton, which start with #.
 * Your translated phrase MUST also contain the same placeholder, but you can change its position.
 *
 * Some phrases are tooltips, that is, they are visible only when you hover the cursor over controls.
 *
 * Preserve the order of phrases and put the translation on a new line.
 * (for convenience of further additions and corrections).
 *
 * All null values mean that the corresponding strings need to be translated.
 * Such values are added automatically for convenience as placeholders.
 */

export default {
    // language info
    englishName:
        "Russian",
    nativeName:
        "Русский",

    "Language":
        "Язык", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "Добавить еще",
    "The translation isn't complete.":
        "Перевод неполный.",
    "The following phrases are not translated:":
        "Следующие фразы не переведены:",
    "You can improve the translation here":
        "Вы можете улучшить перевод тут",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - узнать больше о программе",
    "#optionsButton - see the available options":
        "#optionsButton - изменение настроек",
    "powered with":
        "основано на",
    "Drag & Drop a file here or click to choose manually":
        "Перетащите сюда файл или кликните, чтобы выбрать его вручную",
    "Paste a URL to a djvu file here":
        "Вставьте ссылку на .djvu файл",
    "Open URL":
        "Открыть ссылку",
    'Enter a valid URL (it should start with "http(s)://")': // an alert shown when you try to open an empty URL
        'Введите корректную ссылку (она должна начинаться с "http(s)://")',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "Ошибка",
    "Error on page":
        "Ошибка на странице", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "Ошибка сети", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "Проверьте свое интернет-соединение",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "Ошибка веб-запроса",
    "404 Document not found":
        "404 Документ не найден",
    "403 Access forbidden":
        "403 Доступ запрещен",
    "500 Internal server error":
        "500 Внутренняя ошибка сервера",
    "The request failed with HTTP status #status":
        "Запрос завершился с HTTP-статусом #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "DjVu-файл поврежден",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "Файл не соответствует спецификации формата DjVu, или же это не весь DjVu-документ",
    "Incorrect file format": // Open a not-djvu file.
        "Неверный формат файла",
    "The provided file is not a DjVu document":
        "Загруженный файл не является DjVu-документом",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "Некорректный номер страницы",
    "There is no page with the number #pageNumber":
        "Страницы с номером #pageNumber не существует",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "Нет ссылки на директорию документа",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "Вероятно, вы открыли многофайловый (indirect) DjVu-документ вручную.",
    "But such multi-file documents can be only loaded by URL.":
        "Однако, такие документы могут быть загружены только по ссылке.",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "Непредвиденная ошибка",
    "Cannot print the error, look in the console":
        "Невозможно вывести ошибку в текстовом виде, посмотрите в консоль",

    // Options and its tooltips
    "Options":
        "Настройки",
    "Show options window":
        "Открыть окно настроек",
    "Color theme":
        "Цветовая схема",
    "Extension options":
        "Настройки расширения", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "Открывать все ссылки с .djvu на конце через расширение",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "Все ссылки на .djvu файлы будут открываться расширением по клику на ссылке",
    "Detect .djvu files by means of http headers":
        "Определять .djvu файлы по http заголовкам",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "Анализировать заголовки каждой новой вкладки, чтобы определять файлы даже без расширения \".djvu\" в ссылке",

    // Footer: status bar
    "Ready":
        "Готово",
    "Loading":
        "Загрузка",

    // Footer: buttons' tooltips
    "Show help window":
        "Показать окно справки",
    "Switch full page mode":
        "Переключить полностраничный режим",

    // File Block tooltips
    "Choose a file":
        "Выберите файл",
    "Close document":
        "Закрыть документ",
    "Save document":
        "Сохранить документ",
    "Save":
        "Сохранить",
    "Open another .djvu file":
        "Открыть другой .djvu файл",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "Приложение для просмотра .djvu файлов в браузере.",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "Если что-то не работает, пишите на #email.",
    "The official website is #website.":
        "Официальный веб-сайт #website.",
    "The source code is available on #link.":
        "Исходный код находится на #link.",
    "Hotkeys":
        "Горячие клавиши",
    "save the document":
        "сохранить документ",
    "go to the previous page":
        "прейти к предыдущей странице",
    "go to the next page":
        "перейти к следующей странице",
    "Controls":
        "Кнопки",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "#expandIcon и #collapseIcon нужны, чтобы переключать программу в полностраничный режим и обратно.",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "Если вы используете расширение для браузера, то эти кнопки не работают, так как приложение по умолчанию занимает всю страницу.",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "Режим непрерывной прокрутки",
    "Single page view mode":
        "Одностраничный режим",
    "Text view mode":
        "Текстовый режим",
    "Click on the number to enter it manually":
        "Кликните по номеру, чтобы ввести его вручную",
    "Rotate the page":
        "Повернуть страницу",
    "You also can scale the page via Ctrl+MouseWheel":
        "Вы также можете масштабировать страницу через Ctrl+Колесо мыши",
    "Text cursor mode":
        "Курсор для выделения текста",
    "Grab cursor mode":
        "Режим перетаскивания",
    "Table of contents":
        "Оглавление",
    "Toolbar is always shown":
        "Панель инструментов всегда отображается",
    "Toolbar automatically hides":
        "Панель инструментов автоматически скрывается",

    // Contents
    "Contents":
        "Содержание",
    "No contents provided":
        "Нет содержания",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "Ссылка ведет на другой документ. Вы хотите продолжить?",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "Нет текста на этой странице",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "Вы пытаетесь сохранить многофайловый документ.",
    "What exactly do you want to do?":
        "Что именно вы хотите сделать?",
    "Save only index file":
        "Сохранить только корневой файл",
    "Download, bundle and save the whole document as one file":
        "Скачать, собрать и сохранить весь документ одним файлом",
    "Downloading and bundling the document":
        "Скачиваем и собираем документ",
    "The document has been downloaded and bundled into one file successfully":
        "Документ был успешно скачан и собран в единый файл",

    // Printing
    "Print document":
        "Распечатать документ",
    "Pages must be rendered before printing.":
        "Страницы должны быть отрисованы перед печатью.",
    "It may take a while.":
        "Это может занять некоторое время.",
    "Select the pages you want to print.":
        "Выберите те страницы, которые вы хотите распечатать.",
    "From":
        "Начиная с",
    "to":
        "по",
    "Prepare pages for printing":
        "Подготовить страницы к печати",
    "Preparing pages for printing":
        "Подготавливаем страницы к печати",

    // Menu
    "Menu":
        "Меню",
    "Document":
        "Документ",
    "About":
        "О приложении",
    "Print":
        "Печать",
    "Close":
        "Закрыть",
    "View mode":
        "Режим просмотра",
    "Scale":
        "Масштаб",
    "Rotation":
        "Поворот",
    "Cursor mode":
        "Курсор",
    "Full page mode":
        "Полностраничный режим",
    "Fullscreen mode":
        "Полноэкранный режим",
};