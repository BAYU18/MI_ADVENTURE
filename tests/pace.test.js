'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Use a separate temp SQLite DB for testing
const tmpDbPath = path.join(__dirname, 'test-pace.db');
if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();
const grading = require('../shared/grading');

test('T-13: Dynamic Time Pacing Engine (updatePace function)', () => {
  // 1. Kurang dari 5 soal dijawab -> pace tidak berubah
  assert.equal(grading.updatePace(1.0, { totalAnswered: 4, timeouts: 2 }), 1.0);

  // 2. Timeout >= 2 -> pace naik +0.10
  assert.equal(grading.updatePace(1.0, { totalAnswered: 6, timeouts: 2, accuracy: 0.5 }), 1.10);

  // 3. Cepat (medianRatio < 0.35) & Akurat (>= 85%) -> pace turun -0.05
  assert.equal(grading.updatePace(1.0, { totalAnswered: 10, timeouts: 0, medianRatio: 0.30, accuracy: 0.90 }), 0.95);

  // 4. Lambat (medianRatio > 0.80) & Cukup Akurat (>= 70%) -> pace naik +0.10
  assert.equal(grading.updatePace(1.0, { totalAnswered: 10, timeouts: 0, medianRatio: 0.85, accuracy: 0.75 }), 1.10);

  // 5. Clamp minimum 0.8
  assert.equal(grading.updatePace(0.82, { totalAnswered: 10, timeouts: 0, medianRatio: 0.20, accuracy: 1.0 }), 0.80);

  // 6. Clamp maximum 1.5
  assert.equal(grading.updatePace(1.45, { totalAnswered: 10, timeouts: 3, accuracy: 0.5 }), 1.50);
});

test('T-13: Dynamic Time Pacing Integration di Database & Session', () => {
  const rawDb = db.getDb();

  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Pacing', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Matematika Pacing', '📐', '#3A7BD5', 'hutan')").run(clsId);
  const subId = Number(subInfo.lastInsertRowid);

  for (let i = 0; i < 6; i++) {
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ')
    `).run(subId, `Pertanyaan Pacing ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), `hash_pace_${i}`);
  }

  const player = db.registerPlayer('TestPacingUser', 'Pass1234', clsId);

  // Set pace_factor awal pada player_subject_progress ke 1.2
  rawDb.prepare(`
    INSERT INTO player_subject_progress(player_id, subject_id, sessions_played, wins, best_stars, total_answered, total_correct, best_streak, last_played_at, pace_factor)
    VALUES(?, ?, 1, 1, 3, 5, 5, 5, datetime('now'), 1.2)
  `).run(player.id, subId);

  // Start session baru
  const session = db.startSession(player.id, subId);
  assert.equal(session.ok, true);

  // Cek bahwa pace_used di game_sessions diisi dengan 1.2
  const gs = rawDb.prepare('SELECT pace_used FROM game_sessions WHERE id=?').get(session.sessionId);
  assert.equal(gs.pace_used, 1.2);

  // Cek timeLimitSec pada getSession menghitung faktor pace
  const sData = db.getSession(session.sessionId, player.id);
  assert.ok(sData);
  assert.ok(sData.currentQuestion);
  // Base time limit = 20, dengan pace 1.2 -> 20 * 1.2 = 24 (plus readBonus jika ada)
  assert.ok(sData.currentQuestion.timeLimitSec >= 24);
});
