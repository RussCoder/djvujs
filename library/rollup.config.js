const replace = require('rollup-plugin-re');
const cleanup = require('rollup-plugin-cleanup');

module.exports = {
    input: './src/index.js',
    output: [{
        file: 'dist/djvu.js',
        format: 'iife',
        name: 'DjVu'
    }, {
        file: '../viewer/public/tmp/djvu.js',
        format: 'iife',
        name: 'DjVu'
    }],
    plugins: [
        replace({
            defines: {
                FALSE_FLAG: false
            },
            replaces: {
                "'use strict';": ''
            }
        }),
        cleanup()
    ]
};