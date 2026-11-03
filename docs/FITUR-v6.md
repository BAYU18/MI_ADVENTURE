# 🎮 PERINTAH AGENT — Fitur v6: Laporan Belajar, Level Kemampuan, Boss Bertier, Darah Boss Adaptif, Upgrade Skill & Energi per Level

Anda adalah agent pengembang untuk **Petualangan Pelajar** (`https://play.printshare.my.id`, sistem v5.2 di `/home/maman/play`, Node.js murni + `node:sqlite`, frontend Vanilla JS, **tanpa framework & tanpa dependensi npm baru**). Dokumen ini berisi **6 pekerjaan**. Spesifikasi sudah memuat angka dan rumus; logika murninya **sudah ditulis dan diuji** di Lampiran A–C (salin persis, jangan menulis ulang).

> **Cara kerja wajib:** ikuti **Bagian 00 (Protokol Ceklis)**. Status pekerjaan disimpan di `docs/PROGRESS-v6.md`, bukan di ingatan Anda. Jangan mengulang tugas yang sudah `[x]`.

**Dokumen ini berdiri sendiri** untuk fitur A–F. Sistem lain (akun, ekonomi koin, toko, resume sesi, kampanye, 5 tipe soal, laporan mingguan, kejutan tengah sesi, SRS, pacing waktu) mengikuti arsitektur v5.2 yang sudah berjalan dan **tidak boleh rusak**.

---

## 00. PROTOKOL CEKLIS PROGRES — WAJIB, BACA PERTAMA

**Mengapa:** agent yang tidak punya catatan akan mengulang tugas yang sama sampai iterasi habis. `scripts/progress.mjs` menyimpan ceklis di `docs/PROGRESS-v6.md` dan **menolak** pengulangan tugas selesai, loncat urutan, dan percobaan berlebih.

### 00.1 Persiapan (sekali, paling awal)
1. Buat `scripts/progress.mjs` dari **Lampiran D** (salin persis). Tambahkan ke `package.json` → `"scripts"`: `"progress": "node scripts/progress.mjs"`.
2. Simpan dokumen ini sebagai `docs/FITUR-v6.md`, lalu jalankan `npm run progress -- init docs/FITUR-v6.md` (membuat `docs/PROGRESS-v6.md` dari **Lampiran E**; menolak menimpa bila sudah ada — itu benar).
3. Jalankan `npm run progress -- status` dan kerjakan tugas yang tampil.
   - Bila dokumen ini diperbarui di tengah jalan: `npm run progress -- sync docs/FITUR-v6.md` (hanya menambah tugas baru).

### 00.2 Siklus WAJIB tiap tugas
```
① npm run progress -- status                 # awal SETIAP giliran: baca HANDOFF + tugas BERIKUTNYA
② npm run progress -- start T-xx             # tandai [~]; ditolak bila urutan salah / sudah selesai / sudah 2× dicoba
③ Baca HANYA bagian spesifikasi yang tertera di tugas; cek dulu apakah kodenya sudah ada (grep / git log)
④ Kerjakan tugas itu saja → jalankan tes yang tertera di "Bukti"
⑤ npm run progress -- done T-xx "file diubah · perintah tes · hasil"    # bukti WAJIB
⑥ git add -A && git commit -m "v6(T-xx): ringkasan"                     # bila repo git
⑦ Kembali ke ① — jangan berhenti bertanya kecuali ada blokir nyata
```
Tidak bisa selesai → `npm run progress -- block T-xx "alasan"` lalu lanjut. Kemajuan sebagian → `npm run progress -- note T-xx "server selesai, UI belum"`.

### 00.3 Aturan anti-looping
1. Tugas `[x]` **tidak** dikerjakan/diaudit/ditulis ulang. Tes gerbang gagal → catat lewat `note` pada gerbang, buat perbaikan **terarah**, jangan membuka ulang tugas lama.
2. **Audit hanya sekali (T-00)**; hasil dicatat lewat `note`. Dilarang audit ulang di awal giliran.
3. Satu tugas pada satu waktu. Maks **2 percobaan** per tugas; ke-3 ditolak skrip → `block` + alasan.
4. **Cek sebelum membuat** (file/fungsi/kolom/endpoint). Sudah ada & benar → verifikasi lalu `done`.
5. Ubah hanya file yang dibutuhkan tugas; jangan menulis ulang file besar untuk perubahan kecil (gunakan edit/patch).
6. Gerbang (G-0…G-3) wajib hijau sebelum fase berikutnya.
7. **Deteksi diri:** akan melakukan sesuatu yang sudah tercatat di bukti tugas mana pun → berhenti, jalankan `status`.

### 00.4 Hemat iterasi & serah-terima
- Jangan membaca seluruh dokumen tiap giliran: `grep -n '^## \|^### ' docs/FITUR-v6.md`, lalu `sed -n 'A,Bp'` bagian yang dirujuk tugas.
- Tes relevan per tugas; suite penuh hanya di gerbang. Jangan mencetak berkas besar.
- Tiap 3 tugas (atau saat sisa iterasi/konteks ≤ 15%): `npm run progress -- handoff "tugas berikutnya + yang setengah jalan + file disentuh"` **sebelum** mulai pekerjaan baru. Jangan mulai tugas yang tak akan selesai di sisa iterasi.
- "Lanjut" = ① `status`. Tugas `[~]` dari giliran lalu: baca catatan 📝 + `git status/diff`, **lanjutkan** (bukan mulai dari nol).
- File progres hilang/rusak: rekonstruksi dari `git log --oneline | grep "v6(T-"`; jangan `init` ulang sebelum yakin file benar-benar hilang.
- Sebelum menutup: `npm run progress -- check` harus "ceklis valid".

### 00.5 Perintah skrip
| Perintah | Fungsi |
|---|---|
| `status` / `next` | ringkasan progres / baris tugas berikutnya |
| `start T-xx` | tandai `[~]` (menolak: selesai, urutan salah, tugas lain berjalan, > 2 percobaan) |
| `note T-xx "teks"` | catat kemajuan sebagian / temuan |
| `done T-xx "bukti"` | tandai `[x]` + bukti (wajib) |
| `block T-xx "alasan"` | tandai `[!]` + alasan (wajib) |
| `handoff "teks"` | catatan serah-terima di bagian atas file |
| `sync <doc>` | tambah tugas baru dari dokumen yang diperbarui |
| `check` | validasi ceklis |

---

## 0. Ruang lingkup dan aturan kerja

| Kode | Fitur | Prioritas |
|---|---|---|
| A | **Isi menu Laporan** di halaman utama (saat ini kosong) | P0 |
| B | **Level kemampuan per mata pelajaran**, diurutkan dari nilai **terkecil** ke terbesar (tampil di menu Laporan) | P0 |
| C | **Boss bertier** `common / rare / epic / legend` (di samping tema lokasi/habitat) | P0 |
| D | **Darah boss adaptif**: habis dengan **15–30 jawaban benar** sesuai tier agar tidak membosankan | P0 |
| E | **Perbaikan fitur upgrade skill** yang belum berjalan | P0 |
| F | **Energi bertambah menurut level profil** (Lv 1–5 = 5 energi per battle, makin tinggi level makin besar) | P0 |

**Aturan kerja**
1. **Audit SEKALI (T-00)**, lalu perbaiki/tambah di atas yang ada. Jangan menulis ulang aplikasi; jangan menghapus data pemain; jangan mengubah bank soal/kurikulum.
2. **Server otoritatif:** hasil jawaban, damage, tier, HP, energi, koin dihitung server. Klien hanya menampilkan.
3. **Zero-dependency.** Tidak ada paket npm baru. Logika baru yang dipakai server **dan** klien ada di `shared/progression.js` (UMD, Lampiran A). Bila `shared/economy.js`/`gameplay.js` sudah punya padanan (mis. tabel efek skill, level profil, combo), **pakai yang sudah ada sebagai sumber tunggal** dan buat `progression.js` mengacu ke sana — jangan menyimpan dua versi angka.
4. **Migrasi aditif saja** (`ALTER TABLE … ADD COLUMN`, default aman), idempoten (cek `PRAGMA table_info`), **backup `data/play.db.bak-*` sebelum migrasi**, perbarui `scripts/check-schema.js`. Sesi `IN_PROGRESS` lama harus tetap bisa dilanjutkan (kolom baru `NULL` = perilaku lama).
5. Mutasi koin selalu lewat `applyCoins` + `coin_transactions` dengan `Idempotency-Key`; invarian `players.coins == SUM(coin_transactions.delta)` tidak boleh rusak.
6. Mobile-first (layar 320×568 s.d. 430×932), tanpa scroll horizontal, bahasa Indonesia ramah anak SD (tidak menyalahkan/mempermalukan), tombol ≥ 44 px, hormati "Animasi hemat"/`prefers-reduced-motion`. Beri `data-testid` seperti disebut.
7. **Ceklis progres wajib (Bagian 00).**
8. **Deploy hanya setelah semua gerbang hijau** (T-51): backup DB → `pm2 restart play` → smoke test. Jangan mengubah `config.yml`/Cloudflare Tunnel.

### Urutan kerja
Urutan sudah dipecah menjadi tugas bernomor di **Lampiran E**; yang berlaku adalah urutan di ceklis. Ringkas: Fase 0 persiapan → Fase 1 **B lalu A** (level kemampuan dipakai laporan *dan* boss adaptif) → Fase 2 **F lalu E** → Fase 3 **C + D** → Fase 4 penutup & deploy.

---

## A. Isi Menu Laporan di Halaman Utama (P0)

**Kondisi sekarang:** kartu/menu "Laporan" di halaman utama kosong. Mesin laporan sudah ada (`lib/reports.js` → `compileWeeklyReport(playerId, weekKey)`, tabel `weekly_reports`, `/api/report/share`, portal `/r/{token}`), tetapi laporan mingguan baru dibuat oleh cron Senin 06:00 WIB sehingga **minggu berjalan tidak punya isi**. Perbaikannya: **layar Laporan pemain** + **kompilasi langsung (on-demand)**.

### A.1 Tampilan layar Laporan (T-12, T-13, T-14)
Kartu menu "📊 Laporan" (`menu-report`) membuka layar `report` (ikuti pola router layar di `public/js/app.js`). Susunan dari atas ke bawah:

1. **Header:** "📊 Laporan Belajar" + periode "Sen 2 – Min 8 Nov 2026" (format `id-ID`, zona WIB), tombol `◀ ▶` (`report-week-prev`, `report-week-next`; ▶ nonaktif di minggu berjalan; ◀ nonaktif sebelum minggu pertama pemain main). Minggu berjalan diberi lencana **"Sementara"** (`report-partial-badge`).
2. **Ringkasan** (`report-summary`) — 6 kartu: Soal dijawab · Akurasi % · Waktu belajar (menit) · Sesi main · Hari aktif (x/7) · Boss dikalahkan (+ chip rincian tier ⚪🔵🟣🟡 bila > 0). Bila ada data minggu lalu: tanda ▲/▼ kecil (selisih akurasi dalam poin & soal), warna netral (jangan merah menakutkan).
3. **Level Kemampuan per Mapel** (`ability-list`) — **bagian terpenting**, detail di **B**.
4. **Grafik 7 hari** (`report-chart`): batang SVG inline (soal dijawab per hari Sen–Min), titik warna akurasi per hari; ada `aria-label` & `<title>`; tanpa library.
5. **Topik perlu dibimbing** (`report-weak-topics`, maks 5) dan **Topik yang sudah dikuasai** (maks 5): "{Mapel} · {topik} — akurasi 38% (8 jawaban)". Hanya topik dengan ≥ 3 jawaban pada minggu itu.
6. **Pujian & saran** (`report-praise`, maks 3 + 3), kalimat positif berbasis aturan (A.2).
7. **Bagikan ke Orang Tua** (`report-share-btn`): memakai `/api/report/share` yang sudah ada; tampilkan tautan `https://play.printshare.my.id/r/{token}` (`report-share-url`), tombol Salin, info kedaluwarsa, dan **Cabut tautan** (`report-share-revoke`; tambahkan endpoint pencabutan bila belum ada — token disimpan ter-hash SHA-256 seperti yang sudah berjalan).

