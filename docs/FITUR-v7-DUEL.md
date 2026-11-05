---
title: "PLAN FITUR v7 — Pertemanan & Duel Realtime (Petualangan Pelajar)"
status: plan
created: 2026-11-04 13:10 WIB
project: play.printshare.my.id
target_dir: /home/maman/play
dokumen_agent: docs/FITUR-v7.md
lampiran_kode: .hermes/plans/2026-11-04_131027-fitur-v7-LAMPIRAN-KODE.md
---

# 🎮 PLAN FITUR v7 — Pertemanan & Duel Antar Pemain

**Target:** `https://play.printshare.my.id` · origin `http://localhost:3002` · PM2 id 3 `play`, id 4 `cf-play`
**Basis kode:** v5.2 + v6 selesai (git HEAD `ebdbe9e`)
**Status:** `plan` — **BELUM ADA EKSEKUSI**. Belum ada file kode ditulis, belum ada DB dimigrasi, belum ada service di-restart.

---

## 0. Ringkasan Permintaan Juragan → Rancangan

| Permintaan | Rancangan v7 |
|---|---|
| Menu pertemanan: add teman | Cari pemain via **Nick** (bukan username — tabel `players` tidak punya kolom `username`), kirim permintaan, terima/tolak, hapus teman |
| Lihat status teman online/offline | `player_presence.last_seen_at`; online bila ≤ 75 detik sejak heartbeat terakhir |
| Status aktivitas: idle / battle biasa / petualangan / duel | Turunan server-side dari `game_sessions` + `duels` aktif (lihat §2.2) |
| Ajakan duel + pilih mata pelajaran | `POST /api/duels/challenge {friendId, subjectId}` → teman menerima undangan (polling) |
| Darah habis ± 10 soal benar | `max_hp = 100`, `damage_per_correct = 10` |
| Skill berlaku seperti lawan boss | Reuse 9 skill kanonik + energi, dipetakan ke efek duel (§2.4) |
| Durasi 10 menit, tanpa batas waktu per soal | Fase **NORMAL** 600.000 ms, timer per soal **tidak aktif** |
| Salah di fase normal tidak mengurangi darah | Damage hanya jika **benar** (ke lawan); salah = 0 damage kedua pihak |
| Setelah 10 menit → deathmatch, tiap soal ada waktu, salah mengurangi darah | Fase **DEATHMATCH**: `question_ms = 20.000`, benar = −10 HP lawan, salah/timeout = −10 HP sendiri |
| Lawan timeout bisa join lagi, status "waiting" | `PAUSED` + `reconnect_window_ms = 120.000`; lawan melihat overlay "Menunggu lawan kembali" |
| Sama-sama out → pemenang darah terbanyak | Resolusi `HP` tertinggi; seri = `DRAW` |
| History battle di menu pertemanan | `duels` + `duel_events` → `GET /api/friends/history` |
| File .md untuk perintah agent, kode mayoritas di dalam .md, hemat token | Dokumen `docs/FITUR-v7.md` + `FITUR-v7-LAMPIRAN-KODE.md`, protokol ceklis `scripts/progress.mjs` (sudah ada di repo) |

---

## 1. Grounding (verified 2026-11-04, read-only)

| Fakta | Bukti |
|---|---|
| Zero dependency; Node 22 native `node:sqlite` | `package.json` (tanpa `dependencies`), `lib/db.js` |
| **Tidak ada WebSocket/SSE** di server maupun client | `grep -rn 'WebSocket\|EventSource'` → 0 hasil |
| Identitas pemain = `nick` + `nick_lower`; **tidak ada `username`** | `PRAGMA table_info(players)` → id, nick, nick_lower, password_hash, xp, class_id, coins, … |
| 199 pemain terdaftar | `SELECT COUNT(*) FROM players` = 199 |
| Mode sesi yang ada | `BATTLE, PRACTICE, FREE, FUN` · status `IN_PROGRESS, WON, LOST, ABANDONED` |
| 9 skill kanonik | `eliminate_one, eagle_eye, heal, shield, power_strike, time_freeze, combo_keeper, lucky_pouch, second_chance` |
| Fungsi kunci | `startSession` L1591 · `skillAvailability` L2327 · `useSkill` L2450 · `answerQuestion` L2868 · `getActiveSession` L2665 · `resumeSession` L2740 |
| Pola route server | Rantai `if (pathname === '…' && method === '…')` mulai `server.js` L311 (bukan router tabel) |
| Frontend | `Screens = {}`, `go(name)`, `Screens.home` L1217, `Screens.battle` L1652, `Screens.profil` L3669, `renderActiveTab` L1560 |
| Sudah ada mekanik away/reconnect solo | kolom `last_ping_at, is_away, reconnect_count, away_since, reconnect_credits` di `game_sessions` |
| Protokol ceklis siap pakai | `scripts/progress.mjs` (7.317 B), `npm run progress` |
| Test runner | `npm test` → `node --test tests/*.test.js`, 26 file test, baseline v6 hijau |

