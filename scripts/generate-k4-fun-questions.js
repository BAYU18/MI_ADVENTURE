/**
 * Skrip Duplikasi & Pembuatan Soal Kelas 4 SD (5 Tipe: MCQ, TRUE_FALSE, ORDERING, MATCHING, SHORT)
 * Memastikan 100% validasi validateQuestionData dan kompatibilitas grading engine
 */

const crypto = require('crypto');
const db = require('../lib/db.js');
const { validateQuestionData } = require('../shared/grading.js');

function questionHash(text) {
  return crypto.createHash('sha1')
    .update(String(text || '').toLowerCase().trim().replace(/\s+/g, ' '))
    .digest('hex');
}

// Data kurasi untuk ORDERING & MATCHING per mapel Kelas 4 SD
const CURATED_ORDERING = {
  // Matematika
  1: [
    {
      text: "Urutkan bilangan cacah berikut dari yang terkecil ke terbesar:",
      items: ["1.250", "2.150", "3.075", "4.500"],
      explanation: "Urutan dari nilai tempat ribuan terkecil: 1.250 < 2.150 < 3.075 < 4.500."
    },
    {
      text: "Urutkan pecahan berikut dari yang nilainya terkecil ke terbesar:",
      items: ["1/8", "1/4", "1/2", "3/4"],
      explanation: "Semakin besar penyebut pada pembilang yang sama, nilainya semakin kecil: 1/8 (0,125) < 1/4 (0,25) < 1/2 (0,5) < 3/4 (0,75)."
    },
    {
      text: "Urutkan satuan panjang berikut dari yang terpendek ke terpanjang:",
      items: ["Milimeter (mm)", "Sentimeter (cm)", "Meter (m)", "Kilometer (km)"],
      explanation: "Tangga satuan panjang: mm < cm < m < km."
    },
    {
      text: "Urutkan satuan waktu berikut dari durasi tersingkat ke terlama:",
      items: ["Detik", "Menit", "Jam", "Hari"],
      explanation: "1 menit = 60 detik, 1 jam = 60 menit, 1 hari = 24 jam."
    },
    {
      text: "Urutkan bilangan desimal berikut dari yang terkecil ke terbesar:",
      items: ["0,05", "0,25", "0,5", "1,2"],
      explanation: "Urutan nilai persepuluhan dan perseratusan: 0,05 < 0,25 < 0,5 < 1,2."
    },
    {
      text: "Urutkan bangun datar berikut berdasarkan jumlah sisinya dari yang paling sedikit:",
      items: ["Segitiga", "Segiempat", "Segilima", "Segienam"],
      explanation: "Segitiga (3 sisi), Segiempat (4 sisi), Segilima (5 sisi), Segienam (6 sisi)."
    },
    {
      text: "Urutkan hasil perkalian berikut dari yang terkecil ke terbesar:",
      items: ["6 × 4 (24)", "5 × 6 (30)", "7 × 6 (42)", "8 × 7 (56)"],
      explanation: "24 < 30 < 42 < 56."
    },
    {
      text: "Urutkan satuan berat berikut dari yang teringan ke terberat:",
      items: ["Miligram (mg)", "Gram (g)", "Ons (hg)", "Kilogram (kg)"],
      explanation: "mg < g < ons < kg."
    },
    {
      text: "Urutkan pecahan senilai dengan penyebut makin besar dari 1/2:",
      items: ["1/2", "2/4", "3/6", "4/8"],
      explanation: "Semua pecahan memiliki nilai sama (0,5) dengan urutan pembilang/penyebut membesar."
    },
    {
      text: "Urutkan langkah penyelesaian operasi hitung campuran: 5 + (3 × 4):",
      items: ["Kerjakan operasi di dalam kurung (3 × 4 = 12)", "Lakukan operasi penjumlahan (5 + 12)", "Dapatkan hasil akhir yaitu 17"],
      explanation: "Sesuai aturan hierarki kabataku, operasi dalam kurung didahulukan."
    }
  ],

  // Bahasa Indonesia
  4: [
    {
      text: "Urutkan alur struktur teks narasi (cerita fiksi) yang benar:",
      items: ["Orientasi (Pengenalan)", "Komplikasi (Muncul Masalah)", "Klimaks (Puncak Masalah)", "Resolusi (Penyelesaian)"],
      explanation: "Struktur teks narasi mengalir dari pengenalan tokoh/latar hingga penyelesaian masalah."
    },
    {
      text: "Urutkan langkah mencari arti kata di dalam Kamus Besar Bahasa Indonesia (KBBI):",
      items: ["Tentukan kata dasar yang dicari", "Buka kamus sesuai abjad huruf pertama", "Cari turunan kata berimbuhan", "Baca definisi arti kata"],
      explanation: "Langkah leksikografi KBBI dimulai dari identifikasi kata dasar."
    },
    {
      text: "Urutkan kata-kata berikut menjadi kalimat transitif yang padu:",
      items: ["Rani", "menulis", "surat pribadi", "untuk nenek"],
      explanation: "Pola S-P-O-K: Rani (S) menulis (P) surat pribadi (O) untuk nenek (K)."
    },
    {
      text: "Urutkan langkah membuat teks petunjuk cara mencuci tangan:",
      items: ["Basahi tangan dengan air bersih mengalir", "Gunakan sabun dan gosok sela-sela jari", "Bilas tangan hingga bersih dari busa", "Keringkan dengan kain atau tisu bersih"],
      explanation: "Urutan logis mencuci tangan higienis menurut panduan kesehatan."
    },
    {
      text: "Urutkan unsur pembangun kalimat (pola dasar bahasa Indonesia):",
      items: ["Subjek (S)", "Predikat (P)", "Objek (O)", "Keterangan (K)"],
      explanation: "Pola dasar kalimat lengkap bahasa Indonesia adalah S-P-O-K."
    },
    {
      text: "Urutkan langkah meminjam buku di perpustakaan sekolah:",
      items: ["Pilih buku yang diinginkan di rak", "Bawa buku ke meja petugas perpustakaan", "Tunjukkan kartu anggota perpustakaan", "Catat tanggal pengembalian dan bawa pulang"],
      explanation: "Prosedur baku peminjaman buku perpustakaan."
    },
    {
      text: "Urutkan kata-kata acak berikut menjadi kalimat yang benar:",
      items: ["Ibu guru", "menerangkan", "pelajaran membaca", "di depan kelas"],
      explanation: "Ibu guru (S) menerangkan (P) pelajaran membaca (O) di depan kelas (K)."
    },
    {
      text: "Urutkan tingkatan buku fiksi dari yang paling sederhana hingga berbab:",
      items: ["Buku bergambar (Picture book)", "Buku cerita pendek anak", "Novel anak berbab (Chapter book)"],
      explanation: "Tingkat perkembangan bacaan anak SD."
    }
  ],

  // IPAS
  5: [
    {
      text: "Urutkan tahapan metamorfosis sempurna pada kupu-kupu:",
      items: ["Telur", "Ulat (Larva)", "Kepompong (Pupa)", "Kupu-kupu dewasa (Imago)"],
      explanation: "Daur hidup kupu-kupu: Telur -> Larva -> Pupa -> Imago."
    },
    {
      text: "Urutkan tahapan siklus air di bumi:",
      items: ["Evaporasi (Penguapan)", "Kondensasi (Pengembunan)", "Presipitasi (Turun Hujan)", "Infiltrasi (Penyerapan ke Tanah)"],
      explanation: "Air menguap (evaporasi), membentuk awan (kondensasi), jatuh jadi hujan (presipitasi), meresap ke tanah (infiltrasi)."
    },
    {
      text: "Urutkan organ saluran pencernaan manusia dari awal sampai akhir:",
      items: ["Mulut", "Kerongkongan (Esofagus)", "Lambung", "Usus Halus", "Usus Besar"],
      explanation: "Makanan masuk lewat mulut, kerongkongan, lambung, usus halus, usus besar, lalu anus."
    },
    {
      text: "Urutkan rantai makanan ekosistem sawah dari tingkat trofik terendah:",
      items: ["Padi (Produsen)", "Belalang (Konsumen I)", "Katak (Konsumen II)", "Ular (Konsumen III)"],
      explanation: "Produsen (padi) dimakan herbivora (belalang), dimakan karnivora (katak), dimakan predator puncak (ular)."
    },
    {
      text: "Urutkan tahapan perkecambahan dan pertumbuhan tumbuhan kacang hijau:",
      items: ["Biji menyerap air", "Muncul akar kecambah (radikula)", "Muncul daun pertama", "Tumbuh batang dan daun sempurna"],
      explanation: "Tahapan fisiologi perkecambahan biji."
    },
    {
      text: "Urutkan planet-planet tata surya dari yang paling dekat ke matahari:",
      items: ["Merkurius", "Venus", "Bumi", "Mars"],
      explanation: "Urutan 4 planet kebumian terdekat dari matahari."
    },
    {
      text: "Urutkan perubahan wujud zat dari padat menjadi gas melalui cair:",
      items: ["Es padat", "Mencair jadi air", "Menguap jadi uap air"],
      explanation: "Es padat mencair menjadi air cair, lalu mendidih dan menguap menjadi uap air."
    },
    {
      text: "Urutkan lapisan struktur bumi dari permukaan terluar menuju pusat:",
      items: ["Kerak bumi", "Mantel bumi", "Inti luar bumi", "Inti dalam bumi"],
      explanation: "Struktur lapisan bumi dari luar ke dalam."
    }
  ],

  // Pendidikan Pancasila
  6: [
    {
      text: "Urutkan sila-sila Pancasila dari sila pertama hingga sila kelima:",
      items: ["Ketuhanan Yang Maha Esa", "Kemanusiaan yang Adil dan Beradab", "Persatuan Indonesia", "Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan...", "Keadilan Sosial bagi Seluruh Rakyat Indonesia"],
      explanation: "Urutan resmi lima sila dasar negara Indonesia."
    },
    {
      text: "Urutkan lambang sila Pancasila dari sila ke-1 sampai ke-5:",
      items: ["Bintang Emas", "Rantai Baja", "Pohon Beringin", "Kepala Banteng", "Padi dan Kapas"],
      explanation: "Simbol perisai Garuda Pancasila: Sila 1 (Bintang), 2 (Rantai), 3 (Pohon Beringin), 4 (Kepala Banteng), 5 (Padi dan Kapas)."
    },
    {
      text: "Urutkan tahapan musyawarah mufakat di lingkungan kelas:",
      items: ["Menyampaikan usulan atau pendapat", "Mendiskusikan kelebihan dan kekurangan usulan", "Menyepakati keputusan bersama", "Melaksanakan hasil mufakat dengan penuh tanggung jawab"],
      explanation: "Tahapan demokratis musyawarah mufakat di sekolah."
    },
    {
      text: "Urutkan tingkatan norma dari sanksi yang paling ringan hingga paling berat:",
      items: ["Norma Cara (Usage)", "Norma Kebiasaan (Folkways)", "Norma Tata Kelakuan (Mores)", "Norma Hukum"],
      explanation: "Klasifikasi kekuatan mengikat norma sosial di masyarakat."
    },
    {
      text: "Urutkan langkah pemilihan ketua kelas secara demokratis:",
      items: ["Pencalonan kandidat ketua kelas", "Penyampaian visi dan rencana kerja", "Pemungutan suara seluruh siswa", "Penetapan dan pelantikan ketua kelas"],
      explanation: "Proses pemilihan ketua kelas yang jurdil."
    },
    {
      text: "Urutkan wilayah administrasi pemerintahan dari tingkat terkecil:",
      items: ["Rukun Tetangga (RT)", "Rukun Warga (RW)", "Kelurahan / Desa", "Kecamatan"],
      explanation: "Struktur hierarki wilayah administrasi pemerintahan daerah."
    }
  ],

  // Akidah Akhlak
  7: [
    {
      text: "Urutkan rukun iman dari yang pertama hingga yang keenam:",
      items: ["Iman kepada Allah SWT", "Iman kepada Malaikat-Nya", "Iman kepada Kitab-Kitab-Nya", "Iman kepada Rasul-Rasul-Nya", "Iman kepada Hari Akhir", "Iman kepada Qada dan Qadar"],
      explanation: "Urutan enam rukun iman yang wajib diyakini setiap muslim."
    },
    {
      text: "Urutkan kalimat zikir harian yang dianjurkan dibaca setelah shalat:",
      items: ["Subhanallah (Maha Suci Allah)", "Alhamdulillah (Segala Puji bagi Allah)", "Allahu Akbar (Allah Maha Besar)", "Laa ilaaha illallah"],
      explanation: "Urutan zikir tasbih, tahmid, takbir, dan tahlil."
    },
    {
      text: "Urutkan adab bertamu dalam ajaran Islam:",
      items: ["Mengetuk pintu dan mengucap salam maksimal 3 kali", "Menunggu izin dari tuan rumah", "Duduk di tempat yang dipersilakan", "Berpamitan dan mendoakan kebaikan bagi tuan rumah"],
      explanation: "Adab bertamu sesuai sunnah Nabi Muhammad SAW."
    },
    {
      text: "Urutkan Asmaul Husna berikut berdasarkan kemuliaan sifat-Nya:",
      items: ["Al-Malik (Maha Merajai)", "Al-Quddus (Maha Suci)", "As-Salam (Maha Sejahtera)", "Al-Mu'min (Maha Memberi Keamanan)"],
      explanation: "Empat Asmaul Husna yang dipelajari pada materi Akidah Akhlak Kelas 4."
    },
    {
      text: "Urutkan adab makan dan minum menurut ajaran Islam:",
      items: ["Mencuci kedua tangan", "Membaca basmalah dan doa makan", "Makan dan minum sambil duduk dengan tangan kanan", "Membaca hamdalah dan doa setelah makan"],
      explanation: "Sunnah adab makan dan minum dalam Islam."
    }
  ],

  // Al-Qur'an Hadis
  8: [
    {
      text: "Urutkan surah-surah pendek berikut berdasarkan urutan nomor surah dalam mushaf Al-Qur'an:",
      items: ["Surah Al-Kafirun (109)", "Surah An-Nasr (110)", "Surah Al-Lahab (111)", "Surah Al-Ikhlas (112)"],
      explanation: "Nomor surah dalam mushaf Al-Qur'an: Al-Kafirun (109) -> An-Nasr (110) -> Al-Lahab (111) -> Al-Ikhlas (112)."
    },
    {
      text: "Urutkan ayat-ayat dalam Surah An-Nasr dari ayat pertama hingga ketiga:",
      items: ["Idza jaa-a nashrullahi wal-fath", "Wa ra-aitan naasa yadkhuluuna fii diinillahi afwaajaa", "Fa sabbih bihamdi rabbika wastaghfirh, innahu kaana tawwaabaa"],
      explanation: "Urutan lengkap 3 ayat Surah An-Nasr."
    },
    {
      text: "Urutkan hukum bacaan nun sukun/tanwin dari yang dibaca jelas:",
      items: ["Izhar Halqi (Dibaca Jelas)", "Idgham Bighunnah (Melebur dengan dengung)", "Iqlab (Mengganti jadi mim)", "Ikhfa Haqiqi (Samar-samar)"],
      explanation: "Urutan pembelajaran hukum tajwid nun mati dan tanwin."
    },
    {
      text: "Urutkan surah Al-Falaq, An-Nas, dan Al-Ikhlas sesuai urutan mushaf Al-Qur'an:",
      items: ["Surah Al-Ikhlas (112)", "Surah Al-Falaq (113)", "Surah An-Nas (114)"],
      explanation: "Tiga surah penutup Al-Qur'an."
    },
    {
      text: "Urutkan adab membaca Al-Qur'an dari persiapan awal:",
      items: ["Berwudhu dan suci dari hadas", "Menghadap kiblat di tempat yang bersih", "Membaca ta'awudz dan basmalah", "Membaca ayat dengan tartil dan tenang"],
      explanation: "Adab membaca kalamullah sesuai tuntunan ulama."
    }
  ],

  // Fikih
  9: [
    {
      text: "Urutkan urutan gerakan wudhu yang benar dan tertib:",
      items: ["Berkumur-kumur dan membasuh hidung", "Membasuh seluruh muka", "Membasuh kedua tangan hingga siku", "Mengusap sebagian kepala", "Membasuh kedua kaki hingga mata kaki"],
      explanation: "Rukun dan sunnah wudhu sesuai urutan tertib."
    },
    {
      text: "Urutkan lima waktu shalat fardhu dalam sehari semalam:",
      items: ["Shalat Subuh (2 rakaat)", "Shalat Dzuhur (4 rakaat)", "Shalat Ashar (4 rakaat)", "Shalat Maghrib (3 rakaat)", "Shalat Isya (4 rakaat)"],
      explanation: "Urutan kronologis lima shalat fardhu harian."
    },
    {
      text: "Urutkan gerakan shalat dalam satu rakaat pertama:",
      items: ["Takbiratul ihram dan membaca Al-Fatihah", "Rukuk dengan tumakninah", "Itidal (bangkit dari rukuk)", "Sujud pertama dan duduk di antara dua sujud", "Sujud kedua"],
      explanation: "Urutan rukun fi'li dalam satu rakaat shalat."
    },
    {
      text: "Urutkan tingkatan najis dari yang paling ringan cara menyucikannya:",
      items: ["Najis Mukhaffafah (Ringan)", "Najis Mutawassithah (Sedang)", "Najis Mughalladhah (Berat)"],
      explanation: "Mukhaffafah (cukup dipercik air), Mutawassithah (dicuci hingga hilang bau/warna/rasa), Mughalladhah (dicuci 7 kali, salah satunya dengan tanah)."
    },
    {
      text: "Urutkan rukun Islam dari rukun pertama sampai kelima:",
      items: ["Syahadat", "Shalat lima waktu", "Zakat", "Puasa Ramadhan", "Haji bagi yang mampu"],
      explanation: "Lima pondasi dasar rukun Islam."
    }
  ],

  // SKI (Sejarah Kebudayaan Islam)
  10: [
    {
      text: "Urutkan masa kekhalifahan Khulafaur Rasyidin secara kronologis:",
      items: ["Abu Bakar Ash-Shiddiq", "Umar bin Khattab", "Utsman bin Affan", "Ali bin Abi Thalib"],
      explanation: "Urutan empat khalifah rasyidin setelah wafatnya Rasulullah SAW."
    },
    {
      text: "Urutkan tahapan fase dakwah Nabi Muhammad SAW di Makkah dan Madinah:",
      items: ["Dakwah secara sembunyi-sembunyi (Sirriyah)", "Dakwah secara terang-terangan (Jahriyah)", "Hijrah ke Madinah", "Membangun masyarakat Madinah"],
      explanation: "Periodisasi dakwah Rasulullah SAW."
    },
    {
      text: "Urutkan sahabat-sahabat yang termasuk golongan pertama masuk Islam (Assabiqunal Awwalun):",
      items: ["Khadijah binti Khuwailid (Wanita pertama)", "Ali bin Abi Thalib (Anak-anak pertama)", "Zaid bin Haritsah (Budak pertama)", "Abu Bakar Ash-Shiddiq (Laki-laki dewasa pertama)"],
      explanation: "Golongan pelopor pemeluk Islam pertama."
    },
    {
      text: "Urutkan peristiwa penting dalam kehidupan Nabi Muhammad SAW:",
      items: ["Kelahiran pada Tahun Gajah", "Menerima wahyu pertama di Gua Hira", "Peristiwa Isra Mi'raj", "Hijrah ke Yatsrib (Madinah)"],
      explanation: "Kronologi sejarah kenabian Nabi Muhammad SAW."
    }
  ],

  // Bahasa Arab
  11: [
    {
      text: "Urutkan angka bilangan Arab dari 1 sampai 4:",
      items: ["وَاحِدٌ (Wahidun = 1)", "اِثْنَانِ (Itsnani = 2)", "ثَلَاثَةٌ (Tsalatsatun = 3)", "أَرْبَعَةٌ (Arba'atun = 4)"],
      explanation: "Urutan bilangan 1, 2, 3, 4 dalam bahasa Arab."
    },
    {
      text: "Urutkan kata-kata bahasa Arab berikut menjadi kalimat susunan alamat yang benar:",
      items: ["عُنْوَانِي (Alamatku)", "فِي شَارِعِ (Di jalan)", "أَحْمَد يَانِي (Ahmad Yani)", "رَقْمُ عَشَرَة (Nomor sepuluh)"],
      explanation: "Susunan kalimat alamat rumah dalam bahasa Arab."
    },
    {
      text: "Urutkan tingkatan anggota keluarga dari generasi tertua dalam bahasa Arab:",
      items: ["جَدٌّ (Kakek)", "أَبٌ (Ayah)", "أَخٌ (Saudara laki-laki)", "ابْنٌ (Anak laki-laki)"],
      explanation: "Urutan silsilah keluarga dalam bahasa Arab."
    },
    {
      text: "Urutkan sapaan harian bahasa Arab dari pagi ke malam:",
      items: ["صَبَاحُ الْخَيْرِ (Selamat pagi)", "نَهَارُكَ سَعِيْدٌ (Selamat siang)", "مَسَاءُ الْخَيْرِ (Selamat sore)", "لَيْلَتُكَ سَعِيْدَةٌ (Selamat malam)"],
      explanation: "Urutan ucapan salam berdasarkan waktu dalam bahasa Arab."
    }
  ],

  // PJOK
  12: [
    {
      text: "Urutkan tahapan rangkaian berolahraga yang benar untuk mencegah cedera:",
      items: ["Pemanasan (Warm-up)", "Latihan Gerak Inti", "Pendinginan (Cooling-down)"],
      explanation: "Pemanasan menyiapkan otot, latihan inti mencapai target, pendinginan mengembalikan denyut nadi."
    },
    {
      text: "Urutkan aba-aba resmi pada start jongkok lari cepat (sprint):",
      items: ["Bersedia (Menempatkan kaki di start block)", "Siap (Mengangkat pinggul lebih tinggi dari bahu)", "Ya! / Bunyi Pistol (Melesat berlari cepat)"],
      explanation: "Tiga aba-aba baku lari jarak pendek."
    },
    {
      text: "Urutkan tahapan gerakan lompat jauh gaya jongkok:",
      items: ["Awalan lari cepat menuju balok tumpu", "Tolakan dengan satu kaki terkuat", "Melayang di udara dengan posisi jongkok", "Mendarat dengan kedua kaki mengeper bersamaan"],
      explanation: "Empat fase teknik lompat jauh: awalan, tolakan, melayang, mendarat."
    },
    {
      text: "Urutkan tahapan gerakan melempar bola kasti mendatar:",
      items: ["Pegang bola dengan jari-jari tangan", "Tarik lengan pelempar ke belakang", "Langkahkan kaki ke depan", "Ayunkan lengan dan lepaskan bola mendatar"],
      explanation: "Teknik dasar lemparan bola mendatar kasti."
    }
  ],

  // Seni Budaya
  13: [
    {
      text: "Urutkan susunan tangga nada diatonis mayor dari nada terendah ke tertinggi:",
      items: ["Do (1)", "Re (2)", "Mi (3)", "Fa (4)", "Sol (5)", "La (6)", "Si (7)"],
      explanation: "Tangga nada dasar diatonis mayor 1-7."
    },
    {
      text: "Urutkan tahapan membuat gambar bentuk atau ilustrasi:",
      items: ["Menentukan objek yang akan digambar", "Membuat sketsa tipis dengan pensil", "Mempertegas garis gambar", "Memberikan warna dan bayangan (arsir)"],
      explanation: "Tahapan sistematis menggambar rupa."
    },
    {
      text: "Urutkan langkah membatik sederhana dengan teknik canting:",
      items: ["Membuat pola gambar pada kain mori", "Menorehkan malam/lilin dengan canting", "Mencelupkan kain ke larutan pewarna", "Melorotkan malam dengan air mendidih"],
      explanation: "Proses klasik pembuatan batik tulis."
    },
    {
      text: "Urutkan tempo musik dari yang paling lambat ke paling cepat:",
      items: ["Largo (Sangat lambat)", "Andante (Sedang seperti orang berjalan)", "Moderato (Sedang agak cepat)", "Allegro (Cepat dan gembira)"],
      explanation: "Istilah tanda tempo musik standar."
    }
  ],

  // Bahasa Inggris
  14: [
    {
      text: "Urutkan nama-nama hari dalam seminggu mulai dari hari Senin:",
      items: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      explanation: "Seven days of the week starting from Monday."
    },
    {
      text: "Urutkan kata-kata berikut menjadi kalimat bahasa Inggris yang benar:",
      items: ["The students", "are studying", "English", "in the classroom"],
      explanation: "Subject (The students) + Verb-ing (are studying) + Object (English) + Adverb of place (in the classroom)."
    },
    {
      text: "Urutkan waktu makan sehari-hari dalam bahasa Inggris:",
      items: ["Breakfast (Makan pagi)", "Lunch (Makan siang)", "Dinner (Makan malam)"],
      explanation: "Daily meals order: breakfast, lunch, and dinner."
    },
    {
      text: "Urutkan kata-kata acak berikut menjadi kalimat perkenalan diri:",
      items: ["Hello,", "my name is", "Budi Santoso,", "I am nine years old."],
      explanation: "Natural English self-introduction sequence."
    }
  ]
};

