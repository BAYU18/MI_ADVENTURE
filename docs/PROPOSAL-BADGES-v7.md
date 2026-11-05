# PROPOSAL SISTEM LENCANA PRESTASI TINGKAT LANJUT (20 KATEGORI × 4 TIER)
**Dokumen Desain Sistem Pencapaian Petualang**  
*Game Edukasi RPG MI Adventure — Versi 7.3*

---

## 1. Visi & Filosofi Desain

Sistem Lencana Prestasi ini dirancang untuk memberikan **motivasi intrinsik jangka pendek, menengah, hingga jangka panjang (end-game)** bagi pemain dari berbagai gaya bermain (*achiever*, *explorer*, *competitor*, dan *scholar*).

Sistem ini mentransformasi 4 lencana profil statis lama menjadi **20 Kategori Lencana Tematik**, di mana setiap kategori memiliki tangga evolusi **4 Tingkatan Prestise (Tier)**:
$$\text{20 Kategori} \times \text{4 Tier} = \text{80 Lencana Unik}$$

### 💎 Tingkatan Prestise & Desain Visual per Tier

![Desain Medali Prestise Lencana (Common, Rare, Epic, Legend)](/home/maman/play/public/img/badges-showcase.jpg)

```
[ COMMON ] ───────► [ RARE ] ────────► [ EPIC ] ────────► [ LEGEND ]
Perunggu Tempa       Perak Berkilau     Emas Kerajaan      Obsidian Kosmik
Aksen Besi Halus     Kristal Azure      Permata Ruby       Berlian Prismatic
Aura Hangat          Sayap Angin        Daun Laurel Emas   Mahkota Naga & Aurora
```

1. **Common (Perunggu / Bronze)**:
   - *Material Visual*: Logam tembaga tempaan hangat dengan lis besi polesan sederhana.
   - *Kesan*: Ramah, hangat, langkah awal yang memuaskan untuk pemain baru (Level 1–5).
2. **Rare (Perak / Azure Silver)**:
   - *Material Visual*: Perak sterling murni mengkilap dengan tatahan batu safir biru langit (Azure Sapphire) dan sayap pelindung kembar.
   - *Kesan*: Elegan, terampil, diraih oleh pemain yang aktif dan tekun (Level 5–10).
3. **Epic (Emas / Royal Ruby Gold)**:
   - *Material Visual*: Emas 24 karat berukir daun kemenangan (Laurel Wreath) dengan inti permata Ruby Merah atau kecubung Amethyst bercahaya.
   - *Kesan*: Mewah, prestisius, menunjukkan kemahiran mekanika tingkat tinggi (Level 10–18).
4. **Legend (Mithril Obsidian & Prismatic Celestial)**:
   - *Material Visual*: Logam meteor obsidian gelap berpadu platinum surgawi, bertatahkan Berlian Prisma Pelangi, dikelilingi partikel kosmik aurora borealis mengambang, serta mahkota naga melayang.
   - *Kesan*: Puncak kejayaan, sangat langka, status elit yang diakui di seluruh papan peringkat (Level 20+).

---

## 2. Pemetaan Sumber Data Game

Seluruh 20 kategori lencana didasarkan secara presisi pada metrik dan tabel database yang telah aktif:
- `game_sessions`: Menghitung kemenangan bos, akurasi 100%, kombo benar, bintang, mode brutal, dan elemen bos.
- `player_monsters`: Melacak kelengkapan koleksi Monster Dex (40 monster).
- `player_skills`: Melacak penggunaan taktik skill dan upgrade skill hingga Level 5.
- `duels`: Melacak kemenangan duel PvP dan rekor win-streak arena.
- `players`: Melacak level karakter, total koin terkumpul, dan login streak harian (`day_streak`).
- `player_items`: Melacak koleksi kostum dan aktivasi efek set skin kosmetik.
- `player_campaign_nodes`: Melacak babak cerita kampanye yang telah ditaklukkan.
- `player_question_stats`: Melacak penaklukan titik lemah melalui Spaced Repetition.

---

## 3. Katalog Lengkap 20 Kategori Lencana (80 Lencana)

### Kategori 1: Penakluk Monster Bos (Boss Slayer)
*Metrik: Total kemenangan laga melawan monster bos (`end_reason = 'BOSS_DEFEATED'`).*
- 🥉 **Common — Pembasmi Pemula**: Kalahkan **5 Monster Bos**.  
  *Deskripsi*: Pengalaman tempur pertama membersihkan ancaman di sekitar desa.  
  *Hadiah*: +50 Koin, +50 XP.
