const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 58;
let gameState = "playing"; // playing | win | lose
let harryX = tileSize;
let harryY = tileSize;
let tomX = 10 * tileSize;
let tomY = 2 * tileSize;
let horcruxes = [];
let assetsLoaded = 0;
let tomSpeaking = false;
let tomSpeechTimer = null;

const restartBtn = document.getElementById('restartBtn');

const tomQuotes = [
    "Отдай это, Поттер.",
    "Ты будешь умолять меня о пощаде!",
    "Это МОЁ!",
    "Ты за это поплатишься.",
    "Бережно обращайся с моей душой.",
    "Ты думаешь, это поможет сбежать от меня?",
    "Зачем убегать, Гарри?"
];


const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1],
    [0,1,1,1,0,1,1,0,0,1,0,1],
    [0,1,0,0,0,0,1,0,0,1,0,1],
    [0,1,0,1,1,0,1,0,0,1,0,1],
    [0,0,0,0,0,0,1,0,0,0,0,1],
    [0,0,0,0,0,0,1,0,1,1,0,1],
    [0,1,1,1,1,0,1,0,1,1,0,1],
    [0,0,0,0,1,0,0,0,0,0,0,1],
    [0,1,0,1,1,0,0,0,1,1,0,1],
    [0,1,0,0,0,0,0,0,0,0,0,1],
    [0,1,0,1,1,1,0,1,1,0,1,1],
    [0,0,0,0,0,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1]
];


// Images
const wallImage = loadImage('/assets/walls.png');
const floorImage = loadImage('/assets/floor.png');
const harryImage = loadImage('/assets/harry1.png');
const tomImage = loadImage('/assets/tom.png');
const locketImage = loadImage('/assets/locket.png');
const snakeImage = loadImage('/assets/snake.png');
const diaryImage = loadImage('/assets/diary.png');
const diademImage = loadImage('/assets/diadem.png');
const winImage = loadImage('/assets/win_screen.png');
const loseImage = loadImage('/assets/lose_screen.png');

let horcruxTemplates = [];

function loadImage(src) {
    const img = new Image();
    img.src = src;
    img.onload = assetLoaded;
    return img;
}

const tomSpeech = document.getElementById('tomSpeech');
function randomTomQuote() {
    const index = Math.floor(Math.random() * tomQuotes.length);
    tomSpeech.innerText = tomQuotes[index];
    tomSpeech.style.display = 'block';
    tomSpeaking = true;

    if (tomSpeechTimer) clearTimeout(tomSpeechTimer);

    tomSpeechTimer = setTimeout(() => {
        tomSpeech.style.display = 'none';
        tomSpeaking = false;
    }, 2000);
}


function generateHorcruxes() {
    horcruxes.length = 0; // очищаем текущий массив
    while (horcruxes.length < horcruxTemplates.length) {
        const x = Math.floor(Math.random() * map[0].length);
        const y = Math.floor(Math.random() * map.length);
        if (map[y][x] === 0 && !horcruxes.some(h => h.x === x && h.y === y)) {
            horcruxes.push({ image: horcruxTemplates[horcruxes.length], x, y });
        }
    }
}

// Asset Loader Counter
function assetLoaded() {
    assetsLoaded++;
    if (assetsLoaded === 10) {
        horcruxTemplates = [locketImage, snakeImage, diaryImage, diademImage];  // <-- вот сюда!
        generateHorcruxes();
        draw();
    }
}

// Controls
document.addEventListener('keydown', function(event) {
    if (gameState !== "playing") return;
    switch(event.key) {
        case "ArrowUp": move(0, -tileSize); break;
        case "ArrowDown": move(0, tileSize); break;
        case "ArrowLeft": move(-tileSize, 0); break;
        case "ArrowRight": move(tileSize, 0); break;
    }
    draw();
});

function move(deltaX, deltaY) {
    const newX = harryX + deltaX;
    const newY = harryY + deltaY;
    const col = Math.floor(newX / tileSize);
    const row = Math.floor(newY / tileSize);

    if (map[row] && map[row][col] === 0) {
        harryX = newX;
        harryY = newY;
        checkHorcruxPickup(col, row);
    }

    moveTom();
}

