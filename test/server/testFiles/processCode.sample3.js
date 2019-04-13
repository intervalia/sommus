var cat = require('./processCode.require.js');
var path = require('path');

return {
  "init": function(req, next) {
    next({
      animal: cat,
      path: path
    });
  }
};
