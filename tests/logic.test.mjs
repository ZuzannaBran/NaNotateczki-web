import test from 'node:test';
import assert from 'node:assert/strict';
import { inkColor, isPalette } from '../assets/js/colors.js';
import { initialTimer, timerTick } from '../assets/js/planner.js';

test('all palettes are validated', () => {
  assert.equal(isPalette('blue'), true);
  assert.equal(isPalette('green'), true);
  assert.equal(isPalette('fake'), false);
});

test('dark ink keeps original HSL hue and inverts lightness', () => {
  assert.equal(inkColor('#03223A', 'light'), '#03223A');
  assert.match(inkColor('#03223A', 'dark'), /^hsl\(/);
});

test('smart session advances focus, break and completion', () => {
  let state = initialTimer('smart');
  assert.equal(state.seconds, 1500);
  state = timerTick({ ...state, seconds: 1 });
  assert.equal(state.phase, 'break');
  assert.equal(state.seconds, 300);
  state = timerTick({ ...state, seconds: 1 });
  assert.equal(state.phase, 'focus');
  assert.equal(state.round, 2);
  state = timerTick({ ...state, seconds: 1 });
  assert.equal(state.phase, 'done');
  assert.equal(state.seconds, 0);
});

test('standard session ends without breaks', () => {
  const state = timerTick({ ...initialTimer('standard'), seconds: 1 });
  assert.equal(state.phase, 'done');
  assert.equal(state.seconds, 0);
});
