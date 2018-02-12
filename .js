const fs = require('fs-extra');

if (fs.existsSync('build/')) {
    fs.removeSync('dist/');
    fs.copySync('build/', 'dist/');
    fs.copySync('build/', '_src/dist');
}

if (fs.existsSync('compile/')) {
    fs.copySync('compile/', './');
    fs.removeSync('compile/');
}
