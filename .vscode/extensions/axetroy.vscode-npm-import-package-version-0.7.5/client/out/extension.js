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
const path = require("path");
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const vscode_nls_i18n_1 = require("vscode-nls-i18n");
var Commands;
(function (Commands) {
    Commands["openPackageJson"] = "npm-version._open";
})(Commands || (Commands = {}));
const configurationNamespace = "npm-import-package-version";
const configurationFieldEnable = "enable";
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode_nls_i18n_1.init(context);
        // The server is implemented in node
        const serverModule = context.asAbsolutePath(path.join("server", "out", "server.js"));
        // The debug options for the server
        const debugOptions = { execArgv: ["--nolazy", "--inspect=9527"] };
        // If the extension is launched in debug mode then the debug server options are used
        // Otherwise the run options are used
        const serverOptions = {
            run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
            debug: {
                module: serverModule,
                transport: vscode_languageclient_1.TransportKind.ipc,
                options: debugOptions
            }
        };
        // Options to control the language client
        const clientOptions = {
            // Register the server for plain text documents
            documentSelector: [
                { scheme: "file", language: "javascript" },
                { scheme: "file", language: "javascriptreact" },
                { scheme: "file", language: "typescript" },
                { scheme: "file", language: "typescriptreact" },
                { scheme: "file", language: "vue" }
            ],
            synchronize: {
                configurationSection: configurationNamespace
            }
        };
        // Create the language client and start the client.
        const client = new vscode_languageclient_1.LanguageClient("npm_import_version_server", "Npm Import Version Server", serverOptions, clientOptions);
        const decorationType = vscode_1.window.createTextEditorDecorationType({
            overviewRulerLane: vscode_1.OverviewRulerLane.Right,
            after: { margin: "0 0 0 0rem" }
        });
        client.onReady().then(() => {
            client.onNotification("decorators", ({ uri, marks }) => {
                var _a;
                const editor = vscode_1.window.activeTextEditor;
                if (!editor) {
                    return;
                }
                if (((_a = editor) === null || _a === void 0 ? void 0 : _a.document.uri.toString()) !== uri) {
                    return;
                }
                editor.setDecorations(decorationType, marks.map(v => {
                    var _a, _b;
                    const params = encodeURIComponent(JSON.stringify({ name: v.name, packagePath: v.packagePath }));
                    const hover = new vscode_1.MarkdownString();
                    hover.value = "";
                    hover.isTrusted = true;
                    if (v.description) {
                        hover.value += v.description;
                    }
                    if (!v.buildIn) {
                        if (!v.version) {
                            hover.value += vscode_nls_i18n_1.localize("tip.not_installed_warning", v.name);
                        }
                        else {
                            hover.value += `\n\n[${vscode_nls_i18n_1.localize("cmd.open.title")}](command:${Commands.openPackageJson}?${params})`;
                        }
                    }
                    hover.value = hover.value.trim();
                    const target = {
                        range: new vscode_1.Range((_a = editor) === null || _a === void 0 ? void 0 : _a.document.positionAt(v.location.start), (_b = editor) === null || _b === void 0 ? void 0 : _b.document.positionAt(v.location.end)),
                        hoverMessage: hover,
                        renderOptions: {
                            after: {
                                contentText: v.buildIn
                                    ? ""
                                    : `@${v.version || vscode_nls_i18n_1.localize("tip.not_installed")}`,
                                color: "#9e9e9e"
                            }
                        }
                    };
                    return target;
                }));
            });
            context.subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(editor => {
                var _a;
                client.sendNotification("compile", (_a = editor) === null || _a === void 0 ? void 0 : _a.document.uri.toString());
            }));
        });
        context.subscriptions.push(vscode_1.commands.registerCommand(Commands.openPackageJson, ({ packagePath }) => __awaiter(this, void 0, void 0, function* () {
            const document = yield vscode_1.workspace.openTextDocument(packagePath);
            vscode_1.window.showTextDocument(document);
        })));
        context.subscriptions.push(vscode_1.commands.registerCommand("npm-version.enable", () => __awaiter(this, void 0, void 0, function* () {
            yield vscode_1.workspace
                .getConfiguration(configurationNamespace)
                .update(configurationFieldEnable, true, vscode_1.ConfigurationTarget.Global);
        })));
        context.subscriptions.push(vscode_1.commands.registerCommand("npm-version.disable", () => __awaiter(this, void 0, void 0, function* () {
            yield vscode_1.workspace
                .getConfiguration(configurationNamespace)
                .update(configurationFieldEnable, false, vscode_1.ConfigurationTarget.Global);
        })));
        // Push the disposable to the context's subscriptions so that the
        // client can be deactivated on extension deactivation
        context.subscriptions.push(client.start());
    });
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map