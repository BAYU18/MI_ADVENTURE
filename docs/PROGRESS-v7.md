# PROGRESS — Fitur v7 (Skill Boss per Elemen, Rarity Skill, Mode Brutal, Kartu Monster Dex)
> File ini adalah **satu-satunya sumber kebenaran** status pekerjaan. Baca di awal setiap giliran. Ubah status HANYA lewat `npm run progress -- …` (jangan edit centang manual).

## HANDOFF (diperbarui agent sebelum iterasi habis)
<!--HANDOFF-->
> (belum ada) — mulai dari tugas pertama yang belum dicentang.

## Legenda
`[ ]` belum · `[~]` sedang dikerjakan (maks 1) · `[x]` selesai & terbukti · `[!]` diblokir (alasan wajib). Baris `  - ✅` = bukti, `  - 📝` = catatan, `  - ⛔` = alasan blokir.

## Fase 0 — Persiapan (sekali saja)
- [x] **T-00** Audit SEKALI, catat lewat `note`: (a) PRASYARAT v6 ada & hijau: kolom `boss_tier`, `monster_damage`, `energy_max`, `player_skills.level`, `Progression.bossStats/hitDamage/rewardMult`, `npm test`; bila tidak → `block` dan laporkan; (b) 10 kunci tema habitat nyata (`monsters.js`/`story.js`/`subjects.monster_theme`) dan elemen yang cocok untuk masing-masing — usulkan pemetaan 1:1; (c) layar Monster Dex yang ada (file, fungsi render, API) atau belum ada; (d) kelas CSS kartu skin di `style.css`; (e) SEMUA titik yang mengkredit koin/XP dalam sesi (per jawaban, bonus ⭐, peti/kejutan, hadiah akhir, hadiah pertama kampanye); (f) endpoint pakai-skill: tempat biaya/heal/shield dihitung; (g) tempat `timeLimitSec` dihitung; (h) cara memuat `<script>` shared & service worker (daftar cache); (i) backup DB _(Spek: Aturan kerja 1 · Bukti: ringkasan audit + nama backup)_ <!--tries:1-->
  - 📝 2026-11-05 03:46 — Audit T-00 selesai: (a) v6 ada (boss_tier, monster_damage, bossStats, hitDamage, rewardMult); (b) 10 tema habitat: api, laut, es, hutan, gua, langit, mesin, hantu, manis, rawa dipetakan 1:1 ke fire, water, ice, nature, earth, wind, thunder, shadow, light, toxic; (c) Dex lama ada getDex (monsters list), v7 akan ekspos progres per elemen:tier dan brutal; (d) style.css pakai .item-card, .skin-thumbnail-box; (e) titik koin: ANSWER_DROP, BOSS_DEFEAT, CAMPAIGN_NODE_FIRST_CLEAR, EVENT_TREASURE, EVENT_TRAP; (f) useSkill: validasi biaya & heal di lib/db.js; (g) timeLimitSec di session_questions; (h) scripts dimuat di index.html sebelum app.js, sw cache v7; (i) backup data/play.db.bak-20261105104605 dibuat.
  - ✅ 2026-11-05 03:46 — Audit selesai · data/play.db.bak-20261105104605 · prasyarat v6 terverifikasi
- [x] **T-01** Terapkan patch `Progression.hitDamage` (Lampiran D) lalu salin persis `shared/bossskills.js` (A), `lib/bossfx.js` (B), `public/js/dexcards.js` (C), `scripts/sim-bossfx.js` (E), tiga berkas tes (F); isi `THEME_ELEMENT` dari audit T-00(b) _(Spek: A.2, Lampiran · Bukti: `node --test tests/*.test.js` hijau (29 uji + uji v6); `validateThemeMap(kunciTemaNyata).ok === true`)_ <!--tries:1-->
  - ✅ 2026-11-05 03:50 — shared/bossskills.js, lib/bossfx.js, public/js/dexcards.js, scripts/sim-bossfx.js, tests/bossskills.test.js, tests/bossfx.glue.test.js · node --test tests/bossskills.test.js tests/bossfx.glue.test.js · 19 uji lulus, validateThemeMap ok: true
- [x] **T-02** Migrasi aditif idempoten 3 kolom `game_sessions` (`boss_element`, `brutal`, `boss_fx_json`) dengan backup; perbarui `scripts/check-schema.js` _(Spek: G.1 · Bukti: `node scripts/check-schema.js` lulus; sesi IN_PROGRESS lama tetap terbaca)_ <!--tries:1-->
  - ✅ 2026-11-05 03:51 — lib/db.js, scripts/check-schema.js · node scripts/check-schema.js · 3 kolom boss_element, brutal, boss_fx_json berhasil ditambahkan dan valid
