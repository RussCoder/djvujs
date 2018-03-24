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

export const DjVuErrorCodes = Object.freeze({
    INCORRECT_FILE_FORMAT: 'INCORRECT_FILE_FORMAT',
    NO_SUCH_PAGE: 'NO_SUCH_PAGE',
    UNEXPECTED_ERROR: 'UNEXPECTED_ERROR'
});