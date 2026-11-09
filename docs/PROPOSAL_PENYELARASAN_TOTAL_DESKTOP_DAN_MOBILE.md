# 🖥️ PROPOSAL STRATEGIS & TEKNIS: PENYELARASAN TOTAL MODE DESKTOP & MOBILE
## Game Edukasi RPG: *Petualangan Pelajar*
**Target Berkas**: `docs/PROPOSAL_PENYELARASAN_TOTAL_DESKTOP_DAN_MOBILE.md`  
**Referensi Induk**: `docs/DESIGN_UI_GAME_MOBILE_MODE_CODE_DAN_STRUKTUR.md` & `docs/DESIGN_UI_GAME_DESKTOP_MODE_CODE_DAN_STRUKTUR.md`  
**Status**: Proposal Siap Eksekusi (Ready for Implementation)  
**Tanggal**: 8 November 2026  

---

## 📑 DAFTAR ISI

1. [Ringkasan Eksekutif & Prinsip Desain](#1-ringkasan-eksekutif--prinsip-desain)
2. [Hasil Grounding & Audit Kesenjangan (Gap Analysis) Kode Riil](#2-hasil-grounding--audit-kesenjangan-gap-analysis-kode-riil)
3. [Desain Ulang Sidebar Navigasi Desktop (Ergonomis 14rem + Mini-Rail)](#3-desain-ulang-sidebar-navigasi-desktop-ergonomis-14rem--mini-rail)
4. [Presisi Cockpit Beranda (Layout 3-Kolom Seimbang & Bersih)](#4-presisi-cockpit-beranda-layout-3-kolom-seimbang--bersih)
5. [Rekonstruksi Total Monster Dex Desktop (Fitur 100% Identik Mobile)](#5-rekonstruksi-total-monster-dex-desktop-fitur-100-identik-mobile)
6. [Penyelarasan Fitur Utama Lainnya (Latihan, Duel, Peta Cerita, Laporan)](#6-penyelarasan-fitur-utama-lainnya-latihan-duel-peta-cerita-laporan)
7. [Spesifikasi Teknis CSS, Grid Layout & State Management](#7-spesifikasi-teknis-css-grid-layout--state-management)
8. [Rencana Implementasi Bertahap (Roadmap 4 Fase)](#8-rencana-implementasi-bertahap-roadmap-4-fase)
9. [Matriks Verifikasi & Kriteria Keberhasilan (Acceptance Criteria)](#9-matriks-verifikasi--kriteria-keberhasilan-acceptance-criteria)

---

## 1. Ringkasan Eksekutif & Prinsip Desain

### 1.1 Latar Belakang
Mode Desktop diciptakan untuk menghadirkan pengalaman bermain RPG Edukasi yang megah di layar monitor PC dan Laptop (resolusi 1280×720 hingga 2560×1440) dengan filosofi **"Single-Viewport Cockpit"** (seluruh informasi terlihat dalam 1 pandangan layar tanpa scroll halaman). 

Namun, hasil pengujian langsung dan masukan pengguna menemukan beberapa masalah kritis:
1. **Sidebar Navigasi Terlalu Kecil & Tidak Sesuai**: Menggunakan lebar statis sempit `--rail-w: 5.4rem` (~86px) dengan tombol vertikal kerdil (`height: 3.05rem`, font `0.67rem`). Teks nama menu seperti "Petualangan", "Pertemanan", dan "Pengaturan" terhimpit serta bertabrakan dengan tombol pintasan keyboard.
2. **Beranda Belum Presisi & Berantakan**: Menampilkan 10 ubin menu mobile di tengah panggung yang menduplikasi isi sidebar navigasi, mengorbankan panggung maskot serta membuat tata letak terasa sesak dan tidak elegan.
3. **Kesenjangan Monster Dex Sangat Signifikan**: Desktop saat ini hanya menampilkan kisi tombol 10×10 statis dengan data mock (`id <= 3`), tanpa sinkronisasi `/api/dex`, tanpa filter status koleksi, tanpa filter 10 elemen wilayah, tanpa pencarian `#ID/Nama`, tanpa sakelar *Pratinjau Mode Brutal*, dan tanpa detail jurus resmi bos dari modul `BossSkills`.
4. **Fitur Mode Mobile Belum Terintegrasi Penuh**: Arena latihan multi-tipe soal (MCQ, Benar/Salah, Mengurutkan, Menjodohkan, Isian Singkat), lobi duel kawan real-time, dan ekspor laporan belajar belum setara dengan arsitektur mode mobile.

### 1.2 Prinsip Utama: "Fitur 100% Identik Mobile, Ergonomi Desktop Presisi"
- **Paritas Fitur Penuh (100% Feature Parity)**: Tidak ada fitur, opsi filter, aset visual SVG, perhitungan pasif skin, atau mekanik pertempuran di mobile yang hilang atau disederhanakan di desktop.
- **Ergonomi Desktop Native**: Memanfaatkan ruang pandang horizontal yang luas (16:9 / 16:10 / 21:9) untuk menyajikan tata letak 3-kolom multi-panel yang presisi, kontrol keyboard terintegrasi (`Enter`, `Esc`, `A/B/C/D`, `Q/W/E`, angka `1-0`), dan interaksi hover yang responsif.
- **Zero Page Scroll, Fluid Inner Containers**: Jendela `#app` terkunci pada `100vw × 100dvh` (`overflow: hidden`). Jika suatu daftar memiliki banyak item (seperti katalog monster atau riwayat pertempuran), area tersebut menggunakan container scroll internal yang mulus (*custom sleek scrollbar*).

---

## 2. Hasil Grounding & Audit Kesenjangan (Gap Analysis) Kode Riil

Berdasarkan audit komprehensif terhadap basis kode di `public/js/app.js` (Mobile) dibandingkan `public/js/desktop/screens.js`, `public/js/desktop/core.js`, dan `public/css/desktop.css`:

| Modul / Komponen | Implementasi Mobile (`app.js`) | Kondisi Desktop Saat Ini (`screens.js` & `desktop.css`) | Kesenjangan (Gap) Utama | Solusi Penyelarasan |
|---|---|---|---|---|
| **Sidebar Navigasi** | Menggunakan bilah navigasi bawah (`#botnav`) 5 tab + menu laci modal. | Rail kiri tetap `--rail-w: 5.4rem` (~86px), tombol vertikal 3.05rem, font 0.67rem, shortcut key menabrak teks. | Terlalu sempit, label terpotong, tidak ada pengelompokan menu, tidak ergonomis untuk layar laptop/PC. | Ganti dengan **Expanded Sidebar (14rem / ~224px)** dengan layout horizontal ikon + label tebal + kbd pill, pembagian grup, profil mini bawah, dan opsi toggle collapse (4.8rem). |
| **Beranda (Home)** | Banner hero, 10 ubin menu utama, widget progres petualangan, modal cepat. | 3 kolom (`.g3`), namun tengah panggung memuat ulang 10 ubin tombol mobile yang menduplikasi sidebar. | Tata letak tengah berjejal, duplikasi navigasi, spacing panggung maskot tidak stabil, penawaran toko tidak sinkron. | Hapus 10 ubin duplikat dari panggung tengah. Susun Cockpit 3-Kolom presisi: Kiri (Hero Card & Skill Deck & Gelar), Tengah (Panggung Maskot, Banner Dinamis Bab/Wilayah, Tombol Aksi Utama), Kanan (Laporan 7 Hari, Dex Ring, Duel Kawan). |
| **Monster Dex** | Endpoint `/api/dex`, 100 Bos (40 Common, 30 Rare, 20 Epic, 10 Legend), 4 status kepemilikan, 10 elemen habitat, filter tier, search box, **Toggle Mode Brutal (`💀`)**, dan modal detail jurus bos dari `BossSkills.skillsFor()`. | Hanya kisi tombol 10×10 tanpa filter status, tanpa filter elemen, tanpa tier filter, tanpa search, tanpa brutal toggle, data mock (`id <= 3`), tanpa rincian jurus bos. | **Kesenjangan Kritis**: Fitur paling timpang. Pemain desktop tidak bisa mencari bos, tidak bisa melihat efek jurus elemen, dan tidak bisa mengecek variasi brutal mode. | Rekonstruksi total menjadi **3-Pane Monster Dex Cockpit**: Kiri (Statistik & Filter Kontrol), Tengah (Kisi Kartu Bos Interaktif & Pencarian), Kanan (Inspeksi Mendalam Bos + Jurus Resmi Normal vs Brutal dari `BossSkills`). |
| **Peta Petualangan (`peta`)** | 10 Bab Wilayah, simpul 1-10 per bab, status bintang mingguan, visual bos SVG unik, peti hadiah. | Sudah memiliki tab Cerita, Bebas, Fun, namun seleksi simpul dan preview bos belum sinkron penuh dengan visual SVG bab 2 & 3. | Visual SVG bab tertentu masih memakai placeholder generic, detail hadiah peti belum interaktif. | Sambungkan visual SVG bos bab 1-3 lengkap, tampilkan deskripsi topik kurikulum, dan integrasikan modal konfirmasi energi. |
| **Arena Latihan (`latihan`)** | 5 Tipe Soal (Pilihan Ganda, Benar/Salah, Mengurutkan, Menjodohkan, Isian Singkat) + Pengaturan Sesi. | Hanya menyajikan daftar mata pelajaran statis yang mengarah ke battle generic. | Tipe soal interaktif (matching, ordering, short answer) belum terpasang di mode latihan desktop. | Pasang selector topik materi, target jumlah soal (5/10/20), dan aktifkan mode latihan multi-tipe soal. |
| **Duel Teman (`duel`)** | Lobi undangan duel, salin kode tantangan, sinkronisasi status online kawan, ronde 1-3. | Layar duel statis dengan tampilan dummy turn. | Belum tersambung ke endpoint lobi duel real-time. | Sambungkan ke `/api/friends/duel` dan tampilkan lobi tantangan aktif dengan tombol respon cepat. |
| **Laporan & Rapor (`report`)** | Grafik radar topik penguasaan, akurasi per mata pelajaran, riwayat soal, tautan share portal `/r/{token}`. | Panel statistik dasar dengan grafik bar sederhana. | Belum ada tombol ekspor/cetak rapor dan grafik radar topik kelemahan. | Tambahkan tab analisis topik, grafik radar SVG, dan tombol "Cetak Rapor / Bagikan Link". |

---

## 3. Desain Ulang Sidebar Navigasi Desktop (Ergonomis 14rem + Mini-Rail)

### 3.1 Identifikasi Masalah Sidebar Saat Ini
Di dalam berkas `public/css/desktop.css`:
```css
/* MASALAH SAAT INI */
:root {
  --rail-w: 5.4rem; /* Hanya ~86px - Terlalu Sempit! */
}
.rail-btn {
  height: 3.05rem;
  flex-direction: column; /* Ikon di atas, teks terjepit di bawah */
  font-size: .67rem;      /* Sangat kecil */
}
.rail-btn .k {
  position: absolute; top: .18rem; right: .28rem; font-size: .55rem;
  /* Bertabrakan dengan label teks panjang */
}
```

### 3.2 Solusi Desain Baru: Sidebar Cockpit Terstruktur
Sidebar akan diubah menjadi panel navigasi yang lega, elegan, dan terstruktur rapi dengan dua mode:
1. **Expanded Mode (Default, Lebar `14rem` / ~224px)**:
   - **Header Brand**: Ikon mahkota/pedang RPG bercahaya + Teks "Petualangan Pelajar" + Badge Versi "v7.2".
   - **Tombol Navigasi Horizontal**:
     - Ikon besar (`1.35rem`) di sisi kiri.
     - Label menu tebal (`0.88rem`) rata kiri yang jelas dan nyaman dibaca.
     - Badge notifikasi (misal: jumlah undangan duel kawan) berwarna merah menyala.
     - Kbd shortcut badge (`1`, `2`, dll.) berada di sudut kanan dengan gaya tombol keyboard mekanikal halus.
   - **Pengelompokan Menu (Section Headers)**:
     - *Petualangan*: Beranda (1), Peta Cerita (2), Latihan (3), Arena Duel (4).
     - *Karakter & Koleksi*: Profil (5), Lemari Kostum/Skin (6), Skill RPG (7), Monster Dex (8).
     - *Fasilitas & Sosial*: Pertemanan (9), Toko & Gacha (0), Laporan (-), Pengaturan (=).
   - **Footer Sidebar Terpadu**:
     - Kartu mini profil pemain (Avatar lingkaran, nama pendek, level badge).
     - Tombol cepat: `🛡️ Guru/Admin` dan `🚪 Keluar`.
     - Tombol toggle collapse (`«` / `»`) untuk beralih ke mode ringkas bila diinginkan pemain.
2. **Collapsed Mode (Mini-Rail, Lebar `4.8rem` / ~76px)**:
   - Disediakan via tombol toggle atau otomatis pada resolusi layar yang sempit (< 1200px lebar).
   - Menampilkan ikon horizontal terpusat dengan *floating tooltip* bergradien saat kursor melakukan hover.

### 3.3 Struktur HTML & CSS Baru Sidebar
```html
<nav class="d-sidebar" id="d-sidebar" aria-label="Navigasi Utama">
  <!-- BRAND HEADER -->
  <div class="sidebar-brand">
    <div class="brand-icon">⚔️</div>
    <div class="brand-text">
      <span class="brand-title">PETUALANGAN</span>
      <span class="brand-sub">PELAJAR RPG · v7.2</span>
    </div>
  </div>

  <!-- MENU LIST DENGAN GROUPING -->
  <div class="sidebar-nav-scroll">
    <div class="sidebar-group-title">MAIN ARENA</div>
    <button class="nav-item active" data-go="home" title="Beranda (1)">
      <span class="nav-icon">🏠</span>
      <span class="nav-label">Beranda</span>
      <span class="nav-kbd">1</span>
    </button>
    <button class="nav-item" data-go="peta" title="Petualangan Cerita (2)">
      <span class="nav-icon">🗺️</span>
      <span class="nav-label">Petualangan</span>
      <span class="nav-kbd">2</span>
    </button>
    <button class="nav-item" data-go="latihan" title="Latihan Soal (3)">
      <span class="nav-icon">📚</span>
      <span class="nav-label">Latihan Bebas</span>
      <span class="nav-kbd">3</span>
    </button>
    <button class="nav-item" data-go="duel" title="Arena Duel (4)">
      <span class="nav-icon">⚔️</span>
      <span class="nav-label">Arena Duel</span>
      <span class="nav-kbd">4</span>
    </button>

    <div class="sidebar-group-title">HERO & KOLEKSI</div>
    <button class="nav-item" data-go="profil" title="Profil Petualang (5)">
      <span class="nav-icon">👤</span>
      <span class="nav-label">Profil Hero</span>
      <span class="nav-kbd">5</span>
    </button>
    <button class="nav-item" data-go="wardrobe" title="Lemari Kostum (6)">
      <span class="nav-icon">🎒</span>
      <span class="nav-label">Lemari Kostum</span>
      <span class="nav-kbd">6</span>
    </button>
    <button class="nav-item" data-go="skill" title="Skill RPG (7)">
      <span class="nav-icon">⚡</span>
      <span class="nav-label">Skill Dek Laga</span>
      <span class="nav-kbd">7</span>
    </button>
    <button class="nav-item" data-go="dex" title="Monster Dex (8)">
      <span class="nav-icon">📖</span>
      <span class="nav-label">Monster Dex</span>
      <span class="nav-badge" id="dex-sidebar-badge">100</span>
      <span class="nav-kbd">8</span>
    </button>

    <div class="sidebar-group-title">SOSIAL & FASILITAS</div>
    <button class="nav-item" data-go="friends" title="Pertemanan (9)">
      <span class="nav-icon">👥</span>
      <span class="nav-label">Pertemanan</span>
      <span class="nav-pill alert" id="sidebar-friends-invite" style="display:none">0</span>
      <span class="nav-kbd">9</span>
    </button>
    <button class="nav-item" data-go="shop" title="Toko & Gacha (0)">
      <span class="nav-icon">🛒</span>
      <span class="nav-label">Toko & Gacha</span>
      <span class="nav-kbd">0</span>
    </button>
    <button class="nav-item" data-go="report" title="Laporan Mingguan (-)">
      <span class="nav-icon">📊</span>
      <span class="nav-label">Rapor Belajar</span>
      <span class="nav-kbd">-</span>
    </button>
    <button class="nav-item" data-go="settings" title="Pengaturan (=)">
      <span class="nav-icon">⚙️</span>
      <span class="nav-label">Pengaturan</span>
      <span class="nav-kbd">=</span>
    </button>
  </div>

  <!-- FOOTER MINI PROFILE & ACTIONS -->
  <div class="sidebar-footer">
    <div class="mini-profile" data-go="profil">
      <div class="mini-avatar" id="sidebar-mini-avatar"></div>
      <div class="mini-meta">
        <div class="mini-name" id="sidebar-mini-name">Petualang</div>
        <div class="mini-sub" id="sidebar-mini-sub">Lv 1 · Ksatria</div>
      </div>
    </div>
    <div class="footer-actions">
      <button class="footer-btn" data-act="admin" title="Menu Guru / Admin">🛡️ Guru</button>
      <button class="footer-btn danger" data-act="logout" title="Keluar Akun">🚪 Keluar</button>
    </div>
  </div>
</nav>
```

---

## 4. Presisi Cockpit Beranda (Layout 3-Kolom Seimbang & Bersih)

### 4.1 Identifikasi Masalah Beranda Saat Ini
1. **Redundansi Ubin 10 Menu**: Di tengah panggung (`.stage`), saat ini dipasang 10 tombol kotak yang merupakan duplikasi 100% dari sidebar navigasi. Akibatnya, panggung tengah terasa sempit, terdesak, dan elemen esensial seperti maskot SVG serta banner bab terdorong ke bawah.
2. **Ketiadaan Gelar Aktif & Pasif Lengkap**: Kartu profil kiri belum mencerminkan 3 gelar aktif (*titles*) yang dipilih pemain di menu profil.
3. **Data Bab Statis**: Progres petualangan di beranda saat ini masih berupa data statis dummy, belum mencerminkan bab dan wilayah aktif dari `/api/campaign`.

### 4.2 Desain Baru Beranda Cockpit Presisi
Beranda didesain ulang menjadi **Pusat Komando Tempur Petualang (Hero Command Center)** dengan 3 kolom harmonis:

```
┌──────────────────────────┬──────────────────────────────────────────┬──────────────────────────┐
│ KOLOM KIRI (22rem)       │ KOLOM TENGAH (PANGGUNG UTAMA - Flex 1)   │ KOLOM KANAN (22rem)      │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────┤
│ 1. KARTU HERO TERPADU    │ 1. DIALOG INTERAKTIF MASKOT              │ 1. INTELIJEN BELAJAR     │
│    - Avatar RPG 3D/SVG   │    - "Halo Budi, siap taklukkan bos?"    │    - Ring Akurasi 7 Hari │
│    - Nama, Level, Bar XP │ 2. PANGGUNG MASKOT DINAMIS (SVG 240px)   │    - Bar Aktivitas       │
│    - Bar HP & Energi     │    - Animasi nafas halus (floating)      │    - Titik Lemah Materi  │
│    - 3 Gelar Kehormatan  │ 3. BANNER BAB AKTIF DINAMIS              │ 2. STATUS MONSTER DEX    │
│ 2. DEK SKILL LAGA (Q/W/E)│    - "Bab 2: Rawa Beracun (Stage 4/10)"  │    - Ring % Dikalahkan   │
│    - 3 Slot Skill Aktif  │    - Syarat Lolos & Hadiah Bintang       │    - Bos Terbaru         │
│    - Ikon SVG Spektakuler│ 4. TOMBOL AKSI UTAMA (HERO ACTIONS)      │ 3. KAWAN BELAJAR ONILNE  │
│ 3. SHOWCASE LENCANA (3x) │    - [⚔️ LANJUTKAN PETUALANGAN (Enter)]   │    - Status Online/Laga  │
│    - Artwork BadgeArt    │    - [📚 LATIHAN KUIS BEBAS]             │    - Tombol Duel 1-Klik  │
└──────────────────────────┴──────────────────────────────────────────┴──────────────────────────┘
```

### 4.3 Poin Presisi Eksekusi Beranda
- **Penghapusan Total Ubin Duplikat**: Menghapus blok `.home-menu-tiles-desktop` dari panggung tengah. Panggung tengah murni dialokasikan untuk maskot interaktif dan kartu aksi petualangan yang lega.
- **Interaksi Sentuh Maskot**: Mengklik maskot monster akan memunculkan gelembung dialog acak (*voice lines* bos atau maskot) lengkap dengan SFX khas elemennya.
- **Sinkronisasi Data Real-Time**: Ketika pemain memperoleh XP, koin, atau menyelesaikan bab, indikator pada kartu profil kiri dan banner tengah langsung terbarui tanpa perlu refresh halaman.

---

## 5. Rekonstruksi Total Monster Dex Desktop (Fitur 100% Identik Mobile)

### 5.1 Identifikasi Masalah Monster Dex Desktop Saat Ini
Pada berkas `public/js/desktop/screens.js`:
- Mengambil data dari `API.getProfile().monsters` yang tidak memiliki metadata lengkap 100 bos.
- Menggunakan fallback mock hardcoded: `const isDefeated = Boolean(defeatedEntry?.defeated || defeatedEntry?.wins > 0 || id <= 3);` (selalu membuka 3 bos pertama walaupun belum dikalahkan).
- Kisi 10×10 hanya berupa kotak kerdil abu-abu tanpa filter status, tanpa filter elemen, dan tanpa pencarian.
- Panel inspeksi kanan **sama sekali tidak memuat jurus bos** dari `BossSkills.skillsFor()`, tidak ada preview variasi *Mode Brutal*, dan tidak ada siluet bergradien untuk bos yang belum ditemukan.

### 5.2 Arsitektur Baru: 3-Pane Monster Dex Cockpit
Monster Dex di Desktop akan memanfaatkan bentang layar lebar untuk menyajikan pengalaman ensiklopedia monster interaktif tanpa perlu modal pop-up:

```
┌──────────────────────────┬──────────────────────────────────────────┬──────────────────────────┐
│ PANE KIRI (FILTER & META)│ PANE TENGAH (GRID KARTU 100 BOS)         │ PANE KANAN (INSPEKTOR)   │
├──────────────────────────┼──────────────────────────────────────────┼──────────────────────────┤
│ 1. RINGKASAN KOLEKSI     │ 1. KONTROL PENCARIAN & TIER              │ 1. ARTWORK BOS BESAR     │
│    - Ring % Lengkap      │    - [🔍 Cari Nama / #ID Bos...]         │    - SVG 220px Beranimasi│
│    - Ditemui: X / 100    │    - Dropdown Tier (Semua/Common/...)    │    - Border Glow Elemen  │
│    - Kalah: Y / 100      │ 2. GRID KARTU MONSTER RESPONSIF          │ 2. METADATA DETAIL       │
│    - Total Bintang ⭐    │    - Tampilan Kartu Elemen Rapi          │    - Elemen, Wilayah     │
│ 2. FILTER KEPEMILIKAN    │    - Artwork Asli / Siluet Gelap         │    - Rekor Pertemuan     │
│    - Semua (100)         │    - Badge Tier & Elemen                 │    - Bintang Tertinggi ⭐│
│    - ⚔️ Dikalahkan       │    - Status Bintang                      │ 3. JURUS RESMI BOS       │
│    - ✓ Ditemui           │    - Seleksi Aktif (Glow Outline)        │    - 1-4 Skill (Tier)    │
│    - 🔒 Belum            │                                          │    - Deskripsi Taktis    │
│ 3. FILTER 10 ELEMEN      │                                          │    - Varian Mode Brutal  │
│    - 🌿 Hutan (10)       │                                          │ 4. TOMBOL TANTANG BOS    │
│    - ☠️ Rawa (10) ...    │                                          │    - [⚔️ Laga Cepat Bos] │
│ 4. SAKELAR BRUTAL (💀)   │                                          │                          │
└──────────────────────────┴──────────────────────────────────────────┴──────────────────────────┘
```

### 5.3 Spesifikasi Komponen & Integrasi Teknis
1. **Sumber Data Tunggal**:
   Menggunakan endpoint resmi `API.req('/api/dex')`. Data `monsters` dipadukan dengan konfigurasi `Monsters.MONSTERS` dan generator jurus `BossSkills.dexEntries()`.
2. **Aturan Siluet & Kerahasiaan**:
   - Jika bos berstatus `belum ditemui` (encounters == 0 && defeats == 0), nama bos ditampilkan sebagai `??? #ID`, dan artwork ditampilkan menggunakan filter siluet hitam pekat berbayang halus (`filter: brightness(0) drop-shadow(0 0 4px rgba(255,255,255,0.2)); opacity: 0.45`).
   - Jurus bos pada status terkunci dirahasiakan dengan label `🔒 Belum Terungkap`.
3. **Penyajian Jurus Bos Berdasarkan Tier (`BossSkills.skillsFor`)**:
   - **Common (40 Bos)**: 1 Jurus Utama.
   - **Rare (30 Bos)**: 2 Jurus (Utama + Sekunder).
   - **Epic (20 Bos)**: 3 Jurus (Utama + Sekunder + Ultimate).
   - **Legend (10 Bos)**: 4 Jurus Lengkap (Utama + Sekunder + Pasif Elemen + Ultimate Penghancur).
   Setiap jurus menampilkan icon unik, nama jurus, badge tingkat kesulitan, deskripsi normal, serta deskripsi **Efek Mode Brutal** bertinta merah neon jika toggle brutal aktif.

---

## 6. Penyelarasan Fitur Utama Lainnya (Latihan, Duel, Peta Cerita, Laporan)

### 6.1 Peta Petualangan Mode Cerita (`peta`)
- **Penyelarasan Jalur Bab**: Menampilkan 10 Bab Kurikulum sesuai tingkatan kelas (Bab 1: Hutan Pengetahuan hingga Bab 10: Puncak Kosmis).
- **Simpul Peta Interaktif**: 10 stage per bab disajikan dalam simpul horizontal beranimasi dengan status bintang (`⭐⭐⭐`), penanda bos wilayah (`👑`), dan peti gacha mingguan (`🎁`).
- **Sidebar Kanan Peta**: Menampilkan preview SVG bos stage terpilih, syarat lulus (akurasi ≥ 70%), rekomendasi elemen lawan, dan tombol pintas `Enter` untuk memulai pertempuran.

### 6.2 Arena Latihan Bebas Multi-Tipe Soal (`latihan`)
- **Dukungan 5 Tipe Soal Lengkap**:
  1. *Pilihan Ganda (MCQ)*: Opsi A, B, C, D dengan pintasan keyboard `1/2/3/4` atau `A/B/C/D`.
  2. *Benar / Salah (True/False)*: Tombol Benar (T) dan Salah (F).
  3. *Mengurutkan (Ordering)*: Antarmuka drag-and-drop atau klik urutan angka yang mulus dengan mouse.
  4. *Menjodohkan (Matching)*: Menghubungkan pasangan konsep dengan klik dua kolom.
  5. *Isian Singkat (Short Answer)*: Input teks dengan validasi toleransi pengetikan dan konfirmasi `Enter`.
- **Pengaturan Sesi Latihan**: Pemain dapat memilih jumlah soal (5 soal cepat, 10 soal standar, 20 soal maraton) dan filter topik spesifik materi kurikulum.

### 6.3 Arena Duel Kawan Real-Time (`duel` & `friends`)
- **Lobi Tantangan**: Menampilkan kode room 6 digit untuk dibagikan kepada teman sekelas.
- **Daftar Kawan Terintegrasi**: Menampilkan kawan yang sedang online dengan indikator dot hijau menyala dan tombol "Tantang Duel" 1-klik.
- **Tampilan Laga Duel 2-Pemain**: Pemain di sisi kiri, lawan di sisi kanan, indikator HP bar kedua pemain, timer ronde sinkron, dan akumulasi poin bintang per ronde.

### 6.4 Rapor Belajar & Analisis Akademik (`report`)
- **Diagram Radar Kompetensi**: Menggambarkan grafik poligon SVG 5 dimensi penguasaan materi (Logika/Matematika, Literasi/Bahasa, Sains/IPA, Sosial, dan Trik Berpikir Cepat).
- **Riwayat Pengerjaan & Analisis Titik Lemah**: Daftar materi yang paling sering salah dijawab beserta tombol "Latih Materi Ini" langsung.
- **Portal Cetak & Bagikan Rapor**: Tombol langsung untuk mencetak rapor berformat PDF resmi atau menyalin tautan publik `/r/{token}` untuk ditunjukkan kepada guru dan orang tua.

---

## 7. Spesifikasi Teknis CSS, Grid Layout & State Management

### 7.1 Pembaruan CSS Custom Variables (`public/css/desktop.css`)
```css
:root {
  /* DIMENSI DESKTOP COCKPIT BARU */
  --sidebar-w: 14rem;       /* 224px - Lebar Ergonomis Baru */
  --sidebar-mini-w: 4.8rem; /* 76px - Lebar Mini-Rail */
  --topbar-h: 3.8rem;       /* 60px - Top Status Bar */
  --side-pane-w: 22rem;     /* 352px - Panel Samping Beranda & Dex */

  /* TIPOGRAFI & RADIUS */
  --rad-sm: 0.5rem;
  --rad-md: 0.85rem;
  --rad-lg: 1.2rem;
  --rad-full: 9999px;

  /* PALET TEMA COCKPIT */
  --c-bg-cockpit: #070a16;
  --c-surface-pane: rgba(15, 23, 42, 0.75);
  --c-surface-pane-hover: rgba(30, 41, 59, 0.85);
  --c-border-pane: rgba(255, 255, 255, 0.08);
  --c-border-pane-active: rgba(56, 189, 248, 0.4);
}
```

### 7.2 Tata Letak Grid Utama (Main Layout Grid)
```css
/* Layout Shell Utama 2-Dimensi */
#app.d-play {
  display: grid;
  grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
  grid-template-rows: var(--topbar-h) minmax(0, 1fr);
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  background: var(--c-bg-cockpit);
}

/* Modus Fokus (Battle, Duel, Auth) */
#app.d-play.focus {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}
#app.d-play.focus .d-sidebar,
#app.d-play.focus .d-topbar {
  display: none !important;
}

/* 3-Kolom Layar Cockpit (Beranda & Dex) */
.d-screen.g3-cockpit {
  display: grid;
  grid-template-columns: var(--side-pane-w) minmax(0, 1fr) var(--side-pane-w);
  grid-template-rows: minmax(0, 1fr);
  gap: 1rem;
  height: 100%;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
}
```

### 7.3 State Management & Navigasi Terpadu
- Menggunakan `DesktopShell.state` sebagai store tunggal untuk data pemain, progress dex, dan sesi aktif.
- Transisi antar layar dikelola melalui fungsi terpadu `go(screenName, params)` yang menangani pembersihan listener lama (`destroy`), penyesuaian kelas container, dan pemasangan hotkey keyboard spesifik layar.

---

## 8. Rencana Implementasi Bertahap (Roadmap 4 Fase)

```
[FASE 1: SIDEBAR & BERANDA] ──➔ [FASE 2: MONSTER DEX] ──➔ [FASE 3: LATIHAN & CERITA] ──➔ [FASE 4: VERIFIKASI & POLISHING]
  - Lebar 14rem Ergonomis        - 3-Pane Cockpit Dex       - 5 Tipe Soal Latihan         - Uji Resolusi (720p - 4K)
  - Layout Horizontal Nav        - 10 Elemen & 4 Status     - Simpul Peta & Hadiah        - Uji Hotkey & Aksesibilitas
  - Presisi 3-Kolom Beranda      - Jurus Bos (BossSkills)   - Lobi Duel Real-Time         - Regresi Unit Tests
  - Hapus 10 Ubin Duplikat       - Sakelar Mode Brutal      - Grafik Radar Laporan        - Deploy & Verifikasi Live
```

### Rincian Fase Eksekusi:
1. **Fase 1: Perombakan Sidebar Navigasi & Presisi Cockpit Beranda**
   - Mengubah struktur HTML & CSS `.d-rail` menjadi `.d-sidebar` dengan lebar `14rem`, tipografi horizontal, pemisah kategori menu, dan mini profil footer.
   - Membersihkan panggung tengah Beranda dari 10 ubin duplikat, menstabilkan dimensi maskot SVG, dan menghubungkan banner petualangan ke status riil `/api/campaign`.
   - Mengintegrasikan 3 slot gelar dan status energi pada kartu hero kiri.

2. **Fase 2: Rekonstruksi Total Monster Dex Desktop**
   - Mengimplementasikan 3-pane layout pada `DesktopScreens.dex`: Panel Filter Kiri, Grid Bos Tengah, Inspektor Jurus Kanan.
   - Menghubungkan endpoint `/api/dex` secara utuh.
   - Memasang modul filter kepemilikan (Semua/Dikalahkan/Ditemui/Belum), 10 elemen wilayah, tier dropdown, dan pencarian instan.
   - Memasang generator jurus resmi bos `BossSkills.skillsFor()` lengkap dengan variasi *Mode Brutal*.

3. **Fase 3: Penyelarasan Modul Latihan, Peta Cerita, Duel, dan Laporan**
   - Mengintegrasikan mesin 5 tipe soal pada layar `DesktopScreens.latihan`.
   - Memperbarui interaksi simpul peta bab dan preview bos SVG bab 1, 2, dan 3.
   - Menghubungkan lobi duel kawan dan tombol tantang langsung.
   - Menambahkan diagram radar SVG penguasaan topik dan tombol cetak pada layar laporan.

4. **Fase 4: Verifikasi Kualitas, Uji Lintas Layar & Polishing**
   - Menjalankan uji kestabilan tampilan pada resolusi 1280×720, 1366×768, 1920×1080, dan 2560×1080 untuk menjamin *Zero Page Scroll*.
   - Menjalankan seluruh test suite otomatis di `tests/desktop-mode.test.js`.
   - Memastikan tidak ada memori bocor (*memory leak*) pada pergantian layar cepat.

---

## 9. Matriks Verifikasi & Kriteria Keberhasilan (Acceptance Criteria)

| ID Uji | Komponen | Kriteria Keberhasilan (Pass / Fail) | Metode Verifikasi |
|---|---|---|---|
| **TC-01** | **Sidebar Navigasi** | Sidebar memiliki lebar minimal 14rem, teks menu tidak terpotong, hotkey kbd rapi di sisi kanan, badge kawan tampil dinamis, profil mini footer berfungsi. | Inspeksi visual DOM & klik navigasi 12 menu. |
| **TC-02** | **Beranda Cockpit** | Panggung tengah bersih dari 10 ubin duplikat, maskot interaktif merespon klik dengan SFX/dialog, banner bab menampilkan stage riil, kartu hero memuat 3 gelar. | Cek responsivitas layout 1920x1080 & verifikasi data API. |
| **TC-03** | **Monster Dex Filter** | Filter 4 status kepemilikan dan 10 tema elemen memfilter grid bos secara instan tanpa refresh; search input memfilter nama/#ID dengan debounce. | Uji ketik pencarian "#042" dan klik tombol filter "🔥 Api". |
| **TC-04** | **Monster Dex Jurus** | Panel kanan menampilkan daftar jurus bos sesuai tier (1-4 skill) dari `BossSkills`; mengaktifkan toggle brutal mengubah teks deskripsi jurus menjadi merah mode brutal. | Klik bos Legend #010, aktifkan toggle brutal, verifikasi 4 skill. |
| **TC-05** | **Zero Page Scroll** | Jendela browser tidak memunculkan scrollbar vertikal/horizontal luar pada resolusi 1280×720, 1366×768, 1440×900, dan 1920×1080. | Evaluasi `document.scrollingElement.scrollHeight === window.innerHeight`. |
| **TC-06** | **Hotkey Keyboard** | Seluruh navigasi angka (`1-0`), enter, escape, dan bantuan `?` merespon seketika tanpa konflik input form. | Simulasi penekanan tombol keyboard. |
| **TC-07** | **Automated Tests** | Seluruh skrip pengujian di folder `tests/` lulus 100% tanpa error database lock. | Eksekusi `node --test tests/desktop-mode.test.js`. |

---

## 📌 Kesimpulan & Rekomendasi
Proposal ini memberikan cetak biru (*blueprint*) komprehensif untuk menuntaskan seluruh ketidaksesuaian mode desktop dengan standar kualitas tertinggi. Dengan merealisasikan proposal ini:
1. Navigasi desktop menjadi sangat nyaman, gagah, dan mudah diakses.
2. Beranda bertransformasi menjadi ruang kendali presisi yang bersih dan bebas clutter.
3. Fitur Monster Dex mencapai paritas 100% dengan mobile bahkan lebih unggul berkat kemudahan navigasi 3-pane.
4. Seluruh fitur RPG edukasi dapat dinikmati secara sempurna di semua perangkat PC/Laptop sekolah maupun rumah.

Dokumen ini siap dieksekusi ke dalam tahap pengkodean segera setelah mendapatkan persetujuan.
