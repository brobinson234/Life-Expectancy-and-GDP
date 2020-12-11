"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const parser_1 = require("./parser");
const configurationNamespace = "npm-import-package-version";
process.title = "Npm Import Package Version Server";
// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings = { enable: true };
let globalSettings = defaultSettings;
// Create a connection for the server. The connection uses Node's IPC as a transport
const connection = vscode_languageserver_1.createConnection(new vscode_languageserver_1.IPCMessageReader(process), new vscode_languageserver_1.IPCMessageWriter(process));
// Create a simple text document manager. The text document manager
// supports full document sync only
const documents = new vscode_languageserver_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
connection.onInitialize(() => {
    return {
        serverInfo: {
            name: "Npm Version Server"
        },
        capabilities: {
            textDocumentSync: {
                openClose: true,
                change: vscode_languageserver_1.TextDocumentSyncKind.Full
            }
        }
    };
});
connection.onInitialized(() => {
    connection.console.log("server start");
});
function compileDocument(document) {
    if (!globalSettings.enable) {
        return;
    }
    connection.console.log(`compile: ${document.uri}`);
    parser_1.compile(document)
        .then(decorators => {
        connection.sendNotification("decorators", {
            uri: document.uri,
            marks: decorators
        });
    })
        .catch(err => {
        connection.console.error(err.message);
        connection.console.error(err.stack);
    });
}
connection.onDidChangeConfiguration(change => {
    const s = (change.settings[configurationNamespace] ||
        defaultSettings);
    const docs = documents.all();
    const enableChange = s.enable !== globalSettings.enable;
    globalSettings = Object.assign(Object.assign({}, globalSettings), s);
    if (enableChange) {
        if (s.enable) {
            for (const doc of docs) {
                compileDocument(doc);
            }
        }
        else {
            for (const doc of docs) {
                connection.sendNotification("decorators", {
                    uri: doc.uri,
                    marks: []
                });
            }
        }
    }
});
documents.onDidChangeContent(change => {
    compileDocument(change.document);
});
connection.onNotification((method, ...params) => {
    switch (method) {
        case "compile":
            const uri = params[0];
            const document = documents.get(uri);
            if (document) {
                compileDocument(document);
            }
            break;
    }
});
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);
// Listen on the connection
connection.listen();
//# sourceMappingURL=server.js.map