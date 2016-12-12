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
 * @property {string|number} id
 * @property {string} externalId
 * @property {string|number} employeeId
 * @property {string} externalEmployeeId
 * @property {string|number} companyId
 * @property {string} externalCompanyId
 * @property {boolean} fake
 * @property {string} from
 * @property {string} to
 * @property {string} end
 * @property {string} trialEnd
 * @property {string} eta_code
 * @property {string} lot_code
 * @property {string} endReason
 * @property {string} cnt_salaire_mdp_code
 * @property {string} type
 * @property {string} number
 * @property {string} semp_code
 * @property {string} reason
 * @property {number} hourPerWeek
 * @property {string} dpub_code
 * @property {string} replaced
 * @property {string} at_coderisque
 * @property {boolean} atOffice
 * @property {string} workerStatus
 * @property {Array.<Arhia.PayrollVariable>} payrollVariables
 */
function Contract() {
  var self = this;

  self._define('id', 'cnt_id');
  self._define('externalId', 'cnt_id_externe', types.re(/^[a-z0-9]{1,50}$/i));

  self._define('employeeId', 'sal_id');
  self._define('externalEmployeeId', 'sal_id_externe', types.re(/^[a-z0-9]{1,50}$/i));

  self._define('companyId', 'euti.euti_id');
  self._define('externalCompanyId', 'euti.euti_id_externe', types.re(/^[a-z0-9]{1,50}$/i));

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

  self._define('workerStatus', 'src_id_force', types.enum(Contract.WorkerStatus));

  self._define('quaTitle', 'ect.ect_lib', function (value) {
    types.string(value);
    return value.substr(0, 100);
  });
  self._define('quaPosition', 'ect.ect_classif_pos', function (value) {
    types.string(value);
    return value.substr(0, 100);
  });
  self._define('quaCoef', 'ect.ect_classif_coef', function (value) {
    types.string(value);
    return value.substr(0, 100);
  });
  self._define('quaLevel', 'ect.ect_classif_niv', function (value) {
    types.string(value);
    return value.substr(0, 100);
  });
  self._define('locationName', 'ltrac.ltrac_codif_libre', function (value) {
    types.string(value);
    return value.substr(0, 1000).replace(/,/g, '');
  });

  self._defineProperty('payrollVariables', 'vva', function () {
    var PayrollVariableArray = arrayCaster(self.constructor.arhia.PayrollVariable);
    var payrollVariables = new PayrollVariableArray();

    // return properties object without any setters
    return {
      get: function () {
        return payrollVariables;
      },
      set: function (values) {
        payrollVariables.splice(0, payrollVariables.length);
        payrollVariables.push.apply(payrollVariables, values);
      }
    };

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

/**
 * Worker status enum
 * @enum {number}
 */
Contract.WorkerStatus = {
  EXECUTIVE: 1,
  EXECUTIVE36: 2,
  NONEXECUTIVE: 3
};

Parent.customize(Contract);

/**
 * Retrieve a contract by its external id
 * @param {string} externalId - The external id of the contrat
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
 * @param {string} externalId - The external id of the contrat
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