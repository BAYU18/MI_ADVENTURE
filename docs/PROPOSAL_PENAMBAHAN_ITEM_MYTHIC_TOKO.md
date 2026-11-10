# 📜 PROPOSAL PENGEMBANGAN: PENAMBAHAN TIER MYTHIC & 16 ITEM BARU DI TOKO
**Game Edukasi RPG: Petualangan Pelajar (Meridan Go / MI Adventure)**  
*Dokumen Arsitektur Sistem, Desain Item, Mekanika Efek RPG, dan Model Ekonomi*

---

## 1. Eksekutif Ringkasan (Executive Summary)

Seiring dengan perkembangan konten pertempuran, Mode Cerita 4 Bab, Arena Bos Brutal, dan sistem kustomisasi karakter (Lemari & Toko), para pemain dan petualang berprestasi membutuhkan **tujuan akhir (endgame goal)** yang prestisius untuk membelanjakan koin emas dan mengoptimalkan strategi pertempuran mereka.

Saat ini tingkatan kelangkaan (*rarity*) di toko berhenti pada tingkat **Legendary (🟡)**. Proposal ini mengajukan peluncuran tingkatan kelangkaan tertinggi baru, yaitu **MYTHIC (🔴 / 🌌)**, dengan menghadirkan **tepat 2 item Mythic di setiap kategori toko** (total 8 kategori $\times$ 2 item = **16 Item Mythic Baru**).

Setiap item Mythic dirancang memiliki:
1. **Identitas Visual Berkelas Dewa/Kosmik**: Menggunakan palet Crimson Red `#ff0055`, Divine Gold `#fde047`, dan Cosmic Purple `#8b00ff` dengan efek partikel visual shimmer 3D.
2. **Efek & Kemampuan Unik Berbeda-beda**: Tidak ada efek pasif yang sama; masing-masing menawarkan variasi mekanisme tempur (*True Damage, Time Rewind, Counter Blast, Void Accumulation, Instant Strike, Stun Torrent, Rebirth, Quantum Echo, dll.*).
3. **Ekonomi Terkalibrasi**: Harga yang proporsional sebagai simbol dedikasi dan prestasi pemain (1.800 – 2.500 Koin Emas).
4. **Sinergi Set Bonus Eksklusif**: Menghadirkan 2 Mahaset Bonus Baru (*Set Pantheon Batara Nusantara* & *Set Singgasana Kosmik Voidwalker*).

---

## 2. Struktur Kategori Toko & Daftar 16 Item Mythic

Toko game terbagi dalam **8 Kategori Resmi**:
1. 👑 **Topi / Mahkota (`hat`)**
2. 🥋 **Pakaian / Zirah (`outfit`)**
3. ⚔️ **Senjata / Relik (`weapon`)**
4. 🐾 **Hewan Peliharaan (`pet`)**
5. 🖼️ **Latar Belakang (`bg`)**
6. 💠 **Bingkai Avatar (`frame`)**
7. 🏅 **Gelar Juara (`title`)**
8. ⚡ **Upgrade Permanen (`permanent`)**

Berikut adalah rincian lengkap 2 item Mythic pada masing-masing kategori:

---

### KATEGORI 1: 👑 TOPI / MAHKOTA (`hat`)

#### 1.1. Mahkota Batara Surya
* **ID Item**: `hat_batara_surya`
* **Slot**: `hat`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.000 Koin Emas
* **Visual Artwork**: Mahkota emas murni 24 karat bertatahkan batu surya menyala, dikelilingi lidah api suci berkobar 8 penjuru mata angin dan pendaran cahaya ilahi.
* **Efek & Kemampuan Pasif**: **Supernova Radiance (Aura Surya Abadi)**
  * **Start Shield**: Memulai pertempuran dengan **+25 Perisai Awal**.
  * **Solar Burn (True Damage)**: Saat pemain mencapai *Combo Streak* $\ge 5$, setiap jawaban benar berikutnya membakar darah bos sebesar 5% dari sisa HP bos saat itu (True Damage, max 20 DMG per soal).
  * **Freeze & Chill Immunity**: Pemain 100% kebal terhadap pengurangan waktu akibat jurus es/beku bos.
