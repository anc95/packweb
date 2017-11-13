const parse = require('./parse.js');
const resolve = require('./resolve.js');
const fs = require('fs');
const path = require('path');

let nextModuleId =  0;
let nextChunkId = 0;
module.exports = function buildDeps(context, mainModule, options, callback) {
    const depTree = {
		modules: {},
		modulesById: {},
		chunks: {},
		chunkModules: {} // used by checkObsolete
    }
    
    addModule(depTree, context, mainModule, options, (err, moduleId) => {
        console.log(moduleId);
    });
}

function addModule(depTree, context, module, options, callback) {
    resolve(context, module, options, (err, filename) => {
        if (err) {
            // callback(true);
            return;
        }
        if (depTree.modules[filename]) {
            callback(null, depTree.modules[filename]);
            return;
        }
        fs.readFile(filename, 'utf-8', (err, source) => {
            if (err) {
                callback(true);
                return;
            }

            depTree.modules[filename] = packModule(source);
            const {currentModule, requires} = packModule(source);
            const requiresKeys = Object.keys(requires);
            requiresKeys.forEach(requiredModuleName => {
                addModule(depTree, path.dirname(filename),requiredModuleName, options, callback)
            });
        });
    });
}

function packModule(source) {
    const deps = parse(source);
    const currentModule = {
        id: nextModuleId++,
        source
    };
    const requires = {};
    currentModule.requires = deps.requires || [];
    currentModule.requires.forEach(require => {
        const requireName = require.name;
        requires[requireName]
            ? requires[requireName].push(require)
            : requires[requireName] = [require];
    });
    
    return {currentModule, requires};
}

function packRequires(source) {
    const requires = {};
    source.requires.forEach(require => {
        const requireName = require.name;
        requires[requireName]
            ? requires[requireName].push(require)
            : requires[requireName] = [require];
    });
}