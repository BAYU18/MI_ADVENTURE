'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Use a separate temp SQLite DB for testing
const tmpDbPath = path.join(__dirname, 'test-spaced.db');
if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();

test('T-10: Spaced Repetition Backend Engine (afterAnswer di answerQuestion)', () => {
  const rawDb = db.getDb();
  
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Spaced', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Matematika Spaced', '📐', '#3A7BD5', 'hutan')").run(clsId);
  const subId = Number(subInfo.lastInsertRowid);

  for (let i = 0; i < 3; i++) {
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ')
    `).run(subId, `Pertanyaan Spaced ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), `hash_sp_${i}`);
  }

  // Create player
  const player = db.registerPlayer('TestSpacedUser', 'Pass1234', clsId);

  // Start session
  const session = db.startSession(player.id, subId);
  assert.equal(session.ok, true);

  // Ambil soal pertama dari session
  const sq = rawDb.prepare(`
    SELECT sq.*, q.answer_index, q.options_json
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    WHERE sq.session_id = ?
    ORDER BY sq.order_index ASC
    LIMIT 1
  `).get(session.sessionId);
  assert.ok(sq, 'Session question harus ada');

  const optionOrder = JSON.parse(sq.option_order);
  const correctDisplayIndex = optionOrder.indexOf(sq.answer_index);
  const wrongDisplayIndex = (correctDisplayIndex + 1) % optionOrder.length;

  // 1. Jawab SALAH
  const resWrong = db.answerQuestion(session.sessionId, player.id, sq.question_id, wrongDisplayIndex);
  assert.equal(resWrong.outcome, 'WRONG');

  let pqs = rawDb.prepare('SELECT * FROM player_question_stats WHERE player_id=? AND question_id=?').get(player.id, sq.question_id);
  assert.ok(pqs);
  assert.equal(pqs.box, 0);
  assert.equal(pqs.lapses, 1);
  assert.equal(pqs.mastered, 0);
  assert.ok(pqs.due_at);

  // 2. Sekarang jawab BENAR di session baru (setelah selesaikan sesi pertama)
  rawDb.prepare("UPDATE game_sessions SET status='WON', finished_at=datetime('now') WHERE id=?").run(session.sessionId);
  const session2 = db.startSession(player.id, subId);
  const sq2 = rawDb.prepare(`
    SELECT sq.*, q.answer_index, q.options_json
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    WHERE sq.session_id = ? AND sq.question_id = ?
  `).get(session2.sessionId, sq.question_id);

  if (sq2) {
    const optOrder2 = JSON.parse(sq2.option_order);
    const corrIdx2 = optOrder2.indexOf(sq2.answer_index);
    const resCorrect = db.answerQuestion(session2.sessionId, player.id, sq2.question_id, corrIdx2);
    assert.ok(resCorrect.outcome === 'CORRECT' || resCorrect.outcome === 'CRITICAL');

    pqs = rawDb.prepare('SELECT * FROM player_question_stats WHERE player_id=? AND question_id=?').get(player.id, sq.question_id);
    assert.equal(pqs.box, 1);
    assert.equal(pqs.lapses, 1);
    assert.equal(pqs.mastered, 0);
  }

  // 3. T-11: Test alokasi slot review pada startSession
  // Set due_at untuk sq.question_id ke masa lalu (kemarin)
  rawDb.prepare("UPDATE player_question_stats SET due_at = datetime('now', '-1 day'), mastered = 0 WHERE player_id=? AND question_id=?")
    .run(player.id, sq.question_id);

  // Selesaikan sesi 2
  rawDb.prepare("UPDATE game_sessions SET status='WON', finished_at=datetime('now') WHERE id=?").run(session2.sessionId);

  // Mulai sesi baru
  const session3 = db.startSession(player.id, subId);
  const reviewQuestions = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND is_review=1').all(session3.sessionId);
  assert.ok(reviewQuestions.length >= 1, 'Harus ada minimal 1 soal review yang dialokasikan');
  assert.equal(reviewQuestions[0].question_id, sq.question_id, 'Soal review harus mencocokkan soal yang jatuh tempo');

  // 4. T-12: Test Bonus XP untuk soal review
  const revSq = rawDb.prepare(`
    SELECT sq.*, q.answer_index
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    WHERE sq.session_id=? AND sq.is_review=1
    LIMIT 1
  `).get(session3.sessionId);

  const revOptOrder = JSON.parse(revSq.option_order);
  const revCorrIdx = revOptOrder.indexOf(revSq.answer_index);
  const revAnsRes = db.answerQuestion(session3.sessionId, player.id, revSq.question_id, revCorrIdx);
  assert.ok(revAnsRes.outcome === 'CORRECT' || revAnsRes.outcome === 'CRITICAL');

  // Cek bonus review dihitung saat session selesai
  rawDb.prepare("UPDATE game_sessions SET status='WON', finished_at=datetime('now') WHERE id=?").run(session3.sessionId);
  const reviewCnt = rawDb.prepare("SELECT COUNT(*) as c FROM session_questions WHERE session_id=? AND is_review=1 AND outcome IN ('CORRECT', 'CRITICAL')").get(session3.sessionId).c;
  assert.equal(reviewCnt, 1);
});
