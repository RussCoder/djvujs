/**
 * A server used for debugging.
 */

'use strict';

const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
require('colors');
const path = require('path');
const rollup = require('rollup');
const express = require('express');
const rollupConfig = require('./rollup.config.js');

// you can pass the parameter in the command line. e.g. node server.js 3000
const port = process.argv[2] || 9000;

const app = express();

app.use(express.static(__dirname));
app.use(express.static(__dirname + '/debug'));
app.use('/tests', express.static('./tests', { index: 'tests.html' }));

// used to debug the request interception in the extension according to the headers
app.get('/file_without_extension', (req, res) => {
    res.sendFile(path.resolve('./assets/DjVu3Spec.djvu'), {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'inline; filename="TestFileName.djvu"',
        }
    });
});

app.get('/get_embed_djvu_html', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
   <body><embed type="image/x-djvu" src="${req.query.file}" width="600"></body>     
</html>
`);
});

app.use((req, res) => {
    res.status(404).end('No such a page! 404 error!');
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server: server });
wss.broadcast = function (data) {
    this.clients.forEach(client => {
        client.send(data);
    });
}

fs.watch('./debug/', { recursive: true }, () => wss.broadcast('reload')); // watch debug .js files
fs.watch('./tests/', () => wss.broadcast('reload')); // watch tests files

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

server.listen(parseInt(port));
console.log(`Http and WebSocket servers are listening on port ${port}`);