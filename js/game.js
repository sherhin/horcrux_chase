import { map, drawMap } from './map.js';
import { player } from './player.js';
import { horcruxes, generateHorcruxes, drawHorcruxes, checkPickup } from './horcruxManager.js';
import { tom, initTom, moveTom, drawTom, sayTomQuote, updateSpeechPosition } from './tom.js';
import { findPath } from './pathfinding.js';

let canvas, ctx;
const tileSize = 58;
let assetsLoaded = 0;
let gameState = 'playing';
let wallImage, floorImage, harryImage, snakeImage, diademImage, diaryImage, tomImage;
let winImage, loseImage;
let restartBtn;

window.onload = () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  restartBtn = document.getElementById('restartBtn'); 

  wallImage = loadImage('/assets/walls.png');
  floorImage = loadImage('/assets/floor.png');
  harryImage = loadImage('/assets/harry1.png');
  tomImage = loadImage('/assets/tom.png');
  snakeImage = loadImage('/assets/snake.png');
  diademImage = loadImage('/assets/diadem.png');
  diaryImage = loadImage('/assets/diary.png');
  winImage = loadImage('/assets/win_screen.png');
  loseImage = loadImage('/assets/lose_screen.png');

  restartBtn.addEventListener('click', () => {
    player.x = tileSize;
    player.y = tileSize;
    initTom(tomImage, tileSize);
    generateHorcruxes([snakeImage, diademImage, diaryImage], map);

    gameState = 'playing';
    restartBtn.style.display = 'none';

    // Скрываем фразу Тома если он говорит
    const tomSpeech = document.getElementById('tomSpeech');
    tomSpeech.style.display = 'none';

  draw();
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
  if (assetsLoaded === 9) {
    player.init(harryImage, tileSize);
    initTom(tomImage, tileSize);
    generateHorcruxes([snakeImage, diademImage, diaryImage], map);
    draw();
    setupControls();
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
    const path = findPath(
      Math.floor(tom.x / tileSize),
      Math.floor(tom.y / tileSize),
      Math.floor(player.x / tileSize),
      Math.floor(player.y / tileSize),
      map
    );

    moveTom(path, tileSize);

    if (tom.x === player.x && tom.y === player.y) {
      gameState = 'lose';
    }

    draw();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap(ctx, tileSize, wallImage, floorImage);
  drawHorcruxes(ctx, tileSize);
  player.draw(ctx, tileSize);
  drawTom(ctx, tileSize);
  updateSpeechPosition(canvas, tileSize);


  if (gameState === 'win') {
    ctx.drawImage(winImage, 0, 0, canvas.width, canvas.height);
    restartBtn.style.display = 'block';
  } else if (gameState === 'lose') {
    ctx.drawImage(loseImage, 0, 0, canvas.width, canvas.height);
    restartBtn.style.display = 'block';
  } else {
    restartBtn.style.display = 'none';
  }
}