- 🥈 **Rare — Pemburu Rimba**: Kalahkan **25 Monster Bos**.  
  *Deskripsi*: Langkah mantap menembus belantara dan menumbangkan puluhan monster tangguh.  
  *Hadiah*: +150 Koin, +150 XP.
- 🥇 **Epic — Pahlawan Penakluk**: Kalahkan **100 Monster Bos**.  
  *Deskripsi*: Nama Anda tersohor di seantero negeri sebagai penumpas monster sejati.  
  *Hadiah*: +500 Koin, +400 XP.
- 💎 **Legend — Dewa Penguasa Alam**: Kalahkan **250 Monster Bos**.  
  *Deskripsi*: Tak ada monster yang tak gentar mendengar langkah kaki sang legenda penakluk.  
  *Hadiah*: +1.500 Koin, +1.000 XP, Gelar Spesial: *Sang Penakluk Alam*.

---

### Kategori 2: Pengoleksi Bintang Keagungan (Star Collector)
*Metrik: Akumulasi total bintang kemenangan (`SUM(stars)`).*
- 🥉 **Common — Bintang Fajar**: Kumpulkan **30 Bintang**.  
  *Deskripsi*: Kilau fajar pertama dari performa tempur yang rapi.  
  *Hadiah*: +50 Koin, +50 XP.
- 🥈 **Rare — Konstelasi Terang**: Kumpulkan **150 Bintang**.  
  *Deskripsi*: Ratusan bintang membentuk rasi gemerlap di langit malam prestasi Anda.  
  *Hadiah*: +200 Koin, +200 XP.
- 🥇 **Epic — Galaksi Gemilang**: Kumpulkan **450 Bintang**.  
  *Deskripsi*: Gugusan ratusan bintang emas membuktikan konsistensi performa luar biasa.  
  *Hadiah*: +600 Koin, +500 XP.
- 💎 **Legend — Supernova Abadi**: Kumpulkan **750 Bintang**.  
  *Deskripsi*: Puncak kesempurnaan bintang yang bersinar abadi menerangi dunia.  
  *Hadiah*: +2.000 Koin, +1.200 XP, Bingkai Avatar Eksklusif: *Frame Bintang Supernova*.

---

### Kategori 3: Maestro Kombo Membara (Combo Virtuoso)
*Metrik: Rekor rentetan jawaban benar beruntun tertinggi (`MAX(max_streak)`).*
- 🥉 **Common — Percikan Fokus**: Capai **7× Combo Benar**.  
  *Deskripsi*: Fokus pikiran yang mulai menyala tanpa keraguan.  
  *Hadiah*: +50 Koin, +50 XP.
- 🥈 **Rare — Irama Badai**: Capai **14× Combo Benar**.  
  *Deskripsi*: Rentetan jawaban cepat mengalir bagai badai yang menerpa tanpa henti.  
  *Hadiah*: +150 Koin, +150 XP.
- 🥇 **Epic — Kilat Presisi**: Capai **20× Combo Benar**.  
  *Deskripsi*: Ketepatan berpikir setajam kilat petir, mengeliminasi segala keraguan.  
  *Hadiah*: +450 Koin, +400 XP.
- 💎 **Legend — Zen Tak Terpatahkan**: Capai **30× Combo Benar**.  
  *Deskripsi*: Keheningan batin tingkat dewa di mana setiap teka-teki terjawab seketika tanpa cela.  
  *Hadiah*: +1.200 Koin, +1.000 XP, Gelar: *Pikiran Tak Terpatahkan*.

---

### Kategori 4: Kemenangan Sempurna (Flawless Victory)
*Metrik: Menyelesaikan laga dengan kemenangan dan akurasi mutlak 100% tanpa salah satu soal pun.*
- 🥉 **Common — Pukulan Murni**: Menangkan **3 Laga Sempurna (Akurasi 100%)**.  
  *Deskripsi*: Laga tuntas tanpa satu pun goresan jawaban keliru.  
  *Hadiah*: +75 Koin, +75 XP.
- 🥈 **Rare — Eksekusi Bersih**: Menangkan **15 Laga Sempurna (Akurasi 100%)**.  
  *Deskripsi*: Ketelitian teruji berkali-kali menghadapi berbagai variasi ujian.  
  *Hadiah*: +250 Koin, +250 XP.
