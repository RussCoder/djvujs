'use strict';

window.onunload = () => chrome.runtime.sendMessage("unregister_viewer_tab");

window.onload = () => {
    chrome.runtime.sendMessage("register_viewer_tab", () => {
        window.ViewerInstance = new window.DjVu.Viewer();
        window.ViewerInstance.render(document.getElementById('root'));

        hashChangeHandler();
        window.onhashchange = hashChangeHandler;
    });
};

function hashChangeHandler() {
    if (location.hash) {
        var url = location.hash.substr(1);
        window.ViewerInstance.loadDocumentByUrl(url);
        var res = /[^/]*$/.exec(url.trim());
        if (res) {
            document.title = res[0];
        }
    }
}