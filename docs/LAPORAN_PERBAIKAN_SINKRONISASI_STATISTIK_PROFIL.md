# LAPORAN PERBAIKAN SINKRONISASI DATA STATISTIK PROFIL & MONSTER DEX

**Tanggal:** 8 November 2026  
**Layanan Target:** `https://play.printshare.my.id/`  
**Host Remote:** `192.168.0.222` (Directory: `/home/maman/play`, PM2 ID: `3`)  
**Status:** ✅ **SELESAI & TERVERIFIKASI PENUH**

---

## 1. Latar Belakang & Analisis Masalah

Berdasarkan laporan dan screenshot pengguna pada tab profil statistik karakter:
1. **Hari Belajar:** Tertulis **1 Hari**, padahal pemain (`bayu`, ID: 8) telah aktif belajar setiap hari selama **7 hari berturut-turut** (`2026-11-02` s/d `2026-11-08`).
2. **Monster Dex:** Tertulis **15 / 40**, yang tidak sinkron dengan katalog Monster Dex di layar utama yang mencatat total **100 Monster** (10 Tema Elemen × 10 Tingkat Monster).
3. **Akurasi Jawaban & Rasio Menang:** Tertulis **Akurasi Jawaban: 1%** dan **Rasio Menang: 9%**, angka yang tidak masuk akal untuk pemain Level 13 yang telah mengalahkan 18 bos dan meraih kombo 14x.

### Akar Masalah Teknis (Root Causes):
- **Hari Belajar:** Kolom `day_streak` di tabel `players` tidak pernah memiliki logika pembaruan saat login atau menyelesaikan sesi, sehingga nilainya macet pada nilai default `1`.
- **Monster Dex:** Di `public/js/app.js` baris 5752, angka penyebut di-hardcode mati menjadi `${stats.dexDefeated || 0} / 40` dari versi game sebelum v7.
- **Akurasi Jawaban & Rasio Menang:** Pada tanggal 5 November 2026, terdapat 121 sesi battle kosong/abandoned yang memiliki `total_questions = 242` dengan `correct_count = 0`. Query `getPlayerProfile` sebelumnya melakukan `SUM(total_questions)` dari seluruh sesi tanpa filter, menghasilkan 37.219 soal bank. Pembagian `409 benar / 37.219 = 1.09% (1%)`. Demikian juga rasio menang dibagi dengan 196 sesi kosong sehingga jatuh ke 9%.

---

## 2. Rincian Perubahan & Implementasi

### A. Algoritma Perhitungan Hari Aktif & Streak (`lib/db.js`)
Dibuat fungsi utilitas baru `calculatePlayerStreakAndDays(db, playerId)`:
- Menghimpun seluruh tanggal unik (format `YYYY-MM-DD`) dari gabungan tabel:
  - `game_sessions` (`created_at`)
  - `player_question_stats` (`last_seen_at`)
  - `player_subject_progress` (`last_played_at`)
- Menghitung streak hari berturut-turut secara dinamis ke belakang dari hari ini atau kemarin (mempertahankan toleransi hari berjalan).
- Menyimpan dan menyinkronkan nilai `day_streak` dan `last_active_date` ke tabel `players` setiap kali profil dimuat atau sesi diselesaikan.

### B. Sinkronisasi Monster Dex (`lib/db.js` & `public/js/app.js`)
- Mengambil total monster dinamis dari katalog `MONSTERS.length` (100).
- Menggabungkan perhitungan monster yang telah dikalahkan (`dexDefeated`) dan ditemui (`dexEncountered`) dari gabungan `player_monsters` dan `game_sessions`.
- Memperbarui tampilan profil di `app.js`:
  ```html
  <div class="profile-stat-box" title="${stats.dexDefeated || 0} Bos Dikalahkan · ${stats.dexEncountered || 0} Ditemui dari ${stats.totalMonsters || 100} Monster">
    <span class="stat-icon">📖</span>
    <span class="stat-val">${stats.dexDefeated || 0} / ${stats.totalMonsters || 100}</span>
    <span class="stat-label">Monster Dex</span>
  </div>
  ```

