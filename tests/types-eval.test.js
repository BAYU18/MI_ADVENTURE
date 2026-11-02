'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Use isolated test database in /tmp
const TEST_DB_PATH = path.join('/tmp', `play-test-types-${process.pid}.db`);
if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
process.env.PLAY_DB_PATH = TEST_DB_PATH;

const db = require('../lib/db');
db.createDatabase();
const rawDb = db.getDb();

function cleanup() {
  try { rawDb.close(); } catch (_) {}
  try { if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH); } catch (_) {}
}

test('T-17: Evaluasi Jawaban Multi-Tipe & Waktu Baca Dinamis (A.1, A.3)', async (t) => {
  t.after(cleanup);

  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Evaluasi', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);
  const player = db.registerPlayer('PlayerEval', 'Password123', clsId);

  const subInfo = rawDb.prepare(`
    INSERT INTO subjects(class_id, name, icon, color, monster_theme, question_count, time_limit_sec, is_active)
    VALUES (?, 'Sains Evaluasi', '🔬', '#10b981', 'hutan', 6, 20, 1)
  `).run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  // 1. MCQ
  rawDb.prepare(`
    INSERT INTO questions(subject_id, text, question_type, type_data_json, options_json, answer_index, hash, is_active)
    VALUES (?, 'Hewan pemakan rumput adalah...', 'MCQ', ?, ?, 0, 'hash_eval_mcq', 1)
  `).run(
    subjectId,
    JSON.stringify({ options: ['Sapi', 'Harimau', 'Singa', 'Elang'] }),
    JSON.stringify(['Sapi', 'Harimau', 'Singa', 'Elang'])
  );

  // 2. TRUE_FALSE
  rawDb.prepare(`
    INSERT INTO questions(subject_id, text, question_type, type_data_json, options_json, answer_index, hash, is_active)
    VALUES (?, 'Kupu-kupu mengalami metamorfosis sempurna.', 'TRUE_FALSE', ?, '[]', 0, 'hash_eval_tf', 1)
  `).run(
    subjectId,
    JSON.stringify({ correctAnswer: true })
  );

  // 3. ORDERING
  rawDb.prepare(`
    INSERT INTO questions(subject_id, text, question_type, type_data_json, options_json, answer_index, hash, is_active)
    VALUES (?, 'Urutkan siklus hidup kupu-kupu:', 'ORDERING', ?, '[]', 0, 'hash_eval_ord', 1)
  `).run(
    subjectId,
    JSON.stringify({
      items: ['Telur', 'Ulat', 'Kepompong', 'Kupu-kupu'],
      correctOrder: [0, 1, 2, 3]
    })
  );

  // 4. MATCHING
  rawDb.prepare(`
    INSERT INTO questions(subject_id, text, question_type, type_data_json, options_json, answer_index, hash, is_active)
    VALUES (?, 'Pasangkan hewan dengan makanannya:', 'MATCHING', ?, '[]', 0, 'hash_eval_match', 1)
  `).run(
    subjectId,
    JSON.stringify({
      pairs: [
        { left: 'Sapi', right: 'Rumput' },
        { left: 'Harimau', right: 'Daging' },
        { left: 'Ayam', right: 'Biji' }
      ]
    })
  );

  // 5. SHORT (Text)
  rawDb.prepare(`
    INSERT INTO questions(subject_id, text, question_type, type_data_json, options_json, answer_index, hash, is_active)
    VALUES (?, 'Ibu kota Indonesia adalah ...', 'SHORT', ?, '[]', 0, 'hash_eval_short_txt', 1)
  `).run(
    subjectId,
    JSON.stringify({
      accepted: ['Jakarta', 'DKI Jakarta']
    })
  );

  // 6. SHORT (Numeric)
  rawDb.prepare(`
    INSERT INTO questions(subject_id, text, question_type, type_data_json, options_json, answer_index, hash, is_active)
    VALUES (?, 'Berapa hasil dari 500 + 750?', 'SHORT', ?, '[]', 0, 'hash_eval_short_num', 1)
  `).run(
    subjectId,
    JSON.stringify({
      numeric: { value: 1250, tolerance: 0.001 },
      accepted: ['1250']
    })
  );

  await t.test('Skenario 13.2 #2: Penilaian & Reveal Akurat untuk Semua Tipe', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    const session = db.startSession(player.id, subjectId);
    assert.equal(session.ok, true);

    const sId = session.sessionId;
    rawDb.prepare('UPDATE game_sessions SET boss_hp=9999, boss_max_hp=9999 WHERE id=?').run(sId);

    // Ambil semua session_questions
    const sqList = rawDb.prepare(`
      SELECT sq.*, q.question_type, q.text, q.type_data_json
      FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=?
      ORDER BY sq.order_index ASC
    `).all(sId);

    assert.ok(sqList.length >= 5);

    for (let idx = 0; idx < sqList.length; idx++) {
      rawDb.prepare('UPDATE game_sessions SET current_index=? WHERE id=?').run(idx, sId);
      const qRow = sqList[idx];
      const qType = qRow.question_type;
      const displayJson = JSON.parse(qRow.display_json || '{}');
      const typeData = JSON.parse(qRow.type_data_json || '{}');

      // Ambil pertanyaan lewat getSession / nextQuestion
      const nextQ = db.nextQuestion(sId, player.id);
      assert.equal(nextQ.questionType, qType);

      // Pastikan TIDAK ADA kunci bocor di nextQuestion
      const serialized = JSON.stringify(nextQ);
      assert.equal(serialized.includes('"correctAnswer"'), false);
      assert.equal(serialized.includes('"correctOrder"'), false);
      assert.equal(serialized.includes('"accepted"'), false);

      // Siapkan jawaban yang benar
      let answerPayload = null;
      if (qType === 'MCQ') {
        const order = displayJson.optionOrder;
        answerPayload = order.indexOf(0); // Opsi 0 'Sapi' adalah jawaban benar
      } else if (qType === 'TRUE_FALSE') {
        answerPayload = typeData.correctAnswer ? 0 : 1;
      } else if (qType === 'ORDERING') {
        const dOrder = displayJson.displayOrder;
        answerPayload = [0, 1, 2, 3].map(orig => dOrder.indexOf(orig));
      } else if (qType === 'MATCHING') {
        const rOrder = displayJson.rightOrder;
        answerPayload = [0, 1, 2].map(leftIdx => rOrder.indexOf(leftIdx));
      } else if (qType === 'SHORT') {
        if (typeData.numeric) {
          answerPayload = '1.250'; // Test Indonesian number format
        } else {
          answerPayload = ' jakarta '; // Test text normalization
        }
      }

      // Jawab
      const ansRes = db.answerQuestion(sId, player.id, qRow.question_id, answerPayload);
      assert.equal(ansRes.isCorrect, true, `Tipe ${qType} harus dinilai benar`);
      assert.ok(ansRes.reveal, `Tipe ${qType} harus menyertakan reveal`);

      if (qType === 'MCQ') {
        assert.equal(ansRes.reveal.correctDisplayIndex, answerPayload);
      } else if (qType === 'TRUE_FALSE') {
        assert.equal(ansRes.reveal.correctDisplayIndex, answerPayload);
      } else if (qType === 'ORDERING') {
        assert.deepEqual(ansRes.reveal.correctOrder, answerPayload);
      } else if (qType === 'MATCHING') {
        assert.deepEqual(ansRes.reveal.correctPairs, answerPayload);
      } else if (qType === 'SHORT') {
        assert.ok(ansRes.reveal.correctText);
      }
    }
  });

  await t.test('Skenario 13.2 #3: SHORT format numerik lokal dan teks toleransi', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    const s = db.startSession(player.id, subjectId);
    const sId = s.sessionId;

    // Ambil question short numeric
    const sqNum = rawDb.prepare(`
      SELECT sq.* FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=? AND q.hash='hash_eval_short_num'
    `).get(sId);

    if (sqNum) {
      assert.equal(db.answerQuestion(sId, player.id, sqNum.question_id, '1.250').isCorrect, true);
    }

    // Buat sesi lain untuk variasi 1250 dan 1 250
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    const s2 = db.startSession(player.id, subjectId);
    const sqNum2 = rawDb.prepare(`
      SELECT sq.* FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=? AND q.hash='hash_eval_short_num'
    `).get(s2.sessionId);

    if (sqNum2) {
      assert.equal(db.answerQuestion(s2.sessionId, player.id, sqNum2.question_id, '1 250').isCorrect, true);
    }

    // Uji teks 'jakarta ' diterima, 'bandung' ditolak
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    const s3 = db.startSession(player.id, subjectId);
    const sqTxt = rawDb.prepare(`
      SELECT sq.* FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=? AND q.hash='hash_eval_short_txt'
    `).get(s3.sessionId);

    if (sqTxt) {
      assert.equal(db.answerQuestion(s3.sessionId, player.id, sqTxt.question_id, 'jakarta ').isCorrect, true);
    }

    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    const s4 = db.startSession(player.id, subjectId);
    const sqTxt4 = rawDb.prepare(`
      SELECT sq.* FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=? AND q.hash='hash_eval_short_txt'
    `).get(s4.sessionId);

    if (sqTxt4) {
      assert.equal(db.answerQuestion(s4.sessionId, player.id, sqTxt4.question_id, 'bandung').isCorrect, false);
    }
  });

  await t.test('Skenario 13.2 #15: Skill NOT_APPLICABLE pada tipe non-MCQ tanpa potong energi', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    const s = db.startSession(player.id, subjectId);
    const sId = s.sessionId;

    // Cari soal TRUE_FALSE
    const sqTf = rawDb.prepare(`
      SELECT sq.* FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=? AND q.question_type='TRUE_FALSE'
    `).get(sId);

    if (sqTf) {
      rawDb.prepare('UPDATE game_sessions SET current_index=? WHERE id=?').run(sqTf.order_index, sId);

      // Cek ketersediaan skill
      const avail = db.getSkillAvailability(sId, player.id);
      const elim = avail.find(x => x.id === 'eliminate_one');
      assert.ok(elim);
      assert.equal(elim.usable, false);
      assert.equal(elim.reason, 'NOT_APPLICABLE');

      // Coba panggil useSkill
      const initialEnergy = rawDb.prepare('SELECT energy FROM game_sessions WHERE id=?').get(sId).energy;
      assert.throws(
        () => db.useSkill(sId, player.id, 'eliminate_one', sqTf.question_id),
        (err) => err.code === 'SKILL_UNAVAILABLE' && err.reason === 'NOT_APPLICABLE'
      );

      // Pastikan energi TIDAK berkurang
      const postEnergy = rawDb.prepare('SELECT energy FROM game_sessions WHERE id=?').get(sId).energy;
      assert.equal(postEnergy, initialEnergy);
    }
  });
});