* **Kutipan Lore**: *"Mahkota warisan Batara Surya yang memancarkan kehangatan jutaan fajar. Kegelapan dan rasa ragu sirna seketika di bawah sinarnya."*

#### 1.2. Helm Chronos Abisal
* **ID Item**: `hat_chronos_abyss`
* **Slot**: `hat`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 1.950 Koin Emas
* **Visual Artwork**: Helm tempur obsidian hitam legam bertanduk ganda, di bagian dahi melayang sebuah jam pasir kosmik mini dengan pasir kuantum yang mengalir terbalik melawan waktu.
* **Efek & Kemampuan Pasif**: **Temporal Distortion (Distorsi Waktu Mundur)**
  * **Bonus Waktu Berpikir**: Menambah waktu timer soal sebesar **+3.0 Detik** secara konstan.
  * **Time Rewind (Pembalikan Waktu)**: Sekali per pertempuran, jika waktu soal menyentuh 0 detik, waktu otomatis diputar kembali ke 5.0 detik tanpa pemain dianggap salah (*Auto-Rescue*).
  * **Chrono Siphon**: Mengubah 15% damage bos yang masuk menjadi pemulihan energi (+1 Energi tiap akumulasi 20 DMG diterima).
* **Kutipan Lore**: *"Ditempa di dasar palung waktu abisal. Penggunanya tidak lagi diperbudak detik, melainkan memerintah sang waktu itu sendiri."*

---

### KATEGORI 2: 🥋 PAKAIAN / ZIRAH (`outfit`)

#### 2.1. Zirah Kencana Antakusuma
* **ID Item**: `outfit_antakusuma`
* **Slot**: `outfit`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.200 Koin Emas
* **Visual Artwork**: Rompi zirah emas sakti berukir relief sayap garuda kencana, dilengkapi selendang sutra bercahaya yang melayang tanpa henti di sekeliling torso karakter.
* **Efek & Kemampuan Pasif**: **Brajamusti Deflection (Sentakan Tolak Balak)**
  * **Hindaran Tinggi (Dodge Rate)**: Meningkatkan peluang hindaran sebesar **+14%**.
  * **Counter Blast (Serangan Balik)**: Saat sukses menghindari serangan (*DODGE*), pemain tidak hanya lolos dari damage, tetapi secara otomatis memantulkan **100% damage bos tersebut kembali ke wajah sang bos**!
  * **Damage Reduction**: Mengurangi semua damage monster dan bos yang masuk sebesar flat 15%.
* **Kutipan Lore**: *"Kain pusaka kadewatan yang membuat pemakainya kebal dari senjata tajam dan memantulkan niat jahat musuh menjadi kehancuran bagi penyerangnya."*

#### 2.2. Jubah Void Singularity
* **ID Item**: `outfit_void_singularity`
* **Slot**: `outfit`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.150 Koin Emas
* **Visual Artwork**: Jubah panjang berwarna hitam pekat hampa udara dengan gradasi nebula kosmik ungu di bagian dalam, ujung jubah tampak menghisap partikel debu cahaya di sekitarnya.
* **Efek & Kemampuan Pasif**: **Event Horizon & Void Burst (Gravitasi Lubang Hitam)**
  * **Void Charge Absorption**: Setiap kali pemain menjawab salah, jubah menyerap 50% damage yang diterima dan mengumpulkannya sebagai *Void Energy* (maksimal simpan 40 DMG).
  * **Singularity Release**: Pada jawaban benar berikutnya, seluruh *Void Energy* yang tersimpan diledakkan langsung ke bos sebagai bonus damage tambahan!
  * **Cheat Death Protocol**: Sekali per pertempuran, jika HP pemain tersisa 0 akibat serangan fatal, pemain tidak gugur melainkan bertahan pada 1 HP dan seketika mendapatkan **+30 Perisai Darurat**.
* **Kutipan Lore**: *"Terbuat dari tenunan lubang hitam kosmik. Rasa sakit dan kegagalan bukanlah akhir, melainkan bahan bakar bagi ledakan bintang berikutnya."*

---

### KATEGORI 3: ⚔️ SENJATA / RELIK (`weapon`)

