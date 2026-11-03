'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const tmpDbPath = path.join(__dirname, 'test-session-refill.db');
for (const ext of ['', '-wal', '-shm']) {
  if (fs.existsSync(tmpDbPath + ext)) {
    try { fs.unlinkSync(tmpDbPath + ext); } catch (_) {}
  }
}

process.env.PLAY_DB_PATH = tmpDbPath;
const db = require('../lib/db');
db.createDatabase();
const rawDb = db.getDb();
const Progression = require('../shared/progression');

function cleanup() {
  try { db.getDb().close(); } catch (_) {}
  for (const ext of ['', '-wal', '-shm']) {
    if (fs.existsSync(tmpDbPath + ext)) {
      try { fs.unlinkSync(tmpDbPath + ext); } catch (_) {}
    }
  }
}

function getCorrectDisplayIdx(rawDb, sq) {
  const qRow = rawDb.prepare('SELECT answer_index, question_type, type_data_json FROM questions WHERE id=?').get(sq.question_id);
  const qType = qRow.question_type || 'MCQ';
  if (qType === 'MCQ') {
    let order = [0, 1, 2, 3];
    if (sq.display_json) {
      try {
        const dj = JSON.parse(sq.display_json);
        if (Array.isArray(dj.optionOrder)) order = dj.optionOrder;
      } catch (_) {}
    } else if (sq.option_order) {
      try { order = JSON.parse(sq.option_order); } catch (_) {}
    }
    return order.indexOf(qRow.answer_index);
  } else if (qType === 'TRUE_FALSE') {
    let td = {};
    try { td = JSON.parse(qRow.type_data_json || '{}'); } catch (_) {}
    const targetBool = td.correctAnswer !== undefined ? Boolean(td.correctAnswer) : (qRow.answer_index === 0);
    return targetBool ? 0 : 1;
  } else if (qType === 'ORDERING') {
    let dj = {};
    try { dj = JSON.parse(sq.display_json || '{}'); } catch (_) {}
    const displayOrder = dj.displayOrder || [0, 1, 2, 3];
    return Array.from({ length: displayOrder.length }, (_, i) => displayOrder.indexOf(i));
  } else if (qType === 'MATCHING') {
    let dj = {};
    try { dj = JSON.parse(sq.display_json || '{}'); } catch (_) {}
    const rightOrder = dj.rightOrder || [0, 1, 2];
    return Array.from({ length: rightOrder.length }, (_, i) => rightOrder.indexOf(i));
  } else if (qType === 'SHORT') {
    let td = {};
    try { td = JSON.parse(qRow.type_data_json || '{}'); } catch (_) {}
    return td.accepted ? td.accepted[0] : '10';
  }
  return 0;
}

