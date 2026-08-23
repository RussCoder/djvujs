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
        "Traditional Chinese",
    nativeName:
        "正體中文",

    "Language":
        "語言", // not used now, but will be used in options afterwards

    // Translation: tooltips and notification
    // (to see the notification window, remove several phrases from any dictionary, except for the English one)
    "Add more":
        "補充更多",
    "The translation isn't complete.":
        "翻譯尚未完成。",
    "The following phrases are not translated:":
        "以下詞句尚未翻譯：",
    "You can improve the translation here":
        "你可以在此協助改善翻譯",

    // Initial screen
    "#helpButton - learn more about the app":
        "#helpButton - 了解這個應用程式",
    "#optionsButton - see the available options":
        "#optionsButton - 查看可用的選項",
    "powered with":
        "基於",
    "Drag & Drop a file here or click to choose manually":
        "將檔案拖曳至此，或點選以手動選擇",
    "Paste a URL to a djvu file here":
        "在此貼上 djvu 檔案的網址",
    "Open URL":
        "開啟網址",
    'Enter a valid URL (it should start with "http(s)://" | "data:")': // an alert shown when you try to open an empty URL
        '請輸入有效的網址（應以 "http(s)://" | "data:" 開頭）',

    // Errors. Usually there is a header and a message for each error type.
    // For the web request error there are different types of messages depending on the HTTP status.
    // The ways to see the errors in the viewer are described in comments below.
    // In case of web requests you can load links via the browser extension (via the URL field on the initial screen)
    "Error":
        "錯誤",
    "Error on page":
        "頁面錯誤", // Open 'library/assets/czech_indirect/index.djvu
    "Network error":
        "網路錯誤", // Disable internet connection and try to load something by URL
    "Check your network connection":
        "請檢查你的網路連線",
    // Load any URL to a nonexistent page on the Internet,
    // e.g. https://djvu.js.org/nonexistentpage
    "Web request error":
        "網路請求錯誤",
    "404 Document not found":
        "404 找不到文件",
    "403 Access forbidden":
        "403 禁止存取",
    "500 Internal server error":
        "500 伺服器內部錯誤",
    "The request failed with HTTP status #status":
        "請求失敗，HTTP 狀態 #status",
    "DjVu file is corrupted": // Open "/library/assets/czech_indirect/dict0085.iff"
        "DjVu 檔案已損毀",
    "The file doesn't comply with the DjVu format specification or it's not a whole DjVu document":
        "此檔案不符合 DjVu 格式規範，或並非完整的 DjVu 文件",
    "Incorrect file format": // Open a not-djvu file.
        "檔案格式錯誤",
    "The provided file is not a DjVu document":
        "所提供的檔案並非 DjVu 文件",
    // Load a URL to a DjVu file with "#page=100500" at the end (both in continuous scroll and single-page view modes)
    // e.g. https://djvu.js.org/assets/djvu_examples/DjVu3Spec.djvu#page=100500
    "Incorrect page number":
        "頁碼錯誤",
    "There is no page with the number #pageNumber":
        "沒有頁碼為 #pageNumber 的頁面",
    // "baseURL" is a URL to a document directory,
    // all links inside the document index.djvu are considered relative to this URL.
    // The term "base URL" can be translated as "a URL to the document's folder".
    "No base URL for an indirect DjVu document":  // Open "/library/assets/czech_indirect/index.djvu"
        "間接式 DjVu 文件缺少文件資料夾的網址",
    "You probably opened an indirect (multi-file) DjVu document manually.":
        "你可能手動開啟了一份間接式（多檔案）DjVu 文件。",
    "But such multi-file documents can be only loaded by URL.":
        "但這類多檔案文件只能透過網址載入。",
    "Unexpected error": // Of course there is no standard way to produce this kind of error
        "未預期的錯誤",
    "Cannot print the error, look in the console":
        "無法顯示錯誤內容，請查看主控台",

    // Options and its tooltips
    "Options":
        "選項",
    "Show options window":
        "顯示選項視窗",
    "Color theme":
        "色彩主題",
    "Extension options":
        "擴充功能選項", // the options of the browser extension
    "Open all links with .djvu at the end via the viewer":
        "以檢視器開啟所有結尾為 .djvu 的連結",
    "All links to .djvu files will be opened by the viewer via a simple click on a link":
        "只要點選連結，所有 .djvu 檔案的連結都會由檢視器開啟",
    "Detect .djvu files by means of http headers":
        "透過 http 標頭偵測 .djvu 檔案",
    "Analyze headers of every new tab in order to process even links which do not end with the .djvu extension":
        "分析每個新分頁的標頭，以便一併處理結尾不是 .djvu 的連結",

    // Footer: status bar
    "Ready":
        "就緒",
    "Loading":
        "載入中",

    // Footer: buttons' tooltips
    "Show help window":
        "顯示說明視窗",
    "Switch full page mode":
        "切換整頁模式",

    // File Block tooltips
    "Choose a file":
        "選擇檔案",
    "Close document":
        "關閉文件",
    "Save document":
        "儲存文件",
    "Save":
        "儲存",
    "Open another .djvu file":
        "開啟另一個 .djvu 檔案",

    // Help window
    "The application for viewing .djvu files in the browser.":
        "這是一個在瀏覽器中檢視 .djvu 檔案的應用程式。",
    "If something doesn't work properly, feel free to write about the problem at #email.":
        "若有任何運作不正常之處，歡迎寄信至 #email 回報。",
    "The official website is #website.":
        "官方網站為 #website。",
    "The source code is available on #link.":
        "原始碼位於 #link。",
    "Hotkeys":
        "快速鍵",
    "save the document":
        "儲存文件",
    "go to the previous page":
        "上一頁",
    "go to the next page":
        "下一頁",
    "Controls":
        "控制項",
    "#expandIcon and #collapseIcon are to switch the viewer to the full page mode and back.":
        "#expandIcon 與 #collapseIcon 用於在整頁模式與一般模式之間切換檢視器。",
    "If you work with the browser extension, these buttons will cause no effect, since the viewer takes the whole page by default.":
        "若你使用的是瀏覽器擴充功能，這些按鈕不會有作用，因為檢視器預設就會佔滿整個頁面。",

    // Toolbar tooltips
    "Continuous scroll view mode":
        "連續捲動檢視模式",
    "Number of pages in a row":
        "每列的頁數",
    "Number of pages in the first row":
        "第一列的頁數",
    "Single page view mode":
        "單頁檢視模式",
    "Text view mode":
        "文字檢視模式",
    "Click on the number to enter it manually":
        "點選數字即可手動輸入",
    "Rotate the page":
        "旋轉頁面",
    "You also can scale the page via Ctrl+MouseWheel":
        "你也可以用 Ctrl+滑鼠滾輪 縮放頁面",
    "Text cursor mode":
        "文字游標模式",
    "Grab cursor mode":
        "抓取游標模式",
    "Table of contents":
        "目錄",
    "Toolbar is always shown":
        "工具列固定顯示",
    "Toolbar automatically hides":
        "工具列自動隱藏",

    // Contents
    "Contents":
        "目錄",
    "No contents provided":
        "未提供目錄",
    // A rare case. Open /library/assets/links.djvu in the viewer on https://djvu.js.org/ (not in the extension!)
    // and click the "Absolute Link" in the contents
    "The link points to another document. Do you want to proceed?":
        "此連結指向另一份文件，確定要前往嗎？",

    // Text Block (shown in the text view mode)
    "No text on this page":
        "此頁沒有文字",

    // Save dialog (shows when you save an indirect djvu)
    "You are trying to save an indirect (multi-file) document.":
        "你正嘗試儲存一份間接式（多檔案）文件。",
    "What exactly do you want to do?":
        "你想要如何處理？",
    "Save only index file":
        "只儲存索引檔",
    "Download, bundle and save the whole document as one file":
        "下載、打包並將整份文件儲存為單一檔案",
    "Downloading and bundling the document":
        "正在下載並打包文件",
    "The document has been downloaded and bundled into one file successfully":
        "文件已成功下載並打包為單一檔案",

    // Printing
    "Print document":
        "列印文件",
    "Pages must be rendered before printing.":
        "列印前必須先繪製頁面。",
    "It may take a while.":
        "這可能需要一些時間。",
    "Select the pages you want to print.":
        "請選擇你要列印的頁面。",
    "From":
        "從",
    "to":
        "至",
    "Prepare pages for printing":
        "準備列印頁面",
    "Preparing pages for printing":
        "正在準備列印頁面",

    // Menu
    "Menu":
        "選單",
    "Document":
        "文件",
    "About":
        "關於",
    "Print":
        "列印",
    "Close":
        "關閉",
    "View mode":
        "檢視模式",
    "Scale":
        "縮放",
    "Rotation":
        "旋轉",
    "Cursor mode":
        "游標模式",
    "Full page mode":
        "整頁模式",
    "Fullscreen mode":
        "全螢幕模式",
};
