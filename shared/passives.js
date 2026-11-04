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
    if (p.winHeal) stats.winHeal += p.winHeal;
    if (p.lastStand) stats.lastStand = true;
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
      if (b.dragonBreathDamageBonus && stats.dragonBreathDamage > 0) stats.dragonBreathDamage += b.dragonBreathDamageBonus;
      stats.badges.push(set.desc);
    }
  }

  // Hard Caps for Balance
  stats.dodgeRate = Math.min(0.35, Math.round(stats.dodgeRate * 100) / 100);
  stats.startShield = Math.min(50, stats.startShield);
  stats.bonusTime = Math.min(5, stats.bonusTime);
  stats.critChance = Math.min(0.40, Math.round(stats.critChance * 100) / 100);

  return stats;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SET_BONUSES,
    calculatePassives
  };
}
if (typeof window !== 'undefined') {
  window.Passives = {
    SET_BONUSES,
    calculatePassives
  };
}