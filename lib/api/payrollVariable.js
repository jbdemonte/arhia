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
  self._define('value', 'vva_valeur');

  self._define('startPeriod', 'vva_periodedebut', types.periodString);
  self._define('endPeriod', 'vva_periodefin', types.periodString);

  self._define('startDate', 'vva_datedebut', types.dateString);
  self._define('endDate', 'vva_datefin', types.dateString);
}

Parent.customize(PayrollVariable);

/**
 * Create a payroll variable
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
PayrollVariable.prototype.create = function (callback) {
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
};

/**
 * Get a payroll variable
 * @param {string} externalContractId
 * @param {string} code
 * @param {string} period
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
 * @param {string} externalContractId
 * @param {string} code
 * @param {string} [startPeriod]
 * @param {string} [endPeriod]
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
PayrollVariable.statics.remove = function (externalContractId, code, startPeriod, endPeriod, callback) {
  var Cls = this;
  var query = {cnt_id_externe: externalContractId, var_code: code};

  if (!callback && typeof endPeriod === 'function') {
    query.vva_periodedebut = startPeriod;
    callback = endPeriod;
  } else if (!callback && !endPeriod && startPeriod === 'function') {
    callback = startPeriod;
  } else {
    query.vva_periodedebut = startPeriod;
    query.vva_periodefin = endPeriod;
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
