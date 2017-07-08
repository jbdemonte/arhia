/**
 * client module
 * @module client
 * @type {Client}
 */

var request = require('./requestWrapper');
var extend = require('util')._extend;
var fs = require('fs');
var errorBuilder = require('./errorBuilder');


var InternalError = errorBuilder('Client');
var requestLoger; // Callback to handle all requests and response from arhia

/**
 * Exchange client
 * @param {Arhia} arhia - Current instance
 * @param {Object} settings - Connection settings
 * @constructor
 */
function Client(arhia, settings) {

  if (!settings || !settings.uri) {
    throw new Error('Missing settings' + (settings ? '.uri' : ''));
  }
  settings = extend({}, settings);

  var self = this;
  var currentToken = settings.token; // if defined, use it
  var uri = settings.uri + (settings.uri.substr(-1) === '/' ? '' : '/');

  /**
   * Execute a POST request
   */
  this.post = function (entity, action, payload, callback, once) {
    var P = arhia.Promise;
    request.Promise = arhia.Promise;

    function resolve(result) { callback(undefined, result); }
    function reject(reason) { callback(reason); }
    var handleError = function (reason) {
      if (reason instanceof InternalError && reason.code === 401) { // token has expired
        currentToken = '';
        if (once) {
          reason = new Client.Error('Token has expired');
        } else {
          return self
            .post(entity, action, payload, callback, true)
            .then(resolve, reject);
        }
      }
      reject(reason);
    };

    P
      .resolve()
      .then(function () {
        return currentToken || getToken(P, settings);
      }, handleError)
      .then(function (token) {
        currentToken = token;
        return send(P, settings, token, entity, action, payload);
      }, handleError)
      .then(resolve, handleError);
  };

}

Client.Error = errorBuilder('Client');

// Allow to set the callback to handle the request and request fron arhia service
Client.prototype.setRequestLog = function (cb) {
  requestLoger = cb;
};

/**
 * Request for an access token
 * @param {Function} P - Promise class to use
 * @param {Object} settings
 * @return {Promise}
 */
function getToken(P, settings) {
  var query = {
    method: 'POST',
    uri: settings.uri + 'webapi/authenticate',
    json: {
      username: settings.username,
      password: settings.password,
      dospay_id: settings.dospayId
    },
    timeout: 15000
  };

  return request.requestWrapper(query)
    .then(function (res) {
      if (!res.body || !res.body.success) {
        return P.reject(new Client.Error((res.body && res.body.error ? res.body.error : '') || 'Unknown error while requesting access token'));
      }
      if (!res.body.token) {
        return P.reject(new Client.Error('Token is missing while access token request succeed'));
      }
      return res.body.token;
    })
    .catch(function (err) {
      return P.reject(new Client.Error(err || 'Unknown error while requesting access token'));
    });
}

/**
 * Send a request to the ARHIA server
 * @param {Function} P - Promise class to use
 * @param {Object} settings
 * @param {string} token
 * @param {string} entity
 * @param {string} action
 * @param {Object} payload
 * @return {Promise}
 */
function send(P, settings, token, entity, action, payload) {
  var query = {
    method: 'POST',
    uri: settings.uri + 'webapi/',
    headers: {
      Authorization: 'Bearer ' + token
    },
    json: {
      versionAPI: settings.versionAPI,
      dospay_id: settings.dospayId,
      entity: entity,
      action: action,
      data: payload
    },
    timeout: 15000
  };

  return request.requestWrapper(query)
    .then(function (res) {
      if (requestLoger) { // If there are a callback to handle the response and request from arhia service
        requestLoger(query, {}, res);
      }
      if (!res.body) {
        return P.reject(new Client.Error('Unknown error while requesting ' + entity + ':' + action));
      }
      if (res.statusCode === 401) {
        return P.reject(new InternalError({code: res.statusCode}));
      }
      return res.body;
    })
    .catch(function (err) {
      if (requestLoger) { // If there are a callback to handle the response and request from arhia service
        requestLoger(query, err, {});
      }
      return P.reject(new Client.Error(err || 'Unknown error while requesting ' + entity + ':' + action));
    });
}

module.exports = Client;
