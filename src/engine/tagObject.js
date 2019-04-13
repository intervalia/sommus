var parser = require("./parser");

function tagObj(tagName, template) {
  if (!(tagName && typeof tagName === "string")) {
    throw new Error("tagName must be a string at least one character long.");
  }

  template = template || "";
  this.tagName = tagName;
  this.attrs = {
    "combine": ["class"],
    "exclude": [],
    "rename": []
  };
  this.template = {
    "source": template,
    "parsed": parser.parse(template)
  };
}

module.exports = tagObj;
