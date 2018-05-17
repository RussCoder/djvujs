window.onload = function () {
    window.DjVu.Viewer.init(document.getElementById('root'));

    // chrome.tabs.getCurrent(tab => {
    //     chrome.runtime.sendMessage(tab.id, url => {
    //         if (url) {
    //             DjVu.Viewer.loadDocumentByUrl(url);
    //         }
    //     });
    // });

    hashChangeHandler();
    window.onhashchange = hashChangeHandler;
};

function hashChangeHandler() {
    if (location.hash) {
        var url = location.hash.substr(1);
        DjVu.Viewer.loadDocumentByUrl(url);
        var res = /[^/]*$/.exec(url.trim());
        if (res) {
            document.title = res[0];
        }
    }
}