#### 3.1. Keris Pusaka Nagasasra
* **ID Item**: `weapon_nagasasra`
* **Slot**: `weapon`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.400 Koin Emas
* **Visual Artwork**: Keris luk 13 berlapis emas murni dengan bilah pamor meteorit berpendar merah api, gagang berbentuk kepala naga bertakhta batu delima darah.
* **Efek & Kemampuan Pasif**: **Dragon Fang Execution (Tusukan Taring Naga Langit)**
  * **Critical Surge**: Meningkatkan *Critical Chance* sebesar **+12%**, dan menaikkan *Critical Multiplier* dari 1.5x menjadi **2.8x Damage**!
  * **Armor Penetration**: Serangan kritikal menembus pertahanan tebal bos dan memberikan debuff *Pecah Zirah* (bos menerima +20% damage lebih besar selama 3 soal ke depan).
  * **Instant Strike (Peluang Serangan Ganda)**: 20% peluang pada jawaban benar biasa untuk melancarkan serangan ekstra sebesar 1x pukulan penuh.
* **Kutipan Lore**: *"Keris pusaka agung yang ditempa dari serpihan meteor dan darah naga purba. Satu goresannya mampu merobek sisik terkeras monster mana pun."*

#### 3.2. Tongkat Kosmik Genesis
* **ID Item**: `weapon_genesis_staff`
* **Slot**: `weapon`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.350 Koin Emas
* **Visual Artwork**: Tongkat kristal putih aether yang di puncaknya mengambang sebuah galaksi mini berputar lambat, meneteskan pendar partikel bintang dan aurora warna-warni.
* **Efek & Kemampuan Pasif**: **Mana Convergence & Celestial Genesis (Penciptaan Energi Semesta)**
  * **Energy Cost Reduction**: Memotong biaya aktivasi semua skill aktif sebesar **-1 Energi** (minimum tetap 1 energi).
  * **Life Catalyst**: Setiap kali pemain mengaktifkan skill apa pun (seperti Coret Jawaban, Teropong, atau Bekukan Waktu), pemain otomatis memulihkan **+15 HP** dan damage soal berikutnya naik +35%.
  * **Full Energy Empowerment**: Saat bar energi pemain berada pada kapasitas penuh, seluruh jawaban benar mendapatkan bonus flat **+15 DMG**.
* **Kutipan Lore**: *"Pusaka para arsitek semesta. Setiap kata pengetahuan yang terucap mengubah energi murni menjadi mukjizat penyembuhan dan ledakan cahaya."*

---

### KATEGORI 4: 🐾 HEWAN PELIHARAAN (`pet`)

#### 4.1. Leviathan Samudra Purba
* **ID Item**: `pet_leviathan`
* **Slot**: `pet`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.250 Koin Emas
* **Visual Artwork**: Anak naga air abisal berkulit sisik safir bercahaya dengan surai air terjun mini, melayang di samping pemain dalam gelembung air pelindung yang berputar.
* **Efek & Kemampuan Pasif**: **Tidal Torrent & Water Aegis (Sentakan Ombak Purba)**
  * **Tidal Stun**: Setiap mencapai kelipatan 3 jawaban benar berturut-turut, Leviathan menyemburkan gelombang tsunami mini yang **men-stun bos selama 1 giliran** (bos batal menyerang atau mengeluarkan jurus telegraph).
  * **Perpetual Bubble**: Setiap soal baru dimulai, pemain otomatis menerima **+6 Perisai Gelembung** (dapat menumpuk hingga maks 30 Shield).
  * **Purification**: Secara otomatis membersihkan efek negatif yang menempel pada pemain (racun DoT api, kutukan heal, atau segel kombo).
* **Kutipan Lore**: *"Penjaga lautan terdalam bumi yang telah menyaksikan ribuan zaman. Derunya menenggelamkan kemurkaan bos terbuas sekalipun."*

