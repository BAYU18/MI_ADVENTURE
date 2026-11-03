'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');
const db = require('../lib/db');
const auth = require('../lib/auth');
const { SKILLS, getSkillUpgradeCost } = require('../shared/economy');

function uuid() {
  return crypto.randomUUID();
}

function makeReq(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

test('Skenario H.9: Upgrade Skill Atomik, Idempotensi, Alasan, dan Snapshot Battle', async (t) => {
  const rawDb = db.getDb();

  // Helper to create synthetic test player
  const testClass = rawDb.prepare("SELECT id FROM classes LIMIT 1").get() ||
    rawDb.prepare("INSERT INTO classes(name, grade) VALUES('Kelas Test', 4) RETURNING id").get();

  const testNick = 'TesterSkill_' + Math.random().toString(36).substring(2, 7);
  const ins = rawDb.prepare(`
    INSERT INTO players (nick, nick_lower, password_hash, class_id, coins, xp)
    VALUES (?, ?, 'hash123', ?, 1000, 0)
    RETURNING id, nick, coins
  `).get(testNick, testNick.toLowerCase(), testClass.id);
  const playerId = ins.id;

  // Insert initial coin transaction to satisfy coins invariant (1000 initial)
  rawDb.prepare(`
    INSERT INTO coin_transactions (player_id, amount, delta, reason, balance_aft)
    VALUES (?, 1000, 1000, 'INITIAL_GRANT', 1000)
  `).run(playerId);

  // Ensure default skills: eliminate_one, eagle_eye, heal
  db.ensurePlayerSkills(playerId, 1);

  // Helper for coin invariant check
  function assertCoinInvariant() {
    const p = rawDb.prepare('SELECT coins FROM players WHERE id=?').get(playerId);
    const sumRow = rawDb.prepare('SELECT COALESCE(SUM(delta), 0) as total FROM coin_transactions WHERE player_id=?').get(playerId);
    assert.equal(p.coins, sumRow.total, `Coin invariant must hold: player.coins (${p.coins}) === sum(delta) (${sumRow.total})`);
  }

  assertCoinInvariant();

  // Helper auth token
  const token = auth.signToken({ type: 'player', id: playerId, nick: testNick });
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Cookie': `pp_token=${token}`,
    'Content-Type': 'application/json'
  };

  // Start internal test server
  const server = require('../server');
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(async () => {
    await new Promise(r => server.close(r));
  });

  await t.test('1. GET /api/skills mengembalikan canUpgrade, reason, effectNow, effectNext', async () => {
    const res = await makeReq(`${baseUrl}/api/skills`, {
      method: 'GET',
      headers: authHeaders
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(Array.isArray(res.body.skills));

    const healSkill = res.body.skills.find(s => s.id === 'heal');
    assert.ok(healSkill, 'heal skill exists');
    assert.equal(healSkill.level, 1);
    assert.equal(healSkill.owned, true);
    assert.equal(healSkill.canUpgrade, true);
    assert.equal(healSkill.reason, null);
    assert.ok(healSkill.upgradeCost > 0);
    assert.ok(healSkill.effectNow);
    assert.ok(healSkill.effectNext);

    // Check locked/unowned skill (combo_keeper requires Lv 5)
    const comboSkill = res.body.skills.find(s => s.id === 'combo_keeper');
    assert.ok(comboSkill);
    assert.equal(comboSkill.owned, false);
    assert.equal(comboSkill.canUpgrade, false);
    assert.equal(comboSkill.reason, 'NOT_OWNED');
  });

  await t.test('2. POST /api/skills/:id/upgrade tanpa Idempotency-Key ditolak 400', async () => {
    const res = await makeReq(`${baseUrl}/api/skills/heal/upgrade`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'IDEMPOTENCY_KEY_REQUIRED');
  });

  await t.test('3. POST /api/skills/:id/upgrade skill yang belum dimiliki ditolak 404 SKILL_NOT_OWNED', async () => {
    const res = await makeReq(`${baseUrl}/api/skills/combo_keeper/upgrade`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': uuid()
      }
    });

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'SKILL_NOT_OWNED');
  });

  await t.test('4. Upgrade sukses: level naik, koin terpotong atomik, invarian terjaga', async () => {
    const pBefore = rawDb.prepare('SELECT coins FROM players WHERE id=?').get(playerId);
    const healBefore = rawDb.prepare('SELECT level FROM player_skills WHERE player_id=? AND skill_id=?').get(playerId, 'heal');
    assert.equal(healBefore.level, 1);

    const cost = getSkillUpgradeCost('heal', 1);
    const idemKey = uuid();

    const res = await makeReq(`${baseUrl}/api/skills/heal/upgrade`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': idemKey
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.level, 2);
    assert.equal(res.body.coins, pBefore.coins - cost);
    assert.equal(res.body.skill.level, 2);
    assert.ok(res.body.skill.nextCost);

    // Verify DB state
    const pAfter = rawDb.prepare('SELECT coins FROM players WHERE id=?').get(playerId);
    assert.equal(pAfter.coins, pBefore.coins - cost);
    const healAfter = rawDb.prepare('SELECT level FROM player_skills WHERE player_id=? AND skill_id=?').get(playerId, 'heal');
    assert.equal(healAfter.level, 2);

    assertCoinInvariant();

    // Verify coin_transactions entry
    const lastTx = rawDb.prepare('SELECT * FROM coin_transactions WHERE player_id=? ORDER BY id DESC LIMIT 1').get(playerId);
    assert.equal(lastTx.delta, -cost);
    assert.equal(lastTx.reason, 'SKILL_UPGRADE:heal:2');
    assert.equal(lastTx.balance_aft, pAfter.coins);

    // Duplicate idempotency-key test
    const resDup = await makeReq(`${baseUrl}/api/skills/heal/upgrade`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': idemKey
      }
    });

    assert.equal(resDup.status, 200);
    assert.equal(resDup.body.coins, res.body.coins);
    assert.equal(resDup.body.level, 2);

    // Verify coins were NOT deducted again
    const pAfterDup = rawDb.prepare('SELECT coins FROM players WHERE id=?').get(playerId);
    assert.equal(pAfterDup.coins, pAfter.coins);
    assertCoinInvariant();
  });

  await t.test('5. Koin tidak cukup mengembalikan 422 NOT_ENOUGH_COINS', async () => {
    // Kurangi koin pemain hingga 0
    const pCur = rawDb.prepare('SELECT coins FROM players WHERE id=?').get(playerId);
    rawDb.prepare('UPDATE players SET coins = 0 WHERE id=?').run(playerId);
    rawDb.prepare('INSERT INTO coin_transactions(player_id, amount, delta, reason, balance_aft) VALUES(?, ?, ?, ?, ?)')
      .run(playerId, -pCur.coins, -pCur.coins, 'TEST_DRAIN', 0);
    assertCoinInvariant();

    const res = await makeReq(`${baseUrl}/api/skills/heal/upgrade`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': uuid()
      }
    });

    assert.equal(res.status, 422);
    assert.equal(res.body.error.code, 'NOT_ENOUGH_COINS');

    // Kembalikan koin pemain
    rawDb.prepare('UPDATE players SET coins = 5000 WHERE id=?').run(playerId);
    rawDb.prepare('INSERT INTO coin_transactions(player_id, amount, delta, reason, balance_aft) VALUES(?, 5000, 5000, \'TEST_RESTORE\', 5000)')
      .run(playerId);
    assertCoinInvariant();
  });

  await t.test('6. Upgrade sampai level maksimum (Lv 5) lalu tolak 409 MAX_LEVEL', async () => {
    // Current level is 2, upgrade to 3, 4, 5
    for (let lvl = 2; lvl < 5; lvl++) {
      const res = await makeReq(`${baseUrl}/api/skills/heal/upgrade`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Idempotency-Key': uuid()
        }
      });
      assert.equal(res.status, 200);
      assert.equal(res.body.level, lvl + 1);
    }

    const healMax = rawDb.prepare('SELECT level FROM player_skills WHERE player_id=? AND skill_id=?').get(playerId, 'heal');
    assert.equal(healMax.level, 5);
    assertCoinInvariant();

    // Check GET /api/skills reflects MAX_LEVEL
    const listRes = await makeReq(`${baseUrl}/api/skills`, {
      method: 'GET',
      headers: authHeaders
    });
    const healInList = listRes.body.skills.find(s => s.id === 'heal');
    assert.equal(healInList.level, 5);
    assert.equal(healInList.canUpgrade, false);
    assert.equal(healInList.reason, 'MAX_LEVEL');
    assert.equal(healInList.effectNext, null);
    assert.equal(healInList.upgradeCost, null);

    // Try upgrade again -> 409 MAX_LEVEL
    const resOver = await makeReq(`${baseUrl}/api/skills/heal/upgrade`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': uuid()
      }
    });
    assert.equal(resOver.status, 409);
    assert.equal(resOver.body.error.code, 'MAX_LEVEL');
    assertCoinInvariant();
  });

  await t.test('7. Snapshot loadout sesi battle: sesi aktif pakai level snapshot, sesi baru pakai level upgrade', async () => {
    // Clean any prior in-progress sessions
    rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE player_id=?").run(playerId);

    // Set eagle_eye level to 1
    rawDb.prepare('UPDATE player_skills SET level = 1 WHERE player_id=? AND skill_id=?').run(playerId, 'eagle_eye');

    // Create session A
    const subRow = rawDb.prepare('SELECT id FROM subjects LIMIT 1').get();
    const sessionA = db.startSession(playerId, subRow.id, { totalQuestions: 5 });
    assert.ok(sessionA.sessionId);

    // Parse loadout in session A
    const sADb = rawDb.prepare('SELECT loadout_json FROM game_sessions WHERE id=?').get(sessionA.sessionId);
    const loadoutA = JSON.parse(sADb.loadout_json);
    const eeA = loadoutA.find(s => s.id === 'eagle_eye');
    assert.equal(eeA.level, 1, 'Session A snapshot level is 1');

    // Now upgrade eagle_eye to level 2
    const upgRes = await makeReq(`${baseUrl}/api/skills/eagle_eye/upgrade`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Idempotency-Key': uuid()
      }
    });
    assert.equal(upgRes.status, 200);
    assert.equal(upgRes.body.level, 2);

    // Abandon session A so we can start session B
    rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE id=?").run(sessionA.sessionId);

    // Create session B after upgrade
    const sessionB = db.startSession(playerId, subRow.id, { totalQuestions: 5 });
    const sBDb = rawDb.prepare('SELECT loadout_json FROM game_sessions WHERE id=?').get(sessionB.sessionId);
    const loadoutB = JSON.parse(sBDb.loadout_json);
    const eeB = loadoutB.find(s => s.id === 'eagle_eye');
    assert.equal(eeB.level, 2, 'Session B snapshot level is 2');

    // Verify Session A still has snapshot level 1
    const sADbCheck = rawDb.prepare('SELECT loadout_json FROM game_sessions WHERE id=?').get(sessionA.sessionId);
    const loadoutACheck = JSON.parse(sADbCheck.loadout_json);
    assert.equal(loadoutACheck.find(s => s.id === 'eagle_eye').level, 1, 'Session A maintains snapshot level 1');

    // Finish session B
    rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE id=?").run(sessionB.sessionId);
  });

  await t.test('8. Eliminate_one free uses: Lv3 = 1x gratis, Lv5 = 2x gratis', async () => {
    // Finish any running session
    rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE player_id=?").run(playerId);
    const subRow = rawDb.prepare('SELECT id FROM subjects LIMIT 1').get();

    // Test Lv3: 1 free use
    rawDb.prepare('UPDATE player_skills SET level = 3 WHERE player_id=? AND skill_id=?').run(playerId, 'eliminate_one');
    const sessLv3 = db.startSession(playerId, subRow.id, { totalQuestions: 5 });
    rawDb.prepare('UPDATE game_sessions SET energy = 2 WHERE id=?').run(sessLv3.sessionId);

    // Use eliminate_one first time (free)
    const use1 = db.useSkill(sessLv3.sessionId, playerId, 'eliminate_one');
    assert.equal(use1.ok, true);
    assert.equal(use1.energyLeft, 2, 'First use is free (cost 0), energy stays 2');

    // Use eliminate_one second time (normal cost 1)
    const use2 = db.useSkill(sessLv3.sessionId, playerId, 'eliminate_one');
    assert.equal(use2.ok, true);
    assert.equal(use2.energyLeft, 1, 'Second use costs 1 energy, energy becomes 1');

    // Abandon Lv3 session
    rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE id=?").run(sessLv3.sessionId);

    // Test Lv5: 2 free uses
    rawDb.prepare('UPDATE player_skills SET level = 5 WHERE player_id=? AND skill_id=?').run(playerId, 'eliminate_one');
    const sessLv5 = db.startSession(playerId, subRow.id, { totalQuestions: 5 });
    rawDb.prepare('UPDATE game_sessions SET energy = 2 WHERE id=?').run(sessLv5.sessionId);

    const useLv5_1 = db.useSkill(sessLv5.sessionId, playerId, 'eliminate_one');
    assert.equal(useLv5_1.energyLeft, 2, 'Lv 5: first use free, energy stays 2');

    const useLv5_2 = db.useSkill(sessLv5.sessionId, playerId, 'eliminate_one');
    assert.equal(useLv5_2.energyLeft, 2, 'Lv 5: second use free, energy stays 2');

    // Move to next question for third eliminate_one call (to avoid NOTHING_TO_ELIMINATE on same question)
    rawDb.prepare('UPDATE game_sessions SET current_index = 1 WHERE id=?').run(sessLv5.sessionId);

    const useLv5_3 = db.useSkill(sessLv5.sessionId, playerId, 'eliminate_one');
    assert.equal(useLv5_3.energyLeft, 1, 'Lv 5: third use costs 1 energy, energy becomes 1');

    // Abandon Lv5 session
    rawDb.prepare("UPDATE game_sessions SET status = 'ABANDONED' WHERE id=?").run(sessLv5.sessionId);
  });
});
