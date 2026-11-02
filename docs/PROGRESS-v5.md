# 🎮 CEKLIS PROGRES FITUR v5.2: GAMEPLAY MENARIK & ADAPTIF
Aplikasi: Petualangan Pelajar (`https://play.printshare.my.id`)

## Fase 0 — Persiapan & Protokol Progres
- [x] **T-00:** Audit Sekali & Backup Database
  - *Bukti:* data/play.db.bak-v5-pre dibuat · skema dan tes E2E awal 12 mapel 100% lulus
- [x] **T-01:** Modul Konfigurasi Gameplay & Story
  - *Bukti:* shared/gameplay.js dan shared/story.js dibuat UMD · 10 tema dialog dan 5 tipe soal
- [x] **T-02:** Modul Grading, Feedback, & Test Suite Unit
  - *Bukti:* shared/grading.js, public/js/feedback.js, tests/grading.test.js dibuat · 9 unit test 100% pass
- [x] **T-03:** Migrasi Skema Database P0 & Hardening Kolom
  - *Bukti:* Semua kolom dan tabel v5.2 dimigrasi · check-schema.js 100% valid
- [x] **G-0:** Gerbang 0 (Unit test + check:schema + test-gameplay-e2e)
  - *Bukti:* Unit test (9/9 pass) + check:schema (100% valid) + E2E 12 mapel sukses tanpa error

## Fase 0b — Perbaikan Skill & Tombol Skill (Bagian L — P0)
- [x] **T-60:** Diagnosis Mendalam Skill (L.1)
  - *Bukti:* Matriks diagnosa 9 skill & kode alasan terstandarisasi didokumentasikan di docs/PROGRESS-v5.md
- [x] **T-61:** Server — Standarisasi Ketersediaan Skill (L.2)
  - *Bukti:* Standarisasi skillAvailability, reason codes baku, endpoint GET /api/game/:id/skills, dan transaksi atomik
- [x] **T-62:** Frontend UI — Tombol Skill Handal & Non-Blocking (L.3)
  - *Bukti:* public/js/app.js, public/css/style.css · npm test · Tombol skill aria-disabled dengan toast alasan, anti double-tap loading state
- [x] **T-63:** Fitur Sembunyi / Tampilkan Tombol Skill (L.4)
  - *Bukti:* UI toggle skill bar, floating chip, modal settings sync
