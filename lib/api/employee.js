/**
 * Employee module
 * @module Employee
 * @type {Employee}
 */

var Parent = require('./parent');
var types = require('../types');
var arrayCaster = require('../arrayCaster');

/**
 * Employee Class
 * @constructor
 * @extends Parent
 * @property {string|number} id
 * @property {boolean} fake
 * @property {string} firstname
 * @property {string} lastname
 * @property {string} maidenName
 * @property {Employee.Gender} gender
 * @property {string} nir
 * @property {string} registrationNumber
 * @property {string} birthPlace
 * @property {string} birthDate
 * @property {string} birthCountryISOCode
 * @property {string} city
 * @property {string} address
 * @property {string} addressCpl
 * @property {string} addressCCpl
 * @property {string} postalCode
 * @property {string} addressCountryISOCode
 * @property {string} nationalityISOCode
 * @property {string} externalId
 * @property {Employee.PaymentMode} paymentMode
 * @property {Array.<Arhia.BankAccount>} banks
 */
function Employee() {
  var self = this;

  self._define('id', 'sal_id');

  self._define('fake', 'sal_simul', types.boolean, function (value) {
    if (value) {
      return value;
    }
  });

  self._define('firstname', 'sal_prenom', function (value) {
    types.string(value);
    return value.substr(0, 80);
  });

  self._define('lastname', 'sal_nom_famille', function (value) {
    types.string(value);
    return value.substr(0, 80);
  });

  self._define('maidenName', 'sal_nom_usage', function (value) {
    types.string(value);
    return value.substr(0, 80);
  });

  self._define('gender', 'sal_sexe', types.enum(Employee.Gender), function (value) {
    if (!self.nir) {
      return value;
    }
  });

  self._define('nir', 'sal_nir', {
    set: function (value) {
      types.string(value);
      return value.replace(/\s+/g, '').substr(0, 13)
    },
    import: function (value) {
      if (value) {
        return value;
      }
    }
  });

  self._define('registrationNumber', 'sal_matricule', function (value) {
    types.string(value);
    return value.substr(0, 30);
  });

  self._define('birthPlace', 'sal_naissance_commune_nom', function (value) {
    types.string(value);
    return value.substr(0, 50);
  });
  self._define('birthDate', 'sal_naissance_date', types.dateString);
  self._define('birthCountryISOCode', 'sal_naissance_pays_code', function (value) {
    types.string(value);
    return value.toUpperCase();
  });

  self._define('city', 'sal_adresse_commune_nom', function (value) {
    types.string(value);
    return value.substr(0, 50).replace(types.regAddress, '');
  });
  self._define('email', 'sal_email', function (value) {
    types.string(value);
    return value.substr(0, 50);
  });
  self._define('address', 'sal_adresse_voie_desc', function (value) {
    types.string(value);
    return value.substr(0, 50).replace(types.regAddress, '');
  });
  self._define('addressCpl', 'sal_adresse_voie_cplt', function (value) {
    types.string(value);
    return value.substr(0, 50).replace(types.regAddress, '');
  });
  self._define('addressCCpl', 'sal_adresse_constr_cplt', function (value) {
    types.string(value);
    return value.substr(0, 50).replace(types.regAddress, '');
  });
  self._define('postalCode', 'sal_adresse_codepostal', types.string);
  self._define('addressCountryISOCode', 'sal_adresse_pays_code', function (value) {
    types.string(value);
    return value.toUpperCase();
  });

  self._define('nationalityISOCode', 'sal_nationalite_code', function (value) {
    types.string(value);
    return value.toUpperCase();
  });
  self._define('externalId', 'sal_id_externe', types.re(/^[a-z0-9]{1,50}$/i));

  self._define('paymentMode', 'mdp_code', types.enum(Employee.PaymentMode));
  self._define('observation', 'sal_obs', types.string);

  self._defineProperty('banks', 'bnqs', function () {
    var BankArray = arrayCaster(self.constructor.arhia.BankAccount);
    var banks = new BankArray();

    // return properties object without any setters
    return {
      get: function () {
        return banks;
      },
      set: function (values) {
        banks.splice(0, banks.length);
        banks.push.apply(banks, values);
      }
    };

  });
}

/**
 * Gender enum
 * @enum {number}
 */
Employee.Gender = {
  MAN: 1,
  WOMAN: 2
};

/**
 * Payment mode enum
 * @enum {string}
 */
Employee.PaymentMode = {
  CHEQUE: 'CHQ',
  TRANSFER: 'VIR',
  CASH: 'ESP'
};

Parent.customize(Employee);

/**
 * Retrieve a user by its external id
 * @param {string} externalId - The external id of the employee
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
Employee.statics.findById = function (externalId, callback) {
  var Cls = this;
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('sal', 'read', {sal_id_externe: externalId}, function (err, result) {
      if (err) {
        return reject(err);
      }
      resolve(result.success && result.data ? (new Cls()).import(result.data): undefined);
    });
  });
};

/**
 * Create a user
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
Employee.prototype.create = function (callback) {
  var Cls = this.constructor;
  var json = this.export();
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('sal', 'add', json, function (err, result) {
      if (err || !result.success) {
        return reject(err || new Cls.Error(result.error));
      }
      this.id = result.data.sal_id;
      resolve();
    });
  });
};

/**
 * Update a user
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
Employee.prototype.update = function (callback) {
  var Cls = this.constructor;
  var json = this.export();
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('sal', 'update', json, function (err, result) {
      if (err || !result.success) {
        return reject(err || new Cls.Error(result.error));
      }
      resolve();
    });
  });
};


module.exports = Employee;