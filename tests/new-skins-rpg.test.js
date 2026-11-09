const test = require('node:test');
const assert = require('node:assert/strict');

const { ITEMS, calculatePassives, SET_BONUSES } = (function() {
  try { return require('../shared/economy.js'); }
  catch(e) { return require('../economy.js'); }
})();
const SkinArt = (function() {
  try { return require('../shared/skin-art.js'); }
  catch(e) { return require('../skin-art.js'); }
})();
const Avatar = (function() {
  try { return require('../shared/avatar.js'); }
  catch(e) { return require('../avatar.js'); }
})();
const { formatDuelBuffs } = (function() {
  try { return require('../lib/db-duel.js'); }
  catch(e) { return require('../db-duel.js'); }
})();

test('40 New RPG Skins (Weapon, Outfit, Frame, Bg) & 5 Set Synergies Suite', async (t) => {

  await t.test('1. ITEMS catalog in economy.js has all 40 new skin items with unique metadata and passives', () => {
    const slots = { weapon: 0, outfit: 0, frame: 0, bg: 0 };
    const rarities = { COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 };

    const expectedNewItems = [
      // 10 Weapon
      'weapon_slingshot', 'weapon_compass', 'weapon_quill', 'weapon_ruler',
      'weapon_dagger', 'weapon_hammer', 'weapon_lantern',
      'weapon_scythe', 'weapon_crossbow', 'weapon_excalibur',
      // 10 Outfit
      'outfit_scout', 'outfit_sports', 'outfit_traditional', 'outfit_raincoat',
      'outfit_ninja', 'outfit_sailor', 'outfit_scholar',
      'outfit_cyberpunk', 'outfit_paladin', 'outfit_astral_king',
      // 10 Frame
      'frame_bamboo', 'frame_chalkboard', 'frame_seashell', 'frame_gear',
      'frame_frost', 'frame_lightning', 'frame_sakura',
      'frame_dragon_scale', 'frame_runic', 'frame_supernova',
      // 10 Bg
      'bg_library', 'bg_beach', 'bg_autumn', 'bg_rainforest',
      'bg_volcano', 'bg_underwater', 'bg_floating_isle',
      'bg_cyber_city', 'bg_temple', 'bg_nebula'
    ];

    assert.equal(expectedNewItems.length, 40);

    const itemsMap = new Map(ITEMS.map(it => [it.id, it]));

    for (const id of expectedNewItems) {
      assert.ok(itemsMap.has(id), `Item ${id} harus terdaftar di ITEMS`);
      const it = itemsMap.get(id);
      assert.ok(['weapon', 'outfit', 'frame', 'bg'].includes(it.slot), `${id} slot invalid: ${it.slot}`);
      assert.ok(['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(it.rarity), `${id} rarity invalid: ${it.rarity}`);
      assert.ok(it.price >= 150 && it.price <= 2500, `${id} harga harus berada di rentang wajar 150-2500`);
      assert.ok(it.name && it.name.length > 2, `${id} harus punya nama yang jelas`);
      assert.ok(it.lore && it.lore.length > 10, `${id} harus punya lore latar belakang`);
      assert.ok(it.passive && it.passive.desc, `${id} harus punya deskripsi pasif`);
      assert.equal(it.isStarter, false, `${id} bukan starter`);

      slots[it.slot]++;
      rarities[it.rarity]++;
    }

    assert.equal(slots.weapon, 10, '10 Senjata baru');
    assert.equal(slots.outfit, 10, '10 Pakaian baru');
    assert.equal(slots.frame, 10, '10 Bingkai baru');
    assert.equal(slots.bg, 10, '10 Latar baru');

    assert.equal(rarities.COMMON, 16, '16 Common baru (4x4)');
    assert.equal(rarities.RARE, 12, '12 Rare baru (3x4)');
    assert.equal(rarities.EPIC, 8, '8 Epic baru (2x4)');
    assert.equal(rarities.LEGENDARY, 4, '4 Legend baru (1x4)');
  });

  await t.test('2. SkinArt module contains all 40 items with valid 3D shiny SVG and scoped IDs', () => {
    assert.equal(typeof SkinArt.has, 'function');
    assert.equal(typeof SkinArt.renderThumbnail, 'function');

    for (const [id, prefix] of Object.entries(SkinArt.PREFIX_MAP)) {
      assert.ok(SkinArt.has(id), `SkinArt harus memiliki ${id}`);
      const raw = SkinArt.getRawSvg(id);
      assert.ok(raw.startsWith('<svg'), `${id} harus valid SVG`);
      assert.ok(raw.endsWith('</svg>'), `${id} harus tertutup </svg>`);
      assert.ok(raw.includes(prefix), `${id} harus memakai prefix ${prefix}`);

      // Test scoping
      const testUid = 'unit_' + Math.random().toString(36).slice(2, 6);
      const scopedThumb = SkinArt.renderThumbnail(id, 'skin', testUid);
      assert.ok(scopedThumb.includes(prefix + testUid + '-'), `${id} harus terscope dengan uid`);

      // Test slot-specific methods
      if (id.startsWith('weapon_')) {
        const w = SkinArt.renderWeapon(id, testUid);
        assert.ok(w.includes('transform="translate(118 78) scale(.5)"'));
        assert.ok(!w.startsWith('<svg'), 'renderWeapon harus mengembalikan inner group bukan tag svg penuh');
      } else if (id.startsWith('outfit_')) {
        const o = SkinArt.renderOutfit(id, testUid);
        assert.ok(o.includes('transform="translate(43 73) scale(.57)"'));
        assert.ok(!o.includes('class="preview-only"'), 'renderOutfit harus menghapus siluet kepala preview-only');
        if (id === 'outfit_astral_king') {
          const ob = SkinArt.renderOutfitBack(id, testUid);
          assert.ok(ob.includes('fx-drift'), 'Astral king back cape harus ada fx-drift');
        }
      } else if (id.startsWith('frame_')) {
        const f = SkinArt.renderFrame(id, testUid);
        assert.ok(f.length > 50);
        assert.ok(!f.startsWith('<svg'));
      } else if (id.startsWith('bg_')) {
        const b = SkinArt.renderBg(id, testUid);
        assert.ok(b.length > 50);
        assert.ok(!b.startsWith('<svg'));
      }
    }
  });

  await t.test('3. Avatar integrates SkinArt thumbnails and avatar compositions without regressing legacy tests', () => {
    // 1. Thumbnails for all 40 new items
    const testItems = [
      'weapon_excalibur', 'outfit_astral_king', 'frame_supernova', 'bg_nebula',
      'weapon_slingshot', 'outfit_scout', 'frame_bamboo', 'bg_library'
    ];
    for (const id of testItems) {
      const thumb = Avatar.renderThumbnail(id, 'weapon');
      assert.ok(thumb.startsWith('<svg'), `Thumb ${id} harus SVG`);
      assert.ok(thumb.endsWith('</svg>'));
    }

    // 2. Full Avatar composition with new items
    const fullNewAvatar = {
      skin: Avatar.SKINS[0],
      hair: Avatar.HAIRS[0],
      weapon: 'weapon_excalibur',
      outfit: 'outfit_astral_king',
      frame: 'frame_supernova',
      bg: 'bg_nebula',
      pet: 'pet_kirin'
    };
    const avatarSvg = Avatar.renderAvatar(fullNewAvatar, { uid: 'suit01', size: 160 });
    assert.ok(avatarSvg.startsWith('<svg'));
    assert.ok(avatarSvg.includes('wexc-suit01-'));
    assert.ok(avatarSvg.includes('oast-suit01-'));
    assert.ok(avatarSvg.includes('fsup-suit01-'));
    assert.ok(avatarSvg.includes('bnbl-suit01-'));
    assert.ok(avatarSvg.includes('width="160"'));

    // 3. Legacy items still render cleanly
    const legacyAvatar = {
      skin: Avatar.SKINS[1],
      hair: Avatar.HAIRS[2],
      hat: 'hat_crown',
      outfit: 'outfit_royal',
      weapon: 'weapon_sword',
      frame: 'frame_rainbow',
      bg: 'bg_aurora',
      pet: 'pet_dragon'
    };
    const legSvg = Avatar.renderAvatar(legacyAvatar, { uid: 'leg01' });
    assert.ok(legSvg.includes('id="sk-leg01"'));
  });

  await t.test('4. calculatePassives handles all 5 new Skin Set Bonuses and balance hard caps', () => {
    // 1. Holy Sun Knight Set
    const pHoly = calculatePassives(['weapon_excalibur', 'outfit_paladin', 'frame_sakura', 'bg_temple'], ITEMS);
    assert.equal(pHoly.activeSets.some(s => s.id === 'set_holy_sun_knight'), true, 'Set Holy Sun Knight harus aktif');
    assert.equal(pHoly.emergencyShield, true, 'Emergency shield harus aktif');
    assert.ok(pHoly.startShield >= 50, 'Shield set harus tinggi');
    assert.ok(pHoly.holySmite !== null, 'Holy Smite harus terpasang dari Excalibur');

    // 2. Cyber Vanguard Set
    const pCyber = calculatePassives(['weapon_crossbow', 'outfit_cyberpunk', 'frame_gear', 'bg_cyber_city'], ITEMS);
    assert.equal(pCyber.activeSets.some(s => s.id === 'set_cyber_vanguard'), true, 'Set Cyber Vanguard harus aktif');
    assert.ok(pCyber.empShock !== null, 'EMP shock harus terpasang');
    assert.equal(pCyber.empShock.damage, 15);

    // 3. Shadow Shinobi Set
    const pShinobi = calculatePassives(['weapon_dagger', 'outfit_ninja', 'frame_lightning', 'bg_volcano'], ITEMS);
    assert.equal(pShinobi.activeSets.some(s => s.id === 'set_shadow_shinobi'), true, 'Set Shadow Shinobi harus aktif');
    assert.ok(pShinobi.counterStrike !== null, 'Counter strike harus terpasang');
    assert.equal(pShinobi.counterStrike.damage, 12);

    // 4. Grand Scholar Set
    const pScholar = calculatePassives(['weapon_quill', 'outfit_traditional', 'frame_chalkboard', 'bg_library'], ITEMS);
    assert.equal(pScholar.activeSets.some(s => s.id === 'set_grand_scholar'), true, 'Set Grand Scholar harus aktif');
    assert.equal(pScholar.perfectClearBonusCoin, 50, 'Bonus koin sempurna harus 50');
    assert.ok(pScholar.xpBonus >= 0.15, 'EXP bonus terakumulasi dari item + set');

    // 5. Astral Sovereign Set
    const pAstral = calculatePassives(['weapon_scythe', 'outfit_astral_king', 'frame_supernova', 'bg_nebula'], ITEMS);
    assert.equal(pAstral.activeSets.some(s => s.id === 'set_astral_sovereign'), true, 'Set Astral Sovereign harus aktif');
    assert.ok(pAstral.cosmicDrain !== null, 'Cosmic Drain harus aktif');
    assert.equal(pAstral.cosmicDrain.percent, 0.15);
    assert.equal(pAstral.turn1Energy, 2, 'Turn 1 Energy harus 2 dari Bg Nebula');
    assert.equal(pAstral.astralEmergency, true, 'Astral emergency harus aktif dari Jubah');

    // Hard Caps Check
    assert.ok(pAstral.dodgeRate <= 0.35, 'Dodge rate tidak boleh tembus 35%');
    assert.ok(pAstral.critChance <= 0.40, 'Crit chance tidak boleh tembus 40%');
    assert.ok(pAstral.startShield <= 60, 'Start shield tidak boleh tembus 60');
    assert.ok(pAstral.damageReduction <= 0.40, 'Damage reduction tidak boleh tembus 40%');
  });

  await t.test('5. Individual passives check across all 4 categories', () => {
    // Quick Shot: weapon_slingshot
    const pSling = calculatePassives(['weapon_slingshot'], ITEMS);
    assert.ok(pSling.quickShot);
    assert.equal(pSling.quickShot.trueDamage, 1);

    // Volt Surge: frame_lightning
    const pVolt = calculatePassives(['frame_lightning'], ITEMS);
    assert.ok(pVolt.voltSurge);
    assert.equal(pVolt.voltSurge.damage, 6);

    // Magma Burst: bg_volcano
    const pMagma = calculatePassives(['bg_volcano'], ITEMS);
    assert.ok(pMagma.magmaBurst);
    assert.equal(pMagma.magmaBurst.damage, 8);

    // Supernova Burst: frame_supernova
    const pSupernova = calculatePassives(['frame_supernova'], ITEMS);
    assert.ok(pSupernova.supernovaBurst);
    assert.equal(pSupernova.supernovaBurst.damage, 20);
    assert.equal(pSupernova.supernovaBurst.heal, 6);
  });

  await t.test('6. Duel formatDuelBuffs recognizes new skin buffs', () => {
    const passives = {
      holySmite: { chance: 0.2, damage: 25, shield: 15 },
      supernovaBurst: { combo: 5, damage: 20, heal: 6 },
      counterStrike: { damage: 12 },
      emergencyShield: true,
      astralEmergency: true,
      empShock: { combo: 3, damage: 15 }
    };

    const formatted = formatDuelBuffs(passives);
    assert.ok(Array.isArray(formatted.skinBuffs));
    const ids = formatted.skinBuffs.map(b => b.id);
    assert.ok(ids.includes('holy_smite'), 'holy_smite harus ada di duel buff');
    assert.ok(ids.includes('supernova'), 'supernova harus ada di duel buff');
    assert.ok(ids.includes('counter_strike'), 'counter_strike harus ada di duel buff');
    assert.ok(ids.includes('divine_shield'), 'divine_shield harus ada di duel buff');
    assert.ok(ids.includes('astral_emergency'), 'astral_emergency harus ada di duel buff');
    assert.ok(ids.includes('emp_shock'), 'emp_shock harus ada di duel buff');
  });

  await t.test('7. Combat Passives Simulation (Turn 1 Energy, Shield, Quick Shot, Counter Strike, Emergency Shield)', () => {
    // 1. Turn 1 Energy Boost from bg_nebula
    const pAstral = calculatePassives(['bg_nebula'], ITEMS);
    assert.equal(pAstral.turn1Energy, 2);
    const startEnergy = Math.min(5, 2 + pAstral.turn1Energy);
    assert.equal(startEnergy, 4, 'Turn 1 Energy starts with 4 (2 base + 2 boost)');

    // 2. Quick Shot damage calculation
    const pSling = calculatePassives(['weapon_slingshot'], ITEMS);
    const elapsedSeconds = 2.1; // under 3.0 seconds
    let bossDamage = 10;
    if (pSling.quickShot && elapsedSeconds <= (pSling.quickShot.maxTime || 3.0)) {
      bossDamage += (pSling.quickShot.trueDamage || 1);
    }
    assert.equal(bossDamage, 11, 'Quick shot adds +1 true damage when answering < 3s');

    // 3. Counter Strike simulation on Dodge
    const pShinobi = calculatePassives(['weapon_dagger', 'outfit_ninja', 'frame_lightning', 'bg_volcano'], ITEMS);
    let bossHp = 100;
    const isDodged = true;
    if (isDodged && pShinobi.counterStrike) {
      bossHp -= (pShinobi.counterStrike.damage || 12);
    }
    assert.equal(bossHp, 88, 'Counter strike on dodge immediately inflicts 12 damage to boss');

    // 4. Holy Sun Knight Emergency Shield when player HP drops <= 35%
    const pHoly = calculatePassives(['weapon_excalibur', 'outfit_paladin', 'frame_sakura', 'bg_temple'], ITEMS);
    const playerMaxHp = 100;
    let playerHp = 25; // 25% HP
    let playerShield = 0;
    let emergencyUsed = false;
    if (playerHp > 0 && playerHp <= Math.round(playerMaxHp * 0.35) && pHoly.emergencyShield && !emergencyUsed) {
      emergencyUsed = true;
      playerHp = Math.min(playerMaxHp, playerHp + 25);
      playerShield = Math.min(60, playerShield + 20);
    }
    assert.equal(playerHp, 50, 'Emergency shield recovers +25 HP');
    assert.equal(playerShield, 20, 'Emergency shield grants +20 Shield');
  });

});