- 🥇 **Epic — Harmoni Absolut**: Menangkan **50 Laga Sempurna (Akurasi 100%)**.  
  *Deskripsi*: Simfoni kecerdasan di mana setiap strategi dijalankan secara tanpa cacat.  
  *Hadiah*: +750 Koin, +600 XP.
- 💎 **Legend — Mahakarya Sempurna**: Menangkan **100 Laga Sempurna (Akurasi 100%)**.  
  *Deskripsi*: Bukti supremasi intelektual yang tak pernah goyah di hadapan monster manapun.  
  *Hadiah*: +2.500 Koin, +1.500 XP, Aksesori Sayap: *Wing of Flawless Light*.

---

### Kategori 5: Peneliti Monster Dex (Dex Completer)
*Metrik: Jumlah monster unik yang berhasil dikalahkan di Monster Dex (`COUNT(DISTINCT monster_id WHERE defeats > 0)`).*
- 🥉 **Common — Pencatat Alam**: Daftarkan **10 Jenis Monster** di Dex.  
  *Deskripsi*: Membuka lembaran awal ensiklopedia satwa magis.  
  *Hadiah*: +60 Koin, +60 XP.
- 🥈 **Rare — Peneliti Ekosistem**: Daftarkan **20 Jenis Monster** di Dex.  
  *Deskripsi*: Mengenali anatomi, kelemahan, dan habitat separuh monster di dunia.  
  *Hadiah*: +200 Koin, +200 XP.
- 🥇 **Epic — Ensiklopedia Hidup**: Daftarkan **30 Jenis Monster** di Dex.  
  *Deskripsi*: Menjadi rujukan utama para petualang dalam meneliti monster buas.  
  *Hadiah*: +600 Koin, +500 XP.
- 💎 **Legend — Arsiparis Sempurna**: Daftarkan **Seluruh 40 Monster** di Dex.  
  *Deskripsi*: Menguasai seluruh taksonomi monster dari 10 elemen dan 4 tier tanpa terkecuali.  
  *Hadiah*: +2.000 Koin, +1.500 XP, Gelar Legendaris: *Grandmaster Dex*.

---

### Kategori 6: Penakluk Mode Brutal (Brutal Conqueror)
*Metrik: Kemenangan dalam pertarungan mode Brutal (`brutal = 1 AND status = 'WON'`).*
- 🥉 **Common — Penantang Bahaya**: Menangkan **3 Pertempuran Brutal**.  
  *Deskripsi*: Berani melangkah ke wilayah terlarang dengan risiko damage ganda.  
  *Hadiah*: +100 Koin, +100 XP.
- 🥈 **Rare — Prajurit Berdarah Baja**: Menangkan **15 Pertempuran Brutal**.  
  *Deskripsi*: Terbiasa bertarung di bawah tekanan ekstrem dan serangan mematikan.  
  *Hadiah*: +350 Koin, +300 XP.
- 🥇 **Epic — Penyintas Neraka**: Menangkan **40 Pertempuran Brutal**.  
  *Deskripsi*: Menakluk tantangan tersulit dengan ketabahan dan refleks baja.  
  *Hadiah*: +900 Koin, +800 XP.
- 💎 **Legend — Panglima Brutal**: Menangkan **80 Pertempuran Brutal**.  
  *Deskripsi*: Mengukir legenda di medan laga tersadis tanpa pernah mundur selangkah pun.  
  *Hadiah*: +3.000 Koin, +2.000 XP, Gelar Merah Menyala: *Sang Jagal Brutal*.

---

### Kategori 7: Pembasmi Bos Legend (Mythic Hunter)
*Metrik: Kemenangan mengalahkan bos bertier Legend (`boss_tier = 'legend' AND status = 'WON'`).*
- 🥉 **Common — Saksi Sang Mitos**: Kalahkan **1 Bos Legend**.  
  *Deskripsi*: Menatap mata naga legendaris dan keluar sebagai pemenang.  
  *Hadiah*: +150 Koin, +150 XP.
- 🥈 **Rare — Penjinak Raksasa Kuno**: Kalahkan **5 Bos Legend**.  
  *Deskripsi*: Binatang mitologi kuno bertekuk lutut di hadapan kecerdasan Anda.  
  *Hadiah*: +450 Koin, +400 XP.
