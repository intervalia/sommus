/* eslint-env mocha */
var loadFile = require('./loadFile');
var path = require('path');
var { expect } = require('chai');

describe('Testing processor/loadFile.js', function () {
  it('should load a valid file', function(done) {
    var fileName = path.join(__dirname, '../../test/server/testFiles/sample.controller.js');
    loadFile(fileName).then(
      function(content) {
        expect(content).to.equal('return {\n  "init": function(req, next) {\n    next({obj:true});\n  }\n};\n');
        done();
      },
      function(err) {
        expect(false, err).to.equal(true);
        done();
      }
    );
  });

  it('should fail to load a missing file', function(done) {
    var fileName = path.join(__dirname, '../../test/server/testFiles/missing.file');
    loadFile(fileName).then(
      function(content) {
        expect(false, 'A non existant file should not have loaded.').to.equal(true);
        done();
      },
      function(err) {
        expect(err.error).to.equal('STAT_FAILED');
        done();
      }
    );
  });

  it('should fail to load a folder', function(done) {
    var fileName = path.join(__dirname, '../../test/server/testFiles');
    loadFile(fileName).then(
      function(content) {
        expect(false, 'A folder should not have loaded.').to.equal(true);
        done();
      },
      function(err) {
        expect(err.error).to.equal('NOT_A_FILE');
        done();
      }
    );
  });
});
