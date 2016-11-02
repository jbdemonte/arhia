/**
 * Contract module
 * @module Contract
 * @type {Contract}
 */

var Parent = require('./parent');
var types = require('../types');
var arrayCaster = require('../arrayCaster');

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
  self._define('externalEmployeelId', 'sal_id_externe', types.re(/^[a-z0-9]{1,30}$/i));

  self._define('fake', 'cnt_simul', types.boolean, function (value) {
    if (value) {
      return value;
    }
  });

  self._define('from', 'cnt_debut_date', types.dateString);
  self._define('to', 'cnt_datefin_prevue', types.dateString);
  self._define('end', 'cnt_fin_date', types.dateString);

  self._define('trialEnd', 'cnt_datefin_essai', types.dateString);

  self._define('eta_code', 'eta_code', function (value) {
    types.string(value);
    return value.substr(0, 10);
  });

  self._define('lot_code', 'lot_code', function (value) {
    types.string(value);
    return value.substr(0, 10);
  });

  self._define('mtf_code', 'mtf_code', types.string);

  self._define('cnt_salaire_mdp_code', 'cnt_salaire_mdp_code', types.string);

  self._define('ncnt_code', 'ncnt_code', string);

  self._define('number', 'cnt_num', types.string);

  self._define('semp_code', 'semp_code', types.string);

  self._define('reason', 'rcdd_code', types.enum(Contract.reasons));

  self._define('cnt_quot_trav', 'cnt_quot_trav', types.string); //DECIMAL

  self._define('dpub_code', 'dpub_code', types.string);

  self._define('sal_mens', 'sal_mens', types.string); //DECIMAL

  self._define('hrate', 'taux_hor', types.string);

  self._define('at_coderisque', 'at_coderisque', function (value) {
    types.string(value);
    return value.substr(0, 6);
  });

  self._define('at_bureau', 'at_bureau', types.boolean, function (value) {
    if (value) {
      return value;
    }
  });
}

/**
 * Reasons enum
 * @enum {number}
 */
Contract.reasons = {
  REMPLACEMENT: 1
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
      resolve(result.success ? (new Cls()).import(result.data): undefined);
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
      resolve(result.success ? (new Cls()).import(result.data): undefined);
    });
  });
};

module.exports = Contract;