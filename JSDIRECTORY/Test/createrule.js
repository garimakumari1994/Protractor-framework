"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var protractor_1 = require("protractor");
var ptor_1 = require("protractor/built/ptor");
describe('Quick heal rulebulider App', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                protractor_1.browser.get('http://qh-internal.indexnine.com/');
                return [4 /*yield*/, protractor_1.element(protractor_1.by.name('username')).sendKeys('admin')];
            case 1:
                _a.sent();
                return [4 /*yield*/, protractor_1.element(protractor_1.by.name('password')).sendKeys('admin')];
            case 2:
                _a.sent();
                return [4 /*yield*/, protractor_1.element(protractor_1.by.buttonText('Login')).click()];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
it('Verify rule is created successfully for Light Theme', function () { return __awaiter(void 0, void 0, void 0, function () {
    var sidebar, rulebuilderIcon, EC, ruleName, msgdiv;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sidebar = protractor_1.element(protractor_1.by.className('sidebar'));
                rulebuilderIcon = protractor_1.element(protractor_1.by.linkText('Rule Builder'));
                EC = ptor_1.protractor.ExpectedConditions;
                ruleName = protractor_1.element(protractor_1.by.id('ruleName'));
                return [4 /*yield*/, protractor_1.browser
                        .actions()
                        .mouseMove(sidebar)
                        .mouseMove(rulebuilderIcon)
                        .click()
                        .perform()];
            case 1:
                _a.sent();
                //browser.sleep(30000);
                return [4 /*yield*/, protractor_1.element(protractor_1.by.partialButtonText('Create Rule')).click()];
            case 2:
                //browser.sleep(30000);
                _a.sent();
                return [4 /*yield*/, ruleName.clear()];
            case 3:
                _a.sent();
                return [4 /*yield*/, ruleName.sendKeys("Rule1")];
            case 4:
                _a.sent();
                return [4 /*yield*/, protractor_1.element(protractor_1.by.buttonText('Medium')).click()];
            case 5:
                _a.sent();
                return [4 /*yield*/, protractor_1.element(protractor_1.by.id('mat-input-0')).sendKeys('Is Process Signed = Signed')];
            case 6:
                _a.sent();
                return [4 /*yield*/, protractor_1.element(protractor_1.by.buttonText('Save')).click()];
            case 7:
                _a.sent();
                return [4 /*yield*/, protractor_1.element(protractor_1.by.xpath("//span[@class='noty-msg']")).getText()];
            case 8:
                msgdiv = _a.sent();
                console.log("Validation message:-", msgdiv);
                return [4 /*yield*/, expect(msgdiv).toBe("Rule Added Successfully")];
            case 9:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
