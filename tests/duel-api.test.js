// tests/duel-api.test.js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const server = require('../server');
const db = require('../lib/db');

async function api(port, path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

test('Duel HTTP API Integration', async (t) => {
  const testServer = http.createServer((req, res) => server.emit('request', req, res));
  await new Promise(r => testServer.listen(0, '127.0.0.1', r));
  const port = testServer.address().port;

  let pA = null;
  let pB = null;
  let duelId = null;

  t.after(() => {
    testServer.close();
    if (pA?.id && pB?.id) {
      const rawDb = db.getDb();
      if (duelId) rawDb.prepare('DELETE FROM duels WHERE id=?').run(duelId);
      rawDb.prepare('DELETE FROM friendships WHERE player_id IN (?, ?) OR friend_id IN (?, ?)').run(pA.id, pB.id, pA.id, pB.id);
      rawDb.prepare('DELETE FROM friend_requests WHERE from_player_id IN (?, ?) OR to_player_id IN (?, ?)').run(pA.id, pB.id, pA.id, pB.id);
      rawDb.prepare('DELETE FROM players WHERE id IN (?, ?)').run(pA.id, pB.id);
    }
  });

  const stamp = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  const nickA = 'duelA_' + stamp;
  const nickB = 'duelB_' + stamp;

  // Register two test players
  const regA = await api(port, '/api/register', { method: 'POST', body: { nick: nickA, password: 'password123' } });
  assert.equal(regA.status, 200);
  const tokenA = regA.body.token;
  pA = regA.body.player;

  const regB = await api(port, '/api/register', { method: 'POST', body: { nick: nickB, password: 'password123' } });
  assert.equal(regB.status, 200);
  const tokenB = regB.body.token;
  pB = regB.body.player;

  // Make them friends
  const reqFriend = await api(port, '/api/friends/request', { method: 'POST', token: tokenA, body: { nick: nickB } });
  assert.equal(reqFriend.body.code, 'OK');
  const inv = await api(port, '/api/friends', { token: tokenB });
  const reqId = inv.body.incoming[0].id;
  await api(port, '/api/friends/respond', { method: 'POST', token: tokenB, body: { requestId: reqId, action: 'accept' } });

  // Get active subject
  const subRes = await api(port, '/api/subjects', { token: tokenA });
  let sid = subRes.body.subjects?.[0]?.id;
  if (!sid) {
    const rawDb = db.getDb();
    sid = rawDb.prepare('SELECT id FROM subjects LIMIT 1').get()?.id;
  }

  await t.test('1. A menantang B via POST /api/duels/challenge', async () => {
    const res = await api(port, '/api/duels/challenge', {
      method: 'POST',
      token: tokenA,
      body: { friendId: pB.id, subjectId: sid },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 'OK');
    assert.ok(res.body.duelId);
    duelId = res.body.duelId;
  });

  await t.test('2. B melihat undangan di GET /api/duels/invites', async () => {
    const res = await api(port, '/api/duels/invites', { token: tokenB });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.invites));
    assert.ok(res.body.invites.some(x => x.id === duelId));
  });

  await t.test('3. B menerima tantangan via POST /api/duels/:id/respond', async () => {
    const res = await api(port, `/api/duels/${duelId}/respond`, {
      method: 'POST',
      token: tokenB,
      body: { action: 'accept' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 'OK');
  });

  await t.test('4. GET /api/duels/active menunjukkan duel yang sedang berjalan', async () => {
    const res = await api(port, '/api/duels/active', { token: tokenA });
    assert.equal(res.status, 200);
    assert.equal(res.body.active?.id, duelId);
    assert.equal(res.body.active?.status, 'ACTIVE');
  });

  await t.test('5. GET /api/duels/:id/state memuat status awal tanpa membocorkan kunci', async () => {
    const res = await api(port, `/api/duels/${duelId}/state`, { token: tokenA });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ACTIVE');
    assert.equal(res.body.phase, 'NORMAL');
    assert.equal(res.body.challenger.hp, 100);
    assert.equal(res.body.challenged.hp, 100);
    assert.equal(res.body.you, 'challenger');
    assert.ok(res.body.normalEndsAt);
    assert.ok(res.body.serverTime);
    assert.equal(res.body.answer_index, undefined); // Anti-cheat
  });

  await t.test('6. GET /api/duels/:id/question/:idx memuat opsi soal', async () => {
    const res = await api(port, `/api/duels/${duelId}/question/0`, { token: tokenA });
    assert.equal(res.status, 200);
    assert.equal(res.body.orderIndex, 0);
    assert.ok(res.body.text);
    assert.ok(Array.isArray(res.body.options));
    assert.equal(res.body.answer_index, undefined); // Anti-cheat
  });

  await t.test('7. POST /api/duels/:id/answer submit jawaban', async () => {
    const res = await api(port, `/api/duels/${duelId}/answer`, {
      method: 'POST',
      token: tokenA,
      body: { orderIndex: 0, chosenIndex: 0, elapsedMs: 1500 },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 'OK');
    assert.equal(typeof res.body.isCorrect, 'boolean');
  });

  await t.test('8. POST /api/duels/:id/skill menggunakan skill heal', async () => {
    const res = await api(port, `/api/duels/${duelId}/skill`, {
      method: 'POST',
      token: tokenB,
      body: { skillId: 'heal', skillLv: 1, orderIndex: 0 },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 'OK');
    assert.equal(res.body.skill, 'heal');
  });

  await t.test('9. POST /api/duels/:id/reconnect memperbarui heartbeat', async () => {
    const res = await api(port, `/api/duels/${duelId}/reconnect`, {
      method: 'POST',
      token: tokenA,
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 'OK');
  });

  await t.test('10. POST /api/duels/:id/forfeit mengakhiri duel dan memberi reward', async () => {
    const res = await api(port, `/api/duels/${duelId}/forfeit`, {
      method: 'POST',
      token: tokenA,
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 'OK');

    // State harus FINISHED
    const st = await api(port, `/api/duels/${duelId}/state`, { token: tokenA });
    assert.equal(st.body.status, 'FINISHED');
  });

  await t.test('11. GET /api/friends/history memuat riwayat duel', async () => {
    const res = await api(port, '/api/friends/history?limit=10', { token: tokenA });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.history));
    assert.ok(res.body.history.some(x => x.id === duelId));
  });
});
