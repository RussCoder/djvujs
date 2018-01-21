const Consts = {
    DEFAULT_DPI: 100,

    ARRAY_BUFFER_LOADED_ACTION: null,
    IMAGE_DATA_RECIEVED_ACTION: null,
    DOCUMENT_CREATED_ACTION: null,
    SET_NEW_PAGE_NUMBER_ACTION: null
};

for (const key in Consts) {
    if (Consts[key] === null) {
        Consts[key] = key;
    }
}

export default Consts;