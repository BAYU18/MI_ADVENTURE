/**
 * Test E2E Mode Fun & Soal 5 Tipe
 */

const assert = require('assert');
const db = require('../lib/db.js');

async function runTests() {
  console.log('=== MEMULAI PENGUJIAN MODE FUN & SOAL 5 TIPE ===\n');

  // 1. Cek User Test
  let player = db.getPlayerById(1);
  if (!player) {
    player = db.registerPlayer('TestFunHero', 'pass123', 1);
  }
  const playerId = player.id;
  console.log(`Menggunakan Player: ID ${playerId} (${player.nick})`);

  // Pastikan tidak ada sesi aktif menggantung
  const database = db.getDb();
  database.prepare("UPDATE game_sessions SET status='ABANDONED', end_reason='TEST_RESET' WHERE player_id=? AND status='IN_PROGRESS'").run(playerId);

  // 2. UJI MODE BATTLE BIASA (Hanya boleh soal MCQ)
  console.log('\n[TEST 1] Memulai Sesi BATTLE (Mode Bebas): Harus 100% MCQ...');
  const battleSession = db.startSession(playerId, 1, { mode: 'BATTLE' });
  assert.strictEqual(battleSession.mode, 'BATTLE');
  assert.ok(battleSession.skills && battleSession.skills.length > 0, 'Mode BATTLE harus memiliki skill aktif');

  const battleSessionId = battleSession.sessionId || battleSession.id;
  const battleQuestions = database.prepare(`
    SELECT sq.order_index, q.question_type, q.text
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    WHERE sq.session_id = ?
    ORDER BY sq.order_index ASC
  `).all(battleSessionId);

  console.log(`- Jumlah soal sesi BATTLE: ${battleQuestions.length}`);
  for (const bq of battleQuestions) {
    assert.strictEqual(bq.question_type, 'MCQ', `Soal pada mode BATTLE harus MCQ, ditemukan: ${bq.question_type}`);
  }
  console.log('✅ PASS: Semua soal pada sesi BATTLE murni MCQ!');

  // Tutup sesi BATTLE
  database.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE id=?").run(battleSessionId);

  // 3. UJI MODE FUN (Harus mencakup variasi tipe soal, tanpa skill)
  console.log('\n[TEST 2] Memulai Sesi FUN (Mode Fun): Harus multi-tipe & tanpa skill...');
  const funSession = db.startSession(playerId, 1, { mode: 'FUN' });
  const funSessionId = funSession.sessionId || funSession.id;
  assert.strictEqual(funSession.mode, 'FUN');

  // Cek ketersediaan skill di Mode Fun
  assert.strictEqual(funSession.skills.length, 0, 'Mode FUN tidak boleh menyediakan skill');
  console.log('✅ PASS: Skill list kosong di Mode FUN!');

  // Coba paksa useSkill di Mode Fun -> Harus throw error
  let skillErrorThrown = false;
  try {
    db.useSkill(funSessionId, playerId, 'heal');
  } catch (err) {
    skillErrorThrown = true;
    assert.strictEqual(err.code, 'SKILL_UNAVAILABLE');
    assert.strictEqual(err.reason, 'MODE_DISABLED');
  }
  assert.ok(skillErrorThrown, 'useSkill harus ditolak pada mode FUN');
  console.log('✅ PASS: useSkill berhasil ditolak di Mode FUN!');

  // Cek variasi tipe soal di Mode Fun
  const funQuestions = database.prepare(`
    SELECT sq.order_index, q.question_type, q.text, q.type_data_json, q.options_json, q.answer_index
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    WHERE sq.session_id = ?
    ORDER BY sq.order_index ASC
  `).all(funSessionId);

  console.log(`- Jumlah soal sesi FUN: ${funQuestions.length}`);
  const typesInSession = new Set(funQuestions.map(q => q.question_type));
  console.log('- Tipe soal yang muncul di sesi FUN:', Array.from(typesInSession));
  assert.ok(typesInSession.size > 1, 'Sesi FUN harus memuat lebih dari 1 tipe soal');
  console.log('✅ PASS: Sesi FUN memuat variasi multi-tipe soal!');

  // 4. UJI JAWABAN TIAP TIPE SOAL PADA MODE FUN
  console.log('\n[TEST 3] Menjawab soal berurutan di Mode FUN...');
  let currentSess = funSession;

  for (let idx = 0; idx < Math.min(5, funQuestions.length); idx++) {
    const qData = funQuestions[idx];
    const qType = qData.question_type;
    let userAns = null;

    const sqRow = database.prepare('SELECT option_order, display_json FROM session_questions WHERE session_id=? AND order_index=?').get(funSessionId, idx);
    let optOrder = [];
    try { optOrder = JSON.parse(sqRow.option_order || '[]'); } catch(e) {}
    let dispObj = {};
    try { dispObj = JSON.parse(sqRow.display_json || '{}'); } catch(e) {}

    if (qType === 'MCQ') {
      userAns = optOrder.indexOf(qData.answer_index);
    } else if (qType === 'TRUE_FALSE') {
      const td = JSON.parse(qData.type_data_json);
      userAns = td.correctAnswer ? 0 : 1; // 0: Benar, 1: Salah
    } else if (qType === 'ORDERING') {
      const displayOrder = dispObj.displayOrder || [];
      userAns = Array.from({ length: displayOrder.length }, (_, i) => displayOrder.indexOf(i));
    } else if (qType === 'MATCHING') {
      const rightOrder = dispObj.rightOrder || [];
      userAns = Array.from({ length: rightOrder.length }, (_, i) => rightOrder.indexOf(i));
    } else if (qType === 'SHORT') {
      const td = JSON.parse(qData.type_data_json);
      userAns = td.accepted ? td.accepted[0] : 'jawaban';
    }

    console.log(`- Soal ke-${idx + 1} (${qType}): "${qData.text.slice(0, 45)}..."`);
    const ansResult = db.answerQuestion(funSessionId, playerId, idx, userAns, 1500);
    assert.strictEqual(ansResult.isCorrect, true, `Jawaban untuk tipe ${qType} harus dinilai benar!`);
    console.log(`  ✓ Jawaban benar! Outcome: ${ansResult.outcome}, Boss HP: ${ansResult.boss.hp}/${ansResult.boss.maxHp}`);
  }

  // 5. UJI DEDIKASI JAWABAN TIAP DARI 5 TIPE SOAL (MCQ, TRUE_FALSE, ORDERING, MATCHING, SHORT)
  console.log('\n[TEST 4] Uji grading spesifik masing-masing dari 5 tipe soal...');
  const allTypes = ['MCQ', 'TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT'];
  for (const targetType of allTypes) {
    const qRow = funQuestions.find(q => q.question_type === targetType);
    assert.ok(qRow, `Harus ada soal bertipe ${targetType} dalam sesi`);
    const sqRow = database.prepare('SELECT id, option_order, display_json FROM session_questions WHERE session_id=? AND order_index=?').get(funSessionId, qRow.order_index);
    let dispObj = {};
    try { dispObj = JSON.parse(sqRow.display_json || '{}'); } catch(e) {}

    let userAns = null;
    if (targetType === 'MCQ') {
      let optOrder = JSON.parse(sqRow.option_order || '[]');
      userAns = optOrder.indexOf(qRow.answer_index);
    } else if (targetType === 'TRUE_FALSE') {
      const td = JSON.parse(qRow.type_data_json);
      userAns = td.correctAnswer ? 0 : 1;
    } else if (targetType === 'ORDERING') {
      const displayOrder = dispObj.displayOrder || [];
      userAns = Array.from({ length: displayOrder.length }, (_, i) => displayOrder.indexOf(i));
    } else if (targetType === 'MATCHING') {
      const rightOrder = dispObj.rightOrder || [];
      userAns = Array.from({ length: rightOrder.length }, (_, i) => rightOrder.indexOf(i));
    } else if (targetType === 'SHORT') {
      const td = JSON.parse(qRow.type_data_json);
      userAns = td.accepted ? td.accepted[0] : 'jawaban';
    }

    // Reset status soal agar bisa dijawab pada pengujian
    const nowIso = new Date().toISOString();
    database.prepare("UPDATE session_questions SET answered_at=NULL, outcome=NULL, chosen_display=NULL, ready_at=?, served_at=? WHERE id=?").run(nowIso, nowIso, sqRow.id);
    database.prepare("UPDATE game_sessions SET current_index=? WHERE id=?").run(qRow.order_index, funSessionId);

    const res = db.answerQuestion(funSessionId, playerId, qRow.order_index, userAns, 2000);
    assert.strictEqual(res.isCorrect, true, `Tipe ${targetType} gagal dinilai benar`);
    console.log(`✅ PASS: Grading tipe ${targetType} berfungsi sempurna! Outcome: ${res.outcome}`);
  }

  // Bersihkan sesi pengujian
  database.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE id=?").run(funSessionId);

  console.log('\n=========================================');
  console.log('🎉 SEMUA 3 PENGUJIAN MODE FUN BERHASIL 100%! 🎉');
  console.log('=========================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST GAGAL:', err);
  process.exit(1);
});
