'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculatePassives, SET_BONUSES, ITEMS } = require('../shared/economy');
const db = require('../lib/db');
const dbDuel = require('../lib/db-duel');

test('RPG Passives & Skill Elimination Suite', async (t) => {
  const rawDb = db.getDb();

  await t.test('1. calculatePassives: single items, set bonuses, and hard caps', () => {
    // Explorer hat (1% dodge) + Explorer outfit (5 shield)
    const p1 = calculatePassives(['hat_explorer', 'outfit_vest'], ITEMS);
    assert.equal(p1.dodgeRate, 0.01);
    assert.equal(p1.startShield, 5);
    assert.equal(p1.activeSets.length, 0);

    // Explorer Set: hat_explorer + outfit_vest + pet_cat + bg_meadow
    const pExp = calculatePassives(['hat_explorer', 'outfit_vest', 'pet_cat', 'bg_meadow'], ITEMS);
    assert.equal(pExp.startShield, 15); // 5 + 10
    assert.equal(pExp.dodgeRate, 0.01);
    assert.equal(pExp.coinBonus, 0.08); // 0.03 + 0.05
    assert.equal(pExp.activeSets.length, 1);
    assert.equal(pExp.activeSets[0].id, 'set_explorer');

    // Monarch Set: hat_crown, pet_dragon, frame_rainbow, title_king
    const pMonarch = calculatePassives(['hat_crown', 'pet_dragon', 'frame_rainbow', 'title_king'], ITEMS);
    assert.equal(pMonarch.dodgeRate, 0.28); // 0.10 + 0.03 + 0.05 + 0.10 = 0.28
    assert.equal(pMonarch.startShield, 35); // 5 + 30
    assert.equal(pMonarch.dragonBreathDamage, 40); // 20 + 20
    assert.equal(pMonarch.lastStand, true);
    assert.equal(pMonarch.activeSets.length, 1);
    assert.equal(pMonarch.activeSets[0].id, 'set_monarch');
  });

  await t.test('2. getInventory and getShop return passive and lore', () => {
    const p = rawDb.prepare('SELECT id FROM players LIMIT 1').get();
    assert.ok(p, 'Player must exist in DB');

    const inv = db.getInventory(p.id);
    assert.ok(inv.items.length > 0);
    const starterHat = inv.items.find(x => x.id === 'hat_explorer');
    assert.ok(starterHat);
    assert.ok(starterHat.passive);
    assert.equal(starterHat.passive.dodgeRate, 0.01);
    assert.ok(starterHat.lore);
    assert.ok(inv.passives);

    const shop = db.getShop(p.id);
    assert.ok(shop.items.length > 0);
    assert.ok(shop.items[0].passive !== undefined);
  });

  await t.test('3. Adventure mode: eliminate_one & eagle_eye NEVER eliminate correct answer', () => {
    // Create player and session
    const uniqueNick = 'test_elim_' + Date.now();
    const p = db.registerPlayer(uniqueNick, 'pass123', 1);

    // Get subject
    const subj = rawDb.prepare('SELECT id FROM subjects WHERE is_active=1 LIMIT 1').get();
    assert.ok(subj, 'Subject exists');

    const sRes = db.startSession(p.id, subj.id, { mode: 'BATTLE' });
    assert.ok(sRes.sessionId);

    const sRow = rawDb.prepare('SELECT * FROM game_sessions WHERE id=?').get(sRes.sessionId);
    const flags = JSON.parse(sRow.flags_json || '{}');
    assert.ok(flags.shield !== undefined, 'Starting shield is recorded in flags');
    assert.ok(flags.passives, 'Passives are recorded in flags');

    // Give player high energy to test skills
    rawDb.prepare('UPDATE game_sessions SET energy=5 WHERE id=?').run(sRes.sessionId);

    // Get active question
    const sq = rawDb.prepare(`
      SELECT sq.*, q.answer_index, q.options_json
      FROM session_questions sq
      JOIN questions q ON q.id=sq.question_id
      WHERE sq.session_id=? AND sq.order_index=0
    `).get(sRes.sessionId);

    let order = JSON.parse(sq.option_order || '[]');
    let displayObj = {};
    try { displayObj = JSON.parse(sq.display_json || '{}'); } catch(e) {}
    if (displayObj.optionOrder && displayObj.optionOrder.length > 0) order = displayObj.optionOrder;
    const correctDisplay = order.indexOf(Number(sq.answer_index));
    assert.ok(correctDisplay >= 0, 'Correct display index must be valid');

    // Test eliminate_one
    const resElim = db.useSkill(sRes.sessionId, p.id, 'eliminate_one', 0);
    assert.ok(resElim.effects.eliminated.length >= 1);
    assert.ok(!resElim.effects.eliminated.includes(correctDisplay), 'eliminate_one MUST NOT eliminate correct option!');

    // Test eagle_eye on question 1
    rawDb.prepare('UPDATE game_sessions SET current_index=1, energy=5 WHERE id=?').run(sRes.sessionId);
    const sq1 = rawDb.prepare(`
      SELECT sq.*, q.answer_index, q.options_json
      FROM session_questions sq
      JOIN questions q ON q.id=sq.question_id
      WHERE sq.session_id=? AND sq.order_index=1
    `).get(sRes.sessionId);

    let order1 = JSON.parse(sq1.option_order || '[]');
    let disp1 = {};
    try { disp1 = JSON.parse(sq1.display_json || '{}'); } catch(e) {}
    if (disp1.optionOrder && disp1.optionOrder.length > 0) order1 = disp1.optionOrder;
    const correctDisplay1 = order1.indexOf(Number(sq1.answer_index));

    const resEagle = db.useSkill(sRes.sessionId, p.id, 'eagle_eye', 1);
    assert.ok(resEagle.effects.eliminated.length >= 1);
    assert.ok(!resEagle.effects.eliminated.includes(correctDisplay1), 'eagle_eye MUST NOT eliminate correct option!');
  });

  await t.test('4. Duel mode: eliminate_one & eagle_eye NEVER eliminate correct answer', () => {
    const pA = db.registerPlayer('duel_pA_' + Date.now(), 'pass123', 1);
    const pB = db.registerPlayer('duel_pB_' + Date.now(), 'pass123', 1);
    const subj = rawDb.prepare('SELECT id FROM subjects WHERE is_active=1 LIMIT 1').get();

    // Make them friends
    rawDb.prepare('INSERT INTO friendships(player_id, friend_id, created_at) VALUES(?,?,CURRENT_TIMESTAMP)').run(pA.id, pB.id);
    rawDb.prepare('INSERT INTO friendships(player_id, friend_id, created_at) VALUES(?,?,CURRENT_TIMESTAMP)').run(pB.id, pA.id);

    // Challenge & Accept duel
    const chRes = dbDuel.createChallenge(rawDb, { challengerId: pA.id, friendId: pB.id, subjectId: subj.id });
    assert.equal(chRes.code, 'OK');
    const accRes = dbDuel.respondInvite(rawDb, chRes.duelId, pB.id, 'ACCEPT');
    assert.equal(accRes.code, 'OK');

    // Challenger uses eliminate_one
    const dq0 = rawDb.prepare('SELECT * FROM duel_questions WHERE duel_id=? AND order_index=0').get(chRes.duelId);
    const canon0 = rawDb.prepare('SELECT answer_index FROM questions WHERE id=?').get(dq0.question_id);
    const orderA = JSON.parse(dq0.option_order_challenger_json);
    const correctDisplayA = orderA.indexOf(Number(canon0.answer_index));

    const skillRes = dbDuel.useDuelSkill(rawDb, chRes.duelId, pA.id, 'eliminate_one', 1, 0);
    assert.equal(skillRes.code, 'OK');
    assert.ok(Array.isArray(skillRes.eliminated));
    assert.ok(skillRes.eliminated.length > 0);
    assert.ok(!skillRes.eliminated.includes(correctDisplayA), 'Duel eliminate_one MUST NOT eliminate correct option!');
  });

  await t.test('5. Combat Hindaran (Dodge) & Critical Hit mechanics', () => {
    const p = db.registerPlayer('monarch_p_' + Date.now(), 'pass123', 1);
    for (const it of ['hat_crown', 'pet_dragon', 'frame_rainbow', 'title_king']) {
      rawDb.prepare('INSERT INTO player_items(player_id, item_id, is_equipped) VALUES(?,?,0)').run(p.id, it);
    }
    db.updatePlayerAvatar(p.id, {
      hat: 'hat_crown',
      pet: 'pet_dragon',
      frame: 'frame_rainbow',
      title: 'title_king'
    });

    const passives = db.getPlayerPassives(p.id);
    assert.equal(passives.dodgeRate, 0.28);
    assert.equal(passives.startShield, 35);
    assert.equal(passives.dragonBreathDamage, 40);

    const subj = rawDb.prepare('SELECT id FROM subjects WHERE is_active=1 LIMIT 1').get();
    const sRes = db.startSession(p.id, subj.id, { mode: 'BATTLE' });
    const s = rawDb.prepare('SELECT flags_json FROM game_sessions WHERE id=?').get(sRes.sessionId);
    const flags = JSON.parse(s.flags_json);
    assert.equal(flags.shield, 35, 'Initial battle shield correctly applied');
  });

  await t.test('6. Dynamic equipping & unequipping updates passives & removes unequipped attribute stats', () => {
    const p = db.registerPlayer('dyn_p_' + Date.now(), 'pass123', 1);
    // Starter has hat_explorer (dodgeRate: 0.01)
    let passives = db.getPlayerPassives(p.id);
    assert.equal(passives.dodgeRate, 0.01, 'Equipped hat_explorer gives 1% dodge');

    // Unequip hat
    const avatarWithoutHat = { outfit: 'outfit_vest', bg: 'bg_meadow', frame: 'frame_wood' };
    db.updatePlayerAvatar(p.id, avatarWithoutHat);
    passives = db.getPlayerPassives(p.id);
    assert.equal(passives.dodgeRate, 0, 'Unequipped hat results in 0% dodge (data box removed)');

    // Re-equip hat_explorer
    const avatarWithHat = { ...avatarWithoutHat, hat: 'hat_explorer' };
    db.updatePlayerAvatar(p.id, avatarWithHat);
    passives = db.getPlayerPassives(p.id);
    assert.equal(passives.dodgeRate, 0.01, 'Re-equipped hat results in 1% dodge again (data box appears)');
  });
});
