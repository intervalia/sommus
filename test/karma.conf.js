var path = require('path');
var projectPath = path.resolve(__dirname, '..');

module.exports = function(config) {
  config.set({
    projectPath: projectPath,
    // ORDER APPEARS TO MATTER!!!
    frameworks: ['mocha', 'chai-sinon'],
    // files: ['test/test-main.js'],
    testFiles: [
      'src/**/*.js',
      'test/**/*.Test.js'
    ],

    // BEGIN code coverage reporting configuration
    reporters: ['coverage', 'progress', 'dots'],
    coverageReporter: {
      // The 'check' option allows you to set a coverage threshold for each individual coverage section. If the section does not equal or exceed the threshold value, karma will fail the run.
      check: {
        global: {
          statements: 60,
          branches: 60,
          functions: 60
        }
      },
      includeAllSources: true,
      instrumenterOptions: {
        istanbul: {
          noCompact: true,
          preserveComments: true
        }
      },
      dir : 'coverage/karma/',
      reporters: [
        // Un-comment html report if you want line-by-line detail of what is and is not covered for each file
        { type: 'html', subdir : 'html' },
        { type: 'lcovonly',  subdir: '.', file : 'lcov.txt' },
        { type: 'text',  subdir: '.', file : 'text.txt' },
        { type: 'text-summary',  subdir: '.', file : 'text-summary.txt' },
        // If you don't specify a file, output is sent to the console
        { type: 'text'},
        { type: 'text-summary'}
      ]
    }
  });
};