**Konsekuensi desain:** realtime memakai **HTTP polling** (`2 dtk` saat duel, `5 dtk` di menu teman, `20 dtk` heartbeat). Tidak menambah dependency, tidak mengubah arsitektur, aman untuk Cloudflare Tunnel.

---

## 2. Spesifikasi Mekanika (angka pasti — jangan diubah tanpa OQ)

### 2.1 Konstanta
```
DUEL_MAX_HP            = 100
DUEL_DAMAGE_PER_CORRECT= 10      → 10 jawaban benar = HP lawan habis
NORMAL_PHASE_MS        = 600000  → 10 menit
DEATHMATCH_QUESTION_MS = 20000   → 20 detik per soal (deathmatch)
ANSWER_TOLERANCE_MS    = 1500    → toleransi lag (sama seperti battle solo)
PRESENCE_TTL_MS        = 75000   → online bila heartbeat ≤ 75 dtk
HEARTBEAT_MS           = 20000
DISCONNECT_GRACE_MS    = 45000   → tanpa aktivitas → PAUSED
RECONNECT_WINDOW_MS    = 120000  → jeda maksimal untuk kembali
INVITE_TTL_MS          = 60000   → undangan duel kedaluwarsa
DUEL_QUESTION_COUNT    = 40      → cadangan soal bila duel panjang
```

### 2.2 Status & Aktivitas Teman
- `online = (now - last_seen_at) <= PRESENCE_TTL_MS`
- Aktivitas (prioritas):
  1. `duel` — ada baris `duels` dengan `status='ACTIVE'` dan pemain sebagai peserta
  2. `battle` — ada `game_sessions.status='IN_PROGRESS'` dan `mode IN ('BATTLE','PRACTICE','FREE')`
  3. `petualangan` — ada `game_sessions.status='IN_PROGRESS'` dan (`mode='FUN'` atau `campaign_node IS NOT NULL`)
  4. `idle` — online tapi tidak ada sesi
- Label UI: `🟢 Duel` / `⚔️ Battle` / `🗺️ Petualangan` / `💤 Idle` / `⚫ Offline`

### 2.3 Alur Duel
```
PENDING   (undangan terkirim, TTL 60 dtk)
  ├─ ditolak        → DECLINED
  ├─ kedaluwarsa    → EXPIRED
  └─ diterima       → ACTIVE / phase NORMAL  (HP 100–100, soal di-generate, energi snapshot)

NORMAL (≤ 600 dtk, tanpa timer per soal)
  jawab benar → lawan −10 HP   |  jawab salah → 0 damage (kedua pihak)
  HP lawan ≤ 0 → FINISHED (menang)
  t = 600 dtk & kedua HP > 0 → phase DEATHMATCH (soal ke-n lanjut, timer aktif)

DEATHMATCH (timer 20 dtk/soal)
  benar      → lawan −10 HP
  salah      → diri sendiri −10 HP
  timeout    → diri sendiri −10 HP (server-authoritative, lazy enforcement)
  HP ≤ 0 pada salah satu → FINISHED

PAUSED (salah satu pemain hilang > DISCONNECT_GRACE_MS)
  → status pemain yang hadir = "waiting"; lawan boleh kembali ≤ 120 dtk
  → kembali  : phase & HP dipulihkan dari state, lanjut
  → habis    : pemain absen dinyatakan kalah (FORFEIT)
  → keduanya absen → FINISHED, pemenang = HP tertinggi (seri = DRAW)
```
**Seri:** HP sama saat selesai → `DRAW` (tidak ada pemenang).