**Keadaan kosong** (`report-empty`): minggu tanpa sesi → ilustrasi/emoji ramah + "Belum ada petualangan minggu ini" + tombol **Mulai Petualangan**. Bagian level kemampuan tetap tampil bila pemain punya data sepanjang waktu; bila benar-benar nol → "Main dulu yuk, nanti kemampuanmu muncul di sini."

### A.2 Data dan API (T-11)
- `GET /api/report/week?week=YYYY-Www` (tanpa `week` = minggu berjalan). Batas minggu **Senin 00:00 – Minggu 23:59:59 WIB**; pakai util minggu yang **sudah dipakai `lib/reports.js`**, jangan membuat ulang.
- Minggu berjalan: kompilasi langsung, `partial:true`, **tidak disimpan**. Minggu lampau: pakai baris `weekly_reports` bila ada **dan** `v ≥ 2`; bila tidak ada atau `v` lama, kompilasi ulang lalu upsert (cron Senin tetap jalan seperti biasa). UI harus **toleran** bila field lama tidak ada.
- Bentuk respons (`report_json`, tambahkan `"v": 2`; tanpa migrasi skema):
```jsonc
{ "ok": true, "report": {
  "v": 2, "week": "2026-W45", "from": "2026-11-02", "to": "2026-11-08", "partial": true,
  "summary": { "answered": 84, "correct": 61, "accuracy": 73, "minutes": 46, "sessions": 5, "activeDays": 4,
               "bossDefeated": 3, "bossByTier": { "common": 2, "rare": 1, "epic": 0, "legend": 0 }, "coins": 210, "xp": 340 },
  "prev": { "answered": 60, "accuracy": 65 },                // null bila tidak ada
  "daily": [ { "date": "2026-11-02", "answered": 20, "correct": 15 } /* …7 item, hari kosong = 0 */ ],
  "abilities": [ /* format B.2, sudah terurut naik */ ],
  "weakTopics":     [ { "subjectId": 3, "subject": "IPAS", "topic": "Rantai makanan", "accuracy": 38, "attempts": 8 } ],
  "masteredTopics": [ { "subjectId": 1, "subject": "Matematika", "topic": "Pecahan", "count": 4 } ],
  "praise": ["Hebat! Kamu belajar 4 dari 7 hari."], "advice": ["Coba latihan IPAS hari ini — 1 sesi saja sudah membantu."] } }
```
- `bossByTier` dihitung dari `game_sessions` selesai dengan boss tumbang pada minggu itu, dikelompokkan `boss_tier` (sesi lama `NULL` → hitung sebagai `common`).
- **Pujian** (urut prioritas, ambil maks 3): `activeDays ≥ 5` "Hebat! Kamu belajar {n} dari 7 hari." · `accuracy ≥ 80` "Akurasi {x}% — luar biasa!" · akurasi naik ≥ 5 poin dari minggu lalu "Naik {d} poin dari pekan lalu!" · `bossDefeated ≥ 1` "Kamu mengalahkan {n} boss{, termasuk {Tier}}!" · bila tak ada yang cocok: "Setiap soal yang kamu coba membuatmu makin pintar."
- **Saran** (maks 3): mapel terendah terukur → "Coba latihan {mapel} hari ini — 1 sesi saja sudah membantu." · `weakTopics[0]` → "Topik {topik} masih sering keliru; ulangi pelan-pelan ya." · `activeDays ≤ 2` → "Coba belajar 15 menit setiap hari."
- Portal orang tua `/r/{token}` ikut menampilkan `abilities` (urut naik) dan `bossByTier` (hanya-baca; tanpa navigasi minggu; tanpa data pribadi selain nick yang sudah tampil).
- Performa: respons < 150 ms untuk pemain dengan ribuan jawaban; bila lambat, periksa `EXPLAIN QUERY PLAN` dan tambah indeks `CREATE INDEX IF NOT EXISTS` yang diperlukan.

---

## B. Level Kemampuan per Mata Pelajaran — Urut dari Nilai Terkecil (P0)

### B.1 Rumus (sudah diimplementasikan & diuji di `shared/progression.js` → `abilityScore`, `abilityLevel`, `sortAbilities`)
Skor 0–100 per mapel untuk pemain tertentu:

`skor = round(100 × (0,6 × Penguasaan + 0,3 × Akurasi + 0,1 × Cakupan))`

- **Penguasaan** = rata-rata berbobot-kesulitan dari `(box − 1) / 4` atas semua soal mapel itu yang pernah dijawab (`player_question_stats.box`; Leitner sudah mengodekan kemajuan & kelupaan). Bobot kesulitan `1 + 0,25 × (difficulty − 1)`.
- **Akurasi** = persentase benar berbobot-kesulitan pada **40 jawaban terbaru** mapel itu. Bila riwayat per-jawaban tidak ada di `session_questions`, gunakan kolom `attempts/correct` di `player_question_stats`; bila juga tidak ada, hitung dari jawaban yang tersimpan — **catat di T-00 sumber yang dipakai**.
- **Cakupan** = `min(1, soalUnikDijawab / max(10, 0,6 × soalAktifMapel))`.
- **Status:** `MEASURED` bila total jawaban ≥ 8; `INSUFFICIENT` bila 1–7 ("butuh 8 jawaban"); `NONE` bila 0.

| Skor | Level | Nama | Ikon |
|---|---|---|---|
| 0–19 | 1 | Pemula | 🌱 |
| 20–39 | 2 | Penjelajah | 🧭 |
| 40–59 | 3 | Petualang | ⚔️ |
| 60–79 | 4 | Ahli | 🛡️ |
| 80–100 | 5 | Master | 👑 |

### B.2 Urutan dan API (T-10)
- **Urut NAIK menurut skor** (terkecil paling atas). Seri → nama mapel A–Z. Mapel `INSUFFICIENT` ditaruh setelah semua `MEASURED` (urut jumlah jawaban naik), lalu `NONE` paling akhir — mapel yang belum dicoba **tetap tampil**, bukan disembunyikan. Semua dilakukan oleh `sortAbilities` (jangan mengurutkan ulang di klien).
- Hanya mapel **aktif** pada kelas pemain (`subjects.is_active = 1`, `class_id` pemain).
- Fungsi server `computeSubjectAbilities(playerId)` di `lib/db.js` (mengumpulkan `stats`, `recent`, `attempts`, `totalActive` per mapel → `Progression.abilityScore` → `Progression.sortAbilities`). Endpoint: `GET /api/report/abilities`:
```jsonc
{ "ok": true, "lowestSubjectId": 7, "abilities": [
  { "rank": 1, "subjectId": 7, "name": "IPAS", "icon": "🔬", "status": "MEASURED", "score": 31, "level": 2, "levelName": "Penjelajah", "levelIcon": "🧭",
    "accuracy": 55, "mastery": 18, "attempts": 42, "answeredDistinct": 25, "totalQuestions": 80 },
  { "rank": 9, "subjectId": 4, "name": "Seni", "icon": "🎨", "status": "NONE", "score": null, "attempts": 0, "need": 8 } ] }
```
(`abilityScore` sudah mengembalikan `level`, `levelName`, `levelIcon` — tidak menimpa `name` mapel; gabungkan dengan `{ subjectId, name, icon }` mapel.)
- Hasil yang sama dimasukkan ke `report.abilities` (A.2).

### B.3 Tampilan (T-13)
- Tiap baris (`ability-row-{subjectId}`): ikon mapel · nama · **bilah progres 0–100** berwarna sesuai level · skor · lencana level ("🧭 Penjelajah") · keterangan kecil "akurasi 55% · dikuasai 18%".
- Baris **terendah yang terukur** diberi lencana **"🎯 Fokus latihan"** dan tombol **"Latihan {mapel}"** yang memulai sesi mapel itu lewat alur mulai-mapel yang sudah ada (bila ada mode latihan titik-lemah, pakai itu).
- Ketuk baris → panel detail (akurasi, penguasaan, soal dikuasai x/y, jumlah jawaban, tips 1 kalimat). Tombol ❓ menjelaskan singkat cara skor dihitung (penguasaan 60% · akurasi 30% · cakupan 10%).
- `INSUFFICIENT`: "Baru {n}/8 jawaban — lanjut main untuk melihat levelmu." `NONE`: "Belum dicoba — ayo mulai!" dengan tombol Mulai.
- Pemain **tidak** diberi peringkat/perbandingan dengan pemain lain.

---

## C. Boss Bertier: Common, Rare, Epic, Legend (P0)

Boss kini punya **dua sumbu**: **tema lokasi** (10 habitat, `subjects.monster_theme`, tidak berubah) × **tier** (baru). Tier menentukan kekuatan, hadiah, dan tampilan — bukan temanya.

### C.1 Definisi tier (sumber tunggal: `Progression.BOSS_TIERS`)
| Tier | Ikon / warna | Jawaban benar maks. (D) | Pengali koin | Pengali XP | Jatah salah (D.2) |
|---|---|---|---|---|---|
| Common | ⚪ `#9AA5B1` | 15–18 | ×1,0 | ×1,0 | 90% dari N |
| Rare | 🔵 `#3B82F6` | 18–22 | ×1,3 | ×1,2 | 80% dari N |
| Epic | 🟣 `#A855F7` | 22–26 | ×1,7 | ×1,5 | 70% dari N |
| Legend | 🟡 `#F59E0B` | 26–30 | ×2,3 | ×2,0 | 62% dari N |

### C.2 Cara tier dipilih (T-30)
- **Peta Kampanye** (5 bab × 4 simpul; simpul 4 = Boss Bab) — tetap per simpul (`Progression.campaignTier(bab, simpul)`):

| Bab | Simpul 1 | Simpul 2 | Simpul 3 | Simpul 4 (Boss Bab) |
|---|---|---|---|---|
| 1 | common | common | common | rare |
| 2 | common | rare | rare | epic |
| 3 | rare | rare | epic | epic |
| 4 | rare | epic | epic | legend |
| 5 | epic | epic | legend | legend |

- **Mode Bebas** (mulai dari mapel): tier diundi server dengan `Progression.pickTier(Math.random, levelProfil)`. Peluang menurut level profil: Lv 1–5 → 70/25/5/0 · Lv 6–10 → 45/35/17/3 · Lv 11–20 → 30/35/25/10 · Lv 21+ → 20/30/30/20 (common/rare/epic/legend, %). Pemain **tidak** memilih tier; kejutan tier adalah bagian serunya.
- Tier disimpan di `game_sessions.boss_tier` saat `start` dan **tidak berubah** selama sesi (aman untuk resume). Level profil memakai fungsi level-dari-XP yang **sudah ada**; jangan mengubah kurva level.

### C.3 Efek tier (T-33)
- **Hadiah** (hanya saat menang): koin & XP dikali `Progression.rewardMult(tier)` setelah semua bonus lain; hadiah pertama-kali kampanye (+20/+50 koin) tetap, tanpa pengali.
- **Serangan monster** ke pemain per jawaban salah mengikuti D.2 (makin tinggi tier, jatah salah makin sedikit).
- **Dialog/komik** cerita yang ada tetap dipakai; tier hanya menambah awalan nama ("Naga Api [Epic]").

### C.4 Tampilan (T-34)
- **Lencana tier** di intro boss, di dekat bilah HP, dan di layar hasil (`boss-tier-badge`, ikon + label + warna tier).
- **Monster** (`public/js/monsters.js`): tambah parameter `tier` pada generator SVG. Common: tanpa hiasan · Rare: aura biru lembut · Epic: aura ungu + percikan · Legend: aura emas berdenyut + mahkota kecil. Animasi hanya CSS ringan; mati bila "Animasi hemat"/`prefers-reduced-motion`.
- **Bilah HP boss** berbingkai warna tier dan menampilkan **"Sisa maks. {X} jawaban benar"** (`boss-hits-left`, lihat D.1).
- **Intro boss** (±2 dtk, bisa dilewati): nama + lencana tier + "Kalahkan dengan maks. {N} jawaban benar!" (`boss-intro`).

