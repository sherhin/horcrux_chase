import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDementors, updateDementors, getDementors } from '../js/dementor.js';

test('generateDementors creates three dementors on free tiles without overlap', () => {
  const originalRandom = Math.random;
  const originalNow = performance.now;

  try {
    const randomValues = [0, 0, 0.4, 0, 0.8, 0];
    let randIndex = 0;
    Math.random = () => randomValues[randIndex++];

    const perfValues = [0, 0, 0];
    let perfIndex = 0;
    performance.now = () => perfValues[perfIndex++];

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
    performance.now = originalNow;
  }
});

test('generateDementors respects forbidden positions and minDistance', () => {
  const originalRandom = Math.random;
  const originalNow = performance.now;

  try {
    const randomValues = [0, 0, 0.5, 0.5, 0, 0.4, 0.8, 0.8, 0, 0, 0.8, 0.4, 0.8, 0];
    let randIndex = 0;
    Math.random = () => randomValues[randIndex++];

    const perfValues = [0, 0, 0];
    let perfIndex = 0;
    performance.now = () => perfValues[perfIndex++];

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
    performance.now = originalNow;
  }
});

test('updateDementors moves dementors to adjacent free cells without collisions after 1000ms', () => {
  const originalRandom = Math.random;
  const originalNow = performance.now;
  const originalRAF = global.requestAnimationFrame;

  try {
    const randomValues = [0, 0, 0.4, 0, 0.8, 0];
    let randIndex = 0;
    Math.random = () => randomValues[randIndex++] ?? 0;

    const perfValues = [0, 0, 0, 1000, 1000, 1600, 1000, 1600, 1000, 1600];
    let perfIndex = 0;
    let lastPerf = 0;
    performance.now = () => {
      lastPerf = perfValues[perfIndex++];
      return lastPerf;
    };
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
    performance.now = originalNow;
    global.requestAnimationFrame = originalRAF;
  }
});
