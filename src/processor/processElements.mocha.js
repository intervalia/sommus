/* eslint-env mocha */
var processElements = require('./processElements');
var path = require('path');
var {expect} = require('chai');

describe('Testing processor/processElements.js', function () {
  it('should process a folder', function() {
    var testData = {
      'elements-1-a': {
        template: '  <div>This is the `elements-1-a` element</div>\n',
        found: false
      },
      'elements-1-b': {
        template: '  <b>This is the `elements-1-b` element</b>\n',
        found: false
      },
      'elements-2-a': {
        template: '  <div>This is the `elements-2-a` element</div>\n',
        found: false
      },
      'elements-2-b': {
        template: '  <b>This is the `elements-2-b` element</b>\n',
        found: false
      }
    };

    return new Promise(function(resolve, reject) {
      var elementPath = path.join(__dirname, '../../test/server/testFiles/testElements1');
      processElements(elementPath).then(
        function(elements) {
          expect(Array.isArray(elements)).to.be.true;
          expect(elements.length).to.equal(4);
          elements.forEach(function(element) {
            var td = testData[element.tagName];
            expect(td.found, 'Duplicate tagName: '+element.tagName).to.be.false;
            td.found = true;
            expect(element.template).to.equal(td.template);
          });
          resolve();
        }
      );
    });
  });

  it('should process a file', function() {
    return new Promise(function(resolve, reject) {
      var elementPath = path.join(__dirname, '../../test/server/testFiles/testElements2/elements1.htm');
      processElements(elementPath).then(
        function(elements) {
          expect(Array.isArray(elements)).to.be.true;
          expect(elements.length).to.equal(2);
          var el0 = elements[0];
          var el1 = elements[1];
          expect(el0.tagName).to.equal('elements-1-a');
          expect(el0.template).to.equal('  <div>`elements-1-a`</div>\n');
          expect(el0.fileName).to.equal(elementPath);
          expect(el1.tagName).to.equal('elements-1-b');
          expect(el1.template).to.equal('  <b>"elements-1-b"</b>\n');
          expect(el1.fileName).to.equal(elementPath);
          resolve();
        }
      );
    });
  });

  it('should throw exception processing a missing path', function() {
    return new Promise(function(resolve, reject) {
      var elementPath = path.join(__dirname, '../../test/server/testFiles/testElementsMissing');
      processElements(elementPath).then(
        function(elements) {
          reject("path should not have been found");
        },
        function(err) {
          console.log(err);
          resolve();
        }
      );
    });
  });

  it('should process an empty file', function() {
    return new Promise(function(resolve, reject) {
      var elementPath = path.join(__dirname, '../../test/server/testFiles/testElements2/element.emptyfile.htm');
      processElements(elementPath).then(
        function(elements) {
          expect(Array.isArray(elements)).to.be.true;
          expect(elements.length).to.equal(0);
          resolve();
        },
        function(err) {
          console.log(err);
          reject('Reject was called and should not have been.');
        }
      );
    });
  });

  it('should process a file with empty element', function() {
    return new Promise(function(resolve, reject) {
      var elementPath = path.join(__dirname, '../../test/server/testFiles/testElements2/element.empty.htm');
      processElements(elementPath).then(
        function(elements) {
          expect(Array.isArray(elements)).to.be.true;
          expect(elements.length).to.equal(1);
          var el0 = elements[0];
          expect(el0.tagName).to.equal('empty');
          expect(el0.template).to.equal('');
          expect(el0.fileName).to.equal(elementPath);
          resolve();
        },
        function(err) {
          console.log(err);
          reject('Reject was called and should not have been.');
        }
      );
    });
  });

  it('should process missing closing tag', function() {
    return new Promise(function(resolve, reject) {
      var elementPath = path.join(__dirname, '../../test/server/testFiles/testElements2/missing.close.tag.htm');
      processElements(elementPath).then(
        function(elements) {
          reject('Resolve was called and should not have been.');
        },
        function(err) {
          resolve();
        }
      );
    });
  });

  it('should process missing `>` in `<template` tag', function() {
    return new Promise(function(resolve, reject) {
      var elementPath = path.join(__dirname, '../../test/server/testFiles/testElements2/missing.gt.htm');
      processElements(elementPath).then(
        function(elements) {
          reject('Resolve was called and should not have been.');
        },
        function(err) {
          resolve();
        }
      );
    });
  });

  it('should process missing `element` attribute', function() {
    return new Promise(function(resolve, reject) {
      var elementPath = path.join(__dirname, '../../test/server/testFiles/testElements2/missing.element.attr.htm');
      processElements(elementPath).then(
        function(elements) {
          reject('Resolve was called and should not have been.');
        },
        function(err) {
          resolve();
        }
      );
    });
  });
});
