"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const child_process_1 = require("child_process");
const fs_extra_1 = require("fs-extra");
const builtinModules = [
    "assert",
    "async_hooks",
    "buffer",
    "child_process",
    "cluster",
    "console",
    "constants",
    "crypto",
    "dgram",
    "dns",
    "domain",
    "events",
    "fs",
    "http",
    "http2",
    "https",
    "inspector",
    "module",
    "net",
    "os",
    "path",
    "perf_hooks",
    "process",
    "punycode",
    "querystring",
    "readline",
    "repl",
    "stream",
    "string_decoder",
    "timers",
    "tls",
    "tty",
    "url",
    "util",
    "v8",
    "vm",
    "zlib"
];
function isBuildInModule(moduleName) {
    const moduleSet = new Set(builtinModules);
    return moduleSet.has(moduleName);
}
exports.isBuildInModule = isBuildInModule;
function findPackage(packageName, cwd) {
    if (cwd === "/" || !cwd) {
        return void 0;
    }
    const packagePath = path.join(cwd, "node_modules", packageName);
    try {
        fs_extra_1.readdirSync(packagePath);
        return packagePath;
    }
    catch (err) {
        return findPackage(packageName, path.dirname(cwd));
    }
}
exports.findPackage = findPackage;
function isValidNpmPackageName(name) {
    return /^(@[a-z]([\w\-_]+)?\/)?[a-z]([\w\-_\.\/]+)?$/i.test(name);
}
exports.isValidNpmPackageName = isValidNpmPackageName;
function createMark(sourceName, filepath, location) {
    try {
        if (isBuildInModule(sourceName)) {
            return {
                location,
                name: sourceName,
                description: "",
                version: getCurrentUsingNodeVersion(),
                buildIn: true
            };
        }
        else {
            const packageNameParser = require("parse-package-name");
            const packageInfo = packageNameParser(sourceName);
            const packagePath = findPackage(packageInfo.name, filepath);
            if (!packagePath) {
                return {
                    location,
                    name: packageInfo.name,
                    description: "",
                    version: null,
                    buildIn: false
                };
            }
            const packageFilePath = path.join(packagePath, "package.json");
            const pkg = fs_extra_1.readJSONSync(packageFilePath);
            return {
                location,
                name: pkg.name,
                description: pkg.description || "",
                packagePath: packageFilePath,
                version: pkg.version,
                buildIn: false
            };
        }
    }
    catch (err) {
        console.error(err);
        return;
    }
}
exports.createMark = createMark;
let currentNodeVersion;
function getCurrentUsingNodeVersion() {
    if (currentNodeVersion) {
        return currentNodeVersion;
    }
    try {
        currentNodeVersion = child_process_1.spawnSync("node", ["--version"], { encoding: "utf8" })
            .output[1];
        currentNodeVersion = currentNodeVersion.trim().replace(/^v/, "");
    }
    catch (err) {
        //
    }
    return currentNodeVersion || "0.0.0";
}
//# sourceMappingURL=utils.js.map