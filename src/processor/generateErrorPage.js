module.exports = function(content) {
  var stack = simpleHtmlEncode(content.ex.stack);

  return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1" />
  <title>Sommus Error Page</title>
  <style>
  .sommus-error {
    background-color: #FBB;
    border: 1px solid #800;
    padding: 16px;
  }

  .sommus-error__message {
    margin: 0;
  }

  .sommus-error__error {

  }

  .sommus-error__filename {
    font-family: monospace;
  }

  .sommus-error__section {
    font-weight: bold;
    margin: 16px 0 0;
  }

  .sommus-error__code,
  .sommus-error__stack {
    background-color: #FFF;
    border: 1px solid #AAA;
    font-weight: normal;
    margin: 0;
    padding: 8px;
  }
  </style>
</head>
<body>
  <h2>Sommus Error Page</h2>
  <div class="sommus-error">
    <p class="sommus-error__message"><strong>${content.errorMessage}</strong> <em class="sommus-error__error">${content.ex}</em></p>
    <p class="sommus-error__filename">${content.fileNameLine}</p>
    <section class="sommus-error__section">Source:
      <pre class="sommus-error__code">${content.exampleCode}</pre>
    </section>
    <section class="sommus-error__section">Exception:
      <pre class="sommus-error__stack">${stack}</pre>
    </section>
  </div></body>
</html>`;
};

var htmlEncodings = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function simpleHtmlEncode(str) {
  return str ? str.replace(/[&<>]/g, function(key) {
    return htmlEncodings[key];
  }) : str;
}
