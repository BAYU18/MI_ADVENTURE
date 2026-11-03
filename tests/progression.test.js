// tests/progression.test.js — uji unit logika murni v6 (node --test)
const test = require('node:test'); const assert = require('node:assert/strict');
const P = require('../shared/progression.js'); const { run, rng } = require('../scripts/sim-boss.js');

test('B: ambang level kemampuan', () => {
  const lv = (s) => P.abilityLevel(s).level;
  assert.deepEqual([0, 19, 20, 39, 40, 59, 60, 79, 80, 100].map(lv), [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
});
test('B: skor — tanpa data / data kurang / terukur', () => {
  assert.equal(P.abilityScore({ attempts: 0 }).status, 'NONE');
  assert.equal(P.abilityScore({ attempts: 7 }).status, 'INSUFFICIENT');
  const strong = P.abilityScore({ attempts: 40, totalActive: 50, stats: Array(40).fill({ box: 5, difficulty: 2 }), recent: Array(40).fill({ correct: true, difficulty: 2 }) });
  const weak = P.abilityScore({ attempts: 40, totalActive: 50, stats: Array(40).fill({ box: 1, difficulty: 2 }), recent: Array(40).fill({ correct: false, difficulty: 2 }) });
  assert.equal(strong.status, 'MEASURED'); assert.equal(strong.score, 100); assert.equal(weak.score, 10);   // hanya komponen cakupan (10%) yang terisi
  assert.ok(strong.score > weak.score);
  assert.equal(strong.levelName, 'Master'); assert.equal(weak.levelName, 'Pemula'); assert.equal(strong.name, undefined);   // `name` mapel tidak tertimpa
});
test('B: urutan NAIK — terukur kecil→besar, lalu kurang data, lalu belum dicoba; seri = nama A–Z', () => {
  const out = P.sortAbilities([
    { name: 'IPA', status: 'MEASURED', score: 70 }, { name: 'Seni', status: 'NONE', attempts: 0 }, { name: 'IPS', status: 'MEASURED', score: 35 },
    { name: 'Agama', status: 'MEASURED', score: 35 }, { name: 'PJOK', status: 'INSUFFICIENT', attempts: 3 }, { name: 'Bahasa', status: 'INSUFFICIENT', attempts: 5 } ]);
  assert.deepEqual(out.map((x) => x.name), ['Agama', 'IPS', 'IPA', 'PJOK', 'Bahasa', 'Seni']);
  assert.deepEqual(out.map((x) => x.rank), [1, 2, 3, 4, 5, 6]);
});
test('C: tier, bobot, dan peta kampanye', () => {
  assert.deepEqual(P.TIER_ORDER, ['common', 'rare', 'epic', 'legend']);
  for (const lv of [1, 5, 6, 10, 11, 20, 21, 99]) assert.equal(Object.values(P.tierWeights(lv)).reduce((a, b) => a + b, 0), 100);
  assert.equal(P.campaignTier(1, 1), 'common'); assert.equal(P.campaignTier(1, 4), 'rare'); assert.equal(P.campaignTier(5, 4), 'legend');
  const r = rng(7); const cnt = { common: 0, rare: 0, epic: 0, legend: 0 }; for (let i = 0; i < 20000; i++) cnt[P.pickTier(r, 3)]++;
  assert.equal(cnt.legend, 0); assert.ok(Math.abs(cnt.common / 20000 - 0.70) < 0.02);
});
test('D: jawaban benar yang dibutuhkan selalu 15–30 dan sesuai tier', () => {
  for (const t of P.TIER_ORDER) for (const a of [null, 0, 25, 50, 75, 100]) {
    const n = P.hitsNeeded(t, a); assert.ok(n >= 15 && n <= 30); assert.ok(n >= P.BOSS_TIERS[t].minHits && n <= P.BOSS_TIERS[t].maxHits);
  }
  assert.equal(P.hitsNeeded('common', 0), 15); assert.equal(P.hitsNeeded('legend', 100), 30);
  assert.ok(P.hitsNeeded('legend', 90) > P.hitsNeeded('legend', 10));   // adaptif: pemain lebih kuat → rentang atas
  const st = P.bossStats('epic', 50, 100); assert.equal(st.bossMaxHp, st.hitsNeeded * 20); assert.ok(st.planned <= st.maxQuestions && st.maxQuestions <= 50);
  assert.equal(P.bossStats('legend', 100, 100, 12).hitsNeeded, 12);       // bank soal kecil → dibatasi
});
test('D: damage — lantai 1 hit, plafon 4×, pity, dan boss tak tumbang < 15 benar', () => {
  assert.equal(P.hitDamage({ comboStreak: 0, wrongStreak: 0 }).damage, 20);
  assert.equal(P.hitDamage({ comboStreak: 0, wrongStreak: 3 }).damage, 30);
  assert.equal(P.hitDamage({ comboStreak: 99, wrongStreak: 9, powerMult: 4 }).damage, 80);
  assert.equal(P.hitDamage({ comboStreak: 0, powerMult: 0.5 }).damage, 20);
  assert.equal(P.applyBossDamage(30, 80, 5), 1);        // belum 15 benar → sisa 1
  assert.equal(P.applyBossDamage(30, 80, 15), 0);
  assert.equal(P.applyBossDamage(100, 20, 3), 80);
});
test('D: kelelahan boss — hanya bila akurasi rendah, total benar tak < 15', () => {
  assert.equal(P.fatigueAdjust({ bossHp: 200, correctCount: 5, answeredCount: 4 }).applied, false);   // data kurang
  assert.equal(P.fatigueAdjust({ bossHp: 200, correctCount: 9, answeredCount: 10 }).applied, false);  // akurasi tinggi
  const f = P.fatigueAdjust({ bossHp: 400, correctCount: 5, answeredCount: 12 });                       // sisa 20 hit → 17
  assert.equal(f.applied, true); assert.equal(f.bossHp, 17 * 20);
  const blocked = P.fatigueAdjust({ bossHp: 200, correctCount: 5, answeredCount: 12 });                // 5 + 10 = 15 → lantai 15 menahan
  assert.equal(blocked.applied, false); assert.equal(blocked.bossHp, 200);
  for (const [hp, c] of [[400, 5], [300, 9], [100, 12], [40, 14]]) { const g = P.fatigueAdjust({ bossHp: hp, correctCount: c, answeredCount: 30 }); assert.ok(P.hitsLeft(g.bossHp) + c >= 15); }
});
test('F: kapasitas energi per level profil', () => {
  assert.deepEqual([1, 5, 6, 10, 11, 15, 16, 35, 36, 200].map(P.energyMaxForLevel), [5, 5, 6, 6, 7, 7, 8, 11, 12, 12]);
  assert.equal(P.gainEnergy(5, 3, 5), 5); assert.equal(P.gainEnergy(2, -9, 5), 0);
  assert.deepEqual([2, 3, 6, 9, 12].map(P.energyFromCorrect), [0, 1, 1, 1, 1]);
  assert.deepEqual(P.nextEnergyLevel(3), { level: 6, energyMax: 6 }); assert.equal(P.nextEnergyLevel(40), null);
});
test('E: tabel level skill & biaya upgrade', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map((l) => P.skillInfo('heal', l).value), [25, 35, 45, 55, 65]);
  assert.deepEqual([1, 2, 3, 4, 5].map((l) => P.skillInfo('shield', l).value), [20, 40, 60, 80, 100]);
  assert.deepEqual([1, 2, 3, 4, 5].map((l) => P.skillInfo('power_strike', l).value), [2, 2.5, 3, 3.5, 4]);
  assert.deepEqual([1, 2, 3, 4, 5].map((l) => P.skillInfo('time_freeze', l).value), [8, 11, 14, 17, 20]);
  assert.deepEqual([1, 2, 3, 4, 5].map(P.skillUpgradeCost), [60, 120, 220, 380, null]);
  assert.equal(Object.keys(P.SKILL_TABLE).length, 9);
});
test('C/D: simulasi keseimbangan (akurasi 50/70/90%) — pita penerimaan', () => {
  const g = (t, a, acc) => run(t, a, acc, 1500);
  for (const t of P.TIER_ORDER) for (const acc of [0.5, 0.7, 0.9]) {
    const r = g(t, 50, acc); assert.equal(r.overN, 0, `${t}@${acc}: tak boleh butuh > N benar`);
    if (r.win > 0) { assert.ok(r.minCorrectWin >= 15, `${t}@${acc} min`); assert.ok(r.maxCorrectWin <= 30, `${t}@${acc} max`); }
  }
  assert.ok(g('common', 50, 0.7).win >= 0.93); assert.ok(g('common', 50, 0.9).win >= 0.99);
  const l7 = g('legend', 50, 0.7); assert.ok(l7.win >= 0.78 && l7.win <= 0.97); assert.ok(g('legend', 50, 0.5).win <= 0.20);
  const c5 = g('common', 50, 0.5); assert.ok(c5.win >= 0.30 && c5.win <= 0.65);
  assert.ok(g('common', 50, 0.7).avgQ <= 28); assert.ok(l7.avgQ <= 44);
});