- 🥇 **Epic — Penghancur Legenda**: Kalahkan **15 Bos Legend**.  
  *Deskripsi*: Pemburu elit yang ditugaskan khusus membasmi ancaman tingkat kiamat.  
  *Hadiah*: +1.200 Koin, +1.000 XP.
- 💎 **Legend — Pembasmi Dewa Purba**: Kalahkan **35 Bos Legend**.  
  *Deskripsi*: Mahkluk terkuat di alam semesta tunduk di bawah telapak kaki Anda.  
  *Hadiah*: +3.500 Koin, +2.500 XP, Senjata Kosmetik: *Pedang Bintang Penumpas Dewa*.

---

### Kategori 8: Penguasa 10 Elemen (Elemental Harmonizer)
*Metrik: Mengalahkan minimal N bos dari tiap 10 elemen monster (Api, Air, Es, Tanah, Angin, Petir, Cahaya, Gelap, Logam, Rimba).*
- 🥉 **Common — Murid Alam**: Kalahkan minimal **1 Bos dari Tiap 10 Elemen**.  
  *Deskripsi*: Memahami siklus kelemahan dan kekuatan dasar seluruh elemen alam.  
  *Hadiah*: +100 Koin, +100 XP.
- 🥈 **Rare — Pawang Elemen**: Kalahkan minimal **5 Bos dari Tiap 10 Elemen**.  
  *Deskripsi*: Mampu beradaptasi secara mulus di segala medan iklim dan cuaca magis.  
  *Hadiah*: +350 Koin, +300 XP.
- 🥇 **Epic — Penguasa Primordial**: Kalahkan minimal **12 Bos dari Tiap 10 Elemen**.  
  *Deskripsi*: Memanipulasi aliran energi alam untuk menghancurkan pertahanan lawan.  
  *Hadiah*: +1.000 Koin, +800 XP.
- 💎 **Legend — Avatar Kosmik**: Kalahkan minimal **25 Bos dari Tiap 10 Elemen**.  
  *Deskripsi*: Keselarasan total dengan semesta; pengendali sejati seluruh elemen kehidupan.  
  *Hadiah*: +3.000 Koin, +2.000 XP, Background Profil: *Alam Semesta Primordial*.

---

### Kategori 9: Refleks Cepat Kritis (Critical Reflexes)
*Metrik: Akumulasi jawaban cepat berstatus Kritis (`SUM(critical_count)`).*
- 🥉 **Common — Refleks Kilat**: Cetak **30 Jawaban Kritis**.  
  *Deskripsi*: Menjawab cepat dan tepat dalam hitungan detik pertama.  
  *Hadiah*: +60 Koin, +60 XP.
- 🥈 **Rare — Serangan Halilintar**: Cetak **120 Jawaban Kritis**.  
  *Deskripsi*: Waktu reaksi yang membuat lawan tak sempat menyiapkan pertahanan.  
  *Hadiah*: +200 Koin, +200 XP.
- 🥇 **Epic — Dentuman Cahaya**: Cetak **350 Jawaban Kritis**.  
  *Deskripsi*: Pikiran gesit melesat melampaui kedipan mata.  
  *Hadiah*: +600 Koin, +500 XP.
- 💎 **Legend — Kecepatan Suara**: Cetak **800 Jawaban Kritis**.  
  *Deskripsi*: Penguasaan total atas waktu; berpikir lebih cepat daripada kilat menyambar.  
  *Hadiah*: +2.000 Koin, +1.500 XP, Gelar: *Sang Kilat Petir*.

---

### Kategori 10: Taktisi Skill Petualang (Skill Strategist)
*Metrik: Total penggunaan skill aktif petualang dalam pertempuran (`SUM(uses)`).*
- 🥉 **Common — Penyihir Pemula**: Gunakan skill aktif sebanyak **20 Kali**.  
  *Deskripsi*: Memadukan mantra penyembuh dan serangan kekuatan di saat genting.  
  *Hadiah*: +50 Koin, +50 XP.
- 🥈 **Rare — Peramu Siasat**: Gunakan skill aktif sebanyak **100 Kali**.  
  *Deskripsi*: Memanfaatkan energi secara efisien untuk membalikkan alur pertarungan.  
  *Hadiah*: +180 Koin, +180 XP.
- 🥇 **Epic — Jenderal Taktik**: Gunakan skill aktif sebanyak **300 Kali**.  
  *Deskripsi*: Setiap aktivasi skill adalah langkah skakmat yang mematikan bagi bos.  
  *Hadiah*: +500 Koin, +450 XP.
