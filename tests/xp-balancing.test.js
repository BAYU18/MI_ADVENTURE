'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../lib/db');

test('T-57: XP Balancing (Proposal Opsi 1) - Estimasi Kemenangan ke Lv 20', async (t) => {
  const targetLevel = 20;
  const targetXp = (targetLevel - 1) * (targetLevel - 1) * 50; // 18.050 XP
  assert.equal(targetXp, 18050, 'Target XP Lv 20 harus 18.050');

  await t.test('1. Verifikasi Nilai Base XP per Bintang di GAME.xp.winByStars', () => {
    const winByStars = db.GAME.xp.winByStars;
    assert.ok(winByStars, 'winByStars harus terdefinisi di GAME.xp');
    assert.equal(winByStars[1], 72, '1 Bintang harus bernilai 72 XP dasar');
    assert.equal(winByStars[2], 90, '2 Bintang harus bernilai 90 XP dasar');
    assert.equal(winByStars[3], 120, '3 Bintang harus bernilai 120 XP dasar');
  });

  await t.test('2. Kondisi Terburuk (1 Bintang): Tepat ~250 Kemenangan Mencapai Lv 20', () => {
    const xpPerWin = db.GAME.xp.winByStars[1]; // 72
    // 250 kemenangan x 72 = 18.000 XP. Dengan sedikit streak / game ke-251 langsung tembus 18.050
    const totalXpAt250 = xpPerWin * 250;
    const totalXpAt251 = xpPerWin * 251;
    assert.equal(db.GAME.levelFormula(totalXpAt251), 20, 'Kemenangan ke-251 harus mencapai Lv 20');
    // Jika ada minimal streak 1 pada kemenangan (+2 XP), 250 x (72 + 2) = 18.500 (Lv 20)
    assert.equal(db.GAME.levelFormula(250 * (xpPerWin + 1)), 20);
  });

  await t.test('3. Kondisi Sedang (2 Bintang): Tepat ~200 Kemenangan Mencapai Lv 20', () => {
    const xpPerWin = db.GAME.xp.winByStars[2]; // 90
    // 200 kemenangan x 90 = 18.000 XP
    const totalXpAt201 = xpPerWin * 201;
    assert.equal(db.GAME.levelFormula(totalXpAt201), 20, 'Kemenangan ke-201 harus mencapai Lv 20');
    // Jika ada minimal streak kecil (+1 XP rata-rata), 200 x 91 = 18.200 (Lv 20)
    assert.equal(db.GAME.levelFormula(200 * (xpPerWin + 1)), 20);
  });

  await t.test('4. Kondisi Terbaik (3 Bintang): Tepat ~150 Kemenangan Mencapai Lv 20', () => {
    const xpPerWin = db.GAME.xp.winByStars[3]; // 120
    // 150 kemenangan x 120 = 18.000 XP
    const totalXpAt151 = xpPerWin * 151;
    assert.equal(db.GAME.levelFormula(totalXpAt151), 20, 'Kemenangan ke-151 harus mencapai Lv 20');
    // Jika ada minimal streak kecil (+1 XP rata-rata), 150 x 121 = 18.150 (Lv 20)
    assert.equal(db.GAME.levelFormula(150 * (xpPerWin + 1)), 20);
  });
});
