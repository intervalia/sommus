/**
 * Encode the current string in URL format
 */
module.exports = function(str) {
  if (str) {
    str = encodeURIComponent(str).replace(/[!'()*]/g, function(c) {return '%' + c.charCodeAt(0).toString(16).toUpperCase();});
  }

  return str;
};
