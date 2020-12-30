/**
 * Company module
 * @module Company
 * @type {Company}
 */

var Parent = require('./parent');
var types = require('../types');
var charsets = require('../charsets');

/**
 * Company Class
 * @constructor
 * @extends Parent
 * @property {string|number} id
 * @property {string} externalId
 * @property {boolean} fake
 * @property {string} name
 * @property {string} siren
 * @property {string} nic
 * @property {string} ape
 * @property {string} city
 * @property {string} address
 * @property {string} addressCpl
 * @property {string} addressCCpl
 * @property {string} addressCDist
 * @property {string} postalCode
 * @property {string} addressCountryISOCode
 */
function Company() {
  var self = this;

  self._define('id', 'euti_id');

  self._define('externalId', 'euti_id_externe', types.re(/^[-a-z0-9]{1,50}$/i));


  self._define('fake', 'euti_simul', types.boolean, function (value) {
    if (value) {
      return value;
    }
  });

  self._define('name', 'euti_nom', function (value) {
    types.string(value);
    return charsets.identityCharset(value.substr(0, 50));
  });

  self._define('siren', 'euti_siren', types.re(/^[0-9]{9}$/));

  self._define('nic', 'euti_nic', types.re(/^[0-9]{5}$/));

  self._define('ape', 'euti_ape', function (value) {
    var tmp = value.replace(/\s+/g, '');

    types.re(/^[0-9]{4}[a-z]{1}$/i)(tmp);
    return tmp;
  });

  self._define('city', 'euti_adr_localite', function (value) {
    types.string(value);
    return charsets.addressCharset(value.substr(0, 50));
  });

  self._define('address', 'euti_adr_voie', function (value) {
    types.string(value);
    return charsets.addressCharset(value.substr(0, 50));
  });
  self._define('addressCpl', 'euti_adr_cpl_voie', function (value) {
    types.string(value);
    return charsets.addressCharset(value.substr(0, 50));
  });
  self._define('addressCCpl', 'euti_adr_cpl_const', function (value) {
    types.string(value);
    return charsets.addressCharset(value.substr(0, 50));
  });

  self._define('addressCDist', 'euti_adr_code_distrib', function (value) {
    types.string(value);
    return value.substr(0, 50);
  });

  self._define('postalCode', 'euti_adr_codepostal', function (value) {
    types.string(value);
    return value.substr(0, 5);
  });

  self._define('addressCountryISOCode', 'euti_adr_pays_code', function (value) {
    types.string(value);
    return value.substr(0, 2).toUpperCase();
  });
  self._define('cityCodeInsee', 'euti_adr_cmu_codeinsee', function (value) {
    types.string(value);
    return value;
  });
}

Parent.customize(Company);

/**
 * Retrieve a company by its external id
 * @param {string} externalId - The external id of the company
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
Company.statics.findById = function (externalId, callback) {
  var Cls = this;
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('euti', 'read', {euti_id_externe: externalId}, function (err, result) {
      if (err) {
        return reject(err);
      }
      resolve(result.success && result.data ? (new Cls()).import(result.data): undefined);
    });
  });
};

/**
 * Create a Company
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
Company.prototype.create = function (callback) {
  var Cls = this.constructor;
  var json = this.export();
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('euti', 'add', json, function (err, result) {
      if (err || !result.success) {
        return reject(err || new Cls.Error(result.error));
      }
      this.id = result.data.euti_id;
      resolve();
    });
  });
};

/**
 * Update a company
 * @param {Function} [callback]
 * @return {Promise|undefined}
 */
Company.prototype.update = function (callback) {
  var Cls = this.constructor;
  var json = this.export();
  return Cls.arhia.run(callback, function (resolve, reject) {
    Cls.arhia.client.post('euti', 'update', json, function (err, result) {
      if (err || !result.success) {
        return reject(err || new Cls.Error(result.error));
      }
      resolve();
    });
  });
};


module.exports = Company;