import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// Stub HTMLAudioElement for the Node testing environment before importing the module
global.Audio = class {
  constructor() {
    this.currentTime = 0;
  }
  play() {
    return Promise.resolve();
  }
};

const { moveTom, sayTomQuote, initTom, tom, stopTomSpeech } = await import('../js/tom.js');

const tileSize = 32;

// simple fake timers implementation
function setupFakeTimers() {
  let id = 0;
  const timers = new Map();

  global.setTimeout = (fn, ms) => {
    id += 1;
    timers.set(id, { fn, ms });
    return id;
  };

  global.clearTimeout = (timerId) => {
    timers.delete(timerId);
  };

  global.advanceTimersByTime = (ms) => {
    for (const [key, timer] of Array.from(timers)) {
      timer.fn();
      timers.delete(key);
    }
  };

  return () => {
    timers.clear();
    delete global.advanceTimersByTime;
    delete global.setTimeout;
    delete global.clearTimeout;
  };
}

describe('tom character', () => {
  let restoreTimers;
  let div;

  beforeEach(() => {
    restoreTimers = setupFakeTimers();
    global.requestAnimationFrame = (fn) => {
      fn(performance.now() + 200);
    };
    div = { style: { display: 'none' }, innerText: '' };
    global.document = { getElementById: () => div };
    initTom({}, tileSize, 10, 2);
  });

  afterEach(() => {
    stopTomSpeech();
    restoreTimers();
    delete global.requestAnimationFrame;
    delete global.document;
    tom.isMoving = false;
  });

  it('initializes at provided position', () => {
    initTom({}, tileSize, 3, 4);
    assert.equal(tom.x, 3 * tileSize);
    assert.equal(tom.y, 4 * tileSize);
  });

  it('does not move when speaking is true', () => {
    sayTomQuote();
    const { x: initialX, y: initialY } = tom;
    moveTom([{ col: 11, row: 2 }], tileSize);
    assert.equal(tom.x, initialX);
    assert.equal(tom.y, initialY);
  });

  it('does not move when tom.isMoving is true', () => {
    tom.isMoving = true;
    const { x: initialX, y: initialY } = tom;
    moveTom([{ col: 11, row: 2 }], tileSize);
    assert.equal(tom.x, initialX);
    assert.equal(tom.y, initialY);
  });

  it('accumulates fractional steps before moving', () => {
    const { x: initialX, y: initialY } = tom;
    moveTom([{ col: 11, row: 2 }], tileSize, 0.5);
    // Not enough accumulated steps, position should remain unchanged
    assert.equal(tom.x, initialX);
    assert.equal(tom.y, initialY);
    // Second call accumulates to 1.0 and triggers movement
    moveTom([{ col: 11, row: 2 }], tileSize, 0.5);
    assert.equal(tom.x, 11 * tileSize);
    assert.equal(tom.y, 2 * tileSize);
  });

    it('sayTomQuote shows and hides tomSpeech after timeout', () => {
      sayTomQuote();
      assert.equal(div.style.display, 'block');
      global.advanceTimersByTime(2000);
      global.advanceTimersByTime(500);
      assert.equal(div.style.display, 'none');
    });
  });