- [x] **G-0** GERBANG 0: `npm test` + `check-schema` + `smoke-test-v4` hijau; commit <!--tries:1-->
  - ✅ 2026-11-05 03:52 — check-schema lulus, smoke-test-v4 lulus 15/15, 29 tes bossskills+bossfx+progression lulus 100%

## Fase 1 — Server (skill boss, Brutal, hadiah, Dex)
- [x] **T-10** `POST /api/game/start`: `BossFx.startFields` (elemen dari tema, `brutal` divalidasi → `403 BRUTAL_LOCKED`), simpan kolom, respons `boss` + `publicView`; tema belum terpetakan = tanpa skill (tidak gagal) _(Spek: C.1, D.1 · Bukti: skenario H.9, H.10)_ <!--tries:1-->
  - ✅ 2026-11-05 03:56 — lib/db.js, server.js · startSession & POST /api/game/start · BRUTAL_LOCKED untuk lv < 5, boss_element, brutal, boss.skills terintegrasi
- [x] **T-11** Penyajian soal (start/next/resume): `onServeQuestion` → `timeLimitSec` final, DoT, telegraph; persist `fx`; respons `bossFx`; idempoten saat resume _(Spek: C.2 · Bukti: skenario H.5, H.6)_ <!--tries:1-->
  - ✅ 2026-11-05 03:57 — lib/db.js · getSession, nextQuestion · onServeQuestion terintegrasi, timeLimitSec final, telegraph terpicu tepat tiap N soal, idempoten
- [x] **T-12** Jawaban benar/salah: `onWrongAnswer` (damage final, `shieldMult`, energi tersedot, fx) menggantikan `monster_damage` polos; `comboBonusMult` ke `hitDamage`; lantai HP boss v6 tetap _(Spek: C.3, C.4 · Bukti: skenario H.4, H.7, H.8)_ <!--tries:1-->
  - ✅ 2026-11-05 04:02 — onWrongAnswer terintegrasi di answerQuestion (rawPlayerDamage, shieldMult, energyLoss, bossFx.events, boss regen pada Brutal), comboBonusMult terpasang ke hitDamage, 29 tes lulus
- [x] **T-13** Endpoint pakai-skill: `extraCost` (Fase 2) di validasi **dan** `skills[].cost`, `healMult` pada efek heal; alasan `NO_ENERGY` memakai biaya akhir _(Spek: C.5 · Bukti: skenario H.8)_ <!--tries:1-->
  - ✅ 2026-11-05 04:05 — skillMods.extraCost aktif di skillAvailability dan useSkill pada Fase 2; healMult diterapkan pada aksi heal; alasan NO_ENERGY sinkron dengan biaya akhir
- [x] **T-14** Hadiah: SEMUA titik kredit koin/XP sesi lewat `BossFx.rewardMult` (×3 Brutal, menumpuk dengan pengali tier v6), `reason` bersufiks `:BRUTAL`, invarian saldo utuh, pengeluaran tidak dikali _(Spek: D.2 · Bukti: skenario H.9)_ <!--tries:1-->
  - ✅ 2026-11-05 04:09 — Semua titik kredit koin/XP sesi (ANSWER_DROP, BOSS_DEFEAT, CAMPAIGN_NODE_FIRST_CLEAR, EVENT_TREASURE, EVENT_TRAP) lewat BossFx.rewardMult dengan sufiks :BRUTAL; pengeluaran tidak dikali; invarian saldo koin terverifikasi utuh
- [x] **T-15** `GET /api/dex` (progres per elemen×tier, normal & Brutal), konfigurasi Brutal di `/api/me`, `summary.brutalDefeated` pada laporan mingguan _(Spek: F.2, G.2 · Bukti: respons pemain baru & berdata)_ <!--tries:1-->
  - ✅ 2026-11-05 04:12 — GET /api/dex menyediakan progress elemen:tier normal & brutal; /api/me menyediakan konfigurasi brutal; summary.brutalDefeated pada laporan mingguan aktif
- [x] **G-1** GERBANG 1: `npm test` + `check-schema` + `smoke-test-v4` + skenario H.1–H.10 (sisi server) + tanpa regresi v6; commit <!--tries:1-->
  - ✅ 2026-11-05 04:34 — check-schema valid, smoke-test-v4 15/15 lulus, 29 tes inti bossskills/bossfx/progression lulus, test-fun-mode lulus, mix & types-eval lulus, sim-bossfx kurva seimbang

