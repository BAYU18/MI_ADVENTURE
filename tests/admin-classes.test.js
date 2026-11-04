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

  await t.test('5. DELETE /api/admin/classes tanpa autentikasi admin ditolak 401', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/classes?id=999',
      method: 'DELETE',
    });
    assert.equal(res.status, 401);
  });

  await t.test('6. DELETE /api/admin/classes tanpa ID ditolak 400', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/classes',
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert.equal(res.status, 400);
  });

  await t.test('7. DELETE /api/admin/classes berhasil menghapus kelas beserta relasinya', async () => {
    // Create a temporary class to delete
    const tempName = 'Kelas Hapus Test ' + Date.now();
    const createRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/classes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { name: tempName, sortOrder: 99 });
    const classId = createRes.body.class.id;
    assert.ok(classId > 0);

    // Delete it
    const delRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/admin/classes?id=${classId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert.equal(delRes.status, 200);
    assert.equal(delRes.body.ok, true);

    // Verify it is gone from db
    const row = db.getDb().prepare('SELECT * FROM classes WHERE id=?').get(classId);
    assert.equal(row, undefined);
  });

  await t.test('8. POST /api/admin/subjects tanpa autentikasi admin ditolak 401', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/subjects',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { classId: 1, name: 'Pelajaran Ilegal' });
    assert.equal(res.status, 401);
  });

  await t.test('9. POST /api/admin/subjects tanpa nama atau classId ditolak 400', async () => {
    const res1 = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/subjects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { classId: 1, name: '   ' });
    assert.equal(res1.status, 400);

    const res2 = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/subjects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { name: 'Pelajaran Tanpa Kelas' });
    assert.equal(res2.status, 400);
  });

  await t.test('10. POST /api/admin/subjects berhasil membuat mata pelajaran baru', async () => {
    const subjName = 'Astronomi ' + Date.now();
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/subjects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      classId: 1,
      name: subjName,
      icon: '🌌',
      color: '#6366f1',
      monsterTheme: 'langit',
      questionCount: 15,
      timeLimitSec: 25,
      grade: 4
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.subject.name, subjName);
    assert.equal(res.body.subject.icon, '🌌');
    assert.equal(res.body.subject.monster_theme, 'langit');
    const subjId = res.body.subject.id;
    assert.ok(subjId > 0);

    // Verify in db
    const row = db.getDb().prepare('SELECT * FROM subjects WHERE id=?').get(subjId);
    assert.ok(row);
    assert.equal(row.name, subjName);
    assert.equal(row.class_id, 1);
  });

  await t.test('11. DELETE /api/admin/subjects tanpa autentikasi admin ditolak 401', async () => {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/subjects?id=999',
      method: 'DELETE',
    });
    assert.equal(res.status, 401);
  });

  await t.test('12. DELETE /api/admin/subjects berhasil menghapus mata pelajaran beserta soalnya', async () => {
    // Create temporary subject
    const subjName = 'Subjek Hapus Test ' + Date.now();
    const createRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/admin/subjects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { classId: 1, name: subjName, icon: '🧪' });
    const subjId = createRes.body.subject.id;
    assert.ok(subjId > 0);

    // Add a question to this subject
    db.getDb().prepare(`
      INSERT INTO questions (subject_id, text, options_json, answer_index, explanation, difficulty, hash)
      VALUES (?, 'Soal Hapus?', '["A","B"]', 0, 'Penjelasan', 1, 'testhash${Date.now()}')
    `).run(subjId);

    // Delete subject
    const delRes = await makeRequest({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/admin/subjects?id=${subjId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert.equal(delRes.status, 200);
    assert.equal(delRes.body.ok, true);

    // Verify subject and question are gone
    const subjRow = db.getDb().prepare('SELECT * FROM subjects WHERE id=?').get(subjId);
    assert.equal(subjRow, undefined);
    const qCount = db.getDb().prepare('SELECT count(*) as c FROM questions WHERE subject_id=?').get(subjId);
    assert.equal(qCount.c, 0);
  });
});
