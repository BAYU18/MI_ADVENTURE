'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

// Isolated test DB
const tmpDbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'play-abilities-test-'));
const tmpDbPath = path.join(tmpDbDir, 'test.db');
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();
const rawDb = db.getDb();
const Progression = require('../shared/progression');

test('H.1: computeSubjectAbilities - urutan NAIK, data campuran, lowestSubjectId', async () => {
  // Setup Class & Player
  const cls = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Uji 4', 1) RETURNING id").get();
  const player = rawDb.prepare(`
    INSERT INTO players(nick, nick_lower, password_hash, class_id, xp, coins)
    VALUES('Tester_B', 'tester_b', 'hash', ?, 100, 50) RETURNING id
  `).get(cls.id);

  // Setup 4 active subjects for this class
  // Subj 1: high score (e.g. 80+)
  const sHigh = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, is_active) VALUES(?, 'Matematika', '📐', 1) RETURNING id").get(cls.id);
  // Subj 2: low score (e.g. 30)
  const sLow = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, is_active) VALUES(?, 'IPAS', '🔬', 1) RETURNING id").get(cls.id);
  // Subj 3: insufficient data (3 attempts)
  const sInsuff = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, is_active) VALUES(?, 'Bahasa Indonesia', '📚', 1) RETURNING id").get(cls.id);
  // Subj 4: none (0 attempts)
  const sNone = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, is_active) VALUES(?, 'Seni Budaya', '🎨', 1) RETURNING id").get(cls.id);

  // Add questions
  const addQ = (subjId, diff = 2) => rawDb.prepare(`
    INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, is_active, difficulty)
    VALUES(?, 'hash_' || abs(random()), 'q text', '["a","b"]', 0, 'MCQ', 1, ?) RETURNING id
  `).get(subjId, diff);

  // Add 15 questions to sHigh, sLow, sInsuff, sNone
  const qHigh = Array.from({ length: 15 }, () => addQ(sHigh.id, 2));
  const qLow = Array.from({ length: 15 }, () => addQ(sLow.id, 2));
  const qInsuff = Array.from({ length: 15 }, () => addQ(sInsuff.id, 2));
  Array.from({ length: 15 }, () => addQ(sNone.id, 2));

  // Helper to create session
  const createSess = (subjId, sid) => rawDb.prepare(`
    INSERT INTO game_sessions(id, player_id, subject_id, monster_id, status, started_at, total_questions, boss_max_hp, boss_hp, player_max_hp, player_hp)
    VALUES(?, ?, ?, 1, 'WON', datetime('now'), 15, 100, 0, 100, 100) RETURNING id
  `).get(sid, player.id, subjId);

  // sHigh: session with 12 answers, all correct, high Leitner boxes
  const sessHigh = createSess(sHigh.id, 'sess-high-1');
  for (let i = 0; i < 12; i++) {
    rawDb.prepare(`
      INSERT INTO session_questions(session_id, question_id, order_index, option_order, answered_at, outcome)
      VALUES(?, ?, ?, '[0,1]', datetime('now'), 'CORRECT')
    `).run(sessHigh.id, qHigh[i].id, i);

    rawDb.prepare(`
      INSERT INTO player_question_stats(player_id, question_id, box, seen, correct)
      VALUES(?, ?, 5, 2, 2)
    `).run(player.id, qHigh[i].id);
  }

  // sLow: session with 10 answers, 3 correct, box 1-2
  const sessLow = createSess(sLow.id, 'sess-low-1');
  for (let i = 0; i < 10; i++) {
    const outcome = i < 3 ? 'CORRECT' : 'WRONG';
    rawDb.prepare(`
      INSERT INTO session_questions(session_id, question_id, order_index, option_order, answered_at, outcome)
      VALUES(?, ?, ?, '[0,1]', datetime('now'), ?)
    `).run(sessLow.id, qLow[i].id, i, outcome);

    rawDb.prepare(`
      INSERT INTO player_question_stats(player_id, question_id, box, seen, correct)
      VALUES(?, ?, ?, 2, ?)
    `).run(player.id, qLow[i].id, i < 3 ? 2 : 1, i < 3 ? 1 : 0);
  }

  // sInsuff: session with 3 answers
  const sessInsuff = createSess(sInsuff.id, 'sess-insuff-1');
  for (let i = 0; i < 3; i++) {
    rawDb.prepare(`
      INSERT INTO session_questions(session_id, question_id, order_index, option_order, answered_at, outcome)
      VALUES(?, ?, ?, '[0,1]', datetime('now'), 'CORRECT')
    `).run(sessInsuff.id, qInsuff[i].id, i);

    rawDb.prepare(`
      INSERT INTO player_question_stats(player_id, question_id, box, seen, correct)
      VALUES(?, ?, 2, 1, 1)
    `).run(player.id, qInsuff[i].id);
  }

  // Call computeSubjectAbilities
  const res = db.computeSubjectAbilities(player.id);
  assert.equal(res.ok, true);
  assert.equal(res.abilities.length, 4);

  // Verify lowestSubjectId is sLow.id
  assert.equal(res.lowestSubjectId, sLow.id);

  // Verify order: MEASURED (low -> high), then INSUFFICIENT, then NONE
  assert.equal(res.abilities[0].subjectId, sLow.id);
  assert.equal(res.abilities[0].status, 'MEASURED');
  assert.equal(res.abilities[0].rank, 1);

  assert.equal(res.abilities[1].subjectId, sHigh.id);
  assert.equal(res.abilities[1].status, 'MEASURED');
  assert.equal(res.abilities[1].rank, 2);
  assert.ok(res.abilities[1].score > res.abilities[0].score);

  assert.equal(res.abilities[2].subjectId, sInsuff.id);
  assert.equal(res.abilities[2].status, 'INSUFFICIENT');
  assert.equal(res.abilities[2].rank, 3);
  assert.equal(res.abilities[2].score, null);
  assert.equal(res.abilities[2].attempts, 3);

  assert.equal(res.abilities[3].subjectId, sNone.id);
  assert.equal(res.abilities[3].status, 'NONE');
  assert.equal(res.abilities[3].rank, 4);
  assert.equal(res.abilities[3].score, null);
  assert.equal(res.abilities[3].attempts, 0);

  // Ambang level cek
  assert.equal(Progression.abilityLevel(19).level, 1);
  assert.equal(Progression.abilityLevel(20).level, 2);
  assert.equal(Progression.abilityLevel(39).level, 2);
  assert.equal(Progression.abilityLevel(40).level, 3);
  assert.equal(Progression.abilityLevel(59).level, 3);
  assert.equal(Progression.abilityLevel(60).level, 4);
  assert.equal(Progression.abilityLevel(79).level, 4);
  assert.equal(Progression.abilityLevel(80).level, 5);
});
