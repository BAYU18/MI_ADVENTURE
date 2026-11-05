# PROPOSAL DESAIN: REVOLUSI UI BATTLE & TATA LETAK PERTANYAAN EFEKTIF
**Dokumen Referensi:** Evaluasi Tata Letak Mobile Layar Pertempuran Game Petualangan Pelajar  
**Tanggal:** 5 November 2026  
**Status:** Rekomendasi Siap Eksekusi  

---

## 1. Latar Belakang & Identifikasi Masalah (Berdasarkan Screenshot)

Berdasarkan evaluasi tampilan layar pertempuran pada perangkat smartphone (seperti pada screenshot pengguna), ditemukan kendala serius pada efektivitas ruang vertikal (*screen real estate*):

```
┌──────────────────────────────────────────┐  ◄─── LAYAR MOBILE PORTRAIT
│ [✕]  ⚡ 3/5  [Soal ...]  🛡️ 3  ❤️ 100/100 │  Tinggi ~44px
├──────────────────────────────────────────┤
│           KARTU BOS JAMURGON             │  BOROS RUANG VERTIKAL!
│  [Avt]  Jamurgon  Common  Hutan  hutan   │  Mengambil ~260px (>35% layar)
│         Titik lemah: Soal Sulit 🎯 🎯    │  Hanya untuk menampilkan avatar statis,
│         😴 Serbuk Lelap                  │  bar darah tebal, dan teks status.
│  ██████████████████████████████████████  │
│  HP Bos 319 / 340  Sisa maks. 16 jawaban │
├──────────────────────────────────────────┤
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │  HP Pemain Biru (~16px) (Redundan)
├──────────────────────────────────────────┤
│ [🛡️ Perisai] [💨 Hindaran] [🪙 Koin]     │  Bar Buff (~32px)
├──────────────────────────────────────────┤
│ ════════════════════════════════════════ │  Timer Oranye (~8px)
├──────────────────────────────────────────┤
│ [🔁 ULANGAN] [🎯 TITIK LEMAH] [🔊] [⚡ 3] │  Header Soal (~42px)
├──────────────────────────────────────────┤
│                                          │  ❌ KOTAK SOAL TERGENCET /
│            (PERTANYAAN HILANG)           │     TIDAK KELIHATAN SAMA SEKALI!
│                                          │     Teks soal terdorong ke atas.
├──────────────────────────────────────────┤
│ [A] Bunga menjadi sarang lebah...        │
│ [B] Lebah mendapat nektar, bunga...      │  4 Tombol Jawaban Raksasa
│ [C] Lebah mendapat daun, bunga...        │  Mengambil ~300px vertikal
│ [D] Lebah memakan benang sari...         │
└──────────────────────────────────────────┘
```

### 🔴 5 Masalah Utama (Pain Points):
1. **Kotak Pertanyaan Terjepit / Tersembunyi**: Pemain memainkan game kuis edukatif untuk membaca pertanyaan dan berpikir. Namun saat ini, teks soal justru yang paling terhimpit atau bahkan hilang tertutup overflow.
2. **Kartu Bos Terlalu Raksasa (~260px)**: Avatar bos 80-100px, nama, 3 badge elemen, teks titik lemah, chip skill, dan bar HP tebal menelan lebih dari 35% layar.
3. **Redudansi Status Darah Pemain**: Darah pemain ditampilkan dua kali (di Top HUD atas dan di bar biru panjang di bawah kartu bos).
4. **Tombol Pilihan Jawaban Terlalu Tinggi**: 4 tombol jawaban vertikal dengan padding tebal menghabiskan 300px, sehingga memaksa konten di atasnya menciut.
5. **Kelelahan Pengguna (UX Friction)**: Dalam batasan waktu timer yang terus berjalan, pemain terpaksa harus scroll naik-turun hanya untuk membaca soal lalu scroll lagi untuk memencet tombol opsi.

---

## 2. Prinsip & Konsep Solusi: "Zero-Scroll Golden Layout"

Game kuis petualangan edukatif modern (seperti Duolingo, Kahoot, Pokémon Trivia) mengusung aturan emas:
> **"Pertanyaan dan semua pilihan jawaban WAJIB terlihat penuh dalam 1 pandangan layar (Zero-Scroll) di semua ukuran layar smartphone."**

### 📐 Pembagian 3 Zona Layar Ideal (Rasio Emas):

```
┌──────────────────────────────────────────┐
│  ZONA 1: COMPACT VERSUS HUD (Max 18-20%) │ ◄── Bos & Pemain dalam 1 Baris Ramping
│  [👹 Jamurgon 319 HP] ⚡ [Kamu 100 HP 🛡️] │     Avatar mini 40px, HP bar ramping,
│  ⏱️ Timer & Chip Buff Mikro Horizontal   │     bebas tumpukan vertikal.
├──────────────────────────────────────────┤
│                                          │
│  ZONA 2: HERO QUESTION STAGE (35-40%)    │ ◄── AREA UTAMA PERTANYAAN
│  ┌────────────────────────────────────┐  │     - Teks soal besar (1.1rem), lega.
│  │ 📘 IPAS · Soal 1/10  🎯 [🔊] [⚡ 3] │  │     - Nyaman dibaca tanpa kacamata.
│  │                                    │  │     - Mendukung gambar/diagram jelas.
│  │ "Hubungan simbiosis antara lebah   │  │
│  │  dan bunga tergolong mutualisme    │  │
│  │  karena..."                        │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  ZONA 3: SMART ANSWER GRID (38-42%)      │ ◄── OPSI JAWABAN RESPONSIF
│  [A] Lebah dapat nektar [B] Sarang aman  │     - Mode Grid 2×2 (teks singkat)
│  [C] Dapat daun         [D] Makan benang │     - Mode Stack Ramping (teks panjang)
│                                          │     - Thumb-friendly (mudah dijangkau jempol)
└──────────────────────────────────────────┘
```

