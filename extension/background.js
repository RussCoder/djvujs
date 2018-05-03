chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({ url: "viewer.html" }));

chrome.contextMenus.create({
    id: "open_with",
    title: "Open with DjVu.js Viewer",
    contexts: ["link"],
    targetUrlPatterns: ['*://*/*.djvu', '*://*/*.djv']
});

const tabUrls = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.tab) {
        var url = tabUrls[sender.tab.id];
        delete tabUrls[sender.tab.id];
        sendResponse(url);
    }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open_with") {
        chrome.tabs.create({ url: "viewer.html" }, tab => {
            tabUrls[tab.id] = info.linkUrl;
        });
    }
});