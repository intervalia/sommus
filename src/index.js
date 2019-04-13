var fs = require('fs');
var path = require('path');
var Compiler = require('./engine/compiler');
var loader = require('./processor/loader');
var parser = require('./engine/parser');
var cwd = process.cwd();

function isDirectory(pathToCheck) {
  var itIsADirectory = false;
  try {
    var stats = fs.statSync(pathToCheck);
    itIsADirectory = stats.isDirectory();
  }
  catch(ex) {}

  return itIsADirectory;
}

function isFile(pathToCheck) {
  var itIsAFile = false;
  try {
    var stats = fs.statSync(pathToCheck);
    itIsAFile = stats.isFile();
  }
  catch(ex) {}

  return itIsAFile;
}

function sommus(config) {
  config = config || {};
  if (typeof config !== 'object') {
    throw new Error('`config` must be passed in as an object.')
  }
  var compiler = new Compiler();
  var elementsPath = config.elementsPath || path.join(cwd, "sommus/elements");
  var templatePath = config.templatePath || path.join(cwd, "sommus/templates");
  var elementsByFile = {};
  var loadingElements = {};

  if (!isDirectory(templatePath)) {
    throw new Error("Path to `template` files is invalid. `templatePath`='"+templatePath+"'");
  }

  if (!isDirectory(elementsPath)) {
    throw new Error("Path to `element` files is invalid. `elementsPath`='"+elementsPath+"'");
  }

  loader.processElements(elementsPath).then(
    function(elements) {
      addElements(elements);
      watchElementPath(elementsPath);
    },
    function(err) {
      // TODO: 4/18/2016 - Add error handler code here
    }
  );

  if (config.filters && (typeof config.filters === "object")) {
    Object.keys(config.filters).forEach(function(key) {
      compiler.addFilter(key, config.filters[key]);
    });
  }

  return {
    'addFilter': addFilter,
    'processElements': processElements,
    'processPage': processPage,
    'compiler': compiler,
    'parser': parser,
    'loader': loader
  };

  function addFilter(filterName, filterFunction) {
    if (typeof filterName === "object" && filterFunction === undefined) {
      Object.keys(filterName).forEach(function(key) {
        compiler.addFilter(key, filterName[key]);
      });
    }
    else {
      compiler.addFilter(filterName, filterFunction);
    }
  }

  function addElements(elements) {
    if (elements) {
      elements.forEach(function(element) {
        if (!elementsByFile[element.fileName]) {
          elementsByFile[element.fileName] = [];
        }
        elementsByFile[element.fileName].push(element.tagName);
        compiler.defineTag(element.tagName, element.template);
      });
    }
  }

  function removeElements(fileName) {
    if (elementsByFile[fileName]) {
      elementsByFile[fileName].forEach(function(tagName) {
        compiler.removeTagObj(tagName);
      });
      delete elementsByFile[fileName];
    }
  }

  function processElements(_elementsPath) {
    return loader.processElements(_elementsPath).then(
      function(elements) {
        addElements(elements);
        watchElementPath(elementsPath);
      }
    );
  }

  function processPage(req, res, next) {
    // TODO: Somehow we need to get the locale strings in here.
    var url = req._parsedUrl.pathname;
    //console.log("Processing:", url);
    var files = resourceToTemplate(url);
    return loader.processPage(files, compiler, req, res, next);
  }

  function resourceToTemplate(fileName) {
    var err;
    var tempPath = path.normalize(fileName);
    if (tempPath.indexOf("..") > -1) {
      err = new Error("Invalid path");
      err.badPath = fileName;
      err.httpResponse = 404;
      throw err;
    }

    if (tempPath[0] === '/' || tempPath[0] === '\\') {
      tempPath = "."+tempPath;
    }

    var fullPath = path.join(templatePath, tempPath);
    if (isDirectory(fullPath)) {
      fileName = "index.htm";
    }
    else {
      fileName = path.basename(tempPath);
      tempPath = path.dirname(tempPath);
      fullPath = path.join(templatePath, tempPath);
    }

    var ext = path.extname(fileName); // This may be blank if there was no extension. TODO: Handle that situation.
    var templateName =  path.join(fullPath, fileName.replace(ext, ".template"+ext));
    if (!isFile(templateName)) {
      err = new Error("Invalid path");
      err.badPath = fileName;
      err.httpResponse = 404;
      throw err;
    }

    return {
      // TODO: Make sure code path exists. Otherwise return false
      code: path.join(fullPath,  fileName.replace(ext, ".controller.js")),
      template: templateName
    };
  }

  function reprocessElements(event, filename) {
    //console.log('event: ', event);
    if (!loadingElements[filename]) {
      loadingElements[filename] = true;
      removeElements(filename);
      if (filename) {
        try {
          fs.accessSync(filename, fs.R_OK);
          //console.log('file exists:', filename);
          loader.processElements(filename).then(
            function(elements) {
              addElements(elements);
              delete loadingElements[filename];
            },
            function(err) {
              //TODO: 4/18/2016 - Handle errors here
            }
          );
        }
        catch(ex) {
          //console.log('file does not exist:', filename);
          //TODO: 4/18/2016 - Handle errors here
        }
      }
    }
  }

  function watchElementPath(elementsPath) {
    fs.watch(elementsPath, {persistent: true, recursive: false}, function(event, filename) {
      if (filename) {
        reprocessElements(event, path.join(elementsPath, filename));
      }
    });
  }
};


function HttpError(status, results, headers) {
  if (!(this instanceof HttpError)) {
    return new HttpError(status, results, headers);
  }

  if (typeof status === 'string') {
    results = status;
    status = 500;
  }

  this.status = status || 500;
  this.results = results || '';
  this.headers = headers || {};
}


module.exports = sommus;
module.exports.HttpError = HttpError;
