const BST = require("./src/treap.js");
const seedrandom = require("seedrandom");
BST.seedrandom = function(seed, options) {
	seedrandom(seed, Object.assign({global: true}, options));
}
module.exports = BST;