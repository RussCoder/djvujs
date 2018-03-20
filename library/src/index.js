import DjVu from "./DjVu";
import DjVuDocument from "./DjVuDocument";
import DjVuWorker from "./DjVuWorker";
import initWorker from './DjVuWorkerScript';
import { DjVuErrorCodes } from './DjVuErrors';

if (!Function('return this;')().document) { // if inside a Worker
    initWorker();
}

export default Object.assign({}, DjVu, {
    Worker: DjVuWorker,
    Document: DjVuDocument,
    ErrorCodes: DjVuErrorCodes
});