---

## D. Darah Boss Adaptif: Habis dalam 15–30 Jawaban Benar (P0)

**Tujuan:** pertarungan tidak membosankan. Boss **selalu bisa dikalahkan dengan paling banyak N jawaban benar**, dengan N ∈ [15, 30] ditentukan tier dan **disesuaikan kemampuan pemain**; bonus combo/skill boleh mempercepat, tetapi **boss tidak boleh tumbang sebelum jawaban benar ke-15**.

### D.1 Model HP (`Progression.bossStats`, `hitsNeeded`, `hitsLeft`) — T-30
- `N = hitsNeeded(tier, skorKemampuanMapel)`: skor 0 → batas bawah rentang tier, skor 100 → batas atas, `null` (belum terukur) → tengah. Pemain lemah mendapat pertarungan lebih **pendek**; pemain kuat lebih panjang tapi tetap ≤ rentang tier. Skor kemampuan = hasil **B** untuk mapel sesi itu.
- `boss_max_hp = N × 20` (`HIT_UNIT = 20`); `boss_hp` awal = `boss_max_hp`. Disimpan juga `boss_hits_needed = N`, `boss_hit_unit = 20`.
- **Bank soal kecil:** bila soal aktif mapel < N, `N = jumlah soal aktif` dan server mencatat peringatan (`bank soal kurang`) agar admin menambah soal; **jangan** memaksa soal berulang dalam satu sesi kecuali D.4.
- UI menampilkan `hitsLeft = ceil(boss_hp / 20)` sebagai "Sisa maks. X jawaban benar". Respons `start`/`answer` menyertakan `boss: { tier, tierLabel, hp, maxHp, hitsNeeded, hitsLeft }`.

### D.2 Damage dan serangan monster (T-31)
- Jawaban benar: `damage = Progression.hitDamage({ comboStreak, powerMult, wrongStreak }).damage` lalu `boss_hp = Progression.applyBossDamage(boss_hp, damage, correct_count_setelah_jawaban)`.
  - Dasar 1 hit = 20. **Lantai 1 hit** (tidak pernah di bawah 20), **plafon 4×** (combo × `power_strike` × pity).
  - Pengali combo: pakai aturan combo yang **sudah ada** bila ada (batasi maks ×1,5); bila belum ada pakai `Progression.comboMult`.
  - **Pity:** setelah 3 jawaban salah berturut-turut, jawaban benar berikutnya ×1,5 (lencana "💪 Serangan Balik"). Simpan `wrong_streak` di sesi (reset saat benar).
  - **Lantai 15:** `applyBossDamage` menahan sisa HP = 1 bila jawaban benar total masih < 15.
  - `power_strike` memakai pengali efek skill (level skill, **E.4**) lewat parameter `powerMult`.
  - Naikkan `game_sessions.correct_count` tiap jawaban benar.
- Jawaban salah: pemain kena `monsterDamage = ceil(playerMaxHP / wrongBudget)` dengan `wrongBudget = max(6, ceil(N × rasioTier))` (`Progression.bossStats(...).monsterDamage`). Ini **menggantikan** nilai serangan monster lama **hanya untuk sesi bertier** (simpan di `game_sessions.monster_damage`). HP pemain tidak boleh jadi ≤ 0 sebelum jatah salah habis tanpa heal/shield. `heal`/`shield`/`second_chance` tetap bekerja sesuai level skill.
- Aturan lain tetap: Fase Marah di HP ≤ 50% (+1 energi, waktu ×0,9, bonus koin), soal bonus/misteri, kejutan tengah sesi.

### D.3 Adaptif saat bertarung (T-31)
1. **Kelelahan boss** (sekali, saat Fase Marah dimulai): bila sudah ≥ 6 soal dijawab **dan** akurasi sesi < 55%, sisa hit berkurang 15% (dibulatkan ke atas) lewat `Progression.fatigueAdjust` — **total jawaban benar tidak pernah di bawah 15**. Tampilkan banner "Boss mulai kelelahan! 😮‍💨" dan simpan `fatigue_applied = 1`.
2. **Pity** seperti D.2.
3. Nilai N awal sudah adaptif terhadap kemampuan (D.1).

### D.4 Panjang sesi dinamis (T-32)
Sesi tidak lagi berjumlah soal tetap; sesi berakhir ketika **boss tumbang**, **HP pemain habis**, atau **batas soal tercapai**.
- Jumlah soal awal `planned = Progression.bossStats(...).planned` (≈ `ceil(N / perkiraanAkurasi) + 3`), batas `maxQuestions = min(50, N + wrongBudget + 6)` disimpan di `game_sessions.max_questions`.
- **Isi ulang bertahap:** bila sisa soal belum dijawab ≤ 2 dan boss masih hidup, server menambah **5 soal** (`REFILL`) ke `session_questions` (urutan lanjut), sampai `maxQuestions`. Komposisi **wajib sama** dengan saat `start`: soal ulangan SRS ≤ 30% dari total soal sesi, titik lemah ≥ 20%, tipe soal dicampur (maks 2 non-MCQ berurutan), tidak ada soal yang sama berurutan, acak opsi di server. Bank soal habis sebelum cukup → boleh menyajikan ulang soal yang **paling lama tidak muncul**, tidak pernah berurutan.
- `maxQuestions` tercapai dengan boss masih hidup → akhiri lewat **jalur "semua soal selesai"** yang sudah ada (evaluasi bintang 1–3 berdasar sisa HP boss); jangan membuat status DB baru.
- Respons `answer` menyertakan `refill: { added }` bila ada penambahan; resume sesi harus memulihkan `planned/max_questions/boss_*` dari DB.

### D.5 Target keseimbangan (sudah diverifikasi simulasi — `scripts/sim-boss.js`, Lampiran C)
Tanpa skill, skor kemampuan 50, 2000 sesi per sel (rata-rata soal per sesi = ukuran durasi):

| Tier | Akurasi 50% menang / rata-rata soal | Akurasi 70% menang / rata-rata soal | Akurasi 90% menang / rata-rata soal |
|---|---|---|---|
| Common | ≈ 43% / 27 | ≈ 98% / 23 | 100% / 17 |
| Rare | ≈ 24% / 28 | ≈ 95% / 27 | 100% / 20 |
| Epic | ≈ 18% / 33 | ≈ 95% / 32 | 100% / 23 |
| Legend | ≈ 7% / 34 | ≈ 89% / 37 | 100% / 27 |

Jawaban benar saat menang selalu **15–29** dan **tidak pernah melebihi N**. Bila angka di produksi menyimpang jauh, **setel `wrongRatio` per tier / `HIT_UNIT`** di `progression.js` lalu jalankan ulang tes — jangan menambal di tempat lain.

---

## E. Perbaikan Fitur Upgrade Skill (P0)

> **Gejala:** upgrade skill belum berjalan. **Penyebab belum diketahui — dilarang menebak lalu menambal.** Kerjakan berurutan: **E.1 diagnosis (T-22, tanpa ubah kode) → E.2 server (T-23) → E.3 UI (T-24)**. Nama/path endpoint, 9 skill, dan efek dasarnya **tidak diganti** — hanya diperbaiki.

### E.1 Diagnosis (satu percobaan)
Reproduksi **dua jalur**: (1) langsung ke API dengan `curl` memakai cookie/token pemain uji dan `Idempotency-Key` baru: `POST /api/skills/{id}/upgrade`; (2) lewat UI di browser dengan tab Network + Console terbuka. Uji pada: skill dimiliki Lv1 dengan koin cukup · koin kurang · skill belum dimiliki · Lv maksimum · kunci idempoten sama dikirim dua kali. Catat per kasus: status HTTP, body (`code`), error konsol/log PM2 (`pm2 logs play`), saldo koin & level sebelum/sesudah, ada/tidaknya baris `coin_transactions`.

**Daftar dugaan — periksa semuanya, tandai yang terbukti:**
1. Route `POST /api/skills/:id/upgrade` tidak terdaftar / pola path salah / metode klien ≠ server.
2. Header `Idempotency-Key` tidak dikirim klien (server menolak 400) **atau** kunci yang sama dipakai tiap klik (server mengembalikan hasil lama).
3. `coin_transactions` memiliki kolom **`amount` dan `delta`**; insert hanya mengisi salah satunya / melanggar `NOT NULL` → transaksi gagal atau rollback diam-diam (invarian saldo memakai `delta`).
4. `player_skills.level` tidak ada, `NULL`, atau bertipe teks sehingga `level + 1` gagal.
5. Fungsi biaya di `shared/economy.js` berbeda antara klien & server, atau menghasilkan `NaN/undefined` → selalu "koin kurang".
6. Skill belum dimiliki (pemain baru hanya punya `eliminate_one`, `eagle_eye`, `heal`) tetapi tombol upgrade tampil/dipanggil.
7. UI: pendengar klik tidak terpasang, layar Skill tidak merender tombol, tombol `disabled` terus, atau respons sukses tidak memperbarui level & koin di state lokal.
8. Transaksi tidak atomik: koin terpotong tetapi level tidak naik (atau sebaliknya).
9. Level tersimpan, tetapi efek di battle memakai **snapshot loadout lama**, atau efek memakai **level profil** (bukan level skill).
10. Batas level maksimum salah (off-by-one) → selalu `MAX_LEVEL`.
11. Galat 500 ditelan UI tanpa pesan.
12. Service worker/PWA menyajikan `app.js` lama dari cache (perbaikan UI tidak tampil) — naikkan versi cache bila ada service worker.

**Keluaran T-22:** satu `note` berisi tabel `kasus → gejala → akar masalah (nomor dugaan)`. Perbaikan E.2/E.3 **harus menutup setiap akar masalah yang tercatat**.

### E.2 Server (T-23)
- `POST /api/skills/:id/upgrade` (header `Idempotency-Key` wajib). **Satu transaksi SQLite**: validasi → `UPDATE player_skills SET level = level + 1` → `applyCoins(playerId, -biaya, 'SKILL_UPGRADE:{id}:{levelBaru}')` (mengisi **kedua** kolom `amount` & `delta` bila keduanya ada, `balance_aft` benar) → simpan hasil idempoten. Gagal di tengah → rollback total.
- Level skill 1–5 (`SKILL_MAX_LEVEL`). Biaya `Progression.skillUpgradeCost(levelSekarang)` — **gunakan fungsi biaya yang sudah ada di `economy.js` bila ada**; bila tidak ada, default: Lv1→2 **60**, 2→3 **120**, 3→4 **220**, 4→5 **380** koin (total 780).
- Respons sukses: `{ ok: true, skill: { id, level, nextCost, effectNow, effectNext }, coins }`. Galat baku (pakai pola kode yang sudah dipakai `/api/shop/buy` bila ada): `404 SKILL_NOT_OWNED` · `409 MAX_LEVEL` · `NOT_ENOUGH_COINS` (status mengikuti `/api/shop/buy`) · `400 IDEMPOTENCY_KEY_REQUIRED`. Penolakan **tidak** memotong koin dan **tidak** di-cache oleh idempotensi; hanya hasil sukses yang disimpan per kunci.
- `GET /api/skills` mengembalikan tiap skill pemain: `{ id, name, icon, owned, level, maxLevel, cost (energi), effectNow, effectNext, upgradeCost, canUpgrade, reason }` dengan `reason` ∈ `null | NOT_OWNED | MAX_LEVEL | NOT_ENOUGH_COINS`. Satu fungsi server menghitungnya (dipakai tombol **dan** validasi — tanpa logika ganda).
- Log server: `skillId, level, biaya, hasil/alasan`.

