'use strict';

chrome.contextMenus.create({
    id: "open_with",
    title: "Open with DjVu.js Viewer",
    contexts: ["link"],
    targetUrlPatterns: [
        '*://*/*.djvu',
        '*://*/*.djv',
        '*://*/*.djvu?*',
        '*://*/*.djv?*',
    ]
});

function promisify(func) {
    return function (...args) {
        return new Promise(resolve => {
            func(...args, resolve);
        });
    };
}

const getViewerUrl = (djvuUrl = null, djvuName = null) => {
    const extensionUrl = chrome.runtime.getURL("viewer.html");
    const params = new URLSearchParams();
    djvuUrl && params.set('url', djvuUrl);
    djvuName && params.set('name', djvuName);
    const queryString = params.toString();
    return extensionUrl + (queryString ? '?' + queryString : '');
};

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
        'file:///*/*.djvu?*',
        'file:///*/*.djv',
        'file:///*/*.djv?*',
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

const onBeforeRequest = chrome.webRequest.onBeforeRequest;

// Detect djvu only by URL
const enableHttpIntercepting = () => {
    !onBeforeRequest.hasListener(requestInterceptor) && onBeforeRequest.addListener(requestInterceptor, {
        urls: [
            'http://*/*.djvu',
            'http://*/*.djvu?*',
            'https://*/*.djvu',
            'https://*/*.djvu?*',
            'http://*/*.djv',
            'http://*/*.djv?*',
            'https://*/*.djv',
            'https://*/*.djv?*',
        ],
        types: ['main_frame', 'sub_frame'],
    },
        ["blocking"]
    );
};

const disableHttpIntercepting = () => {
    onBeforeRequest.hasListener(requestInterceptor) && onBeforeRequest.removeListener(requestInterceptor);
};

const headersAnalyzer = details => {
    const getFileName = () => {
        const contentDisposition = details.responseHeaders.find(item => item.name.toLowerCase() === 'content-disposition');
        if (contentDisposition) {
            // In fact, there may be also filename*= in the header, so perhaps, it will be needed for someone in the future
            const matches = /(?:attachment|inline);\s+filename="(.+\.djvu?)"/.exec(contentDisposition.value);
            return matches && matches[1];
        }
    };

    const contentType = details.responseHeaders.find(item => item.name.toLowerCase() === 'content-type');
    if (contentType) {
        if (contentType.value === 'image/vnd.djvu' || contentType.value === 'image/x.djvu') {
            // analyse Content-Disposition only if there is no filename in the URL
            return { redirectUrl: getViewerUrl(details.url, /\.djvu?(?:\?.*)?$/.test(details.url) ? null : getFileName()) };
        } else if (contentType.value === 'application/octet-stream') {
            const fileName = getFileName();
            if (fileName) {
                return { redirectUrl: getViewerUrl(details.url, fileName) };
            }
        }
    }
};

const onHeadersReceived = chrome.webRequest.onHeadersReceived;

const enableHeadersAnalysis = () => {
    !onHeadersReceived.hasListener(headersAnalyzer) && onHeadersReceived.addListener(headersAnalyzer, {
        urls: [
            'http://*/*',
            'https://*/*',
        ],
        types: ['main_frame', 'sub_frame'],
    }, ['blocking', 'responseHeaders']);
};

const disableHeadersAnalysis = () => {
    onHeadersReceived.hasListener(headersAnalyzer) && onHeadersReceived.removeListener(headersAnalyzer)
};

const defaultOptions = Object.freeze({
    // here we duplicated only the options, which are used by the extension code
    interceptHttpRequests: true,
    analyzeHeaders: false,
});

const onOptionsChanged = json => {
    let parsedOptions = {};
    try {
        parsedOptions = json ? JSON.parse(json) : {};
    } catch (e) {
        console.error('DjVu.js Extension: cannot parse options json from the storage. The json: \n', json);
        console.error(e);
    }

    try {
        const options = { ...defaultOptions, ...parsedOptions };
        if (options.interceptHttpRequests) {
            enableHttpIntercepting();
        } else {
            disableHttpIntercepting();
        }

        if (options.interceptHttpRequests && options.analyzeHeaders) {
            enableHeadersAnalysis();
        } else {
            disableHeadersAnalysis();
        }
    } catch (e) {
        console.error('DjVu.js Extension: some options might not have been applied due to an error.');
        console.error(e);
    }
};

chrome.storage.local.get('djvu_js_options', options => onOptionsChanged(options['djvu_js_options']));

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes['djvu_js_options']) {
        if (changes['djvu_js_options'].newValue) {
            onOptionsChanged(changes['djvu_js_options'].newValue);
        }
    }
});