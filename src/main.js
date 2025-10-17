// File: media/main.js

const vscode = acquireVsCodeApi(); // VS Code API bridge
const statusBanner = document.getElementById('status-banner');
const gameBoard = document.getElementById('game-board');

/**
 * Updates the text and style of the status banner.
 * @param {string} message - The text to display.
 * @param {boolean} isWinner - Whether to apply the winner pulse style.
 */
function updateStatus(message, isWinner = false) {
    statusBanner.textContent = message;
    statusBanner.classList.toggle('winner-message', isWinner);
}

/**
 * Handles the user clicking a cell.
 * Triggers the click animation and sends a message to the extension.
 */
function handleCellClick(event) {
    const cell = event.target;
    const index = cell.getAttribute('data-index');

    if (!cell.textContent) {
        // 1. Send move command to the VS Code Extension (extension.ts)
        vscode.postMessage({
            command: 'makeMove',
            index: index
        });
    }
}

// Attach event listeners to all cells
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', handleCellClick);
    
    // Mousedown for the visual click animation (quick scale down)
    cell.addEventListener('mousedown', () => {
        if (!cell.textContent) { 
            cell.classList.add('clicked');
        }
    });

    cell.addEventListener('mouseup', () => {
        // Remove 'clicked' class quickly after mouse up
        setTimeout(() => cell.classList.remove('clicked'), 50); 
    });

    cell.addEventListener('mouseleave', () => {
        // Remove if user drags cursor out
        cell.classList.remove('clicked');
    });
});


/**
 * Listens for messages from the VS Code Extension Host (e.g., game state updates).
 */
window.addEventListener('message', event => {
    const message = event.data; 

    switch (message.command) {
        case 'updateBoard':
            // Update the board with the current state array
            message.board.forEach((value, index) => {
                const cell = document.querySelector(`.cell[data-index="${index}"]`);
                if (cell) {
                    cell.textContent = value; 
                    cell.className = 'cell'; // Reset classes
                    if (value === 'X') {
                        cell.classList.add('player-x');
                    } else if (value === 'O') {
                        cell.classList.add('player-o');
                    }
                }
            });
            break;

        case 'updateStatus':
            // Update the status banner
            updateStatus(message.text, message.isWinner);
            break;
            
        case 'resetGame':
            // Simple board reset for new game
            document.querySelectorAll('.cell').forEach(cell => {
                cell.textContent = '';
                cell.className = 'cell';
            });
            updateStatus("Game started. X's turn.");
            break;
    }
});