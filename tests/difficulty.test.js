import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// stub required globals before importing game.js
global.sessionStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = String(value);
  }
};
global.window = { devicePixelRatio: 1, innerWidth: 800, innerHeight: 600, addEventListener: () => {} };

const { DIFFICULTY_SETTINGS } = await import('../js/game.js');
import { generateMap } from '../js/map.js';
import { generateDementors, getDementors } from '../js/dementor.js';

describe('difficulty settings', () => {
  it('easy settings are correct', () => {
    const easy = DIFFICULTY_SETTINGS.easy;
    assert.equal(easy.mapWidth, 10);
    assert.equal(easy.dementorCount, 2);
    assert.equal(easy.tomSpeed, 0.6);
    assert.equal(easy.wallChance, 0.15);
  });

  it('map respects wallChance parameter', () => {
    const empty = generateMap(5, 5, 0);
    for (let r = 1; r < 4; r++) {
      for (let c = 1; c < 4; c++) {
        assert.equal(empty[r][c], 0);
      }
    }
    const full = generateMap(5, 5, 1);
    for (let r = 1; r < 4; r++) {
      for (let c = 1; c < 4; c++) {
        assert.equal(full[r][c], 1);
      }
    }
  });

  it('generateDementors respects count', () => {
    const map = Array.from({ length: 5 }, () => Array(5).fill(0));
    // deterministic randomness
    const values = [0.1, 0.3, 0.5, 0.7, 0.9];
    let idx = 0;
    const originalRandom = Math.random;
    Math.random = () => {
      const val = values[idx % values.length];
      idx++;
      return val;
    };
    generateDementors({}, map, 32, [], 1, 4);
    Math.random = originalRandom;
    assert.equal(getDementors().length, 4);
  });
});

