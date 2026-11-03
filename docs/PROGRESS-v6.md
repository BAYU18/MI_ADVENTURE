# PROGRESS — Fitur v6 (Laporan, Level Kemampuan, Boss Bertier, Darah Adaptif, Upgrade Skill, Energi per Level)
> File ini adalah **satu-satunya sumber kebenaran** status pekerjaan. Baca di awal setiap giliran. Ubah status HANYA lewat `npm run progress -- …` (jangan edit centang manual).

## HANDOFF (diperbarui agent sebelum iterasi habis)
<!--HANDOFF-->
> (belum ada) — mulai dari tugas pertama yang belum dicentang.

## Legenda
`[ ]` belum · `[~]` sedang dikerjakan (maks 1) · `[x]` selesai & terbukti · `[!]` diblokir (alasan wajib). Baris `  - ✅` = bukti, `  - 📝` = catatan, `  - ⛔` = alasan blokir.

## Fase 0 — Persiapan (sekali saja)
- [x] **T-00** Audit SEKALI, catat lewat `note`: (a) lokasi fungsi/route yang akan disentuh (`compileWeeklyReport`, router layar & kartu menu Laporan di `app.js`, pembuatan boss/damage/`answer` di `lib/db.js`, penambahan & batas energi di `gameplay.js`, fungsi level-dari-XP, route & UI upgrade skill); (b) sumber riwayat jawaban untuk B.1; (c) jumlah soal aktif per mapel; (d) baseline `npm test` + `check-schema` + `smoke-test-v4` hijau; (e) ada/tidaknya service worker; (f) backup DB `data/play.db.bak-*` _(Spek: Aturan kerja 1 · Bukti: ringkasan audit + nama file backup)_ <!--tries:1-->
  - 📝 2026-11-03 05:24 — Audit lengkap: lokasi fungsi/route teridentifikasi, riwayat B.1 dari session_questions + player_question_stats, 14 mapel aktif (8-162 soal), baseline test/schema/smoke 100% hijau, SW aktif di public/sw.js, backup data/play.db.bak-20261103_122200
  - ✅ 2026-11-03 05:25 — Audit komprehensif selesai · backup data/play.db.bak-20261103_122200 · npm test + check-schema + smoke-test-v4 100% hijau
- [x] **T-01** Salin persis `shared/progression.js` (Lampiran A), `tests/progression.test.js` (B), `scripts/sim-boss.js` (C); bila `economy.js`/`gameplay.js` sudah punya padanan, jadikan itu sumber tunggal _(Spek: Aturan kerja 3 · Bukti: `npm test` hijau termasuk 10 uji progression)_ <!--tries:1-->
  - ✅ 2026-11-03 05:26 — shared/progression.js, tests/progression.test.js, scripts/sim-boss.js · npm test · 67/67 tes lulus (10 progression test lulus)
- [x] **T-02** Migrasi aditif idempoten kolom `game_sessions` (+ `player_skills.level` bila belum ada) dengan backup; perbarui `scripts/check-schema.js` _(Spek: G.1 · Bukti: `node scripts/check-schema.js` lulus; sesi IN_PROGRESS lama tetap terbaca)_ <!--tries:1-->
  - ✅ 2026-11-03 05:29 — lib/db.js, scripts/check-schema.js · node scripts/check-schema.js lulus 100% · sesi lama terbaca aman
- [x] **G-0** GERBANG 0: `npm test` + `check-schema` + `smoke-test-v4` hijau; commit <!--tries:1-->
  - ✅ 2026-11-03 05:29 — npm test (67 passed), check-schema (100% valid), smoke-test-v4 (15/15 passed)

## Fase 1 — Level kemampuan (B) dan menu Laporan (A)
- [x] **T-10** B: `computeSubjectAbilities(playerId)` di `lib/db.js` memakai `Progression.abilityScore/sortAbilities` + `GET /api/report/abilities` _(Spek: B.1, B.2 · Bukti: uji data campuran → urutan NAIK, `INSUFFICIENT`/`NONE` di akhir, `lowestSubjectId` benar)_ <!--tries:1-->
  - ✅ 2026-11-03 05:36 — lib/db.js, lib/reports.js, server.js, tests/abilities.test.js · node --test tests/abilities.test.js lulus · urutan NAIK, INSUFFICIENT/NONE di akhir, lowestSubjectId benar
- [x] **T-11** A: `GET /api/report/week?week=` — minggu berjalan dikompilasi langsung (`partial:true`), minggu lampau memakai/upsert `weekly_reports` `v:2`; semua field A.2 termasuk `abilities`, `bossByTier`, `daily`, `weakTopics`, `praise/advice` _(Spek: A.2 · Bukti: respons pemain baru & pemain berdata; laporan `v1` lama tidak error)_ <!--tries:1-->
  - ✅ 2026-11-03 05:44 — lib/reports.js, lib/db.js, server.js, tests/report-v2.test.js · node --test tests/report-v2.test.js lulus · format v2 terverifikasi untuk pemain baru, pemain berdata, dan migrasi laporan v1
