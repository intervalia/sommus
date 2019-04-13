/* eslint-env mocha */
var urlEncode = require('./urlEncode');
var {expect} = require('chai');

describe('Testing util/escape.js', function () {
  it('should urlEncode simple things', function() {
    expect(urlEncode("'\"!@#$%^&*()_+")).to.equal("%27%22%21%40%23%24%25%5E%26%2A%28%29_%2B");
  });

  it('should not fail on bad strings', function() {
    expect(urlEncode('')).to.equal('');
    expect(urlEncode(0)).to.equal(0);
    expect(urlEncode(undefined)).to.equal(undefined);
    expect(urlEncode(null)).to.equal(null);
  });
});
