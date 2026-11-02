import test from 'node:test';
import assert from 'node:assert/strict';
import GradingEngine from '../shared/grading.js';

const {
  parseNumberId,
  normalizeText,
  gradeShort,
  gradeOrdering,
  gradeMatching,
  afterAnswer,
  updatePace,
  bossDamage,
  validateQuestionData
} = GradingEngine;

test('parseNumberId: menangani format angka lokal Indonesia dan standar', () => {
  assert.equal(parseNumberId(42), 42);
  assert.equal(parseNumberId('100'), 100);
  assert.equal(parseNumberId('2,5'), 2.5);
  assert.equal(parseNumberId('1.000'), 1000);
  assert.equal(parseNumberId('1.250.000'), 1250000);
  assert.equal(parseNumberId('1.250,50'), 1250.5);
  assert.equal(parseNumberId('bukan angka'), null);
  assert.equal(parseNumberId(''), null);
});

test('normalizeText: membersihkan tanda baca dan spasi ganda', () => {
  assert.equal(normalizeText('  Halo, Dunia!!  '), 'halo dunia');
  assert.equal(normalizeText('Kucing & Tikus!'), 'kucing tikus');
  assert.equal(normalizeText(null), '');
});

test('gradeShort: evaluasi teks dan numerik dengan toleransi', () => {
  // Numeric
  const numData = { isNumeric: true, accepted: [1000, '1.000'] };
  assert.equal(gradeShort('1.000', numData).correct, true);
  assert.equal(gradeShort('1000', numData).correct, true);
  assert.equal(gradeShort('999', numData).correct, false);

  // Text
  const txtData = { isNumeric: false, accepted: ['Jakarta', 'DKI Jakarta'] };
  assert.equal(gradeShort('jakarta', txtData).correct, true);
  assert.equal(gradeShort('dki jakarta!', txtData).correct, true);
  assert.equal(gradeShort('Bandung', txtData).correct, false);
});

test('gradeOrdering: evaluasi urutan kartu', () => {
  const ordData = { items: ['A', 'B', 'C'], correctOrder: [1, 2, 3] };
  assert.equal(gradeOrdering([1, 2, 3], ordData).correct, true);
  assert.equal(gradeOrdering([1, 3, 2], ordData).correct, false);
  assert.equal(gradeOrdering([1], ordData).correct, false);
});

test('gradeMatching: evaluasi pasangan kiri-kanan', () => {
  const matchData = {
    pairs: [
      { left: 'kucing', right: 'meow' },
      { left: 'anjing', right: 'guk' }
    ]
  };
  assert.equal(gradeMatching({ kucing: 'meow', anjing: 'guk' }, matchData).correct, true);
  assert.equal(gradeMatching({ kucing: 'guk', anjing: 'meow' }, matchData).correct, false);
  assert.equal(gradeMatching({ kucing: 'meow' }, matchData).correct, false);
});

test('afterAnswer: spaced repetition progression and reset', () => {
  const now = new Date('2026-11-02T10:00:00Z');

  // Answer correctly first time
  const r1 = afterAnswer({ box: 0, lapses: 0 }, true, now);
  assert.equal(r1.box, 1);
  assert.equal(r1.lapses, 0);
  assert.equal(r1.mastered, 0);
  assert.equal(new Date(r1.due_at).getTime(), now.getTime() + 1 * 86400000);

  // Answer wrong
  const rWrong = afterAnswer({ box: 3, lapses: 1 }, false, now);
  assert.equal(rWrong.box, 0);
  assert.equal(rWrong.lapses, 2);
  assert.equal(rWrong.mastered, 0);
  assert.equal(new Date(rWrong.due_at).getTime(), now.getTime() + 1 * 86400000);

  // Mastery progression: box 4 -> mastered
  const rMaster = afterAnswer({ box: 4, lapses: 0 }, true, now);
  assert.equal(rMaster.mastered, 1);
});

test('updatePace: dynamic time pacing and clamp 0.8-1.5', () => {
  // Not enough questions (< 5)
  assert.equal(updatePace(1.0, { totalAnswered: 3 }), 1.0);

  // Timeouts >= 2 -> increase pace by 0.1
  assert.equal(updatePace(1.0, { totalAnswered: 5, timeouts: 2 }), 1.1);

  // High speed & high accuracy -> decrease pace by 0.05
  assert.equal(updatePace(1.0, { totalAnswered: 6, medianRatio: 0.25, accuracy: 0.9 }), 0.95);

  // Clamp limits
  assert.equal(updatePace(1.48, { totalAnswered: 5, timeouts: 2 }), 1.5);
  assert.equal(updatePace(0.82, { totalAnswered: 6, medianRatio: 0.2, accuracy: 1.0 }), 0.8);
});

test('bossDamage: capped at 35% max HP and weak topic multiplier', () => {
  // Weak topic x2 damage
  const normal = bossDamage({ tier: 2, weak: false, maxHp: 1000 });
  const weak = bossDamage({ tier: 2, weak: true, maxHp: 1000 });
  assert.equal(weak.damage, normal.damage * 2);

  // Cap test: 35% of 100 = 35 max damage
  const giant = bossDamage({ tier: 10, combo: 5, weak: true, maxHp: 100 });
  assert.equal(giant.damage, 35);
  assert.equal(giant.isCapHit, true);
});

test('validateQuestionData: memvalidasi format data 5 tipe soal', () => {
  assert.equal(validateQuestionData('MCQ', { options: ['A', 'B'] }).valid, true);
  assert.equal(validateQuestionData('MCQ', { options: ['A'] }).valid, false);

  assert.equal(validateQuestionData('TRUE_FALSE', { correctAnswer: true }).valid, true);
  assert.equal(validateQuestionData('TRUE_FALSE', { correctAnswer: 'yes' }).valid, false);

  assert.equal(validateQuestionData('ORDERING', { items: ['1', '2'], correctOrder: [1, 2] }).valid, true);
  assert.equal(validateQuestionData('ORDERING', { items: ['1'] }).valid, false);

  assert.equal(validateQuestionData('MATCHING', { pairs: [{ left: 'A', right: '1' }, { left: 'B', right: '2' }] }).valid, true);
  assert.equal(validateQuestionData('MATCHING', { pairs: [{ left: 'A' }] }).valid, false);

  assert.equal(validateQuestionData('SHORT', { accepted: ['jawaban'] }).valid, true);
  assert.equal(validateQuestionData('SHORT', {}).valid, false);
});
