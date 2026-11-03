/**
 * Skrip Penambahan Soal ORDERING & MATCHING Terkurasi Kelas 4 SD
 * Memastikan ketersediaan soal merata untuk seluruh 12 Mapel Kelas 4 SD
 */

const crypto = require('crypto');
const db = require('../lib/db.js');
const { validateQuestionData } = require('../shared/grading.js');

function questionHash(text) {
  return crypto.createHash('sha1')
    .update(String(text || '').toLowerCase().trim().replace(/\s+/g, ' '))
    .digest('hex');
}

const EXTRA_ORDERING = {
  // Matematika
  1: [
    { text: "Urutkan pecahan desimal dari terkecil ke terbesar:", items: ["0,12", "0,35", "0,6", "0,85"], explanation: "0,12 < 0,35 < 0,60 < 0,85." },
    { text: "Urutkan perkalian bilangan cacah dari hasil terkecil ke terbesar:", items: ["9 × 3 (27)", "6 × 6 (36)", "8 × 5 (40)", "7 × 7 (49)"], explanation: "27 < 36 < 40 < 49." },
    { text: "Urutkan bilangan ribuan berikut dari terbesar ke terkecil:", items: ["9.850", "8.950", "7.640", "6.740"], explanation: "Nilai ribuan menurun: 9.850 > 8.950 > 7.640 > 6.740." },
    { text: "Urutkan keliling bangun persegi berikut dari sisi terpendek:", items: ["Sisi 3 cm (K=12)", "Sisi 5 cm (K=20)", "Sisi 7 cm (K=28)", "Sisi 9 cm (K=36)"], explanation: "Keliling = 4 × sisi: 12 cm, 20 cm, 28 cm, 36 cm." },
    { text: "Urutkan satuan luas berikut dari yang terkecil:", items: ["Sentimeter persegi (cm²)", "Desimeter persegi (dm²)", "Meter persegi (m²)", "Hektare (ha)"], explanation: "Tangga satuan luas: cm² < dm² < m² < ha." },
    { text: "Urutkan sudut berikut dari derajat terkecil ke terbesar:", items: ["Sudut 30°", "Sudut 45°", "Sudut 90°", "Sudut 120°"], explanation: "30° < 45° < 90° < 120°." },
    { text: "Urutkan nilai persentase berikut dari terkecil ke terbesar:", items: ["10%", "25%", "50%", "75%"], explanation: "10% < 25% < 50% < 75%." },
    { text: "Urutkan pecahan berpenyebut sama dari nilai terkecil:", items: ["1/7", "3/7", "5/7", "6/7"], explanation: "Pada penyebut sama, pembilang terkecil bernilai paling kecil." }
  ],

  // Bahasa Indonesia
  4: [
    { text: "Urutkan tahapan menulis karangan sederhana:", items: ["Menentukan tema/topik", "Menyusun kerangka karangan", "Mengembangkan paragraf", "Menyunting dan mengoreksi ejaan"], explanation: "Langkah teratur menulis karangan." },
    { text: "Urutkan langkah wawancara yang santun:", items: ["Menentukan narasumber dan topik", "Menyiapkan daftar pertanyaan", "Melakukan wawancara dengan sopan", "Menuliskan laporan hasil wawancara"], explanation: "Prosedur baku kegiatan wawancara." },
    { text: "Urutkan kata-kata berikut menjadi kalimat SPOK yang padu:", items: ["Budi", "membeli", "alat tulis baru", "di toko buku"], explanation: "Budi (S) membeli (P) alat tulis baru (O) di toko buku (K)." },
    { text: "Urutkan tahapan membaca intensif sebuah teks bacaan:", items: ["Membaca judul teks", "Membaca keseluruhan isi teks", "Mencatat ide pokok tiap paragraf", "Menjawab pertanyaan bacaan"], explanation: "Teknik membaca intensif pemahaman teks." },
    { text: "Urutkan bagian surat pribadi dari bagian atas ke bawah:", items: ["Tempat dan tanggal surat", "Salam pembuka", "Isi surat", "Salam penutup dan nama pengirim"], explanation: "Struktur baku surat pribadi." },
    { text: "Urutkan kata-kata berikut menjadi kalimat berpola S-P-O:", items: ["Petani", "menanam", "padi di sawah"], explanation: "Subjek, predikat, objek keterangan." },
    { text: "Urutkan langkah berpidato yang baik:", items: ["Salam pembuka", "Penyampaian inti pidato", "Kesimpulan pidato", "Salam penutup"], explanation: "Sistematika teks pidato persuasif." }
  ],

  // IPAS
  5: [
    { text: "Urutkan tahapan metamorfosis tidak sempurna belalang:", items: ["Telur", "Nimfa (Belalang muda)", "Belalang dewasa (Imago)"], explanation: "Metamorfosis tidak sempurna tidak melalui tahap kepompong." },
    { text: "Urutkan daur hidup katak dari awal:", items: ["Telur katak", "Kecebong / Berudu", "Katak berekor", "Katak dewasa"], explanation: "Daur hidup katak amfibi." },
    { text: "Urutkan lapisan atmosfer bumi dari permukaan tanah ke atas:", items: ["Troposfer", "Stratosfer", "Mesosfer", "Termosfer"], explanation: "Urutan lapisan atmosfer dari yang terdekat dengan bumi." },
    { text: "Urutkan proses fotosintesis pada daun tumbuhan:", items: ["Akar menyerap air tanah", "Daun menyerap karbon dioksida", "Klorofil menangkap cahaya matahari", "Dihasilkan glukosa dan oksigen"], explanation: "Reaksi biokimia fotosintesis." },
    { text: "Urutkan proses pendengaran bunyi oleh telinga:", items: ["Daun telinga menangkap getaran", "Gendang telinga bergetar", "Tulang pendengaran memperkuat getaran", "Saraf pendengaran mengirim sinyal ke otak"], explanation: "Mekanisme transmisi gelombang suara pada indra pendengaran." },
    { text: "Urutkan daur hidup nyamuk pembawa penyakit:", items: ["Telur di air", "Jentik-jentik (Larva)", "Pupa (Kepompong air)", "Nyamuk dewasa bersayap"], explanation: "Daur hidup nyamuk metamorfosis sempurna." },
    { text: "Urutkan proses penglihatan mata manusia:", items: ["Cahaya masuk lewat pupil", "Lensa memfokuskan bayangan", "Retina menangkap bayangan", "Saraf optik meneruskan ke otak"], explanation: "Mekanisme penglihatan mata normal." }
  ],

  // Pendidikan Pancasila
  6: [
    { text: "Urutkan proses perumusan Pancasila secara historis:", items: ["Sidang pertama BPUPKI", "Pidato usulan dasar negara tokoh bangsa", "Pembentukan Panitia Sembilan", "Pengesahan Pancasila oleh PPKI"], explanation: "Kronologi kelahiran dasar negara RI." },
    { text: "Urutkan langkah musyawarah mufakat di lingkungan RT:", items: ["Warga berkumpul menghadiri rapat", "Ketua RT menyampaikan agenda masalah", "Warga mengemukakan saran/masukan", "Menetapkan kesepakatan bersama"], explanation: "Tahapan pengambilan keputusan bersama." },
    { text: "Urutkan tingkatan kepolisian dari tingkat terendah:", items: ["Polsek (Kecamatan)", "Polres (Kabupaten/Kota)", "Polda (Provinsi)", "Mabes Polri (Pusat)"], explanation: "Jenjang hierarki kepolisian Republik Indonesia." },
    { text: "Urutkan tata tertib upacara bendera hari Senin:", items: ["Pemimpin upacara menyiapkan barisan", "Pengibaran bendera Merah Putih", "Pembacaan teks Pancasila", "Amanat pembina upacara"], explanation: "Susunan acara resmi upacara bendera." },
    { text: "Urutkan jenjang pendidikan formal di Indonesia:", items: ["PAUD / Taman Kanak-Kanak", "Sekolah Dasar (SD/MI)", "Sekolah Menengah Pertama (SMP/MTs)", "Sekolah Menengah Atas (SMA/SMK/MA)"], explanation: "Jalur pendidikan formal nasional." },
    { text: "Urutkan aturan hukum dari tingkat tertinggi di Indonesia:", items: ["UUD 1945", "Ketetapan MPR", "Undang-Undang / Perpu", "Peraturan Pemerintah (PP)"], explanation: "Tata urutan perundang-undangan RI." }
  ],

  // Akidah Akhlak
  7: [
    { text: "Urutkan ucapan zikir penenang hati saat menghadapi kesulitan:", items: ["Istighfar (Astaghfirullah)", "Hauqalah (Laa haula wa laa quwwata illa billah)", "Doa memohon kemudahan", "Hamdalah (Alhamdulillah)"], explanation: "Urutan adab berzikir saat gelisah." },
    { text: "Urutkan adab berbicara kepada orang tua yang mulia:", items: ["Mendengarkan dengan penuh perhatian", "Menjawab dengan suara santun", "Tidak menyela pembicaraan", "Mendoakan kebaikan orang tua"], explanation: "Adab birrul walidain dalam Islam." },
    { text: "Urutkan sifat para rasul yang wajib diteladani:", items: ["Siddiq (Benar dan Jujur)", "Amanah (Dapat Dipercaya)", "Tabligh (Menyampaikan Kebenaran)", "Fathanah (Cerdas dan Bijaksana)"], explanation: "Empat sifat wajib rasul Allah." },
    { text: "Urutkan tingkatan keimanan dan keislaman:", items: ["Islam (Mengamalkan rukun Islam)", "Iman (Meyakini rukun iman)", "Ihsan (Beribadah seolah melihat Allah)"], explanation: "Tiga tingkatan agama Islam." },
    { text: "Urutkan adab berteman dalam Islam:", items: ["Memilih teman yang berakhlak baik", "Saling menyapa dan mengucapkan salam", "Saling menasihati dalam kebaikan", "Menjaga rahasia dan aib teman"], explanation: "Adab persaudaraan sesama muslim." }
  ],

  // Al-Qur'an Hadis
  8: [
    { text: "Urutkan surah Al-Falaq, An-Nas, dan Al-Ikhlas sesuai urutan mushaf Al-Qur'an:", items: ["Surah Al-Ikhlas (112)", "Surah Al-Falaq (113)", "Surah An-Nas (114)"], explanation: "Tiga surah penutup Al-Qur'an." },
    { text: "Urutkan ayat-ayat dalam Surah Al-Ikhlas dari ayat 1 sampai 4:", items: ["Qul huwallahu ahad", "Allahus-samad", "Lam yalid wa lam yuulad", "Wa lam yakun lahu kufuwan ahad"], explanation: "Lafaz lengkap 4 ayat Surah Al-Ikhlas." },
    { text: "Urutkan langkah memegang dan membaca mushaf Al-Qur'an:", items: ["Berwudhu suci dari hadas", "Membawa mushaf dengan kedua tangan terhormat", "Membaca taawudz dan basmalah", "Membaca dengan tartil dan perlahan"], explanation: "Adab mulia terhadap mushaf Al-Qur'an." },
    { text: "Urutkan hukum mim sukun bertemu huruf hijaiyah:", items: ["Ikhfa Syafawi (Bertemu huruf Ba)", "Idgham Mimi (Bertemu huruf Mim)", "Izhar Syafawi (Bertemu selain Ba dan Mim)"], explanation: "Tiga hukum bacaan mim sukun." },
    { text: "Urutkan surah-surah juz 30 berikut dari urutan surah terawal:", items: ["Surah Al-Fiil (105)", "Surah Quraisy (106)", "Surah Al-Ma'un (107)", "Surah Al-Kautsar (108)"], explanation: "Nomor surah urut 105 sampai 108." }
  ],

  // Fikih
  9: [
    { text: "Urutkan gerakan rukun shalat dari berdiri tegak:", items: ["Niat dan Takbiratul Ihram", "Rukuk dengan tumakninah", "Itidal berdiri tegak", "Sujud pertama dengan tumakninah"], explanation: "Rukun fi'li shalat fardhu." },
    { text: "Urutkan syarat wajib shalat lima waktu:", items: ["Beragama Islam", "Baligh (Cukup umur)", "Berakal sehat", "Mendengar seruan dakwah Islam"], explanation: "Syarat yang mewajibkan seorang muslim shalat." },
    { text: "Urutkan rukun wudhu yang pokok dalam Al-Qur'an surah Al-Maidah ayat 6:", items: ["Niat dan membasuh muka", "Membasuh kedua tangan hingga siku", "Mengusap sebagian kepala", "Membasuh kedua kaki hingga mata kaki"], explanation: "Empat rukun fardhu wudhu dalam Al-Qur'an." },
    { text: "Urutkan tata cara tayammum dengan debu bersih:", items: ["Niat tayammum", "Menempelkan tangan ke debu lalu meniupnya", "Mengusap muka", "Menempelkan tangan kedua dan mengusap kedua tangan"], explanation: "Tata cara bersuci tayammum sesuai sunnah." },
    { text: "Urutkan posisi makmum shalat berjamaah dari terdepan:", items: ["Imam shalat", "Shaf makmum laki-laki dewasa", "Shaf anak-anak laki-laki", "Shaf perempuan"], explanation: "Aturan penyusunan shaf shalat berjamaah." }
  ],

  // SKI
  10: [
    { text: "Urutkan peristiwa penting kenabian Nabi Muhammad SAW:", items: ["Lahir pada Tahun Gajah", "Menerima wahyu pertama di Gua Hira", "Peristiwa Isra Mi'raj", "Hijrah ke Madinah"], explanation: "Kronologi sejarah kenabian Rasulullah SAW." },
    { text: "Urutkan lokasi hijrah kaum muslimin pada masa Rasulullah SAW:", items: ["Hijrah pertama ke Habasyah (Ethiopia)", "Hijrah kedua ke Habasyah", "Hijrah ke kota Yatsrib (Madinah)"], explanation: "Rute dan tahapan hijrah kaum muslimin awal." },
    { text: "Urutkan pembangunan pertama Nabi di Madinah:", items: ["Membangun Masjid Nabawi", "Mempersaudarakan kaum Muhajirin dan Anshar", "Membuat Piagam Madinah"], explanation: "Langkah strategis Rasulullah membangun kota Madinah." },
    { text: "Urutkan empat khalifah penerus perjuangan Islam:", items: ["Khalifah Abu Bakar", "Khalifah Umar bin Khattab", "Khalifah Utsman bin Affan", "Khalifah Ali bin Abi Thalib"], explanation: "Masa kekhalifahan Khulafaur Rasyidin." }
  ],

  // Bahasa Arab
  11: [
    { text: "Urutkan sapaan harian bahasa Arab dari pagi ke malam:", items: ["صَبَاحُ الْخَيْرِ (Pagi)", "نَهَارُكَ سَعِيْدٌ (Siang)", "مَسَاءُ الْخَيْرِ (Sore)", "لَيْلَتُكَ سَعِيْدَةٌ (Malam)"], explanation: "Urutan salam waktu bahasa Arab." },
    { text: "Urutkan kata bilangan puluhan bahasa Arab dari yang terkecil:", items: ["عَشَرَةٌ (10)", "عِشْرُوْنَ (20)", "ثَلَاثُوْنَ (30)", "أَرْبَعُوْنَ (40)"], explanation: "Bilangan puluhan 10, 20, 30, 40." },
    { text: "Urutkan kata bahasa Arab berikut menjadi kalimat tanya alamat:", items: ["أَيْنَ (Di mana)", "عُنْوَانُ (Alamat)", "بَيْتِكَ (Rumahmu)", "يَا أَخِي (Wahai saudaraku)"], explanation: "Susunan kalimat tanya bahasa Arab yang benar." },
    { text: "Urutkan ruangan di rumah dalam bahasa Arab dari depan:", items: ["غُرْفَةُ الْجُلُوْسِ (Ruang tamu)", "غُرْفَةُ النَّوْمِ (Kamar tidur)", "الْمَطْبَخُ (Dapur)", "الْحَمَّامُ (Kamar mandi)"], explanation: "Kosakata ruangan dalam rumah." }
  ],

  // PJOK
  12: [
    { text: "Urutkan latihan kebugaran jasmani dasar:", items: ["Pemanasan peregangan otot", "Lari jogging keliling lapangan", "Latihan kekuatan push-up & sit-up", "Pendinginan melemaskan otot"], explanation: "Rangkaian latihan kebugaran bertahap." },
    { text: "Urutkan gerakan berguling ke depan (forward roll) senam lantai:", items: ["Sikap awal jongkok menghadap matras", "Menaruh kedua telapak tangan di matras", "Memasukkan kepala di antara dua tangan dan mengguling", "Mendarat kembali dengan posisi jongkok"], explanation: "Teknik senam lantai roll depan." },
    { text: "Urutkan tahapan lempar lembing / roket mini SD:", items: ["Lari awalan membawa roket", "Langkah silang (cross step)", "Tolakan dan lemparan lengan kuat", "Gerak ikutan menjaga keseimbangan"], explanation: "Fase teknik lempar roket atletik anak." },
    { text: "Urutkan teknik dasar renang gaya dada:", items: ["Meluncur posisi lurus di air", "Gerakan mendayung kedua tangan", "Gerakan membuka dan menutup kedua kaki", "Mengambil napas saat kepala naik"], explanation: "Koordinasi gerakan renang gaya dada." }
  ],

  // Seni Budaya
  13: [
    { text: "Urutkan warna pelangi dari spektrum terluar ke dalam:", items: ["Merah", "Jingga", "Kuning", "Hijau"], explanation: "Urutan spektrum warna cahaya mejikuhibiniu." },
    { text: "Urutkan tahapan pembuatan anyaman sederhana:", items: ["Menyiapkan pita / bilah anyaman", "Menentukan pola lungsi dan pakan", "Menganyam selang-seling satu-satu", "Merapikan dan mengunci ujung anyaman"], explanation: "Langkah kerajinan seni kriya anyam." },
    { text: "Urutkan nilai ketukan nada dari yang terpanjang ke terpendek:", items: ["Nada 4 ketuk (Utuh)", "Nada 2 ketuk (Setengah)", "Nada 1 ketuk (Seperempat)", "Nada 1/2 ketuk (Seperdelapan)"], explanation: "Hierarki nilai ketukan notasi balok." },
    { text: "Urutkan tahapan menari daerah secara berkelompok:", items: ["Mendengarkan iringan musik tari", "Menghafal gerakan ragam tari", "Menyesuaikan pola lantai kelompok", "Pentas penampilan tari kompak"], explanation: "Proses apresiasi dan kreasi seni tari." }
  ],

  // Bahasa Inggris
  14: [
    { text: "Urutkan ukuran benda dalam bahasa Inggris dari yang terkecil:", items: ["Tiny (Sangat kecil)", "Small (Kecil)", "Big (Besar)", "Huge (Sangat besar)"], explanation: "Degrees of size in English." },
    { text: "Urutkan kata-kata berikut menjadi kalimat bahasa Inggris yang padu:", items: ["My father", "washes", "his blue car", "every Sunday morning"], explanation: "Subject + Verb + Object + Time adverbial." },
    { text: "Urutkan nama-nama bulan berikut dari awal tahun:", items: ["January", "February", "March", "April"], explanation: "First four months of the calendar year." },
    { text: "Urutkan kata-kata acak berikut menjadi kalimat tanya:", items: ["What time", "do you", "go to school", "in the morning?"], explanation: "Standard question structure in English." }
  ]
};

