"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var fs_extra_1 = require("fs-extra");
var options_1 = require("./helpers/options");
var constants_1 = require("./helpers/constants");
var BaseClass = (function () {
    function BaseClass(options) {
        this.defaultOptions = options_1.defaultOptions(options);
        var baselineFolder;
        var baseFolder;
        if (typeof options.baselineFolder === 'function') {
            baselineFolder = options.baselineFolder(options);
        }
        else {
            baselineFolder = path_1.normalize(options.baselineFolder || constants_1.FOLDERS.DEFAULT.BASE);
        }
        if (typeof options.screenshotPath === 'function') {
            baseFolder = options.screenshotPath(options);
        }
        else {
            baseFolder = path_1.normalize(options.screenshotPath || constants_1.FOLDERS.DEFAULT.SCREENSHOTS);
        }
        this.folders = {
            actualFolder: path_1.join(baseFolder, constants_1.FOLDERS.ACTUAL),
            baselineFolder: baselineFolder,
            diffFolder: path_1.join(baseFolder, constants_1.FOLDERS.DIFF),
        };
        if (options.clearRuntimeFolder) {
            fs_extra_1.removeSync(this.folders.actualFolder);
            fs_extra_1.removeSync(this.folders.diffFolder);
        }
    }
    return BaseClass;
}());
exports.default = BaseClass;
//# sourceMappingURL=base.js.map