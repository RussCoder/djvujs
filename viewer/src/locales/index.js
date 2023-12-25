/**
 * .js extension should be used in all imports, because this file is used in a node script (syncLocales.js)
 */

import English from './English.js';
import Russian from './Russian.js';
import Swedish from './Swedish.js';
import French from "./French.js";
import Italian from "./Italian.js";
import ChineseSimplified from "./ChineseSimplified.js"
import Spanish from "./Spanish.js";
import Portuguese from "./Portuguese.js";
import Ukrainian from './Ukrainian.js';

/**
 * Here we use 2-character lowercase ISO 639-1 codes.
 * https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * These codes are used in `navigator.languages`, so we can detect the preferred languages.
 */
export default {
    'en': English,
    'ru': Russian,
    'sv': Swedish,
    'fr': French,
    'it': Italian,
    'zh': ChineseSimplified,
    'pt': Portuguese,
    'es': Spanish,
    'uk': Ukrainian,
};