'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const tmpDbPath = path.join(__dirname, 'test-star-calc.db');
for (const ext of ['', '-wal', '-shm']) {
  if (fs.existsSync(tmpDbPath + ext)) {
    try { fs.unlinkSync(tmpDbPath + ext); } catch (_) {}
  }
}
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();

test('Perhitungan Bintang (+30% Lebih Mudah)', async (t) => {
  const rawDb = db.getDb();

  await t.test('1. Verifikasi konfigurasi GAME.stars threshold baru', () => {
    assert.equal(db.GAME.stars.three, 0.63, 'Ambang 3 bintang harus 0.63 (turun 30% dari 0.90)');
    assert.equal(db.GAME.stars.two, 0.49, 'Ambang 2 bintang harus 0.49 (turun 30% dari 0.70)');
  });

  // Setup Class & Subject with 25 questions
  const cls = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES(?, 1)").run('Kelas Star Test ' + Date.now());
  const clsId = Number(cls.lastInsertRowid);
  const sub = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Matematika Bintang', '⭐', '#eab308', 'api')").run(clsId);
  const subId = Number(sub.lastInsertRowid);

  for (let i = 0; i < 25; i++) {
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ')
    `).run(subId, `Soal Star ${i}`, JSON.stringify(['Benar', 'Salah 1', 'Salah 2', 'Salah 3']), `hash_star_${i}_${Date.now()}`);
  }

  const player = db.registerPlayer('StarHero_' + Date.now(), 'Pass1234', clsId);

  function getOptionIndices(sessionId, orderIndex = 0) {
    const sq = rawDb.prepare(`
      SELECT sq.option_order, sq.display_json, q.answer_index
      FROM session_questions sq
      JOIN questions q ON q.id=sq.question_id
      WHERE sq.session_id=? AND sq.order_index=?
    `).get(sessionId, orderIndex);
    let order = [0, 1, 2, 3];
    try {
      const disp = JSON.parse(sq.display_json || '{}');
      order = disp.optionOrder || JSON.parse(sq.option_order || '[]');
    } catch (_) {}
    const correctIdx = order.indexOf(sq.answer_index);
    const wrongIdx = (correctIdx + 1) % order.length;
    return { correctIdx, wrongIdx };
  }

  await t.test('2. Kondisi Menang (WON): Ambang Bintang Baru', () => {
    // Skenario A: 10 soal, benar 7 (Akurasi 70%).
    // Dulu: hanya 2 bintang (karena butuh >= 90% untuk 3 bintang).
    // Sekarang: 70% >= 63% -> Harus 3 BINTANG!
    const session3 = db.startSession(player.id, subId, { mode: 'BATTLE' });
    const s3Id = session3.sessionId;
    rawDb.prepare('UPDATE game_sessions SET total_questions = 10, max_questions = 10, boss_tier = NULL, player_hp = 1000, player_max_hp = 1000 WHERE id = ?').run(s3Id);

    // 3 salah (soal 0, 1, 2)
    for (let i = 0; i < 3; i++) {
      const { wrongIdx } = getOptionIndices(s3Id, i);
      db.answerQuestion(s3Id, player.id, i, wrongIdx, 2500);
    }
    // 6 benar (soal 3..8) dengan boss HP besar
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 1000 WHERE id = ?').run(s3Id);
    for (let i = 3; i < 9; i++) {
      const { correctIdx } = getOptionIndices(s3Id, i);
      db.answerQuestion(s3Id, player.id, i, correctIdx, 2500);
    }
    // Soal ke-10 (index 9): benar dan membunuh boss (boss_hp = 5) -> total 7 benar dari 10 soal (70%)
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 5 WHERE id = ?').run(s3Id);
    const { correctIdx: lastCorrect } = getOptionIndices(s3Id, 9);
    const res3 = db.answerQuestion(s3Id, player.id, 9, lastCorrect, 2500);

    assert.equal(res3.session.status, 'WON');
    assert.equal(res3.session.stars, 3, 'Akurasi 7/10 (70%) saat menang harus mendapatkan 3 Bintang (ambang baru >= 63%)');
    assert.equal(res3.rewards.stars, 3);

    // Skenario B: 10 soal, benar 5 dari 10 soal (Akurasi 50%).
    // Dulu: hanya 1 bintang (karena butuh >= 70% untuk 2 bintang).
    // Sekarang: 50% >= 49% -> Harus 2 BINTANG!
    const session2 = db.startSession(player.id, subId, { mode: 'BATTLE' });
    const s2Id = session2.sessionId;
    rawDb.prepare('UPDATE game_sessions SET total_questions = 10, max_questions = 10, boss_tier = NULL, player_hp = 1000, player_max_hp = 1000 WHERE id = ?').run(s2Id);

    // 5 salah (soal 0..4)
    for (let i = 0; i < 5; i++) {
      const { wrongIdx } = getOptionIndices(s2Id, i);
      db.answerQuestion(s2Id, player.id, i, wrongIdx, 2500);
    }
    // 4 benar (soal 5..8)
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 1000 WHERE id = ?').run(s2Id);
    for (let i = 5; i < 9; i++) {
      const { correctIdx } = getOptionIndices(s2Id, i);
      db.answerQuestion(s2Id, player.id, i, correctIdx, 2500);
    }
    // 1 benar membunuh boss (soal 9) -> total 5 benar dari 10 soal (50%)
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 5 WHERE id = ?').run(s2Id);
    const { correctIdx: killCorrect } = getOptionIndices(s2Id, 9);
    const res2 = db.answerQuestion(s2Id, player.id, 9, killCorrect, 2500);

    assert.equal(res2.session.status, 'WON');
    assert.equal(res2.session.stars, 2, 'Akurasi 5/10 (50%) saat menang harus mendapatkan 2 Bintang (ambang baru >= 49%)');
    assert.equal(res2.rewards.stars, 2);

    // Skenario C: Akurasi di bawah 49% saat menang (misal 4/10 = 40%) -> 1 Bintang
    const session1 = db.startSession(player.id, subId, { mode: 'BATTLE' });
    const s1Id = session1.sessionId;
    rawDb.prepare('UPDATE game_sessions SET total_questions = 10, max_questions = 10, boss_tier = NULL, player_hp = 1000, player_max_hp = 1000 WHERE id = ?').run(s1Id);

    // 6 salah (soal 0..5)
    for (let i = 0; i < 6; i++) {
      const { wrongIdx } = getOptionIndices(s1Id, i);
      db.answerQuestion(s1Id, player.id, i, wrongIdx, 2500);
    }
    // 3 benar (soal 6..8)
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 1000 WHERE id = ?').run(s1Id);
    for (let i = 6; i < 9; i++) {
      const { correctIdx } = getOptionIndices(s1Id, i);
      db.answerQuestion(s1Id, player.id, i, correctIdx, 2500);
    }
    // 1 benar membunuh boss (soal 9) -> total 4 benar dari 10 soal (40% < 49%)
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 5 WHERE id = ?').run(s1Id);
    const { correctIdx: lastCorrect1 } = getOptionIndices(s1Id, 9);
    const res1 = db.answerQuestion(s1Id, player.id, 9, lastCorrect1, 2500);

    assert.equal(res1.session.status, 'WON');
    assert.equal(res1.session.stars, 1, 'Akurasi 4/10 (40%) saat menang harus mendapatkan 1 Bintang (< 49%)');
    assert.equal(res1.rewards.stars, 1);

    // Skenario D: Kemenangan Cepat (Boss mati pada soal ke-6 dari total_questions=20, 6/6 benar = 100%)
    // Bug sebelumnya: accuracy dihitung 6 / 20 = 30% (< 49%) -> hanya dapat 1 bintang!
    // Perbaikan: accuracy dihitung berdasarkan soal yang dijawab (6 / 6 = 100%) -> Harus 3 BINTANG!
    const sessionFast = db.startSession(player.id, subId, { mode: 'BATTLE' });
    const sFastId = sessionFast.sessionId;
    rawDb.prepare('UPDATE game_sessions SET total_questions = 20, max_questions = 20, boss_tier = NULL, player_hp = 1000, player_max_hp = 1000 WHERE id = ?').run(sFastId);

    // 5 soal pertama benar (boss tetap hidup)
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 1000 WHERE id = ?').run(sFastId);
    for (let i = 0; i < 5; i++) {
      const { correctIdx } = getOptionIndices(sFastId, i);
      db.answerQuestion(sFastId, player.id, i, correctIdx, 2000);
    }
    // Soal ke-6 (index 5) benar dan membunuh boss (boss_hp = 5)
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 5 WHERE id = ?').run(sFastId);
    const { correctIdx: fastKillCorrect } = getOptionIndices(sFastId, 5);
    const resFast = db.answerQuestion(sFastId, player.id, 5, fastKillCorrect, 2000);

    assert.equal(resFast.session.status, 'WON');
    assert.equal(resFast.session.correctCount, 6);
    assert.equal(resFast.session.currentIndex, 5);
    assert.equal(resFast.session.stars, 3, 'Kemenangan 6/6 soal benar (100%) dari 20 soal teralokasi harus mendapatkan 3 Bintang!');
    assert.equal(resFast.rewards.stars, 3);
  });

  await t.test('3. Kondisi Kalah Kehabisan Soal (OUT_OF_QUESTIONS): Ambang Damage Ratio Baru', () => {
    // Skenario A: Damage boss 60% (sisa HP 40/100).
    // Dulu: hanya 1 bintang (karena butuh >= 80% untuk 2 bintang).
    // Sekarang: damage ratio 60% >= 56% -> Harus 2 BINTANG!
    const sessionOQ2 = db.startSession(player.id, subId, { mode: 'BATTLE' });
    const sOQ2Id = sessionOQ2.sessionId;
    rawDb.prepare('UPDATE game_sessions SET total_questions = 10, max_questions = 10, boss_tier = NULL, boss_hp = 10000, boss_max_hp = 10000, player_hp = 500, player_max_hp = 500 WHERE id = ?').run(sOQ2Id);

    // Jawab benar 9 soal pertama (player tetap hidup 500 HP, boss HP 10000 tidak mati)
    for (let i = 0; i < 9; i++) {
      const { correctIdx } = getOptionIndices(sOQ2Id, i);
      db.answerQuestion(sOQ2Id, player.id, i, correctIdx, 2500);
    }

    // Sebelum soal ke-10 (terakhir), set boss HP = 40, max_hp = 100 (damage ratio = (100 - 40) / 100 = 60%)
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 40, boss_max_hp = 100 WHERE id = ?').run(sOQ2Id);
    const { wrongIdx: wLast2 } = getOptionIndices(sOQ2Id, 9);
    const resOQ2 = db.answerQuestion(sOQ2Id, player.id, 9, wLast2, 2500);

    assert.equal(resOQ2.session.status, 'LOST');
    assert.equal(resOQ2.session.endReason, 'OUT_OF_QUESTIONS');
    assert.equal(resOQ2.session.stars, 2, 'Damage ratio 60% pada OUT_OF_QUESTIONS harus mendapatkan 2 Bintang (ambang baru >= 56%)');

    // Skenario B: Damage boss 40% (sisa HP 60/100).
    // Dulu: 0 bintang (karena butuh >= 50% untuk 1 bintang).
    // Sekarang: damage ratio 40% >= 35% -> Harus 1 BINTANG!
    const sessionOQ1 = db.startSession(player.id, subId, { mode: 'BATTLE' });
    const sOQ1Id = sessionOQ1.sessionId;
    rawDb.prepare('UPDATE game_sessions SET total_questions = 10, max_questions = 10, boss_tier = NULL, boss_hp = 10000, boss_max_hp = 10000, player_hp = 500, player_max_hp = 500 WHERE id = ?').run(sOQ1Id);

    for (let i = 0; i < 9; i++) {
      const { correctIdx } = getOptionIndices(sOQ1Id, i);
      db.answerQuestion(sOQ1Id, player.id, i, correctIdx, 2500);
    }

    // Set boss HP = 60, max_hp = 100 (damage ratio = (100 - 60) / 100 = 40%)
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 60, boss_max_hp = 100 WHERE id = ?').run(sOQ1Id);
    const { wrongIdx: wLast1 } = getOptionIndices(sOQ1Id, 9);
    const resOQ1 = db.answerQuestion(sOQ1Id, player.id, 9, wLast1, 2500);

    assert.equal(resOQ1.session.status, 'LOST');
    assert.equal(resOQ1.session.endReason, 'OUT_OF_QUESTIONS');
    assert.equal(resOQ1.session.stars, 1, 'Damage ratio 40% pada OUT_OF_QUESTIONS harus mendapatkan 1 Bintang (ambang baru >= 35%)');

    // Skenario C: Damage boss 20% (sisa HP 80/100, ratio = 20% < 35%) -> 0 Bintang
    const sessionOQ0 = db.startSession(player.id, subId, { mode: 'BATTLE' });
    const sOQ0Id = sessionOQ0.sessionId;
    rawDb.prepare('UPDATE game_sessions SET total_questions = 10, max_questions = 10, boss_tier = NULL, boss_hp = 10000, boss_max_hp = 10000, player_hp = 500, player_max_hp = 500 WHERE id = ?').run(sOQ0Id);

    for (let i = 0; i < 9; i++) {
      const { correctIdx } = getOptionIndices(sOQ0Id, i);
      db.answerQuestion(sOQ0Id, player.id, i, correctIdx, 2500);
    }

    // Set boss HP = 80, max_hp = 100 (damage ratio = (100 - 80) / 100 = 20%)
    rawDb.prepare('UPDATE game_sessions SET boss_hp = 80, boss_max_hp = 100 WHERE id = ?').run(sOQ0Id);
    const { wrongIdx: wLast0 } = getOptionIndices(sOQ0Id, 9);
    const resOQ0 = db.answerQuestion(sOQ0Id, player.id, 9, wLast0, 2500);

    assert.equal(resOQ0.session.status, 'LOST');
    assert.equal(resOQ0.session.endReason, 'OUT_OF_QUESTIONS');
    assert.equal(resOQ0.session.stars, 0, 'Damage ratio 20% pada OUT_OF_QUESTIONS (< 35%) harus 0 Bintang');
  });

  await t.test('4. Verifikasi getBattleHistory untuk Menu History Profile', () => {
    const history = db.getBattleHistory(player.id, 10);
    assert.ok(Array.isArray(history), 'History harus mengembalikan array');
    assert.ok(history.length >= 4, 'History harus berisi minimal 4 sesi pertarungan');

    const first = history[0];
    assert.ok(first.id, 'Battle history harus menyertakan battle ID (UUID)');
    assert.equal(typeof first.correctCount, 'number');
    assert.equal(typeof first.answeredCount, 'number');
    assert.equal(typeof first.accuracy, 'number');
    assert.ok(first.subjectName, 'Battle history harus menyertakan nama mapel');
    assert.ok(first.createdAt, 'Battle history harus menyertakan tanggal/waktu');
  });

  try {
    rawDb.close();
    for (const ext of ['', '-wal', '-shm']) {
      if (fs.existsSync(tmpDbPath + ext)) {
        try { fs.unlinkSync(tmpDbPath + ext); } catch (_) {}
      }
    }
  } catch (_) {}
});
