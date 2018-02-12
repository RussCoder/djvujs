const fs = require('fs-extra');

fs.removeSync('dist/');
fs.copySync('build/', 'dist/');
fs.copySync('build/', '_src/dist');

if(fs.existsSync('compile/')) {
    fs.copySync('compile/', './');
}
