# Dokumentasi Arsitektur Petualangan Pelajar v6

Dokumen ini merangkum pembaruan arsitektur sistem pada versi 6 (v6.0) untuk platform **Petualangan Pelajar** (`play.printshare.my.id`), mencakup Fitur A sampai F serta penguatan sistem server dan frontend.

---

## 1. Fitur A: Menu Laporan Mingguan (Weekly Report v2)
- **Endpoint**:
  - `GET /api/report/week?week=YYYY-Www` (tanpa query `week` mengembalikan minggu berjalan dengan label `partial: true` / "Sementara").
  - `POST /api/report/share` (membuat tautan publik portal berbagi ber-token acak 32 hex bytes dengan hash SHA-256 tersimpan di tabel `report_shares`).
  - `DELETE /api/report/share` (pencabutan token aktif secara instan).
  - `GET /r/:token` (portal publik responsif ramah wali murid menampilkan 6 kartu metrik, grafik SVG 7 hari, penguasaan topik, dan level kemampuan per mapel).
- **Komponen UI**:
  - Kartu ringkasan 6 metrik: Sesi Dimainkan, Akurasi Rata-rata, Waktu Belajar, Soal Dikuasai, Koin Diperoleh, dan Distribusi Boss per Tier.
  - Grafik SVG batang 7 hari (Senin–Minggu) dengan penanda target harian.
  - Navigasi ◀▶ untuk menelusuri riwayat laporan minggu-minggu lampau.

---

## 2. Fitur B: Level Kemampuan per Mapel
- **Klasifikasi Level** (1–5):
  - Lv 1 (0–19): Pemula 🌱
  - Lv 2 (20–39): Penjelajah 🧭
  - Lv 3 (40–59): Petualang ⚔️
  - Lv 4 (60–79): Ahli 🛡️
  - Lv 5 (80–100): Master 👑
- **Rumus Skor Kemampuan**:
  - `Skor = round(100 × (0.6 × Mastery + 0.3 × Accuracy + 0.1 × Coverage))`
  - Bobot kesulitan soal: `1 + 0.25 × (difficulty - 1)` (rentang 1..5).
  - Status data: `MEASURED` (≥8 percobaan), `INSUFFICIENT` (1–7 percobaan), `NONE` (0 percobaan).
- **Pengurutan**:
  - Diurutkan **NAIK** (skor terendah di posisi teratas).
  - Mapel terendah terukur ditandai dengan lencana `🎯 Fokus Latihan` dan tombol `🎯 Latihan {mapel}`.
  - Mapel `INSUFFICIENT` diletakkan setelah `MEASURED`, dan `NONE` di paling akhir.

---

## 3. Fitur C: Boss Bertier (Common, Rare, Epic, Legend)
- **Definisi & Multiplier**:
  | Tier | Ikon & Warna | Rentang Hit (N) | Jatah Salah | Pengali Koin | Pengali XP |
  |---|---|---|---|---|---|
  | **Common** | ⚪ `#9AA5B1` | 15–18 | 90% × N | ×1.0 | ×1.0 |
  | **Rare** | 🔵 `#3B82F6` | 18–22 | 80% × N | ×1.3 | ×1.2 |
  | **Epic** | 🟣 `#A855F7` | 22–26 | 70% × N | ×1.7 | ×1.5 |
  | **Legend** | 🟡 `#F59E0B` | 26–30 | 62% × N | ×2.3 | ×2.0 |
- **Penentuan Tier**:
  - **Mode Bebas**: Diundi berdasarkan level profil pemain.
    - Lv 1–5: 70% Common, 25% Rare, 5% Epic, 0% Legend.
    - Lv 6–10: 45% Common, 35% Rare, 17% Epic, 3% Legend.
    - Lv 11–20: 30% Common, 35% Rare, 25% Epic, 10% Legend.
    - Lv 21+: 20% Common, 30% Rare, 30% Epic, 20% Legend.
  - **Peta Kampanye**: Ditentukan secara deterministik per simpul bab (1..5 × 1..4).
