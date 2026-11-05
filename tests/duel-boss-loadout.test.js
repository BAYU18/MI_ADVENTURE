// tests/duel-boss-loadout.test.js — Pengujian Loadout Bos Battle vs Player (PvP), Aturan Slot, Rarity, & Integrasi Duel
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const dbModule = require('../lib/db.js');
const {
  getUnlockedBossSlots,
  getMaxAllowedBossRarity,
  canEquipBossRarity,
  getMonsterTierById,
  getPlayerDuelBossLoadout,
  updatePlayerDuelBossLoadout,
  getDuelBossLoadoutDetails,
  getPlayerEquippedBossSkills,
  getDb
} = dbModule;

const D = require('../shared/duel.js');
const dbDuel = require('../lib/db-duel.js');

test('Loadout Bos Battle vs Player: Aturan Slot & Rarity', async (t) => {
  await t.test('1. Aturan pembukaan 5 slot bos: Lv < 5 terkunci, Lv 5 buka 1 slot, tiap kelipatan 5 nambah 1 slot', () => {
    // Level < 5: 0 slot
    assert.equal(getUnlockedBossSlots(1), 0);
    assert.equal(getUnlockedBossSlots(4), 0);

    // Lv 5: 1 slot
    assert.equal(getUnlockedBossSlots(5), 1);
    assert.equal(getUnlockedBossSlots(9), 1);

    // Lv 10: 2 slot
    assert.equal(getUnlockedBossSlots(10), 2);
    assert.equal(getUnlockedBossSlots(14), 2);

    // Lv 15: 3 slot
    assert.equal(getUnlockedBossSlots(15), 3);
    assert.equal(getUnlockedBossSlots(19), 3);

    // Lv 20: 4 slot
    assert.equal(getUnlockedBossSlots(20), 4);
    assert.equal(getUnlockedBossSlots(24), 4);

    // Lv 25+: 5 slot
    assert.equal(getUnlockedBossSlots(25), 5);
    assert.equal(getUnlockedBossSlots(30), 5);
    assert.equal(getUnlockedBossSlots(50), 5);
  });

  await t.test('2. Batasan rarity berdasarkan level: 5-10 Common, 11-15 Rare, 16-20 Epic, 20+ Legend', () => {
    // Level < 5: null
    assert.equal(getMaxAllowedBossRarity(1), null);
    assert.equal(getMaxAllowedBossRarity(4), null);

    // Level 5-10: common
    assert.equal(getMaxAllowedBossRarity(5), 'common');
    assert.equal(getMaxAllowedBossRarity(10), 'common');
    assert.equal(canEquipBossRarity(5, 'common'), true);
    assert.equal(canEquipBossRarity(5, 'rare'), false);
    assert.equal(canEquipBossRarity(10, 'rare'), false);

    // Level 11-15: rare
    assert.equal(getMaxAllowedBossRarity(11), 'rare');
    assert.equal(getMaxAllowedBossRarity(15), 'rare');
    assert.equal(canEquipBossRarity(12, 'common'), true);
    assert.equal(canEquipBossRarity(12, 'rare'), true);
    assert.equal(canEquipBossRarity(12, 'epic'), false);

    // Level 16-19: epic
    assert.equal(getMaxAllowedBossRarity(16), 'epic');
    assert.equal(getMaxAllowedBossRarity(19), 'epic');
    assert.equal(canEquipBossRarity(16, 'epic'), true);
    assert.equal(canEquipBossRarity(16, 'legend'), false);

    // Level 20+: legend
    assert.equal(getMaxAllowedBossRarity(20), 'legend');
    assert.equal(getMaxAllowedBossRarity(25), 'legend');
    assert.equal(canEquipBossRarity(20, 'legend'), true);
    assert.equal(canEquipBossRarity(25, 'legend'), true);
  });

  await t.test('3. Distribusi tier 100 monster (4 common, 3 rare, 2 epic, 1 legend per tema)', () => {
    // Monster #1..#4 hutan: Lumutra (1), Akarok (2), Jamurgon (3), Kayubuk (4) -> common
    assert.equal(getMonsterTierById(1), 'common');
    assert.equal(getMonsterTierById(2), 'common');
    assert.equal(getMonsterTierById(3), 'common');
    assert.equal(getMonsterTierById(4), 'common');

    // Monster #5..#7 hutan: Daunjir (5), Burunggar (6), Sulurkan (7) -> rare
    assert.equal(getMonsterTierById(5), 'rare');
    assert.equal(getMonsterTierById(6), 'rare');
    assert.equal(getMonsterTierById(7), 'rare');

    // Monster #8..#9 hutan: Rimbazo (8), Beringkus (9) -> epic
    assert.equal(getMonsterTierById(8), 'epic');
    assert.equal(getMonsterTierById(9), 'epic');

    // Monster #10 hutan: Tupaiju (10) -> legend
    assert.equal(getMonsterTierById(10), 'legend');
  });
});