function checkHorcruxPickup(col, row) {
    for (let i = 0; i < horcruxes.length; i++) {
        if (horcruxes[i].x === col && horcruxes[i].y === row) {
            horcruxes.splice(i, 1);
            console.log('Подобран хоркрукс!');
            randomTomQuote();
            break;
        }
    }

    if (horcruxes.length === 0) {
        gameState = "win";
    }
}

function moveTom() {
    const tomCol = Math.floor(tomX / tileSize);
    const tomRow = Math.floor(tomY / tileSize);
    const harryCol = Math.floor(harryX / tileSize);
    const harryRow = Math.floor(harryY / tileSize);

    const path = findPath(tomCol, tomRow, harryCol, harryRow);
    if (path.length > 0) {
        const nextStep = path[0];
        tomX = nextStep.col * tileSize;
        tomY = nextStep.row * tileSize;
    }

    if (tomX === harryX && tomY === harryY) {
        gameState = "lose";
    }
}

function heuristic(c, r, ec, er) {
    return Math.abs(c - ec) + Math.abs(r - er);
}

function findPath(startCol, startRow, endCol, endRow) {
    const openList = [{ col: startCol, row: startRow, g: 0, h: heuristic(startCol, startRow, endCol, endRow), parent: null }];
    const closedList = [];

    while (openList.length > 0) {
        openList.sort((a, b) => (a.g + a.h) - (b.g + b.h));
        const current = openList.shift();
        closedList.push(current);

        if (current.col === endCol && current.row === endRow) {
            const path = [];
            let node = current;
            while (node.parent) {
                path.unshift(node);
                node = node.parent;
            }
            return path;
        }

        const neighbors = [
            { col: current.col + 1, row: current.row },
            { col: current.col - 1, row: current.row },
            { col: current.col, row: current.row + 1 },
            { col: current.col, row: current.row - 1 }
        ];

        for (const neighbor of neighbors) {
            if (map[neighbor.row]?.[neighbor.col] === 0 && !closedList.find(n => n.col === neighbor.col && n.row === neighbor.row)) {
                if (!openList.find(n => n.col === neighbor.col && n.row === neighbor.row)) {
                    openList.push({
                        col: neighbor.col,
                        row: neighbor.row,
                        g: current.g + 1,
                        h: heuristic(neighbor.col, neighbor.row, endCol, endRow),
                        parent: current
                    });
                }
            }
        }
    }
    return [];
}

function drawMap() {
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const x = col * tileSize;
            const y = row * tileSize;

            if (map[row][col] === 1) {
                ctx.drawImage(wallImage, x, y, tileSize, tileSize);
            } else {
                ctx.drawImage(floorImage, x, y, tileSize, tileSize);
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();

    horcruxes.forEach(h => {
        ctx.drawImage(h.image, h.x * tileSize, h.y * tileSize, tileSize, tileSize);
    });

    ctx.drawImage(harryImage, harryX, harryY, tileSize, tileSize);
    ctx.drawImage(tomImage, tomX, tomY, tileSize * 1.4, tileSize * 1.4);

    // Overlay screens
    if (gameState === "win") {
        ctx.drawImage(winImage, 0, 0, canvas.width, canvas.height);
    } else if (gameState === "lose") {
        ctx.drawImage(loseImage, 0, 0, canvas.width, canvas.height);
    }
    if (gameState === "win" || gameState === "lose") {
        restartBtn.style.display = "block";
    } else {
        restartBtn.style.display = "none";
    }
    if (tomSpeaking) {
    const rect = canvas.getBoundingClientRect();
    const speechX = rect.left + tomX + tileSize / 2;
    const speechY = rect.top + tomY - 20;

    tomSpeech.style.left = `${speechX}px`;
    tomSpeech.style.top = `${speechY}px`;
}
}
function resetGame() {
    harryX = tileSize;
    harryY = tileSize;
    tomX = 10 * tileSize;
    tomY = 2 * tileSize;

    generateHorcruxes();

    gameState = "playing";
    restartBtn.style.display = "none";
    draw();
}
restartBtn.addEventListener('click', resetGame);


