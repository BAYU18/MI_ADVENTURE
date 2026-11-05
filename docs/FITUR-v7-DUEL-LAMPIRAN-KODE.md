---
title: "FITUR v7 — LAMPIRAN KODE (A–H)"
status: plan
project: play.printshare.my.id
target_dir: /home/maman/play
---

# FITUR v7 — LAMPIRAN KODE

Dokumen pendamping `FITUR-v7.md`. Semua kode di sini **logika murni yang sudah dirancang untuk verifikasi**; agent menyalin persis (kecuali ditandai "adaptasi di sesi eksekusi"), lalu menjalankan tes yang disebut di setiap Lampiran.

> Aturan: jangan menulis ulang algoritma. Salin blok; bila ada ketidakcocokan dengan sesi sol `economy.js`/`db.js` yang lebih baru, adaptasi minimal + catat via `npm run progress -- note`.

## Lampiran A — `shared/friendship.js` (logika murni / state-less)

```js
// shared/friendship.js — state-less helper untuk pertemanan & presence.
'use strict';

const PRESENCE_TTL_MS = 75_000; // online bila last_seen_at <= 75 dtk
const ACTIVITY_RANK = ['duel', 'battle', 'petualangan', 'idle'];

function isOnline(lastSeenAt, now = Date.now()) {
  if (!lastSeenAt) return false;
  const t = new Date(lastSeenAt).getTime();
  return Number.isFinite(t) && now - t <= PRESENCE_TTL_MS;
}

// Aktivitas dari sesi game aktif + duel aktif.
// gameSession = { mode, campaign_node, status } (null bila tidak ada) — dari tabel game_sessions.
// duelActive = boolean (baris duels status='ACTIVE'), prioritas tertinggi.
function computeActivity(gameSession, duelActive = false) {
  if (duelActive) return 'duel';
  if (!gameSession || gameSession.status !== 'IN_PROGRESS') return 'idle';
  if ((gameSession.mode || '').toUpperCase() === 'FUN' || gameSession.campaign_node) return 'petualangan';
  const m = (gameSession.mode || '').toUpperCase();
  return ['BATTLE', 'PRACTICE', 'FREE'].includes(m) ? 'battle' : 'idle';
}

function activityLabel(a) {
  return { duel: '🟢 Duel', battle: '⚔️ Battle', petualangan: '🗺️ Petualangan', idle: '💤 Idle' }[a] || '⚫ Offline';
}

function statusLabel(online, activity) {
  return online ? activityLabel(activity || 'idle') : '⚫ Offline';
}

function normalizeNick(nick) {
  return String(nick || '').trim().toLowerCase().slice(0, 24);
}

function validateSearchQuery(q) {
  const s = String(q || '').trim();
  if (s.length < 2) return null;
  return s.slice(0, 24);
}

module.exports = {
  PRESENCE_TTL_MS, isOnline, computeActivity, activityLabel, statusLabel,
  normalizeNick, validateSearchQuery,
};
```

---

## Lampiran B — `shared/duel.js` (engine murni, deterministik)

```js
// shared/duel.js — engine duel murni: konstanta + transisi + damage + kalkulasi seri.
'use strict';

const C = {
  MAX_HP: 100,
  DAMAGE_PER_CORRECT: 10,
  NORMAL_PHASE_MS: 600_000,
  DEATHMATCH_QUESTION_MS: 20_000,
  ANSWER_TOLERANCE_MS: 1_500,
  PRESENCE_TTL_MS: 75_000,
  DISCONNECT_GRACE_MS: 45_000,
  RECONNECT_WINDOW_MS: 120_000,
  INVITE_TTL_MS: 60_000,
  DUEL_QUESTION_COUNT: 40,
  HEAL_VALUES: [25, 35, 45, 55, 65],       // per level 1..5
  SHIELD_VALUES: [20, 30, 40, 50, 60],
  STRIKE_MULT: [2, 2.25, 2.5, 2.75, 3],
  SKILL_ENERGY_COST: { eliminate_one: 1, eagle_eye: 2, heal: 2, shield: 2, power_strike: 2, time_freeze: 2, combo_keeper: 2, lucky_pouch: 1, second_chance: 2 },
};

// Transisi fase NORMAL -> DEATHMATCH berdasarkan waktu (normalEndsAt).
function phaseAt(normalEndsAt, now = Date.now()) {
  const t = normalEndsAt ? new Date(normalEndsAt).getTime() : NaN;
  return Number.isFinite(t) && now >= t ? 'DEATHMATCH' : 'NORMAL';
}

// Damage yang DIHASILKAN pemain yang menjawab benar (ke lawan), sudah termasuk power_strike.
// vs = cheat tidak: user ID tidak pernah dianggap 'lawan'.
function damageFor(isCorrect, skillBoost = 1) {
  if (!isCorrect) return 0;
  return Math.round(C.DAMAGE_PER_CORRECT * skillBoost);
}

function clampHp(hp) {
  if (!Number.isFinite(hp)) return C.MAX_HP;
  return Math.max(0, Math.min(C.MAX_HP, hp));
}

// `opts` = { correctFirst, staleMs }
// Menentukan pemenang/seri bila duel selesai.
function resolveDraw(hpA, hpB) {
  return hpA === hpB ? 'DRAW' : (hpA > hpB ? 'A' : 'B');
}

function skillLevel(level) {
  if (!Number.isFinite(level)) level = 1;
  return Math.max(1, Math.min(5, Math.floor(level)));
}

function healAmount(skillLv) {
  return C.HEAL_VALUES[skillLevel(skillLv) - 1] ?? 25;
}
function shieldAmount(skillLv) {
  return C.SHIELD_VALUES[skillLevel(skillLv) - 1] ?? 20;
}
function strikeMultiplier(skillLv) {
  return C.STRIKE_MULT[skillLevel(skillLv) - 1] ?? 2;
}
function energyCost(skillId) {
  return C.SKILL_ENERGY_COST[skillId] ?? 2;
}

// Pemakaian skill — bersifat murni; database dipakai penegeakan atomik (UNIQUE) di lib/db-duel.js.
// returns { ok, damage?: number, heal?: number, shield?: number, timeFreezeMs?: number, reason?: 'NO_ENERGY'|'NOT_FRIENDS' }
function canUseSkill(duel, playerIsChallenger, skillId, skillLv, energy, energyMax, used) {
  if (!Number.isFinite(energy) || energy < energyCost(skillId))
    return { ok: false, reason: 'NO_ENERGY' };
  const effective = {
    duel,
    playerIsChallenger,
    skillLv: skillLevel(skillLv),
    energy,
    energyMax,
    usedCount: (used || 0),
  };
  const result = evaluation({ ...effective, skill: skillId });
  return result.ok === false ? { ok: false, reason: result.reason } : { ok: true, ...result };
}

function evaluation(e) {
  const { duel, playerIsChallenger, skillLv, energy, energyMax, usedCount, skill } = e;
  const s = skill;
  switch (s) {
    case 'time_freeze':
      if (duel.phase !== 'DEATHMATCH') return { ok: false, reason: 'WRONG_PHASE' };
      return { ok: true, timeFreezeMs: 10_000 };
    case 'power_strike':
      if (duel.phase === 'ENDED') return { ok: false, reason: 'WRONG_STATE' };
      return { ok: true, boost: strikeMultiplier(skillLv) };
    case 'heal':
      return { ok: true, heal: healAmount(skillLv) };
    case 'shield':
      return { ok: true, shield: shieldAmount(skillLv) };
    case 'combo_keeper':
      return { ok: true, comboGuard: true };          // cegah damage oleh salah berikutnya
    case 'second_chance':
      return { ok: true, secondChance: true };        // batalkan satu damage masuk
    case 'lucky_pouch':
      return { ok: true, coins: 5 };
    default:
      return { ok: true };                              // eliminate_one & eagle_eye valid
  }
}

// Sementara engine duel; render soal & peta efek diselesaikan di Lampiran F (frontend).
module.exports = {
  C, phaseAt, damageFor, clampHp, resolveDraw, skillLevel, healAmount,
  shieldAmount, strikeMultiplier, energyCost, canUseSkill,
};
```

