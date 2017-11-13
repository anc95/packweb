const resolve = require('./resolve');
const path = require('path');
const parse = require('./parse');
const fs = require('fs');

resolve(__dirname, './parse.js', {}, (err, filepath) => {
    if (err) {
        return;
    }
    
    fs.readFile(filepath, 'utf-8', (err, source) => {
        const result  = parse(source);
    });
});
// /Users/anchao01/code/packweb/node_modules/co/index.js