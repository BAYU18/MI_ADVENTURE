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
- [ ] **T-15** `GET /api/dex` (progres per elemen×tier, normal & Brutal), konfigurasi Brutal di `/api/me`, `summary.brutalDefeated` pada laporan mingguan _(Spek: F.2, G.2 · Bukti: respons pemain baru & berdata)_
- [ ] **G-1** GERBANG 1: `npm test` + `check-schema` + `smoke-test-v4` + skenario H.1–H.10 (sisi server) + tanpa regresi v6; commit

## Fase 2 — Antarmuka
- [ ] **T-20** UI pertempuran: lencana elemen, chip skill boss + lembar deskripsi, banner peringatan jurus (`aria-live`), toast event, penyesuaian timer _(Spek: E.1, E.2 · Bukti: uji manual 320×568 & 430×932; skenario H.12)_
- [ ] **T-21** UI Mode Brutal: sakelar saat mulai (Mode Bebas & Kampanye), dialog konfirmasi pertama, HUD Brutal, hasil "Hadiah ×3", tema merah, hormati animasi hemat _(Spek: D.3 · Bukti: uji manual)_
- [ ] **T-22** Monster Dex: kartu 1 BARIS = 1 KARTU (deskripsi + semua skill, tanpa pemotongan teks), filter elemen/tier, pratinjau Brutal, progres, selaras dengan kartu skin _(Spek: F.1, F.3 · Bukti: skenario H.11 di 320/430/desktop)_
- [ ] **G-2** GERBANG 2: skenario H.11, H.12 + smoke; commit

## Fase 3 — Penutup dan deploy
- [ ] **T-30** Perbarui `scripts/test-gameplay-e2e.js` & `smoke-test-v4.js` (sesi normal dan Brutal pada ≥ 3 mapel); jalankan `node scripts/sim-bossfx.js` _(Spek: H.13 · Bukti: e2e & simulasi hijau)_
- [ ] **T-31** Jalankan seluruh skenario H.1–H.14, isi kriteria I.1–I.10 ✅/❌ lewat `note` _(Bukti: hasil tiap skenario)_
- [ ] **T-32** Perbarui dokumen arsitektur (elemen, skill boss, Brutal, Dex) dan `docs/PROGRESS-v7.md`; DEPLOY: backup → `pm2 restart play` → `smoke-test-v4` → cek situs _(Bukti: keluaran smoke test pasca-deploy)_
- [ ] **T-33** Kirim Laporan Akhir (Bagian J) beserta salinan file ini _(Bukti: laporan terkirim)_
