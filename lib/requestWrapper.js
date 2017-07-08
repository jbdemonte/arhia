var request = require('request');

exports.Promise = global.Promise;

/**
 * Promisify of request lib
 * @param {object} query
 * @returns {Promise}
 */
function requestPromise(query) {
  return new exports.Promise(function (resolve, reject) {
    request(query, function (err, res) {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
}

/**
 * Request wrapper to use request promise with retry process an catch error
 * @param {object} query
 * @param {number} [maxRetry] - Max retry request (default=3)
 * @param {number} [retry] - Current retry request (init=1)
 * @returns {Promise}
 */
function requestWrapper(query, maxRetry, retry) {
  maxRetry = maxRetry || 3;
  retry = retry || 1;
  try {
    return requestPromise(query)
      .catch(function (err) {
        if (retry < maxRetry) {
          return requestWrapper(query, maxRetry, retry + 1);
        }
        return exports.Promise
          .reject(err);
      });
  } catch (err) {
    return exports.Promise
      .reject(err);
  }
}

exports.requestPromise = requestPromise;
exports.requestWrapper = requestWrapper;