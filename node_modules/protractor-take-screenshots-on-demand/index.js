var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');


module.exports  = {

    screenShotDirectory:  '',

    browserNameJoiner: ' - ',

    createDirectory: function () {
        var directory = this.screenShotDirectory;
        mkdirp(directory, function(err) {
            if(err) {
                console.log('Could not create directory ' + directory);
                throw err;
            }
        });
    },

    takeScreenshot: function (name) {
        var directory = this.screenShotDirectory;
        var joiner = this.browserNameJoiner;
        function writeScreenShot (data, filename) {
            if (!fs.existsSync(directory)) {
                throw new Error('Directory does not exist ' + directory);
            }
            var stream = fs.createWriteStream(path.join(directory, filename));
            stream.write(new Buffer(data, 'base64'));
            stream.end();
        }
        return browser.takeScreenshot().then(function (png) {
            return browser.getCapabilities().then(function (capabilities) {
                var browserName = capabilities.get('browserName'),
                    filename = browserName + joiner + name + '.png';
                writeScreenShot(png, filename);
            });
        });
    }

};