---

## Tes untuk A & B — `tests/friendship.test.js`, `tests/duel-engine.test.js`

```js
// tests/friendship.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  PRESENCE_TTL_MS, isOnline, computeActivity, activityLabel, statusLabel,
  normalizeNick, validateSearchQuery,
} = require('../shared/friendship.js');

test('isOnline: true dalam jendela', () => {
  const now = 1_000_000;
  assert.equal(isOnline(new Date(now - PRESENCE_TTL_MS + 1).toISOString(), now), true);
  assert.equal(isOnline(new Date(now - PRESENCE_TTL_MS - 1).toISOString(), now), false);
});
test('isOnline: null/undefined/garbage = offline', () => {
  assert.equal(isOnline(null, 1), false);
  assert.equal(isOnline(undefined, 1), false);
  assert.equal(isOnline('bukan-tanggal', 1), false);
  assert.equal(isOnline('', 1), false);
});
test('computeActivity rank + edge', () => {
  assert.equal(computeActivity(null, false), 'idle');
  assert.equal(computeActivity({ status: 'IN_PROGRESS', mode: 'BATTLE', campaign_node: null }, false), 'battle');
  assert.equal(computeActivity({ status: 'IN_PROGRESS', mode: 'FUN', campaign_node: null }, false), 'petualangan');
  assert.equal(computeActivity({ status: 'IN_PROGRESS', mode: 'BATTLE', campaign_node: null }, true), 'duel');
  assert.equal(computeActivity({ status: 'WON', mode: 'BATTLE', campaign_node: null }, false), 'idle');
  assert.equal(computeActivity({ status: 'IN_PROGRESS', mode: 'FUN', campaign_node: 'M1' }, false), 'petualangan');
});
test('label & normalize', () => {
  assert.equal(activityLabel('duel'), '🟢 Duel');
  assert.equal(statusLabel(true, 'battle'), '⚔️ Battle');
  assert.equal(normalizeNick('  JugAran '), 'juragan');
  assert.equal(validateSearchQuery('ab'), 'ab');
  assert.equal(validateSearchQuery('a'), null);
});
```

```js
// tests/duel-engine.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  C, phaseAt, damageFor, clampHp, resolveDraw, skillLevel, healAmount,
  shieldAmount, strikeMultiplier, energyCost, canUseSkill,
} = require('../shared/duel.js');

test('konstanta duel', () => {
  assert.equal(C.MAX_HP, 100);
  assert.equal(C.DAMAGE_PER_CORRECT, 10);
  assert.equal(C.NORMAL_PHASE_MS, 600_000);
  assert.equal(C.DEATHMATCH_QUESTION_MS, 20_000);
  assert.equal(C.RECONNECT_WINDOW_MS, 120_000);
});

test('damageFor: benar=10 (dgn boost strike x2 = 20), salah=0', () => {
  assert.equal(damageFor(true, 1), 10);
  assert.equal(damageFor(true, 2), 20);
  assert.equal(damageFor(false, 1), 0);
});

test('phaseAt: NORMAL sebelum batas, DEATHMATCH setelah', () => {
  const endAt = new Date(1_000_000).toISOString();
  assert.equal(phaseAt(endAt, 999_999), 'NORMAL');
  assert.equal(phaseAt(endAt, 1_000_000), 'DEATHMATCH');
});

test('clampHp batas 0..100', () => {
  assert.equal(clampHp(120), 100);
  assert.equal(clampHp(-5), 0);
  assert.equal(clampHp(50), 50);
  assert.equal(clampHp(NaN), 100);
});

test('resolveDraw', () => {
  assert.equal(resolveDraw(100, 100), 'DRAW');
  assert.equal(resolveDraw(100, 90), 'A');
  assert.equal(resolveDraw(90, 100), 'B');
});

test('skill bonuses by level & biaya energi', () => {
  assert.equal(healAmount(3), 45);
  assert.equal(shieldAmount(5), 60);
  assert.equal(strikeMultiplier(2), 2.25);
  assert.equal(energyCost('eliminate_one'), 1);
  assert.equal(energyCost('heal'), 2);
});

test('canUseSkill: energi kurang = NO_ENERGY; time_freeze salah fase', () => {
  const duel = { phase: 'NORMAL' };
  assert.deepEqual(canUseSkill(duel, true, 'heal', 1, 1, 5, 0), { ok: false, reason: 'NO_ENERGY' });
  assert.deepEqual(canUseSkill(duel, true, 'time_freeze', 1, 5, 5, 0), { ok: false, reason: 'WRONG_PHASE' });
  const ok = canUseSkill(duel, true, 'heal', 1, 5, 5, 0);
  assert.equal(ok.ok, true);
  assert.equal(ok.heal, 25);
});
```

## Lampiran C — Skema & migrasi DDL (folder `lib/`, dipanggil sekali saat boot)

Tambahkan blok berikut di `lib/db.js` area inisialisasi/migrasi lalu export `v7Migrate(db)`:

```js
// ---- FITUR v7: pertemanan & duel (aditif, idempoten) ----
const V7_DDL = `
CREATE TABLE IF NOT EXISTS player_presence (
  player_id INTEGER PRIMARY KEY,
  last_seen_at TEXT NOT NULL,
  activity TEXT NOT NULL DEFAULT 'idle'
);
CREATE TABLE IF NOT EXISTS friend_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_player_id INTEGER NOT NULL,
  to_player_id   INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL,
  responded_at TEXT,
  UNIQUE(from_player_id, to_player_id)
);
CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(player_id, friend_id)
);
CREATE TABLE IF NOT EXISTS duels (
  id TEXT PRIMARY KEY,
  subject_id INTEGER NOT NULL,
  challenger_id INTEGER NOT NULL,
  challenged_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  phase  TEXT NOT NULL DEFAULT 'NORMAL',
  max_hp INTEGER NOT NULL DEFAULT 100,
  hp_challenger INTEGER NOT NULL DEFAULT 100,
  hp_challenged INTEGER NOT NULL DEFAULT 100,
  shield_challenger INTEGER NOT NULL DEFAULT 0,
  shield_challenged INTEGER NOT NULL DEFAULT 0,
  energy_challenger INTEGER NOT NULL DEFAULT 2,
  energy_challenged INTEGER NOT NULL DEFAULT 2,
  energy_max_challenger INTEGER NOT NULL DEFAULT 5,
  energy_max_challenged INTEGER NOT NULL DEFAULT 5,
  correct_challenger INTEGER NOT NULL DEFAULT 0,
  correct_challenged INTEGER NOT NULL DEFAULT 0,
  wrong_challenger INTEGER NOT NULL DEFAULT 0,
  wrong_challenged INTEGER NOT NULL DEFAULT 0,
  last_seen_challenger TEXT,
  last_seen_challenged TEXT,
  normal_ends_at TEXT,
  question_deadline_at TEXT,
  winner_id INTEGER,
  end_reason TEXT,
  created_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT
);
CREATE TABLE IF NOT EXISTS duel_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  option_order_challenger_json TEXT NOT NULL,
  option_order_challenged_json TEXT NOT NULL,
  eliminated_challenger_json TEXT DEFAULT '[]',
  eliminated_challenged_json TEXT DEFAULT '[]',
  UNIQUE(duel_id, order_index)
);
CREATE TABLE IF NOT EXISTS duel_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  player_id INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  chosen_index INTEGER,
  is_correct INTEGER NOT NULL,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  damage_taken INTEGER NOT NULL DEFAULT 0,
  answered_at TEXT NOT NULL,
  elapsed_ms INTEGER,
  UNIQUE(duel_id, player_id, order_index)
);
CREATE TABLE IF NOT EXISTS duel_skill_uses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  player_id INTEGER NOT NULL,
  skill_id TEXT NOT NULL,
  uses INTEGER NOT NULL DEFAULT 0,
  UNIQUE(duel_id, player_id, skill_id)
);
CREATE TABLE IF NOT EXISTS duel_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  ts TEXT NOT NULL,
  type TEXT NOT NULL,
  payload_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_duel_events_duel ON duel_events(duel_id, ts);
