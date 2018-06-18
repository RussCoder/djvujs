chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({ url: "viewer.html" }));

chrome.contextMenus.create({
    id: "open_with",
    title: "Open with DjVu.js Viewer",
    contexts: ["link"],
    targetUrlPatterns: ['*://*/*.djvu', '*://*/*.djv']
});

function promisify(func) {
    return function (...args) {
        return new Promise(resolve => {
            func(...args, resolve);
        });
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.tab && message === "include_scripts") {
        Promise.all([
            promisify(chrome.tabs.executeScript)(sender.tab.id, { file: 'djvu.js' }),
            promisify(chrome.tabs.executeScript)(sender.tab.id, { file: 'djvu_viewer.js' }),
            promisify(chrome.tabs.insertCSS)(sender.tab.id, { file: 'djvu_viewer.css' })
        ]).then(() => {
            sendResponse();
        })
        return true;
    }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open_with") {
        chrome.tabs.create({ url: "viewer.html" + "#" + info.linkUrl });
    }
});