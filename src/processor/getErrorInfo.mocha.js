/* eslint-env mocha */
var getErrorInfo = require('./getErrorInfo');
var {expect} = require('chai');

describe('Testing processor/getErrorInfo.js', function () {
  it('should work while loading', function() {
    var code = 'sample code\nline2\nline3\nline4\nline5\nline6\nThis is the line with an `error`\nline8\nline9\nline10';
    var codeFileName = 'myFileName';
    var ex = {
      stack: 'dhsalkjdlkasjdlkasj <anonymous>:9:26)\ndklsajdkjasdjaslkjdl\ndhjsakhdjashdkjas'
    };
    var wasCreated = false;

    var errInfo = getErrorInfo(code, codeFileName, ex, wasCreated);
    expect(errInfo.errorMessage).to.equal('Something is preventing your controller code from loading:');
    expect(errInfo.fileNameLine).to.equal(codeFileName+":7:26");
    expect(errInfo.exampleCode).to.equal('3:line3\n4:line4\n5:line5\n6:line6\n7:This is the line with an `error`\n___________________________↑');
  });

  it('should work while running', function() {
    var code = 'sample code\nline2\nThis is the `error`';
    var codeFileName = 'newFile';
    var ex = {
      stack: '(Something <anonymous>:5:13)'
    };
    var wasCreated = true;

    var errInfo = getErrorInfo(code, codeFileName, ex, wasCreated);
    expect(errInfo.errorMessage).to.equal('Something is preventing your controller code from running:');
    expect(errInfo.fileNameLine).to.equal(codeFileName+":3:13");
    expect(errInfo.exampleCode).to.equal('1:sample code\n2:line2\n3:This is the `error`\n______________↑');
  });

  it('should work without proper file line/char', function() {
    var code = 'sample code\nline2\nThis is the `error`';
    var codeFileName = 'file3.js';
    var ex = {
      stack: 'Some stack info'
    };
    var wasCreated = true;

    var errInfo = getErrorInfo(code, codeFileName, ex, wasCreated);
    expect(errInfo.errorMessage).to.equal('Something is preventing your controller code from running:');
    expect(errInfo.fileNameLine).to.equal(codeFileName);
    expect(errInfo.exampleCode).to.equal('Run a linter on your code to determine the problem.');
  });
});
