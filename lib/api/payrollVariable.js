/**
 * PayrollVariable module
 * @module PayrollVariable
 * @type {PayrollVariable}
 */

var Parent = require('./parent');
var types = require('../types');

/**
 * PayrollVariable Class
 * @constructor
 * @extends Parent
 * @property {string|number} id
 * @property {string} externalId
 * @property {string|number} contractId
 * @property {string} externalContractId
 * @property {string} code
 * @property {*} value
 * @property {string} startPeriod
 * @property {string} endPeriod
 * @property {string} startDate
 * @property {string} endDate
 */
function PayrollVariable() {
  var self = this;

  self._define('id', 'vva_id');
  self._define('externalId', 'vva_id_externe', types.re(/^[a-z0-9]{1,50}$/i));

  self._define('contractId', 'cnt_id');
  self._define('externalContractId', 'cnt_id_externe', types.re(/^[a-z0-9]{1,50}$/i));

  self._define('code', 'var_code', types.re(/^[A-Z0-9_]{4,30}$/));
  self._define('value', 'vva_valeur', {
    post: function (value) {
      if (!value) {
        return null;
      }
      return value;
    },
    import: function (value) {
      if (typeof value === 'string') {
        value = parseFloat(value);
      }
      return value;
    }
  });

  self._define('startPeriod', 'vva_periodedebut', types.periodString);
  self._define('endPeriod', 'vva_periodefin', types.periodString);

  self._define('startDate', 'vva_datedebut', types.dateString);
  self._define('endDate', 'vva_datefin', types.dateString);
}

Parent.customize(PayrollVariable);

/**
 * Create/update a payroll variable
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
function setValue(callback) {
  var Cls = this.constructor;
  var json = this.export();
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('vva', 'setValue', json, function (err, result) {
      if (err || !result.success) {
        return reject(err || new Cls.Error(result.error));
      }
      this.id = result.data.vva_id;
      resolve();
    });
  });
}

PayrollVariable.prototype.create = setValue;
PayrollVariable.prototype.update = setValue;

/**
 * Get a payroll variable
 * @param {string} externalContractId - The external id of the contrat
 * @param {string} code - The var code expected by arhia service
 * @param {string} period - The period of payroll variable within format 'YYYY-MM'
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
PayrollVariable.statics.getValue = function (externalContractId, code, period, callback) {
  var Cls = this;
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('vva', 'getValue', {cnt_id_externe: externalContractId, var_code: code, periode: period}, function (err, result) {
      if (err) {
        return reject(err);
      }
      resolve(result.success && result.data ? (new Cls()).import(result.data): undefined);
    });
  });
};

/**
 * Remove a payroll variable
 * @param {string} externalContractId - The external id of the contrat
 * @param {string} code - The var code expected by arhia service
 * @param {object|function} [options] - Object with all arguments to delete a payroll variable
 * @param {string} [options.startPeriod] - The start period of payroll variable within format 'YYYY-MM'
 * @param {string} [options.endPeriod] - The end period of payroll variable within format 'YYYY-MM'
 * @param {string} [options.startDate] - The start precise date of payroll variable within format 'YYYY-MM-DD'
 * @param {string} [options.endDate] - The end precise date of payroll variable within format 'YYYY-MM-DD'
 * @param {function} [callback]
 * @return {Promise|undefined}
 */
PayrollVariable.statics.remove = function (externalContractId, code, options, callback) {
  var Cls = this;
  var query = {cnt_id_externe: externalContractId, var_code: code};

  if (callback || (options && typeof options === 'object')) {
    if (options.startPeriod) {
      query.vva_periodedebut = options.startPeriod;
    }
    if (options.endPeriod) {
      query.vva_periodefin = options.endPeriod;
    }
    if (options.startDate) {
      query.vva_datedebut = options.startDate;
    }
    if (options.endDate) {
      query.vva_datefin = options.endDate;
    }
  } else if (options) {
    callback = options;
  }
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('vva', 'deleteValue', query, function (err, result) {
      if (err) {
        return reject(err);
      }
      resolve(result.success && result.data ? (new Cls()).import(result.data): undefined);
    });
  });
};

module.exports = PayrollVariable;
