# 🎮 PROPOSAL & PERINTAH AGENT — v7: Skill Spesialis Boss per Elemen, Skill Makin Banyak & Kuat Menurut Rarity, Mode Brutal, dan Kartu Monster Dex

Dokumen ini punya dua bagian: **Bagian 1 — Proposal** (untuk pemilik: apa, mengapa, dampak, keputusan yang perlu disetujui) dan **Bagian 2 — Perintah Implementasi** (untuk agent: spesifikasi, kode, ceklis). Kode inti di **Lampiran A–F sudah ditulis dan diuji** (29 uji unit + simulasi keseimbangan lulus); agent menyalinnya persis, bukan menulis ulang.

**Prasyarat:** fitur **v6** (boss bertier common/rare/epic/legend, darah adaptif 15–30 jawaban benar, energi per level, upgrade skill) sudah terpasang. v7 membangun di atasnya.

---

# BAGIAN 1 — PROPOSAL

## 1.1 Ringkasan eksekutif
| Permintaan | Solusi |
|---|---|
| Tiap elemen boss punya skill spesialis sesuai elemennya | **10 elemen × 4 skill = 40 skill khas** (Api, Air, Es, Hutan, Tanah, Angin, Petir, Bayangan, Cahaya, Racun). Skill Api contohnya **Amarah Membara**: makin sedikit darah boss, makin besar damage ke pemain |
| Makin tinggi rarity, makin besar efek skill | Pengali efek per tier: **Common ×1,0 · Rare ×1,3 · Epic ×1,6 · Legend ×2,0** |
| Makin tinggi rarity, makin banyak skill | **Common 1 · Rare 2 · Epic 3 · Legend 4 skill** (tier tinggi selalu memiliki semua skill tier di bawahnya) |
| Mode Brutal | Sama seperti mode petualang normal, tetapi **efek skill boss 2×** dan **semua hadiah (koin & XP) 3×** |
| Kartu Monster Dex menampilkan deskripsi + skill | Kartu **satu baris satu kartu** (lebar penuh, seperti kartu skin), teks **tidak dipotong**, ada filter elemen/tier, pratinjau angka Brutal, dan progres "dikalahkan ×n" |

## 1.2 Prinsip desain (mengapa aman dan seru)
1. **Boss tidak pernah menjadi lebih sulit dikalahkan.** Semua skill boss hanya memengaruhi **sisi pemain** (damage ke pemain, waktu, energi, heal, bonus combo). Skill **tidak pernah** menambah HP boss atau mengurangi damage dasar ke boss, sehingga janji v6 — *boss habis dengan 15–30 jawaban benar* — tetap berlaku.
2. **Adil dan bisa dibaca anak.** Jurus besar selalu **diberi peringatan ⚠️ sebelum soal dijawab**; menjawab benar = menghindar. Efek berkelanjutan (terbakar/keracunan) **tidak pernah membuat pemain kalah**. Ada pengaman: damage per serangan maksimum 50% HP, pengurangan waktu ada lantai (≥ 60% dan ≥ 8 dtk).
3. **Satu sumber angka.** Seluruh keseimbangan ada di `shared/bossskills.js` (UMD, dipakai server & klien) — mengubah angka tidak perlu menyentuh kode lain.
4. **Aditif & aman diterapkan.** Hanya 3 kolom baru; sesi lama tetap berjalan tanpa skill boss.

## 1.3 Kemampuan tiap elemen (nilai Legend; di kolom kanan tiap sel: nilai Legend + Mode Brutal)
Urutan kolom = urutan skill dibuka menurut rarity: **Skill 1 (Common ke atas)**, **Skill 2 (Rare ke atas)**, **Skill 3 (Epic ke atas)**, **Skill 4 (Legend)**.

| Elemen | Skill 1 | Skill 2 | Skill 3 | Skill 4 |
|---|---|---|---|---|
| 🔥 Api | 🔥 **Amarah Membara** — hingga ×1,44 saat darah boss tipis · Brutal: hingga ×1,88 saat darah boss tipis | 🐉 **Semburan Api** — tiap 5 soal; salah = ×1,40 · Brutal: tiap 5 soal; salah = ×1,80 | ♨️ **Terbakar** — 2 soal, 6% dmg · Brutal: 2 soal, 12% dmg | 🌋 **Ledakan Inferno** — Fase 2: dmg +10% · Brutal: Fase 2: dmg +20% |
| 💧 Air | 🌀 **Arus Penyedot** — −20% energi saat salah · Brutal: −40% energi saat salah | 🌊 **Gelombang Pasang** — tiap 6 soal; salah = ×1,70 · Brutal: tiap 6 soal; salah = ×2,40 | ⏳ **Hanyut** — waktu −12% tiap 3 soal · Brutal: waktu −24% tiap 3 soal | 💦 **Banjir Pelumpuh** — heal −30% · Brutal: heal −60% |
| ❄️ Es | 🥶 **Embun Beku** — waktu −12% tiap 3 soal · Brutal: waktu −24% tiap 3 soal | 🌨️ **Badai Salju** — tiap 5 soal; salah = ×1,70 · Brutal: tiap 5 soal; salah = ×2,40 | 🧊 **Retak Es** — bonus combo −40% · Brutal: bonus combo −80% | ❄️ **Beku Abadi** — heal −30% · Brutal: heal −60% |
| 🌿 Hutan | 🌵 **Racun Duri** — 2 soal, 16% dmg · Brutal: 2 soal, 32% dmg | 🌱 **Akar Membelit** — +2 ⚡ skill di Fase 2 · Brutal: +3 ⚡ skill di Fase 2 | 😴 **Serbuk Lelap** — waktu −12% tiap 4 soal · Brutal: waktu −24% tiap 4 soal | 🍄 **Lumut Penghisap** — heal −30% · Brutal: heal −60% |
| 🪨 Tanah | 👊 **Hantaman Batu** — tiap 4 soal; salah = ×1,70 · Brutal: tiap 4 soal; salah = ×2,40 | ⛰️ **Longsor** — bonus combo −40% · Brutal: bonus combo −80% | 🫨 **Gempa Bumi** — −20% energi saat salah · Brutal: −40% energi saat salah | 💥 **Runtuhnya Gunung** — Fase 2: dmg +24% · Brutal: Fase 2: dmg +48% |
| 🌪️ Angin | 💨 **Angin Topan** — waktu −12% tiap 3 soal · Brutal: waktu −24% tiap 3 soal | 🗡️ **Tebasan Angin** — tiap 5 soal; salah = ×1,70 · Brutal: tiap 5 soal; salah = ×2,40 | 🌀 **Pusaran** — bonus combo −40% · Brutal: bonus combo −80% | 🌪️ **Badai Sempurna** — −20% energi saat salah · Brutal: −40% energi saat salah |
| ⚡ Petir | ⚡ **Sengatan** — −20% energi saat salah · Brutal: −40% energi saat salah | 🌩️ **Petir Menyambar** — tiap 4 soal; salah = ×1,70 · Brutal: tiap 4 soal; salah = ×2,40 | 🔌 **Korsleting** — +2 ⚡ skill di Fase 2 · Brutal: +3 ⚡ skill di Fase 2 | ⛈️ **Badai Petir** — Fase 2: dmg +24% · Brutal: Fase 2: dmg +48% |
| 🌑 Bayangan | 🌑 **Kegelapan Menembus** — tembus 40% perisai · Brutal: tembus 80% perisai | 🦇 **Cakar Bayangan** — tiap 5 soal; salah = ×1,70 · Brutal: tiap 5 soal; salah = ×2,40 | 🔮 **Kutukan Gelap** — heal −30% · Brutal: heal −60% | 🌘 **Gerhana** — waktu −12% tiap 3 soal · Brutal: waktu −24% tiap 3 soal |
| ✨ Cahaya | 😵‍💫 **Silau** — waktu −12% tiap 4 soal · Brutal: waktu −24% tiap 4 soal | ☀️ **Sinar Penghancur** — tiap 5 soal; salah = ×1,50 · Brutal: tiap 5 soal; salah = ×2,00 | 💎 **Pantulan Kristal** — bonus combo −40% · Brutal: bonus combo −80% | 🌅 **Fajar Murka** — hingga ×1,30 saat darah boss tipis · Brutal: hingga ×1,60 saat darah boss tipis |
| ☠️ Racun | ☠️ **Gas Beracun** — 3 soal, 10% dmg · Brutal: 3 soal, 20% dmg | 🌫️ **Kabut Racun** — heal −30% · Brutal: heal −60% | 🧪 **Semprotan Asam** — tembus 40% perisai · Brutal: tembus 80% perisai | 🦠 **Wabah** — +2 ⚡ skill di Fase 2 · Brutal: +3 ⚡ skill di Fase 2 |

**Arketipe efek** (semua dapat dijelaskan dalam satu kalimat kepada pemain):
| Arketipe | Efek |
|---|---|
| `rage_damage` | Damage ke pemain naik mengikuti darah boss yang berkurang (contoh Api) |
| `charged_strike` | Tiap N soal boss mengisi jurus; **peringatan dulu**; salah saat itu = damage berlipat, benar = menghindar |
| `dot` | Setelah salah, pemain terkena racun/api beberapa soal (tidak mematikan) |
| `time_squeeze` | Waktu menjawab berkurang pada soal kelipatan N |
| `energy_siphon` | Saat salah, sebagian energi tersedot |
| `heal_curse` | Efek Pulihkan melemah |
| `skill_tax` | Di Fase Marah, memakai skill butuh energi ekstra |
| `shield_pierce` | Serangan menembus sebagian Perisai |
| `combo_seal` | Bonus combo ke boss berkurang (damage dasar tetap) |
| `phase_rage` | Di Fase Marah, damage ke pemain naik |

## 1.4 Skala rarity
| Rarity | Jumlah skill | Pengali efek (normal) | Pengali efek (Brutal) | Pengali hadiah (v6) | Hadiah Brutal (× 3) |
|---|---|---|---|---|---|
| ⚪ Common | 1 | ×1,0 | ×2,0 | koin ×1,0 · XP ×1,0 | koin ×3,0 · XP ×3,0 |
| 🔵 Rare | 2 | ×1,3 | ×2,6 | koin ×1,3 · XP ×1,2 | koin ×3,9 · XP ×3,6 |
| 🟣 Epic | 3 | ×1,6 | ×3,2 | koin ×1,7 · XP ×1,5 | koin ×5,1 · XP ×4,5 |
| 🟡 Legend | 4 | ×2,0 | ×4,0 | koin ×2,3 · XP ×2,0 | koin ×6,9 · XP ×6,0 |

## 1.5 Mode Brutal
- Sakelar **"💀 Mode Brutal"** saat memulai pertempuran, di **Mode Bebas maupun Peta Kampanye**; dialog konfirmasi singkat pertama kali ("Efek skill boss 2× • Hadiah 3×").
- Boss, tier, soal, jumlah jawaban benar yang dibutuhkan: **sama persis** dengan mode normal. Yang berubah hanya: **efek skill boss ×2** dan **semua hadiah ×3** (koin per jawaban, bonus, peti, hadiah akhir, hadiah pertama kampanye; **tidak** pada biaya/pengeluaran).
- Sesi Brutal tersimpan di sesi (`brutal = 1`), aman untuk dilanjutkan. Bisa dimatikan total lewat satu konfigurasi (`BRUTAL.enabled`) atau diberi syarat level (`BRUTAL.minLevel`).

## 1.6 Kartu Monster Dex (satu baris satu kartu)
Tiap kartu (lebar penuh, tinggi menyesuaikan isi) memuat: gambar monster (aura sesuai tier) · nama · lencana elemen & tier · statistik "Dikalahkan n× · Mode Brutal n×" · **deskripsi** · daftar **semua skill** (ikon, nama, penjelasan lengkap berangka sesuai tier). Tombol **Normal | Brutal** mengganti angka pada penjelasan (pratinjau ×2). **40 kartu** (10 elemen × 4 tier) dengan filter elemen dan tier. Tidak ada `line-clamp`/elipsis, `overflow-wrap:anywhere`, font ≥ 14 px, selalu **satu kolom**, termasuk di layar lebar.

## 1.7 Dampak keseimbangan (hasil simulasi — `scripts/sim-bossfx.js`, kasus terburuk: pemain tidak memakai skill sama sekali)
Persentase kemenangan rata-rata lintas 10 elemen `[min–maks antar elemen]`:

| Tier | Mode | Akurasi 50% | Akurasi 70% | Akurasi 90% |
|---|---|---|---|---|
| Common | normal | 34% [17–46] | 96% [90–99] | 100% |
| Common | Brutal | 32% [11–43] | 94% [81–99] | 100% |
| Rare | normal | 14% [8–18] | 88% [82–93] | 100% |
| Rare | Brutal | 10% [5–14] | 81% [67–89] | 100% |
| Epic | normal | 8% [2–12] | 83% [60–90] | 100% |
| Epic | Brutal | 5% [1–8] | 72% [42–85] | 100% |
| Legend | normal | 2% [0–4] | 62% [37–74] | 100% |
| Legend | Brutal | 1% [0–2] | 40% [20–57] | 100% [99–100] |

Cara membaca: pemain yang menjawab benar ≥ 90% hampir selalu menang di semua tier dan mode; pemain 70% masih menang mudah di Common/Rare dan menantang di Legend; **Brutal terasa jelas lebih sulit tetapi tidak mustahil**. Angka sebenarnya **lebih ramah** karena pemain boleh memakai skill (heal, shield, time_freeze, dst.) yang tidak dimodelkan. **Elemen Api paling berat** (Legend normal @70% ≈ 38%) karena paketnya penuh skill pelukai; itu disengaja, mudah dilonggarkan dengan menurunkan `base` per skill.

