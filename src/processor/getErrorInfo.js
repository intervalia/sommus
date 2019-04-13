var clc = require('cli-color');

var infoRe = /<anonymous>:(\d+):(\d+)\)/g;
module.exports = function getErrorInfo(code, codeFileName, ex, wasCreated) {
  var errorMessage;
  if (wasCreated) {
    errorMessage = 'Something is preventing your controller code from running:';
  }
  else {
    errorMessage = 'Something is preventing your controller code from loading:';
  }
  console.log(clc.red(errorMessage), ex);
  var fileNameLine;
  var codeLine;
  var exampleCode = "";
  var info = infoRe.exec(ex.stack);
  if (info) {
    infoRe.exec(''); // Clear the exec command
    var line = parseInt(info[1], 10)-2;
    var pos = parseInt(info[2], 10);
    var lines = code.split(/\r*\n/);
    var i = line-5;
    if( i < 0 ) {
      i = 0;
    }
    var max = line-1;
    var temp = max.toString();
    temp = temp.length+1;
    fileNameLine = codeFileName+':'+line+':'+pos;
    console.log(clc.yellow(fileNameLine));
    console.log('---------------------------------');
    for(;i <= max; i++) {
      number = (' '.repeat(temp)+(i+1)+':').substr(-temp);
      codeLine = number+(lines[i].replace(/\t/g, ' '));
      exampleCode += codeLine+'\n';
      if (i===max) {
        console.log(clc.red(codeLine));
      }
      else {
        console.log(codeLine);
      }
    }
    pos += (temp-1);
    codeLine = '_'.repeat(pos)+'↑';
    exampleCode += codeLine;
    console.log(codeLine);
  } else {
    fileNameLine = codeFileName;
    console.log(clc.yellow(fileNameLine));
    exampleCode = "Run a linter on your code to determine the problem.";
    console.log(clc.red(exampleCode));
  }

  return {
    errorMessage: errorMessage,
    ex: ex,
    fileNameLine: fileNameLine,
    exampleCode: exampleCode
  };
};
