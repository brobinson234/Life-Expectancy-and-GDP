"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const utils_1 = require("../utils");
function compile(code, filepath) {
    const marks = [];
    let sourceFile;
    try {
        // Parse a file
        sourceFile = ts.createSourceFile(filepath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    }
    catch (err) {
        // NOBUG: ignore error
        return [];
    }
    function delint(SourceFile) {
        delintNode(SourceFile);
        function delintNode(node) {
            var _a;
            let moduleNode = null;
            switch (node.kind) {
                // require('xxx')
                // import('xxx')
                case ts.SyntaxKind.CallExpression:
                    const expression = node.expression;
                    const args = node.arguments;
                    const isRequire = expression &&
                        ts.isIdentifier(expression) &&
                        expression.text === "require";
                    const isDynamicImport = ((_a = expression) === null || _a === void 0 ? void 0 : _a.kind) === ts.SyntaxKind.ImportKeyword;
                    if (isRequire || isDynamicImport) {
                        const argv = args[0];
                        if (argv && ts.isStringLiteral(argv)) {
                            moduleNode = argv;
                        }
                    }
                    break;
                // import ts = require('typescript')
                case ts.SyntaxKind.ImportEqualsDeclaration:
                    const ref = node
                        .moduleReference;
                    if (ref.expression && ts.isStringLiteral(ref.expression)) {
                        moduleNode = ref.expression;
                    }
                    break;
                // import * as from 'xx'
                // import 'xx'
                // import xx from 'xx'
                case ts.SyntaxKind.ImportDeclaration:
                    const spec = node.moduleSpecifier;
                    if (spec && ts.isStringLiteral(spec)) {
                        moduleNode = spec;
                    }
                    break;
                // export { window } from "xxx";
                // export * from "xxx";
                case ts.SyntaxKind.ExportDeclaration:
                    const exportSpec = node.moduleSpecifier;
                    if (exportSpec && ts.isStringLiteral(exportSpec)) {
                        moduleNode = exportSpec;
                    }
                    break;
            }
            if (moduleNode && utils_1.isValidNpmPackageName(moduleNode.text)) {
                const mark = utils_1.createMark(moduleNode.text, filepath, {
                    start: moduleNode.pos,
                    end: moduleNode.end - 1
                });
                if (mark) {
                    marks.push(mark);
                }
            }
            ts.forEachChild(node, delintNode);
        }
    }
    // delint it
    delint(sourceFile);
    return marks;
}
exports.compile = compile;
//# sourceMappingURL=typescript.js.map