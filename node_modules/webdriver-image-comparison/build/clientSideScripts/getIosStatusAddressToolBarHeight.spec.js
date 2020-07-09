"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var mocks_1 = require("../mocks/mocks");
var getIosStatusAddressToolBarHeight_1 = require("./getIosStatusAddressToolBarHeight");
var constants_1 = require("../helpers/constants");
describe('getIosStatusAddressToolBarHeight', function () {
    it('should get the correct status, address and toolbar height for an iPhone with iOS 10', function () {
        setEnvironment(10, 'IPHONE');
        expect(getIosStatusAddressToolBarHeight_1.default(constants_1.OFFSETS.IOS)).toMatchSnapshot();
    });
    it('should get the correct toolbar height for an iPhone with iOS 12 that has been scrolled', function () {
        setEnvironment(12, 'IPHONE');
        Object.defineProperty(window, 'innerHeight', __assign({ value: 598 }, mocks_1.CONFIGURABLE));
        expect(getIosStatusAddressToolBarHeight_1.default(constants_1.OFFSETS.IOS)).toMatchSnapshot();
    });
    it('should get the correct status, address and toolbar height for an iPhone X with iOS 11', function () {
        setEnvironment(11, 'IPHONE_X');
        expect(getIosStatusAddressToolBarHeight_1.default(constants_1.OFFSETS.IOS)).toMatchSnapshot();
    });
    it('should get the correct homebar as toolbar height for an iPhone X with iOS 12 that has been scrolled', function () {
        setEnvironment(12, 'IPHONE_X');
        Object.defineProperty(window, 'innerHeight', __assign({ value: 718 }, mocks_1.CONFIGURABLE));
        expect(getIosStatusAddressToolBarHeight_1.default(constants_1.OFFSETS.IOS)).toMatchSnapshot();
    });
    it('should get the correct status, address and toolbar height for an iPhone XS Max with iOS 12', function () {
        setEnvironment(12, 'IPHONE_XS_MAX');
        expect(getIosStatusAddressToolBarHeight_1.default(constants_1.OFFSETS.IOS)).toMatchSnapshot();
    });
    it('should get the correct homebar as toolbar height for an iPhone XS MAx with iOS 12 that has been scrolled', function () {
        setEnvironment(12, 'IPHONE_XS_MAX');
        Object.defineProperty(window, 'innerHeight', __assign({ value: 802 }, mocks_1.CONFIGURABLE));
        expect(getIosStatusAddressToolBarHeight_1.default(constants_1.OFFSETS.IOS)).toMatchSnapshot();
    });
    it('should get the correct status, address and toolbar height for an iPad with iOS 12', function () {
        setEnvironment(12, 'IPAD');
        expect(getIosStatusAddressToolBarHeight_1.default(constants_1.OFFSETS.IOS)).toMatchSnapshot();
    });
    it('should get the correct status, address and toolbar height for an iPad Pro with to touch id and with iOS 12', function () {
        setEnvironment(12, 'IPAD_NO_TOUCH');
        expect(getIosStatusAddressToolBarHeight_1.default(constants_1.OFFSETS.IOS)).toMatchSnapshot();
    });
});
function setEnvironment(ios, phone) {
    Object.defineProperty(navigator, 'appVersion', __assign({ value: mocks_1.NAVIGATOR_APP_VERSIONS.IOS[ios] }, mocks_1.CONFIGURABLE));
    Object.defineProperty(window.screen, 'width', __assign({ value: mocks_1.IOS_DEVICES[phone].width }, mocks_1.CONFIGURABLE));
    Object.defineProperty(window.screen, 'height', __assign({ value: mocks_1.IOS_DEVICES[phone].height }, mocks_1.CONFIGURABLE));
    Object.defineProperty(window, 'innerWidth', __assign({ value: mocks_1.IOS_DEVICES[phone].innerWidth }, mocks_1.CONFIGURABLE));
    Object.defineProperty(window, 'innerHeight', __assign({ value: mocks_1.IOS_DEVICES[phone].innerHeight }, mocks_1.CONFIGURABLE));
}
//# sourceMappingURL=getIosStatusAddressToolBarHeight.spec.js.map