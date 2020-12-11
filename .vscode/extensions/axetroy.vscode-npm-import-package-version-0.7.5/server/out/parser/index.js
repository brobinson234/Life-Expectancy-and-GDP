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
const javascript_1 = require("./javascript");
const typescript_1 = require("./typescript");
const vue_1 = require("./vue");
const type_1 = require("../type");
const oneMByte = 1024 * 1024 * 1;
/**
 * compile the code and return marks
 * @param document
 */
function compile(document) {
    return __awaiter(this, void 0, void 0, function* () {
        const filepath = require("file-uri-to-path")(document.uri);
        const fileText = document.getText();
        // do not parse min file
        if (/.*\.\min\.js$/.test(filepath)) {
            return [];
        }
        if (fileText.length > oneMByte) {
            return [];
        }
        const fileSize = Buffer.from(fileText).length;
        // do not parse file which over 1M
        if (fileSize > oneMByte) {
            return [];
        }
        // less then 50 line and file size over 50KB
        else if (document.lineCount < 50 && fileSize > 1024 * 50) {
            return [];
        }
        // over 10000 line and file size over 10KB
        else if (document.lineCount > 10000 && fileSize > 1024 * 10) {
            return [];
        }
        switch (document.languageId) {
            case type_1.SupportLanguages.js:
            case type_1.SupportLanguages.jsx:
                return javascript_1.compile(fileText, filepath);
            case type_1.SupportLanguages.ts:
            case type_1.SupportLanguages.tsx:
                return typescript_1.compile(fileText, filepath);
            case type_1.SupportLanguages.vue:
                return vue_1.compile(fileText, filepath);
            default:
                return [];
        }
    });
}
exports.compile = compile;
//# sourceMappingURL=index.js.map