test('Loadout Bos Battle vs Player: Validasi Database & Syarat Bos Terkalahkan', async (t) => {
  const db = getDb();

  // Buat player uji
  const nick = 'DuelBossTester_' + Date.now();
  const player = dbModule.registerPlayer(nick, 'pass123');

  await t.test('1. Player Lv 1 tidak bisa pasang bos (SLOT_LOCKED)', () => {
    assert.throws(() => {
      updatePlayerDuelBossLoadout(player.id, [1, null, null, null, null]);
    }, (err) => err.code === 'SLOT_LOCKED');
  });

  await t.test('2. Player Lv 5 buka 1 slot, namun tolak bos yang BELUM dikalahkan (BOSS_NOT_DEFEATED)', () => {
    // Naikkan XP player ke Lv 5 (Lv 5 butuh minimal 50*(5-1)^2 = 800 XP)
    db.prepare('UPDATE players SET xp=850 WHERE id=?').run(player.id);
    const updatedP = dbModule.getPlayerById(player.id);
    assert.equal(updatedP.level >= 5, true);

    // Monster #1 (common) belum pernah dikalahkan
    assert.throws(() => {
      updatePlayerDuelBossLoadout(player.id, [1, null, null, null, null]);
    }, (err) => err.code === 'BOSS_NOT_DEFEATED');
  });

  await t.test('3. Player Lv 5 berhasil pasang bos Common setelah dikalahkan', () => {
    // Kalahkan monster #1
    db.prepare(`
      INSERT INTO player_monsters(player_id, monster_id, encounters, defeats, best_streak, best_stars, last_at)
      VALUES(?, 1, 3, 2, 5, 3, datetime('now'))
      ON CONFLICT(player_id, monster_id) DO UPDATE SET defeats = defeats + 1
    `).run(player.id);

    const saved = updatePlayerDuelBossLoadout(player.id, [1, null, null, null, null]);
    assert.deepEqual(saved, [1, null, null, null, null]);

    const loadout = getPlayerDuelBossLoadout(player.id);
    assert.equal(loadout[0], 1);
    assert.equal(loadout[1], null);

    // Cek details
    const details = getDuelBossLoadoutDetails(player.id);
    assert.equal(details.unlockedCount, 1);
    assert.equal(details.slots[0].unlocked, true);
    assert.equal(details.slots[0].monster.id, 1);
    assert.equal(details.slots[0].monster.tier, 'common');
    assert.ok(details.slots[0].skills.length >= 1);
    assert.equal(details.slots[1].unlocked, false);
  });

  await t.test('4. Player Lv 5 ditolak pasang bos Rare walau sudah dikalahkan (RARITY_LOCKED)', () => {
    // Kalahkan monster #5 (Rare)
    db.prepare(`
      INSERT INTO player_monsters(player_id, monster_id, encounters, defeats, best_streak, best_stars, last_at)
      VALUES(?, 5, 2, 1, 4, 3, datetime('now'))
      ON CONFLICT(player_id, monster_id) DO UPDATE SET defeats = defeats + 1
    `).run(player.id);

    // Di level 5, hanya common yang boleh
    assert.throws(() => {
      updatePlayerDuelBossLoadout(player.id, [5, null, null, null, null]);
    }, (err) => err.code === 'RARITY_LOCKED');
  });

  await t.test('5. Naikkan ke Lv 12: buka 2 slot dan bisa pasang bos Rare', () => {
    // Naikkan XP ke Lv 12 (50*11^2 = 6050 XP)
    db.prepare('UPDATE players SET xp=6100 WHERE id=?').run(player.id);
    const updatedP = dbModule.getPlayerById(player.id);
    assert.equal(updatedP.level >= 12, true);

    const saved = updatePlayerDuelBossLoadout(player.id, [1, 5, null, null, null]);
    assert.deepEqual(saved, [1, 5, null, null, null]);

    const details = getDuelBossLoadoutDetails(player.id);
    assert.equal(details.unlockedCount, 2);
    assert.equal(details.slots[0].monster.name, 'Lumutra');
    assert.equal(details.slots[1].monster.name, 'Daunjir');
    assert.equal(details.slots[1].monster.tier, 'rare');
    assert.equal(details.activeBossSkills.length, 3); // 1 dari Lumutra (common) + 2 dari Daunjir (rare)
  });

  await t.test('6. getPlayerEquippedBossSkills mengembalikan daftar skill aktif bos', () => {
    const skills = getPlayerEquippedBossSkills(db, player.id);
    assert.equal(skills.length, 3);
    const names = skills.map(s => s.name);
    assert.ok(names.includes('Racun Duri')); // Common skill alam
    assert.ok(names.includes('Akar Membelit')); // Rare skill alam
  });
});

