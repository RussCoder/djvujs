const Consts = {
    ERROR_ACTION: null,
    CLOSE_MODAL_WINDOW_ACTION: null,
    CREATE_DOCUMENT_FROM_ARRAY_BUFFER_ACTION: null,
    ARRAY_BUFFER_LOADED_ACTION: null,
    RENDER_CURRENT_PAGE_ACTION: null,
    IMAGE_DATA_RECEIVED_ACTION: null,
    DOCUMENT_CREATED_ACTION: null,
    SET_NEW_PAGE_NUMBER_ACTION: null,
    DATA_URL_CREATED_ACTION: null,
    TOGGLE_FULL_PAGE_VIEW_ACTION: null,
    TOGGLE_TEXT_MODE_ACTION: null,
    PAGE_TEXT_FETCHED_ACTION: null,
    SET_USER_SCALE_ACTION: null
};

for (const key in Consts) {
    if (Consts[key] === null) {
        Consts[key] = key;
    }
}

export default Object.freeze(Consts);