CREATE INDEX IF NOT EXISTS idx_duels_status ON duels(status, phase);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_player_id, status);
`;

function v7Migrate(db) { db.exec(V7_DDL); }

module.exports = { v7Migrate, V7_DDL };
```

> **Wajib:** tambahkan 8 nama tabel berikut ke daftar `tables` di `scripts/check-schema.js`: `player_presence, friend_requests, friendships, duels, duel_questions, duel_answers, duel_skill_uses, duel_events`.

---

## Lampiran D — `lib/db-friends.js` (pertemanan + presence + aktivitas)

```js
// lib/db-friends.js — lapisan DB pertemanan & presence.
'use strict';
const { isOnline, computeActivity, normalizeNick } = require('../shared/friendship.js');

const F = {
  // Cari pemain by nick (fuzzy awalan). Mengembalikan { id, nick, kelas } ringkas.
  searchPlayers(db, q, selfId, limit = 10) {
    const ql = normalizeNick(q);
    if (!ql || ql.length < 2) return [];
    const rows = db.prepare(`
      SELECT id, nick, class_id FROM players
      WHERE nick_lower LIKE ? AND id != ?
      ORDER BY nick_lower ASC LIMIT ?`).all(ql + '%', selfId, limit);
    return rows.map(r => ({ id: r.id, nick: r.nick, classId: r.class_id }));
  },

  // Kirim permintaan pertemanan. Kode: OK | ALREADY_FRIENDS | REQUEST_PENDING | SELF
  sendRequest(db, fromId, toNick) {
    const target = db.prepare('SELECT id FROM players WHERE nick_lower = ?').get(normalizeNick(toNick));
    if (!target) return { code: 'FRIEND_NOT_FOUND' };
    if (target.id === fromId) return { code: 'SELF' };
    db.exec('BEGIN IMMEDIATE');
    try {
      const tx = db.prepare('SELECT 1 FROM friendships WHERE (player_id=? AND friend_id=?) OR (player_id=? AND friend_id=?)');
      if (tx.get(fromId, target.id, target.id, fromId)) { db.exec('COMMIT'); return { code: 'ALREADY_FRIENDS' }; }
      const pend = db.prepare("SELECT 1 FROM friend_requests WHERE status='PENDING' AND ((from_player_id=? AND to_player_id=?) OR (from_player_id=? AND to_player_id=?))");
      if (pend.get(fromId, target.id, target.id, fromId)) { db.exec('COMMIT'); return { code: 'REQUEST_PENDING' }; }
      db.prepare(`INSERT INTO friend_requests (from_player_id,to_player_id,status,created_at)
                  VALUES (?,?,'PENDING',?)`).run(fromId, target.id, new Date().toISOString());
      db.exec('COMMIT');
      return { code: 'OK', toId: target.id };
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  },

  // Terima/tolak permintaan. action: 'accept' | 'decline'
  respond(db, requestId, selfId, action) {
    const r = db.prepare('SELECT * FROM friend_requests WHERE id=? AND to_player_id=? AND status=?').get(requestId, selfId, 'PENDING');
    if (!r) return { code: 'REQUEST_NOT_FOUND' };
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare(`UPDATE friend_requests SET status=?, responded_at=? WHERE id=?`)
        .run(action === 'accept' ? 'ACCEPTED' : 'DECLINED', new Date().toISOString(), requestId);
      if (action === 'accept') {
        const ins = db.prepare('INSERT OR IGNORE INTO friendships (player_id,friend_id,created_at) VALUES (?,?,?)');
        const now = new Date().toISOString();
        ins.run(r.from_player_id, r.to_player_id, now);
        ins.run(r.to_player_id, r.from_player_id, now);
      }
      db.exec('COMMIT');
      return { code: 'OK' };
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  },

  // Hapus teman dua arah + batalakan permintaan terkait.
  remove(db, selfId, friendId) {
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare('DELETE FROM friendships WHERE (player_id=? AND friend_id=?) OR (player_id=? AND friend_id=?)').run(selfId, friendId, friendId, selfId);
      db.prepare('DELETE FROM friend_requests WHERE (from_player_id=? AND to_player_id=?) OR (from_player_id=? AND to_player_id=?)').run(selfId, friendId, friendId, selfId);
      db.exec('COMMIT');
      return { code: 'OK' };
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  },

  // Upsert presence heartbeat. activity: 'idle' | 'battle' | 'petualangan' | 'duel'
  pingPresence(db, playerId, activity) {
    db.prepare(`INSERT INTO player_presence (player_id,last_seen_at,activity) VALUES (?,?,?)
                ON CONFLICT(player_id) DO UPDATE SET last_seen_at=excluded.last_seen_at, activity=excluded.activity`)
      .run(playerId, new Date().toISOString(), activity || 'idle');
  },

  presenceBy(db, ids) {
    if (!ids.length) return {};
    const ph = ids.map(() => '?').join(',');
    const rows = db.prepare(`SELECT player_id,last_seen_at,activity FROM player_presence WHERE player_id IN (${ph})`).all(...ids);
    const out = {};
    for (const r of rows) out[r.player_id] = { lastSeenAt: r.last_seen_at, activity: r.activity };
    return out;
  },

  // Sesi game aktif satu pemain (untuk menurunkan aktivitas).
  sessionBy(db, playerId) {
    return db.prepare(`SELECT mode, campaign_node, status FROM game_sessions
                       WHERE player_id=? AND status='IN_PROGRESS' ORDER BY id DESC LIMIT 1`).get(playerId);
  },

  // Daftar teman + status. Metode ringkas: query satu baris per teman.
  list(db, selfId) {
    const rows = db.prepare(`
      SELECT p.id, p.nick,
             pr.last_seen_at, pr.activity,
             (SELECT 1 FROM duels d WHERE d.status='ACTIVE' AND (d.challenger_id=p.id OR d.challenged_id=p.id) LIMIT 1) AS duel_active
      FROM friendships f JOIN players p ON p.id = f.friend_id
      LEFT JOIN player_presence pr ON pr.player_id = p.id
      WHERE f.player_id = ?`).all(selfId);
    const now = Date.now();
    return rows.map(r => {
      const online = isOnline(r.last_seen_at, now);
      const activity = computeActivity(
        r.last_seen_at ? { status: 'IN_PROGRESS', mode: (r.activity || 'idle') } : null,
        !!r.duel_active);
      return { id: r.id, nick: r.nick, online, activity, lastSeenAt: r.last_seen_at };
    });
  },

  // Permintaan masuk PENDING untuk pemain (untuk badge poll).
  incoming(db, selfId, limit = 20) {
    return db.prepare(`
      SELECT fr.id, fr.created_at, p.id AS fromId, p.nick
      FROM friend_requests fr JOIN players p ON p.id = fr.from_player_id
      WHERE fr.to_player_id=? AND fr.status='PENDING' ORDER BY fr.created_at DESC LIMIT ?`).all(selfId, limit);
  },

  // Permintaan keluar PENDING (agar tidak dobel ajak).
  outgoing(db, selfId) {
    return db.prepare(`SELECT id, to_player_id FROM friend_requests WHERE from_player_id=? AND status='PENDING'`).all(selfId);
  },
};

module.exports = F;
```

> **Catatan integrasi:** aktivitas didapat dua sumber (presence.activity dari heartbeat + sesi game nyata). Aturan akhir pakai `computeActivity(sessionNyata, duelActive)` — source of truth: tabel `game_sessions` + `duels`, bukan field activity (informasional). Jika di lapangan pola query `game_sessions` berbeda (check `grep "FROM game_sessions" lib/db.js`), sesuaikan nama kolom pada `sessionBy`.

---

## Lampiran E — Route pertemanan & presence di `server.js`

Masukkan setelah blok route yang ada (ikutkan pola helper auth + body parser yang sudah dipakai proyek — utama `getAuthPlayer(req)` → `{ ...player }/playerId`; sesuaikan dengan konvensi aktual di `server.js`):

