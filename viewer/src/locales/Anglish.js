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
        "Anglish",
    nativeName:
        "Anglish",

    "Language":
        "Tongue", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "Eke more",
    "The translation isn't complete.":
        "The oversetting isn't done.",
    "The following phrases are not translated:":
        "The following wordstrings are not overset:",
    "You can improve the translation here":
        "You can better the oversetting here",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - learn more about the tool",
    "#optionsButton - see the available options":
        "#optionsButton - see the yare kirs",
    "powered with":
        "built on",
    "Drag & Drop a file here or click to choose manually":
        "Drag & Drop a bestand here or click to choose by hand",
    "Paste a URL to a djvu file here":
        "Put in a URL to a djvu bestand here",
    "Open URL":
        "Open URL",
    'Enter a valid URL (it should start with "http(s)://" | "data:")': // an alert shown when you try to open an empty URL
        'Give a working URL (it should start with "http(s)://" | "data:")',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "Dwale",
    "Error on page":
        "Dwale on leaf", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "Network dwale", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "Look over your network binding",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "Web ask dwale",
    "404 Document not found":
        "404 Writ not found",
    "403 Access forbidden":
        "403 Togang forbidden",
    "500 Internal server error":
        "500 Inward webthew dwale",
    "The request failed with HTTP status #status":
        "The ask trucked with HTTP standing #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "DjVu bestand is broken",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "The bestand doesn't follow the DjVu layout rules or it's not a whole DjVu writ",
    "Incorrect file format": // Open a not-djvu file.
        "Wrong bestand layout",
    "The provided file is not a DjVu document":
        "The uploaded bestand is not a DjVu writ",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "Wrong leaf rime",
    "There is no page with the number #pageNumber":
        "There is no leaf with the rime #pageNumber",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "No folder URL for an unstraight DjVu writ",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "You likely opened an unstraight (many-bestand) DjVu writ by hand.",
    "But such multi-file documents can be only loaded by URL.":
        "But such many-bestand writs can only be loaded by URL.",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "Unweened dwale",
    "Cannot print the error, look in the console":
        "Cannot show the dwale, look in the log window",

    // Options and its tooltips
    "Options":
        "Kirs",
    "Show options window":
        "Show kirs window",
    "Color theme":
        "Bleeset",
    "Extension options":
        "Webeke kirs", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "Open all links ending in .djvu through the webeke",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "Links to .djvu bestands will be opened by the webeke when clicked",
    "Detect .djvu files by means of http headers":
        "Find .djvu bestands by HTTP headers",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "Throughseek the headers of every new tab to find bestands, even when the link doesn't have the .djvu ending",

    // Footer: status bar
    "Ready":
        "Ready",
    "Loading":
        "Loading",

    // Footer: buttons' tooltips
    "Show help window":
        "Show help window",
    "Switch full page mode":
        "Toggle full-leaf wise",

    // File Block tooltips
    "Choose a file":
        "Choose a bestand",
    "Close document":
        "Clise writ",
    "Save document":
        "Speal writ",
    "Save":
        "Speal",
    "Open another .djvu file":
        "Open another .djvu bestand",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "The tool for seeing .djvu files in the webfarer.",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "If something doesn't work rightly, feel free to write about the hitch at #email.",
    "The official website is #website.":
        "The wickeny webstead is #website.",
    "The source code is available on #link.":
        "The groundwrit is yare on #link.",
    "Hotkeys":
        "Hotkeys",
    "save the document":
        "speal the writ",
    "go to the previous page":
        "go to the former leaf",
    "go to the next page":
        "go to the next leaf",
    "Controls":
        "Knaps",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "#expandIcon and #collapseIcon are to switch the seer to full-leaf wise and back.",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "If you brook the webeke, these knaps will do nothing, since the webeke takes the whole leaf from the start.",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "Unbroken scroll sight wise",
    "Number of pages in a row":
        "Rime of leaves in a row",
    "Number of pages in the first row":
        "Rime of leaves in the first row",
    "Single page view mode":
        "One leaf sight wise",
    "Text view mode":
        "Writing sight wise",
    "Click on the number to enter it manually":
        "Click on the rime to input it by hand",
    "Rotate the page":
        "Turn the leaf",
    "You also can scale the page via Ctrl+MouseWheel":
        "You can also adjust the leaf bigness with Ctrl+MouseWheel",
    "Text cursor mode":
        "Writing mousemarker wise",
    "Grab cursor mode":
        "Grab mousemarker wise",
    "Table of contents":
        "Inholdings List",
    "Toolbar is always shown":
        "Toolbar is always shown",
    "Toolbar automatically hides":
        "Toolbar hides itself",

    // Contents
    "Contents":
        "Inholdings",
    "No contents provided":
        "No inholdings given",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "The link leads to another writ. Do you want to go on?",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "No writing on this leaf",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "You are fanding to speal an unstraight (many-bestand) writ.",
    "What exactly do you want to do?":
        "What do you truly want to do?",
    "Save only index file":
        "Speal only the root bestand",
    "Download, bundle and save the whole document as one file":
        "Download, sheaf and speal the whole writ as one bestand",
    "Downloading and bundling the document":
        "Downloading and sheafing the writ",
    "The document has been downloaded and bundled into one file successfully":
        "The writ has been downloaded and sheafed into one bestand speedfully",

    // Printing
    "Print document":
        "Thrutch writ",
    "Pages must be rendered before printing.":
        "Leaves must be drawn before thrutching.",
    "It may take a while.":
        "It may take a while.",
    "Select the pages you want to print.":
        "Choose the leaves you want to thrutch.",
    "From":
        "From",
    "to":
        "to",
    "Prepare pages for printing":
        "Ready leaves for thrutching",
    "Preparing pages for printing":
        "Readying leaves for thrutching",

    // Menu
    "Menu":
        "List",
    "Document":
        "Writ",
    "About":
        "About",
    "Print":
        "Thrutch",
    "Close":
        "Clise",
    "View mode":
        "Sight wise",
    "Scale":
        "Bigness",
    "Rotation":
        "Turning",
    "Cursor mode":
        "Mousemarker wise",
    "Full page mode":
        "Full-leaf wise",
    "Fullscreen mode":
        "Fullshirm wise",
};