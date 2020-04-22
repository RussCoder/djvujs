/**
 * Throughout the code mostly vars are used, not consts or lets. 
 * It's because of that in 2015-2016, when the library was created, 
 * Chrome couldn't optimize ES6 code properly, which resulted in a big performance decrease,
 * about 3 times or even more. Now, in 2020, it seems than ES6 variable declarations 
 * don't have that devastating impact anymore, so they can be used.
 */

import DjVu from "./DjVu";
import DjVuDocument from "./DjVuDocument";
import DjVuWorker from "./DjVuWorker";
import initWorker from './DjVuWorkerScript';
import { DjVuErrorCodes } from './DjVuErrors';

if (!self.document) { // if inside a Worker
    initWorker();
}

export default Object.assign({}, DjVu, {
    Worker: DjVuWorker,
    Document: DjVuDocument,
    ErrorCodes: DjVuErrorCodes
});