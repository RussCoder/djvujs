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
        "Portuguese",
    nativeName:
        "Português",

    "Language":
        "Idioma", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "Adicionar mais",
    "The translation isn't complete.":
        "A tradução não está completa.",
    "The following phrases are not translated:":
        "As seguintes frases não são traduzidas:",
    "You can improve the translation here":
        "Pode melhorar a tradução aqui",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - saber mais sobre a aplicação",
    "#optionsButton - see the available options":
        "#optionsButton - ver as opções disponíveis",
    "powered with":
        "powered by",
    "Drag & Drop a file here or click to choose manually":
        "Arrastar e largar um ficheiro aqui ou clicar para escolher manualmente",
    "Paste a URL to a djvu file here":
        "Colar aqui um URL a um ficheiro djvu",
    "Open URL":
        "Abrir URL",
    'Enter a valid URL (it should start with "http(s)://")': // an alert shown when you try to open an empty URL
        'Introduza um URL válido (deve começar com "http(s)://")',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "Erro",
    "Error on page":
        "Erro na página", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "Erro de rede", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "Verifique a sua ligação à rede",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "Pedido de erro na Web",
    "404 Document not found":
        "404 Documento não encontrado",
    "403 Access forbidden":
        "403 Acesso proibido",
    "500 Internal server error":
        "500 Erro interno do servidor",
    "The request failed with HTTP status #status":
        "O pedido falhou com o status HTTP #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "O ficheiro DjVu está corrompido",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "O ficheiro não cumpre as especificações do formato DjVu ou não é um documento DjVu completo",
    "Incorrect file format": // Open a not-djvu file.
        "Formato de ficheiro incorrecto",
    "The provided file is not a DjVu document":
        "O ficheiro fornecido não é um documento DjVu",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "Número de página incorrecto",
    "There is no page with the number #pageNumber":
        "Não há página com o número #pageNumber",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "Sem URL base para um documento indirecto DjVu",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "Provavelmente abriu manualmente um documento DjVu indirecto (multi-arquivos).",
    "But such multi-file documents can be only loaded by URL.":
        "Mas tais documentos multi-arquivos só podem ser carregados por URL.",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "Erro inesperado",
    "Cannot print the error, look in the console":
        "Não é possível imprimir o erro, procurar na consola",

    // Options and its tooltips
    "Options":
        "Opções",
    "Show options window":
        "Mostrar janela de opções",
    "Color theme":
        "Tema de cor",
    "Extension options":
        "Opções de extensão", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "Abrir todas as ligações com .djvu no final através do visualizador",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "Todos os links para ficheiros .djvu serão abertos pelo espectador através de um simples clique num link",
    "Detect .djvu files by means of http headers":
        "Detectar ficheiros .djvu por meio de cabeçalhos http",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "Analisar os cabeçalhos de cada novo separador a fim de processar até ligações que não terminam com a extensão .djvu",

    // Footer: status bar
    "Ready":
        "Preparado",
    "Loading":
        "Carregando",

    // Footer: buttons' tooltips
    "Show help window":
        "Mostrar janela de ajuda",
    "Switch full page mode":
        "Mudar o modo de página inteira",

    // File Block tooltips
    "Choose a file":
        "Escolha um ficheiro",
    "Close document":
        "Fechar documento",
    "Save document":
        "Guardar documentação",
    "Save":
        "Guardar",
    "Open another .djvu file":
        "Abrir outro ficheiro .djvu",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "A aplicação para visualizar ficheiros .djvu no browser.",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "Se algo não funcionar correctamente, sinta-se à vontade para escrever sobre o problema em #email.",
    "The official website is #website.":
        "O site oficial é #website.",
    "The source code is available on #link.":
        "O código fonte está disponível em #link.",
    "Hotkeys":
        "Teclas de atalho",
    "save the document":
        "guardar o documento",
    "go to the previous page":
        "ir para a página anterior",
    "go to the next page":
        "ir para a página seguinte",
    "Controls":
        "Controles",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "#expandIcon e #collapseIcon devem mudar o visualizador para o modo página inteira e voltar.",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "Se trabalhar com a extensão do navegador, estes botões não causarão qualquer efeito, uma vez que o visualizador leva a página inteira por defeito.",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "Modo de visualização scroll contínuo",
    "Number of pages in a row":
        null,
    "Number of pages in the first row":
        null,
    "Single page view mode":
        "Modo de visualização de uma página",
    "Text view mode":
        "Modo de visualização de texto",
    "Click on the number to enter it manually":
        "Clique no número para o introduzir manualmente",
    "Rotate the page":
        "Rodar a página",
    "You also can scale the page via Ctrl+MouseWheel":
        "Também pode escalar a página através de Ctrl+MouseWheel",
    "Text cursor mode":
        "Modo cursor de texto",
    "Grab cursor mode":
        "Modo de agarrar o cursor",
    "Table of contents":
        null,
    "Toolbar is always shown":
        null,
    "Toolbar automatically hides":
        null,

    // Contents
    "Contents":
        "Conteúdos",
    "No contents provided":
        "Nenhum conteúdo fornecido",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "A ligação aponta para outro documento. Quer prosseguir?",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "Nenhum texto nesta página",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "Está a tentar salvar um documento indirecto (multi-arquivo).",
    "What exactly do you want to do?":
        "Que queres fazer exactamente?",
    "Save only index file":
        "Guardar só ficheiro de índice",
    "Download, bundle and save the whole document as one file":
        "Descarregar, agrupar e guardar o documento inteiro como um só ficheiro",
    "Downloading and bundling the document":
        "Descarregar e empacotar o documento",
    "The document has been downloaded and bundled into one file successfully":
        "O documento foi descarregado e agrupado num único ficheiro com sucesso",

    // Printing
    "Print document":
        "Imprimir documento",
    "Pages must be rendered before printing.":
        "As páginas devem ser entregues antes da impressão.",
    "It may take a while.":
        "Pode demorar algum tempo.",
    "Select the pages you want to print.":
        "Seleccione as páginas que pretende imprimir.",
    "From":
        "De",
    "to":
        "a",
    "Prepare pages for printing":
        "Preparar páginas para impressão",
    "Preparing pages for printing":
        "Preparar páginas para impressão",

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