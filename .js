const fs = require('fs-extra');

fs.removeSync('dist/');
fs.copySync('build/', 'dist/');
fs.copySync('build/', '_src/dist');
