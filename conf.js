//var HtmlReporter = require('protractor-beautiful-reporter');
//var screenshots = require('protractor-take-screenshots-on-demand');
var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var reporter = new HtmlScreenshotReporter({
  dest: 'target/screenshots',
  filename: 'my-report.html'
});

exports.config = {
  framework: 'jasmine',
  //seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./JSDIRECTORY/Test/quickheal.js'],
  params:
  {
    environment: 'Staging',
    client: 'Client1'
  },
  // capabilities: {
  //   'browserName': 'internet explorer',
  //   'javascriptEnabled': true,
  //   'version': '11',
  //   'nativeEvents': false,
  //   'ignoreZoomSetting': true,
  //   //  shardTestFiles: true,
  //   //  maxInstances: 2,
  // },
  capabilities: {
    'browserName': 'chrome'
  },
  // Options to be passed to Jasmine-node.
 // allScriptsTimeout: 30000000,
  //getPageTimeout: 30000000,
  //highlightDelay: 10,
  jasmineNodeOpts:
  {
    showColors: true,
    //defaultTimeoutInterval: 30000000,
    isVerbose: true
  },

  beforeLaunch: function() {
    return new Promise(function(resolve){
      reporter.beforeLaunch(resolve);
    });
  },

  // Assign the test reporter to each running instance
  onPrepare: async ()=> {
   await browser.waitForAngularEnabled(false);
   await jasmine.getEnv().addReporter(reporter);
   var AllureReporter = require('jasmine-allure-reporter');
    jasmine.getEnv().addReporter(new AllureReporter({
      resultsDir: 'allure-results'
    }));
  },

  // Close the report after all tests finish
  afterLaunch: function(exitCode) {
    return new Promise(function(resolve){
      reporter.afterLaunch(resolve.bind(this, exitCode));
    });
  }
  //onPrepare: function () {
    // browser.manage().window().maximize();
    // browser.manage().timeouts().implicitlyWait(10000);
    //browser.ignoreSynchronization = true;
    //jasmine.getEnv().addReporter(new HtmlReporter({
     // baseDirectory: 'Report/screenshots'
    //}).getJasmine2Reporter());
    //joiner between browser name and file name
    // screenshots.browserNameJoiner = ' - '; //this is the default
    // //folder of screenshots
    // screenshots.screenShotDirectory = 'target/screenshots';
    // //creates folder of screenshots
    // screenshots.createDirectory();
    
  //},
  
    
}

