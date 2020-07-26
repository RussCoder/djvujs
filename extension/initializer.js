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

        const params = new URLSearchParams(location.search.slice(1));
        if (params.get('url')) {
            viewer.loadDocumentByUrl(params.get('url'), params.get('name') ? { name: params.get('name') } : undefined);
        }
    });
};