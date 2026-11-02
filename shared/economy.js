'use strict';

const ECONOMY = {
  answerDrop: {
    coinChance:  { 1: 0.25, 2: 0.35, 3: 0.50 },
    coinRange:   { 1: [1, 2], 2: [2, 4], 3: [4, 6] },
    criticalMult: 1.5,
    itemChance:  { 1: 0.03, 2: 0.05, 3: 0.08 },
    itemRarity:  { COMMON: 85, RARE: 13, EPIC: 2, LEGENDARY: 0 },
  },
  boss: {
    baseCoins: 15, perStar: 10, perAvgDifficulty: 5,
    difficultyMult: (avg) => 1 + (avg - 1) * 0.5,
    itemRolls: { win: 1, threeStars: 1 },
    itemRarity: { COMMON: 70, RARE: 22, EPIC: 7, LEGENDARY: 1 },
    pityEpicAfter: 10,
  },
  firstDefeatBonus: 25,
  duplicateRefund: { COMMON: 5, RARE: 15, EPIC: 40, LEGENDARY: 100 },
  price: { COMMON: 30, RARE: 90, EPIC: 250, LEGENDARY: 700 },
  mysteryBoxPrice: 60,
  dailyCoinCap: 300,
};

const ITEMS = [
  // --- HATS ---
  { id: 'hat_explorer', slot: 'hat', name: 'Topi Penjelajah', rarity: 'COMMON', isStarter: true },
  { id: 'hat_headphones', slot: 'hat', name: 'Headphone Keren', rarity: 'COMMON', isStarter: false },
  { id: 'hat_chef', slot: 'hat', name: 'Topi Koki', rarity: 'COMMON', isStarter: false },
  { id: 'hat_pirate', slot: 'hat', name: 'Topi Bajak Laut', rarity: 'RARE', isStarter: false },
  { id: 'hat_knight', slot: 'hat', name: 'Helm Ksatria', rarity: 'RARE', isStarter: false },
  { id: 'hat_bunny', slot: 'hat', name: 'Telinga Kelinci', rarity: 'RARE', isStarter: false },
  { id: 'hat_wizard', slot: 'hat', name: 'Topi Penyihir', rarity: 'EPIC', isStarter: false },
  { id: 'hat_crown', slot: 'hat', name: 'Mahkota Emas', rarity: 'LEGENDARY', isStarter: false },

  // --- OUTFITS ---
  { id: 'outfit_vest', slot: 'outfit', name: 'Rompi Rimba', rarity: 'COMMON', isStarter: true },
  { id: 'outfit_stripes', slot: 'outfit', name: 'Kaos Belang', rarity: 'COMMON', isStarter: false },
  { id: 'outfit_labcoat', slot: 'outfit', name: 'Jas Ilmuwan', rarity: 'COMMON', isStarter: false },
  { id: 'outfit_cape', slot: 'outfit', name: 'Jubah Pahlawan', rarity: 'RARE', isStarter: false },
  { id: 'outfit_armor', slot: 'outfit', name: 'Zirah Baja', rarity: 'EPIC', isStarter: false },
  { id: 'outfit_robe', slot: 'outfit', name: 'Jubah Bintang', rarity: 'EPIC', isStarter: false },

  // --- WEAPONS / TOOLS ---
  { id: 'weapon_book', slot: 'weapon', name: 'Buku Ajaib', rarity: 'COMMON', isStarter: false },
  { id: 'weapon_telescope', slot: 'weapon', name: 'Teropong Bintang', rarity: 'COMMON', isStarter: false },
  { id: 'weapon_shield', slot: 'weapon', name: 'Perisai Biru', rarity: 'RARE', isStarter: false },
  { id: 'weapon_sword', slot: 'weapon', name: 'Pedang Perak', rarity: 'RARE', isStarter: false },
  { id: 'weapon_wand', slot: 'weapon', name: 'Tongkat Bintang', rarity: 'EPIC', isStarter: false },

  // --- PETS ---
  { id: 'pet_cat', slot: 'pet', name: 'Kucing Oren', rarity: 'COMMON', isStarter: false },
  { id: 'pet_dog', slot: 'pet', name: 'Anjing Ceria', rarity: 'COMMON', isStarter: false },
  { id: 'pet_penguin', slot: 'pet', name: 'Pinguin Lucu', rarity: 'RARE', isStarter: false },
  { id: 'pet_fox', slot: 'pet', name: 'Rubah Cerdik', rarity: 'RARE', isStarter: false },
  { id: 'pet_owl', slot: 'pet', name: 'Burung Hantu Bijak', rarity: 'EPIC', isStarter: false },
  { id: 'pet_dragon', slot: 'pet', name: 'Naga Mungil', rarity: 'LEGENDARY', isStarter: false },

  // --- BACKGROUNDS ---
  { id: 'bg_meadow', slot: 'bg', name: 'Padang Rumput', rarity: 'COMMON', isStarter: true },
  { id: 'bg_sky', slot: 'bg', name: 'Langit Cerah', rarity: 'COMMON', isStarter: false },
  { id: 'bg_sunset', slot: 'bg', name: 'Senja Hangat', rarity: 'RARE', isStarter: false },
  { id: 'bg_candy', slot: 'bg', name: 'Negeri Permen', rarity: 'RARE', isStarter: false },
  { id: 'bg_cave', slot: 'bg', name: 'Gua Misterius', rarity: 'EPIC', isStarter: false },
  { id: 'bg_night', slot: 'bg', name: 'Malam Berbintang', rarity: 'EPIC', isStarter: false },

  // --- FRAMES (BINGKAI AVATAR) ---
  { id: 'frame_wood', slot: 'frame', name: 'Bingkai Kayu', rarity: 'COMMON', isStarter: true },
  { id: 'frame_leaf', slot: 'frame', name: 'Bingkai Daun Rimbun', rarity: 'COMMON', isStarter: false },
  { id: 'frame_silver', slot: 'frame', name: 'Bingkai Perak Bersinar', rarity: 'RARE', isStarter: false },
  { id: 'frame_flame', slot: 'frame', name: 'Bingkai Api Berkobar', rarity: 'RARE', isStarter: false },
  { id: 'frame_gold', slot: 'frame', name: 'Bingkai Emas Kerajaan', rarity: 'EPIC', isStarter: false },
  { id: 'frame_rainbow', slot: 'frame', name: 'Bingkai Pelangi Ajaib', rarity: 'LEGENDARY', isStarter: false },

  // --- TITLES (GELAR PETUALANG) ---
  { id: 'title_rookie', slot: 'title', name: 'Pelajar Pemula', rarity: 'COMMON', isStarter: true },
  { id: 'title_hunter', slot: 'title', name: 'Pemburu Monster', rarity: 'RARE', isStarter: false },
  { id: 'title_sage', slot: 'title', name: 'Cendekiawan Cilik', rarity: 'RARE', isStarter: false },
  { id: 'title_combo', slot: 'title', name: 'Raja Combo', rarity: 'EPIC', isStarter: false },
  { id: 'title_king', slot: 'title', name: 'Penakluk Monsterdex', rarity: 'LEGENDARY', isStarter: false },

  // --- PERMANENT SHOP UPGRADES ---
  { id: 'slot_skill_4', slot: 'permanent', name: 'Slot Skill Tambahan (Slot ke-4)', rarity: 'EPIC', price: 400, isStarter: false },
];

