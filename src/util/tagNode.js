function tagNode(name, value, children, closedtag) {
  this.type = "tag";
  this.name = name;
  this.value = value;
  this.children = children;
  this.closedTag = closedtag;
}

module.exports = tagNode;
