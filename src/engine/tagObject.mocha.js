/* eslint-env mocha */
var tagObject = require('./tagObject');
var {expect} = require('chai');

describe('Testing engine/tagObject.js', function () {
  it('should work with no template', function() {
    var tObj = new tagObject("name", '');
    expect(tObj.tagName).to.equal("name");
    expect(tObj.template.source).to.equal("");
    expect(Array.isArray(tObj.template.parsed)).to.equal(true);
    expect(tObj.template.parsed.length).to.equal(0);
  });

  it('should work with a simple template', function() {
    var template = '<div></div>';
    var tObj = new tagObject("name", template);
    expect(tObj.template.source).to.equal(template);
    expect(tObj.template.parsed[0].type).to.equal('text');
    expect(tObj.template.parsed[0].value).to.equal(template);
  });

  it('should work with a complex template', function() {
    var template = '<div>{{if a}}A{{elif b}}B{{else}}{{something}}{{endif}}</div>';
    var parsedVal = [
      { "type": "text", "value": "<div>" },
      { "type": "if", "value": [
        { "test": "a", "value": [
          { "type": "text", "value": "A" }
        ]},
        { "test": "b", "value": [
          { "type": "text", "value": "B" }
        ]},
        { "else": true, "value": [
          { "type": "val", "value": "something" }
        ]}
      ]},
      { "type": "text", "value": "</div>" }
    ];

    var tObj = new tagObject("name", template);
    var parsed = tObj.template.parsed;
    expect(parsed).to.eql(parsedVal);
  });


  it('should throw exception with no tagName', function() {
    var tObj;
    function fn(name) {
      return function() {
        tObj = new tagObject(name, '');
      };
    }

    expect(fn()).to.throw(Error);
    expect(fn('')).to.throw(Error);
  });
});