// Data kurasi untuk MATCHING per mapel Kelas 4 SD
const CURATED_MATCHING = {
  // Matematika
  1: [
    {
      text: "Pasangkan operasi perkalian berikut dengan hasil yang tepat:",
      pairs: [
        { left: "12 × 5", right: "60" },
        { left: "15 × 4", right: "60" },
        { left: "25 × 3", right: "75" },
        { left: "8 × 9", right: "72" }
      ],
      explanation: "12×5=60, 15×4=60, 25×3=75, 8×9=72."
    },
    {
      text: "Pasangkan pecahan biasa dengan bentuk desimalnya:",
      pairs: [
        { left: "1/2", right: "0,5" },
        { left: "1/4", right: "0,25" },
        { left: "3/4", right: "0,75" },
        { left: "1/5", right: "0,2" }
      ],
      explanation: "Konversi pecahan ke desimal: 1/2=0,5; 1/4=0,25; 3/4=0,75; 1/5=0,2."
    },
    {
      text: "Pasangkan bangun datar dengan banyak sisinya:",
      pairs: [
        { left: "Segitiga", right: "3 sisi" },
        { left: "Persegi Panjang", right: "4 sisi" },
        { left: "Segilima", right: "5 sisi" },
        { left: "Segienam", right: "6 sisi" }
      ],
      explanation: "Jumlah sisi pada poligon datar."
    },
    {
      text: "Pasangkan satuan waktu dengan padanannya:",
      pairs: [
        { left: "1 Jam", right: "60 Menit" },
        { left: "1 Menit", right: "60 Detik" },
        { left: "1 Hari", right: "24 Jam" },
        { left: "1 Minggu", right: "7 Hari" }
      ],
      explanation: "Konversi dasar besaran waktu."
    },
    {
      text: "Pasangkan jenis sudut dengan besar derajatnya:",
      pairs: [
        { left: "Sudut Lancip", right: "Kurang dari 90°" },
        { left: "Sudut Siku-Siku", right: "Tepat 90°" },
        { left: "Sudut Tumpul", right: "Antara 90° dan 180°" },
        { left: "Sudut Lurus", right: "Tepat 180°" }
      ],
      explanation: "Klasifikasi sudut geometri."
    }
  ],

  // Bahasa Indonesia
  4: [
    {
      text: "Pasangkan jenis kata dengan contohnya masing-masing:",
      pairs: [
        { left: "Kata Benda (Nomina)", right: "Meja, buku, sekolah" },
        { left: "Kata Kerja (Verba)", right: "Berlari, menulis, membaca" },
        { left: "Kata Sifat (Adjektiva)", right: "Pintar, rajin, bersih" },
        { left: "Kata Keterangan", right: "Di rumah, kemarin sore" }
      ],
      explanation: "Kelas kata dalam bahasa Indonesia."
    },
    {
      text: "Pasangkan kata-kata berikut dengan lawan katanya (antonim):",
      pairs: [
        { left: "Luas", right: "Sempit" },
        { left: "Rajin", right: "Malas" },
        { left: "Tinggi", right: "Rendah" },
        { left: "Hemat", right: "Boros" }
      ],
      explanation: "Antonim kata sifat dasar."
    },
    {
      text: "Pasangkan istilah kebahasaan berikut dengan artinya:",
      pairs: [
        { left: "Kalimat Transitif", right: "Memerlukan objek" },
        { left: "Kalimat Intransitif", right: "Tidak memerlukan objek" },
        { left: "Sinonim", right: "Persamaan arti kata" },
        { left: "Antonim", right: "Lawan arti kata" }
      ],
      explanation: "Definisi istilah linguistik SD."
    },
    {
      text: "Pasangkan awalan 'me-' dengan kata dasar berikut:",
      pairs: [
        { left: "me- + tulis", right: "menulis" },
        { left: "me- + baca", right: "membaca" },
        { left: "me- + sapu", right: "menyapu" },
        { left: "me- + potong", right: "memotong" }
      ],
      explanation: "Aturan peluluhan bunyi pada morfologi imbuhan me-."
    }
  ],

  // IPAS
  5: [
    {
      text: "Pasangkan bagian tumbuhan dengan fungsi utamanya:",
      pairs: [
        { left: "Akar", right: "Menyerap air dan zat hara tanah" },
        { left: "Batang", right: "Menopang tumbuhan dan menyalurkan air" },
        { left: "Daun", right: "Tempat terjadinya proses fotosintesis" },
        { left: "Bunga", right: "Alat perkembangbiakan generatif" }
      ],
      explanation: "Fungsi morfologi organ tumbuhan."
    },
    {
      text: "Pasangkan hewan berikut dengan jenis makanannya:",
      pairs: [
        { left: "Kelinci", right: "Herbivora (Pemakan tumbuhan)" },
        { left: "Singa", right: "Karnivora (Pemakan daging)" },
        { left: "Ayam", right: "Omnivora (Pemakan segalanya)" },
        { left: "Burung Elang", right: "Karnivora (Pemakan daging)" }
      ],
      explanation: "Klasifikasi hewan berdasarkan jenis makanannya."
    },
    {
      text: "Pasangkan perubahan wujud benda dengan istilah yang tepat:",
      pairs: [
        { left: "Padat menjadi cair", right: "Mencair" },
        { left: "Cair menjadi padat", right: "Membeku" },
        { left: "Cair menjadi gas", right: "Menguap" },
        { left: "Gas menjadi cair", right: "Mengembun" }
      ],
      explanation: "Termodinamika perubahan wujud zat."
    },
    {
      text: "Pasangkan jenis energi dengan contoh perubahannya:",
      pairs: [
        { left: "Kipas Angin", right: "Energi listrik menjadi gerak" },
        { left: "Setrika", right: "Energi listrik menjadi panas" },
        { left: "Lampu Bohlam", right: "Energi listrik menjadi cahaya" },
        { left: "Radio", right: "Energi listrik menjadi bunyi" }
      ],
      explanation: "Konversi bentuk energi dalam kehidupan sehari-hari."
    }
  ],

  // Pendidikan Pancasila
  6: [
    {
      text: "Pasangkan nomor sila Pancasila dengan simbol resminya:",
      pairs: [
        { left: "Sila Ke-1", right: "Bintang Emas" },
        { left: "Sila Ke-2", right: "Rantai Baja" },
        { left: "Sila Ke-3", right: "Pohon Beringin" },
        { left: "Sila Ke-4", right: "Kepala Banteng" },
        { left: "Sila Ke-5", right: "Padi dan Kapas" }
      ],
      explanation: "Simbol lima sila Pancasila."
    },
    {
      text: "Pasangkan bunyi sila Pancasila dengan kata kuncinya:",
      pairs: [
        { left: "Sila Ke-1", right: "Ketuhanan & Ibadah" },
        { left: "Sila Ke-2", right: "Kemanusiaan & Tenggang rasa" },
        { left: "Sila Ke-3", right: "Persatuan & Cinta tanah air" },
        { left: "Sila Ke-4", right: "Musyawarah & Mufakat" }
      ],
      explanation: "Nilai pengamalan sila-sila Pancasila."
    },
    {
      text: "Pasangkan nama rumah adat dengan daerah asalnya:",
      pairs: [
        { left: "Rumah Gadang", right: "Sumatera Barat" },
        { left: "Rumah Joglo", right: "Jawa Tengah" },
        { left: "Rumah Tongkonan", right: "Sulawesi Selatan" },
        { left: "Rumah Honai", right: "Papua" }
      ],
      explanation: "Keragaman rumah adat nusantara."
    },
    {
      text: "Pasangkan nama tarian tradisional dengan provinsi asalnya:",
      pairs: [
        { left: "Tari Saman", right: "Aceh" },
        { left: "Tari Piring", right: "Sumatera Barat" },
        { left: "Tari Jaipong", right: "Jawa Barat" },
        { left: "Tari Kecak", right: "Bali" }
      ],
      explanation: "Keragaman seni tari daerah nusantara."
    }
  ],

  // Akidah Akhlak
  7: [
    {
      text: "Pasangkan Asmaul Husna berikut dengan artinya yang tepat:",
      pairs: [
        { left: "Al-Malik", right: "Maha Merajai" },
        { left: "Al-Quddus", right: "Maha Suci" },
        { left: "As-Salam", right: "Maha Sejahtera" },
        { left: "Al-Mu'min", right: "Maha Memberi Keamanan" }
      ],
      explanation: "Arti Asmaul Husna materi Kelas 4."
    },
    {
      text: "Pasangkan kalimat thayyibah berikut dengan lafaznya:",
      pairs: [
        { left: "Tasbih", right: "Subhanallah" },
        { left: "Tahmid", right: "Alhamdulillah" },
        { left: "Takbir", right: "Allahu Akbar" },
        { left: "Tahlil", right: "Laa ilaaha illallah" }
      ],
      explanation: "Lafaz kalimat thayyibah dalam Islam."
    },
    {
      text: "Pasangkan malaikat Allah dengan tugas utamanya:",
      pairs: [
        { left: "Malaikat Jibril", right: "Menyampaikan wahyu" },
        { left: "Malaikat Mikail", right: "Membagikan rezeki dan hujan" },
        { left: "Malaikat Israfil", right: "Meniup sangkakala" },
        { left: "Malaikat Izrail", right: "Mencabut nyawa" }
      ],
      explanation: "Tugas para malaikat Allah SWT."
    }
  ],

  // Al-Qur'an Hadis
  8: [
    {
      text: "Pasangkan nama surah pendek berikut dengan artinya:",
      pairs: [
        { left: "An-Nasr", right: "Pertolongan" },
        { left: "Al-Kautsar", right: "Nikmat yang Banyak" },
        { left: "Al-Falaq", right: "Waktu Subuh" },
        { left: "An-Nas", right: "Manusia" }
      ],
      explanation: "Arti nama surah pendek juz 30."
    },
    {
      text: "Pasangkan jumlah ayat dengan nama surahnya:",
      pairs: [
        { left: "Surah An-Nasr", right: "3 Ayat" },
        { left: "Surah Al-Kautsar", right: "3 Ayat" },
        { left: "Surah Al-Ikhlas", right: "4 Ayat" },
        { left: "Surah Al-Falaq", right: "5 Ayat" }
      ],
      explanation: "Jumlah ayat surah-surah pendek."
    },
    {
      text: "Pasangkan hukum tajwid dengan definisinya:",
      pairs: [
        { left: "Izhar Halqi", right: "Dibaca jelas dan terang" },
        { left: "Idgham Bighunnah", right: "Melebur disertai dengung" },
        { left: "Iqlab", right: "Mengganti suara nun mati menjadi mim" },
        { left: "Ikhfa Haqiqi", right: "Dibaca samar-samar" }
      ],
      explanation: "Hukum bacaan nun sukun dan tanwin."
    }
  ],

  // Fikih
  9: [
    {
      text: "Pasangkan shalat fardhu dengan jumlah rakaatnya:",
      pairs: [
        { left: "Shalat Subuh", right: "2 Rakaat" },
        { left: "Shalat Maghrib", right: "3 Rakaat" },
        { left: "Shalat Dzuhur", right: "4 Rakaat" },
        { left: "Shalat Isya", right: "4 Rakaat" }
      ],
      explanation: "Jumlah rakaat shalat lima waktu."
    },
    {
      text: "Pasangkan jenis najis dengan cara menyucikannya:",
      pairs: [
        { left: "Najis Mukhaffafah (Ringan)", right: "Dicipratkan air bersih pada bagian terkena" },
        { left: "Najis Mutawassithah (Sedang)", right: "Dibasuh hingga hilang rasa, bau, dan warna" },
        { left: "Najis Mughalladhah (Berat)", right: "Dibasuh 7 kali, salah satunya dengan air tanah" }
      ],
      explanation: "Thaharah dan pensucian najis dalam fikih."
    },
    {
      text: "Pasangkan istilah fikih berikut dengan artinya:",
      pairs: [
        { left: "Baligh", right: "Cukup umur / dewasa dalam syariat" },
        { left: "Khitan", right: "Memotong kulit kulup kemaluan laki-laki" },
        { left: "Tayammum", right: "Bersuci dengan debu bersih pengganti wudhu" },
        { left: "Mukim", right: "Menetap di daerah tempat tinggal" }
      ],
      explanation: "Istilah pokok Fikih ibadah."
    }
  ],

  // SKI
  10: [
    {
      text: "Pasangkan Khulafaur Rasyidin dengan gelar kemuliaannya:",
      pairs: [
        { left: "Abu Bakar", right: "Ash-Shiddiq (Yang membenarkan)" },
        { left: "Umar bin Khattab", right: "Al-Faruq (Pembeda benar dan batil)" },
        { left: "Utsman bin Affan", right: "Dzun Nurain (Pemilik dua cahaya)" },
        { left: "Ali bin Abi Thalib", right: "Babul Ilmi (Gerbang ilmu)" }
      ],
      explanation: "Gelar kemuliaan Khulafaur Rasyidin."
    },
    {
      text: "Pasangkan tokoh Quraisy dengan perannya dalam sejarah kenabian:",
      pairs: [
        { left: "Abu Thalib", right: "Paman Nabi yang selalu melindungi dakwah" },
        { left: "Khadijah", right: "Istri pertama dan pendukung setia dakwah" },
        { left: "Abu Lahab", right: "Paman Nabi yang keras memusuhi dakwah" },
        { left: "Darul Arqam", right: "Rumah pusat pembinaan dakwah rahasia" }
      ],
      explanation: "Tokoh-tokoh dakwah periode Makkah."
    }
  ],

  // Bahasa Arab
  11: [
    {
      text: "Pasangkan kosakata bahasa Arab berikut dengan artinya:",
      pairs: [
        { left: "بَيْتٌ (Baitun)", right: "Rumah" },
        { left: "مَدْرَسَةٌ (Madrasatun)", right: "Sekolah" },
        { left: "مَسْجِدٌ (Masjidun)", right: "Masjid" },
        { left: "فَصْلٌ (Fashlun)", right: "Kelas" }
      ],
      explanation: "Kosakata tempat dalam bahasa Arab."
    },
    {
      text: "Pasangkan peralatan sekolah bahasa Arab dengan artinya:",
      pairs: [
        { left: "كِتَابٌ (Kitaabun)", right: "Buku" },
        { left: "قَلَمٌ (Qalamun)", right: "Pena / Pulpen" },
        { left: "مِسْطَرَةٌ (Mistharatun)", right: "Penggaris" },
        { left: "حَقِيبَةٌ (Haqiibatun)", right: "Tas" }
      ],
      explanation: "Adawatul madrasiyyah (peralatan sekolah)."
    },
    {
      text: "Pasangkan anggota keluarga bahasa Arab dengan artinya:",
      pairs: [
        { left: "أَبٌ (Abun)", right: "Ayah" },
        { left: "أُمٌّ (Ummun)", right: "Ibu" },
        { left: "أَخٌ (Akhun)", right: "Saudara Laki-Laki" },
        { left: "أُخْتٌ (Ukhtun)", right: "Saudara Perempuan" }
      ],
      explanation: "Kosakata afradul usrah (anggota keluarga)."
    }
  ],

  // PJOK
  12: [
    {
      text: "Pasangkan pola gerak dasar dengan contoh tindakannya:",
      pairs: [
        { left: "Gerak Lokomotor", right: "Berlari, melompat, berjalan" },
        { left: "Gerak Nonlokomotor", right: "Meliukkan badan, membungkuk" },
        { left: "Gerak Manipulatif", right: "Melempar bola, menendang bola" }
      ],
      explanation: "Tiga pola dasar gerak manusia dalam kebugaran jasmani."
    },
    {
      text: "Pasangkan cabang olahraga dengan sarana/bolanya:",
      pairs: [
        { left: "Kasti", right: "Bola kecil dan tongkat pemukul kayu" },
        { left: "Sepak Bola", right: "Bola besar dan gawang berjarak" },
        { left: "Bulutangkis", right: "Raket senar dan kok (shuttlecock)" },
        { left: "Bola Voli", right: "Bola besar dan net tinggi" }
      ],
      explanation: "Peralatan olahraga permainan."
    }
  ],

  // Seni Budaya
  13: [
    {
      text: "Pasangkan unsur seni rupa berikut dengan pengertiannya:",
      pairs: [
        { left: "Titik", right: "Unsur seni rupa paling mendasar" },
        { left: "Garis", right: "Goresan memanjang dengan arah tertentu" },
        { left: "Bidang", right: "Pertemuan beberapa garis yang membatasi area" },
        { left: "Warna", right: "Kesan yang diperoleh mata dari pantulan cahaya" }
      ],
      explanation: "Unsur fisik seni rupa dasar."
    },
    {
      text: "Pasangkan alat musik daerah dengan asal provinsinya:",
      pairs: [
        { left: "Angklung", right: "Jawa Barat" },
        { left: "Sasando", right: "Nusa Tenggara Timur" },
        { left: "Kolintang", right: "Sulawesi Utara" },
        { left: "Gamelan", right: "Jawa Tengah & DI Yogyakarta" }
      ],
      explanation: "Alat musik tradisional nusantara."
    }
  ],

  // Bahasa Inggris
  14: [
    {
      text: "Match the English words with their Indonesian meanings:",
      pairs: [
        { left: "Teacher", right: "Guru" },
        { left: "Student", right: "Murid / Siswa" },
        { left: "Book", right: "Buku" },
        { left: "Classroom", right: "Ruang Kelas" }
      ],
      explanation: "Classroom vocabulary in English."
    },
    {
      text: "Match the action verbs with their Indonesian meanings:",
      pairs: [
        { left: "Eat", right: "Makan" },
        { left: "Drink", right: "Minum" },
        { left: "Read", right: "Membaca" },
        { left: "Write", right: "Menulis" }
      ],
      explanation: "Common everyday verbs."
    },
    {
      text: "Match the colors in English with Indonesian translations:",
      pairs: [
        { left: "Red", right: "Merah" },
        { left: "Blue", right: "Biru" },
        { left: "Yellow", right: "Kuning" },
        { left: "Green", right: "Hijau" }
      ],
      explanation: "Primary and secondary colors."
    }
  ]
};

