# 🖥️ DESAIN UI LENGKAP MODE DESKTOP (KODE & STRUKTUR)
**Game Edukasi RPG**: *Petualangan Pelajar* ([https://play.printshare.my.id/](https://play.printshare.my.id/))
**Target Dokumen**: `DESIGN_UI_GAME_DESKTOP_MODE_CODE_DAN_STRUKTUR.md`
**Pendamping**: `DESIGN_UI_GAME_MOBILE_MODE_CODE_DAN_STRUKTUR.md` (v7.2)
**Konsep**: **Single-Viewport Cockpit**, seluruh bagian game terlihat dalam satu pandangan layar, tanpa scroll halaman
**Target Layar**: Laptop/PC landscape, minimal 1280×720 (diuji 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1080)

> **Mockup yang dikirim bersama dokumen ini**
> - `mockup_desktop_mode.html`: mockup interaktif (14 layar, klik dan keyboard). Otomatis diskalakan agar muat di layar apa pun, termasuk ponsel.
> - `mockup_semua_layar.png`: kontak sheet 14 layar. `mockup_01_beranda.png`, `mockup_04_battle.png`, `mockup_06_lemari.png`, `mockup_10_dex.png`: tangkapan layar 1920×1080.
> Semua kode di dokumen ini adalah kode yang sama dengan yang berjalan di mockup.

---

## 📖 DAFTAR ISI
1. [Filosofi: Satu Pandangan, Semua Terlihat](#1-filosofi-satu-pandangan-semua-terlihat)
2. [Peta Perubahan Mobile ke Desktop](#2-peta-perubahan-mobile-ke-desktop)
3. [Fondasi: Skala Fluid, Shell, dan Grid](#3-fondasi-skala-fluid-shell-dan-grid)
4. [Deteksi Mode, Router, dan Papan Pintas](#4-deteksi-mode-router-dan-papan-pintas)
5. [Wireframe & Rancangan Tiap Layar](#5-wireframe--rancangan-tiap-layar)
6. [Kode Lengkap](#6-kode-lengkap)
7. [Integrasi ke Proyek](#7-integrasi-ke-proyek)
8. [Aksesibilitas, Performa, dan Uji](#8-aksesibilitas-performa-dan-uji)

---

## 1. Filosofi: Satu Pandangan, Semua Terlihat

Mode mobile memecah game menjadi banyak layar yang dibuka satu per satu. Layar desktop jauh lebih luas, jadi mode ini membalik logikanya: **pemain tidak perlu berpindah halaman untuk tahu keadaan game-nya.**

Lima prinsip:

1. **Tanpa scroll halaman.** `#app` selalu persis setinggi dan selebar jendela (`100vw × 100dvh`, `overflow:hidden`). Daftar panjang diubah menjadi kisi padat, bukan digulir (contoh: Monster Dex menampilkan 100 monster sekaligus dalam kisi 10×10).
2. **Skala mengikuti jendela.** Semua ukuran memakai `rem`, dan `1rem` dihitung dari lebar sekaligus tinggi jendela. Seluruh UI membesar atau mengecil proporsional sehingga tidak pernah terpotong.
3. **Beranda adalah ruang kendali.** Profil, skill aktif, lencana, teman, laporan, toko, dan Monster Dex ditampilkan sebagai panel ringkas dalam satu layar; klik panel untuk masuk ke layar penuhnya.
4. **Layar aksi memakai mode fokus.** Arena battle, duel, hasil, dan masuk menyembunyikan top bar dan rail agar seluruh ruang dipakai gameplay.
5. **Keyboard setara dengan mouse.** Jawab dengan `A B C D`, skill dengan `Q W E`, pindah layar dengan angka.

---

## 2. Peta Perubahan Mobile ke Desktop

| Aspek | Mobile (v7.2) | Desktop |
|---|---|---|
| Navigasi | Kisi 12 ubin di Beranda, tombol ⬅ per layar | Rail kiri tetap (11 layar) + top bar status; Beranda berisi panel ringkas |
| Beranda | Banner, maskot, kisi menu | 3 kolom: Hero & skill · Panggung maskot & CTA · Laporan, toko, Dex |
| Peta | Slider wilayah, jalur vertikal | Daftar 10 wilayah · peta simpul horizontal · panel detail bos |
| Battle | 3 layout (klasik, bottom sheet, grid 2×2) | **Satu layout** 3 kolom: bos · soal & 4 opsi · pemain & skill; opsi *Fokus Baca* (`F`) |
| Skill | FAB + baki balon | 3 tombol skill selalu terlihat, hotkey `Q W E` |
| Keyboard virtual | `.mobile-keyboard-active` | Tidak perlu; Enter mengirim jawaban isian |
| Lemari | Tab horizontal, grid 4 kolom | Pratinjau · tab + grid · detail item (3 kolom) |
| Toko | Tab Koin/Gacha | Gacha, penawaran harian, saldo & tas dalam satu layar |
| Dex | 1 kartu per baris, digulir | Kisi 10×10 (100 monster) + panel detail |
| Laporan | Daftar bertingkat | Metrik, grafik, penguasaan topik, titik lemah sekaligus |
| Pengaturan | Layout battle | Mode UI, audio, aksesibilitas, papan pintas dalam 3 kolom |
| Target sentuh | min. 48px | Target klik min. 2.4rem + efek hover; tidak ada FAB |

---

## 3. Fondasi: Skala Fluid, Shell, dan Grid

### 3.1 Kanvas desain dan rumus skala

Kanvas desain: **100rem × 56,25rem** (16:9). Rumus di `html`:

```css
html { font-size: clamp(10px, min(1vw, 1.7778vh), 22px); }
```

- `1vw` membuat lebar kanvas = 100rem; `1.7778vh` membuat tinggi kanvas = 56,25rem. `min()` memilih yang lebih membatasi, jadi **kanvas selalu muat di dalam jendela**.
- Layar lebih lebar dari 16:9 (ultrawide): kolom tengah (`1fr`) melebar. Layar lebih tinggi (16:10, 4:3): baris `1fr` memanjang.
- 1920×1080 → 1rem = 19,2px · 1366×768 → 13,66px · 1280×720 → 12,8px.

### 3.2 Struktur shell

```
┌────────────────────────────────────────────────────────────────────────────┐
│ TOP BAR (3,6rem): logo · judul layar ·········· ⚡ 🪙 💎 🔊 ⌨️ [avatar+XP]     │
├──────┬─────────────────────────────────────────────────────────────────────┤
│ RAIL │                                                                     │
│ 5,4  │                         STAGE (.d-screen)                           │
│ rem  │      grid 3 kolom: [panel kiri 23rem] [tengah 1fr] [panel kanan]    │
│ 11   │                                                                     │
│ menu │                                                                     │
│ +    │                                                                     │
│ Guru │                                                                     │
│ Keluar│                                                                    │
└──────┴─────────────────────────────────────────────────────────────────────┘
Mode fokus (battle / duel / hasil / masuk): top bar dan rail disembunyikan, stage memenuhi layar.
```

```html
<body>
  <div id="app" class="d-play" aria-live="polite"></div>
  <div id="toast" role="status"></div>
  <div id="d-guard">Desktop Mode butuh layar minimal 1280×720 …</div>
</body>
```

### 3.3 Token warna

Memakai variabel yang sama dengan mobile (`--c-bg`, `--c-surface`, `--c-primary`, `--c-good`, `--c-bad`, `--c-accent`, `--c-text`, `--c-muted`) ditambah warna rarity `--r-common`, `--r-rare`, `--r-epic`, `--r-legend` (selaras dengan proposal upgrade visual 3D).

---

## 4. Deteksi Mode, Router, dan Papan Pintas

**Aturan pemilihan mode (`UIMode.detect`)**: desktop bila lebar ≥ 1280, tinggi ≥ 720, rasio ≥ 1,25, dan perangkat memakai mouse (`pointer:fine` + `hover:hover`). Jika tidak, mobile. Pemain dapat memaksa mode lewat Pengaturan (`localStorage.ui_mode`: `auto | desktop | mobile`). Saat jendela diubah ukurannya, mode dievaluasi ulang dan layar saat ini dirender ulang.

**Router**: `go(name, params)` tetap sama; untuk desktop ia memanggil `DesktopShell.mount()` yang membangun top bar + rail (kecuali layar fokus) lalu memanggil `DesktopScreens[name]`.

**Papan pintas global**

| Tombol | Fungsi |
|---|---|
| `1 2 3 4 5 6 7 8 9 0 -` | Beranda · Petualangan · Latihan · Duel · Skill · Lemari · Toko · Dex · Profil · Laporan · Pengaturan |
| `?` | Daftar papan pintas |
| `Esc` | Tutup dialog / kembali |
| `Enter` | Aksi utama layar (mulai, lanjut) |
| `A B C D` atau `1–4` | Jawab soal (arena, duel) |
| `Q W E` | Skill aktif 1 / 2 / 3 |
| `Spasi` | Bacakan soal (TTS) |
| `F` | Mode Fokus Baca |

---

## 5. Wireframe & Rancangan Tiap Layar

Ukuran di bawah mengacu kanvas 1920×1080. Tangkapan layar tiap layar ada di `mockup_semua_layar.png`.

### 5.1 Masuk (`auth`), fokus
```
┌───────────────────────────────────────┬──────────────────────────────┐
│                                       │  ┌────────────────────────┐  │
│        [ BOS MASKOT 3D BESAR ]        │  │ [Masuk] [Daftar Baru]  │  │
│                                       │  │ Pilih Kelas  [ ▾ ]     │  │
│         PETUALANGAN PELAJAR           │  │ Pilih Nama   [ ▾ ]     │  │
│     Game Kuis RPG Pelajar Cerdas      │  │ PIN Ceria    [ •••• ]  │  │
│                                       │  │ [🚀 Mulai Bermain!]    │  │
│                                       │  └────────────────────────┘  │
└───────────────────────────────────────┴──────────────────────────────┘
```

### 5.2 Beranda (`home`), ruang kendali
```
┌─ TOP BAR ───────────────────────────────────────────────────────────────┐
├────┬──────────────────┬───────────────────────────────┬─────────────────┤
│    │ [Avatar] Hero    │      "Halo, siap belajar?"    │ LAPORAN MINGGU  │
│ R  │ Nama · Lv · XP   │                               │ ◯85%  ▂▃▂▅▃▆▄   │
│ A  ├──────────────────┤        [ BOS MASKOT ]         │ 🔴 Titik lemah  │
│ I  │ SKILL AKTIF Q W E│                               ├─────────────────┤
│ L  ├──────────────────┤  📖 Bab 1 ▓▓▓▓▓▓▓░ ⭐8/9      │ PENAWARAN HARIAN│
│    │ LENCANA SHOWCASE │  [⚔️ Lanjutkan] [📚 Latihan]   │ 🧪 80  🛡️ 120   │
│    ├──────────────────┤                               │ 🎁 Peti  [Buka] │
│    │ TEMAN ONLINE     │                               ├─────────────────┤
│    │ Siti ● [Duel]    │                               │ MONSTER DEX 24/100│
└────┴──────────────────┴───────────────────────────────┴─────────────────┘
```
Setiap panel dapat diklik (atribut `data-go`) untuk membuka layar penuhnya.

### 5.3 Peta (`peta`)
```
│ WILAYAH     │ 📖 Bab 1: Hutan Jamur Terlarang          ⚡3/5 │ SIMPUL 3          │
│ 🌿 Hutan 8/9│  ┌───────────────────────────────────────────┐ │  [Bos 3D]         │
│ 🐸 Rawa     │  │   (2)                                      │ │  Raja Jamurgon    │
│ 💎 Gua      │  │  ╱    ╲                                    │ │  Lv 6 · Legend    │
│ 🔥 Api  …   │  │(1)     ╲___ 👑 RAJA JAMURGON               │ │  Hadiah · Rekor   │
│             │  └───────────────────────────────────────────┘ │ [😈 Mode Brutal]  │
│             │                                                │ [⚔️ TANTANG!]      │
```
Panah ← → memilih simpul, `Enter` menantang.

### 5.4 Arena battle (`battle`), fokus
```
┌────────────────────────────────────────────────────────────────────────────┐
│ [✕ Esc] ⚡3/5  Soal 4/10  ⏱ ▓▓▓▓▓▓░░░ 12s  🔥Kombo 2×        🛡️10 [📖 Fokus F]│
├──────────────────┬──────────────────────────────────────┬──────────────────┤
│                  │ 🎯 TITIK LEMAH            [🔊 Baca]  │                  │
│   [ BOS 3D ]     │                                      │  [ AVATAR ]      │
│   Jamurgon       │  Apa fungsi klorofil pada daun?      │  Bayu · Lv 6     │
│   Lv3 · Hutan    │            [ gambar soal ]           │  ❤ ▓▓▓▓▓▓▓ 85   │
│  HP ▓▓▓▓▓░ 280   ├───────────────────┬──────────────────┤  ⚡ ▮▮▮▯▯        │
│ ⚠️ Serbuk Lelap  │ [A] Serap cahaya  │ [B] Usir hama    │ [Q✂️][W🛡️][E⏳]    │
│                  │ [C] Uapkan air    │ [D] Serap hara   │  log pertarungan │
└──────────────────┴───────────────────┴──────────────────┴──────────────────┘
```
- **Satu layout** menggantikan tiga layout mobile; ruang cukup untuk soal besar dan 4 opsi 2×2 sekaligus.
- **Fokus Baca (`F`)**: kolom samping menyusut jadi 9rem dan teks soal membesar, untuk soal cerita panjang.
- Tipe isian singkat: kotak ketik besar, `Enter` mengirim; tidak ada penyesuaian keyboard virtual.

### 5.5 Hasil (`result`), fokus
Kartu tengah dua kolom: kiri selebrasi (bos tumbang, tiga bintang beranimasi), kanan ringkasan, hadiah, dan dua tombol (`Enter` lanjut, `Esc` beranda).

### 5.6 Lemari (`wardrobe`)
```
│ PRATINJAU LIVE   │ [Topi][Baju][Senjata][Pet][Bingkai][Latar][Gelar] │ DETAIL ITEM     │
│  [ Avatar 3D ]   │ ┌────┬────┬────┬────┐                             │  [ikon besar]   │
│  Gelar terpasang │ │ 🎩 │ 🎧 │ 👨‍🍳 │ 🏴‍☠️ │  rarity berwarna            │  Topi Penyihir  │
│ SET SINERGI 4/6  │ │ 🪖 │ 🐰🔒│ 🧙 │ 👑🔒│                             │  Epic · Status  │
│ ▓▓▓▓░░           │ └────┴────┴────┴────┘                             │ [PAKAI][Simpan] │
```

### 5.7 Toko (`shop`)
Kiri peti gacha 3D + tombol buka; tengah 6 penawaran harian; kanan saldo, tas, dan hasil gacha terbaru.

### 5.8 Duel 1v1 (`duel`), fokus
Pemain di kiri, lawan di kanan, soal bersama di tengah, titik ronde dan timer di atas. Jawab dengan `A B C D`.

### 5.9 Skill (`skill`) dan Latihan (`latihan`)
Skill: 3 slot aktif · kisi 10 skill · detail. Latihan: mata pelajaran · topik (chip) · pengaturan sesi. *Nama dan efek skill pada mockup adalah contoh; ambil dari data game.*

### 5.10 Monster Dex (`dex`)
```
│ FILTER HABITAT │ SEMUA 100 MONSTER (10×10, semua terlihat)       │ DETAIL        │
│ 🌿 Hutan 10/10 │ #001 #002 #003 … #010                            │ [monster 3D]  │
│ 🐸 Rawa  10/10 │ #011 …                                           │ #001 Lumutra  │
│ …              │ … (terkunci tampil sebagai siluet "?")           │ Dikalahkan 2× │
│ 24/100 ◯       │ #091 … #100                                      │ Rekor ⭐⭐☆    │
```
Arahkan kursor ke sel untuk melihat detail di kanan; klik tetap memilih. Filter habitat meredupkan sel lain (bukan menghilangkannya) agar posisi tetap.

### 5.11 Profil (`profil`) dan Laporan (`report`)
Profil: avatar besar · 3 lencana showcase + statistik · kisi 20 lencana (14 terbuka). Laporan: pemilih pekan, 4 metrik, grafik batang benar/salah per hari, penguasaan 8 topik, panel titik lemah dengan tombol latihan ulang.

### 5.12 Pengaturan (`settings`)
Tiga kolom: **Tampilan** (Mode UI Otomatis/Desktop/Mobile, Fokus Baca bawaan, efek visual), **Audio & Aksesibilitas**, **Papan pintas**.

---

## 6. Kode Lengkap

Letakkan berkas berikut di proyek (lihat Bagian 7). `mock-data.js` hanya untuk mockup.

### 6.1 `public/css/desktop.css`
```css
/* =====================================================================
   public/css/desktop.css — Petualangan Pelajar · Desktop Mode (Single-Viewport Cockpit)
   Kanvas desain 100rem x 56.25rem (16:9). 1rem = 1vw (dibatasi tinggi layar),
   sehingga seluruh UI selalu muat dalam 1 layar tanpa scroll halaman.
   ===================================================================== */

/* ---------- 1. Token ---------- */
:root {
  --c-bg: #0f172a;
  --c-surface: #1e293b;
  --c-surface-2: #273449;
  --c-hover: #334155;
  --c-primary: #38bdf8;
  --c-good: #22c55e;
  --c-bad: #ef4444;
  --c-accent: #f59e0b;
  --c-text: #f8fafc;
  --c-muted: #94a3b8;

  --r-common: #94a3b8;
  --r-rare: #3b82f6;
  --r-epic: #a855f7;
  --r-legend: #f59e0b;

  --rad-s: .5rem;
  --rad-m: .8rem;
  --rad-l: 1.1rem;
  --gap: .8rem;

  --rail-w: 5.4rem;
  --top-h: 3.6rem;
  --side-w: 23rem;
}

/* ---------- 2. Skala fluid: kunci "semua terlihat dalam 1 layar" ---------- */
html { font-size: clamp(10px, min(1vw, 1.7778vh), 22px); height: 100%; }
body {
  margin: 0; height: 100%;
  background: var(--c-bg); color: var(--c-text);
  font: 1rem/1.35 'Segoe UI', system-ui, -apple-system, sans-serif;
  overflow: hidden; user-select: none; -webkit-user-select: none;
}
*, *::before, *::after { box-sizing: border-box; }
button, input, select { font: inherit; color: inherit; }
button { cursor: pointer; border: 0; background: none; padding: 0; }
.muted { color: var(--c-muted); }
.sv { display: block; width: 100%; height: 100%; }

/* ---------- 3. Shell: top bar + rail + stage ---------- */
#app.d-play {
  display: grid;
  grid-template-columns: var(--rail-w) minmax(0, 1fr);
  grid-template-rows: var(--top-h) minmax(0, 1fr);
  width: 100vw; height: 100dvh; overflow: hidden;
  background: radial-gradient(ellipse at 50% -10%, #2a2468 0%, #14193b 45%, #0b1020 100%);
}
#app.d-play.focus { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
.focus .d-top, .focus .d-rail { display: none; }

.d-top {
  grid-column: 1 / -1; display: flex; align-items: center; gap: 1rem;
  padding: 0 1.2rem; background: rgba(10, 14, 32, .65);
  border-bottom: 1px solid rgba(255, 255, 255, .08);
}
.d-logo { display: flex; align-items: center; gap: .6rem; font-weight: 900; letter-spacing: .02em; }
.d-logo .lg { width: 2.5rem; height: 2.5rem; }
.d-logo b { font-size: 1.05rem; line-height: 1; }
.d-logo small { display: block; font-size: .62rem; color: var(--c-muted); font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.d-crumb { font-weight: 800; font-size: 1.05rem; padding-left: 1rem; border-left: 1px solid rgba(255, 255, 255, .15); }
.sp { flex: 1; }
.pill {
  display: inline-flex; align-items: center; gap: .4rem; padding: .3rem .8rem;
  border-radius: 999px; background: rgba(0, 0, 0, .35); border: 1px solid rgba(255, 255, 255, .12);
  font-weight: 800; font-size: .9rem; white-space: nowrap;
}
.me-chip {
  display: flex; align-items: center; gap: .6rem; padding: .25rem .9rem .25rem .3rem;
  border-radius: 999px; background: rgba(255, 255, 255, .07); border: 1px solid rgba(255, 255, 255, .12);
}
.me-chip .av { width: 2.7rem; height: 2.7rem; border-radius: 50%; overflow: hidden; }
.me-chip b { display: block; font-size: .9rem; line-height: 1.1; }
.me-chip .bar { width: 7rem; height: .4rem; margin-top: .2rem; }
.icon-btn {
  width: 2.5rem; height: 2.5rem; border-radius: .7rem; display: grid; place-items: center;
  background: rgba(255, 255, 255, .07); border: 1px solid rgba(255, 255, 255, .12); font-size: 1.1rem;
}
.icon-btn:hover { background: rgba(255, 255, 255, .14); }

.d-rail {
  grid-row: 2; display: flex; flex-direction: column; gap: .2rem; padding: .6rem .45rem;
  background: rgba(10, 14, 32, .5); border-right: 1px solid rgba(255, 255, 255, .08);
}
.rail-btn {
  position: relative; flex: 0 0 auto; height: 3.45rem; border-radius: var(--rad-m);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .1rem;
  color: var(--c-muted); font-size: .72rem; font-weight: 800; border: 1.5px solid transparent;
  transition: background .15s, color .15s, border-color .15s;
}
.rail-btn .i { font-size: 1.45rem; line-height: 1; }
.rail-btn .k { position: absolute; top: .22rem; right: .32rem; font-size: .58rem; opacity: .5; font-weight: 800; }
.rail-btn:hover { background: rgba(255, 255, 255, .07); color: #fff; }
.rail-btn.active { color: #fff; background: rgba(56, 189, 248, .16); border-color: var(--c-primary); }
.rail-sp { flex: 1; }

/* ---------- 4. Stage & grid helper ---------- */
.d-screen {
  grid-column: 2; grid-row: 2; min-width: 0; min-height: 0; padding: .8rem;
  display: grid; gap: .8rem; animation: screenIn .25s ease;
}
.focus .d-screen { grid-column: 1; grid-row: 1; padding: .8rem 1rem; }
@keyframes screenIn { from { opacity: 0; transform: translateY(.6rem); } to { opacity: 1; transform: none; } }

.g3  { grid-template-columns: var(--side-w) minmax(0, 1fr) var(--side-w); grid-template-rows: minmax(0, 1fr); }
.g3n { grid-template-columns: 19rem minmax(0, 1fr) 22rem; grid-template-rows: minmax(0, 1fr); }
.g2  { grid-template-columns: minmax(0, 1fr) 26rem; grid-template-rows: minmax(0, 1fr); }
.col { display: flex; flex-direction: column; gap: .8rem; min-width: 0; min-height: 0; }
.col > .fill, .fill { flex: 1; min-height: 0; }
.row { display: flex; align-items: center; gap: .6rem; min-width: 0; }
.wrap { flex-wrap: wrap; }
.tc { text-align: center; }
.mt-auto { margin-top: auto; }

/* ---------- 5. Komponen dasar ---------- */
.panel {
  position: relative; display: flex; flex-direction: column; gap: .55rem;
  min-width: 0; min-height: 0; overflow: hidden; padding: .8rem .95rem;
  background: rgba(30, 41, 59, .78); border: 1.5px solid rgba(255, 255, 255, .1); border-radius: var(--rad-l);
}
.panel > h3 {
  margin: 0; display: flex; justify-content: space-between; align-items: center;
  font-size: .75rem; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; color: var(--c-muted);
}
.panel > h3 .more { color: var(--c-primary); letter-spacing: 0; text-transform: none; font-weight: 700; font-size: .78rem; }
.panel.link { cursor: pointer; transition: border-color .15s, transform .15s; }
.panel.link:hover { border-color: var(--c-primary); transform: translateY(-1px); }
.panel.glow { border-color: rgba(56, 189, 248, .5); box-shadow: 0 0 2rem rgba(56, 189, 248, .15); }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem; min-height: 2.5rem;
  padding: 0 1.1rem; border-radius: var(--rad-m); font-weight: 800; white-space: nowrap;
  background: var(--c-hover); border: 1.5px solid rgba(255, 255, 255, .14);
  transition: transform .12s, filter .15s;
}
.btn:hover { filter: brightness(1.15); }
.btn:active { transform: scale(.97); }
.btn.primary { background: linear-gradient(135deg, #0284c7, #0369a1); border-color: var(--c-primary); box-shadow: 0 .3rem 1rem rgba(2, 132, 199, .4); }
.btn.gold { background: linear-gradient(135deg, #fbbf24, #d97706); color: #2a1700; border-color: #fde68a; box-shadow: 0 .3rem 1rem rgba(245, 158, 11, .35); }
.btn.good { background: linear-gradient(135deg, #16a34a, #15803d); border-color: #4ade80; }
.btn.ghost { background: transparent; }
.btn.lg { min-height: 3.3rem; font-size: 1.12rem; }
.btn.sm { min-height: 2rem; padding: 0 .8rem; font-size: .82rem; }
.btn.block { width: 100%; }
.btn[disabled] { opacity: .45; pointer-events: none; }

.kbd {
  display: inline-grid; place-items: center; min-width: 1.35rem; height: 1.35rem; padding: 0 .3rem;
  border-radius: .35rem; background: rgba(255, 255, 255, .14); border: 1px solid rgba(255, 255, 255, .24);
  font-size: .68rem; font-weight: 800; color: #fff;
}
.chip {
  display: inline-flex; align-items: center; gap: .35rem; padding: .28rem .75rem; border-radius: 999px;
  background: rgba(255, 255, 255, .07); border: 1px solid rgba(255, 255, 255, .12);
  font-weight: 700; font-size: .82rem; white-space: nowrap;
}
.chip.active { background: rgba(56, 189, 248, .2); border-color: var(--c-primary); color: #fff; }
.tabs { display: flex; gap: .3rem; padding: .25rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .3); }
.tabs button { flex: 1; min-height: 2.2rem; border-radius: .6rem; font-weight: 800; color: var(--c-muted); }
.tabs button.active { background: var(--c-hover); color: #fff; box-shadow: inset 0 0 0 1.5px var(--c-primary); }

.bar { position: relative; height: .7rem; border-radius: 99px; background: rgba(255, 255, 255, .1); overflow: hidden; }
.bar > i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--c-primary), #818cf8); transition: width .5s ease; }
.bar.hp > i { background: linear-gradient(90deg, #16a34a, #4ade80); }
.bar.boss > i { background: linear-gradient(90deg, #dc2626, #f87171); }
.bar.xp > i { background: linear-gradient(90deg, #f59e0b, #fde047); }
.bar.good > i { background: linear-gradient(90deg, #16a34a, #4ade80); }
.bar.bad > i { background: linear-gradient(90deg, #dc2626, #f87171); }
.bar.lg { height: 1rem; }
.bar.tall { height: 1.2rem; }
.bar .t { position: absolute; inset: 0; display: grid; place-items: center; font-size: .72rem; font-weight: 900; text-shadow: 0 1px 2px #000; }

.rar-common { --rc: var(--r-common); } .rar-rare { --rc: var(--r-rare); }
.rar-epic { --rc: var(--r-epic); } .rar-legend { --rc: var(--r-legend); }
.tag { display: inline-block; padding: .1rem .55rem; border-radius: 999px; font-size: .68rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; color: #fff; background: var(--rc, #475569); }
.slot {
  position: relative; display: grid; place-items: center; aspect-ratio: 1 / 1; border-radius: var(--rad-m);
  background: rgba(0, 0, 0, .3); border: 2px solid var(--rc, rgba(255, 255, 255, .15));
  box-shadow: inset 0 0 1rem color-mix(in srgb, var(--rc, #000) 28%, transparent);
  font-size: 1.7rem; transition: transform .12s;
}
.slot:hover { transform: translateY(-2px); }
.slot.on { outline: 2.5px solid var(--c-primary); outline-offset: 2px; }
.slot.lock { filter: grayscale(1) brightness(.55); }
.slot.lock::after { content: '🔒'; position: absolute; right: .25rem; bottom: .15rem; font-size: .85rem; }
.slot small { position: absolute; left: 0; right: 0; bottom: .15rem; text-align: center; font-size: .6rem; font-weight: 800; color: #fff; text-shadow: 0 1px 2px #000; }

.stat-tile { padding: .55rem .8rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .28); border: 1px solid rgba(255, 255, 255, .08); }
.stat-tile b { display: block; font-size: 1.5rem; line-height: 1.1; }
.stat-tile span { font-size: .72rem; color: var(--c-muted); font-weight: 700; }
.ring { --p: 50; --rc2: var(--c-primary); width: 5.2rem; aspect-ratio: 1; border-radius: 50%;
  background: conic-gradient(var(--rc2) calc(var(--p) * 1%), rgba(255, 255, 255, .1) 0);
  display: grid; place-items: center; position: relative; flex: 0 0 auto; }
.ring::before { content: ''; position: absolute; inset: .45rem; border-radius: 50%; background: #1b2539; }
.ring b { position: relative; font-size: 1.05rem; }

/* ---------- 6. Beranda (Command Center) ---------- */
.hero-card { display: grid; grid-template-columns: 8.5rem 1fr; gap: .8rem; align-items: center; }
.hero-card .av { width: 8.5rem; height: 8.5rem; border-radius: var(--rad-l); overflow: hidden; }
.hero-card h2 { margin: 0; font-size: 1.25rem; line-height: 1.1; }
.hero-card .ttl { font-size: .78rem; color: var(--c-accent); font-weight: 800; }
.skill-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }
.skill-slot { display: flex; flex-direction: column; align-items: center; gap: .1rem; padding: .5rem .2rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .3); border: 1.5px solid rgba(56, 189, 248, .35); }
.skill-slot .i { font-size: 1.5rem; }
.skill-slot b { font-size: .75rem; }
.skill-slot small { font-size: .62rem; color: var(--c-muted); font-weight: 700; }
.badge-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }
.badge-card { display: flex; flex-direction: column; align-items: center; gap: .15rem; padding: .5rem .2rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .28); text-align: center; }
.badge-card .i { width: 2.6rem; height: 2.6rem; border-radius: 50%; display: grid; place-items: center; font-size: 1.4rem; background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--rc) 55%, #fff), var(--rc)); box-shadow: 0 0 .9rem color-mix(in srgb, var(--rc) 60%, transparent); }
.badge-card b { font-size: .72rem; line-height: 1.1; }
.badge-card small { font-size: .62rem; color: var(--c-muted); font-weight: 700; }

.stage {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  min-height: 0; padding: .9rem 1.2rem 1rem; border-radius: var(--rad-l); overflow: hidden;
  background: radial-gradient(ellipse at 50% 38%, rgba(124, 77, 255, .35) 0%, rgba(30, 41, 59, .75) 62%);
  border: 1.5px solid rgba(255, 255, 255, .1);
}
.stage .mascot { flex: 1; min-height: 0; width: 100%; }
.bubble { position: absolute; top: 1.1rem; right: 1.4rem; padding: .5rem .9rem; border-radius: 1rem 1rem .2rem 1rem; background: #fff; color: #1b1340; font-weight: 800; font-size: .92rem; box-shadow: 0 .4rem 1rem rgba(0, 0, 0, .4); }
.cta-row { display: flex; gap: .7rem; width: 100%; max-width: 40rem; }
.cta-row .btn { flex: 1; }
.nowline { width: 100%; max-width: 40rem; display: flex; flex-direction: column; gap: .3rem; padding: .55rem .8rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .35); }
.nowline .t { display: flex; justify-content: space-between; font-size: .82rem; font-weight: 800; }

.week-bars { display: flex; align-items: flex-end; gap: .35rem; height: 4.2rem; }
.week-bars i { flex: 1; border-radius: .25rem .25rem 0 0; background: linear-gradient(180deg, var(--c-primary), #6366f1); min-height: .3rem; }
.week-bars i.today { background: linear-gradient(180deg, #fde047, #f59e0b); }
.offer { display: flex; align-items: center; gap: .6rem; padding: .45rem .6rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .28); }
.offer .i { font-size: 1.6rem; }
.offer b { font-size: .85rem; display: block; }
.offer small { color: var(--c-accent); font-weight: 800; font-size: .75rem; }
.friend { display: flex; align-items: center; gap: .55rem; font-size: .85rem; font-weight: 700; }
.friend .dot { width: .6rem; height: .6rem; border-radius: 50%; background: var(--c-good); box-shadow: 0 0 .5rem var(--c-good); }
.friend .dot.off { background: #64748b; box-shadow: none; }
.friend .a { width: 1.9rem; height: 1.9rem; border-radius: 50%; display: grid; place-items: center; background: var(--c-hover); font-size: 1rem; }

/* ---------- 7. Peta ---------- */
.region-list { display: flex; flex-direction: column; gap: .3rem; }
.region { display: flex; align-items: center; gap: .6rem; padding: .45rem .7rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .25); border: 1.5px solid transparent; font-weight: 800; font-size: .9rem; }
.region:hover { background: rgba(255, 255, 255, .07); }
.region.active { border-color: var(--c-primary); background: rgba(56, 189, 248, .14); }
.region .i { font-size: 1.2rem; }
.region small { margin-left: auto; color: var(--c-muted); font-size: .72rem; }
.map-canvas { position: relative; flex: 1; min-height: 0; border-radius: var(--rad-m); overflow: hidden; background: radial-gradient(ellipse at 20% 80%, rgba(34, 197, 94, .25), transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(124, 77, 255, .3), transparent 55%), rgba(0, 0, 0, .22); }
.map-canvas svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.node { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: .2rem; text-align: center; width: 11rem; }
.node .b { width: 4.4rem; height: 4.4rem; border-radius: 50%; display: grid; place-items: center; font-size: 1.6rem; font-weight: 900; background: radial-gradient(circle at 35% 28%, #7dd3fc, #0284c7); border: 3px solid #fff; box-shadow: 0 .4rem 1.2rem rgba(2, 132, 199, .55); transition: transform .15s; }
.node:hover .b { transform: scale(1.08); }
.node.boss .b { width: 5.6rem; height: 5.6rem; background: radial-gradient(circle at 35% 28%, #fde68a, #d97706); box-shadow: 0 0 2rem rgba(245, 158, 11, .7); }
.node.sel .b { outline: 3px solid #fde047; outline-offset: 4px; }
.node.lock .b { filter: grayscale(1) brightness(.6); }
.node b.t { font-size: .85rem; }
.node small { font-size: .8rem; letter-spacing: .1em; }
.toggle { display: flex; align-items: center; gap: .6rem; padding: .55rem .8rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .3); font-weight: 800; font-size: .9rem; }
.sw { position: relative; width: 2.8rem; height: 1.5rem; border-radius: 99px; background: #475569; flex: 0 0 auto; transition: background .2s; }
.sw::after { content: ''; position: absolute; top: .15rem; left: .15rem; width: 1.2rem; height: 1.2rem; border-radius: 50%; background: #fff; transition: transform .2s; }
.sw.on { background: var(--c-good); } .sw.on::after { transform: translateX(1.3rem); }

/* ---------- 8. Arena battle (fokus) ---------- */
.battle { grid-template-columns: 24rem minmax(0, 1fr) 24rem; grid-template-rows: auto minmax(0, 1fr); }
.battle.read { grid-template-columns: 9rem minmax(0, 1fr) 9rem; }
.hud { grid-column: 1 / -1; display: flex; flex-direction: row; align-items: center; gap: .8rem; padding: .45rem .7rem; }
.hud .sp { flex: 1; }
.hud .timer { flex: 1.4; display: flex; align-items: center; gap: .7rem; }
.timer-bar { flex: 1; height: .7rem; border-radius: 99px; background: rgba(255, 255, 255, .12); overflow: hidden; }
.timer-bar i { display: block; height: 100%; width: 62%; background: linear-gradient(90deg, #f97316, #fbbf24); border-radius: inherit; }
.fighter { align-items: center; text-align: center; }
.fighter .fig { flex: 1; min-height: 0; width: 100%; }
.fighter h2 { margin: 0; font-size: 1.3rem; }
.fighter .meta { font-size: .8rem; color: var(--c-muted); font-weight: 700; }
.fighter .bar { width: 100%; }
.telegraph { width: 100%; padding: .5rem .7rem; border-radius: var(--rad-m); background: rgba(239, 68, 68, .18); border: 1.5px solid rgba(239, 68, 68, .6); font-weight: 800; font-size: .85rem; }
.read .fighter h2, .read .fighter .meta, .read .telegraph, .read .skills-deck, .read .log, .read .fighter .bar .t { display: none; }
.read .fighter .fig { flex: 0 0 auto; width: 7rem; height: 7rem; }

.qwrap { display: grid; grid-template-rows: minmax(0, 1fr) auto; gap: .8rem; min-height: 0; }
.qcard { justify-content: center; padding: 1.4rem 2rem; background: rgba(30, 41, 59, .88); }
.qtag { display: flex; align-items: center; justify-content: space-between; font-size: .8rem; font-weight: 900; letter-spacing: .1em; color: var(--c-accent); }
.qtext { font-size: clamp(1.4rem, 2.15vw, 2.4rem); font-weight: 800; line-height: 1.35; }
.read .qtext { font-size: clamp(1.7rem, 2.7vw, 3rem); }
.qimg { display: grid; place-items: center; min-height: 0; flex: 1; font-size: 4rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .25); }
.options { display: grid; grid-template-columns: 1fr 1fr; gap: .7rem; }
.opt {
  display: flex; align-items: center; gap: .8rem; min-height: 4.4rem; padding: .6rem 1rem; text-align: left;
  border-radius: var(--rad-m); font-size: 1.12rem; font-weight: 700;
  background: rgba(30, 41, 59, .92); border: 2px solid rgba(255, 255, 255, .14); transition: transform .12s, border-color .15s, background .15s;
}
.opt:hover { border-color: var(--c-primary); background: rgba(56, 189, 248, .12); transform: translateY(-2px); }
.opt .key { width: 2.1rem; height: 2.1rem; flex: 0 0 auto; display: grid; place-items: center; border-radius: 50%; background: rgba(255, 255, 255, .12); font-weight: 900; }
.opt.right { border-color: var(--c-good); background: rgba(34, 197, 94, .22); }
.opt.wrong { border-color: var(--c-bad); background: rgba(239, 68, 68, .22); }
.opt.dim { opacity: .4; pointer-events: none; }
.short-in { width: 100%; box-sizing: border-box; min-height: 3.6rem; padding: 0 1.2rem; border-radius: var(--rad-m); font-size: 1.4rem; font-weight: 800; background: rgba(0, 0, 0, .35); border: 2px solid var(--c-primary); outline: none; }
.skills-deck { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; }
.skill-btn { position: relative; display: flex; flex-direction: column; align-items: center; gap: .1rem; padding: 1.15rem .2rem .5rem; border-radius: var(--rad-m); background: linear-gradient(160deg, rgba(2, 132, 199, .35), rgba(30, 27, 75, .7)); border: 1.5px solid var(--c-primary); }
.skill-btn:hover { filter: brightness(1.2); }
.skill-btn .i { font-size: 1.6rem; }
.skill-btn b { font-size: .75rem; }
.skill-btn small { font-size: .62rem; color: #bae6fd; font-weight: 800; }
.skill-btn .kbd { position: absolute; top: .25rem; left: .25rem; }
.log { display: flex; flex-direction: column; gap: .25rem; font-size: .78rem; color: var(--c-muted); font-weight: 600; }
.log b { color: #fff; }
.energy-row { display: flex; gap: .3rem; justify-content: center; }
.energy-row i { width: 1.1rem; height: 1.6rem; border-radius: .3rem; background: #475569; }
.energy-row i.on { background: linear-gradient(180deg, #fde047, #f59e0b); box-shadow: 0 0 .6rem rgba(245, 158, 11, .7); }
.combo { text-align: center; font-weight: 900; color: #fb923c; font-size: 1rem; }
.floaty { position: absolute; left: 50%; top: 38%; transform: translateX(-50%); font-size: 3rem; font-weight: 900; pointer-events: none; animation: floaty 1s ease-out forwards; text-shadow: 0 .2rem 1rem rgba(0, 0, 0, .7); }
@keyframes floaty { from { opacity: 1; transform: translate(-50%, 0) scale(.8); } to { opacity: 0; transform: translate(-50%, -4rem) scale(1.3); } }

/* ---------- 9. Hasil ---------- */
.result { place-items: center; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
.result-card { width: min(82rem, 100%); height: min(46rem, 100%); display: grid; grid-template-columns: 1fr 1.05fr; gap: 1.2rem; padding: 1.4rem; border-radius: 1.6rem; background: linear-gradient(160deg, rgba(40, 33, 100, .92), rgba(15, 23, 42, .95)); border: 2px solid rgba(251, 191, 36, .55); box-shadow: 0 0 5rem rgba(251, 191, 36, .22); }
.stars { display: flex; gap: 1rem; justify-content: center; font-size: 4.2rem; }
.stars span { animation: pop .5s both; filter: drop-shadow(0 0 1rem rgba(251, 191, 36, .8)); }
.stars span:nth-child(2) { animation-delay: .2s; } .stars span:nth-child(3) { animation-delay: .4s; }
@keyframes pop { from { transform: scale(0) rotate(-40deg); opacity: 0; } to { transform: none; opacity: 1; } }
.kv { display: flex; justify-content: space-between; padding: .45rem 0; border-bottom: 1px dashed rgba(255, 255, 255, .12); font-weight: 700; }
.kv b { color: var(--c-accent); }

/* ---------- 10. Lemari ---------- */
.cat-tabs { display: flex; gap: .4rem; }
.cat-tabs button { flex: 1; display: flex; flex-direction: column; align-items: center; gap: .1rem; padding: .45rem 0; border-radius: var(--rad-m); background: rgba(0, 0, 0, .28); border: 1.5px solid transparent; font-size: .78rem; font-weight: 800; color: var(--c-muted); }
.cat-tabs button .i { font-size: 1.3rem; }
.cat-tabs button.active { color: #fff; border-color: var(--c-primary); background: rgba(56, 189, 248, .16); }
.item-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .7rem; }
.preview-stage { flex: 1; min-height: 0; display: block; padding: .4rem; border-radius: var(--rad-l); background: radial-gradient(circle at 50% 45%, rgba(124, 77, 255, .4), transparent 70%); }
.preview-stage .av { width: 100%; height: 100%; }
.set-prog { display: flex; gap: .3rem; }
.set-prog i { flex: 1; height: .5rem; border-radius: 9px; background: rgba(255, 255, 255, .14); }
.set-prog i.on { background: linear-gradient(90deg, #fde047, #f59e0b); }

/* ---------- 11. Toko ---------- */
.chest-banner { align-items: center; text-align: center; background: radial-gradient(circle at 50% 35%, rgba(168, 85, 247, .45), rgba(30, 41, 59, .8) 70%); }
.chest-banner .chest { flex: 1; min-height: 0; width: 100%; }
.shop-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: minmax(0, 1fr); gap: .8rem; }
.shop-card { align-items: center; text-align: center; justify-content: center; gap: .3rem; }
.shop-card .i { font-size: 2.6rem; }
.shop-card b { font-size: 1rem; }
.shop-card .price { color: var(--c-accent); font-weight: 900; }

/* ---------- 12. Duel ---------- */
.duel { grid-template-columns: 20rem minmax(0, 1fr) 20rem; grid-template-rows: auto minmax(0, 1fr); }
.round-dots { display: flex; gap: .4rem; justify-content: center; }
.round-dots i { width: 1.1rem; height: 1.1rem; border-radius: 50%; background: #475569; }
.round-dots i.w { background: var(--c-good); } .round-dots i.l { background: var(--c-bad); } .round-dots i.now { background: var(--c-accent); animation: pulseDot 1.2s infinite; }
@keyframes pulseDot { 50% { transform: scale(1.3); } }
.vs { font-size: 2.2rem; font-weight: 900; color: var(--c-accent); text-shadow: 0 0 1.2rem rgba(245, 158, 11, .7); }

/* ---------- 13. Dex ---------- */
.dex-grid { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); grid-template-rows: repeat(10, minmax(0, 1fr)); gap: .4rem; flex: 1; min-height: 0; }
.dex-cell { position: relative; border-radius: .6rem; padding: .15rem; background: rgba(0, 0, 0, .3); border: 1.5px solid var(--rc, rgba(255, 255, 255, .1)); min-height: 0; min-width: 0; transition: transform .12s, opacity .2s; }
.dex-cell:hover { transform: scale(1.12); z-index: 3; }
.dex-cell.sel { outline: 2.5px solid #fde047; z-index: 2; }
.dex-cell.dim { opacity: .22; }
.dex-cell.lock svg { filter: brightness(0) opacity(.5); }
.dex-cell small { position: absolute; left: .2rem; top: .05rem; font-size: .55rem; font-weight: 900; color: #fff; text-shadow: 0 1px 2px #000; }
.dex-cell .q { position: absolute; inset: 0; display: grid; place-items: center; font-weight: 900; font-size: 1.1rem; color: #cbd5e1; }
.dex-detail .big { flex: 0 0 auto; height: 16rem; aspect-ratio: 1; align-self: center; }
.dex-anat { display: grid; grid-template-columns: 1fr 1fr; gap: .35rem .8rem; font-size: .8rem; }
.dex-anat span { color: var(--c-muted); font-weight: 700; } .dex-anat b { text-align: right; }

/* ---------- 14. Profil ---------- */
.showcase { display: grid; grid-template-columns: repeat(3, 1fr); gap: .8rem; }
.sc-card { display: flex; flex-direction: column; align-items: center; gap: .35rem; padding: .9rem .4rem; border-radius: var(--rad-l); text-align: center; background: linear-gradient(170deg, color-mix(in srgb, var(--rc) 28%, #0b1020), rgba(0, 0, 0, .3)); border: 2px solid var(--rc); box-shadow: 0 0 1.4rem color-mix(in srgb, var(--rc) 35%, transparent); }
.sc-card .i { width: 4.6rem; height: 4.6rem; border-radius: 50%; display: grid; place-items: center; font-size: 2.4rem; background: radial-gradient(circle at 35% 28%, color-mix(in srgb, var(--rc) 50%, #fff), var(--rc)); }
.badge-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: .5rem; }
.bdg { aspect-ratio: 1; border-radius: var(--rad-m); display: grid; place-items: center; font-size: 1.6rem; background: radial-gradient(circle at 35% 28%, color-mix(in srgb, var(--rc) 40%, #fff), var(--rc)); }
.bdg.lock { background: rgba(0, 0, 0, .35); filter: grayscale(1) brightness(.5); }

/* ---------- 15. Laporan ---------- */
.rep-top { display: grid; grid-template-columns: repeat(4, 1fr); gap: .8rem; }
.topic-row { display: grid; grid-template-columns: 11rem 1fr 3rem; align-items: center; gap: .6rem; font-size: .85rem; font-weight: 700; }
.weak { padding: .6rem .8rem; border-radius: var(--rad-m); background: rgba(239, 68, 68, .12); border: 1.5px solid rgba(239, 68, 68, .45); }

/* ---------- 16. Pengaturan / Skill / Latihan / Auth ---------- */
.radio { display: flex; align-items: flex-start; gap: .7rem; padding: .6rem .8rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .25); border: 1.5px solid transparent; }
.radio .o { width: 1.2rem; height: 1.2rem; flex: 0 0 auto; border-radius: 50%; border: 2px solid var(--c-muted); margin-top: .15rem; }
.radio.on { border-color: var(--c-primary); background: rgba(56, 189, 248, .12); }
.radio.on .o { border-color: var(--c-primary); background: radial-gradient(circle, var(--c-primary) 45%, transparent 50%); }
.radio b { display: block; font-size: .92rem; } .radio small { color: var(--c-muted); font-weight: 600; font-size: .75rem; }
.setrow { display: flex; align-items: center; justify-content: space-between; padding: .5rem 0; border-bottom: 1px dashed rgba(255, 255, 255, .1); font-weight: 700; font-size: .92rem; }
.keys-table { display: grid; grid-template-columns: auto 1fr; gap: .45rem .8rem; align-items: center; font-size: .85rem; font-weight: 700; }
.skill-card { align-items: center; text-align: center; gap: .25rem; justify-content: center; }
.skill-card .i { font-size: 2rem; }
.skill-card.on { border-color: var(--c-primary); box-shadow: 0 0 1.4rem rgba(56, 189, 248, .25); }
.big-slot { display: flex; align-items: center; gap: .8rem; padding: .8rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .3); border: 2px dashed rgba(56, 189, 248, .6); }
.big-slot .i { font-size: 2.2rem; }

.auth { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); align-items: stretch; padding: 0 !important; gap: 0; }
.auth-hero { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .6rem; background: radial-gradient(ellipse at 50% 55%, rgba(124, 77, 255, .5), transparent 65%); }
.auth-hero .mon { height: 58%; width: 60%; }
.auth-hero h1 { margin: 0; font-size: 3.2rem; line-height: 1; text-align: center; letter-spacing: .02em; text-shadow: 0 .3rem 1.4rem rgba(124, 77, 255, .8); }
.auth-form { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2rem; }
.auth-card { width: min(30rem, 100%); display: flex; flex-direction: column; gap: .9rem; padding: 1.6rem; border-radius: 1.4rem; background: rgba(30, 41, 59, .88); border: 1.5px solid rgba(255, 255, 255, .12); }
.field { display: flex; flex-direction: column; gap: .3rem; font-weight: 800; font-size: .85rem; color: var(--c-muted); }
.field select, .field input { min-height: 3rem; padding: 0 1rem; border-radius: var(--rad-m); background: rgba(0, 0, 0, .35); border: 1.5px solid rgba(255, 255, 255, .15); color: #fff; font-size: 1rem; outline: none; }
.field select:focus, .field input:focus { border-color: var(--c-primary); }

/* ---------- 17. Overlay & toast ---------- */
.modal-overlay { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; background: rgba(0, 0, 0, .7); animation: fadeIn .2s; }
@keyframes fadeIn { from { opacity: 0; } }
.modal-card { width: min(46rem, 90vw); max-height: 86vh; overflow: hidden; padding: 1.4rem; border-radius: var(--rad-l); background: var(--c-surface); border: 2px solid rgba(255, 255, 255, .15); box-shadow: 0 1.4rem 4rem rgba(0, 0, 0, .8); }
.modal-card h3 { margin: 0 0 .8rem; font-size: 1.3rem; display: flex; justify-content: space-between; }
#toast { position: fixed; left: 50%; bottom: 1.6rem; transform: translate(-50%, 2rem); z-index: 3000; padding: .65rem 1.4rem; border-radius: 999px; background: rgba(15, 23, 42, .96); border: 1.5px solid var(--c-primary); font-weight: 800; opacity: 0; pointer-events: none; transition: transform .25s, opacity .25s; }
#toast.show { opacity: 1; transform: translate(-50%, 0); }

/* ---------- 18. Penjaga ukuran: di bawah 1280x720 -> mode mobile ---------- */
#d-guard { display: none; position: fixed; inset: 0; z-index: 9999; place-items: center; text-align: center; padding: 2rem; background: #0f172a; font-weight: 800; }
@media (max-width: 1279px), (max-height: 719px) { html[data-ui="desktop"] #d-guard { display: grid; } }

@media (prefers-reduced-motion: reduce) { * { animation-duration: .001s !important; transition-duration: .001s !important; } }

/* grafik batang laporan (HTML murni, tidak melar) */
.chart { display: flex; align-items: stretch; gap: .8rem; height: 100%; padding-top: .4rem; }
.col-bar { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: .3rem; min-width: 0; }
.col-bar .stack { width: 100%; display: flex; flex-direction: column; border-radius: .4rem; overflow: hidden; }
.col-bar .stack .ok { background: linear-gradient(180deg, #4ade80, #16a34a); }
.col-bar .stack .bad { background: linear-gradient(180deg, #f87171, #dc2626); }
.col-bar b { font-size: .75rem; color: var(--c-muted); }
.item-grid .slot { font-size: 2.6rem; }
.dex-cell { overflow: hidden; } .dex-cell svg { width: 100%; height: 100%; display: block; }
```

### 6.2 `public/js/desktop/core.js` (mode, shell, router, papan pintas)
```javascript
/* =====================================================================
   public/js/desktop/core.js — Deteksi mode, shell (top bar + rail), router, shortcut, UI kit
   ===================================================================== */

/* ---------- 1. Deteksi & pemilih mode UI ---------- */
const UIMode = {
  MIN_W: 1280, MIN_H: 720,
  pref() { try { return localStorage.getItem('ui_mode') || 'auto'; } catch { return 'auto'; } },
  setPref(v) { try { localStorage.setItem('ui_mode', v); } catch {} this.apply(true); },
  detect() {
    const fine = matchMedia('(pointer:fine)').matches && matchMedia('(hover:hover)').matches;
    const w = innerWidth, h = innerHeight;
    return (w >= this.MIN_W && h >= this.MIN_H && w / h >= 1.25 && fine) ? 'desktop' : 'mobile';
  },
  current() { const p = this.pref(); return p === 'auto' ? this.detect() : p; },
  apply(force) {
    const m = this.current();
    if (m === this._m && !force) return m;
    this._m = m;
    document.documentElement.dataset.ui = m;
    $('#css-mobile') && ($('#css-mobile').disabled = m !== 'mobile');
    $('#css-desktop') && ($('#css-desktop').disabled = m !== 'desktop');
    if (window.Screens && Screens.current) go(Screens.current, Screens._params || {});
    return m;
  },
  init() {
    let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => this.apply(), 150); });
    this.apply(true);
  }
};

/* ---------- 2. Helper kecil ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sv = (sym, cls = '') => `<svg class="sv ${cls}" viewBox="0 0 200 200" aria-hidden="true"><use href="#${sym}"/></svg>`;
const bar = (pct, cls = '', label = '') => `<div class="bar ${cls}"><i style="width:${pct}%"></i>${label ? `<span class="t">${label}</span>` : ''}</div>`;
const panel = (title, body, cls = '', more = '', go_ = '') =>
  `<section class="panel ${cls} ${go_ ? 'link' : ''}" ${go_ ? `data-go="${go_}"` : ''}>${title ? `<h3><span>${title}</span>${more ? `<span class="more">${more}</span>` : ''}</h3>` : ''}${body}</section>`;

function toast(msg, ms = 2200) {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.className = 'show';
  clearTimeout(el._t); el._t = setTimeout(() => (el.className = ''), ms);
}
const Modal = {
  open(title, html) {
    this.close();
    const o = document.createElement('div');
    o.className = 'modal-overlay'; o.id = 'common-modal';
    o.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true"><h3><span>${title}</span><button class="icon-btn" data-close>✕</button></h3>${html}</div>`;
    o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-close]')) this.close(); });
    document.body.appendChild(o);
  },
  close() { $('#common-modal')?.remove(); }
};

/* ---------- 3. Papan pintas keyboard ---------- */
const Keys = {
  scope: {},
  global: {},
  set(map) { this.scope = map || {}; },
  init() {
    addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const typing = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (typing && k !== 'Escape' && k !== 'Enter') return;
      const fn = this.scope[k] || (!this.scope.__noGlobal && this.global[k]);
      if (fn) { e.preventDefault(); fn(e); }
    });
  }
};

/* ---------- 4. Shell desktop ---------- */
const NAV = [
  ['home', '🏠', 'Beranda', '1'], ['peta', '🗺️', 'Petualangan', '2'], ['latihan', '📚', 'Latihan', '3'],
  ['duel', '👥', 'Duel', '4'], ['skill', '⚡', 'Skill', '5'], ['wardrobe', '🎒', 'Lemari', '6'],
  ['shop', '🛒', 'Toko', '7'], ['dex', '📖', 'Monsterdex', '8'], ['profil', '👤', 'Profil', '9'],
  ['report', '📊', 'Laporan', '0'], ['settings', '⚙️', 'Atur', '-']
];
const TITLES = { home: 'Beranda', peta: 'Peta Petualangan', latihan: 'Latihan Bebas', duel: 'Arena Duel', skill: 'Skill RPG', wardrobe: 'Lemari Kostum', shop: 'Toko & Gacha', dex: 'Monster Dex', profil: 'Profil Petualang', report: 'Laporan Mingguan', settings: 'Pengaturan' };
const FOCUS = new Set(['auth', 'battle', 'duel', 'result']);   // layar tanpa top bar & rail

const DesktopShell = {
  topbar(P) {
    return `
    <header class="d-top">
      <div class="d-logo"><div class="lg">${sv('boss-hero')}</div><div><b>Petualangan Pelajar</b><small>Desktop</small></div></div>
      <div class="d-crumb" id="crumb"></div>
      <div class="sp"></div>
      <span class="pill" title="Energi">⚡ ${P.en}/${P.enMax}</span>
      <span class="pill" title="Koin">🪙 ${P.coins.toLocaleString('id-ID')}</span>
      <span class="pill" title="Permata">💎 ${P.gems}</span>
      <button class="icon-btn" data-act="sfx" title="Efek suara">🔊</button>
      <button class="icon-btn" data-act="keys" title="Papan pintas (?)">⌨️</button>
      <div class="me-chip link" data-go="profil" style="cursor:pointer">
        <div class="av">${sv('av-main')}</div>
        <div><b>${P.name}</b><small class="muted" style="font-size:.7rem;font-weight:700">Lv ${P.lv} · ${P.cls}</small>${bar(P.xp, 'xp')}</div>
      </div>
    </header>`;
  },
  rail(active) {
    return `<nav class="d-rail" aria-label="Navigasi utama">
      ${NAV.map(([id, ic, lb, k]) => `<button class="rail-btn ${id === active ? 'active' : ''}" data-go="${id}" title="${lb} (${k})"><span class="k">${k}</span><span class="i">${ic}</span>${lb}</button>`).join('')}
      <div class="rail-sp"></div>
      <button class="rail-btn" data-act="admin" title="Menu Guru / Admin"><span class="i">🛡️</span>Guru</button>
      <button class="rail-btn" data-go="auth" title="Keluar akun"><span class="i">🚪</span>Keluar</button>
    </nav>`;
  },
  mount(app, name, params) {
    app.className = 'd-play' + (FOCUS.has(name) ? ' focus' : '');
    app.id = 'app';
    app.innerHTML = (FOCUS.has(name) ? '' : this.topbar(Player.data) + this.rail(name)) + `<main class="d-screen ${name}-screen" id="d-screen" data-screen="${name}"></main>`;
    const host = $('#d-screen');
    $('#crumb') && ($('#crumb').textContent = TITLES[name] || '');
    Keys.set({});
    DesktopScreens[name] ? DesktopScreens[name](host, params) : (host.innerHTML = panel('', `<p>Halaman ${name} tidak ditemukan</p>`));
  },
  bind() {   // dipasang SEKALI saat boot (delegasi klik) agar tidak menumpuk listener
    document.addEventListener('click', e => {
      if (!e.target.closest('#app.d-play')) return;
      const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go); return; }
      const a = e.target.closest('[data-act]'); if (!a) return;
      if (a.dataset.act === 'keys') DesktopShell.keysHelp();
      if (a.dataset.act === 'sfx') a.textContent = a.textContent === '🔊' ? '🔇' : '🔊';
      if (a.dataset.act === 'admin') toast('Menu Guru / Admin dibuka (contoh)');
    });
  },
  keysHelp() {
    const rows = [['1 – 0, -', 'Pindah layar (Beranda … Pengaturan)'], ['Esc', 'Kembali / tutup'], ['?', 'Tampilkan papan pintas'],
      ['A B C D  atau  1 2 3 4', 'Pilih jawaban (di arena)'], ['Spasi', 'Bacakan soal (TTS)'], ['Q W E', 'Pakai skill aktif 1 / 2 / 3'],
      ['F', 'Mode Fokus Baca (soal diperbesar)'], ['Enter', 'Konfirmasi / lanjut']];
    Modal.open('⌨️ Papan Pintas', `<div class="keys-table">${rows.map(([k, d]) => `<span class="kbd" style="justify-self:start;padding:0 .6rem">${k}</span><span>${d}</span>`).join('')}</div>`);
  }
};

/* ---------- 5. Router (membungkus go() versi mobile) ---------- */
function go(name, params = {}) {
  window.go = go;
  if (name !== 'auth' && !Player.data) return go('auth');
  const prev = Screens.current;
  if (prev && Screens[prev] && Screens[prev].destroy) Screens[prev].destroy();
  Modal.close();
  Screens.current = name; Screens._params = params;
  const app = $('#app');
  if (UIMode.current() === 'desktop') {
    DesktopShell.mount(app, name, params);          // <- jalur baru
  } else {
    app.className = 'm-play'; app.innerHTML = '';
    Screens[name] && Screens[name].render ? Screens[name].render(app, params) : (app.innerHTML = `<div class="screen active center-col"><p>Halaman ${name} tidak ditemukan</p></div>`);
  }
  if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
}

/* kunci global: angka = pindah layar */
NAV.forEach(([id, , , k]) => (Keys.global[k] = () => go(id)));
Keys.global['?'] = () => DesktopShell.keysHelp();
Keys.global['Escape'] = () => { if ($('#common-modal')) Modal.close(); };

const Screens = window.Screens || {};
window.Screens = Screens;
```

### 6.3 `public/js/desktop/screens.js` (semua layar)
```javascript
/* =====================================================================
   public/js/desktop/screens.js — Renderer tiap layar untuk Desktop Mode
   Pola hook di game asli:
     Screens.home.render = (app, p) => UIMode.current()==='desktop' ? DesktopScreens.home(app, p) : renderMobile(app, p)
   (di router go() sudah otomatis lewat DesktopShell.mount)
   ===================================================================== */
const DesktopScreens = {};

/* ---------- 1. AUTH ---------- */
DesktopScreens.auth = el => {
  el.classList.add('auth');
  el.innerHTML = `
    <div class="auth-hero">
      <div class="mon">${sv('boss-hero')}</div>
      <h1>PETUALANGAN<br>PELAJAR</h1>
      <div class="muted" style="font-weight:700">Game Kuis RPG Pelajar Cerdas</div>
    </div>
    <div class="auth-form">
      <form class="auth-card" id="form-auth">
        <div class="tabs"><button type="button" class="active">Masuk</button><button type="button">Daftar Baru</button></div>
        <label class="field">Pilih Kelasmu<select id="auth-class"><option>Kelas 5 SD</option><option>Kelas 4 SD</option><option>Kelas 6 SD</option></select></label>
        <label class="field">Pilih Nama Karakter<select><option>Bayu Pratama</option><option>Siti Rahma</option></select></label>
        <label class="field">PIN Ceria<input type="password" value="1234" maxlength="6" autocomplete="off"></label>
        <button type="submit" class="btn primary lg block">🚀 Mulai Bermain! <span class="kbd">Enter</span></button>
        <div class="muted tc" style="font-size:.78rem;font-weight:700">Tab = pindah kolom · Enter = masuk · ? = papan pintas</div>
      </form>
    </div>`;
  $('#form-auth').addEventListener('submit', e => { e.preventDefault(); go('home'); });
  Keys.set({ '?': () => DesktopShell.keysHelp(), __noGlobal: true });
};

/* ---------- 2. BERANDA = Command Center ---------- */
DesktopScreens.home = el => {
  const P = Player.data;
  el.classList.add('g3');
  const days = [40, 65, 30, 80, 55, 90, 70];
  el.innerHTML = `
  <div class="col">
    ${panel('', `<div class="hero-card"><div class="av">${sv('av-main')}</div><div>
        <h2>${P.name}</h2><div class="ttl">${P.title}</div>
        <div class="muted" style="font-size:.78rem;font-weight:700;margin:.15rem 0 .35rem">${P.cls} · Level ${P.lv}</div>
        ${bar(P.xp, 'xp lg', 'XP ' + P.xp + '%')}</div></div>`, '', '', 'profil')}
    ${panel('Skill aktif', `<div class="skill-row">
        <div class="skill-slot"><span class="i">✂️</span><b>Coret</b><small>Q · 1⚡</small></div>
        <div class="skill-slot"><span class="i">🛡️</span><b>Perisai</b><small>W · 1⚡</small></div>
        <div class="skill-slot"><span class="i">⏳</span><b>Waktu+</b><small>E · 1⚡</small></div></div>`, '', 'Atur ▸', 'skill')}
    ${panel('Lencana showcase', `<div class="badge-row">
        <div class="badge-card rar-common"><span class="i">🌟</span><b>Bintang Fajar</b><small>Tier 1</small></div>
        <div class="badge-card rar-epic"><span class="i">🔥</span><b>Brutal Conqueror</b><small>Tier 3</small></div>
        <div class="badge-card rar-legend"><span class="i">🐲</span><b>Naga Slayer</b><small>Tier 4</small></div></div>`, '', 'Semua ▸', 'profil')}
    ${panel('Teman online', `
        <div class="friend"><span class="a">👧</span>Siti Rahma<span class="dot"></span><span class="sp"></span><button class="btn sm primary" data-go="duel">Duel</button></div>
        <div class="friend"><span class="a">👦</span>Dimas Putra<span class="dot"></span><span class="sp"></span><button class="btn sm" data-go="duel">Duel</button></div>
        <div class="friend"><span class="a">🧒</span>Rani Safitri<span class="dot off"></span><span class="sp muted" style="font-size:.7rem">offline</span></div>`, 'fill', 'Pertemanan ▸', 'duel')}
  </div>

  <div class="stage">
    <div class="bubble">Halo, siap belajar? 👋</div>
    <div class="mascot" id="mascot" style="cursor:pointer" title="Sentuh aku!">${sv('boss-hero')}</div>
    <div class="nowline"><div class="t"><span>📖 Bab 1: Hutan Jamur Terlarang</span><span>⭐ 8/9</span></div>${bar(89, 'good')}
      <div class="muted" style="font-size:.75rem;font-weight:700">Berikutnya: Simpul 3 — Raja Jamurgon (Boss)</div></div>
    <div class="cta-row" style="margin-top:.7rem">
      <button class="btn primary lg" data-go="battle">⚔️ Lanjutkan Petualangan <span class="kbd">Enter</span></button>
      <button class="btn lg" data-go="latihan">📚 Latihan Bebas</button>
    </div>
  </div>

  <div class="col">
    ${panel('Laporan minggu ini', `<div class="row"><div class="ring" style="--p:85;--rc2:#22c55e"><b>85%</b></div>
        <div style="flex:1;min-width:0"><div style="font-weight:800">102 / 120 benar</div><div class="muted" style="font-size:.75rem;font-weight:700">Akurasi rata-rata</div>
        <div class="week-bars" style="height:2.6rem;margin-top:.3rem">${days.map((d, i) => `<i class="${i === 6 ? 'today' : ''}" style="height:${d}%"></i>`).join('')}</div></div></div>
        <div class="weak" style="padding:.4rem .7rem;font-size:.8rem;font-weight:700">🔴 Titik lemah: <b>Simbiosis Ekosistem</b> (45%)</div>`, '', 'Detail ▸', 'report')}
    ${panel('Penawaran harian', `
        <div class="offer"><span class="i">🧪</span><div><b>Ramuan HP</b><small>80 🪙</small></div><span class="sp"></span><button class="btn sm gold" data-go="shop">Beli</button></div>
        <div class="offer"><span class="i">🛡️</span><div><b>Perisai Ekstra</b><small>120 🪙</small></div><span class="sp"></span><button class="btn sm gold" data-go="shop">Beli</button></div>
        <div class="offer" style="background:linear-gradient(90deg,rgba(168,85,247,.35),rgba(0,0,0,.2))"><span class="i">🎁</span><div><b>Peti Gua Kristal</b><small>250 🪙</small></div><span class="sp"></span><button class="btn sm primary" data-go="shop">Buka</button></div>`, 'fill', 'Toko ▸', 'shop')}
    ${panel('Monster Dex', `<div class="row"><div class="ring" style="--p:24;--rc2:#a855f7"><b>24</b></div>
        <div><div style="font-weight:800">24 / 100 dikalahkan</div><div class="muted" style="font-size:.75rem;font-weight:700">Terbaru: Jamurgon · Ranting Berduri</div></div></div>`, '', 'Buka ▸', 'dex')}
  </div>`;
  $('#mascot').onclick = () => toast('🐲 "Ayo kalahkan aku kalau berani!"');
  Keys.set({ Enter: () => go('battle') });
};

/* ---------- 3. PETA ---------- */
DesktopScreens.peta = (el, p) => {
  el.classList.add('g3n');
  const nodes = [
    { n: 1, t: 'Penjaga Hutan', st: 3, x: 14, y: 68, sym: 'boss-jam', boss: 'Jamurgon', lv: 3 },
    { n: 2, t: 'Duri Beracun', st: 2, x: 42, y: 34, sym: 'boss-jam', boss: 'Ranting Berduri', lv: 4 },
    { n: 3, t: 'RAJA JAMURGON', st: 0, x: 76, y: 58, sym: 'boss-king', boss: 'Raja Jamurgon', lv: 6, isBoss: true }];
  let sel = 2, brutal = false, reg = 0;
  const draw = () => {
    const n = nodes[sel];
    el.innerHTML = `
    ${panel('Wilayah', `<div class="region-list">${HABITATS.map((h, i) => `<button class="region ${i === reg ? 'active' : ''}" data-reg="${i}"><span class="i">${h[1]}</span>${h[0]}<small>${i === 0 ? '8/9 ⭐' : i < 3 ? '🔓' : '🔒'}</small></button>`).join('')}</div>`, '')}
    <div class="col">
      ${panel('', `<div class="row"><div style="font-size:1.8rem">📖</div><div style="flex:1"><div style="font-weight:900;font-size:1.15rem">Bab 1: Hutan Jamur Terlarang</div><div class="muted" style="font-size:.8rem;font-weight:700">Progres: ⭐ 8/9 bintang tercapai</div></div><span class="pill">⚡ ${Player.data.en}/${Player.data.enMax}</span></div>`)}
      <div class="panel fill" style="padding:.6rem"><div class="map-canvas">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M14 68 C 26 68, 30 34, 42 34 S 62 58, 76 58" fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".7" stroke-dasharray="1.6 1.4" vector-effect="non-scaling-stroke" style="stroke-width:3px"/></svg>
        ${nodes.map((o, i) => `<button class="node ${o.isBoss ? 'boss' : ''} ${i === sel ? 'sel' : ''}" data-node="${i}" style="left:${o.x}%;top:${o.y}%"><span class="b">${o.isBoss ? '👑' : o.n}</span><b class="t">${o.t}</b><small>${o.st ? '⭐'.repeat(o.st) + '☆'.repeat(3 - o.st) : '☆☆☆'}</small></button>`).join('')}
      </div></div>
    </div>
    <div class="col">
      ${panel('Simpul ' + n.n, `<div style="height:13rem;align-self:center;aspect-ratio:1">${sv(n.sym)}</div>
          <div class="tc"><div style="font-weight:900;font-size:1.2rem">${n.boss}</div><div class="muted" style="font-size:.8rem;font-weight:700">Lv ${n.lv} · Elemen Hutan · ${n.isBoss ? 'Legend' : 'Rare'}</div></div>
          <div class="kv"><span>Hadiah menang</span><b>${brutal ? '+360 XP · +105 🪙' : '+120 XP · +35 🪙'}</b></div>
          <div class="kv"><span>Rekor bintang</span><b>${n.st ? '⭐'.repeat(n.st) : 'Belum ada'}</b></div>`, 'fill')}
      <div class="toggle" id="brutal"><span class="sw ${brutal ? 'on' : ''}"></span>😈 Mode Brutal <small class="muted" style="font-weight:700">Damage 2×, Hadiah 3×</small></div>
      <button class="btn primary lg block" id="fight">⚔️ TANTANG SIMPUL INI <span class="kbd">Enter</span></button>
    </div>`;
    $$('[data-reg]', el).forEach(b => b.onclick = () => { reg = +b.dataset.reg; draw(); });
    $$('[data-node]', el).forEach(b => b.onclick = () => { sel = +b.dataset.node; draw(); });
    $('#brutal').onclick = () => { brutal = !brutal; draw(); };
    $('#fight').onclick = () => go('battle');
  };
  draw();
  Keys.set({ Enter: () => go('battle'), ArrowLeft: () => { sel = Math.max(0, sel - 1); draw(); }, ArrowRight: () => { sel = Math.min(2, sel + 1); draw(); } });
};

/* ---------- 4. LATIHAN BEBAS ---------- */
DesktopScreens.latihan = el => {
  el.classList.add('g3n');
  const topics = ['Fotosintesis', 'Rantai Makanan', 'Simbiosis', 'Daur Air', 'Perkalian', 'Pecahan', 'Bangun Datar', 'Ide Pokok', 'Kata Baku', 'Peta & Arah', 'Keragaman Budaya', 'Energi'];
  el.innerHTML = `
    ${panel('Mata pelajaran', `<div class="region-list">${['🔬 IPA', '➗ Matematika', '📚 B. Indonesia', '🌏 IPS', '🇬🇧 B. Inggris'].map((t, i) => `<button class="region ${i === 0 ? 'active' : ''}">${t}</button>`).join('')}</div>`)}
    ${panel('Pilih topik latihan', `<div class="row wrap" style="gap:.5rem">${topics.map((t, i) => `<span class="chip ${i < 3 ? 'active' : ''}" style="font-size:.95rem;padding:.5rem 1rem">${t}</span>`).join('')}</div>
      <div class="muted" style="font-size:.85rem;font-weight:700;margin-top:.6rem">Topik bertanda biru akan dipakai. Topik yang masih lemah ditandai otomatis dari laporan.</div>`, '')}
    <div class="col">
      ${panel('Pengaturan sesi', `
        <div class="setrow"><span>Jumlah soal</span><span class="row"><span class="chip">5</span><span class="chip active">10</span><span class="chip">15</span></span></div>
        <div class="setrow"><span>Timer per soal</span><div class="sw on"></div></div>
        <div class="setrow"><span>Narator soal (TTS)</span><div class="sw on"></div></div>
        <div class="setrow" style="border:0"><span>Tanpa pemotongan energi</span><span class="tag" style="background:#16a34a">Santai</span></div>`, 'fill')}
      <button class="btn primary lg block" data-go="battle">▶️ MULAI LATIHAN <span class="kbd">Enter</span></button>
    </div>`;
  Keys.set({ Enter: () => go('battle') });
};

/* ---------- 5. ARENA BATTLE (fokus, 1 layar penuh) ---------- */
const QBANK = [
  { t: 'Apa fungsi klorofil pada daun?', o: ['Menyerap cahaya matahari', 'Mengusir serangga hama', 'Membantu penguapan air', 'Menyerap zat hara dari tanah'], a: 0, img: '🍃☀️' },
  { t: 'Berapakah hasil dari 15 × 8 ?', o: ['110', '120', '125', '130'], a: 1 },
  { t: 'Hewan pemakan tumbuhan disebut …', short: 'herbivora' }
];
DesktopScreens.battle = (el, p) => {
  const S = { q: 4, total: 10, boss: 280, bossMax: 350, hp: 85, hpMax: 100, shield: 10, en: 3, combo: 2, read: false, lock: false, ok: 0 };
  const dots = n => Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
  const draw = () => {
    const Q = QBANK[(S.q - 4) % QBANK.length];
    el.className = 'd-screen battle-screen battle' + (S.read ? ' read' : '');
    el.innerHTML = `
    <div class="panel hud">
      <button class="btn sm" data-go="home">✕ <span class="kbd">Esc</span></button>
      <span class="pill">⚡ ${S.en}/5</span><b>Soal ${S.q}/${S.total}</b>
      <div class="timer"><span>⏱️</span><div class="timer-bar"><i></i></div><b>12s</b></div>
      <span class="combo">🔥 Kombo ${S.combo}×</span><span class="sp"></span>
      <span class="pill">🛡️ ${S.shield}</span>
      <button class="btn sm" id="b-focus">📖 Fokus Baca <span class="kbd">F</span></button>
    </div>

    <div class="panel fighter" id="boss-side">
      <div class="fig">${sv('boss-jam')}</div>
      <h2>Jamurgon</h2><div class="meta">Lv 3 · Elemen Hutan</div>
      ${bar(S.boss / S.bossMax * 100, 'boss tall', S.boss + ' / ' + S.bossMax)}
      <div class="telegraph">⚠️ Aba-aba: Serbuk Lelap</div>
    </div>

    <div class="qwrap">
      <div class="panel qcard">
        <div class="qtag"><span>🎯 TITIK LEMAH</span><button class="btn sm" id="b-tts">🔊 Baca <span class="kbd">Spasi</span></button></div>
        <div class="qtext">${Q.t}</div>
        ${Q.img && !S.read ? `<div class="qimg" style="max-height:7rem">${Q.img}</div>` : ''}
      </div>
      ${Q.short ? `<div class="col"><input class="short-in" id="short" placeholder="Ketik jawabanmu lalu Enter…" autocomplete="off"><button class="btn primary lg" id="short-ok">Kirim Jawaban <span class="kbd">Enter</span></button></div>` :
        `<div class="options">${Q.o.map((o, i) => `<button class="opt" data-i="${i}"><span class="key">${'ABCD'[i]}</span>${o}</button>`).join('')}</div>`}
    </div>

    <div class="panel fighter" id="me-side">
      <div class="fig">${sv('av-main')}</div>
      <h2>${Player.data.name.split(' ')[0]}</h2><div class="meta">Lv ${Player.data.lv} · Ksatria</div>
      ${bar(S.hp / S.hpMax * 100, 'hp tall', S.hp + ' / ' + S.hpMax)}
      <div class="energy-row">${dots(S.en)}</div>
      <div class="skills-deck">
        <button class="skill-btn" data-sk="0"><span class="kbd">Q</span><span class="i">✂️</span><b>Coret</b><small>1⚡</small></button>
        <button class="skill-btn" data-sk="1"><span class="kbd">W</span><span class="i">🛡️</span><b>Perisai</b><small>1⚡</small></button>
        <button class="skill-btn" data-sk="2"><span class="kbd">E</span><span class="i">⏳</span><b>Waktu+</b><small>1⚡</small></button>
      </div>
      <div class="log"><div>✔ Kamu menyerang <b>-35</b> HP</div><div>⚠ Jamurgon bersiap: <b>Serbuk Lelap</b></div></div>
    </div>`;
    bind(Q);
  };
  const fx = (txt, col) => { const f = document.createElement('div'); f.className = 'floaty'; f.textContent = txt; f.style.color = col; el.appendChild(f); setTimeout(() => f.remove(), 1000); };
  const answer = (ok) => {
    if (S.lock) return; S.lock = true;
    if (ok) { S.boss = Math.max(0, S.boss - 35); S.combo++; S.ok++; fx('-35', '#fca5a5'); }
    else { S.hp = Math.max(1, S.hp - 8); S.combo = 0; fx('-8', '#f87171'); }
    setTimeout(() => { S.lock = false; S.q++; S.q > S.total ? go('result', { ok: S.ok }) : draw(); }, 900);
  };
  const bind = Q => {
    $('#b-focus').onclick = () => { S.read = !S.read; draw(); };
    $('#b-tts').onclick = () => toast('🔊 Membacakan soal…');
    $$('.opt', el).forEach(b => b.onclick = () => {
      if (S.lock) return; const i = +b.dataset.i, ok = i === Q.a;
      b.classList.add(ok ? 'right' : 'wrong'); if (!ok) $$('.opt', el)[Q.a].classList.add('right'); answer(ok);
    });
    $$('.skill-btn', el).forEach(b => b.onclick = () => useSkill(+b.dataset.sk, Q));
    if (Q.short) {
      const inp = $('#short'); setTimeout(() => inp.focus(), 50);
      const send = () => { const ok = inp.value.trim().toLowerCase() === Q.short; inp.style.borderColor = ok ? '#22c55e' : '#ef4444'; answer(ok); };
      $('#short-ok').onclick = send; inp.onkeydown = e => { if (e.key === 'Enter') send(); };
    }
  };
  const useSkill = (i, Q) => {
    if (S.en < 1 || S.lock) return toast('Energi tidak cukup');
    S.en--;
    if (i === 0 && Q.o) { const wr = Q.o.map((_, k) => k).filter(k => k !== Q.a).slice(0, 2); draw(); wr.forEach(k => $$('.opt', el)[k].classList.add('dim')); S.en; return; }
    if (i === 1) S.shield += 10;
    toast(['✂️ Dua opsi salah dicoret', '🛡️ Perisai +10', '⏳ Waktu +5 detik'][i]); draw();
  };
  draw();
  const letter = i => () => { const b = $$('.opt', el)[i]; b && b.click(); };
  Keys.set({ Escape: () => go('home'), f: () => { S.read = !S.read; draw(); }, ' ': () => toast('🔊 Membacakan soal…'),
    a: letter(0), b: letter(1), c: letter(2), d: letter(3), 1: letter(0), 2: letter(1), 3: letter(2), 4: letter(3),
    q: () => useSkill(0, QBANK[(S.q - 4) % 3]), w: () => useSkill(1), e: () => useSkill(2), __noGlobal: true });
};

/* ---------- 6. HASIL ---------- */
DesktopScreens.result = el => {
  el.classList.add('result');
  el.innerHTML = `
  <div class="result-card">
    <div class="col" style="align-items:center;justify-content:center;text-align:center">
      <div style="font-size:1rem;font-weight:900;letter-spacing:.2em;color:#fde68a">KEMENANGAN TELAK!</div>
      <div style="height:15rem;aspect-ratio:1;opacity:.85;filter:saturate(.5)">${sv('boss-jam')}</div>
      <div style="font-size:1.7rem;font-weight:900">"Jamurgon Tumbang!"</div>
      <div class="stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>
      <div class="muted" style="font-weight:800">3 BINTANG DIRAIH · Akurasi ≥ 63%</div>
    </div>
    <div class="col">
      ${panel('Ringkasan pertarungan', `<div class="kv"><span>Jawaban benar</span><b>8 dari 10 soal</b></div><div class="kv"><span>Akurasi</span><b>80%</b></div><div class="kv"><span>Kombo terbesar</span><b>6× beruntun 🔥</b></div>`)}
      ${panel('Hadiah diperoleh', `<div class="kv"><span>XP</span><b>+120 🌟 (Lv 5 ➔ 6)</b></div>${bar(78, 'xp lg', 'Lv 6 · 78%')}<div class="kv"><span>Koin emas</span><b>+35 🪙</b></div><div class="kv"><span>Lencana baru</span><b>🏆 Penakluk Hutan</b></div>`, 'fill')}
      <button class="btn primary lg block" data-go="peta">▶️ LANJUTKAN PERJALANAN <span class="kbd">Enter</span></button>
      <button class="btn lg ghost block" data-go="home">🏠 KEMBALI KE BERANDA <span class="kbd">Esc</span></button>
    </div>
  </div>`;
  Keys.set({ Enter: () => go('peta'), Escape: () => go('home'), __noGlobal: true });
};

/* ---------- 7. LEMARI KOSTUM ---------- */
DesktopScreens.wardrobe = el => {
  el.classList.add('g3n');
  let cat = 'hat', selId = null;
  const draw = () => {
    const list = WARDROBE[cat]; const it = list.find(x => x[0] === selId) || list.find(x => x[4] === 2) || list[0]; selId = it[0];
    const st = ['Terkunci 🔒', 'Dimiliki', 'Sedang dipakai ✔'][it[4]];
    el.innerHTML = `
    <div class="col">
      ${panel('Pratinjau live', `<div class="preview-stage"><div class="av">${sv('av-main')}</div></div>
         <div class="tc"><div style="font-weight:900">${Player.data.title}</div><div class="muted" style="font-size:.78rem;font-weight:700">${Player.data.name} · Lv ${Player.data.lv}</div></div>`, 'fill')}
      ${panel('Progres set sinergi', `<div style="font-weight:800;font-size:.85rem">🔮 Set Arkana Bintang Kosmik · 4/6</div><div class="set-prog"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div>`)}
    </div>
    ${panel('', `<div class="cat-tabs">${CATS.map(c => `<button class="${c[0] === cat ? 'active' : ''}" data-cat="${c[0]}"><span class="i">${c[1]}</span>${c[2]}</button>`).join('')}</div>
      <div class="item-grid" style="grid-template-columns:repeat(4,1fr);align-content:start;overflow:hidden">${list.map(x => `<button class="slot rar-${x[3]} ${x[4] === 0 ? 'lock' : ''} ${x[0] === selId ? 'on' : ''}" data-item="${x[0]}" title="${x[2]}"><span>${x[1]}</span><small>${x[4] === 2 ? 'DIPAKAI' : x[2]}</small></button>`).join('')}</div>`, 'fill')}
    <div class="col">
      ${panel('Detail item', `<div class="slot rar-${it[3]}" style="width:8rem;align-self:center;font-size:3.4rem">${it[1]}</div>
        <div class="tc"><div style="font-weight:900;font-size:1.2rem">${it[2]}</div><span class="tag rar-${it[3]}">${RARLBL[it[3]]}</span></div>
        <div class="kv"><span>Slot</span><b>${CATS.find(c => c[0] === cat)[2]}</b></div><div class="kv"><span>Status</span><b>${st}</b></div>
        <div class="kv" style="border:0"><span>Cara dapat</span><b>${it[4] ? 'Sudah dimiliki' : it[3] === 'legend' ? 'Peti Gacha' : '🪙 300 koin'}</b></div>`, 'fill')}
      <button class="btn ${it[4] === 0 ? 'gold' : 'primary'} lg block" id="equip">${it[4] === 0 ? '🛒 Buka di Toko' : it[4] === 2 ? '✔ Terpasang' : 'PAKAI'}</button>
      <button class="btn ghost block" id="save">✨ Simpan Penampilan Baru (Gratis)</button>
    </div>`;
    $$('[data-cat]', el).forEach(b => b.onclick = () => { cat = b.dataset.cat; selId = null; draw(); });
    $$('[data-item]', el).forEach(b => b.onclick = () => { selId = b.dataset.item; draw(); });
    $('#equip').onclick = () => it[4] === 0 ? go('shop') : toast('Item dipasang: ' + it[2]);
    $('#save').onclick = () => toast('✨ Penampilan tersimpan');
  };
  draw();
};

/* ---------- 8. TOKO ---------- */
DesktopScreens.shop = el => {
  el.classList.add('g3n');
  const offers = [['🧪', 'Ramuan HP', 80], ['🛡️', 'Perisai Ekstra', 120], ['⚡', 'Isi Energi', 150], ['⏳', 'Waktu+ ×3', 90], ['💡', 'Petunjuk ×3', 110], ['🔑', 'Kunci Peti', 200]];
  el.innerHTML = `
    ${panel('Peti Harta · Wilayah 3', `<div class="tc" style="font-weight:900;font-size:1.05rem">Gua Kristal</div><div class="chest">${sv('chest')}</div>
      <div class="muted tc" style="font-weight:700;font-size:.85rem">Biaya: 250 koin per buka</div>
      <button class="btn gold lg block" id="open">🎁 BUKA 1× (250 🪙)</button>`, 'chest-banner')}
    ${panel('Penawaran harian', `<div class="shop-grid fill">${offers.map(o => `<div class="panel shop-card" style="background:rgba(0,0,0,.25)"><span class="i">${o[0]}</span><b>${o[1]}</b><span class="price">${o[2]} 🪙</span><button class="btn sm primary" data-buy="${o[1]}">Beli</button></div>`).join('')}</div>`, 'fill')}
    <div class="col">
      ${panel('Saldo', `<div class="row"><span class="pill" style="font-size:1.1rem">🪙 1.450</span><span class="pill" style="font-size:1.1rem">💎 12</span></div>`)}
      ${panel('Tasku', `<div class="kv"><span>🧪 Ramuan HP</span><b>×2</b></div><div class="kv"><span>🛡️ Perisai Ekstra</span><b>×1</b></div><div class="kv"><span>⚡ Isi Energi</span><b>×0</b></div>`)}
      ${panel('Hasil gacha terbaru', `<div class="item-grid" style="grid-template-columns:repeat(3,1fr)"><div class="slot rar-rare"><span>🏴‍☠️</span></div><div class="slot rar-epic"><span>🧙</span></div><div class="slot rar-common"><span>🐱</span></div></div>`, 'fill')}
    </div>`;
  $('#open').onclick = () => Modal.open('🎉 Peti Terbuka!', `<div class="tc"><div class="slot rar-epic" style="width:9rem;margin:0 auto;font-size:4rem">🔮</div><h2 style="margin:.6rem 0 .2rem">Jubah Bintang</h2><span class="tag rar-epic">Epic</span><p class="muted" style="font-weight:700">Item masuk ke Lemari Kostum.</p><button class="btn primary lg" data-close>Mantap!</button></div>`);
  $$('[data-buy]', el).forEach(b => b.onclick = () => toast('Dibeli: ' + b.dataset.buy));
};

/* ---------- 9. DUEL 1v1 (fokus) ---------- */
DesktopScreens.duel = el => {
  el.classList.add('duel');
  let picked = -1;
  const side = (sym, name, meta, hp, mine) => `<div class="panel fighter"><div class="fig">${sv(sym)}</div><h2>${name}</h2><div class="meta">${meta}</div>${bar(hp, mine ? 'hp tall' : 'boss tall', `HP ${hp}/100`)}${mine ? `<div class="energy-row"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div><div class="skills-deck" style="grid-template-columns:1fr"><button class="skill-btn"><span class="kbd">Q</span><span class="i">✂️</span><b>Skill Coret</b></button></div>` : '<div class="telegraph" style="background:rgba(56,189,248,.15);border-color:var(--c-primary)">Lawan sedang berpikir…</div>'}</div>`;
  el.innerHTML = `
    <div class="panel hud" style="grid-column:1/-1"><button class="btn sm" data-go="home">✕ Keluar <span class="kbd">Esc</span></button>
      <b style="font-size:1.1rem">⚔️ ARENA DUEL 1v1</b><span class="sp"></span>
      <div class="round-dots"><i class="w"></i><i class="l"></i><i class="w"></i><i class="now"></i><i></i></div><span class="sp"></span>
      <div class="timer" style="max-width:20rem"><span>⏱️</span><div class="timer-bar"><i style="width:45%"></i></div><b>12s</b></div></div>
    ${side('av-main', Player.data.name, 'Lv 6 · Kamu', 90, true)}
    <div class="qwrap"><div class="panel qcard tc"><div class="vs">VS</div><div class="qtag" style="justify-content:center">SOAL BERSAMA · RONDE 4</div><div class="qtext">Berapakah hasil dari 15 × 8 = …?</div></div>
      <div class="options">${['110', '120', '125', '130'].map((o, i) => `<button class="opt" data-i="${i}"><span class="key">${'ABCD'[i]}</span>${o}</button>`).join('')}</div></div>
    ${side('av-rival', 'Siti Rahma', 'Lv 6 · SD Bintang', 75, false)}`;
  $$('.opt', el).forEach(b => b.onclick = () => { $$('.opt', el).forEach(x => x.classList.add('dim')); b.classList.remove('dim'); b.classList.add(+b.dataset.i === 1 ? 'right' : 'wrong'); toast('Jawaban terkirim, menunggu lawan…'); });
  const L = i => () => $$('.opt', el)[i].click();
  Keys.set({ Escape: () => go('home'), a: L(0), b: L(1), c: L(2), d: L(3), __noGlobal: true });
};

/* ---------- 10. SKILL ---------- */
const SKILLS = [['✂️', 'Coret', 'Hapus 2 opsi salah', 1], ['🛡️', 'Perisai', '+10 perisai', 1], ['⏳', 'Waktu+', '+5 detik', 1], ['💡', 'Petunjuk', 'Beri petunjuk singkat', 2], ['⚔️', 'Tebas', 'Damage +50%', 2],
  ['💚', 'Pulih', '+15 HP', 2], ['❄️', 'Beku', 'Timer berhenti 3 dtk', 3], ['🔥', 'Kombo', 'Kombo ×2', 3], ['👁️', 'Intip', 'Lihat 1 jawaban benar', 4], ['⭐', 'Nyawa', 'Selamat 1× dari kalah', 5]];
DesktopScreens.skill = el => {
  el.classList.add('g3n');
  let sel = 0;
  const draw = () => {
    const s = SKILLS[sel];
    el.innerHTML = `
    ${panel('3 slot skill aktif', ['Q', 'W', 'E'].map((k, i) => `<div class="big-slot"><span class="i">${SKILLS[i][0]}</span><div><b>${SKILLS[i][1]}</b><div class="muted" style="font-size:.75rem;font-weight:700">Tombol ${k} · ${SKILLS[i][3]}⚡</div></div></div>`).join('') + '<div class="muted" style="font-size:.78rem;font-weight:700">Klik skill di kanan, lalu seret ke slot (contoh).</div>', 'fill')}
    ${panel('10 skill RPG', `<div class="shop-grid" style="grid-template-columns:repeat(5,1fr);grid-auto-rows:minmax(0,1fr)">${SKILLS.map((k, i) => `<button class="panel skill-card ${i === sel ? 'on' : ''}" data-s="${i}" style="background:rgba(0,0,0,.25)"><span class="i">${k[0]}</span><b style="font-size:.9rem">${k[1]}</b><small class="muted" style="font-weight:700">Lv ${(i % 3) + 1} · ${k[3]}⚡</small></button>`).join('')}</div>
      <div class="muted" style="font-size:.72rem;font-weight:700">Nama & efek skill di layar ini adalah contoh; ambil dari data game.</div>`, 'fill')}
    ${panel('Detail skill', `<div class="slot rar-epic" style="width:7rem;align-self:center;font-size:3rem">${s[0]}</div><div class="tc"><div style="font-weight:900;font-size:1.2rem">${s[1]}</div><div class="muted" style="font-weight:700;font-size:.85rem">${s[2]}</div></div>
      <div class="kv"><span>Biaya energi</span><b>${s[3]} ⚡</b></div><div class="kv"><span>Level</span><b>${(sel % 3) + 1} / 5</b></div>`, 'fill')}`;
    $$('[data-s]', el).forEach(b => b.onclick = () => { sel = +b.dataset.s; draw(); });
  };
  draw();
};

/* ---------- 11. MONSTER DEX (10 × 10 terlihat sekaligus) ---------- */
DesktopScreens.dex = el => {
  el.classList.add('g3n');
  let sel = 0, fil = -1;
  const draw = () => {
    const m = DEX[sel], h = HABITATS[m.hab];
    el.innerHTML = `
    <div class="col">
      ${panel('Filter habitat', `<div class="region-list"><button class="region ${fil < 0 ? 'active' : ''}" data-f="-1"><span class="i">🌐</span>Semua</button>${HABITATS.map((x, i) => `<button class="region ${fil === i ? 'active' : ''}" data-f="${i}" style="padding:.3rem .7rem"><span class="i">${x[1]}</span>${x[0]}<small>${DEX.filter(d => d.hab === i && d.open).length}/10</small></button>`).join('')}</div>`, 'fill')}
      ${panel('', `<div class="row"><div class="ring" style="--p:24;--rc2:#a855f7;width:4rem"><b style="font-size:.9rem">24</b></div><div style="font-weight:800">24 / 100<div class="muted" style="font-size:.72rem">Total dikalahkan 🏆</div></div></div>`)}
    </div>
    ${panel('Semua 100 monster', `<div class="dex-grid">${DEX.map((d, i) => `<button class="dex-cell rar-${d.tier === 'common' ? 'common' : d.tier} ${i === sel ? 'sel' : ''} ${fil >= 0 && d.hab !== fil ? 'dim' : ''} ${d.open ? '' : 'lock'}" data-m="${i}" title="${d.open ? d.name : '???'}"><small>#${String(d.id).padStart(3, '0')}</small>${miniMonster(d)}${d.open ? '' : '<span class="q">?</span>'}</button>`).join('')}</div>`, 'fill')}
    ${panel('Detail', m.open ? `<div class="big">${miniMonster(m)}</div>
        <div class="tc"><div style="font-weight:900;font-size:1.25rem">#${String(m.id).padStart(3, '0')} · ${m.name}</div><span class="tag rar-${m.tier}">${RARLBL[m.tier]}</span> <span class="chip">${h[1]} ${h[0]}</span></div>
        <div class="dex-anat"><span>Dikalahkan</span><b>${m.wins}×</b><span>Rekor terbaik</span><b>${'⭐'.repeat(m.stars)}${'☆'.repeat(3 - m.stars)}</b><span>Bentuk tubuh</span><b>${m.body}</b><span>Mata</span><b>${m.eyes}</b></div>`
      : `<div class="big" style="filter:brightness(0);opacity:.5">${miniMonster(m)}</div><div class="tc" style="font-weight:900;font-size:1.2rem">#${String(m.id).padStart(3, '0')} · ??????</div><div class="muted tc" style="font-weight:700">Tumbangkan bos di ${h[0]} untuk membuka!</div>`, 'fill dex-detail')}`;
    $$('[data-m]', el).forEach(b => { b.onmouseenter = () => { if (sel !== +b.dataset.m) { sel = +b.dataset.m; draw(); } }; b.onclick = () => { sel = +b.dataset.m; draw(); }; });
    $$('[data-f]', el).forEach(b => b.onclick = () => { fil = +b.dataset.f; draw(); });
  };
  draw();
};

/* ---------- 12. PROFIL ---------- */
DesktopScreens.profil = el => {
  el.classList.add('g3n');
  const P = Player.data, B = [['🌟', 'common'], ['🔥', 'epic'], ['🐲', 'legend'], ['⚔️', 'rare'], ['📚', 'common'], ['🧠', 'rare'], ['🛡️', 'common'], ['🏆', 'epic'], ['⭐', 'rare'], ['🍄', 'common'], ['🎯', 'rare'], ['🌈', 'legend'], ['🔭', 'common'], ['💎', 'epic']];
  el.innerHTML = `
    ${panel('', `<div class="preview-stage"><div class="av">${sv('av-main')}</div></div><div class="tc"><div style="font-weight:900;font-size:1.3rem">${P.name}</div><div class="muted" style="font-weight:700;font-size:.85rem">${P.cls} · Level ${P.lv} Ksatria</div><div style="color:var(--c-accent);font-weight:800;font-size:.8rem">${P.title}</div></div>${bar(P.xp, 'xp lg', 'XP ' + P.xp + '%')}<button class="btn block" data-go="wardrobe">🎒 Ubah penampilan</button>`, 'fill')}
    <div class="col">
      ${panel('🏆 3 lencana showcase', `<div class="showcase"><div class="sc-card rar-common"><span class="i">🌟</span><b>Bintang Fajar</b><span class="tag">Tier 1</span></div><div class="sc-card rar-epic"><span class="i">🔥</span><b>Brutal Conqueror</b><span class="tag">Tier 3</span></div><div class="sc-card rar-legend"><span class="i">🐲</span><b>Naga Slayer</b><span class="tag">Tier 4</span></div></div>`)}
      ${panel('📊 Rekor & prestasi', `<div class="rep-top" style="grid-template-columns:repeat(2,1fr)"><div class="stat-tile"><b>48×</b><span>Total kemenangan</span></div><div class="stat-tile"><b>84,5%</b><span>Akurasi rata-rata</span></div><div class="stat-tile"><b>112 ⭐</b><span>Bintang terkumpul</span></div><div class="stat-tile"><b>6× 😈</b><span>Menang Brutal</span></div></div>`, 'fill')}
    </div>
    ${panel('🎖️ Koleksi lencana (14 dibuka)', `<div class="badge-grid">${Array.from({ length: 20 }, (_, i) => i < 14 ? `<div class="bdg rar-${B[i][1]}" title="Lencana">${B[i][0]}</div>` : '<div class="bdg lock">🔒</div>').join('')}</div>`, 'fill')}`;
};

/* ---------- 13. LAPORAN ---------- */
DesktopScreens.report = el => {
  el.classList.add('g2');
  const W = [['Sen', 14, 4], ['Sel', 18, 3], ['Rab', 10, 5], ['Kam', 20, 2], ['Jum', 16, 3], ['Sab', 12, 4], ['Min', 12, 3]];
  const mx = 24, chart = `<div class="chart">${W.map(d => `<div class="col-bar"><div class="stack" style="height:${(d[1] + d[2]) / mx * 100}%"><i class="bad" style="flex:${d[2]}"></i><i class="ok" style="flex:${d[1]}"></i></div><b>${d[0]}</b></div>`).join('')}</div>`;
  const T = [['Fotosintesis Tumbuhan', 95], ['Operasi Hitung Perkalian', 90], ['Rantai Makanan', 82], ['Daur Air', 78], ['Pecahan', 70], ['Ide Pokok', 66], ['Peta & Arah', 58], ['Simbiosis Ekosistem', 45]];
  el.innerHTML = `
    <div class="col">
      <div class="panel row" style="flex-direction:row;justify-content:center"><button class="btn sm">◀</button><b style="font-size:1.05rem">Minggu ini · 3 – 9 Nov 2026</b><button class="btn sm">▶</button></div>
      <div class="rep-top"><div class="stat-tile"><b>120</b><span>Total soal dijawab</span></div><div class="stat-tile"><b style="color:#4ade80">102</b><span>Jawaban benar</span></div><div class="stat-tile"><b style="color:#fde047">85% ⭐</b><span>Akurasi rata-rata</span></div><div class="stat-tile"><b>6× 🔥</b><span>Kombo terbesar</span></div></div>
      <div class="col fill" style="flex-direction:row">
        ${panel('Aktivitas per hari', `<div class="fill">${chart}</div><div class="row" style="font-size:.75rem;font-weight:700"><span style="color:#4ade80">■ Benar</span><span style="color:#f87171">■ Salah</span></div>`, 'fill')}
        ${panel('Penguasaan topik', T.map(t => `<div class="topic-row"><span>${t[0]}</span>${bar(t[1], t[1] >= 80 ? 'good' : t[1] >= 60 ? '' : 'bad')}<b>${t[1]}%</b></div>`).join(''), 'fill')}
      </div>
    </div>
    <div class="col">
      ${panel('🔴 Titik lemah', `<div class="weak"><b>Simbiosis Ekosistem</b><div class="muted" style="font-size:.8rem;font-weight:700">Akurasi 45% · 11 soal</div><button class="btn sm primary" style="margin-top:.4rem" data-go="latihan">📚 Latihan ulang topik ini</button></div>
        <div class="weak" style="border-color:rgba(245,158,11,.5);background:rgba(245,158,11,.1)"><b>Peta & Arah</b><div class="muted" style="font-size:.8rem;font-weight:700">Akurasi 58% · 9 soal</div><button class="btn sm" style="margin-top:.4rem" data-go="latihan">Latihan</button></div>`, 'fill')}
      ${panel('🟢 Sangat dikuasai', `<div class="kv"><span>Fotosintesis Tumbuhan</span><b>95%</b></div><div class="kv"><span>Operasi Hitung Perkalian</span><b>90%</b></div>`)}
    </div>`;
};

/* ---------- 14. PENGATURAN ---------- */
DesktopScreens.settings = el => {
  el.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
  const pref = UIMode.pref(); const sw = on => `<div class="sw ${on ? 'on' : ''}" data-sw></div>`;
  el.innerHTML = `
    ${panel('🎮 Tampilan', `
      <div class="radio ${pref === 'auto' ? 'on' : ''}" data-ui="auto"><span class="o"></span><div><b>Mode UI: Otomatis</b><small>Desktop bila layar ≥ 1280×720 dan memakai mouse</small></div></div>
      <div class="radio ${pref === 'desktop' ? 'on' : ''}" data-ui="desktop"><span class="o"></span><div><b>Paksa Desktop</b><small>Satu layar penuh, semua panel terlihat</small></div></div>
      <div class="radio ${pref === 'mobile' ? 'on' : ''}" data-ui="mobile"><span class="o"></span><div><b>Paksa Mobile</b><small>Tata letak ponsel (3 opsi layout battle)</small></div></div>
      <div class="setrow"><span>Arena: Fokus Baca bawaan</span>${sw(false)}</div>
      <div class="setrow" style="border:0"><span>Efek visual (3D & animasi)</span><span class="row"><span class="chip active">Penuh</span><span class="chip">Lite</span></span></div>`, 'fill')}
    <div class="col">
      ${panel('🔊 Audio & suara', `<div class="setrow"><span>Efek suara (SFX)</span>${sw(true)}</div><div class="setrow"><span>Musik latar (BGM)</span>${sw(false)}</div><div class="setrow" style="border:0"><span>Narator soal (TTS)</span>${sw(true)}</div>`)}
      ${panel('♿ Aksesibilitas', `<div class="setrow"><span>Ukuran font soal</span><span class="row"><span class="chip">Kecil</span><span class="chip active">Sedang</span><span class="chip">Besar</span></span></div><div class="setrow" style="border:0"><span>Mode gerak berkurang</span>${sw(false)}</div>`)}
      <button class="btn lg block mt-auto" data-go="auth">🚪 KELUAR AKUN</button>
    </div>
    ${panel('⌨️ Papan pintas', `<div class="keys-table">${[['1 – 0, -', 'Pindah layar'], ['A B C D / 1–4', 'Jawab soal'], ['Q W E', 'Skill 1 / 2 / 3'], ['Spasi', 'Bacakan soal'], ['F', 'Fokus Baca'], ['Enter', 'Lanjut / konfirmasi'], ['Esc', 'Kembali / tutup'], ['?', 'Bantuan']].map(r => `<span class="kbd" style="justify-self:start;padding:0 .6rem">${r[0]}</span><span>${r[1]}</span>`).join('')}</div>`, 'fill')}`;
  $$('[data-sw]', el).forEach(s => s.onclick = () => s.classList.toggle('on'));
  $$('[data-ui]', el).forEach(r => r.onclick = () => { UIMode.setPref(r.dataset.ui); toast('Mode UI: ' + r.dataset.ui); });
};
```

### 6.4 `mock-data.js` (hanya mockup)
Berisi `Player` contoh, 100 monster contoh (`DEX`), data lemari, dan `miniMonster()` (renderer gaya "lite"). Di game asli diganti oleh `Player.data`, `Monsters.renderMonster()`, dan `renderAvatar()` dari `shared/*.js`.

Sprite yang dipakai lewat `sv('nama')` (`<use href="#nama">`) di mockup: `boss-hero`, `boss-king`, `boss-jam`, `av-main`, `av-rival`, `chest`. Di game asli ganti dengan keluaran renderer SVG (lihat proposal upgrade 3D).

---

## 7. Integrasi ke Proyek

1. **Berkas baru**: `public/css/desktop.css`, `public/js/desktop/core.js`, `public/js/desktop/screens.js`.
2. **`index.html`**: tambahkan `<link id="css-desktop" rel="stylesheet" href="css/desktop.css">` dan beri `id="css-mobile"` pada `style.css` yang ada; tambahkan `<div id="d-guard">…</div>`. Muat dua skrip desktop setelah `app.js`.
3. **Router**: ganti `go()` di `app.js` dengan versi di `core.js` (cabang mobile tidak berubah).
4. **Boot**: `Keys.init(); DesktopShell.bind(); UIMode.init();`
5. **Data nyata**: ganti `Player.data`, daftar monster, dan item lemari dengan data API; ganti `sv('av-main')`/`sv('boss-*')` dengan `renderAvatar(...)` dan `Monsters.renderMonster(...)`.
6. **Urutan kerja**: shell + beranda → battle → lemari/toko → dex/profil/laporan → sisanya.
7. **Pengaturan**: simpan pilihan `ui_mode` ke profil pemain bila ingin ikut ke perangkat lain.

---

## 8. Aksesibilitas, Performa, dan Uji

**Aksesibilitas**: semua tombol adalah `<button>`; fokus keyboard terlihat; `prefers-reduced-motion` menonaktifkan animasi; ukuran font soal mengikuti pengaturan; warna tidak menjadi satu-satunya penanda (opsi benar/salah juga diberi garis tepi).

**Performa**: tidak memakai `<filter>`/blur untuk panel; animasi hanya `transform`/`opacity`; Monster Dex memakai renderer "lite" (100 SVG statis).

**Daftar uji sebelum rilis**
- [ ] Tidak ada scroll halaman di 1280×720, 1366×768, 1440×900, 1920×1080, 2560×1080 (sudah diuji pada mockup untuk 14 layar).
- [ ] Tidak ada panel yang konten dalamnya terpotong.
- [ ] Semua layar bisa dijangkau lewat keyboard.
- [ ] Mengubah ukuran jendela melewati 1280×720 berpindah mode tanpa kehilangan layar aktif.
- [ ] Soal panjang dan opsi jawaban panjang tetap terbaca (uji dengan *Fokus Baca*).
- [ ] Mode paksa Mobile dan paksa Desktop tersimpan setelah muat ulang.

---
*Dokumen desain desktop mode disusun sebagai pendamping dokumen mobile v7.2, 8 November 2026.*
