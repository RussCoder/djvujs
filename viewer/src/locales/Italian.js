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
        "Italian",
    nativeName:
        "Italiano",

    "Language":
        "Lingua", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "Aggiungi traduzione",
    "The translation isn't complete.":
        "La traduzione non è completa",
    "The following phrases are not translated:":
        "Le seguenti frasi non sono tradotte:",
    "You can improve the translation here":
        "Migliora la traduzione qui",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - Istruzioni all'uso dell'app",
    "#optionsButton - see the available options":
        "#optionsButton - Opzioni disponibili",
    "powered with":
        "Powered with",
    "Drag & Drop a file here or click to choose manually":
        "Trascina e rilascia qui il file DjVu o fai clic per selezionarlo manualmente",
    "Paste a URL to a djvu file here":
        "Incolla qui l'URL al file DjVu",
    "Open URL":
        "Apri URL",
    'Enter a valid URL (it should start with "http(s)://")': // an alert shown when you try to open an empty URL
        'Inserire un URL valido (deve iniziare con "http(s)://")',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "Errore",
    "Error on page":
        "Errore nella pagina", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "Errore di rete", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "Controlla la connessione di rete",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "Errore richiesta web",
    "404 Document not found":
        "404 Documento non trovato",
    "403 Access forbidden":
        "403 Accesso negato",
    "500 Internal server error":
        "500 Errore interno del server",
    "The request failed with HTTP status #status":
        "La richiesta web è fallita con stato HTTP #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "Il file DjVu è corrotto",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "Il file non è conforme alle specifiche del formato DjVu oppure è incompleto",
    "Incorrect file format": // Open a not-djvu file.
        "Formato file non corretto",
    "The provided file is not a DjVu document":
        "Il file non è in formato DjVu",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "Numero pagina non corretto",
    "There is no page with the number #pageNumber":
        "Non esiste una pagina con il numero #pageNumber",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "Manca l'URL di base del documento DjVu multi-file (formato indirect)",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "Si è cercato di aprire manualmente un documento DjVu multi-file (formato indirect).",
    "But such multi-file documents can be only loaded by URL.":
        "Un documento DjVu multi-file (formato indirect) può essere aperto solo tramite URL.",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "Errore sconosciuto",
    "Cannot print the error, look in the console":
        "Non è possibile riportare l'errore, cercare nella console",

    // Options and its tooltips
    "Options":
        "Opzioni",
    "Show options window":
        "Mostra opzioni",
    "Color theme":
        "Colore tema",
    "Extension options":
        "Opzioni estensioni", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "Aprire tutti i link con estensione .djvu tramite viewer",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "Tutti i link con estensione .djvu saranno aperti nel viewer con un solo clic",
    "Detect .djvu files by means of http headers":
        "Identifica un file .djvu tramite gli header http",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "Аnalizza gli header http di ogni nuovo tab del browser al fine di processare i link che non terminano con estensione .djvu",

    // Footer: status bar
    "Ready":
        "Pronto",
    "Loading":
        "In caricamento",

    // Footer: buttons' tooltips
    "Show help window":
        "Mostra guida",
    "Switch full page mode":
        "Attiva/disattiva modalità a piena pagina",

    // File Block tooltips
    "Choose a file":
        "Scegli un file",
    "Close document":
        "Chiudi documento",
    "Save document":
        "Salva documento",
    "Save":
        "Salva",
    "Open another .djvu file":
        "Apri un altro file .djvu",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "Applicazione per visualizzare i file .djvu nel browser.",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "In caso di malfunzionamento scrivere a #email.",
    "The official website is #website.":
        "Sito web ufficiale #website.",
    "The source code is available on #link.":
        "Il codice sorgente è disponibile all'indirizzo #link.",
    "Hotkeys":
        "Scorciatoie da tastiera",
    "save the document":
        "Salva il documento",
    "go to the previous page":
        "Vai alla pagina precedente",
    "go to the next page":
        "Vai alla pagina successiva",
    "Controls":
        "Controlli",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "#expandIcon e #collapseIcon servono per attivare/disattivare la modalità a piena pagina.",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "Se si usa l'estensione per il browser questi pulsanti non hanno effetto perché la modalità di default è a piena pagina.",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "Vista a pagina continua",
    "Single page view mode":
        "Vista a pagina singola",
    "Text view mode":
        "Vista testo",
    "Click on the number to enter it manually":
        "Fai clic sul numero per andare alla pagina",
    "Rotate the page":
        "Ruota pagina",
    "You also can scale the page via Ctrl+MouseWheel":
        "Puoi ingrandire la pagina tramite ctrl + rotella mouse",
    "Text cursor mode":
        "Modalità selezione testo",
    "Grab cursor mode":
        "Modalità trascinamento pagina",
    "Table of contents":
        null,
    "Toolbar is always shown":
        null,
    "Toolbar automatically hides":
        null,

    // Contents
    "Contents":
        "Contenuti",
    "No contents provided":
        "Nessun contenuto disponibile",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "Il link punta ad un altro documento. Vuoi procedere?",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "Nessun contenuto testuale nel documento",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "Stai per salvare un documento DjVu multi-file (formato indirect).",
    "What exactly do you want to do?":
        "Cosa vuoi fare?",
    "Save only index file":
        "Salva solo indice",
    "Download, bundle and save the whole document as one file":
        "Scarica, impacchetta e salva documento completo in un unico file",
    "Downloading and bundling the document":
        "Scaricamento e impacchettamento in corso",
    "The document has been downloaded and bundled into one file successfully":
        "Il documento è stato scaricato e impacchettato correttamente",

    // Printing
    "Print document":
        "Stampa documento",
    "Pages must be rendered before printing.":
        "Le pagine devono essere processate prima della stampa.",
    "It may take a while.":
        "Potrebbe richiedere tempo",
    "Select the pages you want to print.":
        "Seleziona le pagine da stampare",
    "From":
        "Da",
    "to":
        "a",
    "Prepare pages for printing":
        "Avvia processo di stampa",
    "Preparing pages for printing":
        "Sto preparando le pagine per la stampa",

    // Menu
    "Menu":
        "Menu",
    "Document":
        "Documento",
    "About":
        "Info",
    "Print":
        "Stampa",
    "Close":
        "Chiudi",
    "View mode":
        "Modalità vista",
    "Scale":
        "Scala",
    "Rotation":
        "Ruota",
    "Cursor mode":
        "Moldalità cursore",
    "Full page mode":
        "Modalità a piena pagina",
    "Fullscreen mode":
        "Modalità a pieno schermo",
};
