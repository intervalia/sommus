/* eslint-env mocha */
var processStyles = require('./processStyles');
var {assert, expect} = require('chai');

describe('Testing processor/processStyles.js', function () {
  it('should handle an falsey', function() {
    var tagName = 'my-tag';
    var styles = undefined;
    var outStyles = processStyles(styles, tagName);
    expect(typeof outStyles).to.equal('string');
    expect(outStyles.length).to.equal(0);
  });

  it('should handle an empty string', function() {
    var tagName = 'my-tag';
    var styles = '';
    var outStyles = processStyles(styles, tagName);
    expect(typeof outStyles).to.equal('string');
    expect(outStyles.length).to.equal(0);
  });

  it('should handle no line feeds', function() {
    var tagName = 'tight-element-tag';
    var styles = '.tight{color:#000;background-color:#FFE;}';
    var outStyles = processStyles(styles, tagName);
    expect(typeof outStyles).to.equal('string');
    expect(outStyles).to.equal('[sommus-tag="tight-element-tag"].tight, [sommus-tag="tight-element-tag"] .tight {color:#000;background-color:#FFE;}\n\n');
  });

  it('should handle one rule', function() {
    var tagName = 'my-tag';
    var styles = `.simple {
      background-color: #000;
      border: 1px dashed #FE0;
      display: inline-block;
    }
    `;
    var outStyles = processStyles(styles, tagName);
    expect(outStyles).to.equal('[sommus-tag="my-tag"].simple, [sommus-tag="my-tag"] .simple {background-color:#000;border:1px dashed #FE0;display:inline-block;}\n\n');
  });

  it('should handle multiple rules', function() {
    var tagName = 'my-tag';
    var styles = `
.first {
  background-color: #000;
}

.second {
  display: block;
}
`;
    var outStyles = processStyles(styles, tagName);
    expect(outStyles).to.equal('[sommus-tag="my-tag"].first, [sommus-tag="my-tag"] .first {background-color:#000;}\n\n[sommus-tag="my-tag"].second, [sommus-tag="my-tag"] .second {display:block;}\n\n');
  });

  it('should handle multiple selectors', function() {
    var tagName = 'my-tag';
    var styles = `
.first, .first:before {
  background-color: #000;
}

.second, .second:after {
  display: block;
}
`;
    var outStyles = processStyles(styles, tagName);
    expect(outStyles).to.equal('[sommus-tag="my-tag"].first, [sommus-tag="my-tag"] .first, [sommus-tag="my-tag"].first:before, [sommus-tag="my-tag"] .first:before {background-color:#000;}\n\n[sommus-tag="my-tag"].second, [sommus-tag="my-tag"] .second, [sommus-tag="my-tag"].second:after, [sommus-tag="my-tag"] .second:after {display:block;}\n\n');
  });

  it('should handle comments', function() {
    var tagName = 'my-tag';
    var styles = `
/* First comment */
.first {
  background-color: #000;
  /* second comment */
}
/* Last comment */
`;
    var outStyles = processStyles(styles, tagName);
    expect(outStyles).to.equal('[sommus-tag="my-tag"].first, [sommus-tag="my-tag"] .first {background-color:#000;}\n\n');
  });

  it('should handle fail with missing curly brace', function() {
    var tagName = 'my-tag';
    var styles = `.first background-color: #000;} .second{display:none;}`;
    var outStyles;
    try {
      outStyles = processStyles(styles, tagName);
      assert.fail('Exception should have been thrown');
    }

    catch(ex) {
      expect(ex.message.indexOf('Open curly brace `{` missing from rule:')).to.equal(0);
    }
  });
});