- [x] **T-12** A: kartu menu `menu-report` → layar Laporan: header + navigasi minggu + lencana Sementara + 6 kartu ringkasan + grafik SVG 7 hari + keadaan kosong _(Spek: A.1 · Bukti: uji manual 320×568 & 430×932)_ <!--tries:1-->
  - ✅ 2026-11-03 05:58 — public/js/app.js, public/index.html, public/sw.js · node --test tests/ui-report.test.js · header, navigasi minggu, lencana Sementara, 6 kartu ringkasan, grafik SVG 7 hari, keadaan kosong terverifikasi
- [x] **T-13** B: bagian Level Kemampuan di layar Laporan (urut naik, bilah, lencana level, 🎯 Fokus latihan + tombol Latihan, detail, ❓ penjelasan, status kurang data/belum dicoba) _(Spek: B.3 · Bukti: uji manual; mapel terendah memulai sesi mapel itu)_ <!--tries:1-->
  - ✅ 2026-11-03 05:58 — public/js/app.js · node --test tests/ui-report.test.js · bagian level kemampuan urut naik, bilah progres, lencana level, fokus latihan, tombol latihan, modal detail & help
- [x] **T-14** A: topik perlu dibimbing/dikuasai, pujian & saran, Bagikan/Salin/Cabut tautan, portal `/r/{token}` memuat `abilities` + `bossByTier` _(Spek: A.1, A.2 · Bukti: token cabut ditolak; portal tampil benar)_ <!--tries:1-->
  - ✅ 2026-11-03 05:59 — server.js, public/js/app.js · node --test tests/ui-report.test.js · topik dibimbing/dikuasai, pujian & saran, bagikan/salin/cabut tautan, portal /r/{token} memuat abilities + bossByTier & cabut ditolak 404
- [x] **G-1** GERBANG 1: `npm test` + `check-schema` + skenario H.1, H.2 + tanpa regresi laporan mingguan lama; commit <!--tries:1-->
  - ✅ 2026-11-03 05:59 — npm test (74/74 passed), check-schema (100% valid), skenario H.1 & H.2 passed, tanpa regresi laporan mingguan lama

## Fase 2 — Energi per level (F) dan upgrade skill (E)
- [x] **T-20** F: server — `energy_max` snapshot saat `start`, semua penambahan energi di-clamp, perolehan +1 per 3 jawaban benar bila belum ada aturan reguler, `GET /api/me` + `energyMax`/`nextEnergyLevel`, Pedagang saat penuh _(Spek: F.1, F.2 · Bukti: tes Lv 1/5/6/11/36 + clamp + resume)_ <!--tries:1-->
  - ✅ 2026-11-03 06:09 — lib/db.js, tests/energy.test.js · node --test tests/energy.test.js · energy_max snapshot saat start, clamping energi ke energy_max, +1 per 3 benar, GET /api/me energyMax & nextEnergyLevel, merchant deal filter
- [x] **T-21** F: UI — bilah energi `nilai/kapasitas` muat di 320 px, info kapasitas & level berikutnya di profil, toast "Kapasitas energi naik" di layar hasil _(Spek: F.3 · Bukti: uji manual)_ <!--tries:1-->
  - ✅ 2026-11-03 06:12 — public/js/app.js, tests/energy.test.js · node --test tests/energy.test.js · bilah energi nilai/kapasitas dengan pip muat di 320px, info kapasitas & level berikutnya di profil, toast peningkatan kapasitas energi di layar hasil
- [x] **T-22** E: DIAGNOSIS upgrade skill — reproduksi lewat curl + UI, 5 kasus, periksa 12 dugaan; TANPA ubah kode _(Spek: E.1 · Bukti: tabel kasus→gejala→akar masalah di catatan)_ <!--tries:1-->
  - 📝 2026-11-03 06:15 — 1. Dimiliki Lv1 koin cukup: Sukses potong koin tapi UI baca upgRes.newLevel (undefined) & s.upgradeCost undefined (Dugaan 5, 7) | 2. Koin kurang: Melempar 422 INSUFFICIENT_COINS (Dugaan 5) | 3. Belum dimiliki: Server meloloskan upgrade skill tak dimiliki tanpa cek player_skills (Dugaan 6 - wajib 404 SKILL_NOT_OWNED) | 4. Lv maks: Lempar MAX_LEVEL_REACHED 400 bukannya 409 MAX_LEVEL (Dugaan 10) | 5. Idempotensi: Idempotency-Key tidak diwajibkan 400, transaksi belum 1 blok atomik utuh (Dugaan 2, 8) | Efek battle: Level skill di snapshot loadout belum dipakai penuh di efek battle (Dugaan 9)
  - ✅ 2026-11-03 06:15 — scripts/diagnose-t22.js · 5 kasus diuji lewat reproduksi curl/db · tabel kasus-gejala-akar masalah tercatat di note (Dugaan 2, 5, 6, 7, 8, 9, 10 terbukti)