- 💎 **Legend — Archmage Agung**: Gunakan skill aktif sebanyak **750 Kali**.  
  *Deskripsi*: Gudang sihir tak bertepi yang mengorkestrasi medan tempur bagai panggung seni.  
  *Hadiah*: +1.800 Koin, +1.200 XP, Mahkota Kosmetik: *Tiara Kristal Archmage*.

---

### Kategori 11: Tempaan Skill Maksimal (Skill Forge Master)
*Metrik: Jumlah skill petualang yang di-upgrade hingga Level 5 maksimal (`COUNT(player_skills WHERE level = 5)`).*
- 🥉 **Common — Taktik Teruji**: Tingkatkan **1 Skill ke Level 5**.  
  *Deskripsi*: Satu jurus andalan yang diasah hingga mencapai potensi puncak.  
  *Hadiah*: +100 Koin, +100 XP.
- 🥈 **Rare — Trio Mematikan**: Tingkatkan **3 Skill ke Level 5**.  
  *Deskripsi*: Kombinasi tiga pilar kemampuan yang siap menghadapi skenario apapun.  
  *Hadiah*: +300 Koin, +300 XP.
- 🥇 **Epic — Arsenal Sempurna**: Tingkatkan **6 Skill ke Level 5**.  
  *Deskripsi*: Fleksibilitas tanpa batas dalam merancang loadout skill tempur.  
  *Hadiah*: +800 Koin, +700 XP.
- 💎 **Legend — Sempurna Paripurna**: Tingkatkan **Seluruh 10 Skill ke Level 5**.  
  *Deskripsi*: Penguasaan absolut atas seluruh taktik yang pernah diciptakan di dunia game.  
  *Hadiah*: +2.500 Koin, +2.000 XP, Petualang Skin: *Jubah Grandmaster Taktik*.

---

### Kategori 12: Jawara Arena Duel (PvP Gladiator)
*Metrik: Kemenangan dalam duel VS pemain (`COUNT(duels WHERE winner_id = player.id)`).*
- 🥉 **Common — Pendekar Arena**: Menangkan **5 Duel VS Pemain**.  
  *Deskripsi*: Menorehkan nama di arena pertarungan antar-petualang.  
  *Hadiah*: +80 Koin, +80 XP.
- 🥈 **Rare — Ksatria Tanding**: Menangkan **25 Duel VS Pemain**.  
  *Deskripsi*: Lawan tangguh yang dihormati di setiap gelanggang pertarungan.  
  *Hadiah*: +250 Koin, +250 XP.
- 🥇 **Epic — Juara Bertahan**: Menangkan **75 Duel VS Pemain**.  
  *Deskripsi*: Merajai ring duel dengan strategi dan kecepatan yang memukau penonton.  
  *Hadiah*: +750 Koin, +600 XP.
- 💎 **Legend — Dewa Gladiator**: Menangkan **150 Duel VS Pemain**.  
  *Deskripsi*: Sang legenda hidup yang tak terkalahkan di panggung pertarungan akbar.  
  *Hadiah*: +2.500 Koin, +1.800 XP, Gelar Emas: *Gladiator Tak Tertandingi*.

---

### Kategori 13: Rentetan Kemenangan Duel (Unstoppable Duelist)
*Metrik: Rekor rentetan kemenangan duel beruntun tertinggi tanpa pernah kalah.*
- 🥉 **Common — Tiga Langkah Kemenangan**: Capai **3 Win-Streak Duel**.  
  *Deskripsi*: Permulaan manis tanpa kekalahan di gelanggang arena.  
  *Hadiah*: +80 Koin, +80 XP.
- 🥈 **Rare — Pilar Kemenangan**: Capai **6 Win-Streak Duel**.  
  *Deskripsi*: Enam penantang datang, enam penantang pulang tertunduk.  
  *Hadiah*: +250 Koin, +250 XP.
- 🥇 **Epic — Sang Dominator**: Capai **10 Win-Streak Duel**.  
  *Deskripsi*: Dominasi mutlak di mana tak ada pemain yang mampu mematahkan laju Anda.  
  *Hadiah*: +700 Koin, +600 XP.
- 💎 **Legend — Maharaja Tak Tertandingi**: Capai **15 Win-Streak Duel**.  
  *Deskripsi*: Rekor legendaris yang akan terukir di tugu kehormatan arena selamanya.  
  *Hadiah*: +2.200 Koin, +1.500 XP, Efek Aura Karakter: *Aura Kemenangan Emas*.

