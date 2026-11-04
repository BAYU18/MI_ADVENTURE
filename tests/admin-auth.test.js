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

test('Admin Auth & Token Bearer Integration', async (t) => {
  const PORT = 3002;

  await t.test('1. Login dengan admin:admin123 berhasil', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { username: 'admin', password: 'admin123' });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.admin.username, 'admin');
    assert.ok(res.body.token, 'Token harus disertakan');
    assert.ok(res.headers['set-cookie'], 'Set-Cookie harus ada');
  });

  await t.test('2. Login dengan admin:admin12345 berhasil (fallback toleransi)', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { username: 'admin', password: 'admin12345' });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.admin.username, 'admin');
    assert.ok(res.body.token, 'Token harus disertakan');
  });

  await t.test('3. Login dengan kata sandi salah mengembalikan 401 dengan INVALID_CREDENTIALS', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, { username: 'admin', password: 'salah_password_999' });

    assert.equal(res.status, 401);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, 'INVALID_CREDENTIALS');
    assert.equal(res.body.error.message, 'Username atau password admin salah');
  });

  await t.test('4. GET /api/admin/me menggunakan Bearer token berhasil (tanpa cookie)', async () => {
    // Generate valid admin token
    const token = auth.signToken({ type: 'admin', id: 1, username: 'admin' });

    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/me',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.admin.username, 'admin');
    assert.equal(res.body.admin.type, 'admin');
  });

  await t.test('5. GET /api/admin/me tanpa token atau cookie ditolak 401', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/me',
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });
});
