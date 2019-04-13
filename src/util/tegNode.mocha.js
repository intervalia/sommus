/* eslint-env mocha */
var tagNode = require('./tagNode');
var {expect} = require('chai');

describe('Testing util/tagNode.js', function () {
  it('should instantiate correctly', function() {
    var a = new tagNode("test", 10, "none", true);
    expect(a.type).to.equal("tag");
    expect(a.name).to.equal("test");
    expect(a.value).to.equal(10);
    expect(a.children).to.equal("none");
    expect(a.closedTag).to.equal(true);
  });
});
