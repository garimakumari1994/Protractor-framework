"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var utils_1 = require("./utils");
var mocks_1 = require("../mocks/mocks");
describe('utils', function () {
    describe('getAndCreatePath', function () {
        var folder = path_1.join(process.cwd(), '/.tmp/utils');
        afterEach(function () { return fs_extra_1.removeSync(folder); });
        it('should create the folder and return the folder name for a device that needs to have it\s own folder', function () {
            var options = {
                browserName: '',
                deviceName: 'deviceName',
                isMobile: true,
                savePerInstance: true,
            };
            var expectedFolderName = path_1.join(folder, options.deviceName);
            expect(fs_extra_1.pathExistsSync(expectedFolderName)).toMatchSnapshot();
            expect(utils_1.getAndCreatePath(folder, options)).toEqual(expectedFolderName);
            expect(fs_extra_1.pathExistsSync(expectedFolderName)).toMatchSnapshot();
        });
        it('should create the folder and return the folder name for a browser that needs to have it\s own folder', function () {
            var options = {
                browserName: 'browser',
                deviceName: '',
                isMobile: false,
                savePerInstance: true,
            };
            var expectedFolderName = path_1.join(folder, "desktop_" + options.browserName);
            expect(fs_extra_1.pathExistsSync(expectedFolderName)).toMatchSnapshot();
            expect(utils_1.getAndCreatePath(folder, options)).toEqual(expectedFolderName);
            expect(fs_extra_1.pathExistsSync(expectedFolderName)).toMatchSnapshot();
        });
        it('should create the folder and return the folder name for a browser', function () {
            var options = {
                browserName: 'browser',
                deviceName: '',
                isMobile: false,
                savePerInstance: false,
            };
            expect(fs_extra_1.pathExistsSync(folder)).toMatchSnapshot();
            expect(utils_1.getAndCreatePath(folder, options)).toEqual(folder);
            expect(fs_extra_1.pathExistsSync(folder)).toMatchSnapshot();
        });
    });
    describe('formatFileName', function () {
        var formatFileOptions = {
            browserName: '',
            browserVersion: '',
            deviceName: '',
            devicePixelRatio: 2,
            formatImageName: '',
            isMobile: false,
            isTestInBrowser: true,
            logName: '',
            name: '',
            outerHeight: 768,
            outerWidth: 1366,
            platformName: '',
            platformVersion: '',
            screenHeight: 900,
            screenWidth: 1400,
            tag: 'theTag',
        };
        it('should format a string with all options provided', function () {
            formatFileOptions.formatImageName = 'browser.{browserName}-{browserVersion}-platform.{platformName}-{platformVersion}-dpr.{dpr}-{height}-{logName}-{name}-{tag}-{width}';
            formatFileOptions.browserName = 'chrome';
            formatFileOptions.browserVersion = '74';
            formatFileOptions.logName = 'chrome-latest';
            formatFileOptions.name = 'chrome-name';
            formatFileOptions.platformName = 'osx';
            formatFileOptions.platformVersion = '12';
            expect(utils_1.formatFileName(formatFileOptions)).toMatchSnapshot();
        });
        it('should format a string for mobile app', function () {
            formatFileOptions.formatImageName = '{tag}-{mobile}-{dpr}-{width}x{height}';
            formatFileOptions.deviceName = 'iPhoneX';
            formatFileOptions.isMobile = true;
            formatFileOptions.isTestInBrowser = false;
            expect(utils_1.formatFileName(formatFileOptions)).toMatchSnapshot();
        });
        it('should format a string for mobile browser', function () {
            formatFileOptions.formatImageName = '{tag}-{mobile}-{dpr}-{width}x{height}';
            formatFileOptions.browserName = 'chrome';
            formatFileOptions.deviceName = 'iPhoneX';
            formatFileOptions.isMobile = true;
            formatFileOptions.isTestInBrowser = true;
            expect(utils_1.formatFileName(formatFileOptions)).toMatchSnapshot();
        });
    });
    describe('checkIsMobile', function () {
        it('should return false when no platform name is provided', function () {
            expect(utils_1.checkIsMobile('')).toMatchSnapshot();
        });
        it('should return true when a platform name is provided', function () {
            expect(utils_1.checkIsMobile('ios')).toMatchSnapshot();
        });
    });
    describe('checkIsAndroid', function () {
        it('should return false when no platform name is provided', function () {
            expect(utils_1.checkIsAndroid('')).toMatchSnapshot();
        });
        it('should return false when a platform name is provided that is not accepted', function () {
            expect(utils_1.checkIsAndroid('chrome')).toMatchSnapshot();
        });
        it('should return true when a valid platform name is provided', function () {
            expect(utils_1.checkIsAndroid('androId')).toMatchSnapshot();
        });
    });
    describe('checkIsIos', function () {
        it('should return false when no platform name is provided', function () {
            expect(utils_1.checkIsIos('')).toMatchSnapshot();
        });
        it('should return false when a platform name is provided that is not accepted', function () {
            expect(utils_1.checkIsIos('chrome')).toMatchSnapshot();
        });
        it('should return true when a valid platform name is provided', function () {
            expect(utils_1.checkIsIos('IoS')).toMatchSnapshot();
        });
    });
    describe('checkTestInBrowser', function () {
        it('should return false when no browser name is provided', function () {
            expect(utils_1.checkTestInBrowser('')).toMatchSnapshot();
        });
        it('should return true when a browser name is provided', function () {
            expect(utils_1.checkTestInBrowser('chrome')).toMatchSnapshot();
        });
    });
    describe('checkTestInMobileBrowser', function () {
        it('should return false when no platform name is provided', function () {
            expect(utils_1.checkTestInMobileBrowser('', 'chrome')).toMatchSnapshot();
        });
        it('should return false when a plaform but no browser name is provided', function () {
            expect(utils_1.checkTestInMobileBrowser('ios', '')).toMatchSnapshot();
        });
        it('should return true when a plaform and a browser name is provided', function () {
            expect(utils_1.checkTestInMobileBrowser('ios', 'chrome')).toMatchSnapshot();
        });
    });
    describe('checkAndroidNativeWebScreenshot', function () {
        it('should return false when no platform name is provided', function () {
            expect(utils_1.checkAndroidNativeWebScreenshot('', false)).toMatchSnapshot();
        });
        it('should return false when iOS and nativeWebscreenshot true is provided', function () {
            expect(utils_1.checkAndroidNativeWebScreenshot('ios', true)).toMatchSnapshot();
        });
        it('should return false when iOS and nativeWebscreenshot false is provided', function () {
            expect(utils_1.checkAndroidNativeWebScreenshot('ios', false)).toMatchSnapshot();
        });
        it('should return false when Android and nativeWebscreenshot false is provided', function () {
            expect(utils_1.checkAndroidNativeWebScreenshot('Android', false)).toMatchSnapshot();
        });
        it('should return true when Android and nativeWebscreenshot true is provided ', function () {
            expect(utils_1.checkAndroidNativeWebScreenshot('Android', true)).toMatchSnapshot();
        });
    });
    describe('checkAndroidChromeDriverScreenshot', function () {
        it('should return false when no platform name is provided', function () {
            expect(utils_1.checkAndroidChromeDriverScreenshot('', false)).toMatchSnapshot();
        });
        it('should return false when iOS and nativeWebscreenshot true is provided', function () {
            expect(utils_1.checkAndroidChromeDriverScreenshot('ios', true)).toMatchSnapshot();
        });
        it('should return false when iOS and nativeWebscreenshot false is provided', function () {
            expect(utils_1.checkAndroidChromeDriverScreenshot('ios', false)).toMatchSnapshot();
        });
        it('should return false when Android and nativeWebscreenshot true is provided', function () {
            expect(utils_1.checkAndroidChromeDriverScreenshot('Android', true)).toMatchSnapshot();
        });
        it('should return true when Android and nativeWebscreenshot false is provided ', function () {
            expect(utils_1.checkAndroidChromeDriverScreenshot('Android', false)).toMatchSnapshot();
        });
    });
    describe('getAddressBarShadowPadding', function () {
        var getAddressBarShadowPaddingOptions = {
            platformName: '',
            browserName: '',
            nativeWebScreenshot: false,
            addressBarShadowPadding: 6,
            addShadowPadding: false,
        };
        it('should return 0 when this is a check for a desktop browser', function () {
            getAddressBarShadowPaddingOptions.browserName = 'chrome';
            expect(utils_1.getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 0 when this is a check for an Android app', function () {
            getAddressBarShadowPaddingOptions.platformName = 'android';
            expect(utils_1.getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 0 when this is a check for an iOS app', function () {
            getAddressBarShadowPaddingOptions.platformName = 'ios';
            expect(utils_1.getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 0 when this is a check for Android with a native screenshot but without adding a shadow padding', function () {
            getAddressBarShadowPaddingOptions.platformName = 'android';
            getAddressBarShadowPaddingOptions.nativeWebScreenshot = true;
            expect(utils_1.getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 0 when this is a check for iOS but without adding a shadow padding', function () {
            getAddressBarShadowPaddingOptions.platformName = 'iOS';
            getAddressBarShadowPaddingOptions.nativeWebScreenshot = true;
            expect(utils_1.getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 6 when this is a check for Android with a native screenshot and adding a shadow padding', function () {
            getAddressBarShadowPaddingOptions.platformName = 'android';
            getAddressBarShadowPaddingOptions.nativeWebScreenshot = true;
            getAddressBarShadowPaddingOptions.addShadowPadding = true;
            expect(utils_1.getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 6 when this is a check for iOS and adding a shadow padding', function () {
            getAddressBarShadowPaddingOptions.platformName = 'iOS';
            getAddressBarShadowPaddingOptions.addShadowPadding = true;
            expect(utils_1.getAddressBarShadowPadding(getAddressBarShadowPaddingOptions)).toMatchSnapshot();
        });
    });
    describe('getToolBarShadowPadding', function () {
        it('should return 0 when this is a check for a desktop browser', function () {
            var getToolBarShadowPaddingOptions = {
                platformName: '',
                browserName: 'chrome',
                toolBarShadowPadding: 6,
                addShadowPadding: false,
            };
            expect(utils_1.getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 0 when this is a check for an Android app', function () {
            var getToolBarShadowPaddingOptions = {
                platformName: 'Android',
                browserName: '',
                toolBarShadowPadding: 6,
                addShadowPadding: false,
            };
            expect(utils_1.getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 0 when this is a check for an iOS app', function () {
            var getToolBarShadowPaddingOptions = {
                platformName: 'iOS',
                browserName: '',
                toolBarShadowPadding: 6,
                addShadowPadding: false,
            };
            expect(utils_1.getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 0 when this is a check for an Android app with adding a shadow padding', function () {
            var getToolBarShadowPaddingOptions = {
                platformName: 'android',
                browserName: '',
                toolBarShadowPadding: 6,
                addShadowPadding: true,
            };
            expect(utils_1.getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 0 when this is a check for an iOS app with adding a shadow padding', function () {
            var getToolBarShadowPaddingOptions = {
                platformName: 'iOS',
                browserName: '',
                toolBarShadowPadding: 6,
                addShadowPadding: true,
            };
            expect(utils_1.getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 0 when this is a check for Android browser and adding a shadow padding', function () {
            var getToolBarShadowPaddingOptions = {
                platformName: 'android',
                browserName: 'chrome',
                toolBarShadowPadding: 6,
                addShadowPadding: true,
            };
            expect(utils_1.getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot();
        });
        it('should return 6 when this is a check for iOS browser and adding a shadow padding', function () {
            var getToolBarShadowPaddingOptions = {
                platformName: 'ios',
                browserName: 'safari',
                toolBarShadowPadding: 6,
                addShadowPadding: true,
            };
            expect(utils_1.getToolBarShadowPadding(getToolBarShadowPaddingOptions)).toMatchSnapshot();
        });
    });
    describe('calculateDprData', function () {
        it('should multiple all number values by the dpr value', function () {
            var data = {
                a: 1,
                b: 2,
                1: 3,
                a1: 9,
                bool: true,
                string: 'string',
            };
            expect(utils_1.calculateDprData(data, 2)).toMatchSnapshot();
        });
    });
    describe('waitFor', function () {
        jest.useFakeTimers();
        it('should wait for an amount of seconds and resolves the promise', function () {
            utils_1.waitFor(500);
            expect(setTimeout).toHaveBeenCalledTimes(1);
            expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 500);
        });
    });
    describe('getScreenshotSize', function () {
        it('should get the screenshot size of a screenshot string with the default DPR', function () {
            expect(utils_1.getScreenshotSize(mocks_1.IMAGE_STRING)).toMatchSnapshot();
        });
        it('should get the screenshot size of a screenshot string with DRP 2', function () {
            expect(utils_1.getScreenshotSize(mocks_1.IMAGE_STRING, 2)).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=utils.spec.js.map