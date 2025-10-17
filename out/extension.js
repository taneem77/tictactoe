"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    let panel;
    context.subscriptions.push(vscode.commands.registerCommand('tictactoe.start', () => {
        panel = vscode.window.createWebviewPanel('tictactoe', 'Tic Tac Toe', vscode.ViewColumn.One, { enableScripts: true } // very important
        );
        panel.webview.html = getWebviewContent();
        // Handle messages from the WebView
        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'makeMove':
                    // message.index is the clicked cell
                    console.log('Move made at cell:', message.index);
                    // Here you can update game state and send back board
                    panel?.webview.postMessage({
                        command: 'updateBoard',
                        board: ['X', '', '', '', '', '', '', '', ''] // example
                    });
                    break;
            }
        });
    }));
}
function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Tic Tac Toe</title>
            <link rel="stylesheet" href="media/main.css">
        </head>
        <body>
            <div id="status-banner">Game started. X's turn.</div>
            <div id="game-board">
                ${Array(9).fill(0).map((_, i) => `<div class="cell" data-index="${i}"></div>`).join('')}
            </div>
            <script src="media/main.js"></script>
        </body>
        </html>
    `;
}
