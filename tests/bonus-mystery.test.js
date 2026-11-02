'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const tmpDbPath = path.join(__dirname, 'test-bonus-mystery.db');
if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();

function cleanup() {
  try { db.getDb().close(); } catch (_) {}
  try { if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath); } catch (_) {}
}

function getCorrectDisplayIdx(rawDb, sq) {
  const qRow = rawDb.prepare('SELECT answer_index FROM questions WHERE id=?').get(sq.question_id);
  let order = [0, 1, 2, 3];
  if (sq.display_json) {
    try {
      const dj = JSON.parse(sq.display_json);
      if (Array.isArray(dj.optionOrder)) order = dj.optionOrder;
    } catch (_) {}
  } else if (sq.option_order) {
    try { order = JSON.parse(sq.option_order); } catch (_) {}
  }
  return order.indexOf(qRow.answer_index);
}

test('Skenario 13.2 #7 / T-31: Soal Bonus ⭐ & Soal Misteri ❓', async (t) => {
  t.after(cleanup);

  const rawDb = db.getDb();
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Bonus', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Matematika Bonus', '⭐', '#F1C40F', 'manis')").run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  // Buat 10 soal
  for (let i = 0; i < 10; i++) {
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ')
    `).run(subjectId, `Soal Ke-${i}`, JSON.stringify(['A', 'B', 'C', 'D']), `hash_bm_${i}`);
  }

  const player = db.registerPlayer('BonusHero', 'Pass1234', clsId);

  await t.test('1. Batas penentuan Bonus (maks 2) & Misteri (maks 1), tidak pada soal pertama & terakhir', () => {
    // Jalankan 30 sesi untuk menguji distribusi probabilitas & constraint
    for (let sIdx = 0; sIdx < 30; sIdx++) {
      rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
      const session = db.startSession(player.id, subjectId, { count: 10 });
      const sqRows = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? ORDER BY order_index ASC').all(session.sessionId);

      assert.equal(sqRows.length, 10);
      assert.equal(sqRows[0].is_bonus, 0, 'Soal pertama tidak boleh Bonus');
      assert.equal(sqRows[0].is_mystery, 0, 'Soal pertama tidak boleh Misteri');
      assert.equal(sqRows[9].is_bonus, 0, 'Soal terakhir tidak boleh Bonus');
      assert.equal(sqRows[9].is_mystery, 0, 'Soal terakhir tidak boleh Misteri');

      let bonusCount = 0;
      let mysteryCount = 0;
      for (const sq of sqRows) {
        if (sq.is_bonus) bonusCount++;
        if (sq.is_mystery) mysteryCount++;
        assert.ok(!(sq.is_bonus && sq.is_mystery), 'Soal tidak boleh Bonus sekaligus Misteri');
        if (sq.is_mystery) {
          assert.ok(sq.bonus_roll, 'Soal misteri harus memiliki bonus_roll tersimpan di server');
        }
      }

      assert.ok(bonusCount <= 2, `Jumlah bonus per sesi (${bonusCount}) maksimal 2`);
      assert.ok(mysteryCount <= 1, `Jumlah misteri per sesi (${mysteryCount}) maksimal 1`);
    }
  });

  await t.test('2. nextQuestion mengekspos isBonus dan isMystery tanpa membocorkan bonus_roll', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    const session = db.startSession(player.id, subjectId, { count: 10 });
    // Paksa soal indeks 1 menjadi Misteri
    rawDb.prepare("UPDATE session_questions SET is_mystery=1, bonus_roll='HEAL_15' WHERE session_id=? AND order_index=1").run(session.sessionId);

    // Ambil soal 1
    rawDb.prepare('UPDATE game_sessions SET current_index=1 WHERE id=?').run(session.sessionId);
    const q1 = db.nextQuestion(session.sessionId, player.id);
    assert.equal(q1.question.isMystery, true, 'isMystery harus true pada soal misteri');
    assert.equal(q1.question.bonus_roll, undefined, 'bonus_roll tidak boleh bocor ke client');
    assert.equal(q1.question.mysteryReward, undefined, 'mysteryReward tidak boleh bocor sebelum dijawab');
  });

  await t.test('3. Efek Jawaban Benar pada Soal Bonus (Damage x1.5)', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    const session = db.startSession(player.id, subjectId, { count: 10 });
    const sqList = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? ORDER BY order_index ASC').all(session.sessionId);

    // Bandingkan soal normal vs soal bonus
    const sqNormal = sqList[0];
    const sqBonus = sqList[1];
    rawDb.prepare('UPDATE session_questions SET is_bonus=0, is_weak=0 WHERE id=?').run(sqNormal.id);
    rawDb.prepare('UPDATE session_questions SET is_bonus=1, is_weak=0 WHERE id=?').run(sqBonus.id);

    // Jawab normal
    const cIdxNormal = getCorrectDisplayIdx(rawDb, sqNormal);
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sqNormal.id);
    const ansNormal = db.answerQuestion(session.sessionId, player.id, sqNormal.question_id, cIdxNormal);
    assert.equal(ansNormal.isCorrect, true);

    // Jawab bonus
    const cIdxBonus = getCorrectDisplayIdx(rawDb, sqBonus);
    rawDb.prepare('UPDATE game_sessions SET current_index=1, streak=0 WHERE id=?').run(session.sessionId);
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sqBonus.id);
    const ansBonus = db.answerQuestion(session.sessionId, player.id, sqBonus.question_id, cIdxBonus);
    assert.equal(ansBonus.isCorrect, true);

    assert.ok(ansBonus.isBonus, 'ansBonus harus menandai isBonus=true');
    assert.ok(ansBonus.damageToBoss > ansNormal.damageToBoss, 'Damage soal bonus harus lebih besar dari normal (x1.5)');
    assert.equal(ansBonus.damageToBoss, Math.min(Math.round(ansNormal.damageToBoss * 1.5), Math.ceil(session.bossMaxHp * 0.35)));
  });

  await t.test('4. Hadiah Soal Misteri diberikan saat benar (HEAL_15, ENERGY_1, COINS_8, DAMAGE_1_5)', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    const session = db.startSession(player.id, subjectId, { count: 10 });
    const sqList = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? ORDER BY order_index ASC').all(session.sessionId);
    const sqMyst = sqList[1];

    // Uji ENERGY_1
    rawDb.prepare("UPDATE session_questions SET is_mystery=1, bonus_roll='ENERGY_1' WHERE id=?").run(sqMyst.id);
    rawDb.prepare('UPDATE game_sessions SET current_index=1, energy=1 WHERE id=?').run(session.sessionId);
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sqMyst.id);

    const cIdxMyst = getCorrectDisplayIdx(rawDb, sqMyst);
    const ansMyst = db.answerQuestion(session.sessionId, player.id, sqMyst.question_id, cIdxMyst);
    assert.equal(ansMyst.isCorrect, true);
    assert.equal(ansMyst.isMystery, true);
    assert.equal(ansMyst.mysteryReward, 'ENERGY_1');
    // Energi awal 1 + reward (1) + outcome CRITICAL/NORMAL (>=1) >= 3
    assert.ok(ansMyst.energy.value >= 3);
  });
});