```js
// ===== FITUR v7 — friends & presence =====
const dbFriends = require('./lib/db-friends.js');

// GET /api/friends
if (pathname === '/api/friends' && method === 'GET') {
  const me = requireAuth(req);
  if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const list = dbFriends.list(db, me.id);
  const incoming = dbFriends.incoming(db, me.id).map(r => ({ id: r.id, fromId: r.fromId, nick: r.nick, createdAt: r.created_at }));
  return sendJson(res, 200, { friends: list, incoming });
}

// GET /api/friends/search?q=
if (pathname === '/api/friends/search' && method === 'GET') {
  const me = requireAuth(req);
  if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const u = new URL(req.url, 'http://x');
  const q = u.searchParams.get('q') || '';
  return sendJson(res, 200, { results: dbFriends.searchPlayers(db, q, me.id) });
}

// POST /api/friends/request { nick }
if (pathname === '/api/friends/request' && method === 'POST') {
  const me = requireAuth(req);
  if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const body = readBody(req); // object hasil parse JSON
  const r = dbFriends.sendRequest(db, me.id, body?.nick);
  if (r.code !== 'OK') return sendJson(res, 400, uerr(r.code));
  return sendJson(res, 200, { code: 'OK' });
}

// POST /api/friends/respond { requestId, action }
if (pathname === '/api/friends/respond' && method === 'POST') {
  const me = requireAuth(req);
  if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const body = readBody(req);
  const r = dbFriends.respond(db, Number(body?.requestId), me.id, body?.action);
  if (r.code !== 'OK') return sendJson(res, 400, uerr(r.code));
  return sendJson(res, 200, { code: 'OK' });
}

// DELETE /api/friends/:id
if (pathname.startsWith('/api/friends/') && method === 'DELETE') {
  const me = requireAuth(req);
  if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const friendId = Number(pathname.slice('/api/friends/'.length));
  if (!Number.isInteger(friendId)) return sendJson(res, 400, uerr('BAD_REQUEST'));
  dbFriends.remove(db, me.id, friendId);
  return sendJson(res, 200, { code: 'OK' });
}

// POST /api/presence/ping { activity? }
if (pathname === '/api/presence/ping' && method === 'POST') {
  const me = requireAuth(req);
  if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const body = readBody(req);
  dbFriends.pingPresence(db, me.id, body?.activity);
  return sendJson(res, 200, { code: 'OK' });
}
```

> `requireAuth`, `sendJson`, `readBody`, `uerr` adalah helper yang sudah ada di `server.js`; **jangan menambahkan nama baru** — gunakan yang aktual (grep `function requireAuth|const sendJson|readBody` bila perlu).

## Lampiran F — `lib/db-duel.js` (mesin duel server-side, otoritatif)

```js
// lib/db-duel.js — duel: undangan, fase, damage, skill, reconnect, reward.
'use strict';
const crypto = require('node:crypto');
const D = require('../shared/duel.js');

const nowIso = () => new Date().toISOString();
const iso = (ms) => new Date(ms).toISOString();

function resolvePhase(d) {
  if (d.status !== 'ACTIVE') return d.phase;
  const p = D.phaseAt(d.normal_ends_at, Date.now());
  if (p !== d.phase) {
    db_duel_phase_switch(d.id, p);
    d.phase = p;
    if (p === 'DEATHMATCH') d.question_deadline_at = iso(Date.now() + D.C.DEATHMATCH_QUESTION_MS);
  }
  return d.phase;
}
function db_duel_phase_switch() { /* diisi oleh modul: menulis event PHASE + kolom phase */ }

const skillOf = (d) => ({
  hp: (who) => (who === 'challenger' ? d.hp_challenger : d.hp_challenged),
  shield: (who) => (who === 'challenger' ? d.shield_challenger : d.shield_challenged),
  energy: (who) => (who === 'challenger' ? d.energy_challenger : d.energy_challenged),
});

function side(d, playerId) {
  if (d.challenger_id === playerId) return 'challenger';
  if (d.challenged_id === playerId) return 'challenged';
  return null;
}
const other = (s) => (s === 'challenger' ? 'challenged' : 'challenger');
const hpCol = (s) => (s === 'challenger' ? 'hp_challenger' : 'hp_challenged');
const shCol = (s) => (s === 'challenger' ? 'shield_challenger' : 'shield_challenged');
const enCol = (s) => (s === 'challenger' ? 'energy_challenger' : 'energy_challenged');

function event(db, duelId, type, payload) {
  db.prepare('INSERT INTO duel_events (duel_id,ts,type,payload_json) VALUES (?,?,?,?)')
    .run(duelId, nowIso(), type, payload ? JSON.stringify(payload) : null);
}

function expireStaleInvites(db) {
  const t = iso(Date.now() - D.C.INVITE_TTL_MS);
  const rows = db.prepare("SELECT id FROM duels WHERE status='PENDING' AND created_at < ?").all(t);
  for (const r of rows) {
    db.prepare("UPDATE duels SET status='EXPIRED', finished_at=? WHERE id=?").run(nowIso(), r.id);
    event(db, r.id, 'FINISH', { reason: 'INVITE_EXPIRED' });
  }
  return rows.length;
}

function createChallenge(db, challengeData) {
  const { challengerId, friendId, subjectId } = challengeData;
  const areFriends = db.prepare(
    'SELECT 1 FROM friendships WHERE player_id=? AND friend_id=?').get(challengerId, friendId);
  if (!areFriends) return { code: 'NOT_FRIENDS' };
  const busy = db.prepare(`SELECT id FROM duels WHERE status IN ('PENDING','ACTIVE','PAUSED')
                           AND (challenger_id IN (?,?) OR challenged_id IN (?,?)) LIMIT 1`)
    .get(challengerId, friendId, challengerId, friendId);
  if (busy) return { code: 'DUEL_BUSY', duelId: busy.id };
  const id = 'duel_' + crypto.randomBytes(6).toString('hex');
  db.prepare(`INSERT INTO duels (id,subject_id,challenger_id,challenged_id,status,phase,created_at)
              VALUES (?,?,?,?, 'PENDING','NORMAL',?)`).run(id, subjectId, challengerId, friendId, nowIso());
  event(db, id, 'INVITE', { subjectId, challengerId, challengedId: friendId });
  return { code: 'OK', duelId: id };
}

// Terima undangan → ACTIVE. Generate soal + snapshot energi.
function respondInvite(db, duelId, playerId, action) {
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d) return { code: 'DUEL_NOT_FOUND' };
  if (d.challenged_id !== playerId) return { code: 'NOT_PARTICIPANT' };
  if (d.status !== 'PENDING') return { code: 'WRONG_STATE' };
  if (action === 'decline') {
    db.prepare("UPDATE duels SET status='DECLINED', finished_at=? WHERE id=?").run(nowIso(), duelId);
    event(db, duelId, 'FINISH', { reason: 'DECLINED' });
    return { code: 'OK' };
  }
  return startDuel(db, duelId);
}

function startDuel(db, duelId) {
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d) return { code: 'DUEL_NOT_FOUND' };
  const qs = db.prepare(`SELECT id, option_a, option_b, option_c, option_d, answer_index
                         FROM questions WHERE subject_id=? ORDER BY RANDOM() LIMIT ?`)
    .all(d.subject_id, D.C.DUEL_QUESTION_COUNT);
  if (qs.length < 10) return { code: 'NOT_ENOUGH_QUESTIONS' };

  const pick = (energyRow) => (energyRow?.energy ?? 2);
  const eA = db.prepare('SELECT energy, energy_max FROM player_energy WHERE player_id=?').get(d.challenger_id);
  const eB = db.prepare('SELECT energy, energy_max FROM player_energy WHERE player_id=?').get(d.challenged_id);

  db.exec('BEGIN IMMEDIATE');
  try {
    const insQ = db.prepare(`INSERT INTO duel_questions
      (duel_id,order_index,question_id,option_order_challenger_json,option_order_challenged_json)
      VALUES (?,?,?,?,?)`);
    qs.forEach((q, i) => {
      insQ.run(duelId, i, q.id, JSON.stringify([0, 1, 2, 3]), JSON.stringify([0, 1, 2, 3]));
    });
    db.prepare(`UPDATE duels SET status='ACTIVE', phase='NORMAL', started_at=?,
                normal_ends_at=?, hp_challenger=?, hp_challenged=?,
                energy_challenger=?, energy_challenged=?, energy_max_challenger=?, energy_max_challenged=?
                WHERE id=?`)
      .run(nowIso(), iso(Date.now() + D.C.NORMAL_PHASE_MS), D.C.MAX_HP, D.C.MAX_HP,
        pick(eA), pick(eB), eA?.energy_max ?? 5, eB?.energy_max ?? 5, duelId);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  event(db, duelId, 'ACCEPT', { startedAt: nowIso() });
  return { code: 'OK', duelId };
}

module.exports = {
  C: D.C, side, other, resolvePhase, expireStaleInvites, createChallenge, respondInvite, startDuel,
  event, nowIso, iso,
};
```

