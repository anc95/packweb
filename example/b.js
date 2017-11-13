//module b
const c = require('./c.js');
module.exports = function log() {
    console.log(c);
    
}