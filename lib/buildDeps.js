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
        addChunk(depTree, addChunk(depTree, depTree.modulesById[moduleId], options));

        callback(null, depTree);
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

function addChunk(depTree, chunkStartpoint, options) {
	const chunk = {
		id: nextChunkId++,
		modules: {},
		context: chunkStartpoint
	};
	depTree.chunks[chunk.id] = chunk;
	if(chunkStartpoint) {
		chunkStartpoint.chunkId = chunk.id;
		addModuleToChunk(depTree, chunkStartpoint, chunk.id, options);
	}
	return chunk;
}

function addModuleToChunk(depTree, context, chunkId, options) {
	context.chunks = context.chunks || [];
	if (context.chunks.indexOf(chunkId) !== -1) {
        context.chunks.push(chunkId);
        depTree.chunks[chunkId].modules[context.id] = 'include';

        if (context.requires) {
            context.requires.forEach(requireModule => {
                if (requireModule.id) {
                    addModuleToChunk(depTree, depTree.modulesById[equireModule.id], chunkId, options);
                }
            });
        }
    }
}
