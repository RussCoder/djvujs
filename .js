'use strict';

const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

function execute(command) {
    return new Promise(resolve => {
        const subProcess = child_process.exec(command, resolve);
        subProcess.stdio.forEach((stream, i) => stream.pipe(process.stdout));
    })
}

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
const extensionFolder = 'extension/dist/'
if (!fs.existsSync(buildFolder)) {
    fs.mkdirSync(buildFolder);
}

async function processFile(dir, destFile) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (path.extname(file) === path.extname(destFile)) {
            await copyFile(dir + file, buildFolder + destFile);
            await copyFile(dir + file, extensionFolder + destFile);
        }
    }
}

function decorate(string) {
    const line = '***************************************';
    return `\n${line}\n\n${string}\n\n${line}\n`;
}

async function main() {
    // const time = Date.now();

    // console.log("The build process is running... Wait for a while, please.");

    // const install = process.argv.includes('install') ? '& npm install' : '';
    // const isOnlyLib = !!process.argv.includes('lib');

    // // try {
    // //     await Promise.all([
    // //         isOnlyLib ? null : execute(`cd viewer ${install} & npm run build`, process.cwd() + '\\viewer')
    // //             .then(() => console.log(decorate('The Viewer is built!'))),
    // //         execute(`cd library ${install} & npm run build`, process.cwd() + '\\library')
    // //             .then(() => console.log(decorate('The Library is built!')))
    // //     ]);
    // // } catch (e) {
    // //     console.error(decorate("The build process threw an error! Try to execute 'node build.js install'"));
    // //     console.error(e);
    // // }

    await Promise.all([
        //processFile(viewerBuildDir + 'css/', 'djvu_viewer.css'),
        processFile('viewer/dist/', 'djvu_viewer.js'),
        processFile('library/dist/', 'djvu.js'),
    ]);
    console.log('All files are copied to the ./build/ directory!');
    //console.log('It has taken ', (Date.now() - time) / 1000, ' seconds.');
}

void main();