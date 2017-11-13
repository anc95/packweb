const path = require('path');
const co = require('co');
const fs = require('fs');

module.exports = function resolve(context, identifier, options, callback) {
    const contextArr = context.split(path.sep);

    if (path.isAbsolute(identifier)) {
        if (fileStat(identifier, (err, absoluteFilePath) => {
            if (err) {
                callback(err);
                return;
            }
            callback(err, absoluteFilePath);
        }));
    } else if (identifier.startsWith('.')){
        const filepath = path.join(context, identifier);
        if (fileStat(filepath, (err, absoluteFilePath) => {
            if (err) {
                callback(err);
                return;
            }
            callback(err, absoluteFilePath);
        }));
    } else {
        //load AS node module
        const nodeModulesDirs = getNodeModulesDirs(contextArr);
        const amount = nodeModulesDirs.length;
        let found = false;
        // const filepath = path.join(context, identifier);
        nodeModulesDirs.forEach((nodeModule, i) => {
            if (found) {
                return;
            }

            loadAsDir(nodeModule, identifier, (err, absoluteFilePath) => {
                if (err) {
                    if (i === amount - 1) {
                        callback(true);
                    }
                    return;
                }
                found = true;
                callback(null, absoluteFilePath);
            });
        })
    }
}

function getNodeModulesDirs(contextArr) {
    const nodeModulesDirs = [];

    for (let i = 0,  len = contextArr.length; i <= len; i++) {
        const currentArr = contextArr.slice(0, i);
        if (currentArr[i - 1] === 'node_modules') {
            continue;
        }

        nodeModulesDirs.push(currentArr.concat('node_modules').join(path.sep));
    }

    return nodeModulesDirs.reverse();
}

function fileStat(filepath, callback) {
    fs.stat(filepath, (err, stat) => {
        if (err) {
            callback(err);
        }
        if (stat && stat.isFile()) {
            callback(null, filepath);
        }
    });
}

function loadAsFile(filepath, callback) {
    if (path.extname(filepath) === '') {
        filepath += '.js';
    }
    fileStat(filepath, (err, filepath) => {
        if (err) {
            callback(err);
        }

        if (filepath) {
            callback(null, filepath);
        }
    });
}

function loadAsDir(dirpath, identifier, callback) {
    const packageJosn = path.join(dirpath, identifier, 'package.json');
    fs.readFile(packageJosn, (err, content) => {
        if(err) {
            callback(err);
            return;
        }

        content = JSON.parse(content);
        const relativeFile = content.main || 'index.js';

        fileStat(path.join(packageJosn, '..', relativeFile), (err, absoluteFilePath) => {
            if (err) {
                callback(err);
                return;
            }
            callback(null, absoluteFilePath);
        })
    });
}