### 2.4 Peta Efek Skill pada Duel
| Skill | Efek di duel | Catatan |
|---|---|---|
| `eliminate_one` | Coret 1 opsi salah soal aktif pemakai | hanya fase mana pun, 1×/soal |
| `eagle_eye` | Coret 2 opsi salah | idem |
| `heal` | Pulihkan HP sendiri `[25,35,45,55,65]` sesuai level, cap `max_hp` | |
| `shield` | Serap damage masuk berikutnya `[20,30,40,50,60]` | 1 charge |
| `power_strike` | Jawaban benar berikutnya ×`[2,2.25,2.5,2.75,3]` damage | konsumsi saat jawab |
| `time_freeze` | +10 dtk pada timer soal deathmatch | `NOT_APPLICABLE` di fase NORMAL |
| `combo_keeper` | 1 charge: salah di deathmatch tidak mengurangi HP sendiri | verifikasi nilai di `economy.js` |
| `lucky_pouch` | +5 koin instan (maks 1×/duel) | ekonomi kecil, tercatat `coin_transactions` |
| `second_chance` | 1 charge: batalkan satu damage masuk | verifikasi nilai di `economy.js` |
> Efek `combo_keeper`, `lucky_pouch`, `second_chance` **wajib diverifikasi** ke `shared/economy.js` sebelum implementasi; bila berbeda, ikuti definisi kanonik dan catat via `npm run progress -- note`.

### 2.5 Energi & Reward
- Energi snapshot saat duel mulai: `energy` & `energy_max` per pemain (pakai helper level→energi v6).
- Regen: **+1 energi setiap 3 jawaban benar** (aturan sama dengan v6).
- Reward duel (dapat dimatikan lewat `settings.duel_rewards_enabled='1'` default ON):
  - Menang: +15 koin, +10 XP · Kalah: +5 koin, +4 XP · Seri: +8 koin, +6 XP
  - Semua mutasi koin **wajib** lewat `applyCoins()` (satu pintu, audit `coin_transactions`).

---

## 3. Skema Database (aditif, idempoten)