---

### Kategori 14: Penjelajah Kampanye Cerita (Campaign Pathfinder)
*Metrik: Menyelesaikan node dan babak cerita kampanye (`player_campaign_nodes`).*
- 🥉 **Common — Langkah Perdana**: Selesaikan **Babak 1 (Rimba Ajaib)**.  
  *Deskripsi*: Memulai perjalanan dengan menembus gerbang hutan misterius.  
  *Hadiah*: +80 Koin, +80 XP.
- 🥈 **Rare — Penjelajah Tiga Wilayah**: Selesaikan **Babak 3 (Puncak Gunung Es)**.  
  *Deskripsi*: Menaklukkan rimba, gurun pasir, dan badai salju abadi.  
  *Hadiah*: +250 Koin, +250 XP.
- 🥇 **Epic — Penakluk Perbatasan**: Selesaikan **Babak 5 (Lembah Bayangan)**.  
  *Deskripsi*: Menembus wilayah paling gelap dan mengungkap rahasia peradaban kuno.  
  *Hadiah*: +700 Koin, +600 XP.
- 💎 **Legend — Pahlawan Penyelamat Dunia**: Selesaikan **Seluruh Babak Kampanye**.  
  *Deskripsi*: Menyelesaikan seluruh narasi epik dan mengembalikan kedamaian negeri.  
  *Hadiah*: +2.200 Koin, +1.500 XP, Pet Eksklusif: *Anak Naga Langit*.

---

### Kategori 15: Disiplin Belajar Harian (Daily Dedication)
*Metrik: Rekor rentetan hari login dan belajar beruntun (`players.day_streak`).*
- 🥉 **Common — Langkah Istiqomah**: Pertahankan **3 Hari Belajar Beruntun**.  
  *Deskripsi*: Membangun kebiasaan positif yang konsisten setiap hari.  
  *Hadiah*: +50 Koin, +50 XP.
- 🥈 **Rare — Ksatria Tekun**: Pertahankan **7 Hari (1 Minggu) Beruntun**.  
  *Deskripsi*: Satu pekan penuh dedikasi tanpa pernah melewatkan latihan.  
  *Hadiah*: +150 Koin, +150 XP.
- 🥇 **Epic — Disiplin Baja**: Pertahankan **30 Hari (1 Bulan) Beruntun**.  
  *Deskripsi*: Satu bulan komitmen tanpa cela; belajar telah menjadi denyut nadi Anda.  
  *Hadiah*: +600 Koin, +500 XP.
- 💎 **Legend — Kebijaksanaan Abadi**: Pertahankan **100 Hari Beruntun**.  
  *Deskripsi*: Monumen ketekunan dan kesabaran yang menginspirasi seluruh petualang.  
  *Hadiah*: +2.500 Koin, +2.000 XP, Frame Avatar: *Cincin Waktu Abadi*.

---

### Kategori 16: Penakluk Titik Lemah (Spaced Repetition Master)
*Metrik: Menjawab benar soal-soal berkategori Ulangan Berjarak / Titik Lemah (`is_review = 1 OR is_weak = 1`).*
- 🥉 **Common — Koreksi Cermat**: Tuntaskan **15 Soal Titik Lemah**.  
  *Deskripsi*: Mengubah kesalahan masa lalu menjadi batu loncatan pemahaman.  
  *Hadiah*: +60 Koin, +60 XP.
- 🥈 **Rare — Pembalik Kelemahan**: Tuntaskan **50 Soal Titik Lemah**.  
  *Deskripsi*: Soal-soal yang dulu sulit kini dijawab dengan senyuman santai.  
  *Hadiah*: +200 Koin, +200 XP.
- 🥇 **Epic — Memori Baja**: Tuntaskan **150 Soal Titik Lemah**.  
  *Deskripsi*: Ingatan jangka panjang yang tertata rapi berkat ulangan berkala.  
  *Hadiah*: +600 Koin, +500 XP.
- 💎 **Legend — Pikiran Tanpa Celah**: Tuntaskan **350 Soal Titik Lemah**.  
  *Deskripsi*: Tidak ada celah kelemahan yang tersisa di seluruh bidang mata pelajaran.  
  *Hadiah*: +1.800 Koin, +1.200 XP, Gelar: *Sang Cendekia Paripurna*.

---

