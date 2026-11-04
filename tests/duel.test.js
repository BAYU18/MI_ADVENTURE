// tests/duel.test.js
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { getDb } = require('../lib/db.js');
const dbFriends = require('../lib/db-friends.js');
const dbDuel = require('../lib/db-duel.js');
const D = require('../shared/duel.js');

const db = getDb();
const stamp = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);

test('db-duel: lifecycle challenge, accept, answer, skill, finish, reward', () => {
  const localStamp = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  // 1. Setup 2 test players + subject + questions
  const nickA = 't_dA_' + localStamp;
  const nickB = 't_dB_' + localStamp;
  db.prepare(`INSERT INTO players (nick, nick_lower, password_hash, xp, coins) VALUES (?, ?, 'hash', 100, 50)`).run(nickA, nickA.toLowerCase());
  db.prepare(`INSERT INTO players (nick, nick_lower, password_hash, xp, coins) VALUES (?, ?, 'hash', 100, 50)`).run(nickB, nickB.toLowerCase());
  const pA = db.prepare('SELECT id, nick, coins, xp FROM players WHERE nick_lower=?').get(nickA.toLowerCase());
  const pB = db.prepare('SELECT id, nick, coins, xp FROM players WHERE nick_lower=?').get(nickB.toLowerCase());

  // Setup friendship
  db.prepare('INSERT OR IGNORE INTO friendships (player_id, friend_id, created_at) VALUES (?, ?, ?), (?, ?, ?)').run(pA.id, pB.id, new Date().toISOString(), pB.id, pA.id, new Date().toISOString());

  // Pick or create a subject with at least 10 questions
  let subj = db.prepare('SELECT id FROM subjects LIMIT 1').get();
  if (!subj) {
    db.prepare(`INSERT INTO subjects (name, icon, color) VALUES ('SubjTest', 'icon', 'color')`).run();
    subj = db.prepare('SELECT id FROM subjects WHERE name="SubjTest"').get();
  }
  const qCount = db.prepare('SELECT count(*) as c FROM questions WHERE subject_id=?').get(subj.id).c;
  if (qCount < 10) {
    for (let i = qCount; i < 15; i++) {
      db.prepare(`INSERT INTO questions (subject_id, text, options_json, answer_index, hash) VALUES (?, ?, ?, ?, ?)`).run(
        subj.id,
        `Pertanyaan ${i}?`,
        JSON.stringify(['Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D']),
        0,
        'hash_' + stamp + '_' + i
      );
    }
  }

  // 2. Challenge
  const ch = dbDuel.createChallenge(db, { challengerId: pA.id, friendId: pB.id, subjectId: subj.id });
  assert.equal(ch.code, 'OK');
  assert.ok(ch.duelId);

  // Busy check
  const busy = dbDuel.createChallenge(db, { challengerId: pA.id, friendId: pB.id, subjectId: subj.id });
  assert.equal(busy.code, 'DUEL_BUSY');

  // 3. Accept invite -> Starts duel
  const acc = dbDuel.respondInvite(db, ch.duelId, pB.id, 'accept');
  assert.equal(acc.code, 'OK');

  // Verify duel is ACTIVE
  const st1 = dbDuel.getDuelState(db, ch.duelId, pA.id);
  assert.equal(st1.status, 'ACTIVE');
  assert.equal(st1.phase, 'NORMAL');
  assert.equal(st1.challenger.hp, 100);
  assert.equal(st1.challenged.hp, 100);
  assert.equal(st1.you, 'challenger');

  // 4. Test answer: submit answer for order_index 0
  const q0 = db.prepare('SELECT * FROM duel_questions WHERE duel_id=? AND order_index=0').get(ch.duelId);
  const canonQ0 = db.prepare('SELECT answer_index FROM questions WHERE id=?').get(q0.question_id);
  const orderA = JSON.parse(q0.option_order_challenger_json);
  // find chosenIndex that maps to canonQ0.answer_index
  const correctChosenIndex = orderA.indexOf(canonQ0.answer_index);

  const ans1 = dbDuel.submitAnswer(db, ch.duelId, pA.id, 0, correctChosenIndex, 1000);
  assert.equal(ans1.code, 'OK');
  assert.equal(ans1.isCorrect, true);
  assert.equal(ans1.damage, 10);

  // Opponent (pB) HP should be reduced to 90
  const st2 = dbDuel.getDuelState(db, ch.duelId, pA.id);
  assert.equal(st2.challenged.hp, 90);

  // Anti-replay check
  const dupAns = dbDuel.submitAnswer(db, ch.duelId, pA.id, 0, correctChosenIndex, 1000);
  assert.equal(dupAns.code, 'ANSWER_REJECTED');

  // 5. Test Skill: pB uses heal
  const sk = dbDuel.useDuelSkill(db, ch.duelId, pB.id, 'heal', 1, 0);
  assert.equal(sk.code, 'OK');
  const st3 = dbDuel.getDuelState(db, ch.duelId, pB.id);
  assert.equal(st3.challenged.hp, 100); // 90 + 25 clamped to 100

  // 6. Test Forfeit & Reward
  const ff = dbDuel.forfeit(db, ch.duelId, pB.id);
  assert.equal(ff.code, 'OK');
  assert.equal(ff.winnerId, pA.id);

  // Verify rewards applied
  const pAAfter = db.prepare('SELECT coins, xp FROM players WHERE id=?').get(pA.id);
  const pBAfter = db.prepare('SELECT coins, xp FROM players WHERE id=?').get(pB.id);
  assert.equal(pAAfter.coins, pA.coins + 15);
  assert.equal(pAAfter.xp, pA.xp + 10);
  assert.equal(pBAfter.coins, pB.coins + 5);
  assert.equal(pBAfter.xp, pB.xp + 4);

  // Cleanup
  db.prepare('DELETE FROM duels WHERE id=?').run(ch.duelId);
  db.prepare('DELETE FROM friendships WHERE player_id IN (?, ?) OR friend_id IN (?, ?)').run(pA.id, pB.id, pA.id, pB.id);
  db.prepare('DELETE FROM players WHERE id IN (?, ?)').run(pA.id, pB.id);
});
