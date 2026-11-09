(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Passives = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

const SET_BONUSES = [
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

  return {
    SET_BONUSES,
    calculatePassives
  };
}));