async function main() {
  const database = db.getDb();
  console.log('=== MEMULAI DUPLIKASI SOAL KELAS 4 SD MENJADI 5 TIPE SOAL ===');

  const subjs = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  let totalTfAdded = 0;
  let totalShortAdded = 0;
  let totalOrdAdded = 0;
  let totalMatchAdded = 0;

  for (const sId of subjs) {
    const s = database.prepare('SELECT id, name FROM subjects WHERE id=?').get(sId);
    if (!s) continue;
    console.log(`\nMemproses Mapel [${s.id}] ${s.name}...`);

    // Ambil soal MCQ mapel ini
    const mcqQuestions = database.prepare("SELECT * FROM questions WHERE subject_id=? AND (question_type IS NULL OR question_type='MCQ') AND is_active=1").all(sId);
    console.log(`- Ditemukan ${mcqQuestions.length} soal MCQ dasar.`);

    let tfCount = 0;
    let shortCount = 0;

    // 1. DUPLIKASI KE TRUE_FALSE (25 soal per mapel, 50% Benar, 50% Salah)
    for (let i = 0; i < Math.min(25, mcqQuestions.length); i++) {
      const q = mcqQuestions[i];
      let opts = [];
      try { opts = JSON.parse(q.options_json); } catch(e) {}
      if (!opts || opts.length < 2) continue;

      const correctAns = opts[q.answer_index];
      const isTrue = (i % 2 === 0); // Selang-seling Benar dan Salah
      let wrongAns = opts[(q.answer_index + 1) % opts.length];

      let statementText = '';
      let rawText = q.text.trim();

      // Bersihkan tanda titik-titik atau tanda tanya di akhir
      let cleanPrompt = rawText.replace(/\.{2,}\??$/, '').replace(/\?$/, '').trim();

      if (isTrue) {
        if (cleanPrompt.includes('=')) {
          statementText = `${cleanPrompt} ${correctAns}.`;
        } else if (cleanPrompt.toLowerCase().endsWith('adalah') || cleanPrompt.toLowerCase().endsWith('disebut') || cleanPrompt.toLowerCase().endsWith('yaitu')) {
          statementText = `${cleanPrompt} ${correctAns}.`;
        } else {
          statementText = `Pernyataan: ${cleanPrompt} adalah ${correctAns}.`;
        }
      } else {
        if (cleanPrompt.includes('=')) {
          statementText = `${cleanPrompt} ${wrongAns}.`;
        } else if (cleanPrompt.toLowerCase().endsWith('adalah') || cleanPrompt.toLowerCase().endsWith('disebut') || cleanPrompt.toLowerCase().endsWith('yaitu')) {
          statementText = `${cleanPrompt} ${wrongAns}.`;
        } else {
          statementText = `Pernyataan: ${cleanPrompt} adalah ${wrongAns}.`;
        }
      }

      const typeData = {
        correctAnswer: isTrue,
        options: ['Benar', 'Salah']
      };

      const valid = validateQuestionData('TRUE_FALSE', typeData);
      if (!valid.valid) {
        console.warn(`[WARN] Validasi TF gagal: ${valid.error}`);
        continue;
      }

      const h = questionHash(statementText + ':TF');
      const ansIdx = isTrue ? 0 : 1;
      const expl = isTrue 
        ? `Benar. ${q.explanation || statementText}`
        : `Salah. Pernyataan yang benar adalah: ${cleanPrompt} adalah ${correctAns}.`;

      database.prepare(`
        INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty, hash, is_active, question_type, type_data_json)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, 1, 'TRUE_FALSE', ?)
        ON CONFLICT(subject_id, hash) DO UPDATE SET
          options_json=excluded.options_json,
          answer_index=excluded.answer_index,
          explanation=excluded.explanation,
          question_type=excluded.question_type,
          type_data_json=excluded.type_data_json,
          is_active=1
      `).run(sId, statementText, JSON.stringify(['Benar', 'Salah']), ansIdx, expl, q.difficulty || 1, q.eff_difficulty || 1, h, JSON.stringify(typeData));

      tfCount++;
      totalTfAdded++;
    }
    console.log(`  ✓ Berhasil membuat ${tfCount} soal TRUE_FALSE.`);

    // 2. DUPLIKASI KE SHORT (Isian Singkat) (25 soal per mapel)
    for (let i = 25; i < Math.min(50, mcqQuestions.length); i++) {
      const q = mcqQuestions[i];
      let opts = [];
      try { opts = JSON.parse(q.options_json); } catch(e) {}
      if (!opts || opts.length < 2) continue;

      const rawAns = opts[q.answer_index];
      if (!rawAns || rawAns.length > 50) continue; // Lewati jawaban yang terlalu panjang

      const trimmedAns = String(rawAns).trim();
      const numVal = parseFloat(trimmedAns.replace(',', '.'));
      const isNum = !isNaN(numVal) && String(numVal) === trimmedAns.replace(',', '.').trim();

      const acceptedList = [trimmedAns];
      if (trimmedAns.toLowerCase() !== trimmedAns) {
        acceptedList.push(trimmedAns.toLowerCase());
      }
      // Hapus kata pelengkap umum jika ada (misal "3 ayat" -> ["3 ayat", "3"])
      const strippedNumber = trimmedAns.match(/^(\d+)\s+[a-zA-Z]+$/);
      if (strippedNumber) {
        acceptedList.push(strippedNumber[1]);
      }

      const typeData = {
        accepted: acceptedList,
        isNumeric: isNum
      };
      if (isNum) {
        typeData.numeric = {
          value: numVal,
          tolerance: 0
        };
      }

      const valid = validateQuestionData('SHORT', typeData);
      if (!valid.valid) {
        console.warn(`[WARN] Validasi SHORT gagal: ${valid.error}`);
        continue;
      }

      // Pastikan teks pertanyaan jelas untuk isian singkat
      let qText = q.text.trim();
      if (!qText.endsWith('...') && !qText.endsWith('?')) {
        qText = `${qText} ...`;
      }
      const h = questionHash(qText + ':SHORT');

      database.prepare(`
        INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty, hash, is_active, question_type, type_data_json)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, 1, 'SHORT', ?)
        ON CONFLICT(subject_id, hash) DO UPDATE SET
          options_json=excluded.options_json,
          answer_index=excluded.answer_index,
          explanation=excluded.explanation,
          question_type=excluded.question_type,
          type_data_json=excluded.type_data_json,
          is_active=1
      `).run(sId, qText, JSON.stringify([]), 0, q.explanation || `Jawaban yang benar: ${trimmedAns}`, q.difficulty || 1, q.eff_difficulty || 1, h, JSON.stringify(typeData));

      shortCount++;
      totalShortAdded++;
    }
    console.log(`  ✓ Berhasil membuat ${shortCount} soal SHORT.`);

    // 3. TAMBAHKAN SOAL ORDERING (Mengurutkan)
    const ordList = CURATED_ORDERING[sId] || [];
    let ordCount = 0;
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
      const h = questionHash(item.text + ':ORD');
      database.prepare(`
        INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty, hash, is_active, question_type, type_data_json)
        VALUES(?, ?, ?, ?, ?, 2, 2, ?, 1, 'ORDERING', ?)
        ON CONFLICT(subject_id, hash) DO UPDATE SET
          options_json=excluded.options_json,
          answer_index=excluded.answer_index,
          explanation=excluded.explanation,
          question_type=excluded.question_type,
          type_data_json=excluded.type_data_json,
          is_active=1
      `).run(sId, item.text, JSON.stringify(item.items), 0, item.explanation, h, JSON.stringify(typeData));
      ordCount++;
      totalOrdAdded++;
    }
    console.log(`  ✓ Berhasil menambahkan ${ordCount} soal ORDERING.`);

    // 4. TAMBAHKAN SOAL MATCHING (Menjodohkan)
    const matchList = CURATED_MATCHING[sId] || [];
    let matchCount = 0;
    for (const item of matchList) {
      const typeData = {
        pairs: item.pairs
      };
      const valid = validateQuestionData('MATCHING', typeData);
      if (!valid.valid) {
        console.warn(`[WARN] Validasi MATCHING gagal: ${valid.error}`);
        continue;
      }
      const h = questionHash(item.text + ':MATCH');
      const optLabels = item.pairs.map(p => p.left);
      database.prepare(`
        INSERT INTO questions(subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty, hash, is_active, question_type, type_data_json)
        VALUES(?, ?, ?, ?, ?, 2, 2, ?, 1, 'MATCHING', ?)
        ON CONFLICT(subject_id, hash) DO UPDATE SET
          options_json=excluded.options_json,
          answer_index=excluded.answer_index,
          explanation=excluded.explanation,
          question_type=excluded.question_type,
          type_data_json=excluded.type_data_json,
          is_active=1
      `).run(sId, item.text, JSON.stringify(optLabels), 0, item.explanation, h, JSON.stringify(typeData));
      matchCount++;
      totalMatchAdded++;
    }
    console.log(`  ✓ Berhasil menambahkan ${matchCount} soal MATCHING.`);

    // Update question_count di tabel subjects
    const updatedCount = database.prepare("SELECT COUNT(*) as c FROM questions WHERE subject_id=? AND is_active=1").get(sId).c;
    database.prepare("UPDATE subjects SET question_count=? WHERE id=?").run(updatedCount, sId);
    console.log(`  ✓ Total soal aktif mapel ${s.name} sekarang: ${updatedCount}.`);
  }

  console.log('\n=== RINGKASAN DUPLIKASI SOAL KELAS 4 SD ===');
  console.log(`- Soal TRUE_FALSE baru : ${totalTfAdded}`);
  console.log(`- Soal SHORT baru      : ${totalShortAdded}`);
  console.log(`- Soal ORDERING baru   : ${totalOrdAdded}`);
  console.log(`- Soal MATCHING baru   : ${totalMatchAdded}`);
  console.log(`- Total soal baru      : ${totalTfAdded + totalShortAdded + totalOrdAdded + totalMatchAdded}`);

  const breakdown = database.prepare(`
    SELECT q.question_type, COUNT(*) as c
    FROM questions q
    JOIN subjects s ON s.id = q.subject_id
    WHERE s.class_id = 1 AND q.is_active = 1
    GROUP BY q.question_type
  `).all();
  console.log('\nBreakdown Tipe Soal Kelas 4 SD di Database:', breakdown);
}

main().catch(err => {
  console.error('Fatal error during duplication:', err);
  process.exit(1);
});