## 1.8 Keputusan yang perlu persetujuan Anda
1. **Penumpukan hadiah.** Pengali tier (v6) dan Brutal saling mengalikan: Legend Brutal = **koin ×6,9, XP ×6,0**. Ini sesuai permintaan "semua hadiah 3×", tetapi dapat mempercepat inflasi koin. Pengaman: `BRUTAL.rewardMult` mudah diturunkan, `BRUTAL.enabled` = sakelar mati, dan agent memantau saldo lewat invarian koin. *Saran:* pantau 1 minggu pertama.
2. **Tanpa syarat level.** Default `BRUTAL.minLevel = 1` (sesuai "sama seperti mode normal"). Opsi: set ke 5 agar pemain baru tidak terjebak.
3. **Pemetaan 10 tema habitat → 10 elemen.** Nama tema nyata tidak ada di dokumen arsitektur; agent mengusulkan pemetaan 1:1 pada tugas T-00 dan Anda dapat mengubahnya. Tema yang tidak terpetakan **tidak membuat sesi gagal** (hanya tanpa skill boss).
4. **Boss tidak punya skill "regenerasi/perisai boss"** — sengaja, demi janji 15–30 jawaban benar (v6). Unsur "tahan banting" disalurkan lewat skill yang menekan pemain (heal melemah, combo disegel, dst.).
5. **Kebijakan Brutal pada kekalahan.** Hadiah ×3 berlaku pada **setiap** hadiah yang normalnya diberikan (termasuk bila kalah memberi hadiah hiburan). Bila Anda ingin ×3 hanya saat menang, beri tahu agent sebelum T-14.

## 1.9 Rencana & risiko
- **Urutan:** persiapan (audit, salin kode, migrasi) → server → antarmuka → penutup & deploy; 4 gerbang tes; 23 tugas pada ceklis.
- **Risiko utama:** (a) tema tidak terpetakan rapi → ditangani T-00 & tes `validateThemeMap`; (b) banyak titik kredit koin/XP → T-00(e) mendata semuanya dan T-14 memaksa satu fungsi pengali; (c) pemuatan ulang halaman menggandakan DoT → `onServeQuestion` **idempoten** (diuji); (d) cache PWA menyajikan JS lama → naikkan versi cache saat deploy.
- **Rollback:** deploy didahului backup DB; kolom baru bersifat aditif sehingga kode lama tetap berjalan bila perlu mundur.

---

# BAGIAN 2 — PERINTAH IMPLEMENTASI UNTUK AGENT

## 00. PROTOKOL CEKLIS PROGRES — WAJIB, BACA PERTAMA
**Mengapa:** agent tanpa catatan mengulang tugas yang sama sampai iterasi habis. `scripts/progress.mjs` menyimpan ceklis di `docs/PROGRESS-v7.md` dan menolak pengulangan tugas selesai, loncat urutan, dan percobaan berlebih.

### 00.1 Persiapan (sekali)
1. Buat/ganti `scripts/progress.mjs` dari **Lampiran G** (salin persis; default file kini `docs/PROGRESS-v7.md`; berkas `PROGRESS-v6.md` tetap sebagai arsip). `package.json` → `"progress": "node scripts/progress.mjs"`.
2. Simpan dokumen ini sebagai `docs/FITUR-v7.md`; jalankan `npm run progress -- init docs/FITUR-v7.md` (membuat `docs/PROGRESS-v7.md` dari **Lampiran H**; menolak menimpa bila sudah ada). Dokumen diperbarui di tengah jalan → `npm run progress -- sync docs/FITUR-v7.md`.
3. `npm run progress -- status`, kerjakan tugas yang tampil.

### 00.2 Siklus WAJIB per tugas
```
① npm run progress -- status                 # awal SETIAP giliran: HANDOFF + tugas BERIKUTNYA
② npm run progress -- start T-xx             # [~]; ditolak bila urutan salah / sudah selesai / sudah 2× dicoba
③ Baca HANYA bagian spesifikasi yang dirujuk tugas; cek dulu apakah kodenya sudah ada
④ Kerjakan tugas itu saja → jalankan tes pada "Bukti"
⑤ npm run progress -- done T-xx "file diubah · perintah tes · hasil"     # bukti WAJIB
⑥ git add -A && git commit -m "v7(T-xx): ringkasan"
⑦ Kembali ke ① — jangan berhenti bertanya kecuali ada blokir nyata
```
Tidak bisa selesai → `block T-xx "alasan"` lalu lanjut. Kemajuan sebagian → `note T-xx "…"`.

### 00.3 Aturan anti-looping
1. Tugas `[x]` tidak dikerjakan/diaudit/ditulis ulang. Gerbang gagal → catat `note`, perbaikan terarah, jangan buka ulang tugas lama.
2. **Audit hanya sekali (T-00).** 3. Satu tugas sekali jalan; maks **2 percobaan**, ke-3 → `block`. 4. **Cek sebelum membuat** (file/fungsi/kolom/endpoint). 5. Ubah hanya file yang diperlukan; jangan menulis ulang file besar. 6. Gerbang hijau sebelum fase berikutnya. 7. Akan melakukan sesuatu yang sudah tercatat di bukti tugas mana pun → berhenti, `status`.

### 00.4 Hemat iterasi & serah-terima
- Jangan membaca seluruh dokumen: `grep -n '^## \|^### ' docs/FITUR-v7.md` lalu `sed -n 'A,Bp'` bagian terkait. Lampiran kode cukup disalin saat T-01.
- Tes relevan per tugas; suite penuh hanya di gerbang. Tiap 3 tugas / sisa konteks ≤ 15% → `npm run progress -- handoff "…"` sebelum lanjut.
- "Lanjut" = ① `status`; tugas `[~]` → baca 📝 + `git status/diff` lalu **lanjutkan**. Sebelum menutup: `npm run progress -- check` = "ceklis valid".

| Perintah | Fungsi |
|---|---|
| `status` / `next` | ringkasan / tugas berikutnya |
| `start` / `done "bukti"` / `block "alasan"` / `note "teks"` | siklus tugas |
| `handoff "teks"` | catatan serah-terima |
| `sync <doc>` / `check` | tambah tugas baru / validasi |

---

## 0. Ruang lingkup dan aturan kerja
| Kode | Pekerjaan | Prioritas |
|---|---|---|
| A | 10 elemen boss, pemetaan tema habitat → elemen | P0 |
| B | Skill boss spesialis per elemen; makin tinggi rarity makin banyak & kuat | P0 |
| C | Integrasi server (kolom sesi, hook penyajian soal / jawaban / skill) | P0 |
| D | **Mode Brutal**: efek skill boss 2×, semua hadiah 3× | P0 |
| E | Antarmuka pertempuran (lencana elemen, chip skill, peringatan jurus, toast) | P0 |
| F | **Monster Dex**: kartu 1 baris 1 kartu — deskripsi + skill | P0 |

**Aturan kerja**
1. **Audit SEKALI (T-00)** lalu tambah di atas yang ada. Jangan menulis ulang aplikasi/menghapus data/mengubah bank soal.
2. **Server otoritatif:** skill, damage, waktu, energi, hadiah dihitung server. Klien hanya menampilkan.
3. **Zero-dependency**; logika baru di `shared/bossskills.js` (UMD) dan `lib/bossfx.js`. Salin Lampiran **persis**; ubah angka keseimbangan hanya di `bossskills.js`.
4. **Jaminan v6 tidak boleh rusak:** hook skill **tidak pernah** mengubah `boss_hp`/`boss_max_hp`/`boss_hits_needed`; damage ke boss tidak pernah di bawah 1 hit (`HIT_UNIT`); boss tetap tumbang dengan ≤ N (15–30) jawaban benar dan tidak sebelum ke-15.
5. Migrasi **aditif & idempoten** (cek `PRAGMA table_info`), backup sebelum migrasi, perbarui `check-schema.js`; sesi lama (kolom `NULL`) berjalan tanpa skill boss.
6. Mutasi koin lewat `applyCoins` + `coin_transactions` dengan `Idempotency-Key`; invarian `players.coins == SUM(coin_transactions.delta)` utuh.
7. Mobile-first 320×568 s.d. 430×932, tanpa scroll horizontal, bahasa Indonesia ramah anak, tombol ≥ 44 px, hormati "Animasi hemat"/`prefers-reduced-motion`, `data-testid` seperti disebut.
8. **Ceklis wajib (Bagian 00).** 9. **Deploy hanya setelah semua gerbang hijau** (T-32). Jangan mengubah `config.yml`/Cloudflare Tunnel.

---

## A. Elemen dan Pemetaan Tema Habitat
### A.1 Sepuluh elemen (sumber: `BossSkills.ELEMENTS`)
`fire` 🔥 Api · `water` 💧 Air · `ice` ❄️ Es · `nature` 🌿 Hutan · `earth` 🪨 Tanah · `wind` 🌪️ Angin · `thunder` ⚡ Petir · `shadow` 🌑 Bayangan · `light` ✨ Cahaya · `toxic` ☠️ Racun. Tiap elemen punya gelar, deskripsi, warna, dan 4 skill (A.2 di Bagian B).

### A.2 Pemetaan tema → elemen (T-00, T-01)
- Tema habitat yang ada (10 kunci di `subjects.monster_theme`/`monsters.js`/`story.js`) **dipetakan 1:1** ke 10 elemen. Isi `BossSkills.THEME_ELEMENT = { kunci_tema: 'fire', … }` **secara eksplisit** pada Lampiran A (satu-satunya edit yang diizinkan di berkas itu selain angka keseimbangan). Pencocokan kata kunci hanya cadangan.
- `BossSkills.validateThemeMap(kunciTemaNyata)` harus `ok: true` (semua tema terpetakan, tanpa elemen ganda). Bila jumlah tema ≠ 10 atau tidak cocok rapi, **catat usulan di `note` T-00** dan pilih pemetaan terdekat; jangan memblokir.
- Tema tak terpetakan saat runtime → sesi tanpa skill boss + log peringatan; **tidak boleh** menggagalkan `start`.
- Gambar monster di Dex: `BossSkills.themeForElement(el)` memberi kunci tema untuk generator `monsters.js`.

---

## B. Skill Boss: Spesialis per Elemen, Makin Tinggi Rarity Makin Banyak dan Kuat
### B.1 Aturan
- Jumlah skill: `SKILL_COUNT = { common:1, rare:2, epic:3, legend:4 }`; skill diambil dari awal paket elemen (`skillsFor(elemen, tier)`), sehingga tier tinggi ⊇ tier rendah dan **skill pertama adalah skill khas elemen**.
- Kekuatan: `nilai = base(skill) × TIER_POWER[tier] × (brutal ? 2 : 1)`, dibatasi `cap` arketipe. `TIER_POWER = { common:1.0, rare:1.3, epic:1.6, legend:2.0 }`.
- **Skill Api sesuai permintaan:** `fire_rage` "Amarah Membara" — `pengaliDamage = 1 + nilai × (1 − HPboss/HPmaksBoss)`; makin sedikit darah boss, damage ke pemain makin besar (Common hingga ×1,22 · Legend ×1,44 · Legend Brutal ×1,88).
- **Hanya sisi pemain** (lihat Aturan kerja 4). Pengaman di `LIMITS`: pengali damage total ≤ 6, damage per serangan ≤ 50% HP maks pemain, `timeMult` ≥ 0,6 dan waktu ≥ 8 dtk, DoT tidak pernah menurunkan HP di bawah 1.
- Semua teks penjelasan dibuat otomatis oleh `describeSkill`/`dexEntries()` dari angka yang sama — **jangan menulis teks skill manual di tempat lain**.

### B.2 Daftar skill (rinci di Bagian 1.3 dan `BossSkills.KITS`)
40 skill; id mengikuti pola `{elemen}_{nama}`, mis. `fire_rage`, `water_tide`, `ice_frost`.

---

## C. Integrasi Server (lib/db.js memanggil lib/bossfx.js)
`lib/bossfx.js` (Lampiran B) murni terhadap objek `row` (baris `game_sessions`), **tidak menyentuh DB**; pemanggil menulis `update` yang dikembalikan **dalam transaksi yang sama** dengan efek lain. Field `row` yang dipakai: `boss_element, boss_tier, brutal, boss_phase, boss_hp, boss_max_hp, monster_damage, player_hp, player_max_hp (bila bukan kolom, isi dengan konstanta HP maks pemain yang ada), boss_fx_json`. Nomor soal `idx` = **1-based** (`order_index + 1`).

### C.1 Saat sesi dibuat — `POST /api/game/start` (T-10)
```js
const bf = require('./bossfx');
// setelah v6 menentukan tier & bossStats:
const f = bf.startFields({ themeKey: subject.monster_theme, brutal: !!body.brutal, level: playerLevel });
if (body.brutal && !f.brutal) return json(res, 403, { ok: false, code: 'BRUTAL_LOCKED' });   // belum tersedia / tema belum terpetakan → jangan diam-diam normal
Object.assign(sessionRow, f);                  // boss_element, brutal, boss_fx_json → ikut INSERT game_sessions
response.boss = { ...response.boss, ...bf.publicView(sessionRow) };   // element, title, brutal, skills[] (nama+teks)
```
Pemain yang **tidak** meminta Brutal tetap mendapat skill boss normal.

