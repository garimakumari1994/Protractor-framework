#Protractor take screenshots on demand 
Protractor take screenshots on demand  makes screenshot in any place where it is needed

#Usage 
The protractor-take-screenshots-on-demand is available via npm:

<code>$ npm install protractor-take-screenshots-on-demand </code>


In your Protractor configuration file, register protractor-take-screenshots-on-demand 

<pre><code>
// config.js

var screenshots = require('protractor-take-screenshots-on-demand');

exports.config = {
   // ...

   // Assign the test reporter to each running instance
   onPrepare: function() {
      //joiner between browser name and file name
      screenshots.browserNameJoiner = ' - '; //this is the default
      //folder of screenshots
      screenshots.screenShotDirectory = 'target/screenshots';
      //creates folder of screenshots
      screenshots.createDirectory();

   },

}</code></pre>


In your Protractor spec file, register protractor-take-screenshots-on-demand and make screenshots

<pre><code>
// spec.js
var screenshots = require('protractor-take-screenshots-on-demand');

describe('Protractor Demo App', function() {
  it('should add one and two', function() {
    browser.get('http://juliemr.github.io/protractor-demo/');
    //take screenshots
    screenshots.takeScreenshot('name of screenshots')
    element(by.model('first')).sendKeys(1);
    element(by.model('second')).sendKeys(2);
    element(by.id('gobutton')).click();
    //take screenshots
    screenshots.takeScreenshot('name of screenshots')

    expect(element(by.binding('latest')).getText()).
        toEqual('5'); // This is wrong!
  });
});

</code></pre>



