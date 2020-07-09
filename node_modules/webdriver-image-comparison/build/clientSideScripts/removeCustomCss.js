"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function removeCustomCss(id) {
    var elem = document.querySelector("style#" + id);
    if (elem != null) {
        elem.parentNode.removeChild(elem);
    }
}
exports.default = removeCustomCss;
//# sourceMappingURL=removeCustomCss.js.map