```sql
CREATE TABLE IF NOT EXISTS player_presence (
  player_id INTEGER PRIMARY KEY,
  last_seen_at TEXT NOT NULL,
  activity TEXT NOT NULL DEFAULT 'idle'
);

CREATE TABLE IF NOT EXISTS friend_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_player_id INTEGER NOT NULL,
  to_player_id   INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',   -- PENDING|ACCEPTED|DECLINED|CANCELLED
  created_at TEXT NOT NULL,
  responded_at TEXT,
  UNIQUE(from_player_id, to_player_id)
);

CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(player_id, friend_id)
);

CREATE TABLE IF NOT EXISTS duels (
  id TEXT PRIMARY KEY,
  subject_id INTEGER NOT NULL,
  challenger_id INTEGER NOT NULL,
  challenged_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',   -- PENDING|ACTIVE|PAUSED|FINISHED|DECLINED|EXPIRED
  phase  TEXT NOT NULL DEFAULT 'NORMAL',    -- NORMAL|DEATHMATCH|ENDED
  max_hp INTEGER NOT NULL DEFAULT 100,
  hp_challenger INTEGER NOT NULL DEFAULT 100,
  hp_challenged INTEGER NOT NULL DEFAULT 100,
  shield_challenger INTEGER NOT NULL DEFAULT 0,
  shield_challenged INTEGER NOT NULL DEFAULT 0,
  energy_challenger INTEGER NOT NULL DEFAULT 2,
  energy_challenged INTEGER NOT NULL DEFAULT 2,
  energy_max_challenger INTEGER NOT NULL DEFAULT 5,
  energy_max_challenged INTEGER NOT NULL DEFAULT 5,
  correct_challenger INTEGER NOT NULL DEFAULT 0,
  correct_challenged INTEGER NOT NULL DEFAULT 0,
  wrong_challenger INTEGER NOT NULL DEFAULT 0,
  wrong_challenged INTEGER NOT NULL DEFAULT 0,
  last_seen_challenger TEXT,
  last_seen_challenged TEXT,
  normal_ends_at TEXT,
  question_deadline_at TEXT,
  winner_id INTEGER,
  end_reason TEXT,                          -- KO|DEATHMATCH_KO|FORFEIT|BOTH_ABSENT|DRAW|FORFEIT_BOTH
  created_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS duel_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  option_order_challenger_json TEXT NOT NULL,
  option_order_challenged_json TEXT NOT NULL, -- urutan opsi berbeda per pemain; jangan pernah kirim answer_index
  eliminated_challenger_json TEXT DEFAULT '[]',
  eliminated_challenged_json TEXT DEFAULT '[]',
  UNIQUE(duel_id, order_index)
);

CREATE TABLE IF NOT EXISTS duel_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  player_id INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  chosen_index INTEGER,
  is_correct INTEGER NOT NULL,
  damage_dealt INTEGER NOT NULL DEFAULT 0,
  damage_taken INTEGER NOT NULL DEFAULT 0,
  answered_at TEXT NOT NULL,
  elapsed_ms INTEGER,
  UNIQUE(duel_id, player_id, order_index)
);

CREATE TABLE IF NOT EXISTS duel_skill_uses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  player_id INTEGER NOT NULL,
  skill_id TEXT NOT NULL,
  uses INTEGER NOT NULL DEFAULT 0,
  UNIQUE(duel_id, player_id, skill_id)
);

CREATE TABLE IF NOT EXISTS duel_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id TEXT NOT NULL,
  ts TEXT NOT NULL,
  type TEXT NOT NULL,                       -- INVITE|ACCEPT|ANSWER|SKILL|PHASE|PAUSE|RESUME|FINISH
  payload_json TEXT
);
CREATE INDEX IF NOT EXISTS idx_duel_events_duel ON duel_events(duel_id, ts);
CREATE INDEX IF NOT EXISTS idx_duels_status ON duels(status, phase);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_player_id, status);
```

**Aturan migrasi:** hanya `CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS`. Tidak ada `ALTER TABLE` pada tabel lama. Backup DB sebelum migrasi: `data/play.db.bak-v7-<stamp>`.
**Wajib update** `scripts/check-schema.js` (daftar `tables`) agar gate `npm run check:schema` mengenali 6 tabel baru.

---

## 4. Daftar Endpoint (semua wajib auth kecuali disebut)

