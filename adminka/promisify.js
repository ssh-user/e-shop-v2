const fs = require('fs');
const move = require("mv");
const { promisify } = require('util');

module.exports = {
    unlink: promisify(fs.unlink),
    writeFile: promisify(fs.writeFile),
    move: move
};