# Dokumentasi Arsitektur Petualangan Pelajar v7 — Boss Elemen, Mode Brutal & Monster Dex

Dokumen ini merangkum pembaruan arsitektur sistem pada versi 7 (v7.0) untuk platform **Petualangan Pelajar** (`play.printshare.my.id`), mencakup Fitur A sampai F serta penguatan sistem server, database, dan frontend.

---

## 1. Ringkasan Eksekutif v7
Pembaruan v7 memperkaya pertarungan boss dan koleksi monster dengan 4 pilar utama:
1. **10 Elemen Spesialis**: Setiap boss kini memiliki elemen unik dengan 4 jurus/skill spesialis (total 40 skill unik).
2. **Kekuatan Rarity Dinamis**: Jumlah skill boss menyesuaikan tier (Common 1, Rare 2, Epic 3, Legend 4) dengan skala magnitudo (×1,0 / ×1,3 / ×1,6 / ×2,0).
3. **Mode Brutal (Tantangan Ekstrem)**: Pilihan opsional sebelum bertarung untuk pemain Level ≥ 5; efek skill boss berlipat ganda (2×), hadiah koin & XP berlipat tiga (3×).
4. **Monster Dex Generasi Baru**: Katalog 40 kartu monster boss elemen dengan desain 1 baris = 1 kartu (lebar penuh), deskripsi dan seluruh skill terbaca utuh tanpa pemotongan teks, filter elemen & tier, serta sakelar pratinjau efek Brutal.

---

## 2. Pemetaan 10 Tema Habitat ke 10 Elemen Boss

| No | Elemen (`boss_element`) | Nama Elemen | Ikon | Warna Hex | Tema Asli Game | Gelar / Karakter |
|:--:|:-----------------------|:------------|:----:|:---------:|:---------------|:-----------------|
| 1  | `fire`                 | Api         | 🔥   | `#EF4444` | `api`          | Penguasa Api (Amarah Membara: makin sekarat makin pedas) |
| 2  | `water`                | Air         | 💧   | `#38BDF8` | `laut`         | Penjaga Samudra (Arus Deras menyedot energi) |
| 3  | `ice`                  | Es          | ❄️   | `#93C5FD` | `es`           | Raja Salju (Bekuan waktu mempercepat hitungan mundur) |
| 4  | `nature`               | Hutan       | 🌿   | `#22C55E` | `hutan`        | Roh Rimba (Duri beracun DoT saat salah jawab) |
| 5  | `earth`                | Tanah       | 🪨   | `#A16207` | `gua`          | Golem Pegunungan (Tinju Gempa bertempo tiap 3-4 soal) |
| 6  | `wind`                 | Angin       | 🌪️   | `#94A3B8` | `langit`       | Penguasa Topan (Pusaran angin mengurangi waktu berpikir) |
| 7  | `thunder`              | Petir       | ⚡   | `#FACC15` | `mesin`        | Raja Guntur (Sengatan korsleting menguras energi & membebani skill) |
| 8  | `shadow`               | Bayangan    | 🌑   | `#7C3AED` | `hantu`        | Hantu Kegelapan (Kutukan peredam heal & penembus perisai) |
| 9  | `light`                | Cahaya      | ✨   | `#FDE68A` | `manis`        | Penjaga Kristal (Silau kristal meredam combo hit) |
| 10 | `toxic`                | Racun       | ☠️   | `#84CC16` | `rawa`         | Ratu Rawa Beracun (Kabut racun melemahkan pertahanan pemain) |

---

## 3. Sistem Skill Boss & Rarity Scaling

Setiap elemen memiliki 4 skill berjenjang:
- **Tier Common**: 1 Skill dasar (Skill 1).
- **Tier Rare**: 2 Skill (Skill 1 + Skill 2).
- **Tier Epic**: 3 Skill (Skill 1 + Skill 2 + Skill 3).
- **Tier Legend**: 4 Skill Lengkap (Skill 1 + Skill 2 + Skill 3 + Skill 4).

Skala Efek Rarity:
- `common`: Multiplier dasar ×1,00
- `rare`: Multiplier dasar ×1,30
- `epic`: Multiplier dasar ×1,60
- `legend`: Multiplier dasar ×2,00

---

## 4. Mode Brutal (💀)

