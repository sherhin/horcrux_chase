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

test('generateHorcruxes respects forbidden positions and minDistance', () => {
  const sequence = [0, 0, 0.5, 0.5, 0, 0.4, 0.8, 0.9];
  let index = 0;
  const originalRandom = Math.random;
  Math.random = () => sequence[index++];

  const templates = [{ id: 1 }, { id: 2 }];
  const map = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  const forbidden = [{ x: 1, y: 1 }];
  generateHorcruxes(templates, map, forbidden, 2);
  Math.random = originalRandom;

  assert.equal(horcruxes.length, 2);
  horcruxes.forEach(h => {
    const distForbidden = Math.abs(h.x - 1) + Math.abs(h.y - 1);
    assert.ok(distForbidden >= 2);
  });
  const [h1, h2] = horcruxes;
  const dist = Math.abs(h1.x - h2.x) + Math.abs(h1.y - h2.y);
  assert.ok(dist >= 2);
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