### C.2 Saat soal disajikan (start / next / resume) (T-11)
```js
const f = bf.onServeQuestion(row, idx, baseTimeSec);   // baseTimeSec = timeLimit v5/v6 (pace, fase 2, skill waktu, dst.)
if (f.update) db.prepare('UPDATE game_sessions SET boss_fx_json=?, player_hp=? WHERE id=?').run(f.update.boss_fx_json, f.update.player_hp, row.id);
question.timeLimitSec = f.timeLimitSec;               // timer SERVER memakai nilai akhir
response.bossFx = { telegraph: f.telegraph, events: f.events, dotDamage: f.dotDamage, timeMult: f.timeMult };
response.player.hp = f.update ? f.update.player_hp : row.player_hp;
```
**Idempoten:** menyajikan ulang soal yang sama (muat ulang/resume) tidak memotong DoT dua kali. Peringatan jurus (`telegraph`) ikut dikirim **sebelum** pemain menjawab.

### C.3 Jawaban benar (T-12)
```js
const mods = bf.skillMods(row);
const dmg = Progression.hitDamage({ comboStreak, powerMult, wrongStreak, comboBonusMult: mods.comboBonusMult }).damage;
bossHp = Progression.applyBossDamage(bossHp, dmg, correctCountSetelah);   // lantai 15 benar & lantai 1 hit tetap dari v6
```

### C.4 Jawaban salah (T-12)
```js
const w = bf.onWrongAnswer(row, idx, session.energy);
const absorbed = Math.min(Math.floor(session.shield * w.shieldMult), w.damage);   // shield_pierce: perisai efektif berkurang
playerHp -= (w.damage - absorbed);   /* sisa perisai dikurangi 'absorbed' sesuai aturan perisai yang ada */
session.energy = Math.max(0, session.energy - w.energyLoss);
// simpan w.update (fx), kirim w.events ke klien:
response.bossFx = { events: w.events };
```
`w.damage` **menggantikan** `monster_damage` polos pada sesi yang punya skill boss (sesi tanpa elemen: `damage = monster_damage`, perilaku v6 tak berubah).

### C.5 Skill pemain (T-13)
`mods = bf.skillMods(row)`: biaya akhir = biaya dasar (menurut level skill) `+ mods.extraCost`, **dipakai di validasi dan di `skills[].cost`** (agar tombol & server selalu sepakat, termasuk alasan `NO_ENERGY`); efek `heal` = `floor(nilaiHeal × mods.healMult)`.

---

## D. Mode Brutal
### D.1 Aturan
- Brutal = **mode normal** (tier, soal, N jawaban benar, peta kampanye, resume, laporan sama) dengan dua perbedaan: **efek skill boss × `BRUTAL.skillMult` (2)** dan **hadiah × `BRUTAL.rewardMult` (3)**.
- Tersedia di Mode Bebas dan Peta Kampanye; `BRUTAL = { enabled:true, minLevel:1, skillMult:2, rewardMult:3 }` (di `bossskills.js`). Kemajuan kampanye/bintang/kemenangan Brutal dihitung seperti normal.
- Tersimpan di `game_sessions.brutal` (0/1), tidak berubah selama sesi, dipulihkan saat resume.

### D.2 Hadiah ×3 (T-14)
- Audit (T-00e) seluruh titik yang **menambah** koin/XP dalam sesi; arahkan semuanya ke satu fungsi:
```js
const m = bf.rewardMult(row, Progression.rewardMult(row.boss_tier || 'common'));   // { coin, xp } = pengali tier × (brutal ? 3 : 1)
const coins = base > 0 ? Math.max(1, Math.round(base * m.coin)) : 0;               // bulatkan setelah dikali
applyCoins(playerId, +coins, reason + (row.brutal ? ':BRUTAL' : ''), idemKey);
```
- Berlaku: koin per jawaban, soal bonus ⭐, peti/kejutan, hadiah akhir (koin + XP), hadiah pertama kampanye. **Tidak** berlaku: biaya, harga pedagang, pengembalian koin, upgrade skill.
- Invarian saldo koin tetap utuh (semua lewat `applyCoins`); layar hasil menampilkan baris "Hadiah ×3 (Brutal)".

### D.3 Tampilan (T-21)
- Sakelar `brutal-toggle` ("💀 Mode Brutal — skill boss 2× • hadiah 3×") pada layar mulai (kartu mapel dan lembar simpul kampanye), **default mati setiap kali**. Dialog konfirmasi pertama kali (simpan `settings_json.brutalAck = true`).
- Saat aktif: lencana `brutal-badge` di HUD, bingkai/aksen merah, label "BRUTAL" di intro boss dan layar hasil; hormati animasi hemat.

---

## E. Antarmuka Pertempuran (T-20)
- **Lencana elemen** di samping nama boss: ikon + nama elemen + lencana tier (`boss-element-badge`).
- **Chip skill boss** (`boss-skill-chips`, `boss-skill-chip-{id}`): satu chip per skill (ikon; `aria-label` nama). Ketuk → lembar/dialog kecil berisi nama + penjelasan lengkap (`publicView.skills[].text`), tidak menutupi soal saat dibuka (bisa ditutup, tidak mem-pause timer server).
- **Banner peringatan jurus** (`boss-telegraph`): tampil sejak soal muncul bila `bossFx.telegraph` ada, teks dari `BossSkills.describeEvent`; tetap sampai soal dijawab; `aria-live="assertive"`; tanpa guncangan bila animasi hemat.
- **Toast event** (`boss-fx-toast`): untuk `rage`, `phase_rage`, `charged_hit`, `dot_start`, `dot`, `time`, `energy` (teks dari `describeEvent`, ±2,5 dtk, ditumpuk maks 3). Perubahan waktu soal tampak di timer ("⏳ −12%").
- Muat `<script src="/shared/bossskills.js">` dan `/js/dexcards.js` sebelum `app.js`; **naikkan versi cache service worker** bila ada.
- Tidak menampilkan skill boss pada layar kekalahan/menang secara berlebihan; cukup ringkasan "Jurus yang kamu hadapi".

---

## F. Monster Dex — Kartu 1 Baris 1 Kartu (T-15, T-22)
### F.1 Tata letak
- **Satu kartu per baris**, lebar penuh, **selalu satu kolom** (juga di desktop) — meniru kartu skin di toko: audit kelas kartu skin (T-00d) dan **pakai token/radius/bayangan yang sama**; CSS Dex ada di `DexCards.CSS` (Lampiran C) — sisipkan ke `style.css` dan sesuaikan variabel warna.
- Isi kartu: gambar monster (aura tier dari `monsters.js`) · nama (gelar elemen) · lencana elemen & tier · "Dikalahkan n× · Mode Brutal n×" · **deskripsi** (selalu utuh) · **Skill boss (n)**: tiap skill ikon + nama + penjelasan berangka.
- **Teks tidak boleh terpotong:** tanpa `line-clamp`/`text-overflow:ellipsis`, tinggi kartu mengikuti isi, `overflow-wrap:anywhere`, font ≥ 14 px, tombol/area ketuk ≥ 44 px.
- **Kontrol:** filter elemen (`dex-filter-element`), filter tier (`dex-filter-tier`), sakelar **Normal | Brutal** (`dex-brutal-toggle`) yang mengganti angka penjelasan (pratinjau ×2; tidak mengubah apa pun di akun). Urutan default: elemen (urutan `ELEMENT_ORDER`) lalu tier naik.
- 40 entri (10 elemen × 4 tier). Seluruh teks berasal dari `BossSkills.dexEntries()`; render lewat `DexCards.renderList(entries, progress, { brutal, filter, art })` dengan `art(entry)` = generator monster yang ada (`monsters.js`, memakai `BossSkills.themeForElement(entry.element)` dan `entry.tier`).
- Bila layar Dex belum ada (T-00c), buat layar minimal `dex` dari kartu menu "📖 Monster Dex".

### F.2 Data (T-15) — `GET /api/dex`
```jsonc
{ "ok": true, "brutal": { "enabled": true, "minLevel": 1, "skillMult": 2, "rewardMult": 3 },
  "progress": { "fire:legend": { "defeated": 3, "brutalDefeated": 1 } } }       // kunci "{elemen}:{tier}"; tanpa baris = belum pernah
```
```sql
SELECT s.monster_theme AS theme, COALESCE(g.boss_tier,'common') AS tier, g.brutal AS brutal, COUNT(*) AS n
FROM game_sessions g JOIN subjects s ON s.id = g.subject_id
WHERE g.player_id = ? AND g.status = 'COMPLETED' AND g.boss_hp <= 0
GROUP BY s.monster_theme, COALESCE(g.boss_tier,'common'), g.brutal;
```
Petakan `theme → elemen` lewat `BossSkills.elementForTheme`; jumlahkan per `elemen:tier` (`defeated` = semua, `brutalDefeated` = `brutal = 1`). Tambahkan `summary.brutalDefeated` pada laporan mingguan (v6 A.2).

### F.3 Data klien
Klien membangun daftar dari `BossSkills.dexEntries()` (shared, tanpa request) + `progress` dari API; tidak ada teks skill yang dihardcode di klien.

---

## G. Data, Migrasi, dan API
### G.1 Migrasi aditif (T-02) — idempoten, setelah backup `data/play.db.bak-*`
```js
function addColumnIfMissing(db, table, col, ddl) {
  const has = db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col);
  if (!has) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
}
for (const [col, ddl] of [
  ['boss_element', 'TEXT'],                         // NULL = sesi lama / tema belum terpetakan → tanpa skill boss
  ['brutal', 'INTEGER NOT NULL DEFAULT 0'],
  ['boss_fx_json', 'TEXT'],                         // status efek berkelanjutan (DoT) + penanda soal terakhir yang disajikan
]) addColumnIfMissing(db, 'game_sessions', col, ddl);
```
Perbarui `scripts/check-schema.js`. Tidak ada tabel baru.

### G.2 Endpoint
| Endpoint | Perubahan |
|---|---|
| `POST /api/game/start` | body `brutal?`; `403 BRUTAL_LOCKED`; respons `boss` + `element/title/brutal/skills[]` |
| `GET` sesi aktif / `next` / `POST …/answer` | + `bossFx { telegraph, events[], dotDamage, timeMult }`; damage final & energi sesuai C.4 |
| `POST /api/game/:id/skill` | biaya akhir `+extraCost`, efek heal × `healMult` |
| Semua kredit koin/XP sesi | × `rewardMult` (D.2), `reason` bersufiks `:BRUTAL` |
| `GET /api/dex` | **Baru** (F.2) |
| `GET /api/me` | + `brutal { enabled, minLevel, skillMult, rewardMult }` |
| Laporan mingguan | + `summary.brutalDefeated` |

---

## H. Pengujian
**Perintah** (`/home/maman/play`): `node --test tests/*.test.js` (Lampiran F + suite v6) · `npm test` · `node scripts/check-schema.js` · `node scripts/smoke-test-v4.js` · `node scripts/test-gameplay-e2e.js` · `node scripts/sim-bossfx.js`. Skenario dirujuk di ceklis sebagai **H.1…H.14**, kriteria sebagai **I.1…I.10**.

1. **Struktur:** 10 elemen × 4 skill, id unik; jumlah skill per tier 1/2/3/4; paket tier tinggi ⊇ tier rendah; Dex 40 entri.
2. **Rarity:** untuk semua skill, efek Common ≤ Rare ≤ Epic ≤ Legend (dan Legend > Common).
3. **Brutal:** efek tiap skill tepat 2× (atau mentok batas pengaman `cap`); hadiah ×3.
4. **Api:** damage ke pemain naik saat darah boss turun (1,0 → 0,05) di semua tier; Legend > Common; Brutal > normal.
5. **Jurus & resume:** peringatan muncul tepat tiap N soal sebelum dijawab; salah saat jurus = damage lebih besar, benar = tanpa hukuman; **muat ulang di soal yang sama tidak menggandakan DoT**.
6. **Pengaman:** DoT tak pernah menurunkan HP < 1; damage per serangan ≤ 50% HP maks; `timeMult ≥ 0,6` dan waktu ≥ 8 dtk; timer server memakai waktu akhir.
7. **Jaminan v6:** sesi sintetis 100% benar tumbang dengan 15…N jawaban benar pada semua elemen × tier × (normal/Brutal); `combo_seal` tidak pernah membuat damage < 1 hit; tidak ada hook yang mengubah HP boss.
8. **Skill pemain:** `heal_curse` mengurangi heal; `skill_tax` hanya Fase 2 dan konsisten di `skills[].cost` ↔ validasi; `shield_pierce` mengurangi perisai efektif; `energy_siphon` tak membuat energi negatif.
9. **Hadiah & Brutal:** semua titik kredit koin/XP ×3 saat Brutal (menumpuk dengan tier), `reason` bersufiks `:BRUTAL`, invarian koin utuh, pengeluaran tidak dikali; `403 BRUTAL_LOCKED` bila belum tersedia; Brutal tersimpan & dipulihkan saat resume.
10. **Kompatibilitas:** sesi lama (kolom `NULL`) dan tema tak terpetakan berjalan tanpa skill boss dan tanpa galat.
11. **Dex UI:** di 320×568, 430×932, dan desktop **satu kartu per baris**; deskripsi & semua skill terbaca utuh (tanpa terpotong); filter elemen/tier; pratinjau Brutal mengganti angka; progres benar; teks aman dari injeksi HTML.
12. **UI pertempuran:** peringatan jurus terlihat sebelum menjawab; chip skill membuka penjelasan; toast event; HUD Brutal; mode animasi hemat; tidak ada scroll horizontal.
13. **Simulasi keseimbangan:** `sim-bossfx.js` dan pita penerimaan di `tests/bossskills.test.js` lulus.
14. **Regresi:** v6 (laporan, level kemampuan, tier, darah adaptif 15–30, upgrade skill, energi per level), resume, auto-lanjut, kejutan, 5 tipe soal, SRS, toko/koin; `check-schema` dan `smoke-test-v4` lulus; e2e diperbarui untuk sesi Brutal.

