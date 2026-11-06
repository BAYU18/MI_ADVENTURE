'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const db = require('../lib/db');
const auth = require('../lib/auth');

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = {};
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body: json, rawBody: data });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

test('Admin Economy & Coin Drop Rates (T-61)', async (t) => {
  const PORT = 3002;
  const adminToken = auth.signToken({ type: 'admin', id: 1, username: 'admin' });

  // 1. Auth check
  await t.test('1. GET /api/admin/economy tanpa autentikasi admin ditolak 401', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/economy',
      method: 'GET'
    });
    assert.equal(res.status, 401);
  });

  // 2. Fetch default config
  await t.test('2. GET /api/admin/economy berhasil mengambil konfigurasi & default', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/economy',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.ok(res.body.config);
    assert.ok(res.body.defaults);
    assert.equal(res.body.defaults.boss.baseCoins, 10);
    assert.equal(res.body.defaults.starter.registerCoins, 100);
  });

  // 3. Save custom economy config
  await t.test('3. POST /api/admin/economy berhasil menyimpan custom config', async () => {
    const customCfg = {
      ...db.DEFAULT_ECONOMY_CONFIG,
      boss: {
        ...db.DEFAULT_ECONOMY_CONFIG.boss,
        baseCoins: 25,
        phase2BonusPct: 20
      },
      starter: {
        registerCoins: 250
      },
      dailyCoinCap: 500
    };

    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/economy',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { config: customCfg });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.config.boss.baseCoins, 25);
    assert.equal(res.body.config.boss.phase2BonusPct, 20);
    assert.equal(res.body.config.starter.registerCoins, 250);
    assert.equal(res.body.config.dailyCoinCap, 500);

    // Verifikasi di DB
    const current = db.getEconomyConfig();
    assert.equal(current.boss.baseCoins, 25);
    assert.equal(current.starter.registerCoins, 250);
  });

  // 4. Adjust all by % (e.g. +20%)
  await t.test('4. POST /api/admin/economy/adjust (+20%) menaikkan seluruh nilai koin', async () => {
    // Current baseCoins is 25 -> 25 * 1.20 = 30
    // Current starter is 250 -> 250 * 1.20 = 300
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/economy/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { percent: 20 });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.config.boss.baseCoins, 30);
    assert.equal(res.body.config.starter.registerCoins, 300);
    assert.equal(res.body.config.dailyCoinCap, 600);
  });

  // 5. Adjust all by % (e.g. -10%)
  await t.test('5. POST /api/admin/economy/adjust (-10%) menurunkan seluruh nilai koin', async () => {
    // Current baseCoins is 30 -> 30 * 0.90 = 27
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/economy/adjust',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { percent: -10 });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.config.boss.baseCoins, 27);
  });

  // 6. Reset to default
  await t.test('6. POST /api/admin/economy/reset mengembalikan config ke nilai bawaan', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/economy/reset',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.config.boss.baseCoins, 10);
    assert.equal(res.body.config.starter.registerCoins, 100);
    assert.equal(res.body.config.dailyCoinCap, 300);

    const afterReset = db.getEconomyConfig(true);
    assert.equal(afterReset.boss.baseCoins, 10);
    assert.equal(afterReset.starter.registerCoins, 100);
  });

  // 7. Dynamic coin effect on registration
  await t.test('7. Registrasi akun baru memberikan starter coins sesuai config aktif', async () => {
    // Simpan custom starter coins = 175
    db.saveEconomyConfig({
      ...db.DEFAULT_ECONOMY_CONFIG,
      starter: { registerCoins: 175 }
    });

    const testNick = 'eco_test_' + Date.now().toString(36);
    const p = db.registerPlayer(testNick, 'password123', 1);
    assert.equal(p.coins, 175, 'Player baru harus mendapat 175 starter koin');

    // Reset kembali ke default & bersihkan akun tes
    db.saveEconomyConfig(null);
    db.getDb().prepare('DELETE FROM players WHERE id=?').run(p.id);
  });
});
