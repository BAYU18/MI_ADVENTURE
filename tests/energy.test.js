const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Use isolated temporary database for test
const tmpDbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'play-energy-test-'));
const tmpDbPath = path.join(tmpDbDir, 'test.db');
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();
const rawDb = db.getDb();
const Progression = require('../shared/progression');

test('T-20 / Skenario H.10: Energi per Level Profil, Snapshot, Clamping, dan Resume', async (t) => {
  await t.test('1. Progression.energyMaxForLevel & nextEnergyLevel (Tabel F.1)', () => {
    assert.equal(Progression.energyMaxForLevel(1), 5, 'Lv 1 harus 5');
    assert.equal(Progression.energyMaxForLevel(5), 5, 'Lv 5 harus 5');
    assert.equal(Progression.energyMaxForLevel(6), 6, 'Lv 6 harus 6');
    assert.equal(Progression.energyMaxForLevel(10), 6, 'Lv 10 harus 6');
    assert.equal(Progression.energyMaxForLevel(11), 7, 'Lv 11 harus 7');
    assert.equal(Progression.energyMaxForLevel(15), 7, 'Lv 15 harus 7');
    assert.equal(Progression.energyMaxForLevel(16), 8, 'Lv 16 harus 8');
    assert.equal(Progression.energyMaxForLevel(21), 9, 'Lv 21 harus 9');
    assert.equal(Progression.energyMaxForLevel(26), 10, 'Lv 26 harus 10');
    assert.equal(Progression.energyMaxForLevel(31), 11, 'Lv 31 harus 11');
    assert.equal(Progression.energyMaxForLevel(36), 12, 'Lv 36 harus 12 (cap)');
    assert.equal(Progression.energyMaxForLevel(50), 12, 'Lv 50 harus tetap 12 (cap)');

    // nextEnergyLevel
    assert.deepEqual(Progression.nextEnergyLevel(1), { level: 6, energyMax: 6 });
    assert.deepEqual(Progression.nextEnergyLevel(5), { level: 6, energyMax: 6 });
    assert.deepEqual(Progression.nextEnergyLevel(6), { level: 11, energyMax: 7 });
    assert.deepEqual(Progression.nextEnergyLevel(11), { level: 16, energyMax: 8 });
    assert.equal(Progression.nextEnergyLevel(36), null, 'Lv 36 cap tidak punya next level');
  });

  await t.test('2. getPlayerById mengembalikan energyMax dan nextEnergyLevel', () => {
    const testClass = rawDb.prepare("SELECT id FROM classes LIMIT 1").get();

    // Player with 0 XP (Lv 1)
    const pLv1 = rawDb.prepare(`
      INSERT INTO players(nick, nick_lower, password_hash, class_id, xp, coins)
      VALUES('Lv1_User', 'lv1_user', 'hash', ?, 0, 100) RETURNING id
    `).get(testClass.id);

    const dataLv1 = db.getPlayerById(pLv1.id);
    assert.equal(dataLv1.level, 1);
    assert.equal(dataLv1.energyMax, 5);
    assert.deepEqual(dataLv1.nextEnergyLevel, { level: 6, energyMax: 6 });

    // Player with XP for Lv 6 (Lv 6 requires (6-1)^2 * 50 = 25 * 50 = 1250 XP)
    const pLv6 = rawDb.prepare(`
      INSERT INTO players(nick, nick_lower, password_hash, class_id, xp, coins)
      VALUES('Lv6_User', 'lv6_user', 'hash', ?, 1300, 100) RETURNING id
    `).get(testClass.id);

    const dataLv6 = db.getPlayerById(pLv6.id);
    assert.equal(dataLv6.level, 6);
    assert.equal(dataLv6.energyMax, 6);
    assert.deepEqual(dataLv6.nextEnergyLevel, { level: 11, energyMax: 7 });
  });

  await t.test('3. startSession snapshot energy_max & getSession memulihkannya', () => {
    const testClass = rawDb.prepare("SELECT id FROM classes LIMIT 1").get();
    const subject = rawDb.prepare(`
      INSERT INTO subjects(class_id, name, monster_theme, question_count, is_active)
      VALUES(?, 'Matematika Energy', 'hutan', 10, 1) RETURNING id
    `).get(testClass.id);

    // Insert 10 questions
    for (let i = 1; i <= 10; i++) {
      rawDb.prepare(`
        INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, topic_tag, is_active)
        VALUES(?, ?, 'Soal ${i}', '["A","B"]', 0, 'MCQ', 'pecahan', 1)
      `).run(subject.id, `hash_eng_${i}`);
    }

    // Player Lv 11 (requires 10^2 * 50 = 5000 XP) -> energyMax = 7
    const pLv11 = rawDb.prepare(`
      INSERT INTO players(nick, nick_lower, password_hash, class_id, xp, coins)
      VALUES('Lv11_User', 'lv11_user', 'hash', ?, 5100, 100) RETURNING id
    `).get(testClass.id);

    const session = db.startSession(pLv11.id, subject.id);
    assert.equal(session.energy.max, 7, 'Kapasitas energi sesi harus 7 untuk pemain Lv 11');
    assert.equal(session.energy.value, 2, 'Energi awal harus 2');

    // Verify stored in DB
    const sessionRow = rawDb.prepare('SELECT energy, energy_max FROM game_sessions WHERE id = ?').get(session.sessionId);
    assert.equal(sessionRow.energy_max, 7);
    assert.equal(sessionRow.energy, 2);

    // Verify resume / getSession restores energy_max = 7
    const resumed = db.getSession(session.sessionId, pLv11.id);
    assert.equal(resumed.energy.max, 7, 'Resume harus mengembalikan energy.max = 7');
    assert.equal(resumed.energy.value, 2);
  });

  await t.test('4. Clamping energi & Perolehan +1 per 3 Jawaban Benar', () => {
    const testClass = rawDb.prepare("SELECT id FROM classes LIMIT 1").get();
    const subject = rawDb.prepare("SELECT id FROM subjects WHERE name = 'Matematika Energy'").get();

    const player = rawDb.prepare(`
      INSERT INTO players(nick, nick_lower, password_hash, class_id, xp, coins)
      VALUES('Clamp_User', 'clamp_user', 'hash', ?, 0, 100) RETURNING id
    `).get(testClass.id);

    const session = db.startSession(player.id, subject.id);
    assert.equal(session.energy.max, 5);

    function getCorrectDisplayIndex(sessionId, orderIndex) {
      const sq = rawDb.prepare(`
        SELECT sq.option_order, q.answer_index
        FROM session_questions sq
        JOIN questions q ON q.id = sq.question_id
        WHERE sq.session_id = ? AND sq.order_index = ?
      `).get(sessionId, orderIndex);
      const order = JSON.parse(sq.option_order);
      return order.indexOf(sq.answer_index);
    }

    // Answer 1: correct
    const q1 = rawDb.prepare("SELECT * FROM session_questions WHERE session_id = ? AND order_index = 0").get(session.sessionId);
    db.readyQuestion(session.sessionId, player.id, q1.question_id);
    const correctIdx1 = getCorrectDisplayIndex(session.sessionId, 0);
    const ans1 = db.answerQuestion(session.sessionId, player.id, q1.question_id, correctIdx1);
    assert.ok(ans1.energy.value >= 3 && ans1.energy.value <= 4, 'Energi naik 1 atau 2 (kritis)');
    assert.equal(ans1.energy.max, 5);

    // Answer 2: correct
    const q2 = rawDb.prepare("SELECT * FROM session_questions WHERE session_id = ? AND order_index = 1").get(session.sessionId);
    db.readyQuestion(session.sessionId, player.id, q2.question_id);
    const correctIdx2 = getCorrectDisplayIndex(session.sessionId, 1);
    const ans2 = db.answerQuestion(session.sessionId, player.id, q2.question_id, correctIdx2);
    assert.ok(ans2.energy.value >= 4 && ans2.energy.value <= 5);
    assert.equal(ans2.energy.max, 5);

    // Answer 3: correct -> +1 from 3 correct answers -> clamped at 5!
    const q3 = rawDb.prepare("SELECT * FROM session_questions WHERE session_id = ? AND order_index = 2").get(session.sessionId);
    db.readyQuestion(session.sessionId, player.id, q3.question_id);
    const correctIdx3 = getCorrectDisplayIndex(session.sessionId, 2);
    const ans3 = db.answerQuestion(session.sessionId, player.id, q3.question_id, correctIdx3);
    assert.equal(ans3.energy.value, 5, 'Energi harus ter-clamp tepat di 5');

    // Answer 4: correct -> energy should remain 5 (cannot exceed 5)
    const q4 = rawDb.prepare("SELECT * FROM session_questions WHERE session_id = ? AND order_index = 3").get(session.sessionId);
    db.readyQuestion(session.sessionId, player.id, q4.question_id);
    const correctIdx4 = getCorrectDisplayIndex(session.sessionId, 3);
    const ans4 = db.answerQuestion(session.sessionId, player.id, q4.question_id, correctIdx4);
    assert.equal(ans4.energy.value, 5, 'Energi tidak boleh melebihi max 5');
  });

  await t.test('5. Sesi lama dengan energy_max NULL fallback ke 5', () => {
    const testClass = rawDb.prepare("SELECT id FROM classes LIMIT 1").get();
    const subject = rawDb.prepare("SELECT id FROM subjects LIMIT 1").get();
    const player = rawDb.prepare("SELECT id FROM players LIMIT 1").get();

    const oldSessionId = 'old-session-' + Date.now();
    rawDb.prepare(`
      INSERT INTO game_sessions (
        id, player_id, subject_id, mode, status, started_at,
        total_questions, current_index, boss_max_hp, boss_hp,
        player_max_hp, player_hp, energy, energy_max
      ) VALUES (
        ?, ?, ?, 'BATTLE', 'IN_PROGRESS', datetime('now'),
        5, 0, 100, 100, 100, 100, 3, NULL
      )
    `).run(oldSessionId, player.id, subject.id);

    const oldState = db.getSession(oldSessionId, player.id);
    assert.equal(oldState.energy.max, 5, 'Sesi lama dengan energy_max NULL harus fallback ke 5');
    assert.equal(oldState.energy.value, 3);
  });
});
