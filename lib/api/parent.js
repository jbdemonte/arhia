/**
 * Parent module
 * @module Parent
 * @type {Parent}
 */

var inspect = require('util').inspect;
var inherits = require('util').inherits;
var errorBuilder = require('../errorBuilder');
var arrayCaster = require('../arrayCaster');


/**
 * Parent Class
 * @constructor
 */
function Parent() {
  throw new Error('Parent class should not be instanciated');
}

/**
 * Return the data to post to ARHIA
 * @returns {object}
 */
Parent.prototype.export = function () {
  var self = this;
  var result = {};

  Object.keys(self._path).forEach(function (key) {
    var name, names;
    var target = result;
    var handler = self._path[key];
    var value = handler.poster ? handler.poster.call(self, self[key]) : self[key];
    if (value !== undefined) {
      names = handler.name.split('.');
      while (names.length > 1) {
        name = names.shift();
        if (!target[name]) {
          target[name] = {};
        }
        target = target[name];
      }
      target[names[0]] = arrayCaster.isArray(value) ? value.map(function (item) {
        return item instanceof Parent ? item.export() : item;
      }) : value;
    }
  });
  return result;
};

/**
 * Flatten an object (keys become composed: ie: {a: {b:1}} => {"a.b": 1}
 * @param {Object} target
 * @param {Object} source
 * @param {string} prefix
 * @return {Object}
 */
function flat(target, source, prefix) {
  Object.keys(source).forEach(function (key) {
    if (source[key] && typeof source[key] === 'object') {
      if (Array.isArray(source[key])) {
        target[prefix + key] = source[key].map(function (item) {
          return item && typeof item === 'object' ? flat({}, item, '') : item;
        });
      } else {
      flat(target, source[key], prefix + key + '.');
      }
    } else {
      target[prefix + key] = source[key];
    }
  });
  return target;
}

/**
 * Import data from ARHIA
 * @param {Object} json
 */
Parent.prototype.import = function (json) {
  var self = this;
  var data = flat({}, json, '');

  Object.keys(self._path).forEach(function (key) {
    var handler = self._path[key];
    if (handler.name in data) {
      if (data[handler.name] !== null) {
        if (arrayCaster.isArray(self[key])) {
          self[key] = data[handler.name].map(function (item) {
            return new self[key].cls().import(item);
          });
        } else if (data[handler.name]) {
          self[key] = data[handler.name];
        }
      }
      delete data[handler.name]; // remove the key to log which keys has not been used
    }
  });
  if (Object.keys(data).length) {
    console.log('Ignored keys: ' + Object.keys(data).join(', '));
  }
  return self;
};

/**
 * Export to a JSON
 * @return {Object}
 */
Parent.prototype.toJSON = function () {
  var self = this;
  var result = {};
  Object.keys(self._path || {}).forEach(function (key) {
    result[key] = Array.isArray(self[key]) ? self[key].map(function (item) {
      return item instanceof Parent ? item.toJSON() : item;
    }): self[key];
  });
  return result;
};

/**
 *
 * Import a JSON
 * @param {Object} json
 */
Parent.prototype.fromJSON = function (json) {
  var self = this;
  Object.keys(self._path || {}).forEach(function (key) {
    if (key in json) {
      self[key] = json[key];
    }
  });
};

/**
 * Helper for console.log
 */
Parent.prototype.toString = function () {
  return inspect(this.toJSON());
};

/**
 * Helper for console.log
 */
Parent.prototype.toObject = function () {
  return this.toJSON();
};

/**
 * Helper for console.log
 */
Parent.prototype.inspect = function () {
  return this.toJSON();
};

/**
 * Helper to define a new property
 * @param {string} name - Property name
 * @param {string} foreignName - Property name posted to Arhia platform
 * @param {function} [setter] - Function used to test / cast value when set, have to return the value to be set
 * @param {function} [poster] - Function used to cast value before posted, does not modify the internal value
 * @protected
 */
Parent.prototype._define = function (name, foreignName, setter, poster) {
  var value;
  var self = this;

  self._path = self._path || {};
  self._path[name] = {name: foreignName, poster: poster};

  Object.defineProperty(self, name, {
    enumerable: true,
    get: function () {
      return value;
    },
    set: function (v) {
      try {
      value = setter ? setter.call(self, v) : v;
      } catch (e) {
        if (this.constructor.Error) {
          throw new this.constructor.Error(e.message);
        } else {
          throw e;
        }
      }
    }
  });
};

/**
 * Helper to define a new property
 * @param {string} name - Property name
 * @param {string} foreignName - Property name posted to Arhia platform
 * @param {Function} fn - function which returns the descriptor of Object.defineProperty
 * @private
 */
Parent.prototype._defineProperty = function (name, foreignName, fn) {
  var self = this;

  self._path = self._path || {};
  self._path[name] = {name: foreignName};

  Object.defineProperty(self, name, fn());
};

/**
 * Log foreign / local name
 * @param {RegExp|string} [pattern] pattern to look for
 * @param {boolean} [invert]
 */
Parent.prototype.fields = function (pattern, invert) {
  var self = this;
  if (typeof pattern === 'boolean') {
    invert = pattern;
    pattern = '';
  }
  var items = Object
    .keys(self._path || {})
    .filter(function (key) {
      if (pattern) {
        if (pattern instanceof RegExp) {
          return pattern.exec(key) || pattern.exec(self._path[key].name);
        } else if (typeof pattern === 'string') {
          return ~key.indexOf(pattern) || ~self._path[key].name.indexOf(pattern);
        }
      } else {
        return true;
      }
    })
    .map(function (key) {
      //return invert ? self._path[key].name + ' => ' + key : key + ' => ' + self._path[key].name;
      return '* `'+key+'` - ';
    })
    .sort();
  items.forEach(function (item) {
    console.log(item);
  });
};

/**
 * Make target class to inherit from Parent and add some features
 * @param {Function} cls - Class to handle
 * @returns {Function} Return the class
 */
Parent.customize = function (cls) {

  // Build a dedicated Error class
  cls.Error = errorBuilder(cls.name);

  var statics = Object.keys(cls);

  inherits(cls, Parent);

  cls.statics = {};

  /**
   * Build an enscoped class
   * @param arhia
   * @return {Model}
   * @private
   */
  cls.enclose = function (arhia) {

    function Model(json) {
      cls.call(this);
      Object.freeze(this._path);
      Object.seal(this);
      if (json) {
        this.fromJSON(json);
      }
    }

    Model.prototype = Object.create(cls.prototype, {constructor: {value: Model}});

    // Attach main statics
    statics.forEach(function (key) {
      if (key) {
        Model[key] = cls[key];
      }
    });

    // Attach defined statics function
    Object.keys(cls.statics).forEach(function (key) {
      Model[key] = cls.statics[key].bind(Model);
    });

    Model.arhia = arhia;

    return Model;
  };

  // Freeze all enums
  statics.forEach(function (key) {
    if (typeof cls[key] === 'object') {
      Object.freeze(cls[key]);
    }
  });

  return cls;
};

module.exports = Parent;