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