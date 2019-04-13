var path = require('path');
var fs = require('fs');
var HttpError = require('../../src/index').HttpError;

return {
  "GET": function(req, next) {
    var fileName = path.join(__dirname, '../data/mike.json');
    setTimeout(function() {
      fs.stat(fileName, function(err, stats) {
        if (err) {
          return next({pageTitle:err.message});
        }
        if (stats.isFile()) {
          fs.readFile(fileName, {"encoding":"utf8"}, function(err, data) {
            if (err) {
              return next({pageTitle:err.message});
            }

            data = JSON.parse(data);
            data.father.forEach(function(one) {
              one.birthDate = new Date(one.birthDate);
            });
            next(data);
          });
        }
        else {
          next({pageTitle:'Not a file'});
        }
      });
    },0);
  }
};
