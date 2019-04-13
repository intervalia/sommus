return {
  "init": function(req, next) {
    next({
      sample: true,
      name: "Someone else",
      age: 123
    });
  }
};
