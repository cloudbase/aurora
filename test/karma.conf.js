// Karma configuration
// Generated on 2016-04-23

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      'jasmine'
    ],
    
    preprocessors: {
      '**/*.ts': ['typescript']
    },
 
    typescriptPreprocessor: {
      // options passed to the typescript compiler 
      options: {
        sourceMap: true, // (optional) Generates corresponding .map file. 
        //target: 'ES6', // (optional) Specify ECMAScript target version: 'ES3' (default), or 'ES5' 
        module: 'amd', // (optional) Specify module code generation: 'commonjs' or 'amd' 
        noImplicitAny: false, // (optional) Warn on expressions and declarations with an implied 'any' type. 
        noResolve: false, // (optional) Skip resolution and preprocessing. 
        removeComments: true, // (optional) Do not emit comments to output. 
        concatenateOutput: false // (optional) Concatenate and emit output to single file. By default true if module option is omited, otherwise false. 
      },
      // transforming the filenames 
      transformPath: function(path) {
        return path.replace(/\.ts$/, '.js');
      }
    },

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower
      'app/scripts/**/*.ts',
      'test/mock/**/*.ts',
      'test/spec/**/*.ts'
    ],

    // list of files / patterns to exclude
    exclude: [
      'app/scripts/**/*.d.ts'
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-typescript-preprocessor'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
