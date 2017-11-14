const path = require('path');
const parse = require('./parse');
const buildDeps = require('./buildDeps');
const fs = require('fs');
const cwd = require('process').cwd();
const templateSingle = fs.readFileSync(path.join(__dirname, './templateSingle.js'), 'utf-8');

function packWeb(options) {
    const defaultOptions = {
        entry: './index.js',
        outputDir: 'dest',
        outputName: 'bundle.js',
        context: cwd
    }

    options = Object.assign({}, defaultOptions, options);

    buildDeps(options.context, options.entry, options, (err, depTree) => {
        console.log(1)
        for (let chunkId in depTree.chunks) {
            const chunk = depTree.chunks[chunkId];

            if (chunk.id === 0) {
                //主入口文件chuck
                const buffer = [];
                const filename = path.join(cwd, options.outputDir, options.outputName);
                buffer.push(templateSingle);
                for (let moduleId in chunk.modules) {
                    buffer.push(depTree.modulesById[moduleId].source);
                }
                createDir(options.outputDir, (err, dir) => {
                    fs.writeFile(filename, buffer.join(''));
                });
            }
        }
    });
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