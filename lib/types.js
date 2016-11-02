var moment = require('moment');

module.exports = {};

/**
 * Return an evaluation function of a value with a type
 * @param {string} type
 * @returns {Function}
 */
function checkTypeOf(type) {
  return function (value) {
    if (typeof value !== type) {
      throw new Error('type mismatch, expecting a ' + type + ', got a ' + typeof value);
    }
    return value;
  };
}

/**
 * Check if value is a string
 * @param {string} value
 * @return {string}
 */
module.exports.string = checkTypeOf('string');

/**
 * Check if value is a boolean
 * @param {boolean} value
 * @return {boolean}
 */
module.exports.boolean = checkTypeOf('boolean');

/**
 * Check if value is a number
 * @param {number} value
 * @return {number}
 */
module.exports.number = checkTypeOf('number');

/**
 * Evaluation function of a value as an enum
 * @param {Object} enumObject
 * @returns {Function}
 */
module.exports.enum = function (enumObject) {
  if (typeof enumObject !== 'object') {
    throw new Error('types.enum expect an object definition, got ' + enumObject);
  }
  var expected = Object.keys(enumObject).map(function (key) {
    return enumObject[key];
  });
  return function (value) {
    if (!~expected.indexOf(value)) {
      throw new Error('expecting one of [' + expected.join(', ') + '], got ' + value);
    }
    return value;
  };
};

/**
 * Evaluation function of a value as an array value expected
 * @param {string[]} array - An array of value expected
 * @returns {Function}
 */
module.exports.oneOf = function (array) {
  if (!Array.isArray(array)) {
    throw new Error('types.oneOf expect an array definition, got ' + array);
  }
  var expected = array.slice();
  return function (value) {
    if (!~expected.indexOf(value)) {
      throw new Error('expecting one of [' + expected.join(', ') + '], got ' + value);
    }
    return value;
  };
};

/**
 * Return an evaluation function of a value with a regular expression
 * @param {RegExp} re
 * @returns {Function}
 */
module.exports.re = function (re) {
  return function (value) {
    if (!re.exec(value)) {
      throw new Error('value mismatch with regex ' + re + ', got ' + value);
    }
    return value;
  };
};

/**
 * Evaluation function of a value as an array
 * @param {Array} value
 * @return {*}
 */
module.exports.array = function (value) {
  if (!Array.isArray(value)) {
    throw new Error('expected an array, got ' + value);
  }
  return value;
};

/**
 * Convert a date / formatted date to a ARHIA string date
 * @param {Date|string} value
 * @returns {string}
 */
module.exports.dateString = function (value) {
  var type = typeof value;
  if (type === 'object' || type === 'string') {
    return moment(value).format('YYYY-MM-DD');
  }
  throw new Error('invalid date, got ' + value);
};