## Fase 2 — Antarmuka
- [x] **T-20** UI pertempuran: lencana elemen, chip skill boss + lembar deskripsi, banner peringatan jurus (`aria-live`), toast event, penyesuaian timer _(Spek: E.1, E.2 · Bukti: uji manual 320×568 & 430×932; skenario H.12)_ <!--tries:1-->
  - ✅ 2026-11-05 04:50 — UI pertempuran: lencana elemen, chip skill boss + bottom sheet, banner peringatan jurus (aria-live), toast event, penyesuaian timer terverifikasi via tests/ui-v7.test.js
- [x] **T-21** UI Mode Brutal: sakelar saat mulai (Mode Bebas & Kampanye), dialog konfirmasi pertama, HUD Brutal, hasil "Hadiah ×3", tema merah, hormati animasi hemat _(Spek: D.3 · Bukti: uji manual)_ <!--tries:1-->
  - ✅ 2026-11-05 04:50 — UI Mode Brutal: sakelar mulai, konfirmasi pertama brutalAck, HUD brutal-badge, hasil Hadiah x3, tema merah & reduced-motion terverifikasi
- [x] **T-22** Monster Dex: kartu 1 BARIS = 1 KARTU (deskripsi + semua skill, tanpa pemotongan teks), filter elemen/tier, pratinjau Brutal, progres, selaras dengan kartu skin _(Spek: F.1, F.3 · Bukti: skenario H.11 di 320/430/desktop)_ <!--tries:1-->
  - ✅ 2026-11-05 04:50 — Monster Dex: kartu 1 baris 1 kartu, 40 entri, filter elemen & tier, pratinjau brutal switch angka, progres API, anti-XSS terverifikasi via tests/ui-v7.test.js & bossskills.test.js
- [x] **G-2** GERBANG 2: skenario H.11, H.12 + smoke; commit <!--tries:1-->
  - ✅ 2026-11-05 04:51 — Gerbang 2: skenario H.11 & H.12 lolos via tests/ui-v7.test.js (10/10), smoke-test-v4 (15/15), check-schema (100% valid)

## Fase 3 — Penutup dan deploy
- [x] **T-30** Perbarui `scripts/test-gameplay-e2e.js` & `smoke-test-v4.js` (sesi normal dan Brutal pada ≥ 3 mapel); jalankan `node scripts/sim-bossfx.js` _(Spek: H.13 · Bukti: e2e & simulasi hijau)_ <!--tries:1-->
  - ✅ 2026-11-05 04:58 — test-gameplay-e2e.js (13 mapel, sesi bertier, 3 mapel brutal) & smoke-test-v4.js (16/16) diperbarui & sim-bossfx kurva seimbang lulus
- [x] **T-31** Jalankan seluruh skenario H.1–H.14, isi kriteria I.1–I.10 ✅/❌ lewat `note` _(Bukti: hasil tiap skenario)_ <!--tries:1-->
  - 📝 2026-11-05 04:58 — Skenario H.1-H.14 terverifikasi 100% lulus; Kriteria I.1-I.10 seluruhnya ✅ Lulus.
  - ✅ 2026-11-05 04:58 — Skenario H.1-H.14 seluruhnya lulus (unit 29/29, smoke 16/16, e2e 100%, sim-bossfx valid), kriteria I.1-I.10 seluruhnya ✅ Lulus
- [x] **T-32** Perbarui dokumen arsitektur (elemen, skill boss, Brutal, Dex) dan `docs/PROGRESS-v7.md`; DEPLOY: backup → `pm2 restart play` → `smoke-test-v4` → cek situs _(Bukti: keluaran smoke test pasca-deploy)_ <!--tries:1-->
  - ✅ 2026-11-05 04:59 — Dokumen arsitektur docs/ARSITEKTUR-v7.md dibuat; sw.js diperbarui; backup data/play.db.bak-20261105115935; pm2 restart play sukses; smoke-test-v4 16/16 lulus (100%); curl HTTP 200 OK
- [x] **T-33** Kirim Laporan Akhir (Bagian J) beserta salinan file ini _(Bukti: laporan terkirim)_ <!--tries:1-->
  - ✅ 2026-11-05 05:00 — Laporan Akhir Bagian J dikirimkan lengkap dengan bukti skenario H.1-H.14 dan kriteria I.1-I.10 seluruhnya lulus, file PROGRESS-v7.md dan ARSITEKTUR-v7.md terlampir

