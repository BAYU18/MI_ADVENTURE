'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const db = require('../lib/db');

test('T-19: Integrasi Admin Bank Soal Multi-Tipe & Validasi Import Per Baris (A.4)', async (t) => {
  const rawDb = db.getDb();

  // Create or get a class and subject for test
  let cls = rawDb.prepare("SELECT id FROM classes WHERE name='Kelas Admin Test'").get();
  let clsId = cls ? cls.id : null;
  if (!clsId) {
    const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Admin Test', 99)").run();
    clsId = Number(clsInfo.lastInsertRowid);
  }

  let subj = rawDb.prepare("SELECT id FROM subjects WHERE name='Admin Test Mapel'").get();
  let subjId = subj ? subj.id : null;
  if (!subjId) {
    const subjInfo = rawDb.prepare("INSERT INTO subjects(class_id, name, icon, color, monster_theme) VALUES(?, 'Admin Test Mapel', '📚', '#4f46e5', 'hutan')").run(clsId);
    subjId = Number(subjInfo.lastInsertRowid);
  }

  // Clear existing questions for this subject so tests start fresh
  rawDb.prepare('DELETE FROM questions WHERE subject_id=?').run(subjId);

  await t.test('1. Admin dapat membuat soal untuk setiap 5 tipe (MCQ, TRUE_FALSE, ORDERING, MATCHING, SHORT)', () => {
    // 1. MCQ
    const qMcq = db.adminSaveQuestion({
      subjectId: subjId,
      text: 'Berapakah 2 + 2?',
      question_type: 'MCQ',
      options: ['1', '2', '3', '4'],
      answerIndex: 3,
      difficulty: 1,
      explanation: '2 + 2 = 4'
    });
    assert.equal(qMcq.question_type, 'MCQ');
    assert.equal(qMcq.answer_index, 3);

    // 2. TRUE_FALSE
    const qTf = db.adminSaveQuestion({
      subjectId: subjId,
      text: 'Bumi itu bulat.',
      question_type: 'TRUE_FALSE',
      options: ['Benar', 'Salah'],
      answerIndex: 0,
      typeData: { correctAnswer: true, options: ['Benar', 'Salah'] },
      difficulty: 1
    });
    assert.equal(qTf.question_type, 'TRUE_FALSE');
    const tfData = JSON.parse(qTf.type_data_json);
    assert.equal(tfData.correctAnswer, true);

    // 3. ORDERING
    const qOrd = db.adminSaveQuestion({
      subjectId: subjId,
      text: 'Urutkan metamorfosis kupu-kupu:',
      question_type: 'ORDERING',
      options: ['Telur', 'Ulat', 'Kepompong', 'Kupu-kupu'],
      answerIndex: 0,
      typeData: { items: ['Telur', 'Ulat', 'Kepompong', 'Kupu-kupu'] },
      difficulty: 2
    });
    assert.equal(qOrd.question_type, 'ORDERING');
    const ordData = JSON.parse(qOrd.type_data_json);
    assert.equal(ordData.items.length, 4);

    // 4. MATCHING
    const qMat = db.adminSaveQuestion({
      subjectId: subjId,
      text: 'Pasangkan nama hewan dengan suaranya:',
      question_type: 'MATCHING',
      options: ['Kucing', 'Sapi', 'Kambing'],
      answerIndex: 0,
      typeData: {
        pairs: [
          { left: 'Kucing', right: 'Mengeong' },
          { left: 'Sapi', right: 'Melenguh' },
          { left: 'Kambing', right: 'Mengembik' }
        ]
      },
      difficulty: 2
    });
    assert.equal(qMat.question_type, 'MATCHING');
    const matData = JSON.parse(qMat.type_data_json);
    assert.equal(matData.pairs.length, 3);

    // 5. SHORT (Numeric & Text)
    const qShort = db.adminSaveQuestion({
      subjectId: subjId,
      text: 'Berapakah 100 x 5?',
      question_type: 'SHORT',
      options: [],
      answerIndex: 0,
      typeData: {
        isNumeric: true,
        numeric: { value: 500, tolerance: 0 }
      },
      difficulty: 2
    });
    assert.equal(qShort.question_type, 'SHORT');
    const shortData = JSON.parse(qShort.type_data_json);
    assert.equal(shortData.numeric.value, 500);

    // Verifikasi adminGetQuestions mengembalikan semua tipe dengan data lengkap
    const allQ = db.adminGetQuestions(subjId);
    assert.equal(allQ.length, 5);
    const types = allQ.map(x => x.question_type);
    assert.ok(types.includes('MCQ'));
    assert.ok(types.includes('TRUE_FALSE'));
    assert.ok(types.includes('ORDERING'));
    assert.ok(types.includes('MATCHING'));
    assert.ok(types.includes('SHORT'));
  });

  await t.test('2. Admin Import JSON memvalidasi per baris dan melaporkan error per baris', () => {
    const importPayload = [
      // Baris 1: Valid MCQ
      {
        text: 'Soal Import Valid 1 (MCQ)',
        type: 'MCQ',
        options: ['A', 'B', 'C', 'D'],
        answerIndex: 0
      },
      // Baris 2: Invalid (tidak ada text)
      {
        text: '',
        type: 'MCQ',
        options: ['A', 'B']
      },
      // Baris 3: Valid TRUE_FALSE
      {
        text: 'Soal Import Valid 2 (TF)',
        type: 'TRUE_FALSE',
        typeData: { correctAnswer: false }
      },
      // Baris 4: Invalid ORDERING (kurang dari 2 item)
      {
        text: 'Soal Import Invalid 3 (ORDERING)',
        type: 'ORDERING',
        typeData: { items: ['Satu saja'] }
      },
      // Baris 5: Valid SHORT
      {
        text: 'Soal Import Valid 4 (SHORT)',
        type: 'SHORT',
        typeData: { accepted: ['Indonesia', 'RI'] }
      }
    ];

    const res = db.adminImportQuestions(subjId, importPayload);
    assert.equal(res.ok, true);
    assert.equal(res.imported, 3);
    assert.ok(Array.isArray(res.errors));
    assert.equal(res.errors.length, 2);
    assert.equal(res.errors[0].line, 2);
    assert.equal(res.errors[1].line, 4);
  });
});
