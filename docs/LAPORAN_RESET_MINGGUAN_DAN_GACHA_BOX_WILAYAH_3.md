# LAPORAN IMPLEMENTASI: MODE CERITA RESET MINGGUAN & PENYESUAIAN GACHA BOX WILAYAH 3
**Game Portal**: [https://play.printshare.my.id/](https://play.printshare.my.id/)  
**Target Server**: Game Server (`192.168.0.222`)  
**Status**: ðŸš€ Berhasil Diimplementasikan, Diverifikasi (37/37 Tests Pass), & Live di Server

---

## 1. Ringkasan Pembaruan

Berdasarkan arahan pengguna, telah diselesaikan dua pembaruan besar pada sistem **Mode Cerita (Campaign)**:

1. **Aturan 1Ã— Main per Minggu & Reset Mingguan (Senin 07:00 WIB)**:
   - Setiap wilayah (Wilayah 1, Wilayah 2, dan Wilayah 3/Boss) di seluruh bab hanya dapat diselesaikan **1 kali** dalam siklus 1 minggu.
   - Seluruh wilayah otomatis di-reset kembali setiap hari **Senin pukul 07:00:00 WIB** (setara dengan Senin pukul 00:00:00 UTC).
   - Setelah reset Senin 07:00 WIB, pemain dapat mengulang kembali perjalanan petualangan dari awal untuk mendapatkan hadiah mingguan baru.

2. **Penyesuaian Gacha Rate Hadiah Box Wilayah 3**:
   - Peluang gacha hadiah peti harta karun saat menaklukkan Boss Bab (Wilayah 3) telah diperbarui dengan persentase:
     - ðŸ‘‘ **Skin Legend**: **5%**
     - âš¡ **Skin Epic**: **10%**
     - âœ¨ **Skin Rare**: **15%**
     - ðŸ›¡ï¸ **Skin Common**: **25%**
     - ðŸª™ **Koin Petualang (10 s/d 50 Koin)**: **45%** (sisanya)
   - Total peluang skin (55%) + drop koin (45%) = **100%**.
   - Ketika peti menjatuhkan koin, jumlah koin bernilai acak antara 10 sampai 50 koin dan langsung ditambahkan ke saldo pemain dengan tampilan modal khusus pundi emas.

---

## 2. Rincian Teknis & Arsitektur Implementasi

### A. Waktu Reset Mingguan & Mekanisme 1Ã— per Wilayah
- **Konversi Waktu Presisi**:
  - `WIB = UTC + 7 Jam`.
  - Hari Senin pukul `07:00:00 WIB` = Hari Senin pukul `00:00:00 UTC`.
  - Fungsi `getWeeklyResetTime(now)` menghitung batas awal minggu berjalan (Senin 00:00:00 UTC).
  - Fungsi `getNextWeeklyResetTime(now)` menghitung batas reset Senin berikutnya (+7 hari).
- **Logika Otomatisasi (Zero-Cron Overhead)**:
  - Timestamp penyelesaian node disimpan di kolom `cleared_at` pada tabel `player_campaign_nodes`.
  - Sifat reset bekerja secara deterministik: jika `cleared_at >= lastWeeklyResetIso`, node dianggap sudah selesai minggu ini (`clearedThisWeek: true`, `canPlay: false`).
  - Ketika waktu melewati Senin pukul 07:00 WIB, secara matematis timestamp minggu lalu berada di bawah batas waktu baru (`cleared_at < lastWeeklyResetIso`), sehingga seluruh wilayah otomatis terbuka kembali tanpa risiko database lock atau beban cron job berat.
- **Validasi Server-Authoritative Anti-Exploit**:
  - Di `lib/db.js` (`startSession`), request sesi dengan `campaignNode` diverifikasi terhadap database. Jika pemain mencoba memulai sesi pada wilayah yang sudah selesai di minggu yang sama, server langsung melempar error:
    `NODE_ALREADY_CLEARED_THIS_WEEK`: *"Wilayah ini sudah kamu selesaikan minggu ini! Mode cerita reset setiap hari Senin pukul 07:00 WIB."*

### B. Distribusi Drop Box Wilayah 3 (Boss Bab)
- Gacha diimplementasikan melalui fungsi terpusat `rollChapterChestReward(db, playerId, ecoCfg)`:
  ```javascript
  const roll = crypto.randomInt(0, 100); // 0 s/d 99
  // 0..4   (5%)  -> LEGENDARY Skin
  // 5..14  (10%) -> EPIC Skin
  // 15..29 (15%) -> RARE Skin
  // 30..54 (25%) -> COMMON Skin
  // 55..99 (45%) -> COIN (Acak 10 s/d 50 Koin)
  ```
- **Simulasi 20.000 Rolls**:
  - `COMMON`: 4.979 (24.89%) â€” *Target: 25%*
  - `RARE`: 3.065 (15.32%) â€” *Target: 15%*
  - `EPIC`: 1.983 (9.92%) â€” *Target: 10%*
  - `LEGENDARY`: 1.061 (5.30%) â€” *Target: 5%*
  - `COIN`: 8.912 (44.56%) â€” *Target: 45%* (Rata-rata 30.0 koin, min 10, max 50).

---

## 3. Pembaruan Antarmuka Pengguna (UI/UX)

1. **Banner Informasi Reset Mingguan di Peta Cerita**:
   - Di bagian atas layar peta cerita (`loadCampaignMap`), terdapat kartu informasi:
     `ðŸ—“ï¸ Mode Cerita Mingguan: Hanya 1Ã— Tiap Wilayah Â· Seluruh wilayah otomatis di-reset setiap Senin pukul 07:00 WIB!`
2. **Indikator Visual Node Wilayah**:
   - Wilayah yang telah selesai di minggu berjalan diberi tanda centang hijau `âœ…`, border emerald bercahaya, dan label `(Selesai)`.
   - Jika tombol wilayah selesai diketuk, muncul notifikasi:
     *"Wilayah ini sudah selesai minggu ini! Reset berikutnya hari Senin pukul 07:00 WIB. ðŸ—“ï¸"*
3. **Modal Pembukaan Peti Wilayah 3 (`Screens.showChapterChestModal`)**:
   - **Jika Mendapat Koin**: Menampilkan animasi peti terbuka dengan pundi koin emas raksasa ðŸª™, judul `ðŸª™ DROP KOIN PETUALANG WILAYAH 3! ðŸª™`, subjudul `+X Koin Emas`, dan tombol klaim koin yang memicu sound effect koin `Feedback.sfx('coin')`.
   - **Jika Mendapat Skin Common/Rare/Epic/Legend**: Menampilkan visual kartu pop-in (`itemPopIn`), rotasi cahaya (`chestRaysSpin`), dan partikel konfeti berjatuhan (`confettiFall`).

---

## 4. Hasil Pengujian Otomatis

Seluruh 37 subtest di remote server game lolos **100% PASS**:

```
TAP version 13
# Subtest: Mode Cerita: Reset Mingguan Senin 07:00 WIB & Gacha Box Wilayah 3
    ok 1 - 1. Perhitungan Waktu Reset Mingguan Tepat Hari Senin Jam 07:00 WIB (00:00 UTC)
    ok 2 - 2. Selesaikan Wilayah 1-1, maka Wilayah 1-1 hanya bisa 1x per minggu
    ok 3 - 3. Reset Mingguan: Setelah waktu reset Senin 07:00 WIB, wilayah dapat dimainkan kembali
    ok 4 - 4. Gacha Box Wilayah 3: Menghasilkan hadiah sesuai rate baru (Common, Rare, Epic, Legend, Koin)
ok 1 - Mode Cerita: Reset Mingguan Senin 07:00 WIB & Gacha Box Wilayah 3 (PASS)

# Subtest: Skenario 13.2 #10 / T-34: Peta Cerita / Kampanye
    ok 1 - 1. Struktur Kampanye: 4 bab x 3 wilayah, wilayah 1 terbuka default, sisanya terkunci
    ok 2 - 2. Memulai simpul terkunci -> NODE_LOCKED error
    ok 3 - 3. Memulai dan Menyelesaikan Wilayah 1-1 (First Clear Reward)
    ok 4 - 4. Aturan 1x per Minggu & Replay Setelah Reset Mingguan
    ok 5 - 5. Selesai Boss Bab 1-3: Bab 2 Terbuka, Dapat Item Skin / Koin Box & Komik
ok 2 - Skenario 13.2 #10 / T-34: Peta Cerita / Kampanye (PASS)

# Subtest: Battle Ending Spectacular Modal & Auto-Transition
    ok 1 s/d ok 5 - Animasi Win/Loss Spektakuler & Auto Transition (PASS)

# Regression Test Suite
    ok - T-23 & T-24: Story Data, Dialog Boss, Reaksi Pet (PASS)
    ok - T-25: Audio Sintesis & Haptic Feedback (PASS)
    ok - T-26: Pesan Kalah Ramah Anak & Tip Belajar (PASS)
    ok - UI Boss Tier & Auroras (PASS)
    ok - Visual 3D Upgrade: Monsters Suite (PASS)
    ok - Visual 3D Upgrade: Avatar & Skin Suite (PASS)
    ok - Visual 3D Upgrade: CSS & Integrasi HTML Suite (PASS)

# tests 37
# pass 37
# fail 0
# duration_ms 1204ms
```

---

## 5. Status Deployment Server

- **Layanan PM2**: `play` (PID: 485641, Status: Online, Port: 3002).
- **Cache-Busting Assets**: `public/js/app.js?v=20261107v2`.
- **Live URL**: [https://play.printshare.my.id/](https://play.printshare.my.id/) (HTTP 200 OK).
