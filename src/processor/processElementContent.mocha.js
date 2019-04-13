/* eslint-env mocha */
var processElementContent = require('./processElementContent');
var {expect} = require('chai');

describe('Testing processor/processElementContent.js', function () {
  it('should process an empty string', function() {
    return new Promise(function(resolve, reject) {
      var fname = 'emptyfile.htm';
      var content = '';
      var elements;

      try {
        elements = processElementContent(content, fname);
        /* jshint ignore:start */
        expect(Array.isArray(elements)).to.be.true;
        /* jshint ignore:end */
        expect(elements.length).to.equal(0);
        resolve();
      }
      catch(err) {
        console.log(err);
        reject('Exception was thrown and should not have been.');
      }
    });
  });

  it('should process empty <template> tag', function() {
    return new Promise(function(resolve, reject) {
      var fname = 'emptyfile.htm';
      var content = '<template element="empty"></template>';
      var elements;

      try {
        elements = processElementContent(content, fname);
        /* jshint ignore:start */
        expect(Array.isArray(elements)).to.be.true;
        /* jshint ignore:end */
        expect(elements.length).to.equal(1);
        var el0 = elements[0];
        expect(el0.tagName).to.equal('empty');
        expect(el0.template).to.equal('');
        expect(el0.fileName).to.equal(fname);
        resolve();
      }
      catch(err) {
        console.log('********************************************************************************************');
        console.log(err.stack);
        reject('Exception was thrown and should not have been.');
      }
    });
  });

  it('should process non-empty <template> tag', function() {
    return new Promise(function(resolve, reject) {
      var fname = 'emptyfile.htm';
      var content = "<template element='stuff'><div>Stuff</div></template>";
      var elements;

      try {
        elements = processElementContent(content, fname);
        /* jshint ignore:start */
        expect(Array.isArray(elements)).to.be.true;
        /* jshint ignore:end */
        expect(elements.length).to.equal(1);
        var el0 = elements[0];
        expect(el0.tagName).to.equal('stuff');
        expect(el0.template).to.equal('<div>Stuff</div>');
        expect(el0.styles).to.equal('');
        resolve();
      }
      catch(err) {
        console.log('********************************************************************************************');
        console.log(err.stack);
        reject('Exception was thrown and should not have been.');
      }
    });
  });

  it('should process something with `<style>` tag at the beginning', function() {
    return new Promise(function(resolve, reject) {
      var fname = 'emptyfile.htm';
      var content = "<template element='stuff'><style>.dog{background-color:#000;}</style><div>Stuff</div></template>";
      var elements;

      try {
        elements = processElementContent(content, fname);
        /* jshint ignore:start */
        expect(Array.isArray(elements)).to.be.true;
        /* jshint ignore:end */
        expect(elements.length).to.equal(1);
        var el0 = elements[0];
        expect(el0.tagName).to.equal('stuff');
        expect(el0.template).to.equal('<div>Stuff</div>');
        expect(el0.styles).to.equal('[sommus-tag="stuff"].dog, [sommus-tag="stuff"] .dog {background-color:#000;}\n\n');
        resolve();
      }
      catch(err) {
        console.log('********************************************************************************************');
        console.log(err.stack);
        reject('Exception was thrown and should not have been.');
      }
    });
  });

  it('should process something with white-space', function() {
    return new Promise(function(resolve, reject) {
      var fname = 'emptyfile.htm';
      /* jshint ignore:start */
      var content = `
      <template element='stuff'>
        <style>
        .dog {
          background-color:#000;
        }
        </style>
        <div class="dog">Stuff</div>
      </template>`;
      /* jshint ignore:end */
      var elements;

      try {
        elements = processElementContent(content, fname);
        /* jshint ignore:start */
        expect(Array.isArray(elements)).to.be.true;
        /* jshint ignore:end */
        expect(elements.length).to.equal(1);
        var el0 = elements[0];
        expect(el0.tagName).to.equal('stuff');
        expect(el0.template.trim()).to.equal('<div class="dog">Stuff</div>');
        expect(el0.styles).to.equal('[sommus-tag="stuff"].dog, [sommus-tag="stuff"] .dog {background-color:#000;}\n\n');
        resolve();
      }
      catch(err) {
        console.log('********************************************************************************************');
        console.log(err.stack);
        reject('Exception was thrown and should not have been.');
      }
    });
  });

  it('should process something with `<style>` tag at the end', function() {
    return new Promise(function(resolve, reject) {
      var fname = 'emptyfile.htm';
      var content = "<template element='stuff'><div>Stuff</div><style>.dog{background-color:#000;}</style></template>";
      var elements;

      try {
        elements = processElementContent(content, fname);
        /* jshint ignore:start */
        expect(Array.isArray(elements)).to.be.true;
        /* jshint ignore:end */
        expect(elements.length).to.equal(1);
        var el0 = elements[0];
        expect(el0.tagName).to.equal('stuff');
        expect(el0.template).to.equal('<div>Stuff</div>');
        expect(el0.styles).to.equal('[sommus-tag="stuff"].dog, [sommus-tag="stuff"] .dog {background-color:#000;}\n\n');
        resolve();
      }
      catch(err) {
        console.log('********************************************************************************************');
        console.log(err.stack);
        reject('Exception was thrown and should not have been.');
      }
    });
  });

  it('should process missing `</template>` closing tag', function() {
    var fname = 'emptyfile.htm';
    var content = '<template element="test">Inner Stuff';
    var elements;
    return new Promise(function(resolve, reject) {
      try {
        elements = processElementContent(content, fname);
        reject();
      }

      catch(ex) {
        expect(ex.message.indexOf('Closing tag `</template>` is missing:'), ex.message).to.equal(0);
        resolve();
      }
    });
  });

  it('should process missing `>` in `<template` tag', function() {
    var fname = 'emptyfile.htm';
    var content = '<template element="test"</template>';
    var elements;
    return new Promise(function(resolve, reject) {
      try {
        elements = processElementContent(content, fname);
        reject();
      }

      catch(ex) {
        expect(ex.message.indexOf('`<template>` tag is missing the closing `>`:')).to.equal(0);
        resolve();
      }
    });
  });

  it('should process missing `element` attribute', function() {
    var fname = 'emptyfile.htm';
    var content = '<template></template>';
    var elements;
    return new Promise(function(resolve, reject) {
      try {
        elements = processElementContent(content, fname);
        reject();
      }

      catch(ex) {
        expect(ex.message.indexOf('`<template>` tag is missing `element` attribute')).to.equal(0);
        resolve();
      }
    });
  });

  it('should process missing `</style>` closing tag', function() {
    var fname = 'emptyfile.htm';
    var content = '<template element="test"><style></template>';
    var elements;
    return new Promise(function(resolve, reject) {
      try {
        elements = processElementContent(content, fname);
        reject();
      }

      catch(ex) {
        expect(ex.message.indexOf('Closing tag `</style>` is missing in `test`')).to.equal(0);
        resolve();
      }
    });
  });
});
