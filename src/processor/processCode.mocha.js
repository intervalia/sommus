/* eslint-env mocha */
var processCode = require('./processCode');
var fs = require('fs');
var path = require('path');
var {expect} = require('chai');

describe('Testing processor/processCode.js', function () {
  it('should process simple code file', function() {
    var fileName = path.join(__dirname, '../../test/server/testFiles/processCode.sample1.js');
    var code = fs.readFileSync(fileName, {'encoding':'utf8'});
    var process = processCode(code, 'processCode.sample1.js');
    expect(process.init).isFunction;
    expect(process.finish).isFunction;
  });

  it('should use default init or finish', function() {
    var code = "return {};";
    var process = processCode(code, 'nofilename.js');
    expect(process.init).isFunction;
    expect(process.finish).isFunction;
    expect(process.init.name).to.equal('defaultInit');
    expect(process.finish.name).to.equal('defaultFinish');
    expect(process.init({}, function(data) {
      expect(data).to.eql({});
    }));
  });

  it('should use default init or finish with no code', function() {
    var code = "";
    var process = processCode(code, 'nofilename.js');
    expect(process.init).isFunction;
    expect(process.finish).isFunction;
    expect(process.init.name).to.equal('defaultInit');
    expect(process.finish.name).to.equal('defaultFinish');
    expect(process.init({}, function(data) {
      expect(data).to.eql({});
    }));
  });

  it('should handle require', function() {
    var fileName = path.join(__dirname, '../../test/server/testFiles/processCode.sample3.js');
    var code = fs.readFileSync(fileName, {'encoding':'utf8'});
    var process = processCode(code, fileName);
    process.init({}, function(data) {
      expect(data.animal).to.exist;
      expect(data.animal.cat).to.be.true;
      expect(data.animal.dog).to.be.false;
      expect(data.animal.name).to.equal("Fluffy");
      expect(data.path).to.exist;
      expect(data.path.basename).isFunction;
    });
  });

  it('should throw error when code is bad', function() {
    function fn() {
      var code = "asd();";
      processCode(code, 'nofilename.js');
    }

    expect(fn).to.throw;
    try {
      fn();
    }

    catch(ex) {
      expect(ex.status).to.equal(500);
      expect(ex.errorInfo.errorMessage).to.equal('Something is preventing your controller code from running:');
    }
  });

  describe('Testing init and finish with processCode.sample1.js', function () {
    var process;
    var req = {};
    beforeEach(function() {
      var fileName = path.join(__dirname, '../../test/server/testFiles/processCode.sample1.js');
      var code = fs.readFileSync(fileName, {'encoding':'utf8'});
      process = processCode(code, 'processCode.sample1.js')
    });

    it('should process init and return data', function() {
      process.init(req, function(data) {
        expect(data.sample).to.equal(true);
        expect(data.name).to.equal("Someone else");
        expect(data.age).to.equal(123);
      });
    });

    it('should process default finish and return data', function() {
      var html = '<div>This is a test</div>';
      process.finish(req, html, function(result) {
        expect(result).to.equal(html);
      });
    });
  });

  describe('Testing init and finish with processCode.sample2.js', function () {
    var process;
    var req = {
      path: "This is the path"
    };
    beforeEach(function() {
      var fileName = path.join(__dirname, '../../test/server/testFiles/processCode.sample2.js');
      var code = fs.readFileSync(fileName, {'encoding':'utf8'});
      process = processCode(code, 'processCode.sample1.js');
    });

    it('should process init and return data', function() {
      process.init(req, function(data) {
        expect(data.path).to.equal(req.path);
      });
    });

    it('should process default finish and return data', function() {
      var html = '<div>This is a test</div>';
      var htmlB = '>vid/<tset a si sihT>vid<';
      process.finish(req, html, function(result) {
        expect(result).to.equal(htmlB);
      });
    });
  });
});
