'use strict';

const fs = require('fs-extra');
const command = process.argv[2];

switch (command) {
    case 'copy': {
        if (fs.existsSync('build/')) {
            fs.copySync('build/', 'src/assets/dist/');
        }
        break;
    }

    case 'delete':
        fs.removeSync('docs');
        break;

    case 'cname':
        fs.copySync('CNAME', 'docs/CNAME');
        break;

    default:
        console.warn('\n *** Unknown command *** \n');
}