(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Passives = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

const SET_BONUSES = [
  // 2 Mahaset Bonus Mythic Baru
  {
    id: 'set_pantheon_batara',
    name: 'Set Pantheon Batara Nusantara',
    icon: '⚡',
    items: ['hat_batara_surya', 'outfit_antakusuma', 'weapon_nagasasra', 'bg_kahyangan'],
    bonus: { startShield: 50, immuneNegative: true, bataraLightning: 25 },
    desc: 'Kedaulatan Batara: +50 Perisai Awal, Kebal Status Negatif & Sambaran Petir Dewata 25 True DMG saat Crit'
  },
  {
    id: 'set_voidwalker_throne',
    name: 'Set Singgasana Kosmik Voidwalker',
    icon: '🌌',
    items: ['hat_chronos_abyss', 'outfit_void_singularity', 'weapon_genesis_staff', 'bg_multiverse_rift'],
    bonus: { bonusTime: 2.0, voidwalkerEfficiency: true, temporalReversal: true },
    desc: 'Penguasa Kehampaan: Waktu +2.0s, Efisiensi Skill Ganda & Membalikkan 50% Damage Bos'
  },

  {
    id: 'set_explorer',
    name: 'Set Penjelajah Rimba',
    icon: '🌿',
    items: ['hat_explorer', 'outfit_vest', 'pet_cat', 'bg_meadow'],
    bonus: { startShield: 10, coinBonus: 0.05 },
    desc: 'Insting Hutan: +10 Perisai Awal & +5% Bonus Koin'
  },
  {
    id: 'set_knight',
    name: 'Set Benteng Ksatria Baja',
    icon: '🛡️',
    items: ['hat_knight', 'outfit_armor', 'weapon_sword', 'weapon_shield'],
    bonus: { startShield: 20, thornsDamage: 5 },
    desc: 'Tembok Baja: +20 Perisai Awal & 5 Serangan Balik (Thorns)'
  },
  {
    id: 'set_wizard',
    name: 'Set Arkana Bintang Kosmik',
    icon: '✨',
    items: ['hat_wizard', 'outfit_robe', 'weapon_wand', 'pet_owl', 'bg_night'],
    bonus: { critChance: 0.10 },
    desc: 'Supernova Mind: +10% Critical Chance'
  },
  {
    id: 'set_pirate',
    name: 'Set Bajak Laut Samudra',
    icon: '🏴‍☠️',
    items: ['hat_pirate', 'outfit_stripes', 'bg_sunset', 'pet_fox'],
    bonus: { coinBonus: 0.25, critChance: 0.05 },
    desc: 'Penjarahan Emas: +25% Koin Drop & +5% Critical Chance'
  },
  {
    id: 'set_monarch',
    name: 'Set Kaisar Legendaris',
    icon: '👑',
    items: ['hat_crown', 'pet_dragon', 'frame_rainbow', 'title_king'],
    bonus: { startShield: 30, dodgeRate: 0.10, dragonBreathDamageBonus: 20 },
    desc: 'Aura Kejayaan: +30 Perisai, +10% Hindaran & Semburan Api Naga +20 DMG'
  },
  // 5 Set Baru Sinergi Pet RPG
  {
    id: 'set_glade',
    name: 'Set Penjaga Hutan Purba',
    icon: '🦌',
    items: ['hat_explorer', 'outfit_vest', 'pet_deer', 'bg_meadow'],
    bonus: { dodgeRate: 0.08, startShield: 15 },
    desc: 'Naluri Satwa Hutan: +8% Hindaran Tambahan & +15 Perisai Awal'
  },
  {
    id: 'set_abyssal',
    name: 'Set Pemburu Arus Abisal',
    icon: '🪼',
    items: ['hat_pirate', 'outfit_stripes', 'pet_jellyfish', 'bg_cave'],
    bonus: { staticShockStunChance: 0.10, coinBonus: 0.15 },
    desc: 'Sentakan Ombak Gelap: Peluang Stun Musuh naik +10% & Bonus Koin +15%'
  },
  {
    id: 'set_celestial_overlord',
    name: 'Set Maharaja Bintang Langit',
    icon: '🌌',
    items: ['hat_crown', 'outfit_robe', 'pet_kirin', 'bg_aurora'],
    bonus: { startShield: 35, critChance: 0.10, healOnCorrect: 2 },
    desc: 'Kedaulatan Bintang: +35 Perisai Awal, +10% Crit Chance & +2 HP tiap Benar'
  },
  {
    id: 'set_beastmaster',
    name: 'Set Panglima Perang Taring Baja',
    icon: '🐅',
    items: ['hat_knight', 'outfit_armor', 'pet_tiger', 'weapon_sword'],
    bonus: { thornsDamage: 6, critMultiplier: 2.5 },
    desc: 'Taring Besi: Pengganda Crit Naik ke x2.5 & Pantulan Duri +6 DMG'
  },
  {
    id: 'set_glacial',
    name: 'Set Badai Kutub Utara',
    icon: '❄️',
    items: ['hat_wizard', 'weapon_wand', 'pet_fenrir', 'bg_sky'],
    bonus: { freezeTimeBonus: 2.0, damageReduction: 0.12 },
    desc: 'Gletser Absolut: Waktu Beku +2.0s & Reduksi Kerusakan +12%'
  },
  // 5 Sinergi Set Bonus Skin RPG Baru
  {
    id: 'set_holy_sun_knight',
    name: 'Set Ksatria Surya',
    icon: '☀️',
    items: ['weapon_excalibur', 'outfit_paladin', 'frame_sakura', 'bg_temple'],
    bonus: { startShield: 20, critChance: 0.05, damageReduction: 0.10, emergencyShield: true },
    desc: 'Aura Cahaya Kebenaran: +20 Perisai, +5% Crit, Reduksi 10% & Darurat Ilahi saat HP < 35%'
  },
  {
    id: 'set_cyber_vanguard',
    name: 'Set Neorunner Siber',
    icon: '⚡',
    items: ['weapon_crossbow', 'outfit_cyberpunk', 'frame_gear', 'bg_cyber_city'],
    bonus: { bonusTime: 1.0, empShock: { combo: 3, damage: 15 } },
    desc: 'Matrix Overclock: +1.0s Waktu & Combo 3 EMP Shock 15 True DMG + 1 Energi'
  },
  {
    id: 'set_shadow_shinobi',
    name: 'Set Siluet Bayangan',
    icon: '🥷',
    items: ['weapon_dagger', 'outfit_ninja', 'frame_lightning', 'bg_volcano'],
    bonus: { dodgeRate: 0.06, critChance: 0.04, counterStrike: { damage: 12 } },
    desc: 'Serangan Balik Cermin: +6% Hindaran, +4% Crit & Sukses Hindar Balas 12 DMG'
  },
  {
    id: 'set_grand_scholar',
    name: 'Set Cendekia Nusantara',
    icon: '📜',
    items: ['weapon_quill', 'outfit_traditional', 'frame_chalkboard', 'bg_library'],
    bonus: { xpBonus: 0.10, coinBonus: 0.08, perfectClearBonusCoin: 50 },
    desc: 'Pencerahan Budi Pekerti: +10% EXP, +8% Koin & Sempurna 100% Dapat +50 Koin'
  },
  {
    id: 'set_astral_sovereign',
    name: 'Set Penguasa Kosmik',
    icon: '🌌',
    items: ['weapon_scythe', 'outfit_astral_king', 'frame_supernova', 'bg_nebula'],
    bonus: { dodgeRate: 0.04, critChance: 0.04, startShield: 15, cosmicDrain: { percent: 0.15 } },
    desc: 'Singgasana Kehampaan: All Stats +4%, +15 Perisai & Sedot 15% Total DMG jadi HP'
  }
];

function calculatePassives(equippedItemIds = [], itemsCatalog = []) {
  const stats = {
    // 16 Item Mythic & Mahaset Baru:
    solarBurn: null,
    freezeImmunity: false,
    timeRewind: null,
    chronoSiphon: null,
    counterBlast: false,
    voidCharge: null,
    armorPen: null,
    instantStrikeChance: 0,
    skillCostDiscount: 0,
    lifeCatalyst: null,
    fullEnergyBoost: 0,
    tidalStun: null,
    perpetualBubble: null,
    purification: false,
    nirvanaRebirth: null,
    moltenProsperity: null,
    firstGrace: false,
    quickAnswerGrace: null,
    brutalSuppressor: 0,
    quantumEchoChance: 0,
    streakSafeguardOnce: false,
    comboMultiplierCap: 1.5,
    freeEliminateOnCombo: 0,
    allPassivesBoost: 0,
    prestigeShimmer: false,
    weaknessExploitation: 0,
    hardQuestionMastery: null,
    maxHpBonus: 0,
    trapOptionIntuition: false,
    perfectAccuracyJackpot: 0,
    maxEnergyPermanentBonus: 0,
    battleRegenInterval: null,
    dailyCoinCapMultiplier: 1,
    highCoinDropRate: 0,
    tripleDuplicateRefund: false,
    immuneNegative: false,
    bataraLightning: 0,
    voidwalkerEfficiency: false,
    temporalReversal: false,
    dodgeRate: 0,
    startShield: 0,
    bonusTime: 0,
    critChance: 0,
    critMultiplier: 1.5,
    damageReduction: 0,
    coinBonus: 0,
    xpBonus: 0,
    correctDamageBonus: 0,
    bossDamageBonusPercent: 0,
    comboDamageBonus: null,
    comboDamagePercent: 0,
    healOnCorrect: 0,
    comboRegen: null,
    comboEnergyChance: null,
    streakProtectChance: 0,
    dragonBreathChance: 0,
    dragonBreathDamage: 0,
    freeEnergyChance: 0,
    freezeTimeBonus: 0,
    thornsDamage: 0,
    winHeal: 0,
    lastStand: false,
    // 28 Pet RPG Pasif Baru:
    coinBonusChance: null,
    timeoutDamageReduction: 0,
    speedAnswerXp: null,
    lossCoinProtect: 0,
    lootChanceBonus: 0,
    comboCritBoost: null,
    sonarEliminateChance: 0,
    comboStealGold: null,
    perfectAccuracyXpBonus: 0,
    earlyDamageReduction: null,
    pounceAutoCrit: null,
    kingsRoar: null,
    hawkeye: null,
    vampiricBite: null,
    staticShockStunChance: 0,
    venomBloom: null,
    cheatDeath: false,
    gryphonThunder: null,
    krakenSurge: null,
    fenrirBlizzard: null,
    // 40 Skin RPG Baru Pasif & Sinergi:
    quickShot: null,
    holySmite: null,
    voltSurge: null,
    magmaBurst: null,
    supernovaBurst: null,
    turn1Energy: 0,
    empShock: null,
    counterStrike: null,
    emergencyShield: false,
    astralEmergency: false,
    cosmicDrain: null,
    perfectClearBonusCoin: 0,
    shadowStepCrit: false,
    overdriveEnergyBoost: false,
    activeSets: [],
    badges: []
  };

  if (!Array.isArray(equippedItemIds)) return stats;
  const eqSet = new Set(equippedItemIds.filter(Boolean));

  for (const it of itemsCatalog) {
    if (!eqSet.has(it.id) || !it.passive) continue;
    const p = it.passive;
    if (p.dodgeRate) stats.dodgeRate += p.dodgeRate;
    if (p.startShield) stats.startShield += p.startShield;
    if (p.bonusTime) stats.bonusTime += p.bonusTime;
    if (p.critChance) stats.critChance += p.critChance;
    if (p.critMultiplier && p.critMultiplier > stats.critMultiplier) stats.critMultiplier = p.critMultiplier;
    if (p.damageReduction) stats.damageReduction += p.damageReduction;
    if (p.coinBonus) stats.coinBonus += p.coinBonus;
    if (p.xpBonus) stats.xpBonus += p.xpBonus;
    if (p.correctDamageBonus) stats.correctDamageBonus += p.correctDamageBonus;
    if (p.bossDamageBonusPercent) stats.bossDamageBonusPercent += p.bossDamageBonusPercent;
    if (p.comboDamageBonus) stats.comboDamageBonus = p.comboDamageBonus;
    if (p.comboDamagePercent) stats.comboDamagePercent += p.comboDamagePercent;
    if (p.healOnCorrect) stats.healOnCorrect += p.healOnCorrect;
    if (p.comboRegen) stats.comboRegen = p.comboRegen;
    if (p.comboEnergyChance) stats.comboEnergyChance = p.comboEnergyChance;
    if (p.streakProtectChance && p.streakProtectChance > stats.streakProtectChance) stats.streakProtectChance = p.streakProtectChance;
    if (p.dragonBreathChance) stats.dragonBreathChance += p.dragonBreathChance;
    if (p.dragonBreathDamage) stats.dragonBreathDamage += p.dragonBreathDamage;
    if (p.freeEnergyChance) stats.freeEnergyChance += p.freeEnergyChance;
    if (p.freezeTimeBonus) stats.freezeTimeBonus += p.freezeTimeBonus;
    if (p.thornsDamage) stats.thornsDamage += p.thornsDamage;
    if (p.winHeal) stats.winHeal += p.winHeal;
    if (p.lastStand) stats.lastStand = true;

    // Pasif Spesifik Pet Baru:
    if (p.coinBonusChance) stats.coinBonusChance = p.coinBonusChance;
    if (p.timeoutDamageReduction) stats.timeoutDamageReduction += p.timeoutDamageReduction;
    if (p.speedAnswerXp) stats.speedAnswerXp = p.speedAnswerXp;
    if (p.lossCoinProtect) stats.lossCoinProtect += p.lossCoinProtect;
    if (p.lootChanceBonus) stats.lootChanceBonus += p.lootChanceBonus;
    if (p.comboCritBoost) stats.comboCritBoost = p.comboCritBoost;
    if (p.sonarEliminateChance) stats.sonarEliminateChance += p.sonarEliminateChance;
    if (p.comboStealGold) stats.comboStealGold = p.comboStealGold;
    if (p.perfectAccuracyXpBonus) stats.perfectAccuracyXpBonus += p.perfectAccuracyXpBonus;
    if (p.earlyDamageReduction) stats.earlyDamageReduction = p.earlyDamageReduction;
    if (p.pounceAutoCrit) stats.pounceAutoCrit = p.pounceAutoCrit;
    if (p.kingsRoar) stats.kingsRoar = p.kingsRoar;
    if (p.hawkeye) {
      stats.hawkeye = p.hawkeye;
      if (p.hawkeye.freezeTime) stats.freezeTimeBonus += p.hawkeye.freezeTime;
    }
    if (p.vampiricBite) stats.vampiricBite = p.vampiricBite;
    if (p.staticShockStunChance) stats.staticShockStunChance += p.staticShockStunChance;
    if (p.venomBloom) stats.venomBloom = p.venomBloom;
    if (p.cheatDeath) stats.cheatDeath = true;
    if (p.gryphonThunder) stats.gryphonThunder = p.gryphonThunder;
    if (p.krakenSurge) {
      stats.krakenSurge = p.krakenSurge;
      if (p.krakenSurge.damageReduction) stats.damageReduction += p.krakenSurge.damageReduction;
    }
    if (p.fenrirBlizzard) {
      stats.fenrirBlizzard = p.fenrirBlizzard;
      if (p.fenrirBlizzard.damageReduction) stats.damageReduction += p.fenrirBlizzard.damageReduction;
    }

    // Pasif Spesifik Skin Baru:
    if (p.quickShot) stats.quickShot = p.quickShot;
    if (p.holySmite) stats.holySmite = p.holySmite;
    if (p.voltSurge) stats.voltSurge = p.voltSurge;
    if (p.magmaBurst) stats.magmaBurst = p.magmaBurst;
    if (p.supernovaBurst) stats.supernovaBurst = p.supernovaBurst;
    if (p.turn1Energy) stats.turn1Energy += p.turn1Energy;
    if (p.empShock) stats.empShock = p.empShock;
    if (p.counterStrike) stats.counterStrike = p.counterStrike;
    if (p.emergencyShield) stats.emergencyShield = true;
    if (p.astralEmergency) stats.astralEmergency = true;
    if (p.cosmicDrain) stats.cosmicDrain = p.cosmicDrain;
    if (p.perfectClearBonusCoin) stats.perfectClearBonusCoin += p.perfectClearBonusCoin;
    if (p.shadowStepCrit) stats.shadowStepCrit = true;
    if (p.overdriveEnergyBoost) stats.overdriveEnergyBoost = true;

    
    // Mythic Passives
    if (p.solarBurn) stats.solarBurn = p.solarBurn;
    if (p.freezeImmunity) stats.freezeImmunity = true;
    if (p.timeRewind) stats.timeRewind = p.timeRewind;
    if (p.chronoSiphon) stats.chronoSiphon = p.chronoSiphon;
    if (p.counterBlast) stats.counterBlast = true;
    if (p.voidCharge) stats.voidCharge = p.voidCharge;
    if (p.armorPen) stats.armorPen = p.armorPen;
    if (p.instantStrikeChance) stats.instantStrikeChance += p.instantStrikeChance;
    if (p.skillCostDiscount) stats.skillCostDiscount += p.skillCostDiscount;
    if (p.lifeCatalyst) stats.lifeCatalyst = p.lifeCatalyst;
    if (p.fullEnergyBoost) stats.fullEnergyBoost += p.fullEnergyBoost;
    if (p.tidalStun) stats.tidalStun = p.tidalStun;
    if (p.perpetualBubble) stats.perpetualBubble = p.perpetualBubble;
    if (p.purification) stats.purification = true;
    if (p.nirvanaRebirth) stats.nirvanaRebirth = p.nirvanaRebirth;
    if (p.moltenProsperity) stats.moltenProsperity = p.moltenProsperity;
    if (p.firstGrace) stats.firstGrace = true;
    if (p.quickAnswerGrace) stats.quickAnswerGrace = p.quickAnswerGrace;
    if (p.brutalSuppressor) stats.brutalSuppressor = Math.max(stats.brutalSuppressor, p.brutalSuppressor);
    if (p.quantumEchoChance) stats.quantumEchoChance += p.quantumEchoChance;
    if (p.streakSafeguardOnce) stats.streakSafeguardOnce = true;
    if (p.comboMultiplierCap && p.comboMultiplierCap > stats.comboMultiplierCap) stats.comboMultiplierCap = p.comboMultiplierCap;
    if (p.freeEliminateOnCombo) stats.freeEliminateOnCombo = p.freeEliminateOnCombo;
    if (p.allPassivesBoost) stats.allPassivesBoost += p.allPassivesBoost;
    if (p.prestigeShimmer) stats.prestigeShimmer = true;
    if (p.weaknessExploitation) stats.weaknessExploitation += p.weaknessExploitation;
    if (p.hardQuestionMastery) stats.hardQuestionMastery = p.hardQuestionMastery;
    if (p.maxHpBonus) stats.maxHpBonus += p.maxHpBonus;
    if (p.trapOptionIntuition) stats.trapOptionIntuition = true;
    if (p.perfectAccuracyJackpot) stats.perfectAccuracyJackpot += p.perfectAccuracyJackpot;
    if (p.maxEnergyPermanentBonus) stats.maxEnergyPermanentBonus += p.maxEnergyPermanentBonus;
    if (p.battleRegenInterval) stats.battleRegenInterval = p.battleRegenInterval;
    if (p.dailyCoinCapMultiplier && p.dailyCoinCapMultiplier > stats.dailyCoinCapMultiplier) stats.dailyCoinCapMultiplier = p.dailyCoinCapMultiplier;
    if (p.highCoinDropRate) stats.highCoinDropRate = Math.max(stats.highCoinDropRate, p.highCoinDropRate);
    if (p.tripleDuplicateRefund) stats.tripleDuplicateRefund = true;
    if (p.desc) stats.badges.push(p.desc);
  }

  // Check Set Bonuses
  for (const set of SET_BONUSES) {
    const isComplete = set.items.every(itemId => eqSet.has(itemId));
    if (isComplete) {
      stats.activeSets.push(set);
      const b = set.bonus;
      if (b.dodgeRate) stats.dodgeRate += b.dodgeRate;
      if (b.startShield) stats.startShield += b.startShield;
      if (b.critChance) stats.critChance += b.critChance;
      if (b.coinBonus) stats.coinBonus += b.coinBonus;
      if (b.thornsDamage) stats.thornsDamage += b.thornsDamage;
      if (b.critMultiplier && b.critMultiplier > stats.critMultiplier) stats.critMultiplier = b.critMultiplier;
      if (b.freezeTimeBonus) stats.freezeTimeBonus += b.freezeTimeBonus;
      if (b.damageReduction) stats.damageReduction += b.damageReduction;
      if (b.healOnCorrect) stats.healOnCorrect += b.healOnCorrect;
      if (b.staticShockStunChance) stats.staticShockStunChance += b.staticShockStunChance;
      if (b.dragonBreathDamageBonus && stats.dragonBreathDamage > 0) stats.dragonBreathDamage += b.dragonBreathDamageBonus;
      if (b.bonusTime) stats.bonusTime += b.bonusTime;
      if (b.xpBonus) stats.xpBonus += b.xpBonus;
      if (b.emergencyShield) stats.emergencyShield = true;
      if (b.empShock) stats.empShock = b.empShock;
      if (b.counterStrike) stats.counterStrike = b.counterStrike;
      if (b.cosmicDrain) stats.cosmicDrain = b.cosmicDrain;
      if (b.perfectClearBonusCoin) stats.perfectClearBonusCoin += b.perfectClearBonusCoin;
      
      if (b.immuneNegative) stats.immuneNegative = true;
      if (b.bataraLightning) stats.bataraLightning = b.bataraLightning;
      if (b.voidwalkerEfficiency) stats.voidwalkerEfficiency = true;
      if (b.temporalReversal) stats.temporalReversal = true;
      stats.badges.push(set.desc);
    }
  }

  // Hard Caps for Balance
  stats.dodgeRate = Math.min(0.35, Math.round(stats.dodgeRate * 100) / 100);
  stats.startShield = Math.min(60, stats.startShield);
  stats.bonusTime = Math.min(5, Math.round(stats.bonusTime * 10) / 10);
  stats.critChance = Math.min(0.40, Math.round(stats.critChance * 100) / 100);
  stats.staticShockStunChance = Math.min(0.35, Math.round(stats.staticShockStunChance * 100) / 100);
  stats.damageReduction = Math.min(0.40, Math.round(stats.damageReduction * 100) / 100);
  stats.freezeTimeBonus = Math.min(5, Math.round(stats.freezeTimeBonus * 10) / 10);
  stats.lossCoinProtect = Math.min(0.80, Math.round(stats.lossCoinProtect * 100) / 100);

  return stats;
}

const SLOT_NAMES_ID = {
  hat: 'Topi',
  outfit: 'Baju',
  weapon: 'Senjata',
  pet: 'Pet',
  bg: 'Latar',
  frame: 'Bingkai',
  title: 'Gelar'
};

function getEquippedSetsSynergy(equippedItemIds = [], itemsCatalog = []) {
  if (!Array.isArray(equippedItemIds)) return [];
  const eqSet = new Set(equippedItemIds.filter(Boolean));
  let catalog = Array.isArray(itemsCatalog) && itemsCatalog.length > 0 ? itemsCatalog : [];
  if (catalog.length === 0 && typeof window !== 'undefined' && window.Economy?.ITEMS) {
    catalog = window.Economy.ITEMS;
  }
  const catalogMap = new Map();
  for (const it of catalog) {
    if (it && it.id) catalogMap.set(it.id, it);
  }

  const results = [];
  for (const set of SET_BONUSES) {
    if (!Array.isArray(set.items) || set.items.length === 0) continue;
    const equipped = [];
    const missing = [];

    for (const itemId of set.items) {
      const it = catalogMap.get(itemId);
      const slot = it?.slot || (itemId.startsWith('hat_') ? 'hat' : (itemId.startsWith('outfit_') ? 'outfit' : (itemId.startsWith('weapon_') ? 'weapon' : (itemId.startsWith('pet_') ? 'pet' : (itemId.startsWith('bg_') ? 'bg' : (itemId.startsWith('frame_') ? 'frame' : (itemId.startsWith('title_') ? 'title' : '')))))));
      const slotLabel = SLOT_NAMES_ID[slot] || slot || 'Item';
      const name = it?.name || (itemId === 'bg_aurora' ? 'Cahaya Aurora Kosmik' : itemId);
      const isEquipped = eqSet.has(itemId);
      const isOwned = Boolean(it?.owned);

      const member = {
        id: itemId,
        name,
        slot,
        slotLabel,
        owned: isEquipped || isOwned,
        equipped: isEquipped
      };

      if (isEquipped) {
        equipped.push(member);
      } else {
        missing.push(member);
      }
    }

    if (equipped.length > 0) {
      results.push({
        id: set.id,
        name: set.name,
        icon: set.icon || '✨',
        desc: set.desc || '',
        bonus: set.bonus || {},
        totalItems: set.items.length,
        equippedCount: equipped.length,
        missingCount: missing.length,
        isActive: missing.length === 0,
        isPartial: missing.length > 0,
        equipped,
        missing
      });
    }
  }

  results.sort((a, b) => {
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    return b.equippedCount - a.equippedCount;
  });

  return results;
}

  return {
    SET_BONUSES,
    calculatePassives,
    getEquippedSetsSynergy,
    SLOT_NAMES_ID
  };
}));
