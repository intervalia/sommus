var path = require('path');
var fs = require('fs');


return {
  urlParams: ['id','gender'],

  GET: function(req, next) {
    setTimeout(function() {
      var data = {
        pageTitle:'This is the GET call',
        params: req.params
      };

      next(data);
    },100);
  },

  POST: function(req, next) {
    setTimeout(function() {
      var data = {
        pageTitle:'This is the POST call',
        params: req.params
      };

      next(data);
    },100);
  }
};
