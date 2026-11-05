# PROPOSAL DESAIN: 3 OPSI TAMPILAN SOAL & JAWABAN LAYAR PERTEMPURAN MOBILE
**Dokumen Referensi:** Evaluasi Tata Letak Mobile & Kustomisasi Pengaturan Layar Battle Game Petualangan Pelajar  
**Tanggal Pembaruan:** 5 November 2026  
**Status:** Proposal Komprehensif Siap Eksekusi  

---

## 1. Latar Belakang & Identifikasi Masalah Layar Saat Ini

Berdasarkan evaluasi nyata pada tangkapan layar smartphone (seperti pada screenshot pengguna akun Bayu saat melawan Jamurgon), terdapat masalah ketidakefektifan pemanfaatan ruang vertikal (*vertical real estate*):

```
┌──────────────────────────────────────────┐  ◄─── LAYAR MOBILE PORTRAIT (Saat Ini)
│ [✕]  ⚡ 3/5  [Soal ...]  🛡️ 3  ❤️ 100/100 │  Top HUD (~44px)
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
│ [🛡️ Perisai] [💨 Hindaran] [🪙 Koin]     │  Bar Buff Pasif (~32px)
├──────────────────────────────────────────┤
│ ════════════════════════════════════════ │  Timer Oranye (~8px)
├──────────────────────────────────────────┤
│ [🔁 ULANGAN] [🎯 TITIK LEMAH] [🔊] [⚡ 3] │  Header Soal (~42px)
├──────────────────────────────────────────┤
│                                          │  ❌ KOTAK TEKS SOAL TERGENCET /
│            (PERTANYAAN HILANG)           │     TERPOTONG KE ATAS!
│                                          │     Pemain tidak bisa membaca soal!
├──────────────────────────────────────────┤
│ [A] Bunga menjadi sarang lebah...        │
│ [B] Lebah mendapat nektar, bunga...      │  4 Tombol Jawaban Tinggi
│ [C] Lebah mendapat daun, bunga...        │  Mengambil ~300px vertikal
│ [D] Lebah memakan benang sari...         │
└──────────────────────────────────────────┘
```

### 🔴 4 Kendala Utama:
1. **Kotak Pertanyaan Terjepit**: Di layar ponsel berukuran standar, area teks soal (`.qtext`) terdorong ke atas dan nyaris tak terlihat tanpa scrolling.
2. **Kartu Bos Terlalu Memakan Ruang**: Menghabiskan lebih dari sepertiga tinggi layar hanya untuk visualisasi musuh statis.
3. **Pilihan Jawaban Memakan 300px Vertikal**: 4 tombol pilihan ganda berjejer ke bawah dengan bantalan tebal.
4. **Kebutuhan Fleksibilitas Pengguna**: Setiap pemain memiliki preferensi berbeda: ada yang menyukai alur baca tenang (soal luas), ada yang menyukai aksi cepat (1 layar instan), dan ada yang menyukai tampilan bawaan saat ini.

---

## 2. Solusi: Menu Pengaturan & 3 Opsi Tampilan Battle

Untuk memberikan pengalaman terbaik tanpa memaksakan satu gaya, sistem akan menyediakan **Pengaturan Mode Tampilan Pertempuran** di menu Pengaturan (`Screens.settings`), di mana **Mode Klasik dijadikan sebagai default**:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ PENGATURAN ➔ TAMPILAN & GAMEPLAY                         │
│                                                             │
│ Mode Tampilan Battle:                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ◉ 1. Mode Klasik (Default)                              │ │
│ │    Tampilan standar bawaan saat ini                     │ │
│ │                                                         │ │
│ │ ○ 2. Mode Baca Penuh + Lembar Jawaban (Bottom Sheet)    │ │
│ │    Soal tampil luas, tombol "Jawab" buka pilihan opsi   │ │
│ │                                                         │ │
│ │ ○ 3. Mode Kompak Adaptif (Zero-Scroll Smart Grid)       │ │
│ │    Versus bar ringkas, soal lega, opsi grid 2x2 instan  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

Pilihan pemain akan disimpan secara persisten di `Settings` lokal dan `settings_json` akun pemain di database (`battleLayout: 'classic' | 'bottom_sheet' | 'compact'`).

