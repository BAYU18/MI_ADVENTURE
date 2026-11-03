const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const crypto = require('node:crypto');

const DB_PATH = process.env.PLAY_DB_PATH || path.join(__dirname, '..', 'data', 'play.db');
const db = new DatabaseSync(DB_PATH);

function questionHash(text) {
  return crypto.createHash('sha1')
    .update(String(text || '').toLowerCase().trim().replace(/\s+/g, ' '))
    .digest('hex');
}

const extraQuestions = [
  // SKI (id 10)
  // ORDERING
  {
    subject_id: 10, question_type: 'ORDERING',
    text: 'Urutkan tahapan hijrah kaum Muslimin pada masa awal Islam:',
    items: ['Tekanan kaum kafir Quraisy di Makkah meningkat', 'Hijrah pertama ke Habsyah (Abisinia)', 'Perjanjian Aqabah', 'Hijrah besar ke Yatsrib (Madinah)'],
    explanation: 'Dimulai dari tekanan di Makkah, hijrah ke Habsyah, baiat Aqabah, lalu hijrah ke Madinah.'
  },
  {
    subject_id: 10, question_type: 'ORDERING',
    text: 'Urutkan masa kekhalifahan Khulafaur Rasyidin dari yang pertama hingga terakhir:',
    items: ['Abu Bakar Ash-Shiddiq', 'Umar bin Khattab', 'Utsman bin Affan', 'Ali bin Abi Thalib'],
    explanation: 'Urutan Khulafaur Rasyidin adalah Abu Bakar, Umar, Utsman, dan Ali.'
  },
  {
    subject_id: 10, question_type: 'ORDERING',
    text: 'Urutkan peristiwa penting dalam kehidupan Nabi Muhammad SAW berikut:',
    items: ['Kelahiran Tahun Gajah', 'Menerima wahyu pertama di Gua Hira', 'Peristiwa Isra Miraj', 'Wafatnya Rasulullah SAW di Madinah'],
    explanation: 'Urutan kronologis perjalanan hidup Nabi Muhammad SAW.'
  },
  // MATCHING SKI
  {
    subject_id: 10, question_type: 'MATCHING',
    text: 'Jodohkan nama tokoh Khulafaur Rasyidin dengan gelar/julukannya:',
    pairs: [
      { left: 'Abu Bakar', right: 'Ash-Shiddiq' },
      { left: 'Umar bin Khattab', right: 'Al-Faruq' },
      { left: 'Utsman bin Affan', right: 'Dzun Nurain' },
      { left: 'Ali bin Abi Thalib', right: 'Babul Ilmi' }
    ],
    explanation: 'Gelar para Khulafaur Rasyidin mencerminkan keutamaan dan akhlak mulia mereka.'
  },
  {
    subject_id: 10, question_type: 'MATCHING',
    text: 'Jodohkan nama tempat bersejarah Islam dengan peristiwa pentingnya:',
    pairs: [
      { left: 'Gua Hira', right: 'Tempat turun wahyu pertama' },
      { left: 'Gua Tsur', right: 'Tempat bersembunyi saat hijrah ke Madinah' },
      { left: 'Yatsrib', right: 'Nama lama kota Madinah' },
      { left: 'Habsyah', right: 'Tujuan hijrah pertama kaum Muslimin' }
    ],
    explanation: 'Tempat-tempat bersejarah dalam perkembangan awal dakwah Islam.'
  },
  {
    subject_id: 10, question_type: 'MATCHING',
    text: 'Jodohkan nama sahabat atau keluarga Nabi SAW dengan peran/hubungannya:',
    pairs: [
      { left: 'Khadijah binti Khuwailid', right: 'Istri pertama dan wanita pertama masuk Islam' },
      { left: 'Zaid bin Haritsah', right: 'Sahabat yang pertama memeluk Islam dari kalangan budak' },
      { left: 'Ali bin Abi Thalib', right: 'Sahabat yang pertama memeluk Islam dari kalangan anak-anak' },
      { left: 'Bilal bin Rabah', right: 'Muadzin pertama dalam sejarah Islam' }
    ],
    explanation: 'Peran para Assabiqunal Awwalun dalam mendukung dakwah Nabi SAW.'
  },
  {
    subject_id: 10, question_type: 'MATCHING',
    text: 'Jodohkan peristiwa dakwah Rasulullah dengan momen pentingnya:',
    pairs: [
      { left: 'Tahun Duka Cita (Amul Huzni)', right: 'Wafatnya Abu Thalib dan Khadijah' },
      { left: 'Isra Miraj', right: 'Perintah salat lima waktu' },
      { left: 'Fathu Makkah', right: 'Pembebasan kota Makkah secara damai' },
      { left: 'Haji Wada', right: 'Haji perpisahan Rasulullah SAW' }
    ],
    explanation: 'Momen-momen krusial dalam dakwah Islam di Makkah dan Madinah.'
  },
  {
    subject_id: 10, question_type: 'MATCHING',
    text: 'Jodohkan golongan masyarakat di Madinah pada masa Rasulullah dengan definisinya:',
    pairs: [
      { left: 'Kaum Muhajirin', right: 'Muslimin yang hijrah dari Makkah' },
      { left: 'Kaum Anshar', right: 'Penduduk asli Madinah yang menolong Muhajirin' },
      { left: 'Piagam Madinah', right: 'Kesepakatan hidup rukun antar suku dan agama' },
      { left: 'Bani Qainuqa', right: 'Salah satu kabilah Yahudi di Madinah' }
    ],
    explanation: 'Masyarakat Madinah terdiri atas kaum Muhajirin, Anshar, dan suku-suku lainnya.'
  },

  // Bahasa Arab (id 11)
  // ORDERING
  {
    subject_id: 11, question_type: 'ORDERING',
    text: 'Urutkan hitungan angka Arab 1 sampai 4 berikut ini:',
    items: ['Wahidun (١)', 'Itsnani (٢)', 'Tsalatsatun (٣)', 'Arba\'atun (٤)'],
    explanation: 'Urutan bilangan 1 sampai 4 dalam bahasa Arab.'
  },
  {
    subject_id: 11, question_type: 'ORDERING',
    text: 'Urutkan nama-nama hari dalam sepekan (Ahad sampai Rabu) dalam bahasa Arab:',
    items: ['Yaumul Ahad (الأحد)', 'Yaumul Itsnain (الإثنين)', 'Yaumuts Tsulatsa (الثلاثاء)', 'Yaumul Arbi\'a (الأربعاء)'],
    explanation: 'Urutan hari Ahad, Senin, Selasa, Rabu dalam bahasa Arab.'
  },
  {
    subject_id: 11, question_type: 'ORDERING',
    text: 'Urutkan kata-kata berikut agar menjadi kalimat sempurna: [فِي] [أَقْرَأُ] [المَكْتَبَةِ] [الكِتَابَ]:',
    items: ['أَقْرَأُ (Saya membaca)', 'الكِتَابَ (buku)', 'فِي (di)', 'المَكْتَبَةِ (perpustakaan)'],
    explanation: 'Susunan kalimat jumlah fi\'liyyah: Fi\'il + Maf\'ul bih + Jar Majrur.'
  },
  // MATCHING Bahasa Arab
  {
    subject_id: 11, question_type: 'MATCHING',
    text: 'Jodohkan kata sapaan bahasa Arab dengan artinya dalam bahasa Indonesia:',
    pairs: [
      { left: 'Shabahul khair', right: 'Selamat pagi' },
      { left: 'Masa\'ul khair', right: 'Selamat sore' },
      { left: 'Ahlan wa sahlan', right: 'Selamat datang' },
      { left: 'Ilar liqa\'', right: 'Sampai jumpa' }
    ],
    explanation: 'Ungkapan salam dan sapaan sehari-hari dalam bahasa Arab.'
  },
  {
    subject_id: 11, question_type: 'MATCHING',
    text: 'Jodohkan dhamir (kata ganti) dengan artinya dalam bahasa Indonesia:',
    pairs: [
      { left: 'Ana (أَنَا)', right: 'Saya' },
      { left: 'Anta (أَنْتَ)', right: 'Kamu (laki-laki)' },
      { left: 'Anti (أَنْتِ)', right: 'Kamu (perempuan)' },
      { left: 'Huwa (هُوَ)', right: 'Dia (laki-laki)' }
    ],
    explanation: 'Dhamir munfashil dasar dalam tata bahasa Arab.'
  },
  {
    subject_id: 11, question_type: 'MATCHING',
    text: 'Jodohkan nama perabotan rumah tangga berikut dengan bahasa Arabnya:',
    pairs: [
      { left: 'Ranjang / Tempat tidur', right: 'Sariirun (سَرِيْرٌ)' },
      { left: 'Lemari pakaian', right: 'Khizanatun (خِزَانَةٌ)' },
      { left: 'Bantal', right: 'Wisadatun (وِسَادَةٌ)' },
      { left: 'Lampu', right: 'Mishbahun (مِصْبَاحٌ)' }
    ],
    explanation: 'Kosakata perabotan rumah dalam bahasa Arab.'
  },
  {
    subject_id: 11, question_type: 'MATCHING',
    text: 'Jodohkan anggota tubuh dalam bahasa Arab dengan artinya:',
    pairs: [
      { left: 'Ra\'sun (رَأْسٌ)', right: 'Kepala' },
      { left: '\'Ainun (عَيْنٌ)', right: 'Mata' },
      { left: 'Anfun (أَنْفٌ)', right: 'Hidung' },
      { left: 'Yadun (يَدٌ)', right: 'Tangan' }
    ],
    explanation: 'A\'dha-ul jismi (anggota tubuh manusia).'
  },

  // PJOK (id 12)
  // ORDERING
  {
    subject_id: 12, question_type: 'ORDERING',
    text: 'Urutkan tahapan lompat jauh gaya jongkok yang benar:',
    items: ['Awalan lari cepat menuju balok tumpuan', 'Tolakan dengan satu kaki terkuat', 'Melayang di udara dengan posisi jongkok', 'Mendarat dengan kedua kaki mengeper'],
    explanation: 'Fase lompat jauh: awalan, tolakan, melayang, dan mendarat.'
  },
  {
    subject_id: 12, question_type: 'ORDERING',
    text: 'Urutkan tahapan melakukan guling depan (forward roll) pada senam lantai:',
    items: ['Berdiri tegak menghadap matras', 'Menempelkan kedua telapak tangan pada matras', 'Memasukkan kepala hingga tengkuk menyentuh matras', 'Menggulingkan badan dan kembali jongkok/berdiri'],
    explanation: 'Tahapan guling depan yang aman menghindari cedera leher.'
  },
  {
    subject_id: 12, question_type: 'ORDERING',
    text: 'Urutkan pertolongan pertama pada cedera keseleo metode RICE berikut:',
    items: ['Rest (istirahatkan bagian yang cedera)', 'Ice (kompres menggunakan es batu)', 'Compression (balut tekan dengan perban elastis)', 'Elevation (tinggikan posisi bagian cedera di atas jantung)'],
    explanation: 'Protokol penanganan cedera akut RICE: Rest, Ice, Compression, Elevation.'
  },
  // MATCHING PJOK
  {
    subject_id: 12, question_type: 'MATCHING',
    text: 'Jodohkan cabang olahraga atletik dengan nomor perlombaannya:',
    pairs: [
      { left: 'Lari cepat (Sprint)', right: 'Nomor lari jarak pendek 100 meter' },
      { left: 'Lompat jauh', right: 'Nomor lompat dengan bak pasir' },
      { left: 'Tolak peluru', right: 'Nomor lempar bola besi' },
      { left: 'Lari estafet', right: 'Nomor lari sambung menggunakan tongkat' }
    ],
    explanation: 'Nomor-nomor cabang olahraga atletik meliputi lari, lompat, dan lempar.'
  },
  {
    subject_id: 12, question_type: 'MATCHING',
    text: 'Jodohkan komponen kebugaran jasmani dengan bentuk latihan yang sesuai:',
    pairs: [
      { left: 'Kekuatan otot perut', right: 'Sit up' },
      { left: 'Kekuatan otot lengan dan dada', right: 'Push up' },
      { left: 'Kelenturan tubuh', right: 'Mencium lutut saat duduk selonjor' },
      { left: 'Daya tahan jantung dan paru', right: 'Lari joging berkelanjutan' }
    ],
    explanation: 'Latihan kebugaran jasmani melatih kekuatan, kelenturan, dan daya tahan.'
  },
  {
    subject_id: 12, question_type: 'MATCHING',
    text: 'Jodohkan istilah permainan bola basket dengan penjelasannya:',
    pairs: [
      { left: 'Dribbling', right: 'Memantul-mantulkan bola ke lantai sambil berjalan/berlari' },
      { left: 'Passing', right: 'Mengoper bola kepada rekan satu tim' },
      { left: 'Shooting', right: 'Menembak bola ke arah ring keranjang lawan' },
      { left: 'Rebound', right: 'Menangkap bola pantul yang gagal masuk ring' }
    ],
    explanation: 'Teknik dasar dalam permainan bola basket.'
  },
  {
    subject_id: 12, question_type: 'MATCHING',
    text: 'Jodohkan gaya renang dengan ciri khas gerakannya:',
    pairs: [
      { left: 'Gaya Dada (Katak)', right: 'Gerakan kaki seperti kaki katak mendayung' },
      { left: 'Gaya Bebas (Crawl)', right: 'Mengayuh tangan bergantian dengan posisi badan telungkup' },
      { left: 'Gaya Punggung', right: 'Posisi badan terlentang menghadap ke atas permukaan air' },
      { left: 'Gaya Kupu-kupu (Dolphin)', right: 'Kedua lengan mengayuh serempak ke depan bersamaan gerak pinggul' }
    ],
    explanation: 'Empat gaya utama dalam renang prestasi.'
  },

  // Seni Budaya (id 13)
  // ORDERING
  {
    subject_id: 13, question_type: 'ORDERING',
    text: 'Urutkan tahapan pembuatan karya seni gambar cerita/komik sederhana:',
    items: ['Menentukan tema dan alur cerita', 'Membuat sketsa karakter dan panel gambar', 'Menebalkan garis sketsa dengan spidol/pena', 'Mewarnai gambar dan menulis balon kata dialog'],
    explanation: 'Langkah menggambar cerita dari konsep hingga finishing.'
  },
  {
    subject_id: 13, question_type: 'ORDERING',
    text: 'Urutkan tangga nada diatonis mayor natural dari nada terendah ke tertinggi:',
    items: ['Do (C)', 'Re (D)', 'Mi (E)', 'Fa (F)'],
    explanation: 'Urutan nada dasar solmisasi Do - Re - Mi - Fa.'
  },
  {
    subject_id: 13, question_type: 'ORDERING',
    text: 'Urutkan tahapan pembuatan kolase dari bahan daun kering:',
    items: ['Mengumpulkan dan mengeringkan daun', 'Membuat pola sketsa pada kertas gambar', 'Menggunting daun sesuai bentuk yang dibutuhkan', 'Menempelkan daun dengan lem pada kertas pola'],
    explanation: 'Teknik kolase memanfaatkan bahan alam yang ditempel pada permukaan bidang datar.'
  },
  // MATCHING Seni Budaya
  {
    subject_id: 13, question_type: 'MATCHING',
    text: 'Jodohkan alat musik tradisional berikut dengan daerah asalnya di Indonesia:',
    pairs: [
      { left: 'Angklung', right: 'Jawa Barat' },
      { left: 'Sasando', right: 'Nusa Tenggara Timur (NTT)' },
      { left: 'Gamelan', right: 'Jawa Tengah / DI Yogyakarta' },
      { left: 'Tifa', right: 'Papua dan Maluku' }
    ],
    explanation: 'Alat musik tradisional merupakan warisan kekayaan budaya nusantara.'
  },
  {
    subject_id: 13, question_type: 'MATCHING',
    text: 'Jodohkan tarian tradisional dengan daerah asalnya:',
    pairs: [
      { left: 'Tari Saman', right: 'Aceh' },
      { left: 'Tari Kecak', right: 'Bali' },
      { left: 'Tari Piring', right: 'Sumatera Barat' },
      { left: 'Tari Jaipong', right: 'Jawa Barat' }
    ],
    explanation: 'Tari-tarian daerah memiliki ciri khas gerak dan busana adat.'
  },
  {
    subject_id: 13, question_type: 'MATCHING',
    text: 'Jodohkan kelompok warna dalam seni rupa dengan contoh warnanya:',
    pairs: [
      { left: 'Warna Primer', right: 'Merah, Kuning, Biru' },
      { left: 'Warna Sekunder', right: 'Hijau, Oranye, Ungu' },
      { left: 'Warna Netral', right: 'Hitam, Putih, Abu-abu' },
      { left: 'Warna Hangat', right: 'Merah, Jingga, Kuning' }
    ],
    explanation: 'Teori warna Brewster membagi warna primer, sekunder, dan netral.'
  },
  {
    subject_id: 13, question_type: 'MATCHING',
    text: 'Jodohkan teknik berkarya seni rupa dua dimensi dengan penjelasannya:',
    pairs: [
      { left: 'Kolase', right: 'Menempelkan potongan berbagai bahan pada bidang gambar' },
      { left: 'Mosaik', right: 'Menempelkan kepingan kecil bahan sejenis (kaca/batu/kertas)' },
      { left: 'Montase', right: 'Menempelkan potongan gambar-gambar yang sudah jadi dari koran/majalah' },
      { left: 'Aplikasi', right: 'Menempelkan guntingan kain pada kain lain untuk hiasan' }
    ],
    explanation: 'Perbedaan teknik tempel kolase, mosaik, montase, dan aplikasi.'
  },

  // Bahasa Inggris (id 14)
  // ORDERING
  {
    subject_id: 14, question_type: 'ORDERING',
    text: 'Urutkan kata-kata berikut agar menjadi kalimat bahasa Inggris yang benar: [is] [reading] [a book] [She]:',
    items: ['She (Subject)', 'is (To be)', 'reading (Verb-ing)', 'a book (Object)'],
    explanation: 'Struktur Present Continuous Tense: Subject + is/am/are + Verb-ing + Object.'
  },
  {
    subject_id: 14, question_type: 'ORDERING',
    text: 'Urutkan waktu dalam sehari dari pagi hingga malam dalam bahasa Inggris:',
    items: ['Morning (Pagi)', 'Afternoon (Siang/Sore)', 'Evening (Menjelang malam)', 'Night (Malam)'],
    explanation: 'Urutan pembagian waktu harian dalam bahasa Inggris.'
  },
  {
    subject_id: 14, question_type: 'ORDERING',
    text: 'Urutkan bilangan dalam bahasa Inggris dari satu sampai empat:',
    items: ['One (1)', 'Two (2)', 'Three (3)', 'Four (4)'],
    explanation: 'Cardinal numbers 1 to 4.'
  },
  // MATCHING Bahasa Inggris
  {
    subject_id: 14, question_type: 'MATCHING',
    text: 'Jodohkan ruangan di sekolah (school rooms) dengan artinya dalam bahasa Indonesia:',
    pairs: [
      { left: 'Classroom', right: 'Ruang kelas' },
      { left: 'Library', right: 'Perpustakaan' },
      { left: 'Canteen', right: 'Kantin sekolah' },
      { left: 'School yard', right: 'Halaman / Lapangan sekolah' }
    ],
    explanation: 'Vocabulary of places around school.'
  },
  {
    subject_id: 14, question_type: 'MATCHING',
    text: 'Jodohkan profesi (jobs and occupations) dengan deskripsi tugasnya:',
    pairs: [
      { left: 'Teacher', right: 'Teaches students at school' },
      { left: 'Doctor', right: 'Cures sick patients at hospital' },
      { left: 'Farmer', right: 'Plants rice and crops in the field' },
      { left: 'Chef', right: 'Cooks delicious food in a restaurant' }
    ],
    explanation: 'Vocabulary of jobs and what they do.'
  },
  {
    subject_id: 14, question_type: 'MATCHING',
    text: 'Jodohkan nama hewan dengan kelompok habitat/jenisnya:',
    pairs: [
      { left: 'Eagle', right: 'Bird that flies in the sky' },
      { left: 'Dolphin', right: 'Friendly mammal living in the sea' },
      { left: 'Elephant', right: 'Big mammal with long trunk' },
      { left: 'Crocodile', right: 'Reptile with sharp teeth living near rivers' }
    ],
    explanation: 'Animal vocabulary and their traits.'
  },
  {
    subject_id: 14, question_type: 'MATCHING',
    text: 'Jodohkan kata sifat (adjectives) dengan lawan katanya (antonyms):',
    pairs: [
      { left: 'Big (Besar)', right: 'Small (Kecil)' },
      { left: 'Hot (Panas)', right: 'Cold (Dingin)' },
      { left: 'Fast (Cepat)', right: 'Slow (Lambat)' },
      { left: 'Happy (Senang)', right: 'Sad (Sedih)' }
    ],
    explanation: 'Opposite adjectives in English.'
  },

  // Al-Qur'an Hadis (id 8) - Matching
  {
    subject_id: 8, question_type: 'MATCHING',
    text: 'Jodohkan hukum bacaan tajwid mim sukun (مْ) dengan ketentuannya:',
    pairs: [
      { left: 'Ikhfa Syafawi', right: 'Mim sukun bertemu huruf Ba (ب)' },
      { left: 'Idgham Mimi (Mitslain)', right: 'Mim sukun bertemu huruf Mim (م)' },
      { left: 'Idzhar Syafawi', right: 'Mim sukun bertemu selain Ba dan Mim' },
      { left: 'Ghunnah', right: 'Dengung yang menyertai bacaan' }
    ],
    explanation: 'Tiga hukum bacaan tajwid ketika mim sukun bertemu huruf hijaiyah.'
  },
  {
    subject_id: 8, question_type: 'MATCHING',
    text: 'Jodohkan nama surah pendek dalam Juz Amma dengan pokok ajarannya:',
    pairs: [
      { left: 'Surah At-Takatsur', right: 'Peringatan tentang bahaya bermegah-megahan' },
      { left: 'Surah Al-Qari\'ah', right: 'Hari kiamat dan timbangan amal perbuatan' },
      { left: 'Surah Al-Humazah', right: 'Ancaman bagi pengumpat dan pencela' },
      { left: 'Surah Al-Ma\'un', right: 'Ciri-ciri orang yang mendustakan agama' }
    ],
    explanation: 'Pesan utama surah-surah pendek dalam Al-Qur\'an.'
  },
  {
    subject_id: 8, question_type: 'MATCHING',
    text: 'Jodohkan hadis Nabi SAW dengan tema akhlak yang diajarkan:',
    pairs: [
      { left: 'Hadis tentang Niat', right: 'Setiap perbuatan dinilai dari niatnya' },
      { left: 'Hadis tentang Kebersihan', right: 'Kebersihan adalah sebagian dari iman' },
      { left: 'Hadis tentang Menahan Marah', right: 'Janganlah marah, bagimu surga' },
      { left: 'Hadis tentang Senyum', right: 'Senyummu di hadapan saudaramu adalah sedekah' }
    ],
    explanation: 'Hadis-hadis fadhilah amal pembentuk karakter mulia anak madrasah.'
  },

  // Fikih (id 9) - Matching
  {
    subject_id: 9, question_type: 'MATCHING',
    text: 'Jodohkan rukun salat dengan urutan pelaksanaannya:',
    pairs: [
      { left: 'Niat dan Takbiratul Ihram', right: 'Awal pembuka ibadah salat' },
      { left: 'Membaca Surah Al-Fatihah', right: 'Rukun bacaan wajib di setiap rakaat' },
      { left: 'Rukuk dengan Thuma\'ninah', right: 'Membungkuk hingga punggung rata' },
      { left: 'Salam Pertama', right: 'Penutup ibadah salat dengan menoleh ke kanan' }
    ],
    explanation: 'Rukun salat adalah bagian inti yang wajib dikerjakan agar salat sah.'
  },
  {
    subject_id: 9, question_type: 'MATCHING',
    text: 'Jodohkan jenis-jenis najis dengan cara menyucikannya:',
    pairs: [
      { left: 'Najis Mukhaffafah (Ringan)', right: 'Cukup dipercikkan air bersih pada bagian terkena' },
      { left: 'Najis Mutawassithah (Sedang)', right: 'Dicuci hingga hilang warna, bau, dan rasanya' },
      { left: 'Najis Mughaladhah (Berat)', right: 'Dibasuh 7 kali, salah satunya dicampur debu tanah' },
      { left: 'Air Mutlak', right: 'Air suci dan menyucikan untuk berwudhu' }
    ],
    explanation: 'Pembagian najis dalam fikih Islam dan tata cara bersuci (thaharah).'
  },
  {
    subject_id: 9, question_type: 'MATCHING',
    text: 'Jodohkan jenis salat sunnah dengan waktu/sebab pelaksanaannya:',
    pairs: [
      { left: 'Salat Dhuha', right: 'Dikerjakan pagi hari saat matahari mulai naik' },
      { left: 'Salat Tahajud', right: 'Dikerjakan di malam hari setelah bangun tidur' },
      { left: 'Salat Rawatib', right: 'Pengiring sebelum atau sesudah salat fardhu' },
      { left: 'Salat Tarawih', right: 'Salat sunnah khusus pada malam bulan Ramadan' }
    ],
    explanation: 'Berbagai macam salat sunnah yang dianjurkan dalam Islam.'
  },

  // Akidah Akhlak (id 7) - Matching
  {
    subject_id: 7, question_type: 'MATCHING',
    text: 'Jodohkan kalimat thayyibah dengan waktu pengucapannya:',
    pairs: [
      { left: 'Bismillah', right: 'Sebelum memulai perbuatan baik' },
      { left: 'Alhamdulillah', right: 'Setelah selesai melakukan sesuatu atau bersyukur' },
      { left: 'Subhanallah', right: 'Melihat keagungan ciptaan Allah atau hal mengherankan' },
      { left: 'Astaghfirullah', right: 'Ketika khilaf melakukan kesalahan atau dosa' }
    ],
    explanation: 'Kalimat thayyibah mengiringi aktivitas harian seorang muslim.'
  },
  {
    subject_id: 7, question_type: 'MATCHING',
    text: 'Jodohkan nama surga dan neraka dengan sifat/penghuninya:',
    pairs: [
      { left: 'Surga Firdaus', right: 'Tingkatan surga tertinggi bagi orang beriman' },
      { left: 'Surga Adn', right: 'Tempat kediaman abadi penuh kenikmatan' },
      { left: 'Neraka Jahannam', right: 'Tempat siksaan bagi orang yang durhaka' },
      { left: 'Neraka Hawiyah', right: 'Tempat siksa berupa api yang menyala-nyala' }
    ],
    explanation: 'Balasan surga dan neraka pada hari akhir kelak.'
  }
];

