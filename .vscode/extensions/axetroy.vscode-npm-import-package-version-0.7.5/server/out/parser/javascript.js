"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
function compile(code, filepath) {
    const parser = require("@babel/parser");
    const babelTypes = require("@babel/types");
    const traverse = require("@babel/traverse").default;
    const marks = [];
    let ast;
    try {
        ast = parser.parse(code, {
            sourceType: "module",
            plugins: [
                "jsx",
                "flow",
                "flowComments",
                "doExpressions",
                "objectRestSpread",
                "decorators-legacy",
                "classProperties",
                "classPrivateProperties",
                "classPrivateMethods",
                "exportDefaultFrom",
                "exportNamespaceFrom",
                "asyncGenerators",
                "functionBind",
                "functionSent",
                "dynamicImport",
                "numericSeparator",
                "optionalChaining",
                "importMeta",
                "bigInt",
                "optionalCatchBinding",
                "throwExpressions",
                "nullishCoalescingOperator"
            ]
        });
    }
    catch (err) {
        // NOBUG: ignore error
        return [];
    }
    function appendMark(node) {
        if (!utils_1.isValidNpmPackageName(node.value)) {
            return;
        }
        const mark = utils_1.createMark(node.value, filepath, {
            start: node.start || 0,
            end: (node.end || 0) - 1
        });
        if (mark) {
            marks.push(mark);
        }
    }
    const visitor = {
        // require('xxx')
        // import('xxx')
        CallExpression(p) {
            const node = p.node;
            const callee = node.callee;
            const isRequire = babelTypes.isIdentifier(callee) && callee.name === "require";
            const isDynamicImport = babelTypes.isImport(callee);
            if (isRequire || isDynamicImport) {
                const args = node.arguments;
                if (args.length > 1) {
                    return;
                }
                const argv = args[0];
                if (babelTypes.isStringLiteral(argv)) {
                    appendMark(argv);
                }
            }
        },
        // import * as from 'xx'
        // import 'xx'
        // import xx from 'xx'
        ImportDeclaration(p) {
            const node = p.node;
            appendMark(node.source);
        },
        // export { window } from "xxx";
        ExportNamedDeclaration(p) {
            const node = p.node;
            if (node.source) {
                appendMark(node.source);
            }
        },
        // export * from "xxx";
        ExportAllDeclaration(p) {
            const node = p.node;
            appendMark(node.source);
        }
    };
    traverse(ast, visitor);
    return marks;
}
exports.compile = compile;
//# sourceMappingURL=javascript.js.map