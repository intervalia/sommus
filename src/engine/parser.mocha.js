/* eslint-env mocha */
var parser = require('./parser');
var {expect} = require('chai');

describe('Testing engine/parser.js', function () {
  it('should work with no template', function() {
    var parsed = parser.parse('');
    expect(Array.isArray(parsed)).to.equal(true);
    expect(parsed.length).to.equal(0);
  });

  it('should work with a simple template', function() {
    var template = '<div></div>';
    var parsed = parser.parse(template);
    expect(parsed[0].type).to.equal('text');
    expect(parsed[0].value).to.equal(template);
  });

  it('should work with a complex template', function() {
    var template = '<div>{{if a}}A{{elif b}}B{{if c}}C{{endif}}{{else}}{{something}}{{endif}}</div>';
    var parsedVal = [
      { "type": "text", "value": "<div>" },
      { "type": "if", "value": [
        { "test": "a", "value": [
          { "type": "text", "value": "A" }
        ]},
        { "test": "b", "value": [
          { "type": "text", "value": "B" },
          { "type": "if", "value": [
            { "test": "c", "value": [
              { "type": "text", "value": "C" }
            ]}
          ]}
        ]},
        { "else": true, "value": [
          { "type": "val", "value": "something" }
        ]}
      ]},
      { "type": "text", "value": "</div>" }
    ];

    var parsed = parser.parse(template);
    expect(parsed).to.eql(parsedVal);
  });

  it('should work with a string property', function() {
    var template = '<div>{{"test"}}</div>';
    var parsedVal = [
      { "type": "text", "value": "<div>" },
      { "type": "val", "value": "\"test\"" },
      { "type": "text", "value": "</div>" }
    ];
    var parsed = parser.parse(template);
    expect(parsed).to.eql(parsedVal);
  });

  it('should work with a ternary', function() {
    var template = '<div>{{a?a:"test"}}</div>';
    var parsedVal = [
      { "type": "text", "value": "<div>" },
      { "type": "if", "value": [
        { "test": "a", "value": [
          { "type": "val", "value": "a" }
        ]},
        { "else": true, "value": [
          { "type": "text", "value": "test" }
        ]}
      ]},
      { "type": "text", "value": "</div>" }
    ];
    var parsed = parser.parse(template);
    expect(parsed).to.eql(parsedVal);
  });

  it('should work with escaped properties', function() {
    var template = '<div>{{\\{test\\}}}</div>';
    var parsedVal = [
      { "type": "text", "value": "<div>" },
      { "type": "val", "value": "{test}" },
      { "type": "text", "value": "</div>" }
    ];
    var parsed = parser.parse(template);
    expect(parsed).to.eql(parsedVal);
  });

  it('should work with escaped filtered properties', function() {
    var template = '<div>{{test|json:\\{name:1\\}}}</div>';
    var parsedVal = [
      { "type": "text", "value": "<div>" },
      { "type": "val", "value": "test|json:{name:1}" },
      { "type": "text", "value": "</div>" }
    ];
    var parsed = parser.parse(template);
    expect(parsed).to.eql(parsedVal);
  });

  describe('Testing parser error conditions', function () {
    it('should throw when `if` but no `endif`', function() {
      function fn() {
        var template = '<div>{{if a}}</div>';
        var parsed = parser.parse(template);
      }

      expect(fn).to.throw(Error);
      try { fn(); } catch(ex) {
        expect(ex.message).to.equal('if without endif: {{if a}}');
      }
    });

    it('should throw when `else` but no `if`', function() {
      function fn() {
        var template = '<div>{{else}}{{endif}}</div>';
        var parsed = parser.parse(template);
      }

      expect(fn).to.throw(Error);
      try { fn(); } catch(ex) {
        expect(ex.message).to.equal('else without if: {{else}}{{endif}}</div>...');
      }
    });

    it('should throw when `else` has a parameter', function() {
      function fn() {
        var template = '<div>{{if a}}{{else b}}{{endif}}</div>';
        var parsed = parser.parse(template);
      }

      expect(fn).to.throw(Error);
      try { fn(); } catch(ex) {
        expect(ex.message).to.equal('"else" does not have paramters and must be formatted as "{{else}}": {{else b}}{{endif}}</div>...');
      }
    });

    it('should throw when `elif` but no `if`', function() {
      function fn() {
        var template = '<div>{{elif b}}{{endif}}</div>';
        var parsed = parser.parse(template);
      }

      expect(fn).to.throw(Error);
      try { fn(); } catch(ex) {
        expect(ex.message).to.equal('elif without if: {{elif b}}{{endif}}</div>...');
      }
    });

    it('should throw when `endif` but no `if`', function() {
      function fn() {
        var template = '<div>{{endif}}</div>';
        var parsed = parser.parse(template);
      }

      expect(fn).to.throw(Error);
      try { fn(); } catch(ex) {
        expect(ex.message).to.equal('endif without if: {{endif}}</div>...');
      }
    });

    it('should throw when `endif` has a parameter', function() {
      function fn() {
        var template = '<div>{{if a}}{{endif b}}</div>';
        var parsed = parser.parse(template);
      }

      expect(fn).to.throw(Error);
      try { fn(); } catch(ex) {
        expect(ex.message).to.equal('"endif" does not have paramters and must be formatted as "{{endif}}": {{endif b}}</div>...');
      }
    });

    it('should throw when missing `}}`', function() {
      function fn() {
        var template = '<div>{{val</div>';
        var parsed = parser.parse(template);
      }

      expect(fn).to.throw(Error);
      try { fn(); } catch(ex) {
        expect(ex.message).to.equal('Incorrect format. missing "}}": {{val</div>...');
      }
    });

    it('should throw when missing property `{{}}`', function() {
      function fn() {
        var template = '<div>{{}}</div>';
        var parsed = parser.parse(template);
      }

      expect(fn).to.throw(Error);
      try { fn(); } catch(ex) {
        expect(ex.message).to.equal('property is missing: {{}}</div>...');
      }
    });
  });
});
