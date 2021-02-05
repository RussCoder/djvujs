/**
 * Some phrases contain insertions, e.g. icons and buttons, which are inserted in the code.
 * Here instead of visual components we use placeholders, e.g. #helpButton, which start with #.
 * Your translated phrase MUST also contain the same placeholder, but you can change its position.
 *
 * Some phrases are tooltips, that is, they are visible only when you hover the cursor over controls.
 *
 * And try to preserve the order of phrases (just for convenience of further additions and corrections).
 */

export default {
    // language info
    englishName: "Swedish",
    nativeName: "Svenska",

    "Language": "Språk", // not used now, but will be used in options afterwards

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
    "powered with":
        "baserat på",
    "Drag & Drop a file here or click to choose manually":
        "Dra och släpp en fil här eller klicka för att välja en manuellt",
    "Paste a URL to a djvu file here":
        "Klistra in en URL till en .djvu-fil här",
    "Open URL":
        "Öppna URL",
    // an alert shown when there is no link to open
    "Enter a valid URL to a djvu into the field":
        "Ange en giltig URL till en .djvu-fil i fältet",

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error": "Fel",
    "Error on page": "Felaktigheter på sidan", // Open 'library/assets/czech_indirect/index.djvu

    // Options and its tooltips
    "Open all links with .djvu at the end via the viewer":
        "Öppna alla länkar med .djvu via webbläsaren",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "Alla länkar till .djvu-filer kommer öppnas i läsaren",
    "Detect .djvu files by means of http headers":
        "Upptäck .djvu-filer med hjälp av HTTP-rubriker",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "Analysera rubriker på alla nya flikar för att känna av om länkar är av .djvu-format (även länkar som inte slutar med \".djvu\"",

    // Footer: status bar
    "Ready": "Klar",
    "Loading": "Laddar",

    // Footer: buttons' tooltips
    "Show help window": "Visa hjälpsida",
    "Switch full page mode": "Ändra visningsläge till helsida",

    // File Block tooltips
    "Choose a file": "Välj en fil",
    "Close document": "Stäng dokument",
    "Save document": "Spara dokument",
    "Save": "Spara",
    "Open another .djvu file": "Öppna ytterligare en .djvu-fil",

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

    // Contents
    "Contents": "Innehåll",
    "No contents provided": "Inget innehåll har givits",

    // Text Block (shown in the text view mode)
    "No text on this page": "Ingen text finns på denna sida",

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
};