console.log(`Menambahkan ${extraQuestions.length} soal tambahan terkurasi...`);
const insertStmt = db.prepare(`
  INSERT INTO questions (
    subject_id, text, options_json, answer_index, explanation, difficulty, eff_difficulty,
    hash, is_active, question_type, type_data_json
  ) VALUES (?, ?, ?, 0, ?, 2, 2, ?, 1, ?, ?)
  ON CONFLICT(subject_id, hash) DO UPDATE SET
    options_json=excluded.options_json,
    explanation=excluded.explanation,
    type_data_json=excluded.type_data_json,
    is_active=1
`);

let inserted = 0;
for (const q of extraQuestions) {
  const h = questionHash(q.text);
  let opts = [];
  let typeData = {};

  if (q.question_type === 'ORDERING') {
    opts = q.items;
    typeData = { correct_order: q.items };
  } else if (q.question_type === 'MATCHING') {
    opts = q.pairs.map(p => p.left);
    typeData = { pairs: q.pairs };
  }

  insertStmt.run(
    q.subject_id,
    q.text,
    JSON.stringify(opts),
    q.explanation,
    h,
    q.question_type,
    JSON.stringify(typeData)
  );
  inserted++;
}

console.log(`✓ Berhasil menambahkan/memperbarui ${inserted} soal tambahan ke database!`);
