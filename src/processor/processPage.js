var loadFile = require('./loadFile');
var parser = require('../engine/parser');
var minify = require('html-minifier').minify;
var fs = require('fs');
var path = require('path');
var processCode = require('./processCode');
var getErrorInfo = require('./getErrorInfo');
var generateErrorPage = require("./generateErrorPage");

module.exports = function processPage(files, compiler, req, res, next) {
  //console.time("processing");
  var promises = [];
  var lang = {};
  var ext = path.extname(files.template).toLowerCase();
  var isJson = (ext === ".json");
  var template; // must be undefined by default
  var code; // must be undefined by default

  loadFile(files.template).then(
    function(loadedTemplate) {
      template = loadedTemplate;
      gateCall();
    },
    function(_err) {
      next(); // File not found - Move to next middleware
    }
  );

  loadFile(files.code).then(
    function(loadedCode) {
      code = loadedCode;
      gateCall();
    },
    function(_err) {
      code = '';
      gateCall(); // The code file does not need to exists
    }
  );

  function gateCall() {
    if (typeof template === 'string' && typeof code === 'string') {
      processFiles();
    }
  }

  function processFiles() {
    var process;
    var errorInfo;
    try { process = processCode(code, files.code); }
    catch(ex) {
      sendError(ex);
      return;
    }

    try {
      process.init(req, function(data) {
        if (data.redirect) {
          res.redirect(data.redirect);
          return;
        }
        try {
          var parsedTemplate = parser.parse(template);
          var compiledOutput = compiler.processParsed(parsedTemplate, data, {});
          process.finish(req, compiledOutput, sendResult);
        }
        catch(ex) {
          errorInfo = getErrorInfo(code, files.code, ex, true);
          sendError({status:500, errorInfo: errorInfo});
        }
      });
    }
    catch(ex) {
      errorInfo = getErrorInfo(code, files.code, ex, true);
      sendError({status:500, errorInfo: errorInfo});
    }
  }

  function sendResult(result) {
    //console.timeEnd("processing");
    res.status(200);
    if (isJson) {
      res.setHeader('Content-Type', 'application/json');
    }
    else {
      var before = result.length;
      //console.time('minifying');
      result = minify(result, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyCss: true,
        minifyJs: true,
        removeComments: true
      });
      //console.timeEnd('minifying');
      //console.log('Before:', before, '- After:', result.length);
    }
    res.send(result);
    res.end();
  }

  function sendError(err) {
    if (req.hideDevMessages) {
      next(err);
    }
    else {
      res.status(err.status);
      if (isJson) {
        res.json(err.errorInfo);
      }
      else {
        res.send(generateErrorPage(err.errorInfo));
      }
      res.end();
    }
  }
};