### E.3 UI layar Skill (T-24)
- Tiap kartu skill: ikon · nama · **pip level ●●○○○** · `Lv 2/5` · **efek sekarang → berikutnya** ("Pulihkan +35 HP → +45 HP") · biaya energi saat dipakai · tombol **"Upgrade — 120 🪙"** (`skill-upgrade-btn-{id}`).
- Tombol abu-abu memakai `aria-disabled` (tetap bisa diketuk) + toast alasan: "Koin belum cukup — kurang {n} 🪙", "Sudah level maksimum 🎉", "Skill ini belum kamu miliki". Tidak ada request bila `canUpgrade = false`.
- Ketuk tombol aktif → **dialog konfirmasi** "Upgrade {Skill} ke Lv {n}? −{biaya} 🪙" (cegah salah ketuk). Konfirmasi → request dengan `Idempotency-Key` baru (`crypto.randomUUID()`; **kunci sama dipakai ulang** bila mengulang setelah galat jaringan), tombol terkunci selama request.
- Sukses → animasi kecil + suara (`audio.js`/`feedback.js`) + perbarui level, efek, saldo koin di semua tempat (header, toko) dari respons. Galat jaringan → toast "Gagal, coba lagi" tanpa mengubah tampilan.
- `data-testid`: `skill-card-{id}`, `skill-level-{id}`, `skill-upgrade-btn-{id}`, `skill-upgrade-confirm`, `skill-upgrade-toast`.

### E.4 Efek level di pertempuran (T-23)
- Efek skill **mengikuti `player_skills.level`** (level skill hasil upgrade), bukan level profil. Bila saat ini memakai level profil, ubah dan catat di `note`.
- **Snapshot loadout** saat `start` menyimpan `level` tiap skill. Sesi yang sedang berjalan memakai snapshot-nya; **sesi baru** memakai level terbaru. Tombol skill di pertempuran menampilkan badge `Lv n`.
- Nilai per level (dasar dari tabel 8.2 arsitektur; lengkapnya di `Progression.SKILL_TABLE` — pakai tabel yang sudah ada di `economy.js` bila sudah memuatnya):

| Skill | Lv1 → Lv5 |
|---|---|
| `heal` | +25, +35, +45, +55, +65 HP (biaya 1) |
| `shield` | 20, 40, 60, 80, 100 HP (biaya 2) |
| `power_strike` | ×2,0, ×2,5, ×3,0, ×3,5, ×4,0 (biaya 3) |
| `time_freeze` | +8, +11, +14, +17, +20 dtk (biaya 3) |
| `eliminate_one` | biaya 1; pemakaian gratis per battle: 0, 0, 1, 1, 2 |
| `eagle_eye` | biaya 2, 2, 2, 1, 1 |
| `combo_keeper` | biaya 2, 2, 1, 1, 1; perlindungan 1, 1, 1, 2, 2 kali salah |
| `lucky_pouch` | biaya 2, 2, 2, 2, 1; pengali koin ×2,0, ×2,25, ×2,5, ×2,75, ×3,0 |
| `second_chance` | biaya 4, 4, 3, 3, 2 |

Aturan v5 tetap: `eliminate_one`/`eagle_eye` hanya untuk soal MCQ (`NOT_APPLICABLE` tanpa memotong energi). Biaya energi turun di level tinggi **tidak boleh di bawah 1** (kecuali pemakaian gratis).

---

## F. Energi Bertambah Menurut Level Profil (P0)

### F.1 Kapasitas energi per battle (`Progression.energyMaxForLevel`)
`kapasitas = min(12, 5 + floor((levelProfil − 1) / 5))`

| Level profil | Kapasitas energi |
|---|---|
| 1–5 | 5 |
| 6–10 | 6 |
| 11–15 | 7 |
| 16–20 | 8 |
| 21–25 | 9 |
| 26–30 | 10 |
| 31–35 | 11 |
| 36+ | 12 (batas) |

### F.2 Aturan (T-20)
- Level profil = level dari XP yang **sudah ada** (jangan mengubah kurva). Saat `start`, simpan `game_sessions.energy_max = energyMaxForLevel(level)` (snapshot; level naik di tengah sesi **tidak** mengubahnya; resume memulihkan dari DB; `NULL` = sesi lama memakai batas lama).
- **Semua** penambahan energi di-clamp ke `energy_max` (`Progression.gainEnergy`): +1 Fase Marah, Jimat Pedagang, hadiah lain. Penawaran "Jimat +1 energi" di Pedagang disembunyikan/dinonaktifkan bila energi sudah penuh (jangan menarik koin untuk tidak ada manfaat).
- **Perolehan energi:** audit di T-00 bagaimana energi diperoleh sekarang dan berapa energi awal. Aturan yang sudah ada **dipertahankan**. Bila tidak ada perolehan reguler selama pertarungan, tambahkan **+1 energi tiap 3 jawaban benar** (`Progression.energyFromCorrect(correct_count)`) agar kapasitas besar benar-benar bisa "dikumpulkan" pada pertarungan 15–30 jawaban benar. Energi awal sesi: pertahankan nilai yang ada, di-clamp ke `energy_max`.
- Level profil naik setelah sesi → tampilkan di layar hasil: "Kapasitas energi naik jadi {n} ⚡!" (hanya bila kapasitas berubah).

### F.3 Tampilan (T-21)
- Bilah energi menampilkan `⚡ nilai/kapasitas` dengan pip (`energy-bar`, `energy-value`); untuk kapasitas > 8 pip mengecil/membungkus agar tidak keluar layar 320 px.
- Layar profil/menu: "Kapasitas energi: 6 ⚡ per battle — naik jadi 7 di Level 11" (dari `Progression.nextEnergyLevel`); di level 36+ "Kapasitas maksimum".
- Respons `start`/`answer`/`skill` menyertakan `energy: { value, max }`; `GET /api/me` menyertakan `energyMax` dan `nextEnergyLevel`.

---

## G. Data, Migrasi, dan API

### G.1 Migrasi aditif (T-02) — idempoten, setelah backup `data/play.db.bak-YYYYmmdd_HHMMSS`
Gunakan mekanisme migrasi yang sudah ada di `lib/db.js`; bila tidak ada, pola berikut (sudah diuji di `node:sqlite`):
```js
function addColumnIfMissing(db, table, col, ddl) {
  const has = db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col);
  if (!has) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
}
for (const [col, ddl] of [
  ['boss_tier', 'TEXT'],                              // NULL = sesi lama (dianggap common)
  ['boss_hits_needed', 'INTEGER'], ['boss_hit_unit', 'INTEGER'], ['monster_damage', 'INTEGER'], ['max_questions', 'INTEGER'],
  ['correct_count', 'INTEGER NOT NULL DEFAULT 0'], ['wrong_streak', 'INTEGER NOT NULL DEFAULT 0'],
  ['fatigue_applied', 'INTEGER NOT NULL DEFAULT 0'],
  ['energy_max', 'INTEGER'],                          // NULL = batas energi lama
]) addColumnIfMissing(db, 'game_sessions', col, ddl);
addColumnIfMissing(db, 'player_skills', 'level', 'INTEGER NOT NULL DEFAULT 1');   // hanya bila belum ada
```
Perbarui `scripts/check-schema.js` (kolom baru). `weekly_reports` **tanpa perubahan skema** (versi di dalam `report_json`). Tidak ada tabel baru.

### G.2 Endpoint baru/diubah
| Endpoint | Perubahan |
|---|---|
| `GET /api/report/week?week=` | **Baru.** Laporan minggu (A.2); tanpa `week` = minggu berjalan (`partial:true`) |
| `GET /api/report/abilities` | **Baru.** Level kemampuan urut naik (B.2) |
| `POST /api/report/share` · pencabutan | Dipakai UI Laporan; tambahkan pencabutan bila belum ada |
| `GET /r/{token}` | + `abilities`, `bossByTier` |
| `POST /api/game/start` | + `boss{tier,tierLabel,hp,maxHp,hitsNeeded,hitsLeft}`, `energy{value,max}`; memilih tier (C.2) & N (D.1); `planned` soal |
| `POST /api/game/:id/answer` | + `boss{…}`, `fatigue{applied}`, `refill{added}`, `energy`, `pity`; damage/serangan sesuai D.2 |
| `POST /api/game/:id/skill` | efek menurut level skill (E.4); + `energy` |
| `GET /api/skills` · `POST /api/skills/:id/upgrade` | Diperbaiki & dilengkapi (E.2) |
| `GET /api/me` | + `energyMax`, `nextEnergyLevel` |

---

## H. Pengujian (T-50; sebagian dijalankan di gerbang)

> Pada ceklis, skenario di bagian ini dirujuk sebagai **H.1 … H.12** (nomor urut di bawah) dan kriteria di Bagian I sebagai **I.1 … I.11**.

**Perintah** (di `/home/maman/play`): `npm test` (semua suite, termasuk `tests/progression.test.js`) · `node scripts/check-schema.js` · `node scripts/smoke-test-v4.js` · `node scripts/test-gameplay-e2e.js` · `node scripts/sim-boss.js`.

**Skenario wajib** (otomatis bila bisa; sisanya manual di 320×568 dan 430×932):
1. **Level kemampuan:** pemain uji dengan data campuran → API mengembalikan urutan **naik**; seri A–Z; `INSUFFICIENT` lalu `NONE` di akhir; `lowestSubjectId` = terendah terukur; ambang level 19/20, 39/40, 59/60, 79/80 benar.
2. **Laporan:** pemain baru → `report-empty`; pemain dengan data → semua bagian terisi; minggu berjalan berlabel "Sementara"; ◀▶ benar; minggu lampau lama (`v1`) dikompilasi ulang tanpa error; bagikan → buka `/r/{token}` → ada `abilities`; cabut → token ditolak.
3. **Tier:** `start` kampanye menghasilkan tier sesuai tabel C.2; Mode Bebas 10.000 undian ±2 poin dari bobot; Lv 1–5 tidak pernah `legend`; tier tersimpan & tidak berubah saat resume.
4. **HP adaptif:** untuk tiap tier × skor kemampuan {null, 0, 50, 100}: `N` di rentang tier dan 15–30; `boss_max_hp = N × 20`; sesi sintetis tanpa skill dengan 100% benar → boss tumbang tepat ≤ N jawaban benar dan **tidak pernah** sebelum ke-15, termasuk dengan `power_strike` Lv5.
5. **Damage:** lantai 1 hit, plafon 4×, pity setelah 3 salah, jawaban salah memotong `monster_damage`, HP pemain tidak negatif.
6. **Kelelahan:** terjadi maks 1× per sesi, hanya akurasi < 55% setelah ≥ 6 soal, total benar ≥ 15.
7. **Panjang sesi:** isi ulang 5 soal bila sisa ≤ 2; komposisi (SRS ≤ 30%, titik lemah ≥ 20%, maks 2 non-MCQ berurutan, tanpa soal sama berurutan) terjaga; `maxQuestions` tercapai → jalur bintang yang ada; resume memulihkan semua kolom `boss_*`.
8. **Sesi lama:** sesi `IN_PROGRESS` sebelum migrasi (kolom `NULL`) tetap bisa dilanjutkan & diselesaikan tanpa galat.
9. **Upgrade skill:** sukses (level +1, koin −biaya, **satu** baris `coin_transactions`, invarian saldo utuh); koin kurang; belum dimiliki; Lv maksimum; kunci idempoten sama 2× → hasil sama, koin dipotong 1×; kegagalan tengah transaksi → rollback; sesi baru memakai level baru, sesi berjalan memakai snapshot; UI menampilkan efek sekarang → berikutnya dan memperbarui koin.
10. **Energi:** `energy_max` sesuai tabel F.1 untuk Lv 1, 5, 6, 11, 36; semua penambahan ter-clamp; +1 tiap 3 benar (bila aturan baru dipakai); Jimat Pedagang disembunyikan saat penuh; resume memulihkan; bilah energi muat di 320 px.
11. **Simulasi keseimbangan:** `node scripts/sim-boss.js` & tes pita penerimaan di `tests/progression.test.js` lulus.
12. **Regresi:** login wajib, resume, auto-lanjut, kejutan tengah sesi, scroll soal panjang, 5 tipe soal, SRS, pacing, toko, koin, laporan mingguan lama, kampanye & komik tetap bekerja; `check-schema` & `smoke-test-v4` lulus; `test-gameplay-e2e.js` diperbarui agar menyelesaikan sesi bertier yang lebih panjang.

