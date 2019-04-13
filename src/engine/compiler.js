(function() {
  var htmlEncode = require('../util/htmlEncode');
  var urlEncode = require('../util/urlEncode');
  var escape = require('../util/escape');
  var tagNode = require('../util/tagNode');
  var tagObj = require('./tagObject');
  var FILTER_MATCH = /\|\s*([a-zA-Z]+)(\s*\:\s*(\S+)){0,1}$/;
  var NAME_REG_EX = /^<(\/{0,1})([^\s\/>=]+)/;
  var ATTRIBUTE_REG_EX = /\s+([^\s\/>"'=\u0000]+)(=\s*('([^']*)'|"([^"]*)"|([^\s"'`=<>]+)))?/g;
  var CONTENT_TAG_REG_EX = /<content\s+select=("([^"]+)"|'([^']+)')>\s*<\/content>|<content\s*[^>]*><\/content>/;
  var LITERAL_KEYS = ['0','1','2','3','4','5','6','7','8','9','-','+','"',"'","`",'!'];
  var filterList = {
    'apos':       function(value) { return escape(value, "'"); },
    'html':       function(value) { return htmlEncode(value); },
    'json':       jsonFilter,
    'lowercase':  function(value) { return value.toLowerCase(); },
    'quot':       function(value) { return escape(value, '"'); },
    'trim':       function(value) { return value.trim(); },
    'uppercase':  function(value) { return value.toUpperCase(); },
    'url':        function(value) { return urlEncode(value); }
  };
  var validFilters = Object.keys(filterList).sort();
  var officialSelfClosingTags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

  // {{variable|json:2}}
  function jsonFilter(value, options) {
    var replacer = null;
    var space = 0;
    if (typeof options === 'object') {
      space = options.space || 0;
      replacer = options.replacer || null;
    }
    else {
      space = options || 0;
    }
    return JSON.stringify(value, replacer, space);
  }

  function compiler(lang, debug) {
    this.debug = !!debug;
    this.lang = lang || {};
    this.templateList = {};
  }

  compiler.prototype.getTemplate = function(key) {
    return this.templateList[key];
  };

  // Add a tag object to the list of tag objects
  compiler.prototype.addTagObj = function(tagName, template) {
    if (this.templateList[tagName]) {
      throw new Error('Duplicate template for tag: '+tagName);
    }

    var obj = new tagObj(tagName, template);
    this.templateList[tagName] = obj;
    return this;
  };

  // Add a tag object to the list of tag objects
  compiler.prototype.removeTagObj = function(tagName) {
    if (!this.templateList[tagName]) {
      throw new Error('Tag does not exist: '+tagName);
    }

    delete this.templateList[tagName];
    return this;
  };

  compiler.prototype.defineTag = function(tagName, template) {
    if (this.templateList.hasOwnProperty(tagName)) {
      throw new Error('`'+tagName+'` Already defined. Can not call defineTag twice');
    }
    else {
      this.addTagObj(tagName, template);
    }

    return this;
  };

  compiler.prototype.render = function(tag, data) {
    var tagObject = this.getTemplate(tag);
    return this.processParsed(tagObject.template.parsed, data);
  };

  compiler.prototype.addFilter = function(name, filterFunction) {
    if(!filterList.hasOwnProperty(name)) {
      filterList[name] = filterFunction;
      validFilters = Object.keys(filterList).sort();
    }
    else {
      throw new Error('The filter `'+name+'` already exists and can not be added again.');
    }

    return this;
  };

  compiler.prototype.removeFilter = function(name) {
    if(filterList.hasOwnProperty(name)) {
      delete filterList[name];
      validFilters = Object.keys(filterList).sort();
    }
    else {
      throw new Error('The filter `'+name+'` did not exist and can not be be removed.');
    }

    return this;
  };

  /* function: decodeProperty
   *
   * Decodes properties to indicate if the value needs to be encoded or escaped
   *
   * parameters:
   *    prop - The property to be decoded. The routine checks for the property
   *           to be wrapped in single quotes, double quotes or "<" and ">"
   */
  compiler.prototype.decodeProperty = function compiler_decodeProperty(property) {
    var start, end = 0, pos, temp, newFilter;
    if (typeof property === "string") {
      property = property.trim();
    }
    var retVal = {
      'val': property,
      'filters': []
    };


    if (property) {
      // TODO: 2016/05/06 - Do I need to skip escaped | ('\|')
      start = property.indexOf('|', end);
      if (start === -1) {
        retVal.val = property;
      }
      else {
        retVal.val = property.substring(0,start).trim();
        start++;
        do {
          end = property.indexOf('|', start);
          if (end === -1) {
            temp = property.substring(start);
          }
          else {
            temp = property.substring(start, end);
            start = end+1;
          }

          newFilter = {
            name: '',
            options: ''
          };

          pos = temp.indexOf(':');
          if (pos === -1) {
            newFilter.name = temp.trim();
          }
          else {
            newFilter.name = temp.substring(0,pos).trim();
            newFilter.options = temp.substring(pos+1).trim();
          }

          if (validFilters.indexOf(newFilter.name) > -1) {
            newFilter.filter = filterList[newFilter.name];
            retVal.filters.push(newFilter);
          }
          else {
            throw new TypeError('Unsupported filter type: ('+newFilter.name+')');
          }

        } while(end !== -1);
      }
    }


    return retVal;
  };

  function getValueOfProperty(property, dataObj, lang, index, debug) {
    "use strict";
    var code;
    var getValFn;

    if (property === undefined || property === null || property === '') {
      return property;
    }

    if (debug) {
      code = 'with(this){return('+property+')}';
    }
    else {
      code = 'var ret;with(this){try{ret=('+property+')}catch(ex){}return ret}';
    }

    try {
      /*jslint evil: true */
      getValFn = new Function('lang, $index', code);
      /*jslint evil: false */
    }

    catch(ex) {
      console.error("Exception while trying to get the property `"+property+"`.");
      console.error("Code:", code);
      throw ex;
    }

    // Pass dataObj as 'this', lang as 'lang' and index as 'index'.
    // Data must be passed as 'this' to allow return(this) to return the correct value
    return getValFn.call(dataObj, lang, index);
  }

  /* function: getProperty
   *
   * Convert a key into a property of the 'data' or 'lang' objects
   *
   * parameters:
   *       key - Key in the 'data' object
   *      data - Data object containing properties
   *     index - Index within an array of 'data'.
   *
   * Html Encoding or string escaping is done based on the incoming key
   *  If the key is wrapped in "<" and ">" the return value is Html Encoded.
   *  If the key is wrapped in single quotes or double quotes the return
   *   value is escaped.
   */
  compiler.prototype.getProperty = function compiler_getProperty(key, dataObj, index) {
    var parts, i;
    var value = dataObj;

    var decoded = this.decodeProperty(key);

    value = getValueOfProperty(decoded.val, dataObj, this.lang, index, this.debug);

    decoded.filters.forEach(function(filter) {
      value = filter.filter(value, getValueOfProperty(filter.options, dataObj, this.lang, 0, this.debug));
    });

    return value;
  };

  function getAttribute(node, attr) {
    var re = new RegExp('\\s+'+attr+'\\s*=\\s*(\'([^\']*)\'|"([^"]*)")');
    var temp = re.exec(node);
    if (temp) {
      return temp[2] || temp[3];
    }

    return '';
  }

  function getAttributes(node) {
    //console.log('getAttributes('+node+')');
    var temp, attr, value, obj;
    var attributes = {};
    do {
      temp = ATTRIBUTE_REG_EX.exec(node);
      if (temp) {
        attr = temp[7] || temp[1];
        value = temp[5] || temp[6] || temp[8];
        attributes[attr] = value;
      }
    } while(temp);

    return attributes;
  }

  function buildNode(node, attributes, transcludeAttributes) {
    var existingKeys = {};
    Object.keys(attributes).forEach(function(attrKey) {
      existingKeys[attrKey.toUpperCase()] = attrKey;
    });

    var newNode = '<'+node.name;
    Object.keys(transcludeAttributes).forEach(function(tAttrKey) {
      var uTAttrKey = tAttrKey.toUpperCase();
      var realKey = existingKeys[uTAttrKey];
      if (realKey) {
        attributes[realKey] += ' '+transcludeAttributes[tAttrKey];
      }
      else {
        if (transcludeAttributes[tAttrKey] === undefined) {
          console.error(tAttrKey+' was undefined');
        }
        attributes[tAttrKey] = transcludeAttributes[tAttrKey];
        existingKeys[uTAttrKey] = tAttrKey;
      }
    });

    Object.keys(attributes).forEach(function(attrKey) {
      var value = attributes[attrKey];
      newNode += ' '+attrKey;
      if (value !== undefined) {
        newNode += '="'+value+'"';
      }
    });

    newNode += '>';

    return newNode;
  }

  compiler.prototype.processSubLevel = function(level, dataObj, transcludeAttributes) {
    var output = '';
    var attributes;
    var subElement;
    var _this = this;

    if (level.length > 0) {
      level.forEach(function(node) {
        var dataAttr;
        if (node instanceof tagNode) {
          attributes = getAttributes(node.value);
          subElement = _this.templateList[node.name];

          if (subElement) {
            //console.log('subElement:', node.name);
            if (attributes.data) {
              dataAttr = attributes.data;
              delete attributes.data;
            }
            else {
              dataAttr = '';
            }

            var subData = _this.getProperty(dataAttr, dataObj, 1);
            output += _this.processParsed(subElement.template.parsed, subData, node.children, dataObj, attributes);
          }
          else {
            //console.log('node:', node.name);
            if (transcludeAttributes) {
              output += buildNode(node, attributes, transcludeAttributes);
            }
            else {
              output += node.value;
            }

            if (node.children) {
              output += _this.processSubLevel(node.children, dataObj);
            }

            if (!node.closedTag) {
              output += '</'+node.name+'>';
            }
          }
        }
        else {
          output += node;
        }
      });
    }

    return output;
  };

  compiler.prototype.processSubElements = function(content, dataObj, attributes) {
    var structure = this.parseSubElements(content);
    return this.processSubLevel(structure, dataObj, attributes);
  };

  compiler.prototype.parseSubElements = function(content) {
    var output = '';
    var structure = [];
    var depth = [structure];
    var node = structure;
    var contentLen = content.length;
    var currentPos, startPos, endPos, temp, closedtag, name, items;
    var newNode;

    currentPos = 0;
    while(currentPos < contentLen) {
      startPos = content.indexOf('<', currentPos);
      while(startPos !== -1) {
        temp = content.substr(startPos+1, 1);
        if (temp === '!' || /[\s=]/.test(temp)) {
          // Skip an XML comment or assumed javascript
          startPos = content.indexOf('<', startPos+4);
        }
        else {
          break;
        }
      }

      if (startPos === -1) {
        // We have reached the end of the string.
        node.push(content.substr(currentPos));
        break;
      }
      else {
        if (currentPos !== startPos) {
          node.push(content.substring(currentPos, startPos));
        }
      }

      endPos = content.indexOf('>', startPos)+1;
      if (endPos === 0) {
        throw new SyntaxError('Missing ">" character.');
      }

      temp = content.substring(startPos, endPos);
      items = NAME_REG_EX.exec(temp);
      if(items === null || !items[2]) {
        throw new SyntaxError('Tags must have a name.');
      }

      name = items[2].toLowerCase();
      closedtag = (temp.slice(-2) === '/>') || officialSelfClosingTags.indexOf(name) !== -1;
      // TODO: Rework to push the existing node and then create a new node.
      //       Then we can do: `node = depth.pop();``
      newNode = null;
      if (!closedtag) {
        if (items[1] === '/') {
          if (depth.length > 1) {
            depth.pop();
          }
          node = depth[depth.length-1];
        }
        else {
          newNode = [];
          depth.push(newNode);
        }
      }

      if (items[1] !== '/') {
        node.push(new tagNode(name, temp, newNode, closedtag));
      }

      if (newNode) {
        node = newNode;
      }

      currentPos = endPos;
    }

    //console.log("structure: %o", structure);
    return structure;
  };

  function findNodeById(nodes, key) {
    var re = new RegExp('id\\s*=\\s*(\''+key+'\'|"'+key+'")');
    var foundNode = false;
    nodes.some(function(node) {
      if (node instanceof tagNode) {
        if (node.value.match(re)) {
          foundNode = node;
          return true;
        }
      }
    });

    return foundNode;
  }

  function findNodesByClass(nodes, key) {
    var attr;
    var classList;
    var foundNodes = [];
    nodes.some(function(node) {
      if (node instanceof tagNode) {
        classList = getAttribute(node.value, 'class').split(/\s+/);
        if (classList.indexOf(key) > -1) {
          foundNodes.push(node);
        }
      }
    });

    return foundNodes.length ? foundNodes : false;
  }

  compiler.prototype.transclude = function(content, transNodes, transData, attributes) {
    var nodes, error, res, select, childContent = "";

    if (transNodes) {
      while(true) {
        nodes = error = undefined;
        res = CONTENT_TAG_REG_EX.exec(content);
        if (res) {
          select = res[2] || res[3];
          if (select) {
            // Copy the requested, if any, part into this position
            if (select[0] === '#') {
              nodes = findNodeById(transNodes, select.substr(1));
              if (nodes) {
                nodes = [nodes];
              }
            }
            else if(select[0] === '.') {
              nodes = findNodesByClass(transNodes, select.substr(1));
            }
            else {
              error = 'Invalid value for `select` attribute ('+select+'). Must be `class` (.) or `id` (#) based.';
            }

            if (nodes) {
              childContent = this.processSubLevel(nodes, transData, attributes);
            }
            else {
              childContent = "<!-- Transclude node not found for <content select=\""+select+"\">";
              if (error) {
                childContent += "\nERROR: "+error;
              }
              childContent += " -->";
              if (this.debug) {
                childContent += '<span class="sommus-error">Transclude node not found for &lt;content select="'+select+'"&gt;</span>';
              }
            }
          }
          else {
            // Copy all of the children into this position
            childContent = this.processSubLevel(transNodes, transData, attributes);
          }

          content = content.replace(new RegExp(res[0], "g"), childContent);
        }
        else {
          break;
        }
      };
    }

    return content;
  };

  /* function: processParsed
   *
   * Process the incoming parsed object (inParsed) and return the processed string
   *
   * parameters:
   *    inParsed - incoming parsed object to be processed
   *        data - An object that contains the values to be insert into the parsed content
   *  transNodes - An array of child nodes that is used for translusion.
   *   transData -
   *  attributes -
   */
  compiler.prototype.processParsed = function compiler_processParsed(parsed, data, transNodes, transData, attributes) {
    var returnContent = '';
    var _this = this;

    /* function: prop
     *
     * Convert a key into a property of the 'data' object
     * parameters:
     *       key - Property 'key' in the 'data' object
     */
    function prop(key, index, data) {
      return _this.getProperty(key, data, index);
    }

    function processIf(conditions, index, data) {
      var retVal = '';
      var l = conditions.length;

      for (var i = 0; i < l; i++) {
        var obj = conditions[i];
        var test = (obj.else) ? true : prop(obj.test, index, data);

        if (test) {
          retVal += processLevel(obj.value, index, data);
          break;
        }
      }

      return retVal;
    }

    function processLevel(level, index, data) {
      var obj, retVal = '', i, l = level.length;

      for (i = 0; i < l; i++) {
        obj = level[i];
        switch (obj.type) {
          case 'text':
            retVal += obj.value;
            break;

          case 'if':
            retVal += processIf(obj.value, index, data);
            break;

          case 'val':
            retVal += prop(obj.value, index, data);
            break;

          default:
            throw new ReferenceError('Unknown command: ' + obj.type);
        }
      }

      return retVal;
    }

    data = data || {};

    if (parsed.length) {
      if (Array.isArray(data)) {
        var dal = data.length;
        returnContent = '';

        for (var ii = 0; ii < dal; ii++) {
          returnContent += this.processSubElements(processLevel(parsed, ii, data[ii]), data[ii], attributes);
        }
      }
      else {
        returnContent += this.processSubElements(processLevel(parsed, 1, data), data, attributes);
      }
    }

    if (transNodes) {
      returnContent = this.transclude(returnContent, transNodes, transData, attributes);
    }

    return returnContent;
  };

  module.exports = compiler;
})();