#### 4.2. Phoenix Nirvana Abadi
* **ID Item**: `pet_phoenix_nirvana`
* **Slot**: `pet`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.300 Koin Emas
* **Visual Artwork**: Burung api suci dengan bulu merah marun berkilau emas, mengepakkan sayap bara menyala dan meninggalkan jejak partikel bulu emas yang jatuh perlahan.
* **Efek & Kemampuan Pasif**: **Nirvana Rebirth & Molten Prosperity (Api Kebangkitan & Kemakmuran)**
  * **Nirvana Rebirth**: Jika pemain gugur dalam duel atau pertempuran bos, Phoenix seketika meledak dalam cahaya api suci, **menghidupkan kembali pemain dengan 50% HP dan +4 Energi** (1x per pertempuran).
  * **Molten Gold**: Meningkatkan perolehan koin emas dari jawaban benar sebesar **+40%**, dan melipatgandakan koin dari peti harta karun menjadi 2x lipat.
  * **First Mercy**: Jawaban salah pertama dalam suatu pertempuran tidak mengurangi HP pemain sama sekali (*Shield of Grace*).
* **Kutipan Lore**: *"Burung legenda yang terlahir kembali dari abunya sendiri. Di mana ada Phoenix, di situ kekalahan hanyalah awal dari kemenangan yang lebih cemerlang."*

---

### KATEGORI 5: 🖼️ LATAR BELAKANG (`bg`)

#### 5.1. Gerbang Nirwana Kahyangan
* **ID Item**: `bg_kahyangan`
* **Slot**: `bg`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 1.850 Koin Emas
* **Visual Artwork**: Panorama megah istana kadewatan di atas hamparan awan keemasan bertingkat, pilar marmer putih berukir relief dewa dewi, gapura paduraksa megah, dan tangga pelangi menuju cakrawala fajar.
* **Efek & Kemampuan Pasif**: **Divine Blessing of the Gods (Berkah Keagungan Swargaloka)**
  * **Experience Multiplier**: Memberikan bonus **+15% EXP** permanen di seluruh mode permainan (Peta Cerita, Latihan Bebas, Mode Brutal).
  * **Quick Answer Grace**: Jika pemain menjawab benar dalam waktu kurang dari 3.0 detik (*Speed Answer*), pemain otomatis memulihkan **+4 HP** dan mendapatkan **+2 Koin Bonus**.
  * **Brutal Suppressor**: Melemahkan bos di Mode Brutal sebesar 20% (damage bos turun 20%).
* **Kutipan Lore**: *"Gerbang perbatasan antara alam fana dan swargaloka. Hanya jiwa-jiwa berilmu tinggi yang diizinkan menjejakkan kaki di atas awan keemasannya."*

#### 5.2. Dimensi Celah Multiverse
* **ID Item**: `bg_multiverse_rift`
* **Slot**: `bg`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 1.900 Koin Emas
* **Visual Artwork**: Dimensi hiper-ruang berlatar galaksi ungu tua dengan serpihan cermin realitas melayang, tesseract kubus neon bercahaya cyan-magenta, dan aliran matriks biner kosmik.
* **Efek & Kemampuan Pasif**: **Quantum Duplication (Anomali Kuantum Semesta)**
  * **Quantum Echo (Serangan Dobel)**: 25% peluang pada setiap jawaban benar untuk memicu gema kuantum: serangan dihitung **2x lipat** ke bos dan memberikan koin dobel!
  * **Loot Transmutation**: Meningkatkan peluang mendapatkan hadiah skin/item langka di akhir pertempuran sebesar **+15%**.
  * **Batas Koin Harian Ekstra**: Memperluas kapasitas batas koin harian (*Daily Coin Cap*) sebesar **+200 Koin Emas**.
* **Kutipan Lore**: *"Pusat konvergensi jutaan realitas paralel. Di sini, satu jawaban benar bergaung ke seluruh dimensi, melipatgandakan takdir kemenanganmu."*

---

### KATEGORI 6: 💠 BINGKAI AVATAR (`frame`)

#### 6.1. Bingkai Segel Ouroboros Tak Terhingga
* **ID Item**: `frame_ouroboros`
* **Slot**: `frame`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 1.800 Koin Emas
* **Visual Artwork**: Bingkai melingkar elegan berupa dua ekor naga emas kembar yang saling menggigit ekor (simbol infinity), dihiasi batu zamrud hijau tua berdenyut dengan orbit cincin rune bercahaya.
* **Efek & Kemampuan Pasif**: **Eternal Continuity (Kontinuitas Abadi)**
  * **Streak Safeguard (Pelindung Kombo)**: Melindungi *Combo Streak* agar tidak pecah/reset saat pemain melakukan 1 kali kesalahan jawaban (1x proteksi per pertempuran).
  * **Infinite Multiplier Cap**: Meningkatkan batas plafon pengali kombo (*Combo Multiplier Cap*) dari batas normal 1.5x menjadi **2.2x Damage**!
  * **Free Eliminate**: Setiap kali pemain mencapai kelipatan 5 kombo, 1 opsi jawaban salah di soal berikutnya otomatis dicoret cuma-cuma tanpa memakan energi.
