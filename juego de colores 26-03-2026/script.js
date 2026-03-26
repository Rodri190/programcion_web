class Player {
    constructor(type, color) {
        this.type = type; // 'usuario' or 'computer'
        this.color = color;
    }
}

// Clase Celda
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.state = 'empty'; // 'usuario', 'computer'
        this.element = null;
    }

    render() {
        if (!this.element) {
            this.element = document.createElement('div');
            this.element.classList.add('celda');
            this.element.dataset.x = this.x;
            this.element.dataset.y = this.y;
        }
        this.element.classList.remove('user', 'computer');
        if (this.state === 'user') {
            this.element.classList.add('user');
        } else if (this.state === 'computer') {
            this.element.classList.add('computer');
        }
        return this.element;
    }
}


class Board {
    constructor() {
        this.cells = [];
        for (let i = 0; i < 10; i++) {
            this.cells[i] = [];
            for (let j = 0; j < 10; j++) {
                this.cells[i][j] = new Cell(i, j);
            }
        }
    }

    render(container) {
        container.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                container.appendChild(this.cells[i][j].render());
            }
        }
    }

    paintCell(x, y, playerType) {
        if (x < 0 || x >= 10 || y < 0 || y >= 10) return;
        const cell = this.cells[x][y];
        if (cell.state !== 'empty') return;
        cell.state = playerType;
        cell.render();

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10) {
                const adjCell = this.cells[nx][ny];
                if (adjCell.state === 'empty') {
                    adjCell.state = playerType;
                    adjCell.render();
                }
            }
        });
    }

    getEmptyCells() {
        const empty = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (this.cells[i][j].state === 'empty') {
                    empty.push([i, j]);
                }
            }
        }
        return empty;
    }

    getState() {
        return this.cells.map(row => row.map(cell => cell.state));
    }

    setState(state) {
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.cells[i][j].state = state[i][j];
            }
        }
    }
}

class Game {
    constructor() {
        this.board = new Board();
        this.user = new Player('user', 'black');
        this.computer = new Player('computer', 'lightblue');
        this.currentTurn = 'user'; // 'persona' o 'computador'
        this.userClicks = 0;
        this.computerMoves = 0;
        this.loadGame();
        this.board.render(document.getElementById('tablero'));
        this.updateUI();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('tablero').addEventListener('click', (e) => {
            if (e.target.classList.contains('celda')) {
                const x = parseInt(e.target.dataset.x);
                const y = parseInt(e.target.dataset.y);
                this.userMove(x, y);
            }
        });
        document.getElementById('reiniciar').addEventListener('click', () => {
            this.resetGame();
        });
    }

    userMove(x, y) {
        if (this.currentTurn !== 'user') return;
        const cell = this.board.cells[x][y];
        if (cell.state !== 'empty') return;
        this.board.paintCell(x, y, 'user');
        this.userClicks++;
        this.currentTurn = 'computer';
        this.updateUI();
        this.saveGame();

        setTimeout(() => {
            this.computerMove();
        }, 500);
    }

    computerMove() {
        const emptyCells = this.board.getEmptyCells();
        if (emptyCells.length === 0) {
            this.endGame();
            return;
        }
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const [x, y] = emptyCells[randomIndex];
        this.board.paintCell(x, y, 'computer');
        this.computerMoves++;
        this.currentTurn = 'user';
        this.updateUI();
        this.saveGame();
    }

    updateUI() {
        document.getElementById('turno').textContent = this.currentTurn === 'user' ? 'Usuario' : 'Computadora';
        document.getElementById('clicks-usuario').textContent = this.userClicks;
        document.getElementById('movimientos-computadora').textContent = this.computerMoves;
    }

    endGame() {
        alert('¡Juego terminado! No hay más movimientos posibles.');
    }

    resetGame() {
        this.board = new Board();
        this.currentTurn = 'user';
        this.userClicks = 0;
        this.computerMoves = 0;
        this.board.render(document.getElementById('tablero'));
        this.updateUI();
        this.saveGame();
    }

    saveGame() {
        const state = {
            board: this.board.getState(),
            currentTurn: this.currentTurn,
            userClicks: this.userClicks,
            computerMoves: this.computerMoves
        };
        localStorage.setItem('buscaminasGame', JSON.stringify(state));
    }

    loadGame() {
        const saved = localStorage.getItem('buscaminasGame');
        if (saved) {
            const state = JSON.parse(saved);
            this.board.setState(state.board);
            this.currentTurn = state.currentTurn;
            this.userClicks = state.userClicks;
            this.computerMoves = state.computerMoves;
        }
    }
}

// Iniciar el juego
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});