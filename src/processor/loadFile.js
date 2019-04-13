var fs = require('fs');

module.exports = function loadFile(fileName) {
  return new Promise(function(resolve, reject) {
    fs.stat(fileName, function(err, stats) {
      if (err) {
        reject({error:'STAT_FAILED',fsErr:err});
      }
      else if (stats.isFile()) {
        fs.readFile(fileName, {'encoding':'utf8'}, function(err, data) {
          /* istanbul ignore if */
          if (err) {
            reject({error:'READ_FAILED',fsErr:err});
          }
          else {
            resolve(data);
          }
        });
      }
      else {
        reject({error:'NOT_A_FILE'});
      }
    });
  });
};