---

## I. Kriteria lulus (✅/❌ pada laporan akhir)
| # | Kriteria |
|---|---|
| 1 | Menu Laporan terisi lengkap (A.1) untuk pemain berdata, dan keadaan kosong ramah untuk pemain baru |
| 2 | Level kemampuan per mapel tampil **urut naik** (terkecil di atas); belum-dicoba di akhir; tombol Latihan di mapel terendah |
| 3 | Boss punya tier common/rare/epic/legend dengan lencana, aura monster, dan hadiah sesuai tabel |
| 4 | Kampanye memakai peta tier; Mode Bebas memakai bobot menurut level profil |
| 5 | Boss selalu bisa dikalahkan dengan ≤ N (15–30) jawaban benar dan tidak pernah tumbang sebelum ke-15 |
| 6 | HP adaptif (N menurut kemampuan, pity, kelelahan) dan panjang sesi dinamis dengan isi ulang soal |
| 7 | Upgrade skill berfungsi penuh (server atomik + UI + efek di battle), akar masalah T-22 tertutup |
| 8 | Kapasitas energi mengikuti level profil (Lv 1–5 = 5, naik tiap 5 level, maks 12) |
| 9 | Sesi lama tetap bisa dilanjutkan; migrasi aditif & idempoten; `check-schema` lulus |
| 10 | Semua tes (`npm test`, smoke, e2e, simulasi) hijau; tanpa dependensi baru |
| 11 | `npm run progress -- check` valid; semua tugas `[x]` bukti / `[!]` alasan; tidak ada tugas dikerjakan dua kali |

## J. Laporan akhir (T-52)
```
## Ringkasan (apa yang dibangun, per fitur A–F)
## Hasil audit T-00 (fungsi/tabel yang dipakai, sumber riwayat jawaban, jumlah soal aktif per mapel)
## Akar masalah upgrade skill (tabel T-22) dan perbaikannya
## File yang dibuat/diubah · migrasi yang dijalankan (nama backup)
## Hasil tes: npm test, check-schema, smoke-test-v4, e2e, sim-boss, skenario 1–12, kriteria 1–11 ✅/❌
## Ceklis progres (salin tugas [x]/[!] + bukti/alasan dari docs/PROGRESS-v6.md) dan keluaran `progress status`
## Deploy (backup, pm2 restart play, verifikasi) · Sisa pekerjaan / risiko · Penyesuaian angka keseimbangan yang disarankan
```

---

## Lampiran A — `shared/progression.js` (salin persis; sudah diuji — 10 uji lulus)
Logika murni B/C/D/E/F: rumus kemampuan & pengurutan, tier boss, HP/damage adaptif, kelelahan, energi per level, tabel level skill. UMD: `require('../shared/progression.js')` di server, `window.Progression` di klien (`<script src="/shared/progression.js">` sebelum `app.js`; sesuaikan cara modul `shared/` lain dimuat).
```js
/* shared/progression.js — logika murni v6 (UMD: dipakai server & klien; tanpa dependensi, tanpa I/O) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Progression = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* ============ B. Level kemampuan per mapel ============ */
  const ABILITY = {
    minAttempts: 8, recentWindow: 40,
    weights: { mastery: 0.6, accuracy: 0.3, coverage: 0.1 },
    levels: [
      { min: 0,  level: 1, name: 'Pemula',     icon: '🌱' },
      { min: 20, level: 2, name: 'Penjelajah', icon: '🧭' },
      { min: 40, level: 3, name: 'Petualang',  icon: '⚔️' },
      { min: 60, level: 4, name: 'Ahli',       icon: '🛡️' },
      { min: 80, level: 5, name: 'Master',     icon: '👑' },
    ],
  };
  const diffWeight = (d) => 1 + 0.25 * (clamp(Number(d) || 1, 1, 5) - 1);
  function abilityLevel(score) {
    let cur = ABILITY.levels[0];
    for (const l of ABILITY.levels) if (score >= l.min) cur = l;
    return { level: cur.level, name: cur.name, icon: cur.icon };
  }
  // inp: { attempts, stats:[{box,difficulty}], recent:[{correct,difficulty}] (maks recentWindow terbaru), totalActive }
  function abilityScore(inp) {
    const attempts = Math.max(0, inp.attempts | 0);
    if (attempts === 0) return { status: 'NONE', score: null, attempts, need: ABILITY.minAttempts };
    if (attempts < ABILITY.minAttempts) return { status: 'INSUFFICIENT', score: null, attempts, need: ABILITY.minAttempts };
    const stats = inp.stats || [];
    let wSum = 0, mSum = 0;
    for (const s of stats) { const w = diffWeight(s.difficulty); wSum += w; mSum += w * (clamp(s.box | 0, 1, 5) - 1) / 4; }
    const M = wSum ? mSum / wSum : 0;
    const rec = (inp.recent || []).slice(-ABILITY.recentWindow);
    let rw = 0, rc = 0;
    for (const r of rec) { const w = diffWeight(r.difficulty); rw += w; if (r.correct) rc += w; }
    const A = rw ? rc / rw : 0;
    const C = Math.min(1, stats.length / Math.max(10, 0.6 * (inp.totalActive || 0)));
    const W = ABILITY.weights;
    const score = clamp(Math.round(100 * (W.mastery * M + W.accuracy * A + W.coverage * C)), 0, 100);
    const lv = abilityLevel(score);   // kunci level diberi awalan agar tidak menimpa `name` mapel saat digabung
    return { status: 'MEASURED', score, attempts, accuracy: Math.round(A * 100), mastery: Math.round(M * 100), level: lv.level, levelName: lv.name, levelIcon: lv.icon };
  }
  const STATUS_ORDER = { MEASURED: 0, INSUFFICIENT: 1, NONE: 2 };
  // Urut NAIK: nilai terkecil di atas; "belum cukup data" lalu "belum dicoba" di akhir.
  function sortAbilities(list) {
    const out = list.slice().sort((a, b) =>
      (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) ||
      (a.status === 'MEASURED' ? a.score - b.score : (a.attempts || 0) - (b.attempts || 0)) ||
      String(a.name).localeCompare(String(b.name), 'id'));
    out.forEach((x, i) => { x.rank = i + 1; });
    return out;
  }

  /* ============ C & D. Boss bertier + darah adaptif (15–30 jawaban benar) ============ */
  const HIT_UNIT = 20;            // HP boss yang hilang per jawaban benar baku (1 "hit")
  const HIT_CAP_MULT = 4;         // pengali maksimum per jawaban benar (combo × power × pity)
  const MIN_TOTAL_HITS = 15, MAX_TOTAL_HITS = 30, MAX_Q_CAP = 50;
  const BOSS_TIERS = {
    common: { id: 'common', label: 'Common', icon: '⚪', color: '#9AA5B1', minHits: 15, maxHits: 18, wrongRatio: 0.90, coinMult: 1.0, xpMult: 1.0 },
    rare:   { id: 'rare',   label: 'Rare',   icon: '🔵', color: '#3B82F6', minHits: 18, maxHits: 22, wrongRatio: 0.80, coinMult: 1.3, xpMult: 1.2 },
    epic:   { id: 'epic',   label: 'Epic',   icon: '🟣', color: '#A855F7', minHits: 22, maxHits: 26, wrongRatio: 0.70, coinMult: 1.7, xpMult: 1.5 },
    legend: { id: 'legend', label: 'Legend', icon: '🟡', color: '#F59E0B', minHits: 26, maxHits: 30, wrongRatio: 0.62, coinMult: 2.3, xpMult: 2.0 },
  };
  const TIER_ORDER = ['common', 'rare', 'epic', 'legend'];
  const TIER_WEIGHTS = [   // peluang tier pada Mode Bebas menurut level profil
    { maxLevel: 5,        w: { common: 70, rare: 25, epic: 5,  legend: 0 } },
    { maxLevel: 10,       w: { common: 45, rare: 35, epic: 17, legend: 3 } },
    { maxLevel: 20,       w: { common: 30, rare: 35, epic: 25, legend: 10 } },
    { maxLevel: Infinity, w: { common: 20, rare: 30, epic: 30, legend: 20 } },
  ];
  const CAMPAIGN_TIERS = {   // [simpul1..simpul4] per bab; simpul 4 = Boss Bab
    1: ['common', 'common', 'common', 'rare'],
    2: ['common', 'rare', 'rare', 'epic'],
    3: ['rare', 'rare', 'epic', 'epic'],
    4: ['rare', 'epic', 'epic', 'legend'],
    5: ['epic', 'epic', 'legend', 'legend'],
  };
  const PITY = { afterWrong: 3, mult: 1.5 };            // 3 salah beruntun → jawaban benar berikutnya ×1.5
  const FATIGUE = { minAnswered: 6, accBelow: 0.55, cut: 0.85 };   // sekali, saat Fase Marah
  const REFILL = { whenRemainingAtMost: 2, batch: 5 };

  function tierWeights(level) { return (TIER_WEIGHTS.find((t) => level <= t.maxLevel) || TIER_WEIGHTS[TIER_WEIGHTS.length - 1]).w; }
  function pickTier(rand, level) {
    const w = tierWeights(level); const sum = TIER_ORDER.reduce((s, k) => s + w[k], 0); let r = rand() * sum;
    for (const k of TIER_ORDER) { if (r < w[k]) return k; r -= w[k]; }
    return 'common';
  }
  function campaignTier(chapter, node) { const row = CAMPAIGN_TIERS[clamp(chapter | 0, 1, 5)]; return row[clamp(node | 0, 1, 4) - 1]; }
  // Makin kuat pemain (skor 0–100) → makin ke ujung atas rentang tier. Skor tidak ada (null) → tengah.
  function hitsNeeded(tierId, abilityScoreValue) {
    const t = BOSS_TIERS[tierId]; const f = abilityScoreValue == null ? 0.5 : clamp(abilityScoreValue / 100, 0, 1);
    return clamp(Math.round(t.minHits + (t.maxHits - t.minHits) * f), MIN_TOTAL_HITS, MAX_TOTAL_HITS);
  }
  function wrongBudget(n, tierId) { return Math.max(6, Math.ceil(n * BOSS_TIERS[tierId].wrongRatio)); }
  function maxQuestions(n, tierId) { return Math.min(MAX_Q_CAP, n + wrongBudget(n, tierId) + 6); }
  function plannedQuestions(n, tierId, abilityScoreValue) {
    const acc = clamp(0.5 + 0.4 * (abilityScoreValue == null ? 50 : abilityScoreValue) / 100, 0.55, 0.9);
    return Math.min(maxQuestions(n, tierId), Math.ceil(n / acc) + 3);
  }
  function bossStats(tierId, abilityScoreValue, playerMaxHp, poolSize) {
    let n = hitsNeeded(tierId, abilityScoreValue);
    if (poolSize != null && poolSize < n) n = Math.max(1, poolSize);       // bank soal terlalu kecil → catat peringatan di server
    const wb = wrongBudget(n, tierId);
    return { tier: tierId, hitsNeeded: n, hitUnit: HIT_UNIT, bossMaxHp: n * HIT_UNIT, wrongBudget: wb,
             monsterDamage: Math.ceil(playerMaxHp / wb), maxQuestions: maxQuestions(n, tierId), planned: plannedQuestions(n, tierId, abilityScoreValue) };
  }
  // HP boss setelah menerima damage. Boss TIDAK boleh tumbang sebelum jawaban benar ke-15 (sisa HP dikunci 1).
  function applyBossDamage(bossHp, damage, correctCountAfter) {
    const next = bossHp - damage;
    return next <= 0 && correctCountAfter < MIN_TOTAL_HITS ? 1 : Math.max(0, next);
  }
  const hitsLeft = (bossHp) => Math.max(0, Math.ceil(bossHp / HIT_UNIT));
  const comboMult = (streak) => 1 + Math.min(0.5, 0.1 * Math.floor(Math.max(0, streak) / 3));   // pakai pengali combo yang sudah ada bila ada (maks 1.5)
  function hitDamage(o) {   // o: { comboStreak, powerMult, wrongStreak }
    const pity = (o.wrongStreak | 0) >= PITY.afterWrong ? PITY.mult : 1;
    const mult = clamp(comboMult(o.comboStreak | 0) * pity * Math.max(1, o.powerMult || 1), 1, HIT_CAP_MULT);
    return { damage: Math.round(HIT_UNIT * mult), pity: pity > 1 };
  }
  // Dipanggil SEKALI saat Fase Marah. Total jawaban benar tidak pernah turun di bawah 15.
  function fatigueAdjust(o) {   // o: { bossHp, correctCount, answeredCount }
    const acc = o.answeredCount ? o.correctCount / o.answeredCount : 1;
    if (o.answeredCount < FATIGUE.minAnswered || acc >= FATIGUE.accBelow) return { applied: false, bossHp: o.bossHp };
    const left = hitsLeft(o.bossHp);
    const newLeft = Math.min(left, Math.max(Math.ceil(left * FATIGUE.cut), MIN_TOTAL_HITS - o.correctCount, 1));
    return { applied: newLeft < left, bossHp: Math.min(o.bossHp, newLeft * HIT_UNIT) };
  }
  const rewardMult = (tierId) => ({ coin: BOSS_TIERS[tierId].coinMult, xp: BOSS_TIERS[tierId].xpMult });

  /* ============ F. Energi per level profil ============ */
  const ENERGY = { base: 5, perBand: 1, bandSize: 5, cap: 12, earnEveryCorrect: 3, earnAmount: 1 };
  const energyMaxForLevel = (level) => Math.min(ENERGY.cap, ENERGY.base + Math.floor((Math.max(1, level | 0) - 1) / ENERGY.bandSize) * ENERGY.perBand);
  const gainEnergy = (cur, amount, max) => clamp(cur + amount, 0, max);
  const energyFromCorrect = (correctCount) => (correctCount > 0 && correctCount % ENERGY.earnEveryCorrect === 0 ? ENERGY.earnAmount : 0);
  function nextEnergyLevel(level) {   // level profil berikutnya yang menaikkan kapasitas
    const cur = energyMaxForLevel(level); if (cur >= ENERGY.cap) return null;
    const lv = (Math.floor((Math.max(1, level | 0) - 1) / ENERGY.bandSize) + 1) * ENERGY.bandSize + 1;
    return { level: lv, energyMax: energyMaxForLevel(lv) };
  }

  /* ============ E. Upgrade skill (fallback bila shared/economy.js belum punya) ============ */
  const SKILL_MAX_LEVEL = 5;
  const UPGRADE_COSTS = [60, 120, 220, 380];            // Lv1→2, 2→3, 3→4, 4→5
  const SKILL_TABLE = {
    eliminate_one: { cost: [1, 1, 1, 1, 1], freeUses: [0, 0, 1, 1, 2] },
    eagle_eye:     { cost: [2, 2, 2, 1, 1] },
    heal:          { cost: [1, 1, 1, 1, 1], value: [25, 35, 45, 55, 65] },
    shield:        { cost: [2, 2, 2, 2, 2], value: [20, 40, 60, 80, 100] },
    power_strike:  { cost: [3, 3, 3, 3, 3], value: [2, 2.5, 3, 3.5, 4] },
    time_freeze:   { cost: [3, 3, 3, 3, 3], value: [8, 11, 14, 17, 20] },
    combo_keeper:  { cost: [2, 2, 1, 1, 1], protect: [1, 1, 1, 2, 2] },
    lucky_pouch:   { cost: [2, 2, 2, 2, 1], value: [2, 2.25, 2.5, 2.75, 3] },
    second_chance: { cost: [4, 4, 3, 3, 2] },
  };
  const skillUpgradeCost = (level) => (level >= SKILL_MAX_LEVEL || level < 1 ? null : UPGRADE_COSTS[level - 1]);
  function skillInfo(id, level) {   // efek pada level tertentu: { cost, value?, freeUses?, protect? }
    const t = SKILL_TABLE[id]; if (!t) return null; const i = clamp(level | 0, 1, SKILL_MAX_LEVEL) - 1; const o = { cost: t.cost[i] };
    for (const k of ['value', 'freeUses', 'protect']) if (t[k]) o[k] = t[k][i];
    return o;
  }

  return { clamp, ABILITY, abilityLevel, abilityScore, sortAbilities,
    HIT_UNIT, HIT_CAP_MULT, MIN_TOTAL_HITS, MAX_TOTAL_HITS, MAX_Q_CAP, BOSS_TIERS, TIER_ORDER, TIER_WEIGHTS, CAMPAIGN_TIERS, PITY, FATIGUE, REFILL,
    tierWeights, pickTier, campaignTier, hitsNeeded, wrongBudget, maxQuestions, plannedQuestions, bossStats, hitsLeft, comboMult, hitDamage, fatigueAdjust, rewardMult, applyBossDamage,
    ENERGY, energyMaxForLevel, gainEnergy, energyFromCorrect, nextEnergyLevel,
    SKILL_MAX_LEVEL, UPGRADE_COSTS, SKILL_TABLE, skillUpgradeCost, skillInfo };
});
```

