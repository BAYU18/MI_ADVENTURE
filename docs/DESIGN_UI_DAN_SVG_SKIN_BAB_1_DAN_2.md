# Desain UI & Kode Lengkap SVG Skin Avatar (BAB 1 & BAB 2) — Petualangan Pelajar (play.printshare.my.id)

> **Spesifikasi Teknis (BAB 1 & BAB 2):** Dokumen ini memuat arsitektur antarmuka pengguna (UI Battle, Dex, Profil) serta seluruh kode visual SVG komponen skin avatar pemain, modular props, dan 5 set sinergi lengkap.
> 
> - **URL Game**: https://play.printshare.my.id/
> - **Runtime & Engine**: Node.js v22.23.1 · SQLite (node:sqlite) · UMD SVG Renderers
> - **Total Boss**: 100 Boss Monster (10 Elemen x 10 Boss)
> - **Total Item Skin**: 43 Item Avatar (8 Hat, 6 Outfit, 5 Weapon, 6 Frame, 6 BG, 6 Pet, 6 Title)
> - **Versi Arsitektur**: v7.2 (Terbaru per November 2026)

---

## DAFTAR ISI
1. [BAB 1: Desain UI (User Interface) Layar Pertempuran, Monster Dex, & Avatar](#bab-1-desain-ui-layar-pertempuran-monster-dex--avatar)
   - [1.1 UI Layar Pertempuran (Battle Screen) & 3 Opsi Tata Letak](#11-ui-layar-pertempuran-battle-screen--3-opsi-tata-letak)
   - [1.2 Struktur Komponen DOM & Kode CSS Battle Screen](#12-struktur-komponen-dom--kode-css-battle-screen)
   - [1.3 UI Layar Monster Dex (Katalog Kartu 1 Baris)](#13-ui-layar-monster-dex-katalog-kartu-1-baris)
   - [1.4 UI Layar Profil Pemain & 3 Slot Showcase Lencana](#14-ui-layar-profil-pemain--3-slot-showcase-lencana)
2. [BAB 2: Desain & Kode SVG Komponen Skin Avatar](#bab-2-desain--kode-svg-komponen-skin-avatar)
   - [2.1 Arsitektur Renderer SVG Avatar (shared/avatar.js)](#21-arsitektur-renderer-svg-avatar)
   - [2.2 Kode SVG Seluruh Topi (HAT - 8 Item)](#22-kode-svg-seluruh-topi-hat)
   - [2.3 Kode SVG Seluruh Pakaian (OUTFIT - 6 Item)](#23-kode-svg-seluruh-pakaian-outfit)
   - [2.4 Kode SVG Seluruh Senjata / Aksesori Tangan (WEAPON - 5 Item)](#24-kode-svg-seluruh-senjata-weapon)
   - [2.5 Kode SVG Seluruh Bingkai Avatar (FRAME - 6 Item)](#25-kode-svg-seluruh-bingkai-frame)
   - [2.6 Kode SVG Gradien Latar Belakang (BG - 6 Item)](#26-kode-svg-gradien-latar-belakang-bg)
   - [2.7 Spesifikasi Hewan Peliharaan Twemoji (PET - 6 Item)](#27-spesifikasi-hewan-peliharaan-pet)
   - [2.8 Kode SVG Utuh 5 Set Skin Sinergi Lengkap](#28-kode-svg-utuh-5-set-skin-sinergi-lengkap)


---

## BAB 1: Desain UI Layar Pertempuran, Monster Dex, & Avatar

### 1.1 UI Layar Pertempuran (Battle Screen) & 3 Opsi Tata Letak

Game menyediakan 3 pilihan mode tata letak battle yang dapat disetel langsung oleh pemain melalui ikon gerigi (`#btn-battle-settings`):

#### Opsi 1: Mode Klasik (Default)
Mengutamakan keseimbangan visual antara aksi pertarungan monster dan pembacaan soal secara vertikal.

```
┌──────────────────────────────────────────┐  ◄─── LAYAR MOBILE PORTRAIT (Classic)
│ [✕]  ⚡ 3/5  [Soal 4/10]  🛡️ 10  ❤️ 85/100 │  Top Bar Ringkas (~40px)
├──────────────────────────────────────────┤
│           STAGE MONSTER BOS              │
│       [   SVG MONSTER KANVAS   ]         │  Monster Stage Dinamis (~180px)
│      Jamurgon (Lv 3) · Elemen Hutan      │  Nama, Elemen & Rarity Badge
│  [HP BOS: ██████████████████░░ 280/340]  │  HP Bar Gradien & Sisa Target Jawaban
│      ⚠️ Boss Telegraph Banner (Jurus)    │  Banner Peringatan Serangan (aria-live)
├──────────────────────────────────────────┤
│ ════════════════════════════════════════ │  Timer Bar Oranye Dinamis (~6px)
├──────────────────────────────────────────┤
│ [🎯 TITIK LEMAH] [🔊 BACA]               │  Header Soal & Aksi
│ Apa fungsi klorofil pada daun tumbuhan?  │  Area Pertanyaan Jelas & Terbuka
│                                          │  (Mendukung teks panjang & gambar)
├──────────────────────────────────────────┤
│ [A] Menyerap sinar matahari untuk makan  │
│ [B] Menghasilkan embun pada pagi hari    │  Tombol Pilihan Jawaban
│ [C] Melindungi akar dari hama serangga   │  (Sentuhan Luas & Anti-Meleset)
│ [D] Menyimpan cadangan udara di daun     │
├──────────────────────────────────────────┤
│ [🛡️ Perisai] [💨 Hindaran] [⚡ Pulihkan] │  Bar Aksi Skill Cepat Pemain (~44px)
└──────────────────────────────────────────┘
```

#### Opsi 2: Mode Bottom Sheet (Fokus Membaca Soal)
Dirancang untuk ponsel kecil atau mata pelajaran dengan narasi bacaan panjang (Bahasa Indonesia / IPA). Pertanyaan berada di panel lembaran bawah yang lapang.

```
┌──────────────────────────────────────────┐  ◄─── MODE BOTTOM SHEET
│ [✕] ⚡ 5/5   Jamurgon (Hutan)   ❤️ 100    │  Header Ringkas Terpadu (~36px)
│ [HP BOS: ████████████████████ 340/340]   │  HP Bar Kompak 8px
├──────────────────────────────────────────┤
│        [ SVG BOS SKALA MINI ]            │  Area Stage Diperkecil (~110px)
│    Status: 💤 Serbuk Lelap Aktif         │  Chip Status Minimalis
├──────────────────────────────────────────┤
│ ╭──────────────────────────────────────╮ │  BOTTOM SHEET (Scrollable)
│ │ 📖 BACAAN CERITA & SOAL               │ │  Area Teks Mengambil 65% Layar
│ │ "Pada suatu pagi lebah terbang..."   │ │  Pemain leluasa membaca tanpa
│ │ Berdasarkan teks di atas, mengapa... │ │  terhalang kartu monster besar.
│ │                                      │ │
│ │ [A] Mencari nektar bunga             │ │
│ │ [B] Membangun sarang baru            │ │
│ │ [C] Menghindari hujan lebat          │ │
│ │ [D] Bermain bersama kawanannya       │ │
│ ╰──────────────────────────────────────╯ │
└──────────────────────────────────────────┘
```

#### Opsi 3: Mode Compact (Ultra-Ringkas 1 Layar Penuh)
Pilihan bagi pemain cepat (speed-runners): semua elemen dimampatkan ke dalam satu layar tanpa scroll vertikal sama sekali.

```
┌──────────────────────────────────────────┐  ◄─── MODE COMPACT
│ [✕] ⚡ 4/5 [BOS: 250/340] [TIMER 12s] ❤️90│  Single-line Global Status Bar
├──────────────────────────────────────────┤
│ [Mini SVG] Jamurgon | Soal 3/10 | Hutan  │  Inline Boss Info (~50px)
├──────────────────────────────────────────┤
│ Pertanyaan: Simbiosis mutualisme terjadi │  Kotak Teks Soal Efisien (~60px)
│ antara makhluk hidup yang saling...?     │
├──────────────────────────────────────────┤
│ [A] Menguntungkan   │ [B] Merugikan      │  2x2 Grid Tombol Jawaban!
│ [C] Menumpang saja  │ [D] Memangsa       │  (Sangat hemat ruang vertikal)
├──────────────────────────────────────────┤
│ [🛡️ +10] [⚡ Heal] [🗡️ Tebas] [💨 Hindar] │  Bottom Compact Skills
└──────────────────────────────────────────┘
```

---

### 1.2 Struktur Komponen DOM & Kode CSS Battle Screen

Komponen pertempuran diatur secara semantik di `public/index.html` dan `public/style.css`:

```html
<!-- Snippet Komponen Layar Pertempuran Mobile -->
<section id="screen-battle" class="screen">
  <!-- Top HUD Bar -->
  <header class="battle-hud">
    <button id="btn-battle-quit" class="btn-icon" aria-label="Keluar">✕</button>
    <div class="hud-energy"><span class="energy-icon">⚡</span> <span id="hud-energy-val">3/5</span></div>
    <div class="hud-progress"><span id="hud-qnum">Soal 1/10</span></div>
    <div class="hud-shield"><span class="shield-icon">🛡️</span> <span id="hud-shield-val">0</span></div>
    <div class="hud-player-hp"><span class="hp-icon">❤️</span> <span id="hud-hp-val">100/100</span></div>
    <button id="btn-battle-settings" class="btn-icon" aria-label="Pengaturan">⚙️</button>
  </header>

  <!-- Monster Canvas & Stage -->
  <div id="battle-monster-stage" class="monster-stage">
    <div id="monster-svg-container" class="monster-svg-box">
      <!-- Injeksi Dinamis renderMonster(boss) -->
    </div>
    <div class="monster-info-bar">
      <h3 id="monster-name" class="boss-title">Jamurgon</h3>
      <span id="monster-element-badge" class="element-badge badge-nature">🌿 Hutan</span>
      <span id="monster-tier-badge" class="tier-badge tier-common">Common</span>
    </div>
    <div class="boss-hp-track">
      <div id="boss-hp-fill" class="boss-hp-fill" style="width: 100%;"></div>
      <span id="boss-hp-label" class="boss-hp-label">340 / 340</span>
    </div>
    <div id="boss-telegraph-banner" class="boss-telegraph-banner hidden" aria-live="polite">
      ⚠️ <span id="telegraph-text">Boss bersiap melancarkan Amarah Membara!</span>
    </div>
  </div>

  <!-- Dynamic Notification Stream -->
  <div id="battle-notification-stream" class="notification-stream" aria-live="polite"></div>

  <!-- Question & Answer Area -->
  <div id="battle-question-box" class="question-container layout-classic">
    <div class="timer-bar"><div id="timer-fill" class="timer-fill"></div></div>
    <div class="question-header">
      <span id="tag-weakness" class="tag-weakness hidden">🎯 Titik Lemah</span>
      <button id="btn-tts-read" class="btn-icon-small" title="Bacakan Soal">🔊</button>
    </div>
    <div id="question-text" class="question-body"></div>
    <div id="options-container" class="options-grid"></div>
  </div>

  <!-- Player Battle Actions & Skills -->
  <nav class="battle-skills-bar" id="battle-skills-bar"></nav>
</section>
```

#### Kode CSS Penting: Teks Berkontur Tajam & Transisi Notifikasi
```css
/* Outline 4-Arah Tajam untuk Angka & Teks Kritis */
.damage-floater, .battle-hud, .boss-hp-label {
  text-shadow:
    -2px -2px 0 #000,
     2px -2px 0 #000,
    -2px  2px 0 #000,
     2px  2px 0 #000,
     0px  3px 6px rgba(0,0,0,0.85);
  font-weight: 800;
  letter-spacing: 0.5px;
}

/* Koreografi Notifikasi Keluar (Animated Exit) */
.battle-notification {
  animation: notifSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.battle-notification.exiting {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

@keyframes notifSlideIn {
  from { opacity: 0; transform: translateY(14px) scale(0.92); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Animasi Sayatan Tebasan Super */
.slash-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.9) 50%, transparent 60%);
  animation: slashEffect 0.35s ease-out forwards;
}
@keyframes slashEffect {
  0% { transform: scale(0.6) rotate(-25deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
  100% { transform: scale(1.4) rotate(15deg); opacity: 0; }
}
```

---

### 1.3 UI Layar Monster Dex (Katalog Kartu 1 Baris)

Monster Dex (`public/js/dexcards.js`) menggunakan tata letak **1 baris = 1 kartu**, tanpa pemotongan teks, menampilkan 40 kombinasi elemen x tier (atau seluruh 100 boss).

```
┌─────────────────────────────────────────────────────────────┐  ◄─── MONSTER DEX CARD
│ [ MINI SVG ]  #03 JAMURGON                         [COMMON] │  Header Kartu
│   (🌿 Hutan)  "Raksasa jamur berspora lelap..."    [⚔️ x4]  │  Ikon Elemen & Total Menang
├─────────────────────────────────────────────────────────────┤
│ 💀 MODE BRUTAL: [ SAKELAR ON/OFF ] (Pratinjau Nilai ×2)      │  Kalkulator Interaktif
├─────────────────────────────────────────────────────────────┤
│ JURUS & KEMAMPUAN:                                          │  Semua Jurus Tampil Utuh
│ 💤 Serbuk Lelap (DoT) : Tiap salah jawab, HP -8% selama 2x   │  (Tanpa "...")
│ 🌿 Duri Rimba         : Menembus 20% Perisai Pemain         │
└─────────────────────────────────────────────────────────────┘
```

- **Siluet Monster Belum Ditemui**: Menggunakan filter CSS SVG `brightness(0) saturate(100%)` untuk menampilkan siluet hitam misterius namun tetap mempertahankan garis bentuk aslinya.

---

### 1.4 UI Layar Profil Pemain & 3 Slot Showcase Lencana

Layar profil memadukan avatar SVG ter-render dinamis, 3 lencana prestise pilihan, serta atribut RPG:

```
┌─────────────────────────────────────────────────────────────┐  ◄─── PROFIL PEMAIN
│   ┌───────────────┐                                         │
│   │               │   ARUNA PRAMUDITA                       │  Nama & Level
│   │  AVATAR SVG   │   Level 14 · Petualang Tangguh          │
│   │   KOMPLIT     │   ⭐ 128 Bintang  ·  ⚡ Kombo 12        │
│   │               │                                         │
│   └───────────────┘   [ 🛡️ +25 Perisai ] [ 🪙 +5% Drop ]    │  Buff Aktif dari Skin
├─────────────────────────────────────────────────────────────┤
│ 🏆 SHOWCASE 3 LENCANA PRESTASI PILIHAN:                     │  3 Slot Lencana Profil
│ ┌──────────────┐   ┌──────────────┐   ┌──────────────┐      │
│ │ [SVG BADGE]  │   │ [SVG BADGE]  │   │ [SVG BADGE]  │      │
│ │ Pembasmi Bos │   │ Juara Kombo  │   │ Rajin Belajar│      │
│ │ Tier Emas 🥇 │   │ Tier Plat 💎 │   │ Tier Perak 🥈│      │
│ └──────────────┘   └──────────────┘   └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

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

---
*Dokumen BAB 1 dan BAB 2 diekstrak secara spesifik dari spesifikasi https://play.printshare.my.id/ pada 2026-11-07T03:16:13.300Z.*
