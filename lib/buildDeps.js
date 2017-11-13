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
        console.log(depTree);
    });
}

function addModule(depTree, context, module, options, callback) {
    resolve(context, module, options, (err, filename) => {
        if (err) {
            callback(true);
            return;
        }
        if (depTree.modules[filename]) {
            callback(null, depTree.modules[filename].id);
            return;
        }
        fs.readFile(filename, 'utf-8', (err, source) => {
            if (err) {
                callback(true);
                return;
            }
            const {currentModule, requires} = packModule(source);
            const requiresKeys = Object.keys(requires);
            let keyLength = requiresKeys.length;

            depTree.modules[filename] = currentModule;
            depTree.modulesById[currentModule.id] = currentModule;

            if (requiresKeys.length) {
                //当lenght不为0时, 说明还有依赖, 继续往下解析
                requiresKeys.forEach(requiredModuleName => {
                    addModule(depTree, path.dirname(filename),requiredModuleName, options, (err, moduleId) => {
                        keyLength--;
                        if (err) {
                            return;
                        } else {
                            requires[requiredModuleName].forEach(requireModule => {
                                requireModule.id = moduleId;
                            });
                        }
    
                        if (keyLength === 0) {
                            callback(null, currentModule.id);
                        }
                    })
                });
            } else {
                //当lenght为0时, 解析完成, 回掉函数返回它隶属的模块id
                callback(null, currentModule.id);
            }
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