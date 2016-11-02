var Client = require('./lib/client');

/**
 * Arhia Class
 * @param {Object} settings
 * @constructor
 * @property {BankAccount} BankAccount
 * @property {Employee} Employee
 * @property {Contract} Contract
 * @property {Promise} Promise
 */
function Arhia(settings) {
  if (!(this instanceof Arhia)) {
    return new Arhia(settings);
  }

  var P;
  var client = new Client(this, settings);

  this.BankAccount = Arhia.BankAccount.enclose(this);
  this.Employee = Arhia.Employee.enclose(this);
  this.Contract = Arhia.Contract.enclose(this);

  // create a custom property to allows to redefine on hot the Promise to use in the current instance (for tests...)
  // without modifying the default static in the class
  Object.defineProperty(this, 'Promise', {
    enumerable: true,
    get: function () {
      return P || Arhia.Promise;
    },
    set: function (cls) {
      P = cls;
    }
  });

  /**
   * Call a function handling either a callback or a Promise
   * @param {Function|undefined} callback
   * @param {Function} fn
   * @return {Promise|undefined}
   */
  this.run = function (callback, fn) {
    if (typeof callback === 'function') {
      try {
        fn(
          function (result) {
            callback(undefined, result);
          },
          function (reason) {
            callback(reason);
          }
        );
      } catch (err) {
        callback(err);
      }
    } else {
      return P ? new P(fn) : new Arhia.Promise(fn);
    }
  };

  this.client = client;
}

// Allows to override the Promise library
Arhia.Promise = Promise;

// Give access to the different classes to allows to use their Error classes, enum...
Arhia.Client = Client;
Arhia.BankAccount = require('./lib/api/bankAccount');
Arhia.Employee = require('./lib/api/employee');
Arhia.Contract = require('./lib/api/contract');

module.exports = Arhia;