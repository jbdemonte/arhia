var removeDiacritics = require('diacritics').remove;

/**
 * Charset on common fields
 * @param {string} data - The string data to pass within charset
 * @returns {string}
 */
function commonCharset(data) {
  var result = removeDiacritics(data);
  var regCharset = /[^a-zA-Z0-9"&'()*+,\-.\/:=@_`«»ÀÁÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüý\s]/gmi;

  return result.replace(regCharset, ' ');
}

/**
 * Charset on identity fields
 * @param {string} data - The string data to pass within charset
 * @returns {string}
 */
function identityCharset(data) {
  var result = removeDiacritics(data);
  var regCharset = /[^a-zA-Z'\-ÀÁÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüý\s]/gmi;

  return result.replace(regCharset, ' ');
}

/**
 * Charset on address fields
 * @param {string} data - The string data to pass within charset
 * @returns {string}
 */
function addressCharset(data) {
  var result = removeDiacritics(data);
  var regCharset = /[^a-zA-Z0-9'\-.ÀÁÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäåçèéêëìíîïñòóôõöùúûüý\s]/gmi;

  return result.replace(regCharset, ' ');
}

exports.commonCharset = commonCharset;
exports.identityCharset = identityCharset;
exports.addressCharset = addressCharset;