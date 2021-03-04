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
        "Simplified Chinese",
    nativeName:
        "简体中文",

    "Language":
        "语言", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "添加更多",
    "The translation isn't complete.":
        "翻译尚未完成。",
    "The following phrases are not translated:":
        "以下短语尚未被翻译",
    "You can improve the translation here":
        "你可以在这里完善翻译",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - 了解更多",
    "#optionsButton - see the available options":
        "#optionsButton - 查看所有选项",
    "powered with":
        "基于",
    "Drag & Drop a file here or click to choose manually":
        "将文件拖拽至此处或者单击手动选择",
    "Paste a URL to a djvu file here":
        "在此处粘贴djvu文件的地址",
    "Open URL":
        "打开地址",
    'Enter a valid URL (it should start with "http(s)://")': // an alert shown when you try to open an empty URL
        '输入一个有效的地址 (应当以 "http(s)://" 开头)',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "错误",
    "Error on page":
        "页面错误", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "网络错误", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "检查你的网络连接",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "网络请求错误",
    "404 Document not found":
        "404 文件未找到",
    "403 Access forbidden":
        "403 禁止访问",
    "500 Internal server error":
        "500 服务器内部错误",
    "The request failed with HTTP status #status":
        "请求失败，HTTP状态 #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "DjVu文件损坏",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "文件不满足DjVu格式要求或不完整",
    "Incorrect file format": // Open a not-djvu file.
        "文件格式错误",
    "The provided file is not a DjVu document":
        "提供的文件不是一个DjVu文件",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "页码错误",
    "There is no page with the number #pageNumber":
        "没有页面为#pageNumber的页面",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "相对路径的DjVu文档缺少根路径",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "你很有可能手动打开了一个（多文件）相对路径DjVu文档。",
    "But such multi-file documents can be only loaded by URL.":
        "但是这种多文件文档只能通过完整路径打开。",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "未知错误",
    "Cannot print the error, look in the console":
        "无法打印错误，请查看控制台",

    // Options and its tooltips
    "Options":
        "选项",
    "Show options window":
        "显示选项窗口",
    "Color theme":
        "颜色主题",
    "Extension options":
        "扩展选项", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "通过阅读器打开所有以.djvu结尾的链接",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "所有.djvu文件链接将会被阅读器打开",
    "Detect .djvu files by means of http headers":
        "通过http头信息检测.djvu文件",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "分析每一个新选项卡以处理不是以.djvu结尾的链接",

    // Footer: status bar
    "Ready":
        "就绪",
    "Loading":
        "加载中",

    // Footer: buttons' tooltips
    "Show help window":
        "显示帮助窗口",
    "Switch full page mode":
        "切换全屏模式",

    // File Block tooltips
    "Choose a file":
        "选择文件",
    "Close document":
        "关闭文档",
    "Save document":
        "保存文档",
    "Save":
        "保存",
    "Open another .djvu file":
        "打开另一个.djvu文件",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "这是一个在浏览器中浏览.djvu文件的应用。",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "如果运行有问题，请向#email反馈。",
    "The official website is #website.":
        "官方网站是#website。",
    "The source code is available on #link.":
        "源代码位于#link。",
    "Hotkeys":
        "热键",
    "save the document":
        "保存文档",
    "go to the previous page":
        "上一页",
    "go to the next page":
        "下一页",
    "Controls":
        "控件",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "#expandIcon 和 #collapseIcon 用于将阅读器在全屏模式和正常模式间切换。",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "如果你是在使用浏览器插件，则这些按钮将不起作用，因为阅读器会默认使用整个页面。",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "连续滚动模式",
    "Single page view mode":
        "单页模式",
    "Text view mode":
        "文本模式",
    "Click on the number to enter it manually":
        "点击数字以手动输入",
    "Rotate the page":
        "旋转页面",
    "You also can scale the page via Ctrl+MouseWheel":
        "你也可以通过Ctrl+鼠标滚轮来缩放页面",
    "Text cursor mode":
        "文本选择模式",
    "Grab cursor mode":
        "拖拽模式",

    // Contents
    "Contents":
        "目录",
    "No contents provided":
        "没有目录",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "这个链接指向另一个文档，你确定要继续吗？",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "该页没有文本",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "你在试图保存相对路径的多文件文档。",
    "What exactly do you want to do?":
        "你具体是想做什么？",
    "Save only index file":
        "只保存索引文件",
    "Download, bundle and save the whole document as one file":
        "下载打包并保存成一个文件",
    "Downloading and bundling the document":
        "正在下载并打包文件",
    "The document has been downloaded and bundled into one file successfully":
        "文件已成功下载打包到一个文件",

    // Printing
    "Print document":
        null,
    "Pages must be rendered before printing.":
        null,
    "It may take a while.":
        null,
    "Select the pages you want to print.":
        null,
    "From":
        null,
    "to":
        null,
    "Prepare pages for printing":
        null,
    "Preparing pages for printing":
        null,
};