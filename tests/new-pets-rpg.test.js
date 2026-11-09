'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const PetArt = require('../shared/pet-art.js');
const { ITEMS, calculatePassives, SET_BONUSES } = require('../shared/economy.js');
const Avatar = require('../shared/avatar.js');
const db = require('../lib/db');
const dbDuel = require('../lib/db-duel');

test('28 New RPG Pets & 7 Upgraded Legacy Pets Suite', async (t) => {
  const legacyPetIds = ['pet_cat', 'pet_dog', 'pet_penguin', 'pet_fox', 'pet_owl', 'pet_dragon', 'pet_phoenix'];
  const newPetIds = [
    // 10 Common
    'pet_hamster', 'pet_rabbit', 'pet_chick', 'pet_turtle', 'pet_panda',
    'pet_bear', 'pet_frog', 'pet_duck', 'pet_mouse', 'pet_koala',
    // 8 Rare
    'pet_wolf', 'pet_hedgehog', 'pet_otter', 'pet_bat', 'pet_racoon',
    'pet_deer', 'pet_parrot', 'pet_chameleon',
    // 6 Epic
    'pet_tiger', 'pet_lion', 'pet_eagle', 'pet_crocodile', 'pet_jellyfish', 'pet_snake',
    // 4 Legend
    'pet_kirin', 'pet_gryphon', 'pet_leviathan', 'pet_fenrir'
  ];
  const all35PetIds = [...legacyPetIds, ...newPetIds];

  await t.test('1. PetArt contains all 35 pets with valid 3D shiny SVG art', () => {
    assert.equal(typeof PetArt.embedPetArt, 'function', 'embedPetArt function must exist');
    assert.equal(typeof PetArt.hasPetArt, 'function', 'hasPetArt function must exist');

    for (const petId of all35PetIds) {
      assert.ok(PetArt.hasPetArt(petId), `PetArt must have entry for ${petId}`);
      const svgMarkup = PetArt.embedPetArt(petId, 'u123', { width: 64, height: 64 });
      assert.ok(svgMarkup, `Markup for ${petId} must not be empty`);
      assert.ok(svgMarkup.includes('<svg'), `Markup for ${petId} must contain <svg`);
      assert.ok(svgMarkup.includes('viewBox="0 0 64 64"'), `Markup for ${petId} must have viewBox 0 0 64 64`);
      assert.ok(svgMarkup.includes('</svg>'), `Markup for ${petId} must close </svg>`);
    }
  });

  await t.test('2. Avatar module integrates PetArt without breaking legacy tests', () => {
    // Legacy test visual-3d-upgrade checks Object.keys(Avatar.PET).length === 6
    assert.equal(Object.keys(Avatar.PET).length, 6, 'Avatar.PET must maintain 6 legacy keys for backward compat');

    // Avatar.PET_ART contains all 35 pets
    assert.ok(Avatar.PET_ART, 'Avatar.PET_ART must be exposed');
    assert.equal(Object.keys(Avatar.PET_ART).length, 35, 'Avatar.PET_ART must contain all 35 pets');

    // renderPetElement renders valid SVG for all 35 pets
    for (const petId of all35PetIds) {
      const el = Avatar.renderPetElement(petId, 'test_uid');
      assert.ok(el, `renderPetElement must render markup for ${petId}`);
      assert.ok(el.includes('<svg'), `renderPetElement for ${petId} must render SVG`);
    }

    // renderThumbnail renders 3D thumbnail
    const thumb = Avatar.renderThumbnail('pet_kirin', 'pet');
    assert.ok(thumb.includes('<svg'), 'renderThumbnail for pet_kirin must render SVG');
  });

  await t.test('3. ITEMS catalog in economy.js has all 35 pets with unique metadata and passives', () => {
    const petsInCatalog = ITEMS.filter(it => it.slot === 'pet');
    assert.equal(petsInCatalog.length, 35, 'Catalog must contain exactly 35 pets');

    const seenIds = new Set();
    for (const pet of petsInCatalog) {
      assert.ok(!seenIds.has(pet.id), `Duplicate pet id found: ${pet.id}`);
      seenIds.add(pet.id);
      assert.ok(pet.name, `Pet ${pet.id} must have name`);
      assert.ok(pet.rarity, `Pet ${pet.id} must have rarity`);
      assert.ok(pet.passive, `Pet ${pet.id} must have passive`);
      assert.ok(pet.passive.desc, `Pet ${pet.id} passive must have desc`);
    }

    for (const petId of all35PetIds) {
      assert.ok(seenIds.has(petId), `Pet ${petId} must be present in ITEMS catalog`);
    }
  });

  await t.test('4. calculatePassives handles all 5 new Set Bonuses and balance hard caps', () => {
    assert.ok(SET_BONUSES.length >= 10, 'Must have at least 10 Set Bonuses (5 existing + 5 new)');

    // Test Set Penjaga Hutan Purba (set_glade)
    const pGlade = calculatePassives(['hat_explorer', 'outfit_vest', 'pet_deer', 'bg_meadow'], ITEMS);
    assert.ok(pGlade.activeSets.some(s => s.id === 'set_glade'), 'set_glade must activate');
    assert.equal(pGlade.dodgeRate, 0.16); // 0.01 + 0.07 + 0.08 = 0.16
    assert.equal(pGlade.startShield, 20); // 5 + 15 = 20

    // Test Set Pemburu Arus Abisal (set_abyssal)
    const pAbyssal = calculatePassives(['hat_pirate', 'outfit_stripes', 'pet_jellyfish', 'bg_cave'], ITEMS);
    assert.ok(pAbyssal.activeSets.some(s => s.id === 'set_abyssal'), 'set_abyssal must activate');
    assert.equal(pAbyssal.staticShockStunChance, 0.30); // 0.20 + 0.10 = 0.30
    assert.equal(pAbyssal.coinBonus, 0.20); // 0.05 + 0.15 = 0.20

    // Test Set Maharaja Bintang Langit (set_celestial_overlord)
    const pCelestial = calculatePassives(['hat_crown', 'outfit_robe', 'pet_kirin', 'bg_aurora'], ITEMS);
    assert.ok(pCelestial.activeSets.some(s => s.id === 'set_celestial_overlord'), 'set_celestial_overlord must activate');
    assert.equal(pCelestial.startShield, 50); // 15 (hat_crown) + 35 (set bonus) = 50
    assert.equal(pCelestial.critChance, 0.10);
    assert.equal(pCelestial.healOnCorrect, 2);
    assert.equal(pCelestial.cheatDeath, true);

    // Test Set Panglima Perang Taring Baja (set_beastmaster)
    const pBeast = calculatePassives(['hat_knight', 'outfit_armor', 'pet_tiger', 'weapon_sword'], ITEMS);
    assert.ok(pBeast.activeSets.some(s => s.id === 'set_beastmaster'), 'set_beastmaster must activate');
    assert.equal(pBeast.thornsDamage, 6);
    assert.equal(pBeast.critMultiplier, 2.5);
    assert.ok(pBeast.pounceAutoCrit);

    // Test Set Badai Kutub Utara (set_glacial)
    const pGlacial = calculatePassives(['hat_wizard', 'weapon_wand', 'pet_fenrir', 'bg_sky'], ITEMS);
    assert.ok(pGlacial.activeSets.some(s => s.id === 'set_glacial'), 'set_glacial must activate');
    assert.equal(pGlacial.freezeTimeBonus, 2.0);
    assert.equal(pGlacial.damageReduction, 0.22); // 0.10 + 0.12 = 0.22
    assert.ok(pGlacial.fenrirBlizzard);
  });

  await t.test('5. Individual passives calculations', () => {
    // Hamster (coinBonusChance)
    const pHamster = calculatePassives(['pet_hamster'], ITEMS);
    assert.deepEqual(pHamster.coinBonusChance, { chance: 0.25, amount: 5 });

    // Frog (speedAnswerXp)
    const pFrog = calculatePassives(['pet_frog'], ITEMS);
    assert.deepEqual(pFrog.speedAnswerXp, { maxTime: 3, bonusXp: 10 });

    // Crocodile (vampiricBite)
    const pCroc = calculatePassives(['pet_crocodile'], ITEMS);
    assert.deepEqual(pCroc.vampiricBite, { lifestealPercent: 0.12 });

    // Gryphon (gryphonThunder)
    const pGryphon = calculatePassives(['pet_gryphon'], ITEMS);
    assert.deepEqual(pGryphon.gryphonThunder, { combo: 5, damage: 35, freezeSeconds: 3 });

    // Kraken (krakenSurge)
    const pKraken = calculatePassives(['pet_leviathan'], ITEMS);
    assert.equal(pKraken.damageReduction, 0.15);
    assert.equal(pKraken.krakenSurge.damage, 30);
    assert.equal(pKraken.krakenSurge.heal, 15);
  });

  await t.test('6. Duel formatDuelBuffs recognizes new pet buffs', () => {
    const duelBuffs = dbDuel.formatDuelBuffs({
      cheatDeath: true,
      pounceAutoCrit: { interval: 5, multiplier: 2.2 },
      vampiricBite: { lifestealPercent: 0.12 },
      staticShockStunChance: 0.20,
      gryphonThunder: { combo: 5, damage: 35 },
      krakenSurge: { damageReduction: 0.15, threshold: 40, damage: 30, heal: 15 },
      fenrirBlizzard: { damageReduction: 0.10, shieldInterval: 3 }
    });

    const skinBuffIds = duelBuffs.skinBuffs.map(b => b.id);
    assert.ok(skinBuffIds.includes('cheat_death'), 'Must include cheat_death');
    assert.ok(skinBuffIds.includes('pounce'), 'Must include pounce');
    assert.ok(skinBuffIds.includes('vampiric'), 'Must include vampiric');
    assert.ok(skinBuffIds.includes('stun'), 'Must include stun');
    assert.ok(skinBuffIds.includes('gryphon'), 'Must include gryphon');
    assert.ok(skinBuffIds.includes('kraken'), 'Must include kraken');
    assert.ok(skinBuffIds.includes('fenrir'), 'Must include fenrir');
  });

  await t.test('7. Combat Passives in answerQuestion (Kirin Cheat Death)', () => {
    const rawDb = db.getDb();
    const uniqueNick = 'test_pet_turn_' + Date.now();
    const player = db.registerPlayer(uniqueNick, 'pass123', 1);
    const subj = rawDb.prepare('SELECT id FROM subjects WHERE is_active=1 LIMIT 1').get();

    // Start session
    const sRes = db.startSession(player.id, subj.id, { mode: 'BATTLE' });
    const sId = sRes.sessionId;

    // Equip pet_kirin and test Cheat Death
    rawDb.prepare("UPDATE game_sessions SET flags_json=? WHERE id=?").run(JSON.stringify({
      shield: 0,
      passives: calculatePassives(['pet_kirin'], ITEMS)
    }), sId);

    // Set player HP to 5 so fatal monster damage triggers cheat death
    rawDb.prepare("UPDATE game_sessions SET player_hp=5, boss_hp=200 WHERE id=?").run(sId);

    const sq = rawDb.prepare(`
      SELECT sq.*, q.answer_index
      FROM session_questions sq
      JOIN questions q ON q.id=sq.question_id
      WHERE sq.session_id=? AND sq.order_index=0
    `).get(sId);
    let optOrder = [];
    try { optOrder = JSON.parse(sq.option_order || '[]'); } catch (e) {}
    const correctDisplay = optOrder.length > 0 ? optOrder.indexOf(sq.answer_index) : sq.answer_index;
    const wrongIdx = (correctDisplay + 1) % 4;

    const res = db.answerQuestion(sId, player.id, sq.question_id, wrongIdx);
    // Player should survive with 1 HP and 25 Shield due to Kirin Miracle
    assert.equal(res.session.playerHp, 1, 'Kirin cheat death must keep player at 1 HP');
    assert.equal(res.session.flags.shield, 25, 'Kirin cheat death must grant +25 shield');
    assert.ok(res.session.flags.cheatDeathUsed, 'cheatDeathUsed flag must be true');
  });
});
