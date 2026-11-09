// tests/bossfx.glue.test.js — uji perekat server (tanpa DB)
const test = require('node:test'); const assert = require('node:assert/strict');
const F = require('../lib/bossfx.js'); const B = require('../shared/bossskills.js');
const mkRow = (o) => ({ boss_element: 'fire', boss_tier: 'epic', brutal: 0, boss_phase: 1, boss_hp: 300, boss_max_hp: 400, monster_damage: 6, player_hp: 80, player_max_hp: 100, boss_fx_json: JSON.stringify(B.newFx()), ...o });

test('startFields: elemen dari tema, Brutal hanya bila tersedia & tema terpetakan, tema tak dikenal tidak menggagalkan sesi', () => {
  assert.deepEqual({ ...F.startFields({ themeKey: 'api', brutal: true, level: 5 }), boss_fx_json: 0 }, { boss_element: 'fire', brutal: 1, boss_fx_json: 0 });
  assert.equal(F.startFields({ themeKey: 'api', brutal: false, level: 9 }).brutal, 0);
  const none = F.startFields({ themeKey: 'tidak-dikenal', brutal: true, level: 9 }); assert.equal(none.boss_element, null); assert.equal(none.brutal, 0);
  const old = B.BRUTAL.minLevel; B.BRUTAL.minLevel = 5; assert.equal(F.startFields({ themeKey: 'laut', brutal: true, level: 4 }).brutal, 0); assert.equal(F.startFields({ themeKey: 'laut', brutal: true, level: 5 }).brutal, 1); B.BRUTAL.minLevel = old;
});
test('sesi lama (kolom NULL): semua hook netral', () => {
  const row = mkRow({ boss_element: null, boss_tier: null });
  assert.equal(F.active(row), false); assert.equal(F.onServeQuestion(row, 5, 20).timeLimitSec, 20); assert.equal(F.onWrongAnswer(row, 5, 3).damage, 6);
  assert.deepEqual(F.skillMods(row), { healMult: 1, comboBonusMult: 1, extraCost: 0 }); assert.deepEqual(F.publicView(row).skills, []);
});
test('salah → fx tersimpan; soal berikutnya memotong DoT; menyajikan ulang soal yang sama (resume) TIDAK memotong dua kali', () => {
  let row = mkRow({ boss_tier: 'legend', brutal: 1 });
  const w = F.onWrongAnswer(row, 2, 5); assert.ok(w.damage > 6 && w.update); row = { ...row, ...w.update, player_hp: row.player_hp - w.damage };
  assert.ok(JSON.parse(row.boss_fx_json).dotTurns > 0);
  const hpBefore = row.player_hp; const s1 = F.onServeQuestion(row, 3, 20); assert.ok(s1.dotDamage > 0); assert.equal(s1.update.player_hp, Math.max(1, hpBefore - s1.dotDamage));
  const row2 = { ...row, ...s1.update }; const s2 = F.onServeQuestion(row2, 3, 20);              // reload halaman → soal 3 disajikan lagi
  assert.equal(s2.dotDamage, 0); assert.equal(s2.update, null);
  const s3 = F.onServeQuestion(row2, 4, 20); assert.ok(s3.update);                                // soal 4 → giliran DoT berikutnya
});
test('jurus muncul sebagai telegraph pada soal kelipatan-N dan dihitung ulang saat menjawab', () => {
  const row = mkRow({ boss_tier: 'rare' }); const s = F.onServeQuestion(row, 5, 20); assert.equal(s.telegraph.skillId, 'fire_breath');
  assert.ok(F.onWrongAnswer(row, 5, 3).damage > F.onWrongAnswer(row, 4, 3).damage);
});
test('hadiah: pengali tier × 3 saat Brutal; skillMods mengikuti fase; publicView memuat skill sesuai rarity', () => {
  assert.deepEqual(F.rewardMult(mkRow({ brutal: 1 }), { coin: 1.7, xp: 1.5 }), { coin: 1.7 * 3, xp: 1.5 * 3 }); assert.deepEqual(F.rewardMult(mkRow({}), { coin: 1.7, xp: 1.5 }), { coin: 1.7, xp: 1.5 });
  assert.equal(F.skillMods(mkRow({ boss_element: 'thunder', boss_tier: 'legend', boss_phase: 2 })).extraCost >= 1, true);
  assert.equal(F.publicView(mkRow({ boss_tier: 'common' })).skills.length, 1); assert.equal(F.publicView(mkRow({ boss_tier: 'legend' })).skills.length, 4); assert.equal(F.publicView(mkRow({ brutal: 1 })).brutal, true);
});
test('DoT tak pernah membuat HP pemain < 1', () => {
  let row = mkRow({ boss_tier: 'legend', brutal: 1, player_hp: 2, monster_damage: 40 });
  row = { ...row, ...F.onWrongAnswer(row, 1, 5).update }; const s = F.onServeQuestion(row, 2, 20); assert.ok(s.update.player_hp >= 1);
});
test('Mode Brutal: salah menjawab soal menghasilkan damage 2x dari mode biasa', () => {
  const rowNormal = mkRow({ boss_tier: 'common', brutal: 0, monster_damage: 10, boss_hp: 400, boss_max_hp: 400 });
  const rowBrutal = mkRow({ boss_tier: 'common', brutal: 1, monster_damage: 10, boss_hp: 400, boss_max_hp: 400 });
  const wNormal = F.onWrongAnswer(rowNormal, 1, 3);
  const wBrutal = F.onWrongAnswer(rowBrutal, 1, 3);
  assert.equal(wNormal.damage, 10);
  assert.equal(wBrutal.damage, 20);
  assert.equal(wBrutal.damage, wNormal.damage * 2);

  // Inactive row (tanpa boss_element/boss_tier)
  const rowLegacyNormal = mkRow({ boss_element: null, boss_tier: null, brutal: 0, monster_damage: 8 });
  const rowLegacyBrutal = mkRow({ boss_element: null, boss_tier: null, brutal: 1, monster_damage: 8 });
  assert.equal(F.onWrongAnswer(rowLegacyNormal, 1, 3).damage, 8);
  assert.equal(F.onWrongAnswer(rowLegacyBrutal, 1, 3).damage, 16);
});
