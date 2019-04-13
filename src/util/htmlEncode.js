/**
 * Encode the current string in HTML format
 * This routine encodes the following items:
 *    & to &amp;
 *    < to &lt;
 *    > to &gt;
 *    " to &quot;
 *    ' to &#39;
 *    / to &#47;
 * \xA0 to &nbsp;
 */
var htmlMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': '&quot;', "'": '&#39;', "/": '&#47;', "\xA0": "&nbsp;" };
module.exports = function(str) {
  return (str ? str.replace(/[&<>"'\/\xA0]/g, function (item) {return htmlMap[item];}) : str);
};