1. **Syarat Akses**: Pemain minimal Level 5 (`Progression.levelFormula(xp) >= 5`). Permintaan dengan level < 5 ditolak dengan HTTP `403 BRUTAL_LOCKED`.
2. **Konfirmasi Pertama**: Modal persetujuan sekali (`brutalAck: true` di `players.settings_json`).
3. **Efek Mekanika**:
   - Seluruh efek skill boss dikalikan 2× (tetap mematuhi batas pengaman).
   - Seluruh hadiah koin & XP sesi pertarungan (kemenangan, partisipasi, kombo) dikalikan **3×** (menumpuk secara multiplikatif dengan tier boss).
   - Label transaksi koin otomatis bersufiks `:BRUTAL` (contoh: `BATTLE_WIN:BRUTAL`).
   - Saldo koin pemain tetap memenuhi invarian `players.coins == SUM(coin_transactions.delta)`.
4. **Visual & Aksesibilitas**:
   - Kartu boss memiliki outline merah berdenyut (`.battle-brutal`).
   - Lencana HUD `💀 BRUTAL` (`.brutal-badge`).
   - Menghormati pengaturan animasi hemat (`@media (prefers-reduced-motion)` dan `body.reduced-motion`).

---

## 5. Batas Pengaman Sistem (Anti-Frustrasi Anak)

1. **Lantai DoT (Damage over Time)**: DoT tidak pernah membunuh pemain; jika DoT ≥ player HP, HP disisakan tepat 1 HP.
2. **Plafon Kerusakan Sekali Pukul**: Kerusakan serangan jurus boss dibatasi maksimal 50% dari HP maksimum pemain.
3. **Lantai Waktu Soal**: Penalti waktu dari skill es/angin tidak pernah menurunkan batas waktu di bawah 8 detik atau faktor pengali waktu di bawah `0,6×`.
4. **Idempotensi Sajian Soal**: Memuat ulang layar pertempuran pada soal yang sama tidak menggandakan pemotongan DoT.
5. **Jaminan Integritas HP Boss**: Tidak ada hook skill boss yang mengubah HP boss atau mengurangi hitungan kemenangan (boss tetap tumbang dalam 15–30 jawaban benar sesuai v6).

---

## 6. Monster Dex (📖 Katalog 40 Boss)

1. **Tata Letak Satu Kartu Per Baris**:
   - `grid-template-columns: 1fr` selalu satu kolom di layar sempit maupun desktop.
   - Menggunakan token, radius, dan bayangan selaras dengan kartu skin di toko.
   - Teks deskripsi dan skill tampil utuh tanpa pemotongan (`overflow-wrap: anywhere`, tanpa `line-clamp` / `ellipsis`).
2. **Kontrol Interaktif**:
   - `#dex-filter-element` (`data-testid="dex-filter-element"`): Menyaring 10 elemen.
   - `#dex-filter-tier` (`data-testid="dex-filter-tier"`): Menyaring 4 tier (Common, Rare, Epic, Legend).
   - `#dex-brutal-toggle` (`data-testid="dex-brutal-toggle"`): Sakelar pratinjau angka kalkulasi Brutal 2× secara real-time.
3. **Penyajian Data**:
   - Menampilkan statistik `Dikalahkan n× · Mode Brutal n×` per entri yang terakumulasi dari database pemain.
   - Kebal terhadap injeksi XSS (semua teks ter-escape aman lewat `DexCards.esc`).

---

## 7. Skema Database & Migrasi Aditif

Kolom aditif pada tabel `game_sessions`:
- `boss_element TEXT`: Menyimpan kunci elemen boss (`fire`, `water`, dsb.).
- `brutal INTEGER DEFAULT 0`: Penanda sesi Mode Brutal (`0` = normal, `1` = brutal).
- `boss_fx_json TEXT`: State DoT, status cooldown jurus, dan log event efek boss berformat JSON.

Semua sesi lama dengan kolom bernilai `NULL` tetap berjalan secara transparan dan netral tanpa galat.

---

## 8. Verifikasi Kualitas & Suite Pengujian

- `tests/bossskills.test.js`: 13 uji unit spesialis elemen, formula kalkulasi, dan jaminan v6.
- `tests/bossfx.glue.test.js`: 6 uji perekat logika server (state DoT, telegraph, pengali hadiah, pengaman HP).
- `tests/ui-v7.test.js`: 10 uji komponen UI Dex, Battle HUD, kontrol filter, dan perlindungan injeksi XSS.
- `scripts/check-schema.js`: Audit 254 query SQLite (100% valid tanpa regresi).
- `scripts/smoke-test-v4.js`: 16/16 kriteria uji asap otomatis (100% lulus).
- `scripts/test-gameplay-e2e.js`: Simulasi E2E pada 13 mapel, sesi bertier panjang hingga tumbang, dan 3 sesi Brutal.
- `scripts/sim-bossfx.js`: Simulasi probabilitas kemenangan lintas 10 elemen memastikan kurva berjenjang yang adil (90% akurasi tetap menang 99–100%).
