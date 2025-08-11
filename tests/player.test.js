import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

global.requestAnimationFrame = (cb) => cb(performance.now() + 1000);

const tileSize = 32;
const emptyMap = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];

let player;
const spawnParticlesMock = mock.fn();
let dementors = [];
const getDementorsMock = mock.fn(() => dementors);

async function loadPlayer() {
  let code = await fs.readFile(new URL('../js/player.js', import.meta.url), 'utf8');
  code = code
    .replace("import { spawnParticles } from './particle.js';", "const { spawnParticles } = globalThis.__mocks;")
    .replace("import { getDementors } from './dementor.js';", "const { getDementors } = globalThis.__mocks;");
  const url = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
  globalThis.__mocks = { spawnParticles: spawnParticlesMock, getDementors: getDementorsMock };
  const mod = await import(url);
  delete globalThis.__mocks;
  return mod.player;
}

beforeEach(async () => {
  if (!player) {
    player = await loadPlayer();
  }
  player.x = tileSize;
  player.y = tileSize;
  player.targetX = tileSize;
  player.targetY = tileSize;
  player.isMoving = false;
  spawnParticlesMock.mock.resetCalls();
  dementors = [];
});

describe('player.init', () => {
  it('positions player on provided start coordinates', () => {
    player.init({}, tileSize, 3, 2);
    assert.strictEqual(player.x, tileSize * 3);
    assert.strictEqual(player.y, tileSize * 2);
    assert.strictEqual(player.isMoving, false);
  });
});

describe('player.move', () => {
  it('returns null if character already moving', () => {
    player.isMoving = true;
    const result = player.move(tileSize, 0, tileSize, emptyMap);
    assert.strictEqual(result, null);
    assert.strictEqual(spawnParticlesMock.mock.callCount(), 0);
  });

  it('blocks step into wall', () => {
    const map = [
      [0, 0, 0],
      [0, 0, 1],
      [0, 0, 0]
    ];
    const result = player.move(tileSize, 0, tileSize, map);
    assert.strictEqual(result, null);
    assert.strictEqual(player.x, tileSize);
    assert.strictEqual(player.y, tileSize);
    assert.strictEqual(spawnParticlesMock.mock.callCount(), 0);
  });

  it('blocks step into cell occupied by a dementor', () => {
    dementors = [
      { x: tileSize * 2, y: tileSize, targetX: tileSize * 2, targetY: tileSize, isMoving: false }
    ];
    const result = player.move(tileSize, 0, tileSize, emptyMap);
    assert.strictEqual(result, null);
    assert.strictEqual(player.x, tileSize);
    assert.strictEqual(player.y, tileSize);
    assert.strictEqual(spawnParticlesMock.mock.callCount(), 1);
  });

  it('moves into free cell', () => {
    const result = player.move(tileSize, 0, tileSize, emptyMap);
    assert.deepStrictEqual(result, { col: 2, row: 1 });
    assert.strictEqual(player.x, tileSize * 2);
    assert.strictEqual(player.y, tileSize);
    assert.strictEqual(player.isMoving, false);
    assert.strictEqual(spawnParticlesMock.mock.callCount(), 1);
  });

  it('moves correctly from slightly off-grid position', () => {
    player.x = tileSize - 0.3;
    player.y = tileSize;
    const result = player.move(tileSize, 0, tileSize, emptyMap);
    assert.deepStrictEqual(result, { col: 2, row: 1 });
    assert.strictEqual(player.x, tileSize * 2);
    assert.strictEqual(player.y, tileSize);
  });
});
