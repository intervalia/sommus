var fs = require('fs');
var path = require('path');
var loadFile = require('./loadFile');
var processElementContent = require('./processElementContent');

module.exports = function processElements(elementPath) {
  var stats;
  try { stats = fs.statSync(elementPath); }
  catch(ex) { return Promise.reject("element path not located: "+elementPath); }

  if(stats.isFile()){
    return processElementsFile(elementPath);
  }
  else {
    return processElementsPath(elementPath);
  }
};

function processElementsFile(fileName) {
  return new Promise(function(resolve, reject) {
    loadFile(fileName).then(
      function(content) {
        var elements = [];
        if (content) {
          elements = processElementContent(content, fileName);
        }
        resolve(elements);
      }
    ).catch(function(ex) {
      reject(ex);
    });
  });
}

function processElementsPath(elementPath) {
  return new Promise(function(resolve, reject) {
    var promises = [];
    fs.readdir(elementPath, function(err, fileList) {
      /* istanbul ignore if */
      if (err) {
        reject(err);
      }
      else {
        fileList.forEach(function(fileName) {
          promises.push(processElementsFile(path.join(elementPath, fileName)));
        });

        Promise.all(promises).then(function(newELementList) {
          var elements = [];
          newELementList.forEach(function(newElements) {
            Array.prototype.push.apply(elements, newElements);
          });
          resolve(elements);
        }).catch(
          /* istanbul ignore next */
          function(ex) {
            reject(ex);
          }
        );
      }
    });
  });
}
