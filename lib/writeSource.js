module.exports = writeSource;

function writeSource(depTree, chunk) {
    const buffer = [];
    for (let moduleId in chunk.modules) {
        buffer.push(`/******/${moduleId}: function(module, exports, require){\n`);
        buffer.push(`${parseSource(depTree.modulesById[moduleId])}\n`);
        buffer.push('/******/},\n')
    }
    return buffer.join('');
}

function parseSource(cModule) {
    if (cModule.asyncs.length === 0 && cModule.requires.length === 0) {
        return cModule.source;
    }

    return replaceModuleName(cModule);
}

function replaceModuleName(cModule) {
    const requires = parseRequires(cModule);

    let requiresInfo = [];
    const source = cModule.source;
    let replacedCode = '';
    let lastEndPoint = 0;
    for (let require of Object.values(requires)) {
        requiresInfo.push(getRequireInfo(require));
    }

    requiresInfo.sort((a, b) => a.from - b.from);
    console.log(requiresInfo);
    requiresInfo = fillRequireInfoNext(requiresInfo);

    requiresInfo.forEach((moduleInfo) => {
        const preStr = source.substring(lastEndPoint, moduleInfo.from);
        const nextStr = source.substring(moduleInfo.to, moduleInfo.next.from || source.length)
        replacedCode += preStr + moduleInfo.value + nextStr;
        lastEndPoint = moduleInfo.next.from;
    });

    return replacedCode;
}

function getRequireInfo(require) {
    const [from, to] = require.nameRange;
    return {
        from,
        to,
        value: require.id,
        next: {}
    }
}

function fillRequireInfoNext(info) {
    let len = info.length; 

    while(--len) {
        info[len - 1].next = info[len];
    }

    return info;
}

function parseRequires(mainModule) {
    const requires = {};
    let i = 0;
    function add(require) {
       if (require.nameRange) {
            requires[i++] = require;
       }
    }
    mainModule.requires && mainModule.requires.forEach(add);

    mainModule.asyncs && mainModule.asyncs.forEach(addAsync = async => {
        async.requires && async.requires.forEach(add);
        async.asyncs && asyncs.asyncs.forEach(addAsync);
        
        const require = {
            id: async.chunkId,
            nameRange: async.namesRange
        };
        //把chunk当做require加入进去
        add(require);
    });

    return requires;
}