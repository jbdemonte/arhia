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
 * @property {string} bic
 * @property {string} iban
 * @property {string} owner
 * @property {string} domiciliation
 * @property {boolean} default
 */
function BankAccount() {
  var self = this;

  self._define('bic', 'bnqs_bic', types.string);
  self._define('iban', 'bnqs_iban', types.string);
  self._define('owner', 'bnqs_titu', types.string);
  self._define('domiciliation', 'bnqs_domic', types.string);
  self._define('default', 'bnqs_defaut', types.boolean);
}

module.exports = Parent.customize(BankAccount);
