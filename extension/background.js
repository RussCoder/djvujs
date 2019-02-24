'use strict';

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
            promisify(chrome.tabs.executeScript)(sender.tab.id, { frameId: sender.frameId, file: 'djvu.js', runAt: "document_end" }),
            promisify(chrome.tabs.executeScript)(sender.tab.id, { frameId: sender.frameId, file: 'djvu_viewer.js', runAt: "document_end" }),
            promisify(chrome.tabs.insertCSS)(sender.tab.id, { frameId: sender.frameId, file: 'djvu_viewer.css', runAt: "document_end" })
        ]).then(() => {
            sendResponse();
        })
        return true;
    }
})

var tabIds = new Set();

chrome.tabs.onRemoved.addListener(tabId => { // to bypass a Chrome bug due to which GPU memory is not released after all tabs are closed.
    if (tabIds.has(tabId)) {
        tabIds.delete(tabId);
        if (!tabIds.size) {
            chrome.runtime.reload();
        }
    }
});

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: "viewer.html" }, tab => tabIds.add(tab.id));
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open_with") {
        chrome.tabs.create({ url: "viewer.html" + "#" + info.linkUrl }, tab => tabIds.add(tab.id));
    }
});