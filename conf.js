var HtmlReporter = require('protractor-beautiful-reporter');
var screenshots = require('protractor-take-screenshots-on-demand');
exports.config = {
  framework: 'jasmine',
  //seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./JSDIRECTORY/Test/createrule.js'],
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
  onPrepare: function () {
    // browser.manage().window().maximize();
    // browser.manage().timeouts().implicitlyWait(10000);
    //browser.ignoreSynchronization = true;
    jasmine.getEnv().addReporter(new HtmlReporter({
      baseDirectory: 'Report/screenshots'
    }).getJasmine2Reporter());
    //joiner between browser name and file name
    // screenshots.browserNameJoiner = ' - '; //this is the default
    // //folder of screenshots
    // screenshots.screenShotDirectory = 'target/screenshots';
    // //creates folder of screenshots
    // screenshots.createDirectory();
    /*onComplete: function async() {
      return new Promise(function (fulfill, reject) {
        var transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "",
            pass: "",
          },
        });
        var mailOptions = {
          from: "garima.kumari@frevvo.com",
          to: "garima.kumari@indexnine.com",
          subject: "Test_Report",
          text: "Test_Report of app",
          attachments: [
            {
              path:
                "D:/Quickheal/Report/screenshots/report.html"
            }   
          ],
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            reject(error);
            return console.log(error);
          }
          console.log("Mail sent: " + info.response);
          fulfill(info);
        });
      });*/
  }
}