test('Loadout Bos Battle vs Player: Integrasi Duel Arena & Tampilan Buff', async (t) => {
  const db = getDb();

  // Buat 2 pemain duel
  const pA = dbModule.registerPlayer('DuelA_' + Date.now(), 'pass123');
  const pB = dbModule.registerPlayer('DuelB_' + Date.now(), 'pass123');

  // Set Level keduanya ke Lv 15
  db.prepare('UPDATE players SET xp=10000 WHERE id IN (?, ?)').run(pA.id, pB.id);

  // Jadikan teman
  db.prepare("INSERT INTO friendships(player_id, friend_id, created_at) VALUES (?, ?, datetime('now')), (?, ?, datetime('now'))")
    .run(pA.id, pB.id, pB.id, pA.id);

  // Pasang bos ke pA: kalahkan monster #1 (Lumutra, Common) dan monster #5 (Daunjir, Rare)
  db.prepare(`INSERT INTO player_monsters(player_id, monster_id, encounters, defeats) VALUES (?, 1, 1, 1), (?, 5, 1, 1)`).run(pA.id, pA.id);
  updatePlayerDuelBossLoadout(pA.id, [1, 5, null, null, null]);

  // Pasang skin ke pA (Perisai + Crit)
  db.prepare("INSERT INTO player_items(player_id, item_id, is_equipped) VALUES(?, 'hat_knight', 1), (?, 'sword_wooden', 1)").run(pA.id, pA.id);

  // Buat duel
  const challenge = dbDuel.createChallenge(db, { challengerId: pA.id, friendId: pB.id, subjectId: 1 });
  assert.ok(challenge.duelId);
  const start = dbDuel.startDuel(db, challenge.duelId);
  assert.equal(start.code, 'OK');

  await t.test('1. getDuelState mengekspos skinBuffs dan bossBuffs untuk kedua pemain', () => {
    const state = dbDuel.getDuelState(db, challenge.duelId, pA.id);
    assert.ok(Array.isArray(state.challenger.skinBuffs));
    assert.ok(Array.isArray(state.challenger.bossBuffs));
    assert.ok(Array.isArray(state.challenged.skinBuffs));
    assert.ok(Array.isArray(state.challenged.bossBuffs));

    // Challenger (pA) memiliki 3 bossBuffs (1 common + 2 rare)
    assert.equal(state.challenger.bossBuffs.length, 3);
    const bBuffNames = state.challenger.bossBuffs.map(b => b.title);
    assert.ok(bBuffNames.some(t => t.includes('Racun Duri')));
    assert.ok(bBuffNames.some(t => t.includes('Lumutra')));

    // Challenger memiliki skinBuffs
    assert.ok(state.challenger.skinBuffs.length > 0);
  });

  await t.test('2. submitAnswer mengekspos bossSkillsTriggered saat skill bos aktif', () => {
    // Cari index pilihan yang benar untuk challenger (pA)
    const q0 = db.prepare('SELECT * FROM duel_questions WHERE duel_id=? AND order_index=0').get(challenge.duelId);
    const canon = db.prepare('SELECT answer_index FROM questions WHERE id=?').get(q0.question_id);
    const orderA = JSON.parse(q0.option_order_challenger_json);
    const correctIdx = orderA.indexOf(canon.answer_index);

    // pA menjawab benar soal pertama
    const ansRes = dbDuel.submitAnswer(db, challenge.duelId, pA.id, 0, correctIdx, 1500);
    assert.equal(ansRes.code, 'OK');
    assert.equal(ansRes.isCorrect, true);
    assert.ok(Array.isArray(ansRes.bossSkillsTriggered));

    // Karena pA punya Racun Duri (DoT), DoT skill terpicu
    assert.ok(ansRes.bossSkillsTriggered.length > 0);
    const triggeredNames = ansRes.bossSkillsTriggered.map(s => s.name);
    assert.ok(triggeredNames.includes('Racun Duri'));
  });
});
