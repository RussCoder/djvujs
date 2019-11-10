/**
 * Overriding standard build config of Create React App (react-scripts)
 */

'use strict';

module.exports = {
    devServer: (config) => {
        var array = typeof config.contentBase === 'string' ? [config.contentBase] : content.contentBase;
        config.contentBase = [
            ...array,
            '../library/assets',
        ];
        //config.watchContentBase = true;
        return config;
    },
    webpack: {
        configure: (config, { env, paths }) => {
            if (env === 'production') {
                // disable chunk splitting - we want to have only one .js and one .css file.
                delete config.optimization.splitChunks;
                config.optimization.runtimeChunk = false;
                // make names of output files the same on each build
                config.output.filename = 'static/js/djvu_viewer.js';
                config.plugins[5].options.filename = 'static/css/djvu_viewer.css';
                config.plugins[5].options.moduleFilename = () => 'static/css/djvu_viewer.css';
            }

            return config;
        }
    }
};