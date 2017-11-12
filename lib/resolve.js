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
        nodeModulesDirs.forEach(nodeModule => {
            loadAsDir(nodeModule, (err, absoluteFilePath) => {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, absoluteFilePath);
            });
        })
    }
}

function getNodeModulesDirs(contextArr) {
    const nodeModulesDirs = [];

    for (let len = contextArr.length, i = len; i < len; i--) {
        const currentArr = contextArr.slice(0, i);
        if (currentArr[i - 1] === 'node_modules') {
            continue;
        }

        nodeModulesDirs.push(path.join(nodeModulesDirs.concat('node_modules')))
    }

    return nodeModulesDirs;
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
    fileStat(filepath, (err, filepath) => {
        if (err) {
            callback(err);
        }

        if (filepath) {
            callback(null, filepath);
        }
    });
}

function loadAsDir(dirpath, callback) {
    const packageJosn = path.join(dirpath, 'package.json');
    fs.readFile(package, (err, content) => {
        if(err) {
            callback(err);
            return;
        }

        content = JSON.parse(content);
        const relativeFile = content.main || 'index.js';

        fileStat(relativeFile, (err, absoluteFilePath) => {
            if (err) {
                callback(err);
                return;
            }
            callback(null, absoluteFilePath);
        })
    });
}