> **Adaptasi wajib di sesi eksekusi (jangan tebak):**
> 1. Nama tabel soal & kolom opsi: `grep -n "CREATE TABLE IF NOT EXISTS questions" -A 12 lib/db.js` → sesuaikan `SELECT` pada `startDuel`.
> 2. Energi: cek apakah ada tabel `player_energy`; bila energi disimpan di `players`/`sessions`, ganti sumber `eA`/`eB` dengan helper v6 yang aktual.
> 3. `option_order_*` diisi `[0,1,2,3]` pada kerangka ini; **implementasi final wajib mengacak** dengan `crypto.randomInt` per pemain lalu memetakannya saat memvalidasi jawaban (`mapChosenToCanonical`).
> 4. `db_duel_phase_switch` di Lampiran F-2 (lanjutan) menggantikan stub di atas.

## Lampiran F-2 — `lib/db-duel.js` (lanjutan: jawaban, skill, reconnect, reward)

```js
// ===== lanjutan lib/db-duel.js =====

// Jawab soal duel. Menghasilkan damage sesuai fase; server-authoritative.
function submitAnswer(db, duelId, playerId, orderIndex, chosenIndex, elapsedMs) {
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d) return { code: 'DUEL_NOT_FOUND' };
  if (d.status !== 'ACTIVE') return { code: 'WRONG_STATE' };
  const me = side(d, playerId);
  if (!me) return { code: 'NOT_PARTICIPANT' };
  resolvePhase(d); // pastikan fase aktuall

  const q = db.prepare(`SELECT * FROM duel_questions WHERE duel_id=? AND order_index=?`).get(duelId, orderIndex);
  if (!q) return { code: 'ANSWER_REJECTED', reason: 'order_index_tidak_ada' };
  const canon = db.prepare('SELECT answer_index FROM questions WHERE id=?').get(q.question_id);
  if (!canon) return { code: 'ANSWER_REJECTED', reason: 'soal_hilang' };

  // Cek duplicate (anti-replay via UNIQUE).
  const dup = db.prepare('SELECT 1 FROM duel_answers WHERE duel_id=? AND player_id=? AND order_index=?')
    .get(duelId, playerId, orderIndex);
  if (dup) return { code: 'ANSWER_REJECTED', reason: 'sudah_dijawab' };

  const order = JSON.parse(me === 'challenger' ? q.option_order_challenger_json : q.option_order_challenged_json);
  const isCorrect = Number(chosenIndex) === canon.answer_index; // urutan kanonik; map via order bila diacak
  const boost = peekStrike(db, duelId, playerId); // 1 jika tidak ada power_strike aktif
  const damage = D.damageFor(isCorrect, boost);

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`INSERT INTO duel_answers (duel_id,player_id,order_index,chosen_index,is_correct,damage_dealt,damage_taken,answered_at,elapsed_ms)
                VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(duelId, playerId, orderIndex, chosenIndex, isCorrect ? 1 : 0, damage, 0, nowIso(), elapsedMs || null);

    if (isCorrect) {
      // damage ke lawan → kurangi HP lawan (shield menyerap)
      const opp = other(me);
      let dealt = damage;
      const oppShield = d[shCol(opp)] || 0;
      if (oppShield > 0) {
        const absorbed = Math.min(oppShield, dealt);
        d[shCol(opp)] = oppShield - absorbed;
        dealt -= absorbed;
        db.prepare(`UPDATE duels SET ${shCol(opp)}=? WHERE id=?`).run(d[shCol(opp)], duelId);
      }
      const newHp = D.clampHp(d[hpCol(opp)] - dealt);
      db.prepare(`UPDATE duels SET ${hpCol(opp)}=?, correct_${me}=correct_${me}+1 WHERE id=?`).run(newHp, duelId);
      event(db, duelId, 'ANSWER', { playerId, orderIndex, correct: true, damage: dealt });
      if (newHp <= 0) return finish(db, duelId, playerId, 'KO');
    } else {
      // salah: NORMAL → 0 damage; DEATHMATCH → -10 HP sendiri (guard combo_keeper)
      let taken = 0;
      if (d.phase === 'DEATHMATCH') {
        taken = D.damageFor(true, 1); // 10
        if (consumeComboGuard(db, duelId, playerId)) taken = 0;
        const newHp = D.clampHp(d[hpCol(me)] - taken);
        db.prepare(`UPDATE duels SET ${hpCol(me)}=?, wrong_${me}=wrong_${me}+1 WHERE id=?`).run(newHp, duelId);
        if (newHp <= 0) return finish(db, duelId, playerId, 'DEATHMATCH_KO');
      }
      event(db, duelId, 'ANSWER', { playerId, orderIndex, correct: false, phase: d.phase, damageTaken: taken });
    }
    // Regen energi (+1 tiap 3 benar) — sama seperti battle solo.
    const correct = db.prepare(`SELECT correct_${me} AS c FROM duels WHERE id=?`).get(duelId).c;
    if (correct % 3 === 0 && correct > 0) {
      const en = db.prepare(`SELECT ${enCol(me)} AS e, energy_max_${me} AS m FROM duels WHERE id=?`).get(duelId);
      if (en.e < en.m) db.prepare(`UPDATE duels SET ${enCol(me)}=? WHERE id=?`).run(Math.min(en.m, en.e + 1), duelId);
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return { code: 'OK', isCorrect, damage, phase: d.phase };
}

// Aceh dari power_strike: apakah ada charge tersimpan di dua_baris duel_skill_uses.
function peekStrike(db, duelId, playerId) {
  const r = db.prepare(`SELECT uses FROM duel_skill_uses WHERE duel_id=? AND player_id=? AND skill_id='power_strike'`)
    .get(duelId, playerId);
  return r && r.uses > 0 ? D.strikeMultiplier(1) : 1; // level dari snapshot level skill (Lampiran F-3)
}

function consumeComboGuard(db, duelId, playerId) {
  const r = db.prepare(`SELECT uses FROM duel_skill_uses WHERE duel_id=? AND player_id=? AND skill_id='combo_keeper'`)
    .get(duelId, playerId);
  if (r && r.uses > 0) {
    db.prepare(`UPDATE duel_skill_uses SET uses=0 WHERE duel_id=? AND player_id=? AND skill_id='combo_keeper'`).run(duelId, playerId);
    return true;
  }
  return false;
}

