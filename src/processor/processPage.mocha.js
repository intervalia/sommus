/* eslint-env mocha */
var processPage = require('./processPage');
var Compiler = require('../engine/compiler');
var path = require('path');
var {assert, expect} = require('chai');

describe('Testing processor/processPage.js', function () {
  it('should process an HTML template', function(done) {
    var count = { status: 0, send: 0, end: 0 };
    var files = {
      template: path.join(__dirname, "../../test/server/testFiles/processPage/test1.template.htm"),
      code: path.join(__dirname, "../../test/server/testFiles/processPage/test1.controller.js")
    };
    var compiler = new Compiler();
    var req = {};
    var res = {
      status: function(code) {
        expect(code).to.equal(200);
        count.status++;
      },
      send: function(str) {
        expect(str.trim()).to.equal('<div>Test Name</div>');
        count.send++;
      },
      end: function() {
        count.end++;
        expect(count.status).to.equal(1);
        expect(count.send).to.equal(1);
        expect(count.end).to.equal(1);
        done();
      }
    };

    return processPage(files, compiler, req, res, function next() {
      assert.fail('next should not have been called');
      done();
    });
  });

  it('should process a JSON template', function(done) {
    var count = { header: 0, status: 0, send: 0, end: 0 };
    var files = {
      template: path.join(__dirname, "../../test/server/testFiles/processPage/test1.template.json"),
      code: path.join(__dirname, "../../test/server/testFiles/processPage/test1.controller.js")
    };
    var compiler = new Compiler();
    var req = {};
    var res = {
      setHeader: function(header, value) {
        expect(header).to.equal('Content-Type');
        expect(value).to.equal('application/json');
        count.header++;
      },
      status: function(code) {
        expect(code).to.equal(200);
        count.status++;
      },
      send: function(str) {
        expect(str).to.equal('{\n  "name": "Test Name",\n  "value": "This is a \\"test\\""\n}\n');
        count.send++;
      },
      end: function() {
        count.end++;
        expect(count.header).to.equal(1);
        expect(count.status).to.equal(1);
        expect(count.send).to.equal(1);
        expect(count.end).to.equal(1);
        done();
      }
    };

    return processPage(files, compiler, req, res, function next() {
      assert.fail('next should not have been called');
      done();
    });
  });

  it('should handle bad JS load time error', function(done) {
    var count = { status: 0, send: 0, end: 0 };
    var files = {
      template: path.join(__dirname, "../../test/server/testFiles/processPage/test1.template.htm"),
      code: path.join(__dirname, "../../test/server/testFiles/processPage/bad.js.loading.js")
    };
    var compiler = new Compiler();
    var req = {};
    var code;
    var result;
    var res = {
      status: function(_code) {
        code = _code;
        count.status++;
      },
      send: function(str) {
        result = str;
        count.send++;
      },
      end: function() {
        count.end++;
        setTimeout(doExpects, 10);
      }
    };
    function doExpects() {
      expect(code).to.equal(500);
      expect(result.indexOf('SyntaxError: Unexpected token {'), 'invalid error page returned').to.not.equal(-1);
      expect(count.status).to.equal(1);
      expect(count.send).to.equal(1);
      expect(count.end).to.equal(1);
      done();
    }

    return processPage(files, compiler, req, res, function next() {
      assert.fail('next should not have been called');
      done();
    });
  });

  it('should handle bad JS runtime error', function(done) {
    var count = { status: 0, send: 0, end: 0 };
    var files = {
      template: path.join(__dirname, "../../test/server/testFiles/processPage/test1.template.htm"),
      code: path.join(__dirname, "../../test/server/testFiles/processPage/bad.js.running.js")
    };
    var compiler = new Compiler();
    var req = {};
    var code;
    var result;
    var res = {
      status: function(_code) {
        code = _code;
        count.status++;
      },
      send: function(str) {
        result = str;
        count.send++;
      },
      end: function() {
        count.end++;
        setTimeout(doExpects, 10);
      }
    };
    function doExpects() {
      expect(code).to.equal(500);
      expect(result.indexOf('ReferenceError: nexter is not defined'), 'invalid error page returned').to.not.equal(-1);
      expect(count.status).to.equal(1);
      expect(count.send).to.equal(1);
      expect(count.end).to.equal(1);
      done();
    }

    return processPage(files, compiler, req, res, function next() {
      assert.fail('next should not have been called');
      done();
    });
  });

  it('should not process a missing template file', function(done) {
    var files = {
      template: path.join(__dirname, "../../test/server/testFiles/processPage/missing.template.htm"),
      code: path.join(__dirname, "../../test/server/testFiles/processPage/test1.controller.js")
    };
    var compiler = {
      processParsed: function() {
        assert.fail('compiler.processParsed should not have been called');
        done();
      }
    };
    var req = {};
    var res = {
      status: function(code) {
        assert.fail('res.status should not have been called');
      },
      send: function(str) {
        assert.fail('res.send should not have been called');
      },
      end: function() {
        assert.fail('res.end should not have been called');
      }
    };

    return processPage(files, compiler, req, res, function next() {
      // This is where we should end up.
      done();
    });
  });

  it('should not process a bad template file', function(done) {
    var files = {
      template: path.join(__dirname, "../../test/server/testFiles/processPage/bad.template.htm"),
      code: path.join(__dirname, "../../test/server/testFiles/processPage/test1.controller.js")
    };
    var compiler = {
      processParsed: function() {
        assert.fail('compiler.processParsed should not have been called');
        done();
      }
    };
    var req = {
      hideDevMessages: true
    };
    var res = {
      status: function(code) {
        assert.fail('res.status should not have been called');
      },
      send: function(str) {
        assert.fail('res.send should not have been called');
      },
      end: function() {
        assert.fail('res.end should not have been called');
      }
    };

    return processPage(files, compiler, req, res, function next() {
      // This is where we should end up.
      done();
    });
  });

  it('should not process a missing code file', function(done) {
    var count = { status: 0, send: 0, end: 0 };
    var files = {
      template: path.join(__dirname, "../../test/server/testFiles/processPage/test1.template.htm"),
      code: path.join(__dirname, "../../test/server/testFiles/processPage/missing.controller.js")
    };
    var compiler = new Compiler();
    var req = {};
    var res = {
      status: function(code) {
        expect(code).to.equal(200);
        count.status++;
      },
      send: function(str) {
        expect(str.trim()).to.equal('<div>undefined</div>');
        count.send++;
      },
      end: function() {
        count.end++;
        expect(count.status).to.equal(1);
        expect(count.send).to.equal(1);
        expect(count.end).to.equal(1);
        done();
      }
    };

    return processPage(files, compiler, req, res, function next() {
      // This is where we should end up.
      done();
    });
  });

  it('should handle setting req.hideDevMessages', function(done) {
    var count = { status: 0, send: 0, end: 0 };
    var files = {
      template: path.join(__dirname, "../../test/server/testFiles/processPage/test1.template.htm"),
      code: path.join(__dirname, "../../test/server/testFiles/processPage/bad.js.running.js")
    };
    var compiler = new Compiler();
    var req = {
      hideDevMessages: true
    };
    var res = {
      status: function(code) {
        assert.fail('res.status should not have been called');
      },
      send: function(str) {
        assert.fail('res.send should not have been called');
      },
      end: function() {
        assert.fail('res.end should not have been called');
      }
    };

    return processPage(files, compiler, req, res, function next() {
      // This is where we should end up.
      done();
    });
  });
});
