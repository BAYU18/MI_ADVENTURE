const { SET_BONUSES, calculatePassives } = (typeof require !== 'undefined') ? require('./passives') : ((typeof window !== 'undefined' && window.Passives) ? window.Passives : { SET_BONUSES: [], calculatePassives: () => ({}) });
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
  {
    "id": "hat_explorer",
    "slot": "hat",
    "name": "Topi Penjelajah",
    "rarity": "COMMON",
    "isStarter": true,
    "passive": {
      "dodgeRate": 0.01,
      "desc": "Hindaran +1%"
    },
    "lore": "Topi rimba tahan banting. Memberi 1% peluang menghindari damage saat salah menjawab."
  },
  {
    "id": "hat_headphones",
    "slot": "hat",
    "name": "Headphone Keren",
    "rarity": "COMMON",
    "isStarter": false,
    "passive": {
      "bonusTime": 1,
      "desc": "Fokus Waktu +1 Detik"
    },
    "lore": "Dentuman musik santai membuat pemain tenang, menambah +1 detik pada timer soal."
  },
  {
    "id": "hat_chef",
    "slot": "hat",
    "name": "Topi Koki",
    "rarity": "COMMON",
    "isStarter": false,
    "passive": {
      "coinBonus": 0.02,
      "desc": "Bonus Koin +2%"
    },
    "lore": "Semangat pantang menyerah juru masak, meningkatkan drop koin sebesar 2%."
  },
  {
    "id": "hat_pirate",
    "slot": "hat",
    "name": "Topi Bajak Laut",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.03,
      "coinBonus": 0.05,
      "desc": "Hindaran +3% & Koin +5%"
    },
    "lore": "Kelincahan kapten laut menghindari jebakan dan insting mencari harta karun."
  },
  {
    "id": "hat_knight",
    "slot": "hat",
    "name": "Helm Ksatria",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.04,
      "startShield": 5,
      "desc": "Hindaran +4% & Perisai +5 HP"
    },
    "lore": "Baja tempaan benteng kerajaan menyerap benturan pertama dalam duel."
  },
  {
    "id": "hat_bunny",
    "slot": "hat",
    "name": "Telinga Kelinci",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.05,
      "desc": "Hindaran +5%"
    },
    "lore": "Refleks pendengaran yang sangat tajam, lincah melompati kesalahan soal."
  },
  {
    "id": "hat_wizard",
    "slot": "hat",
    "name": "Topi Penyihir",
    "rarity": "EPIC",
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.07,
      "freeEnergyChance": 0.1,
      "desc": "Hindaran +7% & Hemat Energi 10%"
    },
    "lore": "Aura sihir arkana melindungi pemakainya dan memberi 10% peluang gratis energi skill."
  },
  {
    "id": "hat_crown",
    "slot": "hat",
    "name": "Mahkota Emas",
    "rarity": "LEGENDARY",
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.1,
      "bonusTime": 2,
      "desc": "Hindaran +10% & Waktu +2 Detik"
    },
    "lore": "Karisma agung sang juara sejati! Peluang hindaran 10% dan ketenangan waktu +2 detik."
  },
  {
    "id": "outfit_vest",
    "slot": "outfit",
    "name": "Rompi Rimba",
    "rarity": "COMMON",
    "isStarter": true,
    "passive": {
      "startShield": 5,
      "desc": "Perisai Awal +5 HP"
    },
    "lore": "Bahan kanvas tebal memberi perisai darurat 5 HP di awal duel/boss."
  },
  {
    "id": "outfit_stripes",
    "slot": "outfit",
    "name": "Kaos Belang",
    "rarity": "COMMON",
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.01,
      "desc": "Hindaran +1%"
    },
    "lore": "Pola belang yang mengaburkan fokus lawan, memberi 1% hindaran."
  },
  {
    "id": "outfit_labcoat",
    "slot": "outfit",
    "name": "Jas Ilmuwan",
    "rarity": "COMMON",
    "isStarter": false,
    "passive": {
      "bonusTime": 1,
      "desc": "Fokus Waktu +1 Detik"
    },
    "lore": "Kerapian berpikir seorang peneliti menambah waktu analisis +1 detik."
  },
  {
    "id": "outfit_cape",
    "slot": "outfit",
    "name": "Jubah Pahlawan",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "startShield": 12,
      "desc": "Perisai Awal +12 HP"
    },
    "lore": "Kain berkibar gagah yang menahan pukulan pertama lawan sebesar 12 HP."
  },
  {
    "id": "outfit_armor",
    "slot": "outfit",
    "name": "Zirah Baja",
    "rarity": "EPIC",
    "isStarter": false,
    "passive": {
      "startShield": 25,
      "damageReduction": 2,
      "desc": "Perisai Awal +25 HP & Reduksi Damage -2"
    },
    "lore": "Plat baja kokoh! Memberikan 25 Perisai dan mengurangi damage masuk sebesar 2 poin."
  },
  {
    "id": "outfit_robe",
    "slot": "outfit",
    "name": "Jubah Bintang",
    "rarity": "EPIC",
    "isStarter": false,
    "passive": {
      "startShield": 15,
      "comboRegen": {
        "combo": 3,
        "hp": 3
      },
      "desc": "Perisai Awal +15 HP & Regen 3 HP / 3 Combo"
    },
    "lore": "Ditenun dari debu galaksi. Memberikan 15 perisai dan memulihkan 3 HP tiap 3 combo."
  },
  {
    "id": "weapon_book",
    "slot": "weapon",
    "name": "Buku Ajaib",
    "rarity": "COMMON",
    "isStarter": false,
    "passive": {
      "correctDamageBonus": 1,
      "desc": "Damage Jawaban Benar +1"
    },
    "lore": "Catatan rumus sakti menambah 1 poin serangan pada setiap jawaban benar."
  },
  {
    "id": "weapon_telescope",
    "slot": "weapon",
    "name": "Teropong Bintang",
    "rarity": "COMMON",
    "isStarter": false,
    "passive": {
      "critChance": 0.02,
      "desc": "Critical Chance +2%"
    },
    "lore": "Melihat kelemahan lawan dari kejauhan, peluang serangan kritis 2% (damage x1.5)."
  },
  {
    "id": "weapon_shield",
    "slot": "weapon",
    "name": "Perisai Biru",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "startShield": 10,
      "dodgeRate": 0.02,
      "desc": "Perisai Awal +10 HP & Hindaran +2%"
    },
    "lore": "Tameng kokoh penjaga ketertiban duel."
  },
  {
    "id": "weapon_sword",
    "slot": "weapon",
    "name": "Pedang Perak",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "critChance": 0.05,
      "critMultiplier": 1.75,
      "desc": "Critical Chance +5% (Dmg x1.75)"
    },
    "lore": "Tebasan kilat perak memberikan 5% peluang Critical Hit (damage x1.75)."
  },
  {
    "id": "weapon_wand",
    "slot": "weapon",
    "name": "Tongkat Bintang",
    "rarity": "EPIC",
    "isStarter": false,
    "passive": {
      "critChance": 0.08,
      "critMultiplier": 2,
      "desc": "Critical Chance +8% (Dmg x2.0)"
    },
    "lore": "Pusaran energi komet! 8% peluang critical dengan daya hancur berlipat ganda."
  },
  {
    "id": "pet_cat",
    "slot": "pet",
    "name": "Kucing Oren",
    "rarity": "COMMON",
    "isStarter": false,
    "passive": {
      "coinBonus": 0.03,
      "desc": "Koin Drop +3%"
    },
    "lore": "Kucing pembawa hoki legendaris yang gemar mengais koin ekstra."
  },
  {
    "id": "pet_dog",
    "slot": "pet",
    "name": "Anjing Ceria",
    "rarity": "COMMON",
    "isStarter": false,
    "passive": {
      "winHeal": 2,
      "desc": "Pemulihan +2 HP saat Menang Duel/Boss"
    },
    "lore": "Gonggongan semangat memulihkan stamina pemain setelah pertarungan sengit."
  },
  {
    "id": "pet_penguin",
    "slot": "pet",
    "name": "Pinguin Lucu",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "freezeTimeBonus": 1.5,
      "desc": "Waktu Beku Alami +1.5 Detik"
    },
    "lore": "Hawa dingin pinguin membuat timer lawan atau boss bergerak lebih lambat."
  },
  {
    "id": "pet_fox",
    "slot": "pet",
    "name": "Rubah Cerdik",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "comboEnergyChance": {
        "combo": 3,
        "chance": 0.15
      },
      "desc": "Peluang +1 Energi 15% Tiap 3 Combo"
    },
    "lore": "Kecerdikan rubah mencuri momentum untuk memulihkan energi skill."
  },
  {
    "id": "pet_owl",
    "slot": "pet",
    "name": "Burung Hantu Bijak",
    "rarity": "EPIC",
    "isStarter": false,
    "passive": {
      "streakProtectChance": 0.5,
      "desc": "Proteksi Streak 1x (Peluang 50%)"
    },
    "lore": "Kebijaksanaan malam: jika salah 1x, combo streak berpeluang 50% tidak langsung hangus."
  },
  {
    "id": "pet_dragon",
    "slot": "pet",
    "name": "Naga Mungil",
    "rarity": "LEGENDARY",
    "isStarter": false,
    "passive": {
      "dragonBreathChance": 0.1,
      "dragonBreathDamage": 20,
      "desc": "Semburan Api Naga (10% Chance Deal 20 Dmg)"
    },
    "lore": "Saat menjawab benar, 10% peluang naga menyemburkan api instan 20 damage!"
  },
  {
    "id": "bg_meadow",
    "slot": "bg",
    "name": "Padang Rumput",
    "rarity": "COMMON",
    "isStarter": true,
    "passive": {
      "bonusTime": 0.5,
      "desc": "Stabilisator Fokus (Waktu +0.5 Detik)"
    },
    "lore": "Hawa sejuk rumput hijau menenangkan detak jantung saat berhitung."
  },
  {
    "id": "bg_sky",
    "slot": "bg",
    "name": "Langit Cerah",
    "rarity": "COMMON",
    "isStarter": false,
    "passive": {
      "coinBonus": 0.02,
      "desc": "Bonus Koin +2%"
    },
    "lore": "Cakrawala biru luas membuka pandangan rezeki berlimpah."
  },
  {
    "id": "bg_sunset",
    "slot": "bg",
    "name": "Senja Hangat",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "startShield": 8,
      "desc": "Perisai Sore +8 HP"
    },
    "lore": "Cahaya tembaga senja meredam serangan pertama lawan."
  },
  {
    "id": "bg_candy",
    "slot": "bg",
    "name": "Negeri Permen",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "comboRegen": {
        "combo": 4,
        "hp": 3
      },
      "desc": "Gula Semangat (+3 HP Tiap 4 Combo)"
    },
    "lore": "Ledakan energi manis memulihkan HP pemain saat bermain cepat."
  },
  {
    "id": "bg_cave",
    "slot": "bg",
    "name": "Gua Misterius",
    "rarity": "EPIC",
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.05,
      "desc": "Gema Kristal (Hindaran +5%)"
    },
    "lore": "Pantulan gema kristal membingungkan musuh dan menepis kesalahan."
  },
  {
    "id": "bg_night",
    "slot": "bg",
    "name": "Malam Berbintang",
    "rarity": "EPIC",
    "isStarter": false,
    "passive": {
      "critChance": 0.04,
      "bonusTime": 1,
      "desc": "Meditasi Bintang (Critical +4% & Waktu +1 Detik)"
    },
    "lore": "Konsentrasi tingkat tinggi di bawah taburan konstelasi bintang."
  },
  {
    "id": "frame_wood",
    "slot": "frame",
    "name": "Bingkai Kayu",
    "rarity": "COMMON",
    "isStarter": true,
    "passive": {
      "xpBonus": 0.01,
      "desc": "Bonus EXP +1%"
    },
    "lore": "Serat kayu jati tua menyerap pengalaman belajar secara konsisten."
  },
  {
    "id": "frame_leaf",
    "slot": "frame",
    "name": "Bingkai Daun Rimbun",
    "rarity": "COMMON",
    "isStarter": false,
    "passive": {
      "healOnCorrect": 1,
      "desc": "Pemulihan +1 HP Tiap Soal Benar"
    },
    "lore": "Kesegaran alam meregenerasi vitalitas sedikit demi sedikit."
  },
  {
    "id": "frame_silver",
    "slot": "frame",
    "name": "Bingkai Perak Bersinar",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "xpBonus": 0.03,
      "coinBonus": 0.03,
      "desc": "Bonus EXP +3% & Koin +3%"
    },
    "lore": "Kilau kemilau perak mengundang apresiasi dan hadiah melimpah."
  },
  {
    "id": "frame_flame",
    "slot": "frame",
    "name": "Bingkai Api Berkobar",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "comboDamageBonus": {
        "minCombo": 3,
        "bonus": 2
      },
      "desc": "Damage Ekstra +2 Saat Combo > 3"
    },
    "lore": "Semangat membara melipatgandakan daya hancur saat beruntun benar."
  },
  {
    "id": "frame_gold",
    "slot": "frame",
    "name": "Bingkai Emas Kerajaan",
    "rarity": "EPIC",
    "isStarter": false,
    "passive": {
      "xpBonus": 0.05,
      "dodgeRate": 0.03,
      "desc": "Bonus EXP +5% & Hindaran +3%"
    },
    "lore": "Lambang aristokrat pejuang yang tangguh dan terhormat."
  },
  {
    "id": "frame_rainbow",
    "slot": "frame",
    "name": "Bingkai Pelangi Ajaib",
    "rarity": "LEGENDARY",
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.03,
      "critChance": 0.03,
      "startShield": 5,
      "coinBonus": 0.05,
      "desc": "All Stats (+3% Dodge, +3% Crit, +5 Shield, +5% Koin)"
    },
    "lore": "Pancaran spektrum magis legendaris yang meningkatkan seluruh aspek petarung."
  },
  {
    "id": "title_rookie",
    "slot": "title",
    "name": "Pelajar Pemula",
    "rarity": "COMMON",
    "isStarter": true,
    "passive": {
      "coinBonus": 0.02,
      "desc": "Semangat Belajar (+2% Koin)"
    },
    "lore": "Langkah awal yang penuh rasa ingin tahu."
  },
  {
    "id": "title_hunter",
    "slot": "title",
    "name": "Pemburu Monster",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "bossDamageBonusPercent": 0.1,
      "desc": "Bane of Beasts (+10% Damage ke Boss)"
    },
    "lore": "Spesialis penakluk monster alam liar, serangan ke boss meningkat tajam."
  },
  {
    "id": "title_sage",
    "slot": "title",
    "name": "Cendekiawan Cilik",
    "rarity": "RARE",
    "isStarter": false,
    "passive": {
      "bonusTime": 2,
      "desc": "Analisis Cepat (Waktu +2 Detik)"
    },
    "lore": "Otak cemerlang yang mampu mengurai soal tersulit dalam hitungan detik."
  },
  {
    "id": "title_combo",
    "slot": "title",
    "name": "Raja Combo",
    "rarity": "EPIC",
    "isStarter": false,
    "passive": {
      "comboDamagePercent": 0.05,
      "desc": "Combo Multiplier (+5% Damage per Tingkat Combo)"
    },
    "lore": "Semakin panjang streak benar, semakin mematikan serangan yang diluncurkan!"
  },
  {
    "id": "title_king",
    "slot": "title",
    "name": "Penakluk Monsterdex",
    "rarity": "LEGENDARY",
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.05,
      "lastStand": true,
      "desc": "Gelar Legenda (Hindaran +5% & Darah Terakhir)"
    },
    "lore": "Jika HP mencapai 0, bertahan dengan 1 HP untuk satu kesempatan terakhir (1x per battle)."
  },
  {
    "id": "slot_skill_4",
    "slot": "permanent",
    "name": "Slot Skill Tambahan (Slot ke-4)",
    "rarity": "EPIC",
    "price": 400,
    "isStarter": false,
    "passive": {
      "desc": "Membuka slot ke-4 untuk membawa 4 skill"
    },
    "lore": "Sabuk keahlian tambahan yang ditempa oleh pandai besi kerajaan."
  }
];

