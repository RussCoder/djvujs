const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');


function copyFile(source, target) {
    var rd = fs.createReadStream(source);
    var wr = fs.createWriteStream(target);
    return new Promise(function (resolve, reject) {
        rd.on('error', reject);
        wr.on('error', reject);
        wr.on('finish', resolve);
        rd.pipe(wr);
    }).catch(function (error) {
        rd.destroy();
        wr.end();
        throw error;
    });
}

const buildFolder = 'build/';
if (!fs.existsSync(buildFolder)) {
    fs.mkdirSync(buildFolder);
}

async function processFile(dir, destFile) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (path.extname(file) === path.extname(destFile)) {
            return copyFile(dir + file, buildFolder + destFile);
        }
    }
}


async function main() {
    const viewerBuildDir = 'viewer/build/static/';
    const time = Date.now();

    console.log("The build process is running... Wait for a while, please.");

    const install = process.argv[2] === 'install' ? '& npm install' : '';

    try {
        await Promise.all([
            exec(`cd viewer ${install} & npm run build`)
                .then(() => console.log('The Viewer is built!')),
            exec(`cd library ${install} & npm run build`)
                .then(() => console.log('The Library is built!'))
        ]);
    } catch(e) {
        console.error("The build process threw an error! Try to execute 'node build.js install' \n\n");
        console.error(e);
    }

    await Promise.all([
        processFile(viewerBuildDir + 'css/', 'djvu_viewer.css'),
        processFile(viewerBuildDir + 'js/', 'djvu_viewer.js'),
        processFile('library/dist/', 'djvu.js'),
    ]);
    console.log('All files are copied to the ./build/ directory!');
    console.log('It has taken ', (Date.now() - time) / 1000, ' seconds.');
}

main();