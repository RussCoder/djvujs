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
        "French",
    nativeName:
        "Français",

    "Language":
        "Langue", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "Ajouter une traduction",
    "The translation isn't complete.":
        "La traduction n'est pas terminée.",
    "The following phrases are not translated:":
        "Les assertions suivantes n'ont pas été traduites:",
    "You can improve the translation here":
        "Vous pouvez améliorer la traduction ici",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - à propos",
    "#optionsButton - see the available options":
        "#helpButton - options disponibles",
    "powered with":
        "basé sur",
    "Drag & Drop a file here or click to choose manually":
        "Glisser-Déposer ici un fichier, ou cliquer pour le slectionner manuellement",
    "Paste a URL to a djvu file here":
        "Copier un lien vers un fichier .djvu",
    "Open URL":
        "Ouvrir le lien",
    'Enter a valid URL (it should start with "http(s)://")': // an alert shown when you try to open an empty URL
        'Insérer une URL valide (doit commencer par "http(s)://")',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "Erreur",
    "Error on page":
        "Erreur dans la page", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "Erreur de réseau", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "Vérifier votre connexion internet",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "Erreur de requête web",
    "404 Document not found":
        "404 Dcument non trouvé",
    "403 Access forbidden":
        "403 Accès interdit",
    "500 Internal server error":
        "500 Erreur interne du serveur",
    "The request failed with HTTP status #status":
        "La requête a échouée avec le statut HTTP #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "Le fichier DjVu est corrompu",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "Le fichier ne respecte pas la spécification du format DjVu ou il s'agit d'un document DjVu incomplet",
    "Incorrect file format": // Open a not-djvu file.
        "Format de fichier incorrect",
    "The provided file is not a DjVu document":
        "Le fichier fourni n'est pas un document DjVu",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "Numéro de page incorrect",
    "There is no page with the number #pageNumber":
        "Il n'existe pas de page avec le numéro #pageNumber",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "URL de base manquante du document DjVu indirect (multi-fichier)",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "Vous avez probablement ouvert manuellement un document DjVu indirect (multi-fichier).",
    "But such multi-file documents can be only loaded by URL.":
        "Mais de tels documents multi-fichier ne peuvent être ouvert que par URL",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "Erreur inconnue",
    "Cannot print the error, look in the console":
        "Impossible de rapporter l'erreur, regarder dans la console.",

    // Options and its tooltips
    "Options":
        "Options",
    "Show options window":
        "Afficher la fenêtre d'option",
    "Color theme":
        "Changer de thème",
    "Extension options":
        "Options de l'extension", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "Ouvrir tous les liеns .djvu avec l'extension",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "Tous les liens .djvu seront ouverts avec l'extension en cliquant simplement sur le lien",
    "Detect .djvu files by means of http headers":
        "Identifier les fichiers .djvu par leur en-tête http",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "Analyser les en-têtes de chaque nouvel onglet pour identifier les fichiers même sans l'extension .djvu en fin de lien",

    // Footer: status bar
    "Ready":
        "Prêt",
    "Loading":
        "Chargement",

    // Footer: buttons' tooltips
    "Show help window":
        "Afficher la fenêtre d'aide",
    "Switch full page mode":
        "Passer en mode pleine page",

    // File Block tooltips
    "Choose a file":
        "Choisir un fichier",
    "Close document":
        "Fermer le document",
    "Save document":
        "Enregistrer le document",
    "Save":
        "Enregistrer",
    "Open another .djvu file":
        "Ouvrir un autre fichier .djvu",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "Une application pour afficher des fichiers .djvu dans le naviguateur.",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "Si quelque chose ne fonctionne pas correctement, vous pouvez écrire à #email.",
    "The official website is #website.":
        "Le site officiel est #website.",
    "The source code is available on #link.":
        "Le code source est disponible à l'adresse: #link.",
    "Hotkeys":
        "Raccourcis Clavier",
    "save the document":
        "enregistrer le document",
    "go to the previous page":
        "page précédente",
    "go to the next page":
        "page suivante",
    "Controls":
        "Boutons",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "#expandIcon & #collapseIcon permettent de passer en mode pleine page et inversement.",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "Si vous utilisez l'extension pour navigateur, ces boutons n'auront aucun effet, car l'application occupe déjà toute la page.",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "Mode défilement continu",
    "Single page view mode":
        "Mode page unique",
    "Text view mode":
        "Mode texte",
    "Click on the number to enter it manually":
        "Cliquer sur le nombre pour en saisir un manuellement",
    "Rotate the page":
        "Faire pivoter la page",
    "You also can scale the page via Ctrl+MouseWheel":
        "Vous pouvez également ajuster la page avec Ctrl+Molette",
    "Text cursor mode":
        "Curseur pour mettre le texte en surbrillance",
    "Grab cursor mode":
        "Défilement glisser-déposer",

    // Contents
    "Contents":
        "Table des matières",
    "No contents provided":
        "Pas de sommaire",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "Le lien redirige vers un autre document. Voulez-vous continuer ?",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "Pas de texte dans cette page",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "Vous essayez d'enregistrer un document multi-fichier ",
    "What exactly do you want to do?":
        "Que voulez-vous faire ?",
    "Save only index file":
        "Enregistrer uniquement le fichier racine",
    "Download, bundle and save the whole document as one file":
        "Télécharger, rassembler & sauveguarder l'ensemble du document dans un seul fichier",
    "Downloading and bundling the document":
        "Téléchargement & assemblage du document",
    "The document has been downloaded and bundled into one file successfully":
        "Le document a été téléchargé, rassemblé & sauveguardé dans un seul fichier avec succès",

    // Printing
    "Print document":
        "Imprimer le document",
    "Pages must be rendered before printing.":
        "Les pages doivent être rendues avant impression",
    "It may take a while.":
        "Cela peut prendre un moment",
    "Select the pages you want to print.":
        "Sélectionner la page à imprimer",
    "From":
        "De",
    "to":
        "à",
    "Prepare pages for printing":
        "Préparer les pages pour l'impression",
    "Preparing pages for printing":
        "Préparation des pages pour l'impression",

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