## I. Kriteria lulus (✅/❌ pada laporan akhir)
| # | Kriteria |
|---|---|
| 1 | 10 elemen × 4 skill aktif; tema habitat terpetakan; skill Api "makin sedikit darah, makin besar damage" terbukti |
| 2 | Rarity menentukan **jumlah** (1/2/3/4) dan **kekuatan** (×1,0/1,3/1,6/2,0) skill |
| 3 | Mode Brutal tersedia di Mode Bebas & Kampanye: efek skill boss 2×, semua hadiah koin/XP 3× |
| 4 | Jurus selalu diberi peringatan; DoT/damage/waktu punya pengaman; resume tidak menggandakan efek |
| 5 | Jaminan v6 utuh: boss habis dengan 15…N (≤ 30) jawaban benar |
| 6 | Kartu Monster Dex 1 baris 1 kartu, deskripsi + semua skill terbaca utuh, filter, pratinjau Brutal, progres |
| 7 | Hadiah Brutal melalui satu fungsi pengali; invarian koin utuh |
| 8 | Sesi lama & tema tak terpetakan tetap berjalan; migrasi aditif; `check-schema` lulus |
| 9 | Semua tes hijau (`node --test`, `npm test`, smoke, e2e, simulasi); tanpa dependensi baru |
| 10 | `npm run progress -- check` valid; semua tugas `[x]` bukti / `[!]` alasan; tidak ada tugas dikerjakan dua kali |

## J. Laporan akhir (T-33)
```
## Ringkasan (per bagian A–F) · pemetaan tema→elemen yang dipakai (tabel)
## Hasil audit T-00 (prasyarat v6, layar Dex, kelas kartu skin, daftar titik kredit koin/XP)
## File dibuat/diubah · migrasi (nama backup) · keputusan di luar spesifikasi
## Hasil tes: node --test, npm test, check-schema, smoke-test-v4, e2e, sim-bossfx, skenario H.1–H.14, kriteria I.1–I.10 ✅/❌
## Ceklis progres (salin [x]/[!] + bukti dari docs/PROGRESS-v7.md) dan keluaran `progress status`
## Deploy (backup, pm2 restart play, verifikasi) · Risiko · Saran penyesuaian angka (mis. BRUTAL.rewardMult, base skill Api)
```