const SKILL_MAX_LEVEL = 5;

const SKILLS = [
  {
    id: 'eliminate_one',
    name: 'Coret Satu',
    icon: '✂️',
    costEnergy: [1, 1, 1, 1, 1],
    effectDesc: 'Coret 1 pilihan jawaban yang salah',
    maxUses: [3, 3, 4, 4, 5],
    isStarter: true,
    unlockLevel: 1,
  },
  {
    id: 'eagle_eye',
    name: 'Mata Elang',
    icon: '🦅',
    costEnergy: [2, 2, 2, 1, 1],
    effectDesc: 'Coret 2 pilihan jawaban yang salah',
    maxUses: [2, 2, 3, 3, 4],
    isStarter: true,
    unlockLevel: 1,
  },
  {
    id: 'heal',
    name: 'Ramuan Hijau',
    icon: '🧪',
    costEnergy: [3, 3, 3, 3, 3],
    effectDesc: 'Pulihkan HP pemain +25 / +35 / +45 / +55 / +65',
    maxUses: [2, 2, 2, 3, 3],
    isStarter: true,
    unlockLevel: 1,
  },
  {
    id: 'shield',
    name: 'Perisai Kayu',
    icon: '🛡️',
    costEnergy: [2, 2, 2, 2, 2],
    effectDesc: 'Serap damage pemain berikutnya 20 / 30 / 50 / 70 / 100',
    maxUses: [2, 2, 2, 3, 3],
    isStarter: false,
    unlockLevel: 2,
  },
  {
    id: 'power_strike',
    name: 'Tebasan Super',
    icon: '⚔️',
    costEnergy: [3, 3, 3, 3, 2],
    effectDesc: 'Damage boss soal ini ×2 / ×2.5 / ×3 / ×3.5 / ×4 bila benar',
    maxUses: [2, 2, 2, 3, 3],
    isStarter: false,
    unlockLevel: 3,
  },
  {
    id: 'time_freeze',
    name: 'Waktu Beku',
    icon: '❄️',
    costEnergy: [3, 3, 3, 2, 2],
    effectDesc: '+8 / +10 / +12 / +15 / +20 detik pada soal ini',
    maxUses: [2, 2, 2, 3, 3],
    isStarter: false,
    unlockLevel: 4,
  },
  {
    id: 'combo_keeper',
    name: 'Penjaga Combo',
    icon: '🔥',
    costEnergy: [2, 2, 2, 2, 1],
    effectDesc: 'Streak tidak reset pada salah/timeout berikutnya',
    maxUses: [1, 1, 2, 2, 3],
    isStarter: false,
    unlockLevel: 5,
  },
  {
    id: 'lucky_pouch',
    name: 'Kantong Hoki',
    icon: '💰',
    costEnergy: [2, 2, 2, 2, 2],
    effectDesc: 'Sisa pertempuran: peluang drop koin ×2, jumlah koin ×1.5 / ×2 / ×2.5 / ×3 / ×3.5',
    maxUses: [1, 1, 2, 2, 2],
    isStarter: false,
    unlockLevel: 6,
  },
  {
    id: 'second_chance',
    name: 'Jimat Keberuntungan',
    icon: '🍀',
    costEnergy: [4, 4, 3, 3, 3],
    effectDesc: 'Salah → coba sekali lagi; damage boss ×0.5 / 0.7 / 1.0 / 1.0 / 1.2',
    maxUses: [1, 1, 1, 2, 2],
    isStarter: false,
    unlockLevel: 8,
  },
];

