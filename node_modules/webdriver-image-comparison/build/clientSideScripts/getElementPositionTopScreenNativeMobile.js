"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getElementPositionTopScreenNativeMobile(statusBarAddressBarHeight, element) {
    var _a = window.screen, width = _a.width, height = _a.height;
    var innerHeight = window.innerHeight;
    var elementPosition = element.getBoundingClientRect();
    var y;
    if (height === innerHeight || width === innerHeight) {
        y = elementPosition.top;
    }
    else {
        y = statusBarAddressBarHeight + elementPosition.top;
    }
    return {
        height: elementPosition.height,
        width: elementPosition.width,
        x: elementPosition.left,
        y: y
    };
}
exports.getElementPositionTopScreenNativeMobile = getElementPositionTopScreenNativeMobile;
//# sourceMappingURL=getElementPositionTopScreenNativeMobile.js.map