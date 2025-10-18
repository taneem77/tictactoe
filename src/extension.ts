// File: src/extension.ts

import * as vscode from 'vscode';

// --- Global Game State ---
let currentBoard: ('X' | 'O' | '')[] = Array(9).fill('');
let currentPlayer: 'X' | 'O' = 'X';
let winner: 'X' | 'O' | 'Draw' | null = null;
let panel: vscode.WebviewPanel | undefined;

// Winning combinations (indices of the board array)
const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];


// --- Game Logic Functions (Host side) ---

function resetGame() {
    currentBoard = Array(9).fill('');
    currentPlayer = 'X';
    winner = null;
    updateWebview();
}

function checkWinner(board: ('X' | 'O' | '')[]): 'X' | 'O' | 'Draw' | null {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a] as 'X' | 'O';
        }
    }
    if (board.every(cell => cell !== '')) {
        return 'Draw';
    }
    return null;
}

function makeMove(index: number) {
    if (!panel || currentBoard[index] !== '' || winner) {
        return;
    }

    currentBoard[index] = currentPlayer;
    winner = checkWinner(currentBoard);

    if (!winner) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }

    updateWebview();

    if (winner) {
        const message = winner === 'Draw' ? "It's a Draw! 🤝" : `${winner} wins! 🎉`;
        vscode.window.showInformationMessage(message);
    }
}

function updateWebview() {
    if (!panel) return;

    let statusText: string;
    let isWinner = false;

    if (winner === 'Draw') {
        statusText = "It's a Draw! Game Over.";
    } else if (winner) {
        statusText = `${winner} is the Winner!`;
        isWinner = true;
    } else {
        statusText = `Current Turn: ${currentPlayer}`;
    }

    panel.webview.postMessage({ 
        command: 'updateBoard', 
        board: currentBoard 
    });
    
    panel.webview.postMessage({
        command: 'updateStatus',
        text: statusText,
        isWinner: isWinner
    });
}


// --- VS Code Extension Lifecycle ---

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('tictactoe.start', () => {
        if (panel) {
            panel.reveal(vscode.ViewColumn.One);
            resetGame();
        } else {
            panel = vscode.window.createWebviewPanel(
                'tictactoe',                 
                'Tic Tac Toe Glow-Up! 🕹️',  
                vscode.ViewColumn.One,      
                { 
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')] 
                }      
            );

            panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

            panel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case 'makeMove':
                        makeMove(message.index); 
                        break;
                    case 'requestState':
                        updateWebview();
                        break;
                }
            });

            panel.onDidDispose(() => {
                panel = undefined;
            });
            
            resetGame(); 
        }
    });

    context.subscriptions.push(disposable);
    vscode.commands.executeCommand('tictactoe.start');
}

export function deactivate() {}


