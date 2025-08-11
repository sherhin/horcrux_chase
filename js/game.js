import { drawMap, generateMap } from './map.js';
import { player } from './player.js';
import { horcruxes, generateHorcruxes, drawHorcruxes, checkPickup } from './horcruxManager.js';
import { tom, initTom, moveTom, drawTom, sayTomQuote, updateSpeechPosition, stopTomSpeech } from './tom.js';
import { findPath } from './pathfinding.js';
import { updateAndDrawParticles, particles, spawnParticles } from './particle.js';
import { generateDementors, drawDementors, updateDementors, getDementors } from './dementor.js';

let canvas, ctx;
let tileSize;
let assetsLoaded = 0;
const TOTAL_ASSETS = 12;
let gameState = 'playing';
let wallImage, floorImage, harryImage, tomImage;
let snakeImage, diademImage, diaryImage, locketImage, ringImage;
let winImage, loseImage;
let winSound, loseSound;
let dementorImage;
let restartBtn;
let tomInterval;

export const DIFFICULTY_SETTINGS = {
  easy: {
    mapWidth: 10,
    mapHeight: 12,
    tomSpeed: 0.6,
    horcruxCount: 3,
    dementorCount: 2,
    wallChance: 0.15,
    moveDuration: 700,
    moveCooldown: 1200,
    MIN_DISTANCE: 2
  },
  normal: {
    mapWidth: 12,
    mapHeight: 15,
    tomSpeed: 0.8,
    horcruxCount: 4,
    dementorCount: 3,
    wallChance: 0.2,
    moveDuration: 600,
    moveCooldown: 1000,
    MIN_DISTANCE: 2
  },
  hard: {
    mapWidth: 14,
    mapHeight: 17,
    tomSpeed: 1.0,
    horcruxCount: 5,
    dementorCount: 4,
    wallChance: 0.25,
    moveDuration: 500,
    moveCooldown: 800,
    MIN_DISTANCE: 2
  }
};

let currentDifficulty = 'normal';
let currentSettings = DIFFICULTY_SETTINGS[currentDifficulty];
let tomSpeed = currentSettings.tomSpeed;
let MIN_DISTANCE = currentSettings.MIN_DISTANCE;
let MAP_WIDTH = currentSettings.mapWidth;
let MAP_HEIGHT = currentSettings.mapHeight;
let wallChance = currentSettings.wallChance;
let horcruxCount = currentSettings.horcruxCount;
let dementorCount = currentSettings.dementorCount;
let moveDuration = currentSettings.moveDuration;
let moveCooldown = currentSettings.moveCooldown;
let startRequested = false;
let controlsInitialized = false;
let loopStarted = false;
let resizeBound = false;
let map;
let harryStart;
let tomStart;


let winCount = parseInt(sessionStorage.getItem('wins') || '0');
let loseCount = parseInt(sessionStorage.getItem('losses') || '0');
let winDisplay, loseDisplay;

function updateScoreboard() {
  if (winDisplay) winDisplay.textContent = winCount;
  if (loseDisplay) loseDisplay.textContent = loseCount;
}

function setGameState(state) {
  if (gameState === state) return;
  gameState = state;
  if (state === 'win') {
    winCount++;
    sessionStorage.setItem('wins', winCount);
    winSound.currentTime = 0;
    winSound.play().catch(() => {});
  } else if (state === 'lose') {
    loseCount++;
    sessionStorage.setItem('losses', loseCount);
    loseSound.currentTime = 0;
    loseSound.play().catch(() => {});
    const startScreen = document.getElementById('start-screen');
    const diffSelect = document.getElementById('difficulty');
    if (startScreen && diffSelect) {
      startScreen.style.display = 'block';
      diffSelect.value = sessionStorage.getItem('difficulty') || currentDifficulty;
    }
  }
  updateScoreboard();
}

function generateLevel() {
  while (true) {
    const newMap = generateMap(MAP_WIDTH, MAP_HEIGHT, wallChance);
    const h = { col: 1, row: 1 };
    const t = { col: newMap[0].length - 2, row: newMap.length - 2 };
    if (newMap[h.row][h.col] !== 0) continue;
    if (newMap[t.row][t.col] !== 0) continue;
    const path = findPath(t.col, t.row, h.col, h.row, newMap);
    if (path.length === 0) continue;
    map = newMap;
    harryStart = h;
    tomStart = t;
    break;
  }
}

function resizeCanvas() {
  const cols = map[0].length;
  const rows = map.length;
  const dpr = window.devicePixelRatio || 1;
  const newTileSize = Math.min(window.innerWidth / cols, window.innerHeight / rows);
  if (tileSize) {
    const scale = newTileSize / tileSize;
    if (player.x !== null) {
      player.x *= scale;
      player.y *= scale;
      player.targetX *= scale;
      player.targetY *= scale;
    }
    if (tom.x !== null) {
      tom.x *= scale;
      tom.y *= scale;
      tom.targetX *= scale;
      tom.targetY *= scale;
    }
    particles.forEach(p => {
      p.x *= scale;
      p.y *= scale;
    });
  }
  tileSize = newTileSize;
  canvas.style.width = `${tileSize * cols}px`;
  canvas.style.height = `${tileSize * rows}px`;
  canvas.width = tileSize * cols * dpr;
  canvas.height = tileSize * rows * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (assetsLoaded === TOTAL_ASSETS) {
    draw();
  }
}

