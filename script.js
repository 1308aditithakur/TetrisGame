let canvas = document.querySelector("#tetris");
let scoreboard = document.getElementById("score");
let ctx = canvas.getContext("2d");
ctx.scale(30,30);

const SHAPES = [
    [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]
    ],
    [
        [0,1,0],  
        [0,1,0],  
        [1,1,0]   
    ],
    [
        [0,1,0],
        [0,1,0],
        [0,1,1]
    ],
    [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    [
        [1,1,1],
        [0,1,0],
        [0,0,0]
    ],
    [
        [1,1],
        [1,1],
    ]
]

const COLORS = [
    "#fff",
    "#9b5fe0",
    "#16a4d8",
    "#60dbe8",
    "#8bd346",
    "#efdf48",
    "#f9a52c",
    "#d64e12"
]

const ROWS = 20;
const COLS = 10;

let grid = generateGrid();
let fallingPieceObj = null;
let nextPieceObj = randomPieceObject();
let score = 0;

setInterval(newGameState,500);

function newGameState() {
    checkGrid();
    if (!fallingPieceObj) {
        fallingPieceObj = nextPieceObj;
        nextPieceObj = randomPieceObject();
        renderPiece();
        renderNextPiece();
    }
    moveDown();
}

function checkGrid() {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        if (grid[i].every(cell => cell !== 0)) {
            count++;
            grid.splice(i, 1);
            grid.unshift(new Array(COLS).fill(0));
        }
    }
    if (count === 1) score += 10;
    else if (count === 2) score += 30;
    else if (count === 3) score += 50;
    else if (count > 3) score += 100;

    scoreboard.innerHTML = "Score: " + score;
}

function generateGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPieceObject() {
    const ran = Math.floor(Math.random() * SHAPES.length);
    return {
        piece: SHAPES[ran],
        colorIndex: ran + 1,
        x: 4,
        y: 0
    };
}

function renderPiece() {
    let piece = fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j]) {
                ctx.fillStyle = COLORS[fallingPieceObj.colorIndex];
                ctx.fillRect(fallingPieceObj.x + j, fallingPieceObj.y + i, 1, 1);
            }
        }
    }
}

function moveDown() {
    if (!collision(fallingPieceObj.x, fallingPieceObj.y + 1)) {
        fallingPieceObj.y++;
    } else {
        let piece = fallingPieceObj.piece;
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (piece[i][j]) {
                    let p = fallingPieceObj.x + j;
                    let q = fallingPieceObj.y + i;
                    grid[q][p] = fallingPieceObj.colorIndex;
                }
            }
        }
        if (fallingPieceObj.y === 0) {
            document.getElementById("game-over").style.display = "block";
            return; // Stop the game
            }

        fallingPieceObj = null;
    }
    renderGame();
}

function moveLeft() {
    if (!collision(fallingPieceObj.x - 1, fallingPieceObj.y)) {
        fallingPieceObj.x--;
    }
    renderGame();
}

function moveRight() {
    if (!collision(fallingPieceObj.x + 1, fallingPieceObj.y)) {
        fallingPieceObj.x++;
    }
    renderGame();
}

function rotate() {
    let rotatedPiece = fallingPieceObj.piece[0].map((_, i) =>
        fallingPieceObj.piece.map(row => row[i]).reverse()
    );
    if (!collision(fallingPieceObj.x, fallingPieceObj.y, rotatedPiece)) {
        fallingPieceObj.piece = rotatedPiece;
    }
    renderGame();
}

function collision(x, y, rotatedPiece) {
    let piece = rotatedPiece || fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j]) {
                let p = x + j;
                let q = y + i;
                if (p < 0 || p >= COLS || q >= ROWS || (q >= 0 && grid[q][p] !== 0)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function renderGame() {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            ctx.fillStyle = COLORS[grid[i][j]];
            ctx.fillRect(j, i, 1, 1);
        }
    }
    renderPiece();
}

document.addEventListener("keydown", function (e) {
    if (document.getElementById("game-over").style.display === "block") {
        // Restart the game
        document.getElementById("game-over").style.display = "none";
        grid = generateGrid();
        score = 0;
        fallingPieceObj = null;
        scoreboard.innerHTML = "Score: 0";
        return;
    }

    // Regular controls
    if (!fallingPieceObj) return;
    if (e.key === "ArrowDown") moveDown();
    else if (e.key === "ArrowLeft") moveLeft();
    else if (e.key === "ArrowRight") moveRight();
    else if (e.key === "ArrowUp") rotate();
});

const toggleBtn = document.getElementById("toggle-theme");
toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    toggleBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

function renderNextPiece() {
    let previewCanvas = document.getElementById("preview");
    let previewCtx = previewCanvas.getContext("2d");
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    let piece = nextPieceObj.piece;
    let colorIndex = nextPieceObj.colorIndex;
    previewCtx.fillStyle = COLORS[colorIndex];

    let scale = 30;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j]) {
                previewCtx.fillRect(j * scale, i * scale, scale, scale);
            }
        }
    }
}
