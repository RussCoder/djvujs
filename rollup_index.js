import DjVu from "./djvujs/DjVu.js";
import DjVuDocument from "./djvujs/DjVuDocument.js";
import DjVuWorker from "./djvujs/DjVuWorker.js";

import './djvujs/DjVuWorkerScript.js';

export default Object.assign({}, DjVu, {
    Worker: DjVuWorker,
    Document: DjVuDocument
});