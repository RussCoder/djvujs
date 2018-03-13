const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const colors = require('colors');
const rollup = require('rollup');
const rollupConfig = require('./rollup.config.js');

// you can pass the parameter in the command line. e.g. node server.js 3000
const port = process.argv[2] || 9000;

const mimeType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.djvu': 'image/vnd.djvu',
    '.djv': 'image/vnd.djvu'
};

http.createServer(function (req, res) {
    // console.log(`${req.method} ${req.url}`);
    // parse URL
    const parsedUrl = url.parse(req.url);
    // extract URL path
    let pathname = `.${parsedUrl.pathname}`;
    // maps file extention to MIME types

    fs.stat(pathname, function (err, stats) {
        if (err) {
            // if the file is not found, return 404
            res.statusCode = 404;
            res.end(`File ${pathname} not found!`);
            return;
        }
        // if is a directory, then look for index.html
        if (stats.isDirectory()) {
            pathname += '/index.html';
        }
        // read file from file system
        fs.readFile(pathname, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                // based on the URL path, extract the file extention. e.g. .js, .djvu, ...
                const ext = path.parse(pathname).ext;
                // if the file is found, set Content-type and send data
                res.setHeader('Content-type', mimeType[ext] || 'text/plain');
                res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
                res.end(data);
            }
        });
    });
}).listen(parseInt(port));

console.log(`Http server is listening on port ${port}`);

const wss = new WebSocket.Server({ port: 8080 });
wss.broadcast = function (data) {
    this.clients.forEach(client => {
        client.send(data);
    });
}

console.log(`WebSocket server is listening on port 8080 \n`);

const watcher = rollup.watch(rollupConfig);

watcher.on('event', event => {
    switch (event.code) {
        case 'BUNDLE_START':
            console.log('Start building ...'.blue.bold);
            break;
        case 'BUNDLE_END':
            console.log(`Bundle was created in ${event.duration} ms! \n`.green.bold);
            wss.broadcast('reload');
            break;
        case 'ERROR':
            console.log('\n Error occured! \n'.red.bold);
            console.log(event);
            console.log('\n');
            break;
        case 'FATAL':
            console.log('\n Fatal Error occured! \n'.red.bold);
            console.log(event);
            process.exit();
            break;
    }
});