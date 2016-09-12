/**
 * arrayCaster module
 *
 * Function use to generate an Array class which will cast all entries pushed, unshifted...
 * !! direct access through the numeric index is not available !! tab[1] = ...; is not cast
 *
 *
 * Example:
 *
 *        var arrayCaster = require('./lib/arrayCaster');
 *
 *        function Item(value) {
 *          this.value = value;
 *        }
 *
 *        var ItemArray = arrayCaster(Item);
 *
 *        var a = new ItemArray();
 *
 *        a.push(123, 456);
 *
 *        console.log(a);
 *        console.log(arrayCaster.isArray(a));
 *
 *  => [ Item { value: 123 }, Item { value: 456 } ]
 *  => true
 *
 * @module arrayCaster
 * @type {Function}
 */

var inherits = require('util').inherits;

/**
 * Cast array-like argument to a real array
 * @param {object} args - Array-like argument object
 * @return {array}
 */
function toArgs(args) {
  return Array.prototype.slice.call(args);
}

/**
 * ParentArray Class
 * Used to distinguish array built by this module
 * @constructor
 */
function ParentArray() {
  Array.call(this);
  Object.defineProperty(this, 'length', {enumerable: false, writable: true, value: 0});
}

inherits(ParentArray, Array);

/**
 * Create an Array-like class which cast all entries before inserting them
 * !!warn!! direct access to value are not cast. ie: tab[1] = ...;
 * 
 * @param {Function} cls - Class to cast the raw data in
 * @return {Function} Return an Array based class
 */
function arrayCaster(cls) {

  function caster(value) {
    return value instanceof cls ? value : new cls(value);
  }

  function CustomArray() {
    ParentArray.call(this);

    // give access to the constructor to be able to instanciate object through the "Parent.import" function
    Object.defineProperty(this, 'cls', {
      enumerable: false,
      get: function () {
        return cls;
      }
    });
  }

  inherits(CustomArray, ParentArray);

  CustomArray.prototype.push = function () {
    Array.prototype.push.apply(this, toArgs(arguments).map(caster));
  };

  CustomArray.prototype.unshift = function () {
    Array.prototype.unshift.apply(this, toArgs(arguments).map(caster));
  };

  CustomArray.prototype.splice = function () {
    var args = toArgs(arguments).slice(2).map(caster);
    args.unshift(arguments[0], arguments[1]);
    Array.prototype.splice.apply(this, args);
  };

  CustomArray.prototype.fill = function (value, start, stop) {
    Array.prototype.fill.call(this, caster(value), start, stop);
  };

  CustomArray.prototype.toJSON = function () {
    return Array.prototype.slice.call(this);
  };

  CustomArray.prototype.toObject = function () {
    return this.toJSON();
  };

  CustomArray.prototype.inspect = function () {
    return this.toJSON();
  };

  return CustomArray;
}

/**
 * Return True is the parameter is a custom array built by this module
 * @param {array} obj
 * @return {boolean}
 */
arrayCaster.isArray = function (obj) {
  return obj instanceof ParentArray;
};

module.exports = arrayCaster;