## Lampiran B — `tests/progression.test.js` (salin persis)
```js
// tests/progression.test.js — uji unit logika murni v6 (node --test)
const test = require('node:test'); const assert = require('node:assert/strict');
const P = require('../shared/progression.js'); const { run, rng } = require('../scripts/sim-boss.js');

test('B: ambang level kemampuan', () => {
  const lv = (s) => P.abilityLevel(s).level;
  assert.deepEqual([0, 19, 20, 39, 40, 59, 60, 79, 80, 100].map(lv), [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
});
test('B: skor — tanpa data / data kurang / terukur', () => {
  assert.equal(P.abilityScore({ attempts: 0 }).status, 'NONE');
  assert.equal(P.abilityScore({ attempts: 7 }).status, 'INSUFFICIENT');
  const strong = P.abilityScore({ attempts: 40, totalActive: 50, stats: Array(40).fill({ box: 5, difficulty: 2 }), recent: Array(40).fill({ correct: true, difficulty: 2 }) });
  const weak = P.abilityScore({ attempts: 40, totalActive: 50, stats: Array(40).fill({ box: 1, difficulty: 2 }), recent: Array(40).fill({ correct: false, difficulty: 2 }) });
  assert.equal(strong.status, 'MEASURED'); assert.equal(strong.score, 100); assert.equal(weak.score, 10);   // hanya komponen cakupan (10%) yang terisi
  assert.ok(strong.score > weak.score);
  assert.equal(strong.levelName, 'Master'); assert.equal(weak.levelName, 'Pemula'); assert.equal(strong.name, undefined);   // `name` mapel tidak tertimpa
});
test('B: urutan NAIK — terukur kecil→besar, lalu kurang data, lalu belum dicoba; seri = nama A–Z', () => {
  const out = P.sortAbilities([
    { name: 'IPA', status: 'MEASURED', score: 70 }, { name: 'Seni', status: 'NONE', attempts: 0 }, { name: 'IPS', status: 'MEASURED', score: 35 },
    { name: 'Agama', status: 'MEASURED', score: 35 }, { name: 'PJOK', status: 'INSUFFICIENT', attempts: 3 }, { name: 'Bahasa', status: 'INSUFFICIENT', attempts: 5 } ]);
  assert.deepEqual(out.map((x) => x.name), ['Agama', 'IPS', 'IPA', 'PJOK', 'Bahasa', 'Seni']);
  assert.deepEqual(out.map((x) => x.rank), [1, 2, 3, 4, 5, 6]);
});
test('C: tier, bobot, dan peta kampanye', () => {
  assert.deepEqual(P.TIER_ORDER, ['common', 'rare', 'epic', 'legend']);
  for (const lv of [1, 5, 6, 10, 11, 20, 21, 99]) assert.equal(Object.values(P.tierWeights(lv)).reduce((a, b) => a + b, 0), 100);
  assert.equal(P.campaignTier(1, 1), 'common'); assert.equal(P.campaignTier(1, 4), 'rare'); assert.equal(P.campaignTier(5, 4), 'legend');
  const r = rng(7); const cnt = { common: 0, rare: 0, epic: 0, legend: 0 }; for (let i = 0; i < 20000; i++) cnt[P.pickTier(r, 3)]++;
  assert.equal(cnt.legend, 0); assert.ok(Math.abs(cnt.common / 20000 - 0.70) < 0.02);
});
test('D: jawaban benar yang dibutuhkan selalu 15–30 dan sesuai tier', () => {
  for (const t of P.TIER_ORDER) for (const a of [null, 0, 25, 50, 75, 100]) {
    const n = P.hitsNeeded(t, a); assert.ok(n >= 15 && n <= 30); assert.ok(n >= P.BOSS_TIERS[t].minHits && n <= P.BOSS_TIERS[t].maxHits);
  }
  assert.equal(P.hitsNeeded('common', 0), 15); assert.equal(P.hitsNeeded('legend', 100), 30);
  assert.ok(P.hitsNeeded('legend', 90) > P.hitsNeeded('legend', 10));   // adaptif: pemain lebih kuat → rentang atas
  const st = P.bossStats('epic', 50, 100); assert.equal(st.bossMaxHp, st.hitsNeeded * 20); assert.ok(st.planned <= st.maxQuestions && st.maxQuestions <= 50);
  assert.equal(P.bossStats('legend', 100, 100, 12).hitsNeeded, 12);       // bank soal kecil → dibatasi
});
test('D: damage — lantai 1 hit, plafon 4×, pity, dan boss tak tumbang < 15 benar', () => {
  assert.equal(P.hitDamage({ comboStreak: 0, wrongStreak: 0 }).damage, 20);
  assert.equal(P.hitDamage({ comboStreak: 0, wrongStreak: 3 }).damage, 30);
  assert.equal(P.hitDamage({ comboStreak: 99, wrongStreak: 9, powerMult: 4 }).damage, 80);
  assert.equal(P.hitDamage({ comboStreak: 0, powerMult: 0.5 }).damage, 20);
  assert.equal(P.applyBossDamage(30, 80, 5), 1);        // belum 15 benar → sisa 1
  assert.equal(P.applyBossDamage(30, 80, 15), 0);
  assert.equal(P.applyBossDamage(100, 20, 3), 80);
});
test('D: kelelahan boss — hanya bila akurasi rendah, total benar tak < 15', () => {
  assert.equal(P.fatigueAdjust({ bossHp: 200, correctCount: 5, answeredCount: 4 }).applied, false);   // data kurang
  assert.equal(P.fatigueAdjust({ bossHp: 200, correctCount: 9, answeredCount: 10 }).applied, false);  // akurasi tinggi
  const f = P.fatigueAdjust({ bossHp: 400, correctCount: 5, answeredCount: 12 });                       // sisa 20 hit → 17
  assert.equal(f.applied, true); assert.equal(f.bossHp, 17 * 20);
  const blocked = P.fatigueAdjust({ bossHp: 200, correctCount: 5, answeredCount: 12 });                // 5 + 10 = 15 → lantai 15 menahan
  assert.equal(blocked.applied, false); assert.equal(blocked.bossHp, 200);
  for (const [hp, c] of [[400, 5], [300, 9], [100, 12], [40, 14]]) { const g = P.fatigueAdjust({ bossHp: hp, correctCount: c, answeredCount: 30 }); assert.ok(P.hitsLeft(g.bossHp) + c >= 15); }
});
test('F: kapasitas energi per level profil', () => {
  assert.deepEqual([1, 5, 6, 10, 11, 15, 16, 35, 36, 200].map(P.energyMaxForLevel), [5, 5, 6, 6, 7, 7, 8, 11, 12, 12]);
  assert.equal(P.gainEnergy(5, 3, 5), 5); assert.equal(P.gainEnergy(2, -9, 5), 0);
  assert.deepEqual([2, 3, 6, 9, 12].map(P.energyFromCorrect), [0, 1, 1, 1, 1]);
  assert.deepEqual(P.nextEnergyLevel(3), { level: 6, energyMax: 6 }); assert.equal(P.nextEnergyLevel(40), null);
});
test('E: tabel level skill & biaya upgrade', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map((l) => P.skillInfo('heal', l).value), [25, 35, 45, 55, 65]);
  assert.deepEqual([1, 2, 3, 4, 5].map((l) => P.skillInfo('shield', l).value), [20, 40, 60, 80, 100]);
  assert.deepEqual([1, 2, 3, 4, 5].map((l) => P.skillInfo('power_strike', l).value), [2, 2.5, 3, 3.5, 4]);
  assert.deepEqual([1, 2, 3, 4, 5].map((l) => P.skillInfo('time_freeze', l).value), [8, 11, 14, 17, 20]);
  assert.deepEqual([1, 2, 3, 4, 5].map(P.skillUpgradeCost), [60, 120, 220, 380, null]);
  assert.equal(Object.keys(P.SKILL_TABLE).length, 9);
});
test('C/D: simulasi keseimbangan (akurasi 50/70/90%) — pita penerimaan', () => {
  const g = (t, a, acc) => run(t, a, acc, 1500);
  for (const t of P.TIER_ORDER) for (const acc of [0.5, 0.7, 0.9]) {
    const r = g(t, 50, acc); assert.equal(r.overN, 0, `${t}@${acc}: tak boleh butuh > N benar`);
    if (r.win > 0) { assert.ok(r.minCorrectWin >= 15, `${t}@${acc} min`); assert.ok(r.maxCorrectWin <= 30, `${t}@${acc} max`); }
  }
  assert.ok(g('common', 50, 0.7).win >= 0.93); assert.ok(g('common', 50, 0.9).win >= 0.99);
  const l7 = g('legend', 50, 0.7); assert.ok(l7.win >= 0.78 && l7.win <= 0.97); assert.ok(g('legend', 50, 0.5).win <= 0.20);
  const c5 = g('common', 50, 0.5); assert.ok(c5.win >= 0.30 && c5.win <= 0.65);
  assert.ok(g('common', 50, 0.7).avgQ <= 28); assert.ok(l7.avgQ <= 44);
});
```

