/* eslint-env mocha */
var myEscape = require('./escape');
var {expect} = require('chai');

describe('Testing util/escape.js', function () {

  describe('Testing single quotes', function () {
    it('should escape single quotes', function() {
      expect(myEscape("test 'my test' \'", "'")).to.equal("test \\'my test\\' \\'");
    });

    it('should not escape double quotes', function() {
      expect(myEscape('test "my test" \"', "'")).to.equal("test \"my test\" \"");
    });
  });

  describe('Testing double quotes', function () {
    it('should not escape single quotes', function() {
      expect(myEscape("test 'my test' \'", '"')).to.equal("test 'my test' '");
    });

    it('should escape double quotes', function() {
      expect(myEscape('test "my test" \"', '"')).to.equal("test \\\"my test\\\" \\\"");
    });
  });

  describe('Testing bad strings', function () {
    it('should not fail on bad strings', function() {
      expect(myEscape('')).to.equal('');
      expect(myEscape(0)).to.equal(0);
      expect(myEscape(undefined)).to.equal(undefined);
      expect(myEscape(null)).to.equal(null);
    });
  });
});
