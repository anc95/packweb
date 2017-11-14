const resolve = require('./resolve');
const path = require('path');
const parse = require('./parse');
const buildDeps = require('./buildDeps');
const fs = require('fs');
const process = require('process');

function packWeb(options) {
    const defaultOptions = {
        entry: './index.js',
        outputDir: 'dest',
        outputName: 'bundle.js',
        context: process.cwd()
    }

    options = Object.assign({}, options, defaultOptions);

    resolve(options.context, options.entry, options, (err, absoluteFilePath) => {
        console.log(absoluteFilePath);
    });
}