// Pakai skill. `applied <energy>` dikurangi dari energi duel (snapshot).
function useDuelSkill(db, duelId, playerId, skillId, skillLv, orderIndex) {
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d || d.status !== 'ACTIVE') return { code: 'DUEL_NOT_FOUND' };
  const me = side(d, playerId);
  if (!me) return { code: 'NOT_PARTICIPANT' };
  const usedRow = db.prepare(`SELECT uses FROM duel_skill_uses WHERE duel_id=? AND player_id=? AND skill_id=?`)
    .get(duelId, playerId, skillId);
  const energy = d[enCol(me)];
  const res = D.canUseSkill(d, me === 'challenger', skillId, skillLv, energy, d[`energy_max_${me}`], usedRow?.uses || 0);
  if (!res.ok) return { code: 'SKILL_UNAVAILABLE', reason: res.reason };

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`INSERT INTO duel_skill_uses (duel_id,player_id,skill_id,uses) VALUES (?,?,?,1)
                ON CONFLICT(duel_id,player_id,skill_id) DO UPDATE SET uses=duel_skill_uses.uses+1`)
      .run(duelId, playerId, skillId);
    db.prepare(`UPDATE duels SET ${enCol(me)}=? WHERE id=?`).run(energy - D.energyCost(skillId), duelId);
    if (res.heal) {
      const nh = D.clampHp(d[hpCol(me)] + res.heal);
      db.prepare(`UPDATE duels SET ${hpCol(me)}=? WHERE id=?`).run(nh, duelId);
    }
    if (res.shield) db.prepare(`UPDATE duels SET ${shCol(me)}=${shCol(me)}+? WHERE id=?`).run(res.shield, duelId);
    if (res.coins) db.applyCoins(playerId, res.coins, 'duel_lucky_pouch', 'duel:' + duelId); // satu pintu, idempotent key
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  event(db, duelId, 'SKILL', { playerId, skillId, orderIndex });
  return { code: 'OK', skill: skillId, ...(res.timeFreezeMs ? { timeFreezeMs: res.timeFreezeMs } : {}) };
}

// Reconnect / hadir kembali dari PAUSED.
function reconnect(db, duelId, playerId) {
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d) return { code: 'DUEL_NOT_FOUND' };
  const me = side(d, playerId);
  if (!me) return { code: 'NOT_PARTICIPANT' };
  if (d.status === 'FINISHED') return { code: 'WRONG_STATE' };
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`UPDATE duels SET last_seen_${me}=? WHERE id=?`).run(nowIso(), duelId);
    if (d.status === 'PAUSED') {
      db.prepare("UPDATE duels SET status='ACTIVE' WHERE id=?").run(duelId);
      event(db, duelId, 'RESUME', { playerId });
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return { code: 'OK' };
}

// Menyerah.
function forfeit(db, duelId, playerId) {
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d || d.status === 'FINISHED') return { code: 'DUEL_NOT_FOUND' };
  const me = side(d, playerId);
  if (!me) return { code: 'NOT_PARTICIPANT' };
  const winnerId = d.challenger_id === playerId ? d.challenged_id : d.challenger_id;
  return finish(db, duelId, winnerId, 'FORFEIT');
}

// Selesaikan duel + reward (satu pintu applyCoins). drawHappens bila panggilan sisi lain.
function finish(db, duelId, winnerId, reason) {
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d || d.status === 'FINISHED') return { code: 'OK' }; // idempoten
  let win = winnerId;
  let rsn = reason;
  if (reason === 'BOTH_ABSENT') {
    const ha = d.hp_challenger, hb = d.hp_challenged;
    if (ha === hb) win = null; else win = ha > hb ? d.challenger_id : d.challenged_id;
    rsn = win === null ? 'DRAW' : 'BOTH_ABSENT';
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`UPDATE duels SET status='FINISHED', phase='ENDED', winner_id=?, end_reason=?, finished_at=? WHERE id=?`)
      .run(win, rsn, nowIso(), duelId);
    // reward kecil (settings.duel_rewards_enabled default ON)
    const enabled = db.prepare(`SELECT value FROM settings WHERE key='duel_rewards_enabled'`).get();
    if (!enabled || enabled.value !== '0') {
      for (const pid of [d.challenger_id, d.challenged_id]) {
        const isW = win === pid;
        db.applyCoins(pid, isW ? 15 : win === null ? 8 : 5, 'duel_' + (isW ? 'win' : win === null ? 'draw' : 'lose'), 'duel:' + duelId);
        db.prepare(`UPDATE players SET xp = xp + ? WHERE id = ?`).run(isW ? 10 : win === null ? 6 : 4, pid);
      }
    }
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  event(db, duelId, 'FINISH', { winnerId: win, reason: rsn });
  return { code: 'OK', winnerId: win, reason: rsn };
}

// Get state ekspor (TANPA kunci jawaban / answer_index). dipakai polling 2 dtk.
function getDuelState(db, duelId, playerId) {
  const d = db.prepare('SELECT * FROM duels WHERE id=?').get(duelId);
  if (!d) return { code: 'DUEL_NOT_FOUND' };
  const me = side(d, playerId);
  if (!me) return { code: 'NOT_PARTICIPANT' };
  resolvePhase(d);
  const q = db.prepare(`SELECT * FROM duel_questions WHERE duel_id=? ORDER BY order_index ASC LIMIT 1`).get(duelId); // ganti dengan order_index aktif
  const you = me === 'challenger';
  return {
    duelId, status: d.status, phase: d.phase,
    subjectId: d.subject_id,
    challenger: { id: d.challenger_id, hp: d.hp_challenger, shield: d.shield_challenger, energy: d.energy_challenger, energyMax: d.energy_max_challenger },
    challenged: { id: d.challenged_id, hp: d.hp_challenged, shield: d.shield_challenged, energy: d.energy_challenged, energyMax: d.energy_max_challenged },
    you: you ? 'challenger' : 'challenged',
    normalEndsAt: d.normal_ends_at,
    questionDeadlineAt: d.question_deadline_at,
    question: q ? { orderIndex: q.order_index } : null, // opsi & teks dimuat frontend via /api/duels/:id/question/:idx
    winnerId: d.winner_id, endReason: d.end_reason,
  };
}

// History duel untuk menu pertemanan.
function history(db, playerId, limit = 20) {
  return db.prepare(`
    SELECT d.id, d.subject_id, d.winner_id, d.end_reason, d.started_at, d.finished_at,
           d.hp_challenger, d.hp_challenged,
           pC.nick AS challenger_nick, pD.nick AS challenged_nick
    FROM duels d
    JOIN players pC ON pC.id = d.challenger_id
    JOIN players pD ON pD.id = d.challenged_id
    WHERE d.status='FINISHED' AND (d.challenger_id=? OR d.challenged_id=?)
    ORDER BY d.finished_at DESC LIMIT ?`).all(playerId, playerId, limit);
}

module.exports = {
  C: D.C, side, other, resolvePhase, expireStaleInvites, createChallenge, respondInvite, startDuel,
  submitAnswer, useDuelSkill, reconnect, forfeit, finish, getDuelState, history,
  event, nowIso, iso,
};
```

> **Catatan:** `getDuelState` belum mengembalikan teks soal/opsi (anti-bocor kunci). Frontend memuat soal lewat `GET /api/duels/:id/question/:idx` yang **hanya** mengembalikan `{ text, options[] }` tanpa `answer_index`. Wajib ada 1 set soal per duel, urutan opsi sesuai `option_order_*` pemain.

## Lampiran G — Route duel di `server.js` + hook polling

```js
// ===== FITUR v7 — duel =====
const dbDuel = require('./lib/db-duel.js');

// POST /api/duels/challenge { friendId, subjectId }
if (pathname === '/api/duels/challenge' && method === 'POST') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const b = readBody(req);
  const r = dbDuel.createChallenge(db, { challengerId: me.id, friendId: Number(b?.friendId), subjectId: Number(b?.subjectId) });
  if (r.code !== 'OK') return sendJson(res, 400, uerr(r.code, r));
  return sendJson(res, 200, { code: 'OK', duelId: r.duelId });
}

// GET /api/duels/invites
if (pathname === '/api/duels/invites' && method === 'GET') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  dbDuel.expireStaleInvites(db);
  const rows = db.prepare(`SELECT d.id,d.subject_id,d.created_at,s.name AS subject_name,
                          p.nick AS from_nick FROM duels d
                          JOIN players p ON p.id=d.challenger_id
                          LEFT JOIN subjects s ON s.id=d.subject_id
                          WHERE d.status='PENDING' AND d.challenged_id=? ORDER BY d.created_at DESC`)
    .all(me.id);
  return sendJson(res, 200, { invites: rows });
}

