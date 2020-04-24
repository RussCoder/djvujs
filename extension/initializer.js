'use strict';

let viewer;

window.onunload = () => chrome.runtime.sendMessage("unregister_viewer_tab");

window.onload = () => {
    chrome.runtime.sendMessage("register_viewer_tab", () => {
        viewer = new DjVu.Viewer();
        viewer.render(document.getElementById('root'));

        viewer.on(DjVu.Viewer.Events.DOCUMENT_CHANGED, () => {
            document.title = viewer.getDocumentName();
        });

        viewer.on(DjVu.Viewer.Events.DOCUMENT_CLOSED, () => {
            document.title = 'DjVu.js Viewer';
        });

        hashChangeHandler();
        window.onhashchange = hashChangeHandler;
    });
};

function hashChangeHandler() {
    if (location.hash) {
        var url = location.hash.substr(1);
        viewer.loadDocumentByUrl(url);
    }
}