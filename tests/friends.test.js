// tests/friends.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getDb } = require('../lib/db.js');
const dbFriends = require('../lib/db-friends.js');

const db = getDb();
const stamp = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);

test('db-friends: search, request, respond, presence, list, remove', () => {
  // Setup 2 test players
  const p1 = 't_f1_' + stamp;
  const p2 = 't_f2_' + stamp;
  db.prepare(`INSERT INTO players (nick, nick_lower, password_hash) VALUES (?, ?, 'hash')`).run(p1, p1.toLowerCase());
  db.prepare(`INSERT INTO players (nick, nick_lower, password_hash) VALUES (?, ?, 'hash')`).run(p2, p2.toLowerCase());
  const u1 = db.prepare('SELECT id, nick FROM players WHERE nick_lower=?').get(p1.toLowerCase());
  const u2 = db.prepare('SELECT id, nick FROM players WHERE nick_lower=?').get(p2.toLowerCase());

  db.prepare('DELETE FROM player_presence WHERE player_id IN (?, ?)').run(u1.id, u2.id);
  db.prepare('DELETE FROM friendships WHERE player_id IN (?, ?) OR friend_id IN (?, ?)').run(u1.id, u2.id, u1.id, u2.id);

  // 1. searchPlayers
  const s = dbFriends.searchPlayers(db, p2.slice(0, 5), u1.id);
  assert.ok(s.some(x => x.id === u2.id));

  // 2. sendRequest validation
  assert.equal(dbFriends.sendRequest(db, u1.id, 'non_existent_player_xyz').code, 'FRIEND_NOT_FOUND');
  assert.equal(dbFriends.sendRequest(db, u1.id, u1.nick).code, 'SELF');

  const reqRes = dbFriends.sendRequest(db, u1.id, u2.nick);
  assert.equal(reqRes.code, 'OK');
  assert.equal(reqRes.toId, u2.id);

  // duplicate pending
  assert.equal(dbFriends.sendRequest(db, u1.id, u2.nick).code, 'REQUEST_PENDING');
  assert.equal(dbFriends.sendRequest(db, u2.id, u1.nick).code, 'REQUEST_PENDING');

  // 3. incoming & outgoing
  const inc = dbFriends.incoming(db, u2.id);
  assert.equal(inc.length, 1);
  assert.equal(inc[0].fromId, u1.id);

  const out = dbFriends.outgoing(db, u1.id);
  assert.equal(out.length, 1);
  assert.equal(out[0].to_player_id, u2.id);

  // 4. respond accept
  const acc = dbFriends.respond(db, inc[0].id, u2.id, 'accept');
  assert.equal(acc.code, 'OK');

  // already friends
  assert.equal(dbFriends.sendRequest(db, u1.id, u2.nick).code, 'ALREADY_FRIENDS');

  // 5. list
  const list1 = dbFriends.list(db, u1.id);
  assert.equal(list1.length, 1);
  assert.equal(list1[0].id, u2.id);
  assert.equal(list1[0].online, false);

  // 6. pingPresence
  dbFriends.pingPresence(db, u2.id, 'battle');
  const list2 = dbFriends.list(db, u1.id);
  assert.equal(list2[0].online, true);
  assert.equal(list2[0].activity, 'battle');

  // 7. remove
  const rm = dbFriends.remove(db, u1.id, u2.id);
  assert.equal(rm.code, 'OK');
  assert.equal(dbFriends.list(db, u1.id).length, 0);
  assert.equal(dbFriends.list(db, u2.id).length, 0);

  // Cleanup test players
  db.prepare('DELETE FROM friendships WHERE player_id IN (?, ?) OR friend_id IN (?, ?)').run(u1.id, u2.id, u1.id, u2.id);
  db.prepare('DELETE FROM friend_requests WHERE from_player_id IN (?, ?) OR to_player_id IN (?, ?)').run(u1.id, u2.id, u1.id, u2.id);
  db.prepare('DELETE FROM player_presence WHERE player_id IN (?, ?)').run(u1.id, u2.id);
  db.prepare('DELETE FROM players WHERE id IN (?, ?)').run(u1.id, u2.id);
});
