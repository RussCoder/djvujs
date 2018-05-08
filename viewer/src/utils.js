export function loadFile(url, progressHandler) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = 'arraybuffer';
        xhr.onload = (e) => {
            if (xhr.status !== 200) {
                return reject({
                    header: `${xhr.status} code`,
                    message: "Requested resource was not found"
                });
            }
            resolve(xhr.response);
        };

        xhr.onerror = (e) => {
            reject({
                header: "Web request error",
                message: "An error occurred, the file wasn't loaded. XHR status " + e.xhr.status
            })
        }

        xhr.onprogress = progressHandler;
        xhr.send();
    });
}

export function createGetObjectByState(state) {
    var get = {};
    for (const key in state) {
        get[key] = state => state[key];
    }
    return get;
}

export function composeHighOrderGet(statePartToGetMap) {
    var newGet = {};
    Object.keys(statePartToGetMap).forEach(statePart => {
        const innerGet = statePartToGetMap[statePart];
        for (const key in innerGet) {
            newGet[key] = state => innerGet[key](state[statePart]);
        }
    });
    return newGet;
}