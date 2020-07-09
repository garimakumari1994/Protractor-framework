"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var constants_1 = require("./constants");
var fs_extra_1 = require("fs-extra");
function getAndCreatePath(folder, options) {
    var browserName = options.browserName, deviceName = options.deviceName, isMobile = options.isMobile, savePerInstance = options.savePerInstance;
    var instanceName = (isMobile ? deviceName : constants_1.DESKTOP + "_" + browserName).replace(/ /g, '_');
    var subFolder = savePerInstance ? instanceName : '';
    var folderName = path_1.join(folder, subFolder);
    fs_extra_1.ensureDirSync(folderName);
    return folderName;
}
exports.getAndCreatePath = getAndCreatePath;
function formatFileName(options) {
    var defaults = {
        browserName: options.browserName,
        browserVersion: options.browserVersion,
        deviceName: options.deviceName,
        dpr: options.devicePixelRatio,
        height: options.isMobile ? options.screenHeight : options.outerHeight,
        logName: options.logName,
        mobile: (options.isMobile && options.isTestInBrowser) ? options.browserName : options.isMobile ? 'app' : '',
        name: options.name,
        platformName: options.platformName,
        platformVersion: options.platformVersion,
        tag: options.tag,
        width: options.isMobile ? options.screenWidth : options.outerWidth
    };
    var fileName = options.formatImageName;
    Object.keys(defaults).forEach(function (value) {
        fileName = fileName.replace("{" + value + "}", defaults[value]);
    });
    return fileName.replace(/ /g, '_') + ".png";
}
exports.formatFileName = formatFileName;
function checkIsMobile(platformName) {
    return checkIsAndroid(platformName) || checkIsIos(platformName);
}
exports.checkIsMobile = checkIsMobile;
function checkIsAndroid(platformName) {
    return platformName.toLowerCase() === constants_1.PLATFORMS.ANDROID;
}
exports.checkIsAndroid = checkIsAndroid;
function checkIsIos(platformName) {
    return platformName.toLowerCase() === constants_1.PLATFORMS.IOS;
}
exports.checkIsIos = checkIsIos;
function checkTestInBrowser(browserName) {
    return browserName !== '';
}
exports.checkTestInBrowser = checkTestInBrowser;
function checkTestInMobileBrowser(platformName, browserName) {
    return checkIsMobile(platformName) && checkTestInBrowser(browserName);
}
exports.checkTestInMobileBrowser = checkTestInMobileBrowser;
function checkAndroidNativeWebScreenshot(platformName, nativeWebscreenshot) {
    return (checkIsAndroid(platformName) && nativeWebscreenshot) || false;
}
exports.checkAndroidNativeWebScreenshot = checkAndroidNativeWebScreenshot;
function checkAndroidChromeDriverScreenshot(platformName, nativeWebScreenshot) {
    return checkIsAndroid(platformName) && !checkAndroidNativeWebScreenshot(platformName, nativeWebScreenshot);
}
exports.checkAndroidChromeDriverScreenshot = checkAndroidChromeDriverScreenshot;
function getAddressBarShadowPadding(options) {
    var platformName = options.platformName, browserName = options.browserName, nativeWebScreenshot = options.nativeWebScreenshot, addressBarShadowPadding = options.addressBarShadowPadding, addShadowPadding = options.addShadowPadding;
    var isTestInMobileBrowser = checkTestInMobileBrowser(platformName, browserName);
    var isAndroidNativeWebScreenshot = checkAndroidNativeWebScreenshot(platformName, nativeWebScreenshot);
    var isAndroid = checkIsAndroid(platformName);
    var isIos = checkIsIos(platformName);
    return isTestInMobileBrowser && ((isAndroidNativeWebScreenshot && isAndroid) || isIos) && addShadowPadding ? addressBarShadowPadding : 0;
}
exports.getAddressBarShadowPadding = getAddressBarShadowPadding;
function getToolBarShadowPadding(options) {
    var platformName = options.platformName, browserName = options.browserName, toolBarShadowPadding = options.toolBarShadowPadding, addShadowPadding = options.addShadowPadding;
    return checkTestInMobileBrowser(platformName, browserName) && checkIsIos(platformName) && addShadowPadding ? toolBarShadowPadding : 0;
}
exports.getToolBarShadowPadding = getToolBarShadowPadding;
function calculateDprData(data, devicePixelRatio) {
    Object.keys(data).map(function (key) { return data[key] = typeof data[key] === 'number' ? data[key] * devicePixelRatio : data[key]; });
    return data;
}
exports.calculateDprData = calculateDprData;
function waitFor(milliseconds) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, milliseconds); })];
        });
    });
}
exports.waitFor = waitFor;
function getScreenshotSize(screenshot, devicePixelRation) {
    if (devicePixelRation === void 0) { devicePixelRation = 1; }
    return {
        height: Buffer.from(screenshot, 'base64').readUInt32BE(20) / devicePixelRation,
        width: Buffer.from(screenshot, 'base64').readUInt32BE(16) / devicePixelRation,
    };
}
exports.getScreenshotSize = getScreenshotSize;
//# sourceMappingURL=utils.js.map