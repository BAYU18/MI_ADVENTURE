'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const tmpDbPath = path.join(__dirname, 'test-rewards-tier.db');
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
}

test('T-33 / Spek C.3: Pengali Hadiah Boss Tiap Tier & Agregasi bossByTier Laporan', async (t) => {
  t.after(cleanup);

  // Setup Class & Player
  const clsInfo = rawDb.prepare("INSERT INTO classes(name, sort_order) VALUES('Kelas Hadiah', 1)").run();
  const clsId = Number(clsInfo.lastInsertRowid);
  const player = db.registerPlayer('PlayerReward', 'Password123', clsId);
  rawDb.prepare("UPDATE players SET avatar_json='{}' WHERE id=?").run(player.id);

  // Setup Subject dengan soal
  const subInfo = rawDb.prepare(`
    INSERT INTO subjects(class_id, name, icon, color, monster_theme, question_count, time_limit_sec, is_active)
    VALUES (?, 'Matematika Hadiah', '🪙', '#f59e0b', 'hutan', 50, 20, 1)
  `).run(clsId);
  const subjectId = Number(subInfo.lastInsertRowid);

  const insQ = rawDb.prepare(`
    INSERT INTO questions(subject_id, text, question_type, type_data_json, options_json, answer_index, topic_tag, difficulty, hash, is_active)
    VALUES (?, ?, 'MCQ', '{}', ?, 0, 'hitung', 2, ?, 1)
  `);
  for (let i = 1; i <= 30; i++) {
    insQ.run(subjectId, `Soal Hitung ${i}`, JSON.stringify(['A', 'B', 'C', 'D']), `hash_rew_${i}`);
  }

  // 1. Uji Pengali Tiap Tier
  const tiers = ['common', 'rare', 'epic', 'legend'];
  for (const tier of tiers) {
    await t.test(`Kemenangan tier ${tier} mengalikan koin dan XP sesuai Progression.rewardMult`, () => {
      rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
      const sess = db.startSession(player.id, subjectId, { count: 10, bossTier: tier });
      const sId = sess.sessionId;

      // Set boss HP ke 1 agar sekali jawab langsung menang (short session < 15, fase 2 terpicu)
      rawDb.prepare('UPDATE game_sessions SET boss_hp=1 WHERE id=?').run(sId);

      const sq = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
      rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
        .run(new Date().toISOString(), new Date().toISOString(), sq.id);

      const ans = db.answerQuestion(sId, player.id, sq.question_id, getCorrectDisplayIdx(rawDb, sq));
      assert.equal(ans.session.status, 'WON', `Sesi tier ${tier} harus WON`);

      const rMult = Progression.rewardMult(tier);
      // Base reward = 10, fase 2 (+15%) -> Math.round(10 * 1.15) = 12
      const expectedBossCoins = Math.round(12 * rMult.coin);
      // xp = (stars * 25 + streak * 2) * rMult.xp. Accuracy 1/10 = 0.1 -> stars = 1, streak = 1 -> (25 + 2) = 27
      const expectedXp = Math.round(27 * rMult.xp);

      const actualBossCoins = ans.rewards.coins - (ans.drops?.coins || 0);
      assert.equal(actualBossCoins, expectedBossCoins, `Koin kemenangan tier ${tier} harus ${expectedBossCoins}`);
      assert.equal(ans.rewards.xp, expectedXp, `XP tier ${tier} harus ${expectedXp}`);
    });
  }

  // 2. Uji Hadiah Kampanye First Clear Tidak Terpengaruh Pengali Tier
  await t.test('Hadiah First Clear Kampanye tidak dikali pengali tier', () => {
    rawDb.prepare("UPDATE game_sessions SET status='ABANDONED' WHERE player_id=?").run(player.id);
    // Simpul 1-1 (bab 1 first clear = 30 koin, tier = legend)
    const sess = db.startSession(player.id, subjectId, { campaignNode: `s${subjectId}-c1-n1`, bossTier: 'legend' });
    const sId = sess.sessionId;
    rawDb.prepare('UPDATE game_sessions SET boss_hp=1 WHERE id=?').run(sId);

    const sq = rawDb.prepare('SELECT * FROM session_questions WHERE session_id=? AND order_index=0').get(sId);
    rawDb.prepare("UPDATE session_questions SET timer_state='RUNNING', ready_at=?, served_at=? WHERE id=?")
      .run(new Date().toISOString(), new Date().toISOString(), sq.id);

    const ans = db.answerQuestion(sId, player.id, sq.question_id, getCorrectDisplayIdx(rawDb, sq));
    assert.equal(ans.session.status, 'WON');
    assert.equal(ans.rewards.firstClear, true);
    assert.equal(ans.rewards.firstClearCoins, 30, 'First clear coins bab 1 harus 30 tanpa pengali legend');
  });

  // 3. Uji bossByTier di Laporan Mingguan
  await t.test('compileWeeklyReport mengakumulasi bossByTier dengan tepat termasuk sesi lama (NULL -> common)', () => {
    // Bersihkan sesi pemain untuk laporan
    rawDb.prepare("DELETE FROM game_sessions WHERE player_id=?").run(player.id);

    const nowIso = new Date().toISOString();
    const insSess = rawDb.prepare(`
      INSERT INTO game_sessions(id, player_id, subject_id, monster_id, status, mode, started_at, finished_at, boss_tier, total_questions, boss_max_hp, boss_hp, player_max_hp, player_hp)
      VALUES (?, ?, ?, 'm1', 'WON', 'BATTLE', ?, ?, ?, 10, 100, 0, 100, 100)
    `);

    // Insert 2 common, 1 rare, 1 epic, 1 legend, dan 1 sesi lama (NULL -> dihitung common)
    insSess.run('s_c1', player.id, subjectId, nowIso, nowIso, 'common');
    insSess.run('s_c2', player.id, subjectId, nowIso, nowIso, 'common');
    insSess.run('s_r1', player.id, subjectId, nowIso, nowIso, 'rare');
    insSess.run('s_e1', player.id, subjectId, nowIso, nowIso, 'epic');
    insSess.run('s_l1', player.id, subjectId, nowIso, nowIso, 'legend');
    insSess.run('s_old', player.id, subjectId, nowIso, nowIso, null);

    // Insert 1 sesi LOST (tidak boleh dihitung ke bossDefeated / bossByTier)
    rawDb.prepare(`
      INSERT INTO game_sessions(id, player_id, subject_id, monster_id, status, mode, started_at, finished_at, boss_tier, total_questions, boss_max_hp, boss_hp, player_max_hp, player_hp)
      VALUES ('s_lost', ?, ?, 'm1', 'LOST', 'BATTLE', ?, ?, 'epic', 10, 100, 50, 100, 0)
    `).run(player.id, subjectId, nowIso, nowIso);

    const rep = db.compileWeeklyReport(player.id);
    assert.equal(rep.summary.bossDefeated, 6, 'Total bossDefeated harus 6 (5 bertier + 1 NULL)');
    assert.deepEqual(rep.summary.bossByTier, {
      common: 3, // 2 common + 1 NULL
      rare: 1,
      epic: 1,
      legend: 1
    }, 'bossByTier harus terhitung presisi');

    // Cek pujian memuat tier tertinggi (Legend)
    const legendPraise = rep.praise.some(p => p.includes('Legend'));
    assert.equal(legendPraise, true, 'Praise harus menyebutkan tier tertinggi (Legend)');
  });
});
