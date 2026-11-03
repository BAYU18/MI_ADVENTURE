'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const tmpDbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'play-report-v2-test-'));
const tmpDbPath = path.join(tmpDbDir, 'test.db');
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();
const rawDb = db.getDb();
const reports = require('../lib/reports');

test('H.2 / T-11: Laporan Mingguan v2 - API, partial, kompilasi on-demand, v1 migration', async () => {
  // 1. Setup Kelas dan Pemain
  let cls = rawDb.prepare("SELECT id FROM classes WHERE name = 'Kelas 4'").get();
  if (!cls) cls = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas 4', 1) RETURNING id").get();

  const playerNew = rawDb.prepare(`
    INSERT INTO players(nick, nick_lower, password_hash, class_id, xp, coins)
    VALUES('Anak_Baru', 'anak_baru', 'hash', ?, 0, 0) RETURNING id
  `).get(cls.id);

  const playerActive = rawDb.prepare(`
    INSERT INTO players(nick, nick_lower, password_hash, class_id, xp, coins)
    VALUES('Budi_Juara', 'budi_juara', 'hash', ?, 200, 150) RETURNING id
  `).get(cls.id);

  const subj = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, is_active) VALUES(?, 'Matematika', '📐', 1) RETURNING id").get(cls.id);
  const q1 = rawDb.prepare("INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, topic_tag, is_active, difficulty) VALUES(?, 'h1', '1+1', '[\"2\",\"3\"]', 0, 'MCQ', 'Penjumlahan', 1, 1) RETURNING id").get(subj.id);
  const q2 = rawDb.prepare("INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, topic_tag, is_active, difficulty) VALUES(?, 'h2', '2x2', '[\"4\",\"5\"]', 0, 'MCQ', 'Perkalian', 1, 2) RETURNING id").get(subj.id);
  const q3 = rawDb.prepare("INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, topic_tag, is_active, difficulty) VALUES(?, 'h3', '3+3', '[\"6\",\"7\"]', 0, 'MCQ', 'Penjumlahan', 1, 1) RETURNING id").get(subj.id);
  const q4 = rawDb.prepare("INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, topic_tag, is_active, difficulty) VALUES(?, 'h4', '4+4', '[\"8\",\"9\"]', 0, 'MCQ', 'Penjumlahan', 1, 1) RETURNING id").get(subj.id);

  // Test 1: Pemain Baru (tanpa data)
  const repNew = reports.compileWeeklyReport(rawDb, playerNew.id);
  assert.equal(repNew.v, 2);
  assert.equal(repNew.partial, true);
  assert.equal(repNew.summary.answered, 0);
  assert.equal(repNew.summary.correct, 0);
  assert.equal(repNew.summary.accuracy, 0);
  assert.equal(repNew.daily.length, 7);
  assert.ok(repNew.praise.length > 0);
  assert.ok(repNew.advice.length > 0);

  // Test 2: Pemain Berdata di minggu berjalan
  const now = new Date();
  const weekInfo = reports.getWeekBoundariesWib(now, 0);
  const midWeek = new Date(new Date(weekInfo.startIso).getTime() + 24 * 3600 * 1000); // Selasa

  const sessWon = rawDb.prepare(`
    INSERT INTO game_sessions(id, player_id, subject_id, monster_id, mode, status, started_at, finished_at, total_questions, boss_max_hp, boss_hp, player_max_hp, player_hp, boss_tier, coins_earned, xp_earned)
    VALUES('sess-v2-1', ?, ?, 1, 'BATTLE', 'WON', ?, ?, 10, 100, 0, 100, 80, 'rare', 30, 50) RETURNING id
  `).get(playerActive.id, subj.id, midWeek.toISOString(), new Date(midWeek.getTime() + 10 * 60000).toISOString());

  rawDb.prepare(`
    INSERT INTO session_questions(session_id, question_id, order_index, option_order, answered_at, outcome)
    VALUES(?, ?, 0, '[0,1]', ?, 'CORRECT')
  `).run(sessWon.id, q1.id, midWeek.toISOString());

  rawDb.prepare(`
    INSERT INTO session_questions(session_id, question_id, order_index, option_order, answered_at, outcome)
    VALUES(?, ?, 1, '[0,1]', ?, 'CORRECT')
  `).run(sessWon.id, q3.id, midWeek.toISOString());

  rawDb.prepare(`
    INSERT INTO session_questions(session_id, question_id, order_index, option_order, answered_at, outcome)
    VALUES(?, ?, 2, '[0,1]', ?, 'CORRECT')
  `).run(sessWon.id, q4.id, midWeek.toISOString());

  rawDb.prepare(`
    INSERT INTO session_questions(session_id, question_id, order_index, option_order, answered_at, outcome)
    VALUES(?, ?, 3, '[0,1]', ?, 'WRONG')
  `).run(sessWon.id, q2.id, midWeek.toISOString());

  const repActive = reports.compileWeeklyReport(rawDb, playerActive.id);
  assert.equal(repActive.v, 2);
  assert.equal(repActive.partial, true);
  assert.equal(repActive.summary.answered, 4);
  assert.equal(repActive.summary.correct, 3);
  assert.equal(repActive.summary.accuracy, 75);
  assert.equal(repActive.summary.bossDefeated, 1);
  assert.equal(repActive.summary.bossByTier.rare, 1);
  assert.equal(repActive.summary.bossByTier.common, 0);
  assert.equal(repActive.summary.coins, 30);
  assert.equal(repActive.summary.xp, 50);

  // Test 3: Minggu lampau yang tersimpan v1 -> di-upgrade otomatis ke v2
  const prevWeek = reports.getWeekBoundariesWib(now, -1);
  const oldV1Report = {
    weekStart: prevWeek.weekStart,
    player: { nick: 'Budi_Juara' },
    totals: { sessions: 1, answered: 10, correct: 8, accuracy: 0.8 }
  };
  rawDb.prepare(`
    INSERT INTO weekly_reports(player_id, week_key, report_json)
    VALUES(?, ?, ?)
  `).run(playerActive.id, prevWeek.weekStart, JSON.stringify(oldV1Report));

  // Ambil laporan minggu lalu dengan weekKey
  const repOldFetched = reports.getWeeklyReport(rawDb, playerActive.id, { weekKey: prevWeek.weekStart });
  console.log('DEBUG repOldFetched:', Object.keys(repOldFetched));
  console.log('DEBUG repOldFetched.v:', repOldFetched.v);
  assert.equal(repOldFetched.v, 2);
  assert.equal(repOldFetched.partial, false);
});