const EXTRA_MATCHING = {
  // Matematika
  1: [
    {
      text: "Pasangkan pecahan dengan persentasenya yang tepat:",
      pairs: [
        { left: "1/2", right: "50%" },
        { left: "1/4", right: "25%" },
        { left: "3/4", right: "75%" },
        { left: "1/5", right: "20%" }
      ],
      explanation: "Konversi pecahan ke persen: 1/2=50%, 1/4=25%, 3/4=75%, 1/5=20%."
    },
    {
      text: "Pasangkan rumus keliling bangun datar berikut:",
      pairs: [
        { left: "Persegi", right: "4 × sisi" },
        { left: "Persegi Panjang", right: "2 × (panjang + lebar)" },
        { left: "Segitiga Sama Sisi", right: "3 × sisi" },
        { left: "Segienam Beraturan", right: "6 × sisi" }
      ],
      explanation: "Rumus keliling poligon datar dasar."
    },
    {
      text: "Pasangkan konversi satuan panjang berikut:",
      pairs: [
        { left: "1 Meter", right: "100 Centimeter" },
        { left: "1 Kilometer", right: "1.000 Meter" },
        { left: "1 Desimeter", right: "10 Centimeter" },
        { left: "1 Centimeter", right: "10 Milimeter" }
      ],
      explanation: "Hubungan antar satuan panjang metrik."
    },
    {
      text: "Pasangkan perkalian berikut dengan hasilnya:",
      pairs: [
        { left: "15 × 3", right: "45" },
        { left: "14 × 4", right: "56" },
        { left: "18 × 4", right: "72" },
        { left: "16 × 5", right: "80" }
      ],
      explanation: "15×3=45, 14×4=56, 18×4=72, 16×5=80."
    },
    {
      text: "Pasangkan operasi pembagian dengan hasilnya:",
      pairs: [
        { left: "81 ÷ 9", right: "9" },
        { left: "56 ÷ 7", right: "8" },
        { left: "64 ÷ 8", right: "8" },
        { left: "42 ÷ 6", right: "7" }
      ],
      explanation: "81÷9=9, 56÷7=8, 64÷8=8, 42÷6=7."
    },
    {
      text: "Pasangkan angka ribuan dengan nilai tempat angka 7:",
      pairs: [
        { left: "7.450", right: "Ribuan (7.000)" },
        { left: "4.750", right: "Ratusan (700)" },
        { left: "4.570", right: "Puluhan (70)" },
        { left: "4.507", right: "Satuan (7)" }
      ],
      explanation: "Konsep nilai tempat angka."
    },
    {
      text: "Pasangkan KPK dan FPB bilangan berikut:",
      pairs: [
        { left: "FPB dari 12 dan 18", right: "6" },
        { left: "KPK dari 4 dan 6", right: "12" },
        { left: "FPB dari 15 dan 25", right: "5" },
        { left: "KPK dari 3 dan 5", right: "15" }
      ],
      explanation: "Perhitungan KPK dan FPB dasar."
    }
  ],

  // Bahasa Indonesia
  4: [
    {
      text: "Pasangkan jenis teks dengan tujuannya masing-masing:",
      pairs: [
        { left: "Teks Narasi", right: "Menceritakan urutan peristiwa" },
        { left: "Teks Deskripsi", right: "Menggambarkan objek secara rinci" },
        { left: "Teks Prosedur", right: "Menjelaskan langkah-langkah kerja" },
        { left: "Teks Petunjuk", right: "Memberi panduan penggunaan alat" }
      ],
      explanation: "Tujuan komunikatif berbagai jenis teks bacaan."
    },
    {
      text: "Pasangkan kata baku dengan bentuk tidak bakunya:",
      pairs: [
        { left: "Apotek", right: "Apotik" },
        { left: "Ijazah", right: "Ijasah" },
        { left: "Nasihat", right: "Nasehat" },
        { left: "Praktik", right: "Praktek" }
      ],
      explanation: "Kosakata baku menurut pedoman KBBI."
    },
    {
      text: "Pasangkan ungkapan kiasan dengan maknanya:",
      pairs: [
        { left: "Panjang tangan", right: "Suka mencuri" },
        { left: "Besar kepala", right: "Sombong" },
        { left: "Ringan tangan", right: "Suka menolong" },
        { left: "Buah tangan", right: "Oleh-oleh" }
      ],
      explanation: "Makna kiasan ungkapan bahasa Indonesia."
    },
    {
      text: "Pasangkan tanda baca dengan fungsinya:",
      pairs: [
        { left: "Tanda Titik (.)", right: "Mengakhiri kalimat berita" },
        { left: "Tanda Koma (,)", right: "Memisahkan rincian kalimat" },
        { left: "Tanda Tanya (?)", right: "Mengakhiri kalimat tanya" },
        { left: "Tanda Seru (!)", right: "Mengakhiri kalimat perintah/ajakan" }
      ],
      explanation: "Kaidah penggunaan tanda baca PUEBI."
    },
    {
      text: "Pasangkan kata berimbuhan dengan jenis imbuhannya:",
      pairs: [
        { left: "Berlari", right: "Awalan (Prefiks) ber-" },
        { left: "Makanan", right: "Akhiran (Sufiks) -an" },
        { left: "Menyiram", right: "Awalan (Prefiks) me-" },
        { left: "Termurah", right: "Awalan (Prefiks) ter-" }
      ],
      explanation: "Morfologi imbuhan pembentuk kata."
    },
    {
      text: "Pasangkan unsur intrinsik cerita dengan definisinya:",
      pairs: [
        { left: "Tokoh", right: "Pelaku dalam jalannya cerita" },
        { left: "Latar", right: "Waktu dan tempat terjadinya peristiwa" },
        { left: "Alur", right: "Rangkaian urutan jalannya peristiwa" },
        { left: "Amanat", right: "Pesan moral bagi pembaca" }
      ],
      explanation: "Unsur pembangun karya sastra prosa."
    }
  ],

  // IPAS
  5: [
    {
      text: "Pasangkan panca indra manusia dengan fungsinya:",
      pairs: [
        { left: "Mata", right: "Melihat rangsang cahaya" },
        { left: "Telinga", right: "Mendengar gelombang bunyi" },
        { left: "Hidung", right: "Membau aroma zat kimia gas" },
        { left: "Lidah", right: "Mengecap aneka rasa makanan" }
      ],
      explanation: "Fungsi faal panca indra manusia."
    },
    {
      text: "Pasangkan bagian bunga dengan fungsi biologisnya:",
      pairs: [
        { left: "Kelopak bunga", right: "Melindungi kuncup sebelum mekar" },
        { left: "Mahkota bunga", right: "Menarik serangga penyerbuk" },
        { left: "Benang sari", right: "Alat kelamin jantan penghasil serbuk" },
        { left: "Putik", right: "Alat kelamin betina tempat pembuahan" }
      ],
      explanation: "Anatomi organ reproduksi bunga sempurna."
    },
    {
      text: "Pasangkan contoh adaptasi hewan dengan tujuannya:",
      pairs: [
        { left: "Bunglon mengubah warna (mimikri)", right: "Menyamar dari musuh dan mangsa" },
        { left: "Cicak memutuskan ekor (autotomi)", right: "Mengelabui pemangsa yang mengejar" },
        { left: "Unta memiliki punuk", right: "Menyimpan cadangan lemak energi" },
        { left: "Bebek memiliki selaput kaki", right: "Memudahkan berenang dan berjalan di lumpur" }
      ],
      explanation: "Morfologi dan tingkah laku adaptasi hewan."
    },
    {
      text: "Pasangkan jenis gaya dengan contoh peristiwanya:",
      pairs: [
        { left: "Gaya Gravitasi", right: "Buah mangga jatuh ke bawah tanah" },
        { left: "Gaya Gesek", right: "Kampas rem memperlambat laju sepeda" },
        { left: "Gaya Pegas", right: "Anak panah melesat dari busur panah" },
        { left: "Gaya Magnet", right: "Paku besi menempel pada batang magnet" }
      ],
      explanation: "Penerapan konsep gaya mekanik dalam kehidupan."
    },
    {
      text: "Pasangkan bentuk energi dengan contoh bendanya:",
      pairs: [
        { left: "Energi Kinetik", right: "Mobil yang sedang melaju kencang" },
        { left: "Energi Potensial", right: "Buah kelapa tergantung di pohon tinggi" },
        { left: "Energi Kimia", right: "Baterai dan makanan yang kita santap" },
        { left: "Energi Panas (Kalor)", right: "Api kompor yang sedang menyala" }
      ],
      explanation: "Bentuk-bentuk energi di alam semesta."
    },
    {
      text: "Pasangkan sumber energi dengan klasifikasinya:",
      pairs: [
        { left: "Cahaya Matahari", right: "Energi terbarukan tanpa batas" },
        { left: "Minyak Bumi", right: "Energi fosil tidak terbarukan" },
        { left: "Hembusan Angin", right: "Energi terbarukan ramah lingkungan" },
        { left: "Batubara", right: "Energi tambang fosil tidak terbarukan" }
      ],
      explanation: "Klasifikasi sumber energi terbarukan dan tak terbarukan."
    }
  ],

  // Pendidikan Pancasila
  6: [
    {
      text: "Pasangkan tokoh perumus dasar negara dengan kontribusinya:",
      pairs: [
        { left: "Ir. Soekarno", right: "Menyampaikan pidato nama Pancasila 1 Juni 1945" },
        { left: "Mr. Muhammad Yamin", right: "Menyampaikan lima usulan asas dasar negara" },
        { left: "Prof. Dr. Soepomo", right: "Mengusulkan paham negara kesatuan integralistik" },
        { left: "Drs. Mohammad Hatta", right: "Memimpin perubahan sila pertama demi persatuan" }
      ],
      explanation: "Peran tokoh pendiri bangsa dalam perumusan dasar negara."
    },
    {
      text: "Pasangkan hak dan kewajiban anak di lingkungan keluarga:",
      pairs: [
        { left: "Mendapat kasih sayang orang tua", right: "Hak anak di rumah" },
        { left: "Membantu merapikan tempat tidur", right: "Kewajiban anak di rumah" },
        { left: "Mendapat makanan bergizi dan pakaian", right: "Hak anak di rumah" },
        { left: "Mematuhi nasihat baik orang tua", right: "Kewajiban anak di rumah" }
      ],
      explanation: "Keseimbangan hak dan kewajiban anak di rumah."
    },
    {
      text: "Pasangkan hak dan kewajiban siswa di lingkungan sekolah:",
      pairs: [
        { left: "Mendapat bimbingan ilmu dari guru", right: "Hak siswa di sekolah" },
        { left: "Memakai seragam rapi sesuai jadwal", right: "Kewajiban siswa di sekolah" },
        { left: "Meminjam buku di perpustakaan", right: "Hak siswa di sekolah" },
        { left: "Mengikuti piket kebersihan kelas", right: "Kewajiban siswa di sekolah" }
      ],
      explanation: "Keseimbangan hak dan kewajiban siswa di sekolah."
    },
    {
      text: "Pasangkan senjata tradisional dengan daerah asalnya:",
      pairs: [
        { left: "Rencong", right: "Aceh" },
        { left: "Keris", right: "Jawa Tengah & DI Yogyakarta" },
        { left: "Mandau", right: "Kalimantan Barat / Dayak" },
        { left: "Badik", right: "Sulawesi Selatan" }
      ],
      explanation: "Warisan senjata tradisional nusantara."
    },
    {
      text: "Pasangkan makna kata dalam semboyan Bhinneka Tunggal Ika:",
      pairs: [
        { left: "Bhinneka", right: "Beraneka ragam atau berbeda-beda" },
        { left: "Tunggal", right: "Satu kesatuan" },
        { left: "Ika", right: "Jua / itu jua" },
        { left: "Bhinneka Tunggal Ika", right: "Berbeda-beda tetapi tetap satu jua" }
      ],
      explanation: "Arti harfiah semboyan kebangsaan Indonesia dari Kitab Sutasoma."
    },
    {
      text: "Pasangkan pakaian adat tradisional dengan daerahnya:",
      pairs: [
        { left: "Kain Ulos", right: "Sumatera Utara (Batak)" },
        { left: "Baju Bodo", right: "Sulawesi Selatan (Bugis/Makassar)" },
        { left: "Kebaya & Beskap", right: "Jawa Tengah" },
        { left: "Baju Teluk Belanga", right: "Riau (Melayu)" }
      ],
      explanation: "Keragaman pakaian adat suku-suku di Indonesia."
    }
  ],

  // Akidah Akhlak
  7: [
    {
      text: "Pasangkan Asmaul Husna dengan maknanya:",
      pairs: [
        { left: "Al-Adl", right: "Allah Maha Adil" },
        { left: "Al-Ghaffar", right: "Allah Maha Pengampun" },
        { left: "Al-Wahhab", right: "Allah Maha Pemberi Karunia" },
        { left: "Al-Fattah", right: "Allah Maha Pembuka Rahmat" }
      ],
      explanation: "Makna Asmaul Husna pilihan."
    },
    {
      text: "Pasangkan sifat terpuji (mahmudah) dengan perilakunya:",
      pairs: [
        { left: "Tawadhu", right: "Rendah hati dan tidak bersikap sombong" },
        { left: "Qanaah", right: "Merasa cukup dan bersyukur atas rezeki Allah" },
        { left: "Amanah", right: "Menjaga titipan dan menepati janji" },
        { left: "Sabar", right: "Tabah dan tidak mengeluh saat tertimpa ujian" }
      ],
      explanation: "Definisi akhlak mahmudah dalam kehidupan."
    },
    {
      text: "Pasangkan sifat tercela (mazmumah) dengan perilakunya:",
      pairs: [
        { left: "Takabur", right: "Sombong dan meremehkan orang lain" },
        { left: "Riya", right: "Pamer amal ibadah demi pujian manusia" },
        { left: "Hasad", right: "Dengki dan tidak suka orang lain dapat nikmat" },
        { left: "Namimah", right: "Mengadu domba agar terjadi perpecahan" }
      ],
      explanation: "Bahaya penyakit hati akhlak mazmumah."
    },
    {
      text: "Pasangkan 4 sifat wajib rasul dengan lawannya (sifat mustahil):",
      pairs: [
        { left: "Siddiq (Benar/Jujur)", right: "Kizzib (Dusta/Bohong)" },
        { left: "Amanah (Dapat Dipercaya)", right: "Khianat (Curang/Mengingkari)" },
        { left: "Tabligh (Menyampaikan)", right: "Kitman (Menyembunyikan)" },
        { left: "Fathanah (Cerdas)", right: "Baladah (Bodoh/Lalai)" }
      ],
      explanation: "Sifat wajib dan sifat mustahil bagi para rasul Allah."
    },
    {
      text: "Pasangkan mukjizat nabi Allah dengan namanya:",
      pairs: [
        { left: "Bahtera besar penyelamat dari banjir", right: "Nabi Nuh a.s." },
        { left: "Tidak hangus saat dibakar api Namrud", right: "Nabi Ibrahim a.s." },
        { left: "Tongkat berubah menjadi ular besar", right: "Nabi Musa a.s." },
        { left: "Al-Qur'an sebagai mukjizat abadi", right: "Nabi Muhammad SAW" }
      ],
      explanation: "Mukjizat agung para nabi Allah SWT."
    }
  ],

  // Al-Qur'an Hadis
  8: [
    {
      text: "Pasangkan surah pendek dengan pesan pokok kandungannya:",
      pairs: [
        { left: "Surah Al-Ikhlas", right: "Pemurnian tauhid keesaan Allah SWT" },
        { left: "Surah Al-Falaq", right: "Memohon perlindungan dari kejahatan malam" },
        { left: "Surah An-Nas", right: "Memohon perlindungan dari bisikan setan" },
        { left: "Surah An-Nasr", right: "Kabar gembira pertolongan dan kemenangan Islam" }
      ],
      explanation: "Pesan utama surah pendek juz 30."
    },
    {
      text: "Pasangkan hukum bacaan tajwid dengan contoh bacaannya:",
      pairs: [
        { left: "Izhar Halqi", right: "Man aamana (Nun mati bertemu hamzah)" },
        { left: "Idgham Bighunnah", right: "May yaquulu (Nun mati bertemu ya)" },
        { left: "Iqlab", right: "Mim ba'di (Nun mati bertemu ba)" },
        { left: "Ikhfa Haqiqi", right: "Min qablikum (Nun mati bertemu qaf)" }
      ],
      explanation: "Contoh penerapan hukum tajwid nun sukun dan tanwin."
    },
    {
      text: "Pasangkan nama surah dengan artinya:",
      pairs: [
        { left: "Al-Fiil", right: "Gajah" },
        { left: "Al-Ma'un", right: "Barang-Barang yang Berguna" },
        { left: "Al-Kafirun", right: "Orang-Orang Kafir" },
        { left: "Al-Qari'ah", right: "Hari Kiamat yang Mengguncang" }
      ],
      explanation: "Arti nama surah juz amma."
    },
    {
      text: "Pasangkan hukum mad dasar dengan panjang ketukannya:",
      pairs: [
        { left: "Mad Thabi'i (Mad Asli)", right: "2 harakat (1 alif)" },
        { left: "Mad Wajib Muttashil", right: "4 - 5 harakat" },
        { left: "Mad Jaiz Munfashil", right: "2 - 5 harakat" },
        { left: "Mad Lazim Kilmi Mutsaqqal", right: "6 harakat penuh" }
      ],
      explanation: "Panjang ketukan harakat hukum mad."
    }
  ],

  // Fikih
  9: [
    {
      text: "Pasangkan shalat fardhu dengan waktu masuknya:",
      pairs: [
        { left: "Shalat Subuh", right: "Terbit fajar shadiq hingga terbit matahari" },
        { left: "Shalat Dzuhur", right: "Matahari tergelincir ke barat hingga bayangan sama panjang" },
        { left: "Shalat Ashar", right: "Bayangan lebih panjang dari benda hingga matahari terbenam" },
        { left: "Shalat Maghrib", right: "Matahari terbenam hingga mega merah hilang" }
      ],
      explanation: "Jadwal waktu masuk shalat lima waktu."
    },
    {
      text: "Pasangkan gerakan shalat dengan bacaan doanya:",
      pairs: [
        { left: "Rukuk", right: "Subhana rabbiyal azhimi wa bihamdih" },
        { left: "Sujud", right: "Subhana rabbiyal a'la wa bihamdih" },
        { left: "Itidal", right: "Rabbana lakal hamdu mil'us-samaawaati" },
        { left: "Duduk di antara dua sujud", right: "Rabbighfirlii warhamnii wajburnii" }
      ],
      explanation: "Bacaan zikir rukun fi'li dalam shalat."
    },
    {
      text: "Pasangkan syarat sah shalat dengan maknanya:",
      pairs: [
        { left: "Suci dari hadas kecil dan besar", right: "Sudah berwudhu atau mandi wajib" },
        { left: "Menutup aurat", right: "Memakai pakaian yang menutup batas aurat" },
        { left: "Masuk waktu shalat", right: "Waktu shalat telah tiba secara pasti" },
        { left: "Menghadap kiblat", right: "Menghadap ke arah Ka'bah di Makkah" }
      ],
      explanation: "Syarat sah mendirikan shalat."
    },
    {
      text: "Pasangkan hal yang membatalkan wudhu:",
      pairs: [
        { left: "Keluarnya sesuatu dari dua jalan", right: "Buang air kecil, besar, atau buang angin" },
        { left: "Hilang akal", right: "Tidur lelap, pingsan, atau mabuk" },
        { left: "Bersentuhan kulit berlainan jenis non-mahram", right: "Membatalkan wudhu menurut mazhab Syafii" },
        { left: "Menyentuh kemaluan dengan telapak tangan", right: "Tanpa penghalang membatalkan wudhu" }
      ],
      explanation: "Perkara yang membatalkan kesucian wudhu."
    }
  ],

  // SKI
  10: [
    {
      text: "Pasangkan khalifah rasyidin dengan jasanya:",
      pairs: [
        { left: "Abu Bakar Ash-Shiddiq", right: "Memerangi nabi palsu dan membukukan Al-Qur'an" },
        { left: "Umar bin Khattab", right: "Menetapkan kalender Hijriyah dan memperluas wilayah" },
        { left: "Utsman bin Affan", right: "Standarisasi mushaf Al-Qur'an (Mushaf Utsmani)" },
        { left: "Ali bin Abi Thalib", right: "Mengembangkan tata bahasa Arab dan ilmu hukum" }
      ],
      explanation: "Prestasi kepemimpinan Khulafaur Rasyidin."
    },
    {
      text: "Pasangkan nama tahun dan peristiwa dalam sejarah Nabi:",
      pairs: [
        { left: "Tahun Gajah ('Amul Fil)", right: "Kelahiran Nabi dan pasukan Abrahah menyerang Ka'bah" },
        { left: "Tahun Kesedihan ('Amul Huzni)", right: "Wafatnya Siti Khadijah dan Abu Thalib" },
        { left: "Tahun Yatsrib / 1 Hijriyah", right: "Dimulainya penanggalan Hijriyah setelah hijrah" },
        { left: "Fathu Makkah (8 H)", right: "Pembebasan kota Makkah secara damai tanpa darah" }
      ],
      explanation: "Peristiwa penanda tarikh sejarah Islam."
    },
    {
      text: "Pasangkan sahabat Anshar dan Muhajirin yang dipersaudarakan:",
      pairs: [
        { left: "Abu Bakar Ash-Shiddiq", right: "Dipersaudarakan dengan Kharijah bin Zaid" },
        { left: "Umar bin Khattab", right: "Dipersaudarakan dengan Itban bin Malik" },
        { left: "Abdurrahman bin Auf", right: "Dipersaudarakan dengan Sa'ad bin Ar-Rabi'" },
        { left: "Ali bin Abi Thalib", right: "Dipersaudarakan langsung dengan Rasulullah SAW" }
      ],
      explanation: "Ukhuwah Islamiyah Muhajirin dan Anshar di Madinah."
    }
  ],

  // Bahasa Arab
  11: [
    {
      text: "Pasangkan kata ganti (dhamir) bahasa Arab dengan artinya:",
      pairs: [
        { left: "أَنَا (Ana)", right: "Saya / Aku" },
        { left: "أَنْتَ (Anta)", right: "Kamu (laki-laki)" },
        { left: "أَنْتِ (Anti)", right: "Kamu (perempuan)" },
        { left: "هُوَ (Huwa)", right: "Dia (laki-laki)" }
      ],
      explanation: "Dhamir munfashil dasar bahasa Arab."
    },
    {
      text: "Pasangkan kosakata profesi bahasa Arab dengan artinya:",
      pairs: [
        { left: "مُدَرِّسٌ (Mudarrisun)", right: "Guru laki-laki" },
        { left: "طَبِيْبٌ (Thabiibun)", right: "Dokter laki-laki" },
        { left: "شُرْطِيٌّ (Syurthiyyun)", right: "Polisi" },
        { left: "فَلَّاحٌ (Fallaahun)", right: "Petani" }
      ],
      explanation: "Kosakata profesi (al-mihnah) bahasa Arab."
    },
    {
      text: "Pasangkan kata petunjuk (isim isyarah) dengan maknanya:",
      pairs: [
        { left: "هٰذَا (Haadzaa)", right: "Ini (untuk benda laki-laki / mudzakkar)" },
        { left: "هٰذِهِ (Haadzihii)", right: "Ini (untuk benda perempuan / muannats)" },
        { left: "ذٰلِكَ (Dzaalika)", right: "Itu (untuk benda laki-laki / mudzakkar)" },
        { left: "تِلْكَ (Tilka)", right: "Itu (untuk benda perempuan / muannats)" }
      ],
      explanation: "Isim isyarah petunjuk dekat dan jauh."
    },
    {
      text: "Pasangkan kata sifat bahasa Arab dengan artinya:",
      pairs: [
        { left: "كَبِيْرٌ (Kabiirun)", right: "Besar" },
        { left: "صَغِيْرٌ (Shaghiirun)", right: "Kecil" },
        { left: "نَظِيْفٌ (Nazhiifun)", right: "Bersih" },
        { left: "جَمِيْلٌ (Jamiilun)", right: "Indah / Bagus" }
      ],
      explanation: "Kata sifat (na'at) umum dalam percakapan Arab."
    }
  ],

  // PJOK
  12: [
    {
      text: "Pasangkan teknik dasar permainan sepak bola dengan gerakannya:",
      pairs: [
        { left: "Passing (Mengoper)", right: "Menendang bola mendatar ke arah teman seregu" },
        { left: "Dribbling (Menggiring)", right: "Mendorong bola perlahan sambil berlari" },
        { left: "Shooting (Menembak)", right: "Menendang bola keras ke arah gawang lawan" },
        { left: "Heading (Menyundul)", right: "Mengarahkan bola menggunakan dahi kepala" }
      ],
      explanation: "Teknik keterampilan dasar bermain sepak bola."
    },
    {
      text: "Pasangkan teknik dasar bola voli dengan fungsinya:",
      pairs: [
        { left: "Passing Bawah", right: "Menerima servis lawan dengan kedua lengan rapat" },
        { left: "Passing Atas", right: "Mengumpan bola lambung menggunakan ujung jari" },
        { left: "Servis", right: "Pukulan awal tanda dimulainya reli permainan" },
        { left: "Smash", right: "Pukulan keras menukik ke bidang lapangan lawan" }
      ],
      explanation: "Teknik dasar bermain bola voli."
    },
    {
      text: "Pasangkan komponen kebugaran jasmani dengan latihan pengembangannya:",
      pairs: [
        { left: "Kekuatan Otot Lengan", right: "Latihan push-up secara teratur" },
        { left: "Kekuatan Otot Perut", right: "Latihan sit-up bertahap" },
        { left: "Kelenturan Tubuh", right: "Mencium lutut dan peregangan statis" },
        { left: "Daya Tahan Jantung", right: "Lari santai jogging selama 15 menit" }
      ],
      explanation: "Bentuk latihan komponen kebugaran fisik."
    },
    {
      text: "Pasangkan pola makan sehat 4 sehat 5 sempurna:",
      pairs: [
        { left: "Makanan Pokok (Nasi, Jagung)", right: "Sumber karbohidrat tenaga utama" },
        { left: "Lauk Pauk (Ikan, Telur, Tempe)", right: "Sumber protein pembangun jaringan tubuh" },
        { left: "Sayur & Buah", right: "Sumber vitamin dan mineral serat alami" },
        { left: "Susu", right: "Penyempurna gizi kaya kalsium tulang" }
      ],
      explanation: "Pedoman gizi seimbang untuk pertumbuhan anak."
    }
  ],

  // Seni Budaya
  13: [
    {
      text: "Pasangkan jenis karya seni rupa berdasarkan dimensinya:",
      pairs: [
        { left: "Seni Rupa 2 Dimensi", right: "Lukisan, gambar, foto (panjang & lebar)" },
        { left: "Seni Rupa 3 Dimensi", right: "Patung, gerabah, keramik (ada volume ruang)" },
        { left: "Seni Rupa Murni", right: "Karya yang dinikmati keindahannya saja" },
        { left: "Seni Rupa Terapan", right: "Karya yang memiliki nilai fungsi pakai" }
      ],
      explanation: "Klasifikasi ragam bentuk seni rupa."
    },
    {
      text: "Pasangkan percampuran warna sekunder:",
      pairs: [
        { left: "Merah + Kuning", right: "Warna Jingga / Oranye" },
        { left: "Kuning + Biru", right: "Warna Hijau" },
        { left: "Merah + Biru", right: "Warna Ungu" },
        { left: "Merah + Putih", right: "Warna Merah Muda / Pink" }
      ],
      explanation: "Teori percampuran warna pigmen dasar."
    },
    {
      text: "Pasangkan jenis motif batik dengan karakteristiknya:",
      pairs: [
        { left: "Motif Parang", right: "Garis miring berombak menyerupai ombak karang" },
        { left: "Motif Kawung", right: "Bentuk bulatan menyerupai buah kelapa/aren" },
        { left: "Motif Megamendung", right: "Lengkungan awan bertingkat khas Cirebon" },
        { left: "Motif Bunga / Buketan", right: "Rangkaian bunga dan burung khas pesisir" }
      ],
      explanation: "Filosofi motif batik warisan leluhur nusantara."
    },
    {
      text: "Pasangkan jenis alat musik dengan cara memainkannya:",
      pairs: [
        { left: "Gitar & Kecapi", right: "Dimainkan dengan cara dipetik" },
        { left: "Seruling & Terompet", right: "Dimainkan dengan cara ditiup" },
        { left: "Kendang & Drum", right: "Dimainkan dengan cara dipukul" },
        { left: "Biola & Rebab", right: "Dimainkan dengan cara digesek" }
      ],
      explanation: "Klasifikasi cara membunyikan instrumen musik."
    }
  ],

  // Bahasa Inggris
  14: [
    {
      text: "Match the family members with their Indonesian meanings:",
      pairs: [
        { left: "Father", right: "Ayah" },
        { left: "Mother", right: "Ibu" },
        { left: "Brother", right: "Saudara Laki-Laki" },
        { left: "Sister", right: "Saudara Perempuan" }
      ],
      explanation: "Family members vocabulary."
    },
    {
      text: "Match the animal names in English with Indonesian translations:",
      pairs: [
        { left: "Cat", right: "Kucing" },
        { left: "Dog", right: "Anjing" },
        { left: "Bird", right: "Burung" },
        { left: "Fish", right: "Ikan" }
      ],
      explanation: "Common animal vocabulary."
    },
    {
      text: "Match the English numbers with figures:",
      pairs: [
        { left: "Ten", right: "10" },
        { left: "Twenty", right: "20" },
        { left: "Fifty", right: "50" },
        { left: "One hundred", right: "100" }
      ],
      explanation: "Cardinal numbers in English."
    },
    {
      text: "Match the opposite adjectives in English:",
      pairs: [
        { left: "Hot", right: "Cold" },
        { left: "Happy", right: "Sad" },
        { left: "Fast", right: "Slow" },
        { left: "Tall", right: "Short" }
      ],
      explanation: "Common opposite adjectives in English."
    }
  ]
};

