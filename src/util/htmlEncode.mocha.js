/* eslint-env mocha */
var htmlEncode = require('./htmlEncode');
var {expect} = require('chai');

describe('Testing util/htmlEncode.js', function () {
  it('should encode common elements', function() {
    expect(htmlEncode("&<>\"'/\xA0")).to.equal("&amp;&lt;&gt;&quot;&#39;&#47;&nbsp;");
  });

  it('should should not fail on empty strings', function() {
    expect(htmlEncode("")).to.equal("");
    expect(htmlEncode(0)).to.equal(0);
    expect(htmlEncode(null)).to.equal(null);
    expect(htmlEncode()).to.equal(undefined);
  });
});
