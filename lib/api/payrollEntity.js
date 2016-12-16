/**
 * PayrollEntity module
 * @module PayrollEntity
 * @type {PayrollEntity}
 */

var Parent = require('./parent');
var types = require('../types');
var arrayCaster = require('../arrayCaster');

/**
 * PayrollEntity Class
 * @constructor
 * @extends Parent
 * @property {string|number} id
 * @property {string} externalId
 * @property {string|number} contractId
 * @property {string} externalContractId
 * @property {string} period
 * @property {Array.<Arhia.PayrollVariable>} payrollVariables
 */
function PayrollEntity() {
  var self = this;

  self._define('id', 'lvva_id');
  self._define('externalId', 'lvva_id_externe', types.re(/^[a-z0-9]{1,50}$/i));

  self._define('contractId', 'cnt_id');
  self._define('externalContractId', 'cnt_id_externe', types.re(/^[a-z0-9]{1,50}$/i));

  self._define('period', 'periode', types.periodString);

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

Parent.customize(PayrollEntity);

/**
 * Send all payroll variables
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
PayrollEntity.prototype.setValues = function (callback) {
  var Cls = this.constructor;
  var json = this.export();
  if (json.vva && json.vva.length) {
    json.vva.forEach(function (vva) {
      if (vva.vva_periodedebut) {
        delete vva.vva_periodedebut;
      }
      if (vva.vva_periodefin) {
        delete vva.vva_periodefin;
      }
    });
  }
  return Cls.arhia.run(callback, function (resolve, reject) {
    if (!json.vva || !json.vva.length) {
      return reject(new Cls.Error("Batch 'PayrollEntity' empty, no 'PayrollVariable' to send"));
    }
    Cls.arhia.client.post('vva', 'addBatchPer', json, function (err, result) {
      if (err || !result.success) {
        return reject(err || new Cls.Error(result.error));
      }
      this.id = result.data.lvva_id;
      resolve();
    });
  });
};

/**
 * Remove all payroll variables
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
PayrollEntity.prototype.deleteValues = function (callback) {
  var self = this;
  var Cls = this.constructor;
  var P = Cls.arhia.Promise;
  var promises, options;

  return Cls.arhia.run(callback, function (resolve, reject) {
    if (!self.payrollVariables || !self.payrollVariables.length) {
      reject("No 'vva' to remove in PayrollEntity");
    }
    promises = self.payrollVariables.map(function (payrollVariable) {
      options = {};
      ['startPeriod', 'endPeriod', 'startDate', 'endDate'].forEach(function (key) {
        if (payrollVariable[key]) {
          options[key] = payrollVariable[key];
        }
      });
      return Cls.arhia.PayrollVariable.remove(self.externalContractId, payrollVariable.code, options);
    });

    P
      .all(promises)
      .then(function () {
        self.payrollVariables = [];
        resolve();
      }, function (reason) {
        reject(reason);
      });
  });
};

module.exports = PayrollEntity;