* **Kutipan Lore**: *"Ular kembar kosmik yang melambangkan keabadian dan siklus tanpa batas. Tak ada kombo yang runtuh selama tekadmu tak tergoyahkan."*

#### 6.2. Bingkai Mahkota Galaksi Supernova
* **ID Item**: `frame_supernova_stellar`
* **Slot**: `frame`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 1.850 Koin Emas
* **Visual Artwork**: Bingkai oktagonal berteknologi prisma kristal kosmik yang memendarkan plasma bintang meledak, dengan aksen pendar neon ungu-emas dan 4 satelit kristal yang mengorbit bingkai.
* **Efek & Kemampuan Pasif**: **Cosmic Resonance (Resonansi Atribut Kosmik)**
  * **Stat Booster Universal**: Meningkatkan seluruh nilai pasif dari perlengkapan lain yang sedang dipakai (Topi, Pakaian, Senjata, Pet) sebesar **+25% efektivitas tambahan** (*All Passives Amplification*).
  * **Critical Precision**: Menambah *Critical Chance* pemain sebesar **+8%**.
  * **Prestige Shimmer**: Kartu profil, daftar pertemanan, dan arena duel mendapatkan efek glow partikel bintang eksklusif yang memukau.
* **Kutipan Lore**: *"Bingkai kehormatan yang ditempa dari serpihan bintang supernova tertua di galaksi. Menghidupkan resonansi terdalam dari setiap pusaka yang kamu bawa."*

---

### KATEGORI 7: 🏅 GELAR JUARA (`title`)

#### 7.1. Gelar: "Sang Penakluk Takdir"
* **ID Item**: `title_destiny_conqueror`
* **Slot**: `title`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.000 Koin Emas
* **Visual Artwork**: Tipografi gelar mewah bergradasi api emas-crimson neon dengan lencana mahkota tengkorak bertanduk dewa dan efek kilatan petir halus di latar belakang teks.
* **Efek & Kemampuan Pasif**: **Fate Overwrite (Kudeta Garis Takdir)**
  * **Weakness Exploitation**: Saat menyerang bos pada topik titik kelemahannya (*Boss Weakness*), damage pemain meningkat fantastis sebesar **+50%** (dari normalnya +20%).
  * **Hard Question Mastery**: Pada soal berkategori SULIT (Tingkat Kesulitan 3), jawaban benar menghasilkan **3x lipat Koin** dan seketika mengisi **+2 Energi**.
  * **Vitality Cap Expansion**: Meningkatkan batas darah maksimal pemain dari 100 HP menjadi **125 HP**.
* **Kutipan Lore**: *"Gelar bagi kesatria yang menolak tunduk pada garis takdir yang telah tertulis. Baginya, setiap soal tersulit adalah panggung kemenangannya."*

#### 7.2. Gelar: "Mahaguru Kebijaksanaan Purba"
* **ID Item**: `title_omni_wisdom`
* **Slot**: `title`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.050 Koin Emas
* **Visual Artwork**: Tipografi berhiaskan kaligrafi emas putih berlian bercahaya teduh dengan ikon mata batin terbuka yang memancarkan prisma pelangi lembut.
* **Efek & Kemampuan Pasif**: **Omniscience Eye (Mata Batin Semesta)**
  * **Trap Option Intuition**: Secara otomatis mendeteksi dan memberi tanda visual khusus (kedipan tipis) pada 1 opsi jawaban pengecoh paling mengecoh di setiap soal.
  * **Scholarly Wealth**: Memberikan bonus **+30% Koin Emas** dan **+25% EXP** permanen di seluruh mode permainan.
  * **Jackpot 100% Akurasi**: Jika pemain menuntaskan suatu wilayah atau arena dengan akurasi sempurna 100% (*No Wrong Answers*), pemain menerima bonus jackpot ekstra **+100 Koin Emas** seketika!