window.onload = () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  restartBtn = document.getElementById('restartBtn');
  winDisplay = document.getElementById('winCount');
  loseDisplay = document.getElementById('loseCount');
  updateScoreboard();

  wallImage = loadImage('./assets/walls.png');
  floorImage = loadImage('./assets/floor.png');
  harryImage = loadImage('./assets/harry.png');
  tomImage = loadImage('./assets/tom.png');
  snakeImage = loadImage('./assets/snake.png');
  diademImage = loadImage('./assets/diadem.png');
  diaryImage = loadImage('./assets/diary.png');
  ringImage = loadImage('./assets/ring.png');
  locketImage = loadImage('./assets/locket.png');
  winImage = loadImage('./assets/win_screen.png');
  loseImage = loadImage('./assets/lose_screen.png');
  winSound = typeof Audio !== 'undefined'
    ? new Audio('./assets/win.mp3')
    : { play: () => Promise.resolve(), currentTime: 0 };
  loseSound = typeof Audio !== 'undefined'
    ? new Audio('./assets/lose.mp3')
    : { play: () => Promise.resolve(), currentTime: 0 };
  dementorImage = loadImage('./assets/dementor.png');

  restartBtn.addEventListener('click', restartGame);

  initDifficulty();
};



function loadImage(src) {
  const img = new Image();
  img.src = src;
  img.onload = assetLoaded;
  return img;
}

function assetLoaded() {
  assetsLoaded++;
  if (assetsLoaded === TOTAL_ASSETS && startRequested) {
    setupGame();
  }
}

function setupGame() {
  const startPos = { x: harryStart.col, y: harryStart.row };
  player.init(harryImage, tileSize, harryStart.col, harryStart.row);
  initTom(tomImage, tileSize, tomStart.col, tomStart.row);
  const horcruxImages = [
    snakeImage,
    diademImage,
    diaryImage,
    locketImage,
    ringImage
  ].slice(0, horcruxCount);
  generateHorcruxes(horcruxImages, map, startPos, [startPos], MIN_DISTANCE);
  const forbidden = horcruxes.map(h => ({ x: h.x, y: h.y }));
  forbidden.push(startPos);
  generateDementors(
    dementorImage,
    map,
    tileSize,
    forbidden,
    MIN_DISTANCE,
    dementorCount,
    moveDuration,
    moveCooldown,
    0
  );
  if (!controlsInitialized) {
    setupControls();
    controlsInitialized = true;
  }
  startTomLoop();
  if (!loopStarted) {
    loopStarted = true;
    requestAnimationFrame(loop);
  }
}

export function startGame(difficulty) {
  currentDifficulty = difficulty;
  currentSettings = DIFFICULTY_SETTINGS[currentDifficulty];
  tomSpeed = currentSettings.tomSpeed;
  MIN_DISTANCE = currentSettings.MIN_DISTANCE;
  MAP_WIDTH = currentSettings.mapWidth;
  MAP_HEIGHT = currentSettings.mapHeight;
  wallChance = currentSettings.wallChance;
  horcruxCount = currentSettings.horcruxCount;
  dementorCount = currentSettings.dementorCount;
  moveDuration = currentSettings.moveDuration;
  moveCooldown = currentSettings.moveCooldown;
  startRequested = true;
  generateLevel();
  resizeCanvas();
  if (!resizeBound) {
    window.addEventListener('resize', resizeCanvas);
    resizeBound = true;
  }
  if (assetsLoaded === TOTAL_ASSETS) {
    setupGame();
  }
  setGameState('playing');
  restartBtn.style.display = 'none';
  stopTomSpeech();
}

function restartGame() {
  generateLevel();
  resizeCanvas();
  if (!resizeBound) {
    window.addEventListener('resize', resizeCanvas);
    resizeBound = true;
  }
  if (assetsLoaded === TOTAL_ASSETS) {
    setupGame();
    setGameState('playing');
    restartBtn.style.display = 'none';
    stopTomSpeech();
  }
}

export function initDifficulty() {
  const startScreen = document.getElementById('start-screen');
  const diffSelect = document.getElementById('difficulty');
  const startBtn = document.getElementById('start-btn');
  const saved = sessionStorage.getItem('difficulty') || currentDifficulty;
  if (diffSelect) diffSelect.value = saved;
  if (startScreen) startScreen.style.display = 'block';
  startBtn.addEventListener('click', () => {
    const selected = diffSelect.value;
    sessionStorage.setItem('difficulty', selected);
    if (startScreen) startScreen.style.display = 'none';
    startGame(selected);
  });
}


