'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const tmpDbPath = path.join(__dirname, 'test-brutal-damage.db');
if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();

test('Mode Brutal - salah menjawab soal menghasilkan damage 2x dari mode biasa', () => {
  const rawDb = db.getDb();

  // 1. Setup Class, Subject, Questions
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES(?, 1)").run('Kelas Brutal Test ' + Date.now());
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Petualangan Api', '🔥', '#dc2626', 'api')").run(clsId);
  const subId = Number(subInfo.lastInsertRowid);

  for (let i = 0; i < 10; i++) {
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ')
    `).run(subId, `Soal Api ${i}`, JSON.stringify(['Benar', 'Salah 1', 'Salah 2', 'Salah 3']), `hash_brutal_${i}_${Date.now()}`);
  }

  // Create player with level >= 5 so brutal mode is unlocked
  const player = db.registerPlayer('BrutalFighter_' + Date.now(), 'Pass1234', clsId);
  rawDb.prepare('UPDATE players SET xp = 1000 WHERE id = ?').run(player.id);

  function getWrongIndex(sessionId, orderIndex = 0) {
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
    return (correctIdx + 1) % order.length;
  }

  // A. Sesi Biasa (Normal Mode, brutal: false)
  const sessionNormal = db.startSession(player.id, subId, { mode: 'BATTLE', brutal: false });
  assert.equal(sessionNormal.ok, true);
  const sNormId = sessionNormal.sessionId;
  const sNormData = db.getSession(sNormId, player.id);
  assert.equal(sNormData.brutal, false);

  // Set shield = 0 to directly measure damage dealt to player
  rawDb.prepare("UPDATE game_sessions SET flags_json = '{\"shield\":0}' WHERE id = ?").run(sNormId);

  const wrongIdxNorm = getWrongIndex(sNormId, 0);
  const normalAnsRes = db.answerQuestion(sNormId, player.id, 0, wrongIdxNorm);
  assert.equal(normalAnsRes.ok, true);
  assert.equal(normalAnsRes.isCorrect, false);
  const normalDamage = normalAnsRes.damageToPlayer;
  assert.ok(normalDamage > 0, `Normal damage must be > 0, got ${normalDamage}`);

  // Akhiri sesi normal agar tidak ada ACTIVE_SESSION conflict
  rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE id = ?").run(sNormId);

  // B. Sesi Brutal (Brutal Mode, brutal: true)
  const sessionBrutal = db.startSession(player.id, subId, { mode: 'BATTLE', brutal: true });
  assert.equal(sessionBrutal.ok, true);
  const sBrutalId = sessionBrutal.sessionId;
  const sBrutalData = db.getSession(sBrutalId, player.id);
  assert.equal(sBrutalData.brutal, true);

  // Set shield = 0 to directly measure damage dealt to player
  rawDb.prepare("UPDATE game_sessions SET flags_json = '{\"shield\":0}' WHERE id = ?").run(sBrutalId);

  // Samakan monster_damage & boss_tier agar perbandingan apple-to-apple jika acak
  const normSessRow = rawDb.prepare('SELECT monster_damage, boss_tier, player_max_hp FROM game_sessions WHERE id = ?').get(sNormId);
  rawDb.prepare('UPDATE game_sessions SET monster_damage = ?, boss_tier = ? WHERE id = ?')
    .run(normSessRow.monster_damage, normSessRow.boss_tier, sBrutalId);

  const wrongIdxBrutal = getWrongIndex(sBrutalId, 0);
  const brutalAnsRes = db.answerQuestion(sBrutalId, player.id, 0, wrongIdxBrutal);
  assert.equal(brutalAnsRes.ok, true);
  assert.equal(brutalAnsRes.isCorrect, false);
  const brutalDamage = brutalAnsRes.damageToPlayer;

  // VERIFIKASI UTAMA: Damage yang diterima di mode brutal tepat 2x dari mode biasa!
  assert.equal(brutalDamage, normalDamage * 2, `Brutal damage (${brutalDamage}) harus 2x dari normal damage (${normalDamage})`);

  rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE id = ?").run(sBrutalId);

  // C. Sesi Timeout: Timeout di mode brutal juga menghasilkan damage 2x
  const sTimeoutNorm = db.startSession(player.id, subId, { mode: 'BATTLE', brutal: false });
  rawDb.prepare("UPDATE game_sessions SET flags_json = '{\"shield\":0}' WHERE id = ?").run(sTimeoutNorm.sessionId);
  rawDb.prepare('UPDATE game_sessions SET monster_damage = ?, boss_tier = ? WHERE id = ?')
    .run(normSessRow.monster_damage, normSessRow.boss_tier, sTimeoutNorm.sessionId);
  const timeoutNormRes = db.answerQuestion(sTimeoutNorm.sessionId, player.id, 0, { timedOut: true });
  assert.equal(timeoutNormRes.ok, true);
  assert.equal(timeoutNormRes.outcome, 'TIMEOUT');
  const timeoutNormDmg = timeoutNormRes.damageToPlayer;
  rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE id = ?").run(sTimeoutNorm.sessionId);

  const sTimeoutBrut = db.startSession(player.id, subId, { mode: 'BATTLE', brutal: true });
  rawDb.prepare("UPDATE game_sessions SET flags_json = '{\"shield\":0}' WHERE id = ?").run(sTimeoutBrut.sessionId);
  rawDb.prepare('UPDATE game_sessions SET monster_damage = ?, boss_tier = ? WHERE id = ?')
    .run(normSessRow.monster_damage, normSessRow.boss_tier, sTimeoutBrut.sessionId);
  const timeoutBrutRes = db.answerQuestion(sTimeoutBrut.sessionId, player.id, 0, { timedOut: true });
  assert.equal(timeoutBrutRes.ok, true);
  assert.equal(timeoutBrutRes.outcome, 'TIMEOUT');
  const timeoutBrutDmg = timeoutBrutRes.damageToPlayer;
  rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE id = ?").run(sTimeoutBrut.sessionId);

  assert.equal(timeoutBrutDmg, timeoutNormDmg * 2, `Timeout brutal damage (${timeoutBrutDmg}) harus 2x dari timeout normal (${timeoutNormDmg})`);

  // D. Pengaman Anti-Frustrasi: Damage sekali pukul tidak melebihi 50% HP maksimum pemain
  const sCapBrut = db.startSession(player.id, subId, { mode: 'BATTLE', brutal: true });
  rawDb.prepare("UPDATE game_sessions SET flags_json = '{\"shield\":0}', monster_damage = 40, player_max_hp = 60 WHERE id = ?").run(sCapBrut.sessionId);
  const capRes = db.answerQuestion(sCapBrut.sessionId, player.id, 0, getWrongIndex(sCapBrut.sessionId, 0));
  assert.ok(capRes.damageToPlayer <= 30, `Damage (${capRes.damageToPlayer}) tidak boleh melebihi 50% dari HP maksimum 60`);
  rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE id = ?").run(sCapBrut.sessionId);

  // Cleanup temp DB
  try {
    if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
    const wal = tmpDbPath + '-wal';
    const shm = tmpDbPath + '-shm';
    if (fs.existsSync(wal)) fs.unlinkSync(wal);
    if (fs.existsSync(shm)) fs.unlinkSync(shm);
  } catch (_) {}
});
