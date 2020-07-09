"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var hideRemoveElements_1 = require("./hideRemoveElements");
describe('hideRemoveElements', function () {
    it('should be able to hide elements and put them back again', function () {
        document.body.innerHTML =
            '<div>' +
                '   <span id="id-1">Hello</span>' +
                '   <span id="id-2">Hello</span>' +
                '   <div>' +
                '     <span id="id-3">Hello</span>' +
                '     <span id="id-4">Hello</span>' +
                '  </div>' +
                '</div>';
        expect(document.querySelector('#id-1').style.visibility).toMatchSnapshot();
        expect(document.querySelector('#id-3').style.visibility).toMatchSnapshot();
        hideRemoveElements_1.default({
            hide: [document.querySelector('#id-1'), document.querySelector('#id-3')],
            remove: [],
        }, true);
        expect(document.querySelector('#id-1').style.visibility).toMatchSnapshot();
        expect(document.querySelector('#id-3').style.visibility).toMatchSnapshot();
        hideRemoveElements_1.default({
            hide: [document.querySelector('#id-1'), document.querySelector('#id-3')],
            remove: [],
        }, false);
        expect(document.querySelector('#id-1').style.visibility).toMatchSnapshot();
        expect(document.querySelector('#id-3').style.visibility).toMatchSnapshot();
    });
    it('should be able to hide elements and put them back again when an array of hidden elements is provided', function () {
        document.body.innerHTML =
            '<div>' +
                '   <span class="hide">Hello</span>' +
                '   <span class="hide">Hello</span>' +
                '   <div>' +
                '     <span id="id-3">Hello</span>' +
                '     <span class="hide">Hello</span>' +
                '  </div>' +
                '</div>';
        expect(document.querySelectorAll('.hide')[0].style.visibility).toMatchSnapshot();
        expect(document.querySelectorAll('.hide')[1].style.visibility).toMatchSnapshot();
        expect(document.querySelector('#id-3').style.visibility).toMatchSnapshot();
        expect(document.querySelectorAll('.hide')[2].style.visibility).toMatchSnapshot();
        hideRemoveElements_1.default({
            hide: [__spreadArrays(document.querySelectorAll('.hide'))],
            remove: [],
        }, true);
        expect(document.querySelectorAll('.hide')[0].style.visibility).toMatchSnapshot();
        expect(document.querySelectorAll('.hide')[1].style.visibility).toMatchSnapshot();
        expect(document.querySelector('#id-3').style.visibility).toMatchSnapshot();
        expect(document.querySelectorAll('.hide')[2].style.visibility).toMatchSnapshot();
        hideRemoveElements_1.default({
            hide: [__spreadArrays(document.querySelectorAll('.hide'))],
            remove: [],
        }, false);
        expect(document.querySelectorAll('.hide')[0].style.visibility).toMatchSnapshot();
        expect(document.querySelectorAll('.hide')[1].style.visibility).toMatchSnapshot();
        expect(document.querySelector('#id-3').style.visibility).toMatchSnapshot();
        expect(document.querySelectorAll('.hide')[2].style.visibility).toMatchSnapshot();
    });
    it('should be able to remove elements and put them back again', function () {
        document.body.innerHTML =
            '<div>' +
                '   <span id="id-1">Hello</span>' +
                '   <span id="id-2">Hello</span>' +
                '   <div>' +
                '     <span id="id-3">Hello</span>' +
                '     <span id="id-4">Hello</span>' +
                '  </div>' +
                '</div>';
        expect(document.querySelector('#id-2').style.display).toMatchSnapshot();
        expect(document.querySelector('#id-4').style.display).toMatchSnapshot();
        hideRemoveElements_1.default({
            hide: [],
            remove: [
                document.querySelector('#id-2'),
                document.querySelector('#id-4'),
            ],
        }, true);
        expect(document.querySelector('#id-2').style.display).toMatchSnapshot();
        expect(document.querySelector('#id-4').style.display).toMatchSnapshot();
        hideRemoveElements_1.default({
            remove: [
                document.querySelector('#id-2'),
                document.querySelector('#id-4'),
            ],
            hide: [],
        }, false);
        expect(document.querySelector('#id-2').style.display).toMatchSnapshot();
        expect(document.querySelector('#id-4').style.display).toMatchSnapshot();
    });
    it('should be able to remove elements and put them back again when an array of to be removed elements is provided', function () {
        document.body.innerHTML =
            '<div>' +
                '   <span class="remove">Hello</span>' +
                '   <span class="remove">Hello</span>' +
                '   <div>' +
                '     <span id="id-3">Hello</span>' +
                '     <span class="remove">Hello</span>' +
                '  </div>' +
                '</div>';
        expect(document.querySelectorAll('.remove')[0].style.display).toMatchSnapshot();
        expect(document.querySelectorAll('.remove')[1].style.display).toMatchSnapshot();
        expect(document.querySelector('#id-3').style.display).toMatchSnapshot();
        expect(document.querySelectorAll('.remove')[2].style.display).toMatchSnapshot();
        hideRemoveElements_1.default({
            remove: [__spreadArrays(document.querySelectorAll('.remove'))],
            hide: [],
        }, true);
        expect(document.querySelectorAll('.remove')[0].style.display).toMatchSnapshot();
        expect(document.querySelectorAll('.remove')[1].style.display).toMatchSnapshot();
        expect(document.querySelector('#id-3').style.display).toMatchSnapshot();
        expect(document.querySelectorAll('.remove')[2].style.display).toMatchSnapshot();
        hideRemoveElements_1.default({
            remove: [__spreadArrays(document.querySelectorAll('.remove'))],
            hide: [],
        }, false);
        expect(document.querySelectorAll('.remove')[0].style.display).toMatchSnapshot();
        expect(document.querySelectorAll('.remove')[1].style.display).toMatchSnapshot();
        expect(document.querySelector('#id-3').style.display).toMatchSnapshot();
        expect(document.querySelectorAll('.remove')[2].style.display).toMatchSnapshot();
    });
});
//# sourceMappingURL=hideRemoveElements.spec.js.map