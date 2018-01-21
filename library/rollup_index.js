import DjVu from "./src/DjVu.js";
import DjVuDocument from "./src/DjVuDocument.js";
import DjVuWorker from "./src/DjVuWorker.js";

import './src/DjVuWorkerScript.js';

export default Object.assign({}, DjVu, {
    Worker: DjVuWorker,
    Document: DjVuDocument
});