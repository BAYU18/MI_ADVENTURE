#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

function questionHash(text) {
  return crypto.createHash('sha1')
    .update(String(text || '').toLowerCase().trim().replace(/\s+/g, ' '))
    .digest('hex');
}

function importFile(filePath, options = {}) {
  const dbPath = options.dbPath || '/home/maman/play/data/play.db';
  const dryRun = options.dryRun || false;
  const db = new DatabaseSync(dbPath);

  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  const className = data.class || 'Kelas 4 SD';
  const subjectName = data.subject;
  const questions = Array.isArray(data) ? data : (data.questions || []);

  if (!subjectName) {
    throw new Error(`File ${filePath} tidak memiliki field 'subject'.`);
  }

  // Find class
  const classRow = db.prepare('SELECT id FROM classes WHERE name=?').get(className);
  if (!classRow) {
    throw new Error(`Kelas '${className}' tidak ditemukan di database.`);
  }

  // Find subject
  const subjRow = db.prepare('SELECT id, name FROM subjects WHERE class_id=? AND name=?').get(classRow.id, subjectName);
  if (!subjRow) {
    throw new Error(`Mata pelajaran '${subjectName}' untuk kelas '${className}' belum terdaftar.`);
  }

  const subjectId = subjRow.id;
  let imported = 0;
  let updated = 0;
  let skipped = 0;

  const checkStmt = db.prepare('SELECT id, text FROM questions WHERE subject_id=? AND hash=?');
  const insertStmt = db.prepare(`
    INSERT INTO questions (
      subject_id, text, options_json, answer_index, explanation,
      difficulty, eff_difficulty, time_limit_sec, hash, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  const updateStmt = db.prepare(`
    UPDATE questions SET
      options_json=?, answer_index=?, explanation=?, difficulty=?,
      eff_difficulty=?, time_limit_sec=?, is_active=1
    WHERE id=?
  `);

  if (!dryRun) db.exec('BEGIN IMMEDIATE');

  try {
    for (const q of questions) {
      const qText = q.question || q.text;
      const opts = q.options;
      const ans = q.answer !== undefined ? q.answer : q.answer_index;
      const expl = q.explanation || '';
      const diff = q.difficulty || 1;
      const timeLimit = q.timeLimit || null;
      const h = questionHash(qText);

      const existing = checkStmt.get(subjectId, h);

      if (existing) {
        if (!dryRun) {
          updateStmt.run(JSON.stringify(opts), ans, expl, diff, diff, timeLimit, existing.id);
        }
        updated++;
      } else {
        if (!dryRun) {
          insertStmt.run(subjectId, qText, JSON.stringify(opts), ans, expl, diff, diff, timeLimit, h);
        }
        imported++;
      }
    }

    if (!dryRun) {
      // Refresh count
      const countRow = db.prepare('SELECT count(*) as cnt FROM questions WHERE subject_id=? AND is_active=1').get(subjectId);
      db.prepare('UPDATE subjects SET question_count=? WHERE id=?').run(countRow.cnt, subjectId);
      db.exec('COMMIT');
    }
  } catch (err) {
    if (!dryRun) db.exec('ROLLBACK');
    throw err;
  }

  console.log(`[${dryRun ? 'DRY-RUN' : 'IMPORT'}] ${subjectName} (${className}): ${imported} baru, ${updated} diperbarui, total ${questions.length} diproses.`);
  return { subjectId, subjectName, imported, updated, total: questions.length };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const fileArg = args.find(a => !a.startsWith('--'));

  if (!fileArg) {
    console.error('Usage: node scripts/import-konten.js [--dry-run] <file.json>');
    process.exit(1);
  }

  try {
    importFile(fileArg, { dryRun });
  } catch (e) {
    console.error('Error saat import:', e.message);
    process.exit(1);
  }
}

module.exports = { importFile };
