import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const startGameMock = mock.fn();
globalThis.__startGameMock = startGameMock;
const noop = () => {};
globalThis.__mocks = {
  drawMap: noop,
  generateMap: noop,
  player: {},
  horcruxes: [],
  generateHorcruxes: noop,
  drawHorcruxes: noop,
  checkPickup: noop,
  tom: {},
  initTom: noop,
  moveTom: noop,
  drawTom: noop,
  sayTomQuote: noop,
  updateSpeechPosition: noop,
  stopTomSpeech: noop,
  findPath: () => [],
  updateAndDrawParticles: noop,
  particles: [],
  spawnParticles: noop,
  clearParticles: noop,
  generateDementors: noop,
  drawDementors: noop,
  updateDementors: noop,
  getDementors: () => []
};

// Global stubs
global.window = { devicePixelRatio:1, innerWidth:800, innerHeight:600, addEventListener: () => {} };
global.sessionStorage = {
  data: {},
  getItem(key){ return this.data[key]; },
  setItem(key, val){ this.data[key] = String(val); }
};
global.Audio = class { constructor(){ this.currentTime = 0; } play(){ return Promise.resolve(); } };
global.Image = class { set src(v){ if (this.onload) this.onload(); } };

let code = await fs.readFile(new URL('../js/game.js', import.meta.url), 'utf8');
code = code
  .replace("import { drawMap, generateMap } from './map.js';", "const { drawMap, generateMap } = globalThis.__mocks;")
  .replace("import { player } from './player.js';", "const { player } = globalThis.__mocks;")
  .replace("import { horcruxes, generateHorcruxes, drawHorcruxes, checkPickup } from './horcruxManager.js';", "const { horcruxes, generateHorcruxes, drawHorcruxes, checkPickup } = globalThis.__mocks;")
  .replace("import { tom, initTom, moveTom, drawTom, sayTomQuote, updateSpeechPosition, stopTomSpeech } from './tom.js';", "const { tom, initTom, moveTom, drawTom, sayTomQuote, updateSpeechPosition, stopTomSpeech } = globalThis.__mocks;")
  .replace("import { findPath } from './pathfinding.js';", "const { findPath } = globalThis.__mocks;")
  .replace("import {\n  updateAndDrawParticles,\n  particles,\n  spawnParticles,\n  clearParticles\n} from './particle.js';", "const { updateAndDrawParticles, particles, spawnParticles, clearParticles } = globalThis.__mocks;")
  .replace("import { generateDementors, drawDementors, updateDementors, getDementors } from './dementor.js';", "const { generateDementors, drawDementors, updateDementors, getDementors } = globalThis.__mocks;")
  .replace(/export function startGame\([^]*?\n}\n/, 'export const startGame = globalThis.__startGameMock;\n')
  + "\nexport const __test = { setCurrentDifficulty: d => currentDifficulty = d };";
const url = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
const game = await import(url);
delete globalThis.__mocks;
delete globalThis.__startGameMock;

let restartBtn, menuBtn, startScreen, diffSelect, endButtons;

beforeEach(() => {
  // reset session storage
  sessionStorage.data = {};

  restartBtn = { style: { display: 'none' }, addEventListener(event, handler){ this.handler = handler; } };
  menuBtn = { style: { display: 'none' }, addEventListener(event, handler){ this.handler = handler; } };
  endButtons = { style: { display: 'none' } };
  startScreen = { style: { display: 'none' } };
  diffSelect = { value: 'normal' };

  const elements = {
    gameCanvas: { getContext: () => ({}) },
    restartBtn,
    menuBtn,
    endButtons,
    'start-screen': startScreen,
    difficulty: diffSelect,
    'start-btn': { addEventListener: () => {} },
    winCount: { textContent: '' },
    loseCount: { textContent: '' }
  };
  global.document = { getElementById: id => elements[id] };

  if (typeof window.onload === 'function') window.onload();
  startGameMock.mock.resetCalls();
});

describe('end buttons', () => {
  it('clicking restartBtn calls startGame with current difficulty', () => {
    game.__test.setCurrentDifficulty('hard');
    restartBtn.handler();
    assert.strictEqual(startGameMock.mock.callCount(), 1);
    assert.strictEqual(startGameMock.mock.calls[0].arguments[0], 'hard');
  });

  it('menuBtn makes the start screen visible again', () => {
    menuBtn.handler();
    assert.strictEqual(startScreen.style.display, 'block');
  });
});
