'use strict';

const numberbox = document.getElementById("numberbox");
const slider = document.getElementById("slider");
const progressBar = document.getElementById("progress-bar");
const playButton = document.getElementById('play-button');
const pauseButton = document.getElementById("pause-button");
const resetButton = document.getElementById("reset-button");

const queen = '<i class="fas fa-chess-queen" style="color:#000"></i>';

let n, speed, tempSpeed, q, Board = 0;
let isPaused = false;
let isRunning = false;

let array = [0, 2, 1, 1, 3, 11, 5, 41, 93];

let pos = {};

speed = (100 - slider.value) * 10;
tempSpeed = speed;

slider.oninput = function () {
    progressBar.style.width = this.value + "%";
    speed = (100 - this.value) * 10;
}

class Queen {
    constructor() {
        this.position = Object.assign({}, pos);
        this.uuid = [];
    }

    nQueen = async () => {
        Board = 0;
        this.position[`${Board}`] = {};
        numberbox.disabled = true;
        isRunning = true;
        await q.solveQueen(Board, 0, n);
        await q.clearColor(Board);
        numberbox.disabled = false;
        isRunning = false;
    }

    isValid = async (board, r, col, n) => {
        if (!isRunning) return false; // stop if not running
        while (isPaused) await this.delay(50);

        const table = document.getElementById(`table-${this.uuid[board]}`);
        const currentRow = table.firstChild.childNodes[r];
        const currentColumn = currentRow.getElementsByTagName("td")[col];
        currentColumn.innerHTML = queen;
        await this.delay();

        // Check column
        for (let i = r - 1; i >= 0; --i) {
            const row = table.firstChild.childNodes[i];
            const column = row.getElementsByTagName("td")[col];
            const value = column.innerHTML;
            if (value === queen) {
                column.style.backgroundColor = "#FB5607";
                currentColumn.innerHTML = "-";
                return false;
            }
            column.style.backgroundColor = "#ffca3a";
            await this.delay();
        }

        // Check upper left diagonal
        for (let i = r - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
            const row = table.firstChild.childNodes[i];
            const column = row.getElementsByTagName("td")[j];
            const value = column.innerHTML;
            if (value === queen) {
                column.style.backgroundColor = "#fb5607";
                currentColumn.innerHTML = "-";
                return false;
            }
            column.style.backgroundColor = "#ffca3a";
            await this.delay();
        }

        // Check upper right diagonal
        for (let i = r - 1, j = col + 1; i >= 0 && j < n; --i, ++j) {
            const row = table.firstChild.childNodes[i];
            const column = row.getElementsByTagName("td")[j];
            const value = column.innerHTML;
            if (value === queen) {
                column.style.backgroundColor = "#FB5607";
                currentColumn.innerHTML = "-";
                return false;
            }
            column.style.backgroundColor = "#ffca3a";
            await this.delay();
        }

        return true;
    }

    clearColor = async (board) => {
        const table = document.getElementById(`table-${this.uuid[board]}`);
        for (let j = 0; j < n; ++j) {
            const row = table.firstChild.childNodes[j];
            for (let k = 0; k < n; ++k) {
                if ((j + k) & 1) {
                    row.getElementsByTagName("td")[k].style.backgroundColor = "#FF9F1C";
                } else {
                    row.getElementsByTagName("td")[k].style.backgroundColor = "#FCCD90";
                }
            }
        }
    }

    delay = async (ms = speed) => {
        while (isPaused) {
            await new Promise(r => setTimeout(r, 50));
        }
        return new Promise((done) => setTimeout(done, ms));
    }

    solveQueen = async (board, r, n) => {
        if (!isRunning) return false; // stop recursion if not running
        if (r === n) {
            ++Board;
            this.position[Board] = Object.assign({}, this.position[board]);
            let table = document.getElementById(`table-${this.uuid[Board]}`);
            if (table) {
                for (let k = 0; k < n; ++k) {
                    let row = table.firstChild.childNodes[k];
                    row.getElementsByTagName("td")[this.position[board][k]].innerHTML = queen;
                }
            }
            return true;
        }

        for (let i = 0; i < n; ++i) {
            if (!isRunning) return false;
            await this.delay();
            await this.clearColor(board);
            if (await this.isValid(board, r, i, n)) {
                await this.clearColor(board);
                let table = document.getElementById(`table-${this.uuid[board]}`);
                let row = table.firstChild.childNodes[r];
                row.getElementsByTagName("td")[i].innerHTML = queen;

                this.position[board][r] = i;

                if (await this.solveQueen(board, r + 1, n)) {
                    await this.clearColor(board);
                }

                await this.delay();
                board = Board;
                table = document.getElementById(`table-${this.uuid[board]}`);
                row = table.firstChild.childNodes[r];
                row.getElementsByTagName("td")[i].innerHTML = "-";

                delete this.position[`${board}`][`${r}`];
            }
        }
        return false;
    }
}

