var path = require('path');
var getErrorInfo = require('./getErrorInfo');

module.exports = function processCode(code, codeFileName) {
  var process = {};
  var wasCreated = false;
  var codeFilePath = path.dirname(codeFileName);
  function myRequire(filePath) {
    if (filePath.indexOf('/') > -1 || filePath.indexOf('\\') > -1) {
      // TODO: Handle / or \ as the first char.
      filePath = path.join(codeFilePath, filePath);
    }
    return require(filePath);
  }

  if (code) {
    try {
      /*jshint ignore:start */
      var initCode = new Function('require, __filename, __dirname', code);
      /*jshint ignore:end */
      wasCreated = true;
      process = initCode(myRequire, codeFileName, codeFilePath);
    }

    catch(ex) {
      var errorInfo = getErrorInfo(code, codeFileName, ex, wasCreated);
      throw {status: 500, errorInfo: errorInfo};
    }
  }

  process.init = process.init || defaultInit;
  process.finish = process.finish || defaultFinish;
  return(process);
};

function defaultInit(req, next) {
  next({});
}

function defaultFinish(req, html, next) {
  next(html);
}
