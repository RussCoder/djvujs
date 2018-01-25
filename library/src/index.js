import DjVu from "./DjVu.js";
import DjVuDocument from "./DjVuDocument.js";
import DjVuWorker from "./DjVuWorker.js";

import './DjVuWorkerScript.js';

export default Object.assign({}, DjVu, {
    Worker: DjVuWorker,
    Document: DjVuDocument
});