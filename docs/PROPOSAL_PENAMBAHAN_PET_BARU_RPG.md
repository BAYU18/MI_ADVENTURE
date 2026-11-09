# 📜 PROPOSAL PENGEMBANGAN SISTEM PET RPG EDUKASI: PENAMBAHAN 28 PET BARU
**Projek**: *Petualangan Pelajar* ([https://play.printshare.my.id/](https://play.printshare.my.id/))  
**Dokumen Referensi**: `PET_HADIAH_LENCANA_DAN_KOLEKSI_GAME.md`  
**Kategori**: Perluasan Fitur Avatar, Mekanik Pasif RPG, Lencana, & Keseimbangan Permainan (*Game Balancing*)  
**Tanggal Pengajuan**: 7 November 2026  
**Status**: Usulan Desain & Arsitektur Fitur (*Proposed Feature Specification*)

---

## 📌 DAFTAR ISI
1. [Eksekutif Ringkasan & Latar Belakang](#1-eksekutif-ringkasan--latar-belakang)
2. [Analisis Ekosistem Pet Saat Ini](#2-analisis-ekosistem-pet-saat-ini)
3. [Filosofi Desain Mekanik Pet Baru](#3-filosofi-desain-mekanik-pet-baru)
4. [Katalog 10 Pet Baru - Rarity COMMON](#4-katalog-10-pet-baru---rarity-common)
5. [Katalog 8 Pet Baru - Rarity RARE](#5-katalog-8-pet-baru---rarity-rare)
6. [Katalog 6 Pet Baru - Rarity EPIC](#6-katalog-6-pet-baru---rarity-epic)
7. [Katalog 4 Pet Baru - Rarity LEGENDARY](#7-katalog-4-pet-baru---rarity-legendary)
8. [Tabel Komparasi & Rangkuman 28 Pet Baru](#8-tabel-komparasi--rangkuman-28-pet-baru)
9. [Rancangan Set Bonus Baru (Sinergi Perlengkapan)](#9-rancangan-set-bonus-baru-sinergi-perlengkapan)
10. [Spesifikasi Teknis & Integrasi Kode Sumber](#10-spesifikasi-teknis--integrasi-kode-sumber)
11. [Sistem Distribusi, Toko, & Gacha Drop Rate](#11-sistem-distribusi-toko--gacha-drop-rate)
12. [Rencana Implementasi & Pengujian Kualitas](#12-rencana-implementasi--pengujian-kualitas)

---

## 1. Eksekutif Ringkasan & Latar Belakang

Sistem Peliharaan (*Pet System*) pada *Petualangan Pelajar* telah terbukti menjadi salah satu fitur paling digemari oleh para pemain. Pet tidak hanya memperkaya penampilan visual avatar petualang saat berinteraksi di lobi dan papan peringkat, namun juga menyuntikkan dimensi strategis yang menyenangkan melalui **Efek Pasif RPG** saat berhadapan dengan Monster Bos maupun dalam pertarungan Duel PvP.

Berdasarkan data dokumen acuan `PET_HADIAH_LENCANA_DAN_KOLEKSI_GAME.md`, game saat ini baru memiliki **6 varian pet**:
- 2 Pet Common (`pet_cat`, `pet_dog`)
- 2 Pet Rare (`pet_penguin`, `pet_fox`)
- 1 Pet Epic (`pet_owl`)
- 1 Pet Legend aktif di katalog (`pet_dragon`) serta 1 konsep lanjutan (`pet_phoenix`).

Keterbatasan jumlah ini membuat variasi strategi petualang terasa terbatas dan ruang koleksi (*collection showcase*) cepat terpenuhi. Oleh karena itu, proposal ini merancang penambahan **28 Pet Baru** dengan komposisi kelangkaan yang terukur:
- **10 Pet COMMON**: Berfokus pada kemudahan akses, utilitas pemula, toleransi timer ramah anak, dan kenyamanan belajar.
- **8 Pet RARE**: Berfokus pada manipulasi combo streak, adaptasi sumber daya (koin/energi), dan peredam debuff pertempuran.
- **6 Pet EPIC**: Berfokus pada taktik lanjutan, serangan balik (*counter-attack*), lifesteal, dan jaminan critical hit.
- **4 Pet LEGENDARY**: Berfokus pada mekanik spektakuler pengubah alur laga (*game changer*), efek visual aura tingkat tinggi (*cosmic stars, blizzard, thunder, revival*), serta hadiah prestisius lencana legendaris.

---

## 2. Analisis Ekosistem Pet Saat Ini

Berdasarkan bedah modul `shared/economy.js`, `shared/avatar.js`, dan `lib/db.js`, status pet yang sudah berjalan adalah:

| ID Pet | Kelangkaan | Nama Pet | Ikon Twemoji | Efek Pasif RPG | Sumber Perolehan |
| :--- | :---: | :--- | :---: | :--- | :--- |
| `pet_cat` | `COMMON` | Kucing Oren | 🐱 `1f431` | Koin Drop +3% | Toko Koin / Drop Box |
| `pet_dog` | `COMMON` | Anjing Ceria | 🐶 `1f436` | Pemulihan +2 HP saat menang | Toko Koin / Drop Box |
| `pet_penguin`| `RARE` | Pinguin Lucu | 🐧 `1f427` | Waktu Beku Alami +1.5 detik | Toko Spesial / Wilayah 3 |
| `pet_fox` | `RARE` | Rubah Cerdik | 🦊 `1f98a` | 15% Peluang +1 Energi tiap 3 Combo | Toko Spesial / Wilayah 3 |
| `pet_owl` | `EPIC` | Burung Hantu Bijak | 🦉 `1f989` | Proteksi Combo 50% jika salah 1x | Drop Box Wilayah 3 |
| `pet_dragon` | `LEGENDARY`| Naga Mungil | 🐲 `1f432` | Semburan Naga (10% peluang 20 True Dmg) | Lencana Penjelajah Kampanye |
| `pet_phoenix`| `LEGENDARY`| Bayi Burung Phoenix| 🦅🔥 `1f985` | Reduksi Dmg 20% & +1 ⚡ saat HP < 25% | Lencana Hati Phoenix |

### Poin Evaluasi Kebutuhan Pemain:
1. **Pilihan Gaya Bermain Belum Lengkap**: Belum ada pet yang mendukung pemain bertipe *Tanker* (fokus perisai tebal), *Berserker* (fokus critical damage tinggi), *Alchemist* (fokus farming material/koin), maupun *Tactician* (fokus manipulasi timer dan stun musuh).
2. **Koleksi & Replay Value**: Mode Cerita Wilayah 1, 2, dan 3 membutuhkan variasi hadiah gacha yang kaya agar pemain terdorong untuk membuka kotak mingguan dan menyelesaikan pencapaian lencana.
3. **Motivasi Belajar Siswa**: Desain efek pasif yang dirancang cerdas akan menstimulasi siswa untuk menjaga fokus, mengejar rantai jawaban benar (*combo streak*), dan berpikir cepat tanpa takut gagal.

---

## 3. Filosofi Desain Mekanik Pet Baru

Dalam merancang 28 pet baru ini, kami memegang 4 prinsip dasar game design:

1. **Edukasi yang Positif (Edu-Fun & Non-Punitive)**:
   - Efek pasif tidak menghukum anak saat melakukan kesalahan, melainkan memberikan bantalan perlindungan (misalnya perisai, pemulihan darurat, atau proteksi streak).
2. **Keseimbangan Kompetitif (Fair & Balanced)**:
   - Tidak ada pet yang *overpowered* (*pay-to-win*). Angka probabilitas dibatasi oleh *Hard Cap* di `shared/passives.js` (misalnya maksimal dodge 35%, maksimal critical chance 40%).
3. **Identitas Tematik yang Kuat (Lore & Karakter Unik)**:
   - Setiap pet memiliki visual Twemoji resmi, aura gradien SVG berlapis, dan cerita latar yang memotivasi semangat eksplorasi pelajar.
4. **Skalabilitas Arsitektur (Zero Breaking Changes)**:
   - Seluruh properti pasif dirancang selaras dengan sistem komputasi `calculatePassives()` yang telah ada di `shared/passives.js`.

---

## 4. Katalog 10 Pet Baru - Rarity COMMON

Kelompok pet ini memiliki harga terjangkau di toko koin atau mudah diperoleh dari peti gacha Wilayah 1 dan 2. Efek pasifnya sederhana, langsung terasa manfaatnya, dan sangat ramah untuk pemain baru.

```
+=============================================================================+
|                      KATALOG 10 PET BARU - COMMON                           |
+=============================================================================+
| No | ID Item       | Nama Pet           | Ikon | Efek Pasif RPG             |
|----+---------------+--------------------+------+----------------------------|
| 01 | pet_hamster   | Hamster Tabungan   | 🐹   | Peluang 25% +5 Koin Ekstra |
| 02 | pet_rabbit    | Kelinci Lincah     | 🐰   | Waktu Timer Soal +0.8 Detik|
| 03 | pet_chick     | Anak Ayam Semangat | 🐥   | Bonus XP Petualang +5%     |
| 04 | pet_turtle    | Kura-Kura Sabar    | 🐢   | Perisai Tempur Awal +8 HP  |
| 05 | pet_panda     | Panda Santai       | 🐼   | Reduksi Damage Timeout 25% |
| 06 | pet_bear      | Beruang Madu       | 🐻   | Serangan Tetap +2 Flat DMG |
| 07 | pet_frog      | Katak Loncat       | 🐸   | Kilat Cepat (<3s) +10 XP   |
| 08 | pet_duck      | Bebek Riang        | 🦆   | Proteksi Kalah Koin 40%    |
| 09 | pet_mouse     | Tikus Penjelajah   | 🐭   | Drop Peti Harta +8%        |
| 10 | pet_koala     | Koala Teduh        | 🐨   | Pemulihan Stamina +3 HP    |
+=============================================================================+
```

### Rincian Profil Mendalam 10 Pet Common:

#### 1. Hamster Tabungan (`pet_hamster`)
- **Ikon Twemoji**: `1f439` (🐹)
- **Lore**: Gemar mengumpulkan biji matahari dan koin receh di pipinya yang tembem. Hadir menemani petualang cilik yang rajin menabung.
- **Efek Pasif**: `coinBonusChance: { chance: 0.25, amount: 5 }`
  - *Deskripsi*: **Pipi Emas**: Setiap kali menjawab benar, ada peluang 25% pet hamster memberikan bonus instan +5 koin emas.
- **Cara Dapat**: Toko Koin Pemula (Biaya: 180 Koin) atau Peti Harta Wilayah 1.

#### 2. Kelinci Lincah (`pet_rabbit`)
- **Ikon Twemoji**: `1f430` (🐰)
- **Lore**: Bertelinga panjang dan peka terhadap suara bel waktu. Selalu melompat gembira saat soal berhasil dipecahkan.
- **Efek Pasif**: `bonusTime: 0.8`
  - *Deskripsi*: **Lompatan Gesit**: Memberikan tambahan waktu timer berpikir sebesar +0.8 detik pada setiap pertanyaan.
- **Cara Dapat**: Selesaikan 5 node pertama Mode Cerita (Wilayah 1).

#### 3. Anak Ayam Semangat (`pet_chick`)
- **Ikon Twemoji**: `1f424` (🐥)
- **Lore**: Menetas saat fajar menyingsing. Kicauannya yang riang membangunkan semangat belajar dan mempercepat kenaikan level petualang.
- **Efek Pasif**: `xpBonus: 0.05`
  - *Deskripsi*: **Kicau Pagi Semangat**: Memberikan tambahan perolehan XP sebesar +5% untuk semua mode permainan.
- **Cara Dapat**: Hadiah Login Hari ke-2 Akun Baru.

#### 4. Kura-Kura Sabar (`pet_turtle`)
- **Ikon Twemoji**: `1f422` (🐢)
- **Lore**: Perlahan tapi pasti. Mengajarkan bahwa ketelitian dan ketenangan lebih utama daripada terburu-buru hingga salah menjawab.
- **Efek Pasif**: `startShield: 8`
  - *Deskripsi*: **Tempurung Perlindungan**: Memulai pertempuran bos atau duel dengan perisai pelindung gratis sebesar +8 Shield HP.
- **Cara Dapat**: Toko Koin (Biaya: 220 Koin).

#### 5. Panda Santai (`pet_panda`)
- **Ikon Twemoji**: `1f43c` (🐼)
- **Lore**: Sambil mengunyah rebung bambu, panda tetap tenang meski waktu hampir habis tanpa rasa panik.
- **Efek Pasif**: `timeoutDamageReduction: 0.25`
  - *Deskripsi*: **Ketenangan Zen**: Jika pemain kehabisan waktu pada satu giliran soal, damage musuh diredam sebesar 25%.
- **Cara Dapat**: Hadiah Lencana *"Pembelajar Sabar"* (Tier Perunggu).

#### 6. Beruang Madu (`pet_bear`)
- **Ikon Twemoji**: `1f43b` (🐻)
- **Lore**: Beruang gembul bertenaga dahsyat yang menyukai madu hutan rimba dan selalu siap mencakar rintangan.
- **Efek Pasif**: `correctDamageBonus: 2`
  - *Deskripsi*: **Cakaran Madu**: Menambahkan bonus +2 Flat Damage pada setiap serangan jawaban yang benar.
- **Cara Dapat**: Toko Koin (Biaya: 250 Koin).

#### 7. Katak Loncat (`pet_frog`)
- **Ikon Twemoji**: `1f438` (🐸)
- **Lore**: Melompat tangkas dari satu teratai ke teratai lain, sangat menyukai siswa yang berpikir cepat dan tanggap.
- **Efek Pasif**: `speedAnswerXp: { maxTime: 3.0, bonusXp: 10 }`
  - *Deskripsi*: **Lidah Kilat**: Menjawab benar dalam waktu kurang dari 3 detik menghadiahkan +10 bonus XP kilat.
- **Cara Dapat**: Peti Gacha Mode Cerita Wilayah 1 atau Toko Koin.

#### 8. Bebek Riang (`pet_duck`)
- **Ikon Twemoji**: `1f986` (🦆)
- **Lore**: Berenang gembira di danau jernih. Membantu pemain tidak berkecil hati saat kalah duel dengan melindungi tabungan koin.
- **Efek Pasif**: `lossCoinProtect: 0.40`
  - *Deskripsi*: **Bulu Kedap Air**: Memotong penalti kehilangan koin saat mengalami kekalahan duel sebesar 40%.
- **Cara Dapat**: Toko Koin (Biaya: 190 Koin).

#### 9. Tikus Penjelajah (`pet_mouse`)
- **Ikon Twemoji**: `1f42d` (🐭)
- **Lore**: Memiliki hidung tajam yang ahli mengendus peti harta karun dan remah-remah misteri yang tersembunyi di sudut peta.
- **Efek Pasif**: `lootChanceBonus: 0.08`
  - *Deskripsi*: **Endus Jejak**: Meningkatkan peluang mendapatkan drop peti harta atau item tambahan sebesar +8%.
- **Cara Dapat**: Selesaikan Wilayah 1 Mode Cerita dengan Bintang Penuh.

#### 10. Koala Teduh (`pet_koala`)
- **Ikon Twemoji**: `1f428` (🐨)
- **Lore**: Bertengger nyaman di dahan pohon eucalyptus. Memberikan rasa tenang dan menyembuhkan lelah setelah pertempuran usai.
- **Efek Pasif**: `winHeal: 3`
  - *Deskripsi*: **Istirahat Nyaman**: Memulihkan +3 HP ekstra untuk karakter setiap kali memenangkan duel atau laga bos.
- **Cara Dapat**: Toko Koin (Biaya: 210 Koin).

---

## 5. Katalog 8 Pet Baru - Rarity RARE

Pet pada tingkat kelangkaan RARE menghadirkan interaksi yang lebih dinamis terhadap sistem *combo streak*, pemulihan energi taktis, serangan pantulan duri (*thorns*), serta peredam debuff lawan.

```
+=============================================================================+
|                       KATALOG 8 PET BARU - RARE                             |
+=============================================================================+
| No | ID Item       | Nama Pet           | Ikon | Efek Pasif RPG             |
|----+---------------+--------------------+------+----------------------------|
| 11 | pet_wolf      | Serigala Rimba     | 🐺   | Combo 4x: +12% Crit Giliran|
| 12 | pet_hedgehog  | Landak Duri        | 🦔   | Duri Pantul 4 True Damage  |
| 13 | pet_otter     | Berang-Berang Kali | 🦦   | Combo 4x: +1 Energi Semangat|
| 14 | pet_bat       | Kelelawar Gema     | 🦇   | 20% Hapus 1 Pilihan Salah  |
| 15 | pet_racoon    | Musang Cerdik      | 🦝   | Combo 5x: Copet 10-15 Koin |
| 16 | pet_deer      | Rusa Cahaya        | 🦌   | Peluang Hindaran +7% Dodge |
| 17 | pet_parrot    | Beo Cendekia       | 🦜   | Sempurna (100%): +30% XP   |
| 18 | pet_chameleon | Bunglon Ilusi      | 🦎   | Proteksi Dmg 18% (2 Turn)  |
+=============================================================================+
```

### Rincian Profil Mendalam 8 Pet Rare:

#### 11. Serigala Rimba (`pet_wolf`)
- **Ikon Twemoji**: `1f43a` (🐺)
- **Lore**: Melolong di bawah rembulan rimba. Semakin panjang rantai jawaban benar yang kamu bangun, semakin tajam insting berburunya.
- **Efek Pasif**: `comboCritBoost: { minCombo: 4, critBoost: 0.12 }`
  - *Deskripsi*: **Auman Kawanan**: Ketika mencapai Combo Streak 4x atau lebih, Critical Chance meningkat +12% pada serangan berikutnya.
- **Cara Dapat**: Hadiah Peti Harta Wilayah 2 (Hutan Kabut Purba).

#### 12. Landak Duri (`pet_hedgehog`)
- **Ikon Twemoji**: `1f994` (🦔)
- **Lore**: Menggulung diri menjadi bola berduri tajam saat bahaya mendekat, membalas setiap serangan yang meremehkannya.
- **Efek Pasif**: `thornsDamage: 4`
  - *Deskripsi*: **Duri Pertahanan**: Tiap kali karakter menerima damage dari monster bos atau lawan duel, memantulkan 4 True Damage langsung ke penyerang.
- **Cara Dapat**: Toko Spesial Koin (Biaya: 500 Koin).

#### 13. Berang-Berang Kali (`pet_otter`)
- **Ikon Twemoji**: `1f9a6` (🦦)
- **Lore**: Sahabat air yang gesit dan ceria. Memanfaatkan aliran sungai ilmu pengetahuan untuk menyegarkan stamina petualang.
- **Efek Pasif**: `comboRegenEnergy: { combo: 4, energy: 1 }`
  - *Deskripsi*: **Aliran Sungai Fokus**: Setiap kelipatan 4 Combo Streak sukses, memulihkan +1 Energi Semangat secara cuma-cuma.
- **Cara Dapat**: Selesaikan Wilayah 2 Mode Cerita.

#### 14. Kelelawar Gema (`pet_bat`)
- **Ikon Twemoji**: `1f987` (🦇)
- **Lore**: Mengeluarkan gelombang ultrasonik dalam kegelapan gua untuk mendeteksi pilihan jawaban yang menyesatkan.
- **Efek Pasif**: `sonarEliminateChance: 0.20`
  - *Deskripsi*: **Ekolokasi Gelap**: Memiliki peluang 20% di awal soal untuk melenyapkan 1 pilihan jawaban yang salah secara otomatis.
- **Cara Dapat**: Peti Gacha Mode Cerita Wilayah 2 atau Toko Misteri.

#### 15. Musang Cerdik (`pet_racoon`)
- **Ikon Twemoji**: `1f99d` (🦝)
- **Lore**: Topeng hitam di matanya melambangkan kelihaian tangan sang pemburu harta karun di kantong monster bos.
- **Efek Pasif**: `comboStealGold: { combo: 5, minGold: 10, maxGold: 15 }`
  - *Deskripsi*: **Copet Harta Karun**: Setiap mencapai Combo Streak 5x, mencuri 10-15 koin ekstra langsung dari pundi-pundi bos.
- **Cara Dapat**: Hadiah Lencana *"Pencari Celah"* (Tier Perak).

#### 16. Rusa Cahaya (`pet_deer`)
- **Ikon Twemoji**: `1f98c` (🦌)
- **Lore**: Melangkah seringan angin di atas dedaunan gugur, menghindarkan tuannya dari tubrukan monster liar.
- **Efek Pasif**: `dodgeRate: 0.07`
  - *Deskripsi*: **Langkah Anggun**: Meningkatkan peluang menghindar dari serangan musuh sebesar +7% Dodge Rate.
- **Cara Dapat**: Toko Koin Spesial (Biaya: 550 Koin).

#### 17. Beo Cendekia (`pet_parrot`)
- **Ikon Twemoji**: `1f99c` (🦜)
- **Lore**: Burung berbulu pelangi cerah yang mampu menirukan seluruh hafalan rumus dan kosakata secara sempurna.
- **Efek Pasif**: `perfectAccuracyXpBonus: 0.30`
  - *Deskripsi*: **Gema Kecerdasan**: Jika menyelesaikan stage kuis atau duel dengan akurasi 100% tanpa satu pun kesalahan, bonus XP bertambah +30%.
- **Cara Dapat**: Raih Akurasi 100% di 10 laga berturut-turut.

#### 18. Bunglon Ilusi (`pet_chameleon`)
- **Ikon Twemoji**: `1f98e` (🦎)
- **Lore**: Menyesuaikan warna tubuhnya dengan latar panggung pertempuran, membuat monster bos kebingungan di menit awal.
- **Efek Pasif**: `earlyDamageReduction: { turns: 2, reduction: 0.18 }`
  - *Deskripsi*: **Kamuflase Mimikri**: Memotong damage serangan monster bos sebesar 18% selama 2 giliran pertama laga.
- **Cara Dapat**: Hadiah Peti Mingguan Wilayah 2.

---

## 6. Katalog 6 Pet Baru - Rarity EPIC

Pet pada tingkat kelangkaan EPIC ditujukan bagi petualang yang menyukai kedalaman strategi pertempuran. Efek pasifnya memiliki daya hancur tinggi, kemampuan bertahan hidup (*lifesteal & stun*), serta modulasi perisai penahan fase amarah bos (*enraged phase*).

```
+=============================================================================+
|                       KATALOG 6 PET BARU - EPIC                             |
+=============================================================================+
| No | ID Item       | Nama Pet           | Ikon | Efek Pasif RPG             |
|----+---------------+--------------------+------+----------------------------|
| 19 | pet_tiger     | Harimau Belang     | 🐅   | Tiap Soal ke-5: Auto-Crit! |
| 20 | pet_lion      | Singa Padang Emas  | 🦁   | Reduksi Enrage 25% & Shield|
| 21 | pet_eagle     | Elang Rajawali     | 🦅   | Freeze +2.5s & Tembus Armor|
| 22 | pet_crocodile | Buaya Purba        | 🐊   | Vampiric Lifesteal HP 12%  |
| 23 | pet_jellyfish | Ubur-Ubur Abisal   | 🪼   | 20% Peluang Stun Giliran   |
| 24 | pet_snake     | Kobra Giok Mistis  | 🐍   | Racun Menumpuk 4 Dmg/Turn  |
+=============================================================================+
```

### Rincian Profil Mendalam 6 Pet Epic:

#### 19. Harimau Belang Perkasa (`pet_tiger`)
- **Ikon Twemoji**: `1f42f` (🐅)
- **Lore**: Sang penguasa rimba belantara dengan tatapan mata yang membekukan nyali lawan. Menerkam mangsa pada saat yang paling mematikan.
- **Efek Pasif**: `pounceAutoCrit: { interval: 5, multiplier: 2.2 }`
  - *Deskripsi*: **Terkaman Mematikan (Apex Pounce)**: Pada setiap soal kelipatan ke-5 yang dijawab dengan benar, serangan dijamin menjadi **Critical Hit Otomatis dengan pengganda damage x2.2**!
- **Cara Dapat**: Peti Gacha Wilayah 3 (Lembah Kristal) / Hadiah Lencana *"Pemburu Kritis"* (Tier Emas).

#### 20. Singa Padang Emas (`pet_lion`)
- **Ikon Twemoji**: `1f981` (🦁)
- **Lore**: Surai emasnya berkilau memancarkan kepemimpinan sejati. Raungannya meredam amukan bos terganas sekalipun.
- **Efek Pasif**: `kingsRoar: { enrageDamageCut: 0.25, phaseChangeShield: 15 }`
  - *Deskripsi*: **Aura Keagungan (King's Roar)**: Meredam damage kemarahan bos (*Enraged Phase*) sebesar 25%, dan otomatis memberikan tambahan +15 Shield saat bos beralih fase.
- **Cara Dapat**: Selesaikan Wilayah 3 Mode Cerita (Kalahkan Bos Golem Batu Kristal).

#### 21. Elang Rajawali Sakti (`pet_eagle`)
- **Ikon Twemoji**: `1f985` (🦅)
- **Lore**: Melayang anggun menembus awan badai. Pandangan matanya yang tajam menembus celah terlemah pertahanan monster bos.
- **Efek Pasif**: `hawkeye: { freezeTime: 2.5, armorPiercing: 0.15 }`
  - *Deskripsi*: **Mata Rajawali (Hawkeye Vision)**: Menambah waktu beku timer +2.5 detik dan mengabaikan 15% armor pertahanan bos (serangan menjadi lebih sakit).
- **Cara Dapat**: Toko Prestasi Lencana (Biaya: 1.200 Koin Lencana).

#### 22. Buaya Purba (`pet_crocodile`)
- **Ikon Twemoji**: `1f40a` (🐊)
- **Lore**: Predator penyintas dari zaman purbakala yang bersemayam di rawa terlarang, menyerap daya hidup musuh untuk memulihkan diri.
- **Efek Pasif**: `vampiricBite: { lifestealPercent: 0.12 }`
  - *Deskripsi*: **Kuncian Rawa (Vampiric Drain)**: Mengubah 12% dari total damage serangan jawaban benar menjadi pemulihan HP pemain secara instan.
- **Cara Dapat**: Kalahkan Bos Rawa Kabut Wilayah 2 pada Mode Brutal.

#### 23. Ubur-Ubur Abisal (`pet_jellyfish`)
- **Ikon Twemoji**: `1fac0` (🪼)
- **Lore**: Makhluk bioluminesensi bercahaya neon dari palung samudra terdalam, menyimpan muatan listrik statis bertegangan tinggi.
- **Efek Pasif**: `staticShockStunChance: 0.20`
  - *Deskripsi*: **Sengatan Statis (Abyssal Stun)**: Peluang 20% saat jawaban benar untuk melumpuhkan (*stun*) monster bos, membatalkan giliran serangan musuh berikutnya.
- **Cara Dapat**: Drop Eksklusif Peti Mingguan Wilayah 3 (Peluang 10%).

#### 24. Kobra Giok Mistis (`pet_snake`)
- **Ikon Twemoji**: `1f40d` (🐍)
- **Lore**: Sisiknya terbuat dari batu giok kuno yang mengalirkan bisa racun lambat, melemahkan musuh dari dalam pertempuran.
- **Efek Pasif**: `venomBloom: { damagePerTurn: 4, maxStacks: 3 }`
  - *Deskripsi*: **Bisa Racun Berbunga (Venom Bloom)**: Setiap jawaban benar menyuntikkan racun sebesar 4 Damage per giliran ke bos, dapat ditumpuk hingga 3 lapis (*maksimal 12 damage pasif per giliran*).
- **Cara Dapat**: Hadiah Lencana *"Kolektor Taktis"* (Tier Emas).

---

## 7. Katalog 4 Pet Baru - Rarity LEGENDARY

Tingkat kelangkaan LEGENDARY merupakan kasta kehormatan tertinggi bagi para petualang sejati. Pet legendaris dibekali **Animasi Partikel SVG Spektakuler** (aura cincin kosmik, taburan debu bintang, sambaran kilat gletser), serta efek mekanik pengubah takdir laga (*battle-turnaround mechanics*). Pet ini tidak dapat dibeli dengan koin biasa, melainkan menjadi hadiah eksklusif dari Lencana Legendaris, Mode Brutal, atau penyelesaian konten paling menantang.

```
+========================================================================================+
|                         KATALOG 4 PET BARU - LEGENDARY                                 |
+========================================================================================+
| No | ID Item       | Nama Pet           | Ikon | Efek Pasif RPG Utama (Spektakuler)    |
|----+---------------+--------------------+------+---------------------------------------|
| 25 | pet_kirin     | Kirin Bintang Suci | 🦄✨ | Kebal Kematian (Cheat Death) +25 Shield|
| 26 | pet_gryphon   | Gryphon Petir      | 🦅⚡ | Tiap Combo 5x: Sambaran Petir 35 Dmg  |
| 27 | pet_leviathan | Kraken Samudra     | 🦑🌊 | Gelombang Pasang: 30 Dmg & Heal 15 HP  |
| 28 | pet_fenrir    | Serigala Es Gletser| 🐺❄️ | Reduksi 10% Dmg & Kekebalan 1x Salah  |
+========================================================================================+
```

### Rincian Profil Mendalam 4 Pet Legend:

---

### 25. 🦄✨ Kirin Bintang Suci (*Celestial Qilin*)
```
       *   .  /\_/\  .   *      ✨ "Cahaya Bintang Abadi Melindungimu!" ✨
     .    \ ( o.o ) /    .      💖 Kebal Kematian Seketika saat HP = 0!
       *   (  > <  )   *        🛡️ +25 Shield Suci & +2 Energi Semangat
          /  ---  \
         (_________/            ⭐⭐⭐⭐⭐ TIER LEGENDARIS
```

- **Item ID**: `pet_kirin`
- **Slot**: `pet`
- **Ikon Twemoji**: `1f984` (🦄)
- **Warna Identitas Aura**: Biru Safir & Ungu Kosmik (`#60a5fa` ke `#c084fc`)
- **Lore**:
  > *"Tercipta dari pecahan rasi bintang fajar yang turun ke bumi ketika seorang pelajar menunjukkan keteguhan hati yang tak terpatahkan. Kirin suci membimbing jiwa-jiwa pejuang dan menolak membiarkan mereka tumbang sebelum cita-citanya terwujud."*
- **Efek Pasif RPG**: **Mukjizat Bintang Surgawi (Celestial Miracle)**
  - **Mekanisme Tempur**:
    - Saat menerima serangan fatal yang seharusnya menghabiskan seluruh sisa darah karakter (*Fatal Blow*):
      1. Efek kematian dibatalkan seketika (**Cheat Death 1x per battle**).
      2. HP pemain tertahan di angka **1 HP**.
      3. Kirin meledakkan aura cahaya suci yang memberikan perlindungan darurat sebesar **+25 Shield HP**.
      4. Seketika memulihkan **+2 Energi Semangat** untuk melancarkan skill pembalikan (*Counter Skill*).
  - **Efek Visual Partikel SVG**:
    - Gelombang cincin berdenyut ungu-kebiruan (`#c084fc`), dikelilingi taburan konstelasi bintang empat sudut (`fx-twinkle`) yang berputar lambat mengitari tubuh karakter.
- **Cara Perolehan**:
  - 🏆 **Hadiah Lencana Legenda**: *"Penyelamat Terakhir"* (Menangkan 30 laga pertarungan bos dalam kondisi HP ≤ 10%).

---

### 26. 🦅⚡ Gryphon Badai Petir (*Thunder Gryphon*)
```
        ,-.---.             ⚡ "GEMURUH BADAI MENGHANCURKAN PERTAHANAN!" ⚡
       /  \ \  \    ⚡      💥 Setiap 5 Combo Streak: Sambaran Petir Maut!
      / () \ \  \           ⚡ +35 True Damage & Bekukan Timer Bos 3 Detik!
     <      ) )  )
      \    / /  /           ⭐⭐⭐⭐⭐ TIER LEGENDARIS
```

- **Item ID**: `pet_gryphon`
- **Slot**: `pet`
- **Ikon Twemoji**: `1f985` (🦅 dengan mahkota petir / visual hybrid singa-rajawali)
- **Warna Identitas Aura**: Emas Petir & Kuning Neon (`#facc15` ke `#eab308`)
- **Lore**:
  > *"Penguasa puncak gunung petir abadi. Sayapnya mengibaskan badai dan paruhnya memancarkan percikan listrik tegangan jutaan volt. Hanya petualang dengan kecepatan berpikir kilat yang dapat menjinakkannya."*
- **Efek Pasif RPG**: **Sambaran Petir Purba (Thunderclap Overdrive)**
  - **Mekanisme Tempur**:
    - Setiap kali pemain berhasil mempertahankan rantai jawaban benar hingga mencapai kelipatan **5 Combo Streak** (5x, 10x, 15x, dst.):
      1. Gryphon memanggil kilat petir dari langit yang menghantam Monster Bos sebesar **+35 True Damage Instan** (mengabaikan seluruh armor).
      2. Menyengat timer bos hingga membeku (*Time Stun*) selama **3.0 detik penuh**.
  - **Efek Visual Partikel SVG**:
    - Cincin aura kuning berdenyut (`#facc15`), disertai animasi percikan kilat menyambar (`fx-lightning`) dan partikel percikan listrik melayang ke udara.
- **Cara Perolehan**:
  - 🏆 **Hadiah Lencana Legenda**: *"Raja Kombo Petir"* (Capai rekor 20 Combo Streak berturut-turut tanpa salah di Mode Brutal).

---

### 27. 🦑🌊 Kraken Samudra Mistis (*Abyssal Kraken*)
```
        .-"""-.
       /       \     🌊 "KEDALAMAN PALUNG LAUT AKAN MENELAN LAWAN!" 🌊
      |  O   O  |  🐙  🌊 Serap Damage Musuh ➔ Lepaskan Tsunami Balasan!
      (   ---   )      💖 +30 Damage Gelombang & Regen +15 HP Pemain!
      /|||||||||\
     (_)(_)(_)(_)(_)   ⭐⭐⭐⭐⭐ TIER LEGENDARIS
```

- **Item ID**: `pet_leviathan`
- **Slot**: `pet`
- **Ikon Twemoji**: `1f991` (🦑)
- **Warna Identitas Aura**: Biru Toska Laut Dalam & Sian Samudra (`#06b6d4` ke `#0284c7`)
- **Lore**:
  > *"Bersemayam di dasar palung samudra yang belum pernah terjamah sinar matahari. Memiliki tentakel raksasa yang mampu menahan hantaman ombak tsunami dan mengubah tekanan air laut menjadi kekuatan pemulihan bagi tuannya."*
- **Efek Pasif RPG**: **Gelombang Pasang Laut Dalam (Tidal Abyssal Surge)**
  - **Mekanisme Tempur**:
    - **Penyerap Arus**: Karakter secara pasif menerima **Reduksi Damage 15%** dari seluruh serangan musuh.
    - **Ledakan Tsunami**: Setiap kali karakter selesai menerima akumulasi 40 damage dari bos, tentakel Kraken meledakkan gelombang pasang tsunami ke medan laga:
      1. Menghantam balik bos sebesar **+30 Damage Air**.
      2. Memulihkan darah pemain sebesar **+15 HP Segar**.
  - **Efek Visual Partikel SVG**:
    - Cincin pulsasi biru laut dalam (`#0284c7`), dilengkapi partikel gelembung busa air melayang vertikal (`fx-bubble`) yang memberikan kesan atmosfer bawah laut magis.
- **Cara Perolehan**:
  - 🏆 **Peti Harta Karun Wilayah 3**: Drop Hadiah Rahasia Kemenangan Bintang 3 atas Raja Rawa Palung Laut.

---

### 28. 🐺❄️ Serigala Es Nol Mutlak (*Glacial Fenrir*)
```
        /\____/\
       /  *  *  \    ❄️ "DINDING ES ABADI TIDAK AKAN PERNAH RUNTUH!" ❄️
      (    /\    ) 🧊  ❄️ Reduksi Pasif 10% Damage & Kekebalan 1x Salah!
       /  ====  \      ❄️ Hawa Beku Mematikan Menjinakkan Monster Bos!
      (          )
       \__/\____/      ⭐⭐⭐⭐⭐ TIER LEGENDARIS
```

- **Item ID**: `pet_fenrir`
- **Slot**: `pet`
- **Ikon Twemoji**: `1f43a` (🐺 dengan rona salju kristal)
- **Warna Identitas Aura**: Putih Es Kristal & Biru Langit Beku (`#e0f2fe` ke `#38bdf8`)
- **Lore**:
  > *"Lahir di puncak gletser abadi yang diselimuti badai salju nol mutlak. Hembusan nafasnya membekukan amarah monster terbuas dan melapisi jiwa petualang dengan zirah es kristal yang mustahil ditembus."*
- **Efek Pasif RPG**: **Badai Gletser Nol Mutlak (Absolute Zero Blizzard)**
  - **Mekanisme Tempur**:
    - **Zirah Embun Beku**: Mengurangi seluruh damage serangan monster bos sebesar **10% secara permanen** sejak detik pertama pertempuran.
    - **Penjaga Es Tanpa Cela**: Setiap kali pemain menjawab 3 soal dengan benar, Fenrir menciptakan satu lapis **Tameng Es Pelindung Kesalahan (Mistake Shield)**:
      - Jika pemain menjawab salah pada giliran berikutnya, tameng es pecah menahan seluruh serangan monster bos (**0 Damage diterima & Streak tidak putus!** Efek dapat terpicu 1x per interval).
  - **Efek Visual Partikel SVG**:
    - Lingkaran pulsasi kristal es sian cerah (`#38bdf8`), dikelilingi butiran kristal salju heksagonal (`fx-snowflake`) yang meluncur perlahan turun.
- **Cara Perolehan**:
  - 🏆 **Hadiah Lencana Legenda**: *"Penakluk Puncak Es"* (Kalahkan Seluruh Bos Mode Kampanye tanpa pernah kalah 1 kali pun).

---

## 8. Tabel Komparasi & Rangkuman 28 Pet Baru

Berikut adalah matriks komparasi lengkap dari ke-28 pet baru yang siap diintegrasikan:

| ID Pet | Kelangkaan | Nama Pet | Ikon Twemoji | Kode Twemoji | Fokus Taktis Pasif Utama |
| :--- | :---: | :--- | :---: | :---: | :--- |
| `pet_hamster` | `COMMON` | Hamster Tabungan | 🐹 | `1f439` | Peluang 25% drop +5 Koin tiap benar |
| `pet_rabbit` | `COMMON` | Kelinci Lincah | 🐰 | `1f430` | Tambahan waktu timer +0.8s |
| `pet_chick` | `COMMON` | Anak Ayam Semangat | 🐥 | `1f424` | Bonus XP Petualang +5% |
| `pet_turtle` | `COMMON` | Kura-Kura Sabar | 🐢 | `1f422` | Perisai tempur awal +8 Shield |
| `pet_panda` | `COMMON` | Panda Santai | 🐼 | `1f43c` | Reduksi 25% damage jika timeout |
| `pet_bear` | `COMMON` | Beruang Madu | 🐻 | `1f43b` | Serangan jawaban benar +2 Flat DMG |
| `pet_frog` | `COMMON` | Katak Loncat | 🐸 | `1f438` | Menjawab <3s dapat +10 Bonus XP |
| `pet_duck` | `COMMON` | Bebek Riang | 🦆 | `1f986` | Proteksi penalti koin kalah 40% |
| `pet_mouse` | `COMMON` | Tikus Penjelajah | 🐭 | `1f42d` | Peluang drop peti harta +8% |
| `pet_koala` | `COMMON` | Koala Teduh | 🐨 | `1f428` | Pemulihan pasca duel +3 HP |
| `pet_wolf` | `RARE` | Serigala Rimba | 🐺 | `1f43a` | Tiap 4 Combo: +12% Crit giliran berikutnya |
| `pet_hedgehog`| `RARE` | Landak Duri | 🦔 | `1f994` | Pantulan duri (Thorns) 4 True Damage |
| `pet_otter` | `RARE` | Berang-Berang Kali | 🦦 | `1f9a6` | Tiap 4 Combo: Memulihkan +1 Energi |
| `pet_bat` | `RARE` | Kelelawar Gema | 🦇 | `1f987` | 20% Peluang eliminasi 1 opsi salah |
| `pet_racoon` | `RARE` | Musang Cerdik | 🦝 | `1f99d` | Tiap 5 Combo: Curi 10-15 Koin bos |
| `pet_deer` | `RARE` | Rusa Cahaya | 🦌 | `1f98c` | Peluang menghindar +7% Dodge Rate |
| `pet_parrot` | `RARE` | Beo Cendekia | 🦜 | `1f99c` | Akurasi 100% (Perfect): Bonus +30% XP |
| `pet_chameleon`| `RARE` | Bunglon Ilusi | 🦎 | `1f98e` | Reduksi damage bos 18% di 2 turn awal |
| `pet_tiger` | `EPIC` | Harimau Belang | 🐅 | `1f42f` | Tiap soal ke-5: Auto-Critical x2.2 DMG |
| `pet_lion` | `EPIC` | Singa Padang Emas | 🦁 | `1f981` | Reduksi 25% Enrage Bos & +15 Shield |
| `pet_eagle` | `EPIC` | Elang Rajawali | 🦅 | `1f985` | Freeze Time +2.5s & Tembus 15% Armor |
| `pet_crocodile`| `EPIC` | Buaya Purba | 🐊 | `1f40a` | Vampiric Lifesteal: Sedot 12% DMG jadi HP |
| `pet_jellyfish`| `EPIC` | Ubur-Ubur Abisal | 🪼 | `1fac0` | 20% Peluang Stun membatalkan aksi bos |
| `pet_snake` | `EPIC` | Kobra Giok Mistis | 🐍 | `1f40d` | Bisa racun menumpuk 4 DMG/turn (max 3x) |
| `pet_kirin` | `LEGEND` | Kirin Bintang Suci| 🦄✨| `1f984` | Cheat Death 1x + 25 Shield + 2 Energi |
| `pet_gryphon` | `LEGEND` | Gryphon Petir | 🦅⚡| `1f985` | Tiap 5 Combo: Petir 35 Dmg & Stun 3s |
| `pet_leviathan`| `LEGEND` | Kraken Samudra | 🦑🌊| `1f991` | Serap Dmg ➔ Tsunami 30 Dmg & Heal 15 HP |
| `pet_fenrir` | `LEGEND` | Serigala Es Fenrir| 🐺❄️| `1f43a` | Reduksi 10% Dmg & Tameng Kebal 1x Salah |

---

## 9. Rancangan Set Bonus Baru (Sinergi Perlengkapan)

Untuk memperdalam kepuasan pemain dalam meracik perlengkapan avatar (*theory-crafting*), kami merancang **5 Set Bonus Baru** yang memanfaatkan pet-pet baru ini bersama kostum dan topi yang sudah ada:

### 1. Set Penjaga Hutan Purba (*Set Warden of the Glade*)
- **Komponen**: `hat_explorer` + `outfit_vest` + `pet_deer` + `bg_meadow`
- **Bonus Aktif**:
  - `dodgeRate`: +8%
  - `startShield`: +15
  - *Deskripsi*: **Naluri Satwa Hutan: +8% Hindaran Tambahan & +15 Perisai Awal.**

### 2. Set Pemburu Arus Abisal (*Set Abyssal Vanguard*)
- **Komponen**: `hat_pirate` + `outfit_stripes` + `pet_jellyfish` + `bg_cave`
- **Bonus Aktif**:
  - `staticShockStunChance`: +10%
  - `coinBonus`: +15%
  - *Deskripsi*: **Sentakan Ombak Gelap: Peluang Stun Musuh naik menjadi 30% & Bonus Koin +15%.**

### 3. Set Maharaja Bintang Langit (*Set Celestial Overlord*)
- **Komponen**: `hat_crown` + `outfit_robe` + `pet_kirin` + `bg_aurora`
- **Bonus Aktif**:
  - `startShield`: +35
  - `critChance`: +10%
  - `healOnCorrect`: +2
  - *Deskripsi*: **Kedaulatan Bintang: +35 Perisai Awal, +10% Crit Chance, dan Pemulihan +2 HP tiap benar.**

### 4. Set Panglima Perang Taring Baja (*Set Beastmaster Warlord*)
- **Komponen**: `hat_knight` + `outfit_armor` + `pet_tiger` + `weapon_sword`
- **Bonus Aktif**:
  - `thornsDamage`: +6
  - `critMultiplier`: 2.5
  - *Deskripsi*: **Taring Besi: Pengganda Serangan Kritis naik ke x2.5 & Pantulan Duri +6 DMG.**

### 5. Set Badai Kutub Utara (*Set Glacial Stormcaller*)
- **Komponen**: `hat_wizard` + `weapon_wand` + `pet_fenrir` + `bg_sky`
- **Bonus Aktif**:
  - `freezeTimeBonus`: +2.0
  - `damageReduction`: +12%
  - *Deskripsi*: **Gletser Absolut: Waktu Beku Soal bertambah +2.0 Detik & Reduksi Kerusakan +12%.**

---

## 10. Spesifikasi Teknis & Integrasi Kode Sumber

Arsitektur penambahan 28 pet baru ini dirancang agar kompatibel 100% (*drop-in compatible*) dengan sistem yang sudah berjalan di server `https://play.printshare.my.id/`.

### A. Modifikasi Modul `shared/avatar.js`

#### 1. Perluasan Kamus `PET` Twemoji Map
```javascript
const PET = {
  // Eksisting:
  pet_cat: '1f431',
  pet_dog: '1f436',
  pet_penguin: '1f427',
  pet_fox: '1f98a',
  pet_owl: '1f989',
  pet_dragon: '1f432',

  // 10 Common Baru:
  pet_hamster: '1f439',
  pet_rabbit: '1f430',
  pet_chick: '1f424',
  pet_turtle: '1f422',
  pet_panda: '1f43c',
  pet_bear: '1f43b',
  pet_frog: '1f438',
  pet_duck: '1f986',
  pet_mouse: '1f42d',
  pet_koala: '1f428',

  // 8 Rare Baru:
  pet_wolf: '1f43a',
  pet_hedgehog: '1f994',
  pet_otter: '1f9a6',
  pet_bat: '1f987',
  pet_racoon: '1f99d',
  pet_deer: '1f98c',
  pet_parrot: '1f99c',
  pet_chameleon: '1f98e',

  // 6 Epic Baru:
  pet_tiger: '1f42f',
  pet_lion: '1f981',
  pet_eagle: '1f985',
  pet_crocodile: '1f40a',
  pet_jellyfish: '1fac0',
  pet_snake: '1f40d',

  // 4 Legend Baru (+1 Eksklusif Phoenix):
  pet_phoenix: '1f985',
  pet_kirin: '1f984',
  pet_gryphon: '1f985',
  pet_leviathan: '1f991',
  pet_fenrir: '1f43a'
};
```

#### 2. Shader dan Definisi Partikel Visual Baru (`shared/avatar.js`)
Di dalam `getAllItemDefs(uid)` ditambahkan definisi gradien warna aura untuk pet tingkat tinggi:
```xml
<!-- Aura Pet Legend: Kirin (Safir Kosmik) -->
<radialGradient id="pkirin-${uid}" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#c084fc" stop-opacity="0.8"/>
  <stop offset="70%" stop-color="#60a5fa" stop-opacity="0.4"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>

<!-- Aura Pet Legend: Gryphon (Badai Petir Emas) -->
<radialGradient id="pgryphon-${uid}" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#fef08a" stop-opacity="0.9"/>
  <stop offset="65%" stop-color="#eab308" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#ca8a04" stop-opacity="0"/>
</radialGradient>

<!-- Aura Pet Legend: Kraken (Palung Laut Toska) -->
<radialGradient id="pkraken-${uid}" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#67e8f9" stop-opacity="0.85"/>
  <stop offset="70%" stop-color="#0284c7" stop-opacity="0.45"/>
  <stop offset="100%" stop-color="#0369a1" stop-opacity="0"/>
</radialGradient>

<!-- Aura Pet Legend: Fenrir (Gletser Salju Cyan) -->
<radialGradient id="pfenrir-${uid}" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
  <stop offset="50%" stop-color="#7dd3fc" stop-opacity="0.55"/>
  <stop offset="100%" stop-color="#0284c7" stop-opacity="0"/>
</radialGradient>
```

#### 3. Logika Render Multi-Tier pada `renderPetElement(petId, uid)`
```javascript
function renderPetElement(petId, uid) {
  if (!petId || !PET[petId]) return '';
  const code = PET[petId];

  const LEGENDS = ['pet_dragon', 'pet_phoenix', 'pet_kirin', 'pet_gryphon', 'pet_leviathan', 'pet_fenrir'];
  const EPICS = ['pet_owl', 'pet_tiger', 'pet_lion', 'pet_eagle', 'pet_crocodile', 'pet_jellyfish', 'pet_snake'];
  const RARES = ['pet_penguin', 'pet_fox', 'pet_wolf', 'pet_hedgehog', 'pet_otter', 'pet_bat', 'pet_racoon', 'pet_deer', 'pet_parrot', 'pet_chameleon'];

  const isLegend = LEGENDS.includes(petId);
  const isEpic = EPICS.includes(petId);
  const isRare = RARES.includes(petId);

  let petAura = `<ellipse cx="32" cy="182" rx="28" ry="6.5" fill="url(#pp-${uid})"/>`;
  let petExtra = '';

  if (isRare) {
    petAura += `<circle class="fx-pulse" cx="32" cy="160" r="28" fill="url(#ppr-${uid})"/>`;
  } else if (isEpic) {
    petAura += `<circle class="fx-pulse" cx="32" cy="160" r="30" fill="url(#ppe-${uid})"/>`;
    petExtra += `
      <circle class="fx-rise" style="animation-delay:0.0s" cx="34" cy="160" r="2" fill="#e9d5ff"/>
      <circle class="fx-rise" style="animation-delay:1.5s" cx="24" cy="165" r="1.8" fill="#e9d5ff"/>
    `;
  } else if (isLegend) {
    let auraUrl = `#pg-${uid}`;
    if (petId === 'pet_kirin') auraUrl = `#pkirin-${uid}`;
    else if (petId === 'pet_gryphon') auraUrl = `#pgryphon-${uid}`;
    else if (petId === 'pet_leviathan') auraUrl = `#pkraken-${uid}`;
    else if (petId === 'pet_fenrir') auraUrl = `#pfenrir-${uid}`;

    petAura += `<circle class="fx-pulse" cx="32" cy="160" r="34" fill="url(${auraUrl})"/>`;
    
    // Partikel Dinamis Sesuai Karakter Elemen
    if (petId === 'pet_kirin' || petId === 'pet_dragon') {
      petExtra += `
        <g transform="translate(10 140) scale(0.8)"><path class="fx-twinkle" style="animation-delay:0.3s" fill="#fff" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
        <g transform="translate(56 150) scale(0.7)"><path class="fx-twinkle" style="animation-delay:1.1s" fill="#fef08a" d="M0 -7Q1 -1 7 0Q1 1 0 7Q-1 1 -7 0Q-1 -1 0 -7Z"/></g>
      `;
    } else if (petId === 'pet_gryphon') {
      petExtra += `
        <circle class="fx-pulse" style="animation-delay:0.2s" cx="44" cy="148" r="3" fill="#fef08a"/>
        <line x1="28" y1="145" x2="36" y2="155" stroke="#fef08a" stroke-width="1.5" class="fx-twinkle"/>
      `;
    } else if (petId === 'pet_leviathan') {
      petExtra += `
        <circle class="fx-rise" style="animation-delay:0.2s" cx="26" cy="166" r="2.2" fill="#a5f3fc"/>
        <circle class="fx-rise" style="animation-delay:1.0s" cx="38" cy="158" r="1.8" fill="#67e8f9"/>
      `;
    } else if (petId === 'pet_fenrir') {
      petExtra += `
        <circle class="fx-rise" style="animation-delay:0.0s" cx="30" cy="152" r="2" fill="#e0f2fe"/>
        <polygon points="50,146 52,150 48,150" fill="#bae6fd" class="fx-twinkle"/>
      `;
    }
  }

  const imgClass = (isEpic || isLegend) ? 'fx-float-sm' : '';
  return `${petAura}${petExtra}<image class="${imgClass}" href="${TWEMOJI}/${code}.svg" x="8" y="136" width="48" height="48"/>`;
}
```

---

### B. Modifikasi Modul `shared/passives.js`

Menambahkan penanganan akumulasi statistik pasif di dalam fungsi `calculatePassives(equippedItemIds, itemsCatalog)`:

```javascript
// Tambahan properti pada objek stats inisial:
const stats = {
  // ... properti eksisting ...
  cheatDeath: false,              // pet_kirin
  gryphonThunderChance: null,     // pet_gryphon
  krakenSurge: null,              // pet_leviathan
  fenrirShield: null,             // pet_fenrir
  tigerAutoCritInterval: 0,       // pet_tiger
  vampiricLifesteal: 0,           // pet_crocodile
  staticShockStunChance: 0,       // pet_jellyfish
  venomBloom: null,               // pet_snake
  sonarEliminateChance: 0,        // pet_bat
  speedAnswerXp: null,            // pet_frog
  timeoutDamageReduction: 0,      // pet_panda
  // ...
};

// Pemetaan properti pasif dari item katalog:
if (p.cheatDeath) stats.cheatDeath = true;
if (p.gryphonThunderChance) stats.gryphonThunderChance = p.gryphonThunderChance;
if (p.krakenSurge) stats.krakenSurge = p.krakenSurge;
if (p.fenrirShield) stats.fenrirShield = p.fenrirShield;
if (p.tigerAutoCritInterval) stats.tigerAutoCritInterval = p.tigerAutoCritInterval;
if (p.vampiricLifesteal) stats.vampiricLifesteal += p.vampiricLifesteal;
if (p.staticShockStunChance) stats.staticShockStunChance += p.staticShockStunChance;
if (p.venomBloom) stats.venomBloom = p.venomBloom;
if (p.sonarEliminateChance) stats.sonarEliminateChance += p.sonarEliminateChance;
if (p.speedAnswerXp) stats.speedAnswerXp = p.speedAnswerXp;
if (p.timeoutDamageReduction) stats.timeoutDamageReduction += p.timeoutDamageReduction;
```

---

### C. Modifikasi Engine Tempur Bos & Duel (`lib/db.js` & `lib/db-duel.js`)

Pada saat proses evaluasi jawaban di `applyBossCombatTurn`:

```javascript
// 1. Evaluasi Terkaman Otomatis Harimau (Auto-Crit Tiap Soal ke-5)
if (isCorrect && passives.tigerAutoCritInterval && (newStreak > 0) && (newStreak % passives.tigerAutoCritInterval === 0)) {
  isPassiveCrit = true;
  bossDamage = Math.round(bossDamage * 2.2);
  notice = notice ? (notice + ' · TERKAMAN HARIMAU! 🐅 (CRIT x2.2)') : 'TERKAMAN HARIMAU! 🐅 (CRIT x2.2)';
  triggeredPassives.push({ id: 'tigerPounce', name: 'Terkaman Harimau!', icon: '🐅', desc: 'Auto-Crit x2.2 DMG' });
}

// 2. Evaluasi Gryphon Thunder Strike (Tiap 5 Combo)
if (isCorrect && passives.gryphonThunderChance && (newStreak > 0) && (newStreak % passives.gryphonThunderChance.combo === 0)) {
  const thunderDmg = passives.gryphonThunderChance.damage || 35;
  bossDamage += thunderDmg;
  notice = notice ? (notice + ' · SAMBARAN GRYPHON! 🦅⚡ (+' + thunderDmg + ' DMG)') : 'SAMBARAN GRYPHON! 🦅⚡ (+' + thunderDmg + ' DMG)';
  triggeredPassives.push({ id: 'thunderGryphon', name: 'Sambaran Petir Gryphon', icon: '⚡', desc: `Petir Halilintar +${thunderDmg} DMG` });
}

// 3. Evaluasi Vampiric Lifesteal Buaya Purba
if (isCorrect && passives.vampiricLifesteal && bossDamage > 0) {
  const drainHp = Math.max(1, Math.round(bossDamage * passives.vampiricLifesteal));
  healAmount += drainHp;
  triggeredPassives.push({ id: 'vampiricDrain', name: 'Kuncian Rawa', icon: '🐊', desc: `Sedot Darah +${drainHp} HP` });
}

// 4. Evaluasi Stun Ubur-Ubur Abisal
if (isCorrect && passives.staticShockStunChance && Math.random() < passives.staticShockStunChance) {
  rawPlayerDamage = 0; // Bos pingsan / stun, tidak membalas giliran ini
  notice = notice ? (notice + ' · BOS TERSENGAT STUN! 🪼') : 'BOS TERSENGAT STUN! 🪼';
  triggeredPassives.push({ id: 'abyssalStun', name: 'Sengatan Abisal', icon: '🪼', desc: 'Bos Terkena Stun (Tidak Menyerang)' });
}

// 5. Evaluasi Cheat Death Kirin Bintang Suci
if (newPlayerHp <= 0 && passives.cheatDeath && !s.cheatDeathUsed) {
  newPlayerHp = 1;
  newShieldHp += 25;
  mysteryEnergy += 2;
  s.cheatDeathUsed = true;
  notice = notice ? (notice + ' · MUKJIZAT KIRIN SUCI! 🦄✨ (Kebal Kematian)') : 'MUKJIZAT KIRIN SUCI! 🦄✨ (Kebal Kematian)';
  triggeredPassives.push({ id: 'kirinMiracle', name: 'Mukjizat Kirin', icon: '🦄✨', desc: 'Kebal Kematian, +25 Shield, +2 Energi' });
}
```

---

## 11. Sistem Distribusi, Toko, & Gacha Drop Rate

Agar seluruh pet terdistribusi secara seimbang dan memberikan kepuasan progres bagi pemain:

### A. Toko Koin Reguler (Akses Langsung dengan Koin Emas)
Pemain dapat membeli pet idaman secara langsung tanpa bergantung pada keberuntungan gacha:
- **Pet Common Baru** (Hamster, Kelinci, Panda, Beruang, Katak, Bebek, Tikus, Koala): **180 - 250 Koin Emas**.
- **Pet Rare Baru** (Landak, Rusa, Beo): **500 - 650 Koin Emas**.

### B. Kotak Hadiah Mode Cerita (Wilayah 1, 2, dan 3)
Sesuai pembaruan rate gacha mingguan:
- **Wilayah 1 (Hutan Permulaan)**:
  - Common Pet: 45%
  - Rare Pet: 20%
  - Koin Emas (10-30): 35%
- **Wilayah 2 (Gua Kristal & Rawa Kabut)**:
  - Common Pet: 35%
  - Rare Pet: 25%
  - Epic Pet: 10%
  - Koin Emas (20-40): 30%
- **Wilayah 3 (Puncak Gunung Langit)**:
  - Common Pet: 25%
  - Rare Pet: 15%
  - Epic Pet: 10%
  - Legend Pet: 5%
  - Koin Emas (10-50): 45%

### C. Hadiah Kehormatan Lencana Legendaris (Prestise Tertinggi)
Pet Legend tidak dijual di toko dan tidak dapat dibeli dengan uang nyata:
1. `pet_dragon`: Selesaikan 25 stage Mode Cerita (*Lencana Penjelajah Kampanye*).
2. `pet_phoenix`: Menangkan 25 laga pertarungan dengan sisa darah ≤ 20% (*Lencana Hati Phoenix*).
3. `pet_kirin`: Menangkan 30 laga dengan sisa darah ≤ 10% (*Lencana Penyelamat Terakhir*).
4. `pet_gryphon`: Capai rekor 20 Combo Streak berturut-turut di Mode Brutal (*Lencana Raja Kombo Petir*).
5. `pet_fenrir`: Taklukkan seluruh bos Mode Cerita tanpa terkalahkan 1 kali pun (*Lencana Penakluk Puncak Es*).

---

## 12. Rencana Implementasi & Pengujian Kualitas

Proses penambahan 28 pet ini akan dieksekusi secara bertahap mengikuti disiplin TDD (*Test-Driven Development*) dan aturan Andrej Karpathy:

```
[Tahap 1: Registrasi Data]   --> verify: Validasi node test katalog ITEMS & keunikan ID item
[Tahap 2: Rendering Avatar]  --> verify: Render SVG untuk 28 pet baru bebas error XML / clipping
[Tahap 3: Logika Pasif]      --> verify: Unit test calculatePassives & batasan Hard Cap
[Tahap 4: Battle Integration]--> verify: Test simulasi duel & bos di lib/db.js (37/37 test pass)
[Tahap 5: Deployment VPS]    --> verify: Reload PM2 di server dan verifikasi web UI play.printshare.my.id
```

### Kriteria Kelulusan Pengujian (Success Criteria):
1. Seluruh 28 pet memiliki ID unik, nama yang edukatif, dan deskripsi lore bahasa Indonesia yang menarik.
2. Tidak ada tumpang tindih (*ID collision*) pada `ITEMS` maupun Twemoji map di `shared/avatar.js`.
3. Seluruh efek pasif memiliki batas atas yang aman (*hard-capped*) sehingga tidak merusak keseimbangan permainan PvP maupun PvE.
4. Tampilan avatar SVG pet di sisi kiri karakter terpusat rapi, tidak menutupi kaki karakter, dan animasi aura berdenyut mulus pada perangkat mobile (HP Android/iPhone).

---

## 🏁 KESIMPULAN & REKOMENDASI

Penambahan **28 Pet Baru** (10 Common, 8 Rare, 6 Epic, 4 Legend) ini akan mentransformasi game *Petualangan Pelajar* dari kuis sederhana menjadi pengalaman RPG edukasi yang sangat kaya, adiktif, dan membakar semangat belajar anak-anak sekolah. 

Variasi gaya bermain baru (*Tanker, Speedrunner, Combo Master, Vampiric Survivor*) akan menciptakan diskusi komunitas yang positif mengenai kombinasi avatar terbaik, sekaligus meningkatkan retensi harian pemain untuk terus berlatih dan belajar setiap hari.

Dokumen proposal ini siap direalisasikan ke dalam repositori kode produksi setelah disetujui.

---
*Dokumen Disusun oleh: AI Engineering & Game Design Team*  
*Petualangan Pelajar — Portal Edukasi Interaktif Generasi Emas* 🚀🐾
