"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsonread = /** @class */ (function () {
    function jsonread() {
    }
    jsonread.prototype.read = function (filename) {
        'use strict';
        var fs = require('fs');
        var rawdata = fs.readFileSync(filename);
        var or = JSON.parse(rawdata);
        return or;
    };
    return jsonread;
}());
exports.jsonread = jsonread;
