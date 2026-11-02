'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const tmpDbPath = path.join(__dirname, 'test-boss-phase.db');
if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();

function cleanup() {
  try { db.getDb().close(); } catch (_) {}
  try { if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath); } catch (_) {}
}

test('Skenario 13.2 #4 / T-20: Boss Fase Marah, phaseChanged, +1 energi, jurus tiap 3 soal, waktu x0.9, bonus koin +15%', (t) => {
  t.after(cleanup);

  const rawDb = db.getDb();
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Boss', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Matematika Boss', '⚔️', '#E74C3C', 'api')").run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  // 10 soal
  for (let i = 0; i < 10; i++) {
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ')
    `).run(subjectId, `Soal Boss Ke-${i}`, JSON.stringify(['A', 'B', 'C', 'D']), `hash_boss_${i}`);
  }

  const player = db.registerPlayer('HeroBoss', 'Pass1234', clsId);

  // 1. Start session
  const session = db.startSession(player.id, subjectId, { count: 10 });
  assert.ok(session);
  assert.equal(session.boss.phase, 1, 'Fase awal boss harus 1');

  // Set initial energy to 1 and boss_hp to 60 (out of 100 max HP)
  rawDb.prepare('UPDATE game_sessions SET energy=1, boss_hp=60, boss_max_hp=100 WHERE id=?')
    .run(session.sessionId);

  // Verifikasi timeLimitSec di fase 1
  const q1 = db.nextQuestion(session.sessionId, player.id);
  const timeLimitPhase1 = q1.timeLimitSec;
  assert.ok(timeLimitPhase1 > 0);

  // Ambil soal pertama
  const sqList = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? ORDER BY order_index ASC').all(session.sessionId);
  const sq0 = sqList[0];
  const qRow0 = rawDb.prepare('SELECT * FROM questions WHERE id=?').get(sq0.question_id);
  const optsOrder0 = JSON.parse(sq0.option_order);
  const correctDisplayIdx0 = optsOrder0.indexOf(qRow0.answer_index);

  rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
    .run(new Date().toISOString(), new Date().toISOString(), sq0.id);

  // 2. Jawab benar soal 0 dengan damage yang membuat HP boss <= 50 (dari 60 turun ke <= 50)
  const ans1 = db.answerQuestion(session.sessionId, player.id, sq0.question_id, correctDisplayIdx0);
  assert.ok(ans1.ok);
  assert.ok(ans1.boss.hp <= 50, `HP boss harus <= 50 (dapat: ${ans1.boss.hp})`);
  assert.equal(ans1.boss.phase, 2, 'Boss harus masuk fase 2');
  assert.equal(ans1.phaseChanged, true, 'phaseChanged harus true saat transisi pertama kali');

  // Energi awal 1, outcome CRITICAL (+2) atau NORMAL (+1), plus phaseChanged -> +1 lagi
  const expectedEnergy = 1 + (ans1.outcome === 'CRITICAL' ? 2 : 1) + 1;
  assert.equal(ans1.energy.value, expectedEnergy, `Pemain harus mendapat +1 energi Semangat saat fase 2 (dapat: ${ans1.energy.value})`);

  // Verifikasi DB
  const sDb1 = rawDb.prepare('SELECT boss_phase, energy FROM game_sessions WHERE id=?').get(session.sessionId);
  assert.equal(sDb1.boss_phase, 2, 'boss_phase di DB harus 2');
  assert.equal(sDb1.energy, expectedEnergy, 'energy di DB harus sama');

  // 3. Verifikasi soal kedua (di fase 2)
  const sq1 = sqList[1];
  const qRow1 = rawDb.prepare('SELECT * FROM questions WHERE id=?').get(sq1.question_id);
  const optsOrder1 = JSON.parse(sq1.option_order);
  const correctDisplayIdx1 = optsOrder1.indexOf(qRow1.answer_index);

  rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
    .run(new Date().toISOString(), new Date().toISOString(), sq1.id);

  rawDb.prepare('UPDATE game_sessions SET boss_hp=50, boss_max_hp=200 WHERE id=?').run(session.sessionId);

  const ans2 = db.answerQuestion(session.sessionId, player.id, sq1.question_id, correctDisplayIdx1);
  assert.ok(ans2.ok);
  assert.equal(ans2.boss.phase, 2, 'Boss tetap di fase 2');
  assert.equal(ans2.phaseChanged, false, 'phaseChanged harus false setelah transisi sudah lewat');
  if (ans2.event) {
    db.resolveEvent(session.sessionId, player.id, ans2.event.id, ans2.event.safeChoice || 'SKIP');
  }

  // 4. Verifikasi timeLimitSec di fase 2 (faktor x0.9)
  const qNext = db.nextQuestion(session.sessionId, player.id);
  assert.equal(qNext.boss.phase, 2);
  // Time limit fase 2 harus lebih kecil karena dikalikan 0.9
  assert.ok(qNext.timeLimitSec < timeLimitPhase1, `timeLimitSec di fase 2 (${qNext.timeLimitSec}) harus < fase 1 (${timeLimitPhase1})`);
  assert.equal(qNext.timeLimitSec, Math.round(timeLimitPhase1 * 0.9));

  // 5. Verifikasi jurus boss muncul tiap 3 soal (pada soal indeks 2 atau soal ke-3: currIdx=2, (2+1)%3 === 0)
  assert.equal(qNext.index, 2, 'Pertanyaan saat ini harus indeks 2 (soal ke-3)');
  assert.ok(qNext.bossMove, 'Jurus boss harus aktif pada soal ke-3 (tiap 3 soal di fase 2)');
  assert.equal(qNext.timerState, 'WAITING_READY', 'timerState harus WAITING_READY saat jurus boss aktif');

  // 6. Verifikasi menang di fase 2 memberi bonus koin +15%
  // Set HP boss ke 1 agar sekali jawab langsung mati
  rawDb.prepare('UPDATE game_sessions SET boss_hp=1 WHERE id=?').run(session.sessionId);
  const sq2 = sqList[2];
  const qRow2 = rawDb.prepare('SELECT * FROM questions WHERE id=?').get(sq2.question_id);
  const optsOrder2 = JSON.parse(sq2.option_order);
  const correctDisplayIdx2 = optsOrder2.indexOf(qRow2.answer_index);

  rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
    .run(new Date().toISOString(), new Date().toISOString(), sq2.id);

  const ansWin = db.answerQuestion(session.sessionId, player.id, sq2.question_id, correctDisplayIdx2);
  assert.ok(ansWin.ok);
  assert.equal(ansWin.session.status, 'WON');
  // Monster api rewardCoins default = 10, bonus +15% -> Math.round(10 * 1.15) = 12
  const sFinished = rawDb.prepare('SELECT coins_earned FROM game_sessions WHERE id=?').get(session.sessionId);
  // coins_earned minimal harus mencakup 12 koin boss
  assert.ok(sFinished.coins_earned >= 12, `Koin yang didapat (${sFinished.coins_earned}) harus >= 12 (+15% bonus)`);
});
