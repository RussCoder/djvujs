/**
 * A script for automatic synchronization of the Russian dictionary with others.
 * It automatically generates English.js from Russian.js, adds missing phrases with null values
 * to other dictionaries, and also can generate a template file for a new translation
 * if the name of a new language is provided as the first command-line argument.
 */

import dictionaries from './src/locales/index.js';
import fs from 'fs';

const mainRegex = /(?<=(?:"|'|`|\b)(.+)(?:"|'|`|\b):\s*(?:\/\/.+$)?\s*)(["'`].*["'`])(?=,)/gm;
const cleanedRussianText = fs.readFileSync('./src/locales/Russian.js', 'utf8')
    .replace(/^\/\*\*[^]+?\*\/[\n\r]+/, '');

function getFilePathByDict(dict) {
    const name = dict.englishName === 'Simplified Chinese' ? "ChineseSimplified" : dict.englishName;
    return `./src/locales/${name}.js`;
}

function getDictWithQuotes(dict) {
    const regex = new RegExp(mainRegex.source, mainRegex.flags);

    const dictWithQuotes = {};
    const text = fs.readFileSync(getFilePathByDict(dict), 'utf8');

    let result;
    while (result = regex.exec(text)) {
        const [, key, value] = result;
        dictWithQuotes[key] = value;
    }

    return dictWithQuotes;
}

function syncDict(dict, dictWithQuotes) {
    let count = 0;
    const text = cleanedRussianText.replace(new RegExp(mainRegex.source, mainRegex.flags), (match, key) => {
        let translation = dictWithQuotes[key];
        if (translation == null) {
            if (dict[key] != null) {
                console.warn(`WARNING: dict with quotes doesn't contain a key-value pair: ${key} : ${dict[key]}`);
                translation = JSON.stringify(dict[key]);
            } else if (dict.englishName === 'English') {
                translation = JSON.stringify(key);
            }
        }
        count++;
        return translation == null ? 'null' : translation;
    });

    fs.writeFileSync(getFilePathByDict(dict), text, 'utf8');

    return count;
}

function main(newFileName) {
    if (newFileName) {
        syncDict({ englishName: newFileName }, { englishName: `"${newFileName}"` });
        console.info(`New file ${newFileName}.js has been generated`);
    } else {
        delete dictionaries.ru;
        for (const dict of Object.values(dictionaries)) {
            const dictWithQuotes = getDictWithQuotes(dict);
            const count = syncDict(dict, dictWithQuotes);
            console.info(`${dict.englishName} synced. ${count} key-value pairs processed.`);
        }
    }
}

main(process.argv[2]);