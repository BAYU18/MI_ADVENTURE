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
  duplicateRefund: { COMMON: 5, RARE: 15, EPIC: 40, LEGENDARY: 100, MYTHIC: 300 },
  price: { COMMON: 30, RARE: 90, EPIC: 250, LEGENDARY: 700, MYTHIC: 2600 },
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
    "id": "pet_phoenix",
    "slot": "pet",
    "name": "Bayi Burung Phoenix",
    "rarity": "LEGENDARY",
    "price": 2500,
    "isStarter": false,
    "passive": {
      "lastStand": true,
      "damageReduction": 0.20,
      "desc": "Aura Kebangkitan Abu: Reduksi 20% Dmg & +1 ⚡ saat HP < 25%"
    },
    "lore": "Bayi Phoenix abadi yang bangkit dari abu bara pertempuran."
  },
  {
    "id": "pet_hamster",
    "slot": "pet",
    "name": "Hamster Tabungan",
    "rarity": "COMMON",
    "price": 180,
    "isStarter": false,
    "passive": {
      "coinBonusChance": { "chance": 0.25, "amount": 5 },
      "desc": "Pipi Emas: 25% Peluang +5 Koin tiap Jawaban Benar"
    },
    "lore": "Hamster bulat menggemaskan yang rajin menabung koin emas di pipinya."
  },
  {
    "id": "pet_rabbit",
    "slot": "pet",
    "name": "Kelinci Lincah",
    "rarity": "COMMON",
    "price": 200,
    "isStarter": false,
    "passive": {
      "bonusTime": 0.8,
      "desc": "Lompatan Gesit: Waktu Timer Soal +0.8 Detik"
    },
    "lore": "Kelinci lincah bertelinga panjang yang memberi waktu ekstra untuk berpikir jernih."
  },
  {
    "id": "pet_chick",
    "slot": "pet",
    "name": "Anak Ayam Semangat",
    "rarity": "COMMON",
    "price": 200,
    "isStarter": false,
    "passive": {
      "xpBonus": 0.05,
      "desc": "Kicau Pagi Semangat: Bonus XP Petualang +5%"
    },
    "lore": "Anak ayam yang baru menetas penuh semangat belajar dan menyemarakkan petualangan."
  },
  {
    "id": "pet_turtle",
    "slot": "pet",
    "name": "Kura-Kura Sabar",
    "rarity": "COMMON",
    "price": 220,
    "isStarter": false,
    "passive": {
      "startShield": 8,
      "desc": "Tempurung Perlindungan: Perisai Tempur Awal +8 Shield"
    },
    "lore": "Kura-kura bijak dengan tempurung kokoh penahan hantaman serangan awal lawan."
  },
  {
    "id": "pet_panda",
    "slot": "pet",
    "name": "Panda Santai",
    "rarity": "COMMON",
    "price": 220,
    "isStarter": false,
    "passive": {
      "timeoutDamageReduction": 0.25,
      "desc": "Ketenangan Zen: Reduksi Damage Timeout 25%"
    },
    "lore": "Panda santai yang mengajarkan ketenangan saat waktu hampir habis."
  },
  {
    "id": "pet_bear",
    "slot": "pet",
    "name": "Beruang Madu",
    "rarity": "COMMON",
    "price": 250,
    "isStarter": false,
    "passive": {
      "correctDamageBonus": 2,
      "desc": "Cakaran Madu: Serangan Jawaban Benar +2 Flat DMG"
    },
    "lore": "Beruang madu perkasa yang menambah bobot serangan pada setiap jawaban tepat."
  },
  {
    "id": "pet_frog",
    "slot": "pet",
    "name": "Katak Loncat",
    "rarity": "COMMON",
    "price": 210,
    "isStarter": false,
    "passive": {
      "speedAnswerXp": { "maxTime": 3.0, "bonusXp": 10 },
      "desc": "Lidah Kilat: Menjawab Benar <3s dapat +10 Bonus XP"
    },
    "lore": "Katak tangkas yang menyukai kecepatan berpikir dan respon kilat siswa."
  },
  {
    "id": "pet_duck",
    "slot": "pet",
    "name": "Bebek Riang",
    "rarity": "COMMON",
    "price": 190,
    "isStarter": false,
    "passive": {
      "lossCoinProtect": 0.40,
      "desc": "Bulu Kedap Air: Proteksi Penalti Kalah Koin 40%"
    },
    "lore": "Bebek riang yang menjaga tabungan koin agar tidak tergerus saat kalah duel."
  },
  {
    "id": "pet_mouse",
    "slot": "pet",
    "name": "Tikus Penjelajah",
    "rarity": "COMMON",
    "price": 200,
    "isStarter": false,
    "passive": {
      "lootChanceBonus": 0.08,
      "desc": "Endus Jejak: Peluang Drop Peti Harta +8%"
    },
    "lore": "Tikus penjelajah berhidung tajam pengendus peti harta karun tersembunyi."
  },
  {
    "id": "pet_koala",
    "slot": "pet",
    "name": "Koala Teduh",
    "rarity": "COMMON",
    "price": 210,
    "isStarter": false,
    "passive": {
      "winHeal": 3,
      "desc": "Istirahat Nyaman: Pemulihan Stamina +3 HP saat Menang"
    },
    "lore": "Koala teduh yang menyegarkan kembali stamina karakter seusai pertempuran."
  },
  {
    "id": "pet_wolf",
    "slot": "pet",
    "name": "Serigala Rimba",
    "rarity": "RARE",
    "price": 500,
    "isStarter": false,
    "passive": {
      "comboCritBoost": { "minCombo": 4, "critBoost": 0.12 },
      "desc": "Auman Kawanan: Tiap 4 Combo, +12% Crit Chance Giliran Berikutnya"
    },
    "lore": "Serigala rimba yang mengobarkan insting berburu tajam saat rantai kombo terbentuk."
  },
  {
    "id": "pet_hedgehog",
    "slot": "pet",
    "name": "Landak Duri",
    "rarity": "RARE",
    "price": 500,
    "isStarter": false,
    "passive": {
      "thornsDamage": 4,
      "desc": "Duri Pertahanan: Memantulkan 4 True Damage saat Terkena Serangan"
    },
    "lore": "Landak berduri tajam yang membalas setiap benturan musuh dengan sengatan duri."
  },
  {
    "id": "pet_otter",
    "slot": "pet",
    "name": "Berang-Berang Kali",
    "rarity": "RARE",
    "price": 550,
    "isStarter": false,
    "passive": {
      "comboEnergyChance": { "combo": 4, "chance": 1.0, "energy": 1 },
      "desc": "Aliran Sungai Fokus: Tiap 4 Combo Streak Memulihkan +1 Energi"
    },
    "lore": "Berang-berang cerdas yang memanfaatkan momentum kombo untuk mengisi energi semangat."
  },
  {
    "id": "pet_bat",
    "slot": "pet",
    "name": "Kelelawar Gema",
    "rarity": "RARE",
    "price": 520,
    "isStarter": false,
    "passive": {
      "sonarEliminateChance": 0.20,
      "desc": "Ekolokasi Gelap: 20% Peluang Hapus 1 Pilihan Salah di Awal Soal"
    },
    "lore": "Kelelawar gema ultrasonik pendeteksi pilihan jawaban yang menyesatkan."
  },
  {
    "id": "pet_racoon",
    "slot": "pet",
    "name": "Musang Cerdik",
    "rarity": "RARE",
    "price": 550,
    "isStarter": false,
    "passive": {
      "comboStealGold": { "combo": 5, "minGold": 10, "maxGold": 15 },
      "desc": "Copet Harta: Tiap 5 Combo Streak Curi 10-15 Koin Bos"
    },
    "lore": "Musang bertopeng cerdik yang lihai menyelinap mencuri koin dari saku monster bos."
  },
  {
    "id": "pet_deer",
    "slot": "pet",
    "name": "Rusa Cahaya",
    "rarity": "RARE",
    "price": 550,
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.07,
      "desc": "Langkah Anggun: Peluang Hindaran +7% Dodge Rate"
    },
    "lore": "Rusa anggun yang bergerak seringan angin menghindari terkaman lawan."
  },
  {
    "id": "pet_parrot",
    "slot": "pet",
    "name": "Beo Cendekia",
    "rarity": "RARE",
    "price": 600,
    "isStarter": false,
    "passive": {
      "perfectAccuracyXpBonus": 0.30,
      "desc": "Gema Kecerdasan: Akurasi Sempurna (100%) Bonus +30% XP"
    },
    "lore": "Burung beo pintar yang menirukan seluruh hafalan dengan ketepatan sempurna."
  },
  {
    "id": "pet_chameleon",
    "slot": "pet",
    "name": "Bunglon Ilusi",
    "rarity": "RARE",
    "price": 520,
    "isStarter": false,
    "passive": {
      "earlyDamageReduction": { "turns": 2, "reduction": 0.18 },
      "desc": "Kamuflase Mimikri: Reduksi 18% Damage Bos di 2 Giliran Pertama"
    },
    "lore": "Bunglon penyamar ulung yang membingungkan pandangan bos di awal laga."
  },
  {
    "id": "pet_tiger",
    "slot": "pet",
    "name": "Harimau Belang",
    "rarity": "EPIC",
    "price": 1000,
    "isStarter": false,
    "passive": {
      "pounceAutoCrit": { "interval": 5, "multiplier": 2.2 },
      "desc": "Terkaman Mematikan: Tiap Soal ke-5 Dijawab Benar Auto-Crit x2.2 DMG!"
    },
    "lore": "Harimau loreng penguasa rimba purba dengan terkaman serangan kritis mematikan."
  },
  {
    "id": "pet_lion",
    "slot": "pet",
    "name": "Singa Padang Emas",
    "rarity": "EPIC",
    "price": 1100,
    "isStarter": false,
    "passive": {
      "kingsRoar": { "enrageDamageCut": 0.25, "phaseChangeShield": 15 },
      "desc": "Aura Keagungan: Reduksi 25% Enrage Bos & +15 Shield saat Transisi Fase"
    },
    "lore": "Singa padang surai emas yang meredam amarah bos terganas sekalipun."
  },
  {
    "id": "pet_eagle",
    "slot": "pet",
    "name": "Elang Rajawali",
    "rarity": "EPIC",
    "price": 1200,
    "isStarter": false,
    "passive": {
      "hawkeye": { "freezeTime": 2.5, "armorPiercing": 0.15 },
      "freezeTimeBonus": 2.5,
      "desc": "Mata Rajawali: Waktu Beku +2.5s & Tembus 15% Armor Bos"
    },
    "lore": "Elang rajawali sakti penembus awan dengan tatapan tajam membongkar titik lemah bos."
  },
  {
    "id": "pet_crocodile",
    "slot": "pet",
    "name": "Buaya Purba",
    "rarity": "EPIC",
    "price": 1050,
    "isStarter": false,
    "passive": {
      "vampiricBite": { "lifestealPercent": 0.12 },
      "desc": "Kuncian Rawa: Sedot 12% Damage Serangan Menjadi Pemulihan HP"
    },
    "lore": "Buaya rawa purba penyerap daya hidup lawan untuk memperkokoh stamina petualang."
  },
  {
    "id": "pet_jellyfish",
    "slot": "pet",
    "name": "Ubur-Ubur Abisal",
    "rarity": "EPIC",
    "price": 1150,
    "isStarter": false,
    "passive": {
      "staticShockStunChance": 0.20,
      "desc": "Sengatan Statis: 20% Peluang Stun Membatalkan Serangan Bos"
    },
    "lore": "Ubur-ubur bercahaya abisal bermuatan listrik tegangan tinggi pelumpuh aksi musuh."
  },
  {
    "id": "pet_snake",
    "slot": "pet",
    "name": "Kobra Giok Mistis",
    "rarity": "EPIC",
    "price": 1050,
    "isStarter": false,
    "passive": {
      "venomBloom": { "damagePerTurn": 4, "maxStacks": 3 },
      "desc": "Bisa Racun Berbunga: Racun Menumpuk 4 DMG/Turn (Maks 3 Stack = 12 DMG)"
    },
    "lore": "Kobra giok mistis yang menyuntikkan bisa racun lambat melemahkan bos dari dalam."
  },
  {
    "id": "pet_kirin",
    "slot": "pet",
    "name": "Kirin Bintang Suci",
    "rarity": "LEGENDARY",
    "price": 2500,
    "isStarter": false,
    "passive": {
      "cheatDeath": true,
      "desc": "Mukjizat Bintang Surgawi: Kebal Kematian (Cheat Death 1x) +25 Shield +2 Energi"
    },
    "lore": "Kirin bintang suci fajar penyelamat petualang dari ambang kekalahan paling genting."
  },
  {
    "id": "pet_gryphon",
    "slot": "pet",
    "name": "Gryphon Badai Petir",
    "rarity": "LEGENDARY",
    "price": 2500,
    "isStarter": false,
    "passive": {
      "gryphonThunder": { "combo": 5, "damage": 35, "freezeSeconds": 3 },
      "desc": "Sambaran Petir Purba: Tiap 5 Combo Sambaran Kilat 35 True DMG & Stun 3s"
    },
    "lore": "Gryphon badai petir yang menyambar monster bos dengan petir halilintar penghancur pertahanan."
  },
    {
    "id": "pet_leviathan",
    "slot": "pet",
    "name": "Leviathan Samudra Purba",
    "rarity": "MYTHIC",
    "price": 2925,
    "isStarter": false,
    "passive": {
      "krakenSurge": {
        "damageReduction": 0.15,
        "threshold": 40,
        "damage": 30,
        "heal": 15
      },
      "tidalStun": {
        "comboStep": 3
      },
      "perpetualBubble": {
        "shieldPerTurn": 6,
        "maxShield": 30
      },
      "purification": true,
      "desc": "Tidal Torrent: Tiap 3 Combo Stun Bos 1 Giliran, +6 Perisai Gelembung Tiap Soal, Reduksi Dmg 15% & Pembersihan Status Negatif"
    },
    "lore": "Penjaga lautan terdalam bumi yang telah menyaksikan ribuan zaman. Derunya menenggelamkan kemurkaan bos terbuas sekalipun."
  },
  {
    "id": "pet_fenrir",
    "slot": "pet",
    "name": "Serigala Es Nol Mutlak",
    "rarity": "LEGENDARY",
    "price": 2500,
    "isStarter": false,
    "passive": {
      "fenrirBlizzard": { "damageReduction": 0.10, "shieldInterval": 3 },
      "desc": "Badai Gletser Nol Mutlak: Reduksi 10% Dmg Permanen & Tameng Kebal 1x Salah tiap 3 Benar"
    },
    "lore": "Serigala es nol mutlak pelapis zirah kristal salju yang menahan kesalahan petualang."
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
  },
  // ── 40 ITEM SKIN RPG BARU (SENJATA, PAKAIAN, BINGKAI, LATAR) ──
  {
    "id": "weapon_slingshot",
    "slot": "weapon",
    "name": "Ketapel Bambu Ceria",
    "rarity": "COMMON",
    "price": 150,
    "isStarter": false,
    "passive": {
      "quickShot": {
        "maxTime": 3,
        "trueDamage": 1
      },
      "desc": "Quick Shot: Jawab benar < 3s beri +1 True DMG"
    },
    "lore": "Dibuat dari cabang bambu pilihan pegunungan, alat latihan ketangkasan favorit petualang muda."
  },
  {
    "id": "weapon_compass",
    "slot": "weapon",
    "name": "Kompas Penjelajah",
    "rarity": "COMMON",
    "price": 160,
    "isStarter": false,
    "passive": {
      "bonusTime": 0.8,
      "desc": "True Bearing: Timer Soal +0.8 Detik"
    },
    "lore": "Kompas kuningan yang selalu menunjuk ke arah jalan kebenaran dan ilmu pengetahuan."
  },
  {
    "id": "weapon_quill",
    "slot": "weapon",
    "name": "Pena Bulu Emas",
    "rarity": "COMMON",
    "price": 175,
    "isStarter": false,
    "passive": {
      "xpBonus": 0.05,
      "coinBonus": 0.02,
      "desc": "Scholar Scribe: EXP +5% & Koin +2%"
    },
    "lore": "Pena bulu cendekiawan berujung sepuhan emas yang mencatat setiap prestasi dengan rapi."
  },
  {
    "id": "weapon_ruler",
    "slot": "weapon",
    "name": "Penggaris Baja Presisi",
    "rarity": "COMMON",
    "price": 180,
    "isStarter": false,
    "passive": {
      "correctDamageBonus": 1,
      "desc": "Pure Measure: Serangan Benar +1 DMG"
    },
    "lore": "Penggaris logam berskala milimeter presisi, lambang ketelitian dalam menyelesaikan soal matematika."
  },
  {
    "id": "weapon_dagger",
    "slot": "weapon",
    "name": "Belati Bayangan Angin",
    "rarity": "RARE",
    "price": 450,
    "isStarter": false,
    "passive": {
      "critChance": 0.06,
      "critMultiplier": 1.85,
      "desc": "Wind Strike: Crit Chance +6% & Crit x1.85 DMG"
    },
    "lore": "Belati ringan berlapis perak murni yang diayunkan secepat desau angin malam."
  },
  {
    "id": "weapon_hammer",
    "slot": "weapon",
    "name": "Palu Pandai Besi",
    "rarity": "RARE",
    "price": 480,
    "isStarter": false,
    "passive": {
      "comboDamageBonus": {
        "minCombo": 4,
        "bonus": 3
      },
      "desc": "Armor Cracker: Combo 4+ Beri +3 DMG"
    },
    "lore": "Palu tempa yang digunakan untuk membentuk zirah ksatria, sangat tangguh meremukkan pertahanan lawan."
  },
  {
    "id": "weapon_lantern",
    "slot": "weapon",
    "name": "Lentera Mistis Hutan",
    "rarity": "RARE",
    "price": 500,
    "isStarter": false,
    "passive": {
      "startShield": 12,
      "damageReduction": 0.05,
      "desc": "Mystic Ward: Perisai +12 HP & Reduksi Damage 5%"
    },
    "lore": "Lentera bertuah yang menyala dengan api abadi kunang-kunang hutan rimba."
  },
  {
    "id": "weapon_scythe",
    "slot": "weapon",
    "name": "Sabit Bulan Sabit",
    "rarity": "EPIC",
    "price": 950,
    "isStarter": false,
    "passive": {
      "vampiricBite": {
        "lifestealPercent": 0.1
      },
      "comboEnergyChance": {
        "combo": 5,
        "chance": 0.5
      },
      "desc": "Soul Harvest: Sedot 10% DMG jadi HP & Combo 5+ Beri Energi"
    },
    "lore": "Sabit anggun ditempa dari pecahan meteor bulan, mampu memanen kekuatan dari serangan telak."
  },
  {
    "id": "weapon_crossbow",
    "slot": "weapon",
    "name": "Busur Panah Kristal",
    "rarity": "EPIC",
    "price": 1000,
    "isStarter": false,
    "passive": {
      "critChance": 0.1,
      "pounceAutoCrit": {
        "interval": 1,
        "multiplier": 2
      },
      "desc": "Crystal Volley: Crit +10% & Serangan Awal Auto-Crit x2.0"
    },
    "lore": "Busur silang berdaya pegas tinggi yang melontarkan anak panah berujung kristal berlian murni."
  },
  {
    "id": "weapon_excalibur",
    "slot": "weapon",
    "name": "Pedang Surya Excalibur",
    "rarity": "LEGENDARY",
    "price": 2400,
    "isStarter": false,
    "passive": {
      "critChance": 0.15,
      "critMultiplier": 2.5,
      "holySmite": {
        "chance": 0.2,
        "damage": 25,
        "shield": 15
      },
      "desc": "Solar Radiance: Crit +15%, Crit x2.5 & Peluang Holy Smite (+25 DMG / +15 Shield)"
    },
    "lore": "Pedang suci legendaris yang memancarkan kehangatan matahari fajar, dianugerahkan hanya kepada petualang berhati mulia."
  },
  {
    "id": "outfit_scout",
    "slot": "outfit",
    "name": "Seragam Pandu Siaga",
    "rarity": "COMMON",
    "price": 150,
    "isStarter": false,
    "passive": {
      "startShield": 6,
      "bonusTime": 0.5,
      "desc": "Camp Guard: Perisai +6 HP & Waktu +0.5s"
    },
    "lore": "Kemeja cokelat pramuka lengkap dengan kacu merah putih dan saku utilitas petualang tangguh."
  },
  {
    "id": "outfit_sports",
    "slot": "outfit",
    "name": "Kostum Atlet Juara",
    "rarity": "COMMON",
    "price": 160,
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.02,
      "healOnCorrect": 1,
      "desc": "Agile Reflex: Hindaran +2% & Pulih +1 HP saat Benar"
    },
    "lore": "Jersey olahraga berbahan sejuk yang melambangkan kecepatan gerak dan sportivitas tinggi."
  },
  {
    "id": "outfit_traditional",
    "slot": "outfit",
    "name": "Batik Pusaka Megamendung",
    "rarity": "COMMON",
    "price": 175,
    "isStarter": false,
    "passive": {
      "coinBonus": 0.04,
      "xpBonus": 0.03,
      "desc": "Cultural Pride: Koin +4% & EXP +3%"
    },
    "lore": "Busana batik berwibawa bermotif awan megamendung, lambang ketenangan batin dalam menghadapi ujian sulit."
  },
  {
    "id": "outfit_raincoat",
    "slot": "outfit",
    "name": "Jas Hujan Kuning Cerah",
    "rarity": "COMMON",
    "price": 180,
    "isStarter": false,
    "passive": {
      "startShield": 5,
      "damageReduction": 0.05,
      "desc": "Storm Coat: Perisai +5 HP & Reduksi Damage 5%"
    },
    "lore": "Jas hujan kedap air berwarna kuning ceria yang menjaga petualang tetap hangat di segala cuaca."
  },
  {
    "id": "outfit_ninja",
    "slot": "outfit",
    "name": "Setelan Shinobi Hitam",
    "rarity": "RARE",
    "price": 450,
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.05,
      "shadowStepCrit": true,
      "desc": "Shadow Step: Hindaran +5% & Sukses Menghindar Tingkatkan Crit"
    },
    "lore": "Pakaian senyap khas pesilat bayangan yang menyamarkan keberadaan diri dari incaran lawan."
  },
  {
    "id": "outfit_sailor",
    "slot": "outfit",
    "name": "Mantel Nahkoda Samudera",
    "rarity": "RARE",
    "price": 480,
    "isStarter": false,
    "passive": {
      "startShield": 16,
      "comboRegen": {
        "combo": 3,
        "hp": 2
      },
      "desc": "Ocean Bastion: Perisai +16 HP & Tiap 3 Combo Regen +2 HP"
    },
    "lore": "Mantel wol ganda tahan angin berkerah tinggi yang dikenakan penakluk tujuh samudera."
  },
  {
    "id": "outfit_scholar",
    "slot": "outfit",
    "name": "Jubah Magister Cendekia",
    "rarity": "RARE",
    "price": 500,
    "isStarter": false,
    "passive": {
      "xpBonus": 0.08,
      "freeEnergyChance": 0.15,
      "desc": "Arcane Erudite: EXP +8% & 15% Peluang Skill Tanpa Energi"
    },
    "lore": "Toga kehormatan berbahan beludru ungu yang melambangkan kelulusan ujian ilmu pengetahuan tingkat tinggi."
  },
  {
    "id": "outfit_cyberpunk",
    "slot": "outfit",
    "name": "Jaket Neon Neorunner",
    "rarity": "EPIC",
    "price": 950,
    "isStarter": false,
    "passive": {
      "bossDamageBonusPercent": 0.12,
      "overdriveEnergyBoost": true,
      "desc": "Overdrive Core: Damage Bos +12% & Overcharge Perisai"
    },
    "lore": "Jaket teknologi masa depan dengan sirkuit optik bercahaya yang memompa reaksi saraf petualang."
  },
  {
    "id": "outfit_paladin",
    "slot": "outfit",
    "name": "Zirah Ksatria Perak",
    "rarity": "EPIC",
    "price": 1000,
    "isStarter": false,
    "passive": {
      "startShield": 32,
      "damageReduction": 0.1,
      "earlyDamageReduction": {
        "turns": 1,
        "reduction": 0.3
      },
      "desc": "Aegis of Valor: Perisai +32 HP, Reduksi Damage 10% & Kebal Awal Duel"
    },
    "lore": "Baju zirah lempeng baja tebal peninggalan ordo ksatria pelindung kerajaan perdamaian."
  },
  {
    "id": "outfit_astral_king",
    "slot": "outfit",
    "name": "Jubah Kaisar Galaksi",
    "rarity": "LEGENDARY",
    "price": 2500,
    "isStarter": false,
    "passive": {
      "startShield": 45,
      "damageReduction": 0.15,
      "astralEmergency": true,
      "desc": "Cosmic Dominion: Perisai +45 HP, Reduksi 15% & Darurat Kosmik Pulih +25 HP / +2 Energi"
    },
    "lore": "Jubah kosmik yang ditenun dari debu galaksi andromeda, memancarkan wibawa kaisar penguasa langit malam."
  },
  {
    "id": "frame_bamboo",
    "slot": "frame",
    "name": "Bingkai Bambu Hutan",
    "rarity": "COMMON",
    "price": 150,
    "isStarter": false,
    "passive": {
      "healOnCorrect": 1,
      "desc": "Bamboo Grace: Tiap Jawaban Benar Regen +1 HP"
    },
    "lore": "Anyaman batang bambu hijau segar yang melambangkan ketangguhan dan fleksibilitas pelajar."
  },
  {
    "id": "frame_chalkboard",
    "slot": "frame",
    "name": "Bingkai Papan Belajar",
    "rarity": "COMMON",
    "price": 160,
    "isStarter": false,
    "passive": {
      "xpBonus": 0.04,
      "correctDamageBonus": 1,
      "desc": "Honor Roll: EXP +4% & Bonus Damage Soal +1"
    },
    "lore": "Bingkai kayu jati dengan motif kapur tulis putih, membangkitkan suasana kelas penuh semangat."
  },
  {
    "id": "frame_seashell",
    "slot": "frame",
    "name": "Bingkai Kerang Pesisir",
    "rarity": "COMMON",
    "price": 175,
    "isStarter": false,
    "passive": {
      "startShield": 7,
      "coinBonus": 0.02,
      "desc": "Tidal Shell: Perisai +7 HP & Koin +2%"
    },
    "lore": "Rangkaian kerang mutiara laut yang membiaskan keindahan pesisir pantai nusantara."
  },
  {
    "id": "frame_gear",
    "slot": "frame",
    "name": "Bingkai Roda Gerigi",
    "rarity": "COMMON",
    "price": 180,
    "isStarter": false,
    "passive": {
      "comboDamageBonus": {
        "minCombo": 2,
        "bonus": 1
      },
      "desc": "Clockwork Sync: Rantai Combo Mulai Lebih Cepat (Combo 2+)"
    },
    "lore": "Susunan roda gigi tembaga presisi yang berputar harmonis mencerminkan pemikiran analitis."
  },
  {
    "id": "frame_frost",
    "slot": "frame",
    "name": "Bingkai Kristal Es",
    "rarity": "RARE",
    "price": 450,
    "isStarter": false,
    "passive": {
      "bonusTime": 1,
      "damageReduction": 0.08,
      "desc": "Frostbite Halo: Waktu +1.0s & Reduksi Damage 8%"
    },
    "lore": "Bingkai dari kristal gletser kutub yang memancarkan hawa dingin pembeku amarah lawan."
  },
  {
    "id": "frame_lightning",
    "slot": "frame",
    "name": "Bingkai Badai Petir",
    "rarity": "RARE",
    "price": 480,
    "isStarter": false,
    "passive": {
      "voltSurge": {
        "chance": 0.12,
        "damage": 6
      },
      "desc": "Volt Surge: 12% Peluang Sambaran Petir +6 True DMG"
    },
    "lore": "Lingkaran plasma bertegangan tinggi yang memercikkan listrik statis penuh gairah juang."
  },
  {
    "id": "frame_sakura",
    "slot": "frame",
    "name": "Bingkai Sakura Mekar",
    "rarity": "RARE",
    "price": 500,
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.03,
      "winHeal": 5,
      "desc": "Petal Renewal: Hindaran +3% & Pulih +5 HP saat Menang"
    },
    "lore": "Dahan bunga sakura musim semi yang menebarkan wangi kedamaian dan keharmonisan jiwa."
  },
  {
    "id": "frame_dragon_scale",
    "slot": "frame",
    "name": "Bingkai Sisik Naga",
    "rarity": "EPIC",
    "price": 950,
    "isStarter": false,
    "passive": {
      "critChance": 0.05,
      "thornsDamage": 6,
      "damageReduction": 0.06,
      "desc": "Dragonhide Bastion: Crit +5%, Thorns 6 DMG & Reduksi 6%"
    },
    "lore": "Ditempa dari sisik naga legendaris yang tidak tertembus oleh pedang tertajam sekalipun."
  },
  {
    "id": "frame_runic",
    "slot": "frame",
    "name": "Bingkai Arcana Mistis",
    "rarity": "EPIC",
    "price": 1000,
    "isStarter": false,
    "passive": {
      "freeEnergyChance": 0.12,
      "healOnCorrect": 2,
      "desc": "Runic Matrix: Hemat Energi Skill 12% & Pemulihan Suci +2 HP"
    },
    "lore": "Bingkai batu obsidian hitam yang diukir dengan simbol hieroglif mantra kuno berkekuatan sihir tak terbatas."
  },
  {
    "id": "frame_supernova",
    "slot": "frame",
    "name": "Bingkai Supernova Bintang",
    "rarity": "LEGENDARY",
    "price": 2400,
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.05,
      "critChance": 0.05,
      "startShield": 15,
      "coinBonus": 0.08,
      "xpBonus": 0.08,
      "supernovaBurst": {
        "combo": 5,
        "damage": 20,
        "heal": 6
      },
      "desc": "Supernova Burst: All Stats +5%, Perisai +15 HP & Combo 5 Ledakan 20 DMG + 6 HP"
    },
    "lore": "Ledakan bintang mahadahsyat yang melahirkan galaksi baru, memancarkan energi tanpa batas bagi pemakainya."
  },
  {
    "id": "bg_library",
    "slot": "bg",
    "name": "Perpustakaan Klasik",
    "rarity": "COMMON",
    "price": 150,
    "isStarter": false,
    "passive": {
      "bonusTime": 1,
      "desc": "Quiet Study: Ketenangan Fokus Soal +1.0 Detik"
    },
    "lore": "Ruang baca megah beraroma kayu cendana dengan ribuan buku ilmu pengetahuan yang tersusun rapi."
  },
  {
    "id": "bg_beach",
    "slot": "bg",
    "name": "Pesisir Pantai Tropis",
    "rarity": "COMMON",
    "price": 160,
    "isStarter": false,
    "passive": {
      "startShield": 6,
      "comboRegen": {
        "combo": 3,
        "hp": 1
      },
      "desc": "Coastal Breeze: Perisai +6 HP & Tiap 3 Benar Regen +1 HP"
    },
    "lore": "Hamparan pasir putih lembut berpadu dengan deburan ombak laut biru toska yang menyegarkan pikiran."
  },
  {
    "id": "bg_autumn",
    "slot": "bg",
    "name": "Hutan Musim Gugur",
    "rarity": "COMMON",
    "price": 175,
    "isStarter": false,
    "passive": {
      "coinBonus": 0.03,
      "coinBonusChance": {
        "chance": 0.15,
        "amount": 10
      },
      "desc": "Golden Harvest: Koin +3% & 15% Peluang Panen +10 Koin"
    },
    "lore": "Pepohonan maple berdaun emas kemerahan yang melambangkan musim panen ilmu pengetahuan."
  },
  {
    "id": "bg_rainforest",
    "slot": "bg",
    "name": "Rimba Hutan Hujan",
    "rarity": "COMMON",
    "price": 180,
    "isStarter": false,
    "passive": {
      "timeoutDamageReduction": 0.15,
      "desc": "Canopy Shelter: Reduksi Pinalti Waktu Habis 15%"
    },
    "lore": "Hutan hujan tropis zamrud yang sarat akan keanekaragaman hayati dan udara pegunungan segar."
  },
  {
    "id": "bg_volcano",
    "slot": "bg",
    "name": "Kawah Lahar Membara",
    "rarity": "RARE",
    "price": 450,
    "isStarter": false,
    "passive": {
      "magmaBurst": {
        "interval": 5,
        "damage": 8
      },
      "desc": "Magma Burst: Tiap 5 Jawaban Benar Semburan Lahar +8 DMG"
    },
    "lore": "Lereng gunung berapi aktif dengan aliran lava panas yang membakar semangat juang tak kenal lelah."
  },
  {
    "id": "bg_underwater",
    "slot": "bg",
    "name": "Kedalaman Samudera Biru",
    "rarity": "RARE",
    "price": 480,
    "isStarter": false,
    "passive": {
      "earlyDamageReduction": {
        "turns": 3,
        "reduction": 0.1
      },
      "desc": "Deep Abyss: Lemahkan Serangan Musuh 10% di 3 Giliran Awal"
    },
    "lore": "Palung laut dalam berair kristal yang menjadi habitat terumbu karang berpendar bioluminesensi."
  },
  {
    "id": "bg_floating_isle",
    "slot": "bg",
    "name": "Pulau Terapung Nirwana",
    "rarity": "RARE",
    "price": 500,
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.04,
      "streakProtectChance": 0.25,
      "desc": "Zen Altitude: Hindaran +4% & 25% Pelindung Rantai Combo"
    },
    "lore": "Gugusan pulau melayang di atas lapisan awan putih, tempat para pertapa menuntut kearifan tertinggi."
  },
  {
    "id": "bg_cyber_city",
    "slot": "bg",
    "name": "Metropolis Cyberpunk",
    "rarity": "EPIC",
    "price": 950,
    "isStarter": false,
    "passive": {
      "comboDamagePercent": 0.03,
      "comboEnergyChance": {
        "combo": 4,
        "chance": 0.2
      },
      "desc": "Neural Grid: Rantai Combo +3% Tiap Streak & Peluang +1 Energi"
    },
    "lore": "Kota metropolitan masa depan dengan gedung pencakar langit berselimut kabut neon holografik."
  },
  {
    "id": "bg_temple",
    "slot": "bg",
    "name": "Kuil Langit Keemasan",
    "rarity": "EPIC",
    "price": 1000,
    "isStarter": false,
    "passive": {
      "healOnCorrect": 2,
      "startShield": 15,
      "desc": "Divine Grace: Pulih +2 HP tiap Jawaban Benar & Perisai +15 HP"
    },
    "lore": "Kuil megah di puncak gunung suci berlapis emas murni, tempat bersemayamnya berkah para dewa pelindung."
  },
  {
    "id": "bg_nebula",
    "slot": "bg",
    "name": "Pusaran Galaksi Nebula",
    "rarity": "LEGENDARY",
    "price": 2400,
    "isStarter": false,
    "passive": {
      "turn1Energy": 2,
      "startShield": 20,
      "bonusTime": 2,
      "desc": "Infinite Void: Mulai dengan +2 Energi, Perisai +20 HP & Waktu +2.0 Detik"
    },
    "lore": "Jantung kosmos antariksa tempat lahirnya gugusan bintang baru, menyimpan energi primordial semesta."
  },
  {
    "id": "hat_batara_surya",
    "slot": "hat",
    "name": "Mahkota Batara Surya",
    "rarity": "MYTHIC",
    "price": 2600,
    "isStarter": false,
    "passive": {
      "startShield": 25,
      "solarBurn": {
        "minCombo": 5,
        "hpPercent": 0.05,
        "maxDmg": 20
      },
      "freezeImmunity": true,
      "desc": "Supernova Radiance: +25 Perisai Awal, Solar Burn 5% HP Bos saat Combo ≥5 & Kebal Pengurangan Waktu Es"
    },
    "lore": "Mahkota warisan Batara Surya yang memancarkan kehangatan jutaan fajar. Kegelapan dan rasa ragu sirna seketika di bawah sinarnya."
  },
  {
    "id": "hat_chronos_abyss",
    "slot": "hat",
    "name": "Helm Chronos Abisal",
    "rarity": "MYTHIC",
    "price": 2535,
    "isStarter": false,
    "passive": {
      "bonusTime": 3,
      "timeRewind": {
        "rewindTo": 5,
        "oncePerBattle": true
      },
      "chronoSiphon": {
        "percent": 0.15,
        "ratio": 20
      },
      "desc": "Temporal Distortion: Waktu +3.0s, Auto-Rewind 5.0s saat Waktu Habis & Konversi 15% Damage ke Energi"
    },
    "lore": "Ditempa di dasar palung waktu abisal. Penggunanya tidak lagi diperbudak detik, melainkan memerintah sang waktu itu sendiri."
  },
  {
    "id": "outfit_antakusuma",
    "slot": "outfit",
    "name": "Zirah Kencana Antakusuma",
    "rarity": "MYTHIC",
    "price": 2860,
    "isStarter": false,
    "passive": {
      "dodgeRate": 0.14,
      "counterBlast": true,
      "damageReduction": 0.15,
      "desc": "Brajamusti Deflection: Hindaran +14%, Serangan Balik 100% Damage Bos saat Dodge & Reduksi Damage 15%"
    },
    "lore": "Kain pusaka kadewatan yang membuat pemakainya kebal dari senjata tajam dan memantulkan niat jahat musuh menjadi kehancuran bagi penyerangnya."
  },
  {
    "id": "outfit_void_singularity",
    "slot": "outfit",
    "name": "Jubah Void Singularity",
    "rarity": "MYTHIC",
    "price": 2795,
    "isStarter": false,
    "passive": {
      "voidCharge": {
        "absorbPercent": 0.5,
        "maxCharge": 40
      },
      "cheatDeath": true,
      "emergencyShield": 30,
      "desc": "Event Horizon: Serap 50% Damage saat Salah jadi Void Burst & Bertahan 1 HP +30 Perisai Darurat saat Sekarat"
    },
    "lore": "Terbuat dari tenunan lubang hitam kosmik. Rasa sakit dan kegagalan bukanlah akhir, melainkan bahan bakar bagi ledakan bintang berikutnya."
  },
  {
    "id": "weapon_nagasasra",
    "slot": "weapon",
    "name": "Keris Pusaka Nagasasra",
    "rarity": "MYTHIC",
    "price": 3120,
    "isStarter": false,
    "passive": {
      "critChance": 0.12,
      "critMultiplier": 2.8,
      "armorPen": {
        "bonusDamagePercent": 0.2,
        "durationTurns": 3
      },
      "instantStrikeChance": 0.2,
      "desc": "Dragon Fang Execution: Crit +12%, Pengganda Crit 2.8x, Pecah Zirah +20% & 20% Peluang Serangan Ekstra"
    },
    "lore": "Keris pusaka agung yang ditempa dari serpihan meteor dan darah naga purba. Satu goresannya mampu merobek sisik terkeras monster mana pun."
  },
  {
    "id": "weapon_genesis_staff",
    "slot": "weapon",
    "name": "Tongkat Kosmik Genesis",
    "rarity": "MYTHIC",
    "price": 3055,
    "isStarter": false,
    "passive": {
      "skillCostDiscount": 1,
      "lifeCatalyst": {
        "heal": 15,
        "damageBonusPercent": 0.35
      },
      "fullEnergyBoost": 15,
      "desc": "Celestial Genesis: Hemat Biaya Skill -1⚡, Pakai Skill Pulih +15 HP & Serangan +15 DMG saat Energi Penuh"
    },
    "lore": "Pusaka para arsitek semesta. Setiap kata pengetahuan yang terucap mengubah energi murni menjadi mukjizat penyembuhan dan ledakan cahaya."
  },
  {
    "id": "pet_phoenix_nirvana",
    "slot": "pet",
    "name": "Phoenix Nirvana Abadi",
    "rarity": "MYTHIC",
    "price": 2990,
    "isStarter": false,
    "passive": {
      "nirvanaRebirth": {
        "reviveHpPercent": 0.5,
        "energyBonus": 4
      },
      "moltenProsperity": {
        "coinBonus": 0.4,
        "chestMult": 2
      },
      "firstGrace": true,
      "desc": "Nirvana Rebirth: Bangkit Kembali dengan 50% HP & +4⚡ saat Kalah, Koin +40% & Bebas Kerusakan Salah Pertama"
    },
    "lore": "Burung legenda yang terlahir kembali dari abunya sendiri. Di mana ada Phoenix, di situ kekalahan hanyalah awal dari kemenangan yang lebih cemerlang."
  },
  {
    "id": "bg_kahyangan",
    "slot": "bg",
    "name": "Gerbang Nirwana Kahyangan",
    "rarity": "MYTHIC",
    "price": 2405,
    "isStarter": false,
    "passive": {
      "xpBonus": 0.15,
      "quickAnswerGrace": {
        "maxTimeSec": 3,
        "heal": 4,
        "bonusCoins": 2
      },
      "brutalSuppressor": 0.2,
      "desc": "Swargaloka Blessing: Bonus EXP +15%, Jawab Cepat <3s Pulih +4 HP & Melemahkan Serangan Bos Brutal 20%"
    },
    "lore": "Gerbang perbatasan antara alam fana dan swargaloka. Hanya jiwa-jiwa berilmu tinggi yang diizinkan menjejakkan kaki di atas awan keemasannya."
  },
  {
    "id": "bg_multiverse_rift",
    "slot": "bg",
    "name": "Dimensi Celah Multiverse",
    "rarity": "MYTHIC",
    "price": 2470,
    "isStarter": false,
    "passive": {
      "quantumEchoChance": 0.25,
      "lootChanceBonus": 0.15,
      "dailyCoinCapBonus": 200,
      "desc": "Quantum Duplication: 25% Peluang Serangan & Koin Ganda (2x DMG), Drop Skin +15% & Batas Koin Harian +200"
    },
    "lore": "Pusat konvergensi jutaan realitas paralel. Di sini, satu jawaban benar bergaung ke seluruh dimensi, melipatgandakan takdir kemenanganmu."
  },
  {
    "id": "frame_ouroboros",
    "slot": "frame",
    "name": "Bingkai Segel Ouroboros Tak Terhingga",
    "rarity": "MYTHIC",
    "price": 2340,
    "isStarter": false,
    "passive": {
      "streakProtectChance": 1,
      "streakSafeguardOnce": true,
      "comboMultiplierCap": 2.2,
      "freeEliminateOnCombo": 5,
      "desc": "Eternal Continuity: Proteksi 1x Salah Tidak Merusak Combo, Batas Pengali Combo 2.2x & Tiap 5 Combo Coret 1 Opsi Gratis"
    },
    "lore": "Ular kembar kosmik yang melambangkan keabadian dan siklus tanpa batas. Tak ada kombo yang runtuh selama tekadmu tak tergoyahkan."
  },
  {
    "id": "frame_supernova_stellar",
    "slot": "frame",
    "name": "Bingkai Mahkota Galaksi Supernova",
    "rarity": "MYTHIC",
    "price": 2405,
    "isStarter": false,
    "passive": {
      "allPassivesBoost": 0.25,
      "critChance": 0.08,
      "prestigeShimmer": true,
      "desc": "Cosmic Resonance: Amplifikasi Seluruh Pasif Lain +25%, Crit +8% & Efek Kilau Partikel Bintang Kosmik"
    },
    "lore": "Bingkai kehormatan yang ditempa dari serpihan bintang supernova tertua di galaksi. Menghidupkan resonansi terdalam dari setiap pusaka yang kamu bawa."
  },
  {
    "id": "title_destiny_conqueror",
    "slot": "title",
    "name": "Gelar: \"Sang Penakluk Takdir\"",
    "rarity": "MYTHIC",
    "price": 2600,
    "isStarter": false,
    "passive": {
      "weaknessExploitation": 0.5,
      "hardQuestionMastery": {
        "coinMult": 3,
        "energyBonus": 2
      },
      "maxHpBonus": 25,
      "desc": "Fate Overwrite: Damage Kelemahan Bos Naik ke +50%, Soal Sulit Beri 3x Koin & Maks HP Naik ke 125"
    },
    "lore": "Gelar bagi kesatria yang menolak tunduk pada garis takdir yang telah tertulis. Baginya, setiap soal tersulit adalah panggung kemenangannya."
  },
  {
    "id": "title_omni_wisdom",
    "slot": "title",
    "name": "Gelar: \"Mahaguru Kebijaksanaan Purba\"",
    "rarity": "MYTHIC",
    "price": 2665,
    "isStarter": false,
    "passive": {
      "trapOptionIntuition": true,
      "coinBonus": 0.3,
      "xpBonus": 0.25,
      "perfectAccuracyJackpot": 100,
      "desc": "Omniscience Eye: Deteksi Opsi Pengecoh, Bonus Koin +30%, EXP +25% & Jackpot 100 Koin saat Akurasi Sempurna"
    },
    "lore": "Gelar kehormatan tertinggi bagi pencari ilmu sejati. Pengetahuannya menembus kabut ilusi, melihat kebenaran hakiki di setiap pertanyaan."
  },
  {
    "id": "perm_gaia_heart",
    "slot": "permanent",
    "name": "Berkah Jantung Gaia",
    "rarity": "MYTHIC",
    "price": 3250,
    "isStarter": false,
    "passive": {
      "maxEnergyPermanentBonus": 2,
      "battleRegenInterval": {
        "interval": 4,
        "heal": 10,
        "energy": 1
      },
      "lossProtection": 0.5,
      "desc": "Perpetual Vitality: Kapasitas Maksimal Energi Akun +2⚡, Tiap 4 Soal Pulih +10 HP & Pertahankan 50% Hadiah saat Kalah"
    },
    "lore": "Pecahan intisari bumi pertiwi yang menyimpan denyut kehidupan abadi. Memberikan stamina tak terbatas dan melindungi penjelajah dari keputusasaan."
  },
  {
    "id": "perm_midas_crucible",
    "slot": "permanent",
    "name": "Batu Alkimia Midas Kosmik",
    "rarity": "MYTHIC",
    "price": 3250,
    "isStarter": false,
    "passive": {
      "dailyCoinCapMultiplier": 2,
      "highCoinDropRate": 0.8,
      "tripleDuplicateRefund": true,
      "desc": "Philosopher Transmutation: Gandakan Batas Koin Harian Menjadi 600, Peluang Drop Koin 80% & Kompensasi Duplikat 3x Lipat"
    },
    "lore": "Relik agung para ahli alkimia kosmik. Segala ilmu dan usaha yang dicurahkan seketika bertransmutasi menjadi kemakmuran emas yang melimpah ruah."
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

const UPGRADE_BASE = [0, 175, 438, 875, 1575];

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

const SKILL_BASE_UPGRADE = { 1: 175, 2: 438, 3: 875, 4: 1575 };
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

const exp = {
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = exp;
}
if (typeof window !== 'undefined') {
  window.Economy = exp;
  window.ITEMS = ITEMS;
  window.SKILLS = SKILLS;
} else if (typeof globalThis !== 'undefined') {
  globalThis.Economy = exp;
  globalThis.ITEMS = ITEMS;
  globalThis.SKILLS = SKILLS;
}
