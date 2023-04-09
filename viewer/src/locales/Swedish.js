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
        "Swedish",
    nativeName:
        "Svenska",

    "Language":
        "Språk", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "Lägg till mer",
    "The translation isn't complete.":
        "Översättningen är inte klar.",
    "The following phrases are not translated:":
        "Följande meningar är inte översatta:",
    "You can improve the translation here":
        "Du kan förtydliga översättningen här",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - lär dig mer om applikationen",
    "#optionsButton - see the available options":
        "#optionsButton - Se tillgängliga alternativ",
    "powered with":
        "baserat på",
    "Drag & Drop a file here or click to choose manually":
        "Dra och släpp en fil här eller klicka för att välja en manuellt",
    "Paste a URL to a djvu file here":
        "Klistra in en URL till en .djvu-fil här",
    "Open URL":
        "Öppna URL",
    'Enter a valid URL (it should start with "http(s)://" | "data:")': // an alert shown when you try to open an empty URL
        'Ange en giltig URL (den ska börja med "http (s): //")',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "Fel",
    "Error on page":
        "Felaktigheter på sidan", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "Nätverksfel", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "Kontrollera nätverksanslutningen",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "Fel vid webbegärning",
    "404 Document not found":
        "404 Dokument hittas inte",
    "403 Access forbidden":
        "403 Åtkomst förbjuden",
    "500 Internal server error":
        "500 Internt serverfel",
    "The request failed with HTTP status #status":
        "TBegäran misslyckades med http-status #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "DjVu-filen är korrupt:",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "Filen överensstämmer inte med specificerat DjVu-format eller så är dokumentet inte komplett",
    "Incorrect file format": // Open a not-djvu file.
        "Felaktigt filformat",
    "The provided file is not a DjVu document":
        "Den angivna filen är inte ett DjVu-dokument",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "Felaktigt sidnummer",
    "There is no page with the number #pageNumber":
        "Felaktigt sidnummer #pageNumber",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "Ingen bas-URL för ett indirekt DjVu-dokument",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "Du öppnade troligen ett indirekt DjVu-dokument (med flera filer) manuellt.",
    "But such multi-file documents can be only loaded by URL.":
        "Dokument med flera filer kan endast laddas med URL.",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "Ett oväntat fel uppstod",
    "Cannot print the error, look in the console":
        "Kunde inte skriva ut felet, titta i konsolen",

    // Options and its tooltips
    "Options":
        "Alternativ",
    "Show options window":
        "Visa fönster med alternativ",
    "Color theme":
        "Färgtema",
    "Extension options":
        "Förlängningsalternativ", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "Öppna alla länkar med .djvu via webbläsaren",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "Alla länkar till .djvu-filer kommer öppnas i läsaren",
    "Detect .djvu files by means of http headers":
        "Upptäck .djvu-filer med hjälp av HTTP-rubriker",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "Analysera rubriker på alla nya flikar för att känna av om länkar är av .djvu-format (även länkar som inte slutar med \".djvu\"",

    // Footer: status bar
    "Ready":
        "Klar",
    "Loading":
        "Laddar",

    // Footer: buttons' tooltips
    "Show help window":
        "Visa hjälpsida",
    "Switch full page mode":
        "Ändra visningsläge till helsida",

    // File Block tooltips
    "Choose a file":
        "Välj en fil",
    "Close document":
        "Stäng dokument",
    "Save document":
        "Spara dokument",
    "Save":
        "Spara",
    "Open another .djvu file":
        "Öppna ytterligare en .djvu-fil",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "Applikation för att se .djvu-filer i browsern.",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "Om något inte fungerar korrekt, vänligen kontakta #email.",
    "The official website is #website.":
        "Den officiella webbsidan är #website.",
    "The source code is available on #link.":
        "Källkoden är tillgänglig på #link.",
    "Hotkeys":
        "Tangebords-genvägar",
    "save the document":
        "spara dokument",
    "go to the previous page":
        "gå till föregående sida",
    "go to the next page":
        "gå till nästa sida",
    "Controls":
        "Kontroller",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "Knapparna #expandIcon och #collapseIcon används för att väcla visningsläge till helsida och tillbaka.",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "Om du använder tillägget i browsern kommer dessa knappar inte att fungera då visningsprogrammet hanterar hela sidan som standard.",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "Visningsläge med kontinuerlig scrolling",
    "Number of pages in a row":
        null,
    "Number of pages in the first row":
        null,
    "Single page view mode":
        "Visningsläge med en sida",
    "Text view mode":
        "Visningsläge med text",
    "Click on the number to enter it manually":
        "Du kan klicka på sidnumret för att ange det manuellt",
    "Rotate the page":
        "Rotera sidan",
    "You also can scale the page via Ctrl+MouseWheel":
        "Du kan också skala sidan genom att använda Ctrl + Skrollknappen på musen",
    "Text cursor mode":
        "Visningsläge med textmarkör",
    "Grab cursor mode":
        "Visningsläge med greppbart markörläge",
    "Table of contents":
        null,
    "Toolbar is always shown":
        null,
    "Toolbar automatically hides":
        null,

    // Contents
    "Contents":
        "Innehåll",
    "No contents provided":
        "Inget innehåll har givits",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "Länken vidarebefodrar till ett annat dokument. Vill du fortsätta?",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "Ingen text finns på denna sida",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "Du försöker spara ett indirekt dokument (flera filer).",
    "What exactly do you want to do?":
        "Vad vill du göra?",
    "Save only index file":
        "Spara endast index-fil",
    "Download, bundle and save the whole document as one file":
        "Ladda ner, packa ihop och spara hela dokumentet som en fil",
    "Downloading and bundling the document":
        "Laddar ner och packer ihop dokumentet",
    "The document has been downloaded and bundled into one file successfully":
        "Dokumentet har laddats ner och packats ihop till en fil",

    // Printing
    "Print document":
        "Skriv ut",
    "Pages must be rendered before printing.":
        "Sidorna måste renderas före utskrift.",
    "It may take a while.":
        "Det kan ta en stund.",
    "Select the pages you want to print.":
        "Välj de sidor du vill skriva ut.",
    "From":
        "Från",
    "to":
        "till",
    "Prepare pages for printing":
        "Förbered sidor för utskrift",
    "Preparing pages for printing":
        "Förbereder sidor för utskrift",

    // Menu
    "Menu":
        null,
    "Document":
        null,
    "About":
        null,
    "Print":
        null,
    "Close":
        null,
    "View mode":
        null,
    "Scale":
        null,
    "Rotation":
        null,
    "Cursor mode":
        null,
    "Full page mode":
        null,
    "Fullscreen mode":
        null,
};