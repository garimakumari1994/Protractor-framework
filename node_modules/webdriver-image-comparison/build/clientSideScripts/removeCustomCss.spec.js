"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var removeCustomCss_1 = require("./removeCustomCss");
describe('removeCustomCss', function () {
    it('should be able to remove the custom css', function () {
        var id = 'test';
        var cssText = 'body:{width:100%}';
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.id = id;
        style.appendChild(document.createTextNode(cssText));
        head.appendChild(style);
        expect(document.head.textContent).toMatchSnapshot();
        removeCustomCss_1.default(id);
        expect(document.head.textContent).toMatchSnapshot();
    });
    it('should do nothing if custom css is not present', function () {
        var id = 'test';
        expect(document.head.textContent).toMatchSnapshot();
        removeCustomCss_1.default(id);
        expect(document.head.textContent).toMatchSnapshot();
    });
    it('should do nothing if document.head is null', function () {
        var id = 'test';
        Object.defineProperty(document, 'head', { value: null });
        removeCustomCss_1.default(id);
        expect(document.head).toBe(null);
    });
});
//# sourceMappingURL=removeCustomCss.spec.js.map