---

## 3. Rincian Desain Per Zona

### 🛡️ Zona 1: Compact Versus Header (Tinggi Max 80px)
Menyatukan status Bos dan Pemain ke dalam format **Split Combat HUD**:
- **Sisi Kiri (Bos)**:
  - Mini Thumbnail Bos (36×36px atau 40×40px).
  - Nama Bos + Badge Rarity/Elemen mikro (`Jamurgon 🌿`).
  - Bar HP Bos ramping (tinggi 8px) berwarna hijau/merah dengan teks `319/340`.
- **Sisi Kanan (Kamu)**:
  - Bar HP Pemain ramping (tinggi 8px) berwarna cyan dengan teks `100/100`.
  - Indikator Perisai `🛡️ 10` dan Energi `⚡ 3/5`.
- **Baris Mikro Pasif & Timer**:
  - Timer countdown diletakkan sebagai garis glow tipis (3px) tepat di batas bawah Zona 1.
  - Buff aktif skin/bos ditampilkan sebagai ikon mikro berjejer horizontal (tinggi 20px).

### 📖 Zona 2: Panggung Pertanyaan Lega (Hero Question Stage)
- **Tinggi**: Fleksibel (mengisi sisa ruang secara dinamis `flex: 1 1 auto`).
- **Header Soal Bersih**:
  - Nama Mata Pelajaran + Nomor Soal (`Soal 1/10`).
  - Lencana status (Ulangan Berjarak / Titik Lemah / Bonus) tampil sebagai chip mini.
  - Tombol Audio `🔊` dan Tombol `⚡ Skill` disematkan di pojok kanan kartu soal tanpa memakan baris baru.
- **Tipografi Teks Pertanyaan**:
  - Ukuran font `1.05rem - 1.15rem`, line-height `1.45`, warna teks putih kontras `#f8fafc`.
  - Jika ada gambar diagram soal, gambar dibatasi maksimal tinggi 110px dengan modal tap-to-zoom.

### 🔘 Zona 3: Smart Answer Grid (Pilihan Jawaban Efektif)
Menggunakan algoritma penataan otomatis:
1. **Mode A — Smart Grid 2×2 (Untuk Pilihan Singkat < 25 Karakter)**:
   - Jika semua pilihan jawaban relatif singkat (misal angka, 1-3 kata), opsi otomatis disusun menjadi **2 Kolom × 2 Baris**.
   - Tinggi total 4 opsi hanya memakan **~90px - 100px**! Menghemat ruang lebih dari 65%!
2. **Mode B — Compact Stack (Untuk Pilihan Panjang)**:
   - Jika pilihan berupa kalimat panjang, disusun 4 baris kompak.
   - Padding dikurangi dari 14px menjadi **8px - 10px**.
   - Badge huruf `A`, `B`, `C`, `D` dibuat terintegrasi rapi di sebelah kiri teks.
   - Tinggi total 4 opsi hanya memakan **~180px - 200px** (turun drastis dari 320px).

---

## 4. Keuntungan & Manfaat Bagi Pemain

| Aspek | Tampilan Saat Ini | Tampilan Setelah Desain Baru | Peningkatan |
|---|---|---|---|
| **Keterbacaan Soal** | Tergencet / tersembunyi ke bawah | Tampil penuh, lega di tengah layar | **+300% Lebih Jelas** |
| **Kebutuhan Scroll** | Sering scroll naik-turun | **0% (Zero-Scroll)** di semua HP | **100% Bebas Scroll** |
| **Porsi Layar Soal** | Hanya ~15-20% tinggi layar | **38-42% tinggi layar** | **2× Lipat Lebih Luas** |
| **Tinggi Header Bos** | ~260px (boros ruang) | ~76px (kompak & elegan) | **Hemat 70% Ruang** |
| **Kecepatan Menjawab** | Lambat karena terpotong | Cepat, fokus, ergonomis | **Refleks Lebih Sigap** |

---

## 5. Rencana Penerapan Teknis (Surgical & Non-Breaking)

Penerapan desain ini tidak merusak fungsionalitas logika game yang sudah berjalan:
1. **HTML & CSS Refactor di `Screens.battle.render`**:
   - Mengubah struktur `.boss-box` menjadi `.combat-versus-bar` yang ramping.
   - Memasukkan status HP pemain dan bos ke dalam split-grid.
   - Menambahkan deteksi panjang teks opsi untuk mengaktifkan kelas `.options-grid-2x2` otomatis.
2. **CSS Breakpoints**:
   - Memastikan tampilan tetap konsisten di layar terkecil (iPhone SE 375px) hingga layar lebar (Tablet/Desktop).
3. **Pengujian Visual & Game Engine**:
   - Menjalankan seluruh test suite battle, timer, dan submission untuk memastikan skor, combo, dan animasi tetap 100% akurat.