function setupControls() {
  window.addEventListener('keydown', onKey);

  let startX, startY;
  let lastMove = 0;
  const MOVE_DELAY = 100; // ms

  canvas.addEventListener(
    'touchstart',
    e => {
      e.preventDefault();
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      lastMove = 0;
    },
    { passive: false }
  );

  canvas.addEventListener(
    'touchmove',
    e => {
      e.preventDefault();
      const touch = e.touches[0];
      const now = Date.now();
      if (now - lastMove < MOVE_DELAY) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.abs(dx) > Math.abs(dy)) {
        onKey({ code: dx > 0 ? 'ArrowRight' : 'ArrowLeft', preventDefault: () => {} });
      } else {
        onKey({ code: dy > 0 ? 'ArrowDown' : 'ArrowUp', preventDefault: () => {} });
      }

      startX = touch.clientX;
      startY = touch.clientY;
      lastMove = now;
    },
    { passive: false }
  );

  canvas.addEventListener(
    'touchend',
    () => {
      startX = null;
      startY = null;
    },
    { passive: false }
  );

  document.querySelectorAll('#controls .control-btn').forEach(btn => {
    const code = btn.dataset.key;
    const handler = e => {
      e.preventDefault();
      onKey({ code, preventDefault: () => {} });
    };
    btn.addEventListener('click', handler);
    btn.addEventListener('touchstart', handler, { passive: false });
  });
}

function onKey(e) {
  e.preventDefault();
  if (gameState !== 'playing') return;

  let dx = 0, dy = 0;
  switch (e.code) {
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
      setGameState('win');
    }
    if (
      !tom.isMoving &&
      Math.floor(tom.x / tileSize) === Math.floor(player.x / tileSize) &&
      Math.floor(tom.y / tileSize) === Math.floor(player.y / tileSize)
    ) {
      setGameState('lose');
    }
  }
}

function startTomLoop() {
  if (tomInterval) clearInterval(tomInterval);
  tomInterval = setInterval(() => {
    if (gameState !== 'playing') return;
    if (
      !tom.isMoving &&
      Math.floor(tom.x / tileSize) === Math.floor(player.x / tileSize) &&
      Math.floor(tom.y / tileSize) === Math.floor(player.y / tileSize)
    ) {
      setGameState('lose');
      return;
    }
    const path = findPath(
      Math.floor(tom.x / tileSize),
      Math.floor(tom.y / tileSize),
      Math.floor(player.x / tileSize),
      Math.floor(player.y / tileSize),
      map
    );
    moveTom(path, tileSize, tomSpeed);
  }, 300);
}

const activeDementorCollisions = new Set();

function checkDementorCollision() {
  if (gameState !== 'playing') return;

  const playerCol = Math.floor(player.x / tileSize);
  const playerRow = Math.floor(player.y / tileSize);
  const targetCol = Math.floor(player.targetX / tileSize);
  const targetRow = Math.floor(player.targetY / tileSize);
  const px = player.x + tileSize / 2;
  const py = player.y + tileSize / 2;

  getDementors().forEach(d => {
    const dCol = Math.floor(d.x / tileSize);
    const dRow = Math.floor(d.y / tileSize);

    if (dCol === playerCol && dRow === playerRow) {
      const playerLeaving =
        player.isMoving && (targetCol !== playerCol || targetRow !== playerRow);
      if (!playerLeaving || !d.isMoving) {
        if (!activeDementorCollisions.has(d)) {
          activeDementorCollisions.add(d);
          spawnParticles(px, py, 'harry');
          setGameState('lose');
        }
      } else {
        activeDementorCollisions.delete(d);
      }
    } else {
      activeDementorCollisions.delete(d);
    }
  });
}
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap(ctx, tileSize, wallImage, floorImage, map);
  drawHorcruxes(ctx, tileSize);
  drawDementors(ctx, tileSize);
  if (player.image) {
    player.draw(ctx, tileSize);
  }
  if (tom.image) {
    drawTom(ctx, tileSize);
  }
  updateAndDrawParticles(ctx);
  updateSpeechPosition(canvas, tileSize);


  const dpr = window.devicePixelRatio || 1;
  const displayWidth = canvas.width / dpr;
  const displayHeight = canvas.height / dpr;

  if (gameState === 'win') {
    stopTomSpeech();
    ctx.drawImage(winImage, 0, 0, displayWidth, displayHeight);
    restartBtn.style.display = 'block';
  } else if (gameState === 'lose') {
    stopTomSpeech();
    ctx.drawImage(loseImage, 0, 0, displayWidth, displayHeight);
    restartBtn.style.display = 'none';
  } else {
    restartBtn.style.display = 'none';
  }
}

function loop() {
  updateDementors(tileSize, map, player);
  checkDementorCollision();
  draw();
  requestAnimationFrame(loop);
}

