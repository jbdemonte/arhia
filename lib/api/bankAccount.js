/**
 * BankAccount module
 * @module BankAccount
 * @type {BankAccount}
 */

var Parent = require('./parent');
var types = require('../types');

/**
 * BankAccount Class
 * @constructor
 * @extends Parent
 * @property {string|number} id
 * @property {string} bic
 * @property {string} iban
 * @property {string} owner
 * @property {string} domiciliation
 * @property {string} externalId
 * @property {boolean} default
 */
function BankAccount() {
  var self = this;

  self._define('id', 'bnqs_id');
  self._define('externalId', 'bnqs_id_externe', types.re(/^[a-z0-9]{1,50}$/i));

  self._define('bic', 'bnqs_bic', function (value) {
    types.string(value);
    return value.substr(0, 11);
  });
  self._define('iban', 'bnqs_iban', types.string);
  self._define('owner', 'bnqs_titu', function (value) {
    types.string(value);
    return value.substr(0, 100);
  });
  self._define('domiciliation', 'bnqs_domic', function (value) {
    types.string(value);
    return value.substr(0, 100);
  });
  self._define('default', 'bnqs_defaut', types.boolean);
}

Parent.customize(BankAccount);

/**
 * Create a bank account
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
BankAccount.prototype.create = function (callback) {
  var Cls = this.constructor;
  var json = this.export();
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('bnqs', 'add', json, function (err, result) {
      if (err || !result.success) {
        return reject(err || new Cls.Error(result.error));
      }
      this.id = result.data.bnqs_id;
      resolve();
    });
  });
};

/**
 * Update a bankAccount
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
BankAccount.prototype.update = function (callback) {
  var Cls = this.constructor;
  var json = this.export();
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('bnqs', 'update', json, function (err, result) {
      if (err || !result.success) {
        return reject(err || new Cls.Error(result.error));
      }
      resolve();
    });
  });
};

/**
 * Remove a bankAccount by its external id
 * @param {string} externalId - The external id of the bank account object
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
BankAccount.statics.removeById = function (externalId, callback) {
  var Cls = this;
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('bnqs', 'delete', {bnqs_id_externe: externalId}, function (err, result) {
      if (err) {
        return reject(err);
      }
      resolve(result.success && result.data ? (new Cls()).import(result.data): undefined);
    });
  });
};

module.exports = BankAccount;
