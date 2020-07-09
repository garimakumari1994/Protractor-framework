"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getScreenDimensions_1 = require("./getScreenDimensions");
describe('getScreenDimensions', function () {
    it('should get the needed screen dimensions', function () {
        expect(getScreenDimensions_1.default()).toMatchSnapshot();
    });
    it('should get the needed screen dimensions if the outerHeight and outerWidth are set to 0', function () {
        Object.defineProperty(window, 'outerHeight', { value: 0 });
        Object.defineProperty(window, 'outerWidth', { value: 0 });
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 1234 });
        Object.defineProperty(document.documentElement, 'clientWidth', { value: 4321 });
        expect(getScreenDimensions_1.default()).toMatchSnapshot();
    });
    it('should return zeroed dimensions if the document attributes are null', function () {
        Object.defineProperty(document, 'body', { value: null });
        Object.defineProperty(document, 'documentElement', { value: null });
        expect(getScreenDimensions_1.default()).toMatchSnapshot();
    });
});
//# sourceMappingURL=getScreenDimensions.spec.js.map