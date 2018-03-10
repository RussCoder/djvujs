import replace from 'rollup-plugin-re';
import cleanup from 'rollup-plugin-cleanup';

export default {
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