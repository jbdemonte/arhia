var extend = require('util')._extend;

module.exports = {};

module.exports.contractTypes = require('./data/contractTypes.json');
module.exports.contractReasons = require('./data/contractReasons.json');
module.exports.contractEndReasons = require('./data/contractEndReasons.json');


module.exports = extend({}, module.exports);
Object.freeze(module.exports);