# Desain & Kode Lengkap SVG Skin Avatar dan 100 Boss Monster (BAB 2 & BAB 3) — Petualangan Pelajar (play.printshare.my.id)

> **Spesifikasi Teknis (BAB 2 & BAB 3):** Dokumen ini memuat seluruh kode visual SVG komponen skin avatar pemain (hat, outfit, weapon, frame, bg, pet, serta 5 set sinergi lengkap) dan pustaka geometri SVG serta kode SVG utuh untuk seluruh 100 monster boss dalam game.
> 
> - **URL Game**: https://play.printshare.my.id/
> - **Runtime & Engine**: Node.js v22.23.1 · SQLite (node:sqlite) · UMD SVG Renderers
> - **Total Boss**: 100 Boss Monster (10 Elemen x 10 Boss)
> - **Total Item Skin**: 43 Item Avatar (8 Hat, 6 Outfit, 5 Weapon, 6 Frame, 6 BG, 6 Pet, 6 Title)
> - **Versi Arsitektur**: v7.2 (Terbaru per November 2026)

---

## DAFTAR ISI
1. [BAB 2: Desain & Kode SVG Komponen Skin Avatar](#bab-2-desain--kode-svg-komponen-skin-avatar)
   - [2.1 Arsitektur Renderer SVG Avatar (shared/avatar.js)](#21-arsitektur-renderer-svg-avatar)
   - [2.2 Kode SVG Seluruh Topi (HAT - 8 Item)](#22-kode-svg-seluruh-topi-hat)
   - [2.3 Kode SVG Seluruh Pakaian (OUTFIT - 6 Item)](#23-kode-svg-seluruh-pakaian-outfit)
   - [2.4 Kode SVG Seluruh Senjata / Aksesori Tangan (WEAPON - 5 Item)](#24-kode-svg-seluruh-senjata-weapon)
   - [2.5 Kode SVG Seluruh Bingkai Avatar (FRAME - 6 Item)](#25-kode-svg-seluruh-bingkai-frame)
   - [2.6 Kode SVG Gradien Latar Belakang (BG - 6 Item)](#26-kode-svg-gradien-latar-belakang-bg)
   - [2.7 Spesifikasi Hewan Peliharaan Twemoji (PET - 6 Item)](#27-spesifikasi-hewan-peliharaan-pet)
   - [2.8 Kode SVG Utuh 5 Set Skin Sinergi Lengkap](#28-kode-svg-utuh-5-set-skin-sinergi-lengkap)
2. [BAB 3: Desain & Kode SVG 100 Monster Boss](#bab-3-desain--kode-svg-100-monster-boss)
   - [3.1 Generator Prosedural Vektor SVG Monster (shared/monsters.js)](#31-generator-prosedural-vektor-svg-monster)
   - [3.2 Pustaka Bentuk Geometri SVG Monster](#32-pustaka-bentuk-geometri-svg-monster)
   - [3.3 Lapisan Aura & Mahkota Rarity (Rare, Epic, Legend)](#33-lapisan-aura--mahkota-rarity)
   - [3.4 Kode SVG Lengkap 10 Boss Representatif per Habitat](#34-kode-svg-lengkap-10-boss-representatif-per-habitat)
   - [3.5 Katalog dan Kode SVG Utuh 100 Boss Monster (ID 1 s/d 100)](#35-katalog-dan-kode-svg-utuh-100-boss-monster)

---

## BAB 2: Desain & Kode SVG Komponen Skin Avatar

Sistem kustomisasi karakter dibangun di `shared/avatar.js`. Semua aset berformat SVG murni tanpa dependensi bitmap eksternal.

### 2.1 Arsitektur Renderer SVG Avatar
Renderer utama `renderAvatar(a)` menyusun elemen dalam tumpukan layer Z-index:
1. `BG[a.bg]`: Gradien Latar Belakang Kotak (`viewBox="0 0 200 200"`).
2. `OUTFIT_BACK[a.outfit]`: Jubah atau sayap belakang badan.
3. Bayangan tubuh: Ellipse hitam transparan pada kaki.
4. Torso & Tubuh Dasar: Warna kulit `SKINS[i]`.
5. `OUTFIT[a.outfit]`: Baju, zirah, atau jubah depan.
6. Kepala & Telinga: Lingkaran wajah & rambut (`HAIRS[i]`).
7. Mata, Mulut, Rona Pipi: Ekspresi muka.
8. `HAT[a.hat]`: Topi atau hiasan kepala.
9. `WEAPON[a.weapon]`: Senjata atau aksesori tangan kanan.
10. `PET[a.pet]`: Hewan pendamping di sudut kiri bawah.
11. `FRAME[a.frame]`: Bingkai terluar avatar.

---

### 2.2 Kode SVG Seluruh Topi (HAT)

#### 🎩 Topi Penjelajah (`hat_explorer`)
- **Slot**: `hat` · **Rarity**: `COMMON`
- **Spesifikasi SVG Vektor**:
```xml
<ellipse cx="100" cy="66" rx="48" ry="11" fill="#D9A55B" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M68 66Q70 34 100 34Q130 34 132 66Z" fill="#E8B86A" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><rect x="70" y="54" width="60" height="9" fill="#8B5A2B"/><path d="M68 66Q70 34 100 34Q130 34 132 66" fill="none" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

#### 🎩 Headphone Keren (`hat_headphones`)
- **Slot**: `hat` · **Rarity**: `COMMON`
- **Spesifikasi SVG Vektor**:
```xml
<path d="M64 84Q64 40 100 40Q136 40 136 84" fill="none" stroke="#2B1B3D" stroke-width="9" stroke-linecap="round"/><rect x="54" y="78" width="16" height="28" rx="8" fill="#FF8A3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><rect x="130" y="78" width="16" height="28" rx="8" fill="#FF8A3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

#### 🎩 Topi Koki (`hat_chef`)
- **Slot**: `hat` · **Rarity**: `COMMON`
- **Spesifikasi SVG Vektor**:
```xml
<rect x="72" y="52" width="56" height="16" fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><g fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><circle cx="82" cy="46" r="14"/><circle cx="100" cy="38" r="16"/><circle cx="118" cy="46" r="14"/></g><rect x="72" y="52" width="56" height="16" fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

#### 🎩 Topi Bajak Laut (`hat_pirate`)
- **Slot**: `hat` · **Rarity**: `RARE`
- **Spesifikasi SVG Vektor**:
```xml
<path d="M56 68Q100 20 144 68Q100 58 56 68Z" fill="#2B1B3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="50" r="6" fill="#fff"/><path d="M96 56l8 0M100 52v8" stroke="#2B1B3D" stroke-width="2"/>
```

#### 🎩 Helm Ksatria (`hat_knight`)
- **Slot**: `hat` · **Rarity**: `RARE`
- **Spesifikasi SVG Vektor**:
```xml
<path d="M64 84V62Q64 34 100 34Q136 34 136 62V84H120V70H80V84Z" fill="#AEB8C6" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 34V14" stroke="#E5484D" stroke-width="8" stroke-linecap="round"/><path d="M80 70h40" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

#### 🎩 Telinga Kelinci (`hat_bunny`)
- **Slot**: `hat` · **Rarity**: `RARE`
- **Spesifikasi SVG Vektor**:
```xml
<g fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="82" cy="30" rx="10" ry="28"/><ellipse cx="118" cy="30" rx="10" ry="28"/></g><g fill="#FFB3C6"><ellipse cx="82" cy="32" rx="4.5" ry="19"/><ellipse cx="118" cy="32" rx="4.5" ry="19"/></g>
```

#### 🎩 Topi Penyihir (`hat_wizard`)
- **Slot**: `hat` · **Rarity**: `EPIC`
- **Spesifikasi SVG Vektor**:
```xml
<path d="M62 68L100 6L138 68Z" fill="#7C4DFF" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="100" cy="68" rx="46" ry="9" fill="#5B34C7" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M98 30l3 6 6 1-5 4 2 6-6-4-6 4 2-6-5-4 6-1z" fill="#FFD34D"/>
```

#### 🎩 Mahkota Emas (`hat_crown`)
- **Slot**: `hat` · **Rarity**: `LEGENDARY`
- **Spesifikasi SVG Vektor**:
```xml
<path d="M68 66L70 34L86 52L100 28L114 52L130 34L132 66Z" fill="#FFD34D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="52" r="4" fill="#E5484D"/>
```

---

### 2.3 Kode SVG Seluruh Pakaian (OUTFIT)

#### 👕 Rompi Rimba (`outfit_vest`)
- **Slot**: `outfit` · **Rarity**: `COMMON`
- **Spesifikasi SVG Vektor (Depan & Belakang)**:
```xml
<path d="M70 126h60v50H70z" fill="#5BCB5B" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 126v50" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="92" cy="146" r="3" fill="#2B1B3D"/><circle cx="92" cy="162" r="3" fill="#2B1B3D"/>
```

#### 👕 Kaos Belang (`outfit_stripes`)
- **Slot**: `outfit` · **Rarity**: `COMMON`
- **Spesifikasi SVG Vektor (Depan & Belakang)**:
```xml
<rect x="70" y="126" width="60" height="50" rx="14" fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><g stroke="#3A7BD5" stroke-width="7"><path d="M72 140h56M72 156h56M74 170h52"/></g><rect x="70" y="126" width="60" height="50" rx="14" fill="none" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

#### 👕 Jas Ilmuwan (`outfit_labcoat`)
- **Slot**: `outfit` · **Rarity**: `COMMON`
- **Spesifikasi SVG Vektor (Depan & Belakang)**:
```xml
<path d="M68 126h64v54H68z" fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 126v54M88 126l12 14 12-14" fill="none" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><rect x="108" y="150" width="14" height="12" fill="#CFE9FF" stroke="#2B1B3D" stroke-width="3"/>
```

#### 👕 Jubah Pahlawan (`outfit_cape`)
- **Slot**: `outfit` · **Rarity**: `RARE`
- **Spesifikasi SVG Vektor (Depan & Belakang)**:
```xml
<rect x="70" y="126" width="60" height="50" rx="14" fill="#FFC83D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M72 128Q100 146 128 128" fill="#E5484D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="140" r="5" fill="#fff" stroke="#2B1B3D" stroke-width="3"/>
```

#### 👕 Zirah Baja (`outfit_armor`)
- **Slot**: `outfit` · **Rarity**: `EPIC`
- **Spesifikasi SVG Vektor (Depan & Belakang)**:
```xml
<path d="M68 126h64v52H68z" fill="#AEB8C6" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M76 138h48M76 152h48M76 166h48" stroke="#2B1B3D" stroke-width="3" fill="none"/><circle cx="64" cy="130" r="12" fill="#C9D2DE" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="136" cy="130" r="12" fill="#C9D2DE" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

#### 👕 Jubah Bintang (`outfit_robe`)
- **Slot**: `outfit` · **Rarity**: `EPIC`
- **Spesifikasi SVG Vektor (Depan & Belakang)**:
```xml
<path d="M66 126h68l8 56H58z" fill="#7C4DFF" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 126v56" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><g fill="#FFD34D"><path d="M82 146l3 6 6 1-5 4 2 6-6-4-6 4 2-6-5-4 6-1z"/><path d="M122 164l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/></g>
```

---

### 2.4 Kode SVG Seluruh Senjata (WEAPON)

#### ⚔️ Pedang Perak (`weapon_sword`)
- **Slot**: `weapon` · **Rarity**: `RARE`
- **Spesifikasi SVG Vektor**:
```xml
<path d="M150 150L170 90" stroke="#C9D2DE" stroke-width="9" stroke-linecap="round"/><path d="M150 150L170 90" stroke="#2B1B3D" stroke-width="3" stroke-linecap="round" opacity=".5"/><path d="M142 146l18 8" stroke="#8B5A2B" stroke-width="8" stroke-linecap="round"/>
```

#### ⚔️ Tongkat Bintang (`weapon_wand`)
- **Slot**: `weapon` · **Rarity**: `EPIC`
- **Spesifikasi SVG Vektor**:
```xml
<path d="M148 160L172 104" stroke="#8B5A2B" stroke-width="7" stroke-linecap="round"/><path d="M172 90l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#FFD34D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
```

#### ⚔️ Perisai Biru (`weapon_shield`)
- **Slot**: `weapon` · **Rarity**: `RARE`
- **Spesifikasi SVG Vektor**:
```xml
<path d="M138 128h40v30Q158 182 138 158Z" fill="#3A7BD5" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M158 132v40" stroke="#fff" stroke-width="5"/>
```

#### ⚔️ Buku Ajaib (`weapon_book`)
- **Slot**: `weapon` · **Rarity**: `COMMON`
- **Spesifikasi SVG Vektor**:
```xml
<rect x="140" y="132" width="36" height="28" rx="4" fill="#E5484D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M158 132v28" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M146 142h8M162 142h8" stroke="#fff" stroke-width="3"/>
```

#### ⚔️ Teropong Bintang (`weapon_telescope`)
- **Slot**: `weapon` · **Rarity**: `COMMON`
- **Spesifikasi SVG Vektor**:
```xml
<path d="M140 156L176 120" stroke="#8B5A2B" stroke-width="12" stroke-linecap="round"/><path d="M168 128L180 116" stroke="#FFC83D" stroke-width="14" stroke-linecap="round"/>
```

---

### 2.5 Kode SVG Seluruh Bingkai (FRAME)

#### 🖼️ Bingkai Kayu (`frame_wood`)
- **Slot**: `frame` · **Rarity**: `COMMON`
- **Spesifikasi SVG Vektor**:
```xml
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#8B5A2B" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#D9A55B" stroke-width="3"/><circle cx="14" cy="14" r="5" fill="#5C381E"/><circle cx="186" cy="14" r="5" fill="#5C381E"/><circle cx="14" cy="186" r="5" fill="#5C381E"/><circle cx="186" cy="186" r="5" fill="#5C381E"/>
```

#### 🖼️ Bingkai Daun Rimbun (`frame_leaf`)
- **Slot**: `frame` · **Rarity**: `COMMON`
- **Spesifikasi SVG Vektor**:
```xml
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#2D8A4E" stroke-width="8"/><path d="M10 20Q20 10 30 20Q20 30 10 20Z" fill="#48C774"/><path d="M170 20Q180 10 190 20Q180 30 170 20Z" fill="#48C774"/><path d="M10 180Q20 170 30 180Q20 190 10 180Z" fill="#48C774"/><path d="M170 180Q180 170 190 180Q180 190 170 180Z" fill="#48C774"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#A3E635" stroke-width="2"/>
```

#### 🖼️ Bingkai Perak Bersinar (`frame_silver`)
- **Slot**: `frame` · **Rarity**: `RARE`
- **Spesifikasi SVG Vektor**:
```xml
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#94A3B8" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#F1F5F9" stroke-width="3"/><polygon points="4,24 24,4 4,4" fill="#CBD5E1"/><polygon points="196,24 176,4 196,4" fill="#CBD5E1"/><polygon points="4,176 24,196 4,196" fill="#CBD5E1"/><polygon points="196,176 176,196 196,196" fill="#CBD5E1"/>
```

#### 🖼️ Bingkai Api Berkobar (`frame_flame`)
- **Slot**: `frame` · **Rarity**: `RARE`
- **Spesifikasi SVG Vektor**:
```xml
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#EF4444" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#F59E0B" stroke-width="3"/><path d="M10 30Q16 14 26 22Q30 6 38 18" stroke="#FBBF24" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M190 30Q184 14 174 22Q170 6 162 18" stroke="#FBBF24" stroke-width="4" fill="none" stroke-linecap="round"/>
```

#### 🖼️ Bingkai Emas Kerajaan (`frame_gold`)
- **Slot**: `frame` · **Rarity**: `EPIC`
- **Spesifikasi SVG Vektor**:
```xml
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#D97706" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#FDE047" stroke-width="3"/><circle cx="100" cy="10" r="6" fill="#EF4444" stroke="#78350F" stroke-width="2"/><circle cx="10" cy="100" r="6" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/><circle cx="190" cy="100" r="6" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/><circle cx="100" cy="190" r="6" fill="#10B981" stroke="#064E3B" stroke-width="2"/>
```

#### 🖼️ Bingkai Pelangi Ajaib (`frame_rainbow`)
- **Slot**: `frame` · **Rarity**: `LEGENDARY`
- **Spesifikasi SVG Vektor**:
```xml
<defs><linearGradient id="rbw" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF4B72"/><stop offset="25%" stop-color="#FFB347"/><stop offset="50%" stop-color="#70E000"/><stop offset="75%" stop-color="#00C4FF"/><stop offset="100%" stop-color="#9D4EDD"/></linearGradient></defs><rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#rbw)" stroke-width="10"/><rect x="10" y="10" width="180" height="180" rx="20" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".8"/>
```

---

### 2.6 Kode SVG Gradien Latar Belakang (BG)

#### 🌄 Padang Rumput (`bg_meadow`)
- **Slot**: `bg` · **Warna Gradien**: `#B9EBFF` ke `#7BD65B`
- **Spesifikasi SVG Gradient Def**:
```xml
<linearGradient id="bg_meadow" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#B9EBFF"/>
  <stop offset="100%" stop-color="#7BD65B"/>
</linearGradient>
```

#### 🌄 Langit Cerah (`bg_sky`)
- **Slot**: `bg` · **Warna Gradien**: `#9BE0FF` ke `#E6F8FF`
- **Spesifikasi SVG Gradient Def**:
```xml
<linearGradient id="bg_sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#9BE0FF"/>
  <stop offset="100%" stop-color="#E6F8FF"/>
</linearGradient>
```

#### 🌄 Senja Hangat (`bg_sunset`)
- **Slot**: `bg` · **Warna Gradien**: `#FFD27A` ke `#FF7A8A`
- **Spesifikasi SVG Gradient Def**:
```xml
<linearGradient id="bg_sunset" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#FFD27A"/>
  <stop offset="100%" stop-color="#FF7A8A"/>
</linearGradient>
```

#### 🌄 Negeri Permen (`bg_candy`)
- **Slot**: `bg` · **Warna Gradien**: `#FFC3E1` ke `#FFA0C8`
- **Spesifikasi SVG Gradient Def**:
```xml
<linearGradient id="bg_candy" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#FFC3E1"/>
  <stop offset="100%" stop-color="#FFA0C8"/>
</linearGradient>
```

#### 🌄 Gua Misterius (`bg_cave`)
- **Slot**: `bg` · **Warna Gradien**: `#6B5B95` ke `#2D2250`
- **Spesifikasi SVG Gradient Def**:
```xml
<linearGradient id="bg_cave" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#6B5B95"/>
  <stop offset="100%" stop-color="#2D2250"/>
</linearGradient>
```

#### 🌄 Malam Berbintang (`bg_night`)
- **Slot**: `bg` · **Warna Gradien**: `#4A3A8F` ke `#1B1340`
- **Spesifikasi SVG Gradient Def**:
```xml
<linearGradient id="bg_night" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#4A3A8F"/>
  <stop offset="100%" stop-color="#1B1340"/>
</linearGradient>
```

---

### 2.7 Spesifikasi Hewan Peliharaan (PET)

Hewan peliharaan dirender di sudut kiri bawah (`x="8" y="136" width="48" height="48"`) menggunakan pustaka Twemoji SVG resmi:

| ID Pet | Nama Pet | Unicode Hex | URL Aset Twemoji |
|---|---|---|---|
| `pet_cat` | **Kucing Oren** | `1f431` | `https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f431.svg` |
| `pet_dog` | **Anjing Ceria** | `1f436` | `https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f436.svg` |
| `pet_penguin` | **Pinguin Lucu** | `1f427` | `https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f427.svg` |
| `pet_fox` | **Rubah Cerdik** | `1f98a` | `https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f98a.svg` |
| `pet_owl` | **Burung Hantu Bijak** | `1f989` | `https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f989.svg` |
| `pet_dragon` | **Naga Mungil** | `1f432` | `https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f432.svg` |

---

### 2.8 Kode SVG Utuh 5 Set Skin Sinergi Lengkap

Berikut adalah kode SVG utuh siap render dari penggabungan 5 set skin sinergi legendaris:

#### ✨ Set Penjelajah Rimba (Starter Explorer)
- **Konfigurasi**: `{"hat":"hat_explorer","outfit":"outfit_vest","weapon":"weapon_telescope","frame":"frame_wood","bg":"bg_meadow","pet":"pet_cat"}`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Avatar">
<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9EBFF"/><stop offset="1" stop-color="#7BD65B"/></linearGradient>
<clipPath id="bgc"><rect width="200" height="200" rx="28"/></clipPath></defs>
<g clip-path="url(#bgc)"><rect width="200" height="200" fill="url(#bgg)"/>

<ellipse cx="100" cy="190" rx="46" ry="7" fill="#000" opacity=".15"/>
<rect x="70" y="126" width="60" height="50" rx="14" fill="#FF8A3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M70 126h60v50H70z" fill="#5BCB5B" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 126v50" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="92" cy="146" r="3" fill="#2B1B3D"/><circle cx="92" cy="162" r="3" fill="#2B1B3D"/>
<ellipse cx="62" cy="144" rx="9" ry="16" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="138" cy="144" rx="9" ry="16" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="90" r="36" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M64 84Q66 52 100 52Q134 52 136 84Q120 66 100 70Q80 66 64 84Z" fill="#6B3F1D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#2B1B3D"><circle cx="86" cy="94" r="4.5"/><circle cx="114" cy="94" r="4.5"/></g>
<g fill="#fff"><circle cx="87.5" cy="92.5" r="1.5"/><circle cx="115.5" cy="92.5" r="1.5"/></g>
<path d="M90 106Q100 116 110 106" stroke="#2B1B3D" stroke-width="4" fill="none" stroke-linecap="round"/>
<g fill="#FF8FA3" opacity=".6"><circle cx="76" cy="104" r="6"/><circle cx="124" cy="104" r="6"/></g>
<ellipse cx="100" cy="66" rx="48" ry="11" fill="#D9A55B" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M68 66Q70 34 100 34Q130 34 132 66Z" fill="#E8B86A" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><rect x="70" y="54" width="60" height="9" fill="#8B5A2B"/><path d="M68 66Q70 34 100 34Q130 34 132 66" fill="none" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M140 156L176 120" stroke="#8B5A2B" stroke-width="12" stroke-linecap="round"/><path d="M168 128L180 116" stroke="#FFC83D" stroke-width="14" stroke-linecap="round"/><image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f431.svg" x="8" y="136" width="48" height="48"/></g>
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#8B5A2B" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#D9A55B" stroke-width="3"/><circle cx="14" cy="14" r="5" fill="#5C381E"/><circle cx="186" cy="14" r="5" fill="#5C381E"/><circle cx="14" cy="186" r="5" fill="#5C381E"/><circle cx="186" cy="186" r="5" fill="#5C381E"/></svg>
```

#### ✨ Set Benteng Ksatria Baja (Iron Knight)
- **Konfigurasi**: `{"hat":"hat_knight","outfit":"outfit_armor","weapon":"weapon_sword","frame":"frame_silver","bg":"bg_sky","pet":"pet_dog"}`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Avatar">
<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9BE0FF"/><stop offset="1" stop-color="#E6F8FF"/></linearGradient>
<clipPath id="bgc"><rect width="200" height="200" rx="28"/></clipPath></defs>
<g clip-path="url(#bgc)"><rect width="200" height="200" fill="url(#bgg)"/>

<ellipse cx="100" cy="190" rx="46" ry="7" fill="#000" opacity=".15"/>
<rect x="70" y="126" width="60" height="50" rx="14" fill="#FF8A3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M68 126h64v52H68z" fill="#AEB8C6" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M76 138h48M76 152h48M76 166h48" stroke="#2B1B3D" stroke-width="3" fill="none"/><circle cx="64" cy="130" r="12" fill="#C9D2DE" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="136" cy="130" r="12" fill="#C9D2DE" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="62" cy="144" rx="9" ry="16" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="138" cy="144" rx="9" ry="16" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="90" r="36" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M64 84Q66 52 100 52Q134 52 136 84Q120 66 100 70Q80 66 64 84Z" fill="#6B3F1D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#2B1B3D"><circle cx="86" cy="94" r="4.5"/><circle cx="114" cy="94" r="4.5"/></g>
<g fill="#fff"><circle cx="87.5" cy="92.5" r="1.5"/><circle cx="115.5" cy="92.5" r="1.5"/></g>
<path d="M90 106Q100 116 110 106" stroke="#2B1B3D" stroke-width="4" fill="none" stroke-linecap="round"/>
<g fill="#FF8FA3" opacity=".6"><circle cx="76" cy="104" r="6"/><circle cx="124" cy="104" r="6"/></g>
<path d="M64 84V62Q64 34 100 34Q136 34 136 62V84H120V70H80V84Z" fill="#AEB8C6" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 34V14" stroke="#E5484D" stroke-width="8" stroke-linecap="round"/><path d="M80 70h40" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M150 150L170 90" stroke="#C9D2DE" stroke-width="9" stroke-linecap="round"/><path d="M150 150L170 90" stroke="#2B1B3D" stroke-width="3" stroke-linecap="round" opacity=".5"/><path d="M142 146l18 8" stroke="#8B5A2B" stroke-width="8" stroke-linecap="round"/><image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f436.svg" x="8" y="136" width="48" height="48"/></g>
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#94A3B8" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#F1F5F9" stroke-width="3"/><polygon points="4,24 24,4 4,4" fill="#CBD5E1"/><polygon points="196,24 176,4 196,4" fill="#CBD5E1"/><polygon points="4,176 24,196 4,196" fill="#CBD5E1"/><polygon points="196,176 176,196 196,196" fill="#CBD5E1"/></svg>
```

#### ✨ Set Arkana Bintang Kosmik (Star Wizard)
- **Konfigurasi**: `{"hat":"hat_wizard","outfit":"outfit_robe","weapon":"weapon_wand","frame":"frame_rainbow","bg":"bg_night","pet":"pet_owl"}`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Avatar">
<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A3A8F"/><stop offset="1" stop-color="#1B1340"/></linearGradient>
<clipPath id="bgc"><rect width="200" height="200" rx="28"/></clipPath></defs>
<g clip-path="url(#bgc)"><rect width="200" height="200" fill="url(#bgg)"/>

<ellipse cx="100" cy="190" rx="46" ry="7" fill="#000" opacity=".15"/>
<rect x="70" y="126" width="60" height="50" rx="14" fill="#FF8A3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M66 126h68l8 56H58z" fill="#7C4DFF" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M100 126v56" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><g fill="#FFD34D"><path d="M82 146l3 6 6 1-5 4 2 6-6-4-6 4 2-6-5-4 6-1z"/><path d="M122 164l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/></g>
<ellipse cx="62" cy="144" rx="9" ry="16" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="138" cy="144" rx="9" ry="16" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="90" r="36" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M64 84Q66 52 100 52Q134 52 136 84Q120 66 100 70Q80 66 64 84Z" fill="#6B3F1D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#2B1B3D"><circle cx="86" cy="94" r="4.5"/><circle cx="114" cy="94" r="4.5"/></g>
<g fill="#fff"><circle cx="87.5" cy="92.5" r="1.5"/><circle cx="115.5" cy="92.5" r="1.5"/></g>
<path d="M90 106Q100 116 110 106" stroke="#2B1B3D" stroke-width="4" fill="none" stroke-linecap="round"/>
<g fill="#FF8FA3" opacity=".6"><circle cx="76" cy="104" r="6"/><circle cx="124" cy="104" r="6"/></g>
<path d="M62 68L100 6L138 68Z" fill="#7C4DFF" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="100" cy="68" rx="46" ry="9" fill="#5B34C7" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M98 30l3 6 6 1-5 4 2 6-6-4-6 4 2-6-5-4 6-1z" fill="#FFD34D"/><path d="M148 160L172 104" stroke="#8B5A2B" stroke-width="7" stroke-linecap="round"/><path d="M172 90l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#FFD34D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f989.svg" x="8" y="136" width="48" height="48"/></g>
<defs><linearGradient id="rbw" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF4B72"/><stop offset="25%" stop-color="#FFB347"/><stop offset="50%" stop-color="#70E000"/><stop offset="75%" stop-color="#00C4FF"/><stop offset="100%" stop-color="#9D4EDD"/></linearGradient></defs><rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#rbw)" stroke-width="10"/><rect x="10" y="10" width="180" height="180" rx="20" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".8"/></svg>
```

#### ✨ Set Bajak Laut Samudra (Sea Pirate)
- **Konfigurasi**: `{"hat":"hat_pirate","outfit":"outfit_stripes","weapon":"weapon_sword","frame":"frame_gold","bg":"bg_sunset","pet":"pet_fox"}`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Avatar">
<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD27A"/><stop offset="1" stop-color="#FF7A8A"/></linearGradient>
<clipPath id="bgc"><rect width="200" height="200" rx="28"/></clipPath></defs>
<g clip-path="url(#bgc)"><rect width="200" height="200" fill="url(#bgg)"/>

<ellipse cx="100" cy="190" rx="46" ry="7" fill="#000" opacity=".15"/>
<rect x="70" y="126" width="60" height="50" rx="14" fill="#FF8A3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="70" y="126" width="60" height="50" rx="14" fill="#fff" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><g stroke="#3A7BD5" stroke-width="7"><path d="M72 140h56M72 156h56M74 170h52"/></g><rect x="70" y="126" width="60" height="50" rx="14" fill="none" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="62" cy="144" rx="9" ry="16" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="138" cy="144" rx="9" ry="16" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="90" r="36" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M64 84Q66 52 100 52Q134 52 136 84Q120 66 100 70Q80 66 64 84Z" fill="#6B3F1D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#2B1B3D"><circle cx="86" cy="94" r="4.5"/><circle cx="114" cy="94" r="4.5"/></g>
<g fill="#fff"><circle cx="87.5" cy="92.5" r="1.5"/><circle cx="115.5" cy="92.5" r="1.5"/></g>
<path d="M90 106Q100 116 110 106" stroke="#2B1B3D" stroke-width="4" fill="none" stroke-linecap="round"/>
<g fill="#FF8FA3" opacity=".6"><circle cx="76" cy="104" r="6"/><circle cx="124" cy="104" r="6"/></g>
<path d="M56 68Q100 20 144 68Q100 58 56 68Z" fill="#2B1B3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="50" r="6" fill="#fff"/><path d="M96 56l8 0M100 52v8" stroke="#2B1B3D" stroke-width="2"/><path d="M150 150L170 90" stroke="#C9D2DE" stroke-width="9" stroke-linecap="round"/><path d="M150 150L170 90" stroke="#2B1B3D" stroke-width="3" stroke-linecap="round" opacity=".5"/><path d="M142 146l18 8" stroke="#8B5A2B" stroke-width="8" stroke-linecap="round"/><image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f98a.svg" x="8" y="136" width="48" height="48"/></g>
<rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="#D97706" stroke-width="8"/><rect x="8" y="8" width="184" height="184" rx="22" fill="none" stroke="#FDE047" stroke-width="3"/><circle cx="100" cy="10" r="6" fill="#EF4444" stroke="#78350F" stroke-width="2"/><circle cx="10" cy="100" r="6" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/><circle cx="190" cy="100" r="6" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/><circle cx="100" cy="190" r="6" fill="#10B981" stroke="#064E3B" stroke-width="2"/></svg>
```

#### ✨ Set Kaisar Legendaris (Imperial Monarch)
- **Konfigurasi**: `{"hat":"hat_crown","outfit":"outfit_cape","weapon":"weapon_wand","frame":"frame_rainbow","bg":"bg_candy","pet":"pet_dragon"}`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Avatar">
<defs><linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC3E1"/><stop offset="1" stop-color="#FFA0C8"/></linearGradient>
<clipPath id="bgc"><rect width="200" height="200" rx="28"/></clipPath></defs>
<g clip-path="url(#bgc)"><rect width="200" height="200" fill="url(#bgg)"/>
<path d="M64 124Q40 170 56 188H144Q160 170 136 124Z" fill="#E5484D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="190" rx="46" ry="7" fill="#000" opacity=".15"/>
<rect x="70" y="126" width="60" height="50" rx="14" fill="#FF8A3D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="70" y="126" width="60" height="50" rx="14" fill="#FFC83D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M72 128Q100 146 128 128" fill="#E5484D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="140" r="5" fill="#fff" stroke="#2B1B3D" stroke-width="3"/>
<ellipse cx="62" cy="144" rx="9" ry="16" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="138" cy="144" rx="9" ry="16" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="90" r="36" fill="#FFDDB8" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M64 84Q66 52 100 52Q134 52 136 84Q120 66 100 70Q80 66 64 84Z" fill="#6B3F1D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#2B1B3D"><circle cx="86" cy="94" r="4.5"/><circle cx="114" cy="94" r="4.5"/></g>
<g fill="#fff"><circle cx="87.5" cy="92.5" r="1.5"/><circle cx="115.5" cy="92.5" r="1.5"/></g>
<path d="M90 106Q100 116 110 106" stroke="#2B1B3D" stroke-width="4" fill="none" stroke-linecap="round"/>
<g fill="#FF8FA3" opacity=".6"><circle cx="76" cy="104" r="6"/><circle cx="124" cy="104" r="6"/></g>
<path d="M68 66L70 34L86 52L100 28L114 52L130 34L132 66Z" fill="#FFD34D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="100" cy="52" r="4" fill="#E5484D"/><path d="M148 160L172 104" stroke="#8B5A2B" stroke-width="7" stroke-linecap="round"/><path d="M172 90l4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1z" fill="#FFD34D" stroke="#2B1B3D" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f432.svg" x="8" y="136" width="48" height="48"/></g>
<defs><linearGradient id="rbw" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FF4B72"/><stop offset="25%" stop-color="#FFB347"/><stop offset="50%" stop-color="#70E000"/><stop offset="75%" stop-color="#00C4FF"/><stop offset="100%" stop-color="#9D4EDD"/></linearGradient></defs><rect x="4" y="4" width="192" height="192" rx="26" fill="none" stroke="url(#rbw)" stroke-width="10"/><rect x="10" y="10" width="180" height="180" rx="20" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".8"/></svg>
```

---

## BAB 3: Desain & Kode SVG 100 Monster Boss

### 3.1 Generator Prosedural Vektor SVG Monster

Monsters di-`render` dengan memadukan formula HSL warna habitat serta pustaka bentuk geometri:

```javascript
// Formula Konversi HSL ke Hex Palette:
const palette = (col) => {
  const [h, s, l] = col;
  return {
    main: hsl(h, s, l),
    dark: hsl(h, Math.min(s + 5, 90), Math.max(l - 24, 12)),
    light: hsl(h, Math.max(s - 5, 10), Math.min(l + 25, 92)),
    accent: hsl(h + 150, 85, 60),
  };
};
```

---

### 3.2 Pustaka Bentuk Geometri SVG Monster

1. **Bentuk Tubuh (`body`)**:
   - `round`: `<circle cx="100" cy="112" r="58"/>`
   - `egg`: `<ellipse cx="100" cy="112" rx="50" ry="64"/>`
   - `blob`: `<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z"/>`
   - `square`: `<rect x="46" y="56" width="108" height="112" rx="30"/>`
   - `ghost`: `<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z"/>`
   - `octopus`: Badan bulat + 4 tentakel berputar.
   - `slime`: Bagian bawah bergelombang cair.
   - `spiky`: Poligon bintang 24 sudut runcing.

2. **Hiasan Kepala (`head`)**:
   - `horns`: Tanduk kembar kiri-kanan.
   - `unicorn`: Cula tunggal runcing di tengah dahi.
   - `antennae`: Dua antena lengkung dengan bola kristal di ujung.
   - `spikes`: Jajaran 5 duri tajam mahkota.
   - `crown`: Mahkota kerajaan emas 5 puncak.
   - `ears`: Telinga oval kembar berlayer dalam.
   - `mohawk`: Jambul api/rambut tegak di ubun-ubun.

3. **Mata & Mulut**:
   - Mata: `two` (standar), `one` (cyclops), `three` (mata ketiga mistis), `four` (alien), `angry` (alis tegas miring), `sleepy` (garis lengkung tertidur).
   - Mulut: `smile` (senyum ramah), `fangs` (taring tajam kembar), `tongue` (menjulur lidah), `teeth` (gigi kotak berjejer), `open` (mulut melotot), `zigzag` (mulut gerigi tajam).

---

### 3.3 Lapisan Aura & Mahkota Rarity

Ketika boss memiliki rarity di atas Common, SVG generator menginjeksi filter visual:
- **Rare**: `<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura)"/>` (Gradien Radial Biru)
- **Epic**: `<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura)"/>` + 4 Bintang Partikel Ungu.
- **Legend**: `<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura)"/>` + Mahkota Kerajaan Emas bertatahkan permata merah.

---

### 3.4 Kode SVG Lengkap 10 Boss Representatif per Habitat

Berikut adalah kode SVG utuh untuk 1 boss perwakilan dari masing-masing 10 habitat:

#### 👾 #1 Lumutra (Habitat: HUTAN · Elemen: `nature` · Tampilan Legend)
- **Anatomi**: Tubuh `ghost`, Kepala `ears`, Mata `sleepy`, Mulut `open`, Ekstra `none`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Lumutra" data-tier="legend">
<defs>
  <clipPath id="clip-m1"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  <radialGradient id="legend-aura-1" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-1)"/>
<g class="monster-body">

<g stroke="#1a6614" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#39c62f"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#39c62f"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#98e193"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#98e193"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#39c62f" stroke="#1a6614" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### 👾 #11 Slimbul (Habitat: RAWA · Elemen: `toxic` · Tampilan Legend)
- **Anatomi**: Tubuh `blob`, Kepala `ears`, Mata `four`, Mulut `open`, Ekstra `cheeks`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Slimbul" data-tier="legend">
<defs>
  <clipPath id="clip-m11"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  <radialGradient id="legend-aura-11" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-11)"/>
<g class="monster-body">

<g stroke="#6a6b0f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#cdd025"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#cdd025"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#e5e78d"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#e5e78d"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#cdd025" stroke="#6a6b0f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### 👾 #21 Kristalor (Habitat: GUA · Elemen: `earth` · Tampilan Legend)
- **Anatomi**: Tubuh `blob`, Kepala `none`, Mata `angry`, Mulut `smile`, Ekstra `tail`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kristalor" data-tier="legend">
<defs>
  <clipPath id="clip-m21"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  <radialGradient id="legend-aura-21" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-21)"/>
<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#9e37be" stroke="#511862" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#9e37be" stroke="#511862" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### 👾 #31 Apiko (Habitat: API · Elemen: `fire` · Tampilan Legend)
- **Anatomi**: Tubuh `square`, Kepala `crown`, Mata `two`, Mulut `tongue`, Ekstra `wings`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Apiko" data-tier="legend">
<defs>
  <clipPath id="clip-m31"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  <radialGradient id="legend-aura-31" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-31)"/>
<g class="monster-body">
<g fill="#ee8791" stroke="#710914" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>
<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#710914" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#dc182c" stroke="#710914" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### 👾 #41 Esbeku (Habitat: ES · Elemen: `ice` · Tampilan Legend)
- **Anatomi**: Tubuh `round`, Kepala `crown`, Mata `two`, Mulut `open`, Ekstra `belly`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Esbeku" data-tier="legend">
<defs>
  <clipPath id="clip-m41"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="legend-aura-41" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-41)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#126851" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="112" r="58" fill="#2bcaa0" stroke="#126851" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#91e3cd" opacity=".85"/>

<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### 👾 #51 Guritron (Habitat: LAUT · Elemen: `water` · Tampilan Legend)
- **Anatomi**: Tubuh `spiky`, Kepala `none`, Mata `angry`, Mulut `fangs`, Ekstra `none`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Guritron" data-tier="legend">
<defs>
  <clipPath id="clip-m51"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  <radialGradient id="legend-aura-51" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-51)"/>
<g class="monster-body">


<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#2594d0" stroke="#0f4b6b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### 👾 #61 Awanimo (Habitat: LANGIT · Elemen: `wind` · Tampilan Legend)
- **Anatomi**: Tubuh `ghost`, Kepala `ears`, Mata `four`, Mulut `zigzag`, Ekstra `arms`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Awanimo" data-tier="legend">
<defs>
  <clipPath id="clip-m61"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  <radialGradient id="legend-aura-61" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-61)"/>
<g class="monster-body">

<g stroke="#744506" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#e28812"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#e28812"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#f1c183"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#f1c183"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#e28812" stroke="#744506" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#e28812" stroke="#744506" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### 👾 #71 Bayangor (Habitat: HANTU · Elemen: `shadow` · Tampilan Legend)
- **Anatomi**: Tubuh `blob`, Kepala `crown`, Mata `angry`, Mulut `teeth`, Ekstra `spots`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Bayangor" data-tier="legend">
<defs>
  <clipPath id="clip-m71"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  <radialGradient id="legend-aura-71" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-71)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#1c265f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#3d50b8" stroke="#1c265f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#1c265f" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### 👾 #81 Robotok (Habitat: MESIN · Elemen: `thunder` · Tampilan Legend)
- **Anatomi**: Tubuh `octopus`, Kepala `unicorn`, Mata `one`, Mulut `fangs`, Ekstra `tail`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Robotok" data-tier="legend">
<defs>
  <clipPath id="clip-m81"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  <radialGradient id="legend-aura-81" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-81)"/>
<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#a55f50" stroke="#562e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M91 64L100 12L109 64Z" fill="#cfada5" stroke="#562e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#a55f50" stroke="#562e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### 👾 #91 Permenok (Habitat: MANIS · Elemen: `light` · Tampilan Legend)
- **Anatomi**: Tubuh `octopus`, Kepala `unicorn`, Mata `four`, Mulut `fangs`, Ekstra `cheeks`
- **Kode SVG Lengkap (200x200)**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Permenok" data-tier="legend">
<defs>
  <clipPath id="clip-m91"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  <radialGradient id="legend-aura-91" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-91)"/>
<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#ea8ab9" stroke="#6e0c3c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#d61f77" stroke="#6e0c3c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

---

### 3.5 Katalog dan Kode SVG Utuh 100 Boss Monster

Di bawah ini adalah katalog lengkap seluruh 100 Boss Monster beserta spesifikasi data dan kode SVG utuhnya:

#### Boss #1: **Lumutra**
- **Tema / Elemen**: hutan / `nature` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `ghost` | Head: `ears` | Eyes: `sleepy` | Mouth: `open` | Extra: `none`
- **Warna HSL**: `hsl(116, 62%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Lumutra" data-tier="common">
<defs>
  <clipPath id="clip-m1"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g stroke="#1a6614" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#39c62f"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#39c62f"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#98e193"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#98e193"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#39c62f" stroke="#1a6614" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #2: **Akarok**
- **Tema / Elemen**: hutan / `nature` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `square` | Head: `unicorn` | Eyes: `two` | Mouth: `fangs` | Extra: `wings`
- **Warna HSL**: `hsl(123, 62%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Akarok" data-tier="common">
<defs>
  <clipPath id="clip-m2"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">
<g fill="#b3eab6" stroke="#1b8820" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>
<path d="M91 64L100 12L109 64Z" fill="#b3eab6" stroke="#1b8820" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#49d450" stroke="#1b8820" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #3: **Jamurgon**
- **Tema / Elemen**: hutan / `nature` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `slime` | Head: `none` | Eyes: `one` | Mouth: `open` | Extra: `none`
- **Warna HSL**: `hsl(130, 62%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Jamurgon" data-tier="common">
<defs>
  <clipPath id="clip-m3"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">


<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#6adc7d" stroke="#22aa38" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #4: **Kayubuk**
- **Tema / Elemen**: hutan / `nature` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `blob` | Head: `unicorn` | Eyes: `sleepy` | Mouth: `fangs` | Extra: `belly`
- **Warna HSL**: `hsl(137, 62%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kayubuk" data-tier="common">
<defs>
  <clipPath id="clip-m4"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#a3e6b6" stroke="#187733" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#39d064" stroke="#187733" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#a3e6b6" opacity=".85"/>

<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #5: **Daunjir**
- **Tema / Elemen**: hutan / `nature` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `egg` | Head: `unicorn` | Eyes: `sleepy` | Mouth: `fangs` | Extra: `arms`
- **Warna HSL**: `hsl(144, 62%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Daunjir" data-tier="rare">
<defs>
  <clipPath id="clip-m5"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="rare-aura-5" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-5)"/>
<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#c3efd4" stroke="#1e994f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#5ad88c" stroke="#1e994f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#5ad88c" stroke="#1e994f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #6: **Burunggar**
- **Tema / Elemen**: hutan / `nature` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `octopus` | Head: `none` | Eyes: `four` | Mouth: `zigzag` | Extra: `wings`
- **Warna HSL**: `hsl(116, 62%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Burunggar" data-tier="rare">
<defs>
  <clipPath id="clip-m6"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  <radialGradient id="rare-aura-6" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-6)"/>
<g class="monster-body">
<g fill="#98e193" stroke="#1a6614" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>

<g fill="#39c62f" stroke="#1a6614" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>


<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

</g>

</svg>
```

#### Boss #7: **Sulurkan**
- **Tema / Elemen**: hutan / `nature` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `round` | Head: `crown` | Eyes: `two` | Mouth: `tongue` | Extra: `tail`
- **Warna HSL**: `hsl(123, 62%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Sulurkan" data-tier="rare">
<defs>
  <clipPath id="clip-m7"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="rare-aura-7" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-7)"/>
<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#49d450" stroke="#1b8820" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#1b8820" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="112" r="58" fill="#49d450" stroke="#1b8820" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #8: **Rimbazo**
- **Tema / Elemen**: hutan / `nature` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `spiky` | Head: `horns` | Eyes: `one` | Mouth: `fangs` | Extra: `tail`
- **Warna HSL**: `hsl(130, 62%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Rimbazo" data-tier="epic">
<defs>
  <clipPath id="clip-m8"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  <radialGradient id="epic-aura-8" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-8)"/>
<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#6adc7d" stroke="#22aa38" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#b642f0" stroke="#22aa38" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#6adc7d" stroke="#22aa38" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #9: **Beringkus**
- **Tema / Elemen**: hutan / `nature` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `round` | Head: `unicorn` | Eyes: `two` | Mouth: `smile` | Extra: `spots`
- **Warna HSL**: `hsl(137, 62%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Beringkus" data-tier="epic">
<defs>
  <clipPath id="clip-m9"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="epic-aura-9" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-9)"/>
<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#a3e6b6" stroke="#187733" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="112" r="58" fill="#39d064" stroke="#187733" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#187733" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #10: **Tupaiju**
- **Tema / Elemen**: hutan / `nature` · **Tier Bawaan**: `legend`
- **Anatomi Visual**: Body: `egg` | Head: `antennae` | Eyes: `one` | Mouth: `zigzag` | Extra: `none`
- **Warna HSL**: `hsl(144, 62%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Tupaiju" data-tier="legend">
<defs>
  <clipPath id="clip-m10"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="legend-aura-10" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-10)"/>
<g class="monster-body">

<g stroke="#1e994f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#de42f0" stroke="#1e994f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#de42f0" stroke="#1e994f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#5ad88c" stroke="#1e994f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### Boss #11: **Slimbul**
- **Tema / Elemen**: rawa / `toxic` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `blob` | Head: `ears` | Eyes: `four` | Mouth: `open` | Extra: `cheeks`
- **Warna HSL**: `hsl(61, 70%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Slimbul" data-tier="common">
<defs>
  <clipPath id="clip-m11"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g stroke="#6a6b0f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#cdd025"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#cdd025"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#e5e78d"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#e5e78d"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#cdd025" stroke="#6a6b0f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #12: **Lendirot**
- **Tema / Elemen**: rawa / `toxic` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `ghost` | Head: `ears` | Eyes: `angry` | Mouth: `smile` | Extra: `belly`
- **Warna HSL**: `hsl(68, 70%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Lendirot" data-tier="common">
<defs>
  <clipPath id="clip-m12"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g stroke="#7e8f14" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#c8dd40"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#c8dd40"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#e6eeaf"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#e6eeaf"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#c8dd40" stroke="#7e8f14" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#e6eeaf" opacity=".85"/>

<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #13: **Gelatok**
- **Tema / Elemen**: rawa / `toxic` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `octopus` | Head: `mohawk` | Eyes: `two` | Mouth: `smile` | Extra: `stripes`
- **Warna HSL**: `hsl(75, 70%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Gelatok" data-tier="common">
<defs>
  <clipPath id="clip-m13"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#426ef0" stroke="#8cb319" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#c3e363" stroke="#8cb319" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>
<g clip-path="url(#clip-m13)" stroke="#8cb319" stroke-width="8" opacity=".3" fill="none" stroke-linecap="round">
      <path d="M30 72Q100 84 170 72"/><path d="M30 152Q100 164 170 152"/><path d="M30 168Q100 180 170 168"/></g>

<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #14: **Becekon**
- **Tema / Elemen**: rawa / `toxic` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `slime` | Head: `horns` | Eyes: `angry` | Mouth: `fangs` | Extra: `arms`
- **Warna HSL**: `hsl(82, 70%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Becekon" data-tier="common">
<defs>
  <clipPath id="clip-m14"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g fill="#4259f0" stroke="#567d12" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#9bda2f" stroke="#567d12" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#9bda2f" stroke="#567d12" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #15: **Lumpurra**
- **Tema / Elemen**: rawa / `toxic` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `square` | Head: `spikes` | Eyes: `one` | Mouth: `fangs` | Extra: `belly`
- **Warna HSL**: `hsl(89, 70%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Lumpurra" data-tier="rare">
<defs>
  <clipPath id="clip-m15"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  <radialGradient id="rare-aura-15" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-15)"/>
<g class="monster-body">

<g fill="#4245f0" stroke="#5ea117" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M54 72L64 28L74 72Z"/><path d="M72 72L82 34L92 72Z"/><path d="M90 72L100 28L110 72Z"/><path d="M108 72L118 34L128 72Z"/><path d="M126 72L136 28L146 72Z"/></g>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#9be052" stroke="#5ea117" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#daf2c0" opacity=".85"/>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #16: **Kodokzilla**
- **Tema / Elemen**: rawa / `toxic` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `egg` | Head: `ears` | Eyes: `one` | Mouth: `smile` | Extra: `spots`
- **Warna HSL**: `hsl(61, 70%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kodokzilla" data-tier="rare">
<defs>
  <clipPath id="clip-m16"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="rare-aura-16" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-16)"/>
<g class="monster-body">

<g stroke="#6a6b0f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#cdd025"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#cdd025"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#e5e78d"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#e5e78d"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#cdd025" stroke="#6a6b0f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#6a6b0f" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #17: **Cacingar**
- **Tema / Elemen**: rawa / `toxic` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `spiky` | Head: `antennae` | Eyes: `two` | Mouth: `smile` | Extra: `spots`
- **Warna HSL**: `hsl(68, 70%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Cacingar" data-tier="rare">
<defs>
  <clipPath id="clip-m17"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  <radialGradient id="rare-aura-17" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-17)"/>
<g class="monster-body">

<g stroke="#7e8f14" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#4282f0" stroke="#7e8f14" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#4282f0" stroke="#7e8f14" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#c8dd40" stroke="#7e8f14" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#7e8f14" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #18: **Gelembus**
- **Tema / Elemen**: rawa / `toxic` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `round` | Head: `none` | Eyes: `four` | Mouth: `tongue` | Extra: `cheeks`
- **Warna HSL**: `hsl(75, 70%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Gelembus" data-tier="epic">
<defs>
  <clipPath id="clip-m18"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="epic-aura-18" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-18)"/>
<g class="monster-body">


<circle cx="100" cy="112" r="58" fill="#c3e363" stroke="#8cb319" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #19: **Rawagon**
- **Tema / Elemen**: rawa / `toxic` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `slime` | Head: `unicorn` | Eyes: `one` | Mouth: `zigzag` | Extra: `arms`
- **Warna HSL**: `hsl(82, 70%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Rawagon" data-tier="epic">
<defs>
  <clipPath id="clip-m19"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  <radialGradient id="epic-aura-19" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-19)"/>
<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#cfea9e" stroke="#567d12" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#9bda2f" stroke="#567d12" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#9bda2f" stroke="#567d12" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #20: **Ingusaur**
- **Tema / Elemen**: rawa / `toxic` · **Tier Bawaan**: `legend`
- **Anatomi Visual**: Body: `ghost` | Head: `none` | Eyes: `one` | Mouth: `fangs` | Extra: `none`
- **Warna HSL**: `hsl(89, 70%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Ingusaur" data-tier="legend">
<defs>
  <clipPath id="clip-m20"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  <radialGradient id="legend-aura-20" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-20)"/>
<g class="monster-body">


<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#9be052" stroke="#5ea117" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### Boss #21: **Kristalor**
- **Tema / Elemen**: gua / `earth` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `blob` | Head: `none` | Eyes: `angry` | Mouth: `smile` | Extra: `tail`
- **Warna HSL**: `hsl(286, 55%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kristalor" data-tier="common">
<defs>
  <clipPath id="clip-m21"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#9e37be" stroke="#511862" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#9e37be" stroke="#511862" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #22: **Batuguk**
- **Tema / Elemen**: gua / `earth` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `ghost` | Head: `unicorn` | Eyes: `one` | Mouth: `fangs` | Extra: `stripes`
- **Warna HSL**: `hsl(293, 55%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Batuguk" data-tier="common">
<defs>
  <clipPath id="clip-m22"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#e1b6e7" stroke="#772183" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#be51cd" stroke="#772183" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g clip-path="url(#clip-m22)" stroke="#772183" stroke-width="8" opacity=".3" fill="none" stroke-linecap="round">
      <path d="M30 72Q100 84 170 72"/><path d="M30 152Q100 164 170 152"/><path d="M30 168Q100 180 170 168"/></g>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #23: **Stalaktron**
- **Tema / Elemen**: gua / `earth` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `spiky` | Head: `mohawk` | Eyes: `two` | Mouth: `open` | Extra: `spots`
- **Warna HSL**: `hsl(300, 55%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Stalaktron" data-tier="common">
<defs>
  <clipPath id="clip-m23"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#99f042" stroke="#a329a3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#d671d6" stroke="#a329a3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#a329a3" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #24: **Gemilang**
- **Tema / Elemen**: gua / `earth` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `octopus` | Head: `spikes` | Eyes: `sleepy` | Mouth: `teeth` | Extra: `arms`
- **Warna HSL**: `hsl(307, 55%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Gemilang" data-tier="common">
<defs>
  <clipPath id="clip-m24"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g fill="#85f042" stroke="#721d68" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M54 72L64 28L74 72Z"/><path d="M72 72L82 34L92 72Z"/><path d="M90 72L100 28L110 72Z"/><path d="M108 72L118 34L128 72Z"/><path d="M126 72L136 28L146 72Z"/></g>
<g fill="#c841b8" stroke="#721d68" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>

<g fill="#c841b8" stroke="#721d68" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>

</svg>
```

#### Boss #25: **Kelelawor**
- **Tema / Elemen**: gua / `earth` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `round` | Head: `crown` | Eyes: `one` | Mouth: `smile` | Extra: `cheeks`
- **Warna HSL**: `hsl(314, 55%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kelelawor" data-tier="rare">
<defs>
  <clipPath id="clip-m25"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="rare-aura-25" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-25)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#932579" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="112" r="58" fill="#d161b7" stroke="#932579" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #26: **Gelapuk**
- **Tema / Elemen**: gua / `earth` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `square` | Head: `mohawk` | Eyes: `angry` | Mouth: `teeth` | Extra: `arms`
- **Warna HSL**: `hsl(286, 55%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Gelapuk" data-tier="rare">
<defs>
  <clipPath id="clip-m26"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  <radialGradient id="rare-aura-26" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-26)"/>
<g class="monster-body">

<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#c1f042" stroke="#511862" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#9e37be" stroke="#511862" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#9e37be" stroke="#511862" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>

</svg>
```

#### Boss #27: **Amethyx**
- **Tema / Elemen**: gua / `earth` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `egg` | Head: `crown` | Eyes: `sleepy` | Mouth: `fangs` | Extra: `none`
- **Warna HSL**: `hsl(293, 55%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Amethyx" data-tier="rare">
<defs>
  <clipPath id="clip-m27"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="rare-aura-27" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-27)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#772183" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#be51cd" stroke="#772183" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #28: **Permatok**
- **Tema / Elemen**: gua / `earth` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `slime` | Head: `antennae` | Eyes: `four` | Mouth: `open` | Extra: `cheeks`
- **Warna HSL**: `hsl(300, 55%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Permatok" data-tier="epic">
<defs>
  <clipPath id="clip-m28"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  <radialGradient id="epic-aura-28" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-28)"/>
<g class="monster-body">

<g stroke="#a329a3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#99f042" stroke="#a329a3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#99f042" stroke="#a329a3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#d671d6" stroke="#a329a3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #29: **Goanggar**
- **Tema / Elemen**: gua / `earth` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `round` | Head: `crown` | Eyes: `one` | Mouth: `tongue` | Extra: `none`
- **Warna HSL**: `hsl(307, 55%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Goanggar" data-tier="epic">
<defs>
  <clipPath id="clip-m29"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="epic-aura-29" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-29)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#721d68" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="112" r="58" fill="#c841b8" stroke="#721d68" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #30: **Fosforo**
- **Tema / Elemen**: gua / `earth` · **Tier Bawaan**: `legend`
- **Anatomi Visual**: Body: `square` | Head: `crown` | Eyes: `two` | Mouth: `fangs` | Extra: `cheeks`
- **Warna HSL**: `hsl(314, 55%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Fosforo" data-tier="legend">
<defs>
  <clipPath id="clip-m30"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  <radialGradient id="legend-aura-30" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-30)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#932579" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#d161b7" stroke="#932579" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### Boss #31: **Apiko**
- **Tema / Elemen**: api / `fire` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `square` | Head: `crown` | Eyes: `two` | Mouth: `tongue` | Extra: `wings`
- **Warna HSL**: `hsl(354, 80%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Apiko" data-tier="common">
<defs>
  <clipPath id="clip-m31"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">
<g fill="#ee8791" stroke="#710914" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>
<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#710914" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#dc182c" stroke="#710914" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #32: **Lavagor**
- **Tema / Elemen**: api / `fire` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `blob` | Head: `antennae` | Eyes: `one` | Mouth: `tongue` | Extra: `belly`
- **Warna HSL**: `hsl(1, 80%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Lavagor" data-tier="common">
<defs>
  <clipPath id="clip-m32"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g stroke="#970f0c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#42f09c" stroke="#970f0c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#42f09c" stroke="#970f0c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#e93835" stroke="#970f0c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#f3abaa" opacity=".85"/>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #33: **Barakus**
- **Tema / Elemen**: api / `fire` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `spiky` | Head: `horns` | Eyes: `four` | Mouth: `tongue` | Extra: `spots`
- **Warna HSL**: `hsl(8, 80%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Barakus" data-tier="common">
<defs>
  <clipPath id="clip-m33"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g fill="#42f0b0" stroke="#bd260f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#ed6d5a" stroke="#bd260f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#bd260f" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #34: **Magmora**
- **Tema / Elemen**: api / `fire` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `ghost` | Head: `antennae` | Eyes: `one` | Mouth: `tongue` | Extra: `arms`
- **Warna HSL**: `hsl(15, 80%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Magmora" data-tier="common">
<defs>
  <clipPath id="clip-m34"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g stroke="#84290b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#42f0c4" stroke="#84290b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#42f0c4" stroke="#84290b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#e75423" stroke="#84290b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#e75423" stroke="#84290b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #35: **Abunoir**
- **Tema / Elemen**: api / `fire` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `egg` | Head: `antennae` | Eyes: `four` | Mouth: `teeth` | Extra: `none`
- **Warna HSL**: `hsl(22, 80%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Abunoir" data-tier="rare">
<defs>
  <clipPath id="clip-m35"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="rare-aura-35" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-35)"/>
<g class="monster-body">

<g stroke="#aa470e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#42f0d9" stroke="#aa470e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#42f0d9" stroke="#aa470e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#eb8347" stroke="#aa470e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>

</svg>
```

#### Boss #36: **Percikor**
- **Tema / Elemen**: api / `fire` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `round` | Head: `none` | Eyes: `one` | Mouth: `teeth` | Extra: `spots`
- **Warna HSL**: `hsl(354, 80%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Percikor" data-tier="rare">
<defs>
  <clipPath id="clip-m36"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="rare-aura-36" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-36)"/>
<g class="monster-body">


<circle cx="100" cy="112" r="58" fill="#dc182c" stroke="#710914" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#710914" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>

</svg>
```

#### Boss #37: **Salamandor**
- **Tema / Elemen**: api / `fire` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `octopus` | Head: `none` | Eyes: `four` | Mouth: `tongue` | Extra: `none`
- **Warna HSL**: `hsl(1, 80%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Salamandor" data-tier="rare">
<defs>
  <clipPath id="clip-m37"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  <radialGradient id="rare-aura-37" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-37)"/>
<g class="monster-body">


<g fill="#e93835" stroke="#970f0c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>


<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #38: **Kaldera**
- **Tema / Elemen**: api / `fire` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `slime` | Head: `unicorn` | Eyes: `four` | Mouth: `fangs` | Extra: `cheeks`
- **Warna HSL**: `hsl(8, 80%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kaldera" data-tier="epic">
<defs>
  <clipPath id="clip-m38"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  <radialGradient id="epic-aura-38" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-38)"/>
<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#f8d4ce" stroke="#bd260f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#ed6d5a" stroke="#bd260f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #39: **Geyserok**
- **Tema / Elemen**: api / `fire` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `blob` | Head: `spikes` | Eyes: `three` | Mouth: `tongue` | Extra: `arms`
- **Warna HSL**: `hsl(15, 80%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Geyserok" data-tier="epic">
<defs>
  <clipPath id="clip-m39"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  <radialGradient id="epic-aura-39" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-39)"/>
<g class="monster-body">

<g fill="#42f0c4" stroke="#84290b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M54 72L64 28L74 72Z"/><path d="M72 72L82 34L92 72Z"/><path d="M90 72L100 28L110 72Z"/><path d="M108 72L118 34L128 72Z"/><path d="M126 72L136 28L146 72Z"/></g>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#e75423" stroke="#84290b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#e75423" stroke="#84290b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="72" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="103" r="6" fill="#2b1b3d"/><circle cx="70.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="128" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="103" r="6" fill="#2b1b3d"/><circle cx="124.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="100" cy="78" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="79" r="5.5" fill="#2b1b3d"/><circle cx="98.02" cy="76.8" r="1.76" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #40: **Arangon**
- **Tema / Elemen**: api / `fire` · **Tier Bawaan**: `legend`
- **Anatomi Visual**: Body: `blob` | Head: `antennae` | Eyes: `angry` | Mouth: `open` | Extra: `spots`
- **Warna HSL**: `hsl(22, 80%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Arangon" data-tier="legend">
<defs>
  <clipPath id="clip-m40"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  <radialGradient id="legend-aura-40" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-40)"/>
<g class="monster-body">

<g stroke="#aa470e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#42f0d9" stroke="#aa470e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#42f0d9" stroke="#aa470e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#eb8347" stroke="#aa470e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#aa470e" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### Boss #41: **Esbeku**
- **Tema / Elemen**: es / `ice` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `round` | Head: `crown` | Eyes: `two` | Mouth: `open` | Extra: `belly`
- **Warna HSL**: `hsl(164, 65%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Esbeku" data-tier="common">
<defs>
  <clipPath id="clip-m41"><circle cx="100" cy="112" r="58" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#126851" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="112" r="58" fill="#2bcaa0" stroke="#126851" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#91e3cd" opacity=".85"/>

<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #42: **Saljuno**
- **Tema / Elemen**: es / `ice` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `ghost` | Head: `crown` | Eyes: `four` | Mouth: `open` | Extra: `wings`
- **Warna HSL**: `hsl(171, 65%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Saljuno" data-tier="common">
<defs>
  <clipPath id="clip-m42"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">
<g fill="#b1ece3" stroke="#188b7a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>
<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#188b7a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#46d8c2" stroke="#188b7a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #43: **Glaciur**
- **Tema / Elemen**: es / `ice` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `blob` | Head: `mohawk` | Eyes: `four` | Mouth: `fangs` | Extra: `belly`
- **Warna HSL**: `hsl(178, 65%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Glaciur" data-tier="common">
<defs>
  <clipPath id="clip-m43"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#f0429f" stroke="#1fada9" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#68dfdb" stroke="#1fada9" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#d2f4f3" opacity=".85"/>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #44: **Kristalsalju**
- **Tema / Elemen**: es / `ice` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `egg` | Head: `mohawk` | Eyes: `three` | Mouth: `zigzag` | Extra: `tail`
- **Warna HSL**: `hsl(185, 65%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kristalsalju" data-tier="common">
<defs>
  <clipPath id="clip-m44"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#35c7d4" stroke="#157179" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#f0428b" stroke="#157179" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#35c7d4" stroke="#157179" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="72" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="103" r="6" fill="#2b1b3d"/><circle cx="70.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="128" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="103" r="6" fill="#2b1b3d"/><circle cx="124.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="100" cy="78" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="79" r="5.5" fill="#2b1b3d"/><circle cx="98.02" cy="76.8" r="1.76" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

</g>

</svg>
```

#### Boss #45: **Pingwino**
- **Tema / Elemen**: es / `ice` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `square` | Head: `spikes` | Eyes: `four` | Mouth: `smile` | Extra: `arms`
- **Warna HSL**: `hsl(192, 65%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Pingwino" data-tier="rare">
<defs>
  <clipPath id="clip-m45"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  <radialGradient id="rare-aura-45" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-45)"/>
<g class="monster-body">

<g fill="#f04276" stroke="#1c829c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M54 72L64 28L74 72Z"/><path d="M72 72L82 34L92 72Z"/><path d="M90 72L100 28L110 72Z"/><path d="M108 72L118 34L128 72Z"/><path d="M126 72L136 28L146 72Z"/></g>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#57c1db" stroke="#1c829c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#57c1db" stroke="#1c829c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #46: **Dinginor**
- **Tema / Elemen**: es / `ice` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `slime` | Head: `antennae` | Eyes: `four` | Mouth: `open` | Extra: `spots`
- **Warna HSL**: `hsl(164, 65%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Dinginor" data-tier="rare">
<defs>
  <clipPath id="clip-m46"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  <radialGradient id="rare-aura-46" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-46)"/>
<g class="monster-body">

<g stroke="#126851" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#f042c7" stroke="#126851" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#f042c7" stroke="#126851" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#2bcaa0" stroke="#126851" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#126851" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #47: **Mamutik**
- **Tema / Elemen**: es / `ice` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `octopus` | Head: `unicorn` | Eyes: `sleepy` | Mouth: `fangs` | Extra: `belly`
- **Warna HSL**: `hsl(171, 65%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Mamutik" data-tier="rare">
<defs>
  <clipPath id="clip-m47"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  <radialGradient id="rare-aura-47" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-47)"/>
<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#b1ece3" stroke="#188b7a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#46d8c2" stroke="#188b7a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#b1ece3" opacity=".85"/>

<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #48: **Frostiko**
- **Tema / Elemen**: es / `ice` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `spiky` | Head: `antennae` | Eyes: `angry` | Mouth: `fangs` | Extra: `tail`
- **Warna HSL**: `hsl(178, 65%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Frostiko" data-tier="epic">
<defs>
  <clipPath id="clip-m48"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  <radialGradient id="epic-aura-48" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-48)"/>
<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#68dfdb" stroke="#1fada9" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g stroke="#1fada9" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#f0429f" stroke="#1fada9" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#f0429f" stroke="#1fada9" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#68dfdb" stroke="#1fada9" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #49: **Igluk**
- **Tema / Elemen**: es / `ice` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `octopus` | Head: `ears` | Eyes: `three` | Mouth: `open` | Extra: `belly`
- **Warna HSL**: `hsl(185, 65%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Igluk" data-tier="epic">
<defs>
  <clipPath id="clip-m49"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  <radialGradient id="epic-aura-49" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-49)"/>
<g class="monster-body">

<g stroke="#157179" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#35c7d4"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#35c7d4"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#a1e2e8"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#a1e2e8"/>
<g fill="#35c7d4" stroke="#157179" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#a1e2e8" opacity=".85"/>

<g class="eyes"><circle cx="72" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="103" r="6" fill="#2b1b3d"/><circle cx="70.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="128" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="103" r="6" fill="#2b1b3d"/><circle cx="124.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="100" cy="78" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="79" r="5.5" fill="#2b1b3d"/><circle cx="98.02" cy="76.8" r="1.76" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #50: **Badaino**
- **Tema / Elemen**: es / `ice` · **Tier Bawaan**: `legend`
- **Anatomi Visual**: Body: `egg` | Head: `crown` | Eyes: `one` | Mouth: `teeth` | Extra: `none`
- **Warna HSL**: `hsl(192, 65%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Badaino" data-tier="legend">
<defs>
  <clipPath id="clip-m50"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="legend-aura-50" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-50)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#1c829c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#57c1db" stroke="#1c829c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### Boss #51: **Guritron**
- **Tema / Elemen**: laut / `water` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `spiky` | Head: `none` | Eyes: `angry` | Mouth: `fangs` | Extra: `none`
- **Warna HSL**: `hsl(201, 70%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Guritron" data-tier="common">
<defs>
  <clipPath id="clip-m51"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">


<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#2594d0" stroke="#0f4b6b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #52: **Kepitingor**
- **Tema / Elemen**: laut / `water` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `slime` | Head: `unicorn` | Eyes: `one` | Mouth: `tongue` | Extra: `spots`
- **Warna HSL**: `hsl(208, 70%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kepitingor" data-tier="common">
<defs>
  <clipPath id="clip-m52"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#afd1ee" stroke="#14568f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#4094dd" stroke="#14568f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#14568f" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #53: **Uburzap**
- **Tema / Elemen**: laut / `water` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `egg` | Head: `ears` | Eyes: `one` | Mouth: `zigzag` | Extra: `stripes`
- **Warna HSL**: `hsl(215, 70%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Uburzap" data-tier="common">
<defs>
  <clipPath id="clip-m53"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g stroke="#1959b3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#6398e3"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#6398e3"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#d1e0f5"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#d1e0f5"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#6398e3" stroke="#1959b3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g clip-path="url(#clip-m53)" stroke="#1959b3" stroke-width="8" opacity=".3" fill="none" stroke-linecap="round">
      <path d="M30 72Q100 84 170 72"/><path d="M30 152Q100 164 170 152"/><path d="M30 168Q100 180 170 168"/></g>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

</g>

</svg>
```

#### Boss #54: **Hiugar**
- **Tema / Elemen**: laut / `water` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `ghost` | Head: `none` | Eyes: `sleepy` | Mouth: `smile` | Extra: `belly`
- **Warna HSL**: `hsl(222, 70%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Hiugar" data-tier="common">
<defs>
  <clipPath id="clip-m54"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">


<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#2f62da" stroke="#12327d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#9eb5ea" opacity=".85"/>

<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #55: **Kerangon**
- **Tema / Elemen**: laut / `water` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `octopus` | Head: `crown` | Eyes: `sleepy` | Mouth: `zigzag` | Extra: `belly`
- **Warna HSL**: `hsl(229, 70%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kerangon" data-tier="rare">
<defs>
  <clipPath id="clip-m55"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  <radialGradient id="rare-aura-55" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-55)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#1730a1" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#526ce0" stroke="#1730a1" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#c0c9f2" opacity=".85"/>

<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

</g>

</svg>
```

#### Boss #56: **Pausmok**
- **Tema / Elemen**: laut / `water` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `blob` | Head: `ears` | Eyes: `one` | Mouth: `open` | Extra: `none`
- **Warna HSL**: `hsl(201, 70%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Pausmok" data-tier="rare">
<defs>
  <clipPath id="clip-m56"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  <radialGradient id="rare-aura-56" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-56)"/>
<g class="monster-body">

<g stroke="#0f4b6b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#2594d0"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#2594d0"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#8dc8e7"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#8dc8e7"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#2594d0" stroke="#0f4b6b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #57: **Karangor**
- **Tema / Elemen**: laut / `water` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `round` | Head: `antennae` | Eyes: `one` | Mouth: `tongue` | Extra: `belly`
- **Warna HSL**: `hsl(208, 70%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Karangor" data-tier="rare">
<defs>
  <clipPath id="clip-m57"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="rare-aura-57" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-57)"/>
<g class="monster-body">

<g stroke="#14568f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#f04248" stroke="#14568f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#f04248" stroke="#14568f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="112" r="58" fill="#4094dd" stroke="#14568f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#afd1ee" opacity=".85"/>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #58: **Lobsterok**
- **Tema / Elemen**: laut / `water` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `square` | Head: `mohawk` | Eyes: `four` | Mouth: `teeth` | Extra: `arms`
- **Warna HSL**: `hsl(215, 70%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Lobsterok" data-tier="epic">
<defs>
  <clipPath id="clip-m58"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  <radialGradient id="epic-aura-58" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-58)"/>
<g class="monster-body">

<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#f05142" stroke="#1959b3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#6398e3" stroke="#1959b3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#6398e3" stroke="#1959b3" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #59: **Bintanggar**
- **Tema / Elemen**: laut / `water` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `spiky` | Head: `horns` | Eyes: `two` | Mouth: `teeth` | Extra: `wings`
- **Warna HSL**: `hsl(222, 70%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Bintanggar" data-tier="epic">
<defs>
  <clipPath id="clip-m59"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  <radialGradient id="epic-aura-59" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-59)"/>
<g class="monster-body">
<g fill="#9eb5ea" stroke="#12327d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>
<g fill="#f06542" stroke="#12327d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#2f62da" stroke="#12327d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #60: **Piranjo**
- **Tema / Elemen**: laut / `water` · **Tier Bawaan**: `legend`
- **Anatomi Visual**: Body: `egg` | Head: `antennae` | Eyes: `angry` | Mouth: `fangs` | Extra: `tail`
- **Warna HSL**: `hsl(229, 70%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Piranjo" data-tier="legend">
<defs>
  <clipPath id="clip-m60"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="legend-aura-60" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-60)"/>
<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#526ce0" stroke="#1730a1" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g stroke="#1730a1" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#f07942" stroke="#1730a1" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#f07942" stroke="#1730a1" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#526ce0" stroke="#1730a1" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### Boss #61: **Awanimo**
- **Tema / Elemen**: langit / `wind` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `ghost` | Head: `ears` | Eyes: `four` | Mouth: `zigzag` | Extra: `arms`
- **Warna HSL**: `hsl(34, 85%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Awanimo" data-tier="common">
<defs>
  <clipPath id="clip-m61"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g stroke="#744506" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#e28812"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#e28812"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#f1c183"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#f1c183"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#e28812" stroke="#744506" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#e28812" stroke="#744506" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

</g>

</svg>
```

#### Boss #62: **Petirgon**
- **Tema / Elemen**: langit / `wind` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `blob` | Head: `mohawk` | Eyes: `sleepy` | Mouth: `teeth` | Extra: `stripes`
- **Warna HSL**: `hsl(41, 85%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Petirgon" data-tier="common">
<defs>
  <clipPath id="clip-m62"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#42d0f0" stroke="#9b6d08" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#eeb22f" stroke="#9b6d08" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g clip-path="url(#clip-m62)" stroke="#9b6d08" stroke-width="8" opacity=".3" fill="none" stroke-linecap="round">
      <path d="M30 72Q100 84 170 72"/><path d="M30 152Q100 164 170 152"/><path d="M30 168Q100 180 170 168"/></g>

<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>

</svg>
```

#### Boss #63: **Elangor**
- **Tema / Elemen**: langit / `wind` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `slime` | Head: `horns` | Eyes: `sleepy` | Mouth: `open` | Extra: `wings`
- **Warna HSL**: `hsl(48, 85%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Elangor" data-tier="common">
<defs>
  <clipPath id="clip-m63"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">
<g fill="#f9f0cd" stroke="#c29d0a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>
<g fill="#42bcf0" stroke="#c29d0a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#f1d255" stroke="#c29d0a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #64: **Pelangor**
- **Tema / Elemen**: langit / `wind` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `round` | Head: `unicorn` | Eyes: `two` | Mouth: `tongue` | Extra: `arms`
- **Warna HSL**: `hsl(55, 85%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Pelangor" data-tier="common">
<defs>
  <clipPath id="clip-m64"><circle cx="100" cy="112" r="58" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#f3eb95" stroke="#887d07" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="112" r="58" fill="#eddb1d" stroke="#887d07" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#eddb1d" stroke="#887d07" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #65: **Anginus**
- **Tema / Elemen**: langit / `wind` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `egg` | Head: `unicorn` | Eyes: `one` | Mouth: `open` | Extra: `tail`
- **Warna HSL**: `hsl(62, 85%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Anginus" data-tier="rare">
<defs>
  <clipPath id="clip-m65"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="rare-aura-65" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-65)"/>
<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#eaf042" stroke="#a9ae09" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M91 64L100 12L109 64Z" fill="#f5f7ba" stroke="#a9ae09" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#eaf042" stroke="#a9ae09" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #66: **Kometor**
- **Tema / Elemen**: langit / `wind` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `spiky` | Head: `crown` | Eyes: `three` | Mouth: `zigzag` | Extra: `spots`
- **Warna HSL**: `hsl(34, 85%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kometor" data-tier="rare">
<defs>
  <clipPath id="clip-m66"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  <radialGradient id="rare-aura-66" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-66)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#744506" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#e28812" stroke="#744506" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#744506" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="72" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="103" r="6" fill="#2b1b3d"/><circle cx="70.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="128" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="103" r="6" fill="#2b1b3d"/><circle cx="124.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="100" cy="78" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="79" r="5.5" fill="#2b1b3d"/><circle cx="98.02" cy="76.8" r="1.76" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

</g>

</svg>
```

#### Boss #67: **Layanglo**
- **Tema / Elemen**: langit / `wind` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `octopus` | Head: `horns` | Eyes: `one` | Mouth: `tongue` | Extra: `none`
- **Warna HSL**: `hsl(41, 85%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Layanglo" data-tier="rare">
<defs>
  <clipPath id="clip-m67"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  <radialGradient id="rare-aura-67" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-67)"/>
<g class="monster-body">

<g fill="#42d0f0" stroke="#9b6d08" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<g fill="#eeb22f" stroke="#9b6d08" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #68: **Mataharo**
- **Tema / Elemen**: langit / `wind` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `square` | Head: `ears` | Eyes: `angry` | Mouth: `teeth` | Extra: `arms`
- **Warna HSL**: `hsl(48, 85%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Mataharo" data-tier="epic">
<defs>
  <clipPath id="clip-m68"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  <radialGradient id="epic-aura-68" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-68)"/>
<g class="monster-body">

<g stroke="#c29d0a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#f1d255"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#f1d255"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#f9f0cd"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#f9f0cd"/>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#f1d255" stroke="#c29d0a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#f1d255" stroke="#c29d0a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #69: **Hujanix**
- **Tema / Elemen**: langit / `wind` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `square` | Head: `crown` | Eyes: `one` | Mouth: `smile` | Extra: `stripes`
- **Warna HSL**: `hsl(55, 85%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Hujanix" data-tier="epic">
<defs>
  <clipPath id="clip-m69"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  <radialGradient id="epic-aura-69" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-69)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#887d07" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#eddb1d" stroke="#887d07" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g clip-path="url(#clip-m69)" stroke="#887d07" stroke-width="8" opacity=".3" fill="none" stroke-linecap="round">
      <path d="M30 72Q100 84 170 72"/><path d="M30 152Q100 164 170 152"/><path d="M30 168Q100 180 170 168"/></g>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #70: **Bulanus**
- **Tema / Elemen**: langit / `wind` · **Tier Bawaan**: `legend`
- **Anatomi Visual**: Body: `ghost` | Head: `mohawk` | Eyes: `sleepy` | Mouth: `teeth` | Extra: `arms`
- **Warna HSL**: `hsl(62, 85%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Bulanus" data-tier="legend">
<defs>
  <clipPath id="clip-m70"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  <radialGradient id="legend-aura-70" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-70)"/>
<g class="monster-body">

<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#4293f0" stroke="#a9ae09" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#eaf042" stroke="#a9ae09" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#eaf042" stroke="#a9ae09" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### Boss #71: **Bayangor**
- **Tema / Elemen**: hantu / `shadow` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `blob` | Head: `crown` | Eyes: `angry` | Mouth: `teeth` | Extra: `spots`
- **Warna HSL**: `hsl(231, 50%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Bayangor" data-tier="common">
<defs>
  <clipPath id="clip-m71"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#1c265f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#3d50b8" stroke="#1c265f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#1c265f" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>

</svg>
```

#### Boss #72: **Hantuk**
- **Tema / Elemen**: hantu / `shadow` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `octopus` | Head: `horns` | Eyes: `four` | Mouth: `smile` | Extra: `arms`
- **Warna HSL**: `hsl(238, 50%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Hantuk" data-tier="common">
<defs>
  <clipPath id="clip-m72"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g fill="#f09342" stroke="#25287e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<g fill="#575ac7" stroke="#25287e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>

<g fill="#575ac7" stroke="#25287e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #73: **Selimutor**
- **Tema / Elemen**: hantu / `shadow` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `square` | Head: `horns` | Eyes: `angry` | Mouth: `fangs` | Extra: `spots`
- **Warna HSL**: `hsl(245, 50%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Selimutor" data-tier="common">
<defs>
  <clipPath id="clip-m73"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g fill="#f0a742" stroke="#372e9e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#7d75d1" stroke="#372e9e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#372e9e" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #74: **Lenteron**
- **Tema / Elemen**: hantu / `shadow` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `spiky` | Head: `unicorn` | Eyes: `four` | Mouth: `open` | Extra: `tail`
- **Warna HSL**: `hsl(252, 50%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Lenteron" data-tier="common">
<defs>
  <clipPath id="clip-m74"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#6047c2" stroke="#30206f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M91 64L100 12L109 64Z" fill="#b5aadf" stroke="#30206f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#6047c2" stroke="#30206f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #75: **Labalabi**
- **Tema / Elemen**: hantu / `shadow` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `ghost` | Head: `crown` | Eyes: `two` | Mouth: `smile` | Extra: `spots`
- **Warna HSL**: `hsl(259, 50%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Labalabi" data-tier="rare">
<defs>
  <clipPath id="clip-m75"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  <radialGradient id="rare-aura-75" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-75)"/>
<g class="monster-body">

<path d="M70 66L72 34L88 52L100 28L112 52L128 34L130 66Z" fill="#ffd34d" stroke="#49298e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#8666cc" stroke="#49298e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#49298e" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #76: **Kerangkok**
- **Tema / Elemen**: hantu / `shadow` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `egg` | Head: `horns` | Eyes: `four` | Mouth: `zigzag` | Extra: `cheeks`
- **Warna HSL**: `hsl(231, 50%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kerangkok" data-tier="rare">
<defs>
  <clipPath id="clip-m76"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="rare-aura-76" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-76)"/>
<g class="monster-body">

<g fill="#f07f42" stroke="#1c265f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#3d50b8" stroke="#1c265f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

</g>

</svg>
```

#### Boss #77: **Penyihirul**
- **Tema / Elemen**: hantu / `shadow` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `slime` | Head: `horns` | Eyes: `sleepy` | Mouth: `smile` | Extra: `cheeks`
- **Warna HSL**: `hsl(238, 50%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Penyihirul" data-tier="rare">
<defs>
  <clipPath id="clip-m77"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  <radialGradient id="rare-aura-77" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-77)"/>
<g class="monster-body">

<g fill="#f09342" stroke="#25287e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#575ac7" stroke="#25287e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #78: **Kabutor**
- **Tema / Elemen**: hantu / `shadow` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `round` | Head: `horns` | Eyes: `one` | Mouth: `teeth` | Extra: `belly`
- **Warna HSL**: `hsl(245, 50%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kabutor" data-tier="epic">
<defs>
  <clipPath id="clip-m78"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="epic-aura-78" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-78)"/>
<g class="monster-body">

<g fill="#f0a742" stroke="#372e9e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<circle cx="100" cy="112" r="58" fill="#7d75d1" stroke="#372e9e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#d8d6f0" opacity=".85"/>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #79: **Gentayo**
- **Tema / Elemen**: hantu / `shadow` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `egg` | Head: `none` | Eyes: `two` | Mouth: `open` | Extra: `wings`
- **Warna HSL**: `hsl(252, 50%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Gentayo" data-tier="epic">
<defs>
  <clipPath id="clip-m79"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="epic-aura-79" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-79)"/>
<g class="monster-body">
<g fill="#b5aadf" stroke="#30206f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>

<ellipse cx="100" cy="112" rx="50" ry="64" fill="#6047c2" stroke="#30206f" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #80: **Gelapon**
- **Tema / Elemen**: hantu / `shadow` · **Tier Bawaan**: `legend`
- **Anatomi Visual**: Body: `octopus` | Head: `spikes` | Eyes: `one` | Mouth: `open` | Extra: `cheeks`
- **Warna HSL**: `hsl(259, 50%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Gelapon" data-tier="legend">
<defs>
  <clipPath id="clip-m80"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  <radialGradient id="legend-aura-80" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-80)"/>
<g class="monster-body">

<g fill="#f0d042" stroke="#49298e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M54 72L64 28L74 72Z"/><path d="M72 72L82 34L92 72Z"/><path d="M90 72L100 28L110 72Z"/><path d="M108 72L118 34L128 72Z"/><path d="M126 72L136 28L146 72Z"/></g>
<g fill="#8666cc" stroke="#49298e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### Boss #81: **Robotok**
- **Tema / Elemen**: mesin / `thunder` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `octopus` | Head: `unicorn` | Eyes: `one` | Mouth: `fangs` | Extra: `tail`
- **Warna HSL**: `hsl(11, 35%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Robotok" data-tier="common">
<defs>
  <clipPath id="clip-m81"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#a55f50" stroke="#562e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M91 64L100 12L109 64Z" fill="#cfada5" stroke="#562e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#a55f50" stroke="#562e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #82: **Gearzilla**
- **Tema / Elemen**: mesin / `thunder` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `square` | Head: `unicorn` | Eyes: `sleepy` | Mouth: `fangs` | Extra: `belly`
- **Warna HSL**: `hsl(18, 35%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Gearzilla" data-tier="common">
<defs>
  <clipPath id="clip-m82"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#ddc9c0" stroke="#724531" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#b67f68" stroke="#724531" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="152" rx="32" ry="18" fill="#ddc9c0" opacity=".85"/>

<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #83: **Sekrupor**
- **Tema / Elemen**: mesin / `thunder` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `ghost` | Head: `ears` | Eyes: `one` | Mouth: `zigzag` | Extra: `tail`
- **Warna HSL**: `hsl(25, 35%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Sekrupor" data-tier="common">
<defs>
  <clipPath id="clip-m83"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#c39e83" stroke="#8f5f3d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g stroke="#8f5f3d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#c39e83"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#c39e83"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#ebe2db"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#ebe2db"/>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#c39e83" stroke="#8f5f3d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

</g>

</svg>
```

#### Boss #84: **Baterion**
- **Tema / Elemen**: mesin / `thunder` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `egg` | Head: `spikes` | Eyes: `four` | Mouth: `open` | Extra: `spots`
- **Warna HSL**: `hsl(32, 35%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Baterion" data-tier="common">
<defs>
  <clipPath id="clip-m84"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<g fill="#42eaf0" stroke="#64492b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M54 72L64 28L74 72Z"/><path d="M72 72L82 34L92 72Z"/><path d="M90 72L100 28L110 72Z"/><path d="M108 72L118 34L128 72Z"/><path d="M126 72L136 28L146 72Z"/></g>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#af875a" stroke="#64492b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#64492b" opacity=".3"><circle cx="66" cy="128" r="9"/><circle cx="136" cy="122" r="8"/><circle cx="72" cy="154" r="6"/><circle cx="128" cy="156" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #85: **Mekanix**
- **Tema / Elemen**: mesin / `thunder` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `spiky` | Head: `spikes` | Eyes: `one` | Mouth: `smile` | Extra: `none`
- **Warna HSL**: `hsl(39, 35%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Mekanix" data-tier="rare">
<defs>
  <clipPath id="clip-m85"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  <radialGradient id="rare-aura-85" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-85)"/>
<g class="monster-body">

<g fill="#42d6f0" stroke="#816737" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M54 72L64 28L74 72Z"/><path d="M72 72L82 34L92 72Z"/><path d="M90 72L100 28L110 72Z"/><path d="M108 72L118 34L128 72Z"/><path d="M126 72L136 28L146 72Z"/></g>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#bda475" stroke="#816737" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>

</svg>
```

#### Boss #86: **Pistonk**
- **Tema / Elemen**: mesin / `thunder` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `round` | Head: `horns` | Eyes: `three` | Mouth: `teeth` | Extra: `cheeks`
- **Warna HSL**: `hsl(11, 35%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Pistonk" data-tier="rare">
<defs>
  <clipPath id="clip-m86"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="rare-aura-86" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-86)"/>
<g class="monster-body">

<g fill="#42f0b9" stroke="#562e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<circle cx="100" cy="112" r="58" fill="#a55f50" stroke="#562e25" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="72" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="103" r="6" fill="#2b1b3d"/><circle cx="70.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="128" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="103" r="6" fill="#2b1b3d"/><circle cx="124.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="100" cy="78" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="79" r="5.5" fill="#2b1b3d"/><circle cx="98.02" cy="76.8" r="1.76" fill="#fff"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>

</svg>
```

#### Boss #87: **Kabelon**
- **Tema / Elemen**: mesin / `thunder` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `slime` | Head: `mohawk` | Eyes: `three` | Mouth: `teeth` | Extra: `none`
- **Warna HSL**: `hsl(18, 35%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kabelon" data-tier="rare">
<defs>
  <clipPath id="clip-m87"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  <radialGradient id="rare-aura-87" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-87)"/>
<g class="monster-body">

<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#42f0cd" stroke="#724531" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#b67f68" stroke="#724531" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="72" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="103" r="6" fill="#2b1b3d"/><circle cx="70.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="128" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="103" r="6" fill="#2b1b3d"/><circle cx="124.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="100" cy="78" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="79" r="5.5" fill="#2b1b3d"/><circle cx="98.02" cy="76.8" r="1.76" fill="#fff"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>

</svg>
```

#### Boss #88: **Turbinor**
- **Tema / Elemen**: mesin / `thunder` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `blob` | Head: `ears` | Eyes: `angry` | Mouth: `fangs` | Extra: `arms`
- **Warna HSL**: `hsl(25, 35%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Turbinor" data-tier="epic">
<defs>
  <clipPath id="clip-m88"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  <radialGradient id="epic-aura-88" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-88)"/>
<g class="monster-body">

<g stroke="#8f5f3d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#c39e83"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#c39e83"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#ebe2db"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#ebe2db"/>
<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#c39e83" stroke="#8f5f3d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#c39e83" stroke="#8f5f3d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #89: **Magnetor**
- **Tema / Elemen**: mesin / `thunder` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `ghost` | Head: `none` | Eyes: `four` | Mouth: `smile` | Extra: `none`
- **Warna HSL**: `hsl(32, 35%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Magnetor" data-tier="epic">
<defs>
  <clipPath id="clip-m89"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  <radialGradient id="epic-aura-89" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-89)"/>
<g class="monster-body">


<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#af875a" stroke="#64492b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #90: **Chipzo**
- **Tema / Elemen**: mesin / `thunder` · **Tier Bawaan**: `legend`
- **Anatomi Visual**: Body: `spiky` | Head: `antennae` | Eyes: `three` | Mouth: `zigzag` | Extra: `wings`
- **Warna HSL**: `hsl(39, 35%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Chipzo" data-tier="legend">
<defs>
  <clipPath id="clip-m90"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  <radialGradient id="legend-aura-90" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-90)"/>
<g class="monster-body">
<g fill="#e4dccd" stroke="#816737" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>
<g stroke="#816737" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#42d6f0" stroke="#816737" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#42d6f0" stroke="#816737" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#bda475" stroke="#816737" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="72" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="103" r="6" fill="#2b1b3d"/><circle cx="70.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="128" cy="102" r="12" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="103" r="6" fill="#2b1b3d"/><circle cx="124.84" cy="100.6" r="1.92" fill="#fff"/><circle cx="100" cy="78" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="79" r="5.5" fill="#2b1b3d"/><circle cx="98.02" cy="76.8" r="1.76" fill="#fff"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

#### Boss #91: **Permenok**
- **Tema / Elemen**: manis / `light` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `octopus` | Head: `unicorn` | Eyes: `four` | Mouth: `fangs` | Extra: `cheeks`
- **Warna HSL**: `hsl(331, 75%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Permenok" data-tier="common">
<defs>
  <clipPath id="clip-m91"><g ><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M91 64L100 12L109 64Z" fill="#ea8ab9" stroke="#6e0c3c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#d61f77" stroke="#6e0c3c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="100" cy="98" rx="58" ry="50"/><ellipse cx="58" cy="150" rx="12" ry="24" transform="rotate(14 58 150)"/><ellipse cx="82" cy="156" rx="12" ry="24" transform="rotate(6 82 156)"/><ellipse cx="118" cy="156" rx="12" ry="24" transform="rotate(-6 118 156)"/><ellipse cx="142" cy="150" rx="12" ry="24" transform="rotate(-14 142 150)"/></g>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="72" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="73" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="71.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="128" cy="90" r="11" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="127" cy="91" r="5.5" fill="#2b1b3d"/><circle cx="125.02" cy="88.8" r="1.76" fill="#fff"/><circle cx="88" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="89" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="87.38" cy="113.2" r="1.44" fill="#fff"/><circle cx="112" cy="114" r="9" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="111" cy="115" r="4.5" fill="#2b1b3d"/><circle cx="109.38" cy="113.2" r="1.44" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #92: **Cokelatron**
- **Tema / Elemen**: manis / `light` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `spiky` | Head: `ears` | Eyes: `one` | Mouth: `teeth` | Extra: `tail`
- **Warna HSL**: `hsl(338, 75%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Cokelatron" data-tier="common">
<defs>
  <clipPath id="clip-m92"><polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">
<path d="M146 150Q198 162 188 112Q176 140 148 136Z" fill="#e33b78" stroke="#931040" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g stroke="#931040" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><ellipse cx="50" cy="78" rx="15" ry="22" fill="#e33b78"/><ellipse cx="150" cy="78" rx="15" ry="22" fill="#e33b78"/></g>
      <ellipse cx="50" cy="80" rx="7" ry="13" fill="#f0adc6"/><ellipse cx="150" cy="80" rx="7" ry="13" fill="#f0adc6"/>
<polygon points="100.0,44.0 114.0,59.8 134.0,53.1 138.2,73.8 158.9,78.0 152.2,98.0 168.0,112.0 152.2,126.0 158.9,146.0 138.2,150.2 134.0,170.9 114.0,164.2 100.0,180.0 86.0,164.2 66.0,170.9 61.8,150.2 41.1,146.0 47.8,126.0 32.0,112.0 47.8,98.0 41.1,78.0 61.8,73.8 66.0,53.1 86.0,59.8" fill="#e33b78" stroke="#931040" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>

</svg>
```

#### Boss #93: **Donatzilla**
- **Tema / Elemen**: manis / `light` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `square` | Head: `mohawk` | Eyes: `sleepy` | Mouth: `teeth` | Extra: `arms`
- **Warna HSL**: `hsl(345, 75%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Donatzilla" data-tier="common">
<defs>
  <clipPath id="clip-m93"><rect x="46" y="56" width="108" height="112" rx="30" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">

<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#42f06e" stroke="#b8143d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<rect x="46" y="56" width="108" height="112" rx="30" fill="#e85e81" stroke="#b8143d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#e85e81" stroke="#b8143d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>

</g>

</svg>
```

#### Boss #94: **Krimor**
- **Tema / Elemen**: manis / `light` · **Tier Bawaan**: `common`
- **Anatomi Visual**: Body: `blob` | Head: `none` | Eyes: `two` | Mouth: `open` | Extra: `cheeks`
- **Warna HSL**: `hsl(352, 75%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Krimor" data-tier="common">
<defs>
  <clipPath id="clip-m94"><path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" /></clipPath>
  
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>

<g class="monster-body">


<path d="M40 120C30 70 70 50 100 52C140 52 172 80 160 125C155 160 120 172 100 170C60 172 45 155 40 120Z" fill="#e02941" stroke="#810e1e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="76" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="78" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="75.3" cy="95" r="2.4" fill="#fff"/><circle cx="124" cy="96" r="15" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="122" cy="98" r="7.5" fill="#2b1b3d"/><circle cx="119.3" cy="95" r="2.4" fill="#fff"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>

</svg>
```

#### Boss #95: **Kukuriz**
- **Tema / Elemen**: manis / `light` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `slime` | Head: `spikes` | Eyes: `one` | Mouth: `fangs` | Extra: `arms`
- **Warna HSL**: `hsl(359, 75%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Kukuriz" data-tier="rare">
<defs>
  <clipPath id="clip-m95"><path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" /></clipPath>
  <radialGradient id="rare-aura-95" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-95)"/>
<g class="monster-body">

<g fill="#42f096" stroke="#a51215" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M54 72L64 28L74 72Z"/><path d="M72 72L82 34L92 72Z"/><path d="M90 72L100 28L110 72Z"/><path d="M108 72L118 34L128 72Z"/><path d="M126 72L136 28L146 72Z"/></g>
<path d="M36 170C30 110 60 56 100 56C140 56 170 110 164 170Q150 178 140 168Q130 182 118 168Q104 180 92 168Q80 182 66 168Q50 178 36 170Z" fill="#e64c4f" stroke="#a51215" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#e64c4f" stroke="#a51215" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M76 128Q100 156 124 128Z" fill="#3b1020" stroke="#3b1020" stroke-width="4" stroke-linejoin="round"/>
      <path d="M84 131L90 146L96 136Z M116 131L110 146L104 136Z" fill="#fff"/>

</g>

</svg>
```

#### Boss #96: **Lolipopo**
- **Tema / Elemen**: manis / `light` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `round` | Head: `antennae` | Eyes: `sleepy` | Mouth: `zigzag` | Extra: `wings`
- **Warna HSL**: `hsl(331, 75%, 48%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Lolipopo" data-tier="rare">
<defs>
  <clipPath id="clip-m96"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="rare-aura-96" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-96)"/>
<g class="monster-body">
<g fill="#ea8ab9" stroke="#6e0c3c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M52 104Q4 74 10 36Q40 52 58 82Z"/><path d="M148 104Q196 74 190 36Q160 52 142 82Z"/></g>
<g stroke="#6e0c3c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" fill="none"><path d="M82 64Q72 38 62 28"/><path d="M118 64Q128 38 138 28"/></g>
      <circle cx="62" cy="27" r="8" fill="#42f045" stroke="#6e0c3c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="138" cy="27" r="8" fill="#42f045" stroke="#6e0c3c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<circle cx="100" cy="112" r="58" fill="#d61f77" stroke="#6e0c3c" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<path d="M74 136L85 124L96 136L107 124L118 136L126 128" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>

</g>

</svg>
```

#### Boss #97: **Puddingar**
- **Tema / Elemen**: manis / `light` · **Tier Bawaan**: `rare`
- **Anatomi Visual**: Body: `egg` | Head: `none` | Eyes: `one` | Mouth: `tongue` | Extra: `cheeks`
- **Warna HSL**: `hsl(338, 75%, 56%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Puddingar" data-tier="rare">
<defs>
  <clipPath id="clip-m97"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="rare-aura-97" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-rare" cx="100" cy="110" r="82" fill="url(#rare-aura-97)"/>
<g class="monster-body">


<ellipse cx="100" cy="112" rx="50" ry="64" fill="#e33b78" stroke="#931040" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="100" cy="98" r="25" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="100" cy="101" r="12.5" fill="#2b1b3d"/><circle cx="95.5" cy="96" r="4" fill="#fff"/></g>
<path d="M80 130Q100 150 120 130" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="146" rx="9" ry="11" fill="#ff6b8a" stroke="#3b1020" stroke-width="3"/>

</g>

</svg>
```

#### Boss #98: **Jellybon**
- **Tema / Elemen**: manis / `light` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `ghost` | Head: `horns` | Eyes: `sleepy` | Mouth: `smile` | Extra: `arms`
- **Warna HSL**: `hsl(345, 75%, 64%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Jellybon" data-tier="epic">
<defs>
  <clipPath id="clip-m98"><path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" /></clipPath>
  <radialGradient id="epic-aura-98" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-98)"/>
<g class="monster-body">

<g fill="#42f06e" stroke="#b8143d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<path d="M44 170V100C44 62 70 48 100 48C130 48 156 62 156 100V170L138 156L120 170L100 156L80 170L62 156Z" fill="#e85e81" stroke="#b8143d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>

<g fill="#e85e81" stroke="#b8143d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="40" cy="132" rx="12" ry="22" transform="rotate(25 40 132)"/><ellipse cx="160" cy="132" rx="12" ry="22" transform="rotate(-25 160 132)"/></g>
<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<path d="M80 132Q100 154 120 132" stroke="#3b1020" stroke-width="6" fill="none" stroke-linecap="round"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #99: **Wafelor**
- **Tema / Elemen**: manis / `light` · **Tier Bawaan**: `epic`
- **Anatomi Visual**: Body: `egg` | Head: `mohawk` | Eyes: `sleepy` | Mouth: `open` | Extra: `none`
- **Warna HSL**: `hsl(352, 75%, 52%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Wafelor" data-tier="epic">
<defs>
  <clipPath id="clip-m99"><ellipse cx="100" cy="112" rx="50" ry="64" /></clipPath>
  <radialGradient id="epic-aura-99" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#a855f7" stop-opacity="0.6"/>
  <stop offset="100%" stop-color="#a855f7" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-epic" cx="100" cy="110" r="86" fill="url(#epic-aura-99)"/>
<g class="monster-body">

<path d="M86 66Q80 34 94 22Q98 42 104 28Q120 42 114 66Z" fill="#42f082" stroke="#810e1e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<ellipse cx="100" cy="112" rx="50" ry="64" fill="#e02941" stroke="#810e1e" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>


<g class="eyes"><path d="M60 98Q76 112 92 98M108 98Q124 112 140 98" stroke="#2b1b3d" stroke-width="6" fill="none" stroke-linecap="round"/></g>
<ellipse cx="100" cy="138" rx="16" ry="14" fill="#3b1020"/><ellipse cx="100" cy="146" rx="9" ry="6" fill="#ff6b8a"/>

</g>
<g class="tier-sparks" fill="#e9d5ff">
  <polygon points="40,65 43,70 48,72 43,74 40,79 37,74 32,72 37,70" opacity="0.85"/>
  <polygon points="160,55 162,59 166,61 162,63 160,67 158,63 154,61 158,59" opacity="0.85"/>
  <polygon points="165,130 167,133 170,135 167,137 165,140 163,137 160,135 163,133" opacity="0.75"/>
  <polygon points="35,135 37,138 40,140 37,142 35,145 33,142 30,140 33,138" opacity="0.75"/>
</g>
</svg>
```

#### Boss #100: **Gulalon**
- **Tema / Elemen**: manis / `light` · **Tier Bawaan**: `legend`
- **Anatomi Visual**: Body: `round` | Head: `horns` | Eyes: `angry` | Mouth: `teeth` | Extra: `cheeks`
- **Warna HSL**: `hsl(359, 75%, 60%)`
- **Kode SVG Rendered**:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"  role="img" aria-label="Gulalon" data-tier="legend">
<defs>
  <clipPath id="clip-m100"><circle cx="100" cy="112" r="58" /></clipPath>
  <radialGradient id="legend-aura-100" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.7"/>
  <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
</radialGradient>
</defs>
<ellipse cx="100" cy="184" rx="58" ry="8" fill="#000" opacity=".18"/>
<circle class="aura-legend" cx="100" cy="110" r="90" fill="url(#legend-aura-100)"/>
<g class="monster-body">

<g fill="#42f096" stroke="#a51215" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"><path d="M68 72Q56 42 46 36Q76 38 90 64Z"/><path d="M132 72Q144 42 154 36Q124 38 110 64Z"/></g>
<circle cx="100" cy="112" r="58" fill="#e64c4f" stroke="#a51215" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<g fill="#ff8fa3" opacity=".65"><circle cx="60" cy="118" r="10"/><circle cx="140" cy="118" r="10"/></g>

<g class="eyes"><circle cx="76" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="79" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="76.66" cy="97.4" r="2.08" fill="#fff"/><circle cx="124" cy="98" r="13" fill="#fff" stroke="#2b1b3d" stroke-width="3"/><circle cx="121" cy="100" r="6.5" fill="#2b1b3d"/><circle cx="118.66" cy="97.4" r="2.08" fill="#fff"/><path d="M56 76L92 90M144 76L108 90" stroke="#2b1b3d" stroke-width="7" stroke-linecap="round"/></g>
<rect x="78" y="126" width="44" height="24" rx="9" fill="#3b1020"/>
      <g fill="#fff"><rect x="82" y="127" width="8" height="9" rx="2"/><rect x="92" y="127" width="8" height="9" rx="2"/><rect x="102" y="127" width="8" height="9" rx="2"/><rect x="110" y="127" width="8" height="9" rx="2"/></g>
<g class="tier-crown" fill="#fbbf24" stroke="#78350f" stroke-width="2" stroke-linejoin="round">
  <polygon points="85,32 80,16 90,23 100,12 110,23 120,16 115,32"/>
  <circle cx="80" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="12" r="3" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="120" cy="16" r="2.5" fill="#fef08a" stroke="#78350f" stroke-width="1"/>
  <circle cx="100" cy="23" r="2" fill="#ef4444"/>
</g>
</g>
<g class="tier-sparks legend-sparks" fill="#fef08a">
  <polygon points="45,45 48,51 54,54 48,57 45,63 42,57 36,54 42,51"/>
  <polygon points="155,42 158,47 163,50 158,53 155,58 152,53 147,50 152,47"/>
  <polygon points="168,110 170,114 174,116 170,118 168,122 166,118 162,116 166,114"/>
  <polygon points="32,110 34,114 38,116 34,118 32,122 30,118 26,116 30,114"/>
</g>
</svg>
```

---
*Dokumen diekspor secara komprehensif dari arsitektur game https://play.printshare.my.id/ pada 2026-11-07T03:02:06.848Z.*
