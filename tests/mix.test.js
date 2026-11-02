'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Use isolated test database in /tmp
const TEST_DB_PATH = path.join('/tmp', `play-test-mix-${process.pid}.db`);
if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
process.env.PLAY_DB_PATH = TEST_DB_PATH;

const db = require('../lib/db');
db.createDatabase();
const rawDb = db.getDb();

function cleanup() {
  try { rawDb.close(); } catch (_) {}
  try { if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH); } catch (_) {}
}

test('T-16: Server Display Shuffling & Komposisi Tipe Soal (A.3)', async (t) => {
  t.after(cleanup);

  // Setup test class, player, and subject
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Mix', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);

  const player = db.registerPlayer('PlayerMix', 'Password123', clsId);

  const subInfo = rawDb.prepare(`
    INSERT INTO subjects(class_id, name, icon, color, monster_theme, question_count, time_limit_sec, is_active)
    VALUES (?, 'Matematika Campur', '📐', '#3b82f6', 'hutan', 10, 20, 1)
  `).run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  // Insert pool of 53 questions with various types:
  // 25 MCQ, 10 TRUE_FALSE, 6 ORDERING, 6 MATCHING, 6 SHORT
  const insQ = rawDb.prepare(`
    INSERT INTO questions(
      subject_id, text, question_type, type_data_json, options_json, answer_index, difficulty, is_active, topic_tag, hash
    ) VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?, ?)
  `);

  let qCount = 0;
  // 25 MCQ
  for (let i = 0; i < 25; i++) {
    qCount++;
    insQ.run(
      subjectId,
      `Soal MCQ ${i + 1}`,
      'MCQ',
      JSON.stringify({ options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D'] }),
      JSON.stringify(['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D']),
      i % 4,
      'aritmatika',
      `hash_mix_${qCount}`
    );
  }

  // 10 TRUE_FALSE
  for (let i = 0; i < 10; i++) {
    qCount++;
    insQ.run(
      subjectId,
      `Soal Benar Salah ${i + 1}`,
      'TRUE_FALSE',
      JSON.stringify({ correctAnswer: i % 2 === 0 }),
      '[]',
      i % 2 === 0 ? 0 : 1,
      'geometri',
      `hash_mix_${qCount}`
    );
  }

  // 6 ORDERING
  for (let i = 0; i < 6; i++) {
    qCount++;
    insQ.run(
      subjectId,
      `Urutkan tahapan ${i + 1}`,
      'ORDERING',
      JSON.stringify({
        items: ['Langkah 1', 'Langkah 2', 'Langkah 3', 'Langkah 4'],
        correctOrder: [0, 1, 2, 3]
      }),
      '[]',
      0,
      'proses',
      `hash_mix_${qCount}`
    );
  }

  // 6 MATCHING
  for (let i = 0; i < 6; i++) {
    qCount++;
    insQ.run(
      subjectId,
      `Jodohkan pasangan ${i + 1}`,
      'MATCHING',
      JSON.stringify({
        pairs: [
          { left: 'Segitiga', right: '3 sisi' },
          { left: 'Persegi', right: '4 sisi' },
          { left: 'Lingkaran', right: '1 sisi lengkung' }
        ]
      }),
      '[]',
      0,
      'bangun_datar',
      `hash_mix_${qCount}`
    );
  }

  // 6 SHORT
  for (let i = 0; i < 6; i++) {
    qCount++;
    insQ.run(
      subjectId,
      `Berapa hasil dari 5 + ${i + 1}?`,
      'SHORT',
      JSON.stringify({
        accepted: [String(5 + i + 1)],
        isNumeric: true,
        tolerance: 0.001
      }),
      '[]',
      0,
      'hitung',
      `hash_mix_${qCount}`
    );
  }

  await t.test('Komposisi sesi memuat campuran tipe soal', () => {
    const session = db.startSession(player.id, subjectId);
    assert.equal(session.ok, true);

    const questions = rawDb.prepare(`
      SELECT sq.*, q.question_type, q.type_data_json
      FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=?
      ORDER BY sq.order_index ASC
    `).all(session.sessionId);

    assert.equal(questions.length, 10);

    const counts = {};
    for (const q of questions) {
      counts[q.question_type] = (counts[q.question_type] || 0) + 1;
    }

    // MCQ ~60%, TF ~15%, ORD ~10%, MATCH ~10%, SHORT ~5%
    assert.ok(counts.MCQ >= 5, `Expected MCQ >= 5, got ${counts.MCQ}`);
    assert.ok(counts.TRUE_FALSE >= 1, `Expected TF >= 1, got ${counts.TRUE_FALSE}`);
    assert.ok(counts.ORDERING >= 1, `Expected ORD >= 1, got ${counts.ORDERING}`);
    assert.ok(counts.MATCHING >= 1, `Expected MATCH >= 1, got ${counts.MATCHING}`);

    // Maksimal 2 non-MCQ beruntun
    let streak = 0;
    for (const q of questions) {
      if (q.question_type !== 'MCQ') {
        streak++;
        assert.ok(streak <= 2, `Streak non-MCQ exceeded 2 (got ${streak})`);
      } else {
        streak = 0;
      }
    }
  });

  await t.test('Display Shuffling tersimpan di session_questions.display_json', () => {
    // Selesaikan sesi sebelumnya
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);

    const session = db.startSession(player.id, subjectId);
    const questions = rawDb.prepare(`
      SELECT sq.*, q.question_type, q.type_data_json
      FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=?
      ORDER BY sq.order_index ASC
    `).all(session.sessionId);

    for (const q of questions) {
      assert.ok(q.display_json, `display_json must exist for question ${q.id}`);
      const dj = JSON.parse(q.display_json);

      if (q.question_type === 'MCQ') {
        assert.ok(Array.isArray(dj.optionOrder), 'MCQ must have optionOrder in display_json');
        assert.equal(dj.optionOrder.length, 4);
      } else if (q.question_type === 'ORDERING') {
        assert.ok(Array.isArray(dj.displayOrder), 'ORDERING must have displayOrder in display_json');
        assert.equal(dj.displayOrder.length, 4);
      } else if (q.question_type === 'MATCHING') {
        assert.ok(Array.isArray(dj.rightOrder), 'MATCHING must have rightOrder in display_json');
        assert.equal(dj.rightOrder.length, 3);
      } else if (q.question_type === 'SHORT') {
        assert.equal(typeof dj.isNumeric, 'boolean');
      } else if (q.question_type === 'TRUE_FALSE') {
        assert.equal(dj.type, 'TRUE_FALSE');
      }
    }
  });

  await t.test('nextQuestion tidak membocorkan kunci jawaban asli ke client', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    const session = db.startSession(player.id, subjectId);

    for (let idx = 0; idx < 10; idx++) {
      rawDb.prepare('UPDATE game_sessions SET current_index=? WHERE id=?').run(idx, session.sessionId);
      const nextQ = db.nextQuestion(session.sessionId, player.id);
      assert.equal(nextQ.ok, true);
      assert.ok(nextQ.questionType, 'Must have questionType');

      // Check root and nested question object
      const safe = nextQ.typeData;

      // Pastikan kata kunci rahasia TIDAK bocor di JSON response
      assert.equal(nextQ.answer_index, undefined, 'answer_index must not leak');
      assert.equal(nextQ.correctAnswer, undefined, 'correctAnswer must not leak');
      assert.equal(nextQ.correctOrder, undefined, 'correctOrder must not leak');
      assert.equal(nextQ.accepted, undefined, 'accepted answers must not leak');
      assert.equal(nextQ.tolerance, undefined, 'tolerance must not leak');

      if (nextQ.questionType === 'MCQ') {
        assert.ok(Array.isArray(nextQ.options));
        assert.equal(nextQ.options.length, 4);
      } else if (nextQ.questionType === 'ORDERING') {
        assert.ok(Array.isArray(safe.items));
        assert.ok(Array.isArray(safe.displayOrder));
        assert.equal(safe.correctOrder, undefined, 'correctOrder must not be in safeTypeData');
      } else if (nextQ.questionType === 'MATCHING') {
        assert.ok(Array.isArray(safe.leftItems));
        assert.ok(Array.isArray(safe.rightItems));
        assert.ok(Array.isArray(safe.rightOrder));
        assert.equal(safe.pairs, undefined, 'pairs mapping must not be in safeTypeData');
      } else if (nextQ.questionType === 'SHORT') {
        assert.equal(typeof safe.isNumeric, 'boolean');
        assert.equal(safe.accepted, undefined, 'accepted must not be in safeTypeData');
      } else if (nextQ.questionType === 'TRUE_FALSE') {
        assert.deepEqual(nextQ.options, ['Benar', 'Salah']);
      }
    }
  });

  await t.test('Simulasi 200 sesi: Sebaran tipe soal, maks 2 non-MCQ beruntun, dan zero key leak', () => {
    const totalSimulations = 200;
    let nonMcqStreakViolations = 0;
    let leaksDetected = 0;
    let totalQuestionsTested = 0;

    for (let sim = 0; sim < totalSimulations; sim++) {
      rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
      const s = db.startSession(player.id, subjectId);

      const questions = rawDb.prepare(`
        SELECT sq.*, q.question_type
        FROM session_questions sq
        JOIN questions q ON q.id = sq.question_id
        WHERE sq.session_id=?
        ORDER BY sq.order_index ASC
      `).all(s.sessionId);

      let streak = 0;
      for (const q of questions) {
        if (q.question_type !== 'MCQ') {
          streak++;
          if (streak > 2) nonMcqStreakViolations++;
        } else {
          streak = 0;
        }
      }

      // Test first 2 questions via nextQuestion
      for (let idx = 0; idx < 2; idx++) {
        rawDb.prepare('UPDATE game_sessions SET current_index=? WHERE id=?').run(idx, s.sessionId);
        const res = db.nextQuestion(s.sessionId, player.id);
        totalQuestionsTested++;

        const serialized = JSON.stringify(res);
        if (serialized.includes('"correctAnswer"') ||
            serialized.includes('"correctOrder"') ||
            serialized.includes('"accepted"') ||
            serialized.includes('"answer_index"')) {
          leaksDetected++;
        }
      }
    }

    assert.equal(nonMcqStreakViolations, 0, `Violations of max 2 non-MCQ streak: ${nonMcqStreakViolations}`);
    assert.equal(leaksDetected, 0, `Answer key leaks detected: ${leaksDetected}`);
    assert.equal(totalQuestionsTested, 400);
  });
});