## Lampiran C — `scripts/sim-boss.js` (salin persis; simulasi keseimbangan tanpa DB)
```js
#!/usr/bin/env node
// scripts/sim-boss.js — simulasi keseimbangan boss (tanpa DB). Jalankan: node scripts/sim-boss.js [--check]
const P = require('../shared/progression.js');
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function battle(tier, ability, acc, rand, playerMaxHp = 100) {
  const st = P.bossStats(tier, ability, playerMaxHp);
  let bossHp = st.bossMaxHp, hp = playerMaxHp, streak = 0, wrongStreak = 0, correct = 0, q = 0, phase2 = false;
  while (q < st.maxQuestions) {
    q++;
    if (rand() < acc) {
      correct++; streak++;
      bossHp = P.applyBossDamage(bossHp, P.hitDamage({ comboStreak: streak, powerMult: 1, wrongStreak }).damage, correct); wrongStreak = 0;
      if (bossHp <= 0) return { win: true, q, correct, n: st.hitsNeeded };
      if (!phase2 && bossHp <= st.bossMaxHp / 2) { phase2 = true; bossHp = P.fatigueAdjust({ bossHp, correctCount: correct, answeredCount: q }).bossHp; }
    } else { streak = 0; wrongStreak++; hp -= st.monsterDamage; if (hp <= 0) return { win: false, q, correct, n: st.hitsNeeded }; }
  }
  return { win: false, timeout: true, q, correct, n: st.hitsNeeded };
}
function run(tier, ability, acc, runs = 2000) {
  const rand = rng(12345 + tier.length * 7 + ability * 3 + Math.round(acc * 100)); let win = 0, sumQ = 0, maxCorrectWin = 0, minCorrectWin = 99, bad = 0;
  for (let i = 0; i < runs; i++) { const r = battle(tier, ability, acc, rand); sumQ += r.q; if (r.win) { win++; maxCorrectWin = Math.max(maxCorrectWin, r.correct); minCorrectWin = Math.min(minCorrectWin, r.correct); if (r.correct > r.n) bad++; } }
  return { tier, ability, acc, win: win / runs, avgQ: sumQ / runs, minCorrectWin, maxCorrectWin, overN: bad };
}
if (require.main === module) {
  const rows = [];
  for (const tier of P.TIER_ORDER) for (const ability of [30, 50, 80]) for (const acc of [0.5, 0.7, 0.9]) rows.push(run(tier, ability, acc));
  console.log('tier    ability acc   menang  rataQ  benar(min-max saat menang)  melebihiN');
  for (const r of rows) console.log(`${r.tier.padEnd(7)} ${String(r.ability).padStart(5)}  ${r.acc.toFixed(1)}  ${(r.win * 100).toFixed(0).padStart(5)}%  ${r.avgQ.toFixed(1).padStart(5)}  ${String(r.minCorrectWin).padStart(3)}-${String(r.maxCorrectWin).padEnd(3)}                  ${r.overN}`);
}
module.exports = { battle, run, rng };
```

## Lampiran D — `scripts/progress.mjs` (pengelola ceklis; salin persis, sudah diuji)
```js
#!/usr/bin/env node
// scripts/progress.mjs — pengelola ceklis docs/PROGRESS-v6.md (tanpa dependensi). Jalankan: npm run progress -- <perintah>
import fs from 'node:fs';
import path from 'node:path';

const FILE = process.env.PROGRESS_FILE || 'docs/PROGRESS-v6.md';
const MAX_TRIES = 2;                                   // percobaan maks per tugas sebelum wajib diblokir
const LINE = /^- \[([ ~x!])\] \*\*((?:T|G)-\d+)\*\*/;
const die = (m) => { console.error('✖ ' + m); process.exit(1); };
const read = () => { if (!fs.existsSync(FILE)) die(`${FILE} belum ada. Jalankan: npm run progress -- init <file-dokumen-v6.md>`); return fs.readFileSync(FILE, 'utf8').split('\n'); };
const write = (l) => fs.writeFileSync(FILE, l.join('\n'));
const stamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ');
const tasks = (lines) => lines.map((t, i) => { const m = LINE.exec(t); return m ? { i, st: m[1], id: m[2] } : null; }).filter(Boolean);
const triesOf = (t) => Number(/<!--tries:(\d+)-->/.exec(t)?.[1] ?? 0);
const withState = (t, st) => t.replace(/^- \[[ ~x!]\]/, `- [${st}]`);
const withTries = (t, n) => t.replace(/\s*<!--tries:\d+-->/, '') + ` <!--tries:${n}-->`;
const find = (ts, id) => ts.find((t) => t.id === id) ?? die(`ID tidak ditemukan: ${id}`);
const nextOf = (ts) => ts.find((t) => t.st === '~') ?? ts.find((t) => t.st === ' ');   // tugas [~] (belum tuntas) selalu didahulukan
const addNote = (lines, i, note) => { let j = i + 1; while (lines[j]?.startsWith('  - ')) j++; lines.splice(j, 0, `  - ${note}`); };
const templateBody = (docPath) => {
  const doc = fs.readFileSync(docPath, 'utf8'); const a = doc.lastIndexOf('@@TEMPLATE-START@@'); const b = doc.lastIndexOf('@@TEMPLATE-END@@');
  if (a < 0 || b < 0) die('Penanda template tidak ditemukan di dokumen.');
  const body = doc.slice(doc.indexOf('\n', a) + 1, b).replace(/\n[^\n]*$/, '\n');
  if (!/\*\*T-00\*\*/.test(body)) die('Template kosong/salah — periksa Lampiran F.'); return body;
};
const [cmd, a1, ...rest] = process.argv.slice(2);
const force = rest.includes('--force'); const text = rest.filter((x) => x !== '--force').join(' ').trim();

function status(lines) {
  const ts = tasks(lines); const c = { ' ': 0, '~': 0, x: 0, '!': 0 }; ts.forEach((t) => c[t.st]++);
  const nx = nextOf(ts); const pct = Math.round((c.x / ts.length) * 100);
  console.log(`Progres: ${c.x}/${ts.length} selesai (${pct}%) · sedang: ${c['~']} · diblokir: ${c['!']} · belum: ${c[' ']}`);
  console.log(nx ? `BERIKUTNYA → ${lines[nx.i].replace(/\s*<!--.*?-->/, '')}` : '🎉 Semua tugas selesai/diblokir. Kirim Laporan Akhir (Bagian 14).');
}

switch (cmd) {
  case 'init': {
    if (!a1) die('Pakai: init <file-dokumen-v6.md>');
    if (fs.existsSync(FILE)) die(`${FILE} sudah ada — JANGAN ditimpa. Pakai: status / next (atau sync <doc> bila dokumen diperbarui)`);
    const body = templateBody(a1);
    fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, body); console.log(`✔ ${FILE} dibuat.`); status(read()); break;
  }
  case 'sync': {   // tambahkan tugas BARU dari dokumen yang diperbarui; tugas lama (apa pun statusnya) tidak disentuh
    if (!a1) die('Pakai: sync <file-dokumen-v6.md>');
    const l = read(); const tl = templateBody(a1).split('\n'); const have = new Set(tasks(l).map((t) => t.id)); const added = [];
    let prev = null; let hdr = null;
    for (const line of tl) {
      if (line.startsWith('## ')) { hdr = line; continue; }
      const m = LINE.exec(line); if (!m) continue; const id = m[2];
      if (!have.has(id)) {
        const cur = tasks(l); let idx;
        if (prev) { const pt = cur.find((t) => t.id === prev); idx = pt.i + 1; while (l[idx]?.startsWith('  - ')) idx++; } else idx = cur[0].i;
        const ins = !hdr || l.includes(hdr) ? [line] : ['', hdr, line];
        l.splice(idx, 0, ...ins); have.add(id); added.push(id);
      }
      prev = id;
    }
    write(l); console.log(added.length ? `✔ ditambahkan: ${added.join(', ')}` : 'Tidak ada tugas baru — ceklis sudah mutakhir.'); status(read()); break;
  }
  case 'status': status(read()); break;
  case 'next': { const l = read(); const n = nextOf(tasks(l)); console.log(n ? l[n.i] : 'Tidak ada tugas tersisa.'); break; }
  case 'start': {
    const l = read(); const ts = tasks(l); const t = find(ts, a1);
    if (t.st === 'x') die(`${a1} SUDAH SELESAI. Jangan dikerjakan ulang. Jalankan: status`);
    if (t.st === '!') die(`${a1} berstatus DIBLOKIR. Lanjut ke tugas berikutnya (status).`);
    const other = ts.find((x) => x.st === '~' && x.id !== a1); if (other) die(`${other.id} masih berjalan. Selesaikan (done) atau blokir (block) dulu.`);
    const nx = nextOf(ts); if (!force && t.st !== '~' && nx.id !== a1) die(`Urutan: tugas berikutnya adalah ${nx.id}, bukan ${a1}.`);
    const n = triesOf(l[t.i]) + (t.st === '~' ? 0 : 1);
    if (n > MAX_TRIES) die(`${a1} sudah dicoba ${MAX_TRIES}×. Jalankan: block ${a1} "alasan" lalu lanjut tugas lain.`);
    l[t.i] = withTries(withState(l[t.i], '~'), n); write(l); console.log(`▶ ${a1} dimulai (percobaan ${n}/${MAX_TRIES}).`); break;
  }
  case 'note': { const l = read(); const t = find(tasks(l), a1); if (!text) die('Catatan kosong.'); addNote(l, t.i, `📝 ${stamp()} — ${text}`); write(l); console.log('✔ catatan ditambah.'); break; }
  case 'done': {
    const l = read(); const ts = tasks(l); const t = find(ts, a1);
    if (t.st === 'x') { console.log(`${a1} sudah selesai sebelumnya — tidak ada yang diubah.`); break; }
    if (!text) die('Bukti wajib: done <ID> "file yang diubah · perintah tes · hasil"');
    if (t.st !== '~' && nextOf(ts)?.id !== a1 && !force) die(`${a1} belum dimulai (start) dan bukan tugas berikutnya.`);
    l[t.i] = withState(l[t.i], 'x'); addNote(l, t.i, `✅ ${stamp()} — ${text}`); write(l); console.log(`✔ ${a1} SELESAI.`); status(read()); break;
  }
  case 'block': {
    const l = read(); const t = find(tasks(l), a1); if (!text) die('Alasan wajib: block <ID> "alasan"');
    l[t.i] = withState(l[t.i], '!'); addNote(l, t.i, `⛔ ${stamp()} — ${text}`); write(l); console.log(`⛔ ${a1} diblokir.`); status(read()); break;
  }
  case 'handoff': {
    const l = read(); const k = l.findIndex((x) => x.trim() === '<!--HANDOFF-->'); if (k < 0) die('Penanda HANDOFF hilang.');
    const ho = [a1, ...rest].filter(Boolean).join(' ').trim(); if (!ho) die('Isi handoff kosong.'); l[k + 1] = `> ${stamp()} — ${ho}`; write(l); console.log('✔ handoff diperbarui.'); break;
  }
  case 'check': {
    const l = read(); const ts = tasks(l); const bad = [];
    const block = (i) => { const o = []; for (let j = i + 1; l[j]?.startsWith('  - '); j++) o.push(l[j]); return o; };
    if (ts.filter((t) => t.st === '~').length > 1) bad.push('Lebih dari satu tugas berstatus [~].');
    for (const t of ts) {
      if (t.st === 'x' && !block(t.i).some((x) => x.startsWith('  - ✅'))) bad.push(`${t.id} [x] tanpa bukti.`);
      if (t.st === '!' && !block(t.i).some((x) => x.startsWith('  - ⛔'))) bad.push(`${t.id} [!] tanpa alasan.`);
    }
    if (bad.length) die(bad.join('\n')); console.log('✔ ceklis valid.'); break;
  }
  default: console.log('Perintah: init <doc> | sync <doc> | status | next | start <ID> | note <ID> "teks" | done <ID> "bukti" | block <ID> "alasan" | handoff "teks" | check');
}
```

