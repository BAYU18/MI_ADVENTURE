'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../lib/db');
const rawDb = db.getDb();
const Progression = require('../shared/progression');

test('T-30 / Skenario H.3, H.4, H.8: Boss Bertier, Pemilihan Tier, bossStats, dan Kompatibilitas Sesi Lama', async (t) => {
  // Setup synthetic test player
  const testClass = rawDb.prepare("SELECT id FROM classes LIMIT 1").get() ||
    rawDb.prepare("INSERT INTO classes(name, grade) VALUES('Kelas Test', 4) RETURNING id").get();

  const testNick = 'TesterBoss_' + Math.random().toString(36).substring(2, 7);
  const ins = rawDb.prepare(`
    INSERT INTO players (nick, nick_lower, password_hash, class_id, coins, xp)
    VALUES (?, ?, 'hash123', ?, 1000, 0)
    RETURNING id, nick
  `).get(testNick, testNick.toLowerCase(), testClass.id);
  const playerId = ins.id;
  const subRow = rawDb.prepare('SELECT id FROM subjects LIMIT 1').get();

  // Helper to cleanup active sessions
  function cleanup() {
    rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE player_id=?").run(playerId);
  }

  await t.test('1. Skenario H.3: Pemilihan Tier Kampanye mengikuti 4 Bab x 3 Wilayah', () => {
    // Bab 1: Wilayah 1-2 common, Wilayah 3 rare
    assert.equal(Progression.campaignTier(1, 1), 'common');
    assert.equal(Progression.campaignTier(1, 2), 'common');
    assert.equal(Progression.campaignTier(1, 3), 'rare');

    // Bab 2: Wilayah 1 common, Wilayah 2 rare, Wilayah 3 epic
    assert.equal(Progression.campaignTier(2, 1), 'common');
    assert.equal(Progression.campaignTier(2, 2), 'rare');
    assert.equal(Progression.campaignTier(2, 3), 'epic');

    // Bab 3: Wilayah 1 rare, Wilayah 2-3 epic
    assert.equal(Progression.campaignTier(3, 1), 'rare');
    assert.equal(Progression.campaignTier(3, 2), 'epic');
    assert.equal(Progression.campaignTier(3, 3), 'epic');

    // Bab 4: Wilayah 1-2 epic, Wilayah 3 legend
    assert.equal(Progression.campaignTier(4, 1), 'epic');
    assert.equal(Progression.campaignTier(4, 2), 'epic');
    assert.equal(Progression.campaignTier(4, 3), 'legend');
  });

  await t.test('2. Skenario H.3: Mode Bebas 10.000 undian sesuai bobot ±2 poin & Lv 1-5 tidak pernah legend', () => {
    // Test Lv 1-5: 70/25/5/0
    const countsLv1 = { common: 0, rare: 0, epic: 0, legend: 0 };
    for (let i = 0; i < 10000; i++) {
      const tier = Progression.pickTier(Math.random, 1);
      countsLv1[tier]++;
    }
    assert.equal(countsLv1.legend, 0, 'Level 1-5 tidak boleh mendapatkan legend');
    // Toleransi ±2% (±200 dari 10.000)
    assert.ok(Math.abs(countsLv1.common - 7000) <= 200, `common ~70% (dapat ${countsLv1.common})`);
    assert.ok(Math.abs(countsLv1.rare - 2500) <= 200, `rare ~25% (dapat ${countsLv1.rare})`);
    assert.ok(Math.abs(countsLv1.epic - 500) <= 200, `epic ~5% (dapat ${countsLv1.epic})`);

    // Test Lv 21+: 20/30/30/20
    const countsLv25 = { common: 0, rare: 0, epic: 0, legend: 0 };
    for (let i = 0; i < 10000; i++) {
      const tier = Progression.pickTier(Math.random, 25);
      countsLv25[tier]++;
    }
    assert.ok(Math.abs(countsLv25.common - 2000) <= 200, `common ~20% (dapat ${countsLv25.common})`);
    assert.ok(Math.abs(countsLv25.rare - 3000) <= 200, `rare ~30% (dapat ${countsLv25.rare})`);
    assert.ok(Math.abs(countsLv25.epic - 3000) <= 200, `epic ~30% (dapat ${countsLv25.epic})`);
    assert.ok(Math.abs(countsLv25.legend - 2000) <= 200, `legend ~20% (dapat ${countsLv25.legend})`);
  });

  await t.test('3. Skenario H.3: Tier tersimpan di game_sessions dan persisten saat resume', () => {
    cleanup();
    const session = db.startSession(playerId, subRow.id);
    assert.ok(session.sessionId);
    assert.ok(session.boss.tier);
    assert.ok(session.boss.tierLabel);
    assert.equal(session.bossMaxHp, session.boss.hitsNeeded * 20);

    // Verify DB
    const row = rawDb.prepare('SELECT boss_tier, boss_hits_needed, boss_hit_unit, monster_damage, max_questions FROM game_sessions WHERE id=?').get(session.sessionId);
    assert.equal(row.boss_tier, session.boss.tier);
    assert.equal(row.boss_hits_needed, session.boss.hitsNeeded);
    assert.equal(row.boss_hit_unit, 20);
    assert.ok(row.monster_damage > 0);
    assert.ok(row.max_questions >= 25);

    // Verify resume / getSession
    const resumed = db.getSession(session.sessionId, playerId);
    assert.equal(resumed.bossTier, session.boss.tier);
    assert.equal(resumed.boss.tier, session.boss.tier);
    assert.equal(resumed.boss.hitsNeeded, session.boss.hitsNeeded);
    assert.equal(resumed.boss.hitsLeft, session.boss.hitsNeeded);
    cleanup();
  });

  await t.test('4. Skenario H.4: Adaptasi hitsNeeded & bossMaxHp untuk tiap tier x skor {null, 0, 50, 100}', () => {
    const tiers = ['common', 'rare', 'epic', 'legend'];
    const scores = [null, 0, 50, 100];

    for (const tier of tiers) {
      for (const score of scores) {
        const stats = Progression.bossStats(tier, score, 100, 100);
        const N = stats.hitsNeeded;
        assert.ok(N >= 15 && N <= 30, `N (${N}) harus antara 15 dan 30 untuk tier ${tier} skor ${score}`);
        assert.equal(stats.bossMaxHp, N * 20);
        assert.equal(stats.hitUnit, 20);
        assert.ok(stats.monsterDamage >= 5 && stats.monsterDamage <= 17);
        assert.ok(stats.maxQuestions >= N);
      }
    }
  });

  await t.test('5. Skenario H.4: Bank soal kecil membatasi N dan mencatat peringatan', () => {
    const smallPool = 12; // Kurang dari 15
    const stats = Progression.bossStats('common', null, 100, smallPool);
    assert.equal(stats.hitsNeeded, 12, 'N dibatasi ke ukuran bank soal');
    assert.equal(stats.bossMaxHp, 12 * 20);
  });

  await t.test('6. Skenario H.8: Kompatibilitas sesi lama (boss_tier NULL)', () => {
    cleanup();
    const oldSessionId = 'old-session-' + Date.now();
    const qRow = rawDb.prepare('SELECT id FROM questions WHERE subject_id=? LIMIT 1').get(subRow.id);

    // Insert synthetic session matching pre-v6 schema where boss_tier is NULL
    rawDb.prepare(`
      INSERT INTO game_sessions (
        id, player_id, subject_id, monster_id, mode, status,
        total_questions, current_index, boss_max_hp, boss_hp,
        player_max_hp, player_hp, streak, max_streak, correct_count,
        energy, energy_max, loadout_json, uses_json, flags_json,
        started_at, created_at, boss_tier, boss_hits_needed, boss_hit_unit
      ) VALUES (
        ?, ?, ?, 1, 'FREE', 'IN_PROGRESS',
        5, 0, 100, 100,
        100, 100, 0, 0, 0,
        2, 5, '[]', '{}', '{}',
        datetime('now'), datetime('now'), NULL, NULL, NULL
      )
    `).run(oldSessionId, playerId, subRow.id);

    rawDb.prepare(`
      INSERT INTO session_questions (
        session_id, question_id, order_index, option_order, timer_state
      ) VALUES (?, ?, 0, '[0,1,2,3]', 'PENDING')
    `).run(oldSessionId, qRow.id);

    // getSession should return gracefully with null tier
    const sess = db.getSession(oldSessionId, playerId);
    assert.ok(sess);
    assert.equal(sess.bossTier, null);
    assert.equal(sess.boss.tier, null);
    assert.equal(sess.boss.hitsLeft, null);

    // answerQuestion should work without error
    const ans = db.answerQuestion(oldSessionId, playerId, 0, 0);
    assert.ok(ans);
    assert.equal(ans.ok, true);
    assert.equal(ans.boss.tier, null);
    assert.equal(ans.boss.hitsLeft, null);

    cleanup();
  });
});
