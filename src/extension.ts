import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let panel: vscode.WebviewPanel | undefined;

    context.subscriptions.push(
        vscode.commands.registerCommand('tictactoe.start', () => {
            panel = vscode.window.createWebviewPanel(
                'tictactoe',
                'Tic Tac Toe',
                vscode.ViewColumn.One,
                { enableScripts: true } // very important
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
        })
    );
}

function getWebviewContent(): string {
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