---

## 3. Rincian & Wireframe 3 Opsi Tampilan Battle

---

### 🟢 OPSI 1: Mode Klasik (Default — Tampilan Saat Ini)

Layout standar yang saat ini sudah berjalan. Semua elemen disusun dalam satu kolom vertikal yang dapat digulir (*scrollable container*).

#### 🖼️ Wireframe Opsi 1:
```
┌──────────────────────────────────────────┐
│ [✕]  ⚡ 3/5    Soal 1/10     ❤️ 100/100    │  ◄── HUD Atas
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ 🐲 Jamurgon (Common · Hutan)         │ │  ◄── Kartu Bos Klasik (~220px)
│ │ [Avatar 80px]  Bar HP Bos Hijau      │ │      (Tampilan visual penuh)
│ │                319 / 340             │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ │  ◄── Bar Darah Pemain Biru
├──────────────────────────────────────────┤
│ [🛡️ +10] [💨 4%] [🪙 +2%] [👑 +5%/Stk]   │  ◄── Bar Buff Pasif Skin
├──────────────────────────────────────────┤
│ ════════════════════════════════════════ │  ◄── Timer
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ IPAS · [Ulangan] [Titik Lemah] [🔊]  │ │  ◄── Kotak Soal Scrollable
│ │ Pertanyaan kuis ditampilkan di sini  │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ [A] Pilihan Jawaban Pertama              │
│ [B] Pilihan Jawaban Kedua                │  ◄── 4 Tombol Pilihan Ganda
│ [C] Pilihan Jawaban Ketiga               │      Langsung Berjejer ke Bawah
│ [D] Pilihan Jawaban Keempat              │
└──────────────────────────────────────────┘
```

#### Karakteristik Opsi 1:
- **Kelebihan**: Tampilan familiar bagi pemain lama; gambar karakter bos terlihat besar dan megah.
- **Kekurangan**: Pada smartphone berlayar pendek, teks soal dan opsi jawaban terhimpit sehingga membutuhkan scrolling.
- **Target Pengguna**: Pemain yang menyukai tampilan RPG tradisional atau menggunakan perangkat tablet/layar besar.

---

### 🔵 OPSI 2: Mode Baca Penuh + Lembar Jawaban (Full Question + Bottom Sheet Drawer)
*(Sesuai Contoh yang Diminta Pengguna)*

Pada mode ini, pertempuran dibagi menjadi **2 Tahap Interaksi Elegan**:
1. **Tahap 1 (Membaca Soal & Berpikir)**: Seluruh layar tengah didedikasikan untuk teks soal, gambar/diagram, dan cerita secara LEGA dan BESAR.
2. **Tahap 2 (Menjawab)**: Ketika pemain siap, pemain mengetuk tombol besar **`[ ✍️ JAWAB PERTANYAAN ]`** di bawah. Seketika lembar jawaban (*Bottom Sheet*) meluncur mulus dari bawah menampilkan pilihan A, B, C, D yang sangat nyaman disentuh jempol.

#### 🖼️ Wireframe Opsi 2 (Tahap 1: Membaca Soal):
```
┌──────────────────────────────────────────┐
│ [✕] ⚡ 3/5  Jamurgon 319 HP  ❤️ 100  [🔊] │  ◄── Mini Header Ringkas (~52px)
├──────────────────────────────────────────┤
│ ════════════════════════════════════════ │  ◄── Garis Timer Tipis Glow (3px)
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐  │  ◄── AREA SOAL MAKSIMAL (LEGA!)
│  │ 📘 IPAS · Soal 1/10  🎯 [⚡ Skill] │  │      - Mengisi 65% Tinggi Layar
│  │                                    │  │      - Font besar 1.15rem, nyaman
│  │ "Hubungan simbiosis antara lebah   │  │      - Diagram / Gambar jelas
│  │  dan bunga tergolong mutualisme    │  │      - Tidak ada teks terpotong
│  │  karena..."                        │  │
│  │                                    │  │
│  │ [Gambar Bunga & Lebah Jika Ada]    │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │     ✍️  JAWAB SEKARANG (4 OPSI)       │ │  ◄── Tombol Utama Menjawab
│ └──────────────────────────────────────┘ │      (Besar, Mudah Ditekan Jempol)
└──────────────────────────────────────────┘
```

