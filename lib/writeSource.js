module.exports = writeSource;

function writeSource(depTree, chunk) {
    const buffer = [];
    for (let moduleId in chunk.modules) {
        buffer.push(`/******/${moduleId}: function(module, exports, require){\n`);
        buffer.push(`${replaceModuleName(depTree.modulesById[moduleId])}\n`);
        buffer.push('/******/},\n')
    }
    return buffer.join('');
}

function replaceModuleName(cModule) {
    if (cModule.requires.length === 0) {
        return cModule.source;
    }

    let requiresInfo = [];
    const source = cModule.source;
    let replacedCode = '';
    let lastEndPoint = 0;
    for (let require of Object.values(cModule.requires)) {
        requiresInfo.push(getRequireInfo(require));
    }

    requiresInfo.sort((a, b) => a.form - b.from);
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