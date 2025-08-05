import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDementors, updateDementors, getDementors } from '../js/dementor.js';

test('generateDementors creates three dementors on free tiles without overlap', () => {
  const originalRandom = Math.random;
  const originalPerformance = globalThis.performance;

  try {
    const randomValues = [0, 0, 0.4, 0, 0.8, 0];
    let randIndex = 0;
    Math.random = () => randomValues[randIndex++];

    const perfValues = [0, 0, 0];
    let perfIndex = 0;
    const mockPerformance = {
      now: () => perfValues[perfIndex++]
    };
    Object.defineProperty(globalThis, 'performance', { value: mockPerformance, configurable: true });

    const map = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    const tileSize = 10;
    const image = {};

    generateDementors(image, map, tileSize);
    const dementors = getDementors();

    assert.equal(dementors.length, 3);
    const positions = dementors.map(d => [d.x / tileSize, d.y / tileSize]);
    const unique = new Set(positions.map(p => p.toString()));
    assert.equal(unique.size, 3);
    positions.forEach(([c, r]) => {
      assert.equal(map[r][c], 0);
    });
  } finally {
    Math.random = originalRandom;
    Object.defineProperty(globalThis, 'performance', { value: originalPerformance, configurable: true });
  }
});

test('generateDementors places dementors only on tiles with a free neighbor', () => {
  const originalRandom = Math.random;
  const originalPerformance = globalThis.performance;

  try {
    const randomValues = [0, 0, 0.3, 0.3, 0.6, 0.3, 0.3, 0.6];
    let randIndex = 0;
    Math.random = () => randomValues[randIndex++];

    const perfValues = [0, 0, 0];
    let perfIndex = 0;
    const mockPerformance = {
      now: () => perfValues[perfIndex++]
    };
    Object.defineProperty(globalThis, 'performance', { value: mockPerformance, configurable: true });

    const map = [
      [0, 1, 1, 1],
      [1, 0, 0, 1],
      [1, 0, 1, 1],
      [1, 1, 1, 1]
    ];
    const tileSize = 10;
    const image = {};

    generateDementors(image, map, tileSize);
    const dementors = getDementors();

    assert.equal(dementors.length, 3);
    const dirs = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0]
    ];
    dementors.forEach(d => {
      const col = d.x / tileSize;
      const row = d.y / tileSize;
      const hasNeighbor = dirs.some(([dx, dy]) => map[row + dy]?.[col + dx] === 0);
      assert.ok(hasNeighbor);
    });
  } finally {
    Math.random = originalRandom;
    Object.defineProperty(globalThis, 'performance', { value: originalPerformance, configurable: true });
  }
});

test('generateDementors respects forbidden positions and minDistance', () => {
  const originalRandom = Math.random;
  const originalPerformance = globalThis.performance;

  try {
    const randomValues = [0, 0, 0.5, 0.5, 0, 0.4, 0.8, 0.8, 0, 0, 0.8, 0.4, 0.8, 0];
    let randIndex = 0;
    Math.random = () => randomValues[randIndex++];

    const perfValues = [0, 0, 0];
    let perfIndex = 0;
    const mockPerformance = {
      now: () => perfValues[perfIndex++]
    };
    Object.defineProperty(globalThis, 'performance', { value: mockPerformance, configurable: true });

    const map = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    const tileSize = 10;
    const image = {};

    generateDementors(image, map, tileSize, [{ x: 1, y: 1 }], 2);
    const dementors = getDementors();

    assert.equal(dementors.length, 3);
    const positions = dementors.map(d => [d.x / tileSize, d.y / tileSize]);
    positions.forEach(([c, r]) => {
      const distForbidden = Math.abs(c - 1) + Math.abs(r - 1);
      assert.ok(distForbidden >= 2);
    });
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const [c1, r1] = positions[i];
        const [c2, r2] = positions[j];
        const dist = Math.abs(c1 - c2) + Math.abs(r1 - r2);
        assert.ok(dist >= 2);
      }
    }
  } finally {
    Math.random = originalRandom;
    Object.defineProperty(globalThis, 'performance', { value: originalPerformance, configurable: true });
  }
});

test('updateDementors moves dementors to adjacent free cells without collisions after 1000ms', () => {
  const originalRandom = Math.random;
  const originalPerformance = globalThis.performance;
  const originalRAF = global.requestAnimationFrame;

  try {
    const randomValues = [0, 0, 0.4, 0, 0.8, 0];
    let randIndex = 0;
    Math.random = () => randomValues[randIndex++] ?? 0;

    const perfValues = [0, 0, 0, 1000, 1000, 1600, 1000, 1600, 1000, 1600];
    let perfIndex = 0;
    let lastPerf = 0;
    const mockPerformance = {
      now: () => {
        lastPerf = perfValues[perfIndex++];
        return lastPerf;
      }
    };
    Object.defineProperty(globalThis, 'performance', { value: mockPerformance, configurable: true });
    global.requestAnimationFrame = (cb) => cb(lastPerf + 600);

    const map = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0]
    ];
    const tileSize = 10;
    const image = {};

    generateDementors(image, map, tileSize);
    const before = getDementors().map(d => [d.x / tileSize, d.y / tileSize]);

    updateDementors(tileSize, map);
    const after = getDementors().map(d => [d.x / tileSize, d.y / tileSize]);

    const unique = new Set(after.map(p => p.toString()));
    assert.equal(unique.size, after.length);

    before.forEach(([c, r], i) => {
      const [nc, nr] = after[i];
      const manhattan = Math.abs(nc - c) + Math.abs(nr - r);
      assert.equal(manhattan, 1);
      assert.equal(map[nr][nc], 0);
    });
  } finally {
    Math.random = originalRandom;
    Object.defineProperty(globalThis, 'performance', { value: originalPerformance, configurable: true });
    global.requestAnimationFrame = originalRAF;
  }
});
