# ⚡ DESAIN & KODE LENGKAP SVG SELURUH SKILL RPG & JURUS BOS
**Game**: *Petualangan Pelajar* ([https://play.printshare.my.id/](https://play.printshare.my.id/))  
**Target File**: `DESIGN_SVG_SEMUA_SKILL_PETUALANGAN_PELAJAR.md`  
**Kategori**: Desain Grafis Vektor SVG, Desain Antarmuka Pertempuran (Battle UI), Partikel Efek & Sistem Skill RPG  
**Total Skill Pemain**: **10 Skill Aktif RPG** (Level 1 s/d Level 5)  
**Total Jurus Elemen Bos**: **10 Jurus Elemen Bos Monster**  
**Versi Mesin Visual**: Skill Vector Engine v7.2 (W3C Scalable Vector Graphics 1.1)

---

## 📖 DAFTAR ISI
1. [Arsitektur Visual & Sistem Ikonografi Skill SVG](#1-arsitektur-visual--sistem-ikonografi-skill-svg)
2. [Tabel Komparasi & Katalog Seluruh 10 Skill Pemain](#2-tabel-komparasi--katalog-seluruh-10-skill-pemain)
3. [Desain SVG Skill 1: Coret Satu (eliminate_one)](#3-desain-svg-skill-1-coret-satu-eliminate_one)
4. [Desain SVG Skill 2: Mata Elang (eagle_eye)](#4-desain-svg-skill-2-mata-elang-eagle_eye)
5. [Desain SVG Skill 3: Ramuan Hijau (heal)](#5-desain-svg-skill-3-ramuan-hijau-heal)
6. [Desain SVG Skill 4: Perisai Kayu (shield)](#6-desain-svg-skill-4-perisai-kayu-shield)
7. [Desain SVG Skill 5: Tebasan Super (power_strike)](#7-desain-svg-skill-5-tebasan-super-power_strike)
8. [Desain SVG Skill 6: Waktu Beku (time_freeze)](#8-desain-svg-skill-6-waktu-beku-time_freeze)
9. [Desain SVG Skill 7: Penjaga Combo (combo_keeper)](#9-desain-svg-skill-7-penjaga-combo-combo_keeper)
10. [Desain SVG Skill 8: Kantong Hoki (lucky_pouch)](#10-desain-svg-skill-8-kantong-hoki-lucky_pouch)
11. [Desain SVG Skill 9: Jimat Keberuntungan (second_chance)](#11-desain-svg-skill-9-jimat-keberuntungan-second_chance)
12. [Desain SVG Skill 10: Ramuan Merah (red_potion)](#12-desain-svg-skill-10-ramuan-merah-red_potion)
13. [Katalog & Desain SVG 10 Jurus Elemen Bos Monster](#13-katalog--desain-svg-10-jurus-elemen-bos-monster)
14. [Grand Showcase: Panggung Parade Seluruh Skill dalam 1 Kanvas SVG](#14-grand-showcase-panggung-parade-seluruh-skill-dalam-1-kanvas-svg)
15. [Panduan Integrasi Mesin Visual & Kode CSS Animasi](#15-panduan-integrasi-mesin-visual--kode-css-animasi)

---

## 1. Arsitektur Visual & Sistem Ikonografi Skill SVG

Di dalam sistem pertempuran *Petualangan Pelajar* ([`public/js/app.js`](file:///home/maman/play/public/js/app.js) dan [`shared/economy.js`](file:///home/maman/play/shared/economy.js)), pemain membawa hingga 3 skill aktif dalam loadout pertempuran.

Sebelumnya, antarmuka game menggunakan karakter emoji sistem (seperti ✏️, 🦅, 🧪, 🛡️, ⚔️, ❄️, 🔥, 💰, 🍀, 🍷) yang tampilannya bervariasi bergantung pada jenis perangkat dan sistem operasi pemain. Dokumen ini menghadirkan **Desain Vektor SVG Resolusi Bebas (Lossless Vector Art)** resmi dengan palet warna konsisten, efek gradien premium, bayangan dinamis, serta partikel magis.

### Spesifikasi Teknis Desain:
- **Taraf Sudut Pandang (ViewBox Standalone Card)**: `0 0 160 160` (Format Kartu Koleksi / Modal Detail Skill)
- **Taraf Sudut Pandang (ViewBox Battle Icon)**: `0 0 48 48` (Format Kompak Ikon Tombol Pertempuran)
- **Sistem Lapisan (Layered Architecture)**:
  1. **Layer 1 (Latar Lingkaran / Pelindung)**: Lingkaran berpendar dengan gradien warna elemen tema skill.
  2. **Layer 2 (Aura Berdenyut & Partikel)**: Cahaya lembut radial glow + partikel sihir mengambang.
  3. **Layer 3 (Objek Utama Geometri Vektor)**: Gambar simbolik skill utama dengan pencahayaan 3D bertepi tegas (*drop-shadow* dan *specular highlights*).
  4. **Layer 4 (Lencana & Aksentuasi Elemen)**: Kristal energi, kilatan cahaya, atau segel kekuatan.

---

## 2. Tabel Komparasi & Katalog Seluruh 10 Skill Pemain

| No | ID Skill | Nama Skill | Ikon Lama | Tema Elemen & Warna | Syarat Buka | Biaya Energi | Batas Pakai | Fokus Efek Utama RPG |
|:---:|:---|:---|:---:|:---|:---:|:---:|:---:|:---|
| 1 | `eliminate_one` | **Coret Satu** | ✏️ | *Slate Cyan & Crimson* | Lv. 1 (Starter) | 1 ⚡ | 3–5× | Coret 1 pilihan jawaban salah (1–2× gratis di Lv.3+) |
| 2 | `eagle_eye` | **Mata Elang** | 🦅 | *Solar Gold & Electric Azure* | Lv. 1 (Starter) | 1–2 ⚡ | 2–4× | Coret 2 pilihan jawaban salah sekaligus |
| 3 | `heal` | **Ramuan Hijau** | 🧪 | *Emerald Life & Mint Leaf* | Lv. 1 (Starter) | 1 ⚡ | 2–3× | Pulihkan +25 s/d +65 HP seketika saat terdesak |
| 4 | `shield` | **Perisai Kayu** | 🛡️ | *Iron Oak & Forcefield Cyan* | Lv. 2 | 2 ⚡ | 2–4× | Bentengi pemain, serap 20 s/d 60 damage serangan bos |
| 5 | `power_strike` | **Tebasan Super** | ⚔️ | *Blazing Crimson & Sunfire* | Lv. 3 | 2–3 ⚡ | 2–3× | Lipatgandakan damage serangan ke bos ×2.0 s/d ×3.0 |
| 6 | `time_freeze` | **Waktu Beku** | ❄️ | *Glacial Cyan & Deep Frost* | Lv. 4 | 2–3 ⚡ | 2–4× | Bekukan waktu, tambah +8 s/d +16 detik waktu berpikir |
| 7 | `combo_keeper` | **Penjaga Combo** | 🔥 | *Infernal Flame & Violet Core* | Lv. 5 | 1–2 ⚡ | 1–3× | Rantai kombo tidak reset saat 1x salah/timeout |
| 8 | `lucky_pouch` | **Kantong Hoki** | 💰 | *Imperial Gold & Ruby Silk* | Lv. 6 | 2 ⚡ | 1–2× | Sisa laga: Peluang drop koin ×2, jumlah koin ×1.5 s/d ×2.5 |
| 9 | `second_chance` | **Jimat Keberuntungan** | 🍀 | *Lucky Clover Jade & Aureolin* | Lv. 8 | 3–4 ⚡ | 1–2× | Kesempatan kedua: Boleh jawab ulang tanpa terkena damage |
| 10 | `red_potion` | **Ramuan Merah** | 🍷 | *Ruby Blood & Explosion Orange*| Lv. 5 | 2–3 ⚡ | 1–2× | Lewati soal sulit ➔ ganti soal termudah & Damage ×3 s/d ×5 |

---

## 3. Desain SVG Skill 1: Coret Satu (`eliminate_one`)

```
  ✏️  ==============================================================
  📜  Coret Satu (Magic Strike Out)
  🏷️  ID: eliminate_one | Starter: Ya | Biaya Energi: 1 ⚡
  🌟  Filosofi Visual: Pensil bulu sihir berbingkai emas yang menggoreskan 
      garis silang neon bercahaya merah di atas lembaran kertas gulung kuno.
  ==================================================================
```

### A. Kode SVG Standalone Card (160x160)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Skill Coret Satu">
  <defs>
    <radialGradient id="bg-elim" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
      <stop offset="70%" stop-color="#0284c7" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.85"/>
    </radialGradient>
    <linearGradient id="pencil-body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <linearGradient id="strike-glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="50%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
    <filter id="glow-elim" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Latar Belakang Kartu Bulat -->
  <rect width="160" height="160" rx="32" fill="#0b1329" stroke="#0284c7" stroke-width="3"/>
  <circle cx="80" cy="80" r="68" fill="url(#bg-elim)"/>
  <circle cx="80" cy="80" r="68" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6"/>

  <!-- Kertas Gulung / Lembaran Jawaban di Belakang -->
  <g transform="translate(42 42)">
    <rect x="0" y="0" width="76" height="76" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="2.5" opacity="0.95"/>
    <!-- Baris Teks Jawaban -->
    <line x1="14" y1="20" x2="62" y2="20" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
    <line x1="14" y1="36" x2="48" y2="36" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
    <line x1="14" y1="52" x2="58" y2="52" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>

    <!-- Coretan Silang Merah Neon Berpendar (Pemusnah Jawaban Salah) -->
    <path d="M10 14 L66 62 M66 14 L10 62" stroke="url(#strike-glow)" stroke-width="6" stroke-linecap="round" filter="url(#glow-elim)"/>
  </g>

  <!-- Pensil Magis Emas Mengambang -->
  <g transform="translate(85 25) rotate(24)">
    <!-- Penghapus -->
    <rect x="10" y="0" width="14" height="10" rx="3" fill="#f472b6" stroke="#9d174d" stroke-width="1.5"/>
    <!-- Cincin Logam -->
    <rect x="10" y="10" width="14" height="6" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>
    <!-- Batang Pensil -->
    <rect x="10" y="16" width="14" height="42" fill="url(#pencil-body)" stroke="#854d0e" stroke-width="1.5"/>
    <!-- Ujung Kayu -->
    <polygon points="10,58 24,58 17,74" fill="#fed7aa" stroke="#c2410c" stroke-width="1"/>
    <!-- Ujung Grafit Hitam -->
    <polygon points="15,69 19,69 17,74" fill="#0f172a"/>
    <!-- Kilatan Sihir Bintang di Ujung Pensil -->
    <circle cx="17" cy="76" r="3" fill="#38bdf8" filter="url(#glow-elim)"/>
  </g>

  <!-- Lencana Biaya Energi Pojok Kiri Atas -->
  <rect x="12" y="12" width="36" height="20" rx="10" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="30" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle">⚡1</text>
</svg>
```

### B. Kode Vektor Kompak Tombol Battle (48x48)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Coret Satu">
  <defs>
    <linearGradient id="el-b-pencil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#eab308"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
  <!-- Baris Soal & Garis Coret Merah -->
  <rect x="10" y="10" width="28" height="28" rx="5" fill="#f8fafc"/>
  <line x1="14" y1="18" x2="34" y2="18" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="14" y1="24" x2="28" y2="24" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="14" y1="30" x2="32" y2="30" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M12 14 L36 34 M36 14 L12 34" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Pensil Ikonik -->
  <path d="M30 6 L40 16 L22 34 L12 34 L12 24 Z" fill="url(#el-b-pencil)" stroke="#854d0e" stroke-width="1.2"/>
</svg>
```

---

## 4. Desain SVG Skill 2: Mata Elang (`eagle_eye`)

```
  🦅  ==============================================================
  📜  Mata Elang (Eagle's Gaze)
  🏷️  ID: eagle_eye | Starter: Ya | Biaya Energi: 1–2 ⚡
  🌟  Filosofi Visual: Mata elang emas mistis yang tajam dengan iris biru 
      safir elektrik, dikelilingi oleh lensa bidik emas futuristik.
  ==================================================================
```

### A. Kode SVG Standalone Card (160x160)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Skill Mata Elang">
  <defs>
    <radialGradient id="bg-eagle" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.35"/>
      <stop offset="65%" stop-color="#b45309" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9"/>
    </radialGradient>
    <linearGradient id="eye-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <radialGradient id="iris-glow" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="50%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#0e7490"/>
    </radialGradient>
    <filter id="glow-eagle">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Latar Belakang Kartu Bulat -->
  <rect width="160" height="160" rx="32" fill="#091024" stroke="#f59e0b" stroke-width="3"/>
  <circle cx="80" cy="80" r="68" fill="url(#bg-eagle)"/>

  <!-- Cincin Lensa Bidik (Target Crosshairs) -->
  <circle cx="80" cy="80" r="54" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="16 8" opacity="0.75"/>
  <circle cx="80" cy="80" r="42" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.6"/>
  <!-- Sumbu Bidik Target -->
  <line x1="80" y1="20" x2="80" y2="35" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
  <line x1="80" y1="125" x2="80" y2="140" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
  <line x1="20" y1="80" x2="35" y2="80" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
  <line x1="125" y1="80" x2="140" y2="80" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>

  <!-- Siluet Sayap Elang Stylized -->
  <path d="M26 82 C38 65, 58 55, 80 55 C102 55, 122 65, 134 82 C120 74, 98 70, 80 70 C62 70, 40 74, 26 82 Z" fill="#b45309" opacity="0.5"/>

  <!-- Kelopak & Mata Elang Emas -->
  <g filter="url(#glow-eagle)">
    <!-- Kontur Mata -->
    <path d="M30 80 Q80 44 130 80 Q80 116 30 80 Z" fill="#1e1b4b" stroke="url(#eye-gold)" stroke-width="4"/>
    <!-- Bola Mata Putih Kekuningan -->
    <ellipse cx="80" cy="80" rx="28" ry="24" fill="#fef9c3"/>
    <!-- Iris Biru Bersinar Tajam -->
    <circle cx="80" cy="80" r="18" fill="url(#iris-glow)"/>
    <!-- Pupil Vertikal Tajam Elang -->
    <ellipse cx="80" cy="80" rx="6" ry="15" fill="#020617"/>
    <!-- Sorot Pantulan Cahaya (Specular Highlights) -->
    <circle cx="75" cy="74" r="4" fill="#ffffff" opacity="0.9"/>
    <circle cx="85" cy="84" r="2" fill="#ffffff" opacity="0.7"/>
  </g>

  <!-- Angka 2X Pelipat Ganda Efek -->
  <rect x="110" y="14" width="38" height="20" rx="10" fill="#dc2626" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="129" y="28" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle">×2 ❌</text>

  <!-- Lencana Biaya Energi -->
  <rect x="12" y="12" width="36" height="20" rx="10" fill="#b45309" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="30" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle">⚡2</text>
</svg>
```

### B. Kode Vektor Kompak Tombol Battle (48x48)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Mata Elang">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
  <!-- Lingkaran Bidik -->
  <circle cx="24" cy="24" r="16" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.7"/>
  <!-- Mata Elang Tajam -->
  <path d="M8 24 Q24 12 40 24 Q24 36 8 24 Z" fill="#1e1b4b" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="24" cy="24" r="8" fill="#06b6d4"/>
  <ellipse cx="24" cy="24" rx="3" ry="7" fill="#020617"/>
  <circle cx="22" cy="22" r="1.5" fill="#ffffff"/>
  <!-- Garis Bidik -->
  <line x1="24" y1="4" x2="24" y2="8" stroke="#f59e0b" stroke-width="2"/>
  <line x1="24" y1="40" x2="24" y2="44" stroke="#f59e0b" stroke-width="2"/>
</svg>
```

---

## 5. Desain SVG Skill 3: Ramuan Hijau (`heal`)

```
  🧪  ==============================================================
  📜  Ramuan Hijau (Elixir of Vitality)
  🏷️  ID: heal | Starter: Ya | Biaya Energi: 1 ⚡
  🌟  Filosofi Visual: Botol labu ramuan kaca bening berisi cairan zamrud 
      berbuih, diikat pita kulit dan daun bertunas dengan kilauan salib pulih.
  ==================================================================
```

### A. Kode SVG Standalone Card (160x160)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Skill Ramuan Hijau">
  <defs>
    <radialGradient id="bg-heal" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#22c55e" stop-opacity="0.4"/>
      <stop offset="70%" stop-color="#15803d" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#052e16" stop-opacity="0.9"/>
    </radialGradient>
    <linearGradient id="potion-liquid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="50%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="flask-glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="25%" stop-color="#a7f3d0" stop-opacity="0.15"/>
      <stop offset="75%" stop-color="#6ee7b7" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.4"/>
    </linearGradient>
    <filter id="glow-heal">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Latar Belakang Kartu Bulat -->
  <rect width="160" height="160" rx="32" fill="#041f11" stroke="#22c55e" stroke-width="3"/>
  <circle cx="80" cy="80" r="68" fill="url(#bg-heal)"/>

  <!-- Salib Pemulihan Berkilau di Latar Belakang -->
  <g opacity="0.3" filter="url(#glow-heal)">
    <rect x="74" y="28" width="12" height="40" rx="4" fill="#4ade80"/>
    <rect x="60" y="42" width="40" height="12" rx="4" fill="#4ade80"/>
  </g>

  <!-- Botol Labu Ramuan (Flask Potion) -->
  <g transform="translate(80 88)">
    <!-- Bayangan Bawah Botol -->
    <ellipse cx="0" cy="38" rx="34" ry="9" fill="#022c14" opacity="0.6"/>

    <!-- Bentuk Cairan Ramuan Dalam Kaca -->
    <path d="M-28 20 C-28 36, -16 42, 0 42 C16 42, 28 36, 28 20 C28 4, 18 -10, 10 -22 L-10 -22 C-18 -10, -28 4, -28 20 Z" fill="url(#potion-liquid)"/>

    <!-- Gelembung-gelembung Udara Aktif -->
    <circle cx="-12" cy="18" r="4" fill="#bbf7d0" opacity="0.7"/>
    <circle cx="10" cy="26" r="3" fill="#bbf7d0" opacity="0.6"/>
    <circle cx="2" cy="8" r="5" fill="#bbf7d0" opacity="0.8"/>
    <circle cx="-6" cy="-4" r="2.5" fill="#bbf7d0" opacity="0.75"/>

    <!-- Badan Kaca Labu Transparan -->
    <path d="M-30 20 C-30 40, -18 46, 0 46 C18 46, 30 40, 30 20 C30 2, 20 -14, 12 -28 L-12 -28 C-20 -14, -30 2, -30 20 Z" fill="url(#flask-glass)" stroke="#86efac" stroke-width="2.5"/>

    <!-- Leher & Mulut Botol Kaca -->
    <rect x="-14" y="-34" width="28" height="8" rx="2" fill="#d1fae5" stroke="#86efac" stroke-width="2"/>
    <rect x="-16" y="-38" width="32" height="6" rx="3" fill="#a7f3d0" stroke="#86efac" stroke-width="2"/>

    <!-- Sumbat Gabus Kayu Cokelat -->
    <polygon points="-12,-38 12,-38 10,-48 -10,-48" fill="#b45309" stroke="#78350f" stroke-width="1.5"/>

    <!-- Tali Pengikat Leher Botol & Daun Herbal Kembar -->
    <rect x="-13" y="-30" width="26" height="3" fill="#92400e"/>
    <path d="M8 -28 Q22 -36 18 -46 Q8 -42 6 -30 Z" fill="#22c55e" stroke="#15803d" stroke-width="1.2"/>
    <path d="M-8 -28 Q-22 -36 -18 -46 Q-8 -42 -6 -30 Z" fill="#4ade80" stroke="#15803d" stroke-width="1.2"/>

    <!-- Kilatan Refleksi Kaca Melengkung (Specular Highlight) -->
    <path d="M-22 10 A24 24 0 0 1 -12 -12" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.75"/>
  </g>

  <!-- Lencana Biaya Energi -->
  <rect x="12" y="12" width="36" height="20" rx="10" fill="#15803d" stroke="#22c55e" stroke-width="1.5"/>
  <text x="30" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle">⚡1</text>
  <!-- Lencana HP Pulih -->
  <rect x="106" y="12" width="42" height="20" rx="10" fill="#16a34a" stroke="#86efac" stroke-width="1.5"/>
  <text x="127" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">+HP ❤️</text>
</svg>
```

### B. Kode Vektor Kompak Tombol Battle (48x48)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Ramuan Hijau">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#041f11" stroke="#22c55e" stroke-width="2"/>
  <!-- Botol Labu Ramuan -->
  <path d="M16 26 C16 36 20 40 24 40 C28 40 32 36 32 26 C32 18 27 12 26 8 L22 8 C21 12 16 18 16 26 Z" fill="#22c55e" stroke="#86efac" stroke-width="2"/>
  <!-- Tutup Gabus -->
  <rect x="21" y="4" width="6" height="5" rx="1" fill="#b45309"/>
  <!-- Salib Medis Putih -->
  <rect x="22" y="22" width="4" height="12" rx="1" fill="#ffffff"/>
  <rect x="18" y="26" width="12" height="4" rx="1" fill="#ffffff"/>
</svg>
```

---

## 6. Desain SVG Skill 4: Perisai Kayu (`shield`)

```
  🛡️  ==============================================================
  📜  Perisai Kayu (Aegis of the Forest)
  🏷️  ID: shield | Unlock: Level 2 | Biaya Energi: 2 ⚡
  🌟  Filosofi Visual: Perisai heksagonal kayu ulin berpelitur kokoh dengan 
      rangka pelindung baja bertatahkan permata dan medan gaya heksagon.
  ==================================================================
```

### A. Kode SVG Standalone Card (160x160)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Skill Perisai Kayu">
  <defs>
    <radialGradient id="bg-shield" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
      <stop offset="60%" stop-color="#0369a1" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#0c4a6e" stop-opacity="0.85"/>
    </radialGradient>
    <linearGradient id="shield-wood" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#92400e"/>
      <stop offset="35%" stop-color="#78350f"/>
      <stop offset="70%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="shield-steel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <filter id="glow-shield">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Latar Belakang Kartu Bulat -->
  <rect width="160" height="160" rx="32" fill="#082032" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="80" cy="80" r="68" fill="url(#bg-shield)"/>

  <!-- Kubah Medan Gaya Energi Heksagonal Transparan (Forcefield) -->
  <polygon points="80,18 132,48 132,112 80,142 28,112 28,48" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="6 4" opacity="0.6"/>
  <polygon points="80,26 124,52 124,108 80,134 36,108 36,52" fill="#0284c7" fill-opacity="0.1"/>

  <!-- Badan Utama Perisai Kayu & Bingkai Baja -->
  <g transform="translate(80 82)" filter="url(#glow-shield)">
    <!-- Lapisan Rangka Baja Luar -->
    <path d="M0 -50 L42 -30 C44 10, 36 38, 0 56 C-36 38, -44 10, -42 -30 Z" fill="url(#shield-steel)" stroke="#334155" stroke-width="2.5"/>

    <!-- Papan Kayu Ulin Bagian Dalam -->
    <path d="M0 -42 L34 -25 C36 8, 29 30, 0 46 C-29 30, -36 8, -34 -25 Z" fill="url(#shield-wood)" stroke="#291404" stroke-width="2"/>

    <!-- Garis Serat Kayu Vertikal -->
    <line x1="-12" y1="-30" x2="-12" y2="35" stroke="#451a03" stroke-width="2" opacity="0.6"/>
    <line x1="0" y1="-40" x2="0" y2="44" stroke="#451a03" stroke-width="2" opacity="0.6"/>
    <line x1="12" y1="-30" x2="12" y2="35" stroke="#451a03" stroke-width="2" opacity="0.6"/>

    <!-- Palang Baja Salib / Pelindung Tengah -->
    <path d="M-8 -42 L8 -42 L8 46 L-8 46 Z" fill="url(#shield-steel)" opacity="0.85"/>
    <path d="M-34 -10 L34 -10 L34 6 L-34 6 Z" fill="url(#shield-steel)" opacity="0.85"/>

    <!-- Permata Kristal Biru di Tengah Perisai -->
    <polygon points="0,-16 14,-2 0,12 -14,-2" fill="#38bdf8" stroke="#ffffff" stroke-width="1.8"/>

    <!-- Paku Keling Baja Sudut -->
    <circle cx="-32" cy="-22" r="2.5" fill="#f8fafc" stroke="#334155"/>
    <circle cx="32" cy="-22" r="2.5" fill="#f8fafc" stroke="#334155"/>
    <circle cx="0" cy="40" r="2.5" fill="#f8fafc" stroke="#334155"/>
  </g>

  <!-- Lencana Biaya Energi -->
  <rect x="12" y="12" width="36" height="20" rx="10" fill="#0369a1" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="30" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle">⚡2</text>
  <!-- Label Penyerapan -->
  <rect x="96" y="12" width="52" height="20" rx="10" fill="#0284c7" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="122" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="900" fill="#ffffff" text-anchor="middle">ABSORB</text>
</svg>
```

### B. Kode Vektor Kompak Tombol Battle (48x48)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Perisai Kayu">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#082032" stroke="#38bdf8" stroke-width="2"/>
  <!-- Perisai Ikonik -->
  <path d="M24 8 L38 15 C38 28 32 37 24 42 C16 37 10 28 10 15 Z" fill="#b45309" stroke="#94a3b8" stroke-width="2.5"/>
  <!-- Salib Logam & Permata -->
  <line x1="24" y1="12" x2="24" y2="38" stroke="#94a3b8" stroke-width="2"/>
  <line x1="14" y1="22" x2="34" y2="22" stroke="#94a3b8" stroke-width="2"/>
  <polygon points="24,18 28,22 24,26 20,22" fill="#38bdf8"/>
</svg>
```

---

## 7. Desain SVG Skill 5: Tebasan Super (`power_strike`)

```
  ⚔️  ==============================================================
  📜  Tebasan Super (Colossal Cross Slash)
  🏷️  ID: power_strike | Unlock: Level 3 | Biaya Energi: 2–3 ⚡
  🌟  Filosofi Visual: Dua pedang ksatria baja tajam bersilang, membara 
      dalam kobaran lidah api merah keemasan dengan busur tebasan energi.
  ==================================================================
```

### A. Kode SVG Standalone Card (160x160)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Skill Tebasan Super">
  <defs>
    <radialGradient id="bg-strike" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="#b91c1c" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#180404" stop-opacity="0.9"/>
    </radialGradient>
    <linearGradient id="blade-steel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <linearGradient id="flame-grad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="40%" stop-color="#f97316"/>
      <stop offset="80%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <filter id="glow-strike">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Latar Belakang Kartu Bulat -->
  <rect width="160" height="160" rx="32" fill="#200505" stroke="#ef4444" stroke-width="3"/>
  <circle cx="80" cy="80" r="68" fill="url(#bg-strike)"/>

  <!-- Busur Energi Tebasan Tajam (Slash Arcs) -->
  <path d="M20 140 Q80 20 140 20" stroke="#fef08a" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.85" filter="url(#glow-strike)"/>
  <path d="M140 140 Q80 20 20 20" stroke="#f97316" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.85" filter="url(#glow-strike)"/>

  <!-- Kobaran Lidah Api di Tengah Persilangan -->
  <path d="M80 115 C60 100, 55 75, 70 58 C72 70, 78 72, 80 50 C86 68, 92 68, 94 58 C108 75, 102 100, 80 115 Z" fill="url(#flame-grad)" opacity="0.9" filter="url(#glow-strike)"/>

  <!-- Pedang Ksatria 1 (Miring Kiri Bawah ke Kanan Atas) -->
  <g transform="translate(80 80) rotate(-45)">
    <!-- Gagang & Pommel -->
    <circle cx="0" cy="52" r="5" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
    <rect x="-3" y="38" width="6" height="14" rx="2" fill="#78350f"/>
    <rect x="-14" y="34" width="28" height="5" rx="2.5" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
    <!-- Bilah Pedang Baja -->
    <polygon points="-6,34 0,-56 6,34" fill="url(#blade-steel)" stroke="#475569" stroke-width="1.5"/>
    <line x1="0" y1="34" x2="0" y2="-52" stroke="#94a3b8" stroke-width="1.5"/>
  </g>

  <!-- Pedang Ksatria 2 (Miring Kanan Bawah ke Kiri Atas) -->
  <g transform="translate(80 80) rotate(45)">
    <!-- Gagang & Pommel -->
    <circle cx="0" cy="52" r="5" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
    <rect x="-3" y="38" width="6" height="14" rx="2" fill="#78350f"/>
    <rect x="-14" y="34" width="28" height="5" rx="2.5" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
    <!-- Bilah Pedang Baja -->
    <polygon points="-6,34 0,-56 6,34" fill="url(#blade-steel)" stroke="#475569" stroke-width="1.5"/>
    <line x1="0" y1="34" x2="0" y2="-52" stroke="#94a3b8" stroke-width="1.5"/>
  </g>

  <!-- Letupan Kilau Titik Tengah -->
  <circle cx="80" cy="80" r="7" fill="#ffffff" filter="url(#glow-strike)"/>

  <!-- Lencana Biaya Energi -->
  <rect x="12" y="12" width="36" height="20" rx="10" fill="#b91c1c" stroke="#ef4444" stroke-width="1.5"/>
  <text x="30" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle">⚡3</text>
  <!-- Lencana Multiplier Damage -->
  <rect x="100" y="12" width="48" height="20" rx="10" fill="#dc2626" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="124" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">×2.5 💥</text>
</svg>
```

### B. Kode Vektor Kompak Tombol Battle (48x48)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Tebasan Super">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#200505" stroke="#ef4444" stroke-width="2"/>
  <!-- Kilatan Busur -->
  <path d="M8 40 Q24 8 40 8" stroke="#fef08a" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Pedang Silang 1 -->
  <line x1="10" y1="38" x2="36" y2="10" stroke="#f8fafc" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Pedang Silang 2 -->
  <line x1="38" y1="38" x2="12" y2="10" stroke="#f8fafc" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Api & Kilatan Pusat -->
  <circle cx="24" cy="24" r="5" fill="#f97316"/>
  <circle cx="24" cy="24" r="2.5" fill="#ffffff"/>
</svg>
```


---

## 8. Desain SVG Skill 6: Waktu Beku (`time_freeze`)

```
  ❄️  ==============================================================
  📜  Waktu Beku (Glacial Chrono Stasis)
  🏷️  ID: time_freeze | Unlock: Level 4 | Biaya Energi: 2–3 ⚡
  🌟  Filosofi Visual: Jam pasir kristal es berbingkai ornamen perak es, 
      pasir waktu berhenti melayang dikelilingi kepingan salju membeku.
  ==================================================================
```

### A. Kode SVG Standalone Card (160x160)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Skill Waktu Beku">
  <defs>
    <radialGradient id="bg-freeze" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.45"/>
      <stop offset="65%" stop-color="#0284c7" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#082f49" stop-opacity="0.9"/>
    </radialGradient>
    <linearGradient id="ice-frame" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="50%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <radialGradient id="sand-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>
    <filter id="glow-freeze">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Latar Belakang Kartu Bulat -->
  <rect width="160" height="160" rx="32" fill="#041624" stroke="#38bdf8" stroke-width="3"/>
  <circle cx="80" cy="80" r="68" fill="url(#bg-freeze)"/>

  <!-- Ornamen Kepingan Salju Es (Snowflakes) di Latar Belakang -->
  <g stroke="#7dd3fc" stroke-width="1.8" stroke-linecap="round" opacity="0.45" filter="url(#glow-freeze)">
    <!-- Snowflake Pojok Kiri Atas -->
    <g transform="translate(35 40) scale(0.6)">
      <line x1="-15" y1="0" x2="15" y2="0"/><line x1="0" y1="-15" x2="0" y2="15"/>
      <line x1="-11" y1="-11" x2="11" y2="11"/><line x1="-11" y1="11" x2="11" y2="-11"/>
    </g>
    <!-- Snowflake Pojok Kanan Bawah -->
    <g transform="translate(125 120) scale(0.6)">
      <line x1="-15" y1="0" x2="15" y2="0"/><line x1="0" y1="-15" x2="0" y2="15"/>
      <line x1="-11" y1="-11" x2="11" y2="11"/><line x1="-11" y1="11" x2="11" y2="-11"/>
    </g>
  </g>

  <!-- Jam Pasir Es Mengambang (Chrono Hourglass) -->
  <g transform="translate(80 80)" filter="url(#glow-freeze)">
    <!-- Tabung Kaca Jam Pasir Berbentuk Angka 8 -->
    <path d="M-24 -36 L24 -36 C22 -14, 6 -4, 4 0 C6 4, 22 14, 24 36 L-24 36 C-22 14, -6 4, -4 0 C-6 -4, -22 -14, -24 -36 Z" fill="#0284c7" fill-opacity="0.25" stroke="#bae6fd" stroke-width="2.5"/>

    <!-- Pasir Kristal Biru Membeku di Wadah Bawah & Atas -->
    <path d="M-18 -32 L18 -32 C16 -18, 8 -10, 0 -6 C-8 -10, -16 -18, -18 -32 Z" fill="url(#sand-glow)"/>
    <path d="M-20 32 L20 32 C18 20, 8 10, 0 8 C-8 10, -18 20, -20 32 Z" fill="url(#sand-glow)"/>

    <!-- Butiran Pasir Beku Melayang Diam di Tengah -->
    <circle cx="0" cy="0" r="2.5" fill="#ffffff"/>
    <circle cx="0" cy="-3" r="1.5" fill="#e0f2fe"/>
    <circle cx="0" cy="3" r="1.5" fill="#e0f2fe"/>

    <!-- Penutup Jam Pasir Atas & Bawah Berornamen Kristal Es -->
    <rect x="-30" y="-44" width="60" height="9" rx="3" fill="url(#ice-frame)" stroke="#0284c7" stroke-width="1.5"/>
    <polygon points="-30,-44 30,-44 0,-54" fill="#bae6fd" opacity="0.6"/>
    <rect x="-30" y="35" width="60" height="9" rx="3" fill="url(#ice-frame)" stroke="#0284c7" stroke-width="1.5"/>
    <polygon points="-30,44 30,44 0,54" fill="#bae6fd" opacity="0.6"/>

    <!-- Pilar Samping Jam Pasir Kristal -->
    <line x1="-26" y1="-44" x2="-26" y2="44" stroke="url(#ice-frame)" stroke-width="3" stroke-linecap="round"/>
    <line x1="26" y1="-44" x2="26" y2="44" stroke="url(#ice-frame)" stroke-width="3" stroke-linecap="round"/>

    <!-- Kilatan Pantulan Cahaya Kaca -->
    <path d="M-18 -26 A16 16 0 0 1 -6 -10" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.8"/>
  </g>

  <!-- Lencana Biaya Energi -->
  <rect x="12" y="12" width="36" height="20" rx="10" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="30" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle">⚡3</text>
  <!-- Lencana Tambahan Detik Waktu -->
  <rect x="100" y="12" width="48" height="20" rx="10" fill="#0369a1" stroke="#7dd3fc" stroke-width="1.5"/>
  <text x="124" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">+12s ⏳</text>
</svg>
```

### B. Kode Vektor Kompak Tombol Battle (48x48)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Waktu Beku">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#041624" stroke="#38bdf8" stroke-width="2"/>
  <!-- Jam Pasir Sederhana -->
  <path d="M16 12 L32 12 L25 24 L32 36 L16 36 L23 24 Z" fill="#0284c7" stroke="#bae6fd" stroke-width="2"/>
  <rect x="14" y="10" width="20" height="3" rx="1" fill="#e0f2fe"/>
  <rect x="14" y="35" width="20" height="3" rx="1" fill="#e0f2fe"/>
  <!-- Kepingan Salju Mini -->
  <circle cx="24" cy="24" r="2.5" fill="#ffffff"/>
  <line x1="24" y1="20" x2="24" y2="28" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="20" y1="24" x2="28" y2="24" stroke="#ffffff" stroke-width="1.5"/>
</svg>
```

---

## 9. Desain SVG Skill 7: Penjaga Combo (`combo_keeper`)

```
  🔥  ==============================================================
  📜  Penjaga Combo (Indomitable Flame & Aegis Chain)
  🏷️  ID: combo_keeper | Unlock: Level 5 | Biaya Energi: 1–2 ⚡
  🌟  Filosofi Visual: Rantai besi tempa mistis yang saling bertaut kuat 
      di tengah kobaran api suci berpendar oranye dan magenta pelindung.
  ==================================================================
```

### A. Kode SVG Standalone Card (160x160)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Skill Penjaga Combo">
  <defs>
    <radialGradient id="bg-combo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.45"/>
      <stop offset="65%" stop-color="#9333ea" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#1e102a" stop-opacity="0.9"/>
    </radialGradient>
    <linearGradient id="fire-shield-grad" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#9333ea"/>
      <stop offset="40%" stop-color="#f43f5e"/>
      <stop offset="75%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <linearGradient id="chain-metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <filter id="glow-combo">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Latar Belakang Kartu Bulat -->
  <rect width="160" height="160" rx="32" fill="#150824" stroke="#f97316" stroke-width="3"/>
  <circle cx="80" cy="80" r="68" fill="url(#bg-combo)"/>

  <!-- Lidah Api Pelindung Luar (Aura Kobaran) -->
  <g filter="url(#glow-combo)">
    <path d="M80 20 C95 40, 125 55, 125 88 C125 115, 105 136, 80 136 C55 136, 35 115, 35 88 C35 55, 65 40, 80 20 Z" fill="url(#fire-shield-grad)" opacity="0.85"/>
    <path d="M80 38 C90 52, 110 65, 110 90 C110 110, 95 125, 80 125 C65 125, 50 110, 50 90 C50 65, 70 52, 80 38 Z" fill="#1e102a"/>
  </g>

  <!-- Rantai Besi Pengunci Kombo Melingkar (Combo Chain Links) -->
  <g transform="translate(80 84)" stroke="url(#chain-metal)" stroke-width="6" stroke-linecap="round" fill="none">
    <!-- Mata Rantai Kiri -->
    <rect x="-34" y="-14" width="30" height="28" rx="10" stroke="url(#chain-metal)" stroke-width="5" fill="none"/>
    <!-- Mata Rantai Kanan -->
    <rect x="4" y="-14" width="30" height="28" rx="10" stroke="url(#chain-metal)" stroke-width="5" fill="none"/>
    <!-- Mata Rantai Pusat Pengait Vertikal -->
    <rect x="-14" y="-22" width="28" height="44" rx="12" stroke="#fef08a" stroke-width="5.5" fill="none" filter="url(#glow-combo)"/>
  </g>

  <!-- Teks COMBO & Lambang Gembok Pengaman -->
  <g transform="translate(80 84)">
    <!-- Inti Energi Tak Terputus -->
    <circle cx="0" cy="0" r="9" fill="#facc15" filter="url(#glow-combo)"/>
    <circle cx="0" cy="0" r="4" fill="#ffffff"/>
  </g>

  <!-- Lencana Biaya Energi -->
  <rect x="12" y="12" width="36" height="20" rx="10" fill="#9333ea" stroke="#f97316" stroke-width="1.5"/>
  <text x="30" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle">⚡2</text>
  <!-- Lencana Streak Shield -->
  <rect x="94" y="12" width="54" height="20" rx="10" fill="#c2410c" stroke="#fed7aa" stroke-width="1.5"/>
  <text x="121" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">STREAK 🔥</text>
</svg>
```

### B. Kode Vektor Kompak Tombol Battle (48x48)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Penjaga Combo">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#150824" stroke="#f97316" stroke-width="2"/>
  <!-- Api Kombo -->
  <path d="M24 10 C28 16, 36 20, 36 30 C36 38, 30 42, 24 42 C18 42, 12 38, 12 30 C12 20, 20 16, 24 10 Z" fill="#f97316"/>
  <path d="M24 20 C26 24, 30 26, 30 32 C30 36, 26 38, 24 38 C22 38, 18 36, 18 32 C18 26, 22 24, 24 20 Z" fill="#fef08a"/>
  <!-- Tautan Rantai Kunci -->
  <rect x="18" y="26" width="12" height="10" rx="3" fill="#150824" stroke="#ffffff" stroke-width="1.8"/>
  <circle cx="24" cy="31" r="1.5" fill="#ffffff"/>
</svg>
```

---

## 10. Desain SVG Skill 8: Kantong Hoki (`lucky_pouch`)

```
  💰  ==============================================================
  📜  Kantong Hoki (Fortune's Treasure Sack)
  🏷️  ID: lucky_pouch | Unlock: Level 6 | Biaya Energi: 2 ⚡
  🌟  Filosofi Visual: Kantong beludru merah berikat pita sutra emas, 
      menggelembung memancarkan koin emas murni bertabur kilauan bintang.
  ==================================================================
```

### A. Kode SVG Standalone Card (160x160)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Skill Kantong Hoki">
  <defs>
    <radialGradient id="bg-pouch" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#eab308" stop-opacity="0.45"/>
      <stop offset="65%" stop-color="#b45309" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#241103" stop-opacity="0.9"/>
    </radialGradient>
    <linearGradient id="pouch-red" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="50%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
    <linearGradient id="coin-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <filter id="glow-pouch">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Latar Belakang Kartu Bulat -->
  <rect width="160" height="160" rx="32" fill="#1e0c03" stroke="#eab308" stroke-width="3"/>
  <circle cx="80" cy="80" r="68" fill="url(#bg-pouch)"/>

  <!-- Kilatan Bintang-bintang Keberuntungan -->
  <g fill="#fef08a" opacity="0.8" filter="url(#glow-pouch)">
    <!-- Bintang Kiri Atas -->
    <path d="M42 45 L45 38 L48 45 L55 48 L48 51 L45 58 L42 51 L35 48 Z"/>
    <!-- Bintang Kanan Atas -->
    <path d="M115 42 L117 36 L119 42 L125 44 L119 46 L117 52 L115 46 L109 44 Z"/>
  </g>

  <!-- Koin-koin Emas Berhamburan dari Atas -->
  <g filter="url(#glow-pouch)">
    <!-- Koin Kiri -->
    <g transform="translate(56 60) rotate(-20)">
      <circle cx="0" cy="0" r="14" fill="url(#coin-gold)" stroke="#854d0e" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="10" fill="none" stroke="#fef08a" stroke-width="1.2"/>
      <text x="0" y="4.5" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#78350f" text-anchor="middle">$</text>
    </g>
    <!-- Koin Kanan -->
    <g transform="translate(104 62) rotate(20)">
      <circle cx="0" cy="0" r="14" fill="url(#coin-gold)" stroke="#854d0e" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="10" fill="none" stroke="#fef08a" stroke-width="1.2"/>
      <text x="0" y="4.5" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#78350f" text-anchor="middle">$</text>
    </g>
  </g>

  <!-- Badan Utama Kantong Hoki Merah (Money Bag) -->
  <g transform="translate(80 96)">
    <!-- Bayangan Bawah Kantong -->
    <ellipse cx="0" cy="38" rx="36" ry="10" fill="#0c0501" opacity="0.6"/>

    <!-- Pundi-pundi Menggelembung -->
    <path d="M-36 24 C-38 42, -22 46, 0 46 C22 46, 38 42, 36 24 C34 6, 22 -12, 14 -22 L-14 -22 C-22 -12, -34 6, -36 24 Z" fill="url(#pouch-red)" stroke="#991b1b" stroke-width="2.5"/>

    <!-- Kerutan Kain Atas Kantong (Frills) -->
    <polygon points="-16,-22 -24,-38 -10,-32 0,-40 10,-32 24,-38 16,-22" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>

    <!-- Tali Pengikat Sutra Emas -->
    <rect x="-18" y="-24" width="36" height="5" rx="2" fill="#facc15" stroke="#854d0e" stroke-width="1.2"/>
    <!-- Ujung Rumbai Tali Emas Menjuntai -->
    <path d="M-4 -20 L-10 -6 M4 -20 L10 -6" stroke="#facc15" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Emblem Simbol Koin Emas Pusat di Dada Kantong -->
    <circle cx="0" cy="18" r="16" fill="url(#coin-gold)" stroke="#854d0e" stroke-width="2" filter="url(#glow-pouch)"/>
    <circle cx="0" cy="18" r="12" fill="none" stroke="#fef08a" stroke-width="1.5"/>
    <text x="0" y="24" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="900" fill="#78350f" text-anchor="middle">🪙</text>
  </g>

  <!-- Lencana Biaya Energi -->
  <rect x="12" y="12" width="36" height="20" rx="10" fill="#b45309" stroke="#eab308" stroke-width="1.5"/>
  <text x="30" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle">⚡2</text>
  <!-- Lencana Koin Drop Booster -->
  <rect x="100" y="12" width="48" height="20" rx="10" fill="#ca8a04" stroke="#fef08a" stroke-width="1.5"/>
  <text x="124" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="900" fill="#ffffff" text-anchor="middle">COIN ×2</text>
</svg>
```

### B. Kode Vektor Kompak Tombol Battle (48x48)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Kantong Hoki">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#1e0c03" stroke="#eab308" stroke-width="2"/>
  <!-- Kantong Merah -->
  <path d="M14 26 C12 36 18 40 24 40 C30 40 36 36 34 26 C32 18 27 14 26 10 L22 10 C21 14 16 18 14 26 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
  <rect x="20" y="10" width="8" height="3" fill="#facc15"/>
  <!-- Koin Emas Tengah -->
  <circle cx="24" cy="27" r="6" fill="#eab308" stroke="#fef08a" stroke-width="1.2"/>
  <text x="24" y="30" font-family="sans-serif" font-size="8" font-weight="900" fill="#78350f" text-anchor="middle">$</text>
</svg>
```

---

## 11. Desain SVG Skill 9: Jimat Keberuntungan (`second_chance`)

```
  🍀  ==============================================================
  📜  Jimat Keberuntungan (Talisman of Second Destiny)
  🏷️  ID: second_chance | Unlock: Level 8 | Biaya Energi: 3–4 ⚡
  🌟  Filosofi Visual: Liontin giok hijau zamrud daun semanggi 4 helai 
      berbingkai emas filigree, memancarkan cincin pemutar waktu takdir.
  ==================================================================
```

### A. Kode SVG Standalone Card (160x160)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Skill Jimat Keberuntungan">
  <defs>
    <radialGradient id="bg-clover" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4ade80" stop-opacity="0.4"/>
      <stop offset="65%" stop-color="#16a34a" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#022c14" stop-opacity="0.9"/>
    </radialGradient>
    <linearGradient id="clover-leaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="50%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <linearGradient id="gold-filigree" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <filter id="glow-clover">
      <feGaussianBlur stdDeviation="3.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Latar Belakang Kartu Bulat -->
  <rect width="160" height="160" rx="32" fill="#031f0f" stroke="#22c55e" stroke-width="3"/>
  <circle cx="80" cy="80" r="68" fill="url(#bg-clover)"/>

  <!-- Cincin Putaran Waktu Takdir (Chrono Loop Reversal) -->
  <circle cx="80" cy="82" r="54" fill="none" stroke="url(#gold-filigree)" stroke-width="2" stroke-dasharray="14 6" opacity="0.7"/>
  <!-- Panah Memutar Balik Waktu di Lingkaran -->
  <polygon points="132,74 140,82 134,84" fill="#facc15"/>
  <polygon points="28,90 20,82 26,80" fill="#facc15"/>

  <!-- Rantai Gantung Liontin Emas -->
  <line x1="80" y1="18" x2="80" y2="38" stroke="url(#gold-filigree)" stroke-width="3" stroke-linecap="round"/>
  <circle cx="80" cy="40" r="5" fill="none" stroke="url(#gold-filigree)" stroke-width="2.5"/>

  <!-- Daun Semanggi 4 Helai Giok Mistis (Four-Leaf Clover) -->
  <g transform="translate(80 84)" filter="url(#glow-clover)">
    <!-- Daun Atas -->
    <path d="M0 0 C-16 -12, -18 -32, 0 -34 C18 -32, 16 -12, 0 0 Z" fill="url(#clover-leaf)" stroke="url(#gold-filigree)" stroke-width="2"/>
    <!-- Daun Kanan -->
    <path d="M0 0 C12 -16, 32 -18, 34 0 C32 18, 12 16, 0 0 Z" fill="url(#clover-leaf)" stroke="url(#gold-filigree)" stroke-width="2"/>
    <!-- Daun Bawah -->
    <path d="M0 0 C16 12, 18 32, 0 34 C-18 32, -16 12, 0 0 Z" fill="url(#clover-leaf)" stroke="url(#gold-filigree)" stroke-width="2"/>
    <!-- Daun Kiri -->
    <path d="M0 0 C-12 16, -32 18, -34 0 C-32 -18, -12 -16, 0 0 Z" fill="url(#clover-leaf)" stroke="url(#gold-filigree)" stroke-width="2"/>

    <!-- Tulang Daun & Garis Urat Halus -->
    <line x1="0" y1="-2" x2="0" y2="-24" stroke="#86efac" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="2" y1="0" x2="24" y2="0" stroke="#86efac" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="0" y1="2" x2="0" y2="24" stroke="#86efac" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="-2" y1="0" x2="-24" y2="0" stroke="#86efac" stroke-width="1.5" stroke-linecap="round"/>

    <!-- Tangkai Semanggi Melengkung Bawah -->
    <path d="M0 6 Q14 26 22 42" stroke="#16a34a" stroke-width="3" stroke-linecap="round" fill="none"/>

    <!-- Permata Zamrud Berpendar di Tengah -->
    <circle cx="0" cy="0" r="7" fill="#facc15" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="3.5" fill="#15803d"/>
  </g>

  <!-- Lencana Biaya Energi -->
  <rect x="12" y="12" width="36" height="20" rx="10" fill="#15803d" stroke="#22c55e" stroke-width="1.5"/>
  <text x="30" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle">⚡3</text>
  <!-- Lencana Retry Bebas Damage -->
  <rect x="100" y="12" width="48" height="20" rx="10" fill="#16a34a" stroke="#86efac" stroke-width="1.5"/>
  <text x="124" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="900" fill="#ffffff" text-anchor="middle">RETRY 🔄</text>
</svg>
```

### B. Kode Vektor Kompak Tombol Battle (48x48)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jimat Keberuntungan">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#031f0f" stroke="#22c55e" stroke-width="2"/>
  <!-- Daun Semanggi 4 -->
  <g transform="translate(24 24)">
    <circle cx="0" cy="-7" r="6" fill="#22c55e"/>
    <circle cx="7" cy="0" r="6" fill="#22c55e"/>
    <circle cx="0" cy="7" r="6" fill="#22c55e"/>
    <circle cx="-7" cy="0" r="6" fill="#22c55e"/>
    <!-- Inti Permata -->
    <circle cx="0" cy="0" r="3" fill="#facc15"/>
    <path d="M0 2 Q6 12 10 16" stroke="#16a34a" stroke-width="2" fill="none"/>
  </g>
</svg>
```

---

## 12. Desain SVG Skill 10: Ramuan Merah (`red_potion`)

```
  🍷  ==============================================================
  📜  Ramuan Merah (Cataclysmic Ruby Elixir)
  🏷️  ID: red_potion | Unlock: Level 5 | Biaya Energi: 2–3 ⚡
  🌟  Filosofi Visual: Botol kristal eliksir bersegi delapan merah delima, 
      memancarkan gelombang letupan energi nuklir sihir berlipat ×5.0 damage.
  ==================================================================
```

### A. Kode SVG Standalone Card (160x160)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" role="img" aria-label="Skill Ramuan Merah">
  <defs>
    <radialGradient id="bg-redpot" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.5"/>
      <stop offset="65%" stop-color="#991b1b" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#2a0404" stop-opacity="0.9"/>
    </radialGradient>
    <linearGradient id="ruby-liquid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="35%" stop-color="#ef4444"/>
      <stop offset="75%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
    <linearGradient id="gold-crown" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <filter id="glow-redpot">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Latar Belakang Kartu Bulat -->
  <rect width="160" height="160" rx="32" fill="#240505" stroke="#ef4444" stroke-width="3"/>
  <circle cx="80" cy="80" r="68" fill="url(#bg-redpot)"/>

  <!-- Gelombang Kejut Ledakan Magis (Explosion Shockwave) -->
  <g stroke="#f87171" stroke-width="2" fill="none" opacity="0.6" filter="url(#glow-redpot)">
    <circle cx="80" cy="85" r="50" stroke-dasharray="10 6"/>
    <circle cx="80" cy="85" r="58" stroke-dasharray="4 8"/>
  </g>

  <!-- Botol Eliksir Kristal Segi Delapan (Octagonal Ruby Flask) -->
  <g transform="translate(80 84)" filter="url(#glow-redpot)">
    <!-- Bayangan Bawah -->
    <ellipse cx="0" cy="40" rx="32" ry="9" fill="#100202" opacity="0.6"/>

    <!-- Badan Kristal Ramuan Merah Membara -->
    <polygon points="-16,-18 16,-18 32,8 24,36 -24,36 -32,8" fill="url(#ruby-liquid)" stroke="#fca5a5" stroke-width="2.5"/>

    <!-- Faset Kristal Refleksi Cahaya (Geometric Facets) -->
    <polygon points="-16,-18 0,-18 0,36 -24,36 -32,8" fill="#ffffff" fill-opacity="0.15"/>
    <polygon points="0,-18 16,-18 32,8 24,36 0,36" fill="#000000" fill-opacity="0.2"/>

    <!-- Gelombang Energi Magis Berputar di Dalam -->
    <circle cx="0" cy="14" r="10" fill="#fef08a" opacity="0.4"/>
    <circle cx="-6" cy="18" r="4" fill="#ffffff" opacity="0.7"/>

    <!-- Leher Botol Berpahat Emas -->
    <rect x="-12" y="-28" width="24" height="11" fill="url(#gold-crown)" stroke="#78350f" stroke-width="1.5"/>

    <!-- Tutup Mahkota Bertatahkan Permata Ruby -->
    <polygon points="-14,-28 14,-28 18,-38 0,-44 -18,-38" fill="url(#gold-crown)" stroke="#78350f" stroke-width="1.5"/>
    <circle cx="0" cy="-35" r="4" fill="#ef4444" stroke="#ffffff" stroke-width="1"/>

    <!-- Kilatan Refleksi Tegas Kaca (Specular Slash) -->
    <line x1="-20" y1="2" x2="-14" y2="28" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.85"/>
  </g>

  <!-- Lencana Biaya Energi -->
  <rect x="12" y="12" width="36" height="20" rx="10" fill="#991b1b" stroke="#ef4444" stroke-width="1.5"/>
  <text x="30" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle">⚡2</text>
  <!-- Lencana Multiplier Damage Dahsyat -->
  <rect x="96" y="12" width="52" height="20" rx="10" fill="#dc2626" stroke="#fca5a5" stroke-width="1.5"/>
  <text x="122" y="26" font-family="'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="900" fill="#ffffff" text-anchor="middle">DMG ×5.0</text>
</svg>
```

### B. Kode Vektor Kompak Tombol Battle (48x48)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Ramuan Merah">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#240505" stroke="#ef4444" stroke-width="2"/>
  <!-- Botol Eliksir Kristal -->
  <polygon points="18,16 30,16 36,26 30,38 18,38 12,26" fill="#dc2626" stroke="#fca5a5" stroke-width="2"/>
  <!-- Leher & Tutup Emas -->
  <rect x="20" y="10" width="8" height="6" fill="#facc15"/>
  <!-- Kilatan Cahaya -->
  <circle cx="24" cy="27" r="4" fill="#fef08a"/>
</svg>
```


---

## 13. Katalog & Desain SVG 10 Jurus Elemen Bos Monster

Selain 10 skill aktif pemain, monster bos memiliki **Jurus Spesialis Elemen** ([`shared/bossskills.js`](file:///home/maman/play/shared/bossskills.js)) yang aktif berdasarkan habitat dan tingkat kesulitan (termasuk Mode Brutal). Berikut adalah 10 desain ikon vektor SVG 48x48 untuk masing-masing elemen bos monster:

| No | Elemen Bos | ID Jurus Utama | Nama Jurus Bos | Ikon Lama | Warna Tema | Efek Utama Terhadap Pemain |
|:---:|:---|:---|:---|:---:|:---:|:---|
| 1 | **Api (`fire`)** | `fire_rage` | **Amarah Membara** | 🔥 | `#EF4444` | Darah bos menipis ➔ Damage ke pemain naik drastis (hingga ×2.5) |
| 2 | **Air (`water`)** | `water_siphon` | **Arus Penyedot** | 💧 | `#38BDF8` | Saat salah menjawab, energi pemain tersedot -1 s/d -2 ⚡ |
| 3 | **Es (`ice`)** | `ice_frost` | **Embun Beku** | ❄️ | `#93C5FD` | Tiap 3 soal, waktu menjawab berkurang (beku) |
| 4 | **Hutan (`nature`)** | `nature_thorn` | **Racun Duri** | 🌿 | `#22C55E` | Efek DoT racun selama 2 soal setelah salah menjawab |
| 5 | **Tanah (`earth`)** | `earth_smash` | **Hantaman Batu** | 🪨 | `#A16207` | Jurus hantaman keras tiap 4 soal (ada aba-aba ⚠️) |
| 6 | **Angin (`wind`)** | `wind_gale` | **Angin Topan** | 🌪️ | `#94A3B8` | Waktu menjawab tertekan badai topan |
| 7 | **Petir (`thunder`)** | `thunder_shock` | **Sengatan Petir** | ⚡ | `#FACC15` | Sengatan listrik menyedot energi dan mengacaukan skill |
| 8 | **Bayangan (`shadow`)** | `shadow_pierce`| **Kegelapan Menembus**| 🌑 | `#7C3AED` | Serangan bos menembus perlindungan Perisai kayu |
| 9 | **Cahaya (`light`)** | `light_mirror` | **Pantulan Kristal** | ✨ | `#FDE68A` | Pantulan kristal meredam efektivitas bonus kombo pemain |
| 10| **Racun (`toxic`)** | `toxic_gas` | **Gas Beracun** | ☠️ | `#84CC16` | Gas beracun memotong pemulihan HP pemain |

### Kode SVG 10 Jurus Elemen Bos (Format 48x48 Grid):

```xml
<!-- 1. Api: Amarah Membara (Fire Rage) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jurus Api: Amarah Membara">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#200505" stroke="#ef4444" stroke-width="2"/>
  <path d="M24 8 C29 16, 38 20, 38 31 C38 39, 32 43, 24 43 C16 43, 10 39, 10 31 C10 21, 19 16, 24 8 Z" fill="#ef4444"/>
  <path d="M24 18 C27 23, 32 26, 32 33 C32 38, 28 40, 24 40 C20 40, 16 38, 16 33 C16 26, 21 23, 24 18 Z" fill="#facc15"/>
</svg>

<!-- 2. Air: Arus Penyedot (Water Siphon) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jurus Air: Arus Penyedot">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#041624" stroke="#38bdf8" stroke-width="2"/>
  <path d="M24 10 C16 10, 10 16, 10 24 C10 32, 16 38, 24 38 C32 38, 38 32, 38 24 C38 18, 34 14, 28 14 C22 14, 18 18, 18 24 C18 28, 20 30, 24 30 C26 30, 28 28, 28 24" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
</svg>

<!-- 3. Es: Embun Beku (Ice Frost) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jurus Es: Embun Beku">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#031a29" stroke="#93c5fd" stroke-width="2"/>
  <g stroke="#93c5fd" stroke-width="2.5" stroke-linecap="round">
    <line x1="24" y1="10" x2="24" y2="38"/><line x1="10" y1="24" x2="38" y2="24"/>
    <line x1="14" y1="14" x2="34" y2="34"/><line x1="14" y1="34" x2="34" y2="14"/>
  </g>
  <circle cx="24" cy="24" r="3" fill="#ffffff"/>
</svg>

<!-- 4. Hutan: Racun Duri (Nature Thorn) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jurus Hutan: Racun Duri">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#041f0f" stroke="#22c55e" stroke-width="2"/>
  <path d="M12 36 Q24 20 36 12" stroke="#22c55e" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- Duri Runcing -->
  <polygon points="20,24 24,18 25,24" fill="#86efac"/>
  <polygon points="27,17 34,14 30,20" fill="#86efac"/>
  <polygon points="15,31 16,24 20,29" fill="#86efac"/>
</svg>

<!-- 5. Tanah: Hantaman Batu (Earth Smash) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jurus Tanah: Hantaman Batu">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#1c1204" stroke="#a16207" stroke-width="2"/>
  <!-- Batu Terbelah -->
  <polygon points="12,38 18,18 30,14 38,24 34,38" fill="#a16207" stroke="#ca8a04" stroke-width="2"/>
  <line x1="24" y1="16" x2="22" y2="38" stroke="#fef08a" stroke-width="2"/>
</svg>

<!-- 6. Angin: Angin Topan (Wind Gale) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jurus Angin: Angin Topan">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#0f172a" stroke="#94a3b8" stroke-width="2"/>
  <path d="M10 18 Q26 14 34 18 Q38 20 36 24 Q32 26 28 22" stroke="#e2e8f0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M14 26 Q28 24 34 28 Q38 30 36 34 Q32 36 26 32" stroke="#94a3b8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>

<!-- 7. Petir: Sengatan Listrik (Thunder Shock) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jurus Petir: Sengatan Listrik">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#1e1803" stroke="#facc15" stroke-width="2"/>
  <polygon points="26,8 14,24 24,24 20,40 34,22 24,22" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
</svg>

<!-- 8. Bayangan: Kegelapan Menembus (Shadow Pierce) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jurus Bayangan: Kegelapan Menembus">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#130724" stroke="#7c3aed" stroke-width="2"/>
  <!-- Bulan Sabit Bayangan & Cakar -->
  <path d="M28 10 A14 14 0 1 0 38 28 A12 12 0 1 1 28 10 Z" fill="#7c3aed"/>
  <circle cx="28" cy="24" r="3" fill="#c084fc"/>
</svg>

<!-- 9. Cahaya: Pantulan Kristal (Light Mirror) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jurus Cahaya: Pantulan Kristal">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#211e05" stroke="#fde68a" stroke-width="2"/>
  <!-- Berlian Kristal Bercahaya -->
  <polygon points="24,10 36,24 24,38 12,24" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <line x1="24" y1="10" x2="24" y2="38" stroke="#ca8a04" stroke-width="1.5"/>
  <line x1="12" y1="24" x2="36" y2="24" stroke="#ca8a04" stroke-width="1.5"/>
</svg>

<!-- 10. Racun: Gas Beracun (Toxic Gas) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Jurus Racun: Gas Beracun">
  <rect x="4" y="4" width="40" height="40" rx="10" fill="#122004" stroke="#84cc16" stroke-width="2"/>
  <!-- Gelembung & Tengkorak Sederhana -->
  <circle cx="24" cy="22" r="10" fill="#84cc16"/>
  <circle cx="20" cy="20" r="2" fill="#122004"/>
  <circle cx="28" cy="20" r="2" fill="#122004"/>
  <rect x="21" y="28" width="6" height="5" rx="1" fill="#84cc16"/>
  <line x1="23" y1="30" x2="23" y2="33" stroke="#122004" stroke-width="1"/>
  <line x1="25" y1="30" x2="25" y2="33" stroke="#122004" stroke-width="1"/>
</svg>
```

---

## 14. Grand Showcase: Panggung Parade Seluruh Skill dalam 1 Kanvas SVG

Berikut adalah kanvas komposit SVG interaktif berskala besar (`width="800" height="340"`) yang merangkum kesepuluh skill pemain ke dalam satu tampilan terpadu (*Showcase Collage*):

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 340" width="800" height="340" role="img" aria-label="Grand Showcase 10 Skill RPG Petualangan Pelajar">
  <defs>
    <linearGradient id="showcase-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#090d16"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>

  <!-- Latar Kanvas Panggung -->
  <rect width="800" height="340" rx="20" fill="url(#showcase-bg)" stroke="#38bdf8" stroke-width="3"/>

  <!-- Judul Panggung -->
  <text x="400" y="38" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="#f8fafc" text-anchor="middle" letter-spacing="1">⚡ GRAND SHOWCASE: 10 SKILL RESMI PETUALANGAN PELAJAR ⚡</text>
  <line x1="150" y1="50" x2="650" y2="50" stroke="#38bdf8" stroke-width="2" stroke-dasharray="10 6" opacity="0.6"/>

  <!-- Baris 1: Skill 1 s/d Skill 5 -->
  <!-- 1. Coret Satu -->
  <g transform="translate(40 70)">
    <rect width="130" height="110" rx="14" fill="#0f172a" stroke="#0284c7" stroke-width="2"/>
    <text x="65" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle">Coret Satu</text>
    <rect x="45" y="34" width="40" height="40" rx="8" fill="#f8fafc"/>
    <line x1="50" y1="42" x2="70" y2="42" stroke="#cbd5e1" stroke-width="2.5"/>
    <path d="M47 38 L83 70 M83 38 L47 70" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
    <text x="65" y="96" font-family="sans-serif" font-size="10" font-weight="700" fill="#facc15" text-anchor="middle">⚡1 • Lv.1</text>
  </g>

  <!-- 2. Mata Elang -->
  <g transform="translate(190 70)">
    <rect width="130" height="110" rx="14" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
    <text x="65" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#fbbf24" text-anchor="middle">Mata Elang</text>
    <circle cx="65" cy="54" r="18" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 2"/>
    <path d="M45 54 Q65 42 85 54 Q65 66 45 54 Z" fill="#1e1b4b" stroke="#f59e0b" stroke-width="2"/>
    <circle cx="65" cy="54" r="7" fill="#06b6d4"/>
    <text x="65" y="96" font-family="sans-serif" font-size="10" font-weight="700" fill="#facc15" text-anchor="middle">⚡2 • Lv.1</text>
  </g>

  <!-- 3. Ramuan Hijau -->
  <g transform="translate(340 70)">
    <rect width="130" height="110" rx="14" fill="#041f11" stroke="#22c55e" stroke-width="2"/>
    <text x="65" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#4ade80" text-anchor="middle">Ramuan Hijau</text>
    <path d="M57 56 C57 66 61 70 65 70 C69 70 73 66 73 56 C73 48 68 42 67 38 L63 38 C62 42 57 48 57 56 Z" fill="#22c55e" stroke="#86efac" stroke-width="2"/>
    <rect x="63" y="52" width="4" height="10" rx="1" fill="#ffffff"/>
    <rect x="60" y="55" width="10" height="4" rx="1" fill="#ffffff"/>
    <text x="65" y="96" font-family="sans-serif" font-size="10" font-weight="700" fill="#facc15" text-anchor="middle">⚡1 • Lv.1</text>
  </g>

  <!-- 4. Perisai Kayu -->
  <g transform="translate(490 70)">
    <rect width="130" height="110" rx="14" fill="#082032" stroke="#38bdf8" stroke-width="2"/>
    <text x="65" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#7dd3fc" text-anchor="middle">Perisai Kayu</text>
    <path d="M65 38 L77 44 C77 56 72 64 65 68 C58 64 53 56 53 44 Z" fill="#b45309" stroke="#94a3b8" stroke-width="2"/>
    <polygon points="65,48 68,52 65,56 62,52" fill="#38bdf8"/>
    <text x="65" y="96" font-family="sans-serif" font-size="10" font-weight="700" fill="#facc15" text-anchor="middle">⚡2 • Lv.2</text>
  </g>

  <!-- 5. Tebasan Super -->
  <g transform="translate(640 70)">
    <rect width="130" height="110" rx="14" fill="#200505" stroke="#ef4444" stroke-width="2"/>
    <text x="65" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#f87171" text-anchor="middle">Tebasan Super</text>
    <line x1="52" y1="66" x2="78" y2="40" stroke="#f8fafc" stroke-width="3" stroke-linecap="round"/>
    <line x1="78" y1="66" x2="52" y2="40" stroke="#f8fafc" stroke-width="3" stroke-linecap="round"/>
    <circle cx="65" cy="53" r="4" fill="#f97316"/>
    <text x="65" y="96" font-family="sans-serif" font-size="10" font-weight="700" fill="#facc15" text-anchor="middle">⚡3 • Lv.3</text>
  </g>

  <!-- Baris 2: Skill 6 s/d Skill 10 -->
  <!-- 6. Waktu Beku -->
  <g transform="translate(40 200)">
    <rect width="130" height="110" rx="14" fill="#041624" stroke="#38bdf8" stroke-width="2"/>
    <text x="65" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle">Waktu Beku</text>
    <path d="M57 40 L73 40 L67 52 L73 64 L57 64 L63 52 Z" fill="#0284c7" stroke="#bae6fd" stroke-width="2"/>
    <circle cx="65" cy="52" r="2.5" fill="#ffffff"/>
    <text x="65" y="96" font-family="sans-serif" font-size="10" font-weight="700" fill="#facc15" text-anchor="middle">⚡3 • Lv.4</text>
  </g>

  <!-- 7. Penjaga Combo -->
  <g transform="translate(190 200)">
    <rect width="130" height="110" rx="14" fill="#150824" stroke="#f97316" stroke-width="2"/>
    <text x="65" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#fb923c" text-anchor="middle">Penjaga Combo</text>
    <path d="M65 38 C69 44, 76 48, 76 56 C76 64, 71 68, 65 68 C59 68, 54 64, 54 56 C54 48, 61 44, 65 38 Z" fill="#f97316"/>
    <rect x="60" y="52" width="10" height="8" rx="2" fill="#150824" stroke="#fef08a" stroke-width="1.5"/>
    <text x="65" y="96" font-family="sans-serif" font-size="10" font-weight="700" fill="#facc15" text-anchor="middle">⚡2 • Lv.5</text>
  </g>

  <!-- 8. Kantong Hoki -->
  <g transform="translate(340 200)">
    <rect width="130" height="110" rx="14" fill="#1e0c03" stroke="#eab308" stroke-width="2"/>
    <text x="65" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#facc15" text-anchor="middle">Kantong Hoki</text>
    <path d="M57 52 C55 62 59 66 65 66 C71 66 75 62 73 52 C71 44 68 40 67 36 L63 36 C62 40 59 44 57 52 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
    <circle cx="65" cy="54" r="5" fill="#eab308"/>
    <text x="65" y="96" font-family="sans-serif" font-size="10" font-weight="700" fill="#facc15" text-anchor="middle">⚡2 • Lv.6</text>
  </g>

  <!-- 9. Jimat Keberuntungan -->
  <g transform="translate(490 200)">
    <rect width="130" height="110" rx="14" fill="#031f0f" stroke="#22c55e" stroke-width="2"/>
    <text x="65" y="24" font-family="sans-serif" font-size="10.5" font-weight="800" fill="#4ade80" text-anchor="middle">Jimat Keberuntungan</text>
    <g transform="translate(65 52)">
      <circle cx="0" cy="-6" r="5" fill="#22c55e"/>
      <circle cx="6" cy="0" r="5" fill="#22c55e"/>
      <circle cx="0" cy="6" r="5" fill="#22c55e"/>
      <circle cx="-6" cy="0" r="5" fill="#22c55e"/>
      <circle cx="0" cy="0" r="2.5" fill="#facc15"/>
    </g>
    <text x="65" y="96" font-family="sans-serif" font-size="10" font-weight="700" fill="#facc15" text-anchor="middle">⚡3 • Lv.8</text>
  </g>

  <!-- 10. Ramuan Merah -->
  <g transform="translate(640 200)">
    <rect width="130" height="110" rx="14" fill="#240505" stroke="#ef4444" stroke-width="2"/>
    <text x="65" y="24" font-family="sans-serif" font-size="11" font-weight="800" fill="#f87171" text-anchor="middle">Ramuan Merah</text>
    <polygon points="60,44 70,44 75,52 70,62 60,62 55,52" fill="#dc2626" stroke="#fca5a5" stroke-width="1.8"/>
    <rect x="62" y="38" width="6" height="6" fill="#facc15"/>
    <circle cx="65" cy="53" r="3" fill="#fef08a"/>
    <text x="65" y="96" font-family="sans-serif" font-size="10" font-weight="700" fill="#facc15" text-anchor="middle">⚡2 • Lv.5</text>
  </g>
</svg>
```

---

## 15. Panduan Integrasi Mesin Visual & Kode CSS Animasi

### A. Modul Pustaka JS Helper (`public/js/skills-svg.js`)
Untuk menggantikan emoji secara mulus tanpa mengganggu logika internal pertempuran, modul JavaScript berikut dapat diimpor langsung:

```javascript
/* public/js/skills-svg.js — Renderer Vektor SVG Resmi Skill Petualangan Pelajar */
(function(window) {
  'use strict';

  const SKILL_SVG_ICONS = {
    eliminate_one: `<svg viewBox="0 0 48 48" class="sk-svg-icon"><rect x="4" y="4" width="40" height="40" rx="10" fill="#0f172a" stroke="#0284c7" stroke-width="2"/><rect x="10" y="10" width="28" height="28" rx="5" fill="#f8fafc"/><path d="M12 14 L36 34 M36 14 L12 34" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/><path d="M30 6 L40 16 L22 34 L12 34 L12 24 Z" fill="#eab308" stroke="#854d0e" stroke-width="1.2"/></svg>`,
    eagle_eye: `<svg viewBox="0 0 48 48" class="sk-svg-icon"><rect x="4" y="4" width="40" height="40" rx="10" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/><circle cx="24" cy="24" r="16" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M8 24 Q24 12 40 24 Q24 36 8 24 Z" fill="#1e1b4b" stroke="#f59e0b" stroke-width="2"/><circle cx="24" cy="24" r="8" fill="#06b6d4"/><ellipse cx="24" cy="24" rx="3" ry="7" fill="#020617"/></svg>`,
    heal: `<svg viewBox="0 0 48 48" class="sk-svg-icon"><rect x="4" y="4" width="40" height="40" rx="10" fill="#041f11" stroke="#22c55e" stroke-width="2"/><path d="M16 26 C16 36 20 40 24 40 C28 40 32 36 32 26 C32 18 27 12 26 8 L22 8 C21 12 16 18 16 26 Z" fill="#22c55e" stroke="#86efac" stroke-width="2"/><rect x="21" y="4" width="6" height="5" rx="1" fill="#b45309"/><rect x="22" y="22" width="4" height="12" rx="1" fill="#ffffff"/><rect x="18" y="26" width="12" height="4" rx="1" fill="#ffffff"/></svg>`,
    shield: `<svg viewBox="0 0 48 48" class="sk-svg-icon"><rect x="4" y="4" width="40" height="40" rx="10" fill="#082032" stroke="#38bdf8" stroke-width="2"/><path d="M24 8 L38 15 C38 28 32 37 24 42 C16 37 10 28 10 15 Z" fill="#b45309" stroke="#94a3b8" stroke-width="2.5"/><polygon points="24,18 28,22 24,26 20,22" fill="#38bdf8"/></svg>`,
    power_strike: `<svg viewBox="0 0 48 48" class="sk-svg-icon"><rect x="4" y="4" width="40" height="40" rx="10" fill="#200505" stroke="#ef4444" stroke-width="2"/><line x1="10" y1="38" x2="36" y2="10" stroke="#f8fafc" stroke-width="3.5" stroke-linecap="round"/><line x1="38" y1="38" x2="12" y2="10" stroke="#f8fafc" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="24" r="4" fill="#f97316"/></svg>`,
    time_freeze: `<svg viewBox="0 0 48 48" class="sk-svg-icon"><rect x="4" y="4" width="40" height="40" rx="10" fill="#041624" stroke="#38bdf8" stroke-width="2"/><path d="M16 12 L32 12 L25 24 L32 36 L16 36 L23 24 Z" fill="#0284c7" stroke="#bae6fd" stroke-width="2"/><circle cx="24" cy="24" r="2.5" fill="#ffffff"/></svg>`,
    combo_keeper: `<svg viewBox="0 0 48 48" class="sk-svg-icon"><rect x="4" y="4" width="40" height="40" rx="10" fill="#150824" stroke="#f97316" stroke-width="2"/><path d="M24 10 C28 16, 36 20, 36 30 C36 38, 30 42, 24 42 C18 42, 12 38, 12 30 C12 20, 20 16, 24 10 Z" fill="#f97316"/><rect x="18" y="26" width="12" height="10" rx="3" fill="#150824" stroke="#ffffff" stroke-width="1.8"/></svg>`,
    lucky_pouch: `<svg viewBox="0 0 48 48" class="sk-svg-icon"><rect x="4" y="4" width="40" height="40" rx="10" fill="#1e0c03" stroke="#eab308" stroke-width="2"/><path d="M14 26 C12 36 18 40 24 40 C30 40 36 36 34 26 C32 18 27 14 26 10 L22 10 C21 14 16 18 14 26 Z" fill="#dc2626" stroke="#991b1b" stroke-width="2"/><circle cx="24" cy="27" r="6" fill="#eab308"/></svg>`,
    second_chance: `<svg viewBox="0 0 48 48" class="sk-svg-icon"><rect x="4" y="4" width="40" height="40" rx="10" fill="#031f0f" stroke="#22c55e" stroke-width="2"/><g transform="translate(24 24)"><circle cx="0" cy="-6" r="5" fill="#22c55e"/><circle cx="6" cy="0" r="5" fill="#22c55e"/><circle cx="0" cy="6" r="5" fill="#22c55e"/><circle cx="-6" cy="0" r="5" fill="#22c55e"/><circle cx="0" cy="0" r="2.5" fill="#facc15"/></g></svg>`,
    red_potion: `<svg viewBox="0 0 48 48" class="sk-svg-icon"><rect x="4" y="4" width="40" height="40" rx="10" fill="#240505" stroke="#ef4444" stroke-width="2"/><polygon points="18,16 30,16 36,26 30,38 18,38 12,26" fill="#dc2626" stroke="#fca5a5" stroke-width="2"/><rect x="20" y="10" width="8" height="6" fill="#facc15"/></svg>`
  };

  window.SkillSvgEngine = {
    getIcon(skillId) {
      return SKILL_SVG_ICONS[skillId] || `<span class="emoji-fallback">✨</span>`;
    }
  };
})(window);
```

### B. Aturan Gaya CSS (`public/css/style.css`)
```css
/* Styling Ikon Vektor SVG Skill pada Tombol Battle & Modal */
.skill-btn .skill-icon svg.sk-svg-icon {
  width: 32px;
  height: 32px;
  display: block;
  margin: 0 auto;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease;
}

.skill-btn:not(.dimmed):hover .skill-icon svg.sk-svg-icon {
  transform: scale(1.12) translateY(-2px);
  filter: drop-shadow(0 4px 10px rgba(56, 189, 248, 0.5));
}

.skill-btn:active:not(.dimmed) .skill-icon svg.sk-svg-icon {
  transform: scale(0.94);
}

.skill-btn.dimmed .skill-icon svg.sk-svg-icon {
  filter: grayscale(0.85) opacity(0.5);
}
```

---
*Dokumen desain resmi disusun untuk arsitektur visual permainan Petualangan Pelajar v7.2.*
