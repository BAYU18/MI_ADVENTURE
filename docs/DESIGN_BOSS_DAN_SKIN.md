# Katalog & Desain Lengkap Boss dan Skin — Petualangan Pelajar (play.printshare.my.id)

> Dokumen ini memuat seluruh spesifikasi teknis, desain visual (SVG), tema habitat, elemen, variasi skill 100 boss monster, serta seluruh item skin avatar pemain (hat, outfit, weapon, frame, bg, pet, title) beserta efek pasif dan set bonus.

**Metadata Sistem:**
- **Target Proyek**: [play.printshare.my.id](https://play.printshare.my.id)
- **Versi Permainan**: v7.2 (Game Server 192.168.0.222)
- **Total Monster Boss**: 100 Boss (10 Habitat x 10 Boss)
- **Total Elemen Boss**: 10 Elemen (40 Jurus Unik)
- **Total Item Skin**: 43 Item Avatar & Aksesori
- **Total Set Bonus**: 5 Set Bonus Sinergi

---

## 1. Desain Skin & Kustomisasi Avatar Pemain

Sistem avatar pemain dibangun di atas renderer UMD SVG modular (`shared/avatar.js`). Pemain dapat mengoleksi skin melalui Hadiah Kemenangan, Drop Soal, Peti Misteri, atau membelinya di Toko dengan Koin.

### 1.1 Komponen Dasar Visual Avatar
- **Palet Warna Kulit (Skin Tone)**: `#FFDDB8, #F2B98C, #D9955F, #A66A3F, #7A4A2A`
- **Palet Warna Rambut (Hair Colors)**: `#2B1B3D, #6B3F1D, #E8B84A, #C8453A, #3A7BD5, #7C4DFF`
- **Gaya Rambut & Wajah**: Kepala bulat dengan mata kontur ekspresif, rona pipi, dan animasi senyum/fokus.

### 1.2 Katalog Lengkap Item Skin & Efek Pasif

| ID Item | Nama Item | Slot | Rarity | Tipe Efek Pasif | Deskripsi & Lore |
|---|---|---|---|---|---|
| `hat_explorer` | **Topi Penjelajah** | `hat` | **COMMON** | Hindaran +1% | Topi rimba tahan banting. Memberi 1% peluang menghindari damage saat salah menjawab. |
| `hat_headphones` | **Headphone Keren** | `hat` | **COMMON** | Fokus Waktu +1 Detik | Dentuman musik santai membuat pemain tenang, menambah +1 detik pada timer soal. |
| `hat_chef` | **Topi Koki** | `hat` | **COMMON** | Bonus Koin +2% | Semangat pantang menyerah juru masak, meningkatkan drop koin sebesar 2%. |
| `hat_pirate` | **Topi Bajak Laut** | `hat` | **RARE** | Hindaran +3% & Koin +5% | Kelincahan kapten laut menghindari jebakan dan insting mencari harta karun. |
| `hat_knight` | **Helm Ksatria** | `hat` | **RARE** | Hindaran +4% & Perisai +5 HP | Baja tempaan benteng kerajaan menyerap benturan pertama dalam duel. |
| `hat_bunny` | **Telinga Kelinci** | `hat` | **RARE** | Hindaran +5% | Refleks pendengaran yang sangat tajam, lincah melompati kesalahan soal. |
| `hat_wizard` | **Topi Penyihir** | `hat` | **EPIC** | Hindaran +7% & Hemat Energi 10% | Aura sihir arkana melindungi pemakainya dan memberi 10% peluang gratis energi skill. |
| `hat_crown` | **Mahkota Emas** | `hat` | **LEGENDARY** | Hindaran +10% & Waktu +2 Detik | Karisma agung sang juara sejati! Peluang hindaran 10% dan ketenangan waktu +2 detik. |
| `outfit_vest` | **Rompi Rimba** | `outfit` | **COMMON** | Perisai Awal +5 HP | Bahan kanvas tebal memberi perisai darurat 5 HP di awal duel/boss. |
| `outfit_stripes` | **Kaos Belang** | `outfit` | **COMMON** | Hindaran +1% | Pola belang yang mengaburkan fokus lawan, memberi 1% hindaran. |
| `outfit_labcoat` | **Jas Ilmuwan** | `outfit` | **COMMON** | Fokus Waktu +1 Detik | Kerapian berpikir seorang peneliti menambah waktu analisis +1 detik. |
| `outfit_cape` | **Jubah Pahlawan** | `outfit` | **RARE** | Perisai Awal +12 HP | Kain berkibar gagah yang menahan pukulan pertama lawan sebesar 12 HP. |
| `outfit_armor` | **Zirah Baja** | `outfit` | **EPIC** | Perisai Awal +25 HP & Reduksi Damage -2 | Plat baja kokoh! Memberikan 25 Perisai dan mengurangi damage masuk sebesar 2 poin. |
| `outfit_robe` | **Jubah Bintang** | `outfit` | **EPIC** | Perisai Awal +15 HP & Regen 3 HP / 3 Combo | Ditenun dari debu galaksi. Memberikan 15 perisai dan memulihkan 3 HP tiap 3 combo. |
| `weapon_book` | **Buku Ajaib** | `weapon` | **COMMON** | Damage Jawaban Benar +1 | Catatan rumus sakti menambah 1 poin serangan pada setiap jawaban benar. |
| `weapon_telescope` | **Teropong Bintang** | `weapon` | **COMMON** | Critical Chance +2% | Melihat kelemahan lawan dari kejauhan, peluang serangan kritis 2% (damage x1.5). |
| `weapon_shield` | **Perisai Biru** | `weapon` | **RARE** | Perisai Awal +10 HP & Hindaran +2% | Tameng kokoh penjaga ketertiban duel. |
| `weapon_sword` | **Pedang Perak** | `weapon` | **RARE** | Critical Chance +5% (Dmg x1.75) | Tebasan kilat perak memberikan 5% peluang Critical Hit (damage x1.75). |
| `weapon_wand` | **Tongkat Bintang** | `weapon` | **EPIC** | Critical Chance +8% (Dmg x2.0) | Pusaran energi komet! 8% peluang critical dengan daya hancur berlipat ganda. |
| `pet_cat` | **Kucing Oren** | `pet` | **COMMON** | Koin Drop +3% | Kucing pembawa hoki legendaris yang gemar mengais koin ekstra. |
| `pet_dog` | **Anjing Ceria** | `pet` | **COMMON** | Pemulihan +2 HP saat Menang Duel/Boss | Gonggongan semangat memulihkan stamina pemain setelah pertarungan sengit. |
| `pet_penguin` | **Pinguin Lucu** | `pet` | **RARE** | Waktu Beku Alami +1.5 Detik | Hawa dingin pinguin membuat timer lawan atau boss bergerak lebih lambat. |
| `pet_fox` | **Rubah Cerdik** | `pet` | **RARE** | Peluang +1 Energi 15% Tiap 3 Combo | Kecerdikan rubah mencuri momentum untuk memulihkan energi skill. |
| `pet_owl` | **Burung Hantu Bijak** | `pet` | **EPIC** | Proteksi Streak 1x (Peluang 50%) | Kebijaksanaan malam: jika salah 1x, combo streak berpeluang 50% tidak langsung hangus. |
| `pet_dragon` | **Naga Mungil** | `pet` | **LEGENDARY** | Semburan Api Naga (10% Chance Deal 20 Dmg) | Saat menjawab benar, 10% peluang naga menyemburkan api instan 20 damage! |
| `bg_meadow` | **Padang Rumput** | `bg` | **COMMON** | Stabilisator Fokus (Waktu +0.5 Detik) | Hawa sejuk rumput hijau menenangkan detak jantung saat berhitung. |
| `bg_sky` | **Langit Cerah** | `bg` | **COMMON** | Bonus Koin +2% | Cakrawala biru luas membuka pandangan rezeki berlimpah. |
| `bg_sunset` | **Senja Hangat** | `bg` | **RARE** | Perisai Sore +8 HP | Cahaya tembaga senja meredam serangan pertama lawan. |
| `bg_candy` | **Negeri Permen** | `bg` | **RARE** | Gula Semangat (+3 HP Tiap 4 Combo) | Ledakan energi manis memulihkan HP pemain saat bermain cepat. |
| `bg_cave` | **Gua Misterius** | `bg` | **EPIC** | Gema Kristal (Hindaran +5%) | Pantulan gema kristal membingungkan musuh dan menepis kesalahan. |
| `bg_night` | **Malam Berbintang** | `bg` | **EPIC** | Meditasi Bintang (Critical +4% & Waktu +1 Detik) | Konsentrasi tingkat tinggi di bawah taburan konstelasi bintang. |
| `frame_wood` | **Bingkai Kayu** | `frame` | **COMMON** | Bonus EXP +1% | Serat kayu jati tua menyerap pengalaman belajar secara konsisten. |
| `frame_leaf` | **Bingkai Daun Rimbun** | `frame` | **COMMON** | Pemulihan +1 HP Tiap Soal Benar | Kesegaran alam meregenerasi vitalitas sedikit demi sedikit. |
| `frame_silver` | **Bingkai Perak Bersinar** | `frame` | **RARE** | Bonus EXP +3% & Koin +3% | Kilau kemilau perak mengundang apresiasi dan hadiah melimpah. |
| `frame_flame` | **Bingkai Api Berkobar** | `frame` | **RARE** | Damage Ekstra +2 Saat Combo > 3 | Semangat membara melipatgandakan daya hancur saat beruntun benar. |
| `frame_gold` | **Bingkai Emas Kerajaan** | `frame` | **EPIC** | Bonus EXP +5% & Hindaran +3% | Lambang aristokrat pejuang yang tangguh dan terhormat. |
| `frame_rainbow` | **Bingkai Pelangi Ajaib** | `frame` | **LEGENDARY** | All Stats (+3% Dodge, +3% Crit, +5 Shield, +5% Koin) | Pancaran spektrum magis legendaris yang meningkatkan seluruh aspek petarung. |
| `title_rookie` | **Pelajar Pemula** | `title` | **COMMON** | Semangat Belajar (+2% Koin) | Langkah awal yang penuh rasa ingin tahu. |
| `title_hunter` | **Pemburu Monster** | `title` | **RARE** | Bane of Beasts (+10% Damage ke Boss) | Spesialis penakluk monster alam liar, serangan ke boss meningkat tajam. |
| `title_sage` | **Cendekiawan Cilik** | `title` | **RARE** | Analisis Cepat (Waktu +2 Detik) | Otak cemerlang yang mampu mengurai soal tersulit dalam hitungan detik. |
| `title_combo` | **Raja Combo** | `title` | **EPIC** | Combo Multiplier (+5% Damage per Tingkat Combo) | Semakin panjang streak benar, semakin mematikan serangan yang diluncurkan! |
| `title_king` | **Penakluk Monsterdex** | `title` | **LEGENDARY** | Gelar Legenda (Hindaran +5% & Darah Terakhir) | Jika HP mencapai 0, bertahan dengan 1 HP untuk satu kesempatan terakhir (1x per battle). |
| `slot_skill_4` | **Slot Skill Tambahan (Slot ke-4)** | `permanent` | **EPIC** | Membuka slot ke-4 untuk membawa 4 skill | Sabuk keahlian tambahan yang ditempa oleh pandai besi kerajaan. |

### 1.3 Rincian Desain Visual Skin per Slot

#### Slot: HAT (8 Item)

##### 🔹 Topi Penjelajah (`hat_explorer`)
- **Rarity**: `COMMON` (Starter Item Default)
- **Efek Pasif**: Hindaran +1%
- **Lore**: _"Topi rimba tahan banting. Memberi 1% peluang menghindari damage saat salah menjawab."_
- **Spesifikasi Vektor / Aset**:
```xml
<ellipse cx="100" cy="66" rx="48" ry="11" fill="#D9A55B" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M68 66Q70 34 100 34Q130 34 132 66Z" fill="#E8B86A" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><rect x="70" y="54" width="60" height="9" fill="#8B5A2B"/><path d="M68 66Q70 34 100 34Q130 34 132 66" fill="none" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

##### 🔹 Headphone Keren (`hat_headphones`)
- **Rarity**: `COMMON` 
- **Efek Pasif**: Fokus Waktu +1 Detik
- **Lore**: _"Dentuman musik santai membuat pemain tenang, menambah +1 detik pada timer soal."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M64 84Q64 40 100 40Q136 40 136 84" fill="none" stroke="#2B1B3D" stroke-width="9" stroke-linecap="round"/><rect x="54" y="78" width="16" height="28" rx="8" fill="#FF8A3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><rect x="130" y="78" width="16" height="28" rx="8" fill="#FF8A3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

##### 🔹 Topi Koki (`hat_chef`)
- **Rarity**: `COMMON` 
- **Efek Pasif**: Bonus Koin +2%
- **Lore**: _"Semangat pantang menyerah juru masak, meningkatkan drop koin sebesar 2%."_
- **Spesifikasi Vektor / Aset**:
```xml
<rect x="72" y="52" width="56" height="16" fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><g fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><circle cx="82" cy="46" r="14"/><circle cx="100" cy="38" r="16"/><circle cx="118" cy="46" r="14"/></g><rect x="72" y="52" width="56" height="16" fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

##### 🔹 Topi Bajak Laut (`hat_pirate`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Hindaran +3% & Koin +5%
- **Lore**: _"Kelincahan kapten laut menghindari jebakan dan insting mencari harta karun."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M56 68Q100 20 144 68Q100 58 56 68Z" fill="#2B1B3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="50" r="6" fill="#fff"/><path d="M96 56l8 0M100 52v8" stroke="#2B1B3D" stroke-width="2"/>
```

##### 🔹 Helm Ksatria (`hat_knight`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Hindaran +4% & Perisai +5 HP
- **Lore**: _"Baja tempaan benteng kerajaan menyerap benturan pertama dalam duel."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M64 84V62Q64 34 100 34Q136 34 136 62V84H120V70H80V84Z" fill="#AEB8C6" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 34V14" stroke="#E5484D" stroke-width="8" stroke-linecap="round"/><path d="M80 70h40" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

##### 🔹 Telinga Kelinci (`hat_bunny`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Hindaran +5%
- **Lore**: _"Refleks pendengaran yang sangat tajam, lincah melompati kesalahan soal."_
- **Spesifikasi Vektor / Aset**:
```xml
<g fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="82" cy="30" rx="10" ry="28"/><ellipse cx="118" cy="30" rx="10" ry="28"/></g><g fill="#FFB3C6"><ellipse cx="82" cy="32" rx="4.5" ry="19"/><ellipse cx="118" cy="32" rx="4.5" ry="19"/></g>
```

##### 🔹 Topi Penyihir (`hat_wizard`)
- **Rarity**: `EPIC` 
- **Efek Pasif**: Hindaran +7% & Hemat Energi 10%
- **Lore**: _"Aura sihir arkana melindungi pemakainya dan memberi 10% peluang gratis energi skill."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M62 68L100 6L138 68Z" fill="#7C4DFF" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="100" cy="68" rx="46" ry="9" fill="#5B34C7" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M98 30l3 6 6 1-5 4 2 6-6-4-6 4 2-6-5-4 6-1z" fill="#FFD34D"/>
```

##### 🔹 Mahkota Emas (`hat_crown`)
- **Rarity**: `LEGENDARY` 
- **Efek Pasif**: Hindaran +10% & Waktu +2 Detik
- **Lore**: _"Karisma agung sang juara sejati! Peluang hindaran 10% dan ketenangan waktu +2 detik."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M68 66L70 34L86 52L100 28L114 52L130 34L132 66Z" fill="#FFD34D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="52" r="4" fill="#E5484D"/>
```

#### Slot: OUTFIT (6 Item)

##### 🔹 Rompi Rimba (`outfit_vest`)
- **Rarity**: `COMMON` (Starter Item Default)
- **Efek Pasif**: Perisai Awal +5 HP
- **Lore**: _"Bahan kanvas tebal memberi perisai darurat 5 HP di awal duel/boss."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M70 126h60v50H70z" fill="#5BCB5B" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 126v50" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="92" cy="146" r="3" fill="#2B1B3D"/><circle cx="92" cy="162" r="3" fill="#2B1B3D"/>
```

##### 🔹 Kaos Belang (`outfit_stripes`)
- **Rarity**: `COMMON` 
- **Efek Pasif**: Hindaran +1%
- **Lore**: _"Pola belang yang mengaburkan fokus lawan, memberi 1% hindaran."_
- **Spesifikasi Vektor / Aset**:
```xml
<rect x="70" y="126" width="60" height="50" rx="14" fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><g stroke="#3A7BD5" stroke-width="7"><path d="M72 140h56M72 156h56M74 170h52"/></g><rect x="70" y="126" width="60" height="50" rx="14" fill="none" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

##### 🔹 Jas Ilmuwan (`outfit_labcoat`)
- **Rarity**: `COMMON` 
- **Efek Pasif**: Fokus Waktu +1 Detik
- **Lore**: _"Kerapian berpikir seorang peneliti menambah waktu analisis +1 detik."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M68 126h64v54H68z" fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 126v54M88 126l12 14 12-14" fill="none" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><rect x="108" y="150" width="14" height="12" fill="#CFE9FF" stroke="#2B1B3D" stroke-width="3"/>
```

##### 🔹 Jubah Pahlawan (`outfit_cape`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Perisai Awal +12 HP
- **Lore**: _"Kain berkibar gagah yang menahan pukulan pertama lawan sebesar 12 HP."_
- **Spesifikasi Vektor / Aset**:
```xml
<rect x="70" y="126" width="60" height="50" rx="14" fill="#FFC83D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M72 128Q100 146 128 128" fill="#E5484D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="140" r="5" fill="#fff" stroke="#2B1B3D" stroke-width="3"/>
```

##### 🔹 Zirah Baja (`outfit_armor`)
- **Rarity**: `EPIC` 
- **Efek Pasif**: Perisai Awal +25 HP & Reduksi Damage -2
- **Lore**: _"Plat baja kokoh! Memberikan 25 Perisai dan mengurangi damage masuk sebesar 2 poin."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M68 126h64v52H68z" fill="#AEB8C6" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M76 138h48M76 152h48M76 166h48" stroke="#2B1B3D" stroke-width="3" fill="none"/><circle cx="64" cy="130" r="12" fill="#C9D2DE" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="136" cy="130" r="12" fill="#C9D2DE" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

##### 🔹 Jubah Bintang (`outfit_robe`)
- **Rarity**: `EPIC` 
- **Efek Pasif**: Perisai Awal +15 HP & Regen 3 HP / 3 Combo
- **Lore**: _"Ditenun dari debu galaksi. Memberikan 15 perisai dan memulihkan 3 HP tiap 3 combo."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M66 126h68l8 56H58z" fill="#7C4DFF" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 126v56" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><g fill="#FFD34D"><path d="M82 146l3 6 6 1-5 4 2 6-6-4-6 4 2-6-5-4 6-1z"/><path d="M122 164l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/></g>
```

#### Slot: WEAPON (5 Item)

##### 🔹 Buku Ajaib (`weapon_book`)
- **Rarity**: `COMMON` 
- **Efek Pasif**: Damage Jawaban Benar +1
- **Lore**: _"Catatan rumus sakti menambah 1 poin serangan pada setiap jawaban benar."_
- **Spesifikasi Vektor / Aset**:
```xml
<rect x="140" y="132" width="36" height="28" rx="4" fill="#E5484D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M158 132v28" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M146 142h8M162 142h8" stroke="#fff" stroke-width="3"/>
```

##### 🔹 Teropong Bintang (`weapon_telescope`)
- **Rarity**: `COMMON` 
- **Efek Pasif**: Critical Chance +2%
- **Lore**: _"Melihat kelemahan lawan dari kejauhan, peluang serangan kritis 2% (damage x1.5)."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M140 156L176 120" stroke="#8B5A2B" stroke-width="12" stroke-linecap="round"/><path d="M168 128L180 116" stroke="#FFC83D" stroke-width="14" stroke-linecap="round"/>
```

##### 🔹 Perisai Biru (`weapon_shield`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Perisai Awal +10 HP & Hindaran +2%
- **Lore**: _"Tameng kokoh penjaga ketertiban duel."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M138 128h40v30Q158 182 138 158Z" fill="#3A7BD5" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M158 132v40" stroke="#fff" stroke-width="5"/>
```

##### 🔹 Pedang Perak (`weapon_sword`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Critical Chance +5% (Dmg x1.75)
- **Lore**: _"Tebasan kilat perak memberikan 5% peluang Critical Hit (damage x1.75)."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M150 150L170 90" stroke="#C9D2DE" stroke-width="9" stroke-linecap="round"/><path d="M150 150L170 90" stroke="#2B1B3D" stroke-width="3" stroke-linecap="round" opacity=".5"/><path d="M142 146l18 8" stroke="#8B5A2B" stroke-width="8" stroke-linecap="round"/>
```

##### 🔹 Tongkat Bintang (`weapon_wand`)
- **Rarity**: `EPIC` 
- **Efek Pasif**: Critical Chance +8% (Dmg x2.0)
- **Lore**: _"Pusaran energi komet! 8% peluang critical dengan daya hancur berlipat ganda."_
- **Spesifikasi Vektor / Aset**:
```xml
<path d="M148 160L172 104" stroke="#8B5A2B" stroke-width="7" stroke-linecap="round"/><path d="M172 90l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#FFD34D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

#### Slot: PET (6 Item)

##### 🔹 Kucing Oren (`pet_cat`)
- **Rarity**: `COMMON` 
- **Efek Pasif**: Koin Drop +3%
- **Lore**: _"Kucing pembawa hoki legendaris yang gemar mengais koin ekstra."_
- **Spesifikasi Vektor / Aset**:
```xml
Twemoji ID: 1f431
```

##### 🔹 Anjing Ceria (`pet_dog`)
- **Rarity**: `COMMON` 
- **Efek Pasif**: Pemulihan +2 HP saat Menang Duel/Boss
- **Lore**: _"Gonggongan semangat memulihkan stamina pemain setelah pertarungan sengit."_
- **Spesifikasi Vektor / Aset**:
```xml
Twemoji ID: 1f436
```

##### 🔹 Pinguin Lucu (`pet_penguin`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Waktu Beku Alami +1.5 Detik
- **Lore**: _"Hawa dingin pinguin membuat timer lawan atau boss bergerak lebih lambat."_
- **Spesifikasi Vektor / Aset**:
```xml
Twemoji ID: 1f427
```

##### 🔹 Rubah Cerdik (`pet_fox`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Peluang +1 Energi 15% Tiap 3 Combo
- **Lore**: _"Kecerdikan rubah mencuri momentum untuk memulihkan energi skill."_
- **Spesifikasi Vektor / Aset**:
```xml
Twemoji ID: 1f98a
```

##### 🔹 Burung Hantu Bijak (`pet_owl`)
- **Rarity**: `EPIC` 
- **Efek Pasif**: Proteksi Streak 1x (Peluang 50%)
- **Lore**: _"Kebijaksanaan malam: jika salah 1x, combo streak berpeluang 50% tidak langsung hangus."_
- **Spesifikasi Vektor / Aset**:
```xml
Twemoji ID: 1f989
```

##### 🔹 Naga Mungil (`pet_dragon`)
- **Rarity**: `LEGENDARY` 
- **Efek Pasif**: Semburan Api Naga (10% Chance Deal 20 Dmg)
- **Lore**: _"Saat menjawab benar, 10% peluang naga menyemburkan api instan 20 damage!"_
- **Spesifikasi Vektor / Aset**:
```xml
Twemoji ID: 1f432
```

#### Slot: BG (6 Item)

##### 🔹 Padang Rumput (`bg_meadow`)
- **Rarity**: `COMMON` (Starter Item Default)
- **Efek Pasif**: Stabilisator Fokus (Waktu +0.5 Detik)
- **Lore**: _"Hawa sejuk rumput hijau menenangkan detak jantung saat berhitung."_
- **Spesifikasi Vektor / Aset**:
```xml
Gradient Linear: #B9EBFF -> #7BD65B
```

##### 🔹 Langit Cerah (`bg_sky`)
- **Rarity**: `COMMON` 
- **Efek Pasif**: Bonus Koin +2%
- **Lore**: _"Cakrawala biru luas membuka pandangan rezeki berlimpah."_
- **Spesifikasi Vektor / Aset**:
```xml
Gradient Linear: #9BE0FF -> #E6F8FF
```

##### 🔹 Senja Hangat (`bg_sunset`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Perisai Sore +8 HP
- **Lore**: _"Cahaya tembaga senja meredam serangan pertama lawan."_
- **Spesifikasi Vektor / Aset**:
```xml
Gradient Linear: #FFD27A -> #FF7A8A
```

##### 🔹 Negeri Permen (`bg_candy`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Gula Semangat (+3 HP Tiap 4 Combo)
- **Lore**: _"Ledakan energi manis memulihkan HP pemain saat bermain cepat."_
- **Spesifikasi Vektor / Aset**:
```xml
Gradient Linear: #FFC3E1 -> #FFA0C8
```

##### 🔹 Gua Misterius (`bg_cave`)
- **Rarity**: `EPIC` 
- **Efek Pasif**: Gema Kristal (Hindaran +5%)
- **Lore**: _"Pantulan gema kristal membingungkan musuh dan menepis kesalahan."_
- **Spesifikasi Vektor / Aset**:
```xml
Gradient Linear: #6B5B95 -> #2D2250
```

##### 🔹 Malam Berbintang (`bg_night`)
- **Rarity**: `EPIC` 
- **Efek Pasif**: Meditasi Bintang (Critical +4% & Waktu +1 Detik)
- **Lore**: _"Konsentrasi tingkat tinggi di bawah taburan konstelasi bintang."_
- **Spesifikasi Vektor / Aset**:
```xml
Gradient Linear: #4A3A8F -> #1B1340
```

#### Slot: FRAME (6 Item)

##### 🔹 Bingkai Kayu (`frame_wood`)
- **Rarity**: `COMMON` (Starter Item Default)
- **Efek Pasif**: Bonus EXP +1%
- **Lore**: _"Serat kayu jati tua menyerap pengalaman belajar secara konsisten."_
- **Spesifikasi Vektor / Aset**:
```xml
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#8B5A2B" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#D9A55B" stroke-width="3"/><circle cx="14" cy="14" r="5" fill="#5C381E"/><circle cx="186" cy="14" r="5" fill="#5C381E"/><circle cx="14" cy="186" r="5" fill="#5C381E"/><circle cx="186" cy="186" r="5" fill="#5C381E"/>
```

##### 🔹 Bingkai Daun Rimbun (`frame_leaf`)
- **Rarity**: `COMMON` 
- **Efek Pasif**: Pemulihan +1 HP Tiap Soal Benar
- **Lore**: _"Kesegaran alam meregenerasi vitalitas sedikit demi sedikit."_
- **Spesifikasi Vektor / Aset**:
```xml
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#2D8A4E" stroke-width="8"/><path d="M10 20Q20 10 30 20Q20 30 10 20Z" fill="#48C774"/><path d="M170 20Q180 10 190 20Q180 30 170 20Z" fill="#48C774"/><path d="M10 180Q20 170 30 180Q20 190 10 180Z" fill="#48C774"/><path d="M170 180Q180 170 190 180Q180 190 170 180Z" fill="#48C774"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#A3E635" stroke-width="2"/>
```

##### 🔹 Bingkai Perak Bersinar (`frame_silver`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Bonus EXP +3% & Koin +3%
- **Lore**: _"Kilau kemilau perak mengundang apresiasi dan hadiah melimpah."_
- **Spesifikasi Vektor / Aset**:
```xml
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#94A3B8" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#F1F5F9" stroke-width="3"/><polygon points="4,24 24,4 4,4" fill="#CBD5E1"/><polygon points="196,24 176,4 196,4" fill="#CBD5E1"/><polygon points="4,176 24,196 4,196" fill="#CBD5E1"/><polygon points="196,176 176,196 196,196" fill="#CBD5E1"/>
```

##### 🔹 Bingkai Api Berkobar (`frame_flame`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Damage Ekstra +2 Saat Combo > 3
- **Lore**: _"Semangat membara melipatgandakan daya hancur saat beruntun benar."_
- **Spesifikasi Vektor / Aset**:
```xml
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#EF4444" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#F59E0B" stroke-width="3"/><path d="M10 30Q16 14 26 22Q30 6 38 18" stroke="#FBBF24" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M190 30Q184 14 174 22Q170 6 162 18" stroke="#FBBF24" stroke-width="4" fill="none" stroke-linecap="round"/>
```

##### 🔹 Bingkai Emas Kerajaan (`frame_gold`)
- **Rarity**: `EPIC` 
- **Efek Pasif**: Bonus EXP +5% & Hindaran +3%
- **Lore**: _"Lambang aristokrat pejuang yang tangguh dan terhormat."_
- **Spesifikasi Vektor / Aset**:
```xml
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#D97706" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#FDE047" stroke-width="3"/><circle cx="100" cy="10" r="6" fill="#EF4444" stroke="#78350F" stroke-width="2"/><circle cx="10" cy="100" r="6" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/><circle cx="190" cy="100" r="6" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/><circle cx="100" cy="190" r="6" fill="#10B981" stroke="#064E3B" stroke-width="2"/>
```

##### 🔹 Bingkai Pelangi Ajaib (`frame_rainbow`)
- **Rarity**: `LEGENDARY` 
- **Efek Pasif**: All Stats (+3% Dodge, +3% Crit, +5 Shield, +5% Koin)
- **Lore**: _"Pancaran spektrum magis legendaris yang meningkatkan seluruh aspek petarung."_
- **Spesifikasi Vektor / Aset**:
```xml
<defs><linearGradient id="rbw" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF4B72"/><stop offset="25%" stop-color="#FFB347"/><stop offset="50%" stop-color="#70E000"/><stop offset="75%" stop-color="#00C4FF"/><stop offset="100%" stop-color="#9D4EDD"/></linearGradient></defs><rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#rbw)" stroke-width="10"/><rect x="10" y="10" width="180" height="180" rx="20" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".8"/>
```

#### Slot: TITLE (5 Item)

##### 🔹 Pelajar Pemula (`title_rookie`)
- **Rarity**: `COMMON` (Starter Item Default)
- **Efek Pasif**: Semangat Belajar (+2% Koin)
- **Lore**: _"Langkah awal yang penuh rasa ingin tahu."_

##### 🔹 Pemburu Monster (`title_hunter`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Bane of Beasts (+10% Damage ke Boss)
- **Lore**: _"Spesialis penakluk monster alam liar, serangan ke boss meningkat tajam."_

##### 🔹 Cendekiawan Cilik (`title_sage`)
- **Rarity**: `RARE` 
- **Efek Pasif**: Analisis Cepat (Waktu +2 Detik)
- **Lore**: _"Otak cemerlang yang mampu mengurai soal tersulit dalam hitungan detik."_

##### 🔹 Raja Combo (`title_combo`)
- **Rarity**: `EPIC` 
- **Efek Pasif**: Combo Multiplier (+5% Damage per Tingkat Combo)
- **Lore**: _"Semakin panjang streak benar, semakin mematikan serangan yang diluncurkan!"_

##### 🔹 Penakluk Monsterdex (`title_king`)
- **Rarity**: `LEGENDARY` 
- **Efek Pasif**: Gelar Legenda (Hindaran +5% & Darah Terakhir)
- **Lore**: _"Jika HP mencapai 0, bertahan dengan 1 HP untuk satu kesempatan terakhir (1x per battle)."_

#### Slot: PERMANENT (1 Item)

##### 🔹 Slot Skill Tambahan (Slot ke-4) (`slot_skill_4`)
- **Rarity**: `EPIC` 
- **Efek Pasif**: Membuka slot ke-4 untuk membawa 4 skill
- **Lore**: _"Sabuk keahlian tambahan yang ditempa oleh pandai besi kerajaan."_

### 1.4 Sistem Sinergi & Set Bonus Skin

Menggunakan kombinasi item tertentu memberikan efek sinergi khusus saat pertarungan:

#### 🌿 Set Penjelajah Rimba (`set_explorer`)
- **Item yang Dibutuhkan**: `hat_explorer` + `outfit_vest` + `pet_cat` + `bg_meadow`
- **Efek Sinergi**: **Insting Hutan: +10 Perisai Awal & +5% Bonus Koin**
- **Bonus Data**: `{"startShield":10,"coinBonus":0.05}`

#### 🛡️ Set Benteng Ksatria Baja (`set_knight`)
- **Item yang Dibutuhkan**: `hat_knight` + `outfit_armor` + `weapon_sword` + `weapon_shield`
- **Efek Sinergi**: **Tembok Baja: +20 Perisai Awal & 5 Serangan Balik (Thorns)**
- **Bonus Data**: `{"startShield":20,"thornsDamage":5}`

#### ✨ Set Arkana Bintang Kosmik (`set_wizard`)
- **Item yang Dibutuhkan**: `hat_wizard` + `outfit_robe` + `weapon_wand` + `pet_owl` + `bg_night`
- **Efek Sinergi**: **Supernova Mind: +10% Critical Chance**
- **Bonus Data**: `{"critChance":0.1}`

#### 🏴‍☠️ Set Bajak Laut Samudra (`set_pirate`)
- **Item yang Dibutuhkan**: `hat_pirate` + `outfit_stripes` + `bg_sunset` + `pet_fox`
- **Efek Sinergi**: **Penjarahan Emas: +25% Koin Drop & +5% Critical Chance**
- **Bonus Data**: `{"coinBonus":0.25,"critChance":0.05}`

#### 👑 Set Kaisar Legendaris (`set_monarch`)
- **Item yang Dibutuhkan**: `hat_crown` + `pet_dragon` + `frame_rainbow` + `title_king`
- **Efek Sinergi**: **Aura Kejayaan: +30 Perisai, +10% Hindaran & Semburan Api Naga +20 DMG**
- **Bonus Data**: `{"startShield":30,"dodgeRate":0.1,"dragonBreathDamageBonus":20}`

---

## 2. Desain 100 Monster Boss & Sistem Elemen (v7.2)

Setiap boss di Petualangan Pelajar dirancang secara prosedural namun deterministik (`shared/monsters.js`), memiliki elemen habitat, variasi skill bertingkat (Common, Rare, Epic, Legend), serta dukungan Mode Brutal 💀.

### 2.1 Pemetaan 10 Tema Habitat ke 10 Elemen

| Tema Habitat | Elemen | Ikon & Warna | Gelar Boss | Karakteristik / Deskripsi Gaya Serang |
|---|---|---|---|---|
| **Hutan Rimba** (`hutan`) | `nature` (Hutan) | 🌿 `#22C55E` | **Roh Rimba** | Penjaga hutan lebat berselimut duri beracun. Lukanya terasa lama setelah kamu keliru menjawab. |
| **Rawa Lendir** (`rawa`) | `toxic` (Racun) | ☠️ `#84CC16` | **Ratu Rawa Beracun** | Penguasa rawa berkabut racun. Uap beracunnya melemahkan penyembuhan dan perlindunganmu. |
| **Gua Kristal** (`gua`) | `earth` (Tanah) | 🪨 `#A16207` | **Golem Pegunungan** | Sosok batu raksasa yang menghantam dengan keras. Jangan lengah saat ia mulai mengangkat tinjunya! |
| **Gunung Api** (`api`) | `fire` (Api) | 🔥 `#EF4444` | **Penguasa Api** | Raksasa dari gunung berapi yang makin ganas saat terdesak. Semakin sedikit darahnya, semakin panas serangannya! |
| **Negeri Es** (`es`) | `ice` (Es) | ❄️ `#93C5FD` | **Raja Salju** | Makhluk kutub yang membekukan segalanya. Waktu terasa berjalan lebih cepat saat ia mengamuk. |
| **Laut Dalam** (`laut`) | `water` (Air) | 💧 `#38BDF8` | **Penjaga Samudra** | Penghuni laut dalam yang menyedot tenaga lawan lewat arus deras. Hati-hati, energimu bisa terkuras. |
| **Kerajaan Awan** (`langit`) | `wind` (Angin) | 🌪️ `#94A3B8` | **Penguasa Topan** | Makhluk langit yang berputar secepat badai. Ia suka membuat pemain terburu-buru. |
| **Malam Misteri** (`hantu`) | `shadow` (Bayangan) | 🌑 `#7C3AED` | **Hantu Kegelapan** | Sosok misterius yang menembus perlindungan. Kutukannya membuat penyembuhan kurang manjur. |
| **Pabrik Robot** (`mesin`) | `thunder` (Petir) | ⚡ `#FACC15` | **Raja Guntur** | Monster listrik yang menyambar tanpa ampun. Sengatannya menguras energi dan mengacaukan skill. |
| **Pesta Manis** (`manis`) | `light` (Cahaya) | ✨ `#FDE68A` | **Penjaga Kristal** | Makhluk bersinar yang menyilaukan mata. Pantulan kristalnya meredam kekuatan combo-mu. |

### 2.2 Paket Jurus & Skill Boss per Elemen

#### Elemen 🔥 Api (`fire`)
| ID Skill | Nama Jurus | Ikon | Tipe Efek Mekanik | Deskripsi Efek (Scaling per Tier) |
|---|---|---|---|---|
| `fire_rage` | **Amarah Membara** | 🔥 | `rage_damage` | Makin sedikit darah boss, makin besar damage ke kamu — hingga ×1,22 saat darahnya hampir habis. |
| `fire_breath` | **Semburan Api** | 🐉 | `charged_strike` | Tiap 5 soal boss mengisi jurus (ada peringatan ⚠️). Jawab BENAR untuk menghindar; jawab salah = damage ×1,2. |
| `fire_burn` | **Terbakar** | ♨️ | `dot` | Setelah kamu salah, kamu terbakar selama 2 soal: darahmu berkurang 3% dari damage serangan boss di awal tiap soal (tidak pernah sampai membuatmu kalah). |
| `fire_inferno` | **Ledakan Inferno** | 🌋 | `phase_rage` | Saat boss marah (Fase 2), damage ke kamu +5%. |

#### Elemen 💧 Air (`water`)
| ID Skill | Nama Jurus | Ikon | Tipe Efek Mekanik | Deskripsi Efek (Scaling per Tier) |
|---|---|---|---|---|
| `water_siphon` | **Arus Penyedot** | 🌀 | `energy_siphon` | Saat kamu salah, boss menyedot 10% energimu (minimal 1 ⚡). |
| `water_tide` | **Gelombang Pasang** | 🌊 | `charged_strike` | Tiap 6 soal boss mengisi jurus (ada peringatan ⚠️). Jawab BENAR untuk menghindar; jawab salah = damage ×1,35. |
| `water_drift` | **Hanyut** | ⏳ | `time_squeeze` | Tiap 3 soal, waktu menjawab berkurang 6%. |
| `water_flood` | **Banjir Pelumpuh** | 💦 | `heal_curse` | Efek skill Pulihkan (heal) berkurang 15%. |

#### Elemen ❄️ Es (`ice`)
| ID Skill | Nama Jurus | Ikon | Tipe Efek Mekanik | Deskripsi Efek (Scaling per Tier) |
|---|---|---|---|---|
| `ice_frost` | **Embun Beku** | 🥶 | `time_squeeze` | Tiap 3 soal, waktu menjawab berkurang 6%. |
| `ice_blizzard` | **Badai Salju** | 🌨️ | `charged_strike` | Tiap 5 soal boss mengisi jurus (ada peringatan ⚠️). Jawab BENAR untuk menghindar; jawab salah = damage ×1,35. |
| `ice_crack` | **Retak Es** | 🧊 | `combo_seal` | Bonus combo-mu ke boss berkurang 20% (damage dasar tetap). |
| `ice_eternal` | **Beku Abadi** | ❄️ | `heal_curse` | Efek skill Pulihkan (heal) berkurang 15%. |

#### Elemen 🌿 Hutan (`nature`)
| ID Skill | Nama Jurus | Ikon | Tipe Efek Mekanik | Deskripsi Efek (Scaling per Tier) |
|---|---|---|---|---|
| `nature_thorn` | **Racun Duri** | 🌵 | `dot` | Setelah kamu salah, kamu keracunan selama 2 soal: darahmu berkurang 8% dari damage serangan boss di awal tiap soal (tidak pernah sampai membuatmu kalah). |
| `nature_roots` | **Akar Membelit** | 🌱 | `skill_tax` | Saat boss marah (Fase 2), memakai skill butuh +1 ⚡ ekstra. |
| `nature_spore` | **Serbuk Lelap** | 😴 | `time_squeeze` | Tiap 4 soal, waktu menjawab berkurang 6%. |
| `nature_moss` | **Lumut Penghisap** | 🍄 | `heal_curse` | Efek skill Pulihkan (heal) berkurang 15%. |

#### Elemen 🪨 Tanah (`earth`)
| ID Skill | Nama Jurus | Ikon | Tipe Efek Mekanik | Deskripsi Efek (Scaling per Tier) |
|---|---|---|---|---|
| `earth_smash` | **Hantaman Batu** | 👊 | `charged_strike` | Tiap 4 soal boss mengisi jurus (ada peringatan ⚠️). Jawab BENAR untuk menghindar; jawab salah = damage ×1,35. |
| `earth_slide` | **Longsor** | ⛰️ | `combo_seal` | Bonus combo-mu ke boss berkurang 20% (damage dasar tetap). |
| `earth_quake` | **Gempa Bumi** | 🫨 | `energy_siphon` | Saat kamu salah, boss menyedot 10% energimu (minimal 1 ⚡). |
| `earth_collapse` | **Runtuhnya Gunung** | 💥 | `phase_rage` | Saat boss marah (Fase 2), damage ke kamu +12%. |

#### Elemen 🌪️ Angin (`wind`)
| ID Skill | Nama Jurus | Ikon | Tipe Efek Mekanik | Deskripsi Efek (Scaling per Tier) |
|---|---|---|---|---|
| `wind_gale` | **Angin Topan** | 💨 | `time_squeeze` | Tiap 3 soal, waktu menjawab berkurang 6%. |
| `wind_slash` | **Tebasan Angin** | 🗡️ | `charged_strike` | Tiap 5 soal boss mengisi jurus (ada peringatan ⚠️). Jawab BENAR untuk menghindar; jawab salah = damage ×1,35. |
| `wind_vortex` | **Pusaran** | 🌀 | `combo_seal` | Bonus combo-mu ke boss berkurang 20% (damage dasar tetap). |
| `wind_storm` | **Badai Sempurna** | 🌪️ | `energy_siphon` | Saat kamu salah, boss menyedot 10% energimu (minimal 1 ⚡). |

#### Elemen ⚡ Petir (`thunder`)
| ID Skill | Nama Jurus | Ikon | Tipe Efek Mekanik | Deskripsi Efek (Scaling per Tier) |
|---|---|---|---|---|
| `thunder_shock` | **Sengatan** | ⚡ | `energy_siphon` | Saat kamu salah, boss menyedot 10% energimu (minimal 1 ⚡). |
| `thunder_bolt` | **Petir Menyambar** | 🌩️ | `charged_strike` | Tiap 4 soal boss mengisi jurus (ada peringatan ⚠️). Jawab BENAR untuk menghindar; jawab salah = damage ×1,35. |
| `thunder_short` | **Korsleting** | 🔌 | `skill_tax` | Saat boss marah (Fase 2), memakai skill butuh +1 ⚡ ekstra. |
| `thunder_storm` | **Badai Petir** | ⛈️ | `phase_rage` | Saat boss marah (Fase 2), damage ke kamu +12%. |

#### Elemen 🌑 Bayangan (`shadow`)
| ID Skill | Nama Jurus | Ikon | Tipe Efek Mekanik | Deskripsi Efek (Scaling per Tier) |
|---|---|---|---|---|
| `shadow_pierce` | **Kegelapan Menembus** | 🌑 | `shield_pierce` | Serangan boss menembus 20% perlindungan Perisai. |
| `shadow_claw` | **Cakar Bayangan** | 🦇 | `charged_strike` | Tiap 5 soal boss mengisi jurus (ada peringatan ⚠️). Jawab BENAR untuk menghindar; jawab salah = damage ×1,35. |
| `shadow_curse` | **Kutukan Gelap** | 🔮 | `heal_curse` | Efek skill Pulihkan (heal) berkurang 15%. |
| `shadow_eclipse` | **Gerhana** | 🌘 | `time_squeeze` | Tiap 3 soal, waktu menjawab berkurang 6%. |

#### Elemen ✨ Cahaya (`light`)
| ID Skill | Nama Jurus | Ikon | Tipe Efek Mekanik | Deskripsi Efek (Scaling per Tier) |
|---|---|---|---|---|
| `light_glare` | **Silau** | 😵‍💫 | `time_squeeze` | Tiap 4 soal, waktu menjawab berkurang 6%. |
| `light_beam` | **Sinar Penghancur** | ☀️ | `charged_strike` | Tiap 5 soal boss mengisi jurus (ada peringatan ⚠️). Jawab BENAR untuk menghindar; jawab salah = damage ×1,25. |
| `light_mirror` | **Pantulan Kristal** | 💎 | `combo_seal` | Bonus combo-mu ke boss berkurang 20% (damage dasar tetap). |
| `light_dawn` | **Fajar Murka** | 🌅 | `rage_damage` | Makin sedikit darah boss, makin besar damage ke kamu — hingga ×1,15 saat darahnya hampir habis. |

#### Elemen ☠️ Racun (`toxic`)
| ID Skill | Nama Jurus | Ikon | Tipe Efek Mekanik | Deskripsi Efek (Scaling per Tier) |
|---|---|---|---|---|
| `toxic_gas` | **Gas Beracun** | ☠️ | `dot` | Setelah kamu salah, kamu keracunan selama 3 soal: darahmu berkurang 5% dari damage serangan boss di awal tiap soal (tidak pernah sampai membuatmu kalah). |
| `toxic_fog` | **Kabut Racun** | 🌫️ | `heal_curse` | Efek skill Pulihkan (heal) berkurang 15%. |
| `toxic_acid` | **Semprotan Asam** | 🧪 | `shield_pierce` | Serangan boss menembus 20% perlindungan Perisai. |
| `toxic_plague` | **Wabah** | 🦠 | `skill_tax` | Saat boss marah (Fase 2), memakai skill butuh +1 ⚡ ekstra. |

### 2.3 Aturan Skala Rarity & Mode Brutal (💀)
- **Common (Tier 1)**: Membuka 1 Jurus Unik, Pengali Kekuatan `x1.0`.
- **Rare (Tier 2)**: Membuka 2 Jurus Unik, Pengali Kekuatan `x1.3`.
- **Epic (Tier 3)**: Membuka 3 Jurus Unik, Pengali Kekuatan `x1.6`.
- **Legend (Tier 4)**: Membuka 4 Jurus Lengkap (All Out), Pengali Kekuatan `x2.0`.
- **Mode Brutal (Tantangan Level >= 5)**:
  - Seluruh efek skill dikalikan **x2**.
  - Seluruh drop hadiah Koin & XP dikalikan **x3** (`:BRUTAL`).
  - Terdapat pengaman anti-frustrasi: DoT tidak pernah membunuh langsung (sisa min 1 HP), batas waktu soal min 8 detik, dan damage jurus tidak melebihi 50% HP pemain.

### 2.4 Katalog Lengkap 100 Boss Monster

Berikut adalah daftar lengkap 100 monster boss beserta tema, kombinasi bentuk visual SVG, dan palet warna HSL:

| ID | Nama Boss | Tema Habitat | Elemen | Bentuk Tubuh | Hiasan Kepala | Tipe Mata | Tipe Mulut | Ekstra | Palet HSL (H, S%, L%) |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Lumutra** | hutan | `nature` | `ghost` | `ears` | `sleepy` | `open` | `none` | `hsl(116, 62%, 48%)` |
| 2 | **Akarok** | hutan | `nature` | `square` | `unicorn` | `two` | `fangs` | `wings` | `hsl(123, 62%, 56%)` |
| 3 | **Jamurgon** | hutan | `nature` | `slime` | `none` | `one` | `open` | `none` | `hsl(130, 62%, 64%)` |
| 4 | **Kayubuk** | hutan | `nature` | `blob` | `unicorn` | `sleepy` | `fangs` | `belly` | `hsl(137, 62%, 52%)` |
| 5 | **Daunjir** | hutan | `nature` | `egg` | `unicorn` | `sleepy` | `fangs` | `arms` | `hsl(144, 62%, 60%)` |
| 6 | **Burunggar** | hutan | `nature` | `octopus` | `none` | `four` | `zigzag` | `wings` | `hsl(116, 62%, 48%)` |
| 7 | **Sulurkan** | hutan | `nature` | `round` | `crown` | `two` | `tongue` | `tail` | `hsl(123, 62%, 56%)` |
| 8 | **Rimbazo** | hutan | `nature` | `spiky` | `horns` | `one` | `fangs` | `tail` | `hsl(130, 62%, 64%)` |
| 9 | **Beringkus** | hutan | `nature` | `round` | `unicorn` | `two` | `smile` | `spots` | `hsl(137, 62%, 52%)` |
| 10 | **Tupaiju** | hutan | `nature` | `egg` | `antennae` | `one` | `zigzag` | `none` | `hsl(144, 62%, 60%)` |
| 11 | **Slimbul** | rawa | `toxic` | `blob` | `ears` | `four` | `open` | `cheeks` | `hsl(61, 70%, 48%)` |
| 12 | **Lendirot** | rawa | `toxic` | `ghost` | `ears` | `angry` | `smile` | `belly` | `hsl(68, 70%, 56%)` |
| 13 | **Gelatok** | rawa | `toxic` | `octopus` | `mohawk` | `two` | `smile` | `stripes` | `hsl(75, 70%, 64%)` |
| 14 | **Becekon** | rawa | `toxic` | `slime` | `horns` | `angry` | `fangs` | `arms` | `hsl(82, 70%, 52%)` |
| 15 | **Lumpurra** | rawa | `toxic` | `square` | `spikes` | `one` | `fangs` | `belly` | `hsl(89, 70%, 60%)` |
| 16 | **Kodokzilla** | rawa | `toxic` | `egg` | `ears` | `one` | `smile` | `spots` | `hsl(61, 70%, 48%)` |
| 17 | **Cacingar** | rawa | `toxic` | `spiky` | `antennae` | `two` | `smile` | `spots` | `hsl(68, 70%, 56%)` |
| 18 | **Gelembus** | rawa | `toxic` | `round` | `none` | `four` | `tongue` | `cheeks` | `hsl(75, 70%, 64%)` |
| 19 | **Rawagon** | rawa | `toxic` | `slime` | `unicorn` | `one` | `zigzag` | `arms` | `hsl(82, 70%, 52%)` |
| 20 | **Ingusaur** | rawa | `toxic` | `ghost` | `none` | `one` | `fangs` | `none` | `hsl(89, 70%, 60%)` |
| 21 | **Kristalor** | gua | `earth` | `blob` | `none` | `angry` | `smile` | `tail` | `hsl(286, 55%, 48%)` |
| 22 | **Batuguk** | gua | `earth` | `ghost` | `unicorn` | `one` | `fangs` | `stripes` | `hsl(293, 55%, 56%)` |
| 23 | **Stalaktron** | gua | `earth` | `spiky` | `mohawk` | `two` | `open` | `spots` | `hsl(300, 55%, 64%)` |
| 24 | **Gemilang** | gua | `earth` | `octopus` | `spikes` | `sleepy` | `teeth` | `arms` | `hsl(307, 55%, 52%)` |
| 25 | **Kelelawor** | gua | `earth` | `round` | `crown` | `one` | `smile` | `cheeks` | `hsl(314, 55%, 60%)` |
| 26 | **Gelapuk** | gua | `earth` | `square` | `mohawk` | `angry` | `teeth` | `arms` | `hsl(286, 55%, 48%)` |
| 27 | **Amethyx** | gua | `earth` | `egg` | `crown` | `sleepy` | `fangs` | `none` | `hsl(293, 55%, 56%)` |
| 28 | **Permatok** | gua | `earth` | `slime` | `antennae` | `four` | `open` | `cheeks` | `hsl(300, 55%, 64%)` |
| 29 | **Goanggar** | gua | `earth` | `round` | `crown` | `one` | `tongue` | `none` | `hsl(307, 55%, 52%)` |
| 30 | **Fosforo** | gua | `earth` | `square` | `crown` | `two` | `fangs` | `cheeks` | `hsl(314, 55%, 60%)` |
| 31 | **Apiko** | api | `fire` | `square` | `crown` | `two` | `tongue` | `wings` | `hsl(354, 80%, 48%)` |
| 32 | **Lavagor** | api | `fire` | `blob` | `antennae` | `one` | `tongue` | `belly` | `hsl(1, 80%, 56%)` |
| 33 | **Barakus** | api | `fire` | `spiky` | `horns` | `four` | `tongue` | `spots` | `hsl(8, 80%, 64%)` |
| 34 | **Magmora** | api | `fire` | `ghost` | `antennae` | `one` | `tongue` | `arms` | `hsl(15, 80%, 52%)` |
| 35 | **Abunoir** | api | `fire` | `egg` | `antennae` | `four` | `teeth` | `none` | `hsl(22, 80%, 60%)` |
| 36 | **Percikor** | api | `fire` | `round` | `none` | `one` | `teeth` | `spots` | `hsl(354, 80%, 48%)` |
| 37 | **Salamandor** | api | `fire` | `octopus` | `none` | `four` | `tongue` | `none` | `hsl(1, 80%, 56%)` |
| 38 | **Kaldera** | api | `fire` | `slime` | `unicorn` | `four` | `fangs` | `cheeks` | `hsl(8, 80%, 64%)` |
| 39 | **Geyserok** | api | `fire` | `blob` | `spikes` | `three` | `tongue` | `arms` | `hsl(15, 80%, 52%)` |
| 40 | **Arangon** | api | `fire` | `blob` | `antennae` | `angry` | `open` | `spots` | `hsl(22, 80%, 60%)` |
| 41 | **Esbeku** | es | `ice` | `round` | `crown` | `two` | `open` | `belly` | `hsl(164, 65%, 48%)` |
| 42 | **Saljuno** | es | `ice` | `ghost` | `crown` | `four` | `open` | `wings` | `hsl(171, 65%, 56%)` |
| 43 | **Glaciur** | es | `ice` | `blob` | `mohawk` | `four` | `fangs` | `belly` | `hsl(178, 65%, 64%)` |
| 44 | **Kristalsalju** | es | `ice` | `egg` | `mohawk` | `three` | `zigzag` | `tail` | `hsl(185, 65%, 52%)` |
| 45 | **Pingwino** | es | `ice` | `square` | `spikes` | `four` | `smile` | `arms` | `hsl(192, 65%, 60%)` |
| 46 | **Dinginor** | es | `ice` | `slime` | `antennae` | `four` | `open` | `spots` | `hsl(164, 65%, 48%)` |
| 47 | **Mamutik** | es | `ice` | `octopus` | `unicorn` | `sleepy` | `fangs` | `belly` | `hsl(171, 65%, 56%)` |
| 48 | **Frostiko** | es | `ice` | `spiky` | `antennae` | `angry` | `fangs` | `tail` | `hsl(178, 65%, 64%)` |
| 49 | **Igluk** | es | `ice` | `octopus` | `ears` | `three` | `open` | `belly` | `hsl(185, 65%, 52%)` |
| 50 | **Badaino** | es | `ice` | `egg` | `crown` | `one` | `teeth` | `none` | `hsl(192, 65%, 60%)` |
| 51 | **Guritron** | laut | `water` | `spiky` | `none` | `angry` | `fangs` | `none` | `hsl(201, 70%, 48%)` |
| 52 | **Kepitingor** | laut | `water` | `slime` | `unicorn` | `one` | `tongue` | `spots` | `hsl(208, 70%, 56%)` |
| 53 | **Uburzap** | laut | `water` | `egg` | `ears` | `one` | `zigzag` | `stripes` | `hsl(215, 70%, 64%)` |
| 54 | **Hiugar** | laut | `water` | `ghost` | `none` | `sleepy` | `smile` | `belly` | `hsl(222, 70%, 52%)` |
| 55 | **Kerangon** | laut | `water` | `octopus` | `crown` | `sleepy` | `zigzag` | `belly` | `hsl(229, 70%, 60%)` |
| 56 | **Pausmok** | laut | `water` | `blob` | `ears` | `one` | `open` | `none` | `hsl(201, 70%, 48%)` |
| 57 | **Karangor** | laut | `water` | `round` | `antennae` | `one` | `tongue` | `belly` | `hsl(208, 70%, 56%)` |
| 58 | **Lobsterok** | laut | `water` | `square` | `mohawk` | `four` | `teeth` | `arms` | `hsl(215, 70%, 64%)` |
| 59 | **Bintanggar** | laut | `water` | `spiky` | `horns` | `two` | `teeth` | `wings` | `hsl(222, 70%, 52%)` |
| 60 | **Piranjo** | laut | `water` | `egg` | `antennae` | `angry` | `fangs` | `tail` | `hsl(229, 70%, 60%)` |
| 61 | **Awanimo** | langit | `wind` | `ghost` | `ears` | `four` | `zigzag` | `arms` | `hsl(34, 85%, 48%)` |
| 62 | **Petirgon** | langit | `wind` | `blob` | `mohawk` | `sleepy` | `teeth` | `stripes` | `hsl(41, 85%, 56%)` |
| 63 | **Elangor** | langit | `wind` | `slime` | `horns` | `sleepy` | `open` | `wings` | `hsl(48, 85%, 64%)` |
| 64 | **Pelangor** | langit | `wind` | `round` | `unicorn` | `two` | `tongue` | `arms` | `hsl(55, 85%, 52%)` |
| 65 | **Anginus** | langit | `wind` | `egg` | `unicorn` | `one` | `open` | `tail` | `hsl(62, 85%, 60%)` |
| 66 | **Kometor** | langit | `wind` | `spiky` | `crown` | `three` | `zigzag` | `spots` | `hsl(34, 85%, 48%)` |
| 67 | **Layanglo** | langit | `wind` | `octopus` | `horns` | `one` | `tongue` | `none` | `hsl(41, 85%, 56%)` |
| 68 | **Mataharo** | langit | `wind` | `square` | `ears` | `angry` | `teeth` | `arms` | `hsl(48, 85%, 64%)` |
| 69 | **Hujanix** | langit | `wind` | `square` | `crown` | `one` | `smile` | `stripes` | `hsl(55, 85%, 52%)` |
| 70 | **Bulanus** | langit | `wind` | `ghost` | `mohawk` | `sleepy` | `teeth` | `arms` | `hsl(62, 85%, 60%)` |
| 71 | **Bayangor** | hantu | `shadow` | `blob` | `crown` | `angry` | `teeth` | `spots` | `hsl(231, 50%, 48%)` |
| 72 | **Hantuk** | hantu | `shadow` | `octopus` | `horns` | `four` | `smile` | `arms` | `hsl(238, 50%, 56%)` |
| 73 | **Selimutor** | hantu | `shadow` | `square` | `horns` | `angry` | `fangs` | `spots` | `hsl(245, 50%, 64%)` |
| 74 | **Lenteron** | hantu | `shadow` | `spiky` | `unicorn` | `four` | `open` | `tail` | `hsl(252, 50%, 52%)` |
| 75 | **Labalabi** | hantu | `shadow` | `ghost` | `crown` | `two` | `smile` | `spots` | `hsl(259, 50%, 60%)` |
| 76 | **Kerangkok** | hantu | `shadow` | `egg` | `horns` | `four` | `zigzag` | `cheeks` | `hsl(231, 50%, 48%)` |
| 77 | **Penyihirul** | hantu | `shadow` | `slime` | `horns` | `sleepy` | `smile` | `cheeks` | `hsl(238, 50%, 56%)` |
| 78 | **Kabutor** | hantu | `shadow` | `round` | `horns` | `one` | `teeth` | `belly` | `hsl(245, 50%, 64%)` |
| 79 | **Gentayo** | hantu | `shadow` | `egg` | `none` | `two` | `open` | `wings` | `hsl(252, 50%, 52%)` |
| 80 | **Gelapon** | hantu | `shadow` | `octopus` | `spikes` | `one` | `open` | `cheeks` | `hsl(259, 50%, 60%)` |
| 81 | **Robotok** | mesin | `thunder` | `octopus` | `unicorn` | `one` | `fangs` | `tail` | `hsl(11, 35%, 48%)` |
| 82 | **Gearzilla** | mesin | `thunder` | `square` | `unicorn` | `sleepy` | `fangs` | `belly` | `hsl(18, 35%, 56%)` |
| 83 | **Sekrupor** | mesin | `thunder` | `ghost` | `ears` | `one` | `zigzag` | `tail` | `hsl(25, 35%, 64%)` |
| 84 | **Baterion** | mesin | `thunder` | `egg` | `spikes` | `four` | `open` | `spots` | `hsl(32, 35%, 52%)` |
| 85 | **Mekanix** | mesin | `thunder` | `spiky` | `spikes` | `one` | `smile` | `none` | `hsl(39, 35%, 60%)` |
| 86 | **Pistonk** | mesin | `thunder` | `round` | `horns` | `three` | `teeth` | `cheeks` | `hsl(11, 35%, 48%)` |
| 87 | **Kabelon** | mesin | `thunder` | `slime` | `mohawk` | `three` | `teeth` | `none` | `hsl(18, 35%, 56%)` |
| 88 | **Turbinor** | mesin | `thunder` | `blob` | `ears` | `angry` | `fangs` | `arms` | `hsl(25, 35%, 64%)` |
| 89 | **Magnetor** | mesin | `thunder` | `ghost` | `none` | `four` | `smile` | `none` | `hsl(32, 35%, 52%)` |
| 90 | **Chipzo** | mesin | `thunder` | `spiky` | `antennae` | `three` | `zigzag` | `wings` | `hsl(39, 35%, 60%)` |
| 91 | **Permenok** | manis | `light` | `octopus` | `unicorn` | `four` | `fangs` | `cheeks` | `hsl(331, 75%, 48%)` |
| 92 | **Cokelatron** | manis | `light` | `spiky` | `ears` | `one` | `teeth` | `tail` | `hsl(338, 75%, 56%)` |
| 93 | **Donatzilla** | manis | `light` | `square` | `mohawk` | `sleepy` | `teeth` | `arms` | `hsl(345, 75%, 64%)` |
| 94 | **Krimor** | manis | `light` | `blob` | `none` | `two` | `open` | `cheeks` | `hsl(352, 75%, 52%)` |
| 95 | **Kukuriz** | manis | `light` | `slime` | `spikes` | `one` | `fangs` | `arms` | `hsl(359, 75%, 60%)` |
| 96 | **Lolipopo** | manis | `light` | `round` | `antennae` | `sleepy` | `zigzag` | `wings` | `hsl(331, 75%, 48%)` |
| 97 | **Puddingar** | manis | `light` | `egg` | `none` | `one` | `tongue` | `cheeks` | `hsl(338, 75%, 56%)` |
| 98 | **Jellybon** | manis | `light` | `ghost` | `horns` | `sleepy` | `smile` | `arms` | `hsl(345, 75%, 64%)` |
| 99 | **Wafelor** | manis | `light` | `egg` | `mohawk` | `sleepy` | `open` | `none` | `hsl(352, 75%, 52%)` |
| 100 | **Gulalon** | manis | `light` | `round` | `horns` | `angry` | `teeth` | `cheeks` | `hsl(359, 75%, 60%)` |

### 2.5 Rincian Visual & Kit Skill 100 Boss per Kelompok Tema

#### Habitat Hutan Rimba (Elemen: 🌿 Hutan) — 10 Boss

##### Boss #1: **Lumutra**
- **Habitat / Elemen**: Hutan Rimba / `nature` (Roh Rimba)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `ears`, Mata: `sleepy`, Mulut: `open`, Ekstra: `none`
- **Warna Primer**: `hsl(116, 62%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌵 **Racun Duri** (`dot`)
  2. *Rare*: + 🌱 **Akar Membelit** (`skill_tax`)
  3. *Epic*: + 😴 **Serbuk Lelap** (`time_squeeze`)
  4. *Legend*: + 🍄 **Lumut Penghisap** (`heal_curse` - Ultimate Kit)

##### Boss #2: **Akarok**
- **Habitat / Elemen**: Hutan Rimba / `nature` (Roh Rimba)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `unicorn`, Mata: `two`, Mulut: `fangs`, Ekstra: `wings`
- **Warna Primer**: `hsl(123, 62%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌵 **Racun Duri** (`dot`)
  2. *Rare*: + 🌱 **Akar Membelit** (`skill_tax`)
  3. *Epic*: + 😴 **Serbuk Lelap** (`time_squeeze`)
  4. *Legend*: + 🍄 **Lumut Penghisap** (`heal_curse` - Ultimate Kit)

##### Boss #3: **Jamurgon**
- **Habitat / Elemen**: Hutan Rimba / `nature` (Roh Rimba)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `none`, Mata: `one`, Mulut: `open`, Ekstra: `none`
- **Warna Primer**: `hsl(130, 62%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌵 **Racun Duri** (`dot`)
  2. *Rare*: + 🌱 **Akar Membelit** (`skill_tax`)
  3. *Epic*: + 😴 **Serbuk Lelap** (`time_squeeze`)
  4. *Legend*: + 🍄 **Lumut Penghisap** (`heal_curse` - Ultimate Kit)

##### Boss #4: **Kayubuk**
- **Habitat / Elemen**: Hutan Rimba / `nature` (Roh Rimba)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `unicorn`, Mata: `sleepy`, Mulut: `fangs`, Ekstra: `belly`
- **Warna Primer**: `hsl(137, 62%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌵 **Racun Duri** (`dot`)
  2. *Rare*: + 🌱 **Akar Membelit** (`skill_tax`)
  3. *Epic*: + 😴 **Serbuk Lelap** (`time_squeeze`)
  4. *Legend*: + 🍄 **Lumut Penghisap** (`heal_curse` - Ultimate Kit)

##### Boss #5: **Daunjir**
- **Habitat / Elemen**: Hutan Rimba / `nature` (Roh Rimba)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `unicorn`, Mata: `sleepy`, Mulut: `fangs`, Ekstra: `arms`
- **Warna Primer**: `hsl(144, 62%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌵 **Racun Duri** (`dot`)
  2. *Rare*: + 🌱 **Akar Membelit** (`skill_tax`)
  3. *Epic*: + 😴 **Serbuk Lelap** (`time_squeeze`)
  4. *Legend*: + 🍄 **Lumut Penghisap** (`heal_curse` - Ultimate Kit)

##### Boss #6: **Burunggar**
- **Habitat / Elemen**: Hutan Rimba / `nature` (Roh Rimba)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `none`, Mata: `four`, Mulut: `zigzag`, Ekstra: `wings`
- **Warna Primer**: `hsl(116, 62%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌵 **Racun Duri** (`dot`)
  2. *Rare*: + 🌱 **Akar Membelit** (`skill_tax`)
  3. *Epic*: + 😴 **Serbuk Lelap** (`time_squeeze`)
  4. *Legend*: + 🍄 **Lumut Penghisap** (`heal_curse` - Ultimate Kit)

##### Boss #7: **Sulurkan**
- **Habitat / Elemen**: Hutan Rimba / `nature` (Roh Rimba)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `crown`, Mata: `two`, Mulut: `tongue`, Ekstra: `tail`
- **Warna Primer**: `hsl(123, 62%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌵 **Racun Duri** (`dot`)
  2. *Rare*: + 🌱 **Akar Membelit** (`skill_tax`)
  3. *Epic*: + 😴 **Serbuk Lelap** (`time_squeeze`)
  4. *Legend*: + 🍄 **Lumut Penghisap** (`heal_curse` - Ultimate Kit)

##### Boss #8: **Rimbazo**
- **Habitat / Elemen**: Hutan Rimba / `nature` (Roh Rimba)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `horns`, Mata: `one`, Mulut: `fangs`, Ekstra: `tail`
- **Warna Primer**: `hsl(130, 62%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌵 **Racun Duri** (`dot`)
  2. *Rare*: + 🌱 **Akar Membelit** (`skill_tax`)
  3. *Epic*: + 😴 **Serbuk Lelap** (`time_squeeze`)
  4. *Legend*: + 🍄 **Lumut Penghisap** (`heal_curse` - Ultimate Kit)

##### Boss #9: **Beringkus**
- **Habitat / Elemen**: Hutan Rimba / `nature` (Roh Rimba)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `unicorn`, Mata: `two`, Mulut: `smile`, Ekstra: `spots`
- **Warna Primer**: `hsl(137, 62%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌵 **Racun Duri** (`dot`)
  2. *Rare*: + 🌱 **Akar Membelit** (`skill_tax`)
  3. *Epic*: + 😴 **Serbuk Lelap** (`time_squeeze`)
  4. *Legend*: + 🍄 **Lumut Penghisap** (`heal_curse` - Ultimate Kit)

##### Boss #10: **Tupaiju**
- **Habitat / Elemen**: Hutan Rimba / `nature` (Roh Rimba)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `antennae`, Mata: `one`, Mulut: `zigzag`, Ekstra: `none`
- **Warna Primer**: `hsl(144, 62%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌵 **Racun Duri** (`dot`)
  2. *Rare*: + 🌱 **Akar Membelit** (`skill_tax`)
  3. *Epic*: + 😴 **Serbuk Lelap** (`time_squeeze`)
  4. *Legend*: + 🍄 **Lumut Penghisap** (`heal_curse` - Ultimate Kit)

#### Habitat Rawa Lendir (Elemen: ☠️ Racun) — 10 Boss

##### Boss #11: **Slimbul**
- **Habitat / Elemen**: Rawa Lendir / `toxic` (Ratu Rawa Beracun)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `ears`, Mata: `four`, Mulut: `open`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(61, 70%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ☠️ **Gas Beracun** (`dot`)
  2. *Rare*: + 🌫️ **Kabut Racun** (`heal_curse`)
  3. *Epic*: + 🧪 **Semprotan Asam** (`shield_pierce`)
  4. *Legend*: + 🦠 **Wabah** (`skill_tax` - Ultimate Kit)

##### Boss #12: **Lendirot**
- **Habitat / Elemen**: Rawa Lendir / `toxic` (Ratu Rawa Beracun)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `ears`, Mata: `angry`, Mulut: `smile`, Ekstra: `belly`
- **Warna Primer**: `hsl(68, 70%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ☠️ **Gas Beracun** (`dot`)
  2. *Rare*: + 🌫️ **Kabut Racun** (`heal_curse`)
  3. *Epic*: + 🧪 **Semprotan Asam** (`shield_pierce`)
  4. *Legend*: + 🦠 **Wabah** (`skill_tax` - Ultimate Kit)

##### Boss #13: **Gelatok**
- **Habitat / Elemen**: Rawa Lendir / `toxic` (Ratu Rawa Beracun)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `mohawk`, Mata: `two`, Mulut: `smile`, Ekstra: `stripes`
- **Warna Primer**: `hsl(75, 70%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ☠️ **Gas Beracun** (`dot`)
  2. *Rare*: + 🌫️ **Kabut Racun** (`heal_curse`)
  3. *Epic*: + 🧪 **Semprotan Asam** (`shield_pierce`)
  4. *Legend*: + 🦠 **Wabah** (`skill_tax` - Ultimate Kit)

##### Boss #14: **Becekon**
- **Habitat / Elemen**: Rawa Lendir / `toxic` (Ratu Rawa Beracun)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `horns`, Mata: `angry`, Mulut: `fangs`, Ekstra: `arms`
- **Warna Primer**: `hsl(82, 70%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ☠️ **Gas Beracun** (`dot`)
  2. *Rare*: + 🌫️ **Kabut Racun** (`heal_curse`)
  3. *Epic*: + 🧪 **Semprotan Asam** (`shield_pierce`)
  4. *Legend*: + 🦠 **Wabah** (`skill_tax` - Ultimate Kit)

##### Boss #15: **Lumpurra**
- **Habitat / Elemen**: Rawa Lendir / `toxic` (Ratu Rawa Beracun)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `spikes`, Mata: `one`, Mulut: `fangs`, Ekstra: `belly`
- **Warna Primer**: `hsl(89, 70%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ☠️ **Gas Beracun** (`dot`)
  2. *Rare*: + 🌫️ **Kabut Racun** (`heal_curse`)
  3. *Epic*: + 🧪 **Semprotan Asam** (`shield_pierce`)
  4. *Legend*: + 🦠 **Wabah** (`skill_tax` - Ultimate Kit)

##### Boss #16: **Kodokzilla**
- **Habitat / Elemen**: Rawa Lendir / `toxic` (Ratu Rawa Beracun)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `ears`, Mata: `one`, Mulut: `smile`, Ekstra: `spots`
- **Warna Primer**: `hsl(61, 70%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ☠️ **Gas Beracun** (`dot`)
  2. *Rare*: + 🌫️ **Kabut Racun** (`heal_curse`)
  3. *Epic*: + 🧪 **Semprotan Asam** (`shield_pierce`)
  4. *Legend*: + 🦠 **Wabah** (`skill_tax` - Ultimate Kit)

##### Boss #17: **Cacingar**
- **Habitat / Elemen**: Rawa Lendir / `toxic` (Ratu Rawa Beracun)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `antennae`, Mata: `two`, Mulut: `smile`, Ekstra: `spots`
- **Warna Primer**: `hsl(68, 70%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ☠️ **Gas Beracun** (`dot`)
  2. *Rare*: + 🌫️ **Kabut Racun** (`heal_curse`)
  3. *Epic*: + 🧪 **Semprotan Asam** (`shield_pierce`)
  4. *Legend*: + 🦠 **Wabah** (`skill_tax` - Ultimate Kit)

##### Boss #18: **Gelembus**
- **Habitat / Elemen**: Rawa Lendir / `toxic` (Ratu Rawa Beracun)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `none`, Mata: `four`, Mulut: `tongue`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(75, 70%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ☠️ **Gas Beracun** (`dot`)
  2. *Rare*: + 🌫️ **Kabut Racun** (`heal_curse`)
  3. *Epic*: + 🧪 **Semprotan Asam** (`shield_pierce`)
  4. *Legend*: + 🦠 **Wabah** (`skill_tax` - Ultimate Kit)

##### Boss #19: **Rawagon**
- **Habitat / Elemen**: Rawa Lendir / `toxic` (Ratu Rawa Beracun)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `unicorn`, Mata: `one`, Mulut: `zigzag`, Ekstra: `arms`
- **Warna Primer**: `hsl(82, 70%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ☠️ **Gas Beracun** (`dot`)
  2. *Rare*: + 🌫️ **Kabut Racun** (`heal_curse`)
  3. *Epic*: + 🧪 **Semprotan Asam** (`shield_pierce`)
  4. *Legend*: + 🦠 **Wabah** (`skill_tax` - Ultimate Kit)

##### Boss #20: **Ingusaur**
- **Habitat / Elemen**: Rawa Lendir / `toxic` (Ratu Rawa Beracun)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `none`, Mata: `one`, Mulut: `fangs`, Ekstra: `none`
- **Warna Primer**: `hsl(89, 70%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ☠️ **Gas Beracun** (`dot`)
  2. *Rare*: + 🌫️ **Kabut Racun** (`heal_curse`)
  3. *Epic*: + 🧪 **Semprotan Asam** (`shield_pierce`)
  4. *Legend*: + 🦠 **Wabah** (`skill_tax` - Ultimate Kit)

#### Habitat Gua Kristal (Elemen: 🪨 Tanah) — 10 Boss

##### Boss #21: **Kristalor**
- **Habitat / Elemen**: Gua Kristal / `earth` (Golem Pegunungan)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `none`, Mata: `angry`, Mulut: `smile`, Ekstra: `tail`
- **Warna Primer**: `hsl(286, 55%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 👊 **Hantaman Batu** (`charged_strike`)
  2. *Rare*: + ⛰️ **Longsor** (`combo_seal`)
  3. *Epic*: + 🫨 **Gempa Bumi** (`energy_siphon`)
  4. *Legend*: + 💥 **Runtuhnya Gunung** (`phase_rage` - Ultimate Kit)

##### Boss #22: **Batuguk**
- **Habitat / Elemen**: Gua Kristal / `earth` (Golem Pegunungan)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `unicorn`, Mata: `one`, Mulut: `fangs`, Ekstra: `stripes`
- **Warna Primer**: `hsl(293, 55%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 👊 **Hantaman Batu** (`charged_strike`)
  2. *Rare*: + ⛰️ **Longsor** (`combo_seal`)
  3. *Epic*: + 🫨 **Gempa Bumi** (`energy_siphon`)
  4. *Legend*: + 💥 **Runtuhnya Gunung** (`phase_rage` - Ultimate Kit)

##### Boss #23: **Stalaktron**
- **Habitat / Elemen**: Gua Kristal / `earth` (Golem Pegunungan)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `mohawk`, Mata: `two`, Mulut: `open`, Ekstra: `spots`
- **Warna Primer**: `hsl(300, 55%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 👊 **Hantaman Batu** (`charged_strike`)
  2. *Rare*: + ⛰️ **Longsor** (`combo_seal`)
  3. *Epic*: + 🫨 **Gempa Bumi** (`energy_siphon`)
  4. *Legend*: + 💥 **Runtuhnya Gunung** (`phase_rage` - Ultimate Kit)

##### Boss #24: **Gemilang**
- **Habitat / Elemen**: Gua Kristal / `earth` (Golem Pegunungan)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `spikes`, Mata: `sleepy`, Mulut: `teeth`, Ekstra: `arms`
- **Warna Primer**: `hsl(307, 55%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 👊 **Hantaman Batu** (`charged_strike`)
  2. *Rare*: + ⛰️ **Longsor** (`combo_seal`)
  3. *Epic*: + 🫨 **Gempa Bumi** (`energy_siphon`)
  4. *Legend*: + 💥 **Runtuhnya Gunung** (`phase_rage` - Ultimate Kit)

##### Boss #25: **Kelelawor**
- **Habitat / Elemen**: Gua Kristal / `earth` (Golem Pegunungan)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `crown`, Mata: `one`, Mulut: `smile`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(314, 55%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 👊 **Hantaman Batu** (`charged_strike`)
  2. *Rare*: + ⛰️ **Longsor** (`combo_seal`)
  3. *Epic*: + 🫨 **Gempa Bumi** (`energy_siphon`)
  4. *Legend*: + 💥 **Runtuhnya Gunung** (`phase_rage` - Ultimate Kit)

##### Boss #26: **Gelapuk**
- **Habitat / Elemen**: Gua Kristal / `earth` (Golem Pegunungan)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `mohawk`, Mata: `angry`, Mulut: `teeth`, Ekstra: `arms`
- **Warna Primer**: `hsl(286, 55%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 👊 **Hantaman Batu** (`charged_strike`)
  2. *Rare*: + ⛰️ **Longsor** (`combo_seal`)
  3. *Epic*: + 🫨 **Gempa Bumi** (`energy_siphon`)
  4. *Legend*: + 💥 **Runtuhnya Gunung** (`phase_rage` - Ultimate Kit)

##### Boss #27: **Amethyx**
- **Habitat / Elemen**: Gua Kristal / `earth` (Golem Pegunungan)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `crown`, Mata: `sleepy`, Mulut: `fangs`, Ekstra: `none`
- **Warna Primer**: `hsl(293, 55%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 👊 **Hantaman Batu** (`charged_strike`)
  2. *Rare*: + ⛰️ **Longsor** (`combo_seal`)
  3. *Epic*: + 🫨 **Gempa Bumi** (`energy_siphon`)
  4. *Legend*: + 💥 **Runtuhnya Gunung** (`phase_rage` - Ultimate Kit)

##### Boss #28: **Permatok**
- **Habitat / Elemen**: Gua Kristal / `earth` (Golem Pegunungan)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `antennae`, Mata: `four`, Mulut: `open`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(300, 55%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 👊 **Hantaman Batu** (`charged_strike`)
  2. *Rare*: + ⛰️ **Longsor** (`combo_seal`)
  3. *Epic*: + 🫨 **Gempa Bumi** (`energy_siphon`)
  4. *Legend*: + 💥 **Runtuhnya Gunung** (`phase_rage` - Ultimate Kit)

##### Boss #29: **Goanggar**
- **Habitat / Elemen**: Gua Kristal / `earth` (Golem Pegunungan)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `crown`, Mata: `one`, Mulut: `tongue`, Ekstra: `none`
- **Warna Primer**: `hsl(307, 55%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 👊 **Hantaman Batu** (`charged_strike`)
  2. *Rare*: + ⛰️ **Longsor** (`combo_seal`)
  3. *Epic*: + 🫨 **Gempa Bumi** (`energy_siphon`)
  4. *Legend*: + 💥 **Runtuhnya Gunung** (`phase_rage` - Ultimate Kit)

##### Boss #30: **Fosforo**
- **Habitat / Elemen**: Gua Kristal / `earth` (Golem Pegunungan)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `crown`, Mata: `two`, Mulut: `fangs`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(314, 55%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 👊 **Hantaman Batu** (`charged_strike`)
  2. *Rare*: + ⛰️ **Longsor** (`combo_seal`)
  3. *Epic*: + 🫨 **Gempa Bumi** (`energy_siphon`)
  4. *Legend*: + 💥 **Runtuhnya Gunung** (`phase_rage` - Ultimate Kit)

#### Habitat Gunung Api (Elemen: 🔥 Api) — 10 Boss

##### Boss #31: **Apiko**
- **Habitat / Elemen**: Gunung Api / `fire` (Penguasa Api)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `crown`, Mata: `two`, Mulut: `tongue`, Ekstra: `wings`
- **Warna Primer**: `hsl(354, 80%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🔥 **Amarah Membara** (`rage_damage`)
  2. *Rare*: + 🐉 **Semburan Api** (`charged_strike`)
  3. *Epic*: + ♨️ **Terbakar** (`dot`)
  4. *Legend*: + 🌋 **Ledakan Inferno** (`phase_rage` - Ultimate Kit)

##### Boss #32: **Lavagor**
- **Habitat / Elemen**: Gunung Api / `fire` (Penguasa Api)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `antennae`, Mata: `one`, Mulut: `tongue`, Ekstra: `belly`
- **Warna Primer**: `hsl(1, 80%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🔥 **Amarah Membara** (`rage_damage`)
  2. *Rare*: + 🐉 **Semburan Api** (`charged_strike`)
  3. *Epic*: + ♨️ **Terbakar** (`dot`)
  4. *Legend*: + 🌋 **Ledakan Inferno** (`phase_rage` - Ultimate Kit)

##### Boss #33: **Barakus**
- **Habitat / Elemen**: Gunung Api / `fire` (Penguasa Api)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `horns`, Mata: `four`, Mulut: `tongue`, Ekstra: `spots`
- **Warna Primer**: `hsl(8, 80%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🔥 **Amarah Membara** (`rage_damage`)
  2. *Rare*: + 🐉 **Semburan Api** (`charged_strike`)
  3. *Epic*: + ♨️ **Terbakar** (`dot`)
  4. *Legend*: + 🌋 **Ledakan Inferno** (`phase_rage` - Ultimate Kit)

##### Boss #34: **Magmora**
- **Habitat / Elemen**: Gunung Api / `fire` (Penguasa Api)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `antennae`, Mata: `one`, Mulut: `tongue`, Ekstra: `arms`
- **Warna Primer**: `hsl(15, 80%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🔥 **Amarah Membara** (`rage_damage`)
  2. *Rare*: + 🐉 **Semburan Api** (`charged_strike`)
  3. *Epic*: + ♨️ **Terbakar** (`dot`)
  4. *Legend*: + 🌋 **Ledakan Inferno** (`phase_rage` - Ultimate Kit)

##### Boss #35: **Abunoir**
- **Habitat / Elemen**: Gunung Api / `fire` (Penguasa Api)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `antennae`, Mata: `four`, Mulut: `teeth`, Ekstra: `none`
- **Warna Primer**: `hsl(22, 80%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🔥 **Amarah Membara** (`rage_damage`)
  2. *Rare*: + 🐉 **Semburan Api** (`charged_strike`)
  3. *Epic*: + ♨️ **Terbakar** (`dot`)
  4. *Legend*: + 🌋 **Ledakan Inferno** (`phase_rage` - Ultimate Kit)

##### Boss #36: **Percikor**
- **Habitat / Elemen**: Gunung Api / `fire` (Penguasa Api)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `none`, Mata: `one`, Mulut: `teeth`, Ekstra: `spots`
- **Warna Primer**: `hsl(354, 80%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🔥 **Amarah Membara** (`rage_damage`)
  2. *Rare*: + 🐉 **Semburan Api** (`charged_strike`)
  3. *Epic*: + ♨️ **Terbakar** (`dot`)
  4. *Legend*: + 🌋 **Ledakan Inferno** (`phase_rage` - Ultimate Kit)

##### Boss #37: **Salamandor**
- **Habitat / Elemen**: Gunung Api / `fire` (Penguasa Api)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `none`, Mata: `four`, Mulut: `tongue`, Ekstra: `none`
- **Warna Primer**: `hsl(1, 80%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🔥 **Amarah Membara** (`rage_damage`)
  2. *Rare*: + 🐉 **Semburan Api** (`charged_strike`)
  3. *Epic*: + ♨️ **Terbakar** (`dot`)
  4. *Legend*: + 🌋 **Ledakan Inferno** (`phase_rage` - Ultimate Kit)

##### Boss #38: **Kaldera**
- **Habitat / Elemen**: Gunung Api / `fire` (Penguasa Api)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `unicorn`, Mata: `four`, Mulut: `fangs`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(8, 80%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🔥 **Amarah Membara** (`rage_damage`)
  2. *Rare*: + 🐉 **Semburan Api** (`charged_strike`)
  3. *Epic*: + ♨️ **Terbakar** (`dot`)
  4. *Legend*: + 🌋 **Ledakan Inferno** (`phase_rage` - Ultimate Kit)

##### Boss #39: **Geyserok**
- **Habitat / Elemen**: Gunung Api / `fire` (Penguasa Api)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `spikes`, Mata: `three`, Mulut: `tongue`, Ekstra: `arms`
- **Warna Primer**: `hsl(15, 80%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🔥 **Amarah Membara** (`rage_damage`)
  2. *Rare*: + 🐉 **Semburan Api** (`charged_strike`)
  3. *Epic*: + ♨️ **Terbakar** (`dot`)
  4. *Legend*: + 🌋 **Ledakan Inferno** (`phase_rage` - Ultimate Kit)

##### Boss #40: **Arangon**
- **Habitat / Elemen**: Gunung Api / `fire` (Penguasa Api)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `antennae`, Mata: `angry`, Mulut: `open`, Ekstra: `spots`
- **Warna Primer**: `hsl(22, 80%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🔥 **Amarah Membara** (`rage_damage`)
  2. *Rare*: + 🐉 **Semburan Api** (`charged_strike`)
  3. *Epic*: + ♨️ **Terbakar** (`dot`)
  4. *Legend*: + 🌋 **Ledakan Inferno** (`phase_rage` - Ultimate Kit)

#### Habitat Negeri Es (Elemen: ❄️ Es) — 10 Boss

##### Boss #41: **Esbeku**
- **Habitat / Elemen**: Negeri Es / `ice` (Raja Salju)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `crown`, Mata: `two`, Mulut: `open`, Ekstra: `belly`
- **Warna Primer**: `hsl(164, 65%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🥶 **Embun Beku** (`time_squeeze`)
  2. *Rare*: + 🌨️ **Badai Salju** (`charged_strike`)
  3. *Epic*: + 🧊 **Retak Es** (`combo_seal`)
  4. *Legend*: + ❄️ **Beku Abadi** (`heal_curse` - Ultimate Kit)

##### Boss #42: **Saljuno**
- **Habitat / Elemen**: Negeri Es / `ice` (Raja Salju)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `crown`, Mata: `four`, Mulut: `open`, Ekstra: `wings`
- **Warna Primer**: `hsl(171, 65%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🥶 **Embun Beku** (`time_squeeze`)
  2. *Rare*: + 🌨️ **Badai Salju** (`charged_strike`)
  3. *Epic*: + 🧊 **Retak Es** (`combo_seal`)
  4. *Legend*: + ❄️ **Beku Abadi** (`heal_curse` - Ultimate Kit)

##### Boss #43: **Glaciur**
- **Habitat / Elemen**: Negeri Es / `ice` (Raja Salju)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `mohawk`, Mata: `four`, Mulut: `fangs`, Ekstra: `belly`
- **Warna Primer**: `hsl(178, 65%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🥶 **Embun Beku** (`time_squeeze`)
  2. *Rare*: + 🌨️ **Badai Salju** (`charged_strike`)
  3. *Epic*: + 🧊 **Retak Es** (`combo_seal`)
  4. *Legend*: + ❄️ **Beku Abadi** (`heal_curse` - Ultimate Kit)

##### Boss #44: **Kristalsalju**
- **Habitat / Elemen**: Negeri Es / `ice` (Raja Salju)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `mohawk`, Mata: `three`, Mulut: `zigzag`, Ekstra: `tail`
- **Warna Primer**: `hsl(185, 65%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🥶 **Embun Beku** (`time_squeeze`)
  2. *Rare*: + 🌨️ **Badai Salju** (`charged_strike`)
  3. *Epic*: + 🧊 **Retak Es** (`combo_seal`)
  4. *Legend*: + ❄️ **Beku Abadi** (`heal_curse` - Ultimate Kit)

##### Boss #45: **Pingwino**
- **Habitat / Elemen**: Negeri Es / `ice` (Raja Salju)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `spikes`, Mata: `four`, Mulut: `smile`, Ekstra: `arms`
- **Warna Primer**: `hsl(192, 65%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🥶 **Embun Beku** (`time_squeeze`)
  2. *Rare*: + 🌨️ **Badai Salju** (`charged_strike`)
  3. *Epic*: + 🧊 **Retak Es** (`combo_seal`)
  4. *Legend*: + ❄️ **Beku Abadi** (`heal_curse` - Ultimate Kit)

##### Boss #46: **Dinginor**
- **Habitat / Elemen**: Negeri Es / `ice` (Raja Salju)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `antennae`, Mata: `four`, Mulut: `open`, Ekstra: `spots`
- **Warna Primer**: `hsl(164, 65%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🥶 **Embun Beku** (`time_squeeze`)
  2. *Rare*: + 🌨️ **Badai Salju** (`charged_strike`)
  3. *Epic*: + 🧊 **Retak Es** (`combo_seal`)
  4. *Legend*: + ❄️ **Beku Abadi** (`heal_curse` - Ultimate Kit)

##### Boss #47: **Mamutik**
- **Habitat / Elemen**: Negeri Es / `ice` (Raja Salju)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `unicorn`, Mata: `sleepy`, Mulut: `fangs`, Ekstra: `belly`
- **Warna Primer**: `hsl(171, 65%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🥶 **Embun Beku** (`time_squeeze`)
  2. *Rare*: + 🌨️ **Badai Salju** (`charged_strike`)
  3. *Epic*: + 🧊 **Retak Es** (`combo_seal`)
  4. *Legend*: + ❄️ **Beku Abadi** (`heal_curse` - Ultimate Kit)

##### Boss #48: **Frostiko**
- **Habitat / Elemen**: Negeri Es / `ice` (Raja Salju)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `antennae`, Mata: `angry`, Mulut: `fangs`, Ekstra: `tail`
- **Warna Primer**: `hsl(178, 65%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🥶 **Embun Beku** (`time_squeeze`)
  2. *Rare*: + 🌨️ **Badai Salju** (`charged_strike`)
  3. *Epic*: + 🧊 **Retak Es** (`combo_seal`)
  4. *Legend*: + ❄️ **Beku Abadi** (`heal_curse` - Ultimate Kit)

##### Boss #49: **Igluk**
- **Habitat / Elemen**: Negeri Es / `ice` (Raja Salju)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `ears`, Mata: `three`, Mulut: `open`, Ekstra: `belly`
- **Warna Primer**: `hsl(185, 65%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🥶 **Embun Beku** (`time_squeeze`)
  2. *Rare*: + 🌨️ **Badai Salju** (`charged_strike`)
  3. *Epic*: + 🧊 **Retak Es** (`combo_seal`)
  4. *Legend*: + ❄️ **Beku Abadi** (`heal_curse` - Ultimate Kit)

##### Boss #50: **Badaino**
- **Habitat / Elemen**: Negeri Es / `ice` (Raja Salju)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `crown`, Mata: `one`, Mulut: `teeth`, Ekstra: `none`
- **Warna Primer**: `hsl(192, 65%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🥶 **Embun Beku** (`time_squeeze`)
  2. *Rare*: + 🌨️ **Badai Salju** (`charged_strike`)
  3. *Epic*: + 🧊 **Retak Es** (`combo_seal`)
  4. *Legend*: + ❄️ **Beku Abadi** (`heal_curse` - Ultimate Kit)

#### Habitat Laut Dalam (Elemen: 💧 Air) — 10 Boss

##### Boss #51: **Guritron**
- **Habitat / Elemen**: Laut Dalam / `water` (Penjaga Samudra)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `none`, Mata: `angry`, Mulut: `fangs`, Ekstra: `none`
- **Warna Primer**: `hsl(201, 70%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌀 **Arus Penyedot** (`energy_siphon`)
  2. *Rare*: + 🌊 **Gelombang Pasang** (`charged_strike`)
  3. *Epic*: + ⏳ **Hanyut** (`time_squeeze`)
  4. *Legend*: + 💦 **Banjir Pelumpuh** (`heal_curse` - Ultimate Kit)

##### Boss #52: **Kepitingor**
- **Habitat / Elemen**: Laut Dalam / `water` (Penjaga Samudra)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `unicorn`, Mata: `one`, Mulut: `tongue`, Ekstra: `spots`
- **Warna Primer**: `hsl(208, 70%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌀 **Arus Penyedot** (`energy_siphon`)
  2. *Rare*: + 🌊 **Gelombang Pasang** (`charged_strike`)
  3. *Epic*: + ⏳ **Hanyut** (`time_squeeze`)
  4. *Legend*: + 💦 **Banjir Pelumpuh** (`heal_curse` - Ultimate Kit)

##### Boss #53: **Uburzap**
- **Habitat / Elemen**: Laut Dalam / `water` (Penjaga Samudra)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `ears`, Mata: `one`, Mulut: `zigzag`, Ekstra: `stripes`
- **Warna Primer**: `hsl(215, 70%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌀 **Arus Penyedot** (`energy_siphon`)
  2. *Rare*: + 🌊 **Gelombang Pasang** (`charged_strike`)
  3. *Epic*: + ⏳ **Hanyut** (`time_squeeze`)
  4. *Legend*: + 💦 **Banjir Pelumpuh** (`heal_curse` - Ultimate Kit)

##### Boss #54: **Hiugar**
- **Habitat / Elemen**: Laut Dalam / `water` (Penjaga Samudra)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `none`, Mata: `sleepy`, Mulut: `smile`, Ekstra: `belly`
- **Warna Primer**: `hsl(222, 70%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌀 **Arus Penyedot** (`energy_siphon`)
  2. *Rare*: + 🌊 **Gelombang Pasang** (`charged_strike`)
  3. *Epic*: + ⏳ **Hanyut** (`time_squeeze`)
  4. *Legend*: + 💦 **Banjir Pelumpuh** (`heal_curse` - Ultimate Kit)

##### Boss #55: **Kerangon**
- **Habitat / Elemen**: Laut Dalam / `water` (Penjaga Samudra)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `crown`, Mata: `sleepy`, Mulut: `zigzag`, Ekstra: `belly`
- **Warna Primer**: `hsl(229, 70%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌀 **Arus Penyedot** (`energy_siphon`)
  2. *Rare*: + 🌊 **Gelombang Pasang** (`charged_strike`)
  3. *Epic*: + ⏳ **Hanyut** (`time_squeeze`)
  4. *Legend*: + 💦 **Banjir Pelumpuh** (`heal_curse` - Ultimate Kit)

##### Boss #56: **Pausmok**
- **Habitat / Elemen**: Laut Dalam / `water` (Penjaga Samudra)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `ears`, Mata: `one`, Mulut: `open`, Ekstra: `none`
- **Warna Primer**: `hsl(201, 70%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌀 **Arus Penyedot** (`energy_siphon`)
  2. *Rare*: + 🌊 **Gelombang Pasang** (`charged_strike`)
  3. *Epic*: + ⏳ **Hanyut** (`time_squeeze`)
  4. *Legend*: + 💦 **Banjir Pelumpuh** (`heal_curse` - Ultimate Kit)

##### Boss #57: **Karangor**
- **Habitat / Elemen**: Laut Dalam / `water` (Penjaga Samudra)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `antennae`, Mata: `one`, Mulut: `tongue`, Ekstra: `belly`
- **Warna Primer**: `hsl(208, 70%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌀 **Arus Penyedot** (`energy_siphon`)
  2. *Rare*: + 🌊 **Gelombang Pasang** (`charged_strike`)
  3. *Epic*: + ⏳ **Hanyut** (`time_squeeze`)
  4. *Legend*: + 💦 **Banjir Pelumpuh** (`heal_curse` - Ultimate Kit)

##### Boss #58: **Lobsterok**
- **Habitat / Elemen**: Laut Dalam / `water` (Penjaga Samudra)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `mohawk`, Mata: `four`, Mulut: `teeth`, Ekstra: `arms`
- **Warna Primer**: `hsl(215, 70%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌀 **Arus Penyedot** (`energy_siphon`)
  2. *Rare*: + 🌊 **Gelombang Pasang** (`charged_strike`)
  3. *Epic*: + ⏳ **Hanyut** (`time_squeeze`)
  4. *Legend*: + 💦 **Banjir Pelumpuh** (`heal_curse` - Ultimate Kit)

##### Boss #59: **Bintanggar**
- **Habitat / Elemen**: Laut Dalam / `water` (Penjaga Samudra)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `horns`, Mata: `two`, Mulut: `teeth`, Ekstra: `wings`
- **Warna Primer**: `hsl(222, 70%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌀 **Arus Penyedot** (`energy_siphon`)
  2. *Rare*: + 🌊 **Gelombang Pasang** (`charged_strike`)
  3. *Epic*: + ⏳ **Hanyut** (`time_squeeze`)
  4. *Legend*: + 💦 **Banjir Pelumpuh** (`heal_curse` - Ultimate Kit)

##### Boss #60: **Piranjo**
- **Habitat / Elemen**: Laut Dalam / `water` (Penjaga Samudra)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `antennae`, Mata: `angry`, Mulut: `fangs`, Ekstra: `tail`
- **Warna Primer**: `hsl(229, 70%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌀 **Arus Penyedot** (`energy_siphon`)
  2. *Rare*: + 🌊 **Gelombang Pasang** (`charged_strike`)
  3. *Epic*: + ⏳ **Hanyut** (`time_squeeze`)
  4. *Legend*: + 💦 **Banjir Pelumpuh** (`heal_curse` - Ultimate Kit)

#### Habitat Kerajaan Awan (Elemen: 🌪️ Angin) — 10 Boss

##### Boss #61: **Awanimo**
- **Habitat / Elemen**: Kerajaan Awan / `wind` (Penguasa Topan)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `ears`, Mata: `four`, Mulut: `zigzag`, Ekstra: `arms`
- **Warna Primer**: `hsl(34, 85%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 💨 **Angin Topan** (`time_squeeze`)
  2. *Rare*: + 🗡️ **Tebasan Angin** (`charged_strike`)
  3. *Epic*: + 🌀 **Pusaran** (`combo_seal`)
  4. *Legend*: + 🌪️ **Badai Sempurna** (`energy_siphon` - Ultimate Kit)

##### Boss #62: **Petirgon**
- **Habitat / Elemen**: Kerajaan Awan / `wind` (Penguasa Topan)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `mohawk`, Mata: `sleepy`, Mulut: `teeth`, Ekstra: `stripes`
- **Warna Primer**: `hsl(41, 85%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 💨 **Angin Topan** (`time_squeeze`)
  2. *Rare*: + 🗡️ **Tebasan Angin** (`charged_strike`)
  3. *Epic*: + 🌀 **Pusaran** (`combo_seal`)
  4. *Legend*: + 🌪️ **Badai Sempurna** (`energy_siphon` - Ultimate Kit)

##### Boss #63: **Elangor**
- **Habitat / Elemen**: Kerajaan Awan / `wind` (Penguasa Topan)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `horns`, Mata: `sleepy`, Mulut: `open`, Ekstra: `wings`
- **Warna Primer**: `hsl(48, 85%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 💨 **Angin Topan** (`time_squeeze`)
  2. *Rare*: + 🗡️ **Tebasan Angin** (`charged_strike`)
  3. *Epic*: + 🌀 **Pusaran** (`combo_seal`)
  4. *Legend*: + 🌪️ **Badai Sempurna** (`energy_siphon` - Ultimate Kit)

##### Boss #64: **Pelangor**
- **Habitat / Elemen**: Kerajaan Awan / `wind` (Penguasa Topan)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `unicorn`, Mata: `two`, Mulut: `tongue`, Ekstra: `arms`
- **Warna Primer**: `hsl(55, 85%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 💨 **Angin Topan** (`time_squeeze`)
  2. *Rare*: + 🗡️ **Tebasan Angin** (`charged_strike`)
  3. *Epic*: + 🌀 **Pusaran** (`combo_seal`)
  4. *Legend*: + 🌪️ **Badai Sempurna** (`energy_siphon` - Ultimate Kit)

##### Boss #65: **Anginus**
- **Habitat / Elemen**: Kerajaan Awan / `wind` (Penguasa Topan)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `unicorn`, Mata: `one`, Mulut: `open`, Ekstra: `tail`
- **Warna Primer**: `hsl(62, 85%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 💨 **Angin Topan** (`time_squeeze`)
  2. *Rare*: + 🗡️ **Tebasan Angin** (`charged_strike`)
  3. *Epic*: + 🌀 **Pusaran** (`combo_seal`)
  4. *Legend*: + 🌪️ **Badai Sempurna** (`energy_siphon` - Ultimate Kit)

##### Boss #66: **Kometor**
- **Habitat / Elemen**: Kerajaan Awan / `wind` (Penguasa Topan)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `crown`, Mata: `three`, Mulut: `zigzag`, Ekstra: `spots`
- **Warna Primer**: `hsl(34, 85%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 💨 **Angin Topan** (`time_squeeze`)
  2. *Rare*: + 🗡️ **Tebasan Angin** (`charged_strike`)
  3. *Epic*: + 🌀 **Pusaran** (`combo_seal`)
  4. *Legend*: + 🌪️ **Badai Sempurna** (`energy_siphon` - Ultimate Kit)

##### Boss #67: **Layanglo**
- **Habitat / Elemen**: Kerajaan Awan / `wind` (Penguasa Topan)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `horns`, Mata: `one`, Mulut: `tongue`, Ekstra: `none`
- **Warna Primer**: `hsl(41, 85%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 💨 **Angin Topan** (`time_squeeze`)
  2. *Rare*: + 🗡️ **Tebasan Angin** (`charged_strike`)
  3. *Epic*: + 🌀 **Pusaran** (`combo_seal`)
  4. *Legend*: + 🌪️ **Badai Sempurna** (`energy_siphon` - Ultimate Kit)

##### Boss #68: **Mataharo**
- **Habitat / Elemen**: Kerajaan Awan / `wind` (Penguasa Topan)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `ears`, Mata: `angry`, Mulut: `teeth`, Ekstra: `arms`
- **Warna Primer**: `hsl(48, 85%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 💨 **Angin Topan** (`time_squeeze`)
  2. *Rare*: + 🗡️ **Tebasan Angin** (`charged_strike`)
  3. *Epic*: + 🌀 **Pusaran** (`combo_seal`)
  4. *Legend*: + 🌪️ **Badai Sempurna** (`energy_siphon` - Ultimate Kit)

##### Boss #69: **Hujanix**
- **Habitat / Elemen**: Kerajaan Awan / `wind` (Penguasa Topan)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `crown`, Mata: `one`, Mulut: `smile`, Ekstra: `stripes`
- **Warna Primer**: `hsl(55, 85%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 💨 **Angin Topan** (`time_squeeze`)
  2. *Rare*: + 🗡️ **Tebasan Angin** (`charged_strike`)
  3. *Epic*: + 🌀 **Pusaran** (`combo_seal`)
  4. *Legend*: + 🌪️ **Badai Sempurna** (`energy_siphon` - Ultimate Kit)

##### Boss #70: **Bulanus**
- **Habitat / Elemen**: Kerajaan Awan / `wind` (Penguasa Topan)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `mohawk`, Mata: `sleepy`, Mulut: `teeth`, Ekstra: `arms`
- **Warna Primer**: `hsl(62, 85%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 💨 **Angin Topan** (`time_squeeze`)
  2. *Rare*: + 🗡️ **Tebasan Angin** (`charged_strike`)
  3. *Epic*: + 🌀 **Pusaran** (`combo_seal`)
  4. *Legend*: + 🌪️ **Badai Sempurna** (`energy_siphon` - Ultimate Kit)

#### Habitat Malam Misteri (Elemen: 🌑 Bayangan) — 10 Boss

##### Boss #71: **Bayangor**
- **Habitat / Elemen**: Malam Misteri / `shadow` (Hantu Kegelapan)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `crown`, Mata: `angry`, Mulut: `teeth`, Ekstra: `spots`
- **Warna Primer**: `hsl(231, 50%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌑 **Kegelapan Menembus** (`shield_pierce`)
  2. *Rare*: + 🦇 **Cakar Bayangan** (`charged_strike`)
  3. *Epic*: + 🔮 **Kutukan Gelap** (`heal_curse`)
  4. *Legend*: + 🌘 **Gerhana** (`time_squeeze` - Ultimate Kit)

##### Boss #72: **Hantuk**
- **Habitat / Elemen**: Malam Misteri / `shadow` (Hantu Kegelapan)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `horns`, Mata: `four`, Mulut: `smile`, Ekstra: `arms`
- **Warna Primer**: `hsl(238, 50%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌑 **Kegelapan Menembus** (`shield_pierce`)
  2. *Rare*: + 🦇 **Cakar Bayangan** (`charged_strike`)
  3. *Epic*: + 🔮 **Kutukan Gelap** (`heal_curse`)
  4. *Legend*: + 🌘 **Gerhana** (`time_squeeze` - Ultimate Kit)

##### Boss #73: **Selimutor**
- **Habitat / Elemen**: Malam Misteri / `shadow` (Hantu Kegelapan)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `horns`, Mata: `angry`, Mulut: `fangs`, Ekstra: `spots`
- **Warna Primer**: `hsl(245, 50%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌑 **Kegelapan Menembus** (`shield_pierce`)
  2. *Rare*: + 🦇 **Cakar Bayangan** (`charged_strike`)
  3. *Epic*: + 🔮 **Kutukan Gelap** (`heal_curse`)
  4. *Legend*: + 🌘 **Gerhana** (`time_squeeze` - Ultimate Kit)

##### Boss #74: **Lenteron**
- **Habitat / Elemen**: Malam Misteri / `shadow` (Hantu Kegelapan)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `unicorn`, Mata: `four`, Mulut: `open`, Ekstra: `tail`
- **Warna Primer**: `hsl(252, 50%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌑 **Kegelapan Menembus** (`shield_pierce`)
  2. *Rare*: + 🦇 **Cakar Bayangan** (`charged_strike`)
  3. *Epic*: + 🔮 **Kutukan Gelap** (`heal_curse`)
  4. *Legend*: + 🌘 **Gerhana** (`time_squeeze` - Ultimate Kit)

##### Boss #75: **Labalabi**
- **Habitat / Elemen**: Malam Misteri / `shadow` (Hantu Kegelapan)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `crown`, Mata: `two`, Mulut: `smile`, Ekstra: `spots`
- **Warna Primer**: `hsl(259, 50%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌑 **Kegelapan Menembus** (`shield_pierce`)
  2. *Rare*: + 🦇 **Cakar Bayangan** (`charged_strike`)
  3. *Epic*: + 🔮 **Kutukan Gelap** (`heal_curse`)
  4. *Legend*: + 🌘 **Gerhana** (`time_squeeze` - Ultimate Kit)

##### Boss #76: **Kerangkok**
- **Habitat / Elemen**: Malam Misteri / `shadow` (Hantu Kegelapan)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `horns`, Mata: `four`, Mulut: `zigzag`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(231, 50%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌑 **Kegelapan Menembus** (`shield_pierce`)
  2. *Rare*: + 🦇 **Cakar Bayangan** (`charged_strike`)
  3. *Epic*: + 🔮 **Kutukan Gelap** (`heal_curse`)
  4. *Legend*: + 🌘 **Gerhana** (`time_squeeze` - Ultimate Kit)

##### Boss #77: **Penyihirul**
- **Habitat / Elemen**: Malam Misteri / `shadow` (Hantu Kegelapan)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `horns`, Mata: `sleepy`, Mulut: `smile`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(238, 50%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌑 **Kegelapan Menembus** (`shield_pierce`)
  2. *Rare*: + 🦇 **Cakar Bayangan** (`charged_strike`)
  3. *Epic*: + 🔮 **Kutukan Gelap** (`heal_curse`)
  4. *Legend*: + 🌘 **Gerhana** (`time_squeeze` - Ultimate Kit)

##### Boss #78: **Kabutor**
- **Habitat / Elemen**: Malam Misteri / `shadow` (Hantu Kegelapan)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `horns`, Mata: `one`, Mulut: `teeth`, Ekstra: `belly`
- **Warna Primer**: `hsl(245, 50%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌑 **Kegelapan Menembus** (`shield_pierce`)
  2. *Rare*: + 🦇 **Cakar Bayangan** (`charged_strike`)
  3. *Epic*: + 🔮 **Kutukan Gelap** (`heal_curse`)
  4. *Legend*: + 🌘 **Gerhana** (`time_squeeze` - Ultimate Kit)

##### Boss #79: **Gentayo**
- **Habitat / Elemen**: Malam Misteri / `shadow` (Hantu Kegelapan)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `none`, Mata: `two`, Mulut: `open`, Ekstra: `wings`
- **Warna Primer**: `hsl(252, 50%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌑 **Kegelapan Menembus** (`shield_pierce`)
  2. *Rare*: + 🦇 **Cakar Bayangan** (`charged_strike`)
  3. *Epic*: + 🔮 **Kutukan Gelap** (`heal_curse`)
  4. *Legend*: + 🌘 **Gerhana** (`time_squeeze` - Ultimate Kit)

##### Boss #80: **Gelapon**
- **Habitat / Elemen**: Malam Misteri / `shadow` (Hantu Kegelapan)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `spikes`, Mata: `one`, Mulut: `open`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(259, 50%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 🌑 **Kegelapan Menembus** (`shield_pierce`)
  2. *Rare*: + 🦇 **Cakar Bayangan** (`charged_strike`)
  3. *Epic*: + 🔮 **Kutukan Gelap** (`heal_curse`)
  4. *Legend*: + 🌘 **Gerhana** (`time_squeeze` - Ultimate Kit)

#### Habitat Pabrik Robot (Elemen: ⚡ Petir) — 10 Boss

##### Boss #81: **Robotok**
- **Habitat / Elemen**: Pabrik Robot / `thunder` (Raja Guntur)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `unicorn`, Mata: `one`, Mulut: `fangs`, Ekstra: `tail`
- **Warna Primer**: `hsl(11, 35%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ⚡ **Sengatan** (`energy_siphon`)
  2. *Rare*: + 🌩️ **Petir Menyambar** (`charged_strike`)
  3. *Epic*: + 🔌 **Korsleting** (`skill_tax`)
  4. *Legend*: + ⛈️ **Badai Petir** (`phase_rage` - Ultimate Kit)

##### Boss #82: **Gearzilla**
- **Habitat / Elemen**: Pabrik Robot / `thunder` (Raja Guntur)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `unicorn`, Mata: `sleepy`, Mulut: `fangs`, Ekstra: `belly`
- **Warna Primer**: `hsl(18, 35%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ⚡ **Sengatan** (`energy_siphon`)
  2. *Rare*: + 🌩️ **Petir Menyambar** (`charged_strike`)
  3. *Epic*: + 🔌 **Korsleting** (`skill_tax`)
  4. *Legend*: + ⛈️ **Badai Petir** (`phase_rage` - Ultimate Kit)

##### Boss #83: **Sekrupor**
- **Habitat / Elemen**: Pabrik Robot / `thunder` (Raja Guntur)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `ears`, Mata: `one`, Mulut: `zigzag`, Ekstra: `tail`
- **Warna Primer**: `hsl(25, 35%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ⚡ **Sengatan** (`energy_siphon`)
  2. *Rare*: + 🌩️ **Petir Menyambar** (`charged_strike`)
  3. *Epic*: + 🔌 **Korsleting** (`skill_tax`)
  4. *Legend*: + ⛈️ **Badai Petir** (`phase_rage` - Ultimate Kit)

##### Boss #84: **Baterion**
- **Habitat / Elemen**: Pabrik Robot / `thunder` (Raja Guntur)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `spikes`, Mata: `four`, Mulut: `open`, Ekstra: `spots`
- **Warna Primer**: `hsl(32, 35%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ⚡ **Sengatan** (`energy_siphon`)
  2. *Rare*: + 🌩️ **Petir Menyambar** (`charged_strike`)
  3. *Epic*: + 🔌 **Korsleting** (`skill_tax`)
  4. *Legend*: + ⛈️ **Badai Petir** (`phase_rage` - Ultimate Kit)

##### Boss #85: **Mekanix**
- **Habitat / Elemen**: Pabrik Robot / `thunder` (Raja Guntur)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `spikes`, Mata: `one`, Mulut: `smile`, Ekstra: `none`
- **Warna Primer**: `hsl(39, 35%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ⚡ **Sengatan** (`energy_siphon`)
  2. *Rare*: + 🌩️ **Petir Menyambar** (`charged_strike`)
  3. *Epic*: + 🔌 **Korsleting** (`skill_tax`)
  4. *Legend*: + ⛈️ **Badai Petir** (`phase_rage` - Ultimate Kit)

##### Boss #86: **Pistonk**
- **Habitat / Elemen**: Pabrik Robot / `thunder` (Raja Guntur)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `horns`, Mata: `three`, Mulut: `teeth`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(11, 35%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ⚡ **Sengatan** (`energy_siphon`)
  2. *Rare*: + 🌩️ **Petir Menyambar** (`charged_strike`)
  3. *Epic*: + 🔌 **Korsleting** (`skill_tax`)
  4. *Legend*: + ⛈️ **Badai Petir** (`phase_rage` - Ultimate Kit)

##### Boss #87: **Kabelon**
- **Habitat / Elemen**: Pabrik Robot / `thunder` (Raja Guntur)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `mohawk`, Mata: `three`, Mulut: `teeth`, Ekstra: `none`
- **Warna Primer**: `hsl(18, 35%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ⚡ **Sengatan** (`energy_siphon`)
  2. *Rare*: + 🌩️ **Petir Menyambar** (`charged_strike`)
  3. *Epic*: + 🔌 **Korsleting** (`skill_tax`)
  4. *Legend*: + ⛈️ **Badai Petir** (`phase_rage` - Ultimate Kit)

##### Boss #88: **Turbinor**
- **Habitat / Elemen**: Pabrik Robot / `thunder` (Raja Guntur)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `ears`, Mata: `angry`, Mulut: `fangs`, Ekstra: `arms`
- **Warna Primer**: `hsl(25, 35%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ⚡ **Sengatan** (`energy_siphon`)
  2. *Rare*: + 🌩️ **Petir Menyambar** (`charged_strike`)
  3. *Epic*: + 🔌 **Korsleting** (`skill_tax`)
  4. *Legend*: + ⛈️ **Badai Petir** (`phase_rage` - Ultimate Kit)

##### Boss #89: **Magnetor**
- **Habitat / Elemen**: Pabrik Robot / `thunder` (Raja Guntur)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `none`, Mata: `four`, Mulut: `smile`, Ekstra: `none`
- **Warna Primer**: `hsl(32, 35%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ⚡ **Sengatan** (`energy_siphon`)
  2. *Rare*: + 🌩️ **Petir Menyambar** (`charged_strike`)
  3. *Epic*: + 🔌 **Korsleting** (`skill_tax`)
  4. *Legend*: + ⛈️ **Badai Petir** (`phase_rage` - Ultimate Kit)

##### Boss #90: **Chipzo**
- **Habitat / Elemen**: Pabrik Robot / `thunder` (Raja Guntur)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `antennae`, Mata: `three`, Mulut: `zigzag`, Ekstra: `wings`
- **Warna Primer**: `hsl(39, 35%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: ⚡ **Sengatan** (`energy_siphon`)
  2. *Rare*: + 🌩️ **Petir Menyambar** (`charged_strike`)
  3. *Epic*: + 🔌 **Korsleting** (`skill_tax`)
  4. *Legend*: + ⛈️ **Badai Petir** (`phase_rage` - Ultimate Kit)

#### Habitat Pesta Manis (Elemen: ✨ Cahaya) — 10 Boss

##### Boss #91: **Permenok**
- **Habitat / Elemen**: Pesta Manis / `light` (Penjaga Kristal)
- **Visual Anatomy**: Tubuh: `octopus`, Kepala: `unicorn`, Mata: `four`, Mulut: `fangs`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(331, 75%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 😵‍💫 **Silau** (`time_squeeze`)
  2. *Rare*: + ☀️ **Sinar Penghancur** (`charged_strike`)
  3. *Epic*: + 💎 **Pantulan Kristal** (`combo_seal`)
  4. *Legend*: + 🌅 **Fajar Murka** (`rage_damage` - Ultimate Kit)

##### Boss #92: **Cokelatron**
- **Habitat / Elemen**: Pesta Manis / `light` (Penjaga Kristal)
- **Visual Anatomy**: Tubuh: `spiky`, Kepala: `ears`, Mata: `one`, Mulut: `teeth`, Ekstra: `tail`
- **Warna Primer**: `hsl(338, 75%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 😵‍💫 **Silau** (`time_squeeze`)
  2. *Rare*: + ☀️ **Sinar Penghancur** (`charged_strike`)
  3. *Epic*: + 💎 **Pantulan Kristal** (`combo_seal`)
  4. *Legend*: + 🌅 **Fajar Murka** (`rage_damage` - Ultimate Kit)

##### Boss #93: **Donatzilla**
- **Habitat / Elemen**: Pesta Manis / `light` (Penjaga Kristal)
- **Visual Anatomy**: Tubuh: `square`, Kepala: `mohawk`, Mata: `sleepy`, Mulut: `teeth`, Ekstra: `arms`
- **Warna Primer**: `hsl(345, 75%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 😵‍💫 **Silau** (`time_squeeze`)
  2. *Rare*: + ☀️ **Sinar Penghancur** (`charged_strike`)
  3. *Epic*: + 💎 **Pantulan Kristal** (`combo_seal`)
  4. *Legend*: + 🌅 **Fajar Murka** (`rage_damage` - Ultimate Kit)

##### Boss #94: **Krimor**
- **Habitat / Elemen**: Pesta Manis / `light` (Penjaga Kristal)
- **Visual Anatomy**: Tubuh: `blob`, Kepala: `none`, Mata: `two`, Mulut: `open`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(352, 75%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 😵‍💫 **Silau** (`time_squeeze`)
  2. *Rare*: + ☀️ **Sinar Penghancur** (`charged_strike`)
  3. *Epic*: + 💎 **Pantulan Kristal** (`combo_seal`)
  4. *Legend*: + 🌅 **Fajar Murka** (`rage_damage` - Ultimate Kit)

##### Boss #95: **Kukuriz**
- **Habitat / Elemen**: Pesta Manis / `light` (Penjaga Kristal)
- **Visual Anatomy**: Tubuh: `slime`, Kepala: `spikes`, Mata: `one`, Mulut: `fangs`, Ekstra: `arms`
- **Warna Primer**: `hsl(359, 75%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 😵‍💫 **Silau** (`time_squeeze`)
  2. *Rare*: + ☀️ **Sinar Penghancur** (`charged_strike`)
  3. *Epic*: + 💎 **Pantulan Kristal** (`combo_seal`)
  4. *Legend*: + 🌅 **Fajar Murka** (`rage_damage` - Ultimate Kit)

##### Boss #96: **Lolipopo**
- **Habitat / Elemen**: Pesta Manis / `light` (Penjaga Kristal)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `antennae`, Mata: `sleepy`, Mulut: `zigzag`, Ekstra: `wings`
- **Warna Primer**: `hsl(331, 75%, 48%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 😵‍💫 **Silau** (`time_squeeze`)
  2. *Rare*: + ☀️ **Sinar Penghancur** (`charged_strike`)
  3. *Epic*: + 💎 **Pantulan Kristal** (`combo_seal`)
  4. *Legend*: + 🌅 **Fajar Murka** (`rage_damage` - Ultimate Kit)

##### Boss #97: **Puddingar**
- **Habitat / Elemen**: Pesta Manis / `light` (Penjaga Kristal)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `none`, Mata: `one`, Mulut: `tongue`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(338, 75%, 56%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 😵‍💫 **Silau** (`time_squeeze`)
  2. *Rare*: + ☀️ **Sinar Penghancur** (`charged_strike`)
  3. *Epic*: + 💎 **Pantulan Kristal** (`combo_seal`)
  4. *Legend*: + 🌅 **Fajar Murka** (`rage_damage` - Ultimate Kit)

##### Boss #98: **Jellybon**
- **Habitat / Elemen**: Pesta Manis / `light` (Penjaga Kristal)
- **Visual Anatomy**: Tubuh: `ghost`, Kepala: `horns`, Mata: `sleepy`, Mulut: `smile`, Ekstra: `arms`
- **Warna Primer**: `hsl(345, 75%, 64%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 😵‍💫 **Silau** (`time_squeeze`)
  2. *Rare*: + ☀️ **Sinar Penghancur** (`charged_strike`)
  3. *Epic*: + 💎 **Pantulan Kristal** (`combo_seal`)
  4. *Legend*: + 🌅 **Fajar Murka** (`rage_damage` - Ultimate Kit)

##### Boss #99: **Wafelor**
- **Habitat / Elemen**: Pesta Manis / `light` (Penjaga Kristal)
- **Visual Anatomy**: Tubuh: `egg`, Kepala: `mohawk`, Mata: `sleepy`, Mulut: `open`, Ekstra: `none`
- **Warna Primer**: `hsl(352, 75%, 52%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 😵‍💫 **Silau** (`time_squeeze`)
  2. *Rare*: + ☀️ **Sinar Penghancur** (`charged_strike`)
  3. *Epic*: + 💎 **Pantulan Kristal** (`combo_seal`)
  4. *Legend*: + 🌅 **Fajar Murka** (`rage_damage` - Ultimate Kit)

##### Boss #100: **Gulalon**
- **Habitat / Elemen**: Pesta Manis / `light` (Penjaga Kristal)
- **Visual Anatomy**: Tubuh: `round`, Kepala: `horns`, Mata: `angry`, Mulut: `teeth`, Ekstra: `cheeks`
- **Warna Primer**: `hsl(359, 75%, 60%)`
- **Jurus Tersedia Menurut Tier**:
  1. *Common*: 😵‍💫 **Silau** (`time_squeeze`)
  2. *Rare*: + ☀️ **Sinar Penghancur** (`charged_strike`)
  3. *Epic*: + 💎 **Pantulan Kristal** (`combo_seal`)
  4. *Legend*: + 🌅 **Fajar Murka** (`rage_damage` - Ultimate Kit)

---
*Dokumen diekspor secara otomatis dari codebase game https://play.printshare.my.id/ pada 2026-11-07T02:25:23.346Z.*
