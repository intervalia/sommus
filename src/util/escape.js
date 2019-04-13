/**
 * Escape the current string
 *
 * If quote === "'" then this routine escapes:
 *    ' to \'
 * Otherwise this routine escapes:
 *    " to \"
 */
module.exports = function(str, quote) {
  var re, replace;
  if (str) {
    if (quote === "'") {
      str = str.replace(/[']/g, "\\'");
    }
    else {
      str = str.replace(/["]/g, '\\"');
    }
  }

  return str;
};
