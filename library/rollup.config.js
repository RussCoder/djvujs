const cleanup = require('rollup-plugin-cleanup');

const outputTemplate = {
    format: 'iife',
    name: 'DjVu',
    intro: "function DjVuScript() {\n'use strict;'",
    outro: "}\nreturn Object.assign(DjVuScript(), {DjVuScript});"
};

module.exports = {
    input: './src/index.js',
    output: [
        Object.assign({ file: 'dist/djvu.js' }, outputTemplate),
        Object.assign({ file: '../viewer/public/tmp/djvu.js' }, outputTemplate),
        Object.assign({ file: '../extension/djvu.js' }, outputTemplate)
    ],
    plugins: [
        cleanup()
    ]
};