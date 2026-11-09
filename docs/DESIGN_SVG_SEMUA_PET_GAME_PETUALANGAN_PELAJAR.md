# 🐾 DESAIN & KODE LENGKAP SVG SEMUA PET (HEWAN PELIHARAAN AVATAR)
**Game**: *Petualangan Pelajar* ([https://play.printshare.my.id/](https://play.printshare.my.id/))  
**Target File**: `DESIGN_SVG_SEMUA_PET_GAME_PETUALANGAN_PELAJAR.md`  
**Kategori**: Desain Grafis Vektor SVG, Kosmetik Avatar, Partikel Visual, & Efek Pasif RPG  
**Total Pet Eksisting**: **7 Pet** (2 Common, 2 Rare, 1 Epic, 2 Legendary)  
**Versi Mesin Visual**: Avatar Engine v7.2 (W3C Scalable Vector Graphics 1.1)

---

## 📖 DAFTAR ISI
1. [Arsitektur Visual & Sistem Lapisan SVG Pet](#1-arsitektur-visual--sistem-lapisan-svg-pet)
2. [Tabel Komparasi & Katalog Seluruh Pet Eksisting](#2-tabel-komparasi--katalog-seluruh-pet-eksisting)
3. [Desain SVG Lengkap Pet 1: Kucing Oren (pet_cat)](#3-desain-svg-lengkap-pet-1-kucing-oren-pet_cat)
4. [Desain SVG Lengkap Pet 2: Anjing Ceria (pet_dog)](#4-desain-svg-lengkap-pet-2-anjing-ceria-pet_dog)
5. [Desain SVG Lengkap Pet 3: Pinguin Lucu (pet_penguin)](#5-desain-svg-lengkap-pet-3-pinguin-lucu-pet_penguin)
6. [Desain SVG Lengkap Pet 4: Rubah Cerdik (pet_fox)](#6-desain-svg-lengkap-pet-4-rubah-cerdik-pet_fox)
7. [Desain SVG Lengkap Pet 5: Burung Hantu Bijak (pet_owl)](#7-desain-svg-lengkap-pet-5-burung-hantu-bijak-pet_owl)
8. [Desain SVG Lengkap Pet 6: Anak Naga Langit (pet_dragon)](#8-desain-svg-lengkap-pet-6-anak-naga-langit-pet_dragon)
9. [Desain SVG Lengkap Pet 7: Bayi Burung Phoenix (pet_phoenix)](#9-desain-svg-lengkap-pet-7-bayi-burung-phoenix-pet_phoenix)
10. [Grand Showcase: Panggung Parade 7 Pet dalam 1 Kanvas SVG](#10-grand-showcase-panggung-parade-7-pet-dalam-1-kanvas-svg)
11. [Panduan Integrasi Mesin Visual & Kode CSS Animasi](#11-panduan-integrasi-mesin-visual--kode-css-animasi)

---

## 1. Arsitektur Visual & Sistem Lapisan SVG Pet

Di dalam sistem avatar *Petualangan Pelajar* (`shared/avatar.js`), pet menempati koordinat panggung kiri bawah karakter:
- **Pusat Titik Koordinat (Center Pivot)**: `cx="32" cy="160"`
- **Area Tampilan Sprite**: `x="8" y="136" width="48" height="48"`
- **Taraf Sudut Pandang (ViewBox Avatar)**: `0 0 200 200`

Setiap pet dirender dalam sistem **Lapisan Bertingkat (Layered Composition)**:

```
┌────────────────────────────────────────────────────────┐
│                   LAPISAN VISUAL PET                   │
├────────────────────────────────────────────────────────┤
│ Layer 4: [Twinkle Stars / Rising Embers / Smoke FX]    │ ◄── Partikel Mengambang (Epic / Legend)
│ Layer 3: [Sprite Utama Vektor Twemoji 48x48]           │ ◄── Gambar Hewan Peliharaan
│ Layer 2: [Pulsing Glow Aura (Rad: 28px - 34px)]        │ ◄── Aura Berdenyut Sesuai Rarity Tier
│ Layer 1: [Bayangan Tanah Mengambang (Ground Shadow)]    │ ◄── Ellipse Gelap di Titik cy=182
└────────────────────────────────────────────────────────┘
```

---

## 2. Tabel Komparasi & Katalog Seluruh Pet Eksisting

| No | ID Item | Nama Pet | Rarity | Ikon | Kode Twemoji | Fokus Efek Pasif RPG | Sumber Perolehan |
|:---:|:---|:---|:---:|:---:|:---:|:---|:---|
| 1 | `pet_cat` | **Kucing Oren** | `COMMON` | 🐱 | `1f431` | Koin Drop +3% Tiap Laga | Toko Koin / Drop Box Wilayah 1 |
| 2 | `pet_dog` | **Anjing Ceria** | `COMMON` | 🐶 | `1f436` | Pemulihan +2 HP Saat Menang | Toko Koin / Drop Box Wilayah 1 |
| 3 | `pet_penguin` | **Pinguin Lucu** | `RARE` | 🐧 | `1f427` | Freeze Time Timer +1.5 Detik | Toko Spesial / Wilayah 2-3 |
| 4 | `pet_fox` | **Rubah Cerdik** | `RARE` | 🦊 | `1f98a` | 15% Peluang +1 ⚡ Tiap 3 Combo | Toko Spesial / Wilayah 2 |
| 5 | `pet_owl` | **Burung Hantu Bijak** | `EPIC` | 🦉 | `1f989` | Proteksi Combo 50% Saat Salah 1x | Peti Rahasia Bos Wilayah 3 |
| 6 | `pet_dragon` | **Anak Naga Langit** | `LEGEND` | 🐲 | `1f432` | Semburan Api Naga (10% 20 True Dmg) | 🏆 Lencana Penjelajah Kampanye |
| 7 | `pet_phoenix` | **Bayi Burung Phoenix** | `LEGEND` | 🦅🔥 | `1f985` | Reduksi Dmg 20% & +1 ⚡ saat HP < 25% | 🏆 Lencana Hati Phoenix |

---

## 3. Desain SVG Lengkap Pet 1: Kucing Oren (`pet_cat`)

```
  🐱  ==============================================
  🐾  Kucing Oren (Lucky Ginger Cat)
  ⭐  Tier: COMMON | Twemoji Hex: 1f431
  📜  "Kucing oranye pembawa hoki legendaris yang gemar mengais koin ekstra di setiap sudut arena."
  ====================================================
```

### A. Lembar Identitas & Spesifikasi Item
- **Item ID**: `pet_cat`
- **Slot Avatar**: `pet` (Sisi Kiri Bawah Karakter)
- **Tingkat Kelangkaan (Tier)**: **COMMON**
- **Ikon Emoji**: 🐱
- **Twemoji Code**: `1f431`
- **Efek Pasif RPG**: **Cakar Keberuntungan (Lucky Paws)** — *Bonus Koin Drop +3% di setiap akhir pertempuran atau kuis.*
- **Metode Perolehan**: Beli di Toko Koin Pemula (180 Koin) atau Peti Harta Karun Wilayah 1.

---

### B. Kode SVG Standalone Mandiri (Kartu Seni Vektor 160x200)
Kode SVG berikut adalah dokumen mandiri (*pure standalone XML SVG*). Anda dapat menyalin kode ini langsung ke berkas berekstensi `.svg` dan membukanya pada browser web, Figma, Illustrator, maupun Inkscape tanpa memerlukan koneksi internet:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200" role="img" aria-label="Kucing Oren">
  <defs>
    <!-- Gradien Latar Belakang Kartu -->
    <linearGradient id="bg-pet_cat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="100%" stop-color="#fef3c7"/>
    </linearGradient>
    <!-- Gradien Aura Peliharaan -->
    <radialGradient id="aura-pet_cat" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#fbbf24" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </radialGradient>
    <!-- Bayangan Tanah -->
    <radialGradient id="shadow-pet_cat" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <style>
    .fx-float { animation: floatSlow 3s ease-in-out infinite alternate; }
    .fx-pulse { animation: pulseAura 2s ease-in-out infinite alternate; }
    .fx-twinkle { animation: twinkleStar 1.4s ease-in-out infinite alternate; }
    @keyframes floatSlow { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
    @keyframes pulseAura { 0% { transform: scale(0.92); opacity: 0.6; } 100% { transform: scale(1.08); opacity: 1; } }
    @keyframes twinkleStar { 0% { opacity: 0.3; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1.2); } }
  </style>

  <!-- Bingkai Kartu -->
  <rect width="160" height="200" rx="18" fill="url(#bg-pet_cat)" stroke="#f59e0b" stroke-width="3"/>

  <!-- Badge Kelangkaan -->
  <rect x="12" y="12" width="68" height="20" rx="10" fill="#f59e0b"/>
  <text x="46" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">COMMON</text>

  <!-- Bayangan Tanah -->
  <ellipse cx="80" cy="145" rx="36" ry="9" fill="url(#shadow-pet_cat)"/>

  <!-- Aura Berdenyut -->
  <g transform="translate(80 100)">
    <circle class="fx-pulse" cx="0" cy="0" r="42" fill="url(#aura-pet_cat)" transform-origin="0 0"/>
  </g>

  <!-- Sprite Vektor Pet (Twemoji Centered) -->
  <g class="fx-float" transform="translate(80 95)">
    <g transform="translate(-36 -36) scale(2.0)">
      <path fill="#FFCC4D" d="M32.348 13.999s3.445-8.812 1.651-11.998c-.604-1.073-8 1.998-10.723 5.442 0 0-2.586-.86-5.276-.86s-5.276.86-5.276.86C10.001 3.999 2.605.928 2.001 2.001.207 5.187 3.652 13.999 3.652 13.999c-.897 1.722-1.233 4.345-1.555 7.16-.354 3.086.35 5.546.658 6.089.35.617 2.123 2.605 4.484 4.306 3.587 2.583 8.967 3.445 10.761 3.445s7.174-.861 10.761-3.445c2.361-1.701 4.134-3.689 4.484-4.306.308-.543 1.012-3.003.659-6.089-.324-2.814-.659-5.438-1.556-7.16z"/><path fill="#F18F26" d="M2.359 2.971c.2-.599 5.348 2.173 6.518 5.404 0 0-3.808 2.624-4.528 4.624 0 0-2.99-7.028-1.99-10.028z"/><path fill="#FFCC4D" d="M5.98 7.261c0-1.414 5.457 2.733 4.457 3.733s-1.255.72-2.255 1.72S5.98 8.261 5.98 7.261z"/><path fill="#F18F26" d="M33.641 2.971c-.2-.599-5.348 2.173-6.518 5.404 0 0 3.808 2.624 4.528 4.624 0 0 2.99-7.028 1.99-10.028z"/><path fill="#FFCC4D" d="M30.02 7.261c0-1.414-5.457 2.733-4.457 3.733s1.255.72 2.255 1.72 2.202-4.453 2.202-5.453z"/><path fill="#292F33" d="M14.001 20.001a2 2 0 1 1-3.998 0A2 2 0 0 1 14 20zm11.998 0a2 2 0 1 1-3.998 0 2 2 0 0 1 3.998 0z"/><path fill="#FEE7B8" d="M2.201 30.458a.5.5 0 0 1-.31-.892c.162-.127 4.02-3.12 10.648-2.605a.5.5 0 0 1 .46.536c-.021.275-.257.501-.537.46-6.233-.474-9.915 2.366-9.951 2.395a.516.516 0 0 1-.31.106zm8.868-4.663a.512.512 0 0 1-.149-.022c-4.79-1.497-8.737-.347-8.777-.336a.499.499 0 1 1-.288-.957c.173-.052 4.286-1.247 9.362.338a.5.5 0 0 1-.148.977zm22.73 4.663a.5.5 0 0 0 .31-.892c-.162-.127-4.02-3.12-10.648-2.605a.5.5 0 0 0-.46.536c.022.275.257.501.537.46 6.233-.474 9.915 2.366 9.951 2.395.093.07.202.106.31.106zm-8.868-4.663c.049 0 .1-.007.149-.022 4.79-1.497 8.737-.347 8.777-.336a.499.499 0 1 0 .288-.957c-.173-.052-4.286-1.247-9.362.338a.5.5 0 0 0 .148.977z"/><path fill="#67757F" d="M24.736 30.898a.5.5 0 0 0-.643-.294c-.552.206-1.076.311-1.559.311-1.152 0-1.561-.306-2.033-.659-.451-.338-.956-.715-1.99-.803v-2.339a.5.5 0 0 0-1 0v2.373c-.81.115-1.346.439-1.816.743-.568.367-1.059.685-2.083.685-.482 0-1.006-.104-1.558-.311a.501.501 0 0 0-.35.938c.664.247 1.306.373 1.907.373 1.319 0 2.014-.449 2.627-.845.524-.339.98-.631 1.848-.635.992.008 1.358.278 1.815.621.538.403 1.147.859 2.633.859.601 0 1.244-.126 1.908-.373a.5.5 0 0 0 .294-.644z"/><path fill="#E75A70" d="M19.4 24.807h-2.8c-.64 0-1.163.523-1.163 1.163 0 .639.523 1.163 1.163 1.163h.237v.345c0 .639.523 1.163 1.163 1.163s1.163-.523 1.163-1.163v-.345h.237c.639 0 1.163-.523 1.163-1.163s-.524-1.163-1.163-1.163z"/><path fill="#F18F26" d="M18.022 17.154a.5.5 0 0 1-.5-.5V8.37a.5.5 0 0 1 1 0v8.284c0 .277-.223.5-.5.5zM21 15.572a.5.5 0 0 1-.5-.5c0-2.882 1.232-5.21 1.285-5.308a.5.5 0 0 1 .881.473c-.012.021-1.166 2.213-1.166 4.835a.5.5 0 0 1-.5.5zm-6 0a.5.5 0 0 1-.5-.5c0-2.623-1.155-4.814-1.167-4.835a.501.501 0 0 1 .881-.473c.053.098 1.285 2.426 1.285 5.308a.499.499 0 0 1-.499.5z"/>
    </g>
  </g>

  <!-- Label Nama Pet -->
  <rect x="16" y="160" width="128" height="26" rx="8" fill="#ffffff" stroke="#f59e0b" stroke-width="1.5" opacity="0.95"/>
  <text x="80" y="177" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">🐱 Kucing Oren</text>
</svg>
```

---

### C. Kode Vektor Murni Sprite Pet (Path Twemoji Resmi 36x36)
Berikut adalah kode elemen path murni yang membentuk wujud fisik hewan peliharaan secara detail:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <path fill="#FFCC4D" d="M32.348 13.999s3.445-8.812 1.651-11.998c-.604-1.073-8 1.998-10.723 5.442 0 0-2.586-.86-5.276-.86s-5.276.86-5.276.86C10.001 3.999 2.605.928 2.001 2.001.207 5.187 3.652 13.999 3.652 13.999c-.897 1.722-1.233 4.345-1.555 7.16-.354 3.086.35 5.546.658 6.089.35.617 2.123 2.605 4.484 4.306 3.587 2.583 8.967 3.445 10.761 3.445s7.174-.861 10.761-3.445c2.361-1.701 4.134-3.689 4.484-4.306.308-.543 1.012-3.003.659-6.089-.324-2.814-.659-5.438-1.556-7.16z"/><path fill="#F18F26" d="M2.359 2.971c.2-.599 5.348 2.173 6.518 5.404 0 0-3.808 2.624-4.528 4.624 0 0-2.99-7.028-1.99-10.028z"/><path fill="#FFCC4D" d="M5.98 7.261c0-1.414 5.457 2.733 4.457 3.733s-1.255.72-2.255 1.72S5.98 8.261 5.98 7.261z"/><path fill="#F18F26" d="M33.641 2.971c-.2-.599-5.348 2.173-6.518 5.404 0 0 3.808 2.624 4.528 4.624 0 0 2.99-7.028 1.99-10.028z"/><path fill="#FFCC4D" d="M30.02 7.261c0-1.414-5.457 2.733-4.457 3.733s1.255.72 2.255 1.72 2.202-4.453 2.202-5.453z"/><path fill="#292F33" d="M14.001 20.001a2 2 0 1 1-3.998 0A2 2 0 0 1 14 20zm11.998 0a2 2 0 1 1-3.998 0 2 2 0 0 1 3.998 0z"/><path fill="#FEE7B8" d="M2.201 30.458a.5.5 0 0 1-.31-.892c.162-.127 4.02-3.12 10.648-2.605a.5.5 0 0 1 .46.536c-.021.275-.257.501-.537.46-6.233-.474-9.915 2.366-9.951 2.395a.516.516 0 0 1-.31.106zm8.868-4.663a.512.512 0 0 1-.149-.022c-4.79-1.497-8.737-.347-8.777-.336a.499.499 0 1 1-.288-.957c.173-.052 4.286-1.247 9.362.338a.5.5 0 0 1-.148.977zm22.73 4.663a.5.5 0 0 0 .31-.892c-.162-.127-4.02-3.12-10.648-2.605a.5.5 0 0 0-.46.536c.022.275.257.501.537.46 6.233-.474 9.915 2.366 9.951 2.395.093.07.202.106.31.106zm-8.868-4.663c.049 0 .1-.007.149-.022 4.79-1.497 8.737-.347 8.777-.336a.499.499 0 1 0 .288-.957c-.173-.052-4.286-1.247-9.362.338a.5.5 0 0 0 .148.977z"/><path fill="#67757F" d="M24.736 30.898a.5.5 0 0 0-.643-.294c-.552.206-1.076.311-1.559.311-1.152 0-1.561-.306-2.033-.659-.451-.338-.956-.715-1.99-.803v-2.339a.5.5 0 0 0-1 0v2.373c-.81.115-1.346.439-1.816.743-.568.367-1.059.685-2.083.685-.482 0-1.006-.104-1.558-.311a.501.501 0 0 0-.35.938c.664.247 1.306.373 1.907.373 1.319 0 2.014-.449 2.627-.845.524-.339.98-.631 1.848-.635.992.008 1.358.278 1.815.621.538.403 1.147.859 2.633.859.601 0 1.244-.126 1.908-.373a.5.5 0 0 0 .294-.644z"/><path fill="#E75A70" d="M19.4 24.807h-2.8c-.64 0-1.163.523-1.163 1.163 0 .639.523 1.163 1.163 1.163h.237v.345c0 .639.523 1.163 1.163 1.163s1.163-.523 1.163-1.163v-.345h.237c.639 0 1.163-.523 1.163-1.163s-.524-1.163-1.163-1.163z"/><path fill="#F18F26" d="M18.022 17.154a.5.5 0 0 1-.5-.5V8.37a.5.5 0 0 1 1 0v8.284c0 .277-.223.5-.5.5zM21 15.572a.5.5 0 0 1-.5-.5c0-2.882 1.232-5.21 1.285-5.308a.5.5 0 0 1 .881.473c-.012.021-1.166 2.213-1.166 4.835a.5.5 0 0 1-.5.5zm-6 0a.5.5 0 0 1-.5-.5c0-2.623-1.155-4.814-1.167-4.835a.501.501 0 0 1 .881-.473c.053.098 1.285 2.426 1.285 5.308a.499.499 0 0 1-.499.5z"/>
</svg>
```

---

### D. Implementasi Layer pada Avatar Engine (`shared/avatar.js`)
Cuplikan kode berikut menunjukkan bagaimana pet dirender di dalam kanvas avatar 200x200:

```xml
<!-- Cuplikan Lapisan Pet pada Avatar 200x200 -->
<g class="pet-slot-container" data-pet="pet_cat">
  <!-- 1. Bayangan Mengambang -->
  <ellipse cx="32" cy="182" rx="28" ry="6.5" fill="url(#pp-${uid})"/>
  
  <!-- 2. Aura Sesuai Tier -->
  <!-- Common Aura Dasar -->
  
  <!-- 3. Sprite Vektor Pet -->
  <g transform="translate(8, 136)">
    <image class="fx-float-sm" href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f431.svg" width="48" height="48" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35))"/>
  </g>
</g>
```

---

## 4. Desain SVG Lengkap Pet 2: Anjing Ceria (`pet_dog`)

```
  🐶  ==============================================
  🐾  Anjing Ceria (Playful Pup)
  ⭐  Tier: COMMON | Twemoji Hex: 1f436
  📜  "Anjing setia yang selalu mengibaskan ekor gembira, menyemangati petualang agar tidak lelah belajar."
  ====================================================
```

### A. Lembar Identitas & Spesifikasi Item
- **Item ID**: `pet_dog`
- **Slot Avatar**: `pet` (Sisi Kiri Bawah Karakter)
- **Tingkat Kelangkaan (Tier)**: **COMMON**
- **Ikon Emoji**: 🐶
- **Twemoji Code**: `1f436`
- **Efek Pasif RPG**: **Semangat Pantang Menyerah (Puppy Vigor)** — *Pemulihan +2 HP Karakter saat memenangkan pertarungan duel atau laga bos.*
- **Metode Perolehan**: Beli di Toko Koin Pemula (200 Koin) atau Peti Harta Karun Wilayah 1.

---

### B. Kode SVG Standalone Mandiri (Kartu Seni Vektor 160x200)
Kode SVG berikut adalah dokumen mandiri (*pure standalone XML SVG*). Anda dapat menyalin kode ini langsung ke berkas berekstensi `.svg` dan membukanya pada browser web, Figma, Illustrator, maupun Inkscape tanpa memerlukan koneksi internet:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200" role="img" aria-label="Anjing Ceria">
  <defs>
    <!-- Gradien Latar Belakang Kartu -->
    <linearGradient id="bg-pet_dog" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#eff6ff"/>
      <stop offset="100%" stop-color="#dbeafe"/>
    </linearGradient>
    <!-- Gradien Aura Peliharaan -->
    <radialGradient id="aura-pet_dog" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#60a5fa" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    <!-- Bayangan Tanah -->
    <radialGradient id="shadow-pet_dog" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <style>
    .fx-float { animation: floatSlow 3s ease-in-out infinite alternate; }
    .fx-pulse { animation: pulseAura 2s ease-in-out infinite alternate; }
    .fx-twinkle { animation: twinkleStar 1.4s ease-in-out infinite alternate; }
    @keyframes floatSlow { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
    @keyframes pulseAura { 0% { transform: scale(0.92); opacity: 0.6; } 100% { transform: scale(1.08); opacity: 1; } }
    @keyframes twinkleStar { 0% { opacity: 0.3; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1.2); } }
  </style>

  <!-- Bingkai Kartu -->
  <rect width="160" height="200" rx="18" fill="url(#bg-pet_dog)" stroke="#3b82f6" stroke-width="3"/>

  <!-- Badge Kelangkaan -->
  <rect x="12" y="12" width="68" height="20" rx="10" fill="#3b82f6"/>
  <text x="46" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">COMMON</text>

  <!-- Bayangan Tanah -->
  <ellipse cx="80" cy="145" rx="36" ry="9" fill="url(#shadow-pet_dog)"/>

  <!-- Aura Berdenyut -->
  <g transform="translate(80 100)">
    <circle class="fx-pulse" cx="0" cy="0" r="42" fill="url(#aura-pet_dog)" transform-origin="0 0"/>
  </g>

  <!-- Sprite Vektor Pet (Twemoji Centered) -->
  <g class="fx-float" transform="translate(80 95)">
    <g transform="translate(-36 -36) scale(2.0)">
      <path fill="#DD2E44" d="M15 27v6s0 3 3 3 3-3 3-3v-6h-6z"/><path fill="#BE1931" d="m15 33 .001.037c1.041-.035 2.016-.274 2.632-1.286a.426.426 0 0 1 .735 0c.616 1.011 1.591 1.251 2.632 1.286V27h-6v6z"/><path fill="#D99E82" d="M31.954 21.619c0 6.276-5 6.276-5 6.276h-18s-5 0-5-6.276c0-6.724 5-18.619 14-18.619s14 12.895 14 18.619z"/><path fill="#F4C7B5" d="M18 20c-7 0-10 3.527-10 6.395a5.5 5.5 0 0 0 5.5 5.5c1.605 0 3.042-.664 4.049-2.767a.495.495 0 0 1 .901 0c1.007 2.103 2.445 2.767 4.049 2.767a5.5 5.5 0 0 0 5.5-5.5C28 23.527 25 20 18 20z"/><path fill="#292F33" d="M15 22.895c-1 1 2 4 3 4s4-3 3-4-5-1-6 0zM13 19c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2z"/><path fill="#662113" d="M15 3.608C13.941 2.199 11.681.881 2.828 4.2-1.316 5.754.708 17.804 3.935 18.585c1.106 0 4.426 0 4.426-8.852 0-.22-.002-.423-.005-.625C10.35 6.298 12.5 4.857 15 3.608zm18.172.592C24.319.881 22.059 2.199 21 3.608c2.5 1.25 4.65 2.691 6.644 5.501-.003.201-.005.404-.005.625 0 8.852 3.319 8.852 4.426 8.852 3.227-.782 5.251-12.832 1.107-14.386z"/><circle cx="23.5" cy="25.5" r=".5" fill="#D99E82"/><circle cx="11.5" cy="25.5" r=".5" fill="#D99E82"/><circle cx="25.5" cy="27.5" r=".5" fill="#D99E82"/><circle cx="10.5" cy="27.5" r=".5" fill="#D99E82"/><circle cx="23" cy="28" r="1" fill="#D99E82"/><circle cx="13" cy="28" r="1" fill="#D99E82"/><path fill="#380F09" d="M9.883 7.232c-.259-.673-.634-1.397-1.176-1.939a.999.999 0 1 0-1.414 1.414c.57.57 1.066 1.934 1.068 2.346.145-.404.839-1.15 1.522-1.821zm16.217 0c.259-.672.634-1.397 1.176-1.939a.999.999 0 1 1 1.414 1.414c-.57.57-1.066 1.934-1.068 2.346-.145-.404-.839-1.15-1.522-1.821z"/>
    </g>
  </g>

  <!-- Label Nama Pet -->
  <rect x="16" y="160" width="128" height="26" rx="8" fill="#ffffff" stroke="#3b82f6" stroke-width="1.5" opacity="0.95"/>
  <text x="80" y="177" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">🐶 Anjing Ceria</text>
</svg>
```

---

### C. Kode Vektor Murni Sprite Pet (Path Twemoji Resmi 36x36)
Berikut adalah kode elemen path murni yang membentuk wujud fisik hewan peliharaan secara detail:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <path fill="#DD2E44" d="M15 27v6s0 3 3 3 3-3 3-3v-6h-6z"/><path fill="#BE1931" d="m15 33 .001.037c1.041-.035 2.016-.274 2.632-1.286a.426.426 0 0 1 .735 0c.616 1.011 1.591 1.251 2.632 1.286V27h-6v6z"/><path fill="#D99E82" d="M31.954 21.619c0 6.276-5 6.276-5 6.276h-18s-5 0-5-6.276c0-6.724 5-18.619 14-18.619s14 12.895 14 18.619z"/><path fill="#F4C7B5" d="M18 20c-7 0-10 3.527-10 6.395a5.5 5.5 0 0 0 5.5 5.5c1.605 0 3.042-.664 4.049-2.767a.495.495 0 0 1 .901 0c1.007 2.103 2.445 2.767 4.049 2.767a5.5 5.5 0 0 0 5.5-5.5C28 23.527 25 20 18 20z"/><path fill="#292F33" d="M15 22.895c-1 1 2 4 3 4s4-3 3-4-5-1-6 0zM13 19c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2s2 .9 2 2v2c0 1.1-.9 2-2 2z"/><path fill="#662113" d="M15 3.608C13.941 2.199 11.681.881 2.828 4.2-1.316 5.754.708 17.804 3.935 18.585c1.106 0 4.426 0 4.426-8.852 0-.22-.002-.423-.005-.625C10.35 6.298 12.5 4.857 15 3.608zm18.172.592C24.319.881 22.059 2.199 21 3.608c2.5 1.25 4.65 2.691 6.644 5.501-.003.201-.005.404-.005.625 0 8.852 3.319 8.852 4.426 8.852 3.227-.782 5.251-12.832 1.107-14.386z"/><circle cx="23.5" cy="25.5" r=".5" fill="#D99E82"/><circle cx="11.5" cy="25.5" r=".5" fill="#D99E82"/><circle cx="25.5" cy="27.5" r=".5" fill="#D99E82"/><circle cx="10.5" cy="27.5" r=".5" fill="#D99E82"/><circle cx="23" cy="28" r="1" fill="#D99E82"/><circle cx="13" cy="28" r="1" fill="#D99E82"/><path fill="#380F09" d="M9.883 7.232c-.259-.673-.634-1.397-1.176-1.939a.999.999 0 1 0-1.414 1.414c.57.57 1.066 1.934 1.068 2.346.145-.404.839-1.15 1.522-1.821zm16.217 0c.259-.672.634-1.397 1.176-1.939a.999.999 0 1 1 1.414 1.414c-.57.57-1.066 1.934-1.068 2.346-.145-.404-.839-1.15-1.522-1.821z"/>
</svg>
```

---

### D. Implementasi Layer pada Avatar Engine (`shared/avatar.js`)
Cuplikan kode berikut menunjukkan bagaimana pet dirender di dalam kanvas avatar 200x200:

```xml
<!-- Cuplikan Lapisan Pet pada Avatar 200x200 -->
<g class="pet-slot-container" data-pet="pet_dog">
  <!-- 1. Bayangan Mengambang -->
  <ellipse cx="32" cy="182" rx="28" ry="6.5" fill="url(#pp-${uid})"/>
  
  <!-- 2. Aura Sesuai Tier -->
  <!-- Common Aura Dasar -->
  
  <!-- 3. Sprite Vektor Pet -->
  <g transform="translate(8, 136)">
    <image class="fx-float-sm" href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f436.svg" width="48" height="48" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35))"/>
  </g>
</g>
```

---

## 5. Desain SVG Lengkap Pet 3: Pinguin Lucu (`pet_penguin`)

```
  🐧  ==============================================
  🐾  Pinguin Lucu (Frosty Penguin)
  ⭐  Tier: RARE | Twemoji Hex: 1f427
  📜  "Berasal dari padang salju selatan yang dingin. Hawa bekunya menyejukkan ketegangan waktu saat ujian berhitung."
  ====================================================
```

### A. Lembar Identitas & Spesifikasi Item
- **Item ID**: `pet_penguin`
- **Slot Avatar**: `pet` (Sisi Kiri Bawah Karakter)
- **Tingkat Kelangkaan (Tier)**: **RARE**
- **Ikon Emoji**: 🐧
- **Twemoji Code**: `1f427`
- **Efek Pasif RPG**: **Nafas Es Pembeku (Glacial Calm)** — *Waktu Beku Alami (Freeze Time) +1.5 detik pada timer giliran soal.*
- **Metode Perolehan**: Toko Spesial Koin (500 Koin) atau Peti Harta Karun Wilayah 2 & 3.

---

### B. Kode SVG Standalone Mandiri (Kartu Seni Vektor 160x200)
Kode SVG berikut adalah dokumen mandiri (*pure standalone XML SVG*). Anda dapat menyalin kode ini langsung ke berkas berekstensi `.svg` dan membukanya pada browser web, Figma, Illustrator, maupun Inkscape tanpa memerlukan koneksi internet:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200" role="img" aria-label="Pinguin Lucu">
  <defs>
    <!-- Gradien Latar Belakang Kartu -->
    <linearGradient id="bg-pet_penguin" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ecfeff"/>
      <stop offset="100%" stop-color="#cffafe"/>
    </linearGradient>
    <!-- Gradien Aura Peliharaan -->
    <radialGradient id="aura-pet_penguin" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#22d3ee" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
    <!-- Bayangan Tanah -->
    <radialGradient id="shadow-pet_penguin" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <style>
    .fx-float { animation: floatSlow 3s ease-in-out infinite alternate; }
    .fx-pulse { animation: pulseAura 2s ease-in-out infinite alternate; }
    .fx-twinkle { animation: twinkleStar 1.4s ease-in-out infinite alternate; }
    @keyframes floatSlow { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
    @keyframes pulseAura { 0% { transform: scale(0.92); opacity: 0.6; } 100% { transform: scale(1.08); opacity: 1; } }
    @keyframes twinkleStar { 0% { opacity: 0.3; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1.2); } }
  </style>

  <!-- Bingkai Kartu -->
  <rect width="160" height="200" rx="18" fill="url(#bg-pet_penguin)" stroke="#06b6d4" stroke-width="3"/>

  <!-- Badge Kelangkaan -->
  <rect x="12" y="12" width="68" height="20" rx="10" fill="#06b6d4"/>
  <text x="46" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">RARE</text>

  <!-- Bayangan Tanah -->
  <ellipse cx="80" cy="145" rx="36" ry="9" fill="url(#shadow-pet_penguin)"/>

  <!-- Aura Berdenyut -->
  <g transform="translate(80 100)">
    <circle class="fx-pulse" cx="0" cy="0" r="42" fill="url(#aura-pet_penguin)" transform-origin="0 0"/>
  </g>

  <!-- Sprite Vektor Pet (Twemoji Centered) -->
  <g class="fx-float" transform="translate(80 95)">
    <g transform="translate(-36 -36) scale(2.0)">
      <path fill="#FFAC33" d="M28.068 31.355c-2.229 0-8.468.785-10.068 1.832-1.601-1.047-7.84-1.832-10.069-1.832-2.564 0-1.161 1.039-1.161 2.322C6.77 34.96 5.367 36 7.931 36c2.229 0 8.468-.785 10.069-1.832C19.601 35.215 25.84 36 28.068 36c2.565 0 1.161-1.04 1.161-2.322 0-1.283 1.405-2.323-1.161-2.323z"/><path fill="#292F33" d="M31.73 15.866c-1.25-2.499-3.152-4.995-4.942-6.723C24.337 3.711 20.759 0 18 0s-6.337 3.71-8.788 9.143c-1.791 1.729-3.693 4.224-4.943 6.724-2.438 4.876-3.116 11.426-2.078 11.944.873.437 2.324-1.552 4.208-5.082C6.667 33.604 13.446 33.678 18 33.678c4.553 0 11.333-.073 11.601-10.947 1.884 3.528 3.335 5.517 4.207 5.08 1.038-.519.361-7.069-2.078-11.945z"/><path fill="#F5F8FA" d="M21.675 6.943c-.85.607-2.172 1.186-3.675 1.186s-2.825-.578-3.675-1.185c-3.302 2.137-5.615 7.06-5.615 12.798 0 7.695 4.159 13.936 9.29 13.936 5.132 0 9.291-6.24 9.291-13.936 0-5.738-2.313-10.662-5.616-12.799z"/><path fill="#FFAC33" d="M28.452 6h-5.808C18.797 6 18 5.22 18 4.257c0-.962-.364-1.742 3.483-1.742C27.291 2.516 29.613 6 28.452 6z"/><path fill="#F5F8FA" d="M16.839 3.483a1.161 1.161 0 1 1-2.323.001 1.161 1.161 0 0 1 2.323-.001z"/>
    </g>
  </g>

  <!-- Label Nama Pet -->
  <rect x="16" y="160" width="128" height="26" rx="8" fill="#ffffff" stroke="#06b6d4" stroke-width="1.5" opacity="0.95"/>
  <text x="80" y="177" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">🐧 Pinguin Lucu</text>
</svg>
```

---

### C. Kode Vektor Murni Sprite Pet (Path Twemoji Resmi 36x36)
Berikut adalah kode elemen path murni yang membentuk wujud fisik hewan peliharaan secara detail:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <path fill="#FFAC33" d="M28.068 31.355c-2.229 0-8.468.785-10.068 1.832-1.601-1.047-7.84-1.832-10.069-1.832-2.564 0-1.161 1.039-1.161 2.322C6.77 34.96 5.367 36 7.931 36c2.229 0 8.468-.785 10.069-1.832C19.601 35.215 25.84 36 28.068 36c2.565 0 1.161-1.04 1.161-2.322 0-1.283 1.405-2.323-1.161-2.323z"/><path fill="#292F33" d="M31.73 15.866c-1.25-2.499-3.152-4.995-4.942-6.723C24.337 3.711 20.759 0 18 0s-6.337 3.71-8.788 9.143c-1.791 1.729-3.693 4.224-4.943 6.724-2.438 4.876-3.116 11.426-2.078 11.944.873.437 2.324-1.552 4.208-5.082C6.667 33.604 13.446 33.678 18 33.678c4.553 0 11.333-.073 11.601-10.947 1.884 3.528 3.335 5.517 4.207 5.08 1.038-.519.361-7.069-2.078-11.945z"/><path fill="#F5F8FA" d="M21.675 6.943c-.85.607-2.172 1.186-3.675 1.186s-2.825-.578-3.675-1.185c-3.302 2.137-5.615 7.06-5.615 12.798 0 7.695 4.159 13.936 9.29 13.936 5.132 0 9.291-6.24 9.291-13.936 0-5.738-2.313-10.662-5.616-12.799z"/><path fill="#FFAC33" d="M28.452 6h-5.808C18.797 6 18 5.22 18 4.257c0-.962-.364-1.742 3.483-1.742C27.291 2.516 29.613 6 28.452 6z"/><path fill="#F5F8FA" d="M16.839 3.483a1.161 1.161 0 1 1-2.323.001 1.161 1.161 0 0 1 2.323-.001z"/>
</svg>
```

---

### D. Implementasi Layer pada Avatar Engine (`shared/avatar.js`)
Cuplikan kode berikut menunjukkan bagaimana pet dirender di dalam kanvas avatar 200x200:

```xml
<!-- Cuplikan Lapisan Pet pada Avatar 200x200 -->
<g class="pet-slot-container" data-pet="pet_penguin">
  <!-- 1. Bayangan Mengambang -->
  <ellipse cx="32" cy="182" rx="28" ry="6.5" fill="url(#pp-${uid})"/>
  
  <!-- 2. Aura Sesuai Tier -->
  <circle class="fx-pulse" cx="32" cy="160" r="28" fill="url(#ppr-${uid})"/>
  
  <!-- 3. Sprite Vektor Pet -->
  <g transform="translate(8, 136)">
    <image class="fx-float-sm" href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f427.svg" width="48" height="48" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35))"/>
  </g>
</g>
```

---

## 6. Desain SVG Lengkap Pet 4: Rubah Cerdik (`pet_fox`)

```
  🦊  ==============================================
  🐾  Rubah Cerdik (Clever Kitsune)
  ⭐  Tier: RARE | Twemoji Hex: 1f98a
  📜  "Rubah berekor lebat dengan mata bercahaya cerdik yang ahli memanfaatkan momentum serangan beruntun."
  ====================================================
```

### A. Lembar Identitas & Spesifikasi Item
- **Item ID**: `pet_fox`
- **Slot Avatar**: `pet` (Sisi Kiri Bawah Karakter)
- **Tingkat Kelangkaan (Tier)**: **RARE**
- **Ikon Emoji**: 🦊
- **Twemoji Code**: `1f98a`
- **Efek Pasif RPG**: **Curi Momentum (Trickster Spark)** — *Peluang 15% memulihkan +1 Energi Semangat setiap kali mencapai kelipatan 3 Combo Streak.*
- **Metode Perolehan**: Toko Spesial Koin (550 Koin) atau Hadiah Bintang Wilayah 2.

---

### B. Kode SVG Standalone Mandiri (Kartu Seni Vektor 160x200)
Kode SVG berikut adalah dokumen mandiri (*pure standalone XML SVG*). Anda dapat menyalin kode ini langsung ke berkas berekstensi `.svg` dan membukanya pada browser web, Figma, Illustrator, maupun Inkscape tanpa memerlukan koneksi internet:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200" role="img" aria-label="Rubah Cerdik">
  <defs>
    <!-- Gradien Latar Belakang Kartu -->
    <linearGradient id="bg-pet_fox" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff7ed"/>
      <stop offset="100%" stop-color="#ffedd5"/>
    </linearGradient>
    <!-- Gradien Aura Peliharaan -->
    <radialGradient id="aura-pet_fox" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ea580c" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#fb923c" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ea580c" stop-opacity="0"/>
    </radialGradient>
    <!-- Bayangan Tanah -->
    <radialGradient id="shadow-pet_fox" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <style>
    .fx-float { animation: floatSlow 3s ease-in-out infinite alternate; }
    .fx-pulse { animation: pulseAura 2s ease-in-out infinite alternate; }
    .fx-twinkle { animation: twinkleStar 1.4s ease-in-out infinite alternate; }
    @keyframes floatSlow { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
    @keyframes pulseAura { 0% { transform: scale(0.92); opacity: 0.6; } 100% { transform: scale(1.08); opacity: 1; } }
    @keyframes twinkleStar { 0% { opacity: 0.3; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1.2); } }
  </style>

  <!-- Bingkai Kartu -->
  <rect width="160" height="200" rx="18" fill="url(#bg-pet_fox)" stroke="#ea580c" stroke-width="3"/>

  <!-- Badge Kelangkaan -->
  <rect x="12" y="12" width="68" height="20" rx="10" fill="#ea580c"/>
  <text x="46" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">RARE</text>

  <!-- Bayangan Tanah -->
  <ellipse cx="80" cy="145" rx="36" ry="9" fill="url(#shadow-pet_fox)"/>

  <!-- Aura Berdenyut -->
  <g transform="translate(80 100)">
    <circle class="fx-pulse" cx="0" cy="0" r="42" fill="url(#aura-pet_fox)" transform-origin="0 0"/>
  </g>

  <!-- Sprite Vektor Pet (Twemoji Centered) -->
  <g class="fx-float" transform="translate(80 95)">
    <g transform="translate(-36 -36) scale(2.0)">
      <path fill="#F4900C" d="M13.431 9.802c.658 2.638-8.673 10.489-11.244 4.098C.696 10.197-.606 2.434.874 2.065c1.48-.368 11.9 5.098 12.557 7.737z"/><path fill="#A0041E" d="M11.437 10.355c.96 1.538-1.831 4.561-3.368 5.522-1.538.961-2.899-.552-4.414-4.414-.662-1.689-1.666-6.27-1.103-6.622.562-.351 7.924 3.976 8.885 5.514z"/><path fill="#F4900C" d="M22.557 9.802C21.9 12.441 31.23 20.291 33.802 13.9c1.49-3.703 2.792-11.466 1.312-11.835-1.48-.368-11.899 5.098-12.557 7.737z"/><path fill="#A0041E" d="M24.552 10.355c-.96 1.538 1.831 4.561 3.368 5.522 1.537.961 2.898-.552 4.413-4.414.662-1.688 1.666-6.269 1.104-6.621-.563-.352-7.924 3.975-8.885 5.513z"/><path fill="#F18F26" d="M32.347 26.912c0-.454-.188-1.091-.407-1.687.585.028 1.519.191 2.77.817a4.003 4.003 0 0 0-.273-1.393c.041.02.075.034.116.055-1.103-3.31-3.309-5.517-3.309-5.517h2.206c-2.331-4.663-4.965-8.015-8.075-9.559-1.39-.873-3.688-1.338-7.373-1.339h-.003c-3.695 0-5.996.468-7.385 1.346-3.104 1.547-5.734 4.896-8.061 9.552H4.76s-2.207 2.206-3.311 5.517c.03-.015.055-.025.084-.04a2.685 2.685 0 0 0-.282 1.377c1.263-.632 2.217-.792 2.813-.818-.189.513-.343 1.044-.386 1.475a3.146 3.146 0 0 0-.135 1.343C6.75 26.584 8.25 26.792 10 27.667 11.213 31.29 14.206 34 18.001 34c3.793 0 6.746-2.794 7.958-6.416 1.458-1.25 3.708-.875 6.416.416a2.843 2.843 0 0 0-.036-1.093l.008.005z"/><path fill="#FFD983" d="M31.243 23.601c.006 0 1.108.003 3.309 1.103-1.249-2.839-7.525-4.07-9.931-3.291-1.171 1.954-1.281 5.003-3.383 6.622-1.741 1.431-4.713 1.458-6.479 0-2.345-1.924-2.559-5.813-3.382-6.622-2.407-.781-8.681.454-9.931 3.291 2.201-1.101 3.304-1.103 3.309-1.103 0 .001-1.103 2.208-1.103 3.311l.001-.001v.001c2.398-1.573 5.116-2.271 7.429-.452 1.666 7.921 12.293 7.545 13.833 0 2.314-1.818 5.03-1.122 7.429.452v-.001l.001.001c.002-1.103-1.101-3.311-1.102-3.311z"/><path fill="#272B2B" d="M11 17s0-1.5 1.5-1.5S14 17 14 17v1.5s0 1.5-1.5 1.5-1.5-1.5-1.5-1.5V17zm11 0s0-1.5 1.5-1.5S25 17 25 17v1.5s0 1.5-1.5 1.5-1.5-1.5-1.5-1.5V17zm-7.061 10.808c-1.021.208 2.041 3.968 3.062 3.968 1.02 0 4.082-3.76 3.062-3.968-1.021-.208-5.103-.208-6.124 0z"/>
    </g>
  </g>

  <!-- Label Nama Pet -->
  <rect x="16" y="160" width="128" height="26" rx="8" fill="#ffffff" stroke="#ea580c" stroke-width="1.5" opacity="0.95"/>
  <text x="80" y="177" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">🦊 Rubah Cerdik</text>
</svg>
```

---

### C. Kode Vektor Murni Sprite Pet (Path Twemoji Resmi 36x36)
Berikut adalah kode elemen path murni yang membentuk wujud fisik hewan peliharaan secara detail:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <path fill="#F4900C" d="M13.431 9.802c.658 2.638-8.673 10.489-11.244 4.098C.696 10.197-.606 2.434.874 2.065c1.48-.368 11.9 5.098 12.557 7.737z"/><path fill="#A0041E" d="M11.437 10.355c.96 1.538-1.831 4.561-3.368 5.522-1.538.961-2.899-.552-4.414-4.414-.662-1.689-1.666-6.27-1.103-6.622.562-.351 7.924 3.976 8.885 5.514z"/><path fill="#F4900C" d="M22.557 9.802C21.9 12.441 31.23 20.291 33.802 13.9c1.49-3.703 2.792-11.466 1.312-11.835-1.48-.368-11.899 5.098-12.557 7.737z"/><path fill="#A0041E" d="M24.552 10.355c-.96 1.538 1.831 4.561 3.368 5.522 1.537.961 2.898-.552 4.413-4.414.662-1.688 1.666-6.269 1.104-6.621-.563-.352-7.924 3.975-8.885 5.513z"/><path fill="#F18F26" d="M32.347 26.912c0-.454-.188-1.091-.407-1.687.585.028 1.519.191 2.77.817a4.003 4.003 0 0 0-.273-1.393c.041.02.075.034.116.055-1.103-3.31-3.309-5.517-3.309-5.517h2.206c-2.331-4.663-4.965-8.015-8.075-9.559-1.39-.873-3.688-1.338-7.373-1.339h-.003c-3.695 0-5.996.468-7.385 1.346-3.104 1.547-5.734 4.896-8.061 9.552H4.76s-2.207 2.206-3.311 5.517c.03-.015.055-.025.084-.04a2.685 2.685 0 0 0-.282 1.377c1.263-.632 2.217-.792 2.813-.818-.189.513-.343 1.044-.386 1.475a3.146 3.146 0 0 0-.135 1.343C6.75 26.584 8.25 26.792 10 27.667 11.213 31.29 14.206 34 18.001 34c3.793 0 6.746-2.794 7.958-6.416 1.458-1.25 3.708-.875 6.416.416a2.843 2.843 0 0 0-.036-1.093l.008.005z"/><path fill="#FFD983" d="M31.243 23.601c.006 0 1.108.003 3.309 1.103-1.249-2.839-7.525-4.07-9.931-3.291-1.171 1.954-1.281 5.003-3.383 6.622-1.741 1.431-4.713 1.458-6.479 0-2.345-1.924-2.559-5.813-3.382-6.622-2.407-.781-8.681.454-9.931 3.291 2.201-1.101 3.304-1.103 3.309-1.103 0 .001-1.103 2.208-1.103 3.311l.001-.001v.001c2.398-1.573 5.116-2.271 7.429-.452 1.666 7.921 12.293 7.545 13.833 0 2.314-1.818 5.03-1.122 7.429.452v-.001l.001.001c.002-1.103-1.101-3.311-1.102-3.311z"/><path fill="#272B2B" d="M11 17s0-1.5 1.5-1.5S14 17 14 17v1.5s0 1.5-1.5 1.5-1.5-1.5-1.5-1.5V17zm11 0s0-1.5 1.5-1.5S25 17 25 17v1.5s0 1.5-1.5 1.5-1.5-1.5-1.5-1.5V17zm-7.061 10.808c-1.021.208 2.041 3.968 3.062 3.968 1.02 0 4.082-3.76 3.062-3.968-1.021-.208-5.103-.208-6.124 0z"/>
</svg>
```

---

### D. Implementasi Layer pada Avatar Engine (`shared/avatar.js`)
Cuplikan kode berikut menunjukkan bagaimana pet dirender di dalam kanvas avatar 200x200:

```xml
<!-- Cuplikan Lapisan Pet pada Avatar 200x200 -->
<g class="pet-slot-container" data-pet="pet_fox">
  <!-- 1. Bayangan Mengambang -->
  <ellipse cx="32" cy="182" rx="28" ry="6.5" fill="url(#pp-${uid})"/>
  
  <!-- 2. Aura Sesuai Tier -->
  <circle class="fx-pulse" cx="32" cy="160" r="28" fill="url(#ppr-${uid})"/>
  
  <!-- 3. Sprite Vektor Pet -->
  <g transform="translate(8, 136)">
    <image class="fx-float-sm" href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f98a.svg" width="48" height="48" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35))"/>
  </g>
</g>
```

---

## 7. Desain SVG Lengkap Pet 5: Burung Hantu Bijak (`pet_owl`)

```
  🦉  ==============================================
  🐾  Burung Hantu Bijak (Mystic Sage Owl)
  ⭐  Tier: EPIC | Twemoji Hex: 1f989
  📜  "Penjaga perpustakaan malam berkepala bijak. Melindungi fokus siswa dari satu kali kelalaian agar rantai kombo tidak terputus."
  ====================================================
```

### A. Lembar Identitas & Spesifikasi Item
- **Item ID**: `pet_owl`
- **Slot Avatar**: `pet` (Sisi Kiri Bawah Karakter)
- **Tingkat Kelangkaan (Tier)**: **EPIC**
- **Ikon Emoji**: 🦉
- **Twemoji Code**: `1f989`
- **Efek Pasif RPG**: **Tabir Kebijaksanaan Malam (Wisdom Aegis)** — *Proteksi Combo Streak 50%: Rantai combo tidak hangus jika salah menjawab 1 kali.*
- **Metode Perolehan**: Drop Peti Rahasia Bos Wilayah 3 / Hadiah Lencana Prestasi Emas.

---

### B. Kode SVG Standalone Mandiri (Kartu Seni Vektor 160x200)
Kode SVG berikut adalah dokumen mandiri (*pure standalone XML SVG*). Anda dapat menyalin kode ini langsung ke berkas berekstensi `.svg` dan membukanya pada browser web, Figma, Illustrator, maupun Inkscape tanpa memerlukan koneksi internet:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200" role="img" aria-label="Burung Hantu Bijak">
  <defs>
    <!-- Gradien Latar Belakang Kartu -->
    <linearGradient id="bg-pet_owl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f5f3ff"/>
      <stop offset="100%" stop-color="#ede9fe"/>
    </linearGradient>
    <!-- Gradien Aura Peliharaan -->
    <radialGradient id="aura-pet_owl" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#c084fc" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
    <!-- Bayangan Tanah -->
    <radialGradient id="shadow-pet_owl" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <style>
    .fx-float { animation: floatSlow 3s ease-in-out infinite alternate; }
    .fx-pulse { animation: pulseAura 2s ease-in-out infinite alternate; }
    .fx-twinkle { animation: twinkleStar 1.4s ease-in-out infinite alternate; }
    @keyframes floatSlow { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
    @keyframes pulseAura { 0% { transform: scale(0.92); opacity: 0.6; } 100% { transform: scale(1.08); opacity: 1; } }
    @keyframes twinkleStar { 0% { opacity: 0.3; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1.2); } }
  </style>

  <!-- Bingkai Kartu -->
  <rect width="160" height="200" rx="18" fill="url(#bg-pet_owl)" stroke="#8b5cf6" stroke-width="3"/>

  <!-- Badge Kelangkaan -->
  <rect x="12" y="12" width="68" height="20" rx="10" fill="#8b5cf6"/>
  <text x="46" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">EPIC</text>

  <!-- Bayangan Tanah -->
  <ellipse cx="80" cy="145" rx="36" ry="9" fill="url(#shadow-pet_owl)"/>

  <!-- Aura Berdenyut -->
  <g transform="translate(80 100)">
    <circle class="fx-pulse" cx="0" cy="0" r="42" fill="url(#aura-pet_owl)" transform-origin="0 0"/>
  </g>

  <!-- Sprite Vektor Pet (Twemoji Centered) -->
  <g class="fx-float" transform="translate(80 95)">
    <g transform="translate(-36 -36) scale(2.0)">
      <path fill="#662113" d="M7.317 11c-5.723 9.083.958 18 .958 18s2.874-.442 6.875-5.2c4-4.758-7.833-12.8-7.833-12.8zm21.342 0c5.723 9.083-.958 18-.958 18s-2.874-.442-6.875-5.2C16.825 19.042 28.659 11 28.659 11z"/><path fill="#FFAC33" d="M15.203 31.557a1.22 1.22 0 0 0-.531-.496c-2.032-2.172-.589-4.717-.589-4.717 0-.703 1.271-2.544 0-2.544l-1.272 1.272c-1.272 1.271-1.272 5.089-1.272 5.089H8.995a1.27 1.27 0 1 0 0 2.543h1.408l-.282.153a1.274 1.274 0 0 0 1.21 2.24l3.357-1.816a1.274 1.274 0 0 0 .515-1.724zm5.596 0c.123-.229.317-.384.53-.496 2.033-2.172.589-4.717.589-4.717 0-.703-1.271-2.544 0-2.544l1.272 1.272c1.273 1.271 1.273 5.089 1.273 5.089h2.544a1.27 1.27 0 0 1 1.271 1.272 1.27 1.27 0 0 1-1.271 1.271h-1.408l.281.153a1.273 1.273 0 1 1-1.211 2.24l-3.356-1.816a1.272 1.272 0 0 1-.514-1.724z"/><path fill="#662113" d="M28.278 11.292c2.891-6.092 0-10.542 0-10.542s-5.781.959-6.744 2.875c-1.219 2.424 6.744 7.667 6.744 7.667z"/><path fill="#662113" d="M29.562 12.738c0 10.297-3.152 20.595-11.562 20.595-8.409 0-11.563-10.298-11.563-20.595C6.437 2.44 11.614 2.083 18 2.083c6.387 0 11.562.357 11.562 10.655z"/><path fill="#C1694F" d="M27.666 17.738c0 10.297-7.774 14.595-9.666 14.595s-9.666-4.298-9.666-14.595c0-10.298 19.332-10.298 19.332 0z"/><path fill="#662113" d="M7.722 11.292C4.831 5.2 7.722.75 7.722.75s5.782.959 6.746 2.875c1.218 2.424-6.746 7.667-6.746 7.667z"/><path fill="#C1694F" d="M14.929 4.373C10.702 2.789 7.722.75 7.722.75s-2.076 3.221-.928 7.926c.446 2.137 1.94 4.195 3.904 4.662 2.637.627 7.302-.049 7.302-3.963 0-2.695-1.074-4.252-3.071-5.002zm6.142 0C25.298 2.789 28.277.75 28.277.75s2.076 3.221.928 7.926c-.445 2.137-1.939 4.195-3.902 4.662-2.638.627-7.303-.049-7.303-3.963 0-2.695 1.074-4.252 3.071-5.002z"/><path fill="#FFD983" d="M16.083 8.417a3.833 3.833 0 1 1-7.666 0 3.833 3.833 0 0 1 7.666 0zm11.5 0a3.833 3.833 0 1 1-7.666 0 3.833 3.833 0 0 1 7.666 0z"/><path fill="#292F33" d="M14.167 8.417a1.917 1.917 0 1 1-3.833 0 1.917 1.917 0 0 1 3.833 0zm11.5 0a1.917 1.917 0 1 1-3.833 0 1.917 1.917 0 0 1 3.833 0z"/><path fill="#FFCC4D" d="M20.875 12.729c0 2.382-2.875 3.354-2.875 3.354s-2.875-.973-2.875-3.354S18 9.375 18 9.375s2.875.972 2.875 3.354z"/><path fill="#F4900C" d="M20.875 12.729c0 2.382-2.875 3.354-2.875 3.354s-2.875-.973-2.875-3.354C16.323 13.927 18 14.167 18 14.167s1.677-.24 2.875-1.438z"/>
    </g>
  </g>

  <!-- Label Nama Pet -->
  <rect x="16" y="160" width="128" height="26" rx="8" fill="#ffffff" stroke="#8b5cf6" stroke-width="1.5" opacity="0.95"/>
  <text x="80" y="177" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">🦉 Burung Hantu Bijak</text>
</svg>
```

---

### C. Kode Vektor Murni Sprite Pet (Path Twemoji Resmi 36x36)
Berikut adalah kode elemen path murni yang membentuk wujud fisik hewan peliharaan secara detail:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <path fill="#662113" d="M7.317 11c-5.723 9.083.958 18 .958 18s2.874-.442 6.875-5.2c4-4.758-7.833-12.8-7.833-12.8zm21.342 0c5.723 9.083-.958 18-.958 18s-2.874-.442-6.875-5.2C16.825 19.042 28.659 11 28.659 11z"/><path fill="#FFAC33" d="M15.203 31.557a1.22 1.22 0 0 0-.531-.496c-2.032-2.172-.589-4.717-.589-4.717 0-.703 1.271-2.544 0-2.544l-1.272 1.272c-1.272 1.271-1.272 5.089-1.272 5.089H8.995a1.27 1.27 0 1 0 0 2.543h1.408l-.282.153a1.274 1.274 0 0 0 1.21 2.24l3.357-1.816a1.274 1.274 0 0 0 .515-1.724zm5.596 0c.123-.229.317-.384.53-.496 2.033-2.172.589-4.717.589-4.717 0-.703-1.271-2.544 0-2.544l1.272 1.272c1.273 1.271 1.273 5.089 1.273 5.089h2.544a1.27 1.27 0 0 1 1.271 1.272 1.27 1.27 0 0 1-1.271 1.271h-1.408l.281.153a1.273 1.273 0 1 1-1.211 2.24l-3.356-1.816a1.272 1.272 0 0 1-.514-1.724z"/><path fill="#662113" d="M28.278 11.292c2.891-6.092 0-10.542 0-10.542s-5.781.959-6.744 2.875c-1.219 2.424 6.744 7.667 6.744 7.667z"/><path fill="#662113" d="M29.562 12.738c0 10.297-3.152 20.595-11.562 20.595-8.409 0-11.563-10.298-11.563-20.595C6.437 2.44 11.614 2.083 18 2.083c6.387 0 11.562.357 11.562 10.655z"/><path fill="#C1694F" d="M27.666 17.738c0 10.297-7.774 14.595-9.666 14.595s-9.666-4.298-9.666-14.595c0-10.298 19.332-10.298 19.332 0z"/><path fill="#662113" d="M7.722 11.292C4.831 5.2 7.722.75 7.722.75s5.782.959 6.746 2.875c1.218 2.424-6.746 7.667-6.746 7.667z"/><path fill="#C1694F" d="M14.929 4.373C10.702 2.789 7.722.75 7.722.75s-2.076 3.221-.928 7.926c.446 2.137 1.94 4.195 3.904 4.662 2.637.627 7.302-.049 7.302-3.963 0-2.695-1.074-4.252-3.071-5.002zm6.142 0C25.298 2.789 28.277.75 28.277.75s2.076 3.221.928 7.926c-.445 2.137-1.939 4.195-3.902 4.662-2.638.627-7.303-.049-7.303-3.963 0-2.695 1.074-4.252 3.071-5.002z"/><path fill="#FFD983" d="M16.083 8.417a3.833 3.833 0 1 1-7.666 0 3.833 3.833 0 0 1 7.666 0zm11.5 0a3.833 3.833 0 1 1-7.666 0 3.833 3.833 0 0 1 7.666 0z"/><path fill="#292F33" d="M14.167 8.417a1.917 1.917 0 1 1-3.833 0 1.917 1.917 0 0 1 3.833 0zm11.5 0a1.917 1.917 0 1 1-3.833 0 1.917 1.917 0 0 1 3.833 0z"/><path fill="#FFCC4D" d="M20.875 12.729c0 2.382-2.875 3.354-2.875 3.354s-2.875-.973-2.875-3.354S18 9.375 18 9.375s2.875.972 2.875 3.354z"/><path fill="#F4900C" d="M20.875 12.729c0 2.382-2.875 3.354-2.875 3.354s-2.875-.973-2.875-3.354C16.323 13.927 18 14.167 18 14.167s1.677-.24 2.875-1.438z"/>
</svg>
```

---

### D. Implementasi Layer pada Avatar Engine (`shared/avatar.js`)
Cuplikan kode berikut menunjukkan bagaimana pet dirender di dalam kanvas avatar 200x200:

```xml
<!-- Cuplikan Lapisan Pet pada Avatar 200x200 -->
<g class="pet-slot-container" data-pet="pet_owl">
  <!-- 1. Bayangan Mengambang -->
  <ellipse cx="32" cy="182" rx="28" ry="6.5" fill="url(#pp-${uid})"/>
  
  <!-- 2. Aura Sesuai Tier -->
  <circle class="fx-pulse" cx="32" cy="160" r="30" fill="url(#ppr-${uid})"/>
  
  <!-- 3. Sprite Vektor Pet -->
  <g transform="translate(8, 136)">
    <image class="fx-float-sm" href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f989.svg" width="48" height="48" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35))"/>
  </g>
</g>
```

---

## 8. Desain SVG Lengkap Pet 6: Anak Naga Langit (`pet_dragon`)

```
  🐲  ==============================================
  🐾  Anak Naga Langit (Celestial Baby Dragon)
  ⭐  Tier: LEGENDARY | Twemoji Hex: 1f432
  📜  "Naga kosmik fajar yang turun mendampingi petualang sejati penakluk seluruh penjuru negeri."
  ====================================================
```

### A. Lembar Identitas & Spesifikasi Item
- **Item ID**: `pet_dragon`
- **Slot Avatar**: `pet` (Sisi Kiri Bawah Karakter)
- **Tingkat Kelangkaan (Tier)**: **LEGENDARY**
- **Ikon Emoji**: 🐲
- **Twemoji Code**: `1f432`
- **Efek Pasif RPG**: **Semburan Api Naga (Dragon Breath)** — *Peluang 10% melancarkan semburan api instan sebesar +20 True Damage saat menjawab benar.*
- **Metode Perolehan**: 🏆 Hadiah Lencana Legenda: Penjelajah Kampanye (Selesaikan 25 node Mode Cerita).

---

### B. Kode SVG Standalone Mandiri (Kartu Seni Vektor 160x200)
Kode SVG berikut adalah dokumen mandiri (*pure standalone XML SVG*). Anda dapat menyalin kode ini langsung ke berkas berekstensi `.svg` dan membukanya pada browser web, Figma, Illustrator, maupun Inkscape tanpa memerlukan koneksi internet:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200" role="img" aria-label="Anak Naga Langit">
  <defs>
    <!-- Gradien Latar Belakang Kartu -->
    <linearGradient id="bg-pet_dragon" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fefce8"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <!-- Gradien Aura Peliharaan -->
    <radialGradient id="aura-pet_dragon" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#eab308" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#fde047" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#eab308" stop-opacity="0"/>
    </radialGradient>
    <!-- Bayangan Tanah -->
    <radialGradient id="shadow-pet_dragon" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <style>
    .fx-float { animation: floatSlow 3s ease-in-out infinite alternate; }
    .fx-pulse { animation: pulseAura 2s ease-in-out infinite alternate; }
    .fx-twinkle { animation: twinkleStar 1.4s ease-in-out infinite alternate; }
    @keyframes floatSlow { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
    @keyframes pulseAura { 0% { transform: scale(0.92); opacity: 0.6; } 100% { transform: scale(1.08); opacity: 1; } }
    @keyframes twinkleStar { 0% { opacity: 0.3; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1.2); } }
  </style>

  <!-- Bingkai Kartu -->
  <rect width="160" height="200" rx="18" fill="url(#bg-pet_dragon)" stroke="#eab308" stroke-width="3"/>

  <!-- Badge Kelangkaan -->
  <rect x="12" y="12" width="68" height="20" rx="10" fill="#eab308"/>
  <text x="46" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">LEGENDARY</text>

  <!-- Bayangan Tanah -->
  <ellipse cx="80" cy="145" rx="36" ry="9" fill="url(#shadow-pet_dragon)"/>

  <!-- Aura Berdenyut -->
  <g transform="translate(80 100)">
    <circle class="fx-pulse" cx="0" cy="0" r="42" fill="url(#aura-pet_dragon)" transform-origin="0 0"/>
  </g>

  <!-- Sprite Vektor Pet (Twemoji Centered) -->
  <g class="fx-float" transform="translate(80 95)">
    <g transform="translate(-36 -36) scale(2.0)">
      <path fill="#3E721D" d="M35.125 13.344c0-1 .771-2.327.771-2.635 0-.656-1.553-.421-1.626-1.046-.209-1.794 1.887-3.318-1.745-3.312-1.352.002-.274-1.768-.274-2.725 0-.957-2.596-.145-3.552-.145-.957 0-.957-2.87-1.913-2.87-2.87 0-3.827 2.87-4.783 2.87-.957 0-1.744-3.621-2.87-2.87-2.87 1.913-3.826 7.653-3.826 7.653s4.783-3.826 10.522-2.87c5.345.891 4.79 10.821 5.641 16.888L24.609 36h3.359c.344-1.5 1.939-.529 2.375-1.688.381-1.016-.67-1.966-.094-2.969s.978-.755 2.094-1.375c1.184-.657 0-2.199 0-3.156 0-.956 2.312-1.574 2.312-2.531 0-.63-1.068-1.292-.812-2.356.257-1.064 1.586-1.186 1.749-2.184.138-.847-.921-1.455-.796-2.393s1.174-1.378 1.174-2.097c.002-.718-.845-1.001-.845-1.907z"/><path fill="#77B255" d="M34.438 13.458c0-4.038-2.87-9.085-9.566-9.085-6.695 0-17.265 10.024-20.088 10.096C2.87 12.521 0 14.523 0 16.486c0 3.028 5.373 4.61 5.646 4.899 1.088 1.149 3.92 8.083 8.704 1.945.803-1.03 1.302-.422 3.483.542C25.069 27.729 16 36 16 36h9.566c4.782-4.783 8.871-13.844 8.871-21.997l-.021.008c.007-.185.022-.369.022-.553z"/><path fill="#292F33" d="M23.915 12.09a1.913 1.913 0 1 1-3.826 0 1.913 1.913 0 0 1 3.826 0z"/><path fill="#3E721D" d="M4.783 17.351c0 .793-.643.479-1.435.479s-1.435.315-1.435-.479a1.436 1.436 0 0 1 2.87 0z"/><path fill="#FFF" d="M18.176 18.782c0 1.058-.643.956-1.436.956-.792 0-1.434.101-1.434-.956 0-1.056.642-3.826 1.434-3.826.793 0 1.436 2.771 1.436 3.826zm-3.827.956c0 1.058-.643.957-1.435.957s-1.435.101-1.435-.957c0-1.056.643-3.826 1.435-3.826.792.001 1.435 2.771 1.435 3.826z"/><path fill="#3E721D" d="M18.04 18.795c-5.076.726-10.192 2.007-12.394 2.59.275.29.661.95 1.162 1.674 2.415-.624 6.975-1.724 11.503-2.369a.957.957 0 1 0-.271-1.895zm.549-6.186a.999.999 0 0 1-.708-1.705c.129-.129 3.222-3.163 8.36-3.163a1 1 0 1 1 0 2c-4.281 0-6.923 2.554-6.949 2.58a.997.997 0 0 1-.703.288z"/>
    </g>
  </g>

  <!-- Label Nama Pet -->
  <rect x="16" y="160" width="128" height="26" rx="8" fill="#ffffff" stroke="#eab308" stroke-width="1.5" opacity="0.95"/>
  <text x="80" y="177" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">🐲 Anak Naga Langit</text>
</svg>
```

---

### C. Kode Vektor Murni Sprite Pet (Path Twemoji Resmi 36x36)
Berikut adalah kode elemen path murni yang membentuk wujud fisik hewan peliharaan secara detail:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <path fill="#3E721D" d="M35.125 13.344c0-1 .771-2.327.771-2.635 0-.656-1.553-.421-1.626-1.046-.209-1.794 1.887-3.318-1.745-3.312-1.352.002-.274-1.768-.274-2.725 0-.957-2.596-.145-3.552-.145-.957 0-.957-2.87-1.913-2.87-2.87 0-3.827 2.87-4.783 2.87-.957 0-1.744-3.621-2.87-2.87-2.87 1.913-3.826 7.653-3.826 7.653s4.783-3.826 10.522-2.87c5.345.891 4.79 10.821 5.641 16.888L24.609 36h3.359c.344-1.5 1.939-.529 2.375-1.688.381-1.016-.67-1.966-.094-2.969s.978-.755 2.094-1.375c1.184-.657 0-2.199 0-3.156 0-.956 2.312-1.574 2.312-2.531 0-.63-1.068-1.292-.812-2.356.257-1.064 1.586-1.186 1.749-2.184.138-.847-.921-1.455-.796-2.393s1.174-1.378 1.174-2.097c.002-.718-.845-1.001-.845-1.907z"/><path fill="#77B255" d="M34.438 13.458c0-4.038-2.87-9.085-9.566-9.085-6.695 0-17.265 10.024-20.088 10.096C2.87 12.521 0 14.523 0 16.486c0 3.028 5.373 4.61 5.646 4.899 1.088 1.149 3.92 8.083 8.704 1.945.803-1.03 1.302-.422 3.483.542C25.069 27.729 16 36 16 36h9.566c4.782-4.783 8.871-13.844 8.871-21.997l-.021.008c.007-.185.022-.369.022-.553z"/><path fill="#292F33" d="M23.915 12.09a1.913 1.913 0 1 1-3.826 0 1.913 1.913 0 0 1 3.826 0z"/><path fill="#3E721D" d="M4.783 17.351c0 .793-.643.479-1.435.479s-1.435.315-1.435-.479a1.436 1.436 0 0 1 2.87 0z"/><path fill="#FFF" d="M18.176 18.782c0 1.058-.643.956-1.436.956-.792 0-1.434.101-1.434-.956 0-1.056.642-3.826 1.434-3.826.793 0 1.436 2.771 1.436 3.826zm-3.827.956c0 1.058-.643.957-1.435.957s-1.435.101-1.435-.957c0-1.056.643-3.826 1.435-3.826.792.001 1.435 2.771 1.435 3.826z"/><path fill="#3E721D" d="M18.04 18.795c-5.076.726-10.192 2.007-12.394 2.59.275.29.661.95 1.162 1.674 2.415-.624 6.975-1.724 11.503-2.369a.957.957 0 1 0-.271-1.895zm.549-6.186a.999.999 0 0 1-.708-1.705c.129-.129 3.222-3.163 8.36-3.163a1 1 0 1 1 0 2c-4.281 0-6.923 2.554-6.949 2.58a.997.997 0 0 1-.703.288z"/>
</svg>
```

---

### D. Implementasi Layer pada Avatar Engine (`shared/avatar.js`)
Cuplikan kode berikut menunjukkan bagaimana pet dirender di dalam kanvas avatar 200x200:

```xml
<!-- Cuplikan Lapisan Pet pada Avatar 200x200 -->
<g class="pet-slot-container" data-pet="pet_dragon">
  <!-- 1. Bayangan Mengambang -->
  <ellipse cx="32" cy="182" rx="28" ry="6.5" fill="url(#pp-${uid})"/>
  
  <!-- 2. Aura Sesuai Tier -->
  <circle class="fx-pulse" cx="32" cy="160" r="28" fill="url(#ppr-${uid})"/>
  
  <!-- 3. Sprite Vektor Pet -->
  <g transform="translate(8, 136)">
    <image class="fx-float-sm" href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f432.svg" width="48" height="48" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35))"/>
  </g>
</g>
```

---

## 9. Desain SVG Lengkap Pet 7: Bayi Burung Phoenix (`pet_phoenix`)

```
  🦅🔥  ==============================================
  🐾  Bayi Burung Phoenix (Eternal Baby Phoenix)
  ⭐  Tier: LEGENDARY | Twemoji Hex: 1f985
  📜  "Terlahir dari abu bara pertarungan yang paling membakar. Bangkit lebih perkasa saat situasi berada di ambang kekalahan."
  ====================================================
```

### A. Lembar Identitas & Spesifikasi Item
- **Item ID**: `pet_phoenix`
- **Slot Avatar**: `pet` (Sisi Kiri Bawah Karakter)
- **Tingkat Kelangkaan (Tier)**: **LEGENDARY**
- **Ikon Emoji**: 🦅🔥
- **Twemoji Code**: `1f985`
- **Efek Pasif RPG**: **Aura Kebangkitan Abu (Phoenix Flame Aegis)** — *Saat HP < 25%, otomatis memicu reduksi 20% damage musuh & memberikan +1 Energi darurat.*
- **Metode Perolehan**: 🏆 Hadiah Lencana Legenda: Penyintas Hati Phoenix (Menang 25 laga pada HP <= 20%).

---

### B. Kode SVG Standalone Mandiri (Kartu Seni Vektor 160x200)
Kode SVG berikut adalah dokumen mandiri (*pure standalone XML SVG*). Anda dapat menyalin kode ini langsung ke berkas berekstensi `.svg` dan membukanya pada browser web, Figma, Illustrator, maupun Inkscape tanpa memerlukan koneksi internet:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 200" width="160" height="200" role="img" aria-label="Bayi Burung Phoenix">
  <defs>
    <!-- Gradien Latar Belakang Kartu -->
    <linearGradient id="bg-pet_phoenix" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef2f2"/>
      <stop offset="100%" stop-color="#fee2e2"/>
    </linearGradient>
    <!-- Gradien Aura Peliharaan -->
    <radialGradient id="aura-pet_phoenix" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#f97316" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
    </radialGradient>
    <!-- Bayangan Tanah -->
    <radialGradient id="shadow-pet_phoenix" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <style>
    .fx-float { animation: floatSlow 3s ease-in-out infinite alternate; }
    .fx-pulse { animation: pulseAura 2s ease-in-out infinite alternate; }
    .fx-twinkle { animation: twinkleStar 1.4s ease-in-out infinite alternate; }
    @keyframes floatSlow { 0% { transform: translateY(0); } 100% { transform: translateY(-6px); } }
    @keyframes pulseAura { 0% { transform: scale(0.92); opacity: 0.6; } 100% { transform: scale(1.08); opacity: 1; } }
    @keyframes twinkleStar { 0% { opacity: 0.3; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1.2); } }
  </style>

  <!-- Bingkai Kartu -->
  <rect width="160" height="200" rx="18" fill="url(#bg-pet_phoenix)" stroke="#ef4444" stroke-width="3"/>

  <!-- Badge Kelangkaan -->
  <rect x="12" y="12" width="68" height="20" rx="10" fill="#ef4444"/>
  <text x="46" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">LEGENDARY</text>

  <!-- Bayangan Tanah -->
  <ellipse cx="80" cy="145" rx="36" ry="9" fill="url(#shadow-pet_phoenix)"/>

  <!-- Aura Berdenyut -->
  <g transform="translate(80 100)">
    <circle class="fx-pulse" cx="0" cy="0" r="42" fill="url(#aura-pet_phoenix)" transform-origin="0 0"/>
  </g>

  <!-- Sprite Vektor Pet (Twemoji Centered) -->
  <g class="fx-float" transform="translate(80 95)">
    <g transform="translate(-36 -36) scale(2.0)">
      <path fill="#292F33" d="M7.042 26c.33 0 .651.121.963.331 1.368-8.106 20.362-8.248 21.755-.29 1.666.412 3.08 4.378 3.748 9.959h-31c.793-5.899 2.522-10 4.534-10z"/><path fill="#E1E8ED" d="M7.043 23.688C10.966 12.533 6.508 3 17.508 3s8.736 8.173 13.193 19.125c1.119 2.75-1.443 5.908-1.443 5.908s-2.612-4.756-4.75-5.846c-.591 3.277-1.75 6.938-1.75 6.938s-2.581-2.965-5.587-5.587c-.879 1.009-2.065 2.183-3.663 3.462-.349-1.048-.943-2.339-1.568-3.576-1.468 2.238-3.182 4.951-3.182 4.951s-2.507-2.435-1.715-4.687z"/><path fill="#FFCC4D" d="M11.507 5c-4.36 3.059-5.542 2.16-7.812 3.562-2.125 1.312-2 4.938-.125 8.062.579-2.661-.5-3.149 6.938-3.149 5 0 7.928.289 7-1-.927-1.289-10.027.459-6.001-7.475z"/><path fill="#292F33" d="M16.535 7.517a1.483 1.483 0 1 1-2.967 0c0-.157.031-.305.076-.446h2.816c.044.141.075.289.075.446z"/>
    </g>
  </g>

  <!-- Label Nama Pet -->
  <rect x="16" y="160" width="128" height="26" rx="8" fill="#ffffff" stroke="#ef4444" stroke-width="1.5" opacity="0.95"/>
  <text x="80" y="177" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b" text-anchor="middle">🦅🔥 Bayi Burung Phoenix</text>
</svg>
```

---

### C. Kode Vektor Murni Sprite Pet (Path Twemoji Resmi 36x36)
Berikut adalah kode elemen path murni yang membentuk wujud fisik hewan peliharaan secara detail:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
  <path fill="#292F33" d="M7.042 26c.33 0 .651.121.963.331 1.368-8.106 20.362-8.248 21.755-.29 1.666.412 3.08 4.378 3.748 9.959h-31c.793-5.899 2.522-10 4.534-10z"/><path fill="#E1E8ED" d="M7.043 23.688C10.966 12.533 6.508 3 17.508 3s8.736 8.173 13.193 19.125c1.119 2.75-1.443 5.908-1.443 5.908s-2.612-4.756-4.75-5.846c-.591 3.277-1.75 6.938-1.75 6.938s-2.581-2.965-5.587-5.587c-.879 1.009-2.065 2.183-3.663 3.462-.349-1.048-.943-2.339-1.568-3.576-1.468 2.238-3.182 4.951-3.182 4.951s-2.507-2.435-1.715-4.687z"/><path fill="#FFCC4D" d="M11.507 5c-4.36 3.059-5.542 2.16-7.812 3.562-2.125 1.312-2 4.938-.125 8.062.579-2.661-.5-3.149 6.938-3.149 5 0 7.928.289 7-1-.927-1.289-10.027.459-6.001-7.475z"/><path fill="#292F33" d="M16.535 7.517a1.483 1.483 0 1 1-2.967 0c0-.157.031-.305.076-.446h2.816c.044.141.075.289.075.446z"/>
</svg>
```

---

### D. Implementasi Layer pada Avatar Engine (`shared/avatar.js`)
Cuplikan kode berikut menunjukkan bagaimana pet dirender di dalam kanvas avatar 200x200:

```xml
<!-- Cuplikan Lapisan Pet pada Avatar 200x200 -->
<g class="pet-slot-container" data-pet="pet_phoenix">
  <!-- 1. Bayangan Mengambang -->
  <ellipse cx="32" cy="182" rx="28" ry="6.5" fill="url(#pp-${uid})"/>
  
  <!-- 2. Aura Sesuai Tier -->
  <circle class="fx-pulse" cx="32" cy="160" r="28" fill="url(#ppr-${uid})"/>
  
  <!-- 3. Sprite Vektor Pet -->
  <g transform="translate(8, 136)">
    <image class="fx-float-sm" href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f985.svg" width="48" height="48" style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35))"/>
  </g>
</g>
```

---

## 10. Grand Showcase: Panggung Parade 7 Pet dalam 1 Kanvas SVG

Berikut adalah satu kode SVG utuh panggung pameran (*Gallery Showcase*) berukuran **840x260 piksel** yang menampilkan ke-7 hewan peliharaan berjajar lengkap di atas podium masing-masing:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 260" width="840" height="260" role="img" aria-label="Grand Showcase Pet Pelajar">
  <defs>
    <!-- Latar Belakang Panggung Gelap Megah -->
    <linearGradient id="bg-stage" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    
    <!-- Shading Podium -->
    <linearGradient id="podium-metal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>

    <!-- Aura Emas Legenda -->
    <radialGradient id="aura-gold" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#eab308" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Latar Belakang Panggung -->
  <rect width="840" height="260" rx="20" fill="url(#bg-stage)" stroke="#334155" stroke-width="4"/>

  <!-- Judul Banner Panggung -->
  <text x="420" y="38" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#f8fafc" text-anchor="middle" letter-spacing="2">PARADE HEWAN PELIHARAAN (PET) — PETUALANGAN PELAJAR</text>
  <text x="420" y="58" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="500" fill="#94a3b8" text-anchor="middle">Koleksi Karakter Kosmetik Vektor Resmi & Efek Pasif RPG Battle Engine</text>

  <!-- LANTAI PODIUM & 7 PET -->
  <!-- 1. Kucing Oren (x: 60) -->
  <g transform="translate(60 140)">
    <ellipse cx="0" cy="45" rx="36" ry="10" fill="url(#podium-metal)"/>
    <ellipse cx="0" cy="45" rx="26" ry="6" fill="#020617" opacity="0.6"/>
    <image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f431.svg" x="-28" y="-15" width="56" height="56"/>
    <rect x="-42" y="54" width="84" height="20" rx="10" fill="#f59e0b"/>
    <text x="0" y="68" font-family="sans-serif" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">🐱 Kucing</text>
  </g>

  <!-- 2. Anjing Ceria (x: 180) -->
  <g transform="translate(180 140)">
    <ellipse cx="0" cy="45" rx="36" ry="10" fill="url(#podium-metal)"/>
    <ellipse cx="0" cy="45" rx="26" ry="6" fill="#020617" opacity="0.6"/>
    <image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f436.svg" x="-28" y="-15" width="56" height="56"/>
    <rect x="-42" y="54" width="84" height="20" rx="10" fill="#3b82f6"/>
    <text x="0" y="68" font-family="sans-serif" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">🐶 Anjing</text>
  </g>

  <!-- 3. Pinguin Lucu (x: 300) -->
  <g transform="translate(300 140)">
    <ellipse cx="0" cy="45" rx="36" ry="10" fill="url(#podium-metal)"/>
    <ellipse cx="0" cy="45" rx="26" ry="6" fill="#020617" opacity="0.6"/>
    <circle cx="0" cy="10" r="30" fill="#06b6d4" opacity="0.25"/>
    <image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f427.svg" x="-28" y="-15" width="56" height="56"/>
    <rect x="-42" y="54" width="84" height="20" rx="10" fill="#06b6d4"/>
    <text x="0" y="68" font-family="sans-serif" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">🐧 Pinguin</text>
  </g>

  <!-- 4. Rubah Cerdik (x: 420) -->
  <g transform="translate(420 140)">
    <ellipse cx="0" cy="45" rx="36" ry="10" fill="url(#podium-metal)"/>
    <ellipse cx="0" cy="45" rx="26" ry="6" fill="#020617" opacity="0.6"/>
    <circle cx="0" cy="10" r="30" fill="#ea580c" opacity="0.25"/>
    <image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f98a.svg" x="-28" y="-15" width="56" height="56"/>
    <rect x="-42" y="54" width="84" height="20" rx="10" fill="#ea580c"/>
    <text x="0" y="68" font-family="sans-serif" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">🦊 Rubah</text>
  </g>

  <!-- 5. Burung Hantu (x: 540) -->
  <g transform="translate(540 140)">
    <ellipse cx="0" cy="45" rx="36" ry="10" fill="url(#podium-metal)"/>
    <ellipse cx="0" cy="45" rx="26" ry="6" fill="#020617" opacity="0.6"/>
    <circle cx="0" cy="10" r="32" fill="#8b5cf6" opacity="0.3"/>
    <image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f989.svg" x="-28" y="-15" width="56" height="56"/>
    <rect x="-42" y="54" width="84" height="20" rx="10" fill="#8b5cf6"/>
    <text x="0" y="68" font-family="sans-serif" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">🦉 Burung Hantu</text>
  </g>

  <!-- 6. Anak Naga Langit (x: 660) -->
  <g transform="translate(660 140)">
    <ellipse cx="0" cy="45" rx="40" ry="11" fill="#78350f" stroke="#fbbf24" stroke-width="1.5"/>
    <circle cx="0" cy="10" r="38" fill="url(#aura-gold)"/>
    <image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f432.svg" x="-32" y="-20" width="64" height="64"/>
    <rect x="-46" y="54" width="92" height="20" rx="10" fill="#eab308"/>
    <text x="0" y="68" font-family="sans-serif" font-size="10" font-weight="800" fill="#1e1b4b" text-anchor="middle">👑 🐲 Naga</text>
  </g>

  <!-- 7. Bayi Burung Phoenix (x: 770) -->
  <g transform="translate(770 140)">
    <ellipse cx="0" cy="45" rx="40" ry="11" fill="#7f1d1d" stroke="#f87171" stroke-width="1.5"/>
    <circle cx="0" cy="10" r="38" fill="#ef4444" opacity="0.35"/>
    <image href="https://cdn.jsdelivr.net/npm/@twemoji/svg@latest/1f985.svg" x="-32" y="-20" width="64" height="64"/>
    <rect x="-46" y="54" width="92" height="20" rx="10" fill="#ef4444"/>
    <text x="0" y="68" font-family="sans-serif" font-size="10" font-weight="800" fill="#fff" text-anchor="middle">👑 🦅 Phoenix</text>
  </g>
</svg>
```

---

## 11. Panduan Integrasi Mesin Visual & Kode CSS Animasi

Agar seluruh efek visual pet berjalan dengan mulus di peramban web pemain (*mobile & desktop*), berikut adalah deklarasi CSS yang digunakan oleh game pada `public/css/avatar.css`:

```css
/* Animasi Melayang Ringan untuk Pet Tier Tinggi */
.fx-float-sm {
  animation: petFloat 2.6s ease-in-out infinite alternate;
}

@keyframes petFloat {
  0% {
    transform: translateY(0px);
  }
  100% {
    transform: translateY(-4px);
  }
}

/* Denyut Aura Rarity Tier */
.fx-pulse {
  animation: auraPulse 2.0s ease-in-out infinite alternate;
  transform-origin: 32px 160px;
}

@keyframes auraPulse {
  0% {
    transform: scale(0.92);
    opacity: 0.65;
  }
  100% {
    transform: scale(1.08);
    opacity: 0.95;
  }
}

/* Partikel Bintang Berkedip Tier Legenda (Naga) */
.fx-twinkle {
  animation: starTwinkle 1.5s ease-in-out infinite alternate;
  transform-origin: center;
}

@keyframes starTwinkle {
  0% {
    opacity: 0.2;
    transform: scale(0.6) rotate(0deg);
  }
  50% {
    opacity: 1.0;
    transform: scale(1.2) rotate(45deg);
  }
  100% {
    opacity: 0.4;
    transform: scale(0.8) rotate(90deg);
  }
}

/* Partikel Bara Api Melayang Tier Legenda (Phoenix) */
.fx-rise {
  animation: emberRise 2.2s linear infinite;
}

@keyframes emberRise {
  0% {
    opacity: 0;
    transform: translateY(0px) scale(0.5);
  }
  40% {
    opacity: 1;
    transform: translateY(-8px) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px) scale(0.3);
  }
}
```

---
*Dokumen Disusun & Diekspor dari Basis Data Game: Petualangan Pelajar (https://play.printshare.my.id/)*  
*Tanggal: 7 November 2026* 🚀🐾
