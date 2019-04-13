var OUT_LEN = 40;

module.exports = processStyles;

function processStyles(styles, tagName) {
  var processedStyles = "";
  var start = 0, end, rule;

  if(styles) {
    styles = cleanAndSimplify(styles);

    do {
      end = styles.indexOf('}', start);
      if(end !== -1) {
        rule = styles.substring(start, ++end);
        processedStyles += prependOneRule(rule, tagName);
        start = end;
      }
      else {
        processedStyles += styles.substr(start).trim();
      }
    } while (end !== -1);
  }

  return processedStyles;
}


function prependOneRule(rule, tagName) {
  var pos, newRule = "", temp;
  var selectors, styles;

  pos = rule.indexOf('{');
  if (pos !== -1) {
    selectors = rule.substring(0,pos).split(',');
    styles = rule.substr(pos).trim();
    newRule += processSelectors(selectors, tagName);
    newRule += styles+'\n\n';
  }
  else {
    temp = rule.substr(0, OUT_LEN);
    throw new Error('Open curly brace `{` missing from rule:\n'+temp+'\n----------');
  }

  return newRule;
}

function processSelectors(selectors, tagName) {
  var newSelectors = [];
  var tagSelector = '[sommus-tag="'+tagName+'"]';
  selectors.forEach(function(selector) {
    selector = selector.trim();
    newSelectors.push(tagSelector+selector);
    newSelectors.push(tagSelector+' '+selector);
  });

  return newSelectors.join(', ')+' ';
}

function cleanAndSimplify(styles) {
  var pos, len, inComment = false, chr;
  var cleanStyles = "";
  // TODO: Should the following line be simplified to speed it up?
  styles = styles.trim();
  len = styles.length;
  for(pos = 0; pos < len; pos++) {
    chr = styles[pos];
    if (inComment) {
      if (chr === '*' && styles[pos+1] === '/') {
        pos++;
        inComment = false;
      }
      chr = null;
    }
    else {
      if (chr === '/' && styles[pos+1] === '*') {
        pos++;
        chr = null;
        inComment = true;
      }
    }

    if(chr) {
      cleanStyles += chr;
    }
  }
  return cleanStyles.replace(/\s+/g, ' ').replace(/([:;{}])\s+/g, '$1');
}