---
## Lampiran A — `shared/bossskills.js` (salin persis; satu-satunya edit: isi `THEME_ELEMENT` dari audit T-00b)
UMD: `require('../shared/bossskills.js')` di server, `window.BossSkills` di klien. 10 elemen, 40 skill, skala rarity, Mode Brutal, hook murni, teks penjelasan, entri Dex.
```js
/* shared/bossskills.js — skill spesialis boss per elemen + Mode Brutal (UMD: server & klien; murni, tanpa I/O/dependensi) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BossSkills = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const fmt = (n, d) => Number(n.toFixed(d == null ? 0 : d)).toString().replace('.', ',');
  const pct = (v) => fmt(v * 100, 0) + '%';

  /* ---------- Konfigurasi (satu-satunya tempat menyetel keseimbangan) ---------- */
  const TIERS = ['common', 'rare', 'epic', 'legend'];
  const TIER_POWER = { common: 1.0, rare: 1.3, epic: 1.6, legend: 2.0 };   // makin tinggi rarity → efek skill makin besar
  const SKILL_COUNT = { common: 1, rare: 2, epic: 3, legend: 4 };            // makin tinggi rarity → skill makin banyak
  const BRUTAL = { enabled: true, minLevel: 1, skillMult: 2, rewardMult: 3 };
  const LIMITS = { maxDamageMult: 6, maxHitPct: 0.5, minTimeMult: 0.6, minTimeSec: 8 };   // pengaman agar tidak mustahil/menyebalkan
  const RARITY_LABEL = { common: 'Common', rare: 'Rare', epic: 'Epic', legend: 'Legend' };

  /* ---------- Arketipe efek (semua HANYA menyentuh sisi pemain; tidak pernah menambah HP boss / membuat boss butuh > N jawaban benar) ---------- */
  const ARCH = {
    rage_damage:    { base: 0.25, cap: 3,   text: (v) => `Makin sedikit darah boss, makin besar damage ke kamu — hingga ×${fmt(1 + v, 2)} saat darahnya hampir habis.` },
    charged_strike: { base: 0.35, cap: 4,   text: (v, s) => `Tiap ${s.every} soal boss mengisi jurus (ada peringatan ⚠️). Jawab BENAR untuk menghindar; jawab salah = damage ×${fmt(1 + v, 2)}.` },
    dot:            { base: 0.08, cap: 1,   text: (v, s) => `Setelah kamu salah, kamu ${s.verb || 'terkena efek'} selama ${s.turns || 2} soal: darahmu berkurang ${pct(v)} dari damage serangan boss di awal tiap soal (tidak pernah sampai membuatmu kalah).` },
    time_squeeze:   { base: 0.06, cap: 0.4, text: (v, s) => `Tiap ${s.every} soal, waktu menjawab berkurang ${pct(v)}.` },
    energy_siphon:  { base: 0.10, cap: 0.5, text: (v) => `Saat kamu salah, boss menyedot ${pct(v)} energimu (minimal 1 ⚡).` },
    heal_curse:     { base: 0.15, cap: 0.8, text: (v) => `Efek skill Pulihkan (heal) berkurang ${pct(v)}.` },
    skill_tax:      { base: 0.60, cap: 3,   text: (v) => `Saat boss marah (Fase 2), memakai skill butuh +${Math.ceil(v)} ⚡ ekstra.` },
    shield_pierce:  { base: 0.20, cap: 0.9, text: (v) => `Serangan boss menembus ${pct(v)} perlindungan Perisai.` },
    combo_seal:     { base: 0.20, cap: 0.9, text: (v) => `Bonus combo-mu ke boss berkurang ${pct(v)} (damage dasar tetap).` },
    phase_rage:     { base: 0.15, cap: 2,   text: (v) => `Saat boss marah (Fase 2), damage ke kamu +${pct(v)}.` },
  };

  /* ---------- 10 elemen: profil + paket skill (urutan = urutan dibuka menurut rarity: common 1 skill … legend 4 skill) ---------- */
  const ELEMENTS = {
    fire:    { name: 'Api',      icon: '🔥', color: '#EF4444', title: 'Penguasa Api',      desc: 'Raksasa dari gunung berapi yang makin ganas saat terdesak. Semakin sedikit darahnya, semakin panas serangannya!' },
    water:   { name: 'Air',      icon: '💧', color: '#38BDF8', title: 'Penjaga Samudra',   desc: 'Penghuni laut dalam yang menyedot tenaga lawan lewat arus deras. Hati-hati, energimu bisa terkuras.' },
    ice:     { name: 'Es',       icon: '❄️', color: '#93C5FD', title: 'Raja Salju',        desc: 'Makhluk kutub yang membekukan segalanya. Waktu terasa berjalan lebih cepat saat ia mengamuk.' },
    nature:  { name: 'Hutan',    icon: '🌿', color: '#22C55E', title: 'Roh Rimba',         desc: 'Penjaga hutan lebat berselimut duri beracun. Lukanya terasa lama setelah kamu keliru menjawab.' },
    earth:   { name: 'Tanah',    icon: '🪨', color: '#A16207', title: 'Golem Pegunungan',  desc: 'Sosok batu raksasa yang menghantam dengan keras. Jangan lengah saat ia mulai mengangkat tinjunya!' },
    wind:    { name: 'Angin',    icon: '🌪️', color: '#94A3B8', title: 'Penguasa Topan',    desc: 'Makhluk langit yang berputar secepat badai. Ia suka membuat pemain terburu-buru.' },
    thunder: { name: 'Petir',    icon: '⚡', color: '#FACC15', title: 'Raja Guntur',       desc: 'Monster listrik yang menyambar tanpa ampun. Sengatannya menguras energi dan mengacaukan skill.' },
    shadow:  { name: 'Bayangan', icon: '🌑', color: '#7C3AED', title: 'Hantu Kegelapan',   desc: 'Sosok misterius yang menembus perlindungan. Kutukannya membuat penyembuhan kurang manjur.' },
    light:   { name: 'Cahaya',   icon: '✨', color: '#FDE68A', title: 'Penjaga Kristal',   desc: 'Makhluk bersinar yang menyilaukan mata. Pantulan kristalnya meredam kekuatan combo-mu.' },
    toxic:   { name: 'Racun',    icon: '☠️', color: '#84CC16', title: 'Ratu Rawa Beracun', desc: 'Penguasa rawa berkabut racun. Uap beracunnya melemahkan penyembuhan dan perlindunganmu.' },
  };
  const ELEMENT_ORDER = ['fire', 'water', 'ice', 'nature', 'earth', 'wind', 'thunder', 'shadow', 'light', 'toxic'];
  const KITS = {
    fire:    [ { id: 'fire_rage',     name: 'Amarah Membara',     icon: '🔥', type: 'rage_damage', base: 0.22 },
               { id: 'fire_breath',   name: 'Semburan Api',       icon: '🐉', type: 'charged_strike', every: 5, base: 0.20 },
               { id: 'fire_burn',     name: 'Terbakar',           icon: '♨️', type: 'dot', turns: 2, verb: 'terbakar', base: 0.03 },
               { id: 'fire_inferno',  name: 'Ledakan Inferno',    icon: '🌋', type: 'phase_rage', base: 0.05 } ],
    water:   [ { id: 'water_siphon',  name: 'Arus Penyedot',      icon: '🌀', type: 'energy_siphon' },
               { id: 'water_tide',    name: 'Gelombang Pasang',   icon: '🌊', type: 'charged_strike', every: 6 },
               { id: 'water_drift',   name: 'Hanyut',             icon: '⏳', type: 'time_squeeze', every: 3 },
               { id: 'water_flood',   name: 'Banjir Pelumpuh',    icon: '💦', type: 'heal_curse' } ],
    ice:     [ { id: 'ice_frost',     name: 'Embun Beku',         icon: '🥶', type: 'time_squeeze', every: 3 },
               { id: 'ice_blizzard',  name: 'Badai Salju',        icon: '🌨️', type: 'charged_strike', every: 5 },
               { id: 'ice_crack',     name: 'Retak Es',           icon: '🧊', type: 'combo_seal' },
               { id: 'ice_eternal',   name: 'Beku Abadi',         icon: '❄️', type: 'heal_curse' } ],
    nature:  [ { id: 'nature_thorn',  name: 'Racun Duri',         icon: '🌵', type: 'dot', turns: 2, verb: 'keracunan' },
               { id: 'nature_roots',  name: 'Akar Membelit',      icon: '🌱', type: 'skill_tax' },
               { id: 'nature_spore',  name: 'Serbuk Lelap',       icon: '😴', type: 'time_squeeze', every: 4 },
               { id: 'nature_moss',   name: 'Lumut Penghisap',    icon: '🍄', type: 'heal_curse' } ],
    earth:   [ { id: 'earth_smash',   name: 'Hantaman Batu',      icon: '👊', type: 'charged_strike', every: 4 },
               { id: 'earth_slide',   name: 'Longsor',            icon: '⛰️', type: 'combo_seal' },
               { id: 'earth_quake',   name: 'Gempa Bumi',         icon: '🫨', type: 'energy_siphon' },
               { id: 'earth_collapse',name: 'Runtuhnya Gunung',   icon: '💥', type: 'phase_rage', base: 0.12 } ],
    wind:    [ { id: 'wind_gale',     name: 'Angin Topan',        icon: '💨', type: 'time_squeeze', every: 3 },
               { id: 'wind_slash',    name: 'Tebasan Angin',      icon: '🗡️', type: 'charged_strike', every: 5 },
               { id: 'wind_vortex',   name: 'Pusaran',            icon: '🌀', type: 'combo_seal' },
               { id: 'wind_storm',    name: 'Badai Sempurna',     icon: '🌪️', type: 'energy_siphon' } ],
    thunder: [ { id: 'thunder_shock', name: 'Sengatan',           icon: '⚡', type: 'energy_siphon' },
               { id: 'thunder_bolt',  name: 'Petir Menyambar',    icon: '🌩️', type: 'charged_strike', every: 4 },
               { id: 'thunder_short', name: 'Korsleting',         icon: '🔌', type: 'skill_tax' },
               { id: 'thunder_storm', name: 'Badai Petir',        icon: '⛈️', type: 'phase_rage', base: 0.12 } ],
    shadow:  [ { id: 'shadow_pierce', name: 'Kegelapan Menembus', icon: '🌑', type: 'shield_pierce' },
               { id: 'shadow_claw',   name: 'Cakar Bayangan',     icon: '🦇', type: 'charged_strike', every: 5 },
               { id: 'shadow_curse',  name: 'Kutukan Gelap',      icon: '🔮', type: 'heal_curse' },
               { id: 'shadow_eclipse',name: 'Gerhana',            icon: '🌘', type: 'time_squeeze', every: 3 } ],
    light:   [ { id: 'light_glare',   name: 'Silau',              icon: '😵‍💫', type: 'time_squeeze', every: 4 },
               { id: 'light_beam',    name: 'Sinar Penghancur',   icon: '☀️', type: 'charged_strike', every: 5, base: 0.25 },
               { id: 'light_mirror',  name: 'Pantulan Kristal',   icon: '💎', type: 'combo_seal' },
               { id: 'light_dawn',    name: 'Fajar Murka',        icon: '🌅', type: 'rage_damage', base: 0.15 } ],
    toxic:   [ { id: 'toxic_gas',     name: 'Gas Beracun',        icon: '☠️', type: 'dot', turns: 3, verb: 'keracunan', base: 0.05 },
               { id: 'toxic_fog',     name: 'Kabut Racun',        icon: '🌫️', type: 'heal_curse' },
               { id: 'toxic_acid',    name: 'Semprotan Asam',     icon: '🧪', type: 'shield_pierce' },
               { id: 'toxic_plague',  name: 'Wabah',              icon: '🦠', type: 'skill_tax' } ],
  };

  /* ---------- Pemetaan tema habitat → elemen (WAJIB diaudit/diisi eksplisit di T-00; kata kunci hanya cadangan) ---------- */
  const THEME_ELEMENT = {};   // contoh: { gunung_api: 'fire', laut: 'water', ... }  ← isi sesuai 10 kunci tema nyata di monsters.js/story.js
  const KEYWORDS = [          // urutan penting: yang lebih spesifik lebih dulu
    ['fire', ['api', 'lava', 'volkan', 'vulkan', 'magma', 'berapi', 'fire']], ['ice', ['salju', 'kutub', 'beku', 'glasial', 'snow', 'ice', 'es']],
    ['water', ['laut', 'samudra', 'sungai', 'danau', 'pantai', 'air', 'ocean', 'sea']], ['nature', ['hutan', 'rimba', 'taman', 'kebun', 'forest', 'jungle']],
    ['thunder', ['petir', 'guntur', 'badai', 'listrik', 'thunder', 'storm']], ['wind', ['angin', 'langit', 'awan', 'udara', 'sky', 'wind']],
    ['shadow', ['bayang', 'malam', 'gelap', 'kuburan', 'shadow', 'night']], ['light', ['cahaya', 'kristal', 'surya', 'matahari', 'bintang', 'light', 'crystal']],
    ['toxic', ['racun', 'rawa', 'lumpur', 'toxic', 'swamp']], ['earth', ['tanah', 'batu', 'gua', 'gunung', 'tambang', 'gurun', 'bumi', 'earth', 'cave', 'desert']],
  ];
  function elementForTheme(themeKey) {
    const k = String(themeKey || '').toLowerCase();
    if (THEME_ELEMENT[k]) return THEME_ELEMENT[k];
    for (const [el, words] of KEYWORDS) if (words.some((w) => k.includes(w))) return el;
    return null;
  }
  // Kebalikannya: kunci tema pertama yang dipetakan ke elemen (dipakai Dex untuk memilih gambar monster); null bila belum ada.
  const themeForElement = (el) => Object.keys(THEME_ELEMENT).find((k) => THEME_ELEMENT[k] === el) || null;
  function validateThemeMap(themeKeys) {   // dipakai T-00/tes: tiap tema harus punya elemen; idealnya 1 tema = 1 elemen
    const mapping = {}; const missing = []; const seen = {}; const duplicates = [];
    for (const t of themeKeys) { const el = elementForTheme(t); if (!el) { missing.push(t); continue; } mapping[t] = el; if (seen[el]) duplicates.push(el); seen[el] = true; }
    return { ok: !missing.length && !duplicates.length, mapping, missing, duplicates };
  }

  /* ---------- Nilai efek ---------- */
  const scale = (tier, brutal) => (TIER_POWER[tier] || 1) * (brutal ? BRUTAL.skillMult : 1);
  function effectValue(skill, tier, brutal) { const a = ARCH[skill.type]; return Math.min(a.cap, (skill.base == null ? a.base : skill.base) * scale(tier, brutal)); }
  const skillsFor = (element, tier) => (KITS[element] || []).slice(0, SKILL_COUNT[tier] || 1);
  const every = (s) => s.every || 1;
  const hasSkill = (skills, type) => skills.filter((s) => s.type === type);

  /* ---------- Hook server ---------- */
  const newFx = () => ({ dotTurns: 0, dotFrac: 0, dotSkill: null });
  // Peringatan jurus untuk soal ke-idx (1-based). Deterministik → tanpa state tambahan; dihitung ulang saat menjawab.
  function telegraphFor(o) {
    let best = null;
    for (const s of hasSkill(skillsFor(o.element, o.tier), 'charged_strike')) {
      if (o.idx % every(s) !== 0) continue;
      const v = effectValue(s, o.tier, o.brutal); const m = 1 + v;
      if (!best || m > best.mult) best = { skillId: s.id, name: s.name, icon: s.icon, mult: m, every: s.every };
    }
    return best;
  }
  // Dipanggil saat sebuah soal DISAJIKAN. o: { element,tier,brutal,idx,fx,monsterDamage,playerHp }
  function onQuestionStart(o) {
    const skills = skillsFor(o.element, o.tier); const fx = Object.assign(newFx(), o.fx); const events = []; let dotDamage = 0;
    if (fx.dotTurns > 0) {
      dotDamage = clamp(Math.ceil(o.monsterDamage * fx.dotFrac), 0, Math.max(0, o.playerHp - 1));   // DoT tidak pernah mengalahkan pemain
      fx.dotTurns -= 1; if (dotDamage > 0) events.push({ type: 'dot', skillId: fx.dotSkill, damage: dotDamage });
      if (fx.dotTurns === 0) { fx.dotFrac = 0; fx.dotSkill = null; }
    }
    let timeMult = 1;
    for (const s of hasSkill(skills, 'time_squeeze')) if (o.idx % every(s) === 0) { const v = effectValue(s, o.tier, o.brutal); timeMult *= 1 - v; events.push({ type: 'time', skillId: s.id, pct: Math.round(v * 100) }); }
    timeMult = Math.max(LIMITS.minTimeMult, timeMult);
    const telegraph = telegraphFor(o); if (telegraph) events.push({ type: 'telegraph', skillId: telegraph.skillId, mult: telegraph.mult });
    return { fx, dotDamage, telegraph, timeMult, events };
  }
  // Waktu akhir (dtk) dengan lantai pengaman.
  const applyTime = (baseSec, timeMult) => (timeMult >= 1 ? baseSec : Math.max(Math.min(baseSec, LIMITS.minTimeSec), Math.round(baseSec * timeMult)));
  // Dipanggil saat jawaban SALAH. o: { element,tier,brutal,idx,phase,bossHpRatio,baseDamage,playerMaxHp,energy,fx }
  function onWrong(o) {
    const skills = skillsFor(o.element, o.tier); const fx = Object.assign(newFx(), o.fx); const events = []; let mult = 1; let shieldMult = 1; let energyLoss = 0;
    for (const s of skills) {
      const v = effectValue(s, o.tier, o.brutal);
      if (s.type === 'rage_damage') { const m = 1 + v * (1 - clamp(o.bossHpRatio, 0, 1)); if (m > 1.001) { mult *= m; events.push({ type: 'rage', skillId: s.id, mult: m }); } }
      else if (s.type === 'phase_rage' && o.phase === 2) { mult *= 1 + v; events.push({ type: 'phase_rage', skillId: s.id, mult: 1 + v }); }
      else if (s.type === 'shield_pierce') { shieldMult *= 1 - v; }
      else if (s.type === 'energy_siphon' && o.energy > 0) { energyLoss = Math.max(energyLoss, Math.min(o.energy, Math.max(1, Math.ceil(o.energy * v)))); }
      else if (s.type === 'dot') { fx.dotTurns = s.turns || 2; fx.dotFrac = v; fx.dotSkill = s.id; events.push({ type: 'dot_start', skillId: s.id, turns: fx.dotTurns }); }
    }
    const tg = telegraphFor(o); if (tg) { mult *= tg.mult; events.push({ type: 'charged_hit', skillId: tg.skillId, mult: tg.mult }); }
    mult = Math.min(mult, LIMITS.maxDamageMult);
    const damage = Math.min(Math.ceil(o.baseDamage * mult), Math.ceil(o.playerMaxHp * LIMITS.maxHitPct));
    if (energyLoss > 0) events.push({ type: 'energy', skillId: (hasSkill(skills, 'energy_siphon')[0] || {}).id, amount: energyLoss });
    return { damage: Math.max(1, damage), shieldMult, energyLoss, fx, events };
  }
  // Pengubah sisi-skill pemain. o: { element,tier,brutal,phase }
  function playerMods(o) {
    const skills = skillsFor(o.element, o.tier); let healMult = 1, comboBonusMult = 1, extraCost = 0;
    for (const s of skills) {
      const v = effectValue(s, o.tier, o.brutal);
      if (s.type === 'heal_curse') healMult *= 1 - v;
      else if (s.type === 'combo_seal') comboBonusMult *= 1 - v;
      else if (s.type === 'skill_tax' && o.phase === 2) extraCost = Math.max(extraCost, Math.ceil(v));
    }
    return { healMult: Math.max(0.2, healMult), comboBonusMult: Math.max(0.1, comboBonusMult), extraCost };
  }

  /* ---------- Mode Brutal ---------- */
  const brutalAvailable = (level) => BRUTAL.enabled && (level | 0) >= BRUTAL.minLevel;
  const brutalRewardMult = (brutal) => (brutal ? BRUTAL.rewardMult : 1);   // dikalikan di atas pengali tier v6 (Progression.rewardMult)

  /* ---------- Teks (Monster Dex & banner) ---------- */
  function describeSkill(skill, tier, brutal) {
    const a = ARCH[skill.type]; return { id: skill.id, name: skill.name, icon: skill.icon, type: skill.type, text: a.text(effectValue(skill, tier, brutal), skill) };
  }
  const TIER_LINE = {
    common: () => 'Tier Common — 1 skill, efek dasar.',
    rare:   () => `Tier Rare — 2 skill, efek ×${fmt(TIER_POWER.rare, 2)} lebih kuat.`,
    epic:   () => `Tier Epic — 3 skill, efek ×${fmt(TIER_POWER.epic, 2)} lebih kuat.`,
    legend: () => `Tier Legend — 4 skill, efek ×${fmt(TIER_POWER.legend, 2)} lebih kuat.`,
  };
  function dexEntries() {
    const out = [];
    for (const el of ELEMENT_ORDER) for (const tier of TIERS) {
      const e = ELEMENTS[el];
      out.push({ id: `${el}:${tier}`, element: el, elementName: e.name, icon: e.icon, color: e.color, tier, tierLabel: RARITY_LABEL[tier], title: e.title,
        description: `${e.desc} ${TIER_LINE[tier]()}`,
        skills: skillsFor(el, tier).map((s) => ({ ...describeSkill(s, tier, false), textBrutal: describeSkill(s, tier, true).text })) });
    }
    return out;
  }

  /* ---------- Teks event (banner / toast) — sumber tunggal untuk klien ---------- */
  const SKILL_INDEX = {}; for (const el of ELEMENT_ORDER) for (const sk of KITS[el]) SKILL_INDEX[sk.id] = sk;
  function describeEvent(ev) {
    const sk = SKILL_INDEX[ev.skillId] || { name: 'Skill boss', icon: '✨' };
    switch (ev.type) {
      case 'telegraph':   return { kind: 'warn',   icon: '⚠️', text: `${sk.name}! Jawab BENAR untuk menghindar — jika salah, damage ×${fmt(ev.mult, 2)}.` };
      case 'charged_hit': return { kind: 'hit',    icon: sk.icon, text: `${sk.name} mengenaimu! Damage ×${fmt(ev.mult, 2)}.` };
      case 'rage':        return { kind: 'hit',    icon: sk.icon, text: `${sk.name}: damage ×${fmt(ev.mult, 2)} karena darah boss makin sedikit.` };
      case 'phase_rage':  return { kind: 'hit',    icon: sk.icon, text: `${sk.name}: boss sedang marah, damage ×${fmt(ev.mult, 2)}.` };
      case 'dot_start':   return { kind: 'status', icon: sk.icon, text: `${sk.name}: kamu terkena efek selama ${ev.turns} soal.` };
      case 'dot':         return { kind: 'hit',    icon: sk.icon, text: `${sk.name}: darahmu berkurang ${ev.damage}.` };
      case 'time':        return { kind: 'status', icon: sk.icon, text: `${sk.name}: waktu soal ini berkurang ${ev.pct}%.` };
      case 'energy':      return { kind: 'status', icon: sk.icon, text: `${sk.name}: energimu tersedot ${ev.amount} ⚡.` };
      default:            return { kind: 'info',   icon: '✨', text: '' };
    }
  }

  return { TIERS, TIER_POWER, SKILL_COUNT, BRUTAL, LIMITS, RARITY_LABEL, ARCH, ELEMENTS, ELEMENT_ORDER, KITS, THEME_ELEMENT, KEYWORDS,
    elementForTheme, themeForElement, validateThemeMap, scale, effectValue, skillsFor, newFx, telegraphFor, onQuestionStart, applyTime, onWrong, playerMods,
    brutalAvailable, brutalRewardMult, describeSkill, describeEvent, dexEntries, SKILL_INDEX };
});
```

