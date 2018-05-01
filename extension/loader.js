browser.runtime.onMessage.addListener(url => {      
    DjVu.Viewer.loadDocumentByUrl(url);
});