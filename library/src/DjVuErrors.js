/**
 * Простейший класс ошибки, не содержит рекурсивных данных, чтобы иметь возможность копироваться
 * между потоками в сообщениях
 */
export class DjVuError {
    constructor(code, message) {
        this.code = code;
        this.message = message;
    }
}

export class IncorrectFileFormatDjVuError extends DjVuError {
    constructor() {
        super(DjVuErrorCodes.INCORRECT_FILE_FORMAT, "The provided file is not a .djvu file!");
    }
}

export class NoSuchPageDjVuError extends DjVuError {
    constructor(pageNumber) {
        super(DjVuErrorCodes.NO_SUCH_PAGE, "There is no page with the number " + pageNumber + " !");
        this.pageNumber = pageNumber;
    }
}

export class CorruptedFileDjVuError extends DjVuError {
    constructor(message = "") {
        super(DjVuErrorCodes.FILE_IS_CORRUPTED, "The file is corrupted! " + message);
    }
}

export class UnableToTransferDataDjVuError extends DjVuError {
    constructor(tasks) {
        super(DjVuErrorCodes.DATA_CANNOT_BE_TRANSFERRED,
            "The data cannot be transferred from the worker to the main page! " +
            "Perhaps, you requested a complex object like DjVuPage, but only simple objects can be transferred between workers."
        );
        this.tasks = tasks;
    }
}

export class IncorrectTaskDjVuError extends DjVuError {
    constructor(task) {
        super(DjVuErrorCodes.INCORRECT_TASK, "The task contains an incorrect sequence of functions!");
        this.task = task;
    }
}

export class NoBaseUrlDjVuError extends DjVuError {
    constructor() {
        super(DjVuErrorCodes.NO_BASE_URL,
            "The base URL is required for the indirect djvu to load components," +
            " but no base URL was provided to the document constructor!"
        );
    }
}

function getErrorMessageByData(data) {
    var message = '';
    if (data.pageNumber) {
        if (data.dependencyId) {
            message = `A dependency ${data.dependencyId} for the page number ${data.pageNumber} can't be loaded!\n`;
        } else {
            message = `The page number ${data.pageNumber} can't be loaded!`;
        }
    } else if (data.dependencyId) {
        message = `A dependency ${data.dependencyId} can't be loaded!\n`;
    }
    return message;
}

export class UnsuccessfulRequestDjVuError extends DjVuError {
    constructor(response, data = { pageNumber: null, dependencyId: null }) {
        var message = getErrorMessageByData(data);
        super(DjVuErrorCodes.UNSUCCESSFUL_REQUEST,
            message + '\n' +
            `The request to ${response.url} wasn't successful.\n` +
            `The response status is ${response.status}.\n` +
            `The response status text is: "${response.statusText}".`
        );
        this.status = response.status;
        this.statusText = response.statusText;
        this.url = response.url;
        if (data.pageNumber) {
            this.pageNumber = data.pageNumber;
        }
        if (data.dependencyId) {
            this.dependencyId = data.dependencyId;
        }
    }
}

export class NetworkDjVuError extends DjVuError {
    constructor(data = { pageNumber: null, dependencyId: null, url: null }) {
        super(DjVuErrorCodes.NETWORK_ERROR,
            getErrorMessageByData(data) + '\n' +
            "A network error occurred! Check your network connection!"
        );
        if (data.pageNumber) {
            this.pageNumber = data.pageNumber;
        }
        if (data.dependencyId) {
            this.dependencyId = data.dependencyId;
        }
        if (data.url) {
            this.url = data.url;
        }
    }
}

export const DjVuErrorCodes = Object.freeze({
    FILE_IS_CORRUPTED: 'FILE_IS_CORRUPTED',
    INCORRECT_FILE_FORMAT: 'INCORRECT_FILE_FORMAT',
    NO_SUCH_PAGE: 'NO_SUCH_PAGE',
    UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
    DATA_CANNOT_BE_TRANSFERRED: 'DATA_CANNOT_BE_TRANSFERRED',
    INCORRECT_TASK: 'INCORRECT_TASK',
    NO_BASE_URL: 'NO_BASE_URL',
    NETWORK_ERROR: 'NETWORK_ERROR',
    UNSUCCESSFUL_REQUEST: 'UNSUCCESSFUL_REQUEST',
});