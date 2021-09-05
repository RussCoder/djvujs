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
        "English",
    nativeName:
        "English",

    "Language":
        "Language", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "Add more",
    "The translation isn't complete.":
        "The translation isn't complete.",
    "The following phrases are not translated:":
        "The following phrases are not translated:",
    "You can improve the translation here":
        "You can improve the translation here",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - learn more about the app",
    "#optionsButton - see the available options":
        "#optionsButton - see the available options",
    "powered with":
        "powered with",
    "Drag & Drop a file here or click to choose manually":
        "Drag & Drop a file here or click to choose manually",
    "Paste a URL to a djvu file here":
        "Paste a URL to a djvu file here",
    "Open URL":
        "Open URL",
    'Enter a valid URL (it should start with "http(s)://")': // an alert shown when you try to open an empty URL
        'Enter a valid URL (it should start with "http(s)://")',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "Error",
    "Error on page":
        "Error on page", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "Network error", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "Check your network connection",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "Web request error",
    "404 Document not found":
        "404 Document not found",
    "403 Access forbidden":
        "403 Access forbidden",
    "500 Internal server error":
        "500 Internal server error",
    "The request failed with HTTP status #status":
        "The request failed with HTTP status #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "DjVu file is corrupted",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document",
    "Incorrect file format": // Open a not-djvu file.
        "Incorrect file format",
    "The provided file is not a DjVu document":
        "The provided file is not a DjVu document",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "Incorrect page number",
    "There is no page with the number #pageNumber":
        "There is no page with the number #pageNumber",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "No base URL for an indirect DjVu document",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "You probably opened an indirect (multi-file) DjVu document manually.",
    "But such multi-file documents can be only loaded by URL.":
        "But such multi-file documents can be only loaded by URL.",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "Unexpected error",
    "Cannot print the error, look in the console":
        "Cannot print the error, look in the console",

    // Options and its tooltips
    "Options":
        "Options",
    "Show options window":
        "Show options window",
    "Color theme":
        "Color theme",
    "Extension options":
        "Extension options", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "Open all links with .djvu at the end via the viewer",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "All links to .djvu files will be opened by the viewer via a simple click on a link",
    "Detect .djvu files by means of http headers":
        "Detect .djvu files by means of http headers",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension",

    // Footer: status bar
    "Ready":
        "Ready",
    "Loading":
        "Loading",

    // Footer: buttons' tooltips
    "Show help window":
        "Show help window",
    "Switch full page mode":
        "Switch full page mode",

    // File Block tooltips
    "Choose a file":
        "Choose a file",
    "Close document":
        "Close document",
    "Save document":
        "Save document",
    "Save":
        "Save",
    "Open another .djvu file":
        "Open another .djvu file",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "The application for viewing .djvu files in the browser.",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "If something doesn't work properly, feel free to write about the problem at #email.",
    "The official website is #website.":
        "The official website is #website.",
    "The source code is available on #link.":
        "The source code is available on #link.",
    "Hotkeys":
        "Hotkeys",
    "save the document":
        "save the document",
    "go to the previous page":
        "go to the previous page",
    "go to the next page":
        "go to the next page",
    "Controls":
        "Controls",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "Continuous scroll view mode",
    "Single page view mode":
        "Single page view mode",
    "Text view mode":
        "Text view mode",
    "Click on the number to enter it manually":
        "Click on the number to enter it manually",
    "Rotate the page":
        "Rotate the page",
    "You also can scale the page via Ctrl+MouseWheel":
        "You also can scale the page via Ctrl+MouseWheel",
    "Text cursor mode":
        "Text cursor mode",
    "Grab cursor mode":
        "Grab cursor mode",
    "Table of contents":
        "Table of contents",
    "Toolbar is always shown":
        "Toolbar is always shown",
    "Toolbar automatically hides":
        "Toolbar automatically hides",

    // Contents
    "Contents":
        "Contents",
    "No contents provided":
        "No contents provided",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "The link points to another document. Do you want to proceed?",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "No text on this page",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "You are trying to save an indirect (multi-file) document.",
    "What exactly do you want to do?":
        "What exactly do you want to do?",
    "Save only index file":
        "Save only index file",
    "Download, bundle and save the whole document as one file":
        "Download, bundle and save the whole document as one file",
    "Downloading and bundling the document":
        "Downloading and bundling the document",
    "The document has been downloaded and bundled into one file successfully":
        "The document has been downloaded and bundled into one file successfully",

    // Printing
    "Print document":
        "Print document",
    "Pages must be rendered before printing.":
        "Pages must be rendered before printing.",
    "It may take a while.":
        "It may take a while.",
    "Select the pages you want to print.":
        "Select the pages you want to print.",
    "From":
        "From",
    "to":
        "to",
    "Prepare pages for printing":
        "Prepare pages for printing",
    "Preparing pages for printing":
        "Preparing pages for printing",

    // Menu
    "Menu":
        "Menu",
    "Document":
        "Document",
    "About":
        "About",
    "Print":
        "Print",
    "Close":
        "Close",
    "View mode":
        "View mode",
    "Scale":
        "Scale",
    "Rotation":
        "Rotation",
    "Cursor mode":
        "Cursor mode",
    "Full page mode":
        "Full page mode",
    "Fullscreen mode":
        "Fullscreen mode",
};