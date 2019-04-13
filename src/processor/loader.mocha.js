/* eslint-env mocha */
var loader = require('./loader');
var {expect} = require('chai');

describe('Testing processor/loader.js', function () {
  it('should load the correct portions of code', function() {
    /* jshint ignore:start */
    expect(loader.processElements).isFunction;
    expect(loader.processPage).isFunction;
    /* jshint ignore:end */
    Object.keys(loader).forEach(function(key) {
      if (key === 'processElements' || key === 'processPage') {
        return;
      }

      expect(true, 'The key `'+key+'` is not supposed to be defined on the loader object.').to.equal(false);
    });
  });
});
