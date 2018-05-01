function openPage() {
    browser.tabs.create({
        url: "viewer.html"
    });
}

browser.browserAction.onClicked.addListener(openPage);

browser.contextMenus.create({
    id: "open_with",
    title: "Open with DjVu.js Viewer",
    icons: {
        "32": "djvu32.png"
    },
    contexts: ["link"],
    targetUrlPatterns: ['*://*/*.djvu', '*://*/*.djv']
});

browser.contextMenus.onClicked.addListener(contextMenuHandler);

async function contextMenuHandler(info, tab) {
    if (info.menuItemId !== "open_with") {
        return;
    }

    var tab = await browser.tabs.create({ url: "viewer.html" });
    await browser.tabs.executeScript(tab.id, { file: 'loader.js' });

    browser.tabs.sendMessage(tab.id, info.linkUrl);
}