async function main() {
  const database = db.getDb();
  console.log('=== MEMULAI PENAMBAHAN SOAL ORDERING & MATCHING TERKURASI ===');

  const subjs = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  let totalOrd = 0;
  let totalMatch = 0;

  for (const sId of subjs) {
    const s = database.prepare('SELECT name FROM subjects WHERE id=?').get(sId);
    if (!s) continue;
    console.log(`\nMemproses Mapel [${sId}] ${s.name}...`);

    // ORDERING
    const ordList = EXTRA_ORDERING[sId] || [];
    let ordAdded = 0;
    for (const item of ordList) {
      const typeData = {
        items: item.items,
        correctOrder: item.items.map((_, idx) => idx)
      };
      const valid = validateQuestionData('ORDERING', typeData);
      if (!valid.valid) {
        console.warn(`[WARN] Validasi ORDERING gagal: ${valid.error}`);
        continue;
      }
      const h = questionHash(item.text + ':ORD_EXTRA');
      database.prepare(`
        INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty, hash, is_active, question_type, type_data_json)
        VALUES(?, ?, ?, 0, ?, 2, 2, ?, 1, 'ORDERING', ?)
        ON CONFLICT(subject_id, hash) DO UPDATE SET
          options_json=excluded.options_json,
          explanation=excluded.explanation,
          type_data_json=excluded.type_data_json,
          is_active=1
      `).run(sId, item.text, JSON.stringify(item.items), item.explanation, h, JSON.stringify(typeData));
      ordAdded++;
      totalOrd++;
    }
    console.log(`  ✓ Menambahkan ${ordAdded} soal ORDERING baru.`);

    // MATCHING
    const matchList = EXTRA_MATCHING[sId] || [];
    let matchAdded = 0;
    for (const item of matchList) {
      const typeData = { pairs: item.pairs };
      const valid = validateQuestionData('MATCHING', typeData);
      if (!valid.valid) {
        console.warn(`[WARN] Validasi MATCHING gagal: ${valid.error}`);
        continue;
      }
      const h = questionHash(item.text + ':MATCH_EXTRA');
      const optLabels = item.pairs.map(p => p.left);
      database.prepare(`
        INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty, hash, is_active, question_type, type_data_json)
        VALUES(?, ?, ?, 0, ?, 2, 2, ?, 1, 'MATCHING', ?)
        ON CONFLICT(subject_id, hash) DO UPDATE SET
          options_json=excluded.options_json,
          explanation=excluded.explanation,
          type_data_json=excluded.type_data_json,
          is_active=1
      `).run(sId, item.text, JSON.stringify(optLabels), item.explanation, h, JSON.stringify(typeData));
      matchAdded++;
      totalMatch++;
    }
    console.log(`  ✓ Menambahkan ${matchAdded} soal MATCHING baru.`);

    // Update count mapel
    const updatedCount = database.prepare("SELECT COUNT(*) as c FROM questions WHERE subject_id=? AND is_active=1").get(sId).c;
    database.prepare("UPDATE subjects SET question_count=? WHERE id=?").run(updatedCount, sId);
    console.log(`  ✓ Total soal mapel sekarang: ${updatedCount}.`);
  }

  console.log('\n=== RINGKASAN PENAMBAHAN ===');
  console.log(`- Total ORDERING baru ditambahkan: ${totalOrd}`);
  console.log(`- Total MATCHING baru ditambahkan: ${totalMatch}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
