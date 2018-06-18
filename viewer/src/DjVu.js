/**
 * The module is required due to the bug https://bugzilla.mozilla.org/show_bug.cgi?id=1408996
 * Because of which I can't address to the global object directly via window.DjVu
 * Also it encapsulates the logic of getting the global DjVu object.
 */
if (typeof DjVu !== 'object') {
    throw new Error("There is no DjVu object! You have to include the DjVu.js library first!");
}

const djvu = DjVu; // eslint-disable-line

export default djvu;