## Lampiran B — `lib/bossfx.js` (salin persis; perekat server, murni terhadap objek `row`)
```js
/* lib/bossfx.js — perekat server untuk skill boss & Mode Brutal. Murni terhadap objek `row` (baris game_sessions); TIDAK menyentuh DB.
   Pemanggil (lib/db.js) memuat row, memanggil fungsi di sini, lalu menulis `update` ke DB dalam transaksi yang sama dengan efek lain. */
'use strict';
const B = require('../shared/bossskills.js');
const parse = (s) => { try { return Object.assign(B.newFx(), JSON.parse(s || '{}')); } catch (_) { return B.newFx(); } };
const active = (row) => !!(row && row.boss_element && row.boss_tier);          // sesi lama (kolom NULL) → tanpa skill boss
const ctxOf = (row) => ({ element: row.boss_element, tier: row.boss_tier, brutal: !!row.brutal, phase: row.boss_phase || 1 });

// 1) Saat sesi DIBUAT → kolom baru untuk INSERT. themeKey = subjects.monster_theme; level = level profil.
function startFields({ themeKey, brutal, level }) {
  const element = B.elementForTheme(themeKey);                                   // null = tema belum terpetakan → tanpa skill (jangan gagal)
  const useBrutal = !!brutal && B.brutalAvailable(level) && !!element;
  return { boss_element: element, brutal: useBrutal ? 1 : 0, boss_fx_json: JSON.stringify(B.newFx()) };
}

// 2) Saat soal ke-idx (1-based) DISAJIKAN (start / next / resume). IDEMPOTEN: menyajikan ulang soal yang sama tidak memotong DoT dua kali.
function onServeQuestion(row, idx, baseTimeSec) {
  if (!active(row)) return { update: null, telegraph: null, timeMult: 1, timeLimitSec: baseTimeSec, dotDamage: 0, events: [] };
  const fx = parse(row.boss_fx_json); const again = fx.servedIdx === idx;
  const r = B.onQuestionStart({ ...ctxOf(row), idx, fx: again ? { ...fx, dotTurns: 0 } : fx, monsterDamage: row.monster_damage || 1, playerHp: row.player_hp });
  const dotDamage = again ? 0 : r.dotDamage;
  const nextFx = again ? fx : { ...r.fx, servedIdx: idx };
  const events = again ? r.events.filter((e) => e.type !== 'dot') : r.events;
  return { update: again ? null : { boss_fx_json: JSON.stringify(nextFx), player_hp: Math.max(1, row.player_hp - dotDamage) },
           telegraph: r.telegraph, timeMult: r.timeMult, timeLimitSec: B.applyTime(baseTimeSec, r.timeMult), dotDamage, events };
}

// 3) Saat jawaban SALAH. Mengembalikan damage final ke pemain (SEBELUM perisai), pengali perisai, energi tersedot, dan fx baru.
function onWrongAnswer(row, idx, energy) {
  const base = row.monster_damage || 1;
  if (!active(row)) return { damage: base, shieldMult: 1, energyLoss: 0, update: null, events: [] };
  const r = B.onWrong({ ...ctxOf(row), idx, bossHpRatio: row.boss_max_hp ? row.boss_hp / row.boss_max_hp : 1, baseDamage: base,
                         playerMaxHp: row.player_max_hp || 100, energy, fx: { ...parse(row.boss_fx_json) } });
  return { damage: r.damage, shieldMult: r.shieldMult, energyLoss: r.energyLoss, update: { boss_fx_json: JSON.stringify({ ...parse(row.boss_fx_json), ...r.fx }) }, events: r.events };
}

// 4) Pengubah untuk skill pemain: healMult, comboBonusMult (→ Progression.hitDamage), extraCost (+energi; tampil di skills[].cost & divalidasi server).
function skillMods(row) { return active(row) ? B.playerMods(ctxOf(row)) : { healMult: 1, comboBonusMult: 1, extraCost: 0 }; }

// 5) Hadiah: pengali Mode Brutal di ATAS pengali tier v6 (Progression.rewardMult(tier)). Panggil di SETIAP titik koin/XP sesi.
function rewardMult(row, tierMult) { const b = B.brutalRewardMult(!!(row && row.brutal)); return { coin: tierMult.coin * b, xp: tierMult.xp * b }; }

// 6) Ringkasan untuk respons API (start/answer/resume).
function publicView(row) {
  if (!active(row)) return { element: null, brutal: false, skills: [] };
  const sk = B.skillsFor(row.boss_element, row.boss_tier).map((s) => B.describeSkill(s, row.boss_tier, !!row.brutal));
  const el = B.ELEMENTS[row.boss_element]; return { element: row.boss_element, elementName: el.name, elementIcon: el.icon, title: el.title, brutal: !!row.brutal, skills: sk };
}
module.exports = { startFields, onServeQuestion, onWrongAnswer, skillMods, rewardMult, publicView, active };
```

## Lampiran C — `public/js/dexcards.js` (salin persis; kartu Monster Dex 1 baris 1 kartu + CSS)
```js
/* public/js/dexcards.js — kartu Monster Dex: SATU kartu per BARIS (lebar penuh) agar deskripsi & skill terbaca utuh, seperti kartu skin.
   Murni pembangun string HTML (bisa diuji di Node). Seni monster disuntik lewat opsi `art(entry)` → string SVG dari monsters.js. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DexCards = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TIER_ICON = { common: '⚪', rare: '🔵', epic: '🟣', legend: '🟡' };
  // entry: dari BossSkills.dexEntries(); prog: { defeated, brutalDefeated } | undefined; opts: { brutal, art(entry) }
  function renderCard(entry, prog, opts) {
    const o = opts || {}; const p = prog || {}; const brutal = !!o.brutal;
    const skills = entry.skills.map((s) => `
      <li class="dex-skill" data-testid="dex-skill-${esc(s.id)}">
        <span class="dex-skill-ico" aria-hidden="true">${esc(s.icon)}</span>
        <div class="dex-skill-body"><b class="dex-skill-name">${esc(s.name)}</b><p class="dex-skill-text">${esc(brutal ? s.textBrutal : s.text)}</p></div>
      </li>`).join('');
    const stats = `Dikalahkan ${p.defeated | 0}× · Mode Brutal ${p.brutalDefeated | 0}×`;
    return `
    <article class="dex-card dex-tier-${esc(entry.tier)}${brutal ? ' dex-brutal' : ''}" style="--el:${esc(entry.color)}" data-testid="dex-card-${esc(entry.id)}">
      <header class="dex-head">
        <div class="dex-art" aria-hidden="true">${o.art ? o.art(entry) : esc(entry.icon)}</div>
        <div class="dex-title">
          <h3 class="dex-name">${esc(entry.title)}</h3>
          <div class="dex-badges"><span class="dex-badge dex-el">${esc(entry.icon)} ${esc(entry.elementName)}</span><span class="dex-badge dex-tier">${TIER_ICON[entry.tier] || ''} ${esc(entry.tierLabel)}</span>${brutal ? '<span class="dex-badge dex-brutal-badge">💀 Brutal ×2</span>' : ''}</div>
          <div class="dex-stats">${esc(stats)}</div>
        </div>
      </header>
      <p class="dex-desc">${esc(entry.description)}</p>
      <h4 class="dex-sub">Skill boss (${entry.skills.length})</h4>
      <ul class="dex-skills">${skills}
      </ul>
    </article>`;
  }
  // list: array entry; progress: { 'fire:legend': {defeated,brutalDefeated} }; filter: { element, tier }
  function renderList(list, progress, opts) {
    const f = (opts && opts.filter) || {};
    const rows = list.filter((e) => (!f.element || e.element === f.element) && (!f.tier || e.tier === f.tier));
    if (!rows.length) return '<p class="dex-empty" data-testid="dex-empty">Tidak ada monster untuk filter ini.</p>';
    return `<div class="dex-list" data-testid="dex-list">${rows.map((e) => renderCard(e, (progress || {})[e.id], opts)).join('')}</div>`;
  }
  const CSS = `