const SKILL_MAX_LEVEL = 5;
const MAX_SKILL_LEVEL = 5;

const ENERGY = {
  max: 5,
  start: 2,
  gain: { CRITICAL: 2, NORMAL: 1, SLOW: 1, WRONG: 0, TIMEOUT: 0 }
};

const DEFAULT_LOADOUT = ['eliminate_one', 'eagle_eye', 'heal'];
const START_SKILLS = ['eliminate_one', 'eagle_eye', 'heal'];

const UPGRADE_BASE = [0, 100, 250, 500, 900];

const SKILLS = [
  {
    id: 'eliminate_one',
    name: 'Coret Satu',
    icon: '✏️',
    unlockLevel: 1,
    cost: [1, 1, 1, 1, 1],
    costEnergy: [1, 1, 1, 1, 1],
    uses: [3, 3, 4, 4, 5],
    maxUses: [3, 3, 4, 4, 5],
    value: [1, 1, 1, 1, 1],
    costMult: 0.6,
    phase: 'P0',
    desc: () => 'Coret 1 jawaban yang salah',
    effectDesc: 'Coret 1 pilihan jawaban yang salah',
    isStarter: true,
  },
  {
    id: 'eagle_eye',
    name: 'Mata Elang',
    icon: '🦅',
    unlockLevel: 1,
    cost: [2, 2, 2, 1, 1],
    costEnergy: [2, 2, 2, 1, 1],
    uses: [2, 2, 3, 3, 4],
    maxUses: [2, 2, 3, 3, 4],
    value: [2, 2, 2, 2, 2],
    costMult: 1.0,
    phase: 'P0',
    desc: () => 'Coret 2 jawaban yang salah',
    effectDesc: 'Coret 2 pilihan jawaban yang salah',
    isStarter: true,
  },
  {
    id: 'heal',
    name: 'Ramuan Hijau',
    icon: '🧪',
    unlockLevel: 1,
    cost: [1, 1, 1, 1, 1],
    costEnergy: [1, 1, 1, 1, 1],
    uses: [2, 2, 2, 3, 3],
    maxUses: [2, 2, 2, 3, 3],
    value: [25, 35, 45, 55, 65],
    costMult: 1.0,
    phase: 'P0',
    desc: (v) => `Pulihkan ${v} HP`,
    effectDesc: 'Pulihkan HP pemain +25 / +35 / +45 / +55 / +65',
    isStarter: true,
  },
  {
    id: 'shield',
    name: 'Perisai Kayu',
    icon: '🛡️',
    unlockLevel: 2,
    cost: [2, 2, 2, 2, 2],
    costEnergy: [2, 2, 2, 2, 2],
    uses: [2, 2, 3, 3, 4],
    maxUses: [2, 2, 3, 3, 4],
    value: [20, 30, 40, 50, 60],
    costMult: 1.0,
    phase: 'P0',
    desc: (v) => `Serap ${v} damage berikutnya`,
    effectDesc: 'Serap damage pemain berikutnya 20 / 30 / 50 / 70 / 100',
    isStarter: false,
  },
  {
    id: 'power_strike',
    name: 'Tebasan Super',
    icon: '⚔️',
    unlockLevel: 3,
    cost: [3, 3, 3, 3, 3],
    costEnergy: [3, 3, 3, 3, 2],
    uses: [2, 2, 2, 3, 3],
    maxUses: [2, 2, 2, 3, 3],
    value: [2, 2.25, 2.5, 2.75, 3],
    costMult: 1.25,
    phase: 'P0',
    desc: (v) => `Damage ke boss ×${v} jika benar`,
    effectDesc: 'Damage boss soal ini ×2 / ×2.5 / ×3 / ×3.5 / ×4 bila benar',
    isStarter: false,
  },
  {
    id: 'time_freeze',
    name: 'Waktu Beku',
    icon: '❄️',
    unlockLevel: 4,
    cost: [3, 3, 3, 3, 3],
    costEnergy: [3, 3, 3, 2, 2],
    uses: [2, 2, 3, 3, 4],
    maxUses: [2, 2, 2, 3, 3],
    value: [8, 10, 12, 14, 16],
    costMult: 1.1,
    phase: 'P0',
    desc: (v) => `Tambah ${v} detik pada soal ini`,
    effectDesc: '+8 / +10 / +12 / +15 / +20 detik pada soal ini',
    isStarter: false,
  },
  {
    id: 'combo_keeper',
    name: 'Penjaga Combo',
    icon: '🔥',
    unlockLevel: 5,
    cost: [2, 2, 2, 2, 2],
    costEnergy: [2, 2, 2, 2, 1],
    uses: [1, 1, 2, 2, 3],
    maxUses: [1, 1, 2, 2, 3],
    value: [1, 1, 1, 1, 1],
    costMult: 1.1,
    phase: 'P1',
    desc: () => 'Streak tidak reset saat salah/timeout berikutnya',
    effectDesc: 'Streak tidak reset pada salah/timeout berikutnya',
    isStarter: false,
  },
  {
    id: 'lucky_pouch',
    name: 'Kantong Hoki',
    icon: '💰',
    unlockLevel: 6,
    cost: [2, 2, 2, 2, 2],
    costEnergy: [2, 2, 2, 2, 2],
    uses: [1, 1, 1, 1, 1],
    maxUses: [1, 1, 2, 2, 2],
    value: [1.5, 1.75, 2, 2.25, 2.5],
    costMult: 1.25,
    phase: 'P1',
    desc: (v) => `Sisa battle: peluang koin ×2, jumlah ×${v}`,
    effectDesc: 'Sisa pertempuran: peluang drop koin ×2, jumlah koin ×1.5 / ×2 / ×2.5 / ×3 / ×3.5',
    isStarter: false,
  },
  {
    id: 'second_chance',
    name: 'Jimat Keberuntungan',
    icon: '🍀',
    unlockLevel: 8,
    cost: [4, 4, 4, 4, 4],
    costEnergy: [4, 4, 3, 3, 3],
    uses: [1, 1, 1, 1, 1],
    maxUses: [1, 1, 1, 2, 2],
    value: [0.5, 0.6, 0.7, 0.85, 1],
    costMult: 1.5,
    phase: 'P1',
    desc: (v) => `Jika salah: coba lagi (damage boss ×${v})`,
    effectDesc: 'Salah → coba sekali lagi; damage boss ×0.5 / 0.7 / 1.0 / 1.0 / 1.2',
    isStarter: false,
  },
  {
    id: 'red_potion',
    name: 'Ramuan Merah',
    icon: '🍷',
    unlockLevel: 5,
    cost: [3, 3, 3, 2, 2],
    costEnergy: [3, 3, 3, 2, 2],
    uses: [1, 1, 1, 2, 2],
    maxUses: [1, 1, 1, 2, 2],
    value: [3.0, 3.5, 3.5, 4.0, 5.0],
    consecutive: [1, 1, 2, 2, 3],
    costMult: 1.3,
    phase: 'P0',
    desc: (v) => `Ganti ke soal termudah & damage ×${v}`,
    effectDesc: 'Lewati soal & ganti ke soal termudah dengan Damage Super: Lv1 (×3.0) / Lv2 (×3.5) / Lv3 (×3.5, 2 soal) / Lv4 (×4.0, 2 soal) / Lv5 (×5.0, 3 soal)',
    isStarter: false,
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
  red_potion: 1.3,
};

function upgradeCost(s, toLevel) {
  if (toLevel > MAX_SKILL_LEVEL) return null;
  return Math.round(UPGRADE_BASE[toLevel - 1] * s.costMult);
}

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
  MAX_SKILL_LEVEL,
  ENERGY,
  DEFAULT_LOADOUT,
  START_SKILLS,
  UPGRADE_BASE,
  SKILL_BASE_UPGRADE,
  SKILL_MULTIPLIERS,
  upgradeCost,
  getSkillUpgradeCost,
  SKINS,
  HAIRS,
  BG_COLORS,
  BOSS_MOVES,
  SET_BONUSES,
  calculatePassives,
};
