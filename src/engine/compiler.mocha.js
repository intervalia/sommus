/* eslint-env mocha */
var compiler = require('./compiler');
var {expect} = require('chai');

/*
TODO:
 * comp.processSubLevel(level, dataObj, transcludeAttributes) with attributes using ', " and no quotes
 * comp.processSubLevel(level, dataObj, transcludeAttributes) without passing in data attribute
 * Improve code: comp.parseSubElements(content) with embedded javascript
 * comp.parseSubElements(content) with poorly formatted tags
 * comp.processParsed(parsed, data, transNodes, transData, attributes) to throw error
*/

describe('Testing engine/compiler.js', function () {
  it('should instantiate', function() {
    /* jshint ignore:start */
    expect(new compiler()).to.exist;
    /* jshint ignore:end */
  });

  describe('Testing decodeProperty', function () {
    it('should decode a simple property', function() {
      var comp = new compiler();
      expect(comp.decodeProperty("simple")).to.eql({val:'simple',filters:[]});
    });

    it('should decode an empty property', function() {
      var comp = new compiler();
      expect(comp.decodeProperty('')).to.eql({val:'',filters:[]});
      expect(comp.decodeProperty()).to.eql({val:undefined,filters:[]});
    });

    it('should decode a property with filter', function() {
      var comp = new compiler();
      var decoded = comp.decodeProperty("prop|html");
      expect(decoded.val).to.equal('prop');
      expect(decoded.filters[0].name).to.equal('html');
      /* jshint ignore:start */
      expect(decoded.filters[0].filter).isFunction;
      /* jshint ignore:end */
    });

    it('should decode a property with filter and options', function() {
      var comp = new compiler();
      var decoded = comp.decodeProperty("prop|json:2");
      expect(decoded.val).to.equal('prop');
      expect(decoded.filters[0].name).to.equal('json');
      expect(decoded.filters[0].options).to.equal('2');
      /* jshint ignore:start */
      expect(decoded.filters[0].filter).isFunction;
      /* jshint ignore:end */
    });

    it('should decode a list of properties', function() {
      var comp = new compiler();
      var decoded = comp.decodeProperty("prop|json:2|uppercase");
      expect(decoded.val).to.equal('prop');
      expect(Array.isArray(decoded.filters)).to.equal(true);
      expect(decoded.filters.length).to.equal(2);
      expect(decoded.filters[0].name).to.equal('json');
      expect(decoded.filters[0].options).to.equal('2');
      expect(decoded.filters[1].name).to.equal('uppercase');
      expect(decoded.filters[1].options).to.equal('');
      /* jshint ignore:start */
      expect(decoded.filters[0].filter).isFunction;
      /* jshint ignore:end */
    });

    it('should decode a property with an object as it\'s filter option and extra white space', function() {
      var comp = new compiler();
      var decoded = comp.decodeProperty(`
        prop
        |
        json:{"space":4,replacer:["two","obj","name"]}
        |
        uppercase
        `);
      expect(decoded.val).to.equal('prop');
      expect(Array.isArray(decoded.filters)).to.equal(true);
      expect(decoded.filters.length).to.equal(2);
      expect(decoded.filters[0].name).to.equal('json');
      expect(decoded.filters[0].options).to.equal('{"space":4,replacer:["two","obj","name"]}');
      expect(decoded.filters[1].name).to.equal('uppercase');
      expect(decoded.filters[1].options).to.equal('');
      /* jshint ignore:start */
      expect(decoded.filters[0].filter).isFunction;
      /* jshint ignore:end */
    });

    it('should throw exception with invalid filter', function() {
      function fn() {
        comp.decodeProperty("prop|invalid");
      }
      var comp = new compiler();
      expect(fn).to.throw(TypeError);
    });
  });

  describe('Testing getProperty', function () {
    var dataObj = {
      "ten": 10,
      "name": 'Some Person'
    };

    var lang = {
      "one": 1,
      "house": "home"
    };

    it('should get property', function() {
      var comp = new compiler(lang, false);

      var output = comp.getProperty("name", dataObj, 1);
      expect(output).to.equal(dataObj.name);
    });

    it('should get property with filter', function() {
      var comp = new compiler(lang, false);

      var output = comp.getProperty("name|uppercase", dataObj, 1);
      expect(output).to.equal(dataObj.name.toUpperCase());
    });

    it('should get property in debug mode', function() {
      var comp = new compiler(lang, true);

      var output = comp.getProperty("name", dataObj, 1);
      expect(output).to.equal(dataObj.name);
    });

    it('should get `null`, `undefined` or empty string', function() {
      var comp = new compiler(lang, false);
      expect(comp.getProperty(null, dataObj, 1)).to.equal(null);
      expect(comp.getProperty('', dataObj, 1)).to.equal('');
      expect(comp.getProperty(undefined, dataObj, 1)).to.equal(undefined);
    });

    it('should get `this`', function() {
      var comp = new compiler(lang, false);
      expect(comp.getProperty('this', dataObj, 1)).to.eql(dataObj);
    });

    it('should get lang value', function() {
      var comp = new compiler(lang, false);

      var output = comp.getProperty("lang.house", dataObj, 1);
      expect(output).to.equal(lang.house);
    });

    it('should throw exception with invalid property', function() {
      var comp = new compiler(lang, false);

      function fn() {
        comp.getProperty(")", dataObj, 1);
      }

      expect(fn).to.throw(SyntaxError);
    });
  });

  it('should add and remove a tagObj', function() {
    var comp = new compiler();
    var name = 'test1';
    var html = '<div></div>';
    var temp;

    comp.addTagObj(name, html);
    temp = comp.getTemplate(name);
    /* jshint ignore:start */
    expect(temp).to.exist;
    /* jshint ignore:end */
    expect(temp.template.parsed[0].type).to.equal('text');
    expect(temp.template.parsed[0].value).to.equal(html);

    comp.removeTagObj(name);
    temp = comp.getTemplate(name);
    /* jshint ignore:start */
    expect(temp).to.not.exist;
    /* jshint ignore:end */
  });

  it('should throw exception when adding deplucate tagObj and removing non-existent tagObj', function() {
    function addFn() {
      comp.addTagObj(name, html);
    }
    function removeFn() {
      comp.removeTagObj(name);
    }

    var comp = new compiler();
    var name = 'test1';
    var html = '<div></div>';

    addFn();
    expect(addFn).to.throw(Error);
    removeFn();
    expect(removeFn).to.throw(Error);
  });

  it('should throw exception for duplicate call to defineTag', function() {
    var comp = new compiler();
    function fn() {
      comp.defineTag('sub', '<div></div>');
    }

    fn();
    expect(fn).to.throw(Error);
  });

  describe('Testing rendering', function () {
    it('should render something simple', function() {
      var html = '<div>{{name}}: {{age}}</div>';
      var data = {
        name: "test name",
        age: 30
      };

      var comp = new compiler();
      comp.addTagObj('test', html);
      var output = comp.render('test', data);
      expect(output).to.equal('<div>test name: 30</div>');
    });

    it('should work with <!DOCTYPE html>', function() {
      var html = '<!DOCTYPE html><div>{{name}}: {{age}}</div>';
      var data = {
        name: "test name",
        age: 30
      };

      var comp = new compiler();
      comp.addTagObj('test', html);
      var output = comp.render('test', data);
      expect(output).to.equal('<!DOCTYPE html><div>test name: 30</div>');
    });

    it('should work with self closing tags', function() {
      var html = '<div>{{name}}<br/><img src="{{fileName}}"></div>';
      var data = {
        name: "test name",
        fileName: "somedir/aFile.jpg"
      };

      var comp = new compiler();
      comp.addTagObj('test', html);
      var output = comp.render('test', data);
      expect(output).to.equal('<div>test name<br/><img src="somedir/aFile.jpg"></div>');
    });

    it('should work with simple embeded javascript', function() {
      var html = '<html> <head> <script>var name = "{{name|quot}}"; var age = {{age}}; if (age < 20) {age += 20;}</script></head></html>';
      var data = {
        name: 'test "name"',
        age: 30
      };

      var comp = new compiler();
      comp.addTagObj('test', html);
      var output = comp.render('test', data);
      expect(output).to.equal('<html> <head> <script>var name = "test \\"name\\""; var age = 30; if (age < 20) {age += 20;}</script></head></html>');
    });

    it('should throw exception with empty property', function() {
      var comp = new compiler();
      function addFn() {
        comp.addTagObj('test', html);
      }
      var html = '<div>{{ }}</div>';
      var data = {
        name: "test name",
        age: 30
      };

      expect(addFn).to.throw(SyntaxError);
    });

    it('should render something with an array of data', function() {
      var html = '<div>{{name}}: {{age}}</div>';
      var data = [
        {
          name: "First Person",
          age: 30
        },
        {
          name: "Middle Person",
          age: 60
        },
        {
          name: "Last Person",
          age: 90
        }
      ];

      var comp = new compiler();
      comp.addTagObj('test', html);
      var output = comp.render('test', data);
      expect(output).to.equal('<div>First Person: 30</div><div>Middle Person: 60</div><div>Last Person: 90</div>');
    });

    it('should render something with conditionals', function() {
      var html = '<div>{{if isOld}}Old Man{{else}}Young Guy{{endif}} {{name}}: {{age}}</div>';
      var data = [
        {
          name: "Sam Spade",
          age: 90,
          isOld: true,
        },
        {
          name: "Tiny Tim",
          age: 4,
          isOld: false,
        }
      ];

      var comp = new compiler();
      comp.addTagObj('test', html);
      var output = comp.render('test', data);
      expect(output).to.equal('<div>Old Man Sam Spade: 90</div><div>Young Guy Tiny Tim: 4</div>');
    });

    describe('Testing rendering with transclusion', function () {
      it('should render with transclusion', function() {
        var html =
        '<section>'+
          // TODO: 4/18/2016 - Restore the class after fixing the code
          // The code should only add this class onto the direct children and not children of children.
          '<sub data="this">'+//' class="dogs">'+
            'Non-tag'+
            '<div id="body">This is the body</div>'+
            '<h4>End</h4>'+
            '<p class="title">title area</p>'+
          '</sub>'+
        '</section>';
        var subHtml = '<div>'+
                        '<span class="value">{{value}}</span>'+
                        '<content select=".title"></content>'+
                        '<p>Stuff in the middle</p>'+
                        '<content select=\'#body\'></content>'+
                      '</div>';
        var data = {
          value: "This is the value"
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        comp.defineTag('sub', subHtml);
        var output = comp.render('test', data);
        // TODO: 4/18/2016 - Fix the expect below
        // Once the code above is added then this needs to be altered to include `class="dogs"`.
        expect(output).to.equal('<section><div><span class="value">This is the value</span><p class="title">title area</p><p>Stuff in the middle</p><div id="body">This is the body</div></div></section>');
      });

      it('should render with transclusion but no `select` attribute', function() {
        var html =
        '<div>'+
          '<sub data="this">'+
            '<h3>title area</h3>'+
            'Non-tag info'+
            '<div>This is the body of the content</div>'+
          '</sub>'+
        '</div>';
        var subHtml = '<section>'+
                        '<p class="{{value}}">Before</p>'+
                        '<content></content>'+
                        '<p>After</p>'+
                      '</section>';
        var data = {
          value: "This is the value"
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        comp.defineTag('sub', subHtml);
        var output = comp.render('test', data);
        expect(output).to.equal('<div><section><p class="This is the value">Before</p><h3>title area</h3>Non-tag info<div>This is the body of the content</div><p>After</p></section></div>');
      });

      it('should output error comment when transclusion with invalid `select`', function() {
        var html =
        '<div>'+
          '<sub data="this">'+
            '<h3>title area</h3>'+
            '<div>This is the body of the content</div>'+
          '</sub>'+
        '</div>';
        var subHtml = '<section>'+
                        '<p class="{{value}}">Before</p>'+
                        '<content select="tagName"></content>'+
                        '<p>After</p>'+
                      '</section>';
        var data = {
          value: "This is the value"
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        comp.defineTag('sub', subHtml);
        var output = comp.render('test', data);
        expect(output).to.equal('<div><section><p class="This is the value">Before</p><!-- Transclude node not found for <content select="tagName">\nERROR: Invalid value for `select` attribute (tagName). Must be `class` (.) or `id` (#) based. --><p>After</p></section></div>');
      });

      describe('Testing transclusion with no child for `select`', function () {
        var comp;
        var html =
        '<div>'+
          '<sub data="this">'+
            '<h3>title area</h3>'+
            '<div>This is the body of the content</div>'+
          '</sub>'+
        '</div>';
        var subHtml = '<section>'+
                        '<p class="{{value}}">Before</p>'+
                        '<content select="#failure"></content>'+
                        '<p>After</p>'+
                      '</section>';
        var data = {
          value: "This is the value"
        };

        it('should output error comment not in debug mode', function() {
          var comp = new compiler();
          comp.addTagObj('test', html);
          comp.defineTag('sub', subHtml);
          var output = comp.render('test', data);
          expect(output).to.equal('<div><section><p class="This is the value">Before</p><!-- Transclude node not found for <content select="#failure"> --><p>After</p></section></div>');
        });

        it('should output error span in debug mode', function() {
          var comp = new compiler(undefined, true);
          comp.addTagObj('test', html);
          comp.defineTag('sub', subHtml);
          var output = comp.render('test', data);
          expect(output).to.equal('<div><section><p class="This is the value">Before</p><!-- Transclude node not found for <content select="#failure"> --><span class="sommus-error">Transclude node not found for &lt;content select="#failure"&gt;</span><p>After</p></section></div>');
        });
      });
    });

    describe('Testing filters', function () {
      it('should work with common filters', function() {
        var html = '<div>{{name|uppercase}}:{{name|lowercase}}:{{name|trim}}:{{name|apos}}:{{name|quot}}</div>';
        var data = {
          name: "First '\"Person  "
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        var output = comp.render('test', data);
        expect(output).to.equal('<div>FIRST \'"PERSON  :first \'"person  :First \'"Person:First \\\'"Person  :First \'\\"Person  </div>');
      });

      it('should work with HTML filter', function() {
        var html = '{{name|html}}';
        var data = {
          name: "<tag>\"Fire\" & 'Ice'</tag>"
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        var output = comp.render('test', data);
        expect(output).to.equal('&lt;tag&gt;&quot;Fire&quot; &amp; &#39;Ice&#39;&lt;&#47;tag&gt;');
      });

      it('should work with URL filter', function() {
        var html = '{{name|url}}';
        var data = {
          name: "?dog=cat&fish=\"one\"&food='taco'"
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        var output = comp.render('test', data);
        expect(output).to.equal('%3Fdog%3Dcat%26fish%3D%22one%22%26food%3D%27taco%27');
      });

      it('should work with custom filter', function() {
        var html = '{{name|mine}}';
        var data = {
          name: "This is a test"
        };
        var filterFunction = function(value, options) {
          var ret = "";

          for(i=value.length-1; i >= 0; i--) {
            ret += value[i];
          }

          return ret;
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        comp.addFilter('mine', filterFunction);
        var output = comp.render('test', data);
        expect(output).to.equal('tset a si sihT');
        comp.removeFilter('mine');
      });

      it('should throw exception if double register of custom filter', function() {
        function addFn() {
          comp.addFilter('mine', filterFunction);
        }
        function removeFn() {
          comp.removeFilter('mine');
        }
        var filterFunction = function(value) {
          return value;
        };

        var comp = new compiler();
        comp.addFilter('mine', filterFunction);
        expect(addFn).to.throw(Error);
        comp.removeFilter('mine');
        expect(removeFn).to.throw(Error);
      });

      it('should throw exception for invalid filter', function() {
        function renderFn() {
          comp.render('test', data);
        }
        var html = '{{name|invalid}}';
        var data = {
          name: "name"
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        expect(renderFn).to.throw(Error);
      });

      it('should filter JSON with no params', function() {
        var html = '{{this|json}}';
        var data = {
          one: 1,
          two: 2,
          name: "name"
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        var output = comp.render('test', data);
        expect(output).to.equal('{"one":1,"two":2,"name":"name"}');
      });

      it('should filter JSON with space param', function() {
        var html = '{{this|json:2}}';
        var data = {
          one: 1,
          two: 2,
          obj: {
            name: "name"
          }
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        var output = comp.render('test', data).replace(/\r*\n/g, "\n");
        expect(output).to.equal('{\n  "one": 1,\n  "two": 2,\n  "obj": {\n    "name": "name"\n  }\n}');
      });

      it('should filter JSON with object params', function() {
        var html = '{{this|json:\\{"space":4,replacer:["two","obj","name"]\\}}}';
        var data = {
          one: 1,
          two: 2,
          obj: {
            name: "name",
            age: 32
          }
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        var output = comp.render('test', data).replace(/\r*\n/g, "\n");
        expect(output).to.equal('{\n    "two": 2,\n    "obj": {\n        "name": "name"\n    }\n}');
      });

      it('should filter JSON with object params but using defaults', function() {
        var html = '{{this|json:\\{"dog":4\\}}}';
        var data = {
          one: 1,
          two: 2,
          obj: {
            name: "name",
            age: 32
          }
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        var output = comp.render('test', data);
        expect(output).to.equal('{"one":1,"two":2,"obj":{"name":"name","age":32}}');
      });

      it('should filter with two filters', function() {
        var html = '{{this|json:\\{"space":2,replacer:["two"]\\}|uppercase}}';
        var data = {
          one: 1,
          two: 2,
          obj: {
            name: "name",
            age: 32
          }
        };

        var comp = new compiler();
        comp.addTagObj('test', html);
        var output = comp.render('test', data).replace(/\r*\n/g, "\n");
        expect(output).to.equal('{\n  "TWO": 2\n}');
      });
    });
  });
});