// --- HTML Content Generation (Inline Glow-Up) ---

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    
    const nonce = 'tictactoe-nonce'; 

    const style = `
        /* VS Code Theme Variables are automatically available */
        :root {
            --x-color: var(--vscode-terminal-ansiBrightCyan); 
            --o-color: var(--vscode-terminal-ansiBrightYellow);
            --hover-color: var(--vscode-list-hoverBackground);
            --border-color: var(--vscode-editorGroup-border);
            --status-background: var(--vscode-statusBar-background);
            --winner-background: var(--vscode-terminal-ansiGreen);
        }

        body {
            background-color: var(--vscode-editor-background);
            color: var(--vscode-foreground);
            font-family: var(--vscode-font-family);
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /* Status Banner */
        #status-banner {
            width: 100%;
            max-width: 300px;
            padding: 10px 15px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 1.2em;
            font-weight: 600;
            border-radius: 4px;
            background-color: var(--status-background);
            color: var(--vscode-statusBar-foreground);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }

        .winner-message {
            background-color: var(--winner-background) !important;
            color: var(--vscode-editor-background) !important;
            animation: winner-pulse 1s infinite alternate;
        }

        @keyframes winner-pulse {
            from { box-shadow: 0 0 5px 2px var(--winner-background); }
            to { box-shadow: 0 0 10px 4px var(--winner-background); }
        }

        /* Game Board Layout - FLEXBOX FIX for reliable wrapping */
        #game-board {
            display: flex; /* Key change: Use flexbox */
            flex-wrap: wrap; /* Key change: Allow cells to wrap to the next line */
            width: 304px; /* Set a specific width for 3 cells (3*100px + borders) */
            height: 304px;
            border: 2px solid var(--border-color);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            overflow: hidden;
            background-color: var(--vscode-editor-background);
        }

        /* Cell Styling */
        .cell {
            width: 100px; /* Exact size for Flexbox to calculate 3 in a row */
            height: 100px;
            
            background-color: var(--vscode-editor-background);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 64px;
            font-weight: 900;
            cursor: pointer;
            user-select: none;
            transition: background-color 0.15s ease, transform 0.05s ease;
            
            /* Borders for lines */
            border: 1px solid var(--border-color);
            border-top: none;
            border-left: none;
        }

        /* Explicitly adding back top/left borders for the first row/column */
        /* First row (top edge) */
        #game-board .cell:nth-child(1),
        #game-board .cell:nth-child(2),
        #game-board .cell:nth-child(3) {
            border-top: 1px solid var(--border-color);
        }
        
        /* First column (left edge) */
        #game-board .cell:nth-child(3n + 1) {
            border-left: 1px solid var(--border-color);
        }

        .cell:hover:empty {
            background-color: var(--hover-color);
        }

        /* X and O Color Themes */
        .cell.player-x {
            color: var(--x-color);
        }

        .cell.player-o {
            color: var(--o-color);
        }

        /* Click Animation */
        .cell.clicked {
            transform: scale(0.95);
            box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
            transition: transform 0.05s ease-out;
        }
    `;

    const script = `
        const vscode = acquireVsCodeApi();
        const statusBanner = document.getElementById('status-banner');
        
        function updateStatus(message, isWinner = false) {
            statusBanner.textContent = message;
            statusBanner.classList.toggle('winner-message', isWinner);
        }
        
        function updateBoard(board) {
            board.forEach((value, index) => {
                const cell = document.querySelector(\`.cell[data-index="\${index}"]\`);
                if (cell) {
                    cell.textContent = value;
                    cell.className = 'cell';
                    if (value === 'X') {
                        cell.classList.add('player-x');
                    } else if (value === 'O') {
                        cell.classList.add('player-o');
                    }
                }
            });
        }

        function handleClick(event) {
            const cell = event.target;
            const index = cell.getAttribute('data-index');
            if (!cell.textContent) {
                // Apply visual cue immediately for better feedback
                cell.classList.add('clicked'); 
                
                vscode.postMessage({ command: 'makeMove', index: Number(index) });
            }
        }
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.addEventListener('click', handleClick);
            
            // Only use mousedown/mouseup for visual feedback if 'click' is delayed by extension logic
            // For now, removing the mousedown listener and keeping logic in handleClick to avoid double-firing.
            
            cell.addEventListener('mouseup', () => {
                // Ensure the animation class is removed quickly
                setTimeout(() => cell.classList.remove('clicked'), 50); 
            });

            cell.addEventListener('mouseleave', () => {
                cell.classList.remove('clicked');
            });
        });

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'updateBoard':
                    updateBoard(message.board);
                    break;
                case 'updateStatus':
                    updateStatus(message.text, message.isWinner);
                    break;
            }
        });

        vscode.postMessage({ command: 'requestState' });
    `;

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}' 'unsafe-inline';">
            <title>Tic Tac Toe</title>
            <style nonce="${nonce}">${style}</style>
        </head>
        <body>
            <div id="status-banner">Waiting to start...</div>
            <div id="game-board">
                ${Array(9).fill(0).map((_, i) => `<div class="cell" data-index="${i}"></div>`).join('')}
            </div>
            <script nonce="${nonce}">${script}</script>
        </body>
        </html>
    `;
}