const resolve = require('./lib/resolve');
const path = require('path');

resolve(__dirname, 'co', {}, (err, filepath) => {
    if (err) {
        return;
    }
    
    const result  = parse(filepath);
    console.log(1);
});
// /Users/anchao01/code/packweb/node_modules/co/index.js