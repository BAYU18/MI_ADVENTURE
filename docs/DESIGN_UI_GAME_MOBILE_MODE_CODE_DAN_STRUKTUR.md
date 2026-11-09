# 📱 DESAIN UI LENGKAP MODE MOBILE (KODE & STRUKTUR)
**Game Edukasi RPG**: *Petualangan Pelajar* ([https://play.printshare.my.id/](https://play.printshare.my.id/))  
**Target Dokumen**: `DESIGN_UI_GAME_MOBILE_MODE_CODE_DAN_STRUKTUR.md`  
**Kategori**: Arsitektur Antarmuka Mobile, Responsive CSS, Wireframe Layar, DOM Component Structure & State Logic  
**Target Layar Perangkat**: Smartphone Portrait (Resolusi 360×640, 390×844, 412×915 px)  
**Versi UI Engine**: Mobile UI Framework v7.2 (W3C CSS3 Modern, Vanilla JS SPA, SVG Lossless)

---

## 📖 DAFTAR ISI
1. [Arsitektur Fondasi & Shell Antarmuka Mobile](#1-arsitektur-fondasi--shell-antarmuka-mobile)
   - [1.1 Pengaturan Viewport PWA & Safe Area Insets](#11-pengaturan-viewport-pwa--safe-area-insets)
   - [1.2 Struktur DOM Induk Aplikasi SPA (`#app`)](#12-struktur-dom-induk-aplikasi-spa-app)
   - [1.3 Sistem Variabel CSS & Skema Warna Mobile](#13-sistem-variabel-css--skema-warna-mobile)
   - [1.4 Router Layar SPA Mobile (`go(screenName, params)`)](#14-router-layar-spa-mobile-goscreenname-params)
2. [Layar 1: Autentikasi & Masuk Siswa (`Screens.auth`)](#2-layar-1-autentikasi--masuk-siswa-screensauth)
3. [Layar 2: Beranda & Lobi Utama Siswa (`Screens.home`)](#3-layar-2-beranda--lobi-utama-siswa-screenshome)
4. [Layar 3: Peta Wilayah & Peta Bab Kampanye (`Screens.subjects` / `peta`)](#4-layar-3-peta-wilayah--peta-bab-kampanye-screenssubjects--peta)
5. [Layar 4: Arena Pertempuran Kuis & Bos Monster (`Screens.battle`)](#5-layar-4-arena-pertempuran-kuis--bos-monster-screensbattle)
   - [5.1 Layout Opsi 1: Mode Klasik (Default)](#51-layout-opsi-1-mode-klasik-default)
   - [5.2 Layout Opsi 2: Mode Baca Penuh + Lembar Jawaban (Bottom Sheet)](#52-layout-opsi-2-mode-baca-penuh--lembar-jawaban-bottom-sheet)
   - [5.3 Layout Opsi 3: Mode Kompak Adaptif (Zero-Scroll Smart Grid 2×2)](#53-layout-opsi-3-mode-kompak-adaptif-zero-scroll-smart-grid-22)
   - [5.4 Adaptasi Keyboard Virtual Ponsel (`.mobile-keyboard-active`)](#54-adaptasi-keyboard-virtual-ponsel-mobile-keyboard-active)
   - [5.5 Sistem Tombol Skill Melayang (Skill FAB & Bubble Tray)](#55-sistem-tombol-skill-melayang-skill-fab--bubble-tray)
6. [Layar 5: Hasil Pertempuran & Selebrasi Kemenangan (`Screens.result`)](#6-layar-5-hasil-pertempuran--selebrasi-kemenangan-screensresult)
7. [Layar 6: Lemari Kostum & Kustomisasi Avatar SVG (`Screens.profil` / Wardrobe)](#7-layar-6-lemari-kostum--kustomisasi-avatar-svg-screensprofil--wardrobe)
8. [Layar 7: Toko Perlengkapan & Peti Gacha Regional (`Screens.shop`)](#8-layar-7-toko-perlengkapan--peti-gacha-regional-screensshop)
9. [Layar 8: Arena Duel 1v1 PvP Realtime (`Screens.duel`)](#9-layar-8-arena-duel-1v1-pvp-realtime-screensduel)
10. [Layar 9: Monster Dex & Ensiklopedia 100 Bos (`Screens.dex`)](#10-layar-9-monster-dex--ensiklopedia-100-bos-screensdex)
11. [Layar 10: Profil Siswa & Pameran Lencana Prestasi (`Screens.profil` / Showcase)](#11-layar-10-profil-siswa--pameran-lencana-prestasi-screensprofil--showcase)
12. [Layar 11: Laporan Belajar Mingguan & Radar Titik Lemah (`Screens.report`)](#12-layar-11-laporan-belajar-mingguan--radar-titik-lemah-screensreport)
13. [Layar 12: Pengaturan Tampilan & Aksesibilitas (`Screens.settings`)](#13-layar-12-pengaturan-tampilan--aksesibilitas-screenssettings)
14. [Kompilasi Komponen UI Mobile Reusable (FAB, Drawer, Modal, Toast)](#14-kompilasi-komponen-ui-mobile-reusable-fab-drawer-modal-toast)
15. [Standar Ergonomi Layar Sentuh & Thumb Zone Pelajar SD](#15-standar-ergonomi-layar-sentuh--thumb-zone-pelajar-sd)

---

## 1. Arsitektur Fondasi & Shell Antarmuka Mobile

Game *Petualangan Pelajar* dirancang menggunakan paradigma **Mobile-First PWA (Progressive Web Application)**. Antarmuka secara alami beradaptasi dengan dimensi ponsel pintar anak-anak (360px – 430px lebar layar) serta mendukung orientasi *portrait* tanpa horizontal scroll.

### 1.1 Pengaturan Viewport PWA & Safe Area Insets

Konfigurasi viewport HTML pada [`public/index.html`](file:///home/maman/play/public/index.html):
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#1e1b4b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### 1.2 Struktur DOM Induk Aplikasi SPA (`#app`)

Di dalam file [`public/index.html`](file:///home/maman/play/public/index.html), seluruh layar dirender secara dinamis di dalam satu kontainer utama:
```html
<body>
  <!-- Kontainer Utama Layar Game Mobile -->
  <div id="app" data-testid="screen-home" class="m-play" aria-live="polite"></div>

  <!-- Sistem Pesan Notifikasi Mengambang -->
  <div id="toast" role="status" aria-live="polite"></div>
</body>
```

### 1.3 Sistem Variabel CSS & Skema Warna Mobile

Variabel dasar CSS pada [`public/css/style.css`](file:///home/maman/play/public/css/style.css):
```css
:root {
  --c-bg: #0f172a;               /* Latar belakang gelap ramah mata */
  --c-surface: #1e293b;          /* Permukaan kartu & kontainer */
  --c-surface-hover: #334155;    /* Interaksi hover / tap */
  --c-primary: #38bdf8;          /* Biru Cyan Utama */
  --c-good: #22c55e;             /* Hijau Jawaban Benar / HP */
  --c-bad: #ef4444;              /* Merah Jawaban Salah / Bahaya */
  --c-accent: #f59e0b;           /* Kuning Emas Energi & Bintang */
  --c-text: #f8fafc;             /* Teks Putih Kontras */
  --c-muted: #94a3b8;            /* Teks Keterangan Sekunder */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-pill: 9999px;
  --pad: 12px;
}

/* Shell Kontainer Utama Layar Mobile */
body {
  margin: 0;
  padding: 0;
  background: var(--c-bg);
  color: var(--c-text);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  overflow: hidden;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}

#app.m-play {
  width: 100vw;
  max-width: 520px;              /* Batas maksimal di perangkat tablet */
  margin: 0 auto;
  height: 100dvh;                /* Dynamic Viewport Height mengatasi toolbar browser */
  display: flex;
  flex-direction: column;
  position: relative;
  background: radial-gradient(circle at top center, #1e1b4b 0%, #0f172a 100%);
}

.screen {
  flex: 1;
  min-height: 0;
  height: 100dvh;
  max-height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  display: none;
  flex-direction: column;
  padding: calc(var(--pad) + env(safe-area-inset-top)) var(--pad) calc(var(--pad) + env(safe-area-inset-bottom));
  animation: screenIn .25s ease;
}

.screen.active {
  display: flex;
}

@keyframes screenIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
```

### 1.4 Router Layar SPA Mobile (`go(screenName, params)`)

Implementasi transisi antar-layar di [`public/js/app.js`](file:///home/maman/play/public/js/app.js):
```javascript
const Screens = window.Screens || {};
window.Screens = Screens;

function go(name, params = {}) {
  window.go = go;
  if (name !== 'auth' && !Player.data) {
    return go('auth');
  }
  const prev = Screens.current;
  if (prev && Screens[prev] && Screens[prev].destroy) Screens[prev].destroy();
  if (window.Sfx) Sfx.stopSpeak();
  Screens.current = name;
  const app = document.getElementById('app');
  app.innerHTML = '';
  if (Screens[name] && Screens[name].render) {
    Screens[name].render(app, params);
  } else {
    app.innerHTML = `
      <div class="screen active center-col">
        <p>Halaman ${name} tidak ditemukan</p>
        <button class="btn primary" onclick="go('home')">Kembali ke Beranda</button>
      </div>`;
  }
}
```

---

## 2. Layar 1: Autentikasi & Masuk Siswa (`Screens.auth`)

Layar masuk dirancang sangat simpel untuk anak usia SD: memilih nama karakter avatar dari daftar kelas atau mendaftar baru dengan tombol input yang besar.

### 🖼️ Wireframe Mobile Portrait:
```
┌──────────────────────────────────────────┐  ◄── 390px (Layar Ponsel)
│                                          │
│             🏰 PETUALANGAN               │
│                 PELAJAR                  │  Logo Game & Maskot
│          [ 🐲 Monster Svg 90px ]         │
│                                          │
├──────────────────────────────────────────┤
│  ┌──────────────────┬──────────────────┐ │
│  │   [ Masuk ]      │    [ Daftar ]    │ │  Tab Segmented Control
│  └──────────────────┴──────────────────┘ │
│                                          │
│  Pilih Kelas:                            │
│  [ Kelas 4 SD ▾                        ] │  Dropdown Sentuh Nyaman (48px)
│                                          │
│  Pilih Nama Karakter:                    │
│  [ Budi Santoso ▾                      ] │  Pemilih Profil Siswa
│                                          │
│  Kata Sandi / PIN Ceria:                 │
│  [ * * * *                             ] │  Input Kode PIN Simpel
│                                          │
│  ┌────────────────────────────────────┐  │
│  │     🚀  MULAI BERPETUALANG!        │  │  Tombol CTA Utama
│  └────────────────────────────────────┘  │  (Tinggi 54px, Full Width)
└──────────────────────────────────────────┘
```

### 💻 Kode Struktur Komponen DOM & Renderer:
```javascript
Screens.auth = {
  activeTab: 'login',
  render(app) {
    app.innerHTML = `
      <section class="screen active center-col stack auth-screen">
        <div class="auth-header text-center">
          <div class="hero-brand-svg">${Monsters.renderMonster(Monsters.MONSTERS[0], { size: 90 })}</div>
          <h1 class="brand-title">Petualangan Pelajar</h1>
          <p class="brand-sub">Game Kuis RPG Pelajar Cerdas</p>
        </div>

        <div class="auth-card-mobile">
          <div class="tab-pill-group">
            <button class="tab-pill ${this.activeTab === 'login' ? 'active' : ''}" id="tab-login">Masuk</button>
            <button class="tab-pill ${this.activeTab === 'register' ? 'active' : ''}" id="tab-register">Daftar Baru</button>
          </div>

          <form id="form-auth" class="stack">
            <label class="form-group">
              <span class="label-text">Pilih Kelasmu</span>
              <select id="auth-class" class="mobile-input-select" required></select>
            </label>

            <div id="auth-fields-slot"></div>

            <button type="submit" class="btn primary btn-cta-block" id="btn-submit-auth">
              🚀 Mulai Bermain!
            </button>
          </form>
        </div>
      </section>
    `;
    this.bindEvents();
  }
};
```

---

## 3. Layar 2: Beranda & Lobi Utama Siswa (`Screens.home`)

Lobi utama menyajikan status hero (level, koin, XP), maskot dinamis yang bersuara saat disentuh, serta kisi navigasi ubin 2 kolom (*Responsive Home Tiles Grid*).

### 🖼️ Wireframe Mobile Portrait:
```
┌──────────────────────────────────────────┐
│ ┌──────────────────────────────────────┐ │  ◄── Banner Siswa (~60px)
│ │ [Avt] Bayu Pratama · Lv. 5           │ │      Avatar SVG + Progress XP
│ │       🪙 1.450 Koin · [Ganti Akun]   │ │
│ │       [XP: ██████████░░░ 78%]        │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│                                          │
│       [ 🐲 MASKOT BOSS AKTIF SVG ]       │  Area Panggung Maskot (~120px)
│           "Halo, siap belajar?"          │  (Bersuara jika disentuh)
│                                          │
├──────────────────────────────────────────┤
│ ┌──────────────────┬──────────────────┐  │  ◄── UBIN MENU RESPONSIF (2 Kolom)
│ │  ⚔️ Petualangan  │  👥 Pertemanan   │  │      Tinggi min. 72px per ubin,
│ │     Lawan Bos    │     Duel & Teman │  │      Ikon besar & teks mudah dibaca
│ ├──────────────────┼──────────────────┤  │
│ │  📚 Latihan Bebas│  📊 Laporanku    │  │
│ │     Kuis Santai  │     Stat Belajar │  │
│ ├──────────────────┼──────────────────┤  │
│ │  👤 Profil Hero  │  🎒 Lemari Skin  │  │
│ │     Stat & Gelar │     Kustom Avatar│  │
│ ├──────────────────┼──────────────────┤  │
│ │  ⚡ 10 Skill RPG │  🛒 Toko Harta   │  │
│ │     Atur Taktik  │     Peti & Item  │  │
│ ├──────────────────┼──────────────────┤  │
│ │  📖 Monsterdex   │  ⚙️ Pengaturan   │  │
│ │     100 Monster  │     Suara & Tipe │  │
│ └──────────────────┴──────────────────┘  │
│         [ 🛡️ Menu Guru / Admin ]         │
└──────────────────────────────────────────┘
```

### 💻 Kode CSS Kunci Kisi Menu Beranda Mobile:
```css
.home-tiles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 440px;
  margin: 6px auto;
}

.menu-tile {
  background: rgba(30, 41, 59, 0.85);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius-md);
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.15s ease, background 0.15s ease;
  position: relative;
  min-height: 74px;
}

.menu-tile:active {
  transform: scale(0.95);
  background: rgba(56, 189, 248, 0.15);
  border-color: var(--c-primary);
}

.menu-tile.highlight {
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.4), rgba(30, 27, 75, 0.8));
  border-color: var(--c-primary);
  box-shadow: 0 4px 16px rgba(2, 132, 199, 0.35);
}

.menu-tile .tile-icon { font-size: 1.6rem; }
.menu-tile .tile-title { font-size: 0.95rem; font-weight: 800; }
.menu-tile .tile-desc { font-size: 0.72rem; color: var(--c-muted); }
```

---

## 4. Layar 3: Peta Wilayah & Peta Bab Kampanye (`Screens.subjects` / `peta`)

Layar pemilihan arena petualangan dengan sistem pemilihan mata pelajaran (Wilayah) dan lintasan simpul cerita (*Campaign Node Path*).

### 🖼️ Wireframe Mobile:
```
┌──────────────────────────────────────────┐
│ [⬅ Beranda]    🗺️ PETA PETUALANGAN [⚡ 5] │  Top Header
├──────────────────────────────────────────┤
│ [🔥 Api] [🌿 Rimba] [❄️ Salju] [⚡ Petir]  │  Slider Wilayah Horizontal
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ 📖 Bab 1: Hutan Jamur Terlarang      │ │  Banner Informasi Bab
│ │ Progres: ⭐ 8/9 Bintang Tercapai     │ │
│ └──────────────────────────────────────┘ │
│                                          │
│        ( 1 )  Simpul 1: Penjaga Hutan    │  Path Simpul Cerita (Vertical Stepper)
│          │    [ ⭐⭐⭐ ]                 │
│          ▼                               │
│        ( 2 )  Simpul 2: Duri Beracun     │
│          │    [ ⭐⭐☆ ]                 │
│          ▼                               │
│       [ 👑 ]  Simpul 3: RAJA JAMURGON    │  Boss Node Akhir Bab
│               [ Buka Komik & Hadiah ]    │
│                                          │
│  [☑️ Mode Brutal (Damage 2x, Hadiah 3x)] │  Toggle Brutal Mode
│  ┌────────────────────────────────────┐  │
│  │      ⚔️  TANTANG SIMPUL INI!        │  │  Tombol Mulai Sesi
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---


## 5. Layar 4: Arena Pertempuran Kuis & Bos Monster (`Screens.battle`)

Layar Pertempuran adalah inti pengalaman bermain (*core gameplay loop*). Untuk menyelesaikan kendala terhimpitnya teks pertanyaan pada smartphone, game menghadirkan **3 Opsi Layout Pertempuran Mobile** yang dapat diatur pemain:

```
┌─────────────────────────────────────────────────────────────┐
│              SISTEM 3 MODE LAYOUT BATTLE MOBILE             │
├──────────────────────────────┬──────────────────────────────┤
│ 1. Mode Klasik (Default)     │ Susunan vertikal bertingkat  │
│ 2. Mode Baca Penuh (Drawer)  │ Soal luas, opsi di drawer    │
│ 3. Mode Kompak (Smart Grid)  │ Layar instan zero-scroll 2x2 │
└──────────────────────────────┴──────────────────────────────┘
```

---

### 5.1 Layout Opsi 1: Mode Klasik (Default)

Mode standar tradisional yang menampilkan monster boss, bar HP, kotak soal, dan 4 pilihan jawaban secara vertikal.

#### 🖼️ Wireframe Klasik:
```
┌──────────────────────────────────────────┐
│ [✕]  ⚡ 3/5  [Soal 4/10]  🛡️ 10  ❤️ 85/100 │  Top Bar Ringkas (~42px)
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ [Avt]  Jamurgon (Lv 3) · Elemen Hutan│ │  Kartu Bos Monster (~180px)
│ │        [HP: ███████████████░░ 280]   │ │  HP Bar & Jurus Bos
│ │        ⚠️ Aba-aba: Serbuk Lelap      │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ ════════════════════════════════════════ │  Timer Bar Oranye Dinamis (4px)
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ 🎯 TITIK LEMAH              [🔊 BACA]│ │  Kartu Soal Teks
│ │ Apa fungsi klorofil pada daun?       │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ [A] Menyerap cahaya matahari           │  4 Pilihan Jawaban
│ [B] Mengusir serangga hama             │  Disusun 1 Kolom ke Bawah
│ [C] Membantu penguapan air             │
│ [D] Menyerap zat hara dari tanah       │
├──────────────────────────────────────────┤
│       [ ⚡ FAB SKILL MELAYANG ]         │  Tombol Skill di Pojok Kanan
└──────────────────────────────────────────┘
```

---

### 5.2 Layout Opsi 2: Mode Baca Penuh + Lembar Jawaban (Bottom Sheet)

Mode yang memberikan **keterbacaan 100% sempurna** untuk soal cerita panjang atau soal bergambar:
1. **Langkah 1**: Layar penuh menampilkan teks pertanyaan yang lega (tanpa terhalang tombol jawaban).
2. **Langkah 2**: Mengetuk tombol `[ ✍️ Jawab Sekarang ]` meluncurkan drawer lembar jawaban (*Bottom Sheet*) dari bawah.

#### 🖼️ Wireframe Tahap 1 (Membaca) & Tahap 2 (Lembar Jawaban):
```
    [ TAHAP 1: BACA SOAL ]                 [ TAHAP 2: LEMBAR JAWABAN ]
┌──────────────────────────────┐       ┌──────────────────────────────┐
│ [✕] Jamurgon 280 HP  ❤️ 85/100│       │ [✕] Jamurgon 280 HP  ❤️ 85/100│
├──────────────────────────────┤       ├──────────────────────────────┤
│ ════════════════════════════ │       │ "Apa fungsi klorofil pada... │
├──────────────────────────────┤       ├──────────────────────────────┤
│                              │       │ ┌──────────────────────────┐ │
│  ┌────────────────────────┐  │       │ │ ─── Lembar Jawaban ───   │ │
│  │ 📘 Soal 4/10   [🔊]    │  │       │ │                          │ │
│  │                        │  │       │ │ [A] Menyerap cahaya...   │ │
│  │ "Apa fungsi klorofil   │  │       │ │ [B] Mengusir hama        │ │
│  │  pada daun tumbuhan    │  │       │ │ [C] Membantu penguapan   │ │
│  │  dalam proses          │  │       │ │ [D] Menyerap zat hara    │ │
│  │  fotosintesis?"        │  │       │ │                          │ │
│  │                        │  │       │ │   [ ✕ Tutup / Baca Lagi] │ │
│  │ [Diagram Daun & Sinar] │  │       │ └──────────────────────────┘ │
│  └────────────────────────┘  │       │                              │
├──────────────────────────────┤       └──────────────────────────────┘
│ ┌──────────────────────────┐ │
│ │  ✍️  JAWAB SEKARANG (4)  │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

#### 💻 Kode CSS Bottom Sheet & Drawer:
```css
/* Container Utama Layout Bottom Sheet */
.battle-layout-bottom_sheet .boss-card {
  padding: 8px 12px;
  gap: 10px;
}
.battle-layout-bottom_sheet .boss-svg-box {
  width: 44px;
  height: 44px;
}
.battle-layout-bottom_sheet .qcard {
  padding: clamp(14px, 4vw, 22px);
  min-height: 180px;
}
.battle-layout-bottom_sheet .qtext {
  font-size: clamp(1.1rem, 4.6vw, 1.35rem);
  line-height: 1.5;
  font-weight: 700;
}

/* Tombol CTA Jawab Sekarang */
.btn-open-answersheet {
  width: 100%;
  min-height: 52px;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #fff;
  border: 2px solid #38bdf8;
  border-radius: var(--radius-md);
  font-size: 1.05rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  animation: pulse-sheet-cta 2.5s infinite;
}

/* Drawer Lembar Jawaban */
.answer-sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.answer-sheet-backdrop.open {
  opacity: 1;
  pointer-events: auto;
}
.answer-sheet-drawer {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  max-width: 520px;
  margin: 0 auto;
  background: var(--c-surface);
  border-top: 2px solid #38bdf8;
  border-radius: 22px 22px 0 0;
  padding: 12px 16px 28px 16px;
  box-shadow: 0 -12px 36px rgba(0, 0, 0, 0.75);
  z-index: 1001;
  transform: translateY(105%);
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  max-height: 82vh;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.answer-sheet-drawer.open {
  transform: translateY(0);
}
.drawer-handle {
  width: 44px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 99px;
  margin: 0 auto 12px auto;
}
```

---

### 5.3 Layout Opsi 3: Mode Kompak Adaptif (Zero-Scroll Smart Grid 2×2)

Mode pertarungan cepat tanpa scroll sama sekali. Bos monster dan pemain dirangkum dalam **Dual Versus Bar**, sedangkan opsi jawaban pendek otomatis membentuk **Grid 2 Baris × 2 Kolom**.

#### 🖼️ Wireframe Kompak Zero-Scroll:
```
┌──────────────────────────────────────────┐
│ [✕]  ⚡ 3/5       Soal 4/10       ❤️ 85/100 │  Top HUD (~38px)
├──────────────────────────────────────────┤
│ [🐲 Jamurgon 280 HP] VS [Kamu 85 HP 🛡️10]│  Dual Versus Bar Bersebelahan
├──────────────────────────────────────────┤
│ ════════════════════════════════════════ │  Timer Bar Tipis (3px)
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ 🎯 TITIK LEMAH              [🔊 BACA]│ │  Area Soal Lega (~36% Layar)
│ │ Apa fungsi klorofil pada daun?       │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│  SMART ANSWER GRID (Grid 2 Kolom x 2):   │  Hemat 60% Ruang Vertikal!
│ ┌───────────────────┬───────────────────┐│
│ │ [A] Serap cahaya  │ [B] Usir hama     ││  Tombol lebar, sentuh jempol instan
│ ├───────────────────┼───────────────────┤│
│ │ [C] Uapkan air    │ [D] Serap hara    ││
│ └───────────────────┴───────────────────┘│
└──────────────────────────────────────────┘
```

#### 💻 Kode CSS Smart Grid 2×2:
```css
/* Smart Answer Grid 2x2 */
.options.options-grid-2x2 {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 8px !important;
}
.options.options-grid-2x2 .opt {
  min-height: 50px;
  padding: 8px 10px;
  font-size: 0.92rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.options.options-grid-2x2 .opt .key {
  width: 26px;
  height: 26px;
  min-width: 26px;
  font-size: 0.82rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}
```

---

### 5.4 Adaptasi Keyboard Virtual Ponsel (`.mobile-keyboard-active`)

Pada soal tipe **Isian Singkat (SHORT)** atau susun kata, kemunculan keyboard ponsel memotong 40% tinggi layar. Kelas `.mobile-keyboard-active` secara otomatis menyusutkan elemen dekoratif agar input tetap terlihat:

```css
@media (max-width: 640px) {
  .screen.mobile-keyboard-active .boss-card {
    display: none !important;            /* Sembunyikan kartu bos saat mengetik */
  }
  .screen.mobile-keyboard-active .skill-fab {
    display: none !important;
  }
  .screen.mobile-keyboard-active .hud {
    padding-bottom: 2px;
  }
  .screen.mobile-keyboard-active .qcard {
    padding: 8px 10px !important;
    min-height: auto !important;
  }
  .screen.mobile-keyboard-active .short-input {
    font-size: 1.15rem !important;       /* Cegah auto-zoom iOS Safari */
    min-height: 48px !important;
  }
}
```

---

### 5.5 Sistem Tombol Skill Melayang (Skill FAB & Bubble Tray)

Pemain dapat memicu skill pertarungan tanpa memakan ruang bar bawah melalui **Floating Action Button (FAB)** dan baki balon skill:

```html
<!-- Tombol Pemicu Skill Melayang -->
<button class="skill-fab" id="skill-fab" type="button" aria-label="Buka Menu Skill">
  <span class="skill-fab-icon">⚡</span>
  <span class="skill-fab-badge" id="skill-fab-energy">3</span>
</button>

<!-- Baki Popup Skill yang Mengembang Saat FAB Ditekan -->
<div class="skill-bubble-tray" id="skill-bubble-tray">
  <div class="skill-bubble-backdrop" onclick="Screens.battle.closeSkillBubblePopup()"></div>
  <div class="skill-bubble-content">
    <div class="tray-title">Pilih Skill Petarung:</div>
    <div class="battle-skills-deck" id="battle-skills-slot">
      <!-- 3 Slot Skill Aktif Pemain Dirender di Sini -->
    </div>
  </div>
</div>
```

---

## 6. Layar 5: Hasil Pertempuran & Selebrasi Kemenangan (`Screens.result`)

Layar kemenangan dan kekalahan menghadirkan umpan balik instan dengan animasi perolehan bintang, lonjakan XP, serta perolehan koin dan lencana.

### 🖼️ Wireframe Hasil Pertempuran:
```
┌──────────────────────────────────────────┐
│                                          │
│           🎉 KEMENANGAN TELAK!           │  Header Selebrasi Berpendar
│          "Jamurgon Tumbang!"             │
│                                          │
│              ⭐   ⭐   ⭐               │  Animasi Bintang Bertingkat
│            [ 3 BINTANG DIRAIH ]          │  (Akurasi >= 63%)
│                                          │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ Ringkasan Pertarungan:               │ │  Statistik Hasil
│ │ • Jawaban Benar : 8 dari 10 Soal     │ │
│ │ • Akurasi       : 80%                │ │
│ │ • Kombo Terbesar: 6x Beruntun 🔥    │ │
│ ├──────────────────────────────────────┤ │
│ │ Hadiah Diperoleh:                    │ │
│ │ • +120 XP 🌟  (Progres Lv. 5 ➔ 6)    │ │
│ │ • +35 Koin Emas 🪙                   │ │
│ │ • 🏆 Lencana Baru: "Penakluk Hutan"  │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │      ▶️  LANJUTKAN PERJALANAN        │ │  Tombol Lanjut (Primary)
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │      🏠  KEMBALI KE BERANDA          │ │  Tombol Beranda (Ghost)
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---


## 7. Layar 6: Lemari Kostum & Kustomisasi Avatar SVG (`Screens.profil` / Wardrobe)

Layar tempat siswa merancang penampilan karakter menggunakan komponen vektor SVG berlapis ([`shared/avatar.js`](file:///home/maman/play/shared/avatar.js)). Terdiri dari panggung pratinjau avatar langsung (*Live SVG Canvas*) dan tab kategori perlengkapan sentuh.

### 🖼️ Wireframe Lemari Skin Mobile:
```
┌──────────────────────────────────────────┐
│ [⬅ Beranda]       🎒 LEMARI KOSTUM       │  Header
├──────────────────────────────────────────┤
│                                          │
│         ┌──────────────────────┐         │  Panggung Pratinjau Avatar
│         │ [  SVG AVATAR LIVE ] │         │  Ukuran 160x160 px
│         │   Topi + Baju + Pet  │         │  (Rendering SVG Realtime)
│         └──────────────────────┘         │
│         "Ksatria Bintang Penjelajah"     │  Gelar Avatar Terpasang
│                                          │
├──────────────────────────────────────────┤
│ [Topi] [Baju] [Senjata] [Pet] [Bingkai]  │  Tab Kategori Horizontal
├──────────────────────────────────────────┤
│ ┌────────┬────────┬────────┬────────┐    │  Grid Slot Item Kosmetik (4 Kolom)
│ │ 🧢     │ 👑     │ 🎩     │ 🪖     │    │  - Item Terpasang (Border Cyan)
│ │ Topi   │ Mahkota│ Pesulap│ Helm   │    │  - Item Belum Dimiliki (Gembok 🔒)
│ │ [PAKAI]│ [PAKAI]│ [TERKUN│ [PAKAI]│    │
│ └────────┴────────┴────────┴────────┘    │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │  ✨ Simpan Penampilan Baru (Gratis)  │ │  Tombol Simpan Perubahan
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### 💻 Kode Struktur Render Tab & Slot Item:
```javascript
// Render Tab Kategori Lemari Skin
renderWardrobeTabs(activeCategory = 'hat') {
  const categories = [
    { id: 'hat', label: 'Topi', icon: '🧢' },
    { id: 'outfit', label: 'Baju', icon: '👕' },
    { id: 'weapon', label: 'Senjata', icon: '⚔️' },
    { id: 'pet', label: 'Pet', icon: '🐾' },
    { id: 'frame', label: 'Bingkai', icon: '🖼️' },
    { id: 'bg', label: 'Latar', icon: '🌄' },
    { id: 'title', label: 'Gelar', icon: '🎖️' }
  ];
  return `
    <div class="wardrobe-tabs-scroller">
      ${categories.map(c => `
        <button class="wardrobe-tab-btn ${c.id === activeCategory ? 'active' : ''}"
          onclick="Screens.profil.switchCategory('${c.id}')">
          <span class="tab-icon">${c.icon}</span>
          <span class="tab-label">${c.label}</span>
        </button>
      `).join('')}
    </div>
  `;
}
```

---

## 8. Layar 7: Toko Perlengkapan & Peti Gacha Regional (`Screens.shop`)

Layar ekonomi game yang terbagi menjadi Toko Koin Harian dan Kotak Misteri Gacha Wilayah untuk mendapatkan skin dan pet langka.

### 🖼️ Wireframe Toko & Gacha Mobile:
```
┌──────────────────────────────────────────┐
│ [⬅ Beranda]       🛒 TOKO & GACHA        │  Header Toko
│            🪙 1.450 Koin  💎 12 Permata  │  Saldo Pemain
├──────────────────────────────────────────┤
│   ┌────────────────────┬───────────────┐ │
│   │ [🪙 Toko Koin]     │ [🎁 Kotak Gacha│ │  Tab Segmented Bar
│   └────────────────────┴───────────────┘ │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ 🎁 Peti Harta Wilayah 3 (Gua Kristal)│ │  Banner Kotak Gacha
│ │ [   3D CHEST ANIMASI BERKILAU   ]    │ │
│ │ Biaya: 250 Koin per Buka             │ │
│ │ ┌──────────────────────────────────┐ │ │
│ │ │      BUKA 1x (250 🪙)            │ │ │  Tombol Buka Gacha
│ │ └──────────────────────────────────┘ │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ Penawaran Harian:                        │
│ ┌───────────────┬──────────────────────┐ │
│ │ 🧪 Ramuan HP  │ 🛡️ Perisai Ekstra    │ │  Kartu Barang Harian
│ │ Harga: 80 🪙  │ Harga: 120 🪙        │ │
│ │ [Beli]        │ [Beli]               │ │
│ └───────────────┴──────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## 9. Layar 8: Arena Duel 1v1 PvP Realtime (`Screens.duel`)

Arena kompetisi antar-siswa secara langsung (*Turn-Based Realtime*). Menggunakan layout **Split Versus Screen** khusus mobile yang membagi visual menjadi area lawan (atas) dan area pemain (bawah).

### 🖼️ Wireframe Duel PvP 1v1 Mobile:
```
┌──────────────────────────────────────────┐
│ [✕ Keluar]       ⚔️ ARENA DUEL 1v1       │  Top Bar
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │  ◄── AREA LAWAN (TOP HALF)
│ │ [Avt] Siti Rahma (Lv 6 · SD Bintang) │ │      Avatar & HP Lawan
│ │       [HP LAWAN: ███████████░░ 75/100]│ │      Status Kartu Merah
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ ════════════════════════════════════════ │  Timer Ronde Duel (12 Detik)
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │  ◄── SOAL DUEL BERSAMA
│ │ Berapakah hasil dari 15 × 8 = ...?   │ │      Kedua pemain menjawab soal sama
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ [A] 110    [B] 120    [C] 125    [D] 130 │  Opsi Jawaban Cepat
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │  ◄── AREA PEMAIN (BOTTOM HALF)
│ │ [Avt] Bayu Pratama (Lv 5) Kamu       │ │      HP Pemain Hijau & Energi
│ │       [HP KAMU:  ████████████ 90/100]│ │
│ │       ⚡ Energi: 3/5  [Skill Coret]    │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## 10. Layar 9: Monster Dex & Ensiklopedia 100 Bos (`Screens.dex`)

Katalog ensiklopedia yang memuat seluruh 100 monster bos dari 10 habitat elemen. Kartu bos ditata dalam format 1 baris vertikal (*single row card*) yang sangat nyaman digulir pada layar sentuh.

### 🖼️ Wireframe Monster Dex:
```
┌──────────────────────────────────────────┐
│ [⬅ Beranda]       📖 MONSTER DEX         │  Header & Filter Elemen
│ [Semua] [🔥 Api] [💧 Air] [🌿 Hutan] ... │  (Horizontal Chips Filter)
├──────────────────────────────────────────┤
│ Total Dikalahkan: 24 / 100 Monster 🏆    │  Statistik Penemuan
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │  ◄── KARTU 1 BARIS BOS (1 Row Card)
│ │ [Avt] #001 · Jamurgon   [Hutan]      │ │      - Avatar Monster 48px
│ │ 🍄    Tingkat: Common · Kalah 4x     │ │      - Elemen & Jumlah Tumbang
│ │       Rekor Terbaik: ⭐⭐⭐            │ │      - Rekor Bintang
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ [Avt] #002 · Ranting Berduri [Hutan] │ │
│ │ 🌿    Tingkat: Rare · Kalah 1x       │ │
│ │       Rekor Terbaik: ⭐⭐☆            │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ [🔒]  #003 · ??????                  │ │  Bos Belum Terbuka
│ │       Tumbangkan bos di Bab 2!       │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## 11. Layar 10: Profil Siswa & Pameran Lencana Prestasi (`Screens.profil` / Badges)

Layar kehormatan siswa yang menampilkan statistik permainan, rekor kemenangan Brutal, serta **3 Slot Pameran Lencana Utama** (*Showcase Badges*).

### 🖼️ Wireframe Profil & Showcase Lencana:
```
┌──────────────────────────────────────────┐
│ [⬅ Beranda]       👤 PROFIL PETUALANG    │  Header
├──────────────────────────────────────────┤
│       [  AVATAR LENGKAP SISWA  ]         │  Avatar Besar 120px
│              Bayu Pratama                │
│       Kelas 5 SD · Level 6 Ksatria       │
├──────────────────────────────────────────┤
│ 🏆 3 LENCANA SHOWCASE TERPASANG:         │  3 Slot Utama Pameran Lencana
│ ┌──────────────┬──────────────┬────────┐ │
│ │ 🌟 Bintang   │ 🔥 Brutal    │ 🐲 Naga│ │  (Bisa diketuk untuk ganti)
│ │    Fajar     │    Conqueror │   Slayer│ │
│ │   [Tier 1]   │   [Tier 3]   │[Tier 4]│ │
│ └──────────────┴──────────────┴────────┘ │
├──────────────────────────────────────────┤
│ 📊 Rekor & Prestasi:                     │
│ • Total Kemenangan : 48 Kali             │  Statistik Kumulatif
│ • Akurasi Rata-rata: 84.5%               │
│ • Bintang Terkumpul: 112 ⭐              │
│ • Menang Brutal    : 6 Kali 😈           │
├──────────────────────────────────────────┤
│ 🎖️ Koleksi Seluruh Lencana (14 Dibuka)   │  Daftar Grid Koleksi Lencana
└──────────────────────────────────────────┘
```

---


## 12. Layar 11: Laporan Belajar Mingguan & Radar Titik Lemah (`Screens.report`)

Layar analisis edukatif untuk siswa dan orang tua. Menyajikan grafik ringkas aktivitas belajar per minggu, analisis topik yang sudah dikuasai, serta topik yang masih menjadi **Titik Lemah** (*Weak Topics*) yang perlu dilatih kembali.

### 🖼️ Wireframe Laporan Belajar Mobile:
```
┌──────────────────────────────────────────┐
│ [⬅ Beranda]       📊 LAPORAN MINGGUANKU  │  Header & Pemilih Pekan
│      ◀ Minggu Ini (3 - 9 Nov 2026) ▶     │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ 📈 Ringkasan Belajar:                │ │  Metrik Kunci
│ │ • Total Soal Dijawab : 120 Soal      │ │
│ │ • Jawaban Benar      : 102 Soal      │ │
│ │ • Akurasi Rata-rata  : 85% ⭐        │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ 🎯 Analisis Topik Pembelajaran:          │
│                                          │
│ 🟢 Topik Sangat Dikuasai:                │
│ • Fotosintesis Tumbuhan (95% Akurasi)    │  Penguasaan Materi Tinggi
│ • Operasi Hitung Perkalian (90%)         │
│                                          │
│ 🔴 Titik Lemah yang Perlu Diulang:       │
│ • Simbiosis Ekosistem (Akurasi 45%)      │  Topik Rekomendasi Latihan
│   [ 📚 Latihan Ulang Topik Ini ]         │  Tombol Aksi Latihan Cepat
└──────────────────────────────────────────┘
```

---

## 13. Layar 12: Pengaturan Tampilan & Aksesibilitas (`Screens.settings`)

Layar konfigurasi game untuk menyetel preferensi gameplay, tata letak antarmuka pertempuran, audio, dan ukuran keterbacaan teks.

### 🖼️ Wireframe Pengaturan Mobile:
```
┌──────────────────────────────────────────┐
│ [⬅ Beranda]       ⚙️ PENGATURAN          │  Header
├──────────────────────────────────────────┤
│ 🎮 TAMPILAN PERTEMPURAN (BATTLE LAYOUT): │
│                                          │
│ [◉] 1. Mode Klasik (Default)             │  Radio Switcher Layout
│     Tampilan RPG standar berimbang       │
│                                          │
│ [○] 2. Mode Baca Penuh (Bottom Sheet)    │
│     Soal super lega, jawaban di drawer   │
│                                          │
│ [○] 3. Mode Kompak (Smart Grid 2x2)      │
│     Layar aksi cepat zero-scroll 2x2     │
├──────────────────────────────────────────┤
│ 🔊 AUDIO & SUARA:                        │
│ • Efek Suara (SFX)        : [ AKTIF 🟢 ] │  Toggle Switch Sentuh
│ • Musik Latar (BGM)       : [ MATI  ⚪ ] │
│ • Narator Soal (Suara TTS): [ AKTIF 🟢 ] │
├──────────────────────────────────────────┤
│ ♿ AKSESIBILITAS:                        │
│ • Ukuran Font Soal        : [ Sedang ▾ ] │  Pengatur Ukuran Teks
│ • Mode Gerak Berkurang    : [ MATI  ⚪ ] │  Reduced Motion
├──────────────────────────────────────────┤
│           [ 🚪 KELUAR AKUN ]             │  Tombol Logout
└──────────────────────────────────────────┘
```

---

## 14. Kompilasi Komponen UI Mobile Reusable (FAB, Drawer, Modal, Toast)

Komponen-komponen modular berikut dirancang untuk digunakan lintas layar secara konsisten:

### 14.1 Tombol Mengambang (Floating Action Button - FAB)
```css
.skill-fab {
  position: fixed;
  bottom: calc(18px + env(safe-area-inset-bottom));
  right: 18px;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0284c7, #0369a1);
  border: 2.5px solid #38bdf8;
  color: #fff;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(2, 132, 199, 0.5);
  cursor: pointer;
  z-index: 900;
  transition: transform 0.15s ease;
}
.skill-fab:active {
  transform: scale(0.9);
}
.skill-fab-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f59e0b;
  color: #000;
  font-size: 0.75rem;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 999px;
  border: 2px solid #fff;
}
```

### 14.2 Modal Dialog Pop-up Responsif
```html
<div class="modal-overlay" id="common-modal">
  <div class="modal-card-mobile" role="dialog" aria-modal="true">
    <div class="modal-header">
      <h3 class="modal-title" id="modal-title">Judul Dialog</h3>
      <button class="btn-close-modal" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body" id="modal-content">
      <!-- Konten Modal Dinamis -->
    </div>
    <div class="modal-footer">
      <button class="btn primary btn-block" id="btn-modal-confirm">Mengerti</button>
    </div>
  </div>
</div>
```

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}
.modal-card-mobile {
  background: var(--c-surface);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 400px;
  padding: 18px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleUp {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### 14.3 Pesan Notifikasi Toast Mengambang
```javascript
function toast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'show';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.className = '';
  }, duration);
}
```

```css
#toast {
  position: fixed;
  bottom: calc(24px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%) translateY(30px);
  background: rgba(15, 23, 42, 0.95);
  border: 1.5px solid var(--c-primary);
  color: #fff;
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  opacity: 0;
  pointer-events: none;
  z-index: 3000;
  transition: transform 0.25s ease, opacity 0.25s ease;
}
#toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```

---

## 15. Standar Ergonomi Layar Sentuh & Thumb Zone Pelajar SD

Untuk memastikan kenyamanan jari tangan anak-anak usia sekolah dasar saat menggenggam ponsel, game menerapkan **4 Kaidah Ergonomi Desain**:

```
┌──────────────────────────────────────────┐  ◄── LAYAR PONSEL (390 x 844 px)
│ [ ZONA SULIT DIJANGKAU (Hard to Reach) ] │  Hanya untuk HUD pasif, tombol [✕]
│                                          │  dan informasi judul yang jarang ditekan.
├──────────────────────────────────────────┤
│                                          │
│ [ ZONA NATURAL MEMBACA (Natural Zone)  ] │  Area Pertanyaan Kuis, Maskot SVG,
│                                          │  dan Panggung Animasi Utama.
├──────────────────────────────────────────┤
│                                          │
│ [ ZONA EMAS IBU JARI (Thumb Zone)      ] │  ★ TOMBOL JAWABAN (A, B, C, D)
│                                          │  ★ TOMBOL SKILL AKTIF (FAB)
│                                          │  ★ TOMBOL AKSI PRIMER (CTA BLOCK)
│                                          │  Sangat mudah disentuh jempol anak!
└──────────────────────────────────────────┘
```

1. **Ukuran Target Sentuh Minimal (*Minimum Tap Target*)**:
   - Seluruh tombol jawaban, ubin menu, dan tombol skill memiliki dimensi minimal **$48\times 48\text{ px}$** dengan jarak (*margin/gap*) minimal **$8\text{ px}$** untuk mencegah salah sentuh (*mis-clicks*).
2. **Keterbacaan Tipografi Dinamis (*Fluid Typography*)**:
   - Menggunakan fungsi CSS `clamp()` (misal `clamp(1.05rem, 4.2vw, 1.3rem)`) agar teks soal otomatis menyesuaikan ukuran layar tanpa menimbulkan baris terpotong.
3. **Pemberian Umpan Balik Taktil & Visual (*Haptic & Visual Feedback*)**:
   - Setiap interaksi sentuh memicu efek mikro-kompresi `:active { transform: scale(0.96); }` dan getaran halus (*haptic vibration*) 15ms jika perangkat mendukung (`navigator.vibrate(15)`).
4. **Pencegahan Zooming Tidak Sengaja**:
   - Semua elemen form input disetel dengan `font-size: 16px` atau lebih tinggi pada layar smartphone agar peramban mobile (seperti iOS Safari) tidak melakukan *auto-zoom* yang dapat merusak tata letak permainan.

---
*Dokumen spesifikasi desain mobile mode disusun secara komprehensif berdasarkan basis kode produksi Petualangan Pelajar v7.2.*
