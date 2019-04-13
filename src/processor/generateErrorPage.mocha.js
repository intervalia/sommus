/* eslint-env mocha */
var generateErrorPage = require('./generateErrorPage');
var {expect} = require('chai');

describe('Testing processor/generateErrorPage.js', function () {
  it('should work with no template', function() {
    var content = {
      errorMessage: "[errorMessage]",
      fileNameLine: "fileNameLine:10",
      exampleCode: "exampleCode\nMore code",
      ex: {
        toString: function() {
          return "Exception string";
        },
        stack: "something for the stack with <html> & text"
      }
    };
    var html = generateErrorPage(content);
    var temp = getSection(html, '<div class="sommus-error">', '</div></body>');

    expect(getSection(temp, '<strong>', '</strong>')).to.equal(content.errorMessage);
    expect(getSection(temp, '<em class="sommus-error__error">', '</em>')).to.equal(content.ex.toString());
    expect(getSection(temp, '<p class="sommus-error__filename">', '</p>')).to.equal(content.fileNameLine);
    expect(getSection(temp, '<pre class="sommus-error__code">', '</pre>')).to.equal(content.exampleCode);
    expect(getSection(temp, '<pre class="sommus-error__stack">', '</pre>')).to.equal('something for the stack with &lt;html&gt; &amp; text');
  });

  it('should work with no stack', function() {
    var content = {
      errorMessage: "[errorMessage]",
      fileNameLine: "fileNameLine:10",
      exampleCode: "exampleCode\nMore code",
      ex: {
        toString: function() {
          return "Exception string";
        }
      }
    };
    var html = generateErrorPage(content);
    var temp = getSection(html, '<div class="sommus-error">', '</div></body>');

    expect(getSection(temp, '<strong>', '</strong>')).to.equal(content.errorMessage);
    expect(getSection(temp, '<em class="sommus-error__error">', '</em>')).to.equal(content.ex.toString());
    expect(getSection(temp, '<p class="sommus-error__filename">', '</p>')).to.equal(content.fileNameLine);
    expect(getSection(temp, '<pre class="sommus-error__code">', '</pre>')).to.equal(content.exampleCode);
    expect(getSection(temp, '<pre class="sommus-error__stack">', '</pre>')).to.equal('undefined');
  });
});

function getSection(src, before, after) {
  var start, end, ret = "";

  start = src.indexOf(before);
  if (start != -1) {
    start += before.length;
    end = src.indexOf(after, start);
    if (end != -1) {
      ret = src.substring(start, end);
    }
  }

  return ret;
}
