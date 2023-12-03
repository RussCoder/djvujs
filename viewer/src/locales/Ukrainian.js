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
        "Ukrainian",
    nativeName:
        "Українська",

    "Language":
        "Мова", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "Додати ще",
    "The translation isn't complete.":
        "Переклад неповний.",
    "The following phrases are not translated:":
        "Наступні фрази не перекладені:",
    "You can improve the translation here":
        "Ви можете поліпшити переклад тут",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - дізнатися більше про застосунок",
    "#optionsButton - see the available options":
        "#optionsButton - переглянути налаштування",
    "powered with":
        "працює на базі",
    "Drag & Drop a file here or click to choose manually":
        "Перетягніть сюди файл або клацніть та оберіть ручним способом",
    "Paste a URL to a djvu file here":
        "Вставте посилання на файл .djvu тут",
    "Open URL":
        "Відкрити посилання",
    'Enter a valid URL (it should start with "http(s)://" | "data:")': // an alert shown when you try to open an empty URL
        'Уведіть правильне посилання (мусить починатися з "http(s)://" або "data:")',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "Помилка",
    "Error on page":
        "Помилка на сторінці", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "Помилка мережі", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "Перевірте своє інтернет-з'єднання",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "Помилка веб запиту",
    "404 Document not found":
        "404 Документ не знайдено",
    "403 Access forbidden":
        "403 Доступ заборонено",
    "500 Internal server error":
        "500 Внутрішня помилка сервера",
    "The request failed with HTTP status #status":
        "Запит не вдався зі статусом HTTP #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "DjVu-файл пошкоджено",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "Файл не відповідає специфікації формату DjVu або не є цілим DjVu-документом",
    "Incorrect file format": // Open a not-djvu file.
        "Неправильний формат файлу",
    "The provided file is not a DjVu document":
        "Наданий файл не є DjVu-документом",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "Неправильний номер сторінки",
    "There is no page with the number #pageNumber":
        "Сторінки з номером #pageNumber не існує",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "Немає посилання на директорію документа",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "Імовірно, ви відкрили багатофайловий (indirect) DjVu-документ уручну.",
    "But such multi-file documents can be only loaded by URL.":
        "Проте, такі багатофайлові документи можна завантажувати лише за посиланням.",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "Неочікувана помилка",
    "Cannot print the error, look in the console":
        "Не вдається видрукувати помилку, подивіться в консоль",

    // Options and its tooltips
    "Options":
        "Налаштування",
    "Show options window":
        "Відкрити вікно налаштувань",
    "Color theme":
        "Колірна схема",
    "Extension options":
        "Налаштування додатка", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "Відкривати всі посилання, які закінчуються на .djvu, через додаток",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "Усі посилання на файли .djvu відкриватимуться у додатку простим кликом на посилання",
    "Detect .djvu files by means of http headers":
        "Виявляти файли .djvu за http заголовками",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "Аналізувати заголовки кожної нової вкладки, щоби виявляти файли без розширення \".djvu\" в назві",

    // Footer: status bar
    "Ready":
        "Готово",
    "Loading":
        "Завантаження",

    // Footer: buttons' tooltips
    "Show help window":
        "Показати довідку",
    "Switch full page mode":
        "Перемкнути повносторінковий режим",

    // File Block tooltips
    "Choose a file":
        "Оберіть файл",
    "Close document":
        "Закрити документ",
    "Save document":
        "Зберегти документ",
    "Save":
        "Зберегти",
    "Open another .djvu file":
        "Відкрити інший файл .djvu",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "Застосунок для перегляду файлів .djvu в браузері.",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "Коли щось не працює, пишіть на #email.",
    "The official website is #website.":
        "Офіційний вебсайт #website.",
    "The source code is available on #link.":
        "Вихідний код доступний на #link.",
    "Hotkeys":
        "Гарячі клавіші",
    "save the document":
        "зберегти документ",
    "go to the previous page":
        "перейти до попередньої сторінки",
    "go to the next page":
        "перейти до наступної сторінки",
    "Controls":
        "Кнопки",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "#expandIcon та #collapseIcon перемикають переглядач у повносторінковий режим і назад.",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "Якщо ви використовуєте додаток до бравзера, ці кнопки не працюватимуть, оскільки за замовчуванням застосунок займає всю сторінку.",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "Режим неперервної прокрутки",
    "Number of pages in a row":
        "Число сторінок у рядку",
    "Number of pages in the first row":
        "Число сторінок у першім рядку",
    "Single page view mode":
        "Односторінковий режим",
    "Text view mode":
        "Текстовий режим",
    "Click on the number to enter it manually":
        "Клацніть по номеру, щоб увести його вручну",
    "Rotate the page":
        "Повернути сторінку",
    "You also can scale the page via Ctrl+MouseWheel":
        "Ви також можете масштабувати сторінку через Ctrl+КоліщаткоМиші",
    "Text cursor mode":
        "Курсор для виділення тексту",
    "Grab cursor mode":
        "Режим перетягування",
    "Table of contents":
        "Зміст",
    "Toolbar is always shown":
        "Панель інструментів завжди відображається",
    "Toolbar automatically hides":
        "Панель інструментів автоматично приховується",

    // Contents
    "Contents":
        "Зміст",
    "No contents provided":
        "Зміст відсутній",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "Посилання вказує на інший документ. Чи ви бажаєте продовжити?",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "На цій сторінці немає тексту",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "Ви намагаєтеся зберегти багатофайловий документ.",
    "What exactly do you want to do?":
        "Що саме ви хочете зробити?",
    "Save only index file":
        "Зберегти тільки кореневий файл",
    "Download, bundle and save the whole document as one file":
        "Завантажити, об'єднати й зберегти ввесь документ одним файлом",
    "Downloading and bundling the document":
        "Завантаження та об'єднування документ",
    "The document has been downloaded and bundled into one file successfully":
        "Документ успішно завантажено й об'єднано в єдиний файл",

    // Printing
    "Print document":
        "Видрукувати документ",
    "Pages must be rendered before printing.":
        "Перед друком сторінки мусять бути унаочнені.",
    "It may take a while.":
        "Це може зайняти певний час.",
    "Select the pages you want to print.":
        "Виберіть ті сторінки, котрі волієте видрукувати.",
    "From":
        "З",
    "to":
        "по",
    "Prepare pages for printing":
        "Підготувати сторінки до друку",
    "Preparing pages for printing":
        "Підготовка сторінок до друку",

    // Menu
    "Menu":
        "Меню",
    "Document":
        "Документ",
    "About":
        "Про застосунок",
    "Print":
        "Друк",
    "Close":
        "Закрити",
    "View mode":
        "Режим перегляду",
    "Scale":
        "Масштаб",
    "Rotation":
        "Поворот",
    "Cursor mode":
        "Курсор",
    "Full page mode":
        "Повносторінковий режим",
    "Fullscreen mode":
        "Повноекранний режим",
};