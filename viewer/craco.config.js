/**
 * Overriding standard build config of Create React App (react-scripts).
 *
 * See https://github.com/gsoft-inc/craco/blob/master/packages/craco/README.md#configuration-overview
 */

'use strict';

const resolve = require('path').resolve;
const contentDisposition = require('content-disposition');

module.exports = {
    // See https://webpack.js.org/configuration/dev-server/ how to configure;
    // see http://localhost:3000/webpack-dev-server for web paths served.
    devServer: (config) => {
        var array = typeof config.contentBase === 'string' ? [config.contentBase] : content.contentBase;
        config.contentBase = [
            ...array,
            '../library/assets',
        ];

        //config.watchContentBase = true;

        // Ensure proper "404 Not Found" responses for invalid URLs without fallback to index page
        config.historyApiFallback = false;

        // Serve djvu files with specific headers at /djvufile URL. Pass options as query arguments.
        // Available options:
        // fname : file name you want to get (set as filename part of Content-Disposition header).
        //      Default is TheMap.djvu
        //  cd (content disposition) : 'inline' (default) or 'attachment'
        // Example:
        //  http://localhost:3000/djvufile?fname=FileNameAsIWantItBack.djvu&type=attachment
        //
        config.before = function (app /*, server, compiler*/) {
            app.get('/djvufile', function (req, res) {
                const contentDispositionType = req.query.cd || 'inline';
                let filename = req.query.fname || 'TheMap.djvu';
                const cdHeader = contentDisposition(filename, { type: contentDispositionType });
                res.setHeader('Content-Disposition', cdHeader);

                res.sendFile(resolve('../library/assets/carte.djvu'));
            });
        };

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
    },
    babel: {
        plugins: ["babel-plugin-styled-components"],
    },
};