### Kategori 17: Ikon Mode & Kostum (Fashion Trendsetter)
*Metrik: Jumlah item avatar/skin kosmetik langka yang dikoleksi (`player_items`).*
- 🥉 **Common — Tampilan Rapi**: Miliki **5 Item Kosmetik**.  
  *Deskripsi*: Menyesuaikan gaya pakaian petualang agar tampil beda.  
  *Hadiah*: +50 Koin, +50 XP.
- 🥈 **Rare — Kolektor Busana**: Miliki **15 Item Kosmetik (Termasuk 3 Rare)**.  
  *Deskripsi*: Lemari pakaian penuh dengan jubah, mahkota, dan senjata pilihan.  
  *Hadiah*: +200 Koin, +200 XP.
- 🥇 **Epic — Ikon Kemewahan**: Miliki **30 Item Kosmetik (Termasuk 5 Epic)**.  
  *Deskripsi*: Penampilan glamor yang selalu mencuri perhatian di lobi petualangan.  
  *Hadiah*: +650 Koin, +550 XP.
- 💎 **Legend — Maharaja Gaya**: Miliki **50 Item Kosmetik & Aktifkan 2 Set Lengkap**.  
  *Deskripsi*: Pesona legenda sejati dengan busana kerajaan bertaraf dewa.  
  *Hadiah*: +2.000 Koin, +1.500 XP, Kostum Jubah: *Jubah Galaksi Spektrum*.

---

### Kategori 18: Saudagar Emas Melimpah (Coin Tycoon)
*Metrik: Total akumulasi koin yang pernah didulang sepanjang karir (`SUM(coins_earned)`).*
- 🥉 **Common — Pundi Pertama**: Kumpulkan total **1.000 Koin**.  
  *Deskripsi*: Hasil keringat pertama dari pertempuran dan penyelesaian misi.  
  *Hadiah*: +100 XP.
- 🥈 **Rare — Kantung Tebal**: Kumpulkan total **7.500 Koin**.  
  *Deskripsi*: Mampu memborong perlengkapan dan ramuan terbaik di toko desa.  
  *Hadiah*: +300 XP.
- 🥇 **Epic — Gudang Harta**: Kumpulkan total **25.000 Koin**.  
  *Deskripsi*: Peti besi penuh berkilau dengan kepingan emas murni hasil kemenangan.  
  *Hadiah*: +800 XP.
- 💎 **Legend — Konglomerat Kerajaan**: Kumpulkan total **60.000 Koin**.  
  *Deskripsi*: Kekayaan melimpah ruah yang mampu mendanai ekspedisi seluruh kerajaan.  
  *Hadiah*: +2.000 XP, Gelar Bertabur Emas: *Saudagar Legendaris*.

---

### Kategori 19: Penyintas Hati Phoenix (Survivor / Last Stand)
*Metrik: Memenangkan pertempuran saat darah tersisa kritis $\le 15\%$ HP atau memicu efek bertahan.*
- 🥉 **Common — Goresan Berani**: Menangkan **3 Pertempuran dengan Sisa Darah < 20% HP**.  
  *Deskripsi*: Bertahan hidup di ujung tanduk dan mencetak serangan pembalikan.  
  *Hadiah*: +70 Koin, +70 XP.
- 🥈 **Rare — Tahan Banting**: Menangkan **10 Pertempuran dengan Sisa Darah < 20% HP**.  
  *Deskripsi*: Pantang menyerah walau darah menetes deras; mental juara sejati.  
  *Hadiah*: +220 Koin, +220 XP.
- 🥇 **Epic — Kebangkitan Ajaib**: Menangkan **25 Pertempuran dengan Sisa Darah < 15% HP**.  
  *Deskripsi*: Mukjizat kemenangan di saat semua orang mengira Anda akan kalah.  
  *Hadiah*: +650 Koin, +550 XP.
- 💎 **Legend — Sayap Phoenix Abadi**: Menangkan **50 Pertempuran Mengatasi Batas Kematian**.  
  *Deskripsi*: Bangkit dari abu kekalahan bagai burung Phoenix abadi yang tak bisa mati.  
  *Hadiah*: +2.200 Koin, +1.500 XP, Pet Eksklusif: *Bayi Burung Phoenix*.

---

### Kategori 20: Puncak Kejayaan Petualang (Ascendant Level Max)
*Metrik: Pencapaian Level Karakter (`players.level`).*
- 🥉 **Common — Ksatria Muda**: Capai **Level 5**.  
  *Deskripsi*: Lulus dari masa pemula dan membuka akses skill Ramuan Merah.  
  *Hadiah*: +100 Koin, +100 XP.
