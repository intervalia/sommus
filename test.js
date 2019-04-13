#!/usr/bin/env node
var path = require('path');
var formatStr = require('./src/util/formatStr');
var parser = require('./src/engine/parser');
var compiler = require('./src/engine/compiler');
var loader = require('./src/processor/loader');

var req, res, next;
var compiler = new compiler();
var cwd = process.cwd();
var files = {
  code: path.join(cwd,"pages/index.controller.js"),
  template: path.join(cwd,"pages/index.template.htm")
};

var dateFormatOptions = {
  "short": { year: 'numeric', month: 'numeric', day: 'numeric' },
  "long": { year: 'numeric', month: 'long', day: '2-digit' }
};

function formatDateFn(date, options) {
  var formatOptions = dateFormatOptions[options];
  if (formatOptions) {
    return (new Intl.DateTimeFormat('en', formatOptions)).format(date);
  }

  return date.toDateString();
}
compiler.addFilter("formatDate", formatDateFn);


loader.processElements(path.join(cwd,"elements"), function(elements) {
  if (elements) {
    elements.forEach(function(element) {
      compiler.defineTag(element.tagName, element.template);
    });
  }
  loader.processPage(files, compiler, req, res, next);
});


/*
'{{switch gender|uppercase}}'+
'{{case "MALE"}}'+
'{{case "FEMALE"}}'+
'{{default}}'+
'{{endswitch}}'+
*/
