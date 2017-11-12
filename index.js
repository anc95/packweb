const resolve = require('./lib/resolve');
const path = require('path');

resolve(__dirname, 'co', {}, (err, filepath) => {
    console.log(filepath);
});
// /Users/anchao01/code/packweb/node_modules/co/index.js