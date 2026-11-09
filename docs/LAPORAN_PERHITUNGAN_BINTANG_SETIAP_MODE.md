# 🌟 Laporan Lengkap Sistem Perhitungan Bintang di Setiap Mode Permainan
**Petualangan Pelajar**

Dokumen ini menjelaskan secara komprehensif bagaimana bintang (⭐) dihitung, disimpan, dan dimanfaatkan di seluruh mode permainan yang ada dalam sistem *Petualangan Pelajar*, termasuk penyesuaian terbaru di mana **perolehan bintang dibuat 30% lebih mudah**.

---

## 1. Ringkasan Perubahan: Penyesuaian 30% Lebih Mudah

Untuk meningkatkan motivasi belajar siswa serta memberikan apresiasi pencapaian yang lebih bersahabat, ambang batas (*threshold*) perolehan bintang telah diturunkan sebesar **30%** (faktor pengali $1 - 0.30 = 0.70$):

| Kondisi Akhir Sesi | Kategori Bintang | Syarat Lama | Syarat Baru (30% Lebih Mudah) | Dampak Positif |
| :--- | :---: | :---: | :---: | :--- |
| **Menang (`WON`)** | **⭐⭐⭐ (3 Bintang)** | Akurasi $\ge 90\%$ | **Akurasi $\ge 63\%$** | Siswa yang menjawab benar 7 dari 10 soal ($70\%$) kini langsung meraih 3 Bintang. |
| **Menang (`WON`)** | **⭐⭐☆ (2 Bintang)** | Akurasi $\ge 70\%$ | **Akurasi $\ge 49\%$** | Cukup benar separuh soal ($50\%$) untuk mengamankan 2 Bintang. |
| **Menang (`WON`)** | **⭐☆☆ (1 Bintang)** | Akurasi $< 70\%$ | **Akurasi $< 49\%$** | Kemenangan apapun tetap dihargai minimal 1 Bintang. |
| **Kehabisan Soal (`OUT_OF_QUESTIONS`)** | **⭐⭐☆ (2 Bintang)** | Damage Boss $\ge 80\%$ | **Damage Boss $\ge 56\%$** | Memberikan damage separuh lebih ke boss sudah meraih 2 Bintang. |
| **Kehabisan Soal (`OUT_OF_QUESTIONS`)** | **⭐☆☆ (1 Bintang)** | Damage Boss $\ge 50\%$ | **Damage Boss $\ge 35\%$** | Cukup mengikis $35\%$ darah boss untuk mendapatkan 1 Bintang. |
| **Kehabisan Soal (`OUT_OF_QUESTIONS`)** | **☆☆☆ (0 Bintang)** | Damage Boss $< 50\%$ | **Damage Boss $< 35\%$** | Hanya jika damage di bawah sepertiga. |

---

## 2. Algoritma Dasar Perhitungan Bintang (Core Engine)

