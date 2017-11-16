const path = require('path');
const parse = require('./parse');
const buildDeps = require('./buildDeps');
const writeSource = require('./writeSource');
const fs = require('fs');
const cwd = require('process').cwd();
const templateSingle = fs.readFileSync(path.join(__dirname, './templateSingle.js'), 'utf-8');
const templateAsync = fs.readFileSync(path.join(__dirname, './templateAsync.js'), 'utf-8');

function packWeb(options) {
    const defaultOptions = {
        entry: './index.js',
        outputDir: 'dest',
        outputName: 'bundle.js',
        context: cwd
    }

    options = Object.assign({}, defaultOptions, options);

    buildDeps(options.context, options.entry, options, (err, depTree) => {
        for (let chunkId in depTree.chunks) {
            const chunk = depTree.chunks[chunkId];

            if (chunk.id === 0) {
                //主入口文件chuck
                const filename = path.join(cwd, options.outputDir, options.outputName);
                createDir(options.outputDir, (err, dir) => {
                    fs.writeFile(filename, `${depTree.chunks[1] ? templateAsync : templateSingle}${packSourceCode(depTree, chunk)}`);
                });
            } else {
                const filename = path.join(cwd, options.outputDir, `${chunk.id}.output.js`);
                createDir(options.outputDir, (err, dir) => {
                    fs.writeFile(filename, packSourceCode(depTree, chunk));
                });
            }
        }
    });
}

function packSourceCode(depTree, chunk) {
    const buffer = [];

    if (chunk.id > 0) {
        buffer.push(`/******/webJsonp(${chunk.id}, {\n`);
    } else {
        buffer.push('/******/({\n');
    }

    buffer.push(writeSource(depTree, chunk));
    buffer.push('/******/})');

    return buffer.join('');
}

function createDir(dirname, callback) {
    fs.stat(path.join(cwd, dirname), (err, stat) => {
        if (stat && stat.isDirectory()) {
            callback(null, dirname);
            return;
        } else {
            fs.mkdir(dirname, (err, dir) => {
                if (err) {
                    callback(true);
                    return;
                }
                callback(null, dirname);
            });
        }
    });
}

//test
const options = {
    entry: './example/a.js',
}
packWeb(options);