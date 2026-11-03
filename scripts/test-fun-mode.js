/**
 * Test E2E Mode Fun & Soal 4 Tipe Non-MCQ (Tanpa MCQ & Terdistribusi Merata)
 */

const assert = require('assert');
const db = require('../lib/db.js');

async function runTests() {
  console.log('=== MEMULAI PENGUJIAN MODE FUN (4 TIPE NON-MCQ MERATA) ===\n');

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

  // 3. UJI MODE FUN (0% MCQ, 4 Tipe Non-MCQ Merata, Tanpa Skill)
  console.log('\n[TEST 2] Memulai Sesi FUN (Mode Fun): Harus 0% MCQ & 4 Tipe Non-MCQ Terdistribusi Merata...');
  const funSession = db.startSession(playerId, 1, { mode: 'FUN', count: 10 });
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

  // Cek variasi & distribusi tipe soal di Mode Fun
  const funQuestions = database.prepare(`
    SELECT sq.order_index, q.question_type, q.text, q.type_data_json, q.options_json, q.answer_index
    FROM session_questions sq
    JOIN questions q ON q.id = sq.question_id
    WHERE sq.session_id = ?
    ORDER BY sq.order_index ASC
  `).all(funSessionId);

  console.log(`- Jumlah soal sesi FUN: ${funQuestions.length}`);
  const typeCounts = {};
  for (const q of funQuestions) {
    typeCounts[q.question_type] = (typeCounts[q.question_type] || 0) + 1;
  }
  console.log('- Distribusi tipe soal di Mode Fun:', typeCounts);

  // Verifikasi MUTLAK: TIDAK BOLEH ADA MCQ DI MODE FUN
  assert.strictEqual(typeCounts['MCQ'] || 0, 0, 'Mode Fun TIDAK BOLEH memuat soal MCQ!');
  console.log('✅ PASS: 0% MCQ di Mode Fun terverifikasi!');

  // Verifikasi ke-4 tipe non-MCQ muncul merata
  const nonMcqTypes = ['TRUE_FALSE', 'ORDERING', 'MATCHING', 'SHORT'];
  for (const t of nonMcqTypes) {
    assert.ok(typeCounts[t] && typeCounts[t] >= 2, `Tipe ${t} harus terdistribusi merata (minimal 2 dari 10 soal, aktual: ${typeCounts[t]})`);
  }
  console.log('✅ PASS: Ke-4 tipe soal non-MCQ muncul secara merata (masing-masing 2-3 soal per sesi 10 soal)!');

  // 4. UJI GRADING SEMUA 4 TIPE SOAL DI MODE FUN
  console.log('\n[TEST 3] Uji grading ke-4 tipe non-MCQ di Mode Fun...');
  for (const targetType of nonMcqTypes) {
    const qRow = funQuestions.find(q => q.question_type === targetType);
    assert.ok(qRow, `Harus ada soal bertipe ${targetType} dalam sesi`);
    const sqRow = database.prepare('SELECT id, option_order, display_json FROM session_questions WHERE session_id=? AND order_index=?').get(funSessionId, qRow.order_index);
    let dispObj = {};
    try { dispObj = JSON.parse(sqRow.display_json || '{}'); } catch(e) {}

    let userAns = null;
    if (targetType === 'TRUE_FALSE') {
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

    const nowIso = new Date().toISOString();
    database.prepare("UPDATE session_questions SET answered_at=NULL, outcome=NULL, chosen_display=NULL, ready_at=?, served_at=? WHERE id=?").run(nowIso, nowIso, sqRow.id);
    database.prepare("UPDATE game_sessions SET current_index=? WHERE id=?").run(qRow.order_index, funSessionId);

    const res = db.answerQuestion(funSessionId, playerId, qRow.order_index, userAns, 1500);
    assert.strictEqual(res.isCorrect, true, `Tipe ${targetType} gagal dinilai benar`);
    console.log(`✅ PASS: Grading tipe ${targetType} benar! Outcome: ${res.outcome}`);
  }

  // 5. UJI MULTI-MAPEL (Cek 5 mapel acak di Mode Fun tidak pernah memuat MCQ)
  console.log('\n[TEST 4] Uji konsistensi 0% MCQ di berbagai Mapel...');
  database.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE id=?").run(funSessionId);

  const testSubjects = [4, 5, 8, 10, 14]; // Bahasa Indonesia, IPAS, Qur'an Hadis, SKI, English
  for (const sId of testSubjects) {
    const s = db.startSession(playerId, sId, { mode: 'FUN', count: 8 });
    const sIdStr = s.sessionId || s.id;
    const questions = database.prepare(`
      SELECT q.question_type FROM session_questions sq
      JOIN questions q ON q.id = sq.question_id
      WHERE sq.session_id = ?
    `).all(sIdStr);

    const hasMcq = questions.some(q => q.question_type === 'MCQ');
    assert.strictEqual(hasMcq, false, `Mapel ${sId} tidak boleh memuat MCQ di Mode Fun!`);
    const qTypes = new Set(questions.map(q => q.question_type));
    assert.ok(qTypes.size >= 3, `Mapel ${sId} harus memuat minimal 3 variasi tipe`);
    database.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE id=?").run(sIdStr);
    console.log(`  ✓ Mapel ID ${sId}: ${questions.length} soal, 0 MCQ, ${qTypes.size} tipe berbeda.`);
  }
  console.log('✅ PASS: Konsistensi 0% MCQ & multi-tipe merata berlaku di semua mapel!');

  console.log('\n=========================================');
  console.log('🎉 SEMUA 4 PENGUJIAN MODE FUN BERHASIL 100%! 🎉');
  console.log('=========================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST GAGAL:', err);
  process.exit(1);
});
