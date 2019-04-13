/* eslint-env mocha */
var formatStr = require('./formatStr');
var {expect} = require('chai');

var obj = {
  name: "Some Person",
  age: 45,
  gender: "MALE",
  height: "5'10\"",
  isLiving: true
};

describe('Testing util/formatStr.js', function () {

  describe('test using arguments', function () {
    it('should handle arguments', function() {
      expect(formatStr("test {0} {1} {0}", "zero", "one")).to.equal("test zero one zero");
      expect(formatStr("test {0} {1} {2} {3}", "A", "b", "C", "d", "E")).to.equal("test A b C d");
      expect(formatStr("{0} {1} {2} {3} {4} {5} {6} {7} {8} {9} {10} {11} {12} {13}",0,1,2,3,4,5,6,7,8,9,10,11,12,13,14)).to.equal("0 1 2 3 4 5 6 7 8 9 10 11 12 13");
    });

    it('should properly handle missing arguments', function() {
      expect(formatStr("test {0} {1} {2}", "zero", "one")).to.equal("test zero one {2}");
    });
  });

  describe('test using object', function () {
    it('should handle an object', function() {
      expect(formatStr("{name} is {age}-years-old", obj)).to.equal("Some Person is 45-years-old");
      expect(formatStr("{gender} {height} {isLiving}", obj)).to.equal("MALE 5'10\" true");
    });

    it('should properly handle missing arguments', function() {
      expect(formatStr("{gender} {ThisIsNotThere} {name}", obj)).to.equal("MALE {ThisIsNotThere} Some Person");
      expect(formatStr("{name:'test',age:10}", obj)).to.equal("{name:'test',age:10}");
    });
  });

  it('should should not fail on empty strings', function() {
    expect(formatStr("")).to.equal("");
    expect(formatStr(0)).to.equal(0);
    expect(formatStr(null)).to.equal(null);
    expect(formatStr()).to.equal(undefined);
  });

});
