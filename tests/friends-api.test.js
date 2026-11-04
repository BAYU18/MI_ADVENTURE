// tests/friends-api.test.js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const server = require('../server');
const db = require('../lib/db');

async function api(port, path, { method = 'GET', body, token, cookie } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (cookie) headers['Cookie'] = cookie;

  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  const setCookie = res.headers.get('set-cookie');
  return {
    status: res.status,
    body: json,
    cookie: setCookie ? setCookie.split(';')[0] : null,
  };
}

test('Friends & Presence HTTP API Integration', async (t) => {
  const testServer = http.createServer((req, res) => server.emit('request', req, res));
  await new Promise(r => testServer.listen(0, '127.0.0.1', r));
  const port = testServer.address().port;

  t.after(() => {
    testServer.close();
  });

  const stamp = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  const nickA = 'apiA_' + stamp;
  const nickB = 'apiB_' + stamp;

  // Register two test players via API
  const regA = await api(port, '/api/register', { method: 'POST', body: { nick: nickA, password: 'password123' } });
  assert.equal(regA.status, 200);
  assert.ok(regA.body.token);
  const tokenA = regA.body.token;
  const pA = regA.body.player;

  const regB = await api(port, '/api/register', { method: 'POST', body: { nick: nickB, password: 'password123' } });
  assert.equal(regB.status, 200);
  assert.ok(regB.body.token);
  const tokenB = regB.body.token;
  const pB = regB.body.player;

  const rawDb = db.getDb();
  rawDb.prepare('DELETE FROM player_presence WHERE player_id IN (?, ?)').run(pA.id, pB.id);
  rawDb.prepare('DELETE FROM friendships WHERE player_id IN (?, ?) OR friend_id IN (?, ?)').run(pA.id, pB.id, pA.id, pB.id);

  await t.test('1. Unauthenticated request to /api/friends ditolak 401', async () => {
    const res = await api(port, '/api/friends');
    assert.equal(res.status, 401);
  });

  await t.test('2. Search menemukan user lain', async () => {
    const res = await api(port, `/api/friends/search?q=${encodeURIComponent(nickB.slice(0, 5))}`, { token: tokenA });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.results));
    assert.ok(res.body.results.some(x => x.nick === nickB));
  });

  await t.test('3. Kirim request pertemanan', async () => {
    const res = await api(port, '/api/friends/request', {
      method: 'POST',
      token: tokenA,
      body: { nick: nickB },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 'OK');
  });

  let requestId = null;
  await t.test('4. B melihat permintaan masuk di /api/friends', async () => {
    const res = await api(port, '/api/friends', { token: tokenB });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.incoming));
    assert.equal(res.body.incoming.length, 1);
    assert.equal(res.body.incoming[0].fromId, pA.id);
    requestId = res.body.incoming[0].id;
  });

  await t.test('5. B menerima permintaan pertemanan', async () => {
    const res = await api(port, '/api/friends/respond', {
      method: 'POST',
      token: tokenB,
      body: { requestId, action: 'accept' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.code, 'OK');
  });

  await t.test('6. A & B melihat teman baru dalam daftar', async () => {
    const listA = await api(port, '/api/friends', { token: tokenA });
    assert.equal(listA.status, 200);
    assert.equal(listA.body.friends.length, 1);
    assert.equal(listA.body.friends[0].id, pB.id);

    const listB = await api(port, '/api/friends', { token: tokenB });
    assert.equal(listB.status, 200);
    assert.equal(listB.body.friends.length, 1);
    assert.equal(listB.body.friends[0].id, pA.id);
  });

  await t.test('7. Ping presence menandai status online', async () => {
    const ping = await api(port, '/api/presence/ping', {
      method: 'POST',
      token: tokenB,
      body: { activity: 'battle' },
    });
    assert.equal(ping.status, 200);

    const listA = await api(port, '/api/friends', { token: tokenA });
    assert.equal(listA.body.friends[0].online, true);
    assert.equal(listA.body.friends[0].activity, 'battle');
  });

  await t.test('8. Hapus teman dua arah via DELETE /api/friends/:id', async () => {
    const del = await api(port, `/api/friends/${pB.id}`, {
      method: 'DELETE',
      token: tokenA,
    });
    assert.equal(del.status, 200);

    const listA = await api(port, '/api/friends', { token: tokenA });
    assert.equal(listA.body.friends.length, 0);
    const listB = await api(port, '/api/friends', { token: tokenB });
    assert.equal(listB.body.friends.length, 0);
  });

  // Cleanup
  rawDb.prepare('DELETE FROM friendships WHERE player_id IN (?, ?) OR friend_id IN (?, ?)').run(pA.id, pB.id, pA.id, pB.id);
  rawDb.prepare('DELETE FROM friend_requests WHERE from_player_id IN (?, ?) OR to_player_id IN (?, ?)').run(pA.id, pB.id, pA.id, pB.id);
  rawDb.prepare('DELETE FROM player_presence WHERE player_id IN (?, ?)').run(pA.id, pB.id);
  rawDb.prepare('DELETE FROM players WHERE id IN (?, ?)').run(pA.id, pB.id);
});
