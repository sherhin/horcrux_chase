import { map, drawMap } from './map.js';
import { player } from './player.js';
import { horcruxes, generateHorcruxes, drawHorcruxes, checkPickup } from './horcruxManager.js';
import { tom, initTom, moveTom, drawTom, sayTomQuote, updateSpeechPosition, stopTomSpeech } from './tom.js';
import { findPath } from './pathfinding.js';
import { updateAndDrawParticles } from './particle.js';

let canvas, ctx;
const tileSize = 58;
let assetsLoaded = 0;
let gameState = 'playing';
let wallImage, floorImage, harryImage, tomImage;
let snakeImage, diademImage, diaryImage, locketImage, ringImage
let winImage, loseImage;
let restartBtn;
let tomInterval;
const tomSpeed = 2;

window.onload = () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  restartBtn = document.getElementById('restartBtn'); 

  wallImage = loadImage('./assets/walls.png');
  floorImage = loadImage('./assets/floor.png');
  harryImage = loadImage('./assets/harry.png');
  tomImage = loadImage('./assets/tom.png');
  snakeImage = loadImage('./assets/snake.png');
  diademImage = loadImage('./assets/diadem.png');
  diaryImage = loadImage('./assets/diary.png');
  ringImage = loadImage('./assets/ring.png');
  locketImage = loadImage('./assets/locket.png')
  winImage = loadImage('./assets/win_screen.png');
  loseImage = loadImage('./assets/lose_screen.png');

  restartBtn.addEventListener('click', () => {
    player.x = tileSize;
    player.y = tileSize;
    initTom(tomImage, tileSize);
    generateHorcruxes([snakeImage, diademImage, diaryImage, locketImage, ringImage], map);

    gameState = 'playing';
    restartBtn.style.display = 'none';

    stopTomSpeech();
  });
};



function loadImage(src) {
  const img = new Image();
  img.src = src;
  img.onload = assetLoaded;
  return img;
}

function assetLoaded() {
  assetsLoaded++;
  if (assetsLoaded === 11) {
    player.init(harryImage, tileSize);
    initTom(tomImage, tileSize);
    generateHorcruxes([snakeImage, diademImage, diaryImage, ringImage, locketImage], map);
    setupControls();
    startTomLoop();
    requestAnimationFrame(loop);
  }
}


function setupControls() {
  document.addEventListener('keydown', onKey);
}

function onKey(e) {
  if (gameState !== 'playing') return;

  let dx = 0, dy = 0;
  switch (e.key) {
    case 'ArrowUp': dy = -tileSize; break;
    case 'ArrowDown': dy = tileSize; break;
    case 'ArrowLeft': dx = -tileSize; break;
    case 'ArrowRight': dx = tileSize; break;
    default: return; // Ignore other keys
  }

const moved = player.move(dx, dy, tileSize, map);
if (moved) {
  const allCollected = checkPickup(moved.col, moved.row, () => {
    if (gameState === 'playing') {
      sayTomQuote();
    }
  });

  if (allCollected) {
    gameState = 'win';
  }
  if (tom.x === player.x && tom.y === player.y) {
    gameState = 'lose';
  }
  }
}

function startTomLoop() {
  if (tomInterval) clearInterval(tomInterval);
  tomInterval = setInterval(() => {
    if (gameState !== 'playing') return;
    const path = findPath(
      Math.floor(tom.x / tileSize),
      Math.floor(tom.y / tileSize),
      Math.floor(player.x / tileSize),
      Math.floor(player.y / tileSize),
      map
    );
    moveTom(path, tileSize, tomSpeed);
    if (tom.x === player.x && tom.y === player.y) {
      gameState = 'lose';
    }
  }, 300);
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap(ctx, tileSize, wallImage, floorImage);
  drawHorcruxes(ctx, tileSize);
  player.draw(ctx, tileSize);
  drawTom(ctx, tileSize);
  updateAndDrawParticles(ctx);
  updateSpeechPosition(canvas, tileSize);


  if (gameState === 'win') {
    stopTomSpeech();
    ctx.drawImage(winImage, 0, 0, canvas.width, canvas.height);
    restartBtn.style.display = 'block';
  } else if (gameState === 'lose') {
    stopTomSpeech();
    ctx.drawImage(loseImage, 0, 0, canvas.width, canvas.height);
    restartBtn.style.display = 'block';
  } else {
    restartBtn.style.display = 'none';
  }
}

function loop() {
  draw();
  requestAnimationFrame(loop);
}

