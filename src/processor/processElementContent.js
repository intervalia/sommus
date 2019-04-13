var processStyles = require('./processStyles');
var OUT_LEN = 40;
var TEMPLATE_OPEN_START = '<template';
var TEMPLATE_OPEN_START_LEN = TEMPLATE_OPEN_START.length;
var TEMPLATE_OPEN_END = '>';
var TEMPLATE_OPEN_END_LEN = TEMPLATE_OPEN_END.length;
var TEMPLATE_CLOSE = '</template>';
var TEMPLATE_CLOSE_LEN = TEMPLATE_CLOSE.length;
var STYLE_OPEN = '<style>';
var STYLE_OPEN_LEN = STYLE_OPEN.length;
var STYLE_CLOSE = '</style>';
var STYLE_CLOSE_LEN = STYLE_CLOSE.length;
var elementRe = /\s+element="([^"]+)"|\s+element='([^']+)'/i;

module.exports = processElementContent;

function processElementContent(content, fileName) {
  var start;
  var end = 0;
  var styleStart;
  var styleEnd = 0;
  var tempEnd;
  var tagStart;
  var temp;
  var reVal;
  var tagName;
  var template;
  var elements = [];
  var styles;
  do {
    // TODO: 4/18/2016 - Make sure there is proper whitespace after `<template`
    start = content.indexOf(TEMPLATE_OPEN_START, end);
    if (start !== -1) {
      //console.log('found', TEMPLATE_OPEN_START);
      tagStart = start;
      start += TEMPLATE_OPEN_START_LEN;
      end = content.indexOf(TEMPLATE_OPEN_END, start);
      tempEnd = content.indexOf('<', start); // Make sure that the `>` exists before the next `<`
      if (tempEnd === -1) {
        tempEnd = content.length;
      }
      if (end !== -1 && end < tempEnd) {
        //console.log('found', TEMPLATE_OPEN_END);
        temp = content.substring(start, end);
        reVal = elementRe.exec(temp);
        if (reVal) {
          tagName = reVal[1] || reVal[2];
          //console.log('found tagName', tagName);
          start = end + TEMPLATE_OPEN_END_LEN;
          end = content.indexOf(TEMPLATE_CLOSE, start);
          if (end !== -1) {
            while(content[start] === '\n' || content[start] === '\r') {
              start++;
            }
            //console.log('found', TEMPLATE_CLOSE);
            template = content.substring(start, end);
            // Extract <style>...<.style> from template.
            styleStart = template.indexOf(STYLE_OPEN);
            if (styleStart > -1) {
              //console.log('found', STYLE_OPEN);
              temp = template.substr(0,styleStart);
              if (temp.trim().length === 0) {
                temp = "";
              }
              styleStart += STYLE_OPEN_LEN;
              styleEnd = template.indexOf(STYLE_CLOSE, styleStart);
              if (styleEnd > -1) {
                //console.log('found', STYLE_CLOSE);
                styles = template.substring(styleStart,styleEnd).trim();
                styleEnd += STYLE_CLOSE_LEN;
                while(template[styleEnd] === '\n' || template[styleEnd] === '\r') {
                  styleEnd++;
                }
                styleStart = template.substr(styleEnd);
                if (styleStart.trim().length > 0) {
                  temp += styleStart;
                }
                template = temp;
              }
              else {
                //console.log('Closing tag `</style>` is missing');

                temp = template.substr(styleStart, OUT_LEN);
                throw new Error('Closing tag `</style>` is missing in `'+tagName+'`:\n'+temp+'\n----------');
              }
            }
            elements.push({
              fileName: fileName,
              tagName: tagName,
              template: template,
              styles: processStyles(styles, tagName)
            });
            end += TEMPLATE_CLOSE_LEN;
          }
          else {
            //console.log('Closing tag `</template>` is missing');
            temp = content.substr(tagStart, OUT_LEN);
            throw new Error('Closing tag `</template>` is missing:\n'+temp+'\n----------');
          }
        }
        else {
          //console.log('`<template>` tag is missing `element` attribute');
          temp = content.substring(tagStart, end+1);
          throw new Error('`<template>` tag is missing `element` attribute:\n'+temp+'\n----------');
        }
      }
      else {
        //console.log('`<template>` tag is missing the closing `>`');
        temp = content.substr(tagStart, OUT_LEN);
        throw new Error('`<template>` tag is missing the closing `>`:\n'+temp+'\n----------');
      }
    }
  } while(start !== -1);
  return elements;
}
