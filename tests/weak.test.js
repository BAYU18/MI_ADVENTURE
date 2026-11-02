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

test('Skenario 13.2 #5 / T-21: Titik Lemah Topik Boss & Cadangan Soal Sulit', async (t) => {
  t.after(cleanup);

  const rawDb = db.getDb();
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Weak', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Matematika Weak', '📐', '#3A7BD5', 'hutan')").run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  // 1. Bank dengan topic tag: 2 Geometri, 3 Aljabar
  for (let i = 0; i < 5; i++) {
    const topic = i < 2 ? 'Geometri' : 'Aljabar';
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type, topic_tag)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ', ?)
    `).run(subjectId, `Pertanyaan ${topic} ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), `hash_weak_${i}`, topic);
  }

  const player = db.registerPlayer('WeakUser1', 'Pass1234', clsId);

  await t.test('Topik bank ada tag: Alokasi kuota >= max(2, 20%N) dan damage x2 capped 35%', () => {
    const session = db.startSession(player.id, subjectId, { count: 5 });
    assert.ok(session);
    assert.ok(session.sessionId);
    assert.equal(session.weakTopic, 'Aljabar', 'Topik dengan soal terbanyak harus menjadi weakTopic');
    assert.equal(session.boss.weakTopic, 'Aljabar', 'boss.weakTopic harus sesuai');

    const sData = db.getSession(session.sessionId, player.id);
    assert.ok(sData);
    assert.equal(sData.weakTopic, 'Aljabar');

    // Verifikasi alokasi is_weak di session_questions
    const sqList = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=?').all(session.sessionId);
    assert.equal(sqList.length, 5);
    const weakCount = sqList.filter(q => q.is_weak === 1).length;
    assert.ok(weakCount >= 2, `Kuota minimal titik lemah harus terpenuhi (dapat: ${weakCount})`);

    // Uji jawaban pada soal titik lemah (is_weak=1)
    const weakSq = sqList.find(q => q.is_weak === 1);
    assert.ok(weakSq);
    const qRowWeak = rawDb.prepare('SELECT * FROM questions WHERE id=?').get(weakSq.question_id);
    const optsOrderWeak = JSON.parse(weakSq.option_order);
    const correctIdxWeak = optsOrderWeak.indexOf(qRowWeak.answer_index);

    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), weakSq.id);

    const ansWeak = db.answerQuestion(session.sessionId, player.id, weakSq.question_id, correctIdxWeak);
    assert.ok(ansWeak.ok);
    assert.equal(ansWeak.isWeak, true);
    assert.equal(ansWeak.weakHit, true);
    assert.equal(ansWeak.weakMultiplier, 2.0, 'Pengganda titik lemah harus x2');

    // Cap test: damage tidak boleh melebihi 35% HP max boss
    const maxAllowedDmg = Math.ceil(sData.bossMaxHp * 0.35);
    assert.ok(ansWeak.damageToBoss <= maxAllowedDmg, `Damage (${ansWeak.damageToBoss}) tidak boleh > 35% HP boss (${maxAllowedDmg})`);
  });

  await t.test('Cadangan bila bank tidak punya tag topic: Fallback ke Soal Sulit 🎯', () => {
    // Buat subject baru tanpa tag topic
    const subNoTagInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'IPA Polos', '🔬', '#27AE60', 'gua')").run(clsId);
    const subNoTagId = Number(subNoTagInfo.lastInsertRowid);

    // 5 soal dengan eff_difficulty bervariasi (1, 1, 2, 3, 3) tanpa topic_tag
    for (let i = 0; i < 5; i++) {
      const diff = i < 2 ? 1 : (i === 2 ? 2 : 3);
      rawDb.prepare(`
        INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty, hash, is_active, question_type, topic_tag)
        VALUES(?, ?, ?, 0, 'Penjelasan', ?, ?, ?, 1, 'MCQ', NULL)
      `).run(subNoTagId, `Soal IPA Polos ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), diff, diff, `hash_notag_${i}`);
    }

    const player2 = db.registerPlayer('WeakUser2', 'Pass1234', clsId);
    const sessionNoTag = db.startSession(player2.id, subNoTagId, { count: 5 });
    assert.ok(sessionNoTag);
    assert.equal(sessionNoTag.weakTopic, 'Soal Sulit 🎯', 'Fallback harus ke Soal Sulit 🎯');

    const sqListNoTag = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=?').all(sessionNoTag.sessionId);
    const weakList = sqListNoTag.filter(q => q.is_weak === 1);
    assert.ok(weakList.length >= 2, 'Minimal 2 soal sulit dialokasikan sebagai titik lemah');

    // Pastikan soal yang terpilih adalah soal dengan kesulitan tertinggi
    const weakQIds = weakList.map(sq => sq.question_id);
    const weakQRows = rawDb.prepare(`SELECT eff_difficulty FROM questions WHERE id IN (${weakQIds.join(',')})`).all();
    for (const row of weakQRows) {
      assert.ok(row.eff_difficulty >= 2, 'Soal titik lemah fallback harus berasal dari soal tersulit');
    }
  });
});
