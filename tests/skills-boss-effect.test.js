'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Use a separate temp SQLite DB for testing
const tmpDbPath = path.join(__dirname, 'test-skills-boss.db');
if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();

test('Skills Boss Effect - Tebasan Super & Boss Damage Multiplier Verification', (t) => {
  const rawDb = db.getDb();

  // 1. Setup Class, Subject, Questions
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Uji Boss', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const subInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Petualangan Uji', '⚔️', '#dc2626', 'gunung')").run(clsId);
  const subId = Number(subInfo.lastInsertRowid);

  // Insert 5 questions with explicit IDs
  for (let i = 0; i < 5; i++) {
    rawDb.prepare(`
      INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, hash, is_active, question_type)
      VALUES(?, ?, ?, 0, 'Penjelasan', 1, ?, 1, 'MCQ')
    `).run(subId, `Soal Boss Uji ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), `hash_boss_${i}`);
  }

  // Create player with unlocked power_strike (Level 3 profile or explicit skill)
  const player = db.registerPlayer('TestBossFighter', 'Pass1234', clsId);
  rawDb.prepare('UPDATE players SET xp = 5000 WHERE id = ?').run(player.id);
  rawDb.prepare("INSERT OR REPLACE INTO player_skills(player_id, skill_id, level) VALUES(?, 'power_strike', 1)").run(player.id);

  // Set loadout to include power_strike
  const loadout = [
    { id: 'power_strike', level: 1, maxUses: 2 },
    { id: 'heal', level: 1, maxUses: 2 },
    { id: 'eliminate_one', level: 1, maxUses: 3 }
  ];

  // Start Battle session (Free Mode is BATTLE mode) with this loadout
  const session = db.startSession(player.id, subId, { mode: 'BATTLE' });
  assert.equal(session.ok, true);
  const sId = session.sessionId;

  // Set session loadout and give enough energy
  rawDb.prepare('UPDATE game_sessions SET loadout_json = ?, energy = 5, energy_max = 5 WHERE id = ?')
    .run(JSON.stringify(loadout), sId);

  // Initial check: currentQuestion has powerMult = 1.0
  const initialS = db.getSession(sId, player.id);
  assert.equal(initialS.currentQuestion.powerMult, 1.0);
  assert.equal(initialS.currentQuestion.skillApplied, null);

  // Use power_strike on question index 0
  const useRes = db.useSkill(sId, player.id, 'power_strike', initialS.currentIndex);
  assert.equal(useRes.ok, true);
  assert.equal(useRes.skillId, 'power_strike');
  assert.ok(useRes.effects.powerStrike);
  assert.equal(useRes.effects.powerStrike.active, true);
  assert.equal(useRes.effects.powerStrike.powerMult, 2.0);

  // Check getSession after using skill
  const sAfterSkill = db.getSession(sId, player.id);
  assert.equal(sAfterSkill.currentQuestion.powerMult, 2.0);
  assert.equal(sAfterSkill.currentQuestion.skillApplied, 'power_strike');

  // Get correct display index
  const sqRow = rawDb.prepare('SELECT sq.option_order, q.answer_index FROM session_questions sq JOIN questions q ON q.id=sq.question_id WHERE sq.session_id=? AND sq.order_index=?').get(sId, initialS.currentIndex);
  const optOrder = JSON.parse(sqRow.option_order);
  const correctDisplayIdx = optOrder.indexOf(sqRow.answer_index);

  // Answer question correctly and verify boss damage is multiplied
  const bossHpBefore = sAfterSkill.bossHp ?? sAfterSkill.boss_hp;
  const ansRes = db.answerQuestion(sId, player.id, initialS.currentIndex, correctDisplayIdx);
  assert.equal(ansRes.ok, true);
  assert.equal(ansRes.isCorrect, true);

  // Base hit unit is 20. With 2.0x powerMult, damageToBoss must be at least 40!
  assert.ok(ansRes.damageToBoss >= 40, `Expected damageToBoss >= 40, got ${ansRes.damageToBoss}`);
  assert.ok(ansRes.skillEffects);
  assert.equal(ansRes.skillEffects.powerMult, 2.0);
  assert.equal(ansRes.skillEffects.skillApplied, 'power_strike');
  assert.ok(ansRes.skillEffects.powerStrike);
  assert.equal(ansRes.skillEffects.powerStrike.active, true);
  assert.equal(ansRes.skillEffects.powerStrike.name, 'Tebasan Super');

  // Verify boss HP reduced by damageToBoss
  const sAfterAns = db.getSession(sId, player.id);
  const expectedBossHp = Math.max(0, bossHpBefore - ansRes.damageToBoss);
  assert.equal(sAfterAns.bossHp ?? sAfterAns.boss_hp, expectedBossHp);

  // Finish first session
  rawDb.prepare("UPDATE game_sessions SET status = 'WON' WHERE id = ?").run(sId);

  // 2. Scenario 2: Test that questionIdentifier matching does NOT pick wrong question when question_id collides
  // Suppose question index 1 has a question whose question_id is 1, but order_index is 1.
  // When useSkill is called on question index 1, it must target question index 1, NOT question index 0.
  const s2 = db.startSession(player.id, subId, { mode: 'BATTLE' });
  const s2Id = s2.sessionId;
  rawDb.prepare('UPDATE game_sessions SET loadout_json = ?, energy = 5, energy_max = 5 WHERE id = ?')
    .run(JSON.stringify(loadout), s2Id);

  // Advance session to question index 1 by answering question 0
  const s2_0 = db.getSession(s2Id, player.id);
  const sq2_0 = rawDb.prepare('SELECT sq.option_order, q.answer_index FROM session_questions sq JOIN questions q ON q.id=sq.question_id WHERE sq.session_id=? AND sq.order_index=0').get(s2Id);
  const correct0 = JSON.parse(sq2_0.option_order).indexOf(sq2_0.answer_index);
  db.answerQuestion(s2Id, player.id, 0, correct0);

  // Now current_index is 1. Check currentQuestion
  const s2_1 = db.getSession(s2Id, player.id);
  assert.equal(s2_1.currentIndex, 1);
  assert.equal(s2_1.currentQuestion.index, 1);

  // Use power_strike on question index 1
  const useRes2 = db.useSkill(s2Id, player.id, 'power_strike', 1);
  assert.equal(useRes2.ok, true);

  // Check question 1 has power_mult = 2.0 and question 0 stays 1.0
  const sqRow0 = rawDb.prepare('SELECT power_mult FROM session_questions WHERE session_id=? AND order_index=0').get(s2Id);
  const sqRow1 = rawDb.prepare('SELECT power_mult FROM session_questions WHERE session_id=? AND order_index=1').get(s2Id);
  assert.equal(sqRow0.power_mult, 1.0);
  assert.equal(sqRow1.power_mult, 2.0);

  // Cleanup temp DB
  try {
    if (fs.existsSync(tmpDbPath)) fs.unlinkSync(tmpDbPath);
  } catch(e) {}
});
