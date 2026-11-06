import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatSecondsToTime,
  calculateStreakProgress,
  getDayState,
} from './reward-logic.js';

test('formatSecondsToTime converts seconds to HH:MM:SS format correctly', () => {
  assert.equal(formatSecondsToTime(86400), '24:00:00');
  assert.equal(formatSecondsToTime(86399), '23:59:59');
  assert.equal(formatSecondsToTime(3665), '01:01:05');
  assert.equal(formatSecondsToTime(0), '00:00:00');
  assert.equal(formatSecondsToTime(-10), '00:00:00');
});

test('calculateStreakProgress returns accurate percentage and label', () => {
  const day1 = calculateStreakProgress(1, 7);
  assert.equal(day1.label, '1 / 7 Days');
  assert.equal(day1.percent, 14);

  const day2 = calculateStreakProgress(2, 7);
  assert.equal(day2.label, '2 / 7 Days');
  assert.equal(day2.percent, 29);

  const day7 = calculateStreakProgress(7, 7);
  assert.equal(day7.label, '7 / 7 Days');
  assert.equal(day7.percent, 100);
});

test('getDayState accurately differentiates expired, active, claimed, and locked', () => {
  assert.equal(getDayState(1, 2, []), 'expired');
  assert.equal(getDayState(2, 2, []), 'active');
  assert.equal(getDayState(2, 2, [2]), 'claimed');
  assert.equal(getDayState(3, 2, []), 'locked');
  assert.equal(getDayState(7, 2, []), 'locked');
});
