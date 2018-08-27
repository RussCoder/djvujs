const Consts = {
    DEFAULT_DPI: 100,
    TEXT_CURSOR_MODE: null,
    GRAB_CURSOR_MODE: null,

    SET_CURSOR_MODE_ACTION: null,
    ERROR_ACTION: null,
    CLOSE_MODAL_WINDOW_ACTION: null,
    CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION: null,
    CONTENTS_IS_GOTTEN_ACTION: null,
    ARRAY_BUFFER_LOADED_ACTION: null,
    IMAGE_DATA_RECEIVED_ACTION: null,
    DOCUMENT_CREATED_ACTION: null,
    SET_NEW_PAGE_NUMBER_ACTION: null,
    SET_PAGE_BY_URL_ACTION: null,
    //DATA_URL_CREATED_ACTION: null,
    TOGGLE_FULL_PAGE_VIEW_ACTION: null,
    TOGGLE_TEXT_MODE_ACTION: null,
    PAGE_TEXT_FETCHED_ACTION: null,
    SET_USER_SCALE_ACTION: null,
    START_FILE_LOADING_ACTION: null,
    END_FILE_LOADING_ACTION: null,
    FILE_LOADING_PROGRESS_ACTION: null,
    SAVE_DOCUMENT_ACTION: null,
    SHOW_HELP_WINDOW_ACTION: null,
    CLOSE_HELP_WINDOW_ACTION: null,
    CLOSE_DOCUMENT_ACTION: null,
    SET_PAGE_ROTATION_ACTION: null,

    SET_API_CALLBACK_ACTION: null, // A special action for interaction with sagas. Used for program API of the viewer, look at the DjVuViewer.js
};

for (const key in Consts) {
    if (Consts[key] === null) {
        Consts[key] = key;
    }
}

export default Object.freeze(Consts);