.dex-list{display:grid;grid-template-columns:1fr;gap:12px}              /* SELALU 1 kolom: 1 baris = 1 kartu, juga di layar lebar */
.dex-card{width:100%;box-sizing:border-box;padding:14px;border-radius:16px;border:2px solid var(--el);background:var(--card-bg,#fff);color:var(--text,#1f2937);overflow:visible}
.dex-head{display:flex;gap:12px;align-items:center}
.dex-art{flex:0 0 76px;width:76px;height:76px}.dex-art svg{width:100%;height:100%}
.dex-title{min-width:0;flex:1}
.dex-name{margin:0;font-size:1.05rem;line-height:1.25;overflow-wrap:anywhere}
.dex-badges{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}
.dex-badge{font-size:.8rem;font-weight:700;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--el) 18%,transparent);border:1px solid var(--el)}
.dex-stats{font-size:.8rem;opacity:.8}
.dex-desc{margin:10px 0 6px;font-size:.95rem;line-height:1.5;overflow-wrap:anywhere}      /* teks tampil UTUH: tidak ada pemotongan baris */
.dex-sub{margin:10px 0 6px;font-size:.9rem}
.dex-skills{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.dex-skill{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:12px;background:color-mix(in srgb,var(--el) 8%,transparent)}
.dex-skill-ico{flex:0 0 28px;font-size:1.3rem;line-height:1.2;text-align:center}
.dex-skill-body{min-width:0;flex:1}.dex-skill-name{font-size:.95rem}
.dex-skill-text{margin:2px 0 0;font-size:.9rem;line-height:1.45;overflow-wrap:anywhere}
.dex-tier-rare{box-shadow:0 0 0 2px #3B82F633}.dex-tier-epic{box-shadow:0 0 12px #A855F755}.dex-tier-legend{box-shadow:0 0 16px #F59E0B88}
.dex-brutal{border-color:#DC2626;background:linear-gradient(180deg,#fee2e2 0,var(--card-bg,#fff) 40%)}
.dex-brutal-badge{background:#DC2626;color:#fff;border-color:#DC2626}
@media (prefers-reduced-motion:no-preference){.dex-tier-legend{animation:dexGlow 2.4s ease-in-out infinite alternate}}
@keyframes dexGlow{from{box-shadow:0 0 8px #F59E0B55}to{box-shadow:0 0 18px #F59E0Bcc}}`;
  return { renderCard, renderList, CSS, esc };
});
```

## Lampiran D — Patch kecil v6: `Progression.hitDamage` menerima `comboBonusMult`
Di `shared/progression.js` (v6, fungsi `hitDamage`), **ganti satu baris ini**:
```js
    const mult = clamp(comboMult(o.comboStreak | 0) * pity * Math.max(1, o.powerMult || 1), 1, HIT_CAP_MULT);
```
**dengan tiga baris ini:**
```js
    const bonusKeep = clamp(o.comboBonusMult == null ? 1 : o.comboBonusMult, 0, 1);   // skill boss "combo_seal" mengurangi BONUS combo saja (damage dasar tetap)
    const combo = 1 + (comboMult(o.comboStreak | 0) - 1) * bonusKeep;
    const mult = clamp(combo * pity * Math.max(1, o.powerMult || 1), 1, HIT_CAP_MULT);
```
Lalu di `tests/progression.test.js` (tes `D: damage — lantai 1 hit, …`), **tambahkan dua baris** setelah assertion `powerMult: 0.5`:
```js
  assert.equal(P.hitDamage({ comboStreak: 9, wrongStreak: 0, comboBonusMult: 0 }).damage, 20);     // combo disegel → tetap 1 hit (lantai)
  assert.equal(P.hitDamage({ comboStreak: 9, wrongStreak: 0, comboBonusMult: 0.5 }).damage, 23);   // bonus combo 30% → 15%
```

## Lampiran E — `scripts/sim-bossfx.js` (salin persis; simulasi keseimbangan 10 elemen × 4 tier × normal/Brutal)
```js
#!/usr/bin/env node
// scripts/sim-bossfx.js — simulasi keseimbangan skill boss per elemen × tier × (normal|brutal). Tanpa DB. Jalankan: node scripts/sim-bossfx.js
const P = require('../shared/progression.js'); const B = require('../shared/bossskills.js');
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// Model pemain: akurasi dasar `acc`; soal "waktu dikurangi" menurunkan akurasi (setengah dari persentase pengurangan waktu). Pemain TIDAK memakai skill (kasus terburuk).
function battle(element, tier, brutal, acc, rand, ability = 50, playerMaxHp = 100) {
  const st = P.bossStats(tier, ability, playerMaxHp);
  let bossHp = st.bossMaxHp, hp = playerMaxHp, streak = 0, wrongStreak = 0, correct = 0, q = 0, phase = 1, fx = B.newFx(), fatigued = false;
  while (q < st.maxQuestions) {
    q++;
    const qs = B.onQuestionStart({ element, tier, brutal, idx: q, phase, fx, monsterDamage: st.monsterDamage, playerHp: hp });
    fx = qs.fx; hp -= qs.dotDamage;
    const pEff = acc * (1 - 0.5 * (1 - qs.timeMult));
    if (rand() < pEff) {
      correct++; streak++;
      const mods = B.playerMods({ element, tier, brutal, phase });
      const dmg = P.hitDamage({ comboStreak: streak, powerMult: 1, wrongStreak, comboBonusMult: mods.comboBonusMult }).damage;
      bossHp = P.applyBossDamage(bossHp, dmg, correct); wrongStreak = 0;
      if (bossHp <= 0) return { win: true, q, correct, n: st.hitsNeeded, hpLeft: hp };
      if (phase === 1 && bossHp <= st.bossMaxHp / 2) { phase = 2; if (!fatigued) { fatigued = true; bossHp = P.fatigueAdjust({ bossHp, correctCount: correct, answeredCount: q }).bossHp; } }
    } else {
      streak = 0; wrongStreak++;
      const w = B.onWrong({ element, tier, brutal, idx: q, phase, bossHpRatio: bossHp / st.bossMaxHp, baseDamage: st.monsterDamage, playerMaxHp, energy: 5, fx });
      fx = w.fx; hp -= w.damage; if (hp <= 0) return { win: false, q, correct, n: st.hitsNeeded };
    }
  }
  return { win: false, timeout: true, q, correct, n: st.hitsNeeded };
}
function run(element, tier, brutal, acc, runs = 1000) {
  const rand = rng(777 + element.length * 31 + tier.length * 7 + (brutal ? 99 : 0) + Math.round(acc * 100));
  let win = 0, sumQ = 0, bad = 0;
  for (let i = 0; i < runs; i++) { const r = battle(element, tier, brutal, acc, rand); sumQ += r.q; if (r.win) { win++; if (r.correct > r.n || r.correct < 15) bad++; } }
  return { element, tier, brutal, acc, win: win / runs, avgQ: sumQ / runs, bad };
}
if (require.main === module) {
  console.log('Rata-rata menang lintas 10 elemen  [min–maks antar elemen]   (tanpa skill pemain; skor kemampuan 50)');
  console.log('tier    mode     acc50            acc70            acc90');
  for (const tier of P.TIER_ORDER) for (const brutal of [false, true]) {
    const cells = [0.5, 0.7, 0.9].map((acc) => { const rs = B.ELEMENT_ORDER.map((e) => run(e, tier, brutal, acc, 600).win); const avg = rs.reduce((a, b) => a + b, 0) / rs.length; return `${(avg * 100).toFixed(0).padStart(3)}% [${(Math.min(...rs) * 100).toFixed(0)}–${(Math.max(...rs) * 100).toFixed(0)}]`.padEnd(16); });
    console.log(`${tier.padEnd(7)} ${brutal ? 'BRUTAL' : 'normal'}  ${cells.join(' ')}`);
  }
}
module.exports = { battle, run, rng };
```

## Lampiran F — Berkas tes (salin persis)
### F.1 `tests/bossskills.test.js` (15 uji)
```js
// tests/bossskills.test.js — uji unit skill boss per elemen + Mode Brutal + kartu Dex (node --test)
const test = require('node:test'); const assert = require('node:assert/strict');
const B = require('../shared/bossskills.js'); const P = require('../shared/progression.js'); const D = require('../public/js/dexcards.js'); const { run } = require('../scripts/sim-bossfx.js');
const allSkills = () => B.ELEMENT_ORDER.flatMap((e) => B.KITS[e].map((s) => ({ element: e, skill: s })));

test('struktur: 10 elemen × 4 skill, id unik, tipe dikenal', () => {
  assert.equal(B.ELEMENT_ORDER.length, 10);
  for (const e of B.ELEMENT_ORDER) { assert.equal(B.KITS[e].length, 4); assert.ok(B.ELEMENTS[e].desc.length > 20); }
  const ids = allSkills().map((x) => x.skill.id); assert.equal(new Set(ids).size, 40);
  for (const { skill } of allSkills()) assert.ok(B.ARCH[skill.type], skill.id);
});
test('rarity → jumlah skill: common 1, rare 2, epic 3, legend 4', () => {
  for (const e of B.ELEMENT_ORDER) assert.deepEqual(B.TIERS.map((t) => B.skillsFor(e, t).length), [1, 2, 3, 4]);
  assert.deepEqual(B.skillsFor('fire', 'common').map((s) => s.id), ['fire_rage']);                      // skill khas selalu yang pertama
  assert.ok(B.skillsFor('fire', 'legend').every((s, i) => s.id === B.KITS.fire[i].id));                 // tier tinggi ⊇ tier rendah
});
test('rarity → efek makin besar (tidak pernah mengecil)', () => {
  for (const { skill } of allSkills()) { const v = B.TIERS.map((t) => B.effectValue(skill, t, false)); for (let i = 1; i < 4; i++) assert.ok(v[i] > v[i - 1] - 1e-9, skill.id); assert.ok(v[3] > v[0], skill.id); }
});
test('Mode Brutal: efek skill tepat 2× (atau mentok batas pengaman), hadiah 3×', () => {
  for (const { skill } of allSkills()) for (const t of B.TIERS) {
    const n = B.effectValue(skill, t, false), b = B.effectValue(skill, t, true), cap = B.ARCH[skill.type].cap;
    assert.ok(Math.abs(b - 2 * n) < 1e-9 || Math.abs(b - cap) < 1e-9, `${skill.id}/${t}: ${n} → ${b}`);
  }
  assert.equal(B.brutalRewardMult(true), 3); assert.equal(B.brutalRewardMult(false), 1);
  assert.equal(B.brutalAvailable(1), true);
});
test('Api: makin sedikit darah boss, damage ke pemain makin besar (contoh permintaan)', () => {
  const dmg = (r, tier, brutal) => B.onWrong({ element: 'fire', tier, brutal: !!brutal, idx: 1, phase: 1, bossHpRatio: r, baseDamage: 6, playerMaxHp: 100, energy: 5, fx: B.newFx() }).damage;
  for (const t of B.TIERS) { const d = [1, 0.75, 0.5, 0.25, 0.05].map((r) => dmg(r, t)); for (let i = 1; i < d.length; i++) assert.ok(d[i] >= d[i - 1]); }
  assert.equal(dmg(1, 'common'), 6); assert.ok(dmg(0.05, 'common') > 6);
  assert.ok(dmg(0.05, 'legend') > dmg(0.05, 'common'));      // rarity tinggi → lonjakan lebih besar
  assert.ok(dmg(0.05, 'legend', true) > dmg(0.05, 'legend'));   // brutal → lebih besar lagi
});
test('jurus: peringatan tepat tiap-N soal; salah saat jurus = damage lebih besar; benar = tidak ada hukuman', () => {
  const o = (idx) => ({ element: 'fire', tier: 'rare', brutal: false, idx });
  assert.equal(B.telegraphFor(o(5)).skillId, 'fire_breath'); assert.equal(B.telegraphFor(o(4)), null); assert.equal(B.telegraphFor(o(10)).skillId, 'fire_breath');
  const base = { element: 'fire', tier: 'rare', brutal: false, phase: 1, bossHpRatio: 1, baseDamage: 6, playerMaxHp: 100, energy: 5, fx: B.newFx() };
  assert.ok(B.onWrong({ ...base, idx: 5 }).damage > B.onWrong({ ...base, idx: 4 }).damage);
  assert.equal(B.onQuestionStart({ ...o(5), fx: B.newFx(), monsterDamage: 6, playerHp: 100 }).telegraph.skillId, 'fire_breath');
});
test('pengaman: DoT tak membunuh, damage dibatasi, waktu punya lantai', () => {
  let fx = B.onWrong({ element: 'fire', tier: 'epic', brutal: true, idx: 1, phase: 1, bossHpRatio: 1, baseDamage: 9, playerMaxHp: 100, energy: 5, fx: B.newFx() }).fx;
  assert.ok(fx.dotTurns > 0);
  const q = B.onQuestionStart({ element: 'fire', tier: 'epic', brutal: true, idx: 2, fx, monsterDamage: 40, playerHp: 3 }); assert.ok(q.dotDamage <= 2);
  const w = B.onWrong({ element: 'fire', tier: 'legend', brutal: true, idx: 5, phase: 2, bossHpRatio: 0.01, baseDamage: 50, playerMaxHp: 100, energy: 5, fx: B.newFx() }); assert.ok(w.damage <= 50);
  for (const e of B.ELEMENT_ORDER) for (let i = 1; i <= 12; i++) { const r = B.onQuestionStart({ element: e, tier: 'legend', brutal: true, idx: i, fx: B.newFx(), monsterDamage: 6, playerHp: 100 }); assert.ok(r.timeMult >= B.LIMITS.minTimeMult); }
  assert.equal(B.applyTime(20, 0.5), 10); assert.equal(B.applyTime(8, 0.6), 8); assert.equal(B.applyTime(20, 1), 20);
});
test('pengubah sisi pemain: heal_curse, combo_seal, skill_tax hanya Fase 2', () => {
  const m1 = B.playerMods({ element: 'water', tier: 'legend', brutal: false, phase: 1 }); assert.ok(m1.healMult < 1); assert.equal(m1.extraCost, 0);
  assert.ok(B.playerMods({ element: 'ice', tier: 'legend', brutal: false, phase: 1 }).comboBonusMult < 1);
  assert.ok(B.playerMods({ element: 'thunder', tier: 'legend', brutal: false, phase: 2 }).extraCost >= 1); assert.equal(B.playerMods({ element: 'thunder', tier: 'legend', brutal: false, phase: 1 }).extraCost, 0);
  assert.equal(B.playerMods({ element: 'fire', tier: 'common', brutal: false, phase: 2 }).healMult, 1);
  const e = B.onWrong({ element: 'water', tier: 'legend', brutal: false, idx: 1, phase: 1, bossHpRatio: 1, baseDamage: 6, playerMaxHp: 100, energy: 8, fx: B.newFx() }); assert.ok(e.energyLoss >= 1 && e.energyLoss <= 8);
  assert.equal(B.onWrong({ element: 'water', tier: 'legend', brutal: false, idx: 1, phase: 1, bossHpRatio: 1, baseDamage: 6, playerMaxHp: 100, energy: 0, fx: B.newFx() }).energyLoss, 0);
});
test('jaminan v6 utuh: hook skill tidak pernah menyentuh HP boss; comboBonusMult tak membuat damage < 1 hit', () => {
  const w = B.onWrong({ element: 'fire', tier: 'legend', brutal: true, idx: 5, phase: 2, bossHpRatio: 0.2, baseDamage: 6, playerMaxHp: 100, energy: 5, fx: B.newFx() });
  const q = B.onQuestionStart({ element: 'fire', tier: 'legend', brutal: true, idx: 5, fx: B.newFx(), monsterDamage: 6, playerHp: 100 });
  for (const r of [w, q]) assert.ok(!('bossHp' in r) && !('bossDamage' in r));
  assert.equal(P.hitDamage({ comboStreak: 99, wrongStreak: 0, comboBonusMult: 0.1 }).damage >= P.HIT_UNIT, true);
});
test('tema → elemen: pemetaan eksplisit menang, kata kunci cadangan, tema tak dikenal = null', () => {
  assert.equal(B.elementForTheme('Gunung_Api'), 'fire'); assert.equal(B.elementForTheme('kutub_es'), 'ice'); assert.equal(B.elementForTheme('xyz'), null);
  B.THEME_ELEMENT.tema_aneh = 'light'; assert.equal(B.elementForTheme('tema_aneh'), 'light'); delete B.THEME_ELEMENT.tema_aneh;
  const ok = B.validateThemeMap(['gunung_api', 'laut', 'kutub_es', 'hutan', 'gua_batu', 'langit', 'kota_badai', 'malam', 'kristal', 'rawa']); assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.equal(B.validateThemeMap(['xyz']).ok, false);
  B.THEME_ELEMENT.gunung_api = 'fire'; assert.equal(B.themeForElement('fire'), 'gunung_api'); assert.equal(B.themeForElement('water'), null); delete B.THEME_ELEMENT.gunung_api;
});
test('Dex: 40 entri; tiap kartu memuat deskripsi + SEMUA skill; teks lengkap; 1 kartu per baris', () => {
  const list = B.dexEntries(); assert.equal(list.length, 40);
  for (const e of list) { assert.equal(e.skills.length, B.SKILL_COUNT[e.tier]); assert.ok(e.description.length > 30); for (const s of e.skills) { assert.ok(s.text.length > 10 && s.textBrutal.length > 10); assert.ok(!/undefined|NaN/.test(s.text + s.textBrutal)); } }
  const html = D.renderList(list, {}, { brutal: false });
  assert.equal((html.match(/<article class="dex-card/g) || []).length, 40);
  for (const e of list) { assert.ok(html.includes(D.esc(e.description))); for (const s of e.skills) assert.ok(html.includes(D.esc(s.text))); }
  assert.ok(!/line-clamp|text-overflow:\s*ellipsis|-webkit-box/.test(D.CSS));                          // teks tidak dipotong
  assert.ok(/grid-template-columns:1fr;/.test(D.CSS));                                               // 1 kolom
  assert.ok(D.renderCard(list[3], {}, { brutal: true }).includes(D.esc(list[3].skills[0].textBrutal)));   // pratinjau Brutal
  assert.ok(D.renderList(list, {}, { filter: { element: 'fire', tier: 'epic' } }).includes('dex-card-fire:epic'));
  assert.ok(D.renderCard({ ...list[0], title: '<img onerror=x>' }, {}, {}).includes('&lt;img'));       // XSS aman
});
test('event → teks Indonesia', () => {
  for (const ev of [{ type: 'telegraph', skillId: 'fire_breath', mult: 1.5 }, { type: 'charged_hit', skillId: 'fire_breath', mult: 1.5 }, { type: 'rage', skillId: 'fire_rage', mult: 1.3 }, { type: 'phase_rage', skillId: 'fire_inferno', mult: 1.1 },
    { type: 'dot_start', skillId: 'fire_burn', turns: 2 }, { type: 'dot', skillId: 'fire_burn', damage: 3 }, { type: 'time', skillId: 'ice_frost', pct: 8 }, { type: 'energy', skillId: 'water_siphon', amount: 2 }]) { const d = B.describeEvent(ev); assert.ok(d.text.length > 8 && !/undefined|NaN/.test(d.text)); }
});
test('simulasi keseimbangan (kasus terburuk: pemain tanpa skill) — pita penerimaan', () => {
  const avg = (tier, brutal, acc) => { const r = B.ELEMENT_ORDER.map((e) => run(e, tier, brutal, acc, 400)); r.forEach((x) => assert.equal(x.bad, 0, `${x.element}/${tier}: menang di luar 15–N`)); const w = r.map((x) => x.win); return { avg: w.reduce((a, b) => a + b, 0) / w.length, min: Math.min(...w) }; };
  const c = avg('common', false, 0.7), r = avg('rare', false, 0.7), e = avg('epic', false, 0.7), l = avg('legend', false, 0.7), lb = avg('legend', true, 0.7);
  assert.ok(c.avg >= 0.92 && c.min >= 0.80); assert.ok(r.avg >= 0.84 && r.min >= 0.72); assert.ok(e.avg >= 0.77 && e.min >= 0.50); assert.ok(l.avg >= 0.54 && l.min >= 0.28); assert.ok(lb.avg >= 0.31 && lb.min >= 0.10);
  assert.ok(l.avg > lb.avg);                                                                       // Brutal memang lebih sulit
  for (const t of B.TIERS) for (const br of [false, true]) { const x = avg(t, br, 0.9); assert.ok(x.avg >= 0.97 && x.min >= 0.88, `${t}/${br} @90%`); }
});
```
### F.2 `tests/bossfx.glue.test.js`
```js
// tests/bossfx.glue.test.js — uji perekat server (tanpa DB)
const test = require('node:test'); const assert = require('node:assert/strict');
const F = require('../lib/bossfx.js'); const B = require('../shared/bossskills.js');
const mkRow = (o) => ({ boss_element: 'fire', boss_tier: 'epic', brutal: 0, boss_phase: 1, boss_hp: 300, boss_max_hp: 400, monster_damage: 6, player_hp: 80, player_max_hp: 100, boss_fx_json: JSON.stringify(B.newFx()), ...o });

test('startFields: elemen dari tema, Brutal hanya bila tersedia & tema terpetakan, tema tak dikenal tidak menggagalkan sesi', () => {
  assert.deepEqual({ ...F.startFields({ themeKey: 'gunung_api', brutal: true, level: 1 }), boss_fx_json: 0 }, { boss_element: 'fire', brutal: 1, boss_fx_json: 0 });
  assert.equal(F.startFields({ themeKey: 'gunung_api', brutal: false, level: 9 }).brutal, 0);
  const none = F.startFields({ themeKey: 'tidak-dikenal', brutal: true, level: 9 }); assert.equal(none.boss_element, null); assert.equal(none.brutal, 0);
  const old = B.BRUTAL.minLevel; B.BRUTAL.minLevel = 5; assert.equal(F.startFields({ themeKey: 'laut', brutal: true, level: 4 }).brutal, 0); assert.equal(F.startFields({ themeKey: 'laut', brutal: true, level: 5 }).brutal, 1); B.BRUTAL.minLevel = old;
});
test('sesi lama (kolom NULL): semua hook netral', () => {
  const row = mkRow({ boss_element: null, boss_tier: null });
  assert.equal(F.active(row), false); assert.equal(F.onServeQuestion(row, 5, 20).timeLimitSec, 20); assert.equal(F.onWrongAnswer(row, 5, 3).damage, 6);
  assert.deepEqual(F.skillMods(row), { healMult: 1, comboBonusMult: 1, extraCost: 0 }); assert.deepEqual(F.publicView(row).skills, []);
});
test('salah → fx tersimpan; soal berikutnya memotong DoT; menyajikan ulang soal yang sama (resume) TIDAK memotong dua kali', () => {
  let row = mkRow({ boss_tier: 'legend', brutal: 1 });
  const w = F.onWrongAnswer(row, 2, 5); assert.ok(w.damage > 6 && w.update); row = { ...row, ...w.update, player_hp: row.player_hp - w.damage };
  assert.ok(JSON.parse(row.boss_fx_json).dotTurns > 0);
  const hpBefore = row.player_hp; const s1 = F.onServeQuestion(row, 3, 20); assert.ok(s1.dotDamage > 0); assert.equal(s1.update.player_hp, Math.max(1, hpBefore - s1.dotDamage));
  const row2 = { ...row, ...s1.update }; const s2 = F.onServeQuestion(row2, 3, 20);              // reload halaman → soal 3 disajikan lagi
  assert.equal(s2.dotDamage, 0); assert.equal(s2.update, null);
  const s3 = F.onServeQuestion(row2, 4, 20); assert.ok(s3.update);                                // soal 4 → giliran DoT berikutnya
});
test('jurus muncul sebagai telegraph pada soal kelipatan-N dan dihitung ulang saat menjawab', () => {
  const row = mkRow({ boss_tier: 'rare' }); const s = F.onServeQuestion(row, 5, 20); assert.equal(s.telegraph.skillId, 'fire_breath');
  assert.ok(F.onWrongAnswer(row, 5, 3).damage > F.onWrongAnswer(row, 4, 3).damage);
});
test('hadiah: pengali tier × 3 saat Brutal; skillMods mengikuti fase; publicView memuat skill sesuai rarity', () => {
  assert.deepEqual(F.rewardMult(mkRow({ brutal: 1 }), { coin: 1.7, xp: 1.5 }), { coin: 1.7 * 3, xp: 1.5 * 3 }); assert.deepEqual(F.rewardMult(mkRow({}), { coin: 1.7, xp: 1.5 }), { coin: 1.7, xp: 1.5 });
  assert.equal(F.skillMods(mkRow({ boss_element: 'thunder', boss_tier: 'legend', boss_phase: 2 })).extraCost >= 1, true);
  assert.equal(F.publicView(mkRow({ boss_tier: 'common' })).skills.length, 1); assert.equal(F.publicView(mkRow({ boss_tier: 'legend' })).skills.length, 4); assert.equal(F.publicView(mkRow({ brutal: 1 })).brutal, true);
});
test('DoT tak pernah membuat HP pemain < 1', () => {
  let row = mkRow({ boss_tier: 'legend', brutal: 1, player_hp: 2, monster_damage: 40 });
  row = { ...row, ...F.onWrongAnswer(row, 1, 5).update }; const s = F.onServeQuestion(row, 2, 20); assert.ok(s.update.player_hp >= 1);
});
```
Jalankan: `node --test tests/*.test.js`.

## Lampiran G — `scripts/progress.mjs` (pengelola ceklis; salin persis, sudah diuji; default `docs/PROGRESS-v7.md`)
```js
#!/usr/bin/env node
// scripts/progress.mjs — pengelola ceklis docs/PROGRESS-v7.md (tanpa dependensi). Jalankan: npm run progress -- <perintah>
import fs from 'node:fs';
import path from 'node:path';

const FILE = process.env.PROGRESS_FILE || 'docs/PROGRESS-v7.md';
const MAX_TRIES = 2;                                   // percobaan maks per tugas sebelum wajib diblokir
const LINE = /^- \[([ ~x!])\] \*\*((?:T|G)-\d+)\*\*/;
const die = (m) => { console.error('✖ ' + m); process.exit(1); };
const read = () => { if (!fs.existsSync(FILE)) die(`${FILE} belum ada. Jalankan: npm run progress -- init <file-dokumen-v7.md>`); return fs.readFileSync(FILE, 'utf8').split('\n'); };
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
    if (!a1) die('Pakai: init <file-dokumen-v7.md>');
    if (fs.existsSync(FILE)) die(`${FILE} sudah ada — JANGAN ditimpa. Pakai: status / next (atau sync <doc> bila dokumen diperbarui)`);
    const body = templateBody(a1);
    fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, body); console.log(`✔ ${FILE} dibuat.`); status(read()); break;
  }
  case 'sync': {   // tambahkan tugas BARU dari dokumen yang diperbarui; tugas lama (apa pun statusnya) tidak disentuh
    if (!a1) die('Pakai: sync <file-dokumen-v7.md>');
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

## Lampiran H — Template `docs/PROGRESS-v7.md` (dibuat otomatis oleh `npm run progress -- init docs/FITUR-v7.md`)
Baris penanda template di bawah (diawali dan diakhiri `@@`) hanyalah penanda untuk perintah `init`; jangan dihapus.
````markdown
@@TEMPLATE-START@@
# PROGRESS — Fitur v7 (Skill Boss per Elemen, Rarity Skill, Mode Brutal, Kartu Monster Dex)
> File ini adalah **satu-satunya sumber kebenaran** status pekerjaan. Baca di awal setiap giliran. Ubah status HANYA lewat `npm run progress -- …` (jangan edit centang manual).

## HANDOFF (diperbarui agent sebelum iterasi habis)
<!--HANDOFF-->
> (belum ada) — mulai dari tugas pertama yang belum dicentang.

## Legenda
`[ ]` belum · `[~]` sedang dikerjakan (maks 1) · `[x]` selesai & terbukti · `[!]` diblokir (alasan wajib). Baris `  - ✅` = bukti, `  - 📝` = catatan, `  - ⛔` = alasan blokir.

## Fase 0 — Persiapan (sekali saja)
- [ ] **T-00** Audit SEKALI, catat lewat `note`: (a) PRASYARAT v6 ada & hijau: kolom `boss_tier`, `monster_damage`, `energy_max`, `player_skills.level`, `Progression.bossStats/hitDamage/rewardMult`, `npm test`; bila tidak → `block` dan laporkan; (b) 10 kunci tema habitat nyata (`monsters.js`/`story.js`/`subjects.monster_theme`) dan elemen yang cocok untuk masing-masing — usulkan pemetaan 1:1; (c) layar Monster Dex yang ada (file, fungsi render, API) atau belum ada; (d) kelas CSS kartu skin di `style.css`; (e) SEMUA titik yang mengkredit koin/XP dalam sesi (per jawaban, bonus ⭐, peti/kejutan, hadiah akhir, hadiah pertama kampanye); (f) endpoint pakai-skill: tempat biaya/heal/shield dihitung; (g) tempat `timeLimitSec` dihitung; (h) cara memuat `<script>` shared & service worker (daftar cache); (i) backup DB _(Spek: Aturan kerja 1 · Bukti: ringkasan audit + nama backup)_
- [ ] **T-01** Terapkan patch `Progression.hitDamage` (Lampiran D) lalu salin persis `shared/bossskills.js` (A), `lib/bossfx.js` (B), `public/js/dexcards.js` (C), `scripts/sim-bossfx.js` (E), tiga berkas tes (F); isi `THEME_ELEMENT` dari audit T-00(b) _(Spek: A.2, Lampiran · Bukti: `node --test tests/*.test.js` hijau (29 uji + uji v6); `validateThemeMap(kunciTemaNyata).ok === true`)_
- [ ] **T-02** Migrasi aditif idempoten 3 kolom `game_sessions` (`boss_element`, `brutal`, `boss_fx_json`) dengan backup; perbarui `scripts/check-schema.js` _(Spek: G.1 · Bukti: `node scripts/check-schema.js` lulus; sesi IN_PROGRESS lama tetap terbaca)_
- [ ] **G-0** GERBANG 0: `npm test` + `check-schema` + `smoke-test-v4` hijau; commit

## Fase 1 — Server (skill boss, Brutal, hadiah, Dex)
- [ ] **T-10** `POST /api/game/start`: `BossFx.startFields` (elemen dari tema, `brutal` divalidasi → `403 BRUTAL_LOCKED`), simpan kolom, respons `boss` + `publicView`; tema belum terpetakan = tanpa skill (tidak gagal) _(Spek: C.1, D.1 · Bukti: skenario H.9, H.10)_
- [ ] **T-11** Penyajian soal (start/next/resume): `onServeQuestion` → `timeLimitSec` final, DoT, telegraph; persist `fx`; respons `bossFx`; idempoten saat resume _(Spek: C.2 · Bukti: skenario H.5, H.6)_
- [ ] **T-12** Jawaban benar/salah: `onWrongAnswer` (damage final, `shieldMult`, energi tersedot, fx) menggantikan `monster_damage` polos; `comboBonusMult` ke `hitDamage`; lantai HP boss v6 tetap _(Spek: C.3, C.4 · Bukti: skenario H.4, H.7, H.8)_
- [ ] **T-13** Endpoint pakai-skill: `extraCost` (Fase 2) di validasi **dan** `skills[].cost`, `healMult` pada efek heal; alasan `NO_ENERGY` memakai biaya akhir _(Spek: C.5 · Bukti: skenario H.8)_
- [ ] **T-14** Hadiah: SEMUA titik kredit koin/XP sesi lewat `BossFx.rewardMult` (×3 Brutal, menumpuk dengan pengali tier v6), `reason` bersufiks `:BRUTAL`, invarian saldo utuh, pengeluaran tidak dikali _(Spek: D.2 · Bukti: skenario H.9)_
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
@@TEMPLATE-END@@
````
