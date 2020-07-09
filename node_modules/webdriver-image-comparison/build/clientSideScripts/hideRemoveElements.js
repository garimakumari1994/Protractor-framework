"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hideRemoveElements(hideRemoveElements, hideRemove) {
    hideRemoveElements.hide.forEach(function (element) {
        if (Array.isArray(element)) {
            return element.forEach(function (singleElement) {
                singleElement.style.visibility = hideRemove ? 'hidden' : '';
            });
        }
        return element.style.visibility = hideRemove ? 'hidden' : '';
    });
    hideRemoveElements.remove.forEach(function (element) {
        if (Array.isArray(element)) {
            return element.forEach(function (singleElement) { return singleElement.style.display = hideRemove ? 'none' : ''; });
        }
        return element.style.display = hideRemove ? 'none' : '';
    });
}
exports.default = hideRemoveElements;
//# sourceMappingURL=hideRemoveElements.js.map