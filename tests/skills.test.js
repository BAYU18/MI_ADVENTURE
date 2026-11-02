'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Use a separate temp SQLite DB for testing skills
const tmpDbPath = path.join(__dirname, 'test-skills.db');
if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();

test('Skills - skillAvailability standardization & reasons', (t) => {
  const rawDb = db.getDb();

  // Insert a test class, subject, and question
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Uji', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Matematika Uji', '📐', '#3A7BD5', 'hutan')").run(clsId);
  const subId = Number(subInfo.lastInsertRowid);

  for (let i = 0; i < 3; i++) {
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ')
    `).run(subId, `Pertanyaan Uji ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), `hash_${i}`);
  }

  // Create player
  const player = db.registerPlayer('TestSkillUser', 'Pass1234', clsId);

  // Start session
  const session = db.startSession(player.id, subId);
  assert.equal(session.ok, true);

  // Check initial skills
  const skills = db.getSkillAvailability(session.sessionId, player.id);
  assert.ok(Array.isArray(skills));
  assert.ok(skills.length > 0);

  for (const sk of skills) {
    assert.ok(sk.id);
    assert.ok(sk.name);
    assert.ok(sk.icon);
    assert.equal(typeof sk.cost, 'number');
    assert.equal(typeof sk.usable, 'boolean');
    assert.equal(typeof sk.usesLeft, 'number');
    if (sk.usable) {
      assert.equal(sk.reason, null);
    } else {
      assert.ok(['NO_ENERGY', 'NOT_APPLICABLE', 'NOT_OWNED', 'NOT_IN_LOADOUT', 'ALREADY_USED', 'WRONG_STATE', 'EVENT_PENDING', 'NOTHING_TO_ELIMINATE'].includes(sk.reason));
    }
  }

  // Initial energy is 2. Cost for eliminate_one is 1. Should be usable!
  const elim = skills.find(s => s.id === 'eliminate_one');
  assert.ok(elim);
  assert.equal(elim.usable, true);

  // Test: WRONG_STATE if session is finished or not started
  const sRow = rawDb.prepare('SELECT * FROM game_sessions WHERE id=?').get(session.sessionId);
  const sqRow = rawDb.prepare('SELECT sq.*, q.text, q.options_json, q.answer_index, q.question_type FROM session_questions sq JOIN questions q ON q.id=sq.question_id WHERE sq.session_id=? AND sq.order_index=0').get(session.sessionId);

  const closedAvail = db.skillAvailability({ ...sRow, status: 'COMPLETED' }, sqRow, player.id);
  assert.equal(closedAvail[0].usable, false);
  assert.equal(closedAvail[0].reason, 'WRONG_STATE');

  // Test: NOT_APPLICABLE on TRUE_FALSE
  const tfAvail = db.skillAvailability(sRow, { ...sqRow, question_type: 'TRUE_FALSE' }, player.id);
  const tfElim = tfAvail.find(s => s.id === 'eliminate_one');
  assert.equal(tfElim.usable, false);
  assert.equal(tfElim.reason, 'NOT_APPLICABLE');

  // Test: NO_ENERGY when energy is 0
  const noEnergyAvail = db.skillAvailability({ ...sRow, energy: 0 }, sqRow, player.id);
  const noEnergyElim = noEnergyAvail.find(s => s.id === 'eliminate_one');
  assert.equal(noEnergyElim.usable, false);
  assert.equal(noEnergyElim.reason, 'NO_ENERGY');

  // Test: Atomic execution in useSkill
  // Set energy to 0 directly, attempt useSkill -> must fail with 409 SKILL_UNAVAILABLE & NO_ENERGY, energy stays 0
  rawDb.prepare('UPDATE game_sessions SET energy=0 WHERE id=?').run(session.sessionId);
  assert.throws(() => {
    db.useSkill(session.sessionId, player.id, 'eliminate_one', 0);
  }, (err) => {
    assert.equal(err.code, 'SKILL_UNAVAILABLE');
    assert.equal(err.reason, 'NO_ENERGY');
    return true;
  });

  const checkEnergy = rawDb.prepare('SELECT energy FROM game_sessions WHERE id=?').get(session.sessionId);
  assert.equal(checkEnergy.energy, 0);

  // Restore energy to 2
  rawDb.prepare('UPDATE game_sessions SET energy=2 WHERE id=?').run(session.sessionId);
  const useRes = db.useSkill(session.sessionId, player.id, 'eliminate_one', 0);
  assert.equal(useRes.ok, true);
  assert.equal(useRes.energy.value, 1);
  assert.ok(useRes.effects.eliminated.length > 0);

  // Test: resumeSession returns skills payload
  const resumed = db.resumeSession(session.sessionId, player.id, 'client_123');
  assert.equal(resumed.ok, true);
  assert.ok(Array.isArray(resumed.skills));
  assert.equal(resumed.skills.length, 3);

  // Test: updatePlayerSettings supports skillBarHidden
  const updatedSettings = db.updatePlayerSettings(player.id, { skillBarHidden: true });
  assert.equal(updatedSettings.skillBarHidden, true);
  const fetchedSettings = db.getPlayerSettings(player.id);
  assert.equal(fetchedSettings.skillBarHidden, true);

  // Cleanup
  try { fs.unlinkSync(tmpDbPath); } catch (e) {}
});
