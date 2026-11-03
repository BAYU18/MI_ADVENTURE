const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Use isolated temporary database for test
const tmpDbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'play-ui-rep-test-'));
const tmpDbPath = path.join(tmpDbDir, 'test.db');
process.env.PLAY_DB_PATH = tmpDbPath;

const db = require('../lib/db');
db.createDatabase();
const rawDb = db.getDb();
const Progression = require('../shared/progression');

test('Skenario H.1 & H.2: Level Kemampuan, Laporan Mingguan, & Share Portal /r/{token}', async (t) => {
  // Setup synthetic class and player
  const testClass = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas 4 SD/MI', 1) RETURNING id").get();
  const player = rawDb.prepare(`
    INSERT INTO players(nick, nick_lower, password_hash, class_id, xp, coins)
    VALUES('Budi_Report', 'budi_report', 'hash', ?, 100, 50) RETURNING id, nick
  `).get(testClass.id);

  const s1 = rawDb.prepare(`
    INSERT INTO subjects(class_id, name, icon, monster_theme, question_count, is_active)
    VALUES(?, 'Matematika', '📐', 'hutan', 10, 1) RETURNING id, name
  `).get(testClass.id);

  const s2 = rawDb.prepare(`
    INSERT INTO subjects(class_id, name, icon, monster_theme, question_count, is_active)
    VALUES(?, 'IPAS', '🔬', 'gua', 10, 1) RETURNING id, name
  `).get(testClass.id);

  // Insert questions for s1 and s2
  for (let i = 1; i <= 15; i++) {
    rawDb.prepare(`
      INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, topic_tag, is_active)
      VALUES(?, ?, 'Soal Matematika ${i}', '["A","B"]', 0, 'MCQ', 'pecahan', 1)
    `).run(s1.id, `hash_s1_${i}`);

    rawDb.prepare(`
      INSERT INTO questions(subject_id, hash, text, options_json, answer_index, question_type, topic_tag, is_active)
      VALUES(?, ?, 'Soal IPAS ${i}', '["A","B"]', 0, 'MCQ', 'rantai_makanan', 1)
    `).run(s2.id, `hash_s2_${i}`);
  }

  const s1Questions = rawDb.prepare('SELECT id FROM questions WHERE subject_id = ?').all(s1.id);
  const s2Questions = rawDb.prepare('SELECT id FROM questions WHERE subject_id = ?').all(s2.id);

  await t.test('H.1: Verifikasi Level Kemampuan (urutan naik, status, thresholds)', () => {
    // Initial state: both subjects should be NONE
    const abInitial = db.computeSubjectAbilities(player.id);
    assert.ok(Array.isArray(abInitial.abilities));
    assert.ok(abInitial.abilities.every(a => a.status === 'NONE'));

    // Insert answers for s1: 4 answers (INSUFFICIENT)
    for (let i = 0; i < 4; i++) {
      rawDb.prepare(`
        INSERT INTO player_question_stats (player_id, question_id, seen, correct, box, last_seen_at)
        VALUES (?, ?, 1, 1, 3, datetime('now'))
      `).run(player.id, s1Questions[i].id);
    }

    // Insert answers for s2: 10 answers (MEASURED)
    for (let i = 0; i < 10; i++) {
      rawDb.prepare(`
        INSERT INTO player_question_stats (player_id, question_id, seen, correct, box, last_seen_at)
        VALUES (?, ?, 1, 1, 4, datetime('now'))
      `).run(player.id, s2Questions[i].id);
    }

    const abUpdated = db.computeSubjectAbilities(player.id);
    const s2Ab = abUpdated.abilities.find(a => a.subjectId === s2.id);
    const s1Ab = abUpdated.abilities.find(a => a.subjectId === s1.id);

    assert.equal(s2Ab.status, 'MEASURED');
    assert.equal(s1Ab.status, 'INSUFFICIENT');
    // MEASURED comes before INSUFFICIENT
    assert.ok(s2Ab.rank < s1Ab.rank, 'MEASURED harus berperingkat lebih dulu daripada INSUFFICIENT');
    assert.equal(abUpdated.lowestSubjectId, s2.id, 'lowestSubjectId harus menunjuk ke mapel MEASURED');

    // Progression level thresholds
    assert.equal(Progression.abilityLevel(19).level, 1);
    assert.equal(Progression.abilityLevel(20).level, 2);
    assert.equal(Progression.abilityLevel(39).level, 2);
    assert.equal(Progression.abilityLevel(40).level, 3);
    assert.equal(Progression.abilityLevel(59).level, 3);
    assert.equal(Progression.abilityLevel(60).level, 4);
    assert.equal(Progression.abilityLevel(79).level, 4);
    assert.equal(Progression.abilityLevel(80).level, 5);
  });

  await t.test('H.2: Laporan Pemain Baru vs Pemain Berdata, Navigasi Minggu, & Lencana Sementara', () => {
    // New player report: empty summary
    const newReport = db.getWeeklyReport(player.id, { offset: 0 });
    assert.equal(newReport.v, 2);
    assert.equal(newReport.partial, true, 'Minggu berjalan harus memiliki flag partial: true');
    assert.ok(Array.isArray(newReport.abilities));
    assert.ok(Array.isArray(newReport.daily));
    assert.equal(newReport.daily.length, 7);

    // Add session with boss defeated
    const sessionId = 'test-session-' + Date.now();
    rawDb.prepare(`
      INSERT INTO game_sessions (
        id, player_id, subject_id, mode, status, started_at, finished_at,
        total_questions, correct_count, boss_tier, boss_max_hp, boss_hp,
        player_max_hp, player_hp, coins_earned, xp_earned
      ) VALUES (
        ?, ?, ?, 'BATTLE', 'WON', datetime('now'), datetime('now'),
        15, 15, 'rare', 300, 0,
        100, 100, 50, 80
      )
    `).run(sessionId, player.id, s2.id);

    // Add session_questions
    for (let i = 0; i < 5; i++) {
      rawDb.prepare(`
        INSERT INTO session_questions (session_id, question_id, order_index, option_order, outcome, answered_at)
        VALUES (?, ?, ?, '["A","B"]', 'CORRECT', datetime('now'))
      `).run(sessionId, s2Questions[i].id, i);
    }

    const dataReport = db.getWeeklyReport(player.id, { offset: 0 });
    assert.equal(dataReport.summary.answered, 5);
    assert.equal(dataReport.summary.bossDefeated, 1);
    assert.equal(dataReport.summary.bossByTier.rare, 1);
    assert.equal(dataReport.summary.bossByTier.common, 0);
  });

  await t.test('H.2 & Spek A.2: Share Token, Portal /r/{token}, dan Pencabutan', () => {
    // Create share token
    const share = db.createReportShare(player.id);
    assert.ok(share.token, 'Harus menghasilkan token');
    assert.equal(share.url, `/r/${share.token}`);

    // Verify token can retrieve report
    const shareRes = db.getReportByShareToken(share.token);
    assert.ok(shareRes.ok);
    assert.equal(shareRes.report.v, 2);
    assert.ok(Array.isArray(shareRes.report.abilities));
    assert.ok(shareRes.report.summary.bossByTier);

    // Verify revocation
    db.revokeReportShare(player.id);
    const revokedRes = db.getReportByShareToken(share.token);
    assert.equal(revokedRes, null, 'Token yang dicabut harus mengembalikan null');

    // Create a new share token and test expiration
    const share2 = db.createReportShare(player.id);
    rawDb.prepare("UPDATE report_shares SET expires_at = '2020-01-01T00:00:00.000Z' WHERE player_id = ?").run(player.id);
    const expRes = db.getReportByShareToken(share2.token);
    assert.equal(expRes.expired, true, 'Token kedaluwarsa harus dilaporkan expired');
  });

  await t.test('UI Asset Sanity: index.html, sw.js, app.js testids', () => {
    const indexPath = path.join(__dirname, '..', 'public', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    assert.ok(indexContent.includes('/shared/progression.js'), 'index.html harus memuat /shared/progression.js');

    const swPath = path.join(__dirname, '..', 'public', 'sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');
    assert.ok(swContent.includes('/shared/progression.js'), 'sw.js harus mencache /shared/progression.js');
    assert.ok(swContent.includes('pp-v6.0.0'), 'sw.js harus menggunakan cache v6');

    const appPath = path.join(__dirname, '..', 'public', 'js', 'app.js');
    const appContent = fs.readFileSync(appPath, 'utf8');

    const requiredTestIds = [
      'screen-report', 'report-week-prev', 'report-week-next', 'report-partial-badge',
      'report-summary', 'report-chart', 'ability-list', 'report-weak-topics',
      'report-mastered-topics', 'report-praise', 'report-advice', 'report-share-btn',
      'report-share-url', 'report-share-revoke', 'report-empty'
    ];
    for (const testId of requiredTestIds) {
      assert.ok(appContent.includes(testId), `app.js harus memuat data-testid="${testId}"`);
    }

    assert.ok(appContent.includes("go('report')"), 'Home screen harus memiliki handler menu report go(report)');
  });
});