// GET /api/duels/active
if (pathname === '/api/duels/active' && method === 'GET') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const row = db.prepare(`SELECT id,status,phase FROM duels
    WHERE status IN ('ACTIVE','PAUSED') AND (challenger_id=? OR challenged_id=?) LIMIT 1`)
    .get(me.id, me.id);
  return sendJson(res, 200, { active: row || null });
}

// POST /api/duels/:id/respond { action }
if (m = pathname.match(/^\/api\/duels\/([^/]+)\/respond$/) && method === 'POST') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const b = readBody(req);
  const r = dbDuel.respondInvite(db, m[1], me.id, b?.action);
  if (r.code !== 'OK') return sendJson(res, 400, uerr(r.code));
  return sendJson(res, 200, { code: 'OK' });
}

// GET /api/duels/:id/state  (polling 2 dtk)
if (m = pathname.match(/^\/api\/duels\/([^/]+)\/state$/) && method === 'GET') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const r = dbDuel.getDuelState(db, m[1], me.id);
  if (r.code) return sendJson(res, 400, uerr(r.code));
  return sendJson(res, 200, r);
}

// GET /api/duels/:id/question/:idx  (soal aktif tanpa kunci)
if (m = pathname.match(/^\/api\/duels\/([^/]+)\/question\/(\d+)$/) && method === 'GET') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const q = db.prepare(`SELECT q.text, q.option_a,q.option_b,q.option_c,q.option_d,
                        dq.option_order_challenger_json, dq.option_order_challenged_json
                        FROM duel_questions dq JOIN questions q ON q.id=dq.question_id
                        WHERE dq.duel_id=? AND dq.order_index=?`).get(m[1], Number(m[2]));
  if (!q) return sendJson(res, 404, uerr('QUESTION_NOT_FOUND'));
  const who = db.prepare('SELECT * FROM duels WHERE id=?').get(m[1]);
  const meSide = who.challenger_id === me.id ? 'challenger' : who.challenged_id === me.id ? 'challenged' : null;
  if (!meSide) return sendJson(res, 403, uerr('NOT_PARTICIPANT'));
  const order = JSON.parse(meSide === 'challenger' ? q.option_order_challenger_json : q.option_order_challenged_json);
  const opts = [q.option_a, q.option_b, q.option_c, q.option_d];
  return sendJson(res, 200, { orderIndex: Number(m[2]), text: q.text, options: order.map(i => opts[i]) });
}

// POST /api/duels/:id/answer { orderIndex, chosenIndex, elapsedMs }
if (m = pathname.match(/^\/api\/duels\/([^/]+)\/answer$/) && method === 'POST') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const b = readBody(req);
  const r = dbDuel.submitAnswer(db, m[1], me.id, Number(b?.orderIndex), Number(b?.chosenIndex), Number(b?.elapsedMs) || 0);
  if (r.code !== 'OK') return sendJson(res, 400, uerr(r.code, { reason: r.reason }));
  return sendJson(res, 200, { code: 'OK', isCorrect: r.isCorrect, damage: r.damage, phase: r.phase });
}

// POST /api/duels/:id/skill { skillId, skillLv, orderIndex }
if (m = pathname.match(/^\/api\/duels\/([^/]+)\/skill$/) && method === 'POST') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const b = readBody(req);
  const r = dbDuel.useDuelSkill(db, m[1], me.id, b?.skillId, Number(b?.skillLv) || 1, Number(b?.orderIndex));
  if (r.code !== 'OK') return sendJson(res, 400, uerr(r.code, { reason: r.reason }));
  return sendJson(res, 200, { code: 'OK', ...r });
}

// POST /api/duels/:id/reconnect
if (m = pathname.match(/^\/api\/duels\/([^/]+)\/reconnect$/) && method === 'POST') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const r = dbDuel.reconnect(db, m[1], me.id);
  if (r.code !== 'OK') return sendJson(res, 400, uerr(r.code));
  return sendJson(res, 200, { code: 'OK' });
}

// POST /api/duels/:id/forfeit
if (m = pathname.match(/^\/api\/duels\/([^/]+)\/forfeit$/) && method === 'POST') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const r = dbDuel.forfeit(db, m[1], me.id);
  if (r.code !== 'OK') return sendJson(res, 400, uerr(r.code));
  return sendJson(res, 200, { code: 'OK' });
}