## Lampiran E — Template `docs/PROGRESS-v6.md` (dibuat otomatis oleh `npm run progress -- init docs/FITUR-v6.md`)
Baris penanda template di bawah (diawali dan diakhiri `@@`) hanyalah penanda untuk perintah `init`; jangan dihapus.
````markdown
@@TEMPLATE-START@@
# PROGRESS — Fitur v6 (Laporan, Level Kemampuan, Boss Bertier, Darah Adaptif, Upgrade Skill, Energi per Level)
> File ini adalah **satu-satunya sumber kebenaran** status pekerjaan. Baca di awal setiap giliran. Ubah status HANYA lewat `npm run progress -- …` (jangan edit centang manual).

## HANDOFF (diperbarui agent sebelum iterasi habis)
<!--HANDOFF-->
> (belum ada) — mulai dari tugas pertama yang belum dicentang.

## Legenda
`[ ]` belum · `[~]` sedang dikerjakan (maks 1) · `[x]` selesai & terbukti · `[!]` diblokir (alasan wajib). Baris `  - ✅` = bukti, `  - 📝` = catatan, `  - ⛔` = alasan blokir.

## Fase 0 — Persiapan (sekali saja)
- [ ] **T-00** Audit SEKALI, catat lewat `note`: (a) lokasi fungsi/route yang akan disentuh (`compileWeeklyReport`, router layar & kartu menu Laporan di `app.js`, pembuatan boss/damage/`answer` di `lib/db.js`, penambahan & batas energi di `gameplay.js`, fungsi level-dari-XP, route & UI upgrade skill); (b) sumber riwayat jawaban untuk B.1; (c) jumlah soal aktif per mapel; (d) baseline `npm test` + `check-schema` + `smoke-test-v4` hijau; (e) ada/tidaknya service worker; (f) backup DB `data/play.db.bak-*` _(Spek: Aturan kerja 1 · Bukti: ringkasan audit + nama file backup)_
- [ ] **T-01** Salin persis `shared/progression.js` (Lampiran A), `tests/progression.test.js` (B), `scripts/sim-boss.js` (C); bila `economy.js`/`gameplay.js` sudah punya padanan, jadikan itu sumber tunggal _(Spek: Aturan kerja 3 · Bukti: `npm test` hijau termasuk 10 uji progression)_
- [ ] **T-02** Migrasi aditif idempoten kolom `game_sessions` (+ `player_skills.level` bila belum ada) dengan backup; perbarui `scripts/check-schema.js` _(Spek: G.1 · Bukti: `node scripts/check-schema.js` lulus; sesi IN_PROGRESS lama tetap terbaca)_
- [ ] **G-0** GERBANG 0: `npm test` + `check-schema` + `smoke-test-v4` hijau; commit

## Fase 1 — Level kemampuan (B) dan menu Laporan (A)
- [ ] **T-10** B: `computeSubjectAbilities(playerId)` di `lib/db.js` memakai `Progression.abilityScore/sortAbilities` + `GET /api/report/abilities` _(Spek: B.1, B.2 · Bukti: uji data campuran → urutan NAIK, `INSUFFICIENT`/`NONE` di akhir, `lowestSubjectId` benar)_
- [ ] **T-11** A: `GET /api/report/week?week=` — minggu berjalan dikompilasi langsung (`partial:true`), minggu lampau memakai/upsert `weekly_reports` `v:2`; semua field A.2 termasuk `abilities`, `bossByTier`, `daily`, `weakTopics`, `praise/advice` _(Spek: A.2 · Bukti: respons pemain baru & pemain berdata; laporan `v1` lama tidak error)_
- [ ] **T-12** A: kartu menu `menu-report` → layar Laporan: header + navigasi minggu + lencana Sementara + 6 kartu ringkasan + grafik SVG 7 hari + keadaan kosong _(Spek: A.1 · Bukti: uji manual 320×568 & 430×932)_
- [ ] **T-13** B: bagian Level Kemampuan di layar Laporan (urut naik, bilah, lencana level, 🎯 Fokus latihan + tombol Latihan, detail, ❓ penjelasan, status kurang data/belum dicoba) _(Spek: B.3 · Bukti: uji manual; mapel terendah memulai sesi mapel itu)_
- [ ] **T-14** A: topik perlu dibimbing/dikuasai, pujian & saran, Bagikan/Salin/Cabut tautan, portal `/r/{token}` memuat `abilities` + `bossByTier` _(Spek: A.1, A.2 · Bukti: token cabut ditolak; portal tampil benar)_
- [ ] **G-1** GERBANG 1: `npm test` + `check-schema` + skenario H.1, H.2 + tanpa regresi laporan mingguan lama; commit

## Fase 2 — Energi per level (F) dan upgrade skill (E)
- [ ] **T-20** F: server — `energy_max` snapshot saat `start`, semua penambahan energi di-clamp, perolehan +1 per 3 jawaban benar bila belum ada aturan reguler, `GET /api/me` + `energyMax`/`nextEnergyLevel`, Pedagang saat penuh _(Spek: F.1, F.2 · Bukti: tes Lv 1/5/6/11/36 + clamp + resume)_
- [ ] **T-21** F: UI — bilah energi `nilai/kapasitas` muat di 320 px, info kapasitas & level berikutnya di profil, toast "Kapasitas energi naik" di layar hasil _(Spek: F.3 · Bukti: uji manual)_
- [ ] **T-22** E: DIAGNOSIS upgrade skill — reproduksi lewat curl + UI, 5 kasus, periksa 12 dugaan; TANPA ubah kode _(Spek: E.1 · Bukti: tabel kasus→gejala→akar masalah di catatan)_
- [ ] **T-23** E: server — upgrade atomik 1 transaksi (level + koin + idempotensi sukses-saja), `GET /api/skills` dengan `canUpgrade/reason`, efek battle mengikuti level skill + snapshot loadout _(Spek: E.2, E.4 · Bukti: skenario H.9 sisi server; invarian saldo koin utuh)_
- [ ] **T-24** E: UI layar Skill — pip level, efek sekarang→berikutnya, tombol Upgrade + konfirmasi, toast alasan, kunci saat request, badge `Lv n` di battle _(Spek: E.3 · Bukti: uji manual end-to-end; akar masalah T-22 tertutup)_
- [ ] **G-2** GERBANG 2: `npm test` + `check-schema` + skenario H.9, H.10 + `smoke-test-v4` hijau; commit

## Fase 3 — Boss bertier (C) dan darah boss adaptif (D)
- [ ] **T-30** C/D: server — pilih tier (kampanye = peta, Mode Bebas = bobot level profil), `bossStats` (N dari kemampuan mapel, `boss_max_hp = N×20`), simpan kolom sesi, respons `boss{…}`, kompatibel sesi lama (`NULL`), bank soal kecil _(Spek: C.2, D.1 · Bukti: skenario H.3, H.4, H.8)_
- [ ] **T-31** D: server — `hitDamage` + `applyBossDamage` (lantai 1 hit, plafon 4×, lantai 15 benar), pity, `monster_damage`, kelelahan boss sekali saat Fase Marah _(Spek: D.2, D.3 · Bukti: skenario H.4, H.5, H.6)_
- [ ] **T-32** D: server — panjang sesi dinamis: `planned`, isi ulang 5 soal, `maxQuestions` → jalur bintang yang ada, komposisi soal terjaga, resume memulihkan `boss_*` _(Spek: D.4 · Bukti: skenario H.7)_
- [ ] **T-33** C: hadiah koin/XP × pengali tier (setelah bonus lain), `bossByTier` benar di laporan _(Spek: C.3 · Bukti: kemenangan tiap tier → hadiah sesuai; laporan menghitung tier)_
- [ ] **T-34** C/D: UI — lencana tier, aura monster di `monsters.js` (common/rare/epic/legend), bilah HP berbingkai tier + "Sisa maks. X jawaban benar", intro boss, banner kelelahan, lencana Serangan Balik _(Spek: C.4, D.1, D.3 · Bukti: uji manual 4 tier di 320×568; hemat animasi mati)_
- [ ] **T-35** C/D: perbarui `scripts/test-gameplay-e2e.js` & `smoke-test-v4.js` agar menyelesaikan sesi bertier yang lebih panjang; jalankan `scripts/sim-boss.js` _(Spek: D.5, H · Bukti: e2e 12 mapel hijau; simulasi dalam pita penerimaan)_
- [ ] **G-3** GERBANG 3: `npm test` + `check-schema` + `smoke-test-v4` + e2e + skenario H.3–H.8, H.11 lulus; commit

## Fase 4 — Penutup dan deploy
- [ ] **T-50** Jalankan seluruh skenario H.1–H.12 dan isi tabel kriteria I.1–I.11 ✅/❌ lewat `note` _(Bukti: hasil tiap skenario)_
- [ ] **T-51** Perbarui dokumen arsitektur (versi v6: tier boss, energi per level, level kemampuan, laporan) dan `docs/PROGRESS-v6.md`; DEPLOY: backup `.backup` → `pm2 restart play` → `smoke-test-v4` → cek `https://play.printshare.my.id/` _(Bukti: keluaran smoke test pasca-deploy)_
- [ ] **T-52** Kirim Laporan Akhir (Bagian J) dan sertakan salinan file ini _(Bukti: laporan terkirim)_
@@TEMPLATE-END@@
````