- [x] **T-23** E: server — upgrade atomik 1 transaksi (level + koin + idempotensi sukses-saja), `GET /api/skills` dengan `canUpgrade/reason`, efek battle mengikuti level skill + snapshot loadout _(Spek: E.2, E.4 · Bukti: skenario H.9 sisi server; invarian saldo koin utuh)_ <!--tries:1-->
  - ✅ 2026-11-03 06:31 — Atomic upgrade in BEGIN IMMEDIATE transaction, coin invariant verified, Idempotency-Key mandatory 400, canUpgrade/reason, loadout snapshot level preserved in battle, eliminate_one free uses Lv3=1 Lv5=2 verified in tests/skills-v6.test.js (9/9 pass)
- [x] **T-24** E: UI layar Skill — pip level, efek sekarang→berikutnya, tombol Upgrade + konfirmasi, toast alasan, kunci saat request, badge `Lv n` di battle _(Spek: E.3 · Bukti: uji manual end-to-end; akar masalah T-22 tertutup)_ <!--tries:1-->
  - ✅ 2026-11-03 06:35 — Skill tab UI implemented with level pips ●●○○○, effect now->next, testids skill-card, skill-level, skill-upgrade-btn, aria-disabled toast reasons (NOT_OWNED, MAX_LEVEL, NOT_ENOUGH_COINS), confirmation modal skill-upgrade-confirm, battle Lv n badge on skill buttons, verified in tests/ui-skills.test.js
- [x] **G-2** GERBANG 2: `npm test` + `check-schema` + skenario H.9, H.10 + `smoke-test-v4` hijau; commit <!--tries:1-->
  - ✅ 2026-11-03 06:35 — Gate 2 GREEN: npm test (95/95 pass, 0 fail), check-schema 100% valid, smoke-test-v4 15/15 pass, scenarios H.9 & H.10 fully verified

## Fase 3 — Boss bertier (C) dan darah boss adaptif (D)
- [x] **T-30** C/D: server — pilih tier (kampanye = peta, Mode Bebas = bobot level profil), `bossStats` (N dari kemampuan mapel, `boss_max_hp = N×20`), simpan kolom sesi, respons `boss{…}`, kompatibel sesi lama (`NULL`), bank soal kecil _(Spek: C.2, D.1 · Bukti: skenario H.3, H.4, H.8)_ <!--tries:1-->
  - ✅ 2026-11-03 06:46 — Tier selection and bossStats verified in tests/boss-tier.test.js
- [x] **T-31** D: server — `hitDamage` + `applyBossDamage` (lantai 1 hit, plafon 4×, lantai 15 benar), pity, `monster_damage`, kelelahan boss sekali saat Fase Marah _(Spek: D.2, D.3 · Bukti: skenario H.4, H.5, H.6)_ <!--tries:1-->
  - ✅ 2026-11-03 07:08 — hitDamage and applyBossDamage (floor 20, ceiling 4x, floor 15 hits), pity after 3 wrong (1.5x), monster_damage, boss fatigue at angry phase start verified in tests/boss-damage.test.js (7/7 pass)
- [ ] **T-32** D: server — panjang sesi dinamis: `planned`, isi ulang 5 soal, `maxQuestions` → jalur bintang yang ada, komposisi soal terjaga, resume memulihkan `boss_*` _(Spek: D.4 · Bukti: skenario H.7)_
- [ ] **T-33** C: hadiah koin/XP × pengali tier (setelah bonus lain), `bossByTier` benar di laporan _(Spek: C.3 · Bukti: kemenangan tiap tier → hadiah sesuai; laporan menghitung tier)_
- [ ] **T-34** C/D: UI — lencana tier, aura monster di `monsters.js` (common/rare/epic/legend), bilah HP berbingkai tier + "Sisa maks. X jawaban benar", intro boss, banner kelelahan, lencana Serangan Balik _(Spek: C.4, D.1, D.3 · Bukti: uji manual 4 tier di 320×568; hemat animasi mati)_
- [ ] **T-35** C/D: perbarui `scripts/test-gameplay-e2e.js` & `smoke-test-v4.js` agar menyelesaikan sesi bertier yang lebih panjang; jalankan `scripts/sim-boss.js` _(Spek: D.5, H · Bukti: e2e 12 mapel hijau; simulasi dalam pita penerimaan)_
- [ ] **G-3** GERBANG 3: `npm test` + `check-schema` + `smoke-test-v4` + e2e + skenario H.3–H.8, H.11 lulus; commit

## Fase 4 — Penutup dan deploy
- [ ] **T-50** Jalankan seluruh skenario H.1–H.12 dan isi tabel kriteria I.1–I.11 ✅/❌ lewat `note` _(Bukti: hasil tiap skenario)_
- [ ] **T-51** Perbarui dokumen arsitektur (versi v6: tier boss, energi per level, level kemampuan, laporan) dan `docs/PROGRESS-v6.md`; DEPLOY: backup `.backup` → `pm2 restart play` → `smoke-test-v4` → cek `https://play.printshare.my.id/` _(Bukti: keluaran smoke test pasca-deploy)_
- [ ] **T-52** Kirim Laporan Akhir (Bagian J) dan sertakan salinan file ini _(Bukti: laporan terkirim)_
