'use strict';

const cleanup = require('rollup-plugin-cleanup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const outputTemplate = {
    format: 'iife',
    name: 'DjVu',
    intro: "function DjVuScript() {\n'use strict';",
    outro: "}\nreturn Object.assign(DjVuScript(), {DjVuScript});"
};

module.exports = {
    input: './src/index.js',
    output: [
        Object.assign({ file: 'dist/djvu.js' }, outputTemplate),
        Object.assign({ file: '../viewer/public/tmp/djvu.js' }, outputTemplate),
        Object.assign({ file: '../extension/dist/djvu.js' }, outputTemplate)
    ],
    plugins: [
        resolve(),
        commonjs(),
        cleanup()
    ]
};