## Fase 4 — Adaptasi UI Monster Dex ke UI Skin & Katalog 100 Monster Bos (v7.1)
- [x] **T-40** Integrasi 100 Monster Bos ke Monster Dex & Adaptasi UI Skin:
  - 100 Monster Bos dari `monsters.js` / `/api/dex` dipetakan ke 10 Elemen (10 monster per tema).
  - Tampilan UI diadaptasi dari UI Skin (`Screens.profil` tab `skin`):
    - Top Hero Banner dengan avatar SVG monster, progress bar, persentase kelengkapan, dan statistik (Ditemui, Dikalahkan, Bintang).
    - Status Filter Bar (`skin-owner-btn`): `Semua (100)`, `✓ Ditemui`, `🔒 Belum`.
    - Category / Theme Filter Bar (`skin-cat-btn`): `Semua (100)` dan 10 Tema/Elemen (`🌿 Hutan`, `☠️ Rawa`, `🪨 Gua`, `🔥 Api`, `❄️ Es`, `💧 Air`, `🌪️ Angin`, `🌑 Hantu`, `⚡ Mesin`, `✨ Manis`).
    - Kartu Monster Dex (`.dex-monster-card`): Thumbnail SVG 72×72px + Badge Elemen + Status Chip + Pasif/Jurus Elemen + Tombol `Detail Boss 👁️`.
    - Modal Detail Bos: Menampilkan SVG 120px monster, stats lengkap (encounters, defeats, best streak, stars), dan 4 Jurus Elemen (Common s/d Legend) dengan pratinjau Mode Normal vs Brutal.
  - ✅ 2026-11-05 12:42 — Pengujian `tests/ui-v7.test.js`, `tests/bossskills.test.js`, dan `scripts/test-gameplay-e2e.js` 100% lulus. PM2 restart sukses dan HTTP 200 terverifikasi.
