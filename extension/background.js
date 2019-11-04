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

const getViewerUrl = (djvuUrl = null) => chrome.runtime.getURL("viewer.html" + (djvuUrl ? "#" + djvuUrl : ''));

const tabIds = new Set();
let unregisterTimeouts = {};
let tabRemovedHandlerSet = false;

const _unregisterViewerTab = tabId => {
    if (unregisterTimeouts[tabId]) delete unregisterTimeouts[tabId];

    if (tabIds.has(tabId)) {
        tabIds.delete(tabId);
        if (!tabIds.size) {
            // to bypass a Chrome bug due to which GPU memory is not released after all tabs are closed
            chrome.runtime.reload()
        }
    }
}

const unregisterViewerTab = (tabId) => {
    if (unregisterTimeouts[tabId]) {
        clearTimeout(unregisterTimeouts[tabId]);
    }

    // to let reload a tab with the viewer, otherwise it will be closed on attempt to reload it (if there is only one viewer tab opened).
    unregisterTimeouts[tabId] = setTimeout(_unregisterViewerTab, 300, tabId); // in practice it doesn't exceed 150 ms (~70ms in Chrome and ~130ms in Firefox)
};

const registerViewerTab = tabId => {
    if (unregisterTimeouts[tabId]) {
        clearTimeout(unregisterTimeouts[tabId]);
        delete unregisterTimeouts[tabId];
    }
    tabIds.add(tabId);

    if (!tabRemovedHandlerSet) {
        // only to a bit improve user experience and reload the extension without a delay when a tab is closed
        chrome.tabs.onRemoved.addListener(tabId => _unregisterViewerTab(tabId));
        tabRemovedHandlerSet = true;
    }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.tab && message === "include_scripts") {
        Promise.all([
            promisify(chrome.tabs.executeScript)(sender.tab.id, { frameId: sender.frameId, file: 'djvu.js', runAt: "document_end" }),
            promisify(chrome.tabs.executeScript)(sender.tab.id, { frameId: sender.frameId, file: 'djvu_viewer.js', runAt: "document_end" }),
            promisify(chrome.tabs.insertCSS)(sender.tab.id, { frameId: sender.frameId, file: 'djvu_viewer.css', runAt: "document_end" })
        ]).then(() => {
            sendResponse();
        })
        return true; // do not send response immediately
    }

    if (sender.tab && message === "register_viewer_tab") {
        registerViewerTab(sender.tab.id);
    }

    if (sender.tab && message === "unregister_viewer_tab") {
        unregisterViewerTab(sender.tab.id);
    }

    sendResponse();
})

function openViewerTab(djvuUrl = null) {
    chrome.tabs.create({ url: getViewerUrl(djvuUrl) });
}

chrome.browserAction.onClicked.addListener(() => openViewerTab());

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "open_with") {
        openViewerTab(info.linkUrl);
    }
});

// interception of direct file opening
chrome.webRequest.onBeforeRequest.addListener(details => {
    return { redirectUrl: getViewerUrl(details.url) };
}, {
    urls: [
        'file:///*/*.djvu',
        'file:///*/*.djv',
    ],
    types: ['main_frame']
},
    ["blocking"]
);

// it shouldn't be the same function as the file opening interceptor,
// since this event listener can be removed independently from the file opening interceptor
const requestInterceptor = details => {
    return { redirectUrl: getViewerUrl(details.url) };
}

let isHttpInterceptingEnabled = false;

const enableHttpIntercepting = () => {
    !isHttpInterceptingEnabled && chrome.webRequest.onBeforeRequest.addListener(requestInterceptor, {
        urls: [
            'http://*/*.djvu',
            'http://*/*.djv',
            'https://*/*.djvu',
            'https://*/*.djv',
        ],
        types: ['main_frame']
    },
        ["blocking"]
    );
    isHttpInterceptingEnabled = true;
};

const disableHttpIntercepting = () => {
    isHttpInterceptingEnabled && chrome.webRequest.onBeforeRequest.removeListener(requestInterceptor);
    isHttpInterceptingEnabled = false;
};

chrome.storage.local.get('djvu_js_options', options => {
    try {
        options = JSON.parse(options['djvu_js_options']);
        if (options.interceptHttpRequests) {
            enableHttpIntercepting();
        }
    } catch (e) { }
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes['djvu_js_options']) {
        if (changes['djvu_js_options'].newValue) {
            const options = JSON.parse(changes['djvu_js_options'].newValue);
            if (options.interceptHttpRequests) {
                enableHttpIntercepting();
            } else {
                disableHttpIntercepting();
            }
        }
    }
});