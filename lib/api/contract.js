/**
 * Contract module
 * @module Contract
 * @type {Contract}
 */

var Parent = require('./parent');
var types = require('../types');
var arrayCaster = require('../arrayCaster');
var jsonsData = require('../jsons');
/**
 * Contract Class
 * @constructor
 * @extends Parent
 */
function Contract() {
  var self = this;

  self._define('id', 'cnt_id');
  self._define('externalId', 'cnt_id_externe', types.re(/^[a-z0-9]{1,30}$/i));

  self._define('employeeId', 'sal_id');
  self._define('externalEmployeeId', 'sal_id_externe', types.re(/^[a-z0-9]{1,30}$/i));

  self._define('fake', 'cnt_simul', types.boolean, function (value) {
    if (value) {
      return value;
    }
  });

  self._define('from', 'cnt_debut_date', types.dateString);
  self._define('to', 'cnt_datefin_prevue', types.dateString);
  self._define('end', 'cnt_fin_date', types.dateString);

  self._define('trialEnd', 'cnt_datefin_essai', types.dateString);

  self._define('eta_code', function (value) {
    types.string(value);
    return value.substr(0, 10);
  });

  self._define('lot_code', function (value) {
    types.string(value);
    return value.substr(0, 10);
  });

  self._define('endReason', 'mtf_code', types.oneOf(jsonsData.contractEndReasons));

  self._define('cnt_salaire_mdp_code', types.enum(Contract.PaymentMode));

  self._define('type', 'ncnt_code', types.oneOf(jsonsData.contractTypes));

  self._define('number', 'cnt_num', function (value) {
    types.string(value);
    return value.substr(0, 20);
  });

  self._define('semp_code', types.string);

  self._define('reason', 'rcdd_code', types.oneOf(jsonsData.contractReasons));

  self._define('hourPerWeek', 'cnt_quot_trav', types.number);

  self._define('dpub_code', types.string);

  self._define('replaced', 'cnt_rempla_sal_libre', function (value) {
    types.string(value);
    return value.substr(0, 200);
  });

  self._define('at_coderisque', function (value) {
    types.string(value);
    return value.substr(0, 6);
  });

  self._define('atOffice', 'at_bureau', types.boolean, function (value) {
    if (value) {
      return value;
    }
  });
}

/**
 * Payment mode enum
 * @enum {string}
 */
Contract.PaymentMode = {
  CHEQUE: 'CHQ',
  TRANSFER: 'VIR',
  CASH: 'ESP'
};

Parent.customize(Contract);

/**
 * Retrieve a contract by its external id
 * @param {string} externalId
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
Contract.statics.findById = function (externalId, callback) {
  var Cls = this;
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('cnt', 'read', {cnt_id_externe: externalId}, function (err, result) {
      if (err) {
        return reject(err);
      }
      resolve(result.success && result.data ? (new Cls()).import(result.data): undefined);
    });
  });
};

/**
 * Create a contract
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
Contract.prototype.create = function (callback) {
  var Cls = this.constructor;
  var json = this.export();
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('cnt', 'add', json, function (err, result) {
      if (err || !result.success) {
        return reject(err || new Cls.Error(result.error));
      }
      this.id = result.data.cnt_id;
      resolve();
    });
  });
};

/**
 * Update a contract
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
Contract.prototype.update = function (callback) {
  var Cls = this.constructor;
  var json = this.export();
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('cnt', 'update', json, function (err, result) {
      if (err || !result.success) {
        return reject(err || new Cls.Error(result.error));
      }
      resolve();
    });
  });
};

/**
 * Remove a contract by its external id
 * @param {string} externalId
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
Contract.statics.removeById = function (externalId, callback) {
  var Cls = this;
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('cnt', 'delete', {cnt_id_externe: externalId}, function (err, result) {
      if (err) {
        return reject(err);
      }
      resolve(result.success && result.data ? (new Cls()).import(result.data): undefined);
    });
  });
};

module.exports = Contract;