- **Visual SVG Monster**:
  - Common: Monster SVG bersih standar.
  - Rare: Aura radial gradient biru lembut (`.aura-rare`).
  - Epic: Aura ungu (`.aura-epic`) + sparkle bintang (`.tier-sparks`).
  - Legend: Aura emas berdenyut (`.aura-legend`) + mahkota bertakhta permata (`.tier-crown`) + sparkle emas.
  - Mendukung `@media (prefers-reduced-motion: reduce)` dan `body.reduced-motion`.

---

## 4. Fitur D: Darah Boss Adaptif & Pertarungan Dinamis
- **Model HP & Damage**:
  - `boss_max_hp = N × 20` (di mana 1 jawaban benar baku = 20 damage / 1 hit unit).
  - Kerusakan di-clamp: Minimum 20 (lantai 1 hit), maksimum 80 (plafon 4× kombinasi combo + skill + pity).
  - **Lantai 15 Jawaban Benar**: HP boss dikunci pada minimum 1 HP jika total jawaban benar pemain belum mencapai 15.
- **Pity (Serangan Balik)**:
  - Setelah 3 jawaban salah berturut-turut, jawaban benar berikutnya mendapatkan pengganda damage ×1.5 dan lencana `💪 Serangan Balik`.
- **Kelelahan Boss (Fatigue)**:
  - Saat transisi Fase Marah (HP ≤ 50%), jika akurasi sesi < 55% setelah menjawab ≥ 6 soal, HP boss dipotong 15% (dengan lantai 15 hit tetap terjaga) dan menampilkan banner `Boss mulai kelelahan! 😮‍💨`.
- **Panjang Sesi Dinamis (Refill)**:
  - Jika sisa soal ≤ 2 dan boss masih hidup, server secara otomatis menginjeksi +5 soal baru ke sesi dengan mempertahankan kuota Spaced Repetition (SRS ≤ 30%), Titik Lemah (≥ 20%), dan variasi tipe soal (maks 2 non-MCQ berurutan).
  - Batas maksimum soal per sesi dibatasi oleh `max_questions = min(50, N + wrongBudget + 6)`.

---

## 5. Fitur E: Perbaikan Upgrade Skill (P0)
- **Transaksi Atomik SQLite**:
  - `POST /api/skills/:id/upgrade` mewajibkan header `Idempotency-Key` (400 jika tidak disertakan).
  - Koin dipotong melalui `applyCoins` dengan mutasi kolom `amount` dan `delta` secara konsisten serta pencatatan audit log `SKILL_UPGRADE:{id}:{level}`.
  - Transaksi membungkus validasi kepemilikan, kecukupan koin, batas maksimum level (`MAX_LEVEL = 5`), penambahan level, pemotongan koin, dan pencatatan idempotensi.
- **Scaling Efek di Pertempuran**:
  - Efek skill battle bersumber murni dari `player_skills.level` hasil upgrade (bukan level profil pemain).
  - Snapshot loadout disimpan saat sesi dimulai (`startSession`) agar sesi yang sedang berjalan terlindungi dari inkonsistensi saat pemain melakukan upgrade di tengah pertarungan.

---

## 6. Fitur F: Kapasitas Energi Bertambah per Level Profil
- **Kapasitas**:
  - Rumus: `kapasitas = min(12, 5 + floor((levelProfil - 1) / 5))`.
  - Lv 1–5 = 5 energi; Lv 6–10 = 6; Lv 11–15 = 7; Lv 16–20 = 8; Lv 21–25 = 9; Lv 26–30 = 10; Lv 31–35 = 11; Lv 36+ = 12 (maksimum).
- **Akumulasi & Clamping**:
  - Seluruh perolehan energi (+1 tiap 3 jawaban benar, +1 Fase Marah, Jimat Pedagang) di-clamp ke `energy_max`.
  - UI bilah energi menampilkan `nilai/kapasitas` dengan pip adaptif yang muat rapi pada layar 320 px (tanpa wrapping/overflow).

---

## 7. Skema Database & Migrasi (SQLite)
Kolom aditif yang ditambahkan secara idempoten pada tabel:
- `game_sessions`: `boss_tier`, `boss_hits_needed`, `boss_hit_unit`, `monster_damage`, `max_questions`, `correct_count`, `wrong_streak`, `fatigue_applied`, `energy_max`.
- `player_skills`: `level`.
- `report_shares`: Tabel penampung token berbagi laporan publik (`token_hash`, `expires_at`, `created_at`).