const SKILL_BASE_UPGRADE = { 1: 100, 2: 250, 3: 500, 4: 900 };
const SKILL_MULTIPLIERS = {
  eliminate_one: 0.6,
  eagle_eye: 1.0,
  heal: 1.0,
  shield: 1.0,
  time_freeze: 1.1,
  combo_keeper: 1.1,
  power_strike: 1.25,
  lucky_pouch: 1.25,
  second_chance: 1.5,
};

function getSkillUpgradeCost(skillId, currentLevel) {
  if (currentLevel >= SKILL_MAX_LEVEL) return null;
  const base = SKILL_BASE_UPGRADE[currentLevel] || 100;
  const mult = SKILL_MULTIPLIERS[skillId] || 1.0;
  return Math.round(base * mult);
}

const SKINS = ['#FFDDB8', '#F2B98C', '#D9955F', '#A66A3F', '#7A4A2A'];
const HAIRS = ['#2B1B3D', '#6B3F1D', '#E8B84A', '#C8453A', '#3A7BD5', '#7C4DFF'];
const K = '#2B1B3D';
const st = `stroke="${K}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;

const BG_COLORS = {
  bg_meadow: ['#B9EBFF', '#7BD65B'],
  bg_sky: ['#9BE0FF', '#E6F8FF'],
  bg_sunset: ['#FFD27A', '#FF7A8A'],
  bg_candy: ['#FFC3E1', '#FFA0C8'],
  bg_cave: ['#6B5B95', '#2D2250'],
  bg_night: ['#4A3A8F', '#1B1340'],
};

const BOSS_MOVES = {
  hutan:  { name: 'Akar Jerat', kind: 'TIME_PRESSURE', desc: 'Waktu berkurang 30%!' },
  rawa:   { name: 'Lendir Lengket', kind: 'SLIME_COVER', desc: 'Lendir menghalangi pandangan!' },
  gua:    { name: 'Gema Kristal', kind: 'ARMOR', desc: 'Pertahanan kristal boss x0.7 damage!' },
  api:    { name: 'Semburan Api', kind: 'CURSE', desc: 'Kutukan api! Damage pemain x1.5!' },
  es:     { name: 'Badai Es', kind: 'FREEZE_OPTIONS', desc: 'Pilihan membeku sejenak!' },
  laut:   { name: 'Pusaran Air', kind: 'HEAL_BOSS', desc: 'Jika salah, boss pulih +8 HP!' },
  langit: { name: 'Petir Kilat', kind: 'TIME_PRESSURE', desc: 'Petir! Waktu -40%, serangan x1.3!' },
  hantu:  { name: 'Sedot Energi', kind: 'DRAIN', desc: 'Energi pemain tersedot -2!' },
  mesin:  { name: 'Segel Sistem', kind: 'SKILL_LOCK', desc: 'Sistem tersegel! Skill terkunci!' },
  manis:  { name: 'Regenerasi Gula', kind: 'REGEN', desc: 'Boss memulihkan +5 HP!' },
};

module.exports = {
  ECONOMY,
  ITEMS,
  SKILLS,
  SKILL_MAX_LEVEL,
  SKILL_BASE_UPGRADE,
  SKILL_MULTIPLIERS,
  getSkillUpgradeCost,
  SKINS,
  HAIRS,
  BG_COLORS,
  BOSS_MOVES,
};
