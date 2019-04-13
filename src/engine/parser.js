var TKN_START      = '{{',        TKN_START_LEN     = TKN_START.length;
var TKN_END        = '}}',        TKN_END_LEN       = TKN_END.length;
var IF_TKN         = 'if',        IF_TKN_LEN        = IF_TKN.length;
var ELSE_TKN       = 'else',      ELSE_TKN_LEN      = ELSE_TKN.length;
var ELSEIF_TKN     = 'elif',      ELSEIF_TKN_LEN    = ELSEIF_TKN.length;
var ENDIF_TKN      = 'endif',     ENDIF_TKN_LEN     = ENDIF_TKN.length;
var SWITCH_TKN     = 'switch',    SWITCH_TKN_LEN    = SWITCH_TKN.length;
var ENDSWITCH_TKN  = 'endswitch', ENDSWITCH_TKN_LEN = ENDSWITCH_TKN.length;
var CASE_TKN       = 'case',      CASE_TKN_LEN      = CASE_TKN.length;
var DEFAULT_TKN    = 'default',   DEFAULT_TKN_LEN   = DEFAULT_TKN.length;
//var regexVariable = /\{\{((?:[^{}]*|\\[{}])+)\}\}/g

/*
 * Support for: if, elif, else and endif
 * Also for {{var?ifVal:elseVal}} which is a shortcut for
 * {{if var}}ifVal{{else}}elseVal{{endif}}
 *   if `ifVal` and `elseVal` are in quotes then they are
 *   treated as text otherwise they are treated as a variable
 *
 * TODO: 2015/02/23
 * Add switch/endswitch/case in addition to if, elif, else and endif
 */


/**
 * function: parseSource
 * Parse a source string into a compiled object structure.
 * Including if, else, elif, endif, text and value items
 */
function parseSource(source, fileName) {
  var tempVal;
  var tempTkn;
  var tempIndex;
  var tempEnd;
  var currentPos = 0;
  var tknStart = 0;
  var currentIf;
  var ifList = [];
  var currentNodeList = [];
  var parsed = [];
  var currentNode = parsed;

  function addTextNode(str) {
    /* istanbul ignore else */
    if (str) {
      var node = { 'type': 'text', 'value': str };
      currentNode.push(node);
    }
  }

  function addIfNode(value) {
    var node = { 'test': value, 'value': [] };
    currentNodeList.push(currentNode);
    currentNode = node.value;
    ifList.push(currentIf = []);
    currentIf.push(node);
  }

  function addElIfNode(value) {
    if (ifList.length === 0) {
      throw new SyntaxError('elif without if: ' + source.substr(tknStart-2, 50) + '...');
    }
    var node = { 'test': value, 'value': [] };
    currentNode = node.value;
    currentIf.push(node);
  }

  function addElseNode() {
    if (ifList.length === 0) {
      throw new SyntaxError('else without if: ' + source.substr(tknStart-2, 50) + '...');
    }
    var node = { 'else': true, 'value': [] };
    currentNode = node.value;
    currentIf.push(node);
  }

  function addEndIfNode() {
    if (ifList.length === 0) {
      throw new SyntaxError('endif without if: ' + source.substr(tknStart-2, 50) + '...');
    }
    var node = { 'type': 'if', 'value': currentIf };
    currentNode = currentNodeList.pop();
    currentNode.push(node);
    ifList.pop();
    var ifLen = ifList.length;
    if (ifLen) {
      currentIf = ifList[ifLen - 1];
    }
  }

  function addValueNode(property) {
    if (property) {
      currentNode.push({ 'type': 'val', 'value': property });
    }
    else {
      throw new SyntaxError('property is missing: ' + source.substr(tknStart-2, 50) + '...');
    }
  }

  function addTextOrValue(tempVal) {
    var quote = tempVal[0];
    var lastChar = tempVal.slice(-1);
    if ((quote === '"' || quote === "'" || quote === '`') && lastChar === quote) {
      tempVal = tempVal.slice(1,-1);
      addTextNode(tempVal);
    }
    else {
      addValueNode(tempVal);
    }
  }

  function processValue(value) {
    // TODO: This is not very stable.
    // I need to change it to properly parse with escaped quotes
    // And only find the `:` outside of a quoted string.
    var indexQ = value.indexOf('?');
    var indexC = value.indexOf(':');
    if (indexQ > -1 && indexC > indexQ) {
      var parts = value.split('?');
      addIfNode(parts[0].trim());
      parts = parts[1].split(':');
      addTextOrValue(parts[0].trim());
      addElseNode();
      addTextOrValue(parts[1].trim());
      addEndIfNode();
    }
    else {
      addValueNode(value);
    }
  }

  if (source) {
    while (true) {
      tknStart = source.indexOf(TKN_START, currentPos);
      if (tknStart === -1) {
        // Copy source to end of string
        addTextNode(source.substr(currentPos));
        var ifLen = ifList.length;
        if (ifLen) {
          var temp = ifList[ifLen-1];
          temp = temp[temp.length-1];
          throw new SyntaxError('if without endif: {{if '+temp.test+'}}');
        }
        break;
      }

      if (currentPos !== tknStart) {
        // Copy source to start of next token
        tempVal = source.substring(currentPos, tknStart);
        addTextNode(tempVal);
      }

      // Process a command
      tknStart += TKN_START_LEN;
      tempIndex = tknStart;
      // Check for predefined tokens, if, elif, else and endif
      while(true) {
        var chr = source[tempIndex];
        if (chr < 'a' || chr > 'z' )
          break;

        tempIndex++;
      }

      tempTkn = source.substring(tknStart, tempIndex);
      tempEnd = tempIndex;
      while(true) {
        tempEnd = source.indexOf(TKN_END, tempEnd);
        if (tempEnd === -1) {
          throw new SyntaxError('Incorrect format. missing \"}}\": ' + source.substr(tknStart-2, 50) + '...');
        }

        if (source[tempEnd-1] !== '\\' ) {
          break;
        }

        tempEnd++;
      }

      tempVal = source.substring(tempIndex, tempEnd).trim();

      switch (tempTkn) {
        case IF_TKN:
          addIfNode(tempVal);
          break;

        case ELSE_TKN:
          if (tempVal) {
            throw new SyntaxError('"else" does not have paramters and must be formatted as "{{else}}": ' + source.substr(tknStart-2, 50) + '...');
          }
          addElseNode();
          break;

        case ELSEIF_TKN:
          addElIfNode(tempVal);
          break;

        case ENDIF_TKN:
          if (tempVal) {
            throw new SyntaxError('"endif" does not have paramters and must be formatted as "{{endif}}": ' + source.substr(tknStart-2, 50) + '...');
          }
          addEndIfNode();
          break;

        default:
          // Process a value
          tempVal = source.substring(tknStart, tempEnd).trim();
          tempVal = tempVal.replace(/\\[{}]/g, function(val) {
            return val[1];
          });

          processValue(tempVal);
          break;
      }

      currentPos = tempEnd + TKN_END_LEN;
    }
  }

  return parsed;
}

module.exports = {
  parse: parseSource
};