* **Kutipan Lore**: *"Gelar kehormatan tertinggi bagi pencari ilmu sejati. Pengetahuannya menembus kabut ilusi, melihat kebenaran hakiki di setiap pertanyaan."*

---

### KATEGORI 8: ⚡ UPGRADE PERMANEN (`permanent`)

#### 8.1. Berkah Jantung Gaia
* **ID Item**: `perm_gaia_heart`
* **Slot**: `permanent`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.500 Koin Emas
* **Visual Artwork**: Kristal zamrud mentah seukuran genggaman tangan yang berdenyut lembut menyerupai detak jantung organik, dirambati sulur akar emas murni bercahaya hijau toska.
* **Efek & Kemampuan Pasif**: **Perpetual Vitality (Regenerasi Hayati Abadi)**
  * **Kapasitas Energi Permanen Akun**: Menambah batas maksimal kapasitas energi pemain secara permanen sebesar **+2 Energi** (misalnya kapasitas level pemain 12 naik permanen menjadi 14).
  * **In-Battle Auto Regen**: Setiap menyelesaikan 4 soal di pertempuran apa pun, pemain otomatis memulihkan **+10 HP** dan menerima **+1 Energi** secara gratis tanpa perlu mengorbankan giliran.
  * **Loss Protection**: Saat mengalami kekalahan (*Defeat*), pemain tidak kehilangan seluruh reward, melainkan tetap membawa pulang **50% dari total koin dan EXP** yang terkumpul selama sesi tersebut.
* **Kutipan Lore**: *"Pecahan intisari bumi pertiwi yang menyimpan denyut kehidupan abadi. Memberikan stamina tak terbatas dan melindungi penjelajah dari keputusasaan."*

#### 8.2. Batu Alkimia Midas Kosmik
* **ID Item**: `perm_midas_crucible`
* **Slot**: `permanent`
* **Rarity**: `MYTHIC`
* **Harga**: 🪙 2.500 Koin Emas
* **Visual Artwork**: Cawan alkimia melayang berbahan logam orichalcum emas purba, di dalamnya mendidih cairan merkuri bintang yang meneteskan koin-koin emas berkilauan secara kontinu.
* **Efek & Kemampuan Pasif**: **Philosopher's Transmutation (Transmutasi Emas Semesta)**
  * **Dobel Batas Harian Koin**: Menggandakan batas plafon koin harian (*Daily Coin Cap*) pemain secara permanen dari 300 koin menjadi **600 Koin Emas per hari**!
  * **High Coin Drop Rate**: Meningkatkan peluang jatuhnya koin dari setiap jawaban benar menjadi **80%** (dari normalnya ~35%).
  * **Triple Duplicate Conversion**: Setiap kali pemain mendapatkan item duplikat dari Peti Harta atau Gacha, kompensasi koin dikalikan **3x lipat** (misal duplikat Epic memberi 120 koin bukan 40 koin; Legendary memberi 300 koin bukan 100 koin).
* **Kutipan Lore**: *"Relik agung para ahli alkimia kosmik. Segala ilmu dan usaha yang dicurahkan seketika bertransmutasi menjadi kemakmuran emas yang melimpah ruah."*

---

## 3. Mahaset Bonus Baru (Mythic Set Bonuses)

Ketika pemain mengoleksi dan mengenakan kombinasi item-item Mythic tertentu, sistem akan mengaktifkan **Sinergi Mahaset Legendaris**:

### 🌟 Set 1: "Pantheon Batara Nusantara"
* **Komposisi 4 Item**:
  1. Topi: *Mahkota Batara Surya* (`hat_batara_surya`)
  2. Pakaian: *Zirah Kencana Antakusuma* (`outfit_antakusuma`)
  3. Senjata: *Keris Pusaka Nagasasra* (`weapon_nagasasra`)
  4. Latar: *Gerbang Nirwana Kahyangan* (`bg_kahyangan`)