Perhitungan bintang diproses di backend pada berkas [`lib/db.js`](file:///home/maman/play/lib/db.js) fungsi `answerQuestion` tepat ketika status sesi berakhir (`newStatus !== 'IN_PROGRESS'`).

Terdapat 4 skenario penentuan bintang:

```
               [ Sesi Berakhir ]
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
[ newStatus: WON ]            [ newStatus: LOST ]
       │                               │
       │                   ┌───────────┴───────────┐
       ▼                   ▼                       ▼
  Akurasi (%)     [ OUT_OF_QUESTIONS ]      [ PLAYER_DEAD ]
  ├── ≥ 63%  ──► ⭐⭐⭐      ├── Damage ≥ 56% ──► ⭐⭐☆     └── (Gugur) ──► ☆☆☆
  ├── ≥ 49%  ──► ⭐⭐☆      ├── Damage ≥ 35% ──► ⭐☆☆
  └── < 49%  ──► ⭐☆☆      └── Damage < 35% ──► ☆☆☆
```

### A. Kondisi Menang (`WON` / Boss Dikalahkan)
Ketika HP Boss mencapai 0 (`newBossHp <= 0`), perolehan bintang dihitung dari **Akurasi Jawaban Pemain** terhadap total soal yang disajikan (`accuracy = correct_count / total_questions`):

| Rentang Akurasi | Bintang Diperoleh | Ikon Tampilan | Keterangan |
| :--- | :---: | :---: | :--- |
| **$\ge 63\%$** | **3 Bintang** | ⭐⭐⭐ | Performa unggul (sebelumnya harus $\ge 90\%$). |
| **$49\% \le \text{Akurasi} < 63\%$** | **2 Bintang** | ⭐⭐☆ | Penguasaan materi baik (sebelumnya harus $\ge 70\%$). |
| **$< 49\%$** | **1 Bintang** | ⭐☆☆ | Menang walau akurasi di bawah separuh. |

### B. Kondisi Kalah karena Kehabisan Soal (`LOST` - `OUT_OF_QUESTIONS`)
Pemain tidak gugur (HP > 0), tetapi seluruh kuota soal pada sesi tersebut telah habis sebelum boss berhasil ditumbangkan. Sistem memberikan bintang apresiasi berdasarkan **Persentase Kerusakan (Damage) yang Berhasil Diberikan ke Boss** (`damageRatio = 1 - (boss_hp / boss_max_hp)`):

| Persentase Damage Boss | Bintang Diperoleh | Ikon Tampilan | Keterangan |
| :--- | :---: | :---: | :--- |
| **$\ge 56\%$ HP Boss Habis** | **2 Bintang** | ⭐⭐☆ | Berhasil menguras lebih dari separuh HP boss (sebelumnya $\ge 80\%$). |
| **$35\% \le \text{Damage} < 56\%$** | **1 Bintang** | ⭐☆☆ | Memberikan perlawanan nyata (sebelumnya $\ge 50\%$). |
| **$< 35\%$ HP Boss Habis** | **0 Bintang** | ☆☆☆ | Belum cukup memberikan tekanan pada boss. |

### C. Kondisi Kalah karena Darah Pemain Habis (`LOST` - `PLAYER_DEAD`)
- **0 Bintang (☆☆☆)** (`stars = 0`).

### D. Kondisi Sesi Ditinggalkan / Menyerah (`ABANDONED`)
- **0 Bintang (☆☆☆)** (`stars = 0`).

---

## 3. Matriks Perhitungan Bintang di Setiap Mode Permainan

| Mode Permainan | Status Sesi | Mekanisme & Parameter Bintang | Dampak & Integrasi Khusus |
| :--- | :--- | :--- | :--- |
| **1. Mode Pertarungan Bebas (`BATTLE`)** | `mode: 'BATTLE'`<br>`campaign_node: null` | • **Menang**: Akurasi $\ge 63\% \rightarrow 3★$, $\ge 49\% \rightarrow 2★$, $< 49\% \rightarrow 1★$<br>• **Soal Habis**: Damage $\ge 56\% \rightarrow 2★$, $\ge 35\% \rightarrow 1★$<br>• **Gugur/Batal**: $0★$ | • Disimpan sebagai `best_stars` pada mata pelajaran (`player_subject_progress`) dan monster terkait (`player_monsters`).<br>• Menentukan Base XP Kemenangan (1★=72 XP, 2★=90 XP, 3★=120 XP). |
| **2. Mode Kampanye / Peta Cerita (`CAMPAIGN`)** | `mode: 'BATTLE'`<br>`campaign_node: 'chX_nY'` | Mengikuti formula akurasi kemenangan & damage ratio baru yang sama persis dengan Mode Battle. | • Bintang dicatat permanen di node: `player_campaign_nodes.stars = MAX(stars, newStars)`.<br>• **Syarat Buka Kunci**: Minimal **1 Bintang** (`stars >= 1`) wajib diraih untuk membuka simpul berikutnya.<br>• Pada boss simpul akhir bab (Node 3), penyelesaian dengan bintang membuka item gacha chapter & komik cerita. |
| **3. Mode Brutal (`BRUTAL` Modifier)** | `brutal: 1`<br>(Bisa aktif di Mode Bebas maupun Kampanye) | Mengikuti formula akurasi kemenangan & damage ratio baru yang sama persis dengan Mode Battle/Kampanye. | • Bintang sesi diperoleh secara normal.<br>• Seluruh hadiah koin & XP kemenangan dikalikan **3× lipat**.<br>• Catatan kemenangan Brutal disimpan di `brutalWins` untuk lencana *Penakluk Mode Brutal*. |
| **4. Mode Fun (`FUN`)** | `mode: 'FUN'`<br>(Soal B/S, Susun Kata, Pasangan, Isian) | Mengikuti formula akurasi kemenangan & damage ratio baru yang sama persis dengan Mode Battle. | • Khusus soal non-pilihan ganda.<br>• Bintang dihitung sama persis.<br>• Perolehan koin dibatasi 50% dari Mode Battle. |
| **5. Mode Latihan (`PRACTICE`)** | `mode: 'PRACTICE'` | Mengikuti formula yang sama persis dengan Mode Battle. | • Kejutan tengah perjalanan (Peti/Pedagang/Jebakan) dinonaktifkan (`s.mode !== 'PRACTICE'`).<br>• Dipisahkan dalam laporan mingguan guru agar tidak bercampur dengan statistik kompetitif. |
| **6. Mode Duel 1v1 PvP (`DUEL`)** | Tabel `duels`<br>(Real-time / Turn-based) | **TIDAK ADA BINTANG (0 Bintang)** | • Tidak mengenal sistem bintang.<br>• Hasil akhir hanya **MENANG**, **SERI**, atau **KALAH**.<br>• Menggunakan sistem MMR, Peringkat Divisi, dan hadiah tetap (Menang: 15 Koin/10 XP, Seri: 8 Koin/6 XP, Kalah: 5 Koin/4 XP). |

---

## 4. Integrasi Bintang dengan Fitur Lain

### A. Skema XP Kemenangan (XP Balancing Menuju Level 20)
Perolehan XP saat menang (`newStatus === 'WON'`) dipengaruhi secara langsung oleh jumlah bintang yang diraih:

$$\text{XP Diterima} = \text{Base XP (Bintang)} + (\text{Streak Akhir} \times 2)$$

- **1 Bintang (⭐☆☆)**: **72 Base XP** (membutuhkan $\approx 250$ kemenangan untuk capai Level 20)
- **2 Bintang (⭐⭐☆)**: **90 Base XP** (membutuhkan $\approx 200$ kemenangan untuk capai Level 20)
- **3 Bintang (⭐⭐⭐)**: **120 Base XP** (membutuhkan $\approx 150$ kemenangan untuk capai Level 20)

*(Catatan: Jika sesi kalah, pemain hanya memperoleh $\text{Jumlah Benar} \times 5 \text{ XP}$ tanpa base XP bintang).*

Dengan ambang 3 bintang kini $\ge 63\%$, siswa yang konsisten belajar dapat lebih cepat mengumpulkan 120 XP per kemenangan, mempercepat progres menuju Level 20 secara wajar dan menyenangkan.

### B. Lencana Prestasi (Badges: *Pengoleksi Bintang*)
Akumulasi total bintang di profil dihitung dari `SUM(stars)` seluruh sesi yang diselesaikan, membuka lencana prestasi bertingkat:
1. **Tier Common — Bintang Fajar**: 15 Bintang akumulasi (+50 Koin, +50 XP)
2. **Tier Rare — Konstelasi Terang**: 75 Bintang akumulasi (+200 Koin, +200 XP)
3. **Tier Epic — Galaksi Gemilang**: 225 Bintang akumulasi (+600 Koin, +500 XP)
4. **Tier Legend — Supernova Abadi**: 375 Bintang akumulasi (+2.000 Koin, +1.200 XP, Bingkai Avatar Eksklusif)

### C. Monster Dex & Profil Teman
- Setiap monster boss di Monster Dex mencatat `best_stars` (bintang rekor terbaik) saat pemain menaklukkan monster tersebut.
- Kartu mata pelajaran menampilkan bintang terbaik (`⭐⭐⭐`, `⭐⭐☆`, `⭐☆☆`, atau `☆☆☆`).

---
*Laporan diperbarui secara otomatis berdasarkan basis kode aktif Petualangan Pelajar v7.*
