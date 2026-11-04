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

test('Admin Create Class (Tambah Kelas Baru)', async (t) => {
  const PORT = 3002;
  const adminToken = auth.signToken({ type: 'admin', id: 1, username: 'admin' });

  await t.test('1. POST /api/admin/classes tanpa autentikasi admin ditolak 401', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/classes',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { name: 'Kelas Ilegal' });

    assert.equal(res.status, 401);
  });

  await t.test('2. POST /api/admin/classes dengan nama kosong ditolak 400', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/classes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { name: '   ' });

    assert.equal(res.status, 400);
  });

  await t.test('3. POST /api/admin/classes berhasil membuat kelas baru dengan sort_order', async () => {
    const className = 'Kelas Test ' + Date.now();
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/classes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { name: className, sortOrder: 50 });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.class.name, className);
    assert.equal(res.body.class.sort_order, 50);
    assert.ok(res.body.class.id > 0);

    // Verify in db
    const row = db.getDb().prepare('SELECT * FROM classes WHERE id=?').get(res.body.class.id);
    assert.ok(row);
    assert.equal(row.name, className);
  });

  await t.test('4. POST /api/admin/classes dengan copyFromClassId menyalin mapel aktif', async () => {
    // We know class_id = 1 has subjects
    const className = 'Kelas Kloning ' + Date.now();
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/classes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { name: className, sortOrder: 55, copyFromClassId: 1 });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    const newClassId = res.body.class.id;

    // Check subjects copied to newClassId
    const subjects = db.getDb().prepare('SELECT * FROM subjects WHERE class_id=?').all(newClassId);
    assert.ok(subjects.length > 0, 'Mata pelajaran harus tersalin');
    assert.ok(subjects.some(s => s.name === 'Matematika'));
  });
});