test('T-32 / Skenario H.7: Panjang Sesi Dinamis, Isi Ulang Soal, & Batas maxQuestions', async (t) => {
  t.after(cleanup);

  // Setup Class & Player
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Refill', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);
  const player = db.registerPlayer('PlayerRefill', 'Password123', clsId);

  // Setup Subject dengan 60 soal bervariasi tipe dan topik
  const subInfo = rawDb.prepare(`
    INSERT INTO subjects(class_id, name, icon, color, monster_theme, question_count, time_limit_sec, is_active)
    VALUES (?, 'Sains Refill', '🔬', '#10b981', 'hutan', 60, 20, 1)
  `).run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  const insQ = rawDb.prepare(`
    INSERT INTO questions(subject_id, text, question_type, type_data_json, options_json, answer_index, topic_tag, difficulty, hash, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  // 35 MCQ (sebagian topik fotosintesis)
  for (let i = 1; i <= 35; i++) {
    insQ.run(
      subjectId,
      `Soal Sains MCQ ${i}?`,
      'MCQ',
      '{}',
      JSON.stringify(['Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D']),
      0,
      i <= 10 ? 'fotosintesis' : 'ekosistem',
      i % 5 + 1,
      `hash_refill_mcq_${i}`
    );
  }

  // 10 TRUE_FALSE
  for (let i = 1; i <= 10; i++) {
    insQ.run(
      subjectId,
      `Pernyataan Sains TF ${i}?`,
      'TRUE_FALSE',
      JSON.stringify({ correctAnswer: true }),
      '[]',
      0,
      'fotosintesis',
      2,
      `hash_refill_tf_${i}`
    );
  }

  // 5 ORDERING
  for (let i = 1; i <= 5; i++) {
    insQ.run(
      subjectId,
      `Urutan Sains ORD ${i}?`,
      'ORDERING',
      JSON.stringify({ items: ['Tahap 1', 'Tahap 2', 'Tahap 3'] }),
      '[]',
      0,
      'daur_air',
      3,
      `hash_refill_ord_${i}`
    );
  }

  // 5 MATCHING
  for (let i = 1; i <= 5; i++) {
    insQ.run(
      subjectId,
      `Pasangan Sains MAT ${i}?`,
      'MATCHING',
      JSON.stringify({ pairs: [{ left: 'A', right: '1' }, { left: 'B', right: '2' }] }),
      '[]',
      0,
      'sel',
      3,
      `hash_refill_mat_${i}`
    );
  }

  // 5 SHORT
  for (let i = 1; i <= 5; i++) {
    insQ.run(
      subjectId,
      `Hitung Sains SHORT ${i}?`,
      'SHORT',
      JSON.stringify({ accepted: ['42'], isNumeric: true }),
      '[]',
      0,
      'hitung_energi',
      4,
      `hash_refill_short_${i}`
    );
  }

  await t.test('1. Sesi dengan sisa soal <= 2 memicu refill 5 soal saat boss masih hidup', () => {
    // Mulai sesi dengan totalQuestions = 5 dan maxQuestions = 15
    const sess = db.startSession(player.id, subjectId, { count: 5, maxQuestions: 15, bossTier: 'common' });
    assert.equal(sess.totalQuestions, 5, 'Total soal awal harus 5');
    const sId = sess.sessionId;

    // Pastikan boss HP besar agar tidak mati saat dijawab benar
    rawDb.prepare('UPDATE game_sessions SET boss_hp=500, boss_max_hp=500 WHERE id=?').run(sId);

    // Jawab soal 0 (order_index 0) -> sisa 5 - 1 = 4 (> 2), belum refill
    let sq = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq.id);
    let ans = db.answerQuestion(sId, player.id, sq.question_id, getCorrectDisplayIdx(rawDb, sq));
    assert.equal(ans.refill.added, 0, 'Belum refill saat sisa soal = 4');

    // Jawab soal 1 (order_index 1) -> sisa 5 - 2 = 3 (> 2), belum refill
    sq = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=1').get(sId);
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq.id);
    ans = db.answerQuestion(sId, player.id, sq.question_id, getCorrectDisplayIdx(rawDb, sq));
    assert.equal(ans.refill.added, 0, 'Belum refill saat sisa soal = 3');

    // Jawab soal 2 (order_index 2) -> sisa 5 - 3 = 2 (<= 2) -> REFILL 5 SOAL!
    sq = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=2').get(sId);
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq.id);
    ans = db.answerQuestion(sId, player.id, sq.question_id, getCorrectDisplayIdx(rawDb, sq));
    assert.equal(ans.refill.added, 5, 'Harus refill 5 soal saat sisa <= 2');
    assert.equal(ans.session.status, 'IN_PROGRESS', 'Sesi harus tetap berjalan');
    assert.equal(ans.session.totalQuestions, 10, 'Total soal sesi harus bertambah jadi 10');

    // Verifikasi ada 10 baris di session_questions dengan order_index 0..9 kontinu
    const sqRows = rawDb.prepare('SELECT order_index, question_id FROM session_questions WHERE session_id=? ORDER BY order_index ASC').all(sId);
    assert.equal(sqRows.length, 10, 'Harus ada 10 soal di session_questions');
    sqRows.forEach((r, idx) => {
      assert.equal(r.order_index, idx, `order_index ke-${idx} harus kontinu`);
    });
  });

  await t.test('2. Komposisi soal refill terjaga (SRS, titik lemah, maks 2 non-MCQ beruntun, tanpa duplikat beruntun)', () => {
    // Periksa soal refill (order_index 5 s.d. 9) dari sesi sebelumnya
    const sId = rawDb.prepare('SELECT id FROM game_sessions WHERE player_id=? ORDER BY started_at DESC LIMIT 1').get(player.id).id;
    const refilledSq = rawDb.prepare(`
      SELECT sq.*, q.question_type, q.topic_tag
      FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=? AND sq.order_index >= 5
      ORDER BY sq.order_index ASC
    `).all(sId);

    assert.equal(refilledSq.length, 5, 'Refill batch harus 5 soal');

    // Cek SRS <= 30% (maks 1 soal review dari 5)
    const reviewCount = refilledSq.filter(r => r.is_review === 1).length;
    assert.ok(reviewCount <= 2, `Soal review SRS (${reviewCount}) harus <= 30% batch`);

    // Cek Titik Lemah >= 20% (minimal 1 soal lemah dari 5)
    const weakCount = refilledSq.filter(r => r.is_weak === 1).length;
    assert.ok(weakCount >= 1, `Soal titik lemah (${weakCount}) harus >= 20% batch`);

    // Cek maks 2 non-MCQ beruntun di seluruh 10 soal
    const allSq = rawDb.prepare(`
      SELECT sq.order_index, q.question_type, sq.question_id
      FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id=?
      ORDER BY sq.order_index ASC
    `).all(sId);

    let nonMcqStreak = 0;
    for (const r of allSq) {
      if (r.question_type !== 'MCQ') {
        nonMcqStreak++;
        assert.ok(nonMcqStreak <= 2, `Non-MCQ streak melebihi 2 pada index ${r.order_index}`);
      } else {
        nonMcqStreak = 0;
      }
    }

    // Cek tidak ada soal yang sama berurutan
    for (let i = 1; i < allSq.length; i++) {
      assert.notEqual(allSq[i].question_id, allSq[i - 1].question_id, `Soal pada index ${i} tidak boleh sama dengan index ${i - 1}`);
    }
  });

  await t.test('3. Mencapai maxQuestions menghentikan refill dan mengakhiri sesi lewat OUT_OF_QUESTIONS dengan evaluasi bintang', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);

    // Buat sesi dengan totalQuestions = 4 dan maxQuestions = 5
    const sess = db.startSession(player.id, subjectId, { count: 4, maxQuestions: 5, bossTier: 'common' });
    const sId = sess.sessionId;

    // Pastikan boss HP cukup tinggi saat pertanyaan awal
    rawDb.prepare('UPDATE game_sessions SET boss_max_hp=100, boss_hp=50 WHERE id=?').run(sId);

    // Jawab soal 0..2 (sisa 4 - 3 = 1 <= 2). Karena maxQuestions = 5 dan total = 4, refill hanya bisa +1 soal (total jadi 5)
    for (let i = 0; i <= 2; i++) {
      rawDb.prepare('UPDATE game_sessions SET boss_hp=50 WHERE id=?').run(sId);
      const sq = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=?').get(sId, i);
      rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
        .run(new Date().toISOString(), new Date().toISOString(), sq.id);
      db.answerQuestion(sId, player.id, sq.question_id, getCorrectDisplayIdx(rawDb, sq));
    }

    const sessAftRefill = db.getSession(sId, player.id);
    assert.equal(sessAftRefill.totalQuestions, 5, 'Total soal harus menjadi 5 (mencapai maxQuestions)');

    // Jawab soal 3 -> sisa 5 - 4 = 1. Karena total_questions (5) >= max_questions (5), refill TIDAK terjadi
    rawDb.prepare('UPDATE game_sessions SET boss_hp=50 WHERE id=?').run(sId);
    const sq3 = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=3').get(sId);
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq3.id);
    const ans3 = db.answerQuestion(sId, player.id, sq3.question_id, getCorrectDisplayIdx(rawDb, sq3));
    assert.equal(ans3.refill.added, 0, 'Refill tidak boleh bertambah saat maxQuestions tercapai');
    assert.equal(ans3.session.status, 'IN_PROGRESS', 'Sesi masih IN_PROGRESS pada soal ke-4');

    // Sebelum soal 4, atur HP boss menjadi 15 dari 100 (damage 85% >= 80% -> 2 bintang)
    rawDb.prepare('UPDATE game_sessions SET boss_max_hp=100, boss_hp=15 WHERE id=?').run(sId);

    // Jawab soal 4 (soal terakhir!) dengan jawaban salah agar boss tidak mati
    const sq4 = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=4').get(sId);
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq4.id);

    // Jawab salah (kirim index salah)
    const wrongIdx = (getCorrectDisplayIdx(rawDb, sq4) === 0 ? 1 : 0);
    const ans4 = db.answerQuestion(sId, player.id, sq4.question_id, wrongIdx);

    assert.equal(ans4.session.status, 'LOST', 'Status harus LOST saat soal habis dan boss masih hidup');
    assert.equal(ans4.session.endReason, 'OUT_OF_QUESTIONS', 'endReason harus OUT_OF_QUESTIONS');
    assert.equal(ans4.session.stars, 2, 'Bintang harus 2 karena damage boss 85% (>= 80%)');
  });

  await t.test('4. Resume sesi memulihkan planned, max_questions, dan semua kolom boss_*', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);

    const sess = db.startSession(player.id, subjectId, { bossTier: 'rare' });
    const sId = sess.sessionId;

    // Ambil via getSession (jalur resume)
    const resumed = db.getSession(sId, player.id);
    assert.equal(resumed.bossTier, 'rare', 'bossTier harus dipulihkan');
    assert.ok(typeof resumed.bossHitsNeeded === 'number' && resumed.bossHitsNeeded >= 18, 'bossHitsNeeded harus dipulihkan');
    assert.equal(resumed.bossHitUnit, 20, 'bossHitUnit harus 20');
    assert.ok(typeof resumed.monsterDamage === 'number', 'monsterDamage harus dipulihkan');
    assert.ok(typeof resumed.maxQuestions === 'number' && resumed.maxQuestions >= 25, 'maxQuestions harus dipulihkan');
    assert.ok(typeof resumed.planned === 'number', 'planned harus dipulihkan');
    assert.ok(typeof resumed.hitsLeft === 'number', 'hitsLeft harus dipulihkan');
    assert.equal(resumed.boss.tier, 'rare');
    assert.equal(resumed.boss.tierLabel, 'Rare');
    assert.equal(resumed.boss.hitsNeeded, resumed.bossHitsNeeded);
    assert.equal(resumed.boss.hitsLeft, resumed.hitsLeft);
  });
});
