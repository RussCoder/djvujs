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
        "Spanish",
    nativeName:
        "Castellano",

    "Language":
        "Idioma", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "Añadir mas",
    "The translation isn't complete.":
        "La traducción está incompleta.",
    "The following phrases are not translated:":
        "Las siguientes frases no estan traduccidas:",
    "You can improve the translation here":
        "Puedes mejorar la traducción aquí",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - saber más sobre la aplicación",
    "#optionsButton - see the available options":
        "#optionsButton - ver las opciones disponibles",
    "powered with":
        "Powered  with",
    "Drag & Drop a file here or click to choose manually":
        "Arrastrar y soltar un archivo o click para elegirlo manualmente",
    "Paste a URL to a djvu file here":
        "Pegar una URL al archivo djvu aquí",
    "Open URL":
        "Abrir URL",
    'Enter a valid URL (it should start with "http(s)://")': // an alert shown when you try to open an empty URL
        'Introducir una URL válida (debe comenzar con "http(s)://")',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "Error",
    "Error on page":
        "Error en la página", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "Error de red", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "Compruebe su conexión a la red",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "Error en la solicitud de la web",
    "404 Document not found":
        "404 Documento no encontrado",
    "403 Access forbidden":
        "403 Acceso prohibido",
    "500 Internal server error":
        "500 Error interno del servidor",
    "The request failed with HTTP status #status":
        "La solicitud ha fallado con el estado HTTP #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "El archivo DjVu esta corrupto",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "El archivo no cumple con la especificación del formato DjVu o no es un documento DjVu completo",
    "Incorrect file format": // Open a not-djvu file.
        "Formato de archivo incorrecto",
    "The provided file is not a DjVu document":
        "El archivo proporcionado no es un documento DjVu",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "Número de página incorrecto",
    "There is no page with the number #pageNumber":
        "No hay ninguna página con el número #pageNumber",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "No hay URL base para un documento DjVu indirecto",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "Probablemente haya abierto manualmente un documento DjVu indirecto (de varios archivos).",
    "But such multi-file documents can be only loaded by URL.":
        "Pero estos documentos de varios archivos sólo pueden cargarse por URL.",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "Error inesperado",
    "Cannot print the error, look in the console":
        "No se puede imprimir el error, mira en la consola",

    // Options and its tooltips
    "Options":
        "Opciones",
    "Show options window":
        "Mostrar ventana de opciones",
    "Color theme":
        "Tema de color",
    "Extension options":
        "Opciones de extensión", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "Abrir todos los enlaces con .djvu al final a través del visor",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "Todos los enlaces a archivos .djvu serán abiertos por el visor mediante un clic simple en un enlace",
    "Detect .djvu files by means of http headers":
        "Detectar archivos .djvu mediante cabeceras http",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "Analizar las cabeceras de cada nueva pestaña para procesar incluso los enlaces que no terminan con la extensión .djvu",

    // Footer: status bar
    "Ready":
        "Listo",
    "Loading":
        "Cargando",

    // Footer: buttons' tooltips
    "Show help window":
        "Mostrar ventana de ayuda",
    "Switch full page mode":
        "Cambiar el modo de página completa",

    // File Block tooltips
    "Choose a file":
        "Seleccionar archivo",
    "Close document":
        "Cerrar documento",
    "Save document":
        "Guardar documento",
    "Save":
        "Guardar",
    "Open another .djvu file":
        "Abrir otro archivo .djvu",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "La aplicación para ver archivos .djvu en el navegador.",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "Si algo no funciona correctamente, no dudes en escribir sobre el problema en #email.",
    "The official website is #website.":
        "El sitio web oficial es #website.",
    "The source code is available on #link.":
        "El código fuente está disponible en #link.",
    "Hotkeys":
        "Atajos de teclado",
    "save the document":
        "Guardar el documento",
    "go to the previous page":
        "ir a la página anterior",
    "go to the next page":
        "ir a la página siguiente",
    "Controls":
        "Controles",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "#expandIcon y #collapseIcon son para cambiar el visor al modo de página completa y viceversa.",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "Si trabaja con la extensión del navegador, estos botones no causarán ningún efecto, ya que el visor toma toda la página por defecto.",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "Modo de scroll continuo",
    "Single page view mode":
        "Modo de vista de una sola página",
    "Text view mode":
        "Modo de vista de texto",
    "Click on the number to enter it manually":
        "Haga clic en el número para introducirlo manualmente",
    "Rotate the page":
        "Rotar página",
    "You also can scale the page via Ctrl+MouseWheel":
        "También puede escalar la página mediante Ctrl+Rueda del ratón",
    "Text cursor mode":
        "Modo cursor de texto",
    "Grab cursor mode":
        "Modo cursor de agarre",
    "Table of contents":
        null,
    "Toolbar is always shown":
        null,
    "Toolbar automatically hides":
        null,

    // Contents
    "Contents":
        "Contenido",
    "No contents provided":
        "No se proporciona ningún contenido",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "El enlace apunta a otro documento. ¿Desea continuar?",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "No hay texto en esta página",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "Está intentando guardar un documento indirecto (de varios archivos)",
    "What exactly do you want to do?":
        "¿Qué quiere hacer exactamente?",
    "Save only index file":
        "Guardar sólo el archivo de índice",
    "Download, bundle and save the whole document as one file":
        "Descargue, agrupe y guarde todo el documento como un solo archivo",
    "Downloading and bundling the document":
        "Descargando y agrupando el documento",
    "The document has been downloaded and bundled into one file successfully":
        "El documento ha sido descargado y agrupado en un archivo con éxito",

    // Printing
    "Print document":
        "Imprimir documento",
    "Pages must be rendered before printing.":
        "Las páginas deben ser renderizadas antes de la impresión.",
    "It may take a while.":
        "Puede llevar un tiempo.",
    "Select the pages you want to print.":
        "Seleccione las páginas que desea imprimir.",
    "From":
        "Desde",
    "to":
        "hasta",
    "Prepare pages for printing":
        "Preparar las páginas para la impresión",
    "Preparing pages for printing":
        "Preparando páginas para imprimir",

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
};