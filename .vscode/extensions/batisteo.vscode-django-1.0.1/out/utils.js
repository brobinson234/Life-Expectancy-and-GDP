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
Object.defineProperty(exports, "__esModule", { value: true });
exports.postInitHook = exports.readSnippets = void 0;
const path = require("path");
const fs = require("fs");
const open = require("open");
const toml = require("toml");
const vscode_1 = require("vscode");
const folder = path.resolve(__dirname, "../completions/snippets/");
const settings = vscode_1.workspace.getConfiguration("django");
function readSnippets(name) {
    return toml.parse(fs.readFileSync(path.resolve(folder, name), "utf-8")).snippets;
}
exports.readSnippets = readSnippets;
function postInitHook() {
    return __awaiter(this, void 0, void 0, function* () {
        // Show for 20% of the ext. activation, sometime during the next hour
        if (settings.showContributeNotification && Math.random() > 0.8) {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield notification();
            }), Math.random() * 3600000);
        }
    });
}
exports.postInitHook = postInitHook;
function notification() {
    return __awaiter(this, void 0, void 0, function* () {
        const [REVIEW, SPONSOR, PAYPAL, NOPE] = ["Review it", "Sponsor on Github", "Paypal.me", "Nope"];
        let result = yield vscode_1.window.showInformationMessage("Do you like the Django extension? ✅  " +
            "How about giving some time to write a review? " +
            "Or become a Sponsor on Github to help me develop the Language Server for templates?" +
            "Maybe just a coffee? ☕", { "title": REVIEW }, { "title": SPONSOR }, { "title": PAYPAL }, { "title": NOPE });
        if (!result)
            return;
        switch (result.title) {
            case (REVIEW):
                yield open("https://marketplace.visualstudio.com/items?itemName=batisteo.vscode-django&ssr=false#review-details");
                break;
            case (SPONSOR):
                yield open("https://github.com/sponsors/batisteo/");
                break;
            case (PAYPAL):
                yield open("https://www.paypal.com/paypalme/batisteo/5");
                break;
            case (NOPE):
                break;
        }
        ;
        settings.update("showInformationMessage", false);
    });
}
;
//# sourceMappingURL=utils.js.map