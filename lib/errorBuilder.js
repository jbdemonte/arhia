/**
 * errorBuilder module
 *
 * Function use to generate a custom error class
 *
 * Example:
 *
 *        var errorBuilder = require('./lib/errorBuilder');
 *        var ErrorClass = errorBuilder('Test');
 *        var err = new ErrorClass('xyz error');
 *        console.log(err);
 *
 *  => { [TestError: xyz error] message: 'xyz error' }
 *
 * @module errorBuilder
 * @type {Function}
 */

var inherits = require('util').inherits;

module.exports = function (prefix) {

  // Build a custom Error type dedicated to the current class
  var name = prefix + 'Error';

  function CustomError(err) {
    Error.captureStackTrace(this, CustomError);

    if (err && typeof err === 'object') {
      this.message = err.message;
      this.code = err.code;
    } else if (typeof err === 'string') {
      this.message = err;
    }

    // make the error log displays the Error class name instead of "Error: ..."
    Object.defineProperty(this, 'name', {value: name, enumerable: false, writable: false});
  }

  // Redefine Error class name (console.log(Error.name))
  Object.defineProperty(CustomError, "name", {value: name});

  inherits(CustomError, Error);

  return CustomError;
};