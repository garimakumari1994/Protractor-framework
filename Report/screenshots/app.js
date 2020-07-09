var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    }
    else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    }
    else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};


//</editor-fold>

app.controller('ScreenshotReportController', function ($scope, $http) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime){
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }

    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };

    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };

    var results = [
    {
        "description": "Login To Application and Select Client|Open Application",
        "passed": false,
        "pending": false,
        "sessionId": "4439e74231e83d2f0379e9b0d13d7cf0",
        "instanceId": 7560,
        "browser": {
            "name": "chrome"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, //input[@id='username'])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, //input[@id='username'])\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as sendKeys] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as sendKeys] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at LoginPage.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Pages\\LoginPage.js:126:69)\n    at step (D:\\Frevvo_POM\\JSDIRECTORY\\Pages\\LoginPage.js:46:23)\n    at Object.next (D:\\Frevvo_POM\\JSDIRECTORY\\Pages\\LoginPage.js:27:53)\n    at fulfilled (D:\\Frevvo_POM\\JSDIRECTORY\\Pages\\LoginPage.js:18:58)\nFrom: Task: Run it(\"Login To Application and Select Client\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\LoginTest.js:48:5)\n    at addSpecsToSuite (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\LoginTest.js:43:1)\n    at Module._compile (internal/modules/cjs/loader.js:959:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\n    at Module.load (internal/modules/cjs/loader.js:815:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://www.way2automation.com/assets/js/custom.min.js 24:925 Uncaught TypeError: Cannot read property 'length' of null",
                "timestamp": 1590848653601,
                "type": ""
            }
        ],
        "screenShotFile": "008e0087-00a5-00a4-0014-000800dc0066.png",
        "timestamp": 1590848647837,
        "duration": 16888
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "83a320f6725fb207a94648c2e3bf6339",
        "instanceId": 10360,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "004a00af-002e-0001-00d3-004800850013.png",
        "timestamp": 1593504339814,
        "duration": 13642
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": false,
        "pending": false,
        "sessionId": "5541bd50c15fe22a87393a8bcb9c525f",
        "instanceId": 8776,
        "browser": {
            "name": "chrome"
        },
        "message": [
            "Expected 'http://qh-internal.indexnine.com/#/login' to be 'http://qh-internal.indexnine.com/'."
        ],
        "trace": [
            "Error: Failed expectation\n    at D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:11:25\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)"
        ],
        "browserLogs": [],
        "screenShotFile": "007c006b-00bd-000c-007e-00ca000a003c.png",
        "timestamp": 1593504676133,
        "duration": 13604
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "60f24697ddf64939210623784bcef292",
        "instanceId": 3596,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00130097-0011-000d-0027-000c00800016.png",
        "timestamp": 1593504772243,
        "duration": 14648
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "529944d3680960a2ee817a11c68e3349",
        "instanceId": 20728,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593505423069,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593505423125,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593505423184,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593505423211,
                "type": ""
            }
        ],
        "screenShotFile": "00c500b1-00d6-00d9-009f-00ad00790060.png",
        "timestamp": 1593505416579,
        "duration": 14291
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": false,
        "pending": false,
        "sessionId": "fab70b89811fbc4dc4318cf2a7bc299d",
        "instanceId": 8948,
        "browser": {
            "name": "chrome"
        },
        "message": [
            "Failed: Cannot read property 'ver' of null"
        ],
        "trace": [
            "TypeError: Cannot read property 'ver' of null\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\browser.js:714:56\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom: Task: Run it(\"should display login page\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:7:5)\n    at addSpecsToSuite (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:5:1)\n    at Module._compile (internal/modules/cjs/loader.js:959:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\n    at Module.load (internal/modules/cjs/loader.js:815:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)"
        ],
        "browserLogs": [],
        "timestamp": 1593505730896,
        "duration": 9339
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "5f6b06eecab3d8bb3e9b65ff424b4c54",
        "instanceId": 12832,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593506016583,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593506016639,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593506016711,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593506016737,
                "type": ""
            }
        ],
        "screenShotFile": "00d80041-0024-00c7-00c6-00bc008f00e3.png",
        "timestamp": 1593506007823,
        "duration": 16905
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "a625b708cbe9a7b04c823ccde0a65850",
        "instanceId": 5680,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593507565605,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593507565652,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593507565712,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593507565750,
                "type": ""
            }
        ],
        "screenShotFile": "00e200f7-0094-00d7-006a-006d00aa0066.png",
        "timestamp": 1593507559473,
        "duration": 15528
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "32eb9e1cd9e6c63cfe753cc255f4da7c",
        "instanceId": 19684,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593507960613,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593507960723,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593507960811,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593507960842,
                "type": ""
            }
        ],
        "screenShotFile": "00030023-0098-000d-00d3-00ee00d10049.png",
        "timestamp": 1593507953869,
        "duration": 16276
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": false,
        "pending": false,
        "sessionId": "5d25cae804044654ca300387cc0f8b07",
        "instanceId": 14160,
        "browser": {
            "name": "chrome"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, //input[@class='form-control ng-pristine ng-invalid ng-touched'])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, //input[@class='form-control ng-pristine ng-invalid ng-touched'])\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as sendKeys] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as sendKeys] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:13:67\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom: Task: Run it(\"should display login page\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:8:5)\n    at addSpecsToSuite (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:5:1)\n    at Module._compile (internal/modules/cjs/loader.js:959:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\n    at Module.load (internal/modules/cjs/loader.js:815:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593508024051,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508024142,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508024230,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508024259,
                "type": ""
            }
        ],
        "screenShotFile": "004800cd-000c-00ab-005b-006700c100c3.png",
        "timestamp": 1593508013833,
        "duration": 18008
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": false,
        "pending": false,
        "sessionId": "8934b9fdefa3445b4af93fb57ce480cc",
        "instanceId": 22456,
        "browser": {
            "name": "chrome"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, //input[@class='form-control ng-pristine ng-invalid ng-touched'])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, //input[@class='form-control ng-pristine ng-invalid ng-touched'])\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as sendKeys] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as sendKeys] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:13:22\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom: Task: Run it(\"should display login page\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:8:5)\n    at addSpecsToSuite (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:5:1)\n    at Module._compile (internal/modules/cjs/loader.js:959:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\n    at Module.load (internal/modules/cjs/loader.js:815:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593508228573,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508228650,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508228728,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508228797,
                "type": ""
            }
        ],
        "screenShotFile": "003b00af-0022-009a-0034-0000003d00b3.png",
        "timestamp": 1593508222676,
        "duration": 18940
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": false,
        "pending": false,
        "sessionId": "4990e63c1296f8e1fcd1939a4165e9cd",
        "instanceId": 21080,
        "browser": {
            "name": "chrome"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, //input[@class='form-control ng-pristine ng-invalid ng-touched'])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, //input[@class='form-control ng-pristine ng-invalid ng-touched'])\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as sendKeys] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as sendKeys] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:53:51\n    at step (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:33:23)\n    at Object.next (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:14:53)\n    at fulfilled (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:5:58)\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom: Task: Run it(\"should display login page\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:44:5)\n    at addSpecsToSuite (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:41:1)\n    at Module._compile (internal/modules/cjs/loader.js:959:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\n    at Module.load (internal/modules/cjs/loader.js:815:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593508481839,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508481933,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508482037,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508482065,
                "type": ""
            }
        ],
        "screenShotFile": "00800027-00e1-00da-00db-0052002000a3.png",
        "timestamp": 1593508474903,
        "duration": 15160
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": false,
        "pending": false,
        "sessionId": "81879cf2f73698f383ce2fd4c8208f46",
        "instanceId": 18736,
        "browser": {
            "name": "chrome"
        },
        "message": [
            "Failed: No element found using locator: By(xpath, //input[@class='form-control ng-pristine ng-invalid ng-touched'])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(xpath, //input[@class='form-control ng-pristine ng-invalid ng-touched'])\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as sendKeys] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as sendKeys] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:54:51\n    at step (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:33:23)\n    at Object.next (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:14:53)\n    at fulfilled (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:5:58)\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)\nFrom: Task: Run it(\"should display login page\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:44:5)\n    at addSpecsToSuite (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:41:1)\n    at Module._compile (internal/modules/cjs/loader.js:959:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\n    at Module.load (internal/modules/cjs/loader.js:815:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593508634987,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508635164,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508635360,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593508635390,
                "type": ""
            }
        ],
        "screenShotFile": "001000b8-0045-0093-00f8-002f00280051.png",
        "timestamp": 1593508629422,
        "duration": 27384
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "e3a075fb4b2a56a8b8bf86475e5d17e1",
        "instanceId": 19140,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593513695876,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593513696185,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593513696410,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593513696434,
                "type": ""
            }
        ],
        "screenShotFile": "000400d9-008b-00c0-00f0-00bc00d60054.png",
        "timestamp": 1593513690176,
        "duration": 25609
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "d6ee10abb2795c102f7ccc671e36fa57",
        "instanceId": 10940,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593590617462,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593590617528,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593590617599,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593590617619,
                "type": ""
            }
        ],
        "screenShotFile": "00ef007d-008a-0065-005e-00b8006000cf.png",
        "timestamp": 1593590610825,
        "duration": 25978
    },
    {
        "description": "admin successfully  logged in   |workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "d6ee10abb2795c102f7ccc671e36fa57",
        "instanceId": 10940,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "0067007b-0092-0012-0055-00bb006c0005.png",
        "timestamp": 1593590639065,
        "duration": 325
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": false,
        "pending": false,
        "sessionId": "bff8e33b061b55a5dcf85ee79177a1a2",
        "instanceId": 9440,
        "browser": {
            "name": "chrome"
        },
        "message": [
            "Expected 'http://qh-internal.indexnine.com/#/login' to equal 'http://qh-internal.indexnine.com/#/login323'."
        ],
        "trace": [
            "Error: Failed expectation\n    at D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:55:37\n    at step (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:33:23)\n    at Object.next (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:14:53)\n    at fulfilled (D:\\Frevvo_POM\\JSDIRECTORY\\Test\\quickheal.js:5:58)\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593590701751,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593590701879,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593590702075,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593590702116,
                "type": ""
            }
        ],
        "screenShotFile": "0013009a-00ac-00d9-00ff-0008002600f5.png",
        "timestamp": 1593590695350,
        "duration": 26288
    },
    {
        "description": "admin successfully  logged in   |workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "bff8e33b061b55a5dcf85ee79177a1a2",
        "instanceId": 9440,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "000200e3-0038-00b0-00e6-0080006c001a.png",
        "timestamp": 1593590722297,
        "duration": 416
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "46ef106aeb2845d2b802e7b602b2036f",
        "instanceId": 20368,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593591002321,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593591002413,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593591002519,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593591007421,
                "type": ""
            }
        ],
        "screenShotFile": "00ae00aa-008c-0057-00d2-003b00a30099.png",
        "timestamp": 1593590991425,
        "duration": 26491
    },
    {
        "description": "admin successfully  logged in   |workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "46ef106aeb2845d2b802e7b602b2036f",
        "instanceId": 20368,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00a5008b-0029-00b5-00c3-004100d8000c.png",
        "timestamp": 1593591018468,
        "duration": 517
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "7d571c74b5f24909ad09b61723ba7f17",
        "instanceId": 14804,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593679794522,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593679794596,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593679794647,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593679794677,
                "type": ""
            }
        ],
        "screenShotFile": "00e100bd-0029-009a-00f6-008300d5002a.png",
        "timestamp": 1593679789491,
        "duration": 24574
    },
    {
        "description": "admin successfully  logged in   |workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "7d571c74b5f24909ad09b61723ba7f17",
        "instanceId": 14804,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00a90041-000e-002a-0023-006600750085.png",
        "timestamp": 1593679817969,
        "duration": 1437
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "1a65dc6cc815d70ac1165fd50008376e",
        "instanceId": 6276,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593682473775,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593682473867,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593682473923,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593682473964,
                "type": ""
            }
        ],
        "screenShotFile": "0060002b-0056-00d6-00a5-0096005b00d1.png",
        "timestamp": 1593682464675,
        "duration": 21080
    },
    {
        "description": "admin successfully  logged in   |workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "1a65dc6cc815d70ac1165fd50008376e",
        "instanceId": 6276,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "004b000a-0062-0017-002a-00f000e70013.png",
        "timestamp": 1593682486471,
        "duration": 1467
    },
    {
        "description": "should display login page|workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "59ad35bec1e6df5659b7cebae1bdf7a6",
        "instanceId": 19244,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "https://www.google.com/ads/ga-audiences?v=1&aip=1&t=sr&_r=4&tid=UA-118965717-4&cid=240700733.1593693625&jid=1240372474&_v=j83&z=710395517 - Failed to load resource: net::ERR_CONNECTION_CLOSED",
                "timestamp": 1593693625402,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.google.com/ads/ga-audiences?v=1&aip=1&t=sr&_r=4&tid=UA-118965717-3&cid=240700733.1593693625&jid=1645081071&_v=j83&z=1994853978 - Failed to load resource: net::ERR_CONNECTION_CLOSED",
                "timestamp": 1593693625402,
                "type": ""
            },
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593693630576,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593693630680,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593693630781,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593693630798,
                "type": ""
            }
        ],
        "screenShotFile": "0064005f-00d7-00e1-0036-004b006c0054.png",
        "timestamp": 1593693621315,
        "duration": 21382
    },
    {
        "description": "admin successfully  logged in   |workspace-project App",
        "passed": true,
        "pending": false,
        "sessionId": "59ad35bec1e6df5659b7cebae1bdf7a6",
        "instanceId": 19244,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00b00050-0082-00d7-00a3-008e00760019.png",
        "timestamp": 1593693643715,
        "duration": 1798
    },
    {
        "description": "Verify rule is created successfully for Light Theme",
        "passed": false,
        "pending": false,
        "sessionId": "a8e24b69057ac61959d39755398e5eeb",
        "instanceId": 15436,
        "browser": {
            "name": "chrome"
        },
        "message": [
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.",
            "Failed: No element found using locator: By(xpath, //*[@id=\"noty_bar_aab289ff-c483-453b-8bc4-707997a79539\"]/div[1]/span[2])"
        ],
        "trace": [
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)",
            "NoSuchElementError: No element found using locator: By(xpath, //*[@id=\"noty_bar_aab289ff-c483-453b-8bc4-707997a79539\"]/div[1]/span[2])\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (internal/process/task_queues.js:93:5)Error\n    at ElementArrayFinder.applyAction_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\built\\element.js:831:22)\n    at D:\\Quickheal\\JSDIRECTORY\\Test\\createrule.js:84:137\n    at step (D:\\Quickheal\\JSDIRECTORY\\Test\\createrule.js:33:23)\n    at Object.next (D:\\Quickheal\\JSDIRECTORY\\Test\\createrule.js:14:53)\n    at D:\\Quickheal\\JSDIRECTORY\\Test\\createrule.js:8:71\n    at new Promise (<anonymous>)\n    at __awaiter (D:\\Quickheal\\JSDIRECTORY\\Test\\createrule.js:4:12)\n    at UserContext.<anonymous> (D:\\Quickheal\\JSDIRECTORY\\Test\\createrule.js:57:80)\nFrom: Task: Run it(\"Verify rule is created successfully for Light Theme\") in control flow\n    at UserContext.<anonymous> (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError\n    at Object.<anonymous> (D:\\Quickheal\\JSDIRECTORY\\Test\\createrule.js:57:1)\n    at Module._compile (internal/modules/cjs/loader.js:959:30)\n    at Object.Module._extensions..js (internal/modules/cjs/loader.js:995:10)\n    at Module.load (internal/modules/cjs/loader.js:815:32)\n    at Function.Module._load (internal/modules/cjs/loader.js:727:14)\n    at Module.require (internal/modules/cjs/loader.js:852:19)\n    at require (internal/modules/cjs/helpers.js:74:18)\n    at C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine\\lib\\jasmine.js:93:5\n    at Array.forEach (<anonymous>)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593773140280,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593773140379,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593773140632,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593773145523,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593773155907&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593773183710,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593773155907&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593773183710,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593773183710,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder/create-rule - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593773190404,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1 - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593773190404,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593773190405,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593773200907&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593773204880,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593773200907&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593773204880,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593773204881,
                "type": ""
            }
        ],
        "screenShotFile": "00280075-0072-00d6-004b-00ab00920001.png",
        "timestamp": 1593773130332,
        "duration": 74780
    },
    {
        "description": "Verify rule is created successfully for Light Theme",
        "passed": false,
        "pending": false,
        "sessionId": "ab6cfbfab9193244670907bd01d66458",
        "instanceId": 21692,
        "browser": {
            "name": "chrome"
        },
        "message": [
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL."
        ],
        "trace": [
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)",
            "Error: Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.\n    at Timeout._onTimeout (C:\\Users\\Garima\\AppData\\Roaming\\npm\\node_modules\\protractor\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4281:23)\n    at listOnTimeout (internal/timers.js:531:17)\n    at processTimers (internal/timers.js:475:7)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593777520185,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593777520352,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593777520626,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593777529964,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593777544694&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593777571890,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593777544694&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593777571890,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593777571896,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder/create-rule - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593777578226,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1 - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593777578226,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593777578227,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593777591410&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593777594256,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593777591410&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593777594256,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593777594262,
                "type": ""
            }
        ],
        "screenShotFile": "003900fc-00e7-0031-007a-00f7006f005c.png",
        "timestamp": 1593777509409,
        "duration": 84738
    },
    {
        "description": "Verify rule is created successfully for Light Theme",
        "passed": true,
        "pending": false,
        "sessionId": "d339079ad776cf6a64bfe8b35ca41d68",
        "instanceId": 12376,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593777931718,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593777931884,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593777931983,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593777942389,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593777957125&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593777958512,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593777957125&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593777958512,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593777958533,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder/create-rule - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593777959788,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1 - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593777959788,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593777959788,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593777970622&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593777971887,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593777970622&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593777971887,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593777971888,
                "type": ""
            }
        ],
        "screenShotFile": "008a00fa-0011-00ef-009e-0029002e0025.png",
        "timestamp": 1593777920165,
        "duration": 52463
    },
    {
        "description": "Verify rule is created successfully for Light Theme",
        "passed": true,
        "pending": false,
        "sessionId": "d40b67ff5934500c559801f090188aee",
        "instanceId": 18328,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1593778351672,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593778352082,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14102 Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593778352285,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/assets/mxgraph/css/common.css - Failed to load resource: the server responded with a status of 404 (Not Found)",
                "timestamp": 1593778352306,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593778369879&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593778371189,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593778369879&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593778371190,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593778371191,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder/create-rule - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593778371739,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1 - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593778371739,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593778371740,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593778375793&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1593778376998,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1593778375793&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1593778376998,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1593778376998,
                "type": ""
            }
        ],
        "screenShotFile": "003b009e-00f9-006d-00cf-008e00e0007b.png",
        "timestamp": 1593778345333,
        "duration": 31832
    },
    {
        "description": "Verify rule is created successfully for Light Theme",
        "passed": true,
        "pending": false,
        "sessionId": "40664181b5f12c25b7044527d435bf7a",
        "instanceId": 21920,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1594290993216,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594291016750&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594291018095,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594291016750&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594291018095,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594291018098,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder/create-rule - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594291018517,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1 - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594291018517,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594291018518,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594291023516&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594291024708,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594291023516&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594291024708,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594291024709,
                "type": ""
            }
        ],
        "screenShotFile": "00ec0016-00c2-0064-000c-00ba00d100de.png",
        "timestamp": 1594290986529,
        "duration": 38526
    },
    {
        "description": "Verify rule is created successfully for Light Theme",
        "passed": true,
        "pending": false,
        "sessionId": "7a1c642dabae60a5ba305a8c0e866d24",
        "instanceId": 13808,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1594300141749,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594300163660&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594300164965,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594300163660&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594300164965,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594300164980,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder/create-rule - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594300165360,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1 - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594300165362,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594300165378,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594300171155&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594300172471,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594300171155&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594300172471,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594300172471,
                "type": ""
            }
        ],
        "screenShotFile": "00330065-00ad-008a-0095-00e9006e00b7.png",
        "timestamp": 1594300134181,
        "duration": 38752
    },
    {
        "description": "Verify rule is created successfully for Light Theme",
        "passed": true,
        "pending": false,
        "sessionId": "734641f21a6286789374fc971b164df9",
        "instanceId": 8468,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1594301365854,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301387883&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594301389135,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301387883&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594301389135,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594301389135,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder/create-rule - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594301389574,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1 - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594301389574,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594301389575,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301395418&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594301396585,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301395418&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594301396585,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594301396586,
                "type": ""
            }
        ],
        "screenShotFile": "00e60051-00c2-002f-00ae-007200ba00f1.png",
        "timestamp": 1594301359662,
        "duration": 37075
    },
    {
        "description": "Verify rule is created successfully for Light Theme",
        "passed": true,
        "pending": false,
        "sessionId": "0fd8c4f941aac49b301cb522e5ef1024",
        "instanceId": 23400,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1594301513611,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301534464&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594301535699,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301534464&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594301535699,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594301535700,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder/create-rule - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594301536110,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1 - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594301536110,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594301536111,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301541076&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594301542306,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301541076&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594301542306,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594301542307,
                "type": ""
            }
        ],
        "screenShotFile": "00d3001e-00cc-0009-006c-0020009100d0.png",
        "timestamp": 1594301506338,
        "duration": 36325
    },
    {
        "description": "Verify rule is created successfully for Light Theme",
        "passed": true,
        "pending": false,
        "sessionId": "8e23d32903efe0077bde3afa675aba83",
        "instanceId": 9928,
        "browser": {
            "name": "chrome"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "http://qh-internal.indexnine.com/polyfills.js 14088 Synchronous XMLHttpRequest on the main thread is deprecated because of its detrimental effects to the end user's experience. For more help, check https://xhr.spec.whatwg.org/.",
                "timestamp": 1594301941481,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301970086&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594301971387,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301970086&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594301971387,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594301971388,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder/create-rule - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594301972087,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/keys?app_id=1 - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594301972088,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594301972088,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/#/rule-builder - Access to XMLHttpRequest at 'https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301978043&filter=null' from origin 'http://qh-internal.indexnine.com' has been blocked by CORS policy: Request header field firstname is not allowed by Access-Control-Allow-Headers in preflight response.",
                "timestamp": 1594301979254,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://dewnypowr6.execute-api.ap-south-1.amazonaws.com/ui/edr/0.8/rule_engine/fetch_rule?app_id=1&size=13&sort_field=rule_timestamp&sort_order=desc&ir=2&fetched_records=0&cursor=1594301978043&filter=null - Failed to load resource: net::ERR_FAILED",
                "timestamp": 1594301979269,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://qh-internal.indexnine.com/vendor.js 48915:18 \"ERROR\" HttpErrorResponse",
                "timestamp": 1594301979285,
                "type": ""
            }
        ],
        "screenShotFile": "00cf0024-00e9-0068-00fc-00d300320064.png",
        "timestamp": 1594301933828,
        "duration": 45728
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    }
                    else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.sortSpecs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.sortSpecs();
    }


});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