- [x] **G-4:** Gerbang Skill (Skenario 13.2 #15 & #16 lulus)
  - *Bukti:* Skenario 13.2 #15 & #16 lulus · npm test pass · schema clean

## Fase 1 — Adaptif (H, I) & Tipe Soal (A P0)
- [x] **T-10:** Spaced Repetition Backend Engine (H.1 & H.4)
  - *Bukti:* lib/db.js · npm test · afterAnswer terhubung ke answerQuestion, update box/lapses/due_at/mastered
- [x] **T-11:** Alokasi Slot Ulangan Berjarak pada Sesi Game (H.2)
  - *Bukti:* lib/db.js · tests/spaced.test.js · query due reviews, cap max 30%, flag is_review=1
- [x] **T-12:** UI Ulangan Berjarak & Mode Latihan WEAK (H.3)
  - *Bukti:* lib/db.js · public/js/app.js · public/css/style.css · bonus XP +5 on review correct & #review-badge visual chip
- [x] **T-13:** Dynamic Time Pacing Engine (I.1, I.2, I.4)
  - *Bukti:* tests/pace.test.js · npm test · 13/13 lulus verifikasi dynamic pacing
- [x] **T-14:** Pengaturan Preferensi Pemain & Modal ⚙️ (I.3, G, L.4)
  - *Bukti:* Selesai terverifikasi
- [x] **T-15:** Skema Data & Parser Validasi 5 Tipe Soal (A.2)
  - *Bukti:* Selesai terverifikasi
- [x] **T-16:** Server Display Shuffling & Komposisi Tipe Soal (A.3)
  - *Bukti:* Server display shuffling & TYPE_MIX terimplementasi di lib/db.js, tests/mix.test.js pass, 200 simulasi 0 bocoran kunci dan 0 streak > 2
- [x] **T-17:** Evaluasi Jawaban Multi-Tipe & Waktu Baca Dinamis (A.1, A.3)
  - *Bukti:* Evaluasi multi-tipe (MCQ, TRUE_FALSE, ORDERING, MATCHING, SHORT), reveal akurat, skill NOT_APPLICABLE pada non-MCQ tanpa potong energi, read bonus time, dan 23 test suites lulus 100%
- [x] **T-18:** Komponen UI Gameplay untuk TRUE_FALSE, ORDERING, SHORT (A.4)
  - *Bukti:* Komponen UI gameplay 5 tipe soal selesai: q-type-badge, tf-true/tf-false, order-card-0..n/order-reset/order-submit, match-left/match-right/match-reset/match-submit, short-input/short-submit dengan visualViewport dan feedback reveal akurat
- [x] **T-19:** Integrasi Admin Bank Soal untuk Multi-Tipe (A.4)
  - *Bukti:* Admin bank soal multi-tipe selesai: formulir 5 tipe soal, kolom dinamis, pratinjau live, distribusi statistik tipe soal, import JSON validasi per baris dengan laporan error, dan unit test tests/admin-multitype.test.js lulus 100%
- [x] **G-1:** Gerbang 1 (Skenario 13.2 #1, #2, #3, #8, #9 lulus)
  - *Bukti:* Gerbang 1 lolos: npm test 26 suites lulus 100%, check:schema 100% valid, Skenario 13.2 #1, #2, #3, #8, #9 lulus tanpa regresi

## Fase 2 — Boss Berfase, Cerita, Umpan Balik, & Pesan Kalah (C, F, G, K P0)
- [ ] **T-20:** Engine Boss Fase Marah (C.1)
- [ ] **T-21:** Engine Titik Lemah Topik Boss (C.2)
- [ ] **T-22:** Formula Damage Boss & Urutan Pipeline Answer 12.4 (C.2, 12.4)
- [ ] **T-23:** UI Visual Boss Marah & Indikator Titik Lemah (C.1, C.2)
- [ ] **T-24:** Dialog Boss & Reaksi Emosional Pet (F.1, F.2)
- [ ] **T-25:** Audio Sintesis, Haptic, & Animasi Combo Meter (G)
- [ ] **T-26:** Layar Hasil Kalah Ramah Anak & Tip Belajar (K)
- [ ] **G-2:** Gerbang 2 (Skenario 13.2 #4, #5, #12, #13, #14 lulus)

## Fase 3 — Fitur Sekunder (P1)
- [ ] **T-30:** Soal Tipe MATCHING (Pasangkan) P1 (A.1–A.4)
- [ ] **T-31:** Soal Bonus ⭐ & Soal Misteri ❓ (B)
- [ ] **T-32:** Backend Kejutan Tengah Sesi / Events (D)
- [ ] **T-33:** UI Kartu Kejutan & Auto-Decision Timeout (D)
- [ ] **T-34:** Backend Mode Peta Cerita / Kampanye (E.1)
- [ ] **T-35:** Frontend Peta Cerita Berkelok (E.1)
- [ ] **T-36:** Komik 3-Panel Epilog Bab (F.3)
- [ ] **T-37:** Mesin Agregasi Laporan Mingguan Siswa (J.1, J.3)
- [ ] **T-38:** Portal Laporan Siswa & Berbagi Tautan Orang Tua (J.2)
- [ ] **T-39:** Halaman Admin Laporan Kelas & Ekspor CSV (J.2, J.3)
- [ ] **G-3:** Gerbang 3 (Skenario 13.2 #6, #7, #10, #11 lulus)

## Fase 4 — Fitur Ekstensi P2 (Opsional / Terkondisi)
- [ ] **T-40:** Mode Boss Rush (E.2)
- [ ] **T-41:** Mode Boss Kelas / Raid Komunitas (E.3)

## Fase 5 — Verifikasi Menyeluruh, Quality Gates, & Penutupan
- [ ] **T-50:** Eksekusi 16 Skenario Pengujian 13.2 & Verifikasi Kriteria 13.3
- [ ] **T-51:** Audit Kepatuhan Anti-Scope (Kriteria 13)
- [ ] **T-52:** Restart Layanan PM2 & Penyusunan Laporan Akhir Resmi
