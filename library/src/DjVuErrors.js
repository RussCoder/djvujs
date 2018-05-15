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

export const DjVuErrorCodes = Object.freeze({
    FILE_IS_CORRUPTED: 'FILE_IS_CORRUPTED',
    INCORRECT_FILE_FORMAT: 'INCORRECT_FILE_FORMAT',
    NO_SUCH_PAGE: 'NO_SUCH_PAGE',
    UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
    DATA_CANNOT_BE_TRANSFERRED: 'DATA_CANNOT_BE_TRANSFERRED',
    INCORRECT_TASK: 'INCORRECT_TASK',
});