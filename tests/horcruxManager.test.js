import test from 'node:test';
import assert from 'node:assert/strict';
import { generateHorcruxes, horcruxes, checkPickup } from '../js/horcruxManager.js';

test('generateHorcruxes places horcruxes only on free tiles without duplicates', () => {
  const sequence = [0.5, 0.1, 0, 0, 0, 0, 0.4, 0.5, 0.8, 0.4];
  let index = 0;
  const originalRandom = Math.random;
  Math.random = () => sequence[index++];

  const templates = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const map = [
    [0, 1, 0],
    [0, 0, 0],
    [1, 0, 0]
  ];

  generateHorcruxes(templates, map);
  Math.random = originalRandom;

  for (const h of horcruxes) {
    assert.equal(map[h.y][h.x], 0);
  }

  const coords = horcruxes.map(h => `${h.x},${h.y}`);
  assert.equal(new Set(coords).size, horcruxes.length);
});

test('checkPickup removes horcrux, calls callback and returns true when empty', () => {
  horcruxes.length = 0;
  horcruxes.push({ image: {}, x: 1, y: 1 }, { image: {}, x: 2, y: 2 });

  let calls = 0;
  const cb = () => { calls++; };

  const first = checkPickup(1, 1, cb);
  assert.equal(first, false);
  assert.equal(horcruxes.length, 1);
  assert.equal(calls, 1);

  const second = checkPickup(2, 2, cb);
  assert.equal(second, true);
  assert.equal(horcruxes.length, 0);
  assert.equal(calls, 2);
});
