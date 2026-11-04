// lib/db-friends.js — lapisan DB pertemanan & presence.
'use strict';

const { isOnline, computeActivity, normalizeNick } = require('../shared/friendship.js');
const { getDb } = require('./db.js');

const F = {
  // Cari pemain by nick (fuzzy awalan & substring). Mengembalikan profil ringkas + avatar.
  searchPlayers(db, q, selfId, limit = 10) {
    db = db || getDb();
    const ql = normalizeNick(q);
    if (!ql || ql.length < 2) return [];
    const rows = db.prepare(`
      SELECT p.id, p.nick, p.class_id, p.avatar_json, c.name AS class_name,
        (SELECT 1 FROM friendships f WHERE (f.player_id = ? AND f.friend_id = p.id) OR (f.player_id = p.id AND f.friend_id = ?)) AS is_friend,
        (SELECT status FROM friend_requests fr WHERE ((fr.from_player_id = ? AND fr.to_player_id = p.id) OR (fr.from_player_id = p.id AND fr.to_player_id = ?)) AND fr.status = 'PENDING' LIMIT 1) AS req_status
      FROM players p
      LEFT JOIN classes c ON c.id = p.class_id
      WHERE (p.nick_lower LIKE ? OR p.nick_lower LIKE ?) AND p.id != ?
      ORDER BY CASE WHEN p.nick_lower LIKE ? THEN 0 ELSE 1 END, p.nick_lower ASC
      LIMIT ?`).all(selfId, selfId, selfId, selfId, ql + '%', '%' + ql + '%', selfId, ql + '%', limit);
    return rows.map(r => {
      let avatar = {};
      try {
        avatar = typeof r.avatar_json === 'string' ? JSON.parse(r.avatar_json || '{}') : (r.avatar_json || {});
      } catch (e) {
        avatar = {};
      }
      return {
        id: r.id,
        nick: r.nick,
        classId: r.class_id,
        className: r.class_name || null,
        avatar,
        isFriend: Boolean(r.is_friend),
        isPending: Boolean(r.req_status === 'PENDING')
      };
    });
  },

  // Kirim permintaan pertemanan. Kode: OK | ALREADY_FRIENDS | REQUEST_PENDING | SELF | FRIEND_NOT_FOUND
  sendRequest(db, fromId, toNick) {
    db = db || getDb();
    const target = db.prepare('SELECT id FROM players WHERE nick_lower = ?').get(normalizeNick(toNick));
    if (!target) return { code: 'FRIEND_NOT_FOUND' };
    if (target.id === fromId) return { code: 'SELF' };
    db.exec('BEGIN IMMEDIATE');
    try {
      const tx = db.prepare('SELECT 1 FROM friendships WHERE (player_id=? AND friend_id=?) OR (player_id=? AND friend_id=?)');
      if (tx.get(fromId, target.id, target.id, fromId)) {
        db.exec('COMMIT');
        return { code: 'ALREADY_FRIENDS' };
      }
      const pend = db.prepare("SELECT 1 FROM friend_requests WHERE status='PENDING' AND ((from_player_id=? AND to_player_id=?) OR (from_player_id=? AND to_player_id=?))");
      if (pend.get(fromId, target.id, target.id, fromId)) {
        db.exec('COMMIT');
        return { code: 'REQUEST_PENDING' };
      }
      db.prepare(`INSERT INTO friend_requests (from_player_id, to_player_id, status, created_at, responded_at)
                  VALUES (?, ?, 'PENDING', ?, NULL)
                  ON CONFLICT(from_player_id, to_player_id) DO UPDATE SET status='PENDING', created_at=excluded.created_at, responded_at=NULL`)
        .run(fromId, target.id, new Date().toISOString());
      db.exec('COMMIT');
      return { code: 'OK', toId: target.id };
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  },

  // Terima/tolak permintaan. action: 'accept' | 'decline'
  respond(db, requestId, selfId, action) {
    db = db || getDb();
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
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  },

  // Hapus teman dua arah + batalkan permintaan terkait.
  remove(db, selfId, friendId) {
    db = db || getDb();
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare('DELETE FROM friendships WHERE (player_id=? AND friend_id=?) OR (player_id=? AND friend_id=?)').run(selfId, friendId, friendId, selfId);
      db.prepare('DELETE FROM friend_requests WHERE (from_player_id=? AND to_player_id=?) OR (from_player_id=? AND to_player_id=?)').run(selfId, friendId, friendId, selfId);
      db.exec('COMMIT');
      return { code: 'OK' };
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  },

  // Upsert presence heartbeat. activity: 'idle' | 'battle' | 'petualangan' | 'duel'
  pingPresence(db, playerId, activity) {
    db = db || getDb();
    db.prepare(`INSERT INTO player_presence (player_id,last_seen_at,activity) VALUES (?,?,?)
                ON CONFLICT(player_id) DO UPDATE SET last_seen_at=excluded.last_seen_at, activity=excluded.activity`)
      .run(playerId, new Date().toISOString(), activity || 'idle');
  },

  presenceBy(db, ids) {
    db = db || getDb();
    if (!ids || !ids.length) return {};
    const ph = ids.map(() => '?').join(',');
    const rows = db.prepare(`SELECT player_id,last_seen_at,activity FROM player_presence WHERE player_id IN (${ph})`).all(...ids);
    const out = {};
    for (const r of rows) out[r.player_id] = { lastSeenAt: r.last_seen_at, activity: r.activity };
    return out;
  },

  // Sesi game aktif satu pemain (untuk menurunkan aktivitas).
  sessionBy(db, playerId) {
    db = db || getDb();
    return db.prepare(`SELECT mode, campaign_node, status FROM game_sessions
                       WHERE player_id=? AND status='IN_PROGRESS' ORDER BY id DESC LIMIT 1`).get(playerId);
  },

  // Daftar teman + status.
  list(db, selfId) {
    db = db || getDb();
    const rows = db.prepare(`
      SELECT p.id, p.nick, p.avatar_json,
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
      let avatar = {};
      try {
        avatar = typeof r.avatar_json === 'string' ? JSON.parse(r.avatar_json || '{}') : (r.avatar_json || {});
      } catch (e) {
        avatar = {};
      }
      return { id: r.id, nick: r.nick, avatar, online, activity, lastSeenAt: r.last_seen_at };
    });
  },

  // Permintaan masuk PENDING untuk pemain (untuk badge poll).
  incoming(db, selfId, limit = 20) {
    db = db || getDb();
    const rows = db.prepare(`
      SELECT fr.id, fr.created_at, p.id AS fromId, p.nick, p.avatar_json
      FROM friend_requests fr JOIN players p ON p.id = fr.from_player_id
      WHERE fr.to_player_id=? AND fr.status='PENDING' ORDER BY fr.created_at DESC LIMIT ?`).all(selfId, limit);
    return rows.map(r => {
      let avatar = {};
      try {
        avatar = typeof r.avatar_json === 'string' ? JSON.parse(r.avatar_json || '{}') : (r.avatar_json || {});
      } catch (e) {
        avatar = {};
      }
      return { id: r.id, created_at: r.created_at, fromId: r.fromId, nick: r.nick, avatar };
    });
  },

  // Permintaan keluar PENDING (agar tidak dobel ajak).
  outgoing(db, selfId) {
    db = db || getDb();
    return db.prepare(`SELECT id, to_player_id FROM friend_requests WHERE from_player_id=? AND status='PENDING'`).all(selfId);
  },
};

module.exports = F;
