// scripts/smoke-test-v7.js — uji alur v7 lewat HTTP (server harus jalan di BASE).
'use strict';
const BASE = process.env.BASE_URL || 'http://localhost:3002';
const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) {
    pass++;
    console.log('✓ ' + name);
  } else {
    fail++;
    console.log('✗ ' + name, extra ?? '');
  }
};

async function req(path, { method = 'GET', body, cookie } = {}) {
  const r = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = r.headers.get('set-cookie');
  const json = await r.json().catch(() => ({}));
  return { status: r.status, json, cookie: set ? set.split(';')[0] : null };
}

(async () => {
  console.log(`Menjalankan smoke test v7 terhadap ${BASE}...`);

  // Pre-cleanup lingering test friendships
  try {
    const { getDb } = require('../lib/db');
    const db = getDb();
    db.prepare("DELETE FROM friendships WHERE player_id NOT IN (SELECT id FROM players) OR friend_id NOT IN (SELECT id FROM players)").run();
    db.prepare("DELETE FROM friend_requests WHERE from_player_id NOT IN (SELECT id FROM players) OR to_player_id NOT IN (SELECT id FROM players)").run();
    db.prepare("DELETE FROM player_presence WHERE player_id NOT IN (SELECT id FROM players)").run();
    db.prepare("DELETE FROM duels WHERE challenger_id NOT IN (SELECT id FROM players) OR challenged_id NOT IN (SELECT id FROM players)").run();
  } catch (_) {}

  // 1) dua pemain uji
  const A = { nick: 'ujiA_' + stamp, password: 'uji12345' };
  const B = { nick: 'ujiB_' + stamp, password: 'uji12345' };
  const ra = await req('/api/register', { method: 'POST', body: A });
  const rb = await req('/api/register', { method: 'POST', body: B });
  ok('register A', (ra.status === 200 || ra.status === 201) && ra.cookie, ra.json);
  ok('register B', (rb.status === 200 || rb.status === 201) && rb.cookie, rb.json);

  // 2) tambah teman: A cari B, kirim request, B terima
  const s = await req('/api/friends/search?q=' + encodeURIComponent(B.nick), { cookie: ra.cookie });
  ok('search menemukan B', Array.isArray(s.json.results) && s.json.results.some(x => x.nick === B.nick), s.json);
  const rq = await req('/api/friends/request', { method: 'POST', body: { nick: B.nick }, cookie: ra.cookie });
  ok('request terkirim', rq.json.code === 'OK', rq.json);
  const inv = await req('/api/friends', { cookie: rb.cookie });
  const reqId = inv.json.incoming?.[0]?.id;
  ok('B melihat permintaan', !!reqId, inv.json);
  const acc = await req('/api/friends/respond', { method: 'POST', body: { requestId: reqId, action: 'accept' }, cookie: rb.cookie });
  ok('permintaan diterima', acc.json.code === 'OK', acc.json);
  const list = await req('/api/friends', { cookie: ra.cookie });
  ok('A melihat 1 teman', list.json.friends?.length === 1, list.json);

  // 3) presence & aktivitas
  await req('/api/presence/ping', { method: 'POST', body: { activity: 'idle' }, cookie: rb.cookie });
  const l2 = await req('/api/friends', { cookie: ra.cookie });
  ok('teman terlihat online', l2.json.friends?.[0]?.online === true, l2.json.friends);

  // 4) undangan duel
  const sid = (await req('/api/subjects', { cookie: ra.cookie })).json?.subjects?.[0]?.id;
  ok('ada mata pelajaran', !!sid);
  const ch = await req('/api/duels/challenge', { method: 'POST', body: { friendId: list.json.friends[0].id, subjectId: sid }, cookie: ra.cookie });
  ok('undangan duel dibuat', ch.json.code === 'OK' && !!ch.json.duelId, ch.json);

  const iv = await req('/api/duels/invites', { cookie: rb.cookie });
  ok('B melihat undangan', iv.json.invites?.length >= 1, iv.json);
  const accd = await req(`/api/duels/${ch.json.duelId}/respond`, { method: 'POST', body: { action: 'accept' }, cookie: rb.cookie });
  ok('duel dimulai', accd.json.code === 'OK', accd.json);

  // 5) Jawaban duel
  let finished = false, lastPhase = 'NORMAL';
  for (let i = 0; i < 10 && !finished; i++) {
    const st = await req(`/api/duels/${ch.json.duelId}/state`, { cookie: ra.cookie });
    lastPhase = st.json.phase;
    const q = await req(`/api/duels/${ch.json.duelId}/question/${i}`, { cookie: ra.cookie });
    if (!q.json.options) break;
    const ans = await req(`/api/duels/${ch.json.duelId}/answer`, {
      method: 'POST', body: { orderIndex: i, chosenIndex: 0, elapsedMs: 1200 }, cookie: ra.cookie,
    });
    const st2 = await req(`/api/duels/${ch.json.duelId}/state`, { cookie: ra.cookie });
    if (st2.json.status === 'FINISHED') finished = true;
    ok(`jawaban #${i + 1} diterima`, ans.json.code === 'OK', ans.json);
  }
  ok('state akhir dapat dibaca', typeof lastPhase === 'string');

  // 6) history
  const h = await req('/api/friends/history', { cookie: ra.cookie });
  ok('history dapat dibaca', Array.isArray(h.json.history), h.json);

  // Cleanup
  try {
    const { getDb } = require('../lib/db');
    const db = getDb();
    db.prepare('DELETE FROM duels WHERE id=?').run(ch.json.duelId);
    db.prepare("DELETE FROM friendships WHERE player_id NOT IN (SELECT id FROM players) OR friend_id NOT IN (SELECT id FROM players)").run();
    db.prepare("DELETE FROM friend_requests WHERE from_player_id NOT IN (SELECT id FROM players) OR to_player_id NOT IN (SELECT id FROM players)").run();
    db.prepare("DELETE FROM player_presence WHERE player_id NOT IN (SELECT id FROM players)").run();
    db.prepare("DELETE FROM players WHERE nick LIKE 'uji%'").run();
    db.prepare("DELETE FROM friendships WHERE player_id NOT IN (SELECT id FROM players) OR friend_id NOT IN (SELECT id FROM players)").run();
  } catch (_) {}

  console.log(`\n=== SMOKE v7: ${pass} PASS / ${fail} FAIL ===`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