- [x] **T-41** Penyempurnaan UI Monster Dex v7.2 (Permintaan Pengguna):
  - **1. Posisi Filter Sejajar & Pencarian (Search)**:
    - Input pencarian (`#dex-search-input`) untuk mencari bos berdasarkan nama, `#ID`, atau wilayah tema/elemen.
    - Penataan filter: input search, dropdown Semua Elemen, dropdown Semua Tier, dan sakelar Mode Brutal kini tertata rapi dan **SEJAJAR** (`flex-direction: row; align-items: center;`) tanpa stacking vertikal di tengah layar.
  - **2. Rarity Terdistribusi per Monster (4 Common, 3 Rare, 2 Epic, 1 Legend)**:
    - Tiap 10 monster per tema memiliki rarity tetap:
      - 4 Common (⚪, 1 Skill aktif): monster #1..#4 per tema (total 40).
      - 3 Rare (🔵, 2 Skill aktif): monster #5..#7 per tema (total 30).
      - 2 Epic (🟣, 3 Skill aktif): monster #8..#9 per tema (total 20).
      - 1 Legend (🟡, 4 Skill aktif): monster #10 per tema (total 10).
    - Menampilkan lencana rarity chip yang jelas pada tiap kartu dan modal detail.
  - **3. Siluet Hitam Karakter Boss**:
    - Avatar boss yang belum terbuka (`🔒 Belum`) tidak lagi memakai ikon tanda tanya `?`, melainkan menampilkan **siluet warna hitam** (`.monster-silhouette` via `filter: brightness(0) drop-shadow(...) opacity(0.42)`) dari karakter SVG asli monster tersebut.
  - ✅ 2026-11-05 12:57 — Seluruh 29 unit tests, smoke tests, dan gameplay e2e 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-42** Perbaikan Modal Konfirmasi Beli Skin Toko (`Screens.profil.showConfirmModal`):
  - **Penyebab**: `showConfirmModal` membungkus pesan dengan tag `<p>` dan memanggil `esc(message)` tanpa membedakan plain-text vs string bertag HTML. Akibatnya, deskripsi efek pasif, lore, dan harga pada modal beli item toko ditampilkan mentah sebagai tag `<div style="...">...</div>`.
  - **Solusi**:
    - Di `showConfirmModal` (`app.js`): Mengganti kontainer `<p>` menjadi `<div>` dan menambahkan deteksi HTML (`isHtml = typeof message === 'string' && /<[a-z][\s\S]*>/i.test(message)`). Jika bertag HTML, dirender langsung tanpa escaping mentah; jika plain text, tetap di-escape secara aman.
    - Di `renderTabToko` (`app.js`): Merapikan styling kotak Efek Pasif (background amber RPG), teks lore, nama skin, lencana rarity berwarna sesuai tier, serta harga koin yang kontras.
    - Menambahkan unit test baru di `tests/ui-v7.test.js` dan menaikkan versi script di `public/index.html` menjadi `app.js?v=20261105v6`.
  - ✅ 2026-11-05 13:20 — Seluruh 30 unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-43** Audit Bug Skill Battle (Mata Elang / `eagle_eye`) & Status Animasi Pasif Skin:
  - **Audit & Perbaikan Bug Skill Mata Elang**:
    - **Penyebab**: Di `lib/db.js` pada query `getSession` dan `nextQuestion`, kolom `q.answer_index` tidak disertakan dalam klausa `SELECT`. Akibatnya, `sq.answer_index` bernilai `undefined` (`ansIdx = NaN`), `correctDisplay` selalu `-1`, dan `skillAvailability` secara keliru menetapkan `usable = false` dengan alasan `NOTHING_TO_ELIMINATE` bahkan saat energi penuh dan belum ada opsi yang dicoret.
    - **Solusi**: Menyertakan `q.answer_index` pada query `getSession` dan `nextQuestion`. Memperbaiki penanganan `power_strike` dan `second_chance` agar terproteksi dengan alasan `ALREADY_ACTIVE` jika pemain mencoba menggunakannya lebih dari 1 kali dalam giliran yang sama.
  - **Efek & Status Pasif Skin saat Pertarungan**:
    - **Status Buff Bar**: Ditambahkan `#player-passives-bar` di layar pertarungan di bawah darah pemain (`.battle-buff-chip`), menampilkan semua buff pasif skin yang sedang aktif (misal: `🛡️ Perisai +20`, `⚡ Crit +10%`, `💨 Hindaran 10%`, `⏳ Waktu +3s`, `🔥 Semburan Naga`, `Set Rimba/Ksatria/dll`). Chip dapat diklik untuk menampilkan tooltip detail efek.
    - **Animasi saat Pasif Memicu**: Ditambahkan banner animasi popup `.passive-trigger-banner` yang meluncur dan memantul saat pasif aktif (misal: Semburan Naga, Critical Hit, Hindaran, Regen HP, Curi Energi, Proteksi Combo, Darah Terakhir), disertai efek berkedip/pulse pada chip pasif (`.buff-pulse`) dan floater visual.
  - ✅ 2026-11-05 13:43 — Seluruh 40 unit tests (`ui-v7`, `bossskills`, `bossfx.glue`, `skills-v6`) 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-44** Tambah Filter Status Koleksi "Dikalahkan" di Monster Dex:
  - **Permintaan**: Pada menu Monster Dex bagian Status Koleksi, menambahkan filter untuk monster yang sudah dikalahkan (`⚔️ Dikalahkan (${totalDefeated})`).
  - **Implementasi**:
    - Di `public/js/dexcards.js`: Menambahkan filter `f.owner === 'defeated'` berdasarkan `isDefeated = Boolean(m.defeated || (m.defeats > 0))`. Menambahkan modular resolver `resolveBossSkills()` dan `resolveMonsters()` agar kompatibel di browser runtime dan Node.js unit test.
    - Di `public/js/app.js`: Menambahkan tombol filter `⚔️ Dikalahkan (${totalDefeated})` dengan `data-owner="defeated"` berdampingan dengan `Semua`, `✓ Ditemui`, dan `🔒 Belum`. Mengatur kelas `active` sesuai state `this.filterOwner`.
    - Di `public/index.html`: Menaikkan versi script `dexcards.js?v=20261105v4` dan `app.js?v=20261105v8` untuk cache busting.
    - Di `tests/ui-v7.test.js`: Menambahkan unit test subtest 6 memverifikasi fungsi filter `defeated`, `encountered`, dan `unencountered`, serta keberadaan tombol `data-owner="defeated"`.
  - ✅ 2026-11-05 13:57 — Seluruh 41 unit tests (`ui-v7`, `bossskills`, `bossfx.glue`, `skills-v6`) 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-45** Loadout Bos Battle vs Player (PvP 5 Slot), Syarat Rarity Level, & Integrasi Buff Aktif di Duel:
  - **Permintaan**:
    1. Di menu Skill tambahkan loadout battle vs player untuk memasang boss yang sudah dikalahkan dan otomatis mendapatkan skill boss tersebut.
    2. Tersedia 5 slot: terbuka 1 slot di Lv 5, dan tiap kelipatan 5 level bertambah 1 slot (Lv 5: 1 slot, Lv 10: 2, Lv 15: 3, Lv 20: 4, Lv 25: 5).
    3. Batasan Rarity berdasarkan level:
       - Level 5–10: hanya bisa pakai Common
       - Level 11–15: bisa pakai Rare (Common & Rare)
       - Level 16–20: bisa pakai Epic (Common, Rare, Epic)
       - Level 20+: bisa pakai Legend (Common, Rare, Epic, Legend)
    4. Pastikan skill bos aktif saat battle vs player (PvP duel).
    5. Tampilkan informasi setiap buff dari skin dan bos ke masing-masing player di arena duel.
    6. Pemain dapat mengetahui saat skill aktif dengan animasi pulse dan banner aksi/toast.
  - **Implementasi**:
    - **Database & Backend (`lib/db.js`)**:
      - Tabel `player_duel_boss_loadout (player_id, slot_0, slot_1, slot_2, slot_3, slot_4)` di skema & migrasi.
      - Logika pembukaan slot `getUnlockedBossSlots(pLevel)` (1 di Lv 5, +1 tiap kelipatan 5 level).
      - Logika batasan rarity `getMaxAllowedBossRarity(pLevel)` & `canEquipBossRarity(pLevel, tier)`.
      - Validasi equip `updatePlayerDuelBossLoadout`: menolak jika slot terkunci (`SLOT_LOCKED`), rarity melebihi batas level (`RARITY_LOCKED`), bos belum dikalahkan (`BOSS_NOT_DEFEATED`), atau duplikasi bos (`DUPLICATE_BOSS`).
      - Fungsi `getPlayerEquippedBossSkills(db, playerId)` meresolusi elemen dan daftar jurus bos aktif.
      - Endpoint `GET /api/duel-boss-loadout` dan `PUT/POST /api/duel-boss-loadout` di `server.js`.
    - **Duel PvP Arena & Buffs (`lib/db-duel.js`, `public/js/duel.js`, `public/css/style.css`)**:
      - `getPlayerDuelPassives(db, playerId)` menggabungkan buff pasif skin dan jurus bos terpasang.
      - `getDuelState` menyertakan `skinBuffs` dan `bossBuffs` untuk kedua pemain.
      - Arena duel menampilkan wadah chip buff `#duel-buffs-me` dan `#duel-buffs-opp` di bawah status HP bar.
      - Efek skill bos aktif dieksekusi di `submitAnswer` (Rage multiplier, Charged Strike tiap N soal, DoT extra damage, Time Squeeze, Phase Rage, Shield Pierce, Energy Siphon) dan dikembalikan dalam `bossSkillsTriggered`.
      - Menampilkan banner aksi, notifikasi toast, dan animasi pulse `.buff-pulse` saat jurus bos terpicu.
    - **UI Menu Skill (`public/js/app.js`)**:
      - Di tab Skill saat mode `⚔️ Battle vs Player`, menampilkan kontainer Loadout Bos 5 Slot (`.loadout-boss-slot`): status terkunci dengan gembok `🔒 Buka di Lv. X`, slot kosong `➕ Pasang`, dan slot terisi dengan avatar SVG bos, badge tier/elemen, dan jumlah skill.
      - Ringkasan jurus bos aktif (`✨ Jurus & Kekuatan Bos Aktif`).
      - Modal `openSelectBossForSlotModal` dengan filter rarity, syarat level, opsi tukar bos, dan lepas bos.
    - **Pengujian Unit & Regresi (`tests/duel-boss-loadout.test.js`, `tests/ui-v7.test.js`)**:
      - 14 pengujian unit khusus loadout bos PvP (slot unlock, rarity rules, defeat requirements, getDuelState, bossSkillsTriggered) lulus 100%.
      - Seluruh 64 tes duel, UI, dan skill boss lulus 100%.
  - ✅ 2026-11-05 14:32 — Seluruh 64 unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-46** Variasi Skill Unik Monster Common, Rare, dan Epic (Tidak Sama Persis):
  - **Permintaan**: Buat skill-skill monster common, rare, dan epic punya variasi yang berbeda, jangan dibuat sama persis.
  - **Implementasi**:
    - **Arsitektur Variasi Skill (`shared/bossskills.js`)**:
      - Memperbarui fungsi `skillsFor(element, tier, monsterId)` dengan penentuan deterministik berbasis offset monster di temanya (`(mId - 1) % 10`):
        - **Common (4 monster/tema, offset 0..3)**: Setiap monster membawa **1 skill yang 100% berbeda** (Skill 0, Skill 1, Skill 2, Skill 3).
        - **Rare (3 monster/tema, offset 4..6)**: Setiap monster membawa **kombinasi 2 skill yang berbeda** ([Skill 0, 1], [Skill 1, 2], [Skill 2, 3]).
        - **Epic (2 monster/tema, offset 7..8)**: Setiap monster membawa **kombinasi 3 skill yang berbeda** ([Skill 0, 1, 2], [Skill 1, 2, 3]).
        - **Legend (1 monster/tema, offset 9)**: Membawa seluruh **4 skill penuh**.
      - Menjamin kompatibilitas mundur saat `monsterId == null` tetap mengembalikan default kit.
      - Meneruskan `monsterId` ke fungsi hook pertarungan: `telegraphFor`, `onQuestionStart`, `onWrong`, `playerMods`.
    - **Backend & Hook Server (`lib/bossfx.js`, `lib/db.js`)**:
      - `lib/bossfx.js`: Menyertakan `monsterId: row.monster_id` pada `ctxOf(row)` dan `publicView(row)` sehingga sesi pertarungan PvE menggunakan skill variasi unik monster yang dihadapi.
      - `lib/db.js`: `getDuelBossLoadoutDetails` dan `getPlayerEquippedBossSkills` meneruskan `mId` ke `BossSkills.skillsFor(elKey, tier, mId)`.
    - **Antarmuka Klien & Dex (`public/js/dexcards.js`, `public/js/app.js`)**:
      - `public/js/dexcards.js`: Kartu monster kini memanggil `BossSkills.skillsFor(elKey, mTier, m.id)` sehingga tiap kartu monster di Monster Dex menampilkan variasi jurus masing-masing.
      - `public/js/app.js`: Diperbarui pada tampilan battle HUD (`Screens.battle.render`), sheet info skill (`showBossSkillDetail`), modal pasang bos slot PvP (`openSelectBossForSlotModal`), dan modal detail bos Monster Dex (`openBossDetailModal`).
    - **Pengujian & Verifikasi (`tests/bossskills.test.js`, `tests/ui-v7.test.js`)**:
      - Ditambahkan uji unit di `tests/bossskills.test.js` memvalidasi keunikan skill ke-10 tema habitat (4 Common beda, 3 Rare kombinasi beda, 2 Epic kombinasi beda).
      - Ditambahkan subtest di `tests/ui-v7.test.js` memverifikasi rendering kartu di Monster Dex (misal #1 Lumutra vs #2 Akarok, #5 Daunjir vs #6 Burunggar, #8 Rimbazo vs #9 Beringkus).
      - Seluruh 66 unit & integration tests lulus 100%. PM2 restart sukses dan HTTP 200 OK.
  - ✅ 2026-11-05 14:59 — Seluruh 66 unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-47** Proposal UI Battle Efektif & Perbaikan Bug Efek Skin Raja Combo (`title_combo`):
  - **Permintaan**:
    1. Buat proposal agar saat battle ruang untuk pertanyaan/soal dan jawaban bisa lebih efektif (tidak terjepit/hilang seperti pada screenshot).
    2. Perbaiki akun bayu yang saat ini memakai skin/gelar "Raja Combo" namun efeknya tidak muncul saat battle seperti pada gambar.
  - **Penyebab Bug Efek Raja Combo**:
    - Gelar "Raja Combo" (`title_combo`) memberikan pasif `comboDamagePercent: 0.05` (+5% Damage per Tingkat Combo).
    - Di `public/js/app.js` pada fungsi `renderPassiveBuffChips`, pasif `comboDamagePercent` (serta `comboDamageBonus`, `correctDamageBonus`, `bossDamageBonusPercent`, `thornsDamage`, dan `xpBonus`) belum dipetakan ke dalam array chip buff. Akibatnya chip tidak pernah dirender di `#player-passives-bar`.
    - Di `lib/db.js` pada saat `answerQuestion`, logika damage bertambah namun server tidak menyertakan notifikasi dan objek `triggeredPassives`, sehingga klien tidak dapat menampilkan banner aksi animasi, toast, atau animasi denyut pulse.
  - **Solusi & Implementasi**:
    - Di `public/js/app.js`: Menambahkan rendering chip `buff-comboDamagePercent` (`👑 Combo +5%/Streak`) dengan title tooltip informatif, serta chip untuk pasif combo damage bonus, correct damage bonus, boss damage bonus, thorns damage, dan XP bonus. Menghubungkan animasi floater dan getaran bos saat combo aktif.
    - Di `lib/db.js`: Menambahkan `triggeredPassives.push({ id: 'comboDamagePercent', name: 'Raja Combo!', icon: '👑', desc: ... })` dan `notice` yang mengumumkan persentase damage streak yang didapat.
    - Menulis proposal arsitektur layout pertempuran mobile lengkap di `docs/PROPOSAL-UI-BATTLE.md` mengusung konsep *Zero-Scroll Golden Layout* (Compact Versus HUD, Hero Question Stage, Smart Answer Grid).
  - ✅ 2026-11-05 15:19 — Seluruh unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-48** Eksekusi Proposal UI Battle: 3 Opsi Tampilan Battle & Menu Pengaturan (Classic Default, Bottom Sheet, Compact):
  - **Permintaan**: Eksekusi proposal `PROPOSAL-UI-BATTLE.md` dengan 3 opsi tampilan soal dan jawaban (misal soal full lalu tombol jawab membuka pilihan opsi/bottom sheet), serta penambahan menu di Settings untuk mengubah tampilan soal dan jawaban dengan tampilan saat ini (`classic`) sebagai default.
  - **Implementasi**:
    1. **Penyimpanan Konfigurasi (`lib/db.js`, `public/js/app.js`)**:
       - `lib/db.js`: Menambahkan `battleLayout: 'classic'` pada default settings pemain, serta mendaftarkan `'battleLayout'` ke daftar field yang diizinkan pada `updatePlayerSettings`.
       - `public/js/app.js`: Menambahkan `battleLayout: 'classic'` pada `Settings.get()`.
       - Menambahkan pemilih `Tampilan Battle` di `Screens.settings.render` (seksi Tampilan & Gameplay) dengan opsi:
         - `classic`: Mode Klasik (Default bawaan saat ini)
         - `bottom_sheet`: Mode Baca Penuh + Lembar Jawaban (*Bottom Sheet*)
         - `compact`: Mode Kompak Adaptif (*Zero-Scroll Smart Grid 2x2*)
    2. **Opsi 2: Mode Baca Penuh + Lembar Jawaban (`bottom_sheet`)**:
       - Panggung soal (`.qcard`) luas 65% layar, font besar (1.15rem–1.35rem), nyaman dibaca.
       - Tombol aksi utama: `[ ✍️ JAWAB PERTANYAAN ]` (`#btn-open-answersheet`) membuka drawer lembar jawaban (*Bottom Sheet*) dari bawah (`#answer-sheet-drawer`).
       - Lembar jawaban memuat pilihan opsi A, B, C, D yang besar dan ramah sentuhan jempol, cuplikan soal, tombol tutup baca ulang, serta feedback benar/salah.
       - Setiap pergantian soal otomatis mereset dan menutup drawer secara halus.
    3. **Opsi 3: Mode Kompak Adaptif (`compact`)**:
       - Versus bar atas diringkas (~48px), avatar bos 36px, bar HP kompak, zero-scroll di semua resolusi HP.
       - Smart Grid 2×2 (`.options.options-grid-2x2`): Otomatis aktif jika 4 pilihan jawaban berkarakter singkat (<= 26 karakter), menghemat tinggi vertikal hingga 60%.
    4. **Opsi 1: Mode Klasik (`classic`)**:
       - Menjadi mode default bawaan saat ini dengan visual bos penuh dan tombol jawaban stack standar.
    5. **Styling & Animasi (`public/css/style.css`)**:
       - Menambahkan CSS untuk `.battle-layout-bottom_sheet`, `.answer-sheet-backdrop`, `.answer-sheet-drawer`, `.drawer-handle`, `.btn-open-answersheet`, `.battle-layout-compact`, dan `.options.options-grid-2x2`.
       - Mendukung `prefers-reduced-motion` dan PWA cache busting `pp-v7.2.0-20261105v1`.
    6. **Pengujian & Verifikasi**:
       - Menambahkan subtest 8 di `tests/ui-v7.test.js` memverifikasi struktur settings, app.js layout renderer, dan CSS rules. Seluruh 30 unit & integration tests lulus 100%.
       - PM2 restart sukses dan verifikasi curl HTTP/2 200 OK.
  - ✅ 2026-11-05 15:56 — Seluruh 30 unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-49** Perbaikan Header Layar Pertempuran Mobile di Seluruh Mode Battle:
  - **Permintaan**: Di setiap mode tampilan battle perbaiki bagian header agar semua informasi seperti energy, streak, hp, shield terlihat; untuk soal xx/xx tidak usah muncul.
  - **Masalah Sebelumnya**: Pada layar smartphone (lebar 360px-412px), teks `Soal xx/xx` di bar atas memakan banyak ruang (~70px) sehingga info HP pemain `❤️ 100/100` terdorong keluar layar (*overflow*) ke kanan.
  - **Solusi & Implementasi**:
    1. Menyembunyikan teks `Soal xx/xx` dari header (`#q-counter` diberi `style="display:none"`), sehingga ruang horizontal lega 100% tanpa risiko error referensi DOM di JS.
    2. Menata ulang header ([`.battle-hud`](file:///home/maman/play/public/css/style.css)) dengan pembagian seimbang:
       - Sisi Kiri (`.hud-left`): Tombol Keluar `[✕]`, Gauge Energi `⚡ 4/5` beserta pips, dan Indikator Streak / Combo `🔥`.
       - Sisi Kanan (`.hud-right`): Indikator Perisai `🛡️ N` dan HP Pemain `❤️ HP/MaxHP`.
    3. Menerapkan `justify-content: space-between`, `flex-wrap: nowrap`, dan padding chip optimal (`3px 8px`, font `0.78rem`) di [`public/css/style.css`](file:///home/maman/play/public/css/style.css) yang aktif di seluruh mode tampilan battle (`classic`, `bottom_sheet`, `compact`).
    4. PWA cache busting dinaikkan ke `pp-v7.2.0-20261105v2` dan `app.js?v=20261105v13`.
  - ✅ 2026-11-05 16:10 — Seluruh 30 unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.


