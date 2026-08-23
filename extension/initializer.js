'use strict';

// Must be kept in sync with background.js
const optOutParamName = 'djvu-js';
const optOutParamValue = 'off';

/**
 * The extension decides whether something is a DjVu file by its URL only, so an HTML page
 * whose address ends with ".djvu" (e.g. https://commons.wikimedia.org/wiki/File:Foo.djvu)
 * may be captured by mistake. Appending this marker to the URL makes the interceptors
 * ignore it, so that the browser opens it as a usual page.
 * See https://github.com/RussCoder/djvujs/issues/103
 */
const getOptOutUrl = url => {
    const urlObject = new URL(url, location.href);
    urlObject.searchParams.set(optOutParamName, optOutParamValue);
    return urlObject.href;
};

const isOptedOut = url => {
    try {
        return new URL(url, location.href).searchParams.get(optOutParamName) === optOutParamValue;
    } catch (e) {
        return false;
    }
};

const showOptOutLink = url => {
    const link = document.createElement('a');
    link.href = getOptOutUrl(url);
    link.textContent = "Not a DjVu file? Open this URL as a usual web page →";
    link.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;'
        + 'padding:10px 12px;text-align:center;font:14px sans-serif;'
        + 'background:#ffe9a8;color:#333;text-decoration:underline;'
        + 'border-top:1px solid #d9c37e;';
    document.body.appendChild(link);
};

window.onload = () => {
    const viewer = new DjVu.Viewer({
        uiOptions: {
            hideFullPageSwitch: true,
        }
    });
    viewer.render(document.getElementById('root'));

    viewer.on(DjVu.Viewer.Events.DOCUMENT_CHANGED, () => {
        document.title = viewer.getDocumentName();
    });

    viewer.on(DjVu.Viewer.Events.DOCUMENT_CLOSED, () => {
        document.title = 'DjVu.js Viewer';
    });

    const params = new URLSearchParams(location.search.slice(1));
    const url = params.get('url');
    if (!url) return;

    viewer.loadDocumentByUrl(url, params.get('name') ? { name: params.get('name') } : undefined)
        .then(() => {
            // the promise is resolved even if the loading has failed, so check the state
            let hasFailed = false;
            try {
                hasFailed = !!DjVu.Viewer.get.error(viewer.store.getState());
            } catch (e) {
                return; // the viewer internals have changed - just leave the error as is
            }
            if (hasFailed && !isOptedOut(url)) {
                showOptOutLink(url);
            }
        });
};
