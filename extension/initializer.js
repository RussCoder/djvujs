window.onload = function () {
    window.DjVu.Viewer.init(document.getElementById('root'));

    chrome.tabs.getCurrent(tab => {
        chrome.runtime.sendMessage(tab.id, url => {
            if (url) {
                DjVu.Viewer.loadDocumentByUrl(url);
            }
        });
    });
};