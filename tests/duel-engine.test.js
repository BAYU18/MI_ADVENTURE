// tests/duel-engine.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  C, phaseAt, deathmatchDurationMs, damageFor, clampHp, resolveDraw,
  skillLevel, healAmount, shieldAmount, strikeMultiplier, energyCost, canUseSkill,
} = require('../shared/duel.js');

test('konstanta duel', () => {
  assert.equal(C.MAX_HP, 100);
  assert.equal(C.DAMAGE_PER_CORRECT, 10);
  assert.equal(C.NORMAL_PHASE_MS, 600_000);
  assert.equal(C.DEATHMATCH_QUESTION_MS, 30_000);
  assert.equal(C.RECONNECT_WINDOW_MS, 120_000);
  assert.equal(C.REWARD_COINS_WIN, 15);
  assert.equal(C.REWARD_COINS_LOSE, 5);
  assert.equal(C.REWARD_COINS_DRAW, 8);
  assert.equal(C.REWARD_XP_WIN, 10);
  assert.equal(C.REWARD_XP_LOSE, 4);
});

test('damageFor: benar=10 (dgn boost strike x2 = 20), salah=0, adaptif naik per 3 soal', () => {
  assert.equal(damageFor(true, 1, 0), 10);
  assert.equal(damageFor(true, 2, 0), 20);
  assert.equal(damageFor(false, 1, 0), 0);

  // Adaptif seiring urutan soal
  assert.equal(damageFor(true, 1, 2), 10);
  assert.equal(damageFor(true, 1, 3), 12);
  assert.equal(damageFor(true, 1, 5), 12);
  assert.equal(damageFor(true, 1, 6), 14);
  assert.equal(damageFor(true, 2, 6), 28);
});

test('deathmatchDurationMs: adaptif mulai 30s dan semakin sebentar (min 10s)', () => {
  assert.equal(deathmatchDurationMs(0), 30_000);
  assert.equal(deathmatchDurationMs(1), 28_000);
  assert.equal(deathmatchDurationMs(2), 26_000);
  assert.equal(deathmatchDurationMs(5), 20_000);
  assert.equal(deathmatchDurationMs(10), 10_000);
  assert.equal(deathmatchDurationMs(20), 10_000);
});

test('phaseAt: NORMAL sebelum batas, DEATHMATCH setelah', () => {
  const endAt = new Date(1_000_000).toISOString();
  assert.equal(phaseAt(endAt, 999_999), 'NORMAL');
  assert.equal(phaseAt(endAt, 1_000_000), 'DEATHMATCH');
});

test('clampHp batas 0..100', () => {
  assert.equal(clampHp(120), 100);
  assert.equal(clampHp(-5), 0);
  assert.equal(clampHp(50), 50);
  assert.equal(clampHp(NaN), 100);
});

test('resolveDraw', () => {
  assert.equal(resolveDraw(100, 100), 'DRAW');
  assert.equal(resolveDraw(100, 90), 'A');
  assert.equal(resolveDraw(90, 100), 'B');
});

test('skill bonuses by level & biaya energi', () => {
  assert.equal(healAmount(3), 45);
  assert.equal(shieldAmount(5), 60);
  assert.equal(strikeMultiplier(2), 2.25);
  assert.equal(energyCost('eliminate_one'), 1);
  assert.equal(energyCost('heal'), 2);
});

test('canUseSkill: energi kurang = NO_ENERGY; time_freeze salah fase', () => {
  const duel = { phase: 'NORMAL' };
  assert.deepEqual(canUseSkill(duel, true, 'heal', 1, 1, 5, 0), { ok: false, reason: 'NO_ENERGY' });
  assert.deepEqual(canUseSkill(duel, true, 'time_freeze', 1, 5, 5, 0), { ok: false, reason: 'WRONG_PHASE' });
  const ok = canUseSkill(duel, true, 'heal', 1, 5, 5, 0);
  assert.equal(ok.ok, true);
  assert.equal(ok.heal, 25);
});