* **Efek Set Bonus**: **Kedaulatan Batara Agung (Divine Sovereignty)**
  * **+50 Perisai Awal** di awal setiap pertempuran.
  * **Kebal Segala Efek Status Negatif** (Stun, Freeze, DoT, Heal Curse).
  * **Pancaran Petir Dewata**: Setiap kali serangan kritikal terpicu, menyambar bos dengan sambaran petir emas berdaya **25 True Damage** seketika!

### 🌌 Set 2: "Singgasana Kosmik Voidwalker"
* **Komposisi 4 Item**:
  1. Topi: *Helm Chronos Abisal* (`hat_chronos_abyss`)
  2. Pakaian: *Jubah Void Singularity* (`outfit_void_singularity`)
  3. Senjata: *Tongkat Kosmik Genesis* (`weapon_genesis_staff`)
  4. Latar: *Dimensi Celah Multiverse* (`bg_multiverse_rift`)
* **Efek Set Bonus**: **Omni-Void Temporal Mastery (Penguasa Kehampaan Kosmik)**
  * **Manipulasi Waktu Mutlak**: Seluruh soal mendapatkan tambahan +2 detik ekstra (total +5 detik).
  * **Cooldown Skill Terpangkas 50%**: Seluruh skill aktif memiliki efisiensi ganda.
  * **Temporal Reversal**: Jika bos melancarkan jurus mematikan (*Charged Hit*), 50% damage tersebut langsung dibalikkan kembali ke bos.

---

## 4. Analisis Keseimbangan (Game Balancing & Economy)

1. **Anti-Paywall & Menjaga Motivasi Belajar**:
   - Seluruh item Mythic dapat dibeli menggunakan **Koin Emas** hasil prestasi belajar, menjawab soal dengan benar, mengalahkan bos, menyelesaikan bab kampanye, dan memenangkan duel.
   - Tidak ada item yang terkunci di balik mata uang riil terpisah, menjunjung tinggi filosofi edukatif permainan.
2. **Skala Koin & Progresi**:
   - Pemain pemula fokus pada item Common (30 koin) dan Rare (90 koin).
   - Pemain menengah membidik Epic (250 koin) dan Legendary (700 koin).
   - Item Mythic (1.800–2.500 koin) menjadi piala pencapaian prestisius jangka panjang (*long-term retention*).
3. **Penyelarasan Kode Sistem**:
   - Struktur data item sepenuhnya kompatibel dengan berkas inti:
     * `shared/economy.js` (katalog `ITEMS` & harga)
     * `shared/passives.js` (perhitungan efek `calculatePassives` & `SET_BONUSES`)
     * `public/js/skin-art.js` & `shared/skin-art.js` (render SVG visual item)
     * `public/js/desktop/screens.js` & `public/js/app.js` (filter rarity `MYTHIC` di Lemari & Toko).

---

## 5. Rencana Tahapan Eksekusi (Roadmap Implementasi)

| Tahap | Aktivitas Utama | Berkas Target |
| :--- | :--- | :--- |
| **Fase 1** | Registrasi 16 data item Mythic, pasif, harga, dan lore | `shared/economy.js` & `shared/passives.js` |
| **Fase 2** | Pembuatan artwork SVG 16 item Mythic dengan visual efek khusus | `public/js/skin-art.js` & `shared/skin-art.js` |
| **Fase 3** | Penambahan filter tab kelangkaan `MYTHIC (🔴)` di antarmuka Toko & Lemari | `public/js/app.js` & `public/js/desktop/screens.js` |
| **Fase 4** | Integrasi logika pertempuran pasif baru (True Damage, Time Rewind, dll.) | `lib/bossfx.js`, `shared/progression.js`, `public/js/app.js` |
| **Fase 5** | Pengujian unit otomatis (*Test Suite*) & Verifikasi Server | `tests/mythic-items.test.js`, PM2 service restart |

---

## 6. Penutup

Hadirnya **16 Item Mythic** dengan efek dan kemampuan yang sangat beragam ini akan memberikan warna baru yang segar, mendalam, dan memotivasi para petualang di Meridan Go / MI Adventure. Pemain akan terdorong untuk terus belajar, menaklukkan bab cerita, menguasai materi pelajaran, dan mengumpulkan koin emas demi meraih perlengkapan impian mereka.

*Disusun dengan penuh dedikasi untuk kemajuan permainan petualangan edukasi terbaik.*
