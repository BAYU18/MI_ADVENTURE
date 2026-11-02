'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

// Setup isolated database for test
const tmpDbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'play-reports-test-'));
const tmpDbPath = path.join(tmpDbDir, 'test.db');
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();
const rawDb = db.getDb();
const reports = require('../lib/reports');

test('Skenario 13.2 #11 / T-37, T-38, T-39: Laporan Mingguan & Portal Siswa (J.1, J.2, J.3)', async (t) => {
  // 1. Setup Data Sintetis
  const testClass = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas 4 SD/MI', 1) RETURNING id").get();
  const player = rawDb.prepare(`
    INSERT INTO players(nick, nick_lower, password_hash, class_id, xp, coins)
    VALUES('Budi_Report', 'budi_report', 'hash', ?, 100, 50) RETURNING id, nick
  `).get(testClass.id);

  const subject = rawDb.prepare(`
    INSERT INTO subjects(class_id, name, monster_theme, question_count, is_active)
    VALUES(?, 'Matematika', 'hutan', 10, 1) RETURNING id
  `).get(testClass.id);

  const q1 = rawDb.prepare(`
    INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, topic_tag, is_active)
    VALUES(?, 'hash_rep_1', '1/2 + 1/2 = ...', '["1", "2"]', 0, 'MCQ', 'pecahan', 1) RETURNING id
  `).get(subject.id);

  const q2 = rawDb.prepare(`
    INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, topic_tag, is_active)
    VALUES(?, 'hash_rep_2', '5 x 5 = ...', '["25", "20"]', 0, 'MCQ', 'perkalian', 1) RETURNING id
  `).get(subject.id);

  const q3 = rawDb.prepare(`
    INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, topic_tag, is_active)
    VALUES(?, 'hash_rep_3', '3/4 - 1/4 = ...', '["2/4", "1"]', 0, 'MCQ', 'pecahan', 1) RETURNING id
  `).get(subject.id);

  // Gunakan waktu minggu ini (Senin s.d. Minggu WIB)
  const now = new Date();
  const weekInfo = reports.getWeekBoundariesWib(now, 0);
  const midWeekDate = new Date(new Date(weekInfo.startIso).getTime() + 2 * 24 * 3600 * 1000); // Rabu
  const midWeekIso = midWeekDate.toISOString();

  // Sesi 1: BATTLE, 10 menit, status WON, 3 bintang, streak 4
  const s1Start = midWeekIso;
  const s1End = new Date(midWeekDate.getTime() + 10 * 60 * 1000).toISOString();
  const s1 = rawDb.prepare(`
    INSERT INTO game_sessions(
      id, player_id, subject_id, mode, status, started_at, finished_at,
      stars, max_streak, total_questions, boss_max_hp, boss_hp
    ) VALUES('sesi-rep-1', ?, ?, 'BATTLE', 'WON', ?, ?, 3, 4, 3, 100, 0)
    RETURNING id
  `).get(player.id, subject.id, s1Start, s1End);

  // Sesi 1 questions: q1 CORRECT, q2 CORRECT, q3 WRONG
  rawDb.prepare(`
    INSERT INTO session_questions(session_id, question_id, order_index, option_order, answered_at, outcome)
    VALUES(?, ?, 0, '0,1', ?, 'CORRECT'), (?, ?, 1, '0,1', ?, 'CORRECT'), (?, ?, 2, '0,1', ?, 'WRONG')
  `).run(s1.id, q1.id, s1End, s1.id, q2.id, s1End, s1.id, q3.id, s1End);

  // Sesi 2: BATTLE, 40 menit (melebihi cap 30 menit), status LOST, 1 bintang, streak 2
  const s2Date = new Date(midWeekDate.getTime() + 3600 * 1000);
  const s2Start = s2Date.toISOString();
  const s2End = new Date(s2Date.getTime() + 40 * 60 * 1000).toISOString();
  const s2 = rawDb.prepare(`
    INSERT INTO game_sessions(
      id, player_id, subject_id, mode, status, started_at, finished_at,
      stars, max_streak, total_questions, boss_max_hp, boss_hp
    ) VALUES('sesi-rep-2', ?, ?, 'BATTLE', 'LOST', ?, ?, 1, 2, 2, 100, 40)
    RETURNING id
  `).get(player.id, subject.id, s2Start, s2End);

  // Sesi 2 questions: q1 WRONG, q3 TIMEOUT_AWAY (harus dikecualikan dari akurasi)
  rawDb.prepare(`
    INSERT INTO session_questions(session_id, question_id, order_index, option_order, answered_at, outcome)
    VALUES(?, ?, 0, '0,1', ?, 'WRONG'), (?, ?, 1, '0,1', ?, 'TIMEOUT_AWAY')
  `).run(s2.id, q1.id, s2End, s2.id, q3.id, s2End);

  // Sesi 3: PRACTICE, 5 menit, status WON
  const s3Date = new Date(midWeekDate.getTime() + 2 * 3600 * 1000);
  const s3Start = s3Date.toISOString();
  const s3End = new Date(s3Date.getTime() + 5 * 60 * 1000).toISOString();
  const s3 = rawDb.prepare(`
    INSERT INTO game_sessions(
      id, player_id, subject_id, mode, status, started_at, finished_at,
      stars, max_streak, total_questions, boss_max_hp, boss_hp
    ) VALUES('sesi-rep-3', ?, ?, 'PRACTICE', 'WON', ?, ?, 0, 1, 1, 100, 0)
    RETURNING id
  `).get(player.id, subject.id, s3Start, s3End);

  rawDb.prepare(`
    INSERT INTO session_questions(session_id, question_id, order_index, option_order, answered_at, outcome)
    VALUES(?, ?, 0, '0,1', ?, 'CORRECT')
  `).run(s3.id, q2.id, s3End);

  // Sesi 4 di luar rentang minggu (2 minggu lalu) -> TIDAK terhitung di minggu ini
  const oldDate = new Date(now.getTime() - 14 * 24 * 3600 * 1000).toISOString();
  rawDb.prepare(`
    INSERT INTO game_sessions(id, player_id, subject_id, mode, status, started_at, finished_at, stars, max_streak, total_questions, boss_max_hp, boss_hp)
    VALUES('sesi-rep-old', ?, ?, 'BATTLE', 'WON', ?, ?, 3, 5, 10, 100, 0)
  `).run(player.id, subject.id, oldDate, oldDate);

  await t.test('1. Agregasi Laporan Mingguan dari data sesi sintetis (J.1)', () => {
    const rep = db.getWeeklyReport(player.id, { offset: 0, refDate: now });
    assert.equal(rep.weekStart, weekInfo.weekStart);
    assert.equal(rep.player.nick, 'Budi_Report');
    assert.equal(rep.player.className, 'Kelas 4 SD/MI');

    // Totals
    assert.equal(rep.totals.sessions, 3, 'Harus menghitung 3 sesi dalam rentang minggu');
    assert.equal(rep.totals.battles, 2, 'Harus ada 2 sesi battle');
    assert.equal(rep.totals.practice, 1, 'Harus ada 1 sesi practice');
    assert.equal(rep.totals.bossDefeated, 1, 'Hanya 1 sesi BATTLE yang WON (mengalahkan bos)');
    assert.equal(rep.totals.stars, 4, 'Total bintang 3 + 1 = 4');
    assert.equal(rep.totals.bestStreak, 4, 'Streak tertinggi harus 4');

    // Menit aktif dibatasi 30 menit per sesi (10 + min(30, 40) + 5 = 45 menit)
    assert.equal(rep.totals.minutes, 45, 'Menit aktif harus 45 (10 + 30 + 5, sesi 40 menit di-cap 30 menit)');

    // Akurasi: total 4 dijawab (q1, q2, q3 di s1 + q1 di s2 + q2 di s3 = 5 total, minus TIMEOUT_AWAY)
    // S1: q1(C), q2(C), q3(W) -> 3
    // S2: q1(W), q3(TIMEOUT_AWAY diabaikan) -> 1
    // S3: q2(C) -> 1
    // Total answered = 3 + 1 + 1 = 5. Total correct = 2 + 0 + 1 = 3.
    assert.equal(rep.totals.answered, 5, 'TIMEOUT_AWAY harus diabaikan dari answered');
    assert.equal(rep.totals.correct, 3, 'Benar ada 3');
    assert.equal(rep.totals.accuracy, 0.60, 'Akurasi harus 3/5 = 0.60');

    // Topics & oftenWrong
    assert.ok(rep.topics.some(t => t.topic === 'pecahan'));
    assert.ok(rep.topics.some(t => t.topic === 'perkalian'));
    assert.ok(rep.oftenWrong.length > 0, 'Harus ada daftar soal yang sering salah');

    // Contextual tip
    assert.ok(typeof rep.tip === 'string' && rep.tip.length > 0);
  });

  await t.test('2. Simpan dan Ambil Laporan Terarsip di Database (weekly_reports)', () => {
    const reportData = db.getWeeklyReport(player.id, { offset: 0, refDate: now });
    db.saveWeeklyReport(player.id, weekInfo.weekStart, reportData);

    // Ambil kembali lewat db.getWeeklyReport
    const cached = db.getWeeklyReport(player.id, { weekKey: weekInfo.weekStart });
    assert.deepEqual(cached.totals, reportData.totals);
  });

  await t.test('3. Token Berbagi Laporan, Kedaluwarsa, & Pencabutan (J.2)', () => {
    // Buat tautan berbagi
    const share = db.createReportShare(player.id);
    assert.ok(share.token, 'Token harus digenerate');
    assert.equal(share.url, `/r/${share.token}`);
    assert.ok(new Date(share.expiresAt) > new Date());

    // Pastikan di database tersimpan token_hash (bukan token plaintext)
    const stored = rawDb.prepare('SELECT * FROM report_shares WHERE player_id=?').get(player.id);
    assert.ok(stored);
    assert.notEqual(stored.token_hash, share.token, 'Database harus menyimpan hash, bukan token mentah');

    // Ambil laporan lewat share token
    const fetched = db.getReportByShareToken(share.token);
    assert.ok(fetched.ok);
    assert.equal(fetched.report.player.nick, 'Budi_Report');

    // Token kedaluwarsa: set expires_at ke waktu lampau
    rawDb.prepare("UPDATE report_shares SET expires_at='2020-01-01T00:00:00.000Z' WHERE player_id=?").run(player.id);
    const expiredFetch = db.getReportByShareToken(share.token);
    assert.equal(expiredFetch.expired, true, 'Token kedaluwarsa harus dilaporkan expired');

    // Perbarui share token
    const share2 = db.createReportShare(player.id);
    assert.ok(db.getReportByShareToken(share2.token).ok);

    // Cabut tautan berbagi
    db.revokeReportShare(player.id);
    const revokedFetch = db.getReportByShareToken(share2.token);
    assert.equal(revokedFetch, null, 'Token yang telah dicabut harus bernilai null');
  });

  await t.test('4. Admin Laporan Kelas & Ekspor CSV (J.3)', () => {
    const classReports = db.getClassWeeklyReports(testClass.id, weekInfo.weekStart);
    assert.equal(classReports.length, 1);
    assert.equal(classReports[0].nick, 'Budi_Report');
    assert.equal(classReports[0].sessions, 3);
    assert.equal(classReports[0].minutes, 45);

    const csvStr = db.exportClassReportsCsv(testClass.id, weekInfo.weekStart);
    assert.ok(csvStr.includes('"Nick"'));
    assert.ok(csvStr.includes('"Menit Aktif"'));
    assert.ok(csvStr.includes('"Budi_Report"'));
    assert.ok(csvStr.includes('45'));
    assert.ok(csvStr.includes('60%'));
  });
});
