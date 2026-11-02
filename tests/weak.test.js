'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const tmpDbPath = path.join(__dirname, 'test-weak.db');
if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();

function cleanup() {
  try { db.getDb().close(); } catch (_) {}
  try { if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath); } catch (_) {}
}

test('T-21: Deteksi weak_topic dan pengganda damage 1.5x', (t) => {
  t.after(cleanup);

  const rawDb = db.getDb();
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Weak', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Matematika Weak', '📐', '#3A7BD5', 'hutan')").run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  // 5 soal: 2 Geometri, 3 Aljabar
  for (let i = 0; i < 5; i++) {
    const topic = i < 2 ? 'Geometri' : 'Aljabar';
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type, topic_tag)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ', ?)
    `).run(subjectId, `Pertanyaan ${topic} ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), `hash_weak_${i}`, topic);
  }

  const player = db.registerPlayer('WeakUser1', 'Pass1234', clsId);

  const session = db.startSession(player.id, subjectId, { count: 5 });
  assert.ok(session);
  assert.ok(session.sessionId);
  assert.ok(session.weakTopic, 'Sesi harus memiliki weakTopic');

  const sData = db.getSession(session.sessionId, player.id);
  assert.ok(sData);
  assert.ok(sData.weakTopic);

  // Verifikasi alokasi is_weak di session_questions
  const sqList = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=?').all(session.sessionId);
  assert.equal(sqList.length, 5);
  const weakCount = sqList.filter(q => q.is_weak === 1).length;
  assert.ok(weakCount >= 2, `Kuota minimal titik lemah harus terpenuhi (dapat: ${weakCount})`);

  // Cari soal dengan is_weak=1
  const weakSq = sqList.find(q => q.is_weak === 1);
  assert.ok(weakSq);

  // Uji jawaban benar pada soal titik lemah -> damage 1.5x
  const qRow = rawDb.prepare('SELECT * FROM questions WHERE id=?').get(weakSq.question_id);
  const optsOrder = JSON.parse(weakSq.option_order);
  const correctDisplayIdx = optsOrder.indexOf(qRow.answer_index);

  // Siapkan waktu siap agar valid answer
  rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
    .run(new Date().toISOString(), new Date().toISOString(), weakSq.id);

  const ansResult = db.answerQuestion(session.sessionId, player.id, weakSq.question_id, correctDisplayIdx);
  assert.ok(ansResult.ok);
  assert.equal(ansResult.isWeak, true);
  assert.equal(ansResult.weakMultiplier, 1.5);
  assert.ok(ansResult.damageToBoss > 0);
});
