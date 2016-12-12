/**
 * client module
 * @module client
 * @type {Client}
 */

var request = require('request');
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
  return new P(function (resolve, reject) {
    var query = {
      method: 'POST',
      uri: settings.uri + 'webapi/authenticate',
      json: {
        username: settings.username,
        password: settings.password,
        dospay_id: settings.dospayId
      }
    };
    request(query, function (err, res, body) {
      if (err || !body || !body.success) {
        return reject(new Client.Error(err || (body && body.error ? body.error : '') || 'Unknown error while requesting access token'));
      }
      if (!body.token) {
        return reject(new Client.Error('Token is missing while access token request succeed'));
      }
      resolve(body.token);
    });
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
  return new P(function (resolve, reject) {

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
      }
    };
    request(query, function (err, res, body) {
      if (requestLoger) { // If there are a callback to handle the response and request from arhia service
        requestLoger(query, err, res);
      }
      if (res.statusCode === 401) {
        return reject(new InternalError({code: res.statusCode}));
      }
      if (err || !body) {
        return reject(new Client.Error(err || (body && body.error ? body.error : '') || 'Unknown error while requesting ' + entity + ':' + action));
      }
      resolve(body);
    });
  });
}

module.exports = Client;