// Helper function to trigger file download
function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

playButton.onclick = async function visualise() {
    if (isRunning) return; // prevent multiple runs


    const chessBoard = document.getElementById("n-queen-board");
    const arrangement = document.getElementById("queen-arrangement");

    n = parseInt(numberbox.value);
    if (isNaN(n)) {
        alert("Please enter a valid number");
        return;
    }

    q = new Queen();

    if (n > 8) {
        numberbox.value = "";
        alert("Queen value is too large");
        return;
    } else if (n < 1) {
        numberbox.value = "";
        alert("Queen value is too small");
        return;
    }

    // Clear previous content
    while (chessBoard.firstChild) {
        chessBoard.removeChild(chessBoard.firstChild);
    }
    while (arrangement.firstChild) {
        arrangement.removeChild(arrangement.firstChild);
    }

    // Show arrangements info
    const para = document.createElement("p");
    para.setAttribute("class", "queen-info");
    para.textContent = `For ${n}x${n} board, ${array[n] - 1} arrangements are possible.`;
    arrangement.appendChild(para);

    // Create boards
    for (let i = 0; i < array[n]; ++i) {
        q.uuid.push(Math.random());
        let div = document.createElement('div');
        let table = document.createElement('table');
        let header = document.createElement('h4');

        header.textContent = `Board ${i + 1}`;
        table.id = `table-${q.uuid[i]}`;
        header.id = `paragraph-${i}`;

        div.appendChild(header);
        div.appendChild(table);
        chessBoard.appendChild(div);
    }

    // Build empty boards
    for (let k = 0; k < array[n]; ++k) {
        let table = document.getElementById(`table-${q.uuid[k]}`);
        for (let i = 0; i < n; ++i) {
            const row = table.insertRow(i);
            for (let j = 0; j < n; ++j) {
                const col = row.insertCell(j);
                (i + j) & 1
                    ? (col.style.backgroundColor = "#FF9F1C")
                    : (col.style.backgroundColor = "#FCCD90");
                col.innerHTML = "-";
                col.style.border = "0.3px solid #373f51";
            }
        }
        await q.clearColor(k);
    }

    // Run solver visualization
    await q.nQueen();

};

// Pause button handler
pauseButton.onclick = () => {
    if (!isRunning) return; // no effect if not running
    isPaused = !isPaused;
    pauseButton.innerHTML = isPaused
        ? '<i class="fa fa-play" aria-hidden="true"></i> Resume'
        : '<i class="fa fa-stop" aria-hidden="true"></i> Pause';
};

// Reset button handler
resetButton.onclick = () => {
    isPaused = false;
    isRunning = false;

    numberbox.disabled = false;
    numberbox.value = '';

    progressBar.style.width = "0%";

    const chessBoard = document.getElementById("n-queen-board");
    while (chessBoard.firstChild) {
        chessBoard.removeChild(chessBoard.firstChild);
    }

    const arrangement = document.getElementById("queen-arrangement");
    while (arrangement.firstChild) {
        arrangement.removeChild(arrangement.firstChild);
    }

    Board = 0;
    q = null;

    slider.value = 60;
    progressBar.style.width = slider.value + "%";
    speed = slider.value * 10;

    pauseButton.innerHTML = '<i class="fa fa-stop" aria-hidden="true"></i> Stop';

};

const speedDisplay = document.getElementById("speed-display");

// Initialize on page load
speedDisplay.textContent = `Speed: ${100 - slider.value}%`;

slider.oninput = function () {
    progressBar.style.width = this.value + "%";
    speed = (100 - this.value) * 10;
    speedDisplay.textContent = `Speed: ${this.value}%`; // shows speed increasing rightwards
};
