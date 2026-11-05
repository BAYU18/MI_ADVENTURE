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
- [x] **T-50** Sinkronisasi Tier Monster Sesi Pertempuran & Pencatatan Kemenangan Boss Epic di Monster Dex:
  - **Permintaan**: Perbaiki akun `bayu` baru saja menang lawan bos Epic tapi di Monster Dex tidak menambah bos yang dikalahkan.
  - **Akar Masalah (Root Cause)**:
    1. Pada `startSession` di [`lib/db.js`](file:///home/maman/play/lib/db.js), saat pertempuran dimulai, `bossTier` ditentukan berdasarkan level pemain/probabilitas (misal `'epic'`). Namun, pemilihan monster di tema mapel (`themeMonsters`) dilakukan secara acak tanpa memfilter berdasarkan `bossTier` (`pool = themeMonsters`).
    2. Akibatnya, pada sesi pertempuran `571ebf0f...` akun Bayu, bos yang terpilih adalah `#85 Mekanix` yang bertier **Rare** (mod10 = 4), meskipun pertarungan bertier Epic.
    3. Ketika Bayu menang, kemenangan dicatat ke `player_monsters` untuk `#85` (Rare). Saat membuka Monster Dex pada filter kategori **Epic**, seluruh monster Epic (seperti `#88 Turbinor` dan `#89 Magnetor`) tetap 0 kali dikalahkan.
  - **Solusi & Implementasi**:
    1. **Sinkronisasi Pemilihan Monster Sesuai `bossTier` (`lib/db.js`)**:
       - Pada blok `// Monster selection`, jika `options.monsterId` tidak diberikan secara eksplisit dan bukan node kampanye, monster dari tema subjek difilter berdasarkan `getMonsterTierById(m.id) === bossTier`.
       - Menjamin bahwa jika pertarungan melawan bos Epic, monster yang dihadapi adalah monster Epic dari tema tersebut (`#88 Turbinor` atau `#89 Magnetor` pada tema Mesin), bos Legend melawan monster Legend (`#90 Chipzo`), bos Rare melawan monster Rare, dan bos Common melawan monster Common.
    2. **Koreksi Data Akun `bayu` di SQLite Database**:
       - Memperbarui sesi `571ebf0f-dfba-4433-a39f-db2f4bd342a6` agar `monster_id` menjadi `88` (Epic Turbinor).
       - Menambahkan pencatatan kemenangan pada `player_monsters` untuk pemain `bayu` (ID: 8) pada monster `#88 Turbinor` (`defeats: 1, encounters: 1, best_streak: 9, best_stars: 1`).
       - Mengembalikan status monster `#85` menjadi `defeats: 0` agar sinkron dengan total kemenangan.
       - Terverifikasi via `getDex(8)` bahwa akun Bayu kini memiliki 1 bos Epic yang tercatat dikalahkan (`#88 Turbinor`).
    3. **Pengujian & Otomatisasi**:
       - Menambahkan Subtest 9 di [`tests/ui-v7.test.js`](file:///home/maman/play/tests/ui-v7.test.js) yang memverifikasi bahwa `startSession` untuk seluruh tier (`common`, `rare`, `epic`, `legend`) selalu memilih monster dengan tier yang tepat, serta menguji verifikasi `getDex` akun Bayu.
       - Seluruh 48 unit dan integration tests lulus 100%.
  - ✅ 2026-11-05 16:30 — Seluruh 48 unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-51** Penghapusan Bubble Notifikasi Menghalangi & Reposisi Notifikasi Damage Salah/Benar ke Tengah Layar:
  - **Permintaan**: Hapus notif text 'kamu tersesat..' dan 'jangan berkecil..' karena menghalangi, kemudian notif salah -7 atau benar tampilkan di tengah-tengah jangan di atas layar karena tidak terlihat.
  - **Solusi & Implementasi**:
    1. **Penghapusan Bubble Dialog Mengganggu (`public/js/app.js`, `public/css/style.css`)**:
       - Bubble 'kamu tersesat...' (`boss-dialog`) dan 'jangan berkecil hati...' (`pet-dialog`) yang muncul menutupi panggung bos dan kartu soal dinonaktifkan (`showBossDialog` & `showPetReaction` diubah menjadi no-op dan panggilannya di `submitAnswer` dihapus).
       - Di [`public/css/style.css`](file:///home/maman/play/public/css/style.css), `.dialog-bubble` diberi aturan `display: none !important;` sehingga tidak ada bubble teks yang dapat menghalangi pandangan pemain saat duel.
    2. **Reposisi Notifikasi Floater Salah/Benar ke Tengah Layar (`top: 50%; left: 50%`)**:
       - Mengubah posisi [`.damage-floater`](file:///home/maman/play/public/css/style.css) dari `position: absolute; top: 30%` di dalam `.boss-card` (yang berada di bagian atas layar) menjadi `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)`.
       - Di [`public/js/app.js`](file:///home/maman/play/public/js/app.js) fungsi `showDamageFloater`, elemen floater ditempelkan langsung ke `document.body` dengan `z-index: 99999`, sehingga posisinya selalu tepat di tengah-tengah layar HP (fokus pandangan pemain saat menjawab).
       - Floater didesain menyerupai pill badge modern semi-transparan (`background: rgba(15, 23, 42, 0.88)` dengan border dan glow sesuai status: merah untuk salah `-7`, biru/emas untuk benar/kritis, hijau untuk heal), dengan animasi float halus yang menghilang otomatis setelah 950ms.
    3. **PWA Cache Busting & Pengujian**:
       - Service worker cache dinaikkan ke `pp-v7.2.0-20261105v3`.
       - Versi aset dinaikkan ke `style.css?v=20261105v7` dan `app.js?v=20261105v14`.
       - Menambahkan Subtest 10 di [`tests/ui-v7.test.js`](file:///home/maman/play/tests/ui-v7.test.js). Seluruh 48 unit dan integrasi tests lulus 100%.
  - ✅ 2026-11-05 16:44 — Seluruh 48 unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-52** Penghapusan Efek Berkedip Merah/Hijau, Penghapusan Banner Atas Raja Combo, dan Penataan Anti-Bertumpuk Notifikasi Tengah:
  - **Permintaan**: Hapus efek panel berkedip merah/hijau jika salah/benar, hapus notif Raja Combo yang di atas karena sudah ada di tengah, serta perbaiki notifikasi di tengah agar tidak bertumpuk jika ada beberapa notifikasi sekaligus.
  - **Solusi & Implementasi**:
    1. **Penghapusan Efek Panel Berkedip Merah/Hijau (`public/js/app.js`, `public/css/style.css`)**:
       - Menghapus penambahan kelas `answer-blink-correct` dan `answer-blink-wrong` pada `battleRoot` di fungsi `applyAnswerResult` [`public/js/app.js`](file:///home/maman/play/public/js/app.js).
       - Menyetel aturan `.answer-blink-correct::after`, `.answer-blink-wrong::after` di [`public/css/style.css`](file:///home/maman/play/public/css/style.css) ke `display: none !important; animation: none !important; border: none !important;` sehingga tidak ada border flash layar/panel saat menjawab.
    2. **Penghapusan Notifikasi Banner Pasif Raja Combo di Atas Layar (`public/js/app.js`, `public/css/style.css`)**:
       - Di fungsi `showPassiveTrigger` [`public/js/app.js`](file:///home/maman/play/public/js/app.js), menghapus pembuatan elemen banner `.passive-trigger-banner` yang sebelumnya menempel di bagian atas `.boss-card`.
       - Di [`public/css/style.css`](file:///home/maman/play/public/css/style.css), `.passive-trigger-banner` disembunyikan permanen dengan `display: none !important;`.
       - Notifikasi pasif Raja Combo tetap tampil elegan di tengah layar melalui pill badge damage floater (`👑 Raja Combo!`) dan indikator chip pasif berkedip (*buff pulse*).
    3. **Penataan Anti-Bertumpuk Notifikasi Tengah via `.center-floater-container` (`public/js/app.js`, `public/css/style.css`)**:
       - Menambahkan kontainer fixed fleksibel [`.center-floater-container`](file:///home/maman/play/public/css/style.css) di tengah layar (`top: 50%; left: 50%; transform: translate(-50%, -50%)`) dengan `display: flex; flex-direction: column; gap: 10px; align-items: center;`.
       - Di fungsi `showDamageFloater` [`public/js/app.js`](file:///home/maman/play/public/js/app.js), setiap floater (seperti `🎯 TEPAT! -20`, `👑 Raja Combo!`, atau `❌ SALAH! -7`) dimasukkan ke dalam container tersebut.
       - Jika ada beberapa notifikasi muncul bersamaan atau berturutan (misal damage hit + pasif combo + regen), notifikasi akan tersusun rapi secara vertikal bertingkat dengan jarak 10px, tidak saling menindih atau bertumpuk, lalu memudar secara halus setelah 1050ms.
    4. **PWA Cache Busting & Pengujian**:
       - Service worker cache dinaikkan ke `pp-v7.2.0-20261105v4`.
       - Versi aset dinaikkan ke `style.css?v=20261105v8` dan `app.js?v=20261105v15`.
       - Memperbarui Subtest 10 di [`tests/ui-v7.test.js`](file:///home/maman/play/tests/ui-v7.test.js) memverifikasi penataan anti-bertumpuk, ketiadaan blink class, dan penghapusan banner atas.
       - Seluruh 48 unit dan integration tests lulus 100%.
  - ✅ 2026-11-05 17:02 — Seluruh 48 unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-53** Penyederhanaan Notifikasi Hadiah Koin/Soal Misteri (+N 🪙) & Audit Notifikasi Pertempuran:
  - **Permintaan**: Beritahu ada notif apa saja selain berhadiah dan raja combo, serta perbaiki notifikasi hadiah coin yang terlalu besar agar langsung ringkas seperti `+50 🪙` (contoh +50).
  - **Audit Notifikasi Battle**:
    1. **Hasil Jawaban**: `🎯 TEPAT! -<N>`, `⚡ KRITIKAL! -<N>`, `🎯 KRITIS TITIK LEMAH! -<N>`, `🐢 LAMBAT! -<N>`, `❌ SALAH! -<N>`, `⏰ HABIS! -<N>`, `⏳ PERGI LAMA!`.
    2. **Pasif Skin**: `👑 Raja Combo!`, `💥 Serangan Combo!`, `⚡ Critical Hit!`, `🔥 Semburan Naga!`, `💨 HINDARAN! 0 DMG`, `💖 REGEN!`, `⚡ +1 ENERGI!`, `🦉 Proteksi Combo!`, `🩸 Darah Terakhir!`.
    3. **Skill & Efek**: `+<N> HP` (heal), `🛡️ <N>` (perisai).
    4. **Status Pertempuran**: `🔥 Bos Mengamuk (Fase 2)`, `😮‍💨 Bos Mulai Kelelahan (Fatigue)`, `💪 Serangan Balik (Pity)`, `🔥 Soal Ditambah (Refill)`, `🔥 COMBO N×`.
  - **Solusi & Implementasi**:
    1. **Format Ringkas Hadiah Koin & Soal Misteri (`public/js/app.js`)**:
       - Menggantikan teks panjang `❓ HADIAH MISTERI: COINS_8!` menjadi langsung `+8 🪙` (atau sesuai jumlah koin riil yang didapat, misal `+<N> 🪙`).
       - Hadiah soal misteri lainnya diformat ringkas: `+15 HP 💖` (heal), `+1 Energi ⚡` (energi), `1.5× Damage 💥` (damage boost).
    2. **PWA Cache Busting & Pengujian**:
       - Service worker cache dinaikkan ke `pp-v7.2.0-20261105v5`.
       - Versi aset dinaikkan ke `app.js?v=20261105v16`.
       - Menambahkan assertion di Subtest 10 [`tests/ui-v7.test.js`](file:///home/maman/play/tests/ui-v7.test.js). Seluruh tests lulus 100%.
  - ✅ 2026-11-05 17:10 — Seluruh unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-54** Penjaminan Keterbacaan Seluruh Teks Notifikasi (Anti-Terpotong di Mobile Viewport):
  - **Permintaan**: Buat agar semua notif tulisannya terbaca dan tidak ada yang terpotong.
  - **Analisis & Titik Rawan Pemotongan Teks**:
    1. Pada viewport mobile layar sempit (320px–412px), properti `white-space: nowrap` yang dikombinasikan dengan font statis besar (`1.75rem` / `1.95rem`) dan padding lebar (`8px 22px`) pada `.damage-floater` menyebabkan teks panjang (seperti `🎯 KRITIS TITIK LEMAH! -40` atau nama buff pasif) meluap melebihi lebar layar efektif (~328px) dan terpotong di tepi kiri/kanan.
    2. `.enraged-banner` (banner mengamuk bos fase 2) sebelumnya berukuran font `1.3rem` dengan padding lebar `14px 28px` dan tanpa pembatasan lebar maksimal aman (`max-width: min(92vw, 420px)`), sehingga jika nama bos panjang, banner meluap keluar layar HP.
    3. `#toast` dan container `.boss-fx-toast` berpotensi terpotong jika teks pesan sistem panjang dan tidak memiliki `word-break: break-word` serta padding fleksibel.
    4. Box feedback di bawah soal (`#fb-slot .feedback`) sebelumnya memiliki flex child `.grow` tanpa `min-width: 0`, sehingga jika teks penjelasan soal sangat panjang dapat mendorong tombol atau terpotong.
  - **Solusi & Implementasi**:
    1. **Fluid Responsive Font & Safe Width pada Floater (`public/css/style.css`)**:
       - Mengganti font statis `.damage-floater` menjadi `font-size: clamp(0.95rem, 4.2vw, 1.35rem)` dan untuk `.crit` menjadi `font-size: clamp(1.05rem, 4.4vw, 1.45rem)`.
       - Mengganti `white-space: nowrap` dengan `white-space: normal; word-break: break-word; overflow-wrap: break-word; line-height: 1.25;`.
       - Menambahkan batas lebar aman `max-width: min(92vw, 420px); width: max-content; box-sizing: border-box;` dan menyesuaikan padding menjadi `7px 16px;`.
       - Memastikan `.center-floater-container` memiliki `width: 100%; max-width: 92vw; box-sizing: border-box;`.
    2. **Penyederhanaan Teks Floater Panjang (`public/js/app.js`)**:
       - Mengubah teks `🎯 KRITIS TITIK LEMAH! -${dmg}` (26+ karakter) menjadi lebih ringkas dan tajam: `🎯 TITIK LEMAH! -${dmg}` (18 karakter) agar tidak memenuhi layar.
    3. **Safe Dimensions pada Enraged Banner & Toast (`public/css/style.css`)**:
       - `.enraged-banner-wrap`: diberikan `width: max-content; max-width: min(92vw, 420px); box-sizing: border-box;`.
       - `.enraged-banner`: diberikan `font-size: clamp(0.92rem, 3.8vw, 1.25rem); padding: 10px 18px; max-width: 100%; box-sizing: border-box; word-break: break-word; line-height: 1.35;`.
       - `#toast`: diberikan `font-size: clamp(0.85rem, 3.5vw, 0.95rem); max-width: min(92vw, 420px); box-sizing: border-box; word-break: break-word; border-radius: 16px; line-height: 1.35;`.
       - `.boss-fx-toast-container` & `.boss-fx-toast`: diberikan `width: min(92vw, 360px); max-width: 92vw; word-break: break-word; box-sizing: border-box;`.
    4. **Flex Overflow-Safe pada Feedback Box (`public/js/app.js`)**:
       - Menambahkan `min-width: 0; word-break: break-word; overflow-wrap: break-word;` pada `.grow` di dalam `#fb-slot .feedback` agar teks penjelasan sepanjang apa pun ter-wrap dengan rapi dan tombol navigasi tetap utuh.
    5. **PWA Cache Busting & Pengujian**:
       - Service worker cache dinaikkan ke `pp-v7.2.0-20261105v6`.
       - Versi aset dinaikkan ke `style.css?v=20261105v9` dan `app.js?v=20261105v17`.
       - Memperbarui pengujian di [`tests/ui-v7.test.js`](file:///home/maman/play/tests/ui-v7.test.js) mencakup assertion font `clamp`, batas lebar aman `min(92vw, 420px)`, `word-break: break-word`, serta keringkasan teks notifikasi. Seluruh 18 tes lulus 100%.
  - ✅ 2026-11-05 17:25 — Seluruh 18 unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-55** Peningkatan Kontras Keterbacaan Kritikal & Audit Eliminasi Notifikasi Ganda Skill Pasif:
  - **Permintaan**: Perbaiki teks kritikal/kritis agar terbaca dengan sangat jelas, serta audit dan perbaiki bug skill pasif di mana jika memakai perlengkapan yang sama-sama memiliki skill hindaran saat terpicu notifikasinya muncul 2 kali, agar hanya muncul 1 kali.
  - **Akar Masalah**:
    1. **Notifikasi Ganda Hindaran (Dodge) & Kritikal (Crit)**:
       - Ketika pemain berhasil menghindari serangan (`res.dodged === true`), di fungsi `applyAnswerResult` [`public/js/app.js`](file:///home/maman/play/public/js/app.js) sudah memanggil `this.showDamageFloater('💨 HINDARAN! 0 DMG', 'heal')`.
       - Namun `res.triggeredPassives` dari backend juga membawa `{ id: 'dodge' }` yang kemudian dieksekusi oleh `showPassiveTrigger` dan memanggil `this.showDamageFloater` kedua kalinya. Akibatnya, muncul 2 badge notifikasi hindaran yang sama persis di tengah layar.
       - Hal serupa terjadi pada Critical Hit di mana `⚡ KRITIKAL! -<dmg>` muncul bersamaan dengan badge pasif `⚡ Critical Hit!!`.
    2. **Keterbacaan Buram Teks Kritikal**:
       - Terdapat aturan CSS lama di baris 1807 [`public/css/style.css`](file:///home/maman/play/public/css/style.css) yang menimpa (`override`) text-shadow `.damage-floater.crit` menjadi hanya `0 0 8px #ef4444` dengan warna teks kuning muda `#fde047` tanpa outline hitam pekat, sehingga teks tampak pudar, silau, dan tidak kontras di atas layar pertempuran.
  - **Solusi & Implementasi**:
    1. **Peningkatan Kontras Tinggi & Ketajaman Teks Kritikal (`public/css/style.css`)**:
       - Menghapus aturan override usang di baris 1807 yang merusak text-shadow.
       - Memperbarui kelas `.damage-floater.crit` dengan warna teks `#fffbeb` (warm gold white), background gelap solid bergradien `linear-gradient(135deg, rgba(24, 24, 27, 0.98), rgba(67, 30, 5, 0.98))`, border emas `2px solid #fbbf24`, glow emas `box-shadow`, serta **outline kontras tinggi 4-arah** (`-1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000`) dan drop-shadow gelap.
       - Menambahkan font-weight `950`, font size `clamp(1.15rem, 5vw, 1.6rem)`, dan `letter-spacing: 0.6px` sehingga teks kritikal dijamin terbaca sangat tajam dan kontras.
       - Memperkuat styling outline hitam pekat juga pada varian `.dmg`, `.heal`, `.miss`, dan `.energy`.
    2. **Audit & De-duplikasi Skill Pasif (`public/js/app.js`)**:
       - Menambahkan mekanisme filter deduplikasi `seenCategories` pada fungsi `showPassiveTrigger` [`public/js/app.js`](file:///home/maman/play/public/js/app.js) untuk memastikan setiap kategori skill pasif (misal `dodge`, `crit`, `regen`, `dragon`, `comboDamagePercent`, `comboDamageBonus`, `streakProtect`, `lastStand`, `damageReduction`, `comboEnergy`) hanya diproses satu kali per giliran.
       - Khusus untuk `dodge` dan `crit`: efek visual floater sudah ditangani secara elegan oleh floater angka/hasil utama di `applyAnswerResult`. Di `showPassiveTrigger`, keduanya hanya mengaktifkan efek visual denyut (*pulse*) pada chip buff bar (`#buff-dodge` & `#buff-crit`) dan tidak lagi memunculkan floater kedua.
       - Mengintegrasikan deteksi `const isCriticalHit = outcome === 'CRITICAL' || Boolean(res.isCrit)` agar critical pasif langsung menghasilkan satu floater utama `⚡ KRITIKAL! -<dmg>`.
    3. **PWA Cache Busting & Pengujian**:
       - Service worker cache dinaikkan ke `pp-v7.2.0-20261105v7`.
       - Versi aset dinaikkan ke `style.css?v=20261105v10` dan `app.js?v=20261105v18`.
       - Memperbarui pengujian di [`tests/ui-v7.test.js`](file:///home/maman/play/tests/ui-v7.test.js) memverifikasi kontras tinggi kritikal dan deduplikasi ketat pasif. Seluruh 18 tes lulus 100%.
  - ✅ 2026-11-05 17:41 — Seluruh 18 unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.
- [x] **T-56** Perbaikan Bug Perisai Sisa 1, Notifikasi Combo Tunggal Header, Eliminasi Penguncian Sisa 1 HP Bos, dan Kesejajaran Darah Duel:
  - **Permintaan**:
    1. Perbaiki bug perisai di mana jika sisa 1 damage langsung ke HP dan tidak menghabiskan perisai lalu sisanya ke HP.
    2. Di header notifikasi combo ada 2, cukup 1 saja yang gambar api + jumlah kombo.
    3. Perbaiki bug di mana walaupun sisa darah bos 6 dan seharusnya sekali benar langsung menang, tapi malah tersisa 1 dan harus beberapa kali benar baru bos kalah.
    4. Saat duel vs player, buat darah masing-masing sejajar dan notifikasi terkena serangan cukup 1 yang muncul dekat bar darah.
  - **Akar Masalah & Solusi**:
    1. **Bug Perisai Sisa 1 (`lib/db.js`)**:
       - *Penyebab*: Saat bos memiliki skill pierce (seperti Gelatok tema Racun/Rawa di mana `shieldMult < 1`), `Math.floor(shieldLeft * shieldMult)` pada `shieldLeft = 1` menghasilkan `0` (`Math.floor(0.7) = 0`). Akibatnya `absorbed = 0`, seluruh damage masuk langsung ke HP, dan perisai macet di angka `1` tanpa pernah habis.
       - *Solusi*: Mengubah logika penyerapan di [`lib/db.js`](file:///home/maman/play/lib/db.js) agar `effShield = Math.min(shieldLeft, Math.max(1, Math.round(shieldLeft * Math.min(1.0, shieldMult))))`. Jika `rawPlayerDamage >= shieldLeft`, perisai dipastikan **habis terpakai (0)** dan sisa damage yang tidak tertutup perisai disalurkan ke HP.
    2. **Notifikasi Combo Tunggal di Header (`public/js/app.js`)**:
       - *Penyebab*: Terdapat dua elemen bersamaan saat `streak >= 3` di header: `#combo-meter` (`🔥 COMBO 3×!`) dan `#streak-chip` (`🔥 3`).
       - *Solusi*: Menyembunyikan visual `#combo-meter` di header (hanya sebagai sound trigger milestone) dan mempertahankan satu-satunya elemen combo di header yaitu `#streak-chip` berformat `🔥 <jumlah_combo>` (`font-weight: 800`).
    3. **Eliminasi Penguncian Artifisial Sisa 1 HP Bos (`shared/progression.js`, `lib/db.js`)**:
       - *Penyebab*: Terdapat aturan lama di `applyBossDamage` yang menahan sisa HP bos di angka 1 jika `correctCountAfter < MIN_TOTAL_HITS (15)`. Hal ini membuat pemain yang sudah menguras HP bos (misal sisa 6 HP dan terkena 20 damage) terhambat secara artifisial dan dipaksa menjawab benar berkali-kali hingga mencapai 15 benar.
       - *Solusi*: Mengubah `applyBossDamage` di [`shared/progression.js`](file:///home/maman/play/shared/progression.js) agar mengembalikan `Math.max(0, bossHp - damage)`. Ketika damage menghabiskan HP bos (`bossHp - damage <= 0`), bos **kalah seketika (HP 0)** dan pemain langsung menang secara adil.
    4. **Duel VS Player: Kesejajaran Bar Darah & Notifikasi Serangan Tunggal (`public/css/style.css`, `public/js/duel.js`)**:
       - *Penyebab Bar Darah Miring*: `.duel-vs-bar` menggunakan `align-items: center`. Ketika salah satu pemain memiliki buff chips lebih banyak, tinggi kotak combatant berbeda sehingga bar darah kiri dan kanan naik/turun dan tidak sejajar.
       - *Solusi Bar Darah Sejajar*: Menyetel `.duel-vs-bar { align-items: flex-start; }` di [`public/css/style.css`](file:///home/maman/play/public/css/style.css) serta menstandarisasi tinggi header nama (20px), bar darah (14px), dan teks HP (18px) sehingga bar darah kedua pemain berada pada garis horizontal horizontal yang sejajar sempurna.
       - *Penyebab Notif Ganda*: Fungsi `triggerAttackEffect` dan `triggerAttackedEffect` memunculkan floater di atas bar darah SEKALIGUS banner aksi lebar di bawah (`showActionBanner`).
       - *Solusi Notif Tunggal*: Menghapus pemanggilan banner aksi duplikat di [`public/js/duel.js`](file:///home/maman/play/public/js/duel.js). Notifikasi kini **cukup 1 floater tegas** yang muncul tepat di dekat bar darah pemain (`💥 -<dmg> HP` pada lawan dan `💔 -<dmg> HP` pada diri sendiri).
    5. **PWA Cache Busting & Pengujian**:
       - Service worker cache dinaikkan ke `pp-v7.2.0-20261105v8`.
       - Versi aset dinaikkan ke `style.css?v=20261105v11`, `app.js?v=20261105v19`, dan `duel.js?v=20261105v5`.
       - Menambahkan Subtest 11 di [`tests/ui-v7.test.js`](file:///home/maman/play/tests/ui-v7.test.js) serta memperbarui [`tests/progression.test.js`](file:///home/maman/play/tests/progression.test.js). Seluruh 40 unit dan integration tests lulus 100%.
  - ✅ 2026-11-05 20:40 — Seluruh unit tests 100% lulus. PM2 restart sukses & HTTP 200 terverifikasi.






- [x] **T-57** Penyesuaian Balancing XP Kemenangan (Target Menang ke Lv 20: Terburuk 250x, Sedang 200x, Terbaik 150x):
  - **Permintaan**:
    - Buat proposal dan terapkan agar kondisi paling buruk untuk naik ke Level 20 hanya butuh 250 kemenangan, kondisi sedang 200 kemenangan, dan kondisi terbaik cukup 150 kemenangan.
  - **Akar Masalah & Solusi (Opsi 1 - Tiered Win Base XP)**:
    - *Akar Masalah*: Sebelumnya formula kemenangan adalah `stars * 25`. Akibatnya, kemenangan 1 bintang hanya mendapatkan 25 XP (sepertiga dari 3 bintang), sehingga pada skenario terburuk pemain butuh 722 kemenangan untuk mencapai Level 20 (18.050 XP).
    - *Rasio Target*: Untuk mencapai Lv 20 dalam 250 (1★), 200 (2★), dan 150 (3★) kemenangan, rasio XP kemenangan yang dibutuhkan adalah `1/250 : 1/200 : 1/150 = 60% : 75% : 100%`.
    - *Solusi Bedah*:
      1. Menambahkan konfigurasi `winByStars: { 1: 72, 2: 90, 3: 120 }` di `GAME.xp` pada [`lib/db.js`](file:///home/maman/play/lib/db.js).
      2. Mengganti formula kemenangan di `answerQuestion` [`lib/db.js`](file:///home/maman/play/lib/db.js) menjadi `xpEarned = (winBaseXp[stars] || 72) + newStreak * 2`.
      3. Dengan basis ini:
         - 1 Bintang (Terburuk): 72 XP dasar $\rightarrow 250$ kemenangan ($18.000 - 18.050\text{ XP}$).
         - 2 Bintang (Sedang): 90 XP dasar $\rightarrow 200$ kemenangan ($18.000 - 18.050\text{ XP}$).
         - 3 Bintang (Terbaik): 120 XP dasar $\rightarrow 150$ kemenangan ($18.000 - 18.050\text{ XP}$).
      4. Kurva level karakter (`levelFormula`) tidak diubah, sehingga progres pemain yang sudah ada di database tetap konsisten dan aman.
    - *Pengujian*:
      1. Menyesuaikan ekspektasi test tier rewards di [`tests/rewards-tier.test.js`](file:///home/maman/play/tests/rewards-tier.test.js) (Base 1★ = 72, streak = 1 $\rightarrow 74\text{ XP}$).
      2. Membuat unit test dedicated di [`tests/xp-balancing.test.js`](file:///home/maman/play/tests/xp-balancing.test.js) yang memverifikasi perolehan XP dan simulasi kemenangan ke Level 20.
  - ✅ 2026-11-05 21:10 — Seluruh unit tests XP balancing (5/5) dan rewards-tier (7/7) 100% lulus. PM2 restart & commit remote terverifikasi.
