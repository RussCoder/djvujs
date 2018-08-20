const fs = require('fs-extra');

if (fs.existsSync('build/')) {
    fs.removeSync('assets/dist/');
    fs.copySync('build/', 'assets/dist/');
    fs.copySync('assets/', '_src/assets/');
}

if (fs.existsSync('compile/')) {
    fs.copySync('compile/', './');
    fs.removeSync('compile/');
}