- 🥈 **Rare — Petualang Ulung**: Capai **Level 10**.  
  *Deskripsi*: Kekuatan dan kapasitas energi berkembang pesat (Kapasitas Energi 7⚡).  
  *Hadiah*: +300 Koin, +300 XP.
- 🥇 **Epic — Komandan Medan**: Capai **Level 15**.  
  *Deskripsi*: Menjadi panutan bagi seluruh murid dan petualang muda di sekolah.  
  *Hadiah*: +800 Koin, +700 XP.
- 💎 **Legend — Puncak Keagungan**: Capai **Level 20 (Maksimal Cap)**.  
  *Deskripsi*: Mencapai batas tertinggi kemampuan manusia; legenda abadi MI Adventure.  
  *Hadiah*: +3.000 Koin, +2.500 XP, Gelar Plafon Tertinggi: *Sang Juara Agung*.

---

## 4. Desain Tampilan UI & Kemewahan Efek Visual

### Desain Kartu Lencana di Tab Profil
Pada tab **Profil ➔ Lencana**, lencana ditata dalam sistem kartu interaktif dengan status:
- **Terkunci**: Silhouette abu-abu elegan dengan progress bar (contoh: `18/25 Bos Terkalahkan`).
- **Terbuka**: Berkilau penuh sesuai warna tier dengan efek partikel halus.
- **Klik Lencana**: Membuka dialog modal detail yang menampilkan:
  - Ikon medali 3D resolusi tinggi.
  - Tanggal diraih & syarat capaian.
  - Lore inspiratif.
  - Tombol *"Klaim Hadiah"* (jika baru terbuka) dengan animasi kembang api partikel koin.

### Visual Styling CSS (Contoh Mockup Kelas):
```css
/* Tier Styling */
.badge-common {
  background: linear-gradient(135deg, #78350f 0%, #b45309 50%, #451a03 100%);
  border: 1.5px solid #d97706;
  box-shadow: 0 2px 6px rgba(180, 83, 9, 0.3);
}

.badge-rare {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0369a1 100%);
  border: 1.5px solid #38bdf8;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.45);
}

.badge-epic {
  background: linear-gradient(135deg, #3b0764 0%, #831843 50%, #b45309 100%);
  border: 2px solid #fbbf24;
  box-shadow: 0 0 16px rgba(251, 191, 36, 0.55), inset 0 0 8px rgba(251, 191, 36, 0.3);
}

.badge-legend {
  background: linear-gradient(135deg, #09090b 0%, #4c1d95 35%, #059669 70%, #d97706 100%);
  border: 2px solid #e0e7ff;
  box-shadow: 0 0 24px rgba(168, 85, 247, 0.7), 0 0 10px rgba(56, 189, 248, 0.5);
  animation: legendShimmer 4s infinite linear, legendPulse 2s infinite ease-in-out;
}
```

---

## 5. Rencana Arsitektur & Implementasi Database

1. **Tabel Baru `player_badges`**:
   ```sql
   CREATE TABLE IF NOT EXISTS player_badges (
     id            INTEGER PRIMARY KEY AUTOINCREMENT,
     player_id     INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
     badge_id      TEXT NOT NULL,
     tier          TEXT NOT NULL CHECK(tier IN ('COMMON', 'RARE', 'EPIC', 'LEGEND')),
     progress      INTEGER NOT NULL DEFAULT 0,
     unlocked_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
     claimed_at    TEXT,
     UNIQUE(player_id, badge_id, tier)
   );
   ```
2. **Evaluasi Otomatis Pasca-Laga (`evaluateBadges`)**:
   - Dieksekusi otomatis di akhir pertempuran (`finishSession`) dan saat duel usai (`finishDuel`).
   - Setiap lencana yang baru terbuka akan dikirimkan dalam payload `rewards.newBadges` sehingga UI battle langsung memicu banner selebrasi *"Lencana Baru Terbuka!"*.
3. **Penyelarasan Retroaktif**:
   - Skrip migrasi satu kali yang membaca seluruh rekor masa lalu pemain (`game_sessions`, `player_monsters`, `day_streak`, dll.) dan secara otomatis menganugerahkan lencana yang telah berhak dimiliki oleh pemain lama.

---
*Disiapkan untuk Tim Pengembang MI Adventure — Siap untuk tahap implementasi teknis.*
