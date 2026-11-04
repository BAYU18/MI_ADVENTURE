// tests/friendship.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  PRESENCE_TTL_MS, isOnline, computeActivity, activityLabel, statusLabel,
  normalizeNick, validateSearchQuery,
} = require('../shared/friendship.js');

test('isOnline: true dalam jendela', () => {
  const now = 1_000_000;
  assert.equal(isOnline(new Date(now - PRESENCE_TTL_MS + 1).toISOString(), now), true);
  assert.equal(isOnline(new Date(now - PRESENCE_TTL_MS - 1).toISOString(), now), false);
});

test('isOnline: null/undefined/garbage = offline', () => {
  assert.equal(isOnline(null, 1), false);
  assert.equal(isOnline(undefined, 1), false);
  assert.equal(isOnline('bukan-tanggal', 1), false);
  assert.equal(isOnline('', 1), false);
});

test('computeActivity rank + edge', () => {
  assert.equal(computeActivity(null, false), 'idle');
  assert.equal(computeActivity({ status: 'IN_PROGRESS', mode: 'BATTLE', campaign_node: null }, false), 'battle');
  assert.equal(computeActivity({ status: 'IN_PROGRESS', mode: 'FUN', campaign_node: null }, false), 'petualangan');
  assert.equal(computeActivity({ status: 'IN_PROGRESS', mode: 'BATTLE', campaign_node: null }, true), 'duel');
  assert.equal(computeActivity({ status: 'WON', mode: 'BATTLE', campaign_node: null }, false), 'idle');
  assert.equal(computeActivity({ status: 'IN_PROGRESS', mode: 'FUN', campaign_node: 'M1' }, false), 'petualangan');
});

test('label & normalize', () => {
  assert.equal(activityLabel('duel'), '🟢 Duel');
  assert.equal(statusLabel(true, 'battle'), '⚔️ Battle');
  assert.equal(normalizeNick('  JurAgan '), 'juragan');
  assert.equal(validateSearchQuery('ab'), 'ab');
  assert.equal(validateSearchQuery('a'), null);
});
