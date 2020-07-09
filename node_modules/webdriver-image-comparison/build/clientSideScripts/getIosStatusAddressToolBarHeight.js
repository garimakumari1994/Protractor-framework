"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getIosStatusAddressToolBarHeight(iosOffsets) {
    var match = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
    var majorVersion = parseInt(match[1], 10);
    var versionOffsets = iosOffsets[majorVersion];
    var _a = window.screen, width = _a.width, height = _a.height;
    var isIphoneXSeries = (width === 812 || height === 812) || (width === 896 || height === 896);
    var innerWidth = window.innerWidth, innerHeight = window.innerHeight;
    var isIpadNoTouch = ((innerHeight + versionOffsets.ADDRESS_BAR + versionOffsets.STATUS_BAR_PRO) === height ||
        (innerWidth + versionOffsets.ADDRESS_BAR + versionOffsets.STATUS_BAR_PRO) === width);
    var statusBarHeight;
    if (isIphoneXSeries) {
        statusBarHeight = versionOffsets.STATUS_BAR_X;
    }
    else if (isIpadNoTouch) {
        statusBarHeight = versionOffsets.STATUS_BAR_PRO;
    }
    else {
        statusBarHeight = versionOffsets.STATUS_BAR;
    }
    var statusAddressBarHeight = statusBarHeight + versionOffsets.ADDRESS_BAR;
    var toolBarHeight = height - innerHeight - statusAddressBarHeight;
    var toolBar = {
        height: toolBarHeight,
        width: width,
        x: 0,
        y: height - toolBarHeight,
    };
    if (toolBar.height < 0) {
        toolBar.height = 0;
        toolBar.y = 0;
    }
    if (toolBar.height === 0 && isIphoneXSeries) {
        toolBar.height = versionOffsets.HOME_BAR.DEFAULT.height;
        toolBar.width = versionOffsets.HOME_BAR.DEFAULT.width;
        toolBar.x = versionOffsets.HOME_BAR.DEFAULT.x;
        toolBar.y = versionOffsets.HOME_BAR.DEFAULT.y;
        if ((width === 896 || height === 896)) {
            toolBar.height = versionOffsets.HOME_BAR.LARGE.height;
            toolBar.width = versionOffsets.HOME_BAR.LARGE.width;
            toolBar.x = versionOffsets.HOME_BAR.LARGE.x;
            toolBar.y = versionOffsets.HOME_BAR.LARGE.y;
        }
    }
    return {
        statusAddressBar: {
            height: statusAddressBarHeight,
            width: width,
            x: 0,
            y: 0,
        },
        toolBar: toolBar,
    };
}
exports.default = getIosStatusAddressToolBarHeight;
//# sourceMappingURL=getIosStatusAddressToolBarHeight.js.map