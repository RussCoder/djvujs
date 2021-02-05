import DjVu from "../DjVu";

/**
 * Delays execution of a callback for a while in order to wait whether there will be one more such an event,
 * and if there is one more event, the only last event is processed. However, a handler is invoked not less frequently than
 * once within maxDelayTime. Good optimization for scroll events, since there are many of them.
 */
export const createDeferredHandler = (callback, delayTime = 100, maxDelayTime = 500) => {
    let firstTimestamp = null;
    let timeout = null;
    const wrappedCallback = e => {
        firstTimestamp = null;
        timeout = null;
        callback(e);
    }

    return e => {
        if (firstTimestamp && (e.timeStamp - firstTimestamp) > maxDelayTime) {
            timeout && clearTimeout(timeout);
            wrappedCallback(e);
        } else {
            if (!firstTimestamp) {
                firstTimestamp = e.timeStamp;
            }
            timeout && clearTimeout(timeout);
            timeout = setTimeout(wrappedCallback, delayTime, e);
        }
    };
};

export function getHeaderAndErrorMessage(t, error) {
    let header, message, isJSON = false;
    switch (error.code) {
        case DjVu.ErrorCodes.NETWORK_ERROR:
            header = t('Network error');
            message = t('Check your network connection');
            break;

        case DjVu.ErrorCodes.UNSUCCESSFUL_REQUEST:
            header = t('Web request error');
            switch (error.status) {
                case 404:
                    message = t('404 Document not found');
                    break;
                case 403:
                    message = t('403 Access forbidden');
                    break;
                case 500:
                    message = t('500 Internal server error');
                    break;

                default:
                    message = t('The request failed with HTTP status #status', { '#status': error.status });
            }
            break;

        case DjVu.ErrorCodes.FILE_IS_CORRUPTED:
            header = t('DjVu file is corrupted');
            message = t("The file doesn't comply with the DjVu format specification or it's not a whole DjVu document");
            break;

        case DjVu.ErrorCodes.INCORRECT_FILE_FORMAT:
            header = t('Incorrect file format');
            message = t('The provided file is not a DjVu document');
            break;

        case DjVu.ErrorCodes.NO_SUCH_PAGE:
            header = t('Incorrect page number');
            message = t('There is no page with the number #pageNumber', { '#pageNumber': error.pageNumber });
            break;

        case DjVu.ErrorCodes.NO_BASE_URL:
            header = t('No base URL for an indirect DjVu document');
            message = t('You probably opened an indirect (multi-file) DjVu document manually.') + '\n' +
                t('But such multi-file documents can be only loaded by URL.');
            break;

        default: {
            header = t('Unexpected error');
            try {
                message = JSON.stringify(error, null, 2);
                isJSON = true;
            } catch {
                message = t('Cannot print the error, look in the console');
            }
        }
    }

    return { header, message, isJSON };
}