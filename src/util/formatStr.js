var re = /{([^{}]+)}/g;
module.exports = function(str, obj) {
  if (str) {
    obj = (typeof obj === 'object') ? obj : [].slice.call(arguments, 1);
    //console.log(obj);
    str = str.replace(re, function(original, key) {
      return obj[key] !== undefined ? obj[key] : original;
    });
  }

  return str;
};