### Pertemanan & presence
| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/friends` | Daftar teman + status online/aktivitas + ringkasan permintaan |
| GET | `/api/friends/search?q=` | Cari pemain via nick (min 2 karakter, maks 10 hasil) |
| POST | `/api/friends/request` | `{nick}` → kirim permintaan |
| POST | `/api/friends/respond` | `{requestId, action:'accept'\|'decline'}` |
| DELETE | `/api/friends/:id` | Hapus teman (dua arah) |
| GET | `/api/friends/history?limit=` | Riwayat duel selesai (default 20) |
| POST | `/api/presence/ping` | Heartbeat `{activity?}` → upsert presence |

### Duel
| Method | Path | Fungsi |
|---|---|---|
| POST | `/api/duels/challenge` | `{friendId, subjectId}` → buat undangan `PENDING` |
| GET | `/api/duels/invites` | Undangan masuk `PENDING` (polling 5 dtk) |
| POST | `/api/duels/:id/respond` | `{action:'accept'\|'decline'}` |
| GET | `/api/duels/:id/state` | State duel (polling 2 dtk) — **tanpa kunci jawaban** |
| POST | `/api/duels/:id/answer` | `{orderIndex, chosenIndex, elapsedMs}` |
| POST | `/api/duels/:id/skill` | `{skillId, orderIndex}` |
| POST | `/api/duels/:id/reconnect` | Tandai hadir kembali; `RESUME` dari `PAUSED` |
| POST | `/api/duels/:id/forfeit` | Menyerah |
| GET | `/api/duels/active` | Duel aktif pemain (untuk banner resume) |

**Aturan respons error:** `{ error: CODE, reason?: string, message?: string }`
Kode: `UNAUTHENTICATED, FRIEND_NOT_FOUND, ALREADY_FRIENDS, REQUEST_PENDING, NOT_FRIENDS, DUEL_NOT_FOUND, NOT_PARTICIPANT, WRONG_STATE, WRONG_PHASE, NOT_YOUR_TURN_STATE, ANSWER_REJECTED, SKILL_UNAVAILABLE, NO_ENERGY, DEADLINE_PASSED, INVITE_EXPIRED`.

---

## 5. Fase, Tugas, dan Gerbang

> Protokol wajib: `npm run progress -- status|start|done|note|block|handoff` (skrip sudah ada). Satu tugas per giliran. Maks 2 percobaan/tugas.

### Fase 0 — Persiapan (sekali)
- **T-00** Audit sekali + backup DB `data/play.db.bak-v7-<stamp>` + catat baseline `npm test`, `npm run check:schema`, `node scripts/test-gameplay-e2e.js`. Bukti: ringkasan + nama file backup.
- **T-01** Pasang modul murni `shared/friendship.js` + `shared/duel.js` (Lampiran A & B) dan tes `tests/friendship.test.js`, `tests/duel-engine.test.js`. Bukti: `node --test tests/friendship.test.js tests/duel-engine.test.js` hijau.
- **T-02** Migrasi DDL 6 tabel + indeks (Lampiran C), update `scripts/check-schema.js`. Bukti: `npm run check:schema` lulus; tabel lama utuh.
- **T-03** Simpan `docs/FITUR-v7.md` + `docs/FITUR-v7-LAMPIRAN-KODE.md`, jalankan `npm run progress -- init docs/FITUR-v7.md`.
- **G-0** Gerbang: `npm test` + `check:schema` + `test-gameplay-e2e` hijau; commit `v7(T-0x)`.

### Fase 1 — Backend Pertemanan
- **T-10** `lib/db-friends.js`: cari pemain, kirim/terima/tolak permintaan, tambah/hapus teman (dua arah, transaksional), presence upsert, `computeActivity()` (Lampiran D).
- **T-11** Route pertemanan + presence di `server.js` (Lampiran E), termasuk auth & validasi.
- **T-12** Tes `tests/friends-api.test.js`: add → accept → list (online/offline/aktivitas) → hapus; permintaan duplikat & self-request ditolak.
- **G-1** Gerbang: `npm test` hijau (semua tes lama tetap lulus) + `node --test tests/friends-api.test.js`.

### Fase 2 — Backend Duel
- **T-20** `lib/db-duel.js`: `createChallenge`, `respondInvite`, `expireStaleInvites`, `startDuel` (generate soal, acak opsi, snapshot energi), `getDuelState` (bebas kunci jawaban).
- **T-21** `submitDuelAnswer`: validasi `orderIndex`, anti-replay (`UNIQUE`), damage fase NORMAL vs DEATHMATCH, transisi fase pada `normal_ends_at`, KO, `DRAW`.
- **T-22** `useDuelSkill`: peta efek §2.4, konsumsi energi atomik, `SKILL_UNAVAILABLE` + `reason` ramah anak.
- **T-23** `heartbeatDuel`/`reconnectDuel`/`forfeitDuel`/`finishDuel` (reward via `applyCoins`) + `expireStaleDuels` (lazy).
- **T-24** Tes `tests/duel-api.test.js`: simulasi 2 pemain sampai KO; fase deathmatch setelah 600 dtk (mock waktu); salah di deathmatch mengurangi HP sendiri; pause/resume; kedua absen → pemenang HP tertinggi; reward tercatat.
- **G-2** Gerbang: `npm test` hijau + seluruh skenario §7 (H.1–H.9).

### Fase 3 — Frontend
- **T-30** `public/js/friends.js`: layar Pertemanan (3 tab: Teman / Permintaan / Riwayat), pencarian, tambah/hapus, badge status.
- **T-31** `public/js/duel.js`: layar Duel (HP bar 2 pemain, timer fase, area soal reuse `Screens.battle` renderer, bar skill, overlay "Menunggu lawan", pasca-duel hasil + reward).
- **T-32** Polling manager: 2 dtk (duel), 5 dtk (undangan/teman), 20 dtk (heartbeat presence) + bersihkan interval saat `destroy()`.
- **T-33** Ubin menu "👥 Pertemanan" di `Screens.home` + badge jumlah undangan; daftarkan `Screens.friends` & `Screens.duel`; naikkan `CACHE_NAME` di `public/sw.js`.
- **T-34** CSS di `public/css/style.css` (Lampiran G) — tanpa scroll halaman, muat 320 px.
- **G-3** Gerbang: `node --test tests/*.test.js` hijau + `scripts/frontend-sanity` lulus + uji manual 320×568 & 430×932.

### Fase 4 — Verifikasi & Rilis
- **T-40** `scripts/smoke-test-v7.js`: dua klien HTTP (register 2 pemain uji) → add friend → challenge → accept → jawab benar 10× → KO; cetak ringkasan PASS/FAIL.
- **T-41** Restart terkendali **hanya** PM2 `play` (`pm2 restart play --update-env`); `cf-play` tidak disentuh. Verifikasi `/healthz`, `/api/friends`, duel smoke lewat `https://play.printshare.my.id`.
- **T-42** Commit + push + halaman gbrain + `npm run progress -- check` harus "ceklis valid".
- **G-4** Gerbang akhir (DoD).

---

## 6. Definition of Done
1. `npm test` 100% lulus (seluruh tes lama + ≥ 22 tes baru).
2. `npm run check:schema` 100% valid (6 tabel baru terdaftar).
3. `node scripts/test-gameplay-e2e.js` tetap lulus (regresi v4/v5/v6 = 0).
4. `node scripts/smoke-test-v7.js` PASS: add friend, undangan, duel sampai KO, history tercatat.
5. Dua akun manusia bisa: cari teman → tambah → lihat status online/aktivitas → ajak duel mapel → duel 10 menit / deathmatch → reconnect → history.
6. Tidak ada perubahan pada jalur battle solo (`startSession`/`answerQuestion`/`useSkill` tidak dimodifikasi selain penambahan ekspor).
7. `https://play.printshare.my.id` 200 dan tidak ada error konsol.

---

## 7. Skenario Verifikasi (H)
- **H.1** A menambah B → B menerima → keduanya melihat 1 teman; status online saat heartbeat aktif, offline setelah 75 dtk idle.
- **H.2** Aktivitas: A mulai battle solo → B melihat `⚔️ Battle`; A pindah ke peta → `🗺️ Petualangan`; A duel dengan C → B melihat `🟢 Duel`.
- **H.3** Undangan duel kedaluwarsa setelah 60 dtk → status `EXPIRED`.
- **H.4** Duel fase NORMAL: 10 jawaban benar → HP lawan 0 → `FINISHED`/`KO`. Jawaban salah tidak mengubah HP siapa pun.
- **H.5** Setelah 600 dtk kedua HP > 0 → phase `DEATHMATCH`, `question_deadline_at` terisi; timeout 20 dtk → HP sendiri −10.
- **H.6** Fase DEATHMATCH salah → HP sendiri −10 (bukan lawan).
- **H.7** A memutus koneksi 60 dtk → duel `PAUSED`, B melihat overlay menunggu; A `reconnect` → `ACTIVE` lanjut dengan HP & fase sama.
- **H.8** Keduanya absen > 120 dtk → `FINISHED`, pemenang HP tertinggi; HP sama → `DRAW`.
- **H.9** Skill: `heal` memulihkan HP (cap 100), `shield` menyerap damage berikutnya, `time_freeze` hanya di deathmatch (`NOT_APPLICABLE` di normal), energi berkurang sesuai biaya.

---

## 8. Risiko & Mitigasi
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Polling 2 dtk membebani server | CPU/IO naik | Query terindeks, `duels` 1 baris/duel, `SELECT` ringan; polling hanya saat layar duel |
| Race condition dua jawaban serentak | HP korup | Transaksi `BEGIN IMMEDIATE` + `UNIQUE(duel_id, player_id, order_index)` |
| Kunci jawaban bocor ke klien | Curang | `getDuelState` tidak pernah mengirim `answer_index`; validasi server-side |
| Perubahan tak sengaja pada battle solo | Regresi v5/v6 | Modul & tabel terpisah; tidak menyentuh `startSession`/`answerQuestion` |
| Service lain terganggu | Outage | Restart hanya `play`; `cf-play`, `lp-notifier`, `tarik` tidak disentuh |
| SQLite lock saat tes | Tes flaky | DB tes di `/tmp/` (pola tes v5.2) |

## 9. Rollback
1. `git revert <commit>` atau `git reset --hard <baseline ebdbe9e>`.
2. `pm2 restart play --update-env`.
3. DB: **tidak perlu** drop tabel (aditif & tidak dipakai kode lama); bila ingin bersih: `DROP TABLE duel_events, duel_skill_uses, duel_answers, duel_questions, duels, friendships, friend_requests, player_presence`.
4. Restore DB dari `data/play.db.bak-v7-<stamp>` bila terjadi korupsi data.

## 10. Open Questions (rekomendasi default — dipakai bila Juragan tidak menjawab)
1. **Damage tetap 10?** → Ya, `100/10` (paling sederhana, sesuai permintaan "habis dalam 10 soal benar").
2. **Waktu per soal deathmatch 20 dtk?** → Ya, 20 dtk; dapat diubah lewat `settings.duel_question_ms` tanpa deploy.
3. **Reward duel?** → Ya, kecil (menang 15 koin/10 XP); dapat dimatikan `settings.duel_rewards_enabled=0`.
4. **Soal sama untuk kedua pemain?** → Ya, set & urutan soal sama, tetapi **urutan opsi diacak per pemain** (anti-sontek).
5. **Jendela reconnect 120 dtk, grace 45 dtk?** → Ya.
6. **Rating/ELO & turnamen?** → Tidak di v7; kandidat v7.1.
7. **Notifikasi push undangan?** → Tidak; polling 5 dtk cukup (zero-dep). Push di v8.

## 11. Peta File
**Baru:** `shared/friendship.js`, `shared/duel.js`, `lib/db-friends.js`, `lib/db-duel.js`, `public/js/friends.js`, `public/js/duel.js`, `tests/friendship.test.js`, `tests/duel-engine.test.js`, `tests/friends-api.test.js`, `tests/duel-api.test.js`, `scripts/smoke-test-v7.js`, `docs/FITUR-v7.md`, `docs/FITUR-v7-LAMPIRAN-KODE.md`.
**Diubah (minimal):** `server.js` (blok route baru), `lib/db.js` (ekspor helper + migrasi DDL), `scripts/check-schema.js` (daftar tabel), `public/index.html` (script tag), `public/js/app.js` (ubin menu + daftar screen), `public/css/style.css` (blok gaya), `public/sw.js` (versi cache).

## 12. Protokol Hemat Token untuk Agent (WAJIB)
1. **Jangan baca dokumen penuh.** `grep -n '^## \|^### ' docs/FITUR-v7.md` lalu `sed -n 'A,Bp'` hanya bagian tugas aktif.
2. **Jangan menulis ulang file besar.** Gunakan `patch`/edit; `app.js` (5.136 baris) hanya ditambah blok kecil.
3. **Salin persis lampiran** — logika murni sudah lengkap & teruji; jangan menulis ulang algoritma.
4. **Tes terarah**: tes tugas saja; suite penuh hanya di gerbang.
5. **Satu tugas per giliran**, maks 2 percobaan, lalu `block` + alasan.
6. **Handoff tiap 3 tugas** atau saat konteks ≤ 15%.
7. **Audit sekali** (T-00). Dilarang audit ulang.
8. **Cek sebelum buat**: `grep` dulu apakah fungsi/kolom/endpoint sudah ada.
9. Jangan mencetak isi file besar / output tes penuh; ringkas 5 baris.
10. Bila ragu antara 2 desain, pilih yang sudah tertulis di §2 dan catat via `note` — jangan improvisasi.

---

**Lampiran kode lengkap:** lihat `2026-11-04_131027-fitur-v7-LAMPIRAN-KODE.md` (A–H).
**Status eksekusi:** ⏳ menunggu perintah "lakukan" dari Juragan.