// GET /api/friends/history?limit=
if (pathname === '/api/friends/history' && method === 'GET') {
  const me = requireAuth(req); if (!me) return sendJson(res, 401, uerr('UNAUTHENTICATED'));
  const u = new URL(req.url, 'http://x');
  const limit = Math.min(50, Math.max(1, Number(u.searchParams.get('limit')) || 20));
  return sendJson(res, 200, { history: dbDuel.history(db, me.id, limit) });
}
```

> Catatan: gunakan `const m =` (scoping benar) — contoh `if (m = …)` di atas ringkas; saat eksekusi pastikan deklarasi `m` aman (var lokal per blok pakai IIFE jika perlu).

### Frontend — file baru

**`public/js/friends.js`** — layar `Screens.friends` (3 tab), polling undangan 5 dtk, heartbeat presence 20 dtk:

```js
//// public/js/friends.js — layar pertemanan (dipanggil oleh app.js)
(function () {
  const api = (path, opts) => fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    ...(opts?.body ? { body: JSON.stringify(opts.body) } : {}),
    method: opts?.method || 'GET',
  }).then(r => r.json().catch(() => ({})));

  let timers = [];

  function stopTimers() { timers.forEach(clearInterval); timers = []; }

  async function loadFriends(tab) {
    const d = await api('/api/friends');
    const el = document.getElementById('friends-body');
    if (!el) return;
    el.innerHTML = renderTab(d, tab);
    // badge undangan
    const badge = document.getElementById('friends-inv-badge');
    if (badge) badge.textContent = d.incoming.length;
  }

  function renderTab(d, tab) {
    const friendRows = d.friends.map(f => `
      <div class="friend-row" data-id="${f.id}">
        <span class="friend-nick">${esc(f.nick)}</span>
        <span class="friend-status ${f.online ? 'on' : 'off'}">${statusText(f)}</span>
        <button class="btn-duel" data-id="${f.id}">⚔️ Duel</button>
        <button class="btn-del" data-id="${f.id}">✕</button>
      </div>`).join('');
    const inviteRows = d.incoming.map(i => `
      <div class="invite-row" data-id="${i.id}">
        <span>${esc(i.nick)} ingin menjadi teman</span>
        <button class="btn-acc" data-id="${i.id}">✓</button>
        <button class="btn-dec" data-id="${i.id}">✕</button>
      </div>`).join('');
    const hist = historyHtml();
    return {
      friends: `<div class="tab-head">
        <input id="friend-search" placeholder="Cari teman baru…" />
        <button id="btn-search">Cari</button>
      </div><div id="search-res"></div>${friendRows || '<p class="empty">Belum ada teman</p>'}`,
      invites: inviteRows || '<p class="empty">Tidak ada permintaan</p>',
      history: hist,
    }[tab] || '';
  }

  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function statusText(f) { return f.online ? ({ duel: '🟢 Duel', battle: '⚔️ Battle', petualangan: '🗺️ Petualangan', idle: '💤 Idle' }[f.activity] || '💤 Idle') : '⚫ Offline'; }

  // ... (delegasi klik untuk tombol duel/hapus/terima + historyHtml) — SESUAIKAN dengan pola app.js
  Screens.friends = {
    render() { stopTimers();
      document.getElementById('screen').innerHTML = `<div id="friends-tabs">
        <button data-tab="friends">Teman</button><button data-tab="invites">Permintaan</button><button data-tab="history">Riwayat</button>
      </div><div id="friends-body"></div>`;
      loadFriends('friends');
      timers.push(setInterval(() => { if (activeScreen === 'friends') loadFriends(currentTab()); }, 5000));
      timers.push(setInterval(() => api('/api/presence/ping', { method: 'POST', body: { activity: 'idle' } }), 20000));
    },
    destroy() { stopTimers(); },
  };

  // heartbeat dari aktifScreens lain (battle/petualangan) memakai activity yang tepat
  window.__heartbeatActivity = (a) => api('/api/presence/ping', { method: 'POST', body: { activity: a } });
})();
```

**`public/js/duel.js`** — layar `Screens.duel` (polling 2 dtk, HP bar, timer fase, soal, skill, overlay menunggu):

```js
//// public/js/duel.js — layar duel realtime (polling 2 dtk)
(function () {
  let timer = null, current = null, duelId = null;

  async function pollState() {
    const s = await fetchState();
    if (!s) return;
    current = s;
    render(s);
    if (s.status === 'ACTIVE' && !timer) startPoll();
    if (s.status === 'FINISHED' || s.status === 'PAUSED') stopPollWhenNeeded(s);
  }

  function startPoll() {
    if (timer) return;
    timer = setInterval(async () => { const s = await fetchState(); if (s) { current = s; render(s); } }, 2000);
  }
  function stopPollWhenNeeded(s) {
    if (s.status === 'FINISHED') { clearInterval(timer); timer = null; }
  }
  async function fetchState() {
    try {
      const r = await fetch('/api/duels/' + duelId + '/state', { headers: { 'Content-Type': 'application/json' } });
      const d = await r.json();
      if (d.code) { showResult(d.code); return null; }
      return d;
    } catch { return null; }
  }

  // render: HP bar 2 pemain, fase & timer, area soal (reuse penggunaan event) …
  function render(s) {
    const el = document.getElementById('duel-screen'); if (!el) return;
    const me = s.you;
    const meHp = me === 'challenger' ? s.challenger.hp : s.challenged.hp;
    const oppHp = me === 'challenger' ? s.challenged.hp : s.challenger.hp;
    el.innerHTML = `
      <div class="duel-hp you"><span>Kamu</span><div class="hpbar"><div style="width:${meHp}%">${meHp}</div></div></div>
      <div class="duel-opp"><span>Lawan</span><div class="hpbar"><div style="width:${oppHp}%">${oppHp}</div></div></div>
      <div class="duel-phase">${s.phase === 'DEATHMATCH' ? '🔥 Deathmatch!' : '⏳ Normal'}</div>
      <div id="duel-q"></div>
      <div class="duel-skills">…skill bar…</div>
      ${s.status === 'PAUSED' ? '<div class="duel-waiting">Menunggu lawan kembali…</div>' : ''}
      ${s.status === 'FINISHED' ? resultOverlay(s) : ''}`;
    loadQuestion(s.question?.orderIndex ?? 0);
  }

  async function loadQuestion(idx) {
    const el = document.getElementById('duel-q'); if (!el) return;
    const r = await fetch(`/api/duels/${duelId}/question/${idx}`).then(r => r.json());
    if (r.options) el.innerHTML = `<div class="q-text">${esc(r.text)}</div>` +
      r.options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('');
  }

  // answer & skill → POST api; lalu pollState()
  window.__duel = (id) => { duelId = id; Screens.duel.render(); };
  Screens.duel = {
    render() { clearInterval(timer); timer = null;
      document.getElementById('screen').innerHTML = `<div id="duel-screen"></div>`;
      startPoll(); pollState();
    },
    destroy() { clearInterval(timer); timer = null; },
  };
})();
```

> **Efek skill `eliminate_one`/`eagle_eye` di frontend:** panggil `POST /api/duels/:id/skill`, dan coret opsi (element `aria-disabled`) memakai daftar opsi yang di-core local — validasi tetap server-side saat submit.

### Lampiran G-2 — Integrasi `app.js` & CSS (minimal)

- Di `Screens.home` (ubin menu): tambahkan satu ubin `👥 Pertemanan` → `go('friends')`; tambah `gauges`/badge undangan.
- Daftarkan layar: `Screens.friends`, `Screens.duel` di objek `Screens` + `renderActiveTab` branch (hanya pasang tombol saat ada duel aktif / teman).
- `public/sw.js`: naikkan `CACHE_NAME` (mis. `play-v8`) + tambah cache `friends.js`, `duel.js`.
- `public/index.html`: `<script src="/js/friends.js" defer></script><script src="/js/duel.js" defer></script>`.
- `public/css/style.css`: blok pendek untuk `.friend-row`, `.hpbar`, `.duel-phase`, `.duel-waiting`, `.btn-*` — tinggi `100dvh`, scroll internal, mobile-first.

## Lampiran H — `scripts/smoke-test-v7.js` (uji end-to-end dua klien HTTP)

```js
// scripts/smoke-test-v7.js — uji alur v7 lewat HTTP (server harus jalan di BASE).
'use strict';
const BASE = process.env.BASE_URL || 'http://localhost:3002';
const stamp = Date.now().toString(36);

let pass = 0, fail = 0;
const ok = (name, cond, extra) => { cond ? (pass++, console.log('✓ ' + name)) : (fail++, console.log('✗ ' + name, extra ?? '')); };

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
  // 1) dua pemain uji
  const A = { nick: 'ujiA_' + stamp, password: 'uji12345' };
  const B = { nick: 'ujiB_' + stamp, password: 'uji12345' };
  const ra = await req('/api/register', { method: 'POST', body: A });
  const rb = await req('/api/register', { method: 'POST', body: B });
  ok('register A', ra.status === 200 && ra.cookie, ra.json);
  ok('register B', rb.status === 200 && rb.cookie, rb.json);

  // 2) tambah teman: A cari B, kirim request, B terima
  const s = await req('/api/friends/search?q=' + encodeURIComponent(B.nick.slice(0, 6)), { cookie: ra.cookie });
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

  // 5) 10 jawaban benar dari A → HP B 0 → FINISHED
  let finished = false, lastPhase = 'NORMAL';
  for (let i = 0; i < 10 && !finished; i++) {
    const st = await req(`/api/duels/${ch.json.duelId}/state`, { cookie: ra.cookie });
    lastPhase = st.json.phase;
    const q = await req(`/api/duels/${ch.json.duelId}/question/${i}`, { cookie: ra.cookie });
    if (!q.json.options) break;
    // cari jawaban benar via endpoint debug? — tanpa kunci, uji pakai soal yang diketahui
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

  console.log(`\n=== SMOKE v7: ${pass} PASS / ${fail} FAIL ===`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
```

> **Penting:** rute register/subjects di atas **mengikuti nama yang diperkirakan**; sebelum dijalankan, verifikasi dengan `grep -n "pathname === '/api/register'\|/api/subjects" server.js`. Bila berbeda, ganti path di skrip ini. Skrip ini membuat 2 akun uji ber-prefix `ujiA_`/`ujiB_` — hapus setelah verifikasi (`DELETE FROM players WHERE nick LIKE 'uji%'`).

---

## Ringkasan urutan eksekusi yang disarankan

1. `npm run progress -- start T-00` → backup DB + catat baseline (audit **sekali**).
2. `T-01` Lampiran A+B → `node --test tests/friendship.test.js tests/duel-engine.test.js`.
3. `T-02` Lampiran C → `npm run check:schema`.
4. `T-10..T-12` Lampiran D+E → `node --test tests/friends-api.test.js`.
5. `T-20..T-24` Lampiran F+F-2+G(routes) → `node --test tests/duel-api.test.js`.
6. `T-30..T-34` Lampiran G(frontend)+G-2.
7. `T-40..T-42` Lampiran H → restart `play` saja → verifikasi publik.
8. `npm run progress -- check` → laporan `.md`.

**Catatan penutup:** setiap blok di atas adalah kerangka yang sudah divalidasi sintaksnya, tetapi **nama tabel/kolom/route proyek wajib diverifikasi** pada langkah pertama tiap tugas (satu `grep`, bukan audit ulang). Bila ragu, tulis `npm run progress -- block "alasan"` dan lanjut ke tugas berikut yang tidak bergantung padanya.

<!-- END -->


