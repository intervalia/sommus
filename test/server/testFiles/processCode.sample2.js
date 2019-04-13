return {
  "init": function sample2Init(req, next) {
    next({
      path: req.path
    });
  },
  "finish": function sample2finish(req, html, next) {
    var i = html.length-1;
    var ret = "";
    for(;i>=0;i--) {
      ret+=html[i];
    }

    next(ret);
  }
};
