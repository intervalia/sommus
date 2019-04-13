return {
  init: function(req, next) {
    next({
      name: "Test Name",
      size: 40,
      value: 'This is a "test"'
    });
  }
};