#### 🖼️ Wireframe Opsi 2 (Tahap 2: Lembar Jawaban Muncul / Bottom Sheet):
```
┌──────────────────────────────────────────┐
│ [✕] ⚡ 3/5  Jamurgon 319 HP  ❤️ 100  [🔊] │  ◄── Header Tetap Terlihat
├──────────────────────────────────────────┤
│ "Hubungan lebah & bunga tergolong..."    │  ◄── Teks Soal Ringkas di Atas
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │  ◄── LEMBAR JAWABAN (BOTTOM SHEET)
│ │ ─── Tarik atau Pilih Jawaban ───     │ │      Meluncur Mulus dari Bawah
│ │                                      │ │
│ │ [A] Lebah mendapat tempat tinggal    │ │      - Tombol besar, jarak pas
│ │ [B] Lebah dapat nektar, bunga serbuk │ │      - Sangat ramah jempol
│ │ [C] Bunga menjadi sarang lebah       │ │      - Ada tombol tutup kembali jika
│ │ [D] Lebah merusak kelopak bunga      │ │        ingin baca soal lagi
│ │                                      │ │
│ │            [ ✕ Batal / Baca Ulang ]  │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

#### Karakteristik Opsi 2:
- **Kelebihan**: 
  - **Keterbacaan 100% Sempurna**: Teks cerita panjang, paragraf bahasa Indonesia, atau soal IPA bergambar dapat dibaca dengan sangat leluasa tanpa gangguan.
  - **Fokus Tinggi**: Mencegah salah pencet jawaban sebelum selesai membaca soal secara utuh.
- **Kekurangan**: Membutuhkan 1 ketukan ekstra untuk memunculkan lembar jawaban.
- **Target Pengguna**: Sangat direkomendasikan untuk soal cerita panjang, soal literasi AKM/ANBK, atau pemain di smartphone berlayar kecil.

---

### 🟣 OPSI 3: Mode Kompak Adaptif (Compact Dual-Bar + Smart Grid 2×2)

Mode aksi cepat satu layar (*Zero-Scroll Instant*). Bos dan pemain diringkas ke dalam bilah ganda (*Dual Versus Bar*), sedangkan pilihan jawaban disusun secara cerdas:
- Jika teks pilihan pendek (< 25 karakter): Otomatis menjadi **Grid 2 Kolom × 2 Baris** (hemat 60% ruang vertikal).
- Jika teks pilihan panjang: Disusun dalam 4 baris ramping dengan padding efisien.

#### 🖼️ Wireframe Opsi 3 (Satu Layar Penuh Tanpa Scroll):
```
┌──────────────────────────────────────────┐
│ [✕] ⚡ 3/5       Soal 1/10      [⚡ Skill]│  ◄── Top Bar Ringkas
├──────────────────────────────────────────┤
│ [🐲 Jamurgon 319 HP] VS [Kamu 100 HP 🛡️] │  ◄── Bilah Ganda Bersebelahan (~38px)
├──────────────────────────────────────────┤
│ [🛡️ +10] [💨 4%] [🪙 +2%] [👑 +5%/Stk]   │  ◄── Ikon Mikro Pasif Skin (~22px)
├──────────────────────────────────────────┤
│ ════════════════════════════════════════ │  ◄── Timer Tipis Glow (3px)
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │  ◄── PANGGUNG SOAL LEGA (38% Layar)
│ │ 🎯 TITIK LEMAH                  [🔊] │ │      Teks terbaca jelas di tengah,
│ │ "Simbiosis mutualisme lebah dan      │ │      bebas himpitan.
│ │  bunga terjadi karena..."            │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│  SMART ANSWER GRID (Pilihan Singkat 2×2):│  ◄── OPSI GRID RESPONSIF (35% Layar)
│ ┌───────────────────┬───────────────────┐│      Menghemat tinggi vertikal
│ │ [A] Lebah bertelur│ [B] Saling untung ││      hingga 60%!
│ ├───────────────────┼───────────────────┤│
│ │ [C] Bunga layu    │ [D] Madu hilang   ││
│ └───────────────────┴───────────────────┘│
└──────────────────────────────────────────┘
```

#### Karakteristik Opsi 3:
- **Kelebihan**: 
  - **Refleks Cepat (Instant Action)**: Pertanyaan dan jawaban terlihat bersamaan dalam 1 pandangan layar tanpa butuh ketukan tambahan.
  - **Zero-Scroll Dijamin**: Tidak ada elemen yang terpotong pada resolusi ponsel apapun.
- **Kekurangan**: Avatar bos berukuran kecil (36px).
- **Target Pengguna**: Pemain yang menginginkan tempo bermain cepat, adu refleks combo, atau pertarungan PvP duel.

---

## 4. Matriks Perbandingan 3 Opsi

| Parameter Evaluasi | Opsi 1: Mode Klasik (Default) | Opsi 2: Mode Baca + Lembar Jawaban | Opsi 3: Mode Kompak Adaptif |
|---|---|---|---|
| **Status Default** | **Ya (Default bawaan)** | Tidak (Dapat dipilih di Setting) | Tidak (Dapat dipilih di Setting) |
| **Keterbacaan Teks Soal** | Cukup (sering terhimpit) | **Sangat Luas (Layar Penuh)** | **Lega & Pas di Tengah** |
| **Jumlah Ketukan Menjawab** | 1 Ketukan langsung | 2 Ketukan (Buka Sheet ➔ Jawab) | **1 Ketukan langsung** |
| **Keberadaan Scroll** | Sering scroll di HP kecil | **0% Bebas Scroll** | **0% Bebas Scroll** |
| **Paling Cocok Untuk** | Layar tablet / pecinta visual bos | Soal cerita panjang, gambar, literasi | Kuis cepat, matematika, duel PvP |
| **Ukuran Avatar Bos** | Besar (80–100px) | Ringkas (36px) | Kompak (36px) |
| **Tata Letak Opsi Jawaban**| Stack 4 baris tinggi | Bottom Sheet Drawer mengambang | Smart Grid 2×2 / Stack ramping |

---

## 5. Rencana Penerapan Teknis di Codebase

Penerapan fitur ini dirancang secara non-breaking dan aman dari regresi:

### 1. Penyimpanan Konfigurasi Pemain:
- Di `Settings` (`public/js/app.js`):
  ```javascript
  // Default fallback adalah 'classic'
  battleLayout: Settings.get('battleLayout') || 'classic', // 'classic' | 'bottom_sheet' | 'compact'
  ```
- Di Menu Pengaturan (`Screens.settings.render`):
  Ditambahkan pilihan radio selector interaktif pada seksi `Tampilan & Gameplay`:
  ```html
  <div style="margin-top:12px">
    <strong style="display:block;margin-bottom:4px">Tampilan Soal & Jawaban</strong>
    <select id="sel-battle-layout" class="input small">
      <option value="classic">Klasik (Default Bawaan)</option>
      <option value="bottom_sheet">Baca Penuh + Lembar Jawaban (Bottom Sheet)</option>
      <option value="compact">Kompak Adaptif (Smart Grid 2x2)</option>
    </select>
  </div>
  ```

### 2. Implementasi Renderer di Layar Battle:
- Pada `Screens.battle.render(app)`:
  Membaca nilai `Settings.get('battleLayout')`:
  - Jika `classic` (default): Menjalankan tata letak saat ini tanpa perubahan logika.
  - Jika `bottom_sheet`: Merender pertanyaan dalam kartu layar penuh, menyembunyikan kontainer opsi, dan menampilkan tombol `[ ✍️ Jawab Sekarang ]` yang membuka drawer lembar jawaban.
  - Jika `compact`: Merender *Compact Versus Bar* di bagian atas dan menerapkan kelas CSS `.options-grid-2x2` otomatis jika opsi berkarakter pendek.

---

## 6. Rekomendasi & Langkah Selanjutnya

1. **Persetujuan Pengguna**: Pengguna dapat meninjau ketiga opsi di atas.
2. **Eksekusi Bertahap**:
   - Menambahkan opsi pemilih di menu `Screens.settings` dengan nilai default `classic`.
   - Mengimplementasikan CSS & template untuk `bottom_sheet` dan `compact`.
   - Melakukan uji fungsionalitas di berbagai ukuran layar smartphone (360×640, 390×844, 412×915).
