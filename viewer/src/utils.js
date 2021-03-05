import DjVu from './DjVu';

/**
 * We use the error codes form the library just to unify the structure of error objects and
 * make it easier to show an appropriate error message for each case. These codes are used in the
 * ErrorWindow component.
 */
export function loadFile(url, progressHandler) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = 'arraybuffer';
        xhr.onload = (e) => {
            if (xhr.status && xhr.status !== 200) { // при загрузке файла status === 0
                return reject({
                    code: DjVu.ErrorCodes.UNSUCCESSFUL_REQUEST,
                    status: xhr.status,
                    header: `Response status code: ${xhr.status}`,
                    message: `Response status text: ${xhr.statusText}`
                });
            }
            resolve(xhr);
        };

        xhr.onerror = (e) => {
            reject({
                code: DjVu.ErrorCodes.NETWORK_ERROR,
                header: "Network error",
                message: "You should check your network connection",
            });
        }

        xhr.onprogress = progressHandler;
        xhr.send();
    });
}

export const inExtension = !!(document.querySelector('input#djvu_js_extension_main_page')
    && window.chrome && window.chrome.runtime && window.chrome.runtime.id);
export const isFirefox = /Firefox/.test(navigator.userAgent);

export const normalizeFileName = fileName => {
    return /\.(djv|djvu)$/.test(fileName) ? fileName : (fileName + '.djvu');
};