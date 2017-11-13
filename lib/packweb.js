const resolve = require('./resolve');
const path = require('path');
const parse = require('./parse');
const buildDeps = require('./buildDeps');
const fs = require('fs');

buildDeps('/Users/anchao01/code/packweb/example', './a.js');
// /Users/anchao01/code/packweb/node_modules/co/index.js