### C. Normalisasi Akurasi Jawaban & Rasio Menang (`lib/db.js` & `public/js/app.js`)
- **Akurasi Jawaban:** Dihitung dari soal yang benar-benar dijawab pemain di tabel `session_questions WHERE answered_at IS NOT NULL`:
  $$\text{Akurasi} = \frac{409 \text{ Benar}}{897 \text{ Dijawab}} \times 100\% = 46\%$$
- **Rasio Menang:** Dihitung dari sesi yang benar-benar dimainkan (`playedSessions` = 74, mengecualikan sesi kosong/abandoned tanpa jawaban):
  $$\text{Rasio Menang} = \frac{18 \text{ Menang}}{74 \text{ Sesi Dimainkan}} \times 100\% = 24\%$$
- Menambahkan tooltip informatif pada hover kartu statistik untuk transparansi rincian data.

### D. Dampak Terhadap Lencana Prestasi (Badges)
Dengan pembaruan `day_streak` menjadi 7 hari, pemain `bayu` kini memenuhi syarat lencana **Disiplin Belajar Harian (`daily_dedication`)**:
- ✅ **Langkah Istiqomah (COMMON - 2 Hari):** Terbuka (+15 Koin, +15 XP)
- ✅ **Ksatria Tekun (RARE - 4 Hari):** Terbuka (+45 Koin, +45 XP)
- Total lencana terbuka naik dari **25 / 80** menjadi **27 / 80** dengan notifikasi banner: *🎁 Ada 2 hadiah lencana siap diklaim!*

---

## 3. Komparasi Data Statistik Pemain (Sebelum vs Sesudah)

| Parameter Statistik | Sebelum Perbaikan | Sesudah Perbaikan | Keterangan / Sumber Data |
| :--- | :---: | :---: | :--- |
| **Hari Belajar** | `1 Hari` | **`7 Hari`** | Aktif berturut-turut dari 2–8 Nov 2026 |
| **Monster Dex** | `15 / 40` | **`15 / 100`** | 15 Dikalahkan & 40 Ditemui dari 100 Boss Katalog |
| **Akurasi Jawaban** | `1%` | **`46%`** | 409 Soal Benar dari 897 Soal yang Dijawab |
| **Rasio Menang** | `9%` | **`24%`** | 18 Kemenangan dari 74 Sesi Dimainkan |
| **Bos Dikalahkan** | `18` | **`20`** | 18 Boss Sesi + 2 Boss Peta Cerita |
| **Total Bintang** | `22` | **`22`** | 22 Bintang terakumulasi |
| **Rekor Kombo** | `14×` | **`14×`** | Kombo beruntun tertinggi |
| **Jawaban Kritis** | `195` | **`195`** | Critical hits terakumulasi |
| **Lencana Prestasi** | `25 / 80` | **`27 / 80`** | +2 Lencana Disiplin Belajar Terbuka |

---

## 4. Pengujian & Verifikasi

1. **Unit Testing (`tests/stats-sync.test.js`):**
   - Subtest 1: Perhitungan streak hari beruntun dan hari aktif: **PASS**
   - Subtest 2: Sinkronisasi data profil dan total monsters (100): **PASS**
   - Subtest 3: Evaluasi keterbukaan lencana `daily_dedication`: **PASS**
2. **Uji Produksi Remote:**
   - Berkas disinkronkan ke `/home/maman/play/lib/db.js` dan `/home/maman/play/public/js/app.js`.
   - Layanan PM2 `play` (ID: 3) di-restart tanpa downtime.
   - Endpoint `/api/profile` untuk pemain ID 8 diverifikasi secara langsung dan menghasilkan data yang akurat.
