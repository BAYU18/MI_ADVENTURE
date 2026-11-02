#!/usr/bin/env node
const { saveBatch } = require('./helper');

function assignKey(optsWithKey, forcedIndex) {
  const { correct, wrong } = optsWithKey;
  const options = [...wrong];
  options.splice(forcedIndex, 0, correct);
  return { options, answer: forcedIndex };
}

// -------------------------------------------------------------
// BAB 1: Sudah Besar (38 soal: 13 d1, 15 d2, 10 d3)
// -------------------------------------------------------------
const rawB1 = [
  // d1
  { q: "Kalimat yang memerlukan objek disebut kalimat ...", c: "Transitif", w: ["Intransitif", "Pasif", "Perintah"], e: "Kalimat transitif memerlukan objek penderita.", d: 1 },
  { q: "Kalimat yang tidak memerlukan objek disebut kalimat ...", c: "Intransitif", w: ["Transitif", "Aktif", "Tanya"], e: "Kalimat intransitif maknanya sudah lengkap tanpa objek.", d: 1 },
  { q: "Buku rujukan resmi untuk mencari arti kata adalah ...", c: "KBBI", w: ["Atlas", "Ensiklopedia", "Novel"], e: "KBBI (Kamus Besar Bahasa Indonesia) memuat arti baku kata.", d: 1 },
  { q: "Rasa takut berlebihan terhadap sesuatu disebut ...", c: "Fobia", w: ["Alergi", "Trauma", "Cemas"], e: "Fobia adalah ketakutan berlebihan dan tidak wajar.", d: 1 },
  { q: "Imbuhan 'me-' pada kata 'baca' membentuk kata ...", c: "Membaca", w: ["Membacakan", "Pustaka", "Terbaca"], e: "me- + baca luluh menjadi membaca.", d: 1 },
  { q: "Contoh kalimat transitif berikut adalah ...", c: "Ibu memasak rendang", w: ["Adik menangis", "Burung terbang", "Ayah tidur"], e: "'rendang' adalah objek dari kata kerja memasak.", d: 1 },
  { q: "Contoh kalimat intransitif berikut adalah ...", c: "Kelinci melompat", w: ["Ibu mencuci baju", "Budi makan pisang", "Kakak menulis puisi"], e: "'melompat' tidak membutuhkan objek penyerta.", d: 1 },
  { q: "Kata dasar dari 'menulis' adalah ...", c: "Tulis", w: ["Nulis", "Tuliskan", "Menulis"], e: "Kata dasar menulis adalah tulis dengan peluluhan huruf t.", d: 1 },
  { q: "Kata dasar dari 'menyapu' adalah ...", c: "Sapu", w: ["Nyapu", "Sapukan", "Penyapu"], e: "Huruf s luluh menjadi meny- pada kata dasar sapu.", d: 1 },
  { q: "Fobia terhadap kegelapan disebut ...", c: "Niktofobia", w: ["Klaustrofobia", "Akrofobia", "Araknofobia"], e: "Niktofobia adalah rasa takut berlebihan pada gelap.", d: 1 },
  { q: "Subjek pada kalimat 'Rani meminjam buku' adalah ...", c: "Rani", w: ["Meminjam", "Buku", "Perpustakaan"], e: "Rani adalah pelaku (subjek) yang melakukan tindakan.", d: 1 },
  { q: "Predikat pada kalimat 'Ayah memperbaiki sepeda' adalah ...", c: "Memperbaiki", w: ["Ayah", "Sepeda", "Di rumah"], e: "Memperbaiki adalah kata kerja yang menjadi predikat.", d: 1 },
  { q: "Objek pada kalimat 'Beni menyiram bunga' adalah ...", c: "Bunga", w: ["Beni", "Menyiram", "Pagi"], e: "Bunga adalah objek yang menerima tindakan menyiram.", d: 1 },

  // d2
  { q: "Manakah kalimat berikut yang berpola S-P-O?", c: "Doni memotong rumput", w: ["Doni berlari cepat", "Rumput dipotong Doni", "Doni bernyanyi riang"], e: "Doni (S) memotong (P) rumput (O).", d: 2 },
  { q: "Imbuhan 'me-' jika bertemu kata dasar 'pukul' berubah menjadi ...", c: "Memukul", w: ["Mempukul", "Mepukul", "Menyukul"], e: "Huruf p pada awal kata dasar luluh menjadi mem-.", d: 2 },
  { q: "Imbuhan 'me-' jika bertemu kata dasar 'sapu' berubah menjadi ...", c: "Menyapu", w: ["Mensapu", "Mesapu", "Mengsapu"], e: "Huruf s pada kata dasar berawalan konsonan luluh menjadi meny-.", d: 2 },
  { q: "Imbuhan 'me-' jika bertemu kata dasar 'kira' berubah menjadi ...", c: "Mengira", w: ["Menkira", "Mekira", "Menggira"], e: "Huruf k luluh menjadi meng- pada kata mengira.", d: 2 },
  { q: "Pola kalimat 'Adik tidur di kamar' adalah ...", c: "S-P-K", w: ["S-P-O", "S-P-Pel", "S-K-P"], e: "Adik (S) tidur (P) di kamar (Keterangan tempat).", d: 2 },
  { q: "Cara mencari kata 'terbakar' dalam kamus cetak adalah mencari kata dasar ...", c: "Bakar", w: ["Terbakar", "Membakar", "Kebakaran"], e: "Kata turunan selalu dicari melalui kata dasarnya di kamus.", d: 2 },
  { q: "Manakah yang merupakan kalimat intransitif dengan keterangan waktu?", c: "Pak Tani berangkat pagi-pagi", w: ["Pak Tani mencangkul sawah", "Pak Tani menanam padi", "Pak Tani memanen jagung"], e: "Berangkat tidak memerlukan objek, pagi-pagi adalah keterangan waktu.", d: 2 },
  { q: "Fobia terhadap ruang sempit tertutup disebut ...", c: "Klaustrofobia", w: ["Akrofobia", "Hidrofobia", "Niktofobia"], e: "Klaustrofobia adalah takut berada di ruang tertutup/sempit.", d: 2 },
  { q: "Imbuhan 'me-' yang tidak mengalami peluluhan huruf terjadi pada kata ...", c: "Membawa", w: ["Menulis", "Memasak", "Menyapu"], e: "Kata dasar bawa berawalan huruf b sehingga tidak luluh (membawa).", d: 2 },
  { q: "Kalimat transitif berikut yang dilengkapi keterangan tempat adalah ...", c: "Siti membaca komik di teras", w: ["Siti membaca komik baru", "Siti membaca dengan rajin", "Siti belajar di kamar"], e: "Siti (S) membaca (P) komik (O) di teras (Keterangan tempat).", d: 2 },
  { q: "Ciri orang yang mengalami fobia saat bertemu pemicunya adalah ...", c: "Jantung berdebar sangat kencang", w: ["Tertawa terbahak-bahak", "Merasa sangat mengantuk", "Merasa lapar tiba-tiba"], e: "Gejala fobia antara lain cemas hebat dan jantung berdebar.", d: 2 },
  { q: "Kata berimbuhan me- yang bermakna 'menghasilkan' adalah ...", c: "Mengaum", w: ["Menulis", "Menyapu", "Memotong"], e: "Mengaum berarti mengeluarkan atau menghasilkan suara aum.", d: 2 },
  { q: "Penulisan kata berimbuhan yang benar adalah ...", c: "Mengubah", w: ["Merubah", "Menyubit", "Mensapu"], e: "Kata dasar ubah berawalan vokal sehingga menjadi mengubah.", d: 2 },
  { q: "Kalimat di bawah ini yang menggunakan kata kerja aktif transitif adalah ...", c: "Ardi memanjat pohon mangga", w: ["Ardi berdiri di bawah pohon", "Pohon mangga berbuah lebat", "Ardi tersenyum lebar"], e: "Memanjat membutuhkan objek penderita yaitu pohon mangga.", d: 2 },
  { q: "Pernyataan yang tepat tentang KBBI adalah ...", c: "Kata disusun urut sesuai abjad", w: ["Kata disusun berdasar panjangnya", "Hanya berisi nama orang", "Disusun berdasar jumlah halaman"], e: "Entri kamus disusun secara alfabetis dari A sampai Z.", d: 2 },

  // d3
  { q: "Perhatikan kalimat: 'Lani menaruh kacamata di atas meja.' Fungsi kata 'di atas meja' adalah ...", c: "Keterangan tempat", w: ["Objek penderita", "Pelengkap", "Predikat"], e: "'di atas meja' menerangkan tempat terjadinya peristiwa menaruh.", d: 3 },
  { q: "Kalimat transitif dapat diubah menjadi kalimat pasif. Manakah bentuk pasif dari 'Kucing mengejar tikus'?", c: "Tikus dikejar oleh kucing", w: ["Kucing dikejar oleh tikus", "Tikus mengejar kucing liar", "Kucing berlari cepat"], e: "Objek tikus maju menjadi subjek pada kalimat pasif.", d: 3 },
  { q: "Mengapa kalimat 'Budi menangis keras' tidak bisa diubah menjadi kalimat pasif?", c: "Karena tidak memiliki objek", w: ["Karena subjeknya nama orang", "Karena predikatnya kata sifat", "Karena ada keterangan cara"], e: "Hanya kalimat yang memiliki objek yang dapat dipasifkan.", d: 3 },
  { q: "Kata dasar 'kristal' jika diberi imbuhan me- menjadi ...", c: "Mengkristal", w: ["Mengristal", "Menkristal", "Mekristal"], e: "Huruf k yang diikuti konsonan r tidak luluh, jadi mengkristal.", d: 3 },
  { q: "Fobia ketinggian dikenal dengan istilah ...", c: "Akrofobia", w: ["Aerofobia", "Ofidiofobia", "Araknofobia"], e: "Akrofobia adalah ketakutan ekstrem terhadap tempat tinggi.", d: 3 },
  { q: "Perhatikan: 'Anak itu memancing ikan di danau kemarin sore.' Unsur kalimat tersebut secara berurutan adalah ...", c: "S-P-O-K-K", w: ["S-P-Pel-K", "S-P-O-Pel", "S-K-P-O"], e: "Anak itu (S) memancing (P) ikan (O) di danau (K.tempat) kemarin sore (K.waktu).", d: 3 },
  { q: "Kalimat yang menggunakan kata berimbuhan me- bermakna 'menjadi seperti' adalah ...", c: "Air laut mulai membeku", w: ["Adik menangis tersedu", "Ibu menggoreng pisang", "Paman mengecat pagar"], e: "Membeku bermakna menjadi beku seperti es.", d: 3 },
  { q: "Manakah pasangan kata dasar dan kata berimbuhan yang luluh dengan benar?", c: "Tolong -> Menolong", w: ["Tulis -> Mentulis", "Pegang -> Mempegang", "Sikat -> Mensikat"], e: "Huruf t pada tolong luluh menjadi menolong.", d: 3 },
  { q: "Dalam sebuah cerita, kalimat 'Hati Lani menciut saat melihat laba-laba' menggambarkan perasaan ...", c: "Sangat takut", w: ["Sangat senang", "Sangat kagum", "Biasa saja"], e: "'Hati menciut' adalah kiasan untuk perasaan ciut atau sangat takut.", d: 3 },
  { q: "Manakah kalimat yang memiliki pola sama dengan 'Burung kenari berkicau merdu'?", c: "Mobil balap melaju kencang", w: ["Ayah mencuci mobil", "Rina membaca buku tebal", "Budi melempar bola"], e: "Keduanya berpola S-P-K (Keterangan cara: merdu / kencang).", d: 3 }
];

// -------------------------------------------------------------
// BAB 2: Di Bawah Atap (38 soal: 13 d1, 15 d2, 10 d3)
// -------------------------------------------------------------
const rawB2 = [
  // d1
  { q: "Cerita yang berdasarkan khayalan atau rekaan pengarang disebut cerita ...", c: "Fiksi", w: ["Nonfiksi", "Biografi", "Fakta"], e: "Cerita fiksi lahir dari daya imajinasi pengarang.", d: 1 },
  { q: "Cerita yang berdasarkan kenyataan atau fakta disebut cerita ...", c: "Nonfiksi", w: ["Fiksi", "Dongeng", "Mite"], e: "Nonfiksi ditulis berlandaskan fakta yang benar-benar terjadi.", d: 1 },
  { q: "Kata yang memiliki ejaan dan pelafalan sama tetapi artinya berbeda disebut ...", c: "Homonim", w: ["Sinonim", "Antonim", "Akronim"], e: "Homonim memiliki bentuk dan bunyi sama, namun makna berbeda.", d: 1 },
  { q: "Kata 'bisa' bermakna racun ular dan dapat bermakna sanggup. Kata ini termasuk ...", c: "Homonim", w: ["Sinonim", "Antonim", "Homograf"], e: "Kata 'bisa' adalah contoh klasik homonim.", d: 1 },
  { q: "Gambar yang menunjukkan letak kota, jalan, atau ruangan disebut ...", c: "Denah", w: ["Lukisan", "Poster", "Grafik"], e: "Denah adalah petunjuk visual letak suatu tempat.", d: 1 },
  { q: "Arah mata angin yang berlawanan dengan utara adalah ...", c: "Selatan", w: ["Barat", "Timur", "Tenggara"], e: "Utara berhadapan langsung dengan selatan.", d: 1 },
  { q: "Matahari terbit dari arah ...", c: "Timur", w: ["Barat", "Utara", "Selatan"], e: "Matahari selalu terbit di ufuk timur.", d: 1 },
  { q: "Matahari terbenam di arah ...", c: "Barat", w: ["Timur", "Utara", "Selatan"], e: "Matahari terbenam di ufuk barat.", d: 1 },
  { q: "Contoh karya tulisan nonfiksi adalah ...", c: "Buku pelajaran sains", w: ["Cerita dongeng kancil", "Kisah peri ajaib", "Cerita raksasa"], e: "Buku pelajaran sains memuat fakta ilmiah.", d: 1 },
  { q: "Paragraf yang kalimat utamanya berada di awal paragraf disebut paragraf ...", c: "Deduktif", w: ["Induktif", "Campuran", "Naratif"], e: "Deduktif: gagasan pokok terletak di awal paragraf.", d: 1 },
  { q: "Paragraf yang kalimat utamanya berada di akhir paragraf disebut paragraf ...", c: "Induktif", w: ["Deduktif", "Deskriptif", "Eksposisi"], e: "Induktif: gagasan pokok berada di akhir sebagai kesimpulan.", d: 1 },
  { q: "Tokoh utama dalam sebuah cerita fiksi adalah tokoh yang ...", c: "Paling sering diceritakan", w: ["Hanya muncul sekali", "Paling jahat", "Tidak pernah bicara"], e: "Tokoh utama mendominasi jalannya alur cerita.", d: 1 },
  { q: "Latar dalam sebuah cerita meliputi ...", c: "Tempat, waktu, dan suasana", w: ["Hanya nama tokoh", "Panjangnya halaman buku", "Harga buku"], e: "Latar menjelaskan di mana, kapan, dan suasana peristiwa.", d: 1 },

  // d2
  { q: "Kata 'genting' bermakna atap rumah dan juga bermakna ...", c: "Gawat atau tegang", w: ["Lembut", "Dingin", "Tinggi"], e: "Keadaan genting berarti situasi darurat atau tegang.", d: 2 },
  { q: "Perhatikan: 'Bulan ini paman menatap bulan purnama.' Kata 'bulan' pada kalimat tersebut merupakan contoh ...", c: "Homonim", w: ["Sinonim", "Antonim", "Hipernim"], e: "Bulan nama waktu dan bulan benda langit adalah homonim.", d: 2 },
  { q: "Arah mata angin di antara utara dan timur adalah ...", c: "Timur laut", w: ["Tenggara", "Barat daya", "Barat laut"], e: "Antara utara dan timur adalah timur laut.", d: 2 },
  { q: "Arah mata angin di antara selatan dan barat adalah ...", c: "Barat daya", w: ["Barat laut", "Tenggara", "Timur laut"], e: "Antara selatan dan barat adalah barat daya.", d: 2 },
  { q: "Pada denah standar, arah utara selalu menunjuk ke arah ...", c: "Atas", w: ["Bawah", "Kanan", "Kiri"], e: "Arah atas peta atau denah konvensional menunjuk ke utara.", d: 2 },
  { q: "Jika kita menghadap ke arah timur, maka tangan kiri kita menunjuk ke arah ...", c: "Utara", w: ["Selatan", "Barat", "Tenggara"], e: "Menghadap timur: depan timur, belakang barat, kiri utara, kanan selatan.", d: 2 },
  { q: "Kata 'rapat' pada 'pertemuan dinas' dan 'barisan yang rapat' memiliki hubungan ...", c: "Homonim", w: ["Sinonim", "Antonim", "Homofon"], e: "Ejaan dan lafalnya persis sama namun artinya berbeda.", d: 2 },
  { q: "Pesan moral yang ingin disampaikan pengarang kepada pembaca disebut ...", c: "Amanat", w: ["Tema", "Alur", "Latar"], e: "Amanat adalah pesan kebaikan dalam sebuah cerita.", d: 2 },
  { q: "Bagian awal dalam cerita yang memperkenalkan tokoh dan latar disebut ...", c: "Orientasi", w: ["Komplikasi", "Resolusi", "Koda"], e: "Orientasi berisi pengenalan awal tokoh, latar, dan situasi.", d: 2 },
  { q: "Puncak ketegangan atau masalah dalam suatu cerita disebut ...", c: "Klimaks", w: ["Orientasi", "Resolusi", "Prolog"], e: "Klimaks adalah titik balik masalah paling menegangkan.", d: 2 },
  { q: "Penyelesaian masalah dalam sebuah cerita disebut ...", c: "Resolusi", w: ["Orientasi", "Komplikasi", "Klimaks"], e: "Resolusi memuat jalan keluar atas konflik yang terjadi.", d: 2 },
  { q: "Kalimat yang berisi pendapat atau perkiraan seseorang disebut kalimat ...", c: "Opini", w: ["Fakta", "Perintah", "Tanya"], e: "Opini bersifat subjektif dan kebenarannya belum pasti.", d: 2 },
  { q: "Kalimat yang menyatakan kenyataan yang dapat dibuktikan kebenarannya disebut ...", c: "Fakta", w: ["Opini", "Saran", "Kritik"], e: "Fakta berisi data nyata yang terbukti benar secara objektif.", d: 2 },
  { q: "Manakah kalimat di bawah ini yang merupakan fakta?", c: "Indonesia memiliki ribuan pulau", w: ["Pantai Kuta pantai terindah di dunia", "Semua anak suka makan es krim", "Membaca komik lebih asyik dari buku"], e: "Jumlah kepulauan Indonesia adalah kenyataan geografis.", d: 2 },
  { q: "Simbol arah mata angin pada peta biasanya digambarkan dengan ...", c: "Tanda panah ke atas huruf U", w: ["Lingkaran hitam pekat", "Gambar bintang kuning", "Segitiga berwarna merah"], e: "Huruf U (Utara) dengan panah adalah penunjuk arah baku.", d: 2 },

  // d3
  { q: "Perhatikan: 'Rian berdiri menghadap matahari terbit. Ia lalu berputar 90 derajat searah jarum jam.' Menghadap ke manakah Rian sekarang?", c: "Selatan", w: ["Utara", "Barat", "Barat daya"], e: "Dari timur putar 90 derajat searah jarum jam menuju ke selatan.", d: 3 },
  { q: "Manakah di bawah ini pasangan kalimat yang memuat kata homonim?", c: "Bank itu buka pukul 8 / Bang Danu memancing", w: ["Adik makan apel / Ibu beli buah apel", "Bisa ular beracun / Saya bisa melompat", "Kaki meja patah / Kaki adik sakit"], e: "Bisa (racun) dan bisa (mampu) adalah kata homonim sejati.", d: 3 },
  { q: "Bacalah teks: 'Matahari bersinar terik. Suhu udara mencapai 34 derajat Celsius.' Kalimat kedua teks tersebut merupakan kalimat ...", c: "Fakta", w: ["Opini", "Fiksi", "Perintah"], e: "Angka pengukuran suhu 34 derajat Celsius adalah fakta terukur.", d: 3 },
  { q: "Mengapa sebuah denah membutuhkan skala?", c: "Untuk membandingkan ukuran asli", w: ["Agar gambar tampak berwarna", "Untuk mencatat nama pembuat", "Supaya denah lebih tebal"], e: "Skala menunjukkan perbandingan jarak pada denah dengan jarak sebenarnya.", d: 3 },
  { q: "Jika rumah Dina berada di sebelah barat sekolah, maka sekolah berada di sebelah ... rumah Dina.", c: "Timur", w: ["Utara", "Selatan", "Barat laut"], e: "Arah yang berlawanan dengan barat adalah timur.", d: 3 },
  { q: "Kata dasar 'kunci' dapat bermakna alat pengunci pintu atau ...", c: "Jawaban yang benar", w: ["Jendela kamar", "Dinding rumah", "Lantai semen"], e: "Kunci jawaban bermakna pedoman jawaban yang tepat.", d: 3 },
  { q: "Di bawah ini yang merupakan ciri-ciri teks deskripsi rumah yang baik adalah ...", c: "Menggambarkan tata letak ruang secara rinci", w: ["Menceritakan hewan yang bisa bicara", "Menyajikan rumus matematika", "Berisi dialog drama lucu"], e: "Teks deskripsi memaparkan objek secara jelas dan terperinci.", d: 3 },
  { q: "Manakah yang merupakan opini mengenai sebuah rumah?", c: "Rumah itu tampak sangat nyaman dihuni", w: ["Rumah itu memiliki tiga kamar tidur", "Pagar rumah itu berwarna putih", "Atap rumah terbuat dari genting"], e: "Rasa nyaman adalah penilaian subjektif (opini) masing-masing orang.", d: 3 },
  { q: "Teks cerita yang menceritakan asal-usul suatu daerah dan bercampur mitos disebut ...", c: "Legenda", w: ["Fabel", "Biografi", "Laporan observasi"], e: "Legenda adalah cerita rakyat fiktif mengenai asal-usul tempat.", d: 3 },
  { q: "Hubungan makna kata 'kali' dalam 'dua kali seminggu' dan 'mandi di kali' adalah ...", c: "Homonim", w: ["Sinonim", "Antonim", "Polisemi"], e: "Kali (frekuensi) dan kali (sungai kecil) adalah homonim.", d: 3 }
];

// -------------------------------------------------------------
// BAB 3: Lihat Sekitar (37 soal: 12 d1, 15 d2, 10 d3)
// -------------------------------------------------------------
const rawB3 = [
  // d1
  { q: "Teks yang menggambarkan suatu benda atau tempat secara jelas sehingga pembaca seolah melihatnya disebut ...", c: "Deskripsi", w: ["Narasi", "Argumentasi", "Persuasi"], e: "Teks deskripsi melukiskan objek melalui panca indra.", d: 1 },
  { q: "Teks yang berisi pendapat disertai alasan dan bukti yang kuat disebut teks ...", c: "Argumentasi", w: ["Deskripsi", "Dongeng", "Puisi"], e: "Argumentasi bertujuan meyakinkan pembaca melalui bukti logis.", d: 1 },
  { q: "Rambu lalu lintas berbentuk lingkaran warna merah dengan garis strip putih melintang artinya ...", c: "Dilarang masuk", w: ["Boleh parkir", "Wajib belok kiri", "Jalan terus"], e: "Rambu lingkaran merah strip putih adalah larangan masuk.", d: 1 },
  { q: "Lampu lalu lintas berwarna kuning menyala memberikan peringatan agar pengendara ...", c: "Hati-hati dan bersiap", w: ["Mempercepat laju kendaraan", "Langsung berhenti mendadak", "Mematikan mesin mobil"], e: "Warna kuning menandakan pengguna jalan harus berhati-hati.", d: 1 },
  { q: "Imbuhan 'ber-' pada kata 'sepeda' membentuk kata ...", c: "Bersepeda", w: ["Belsepeda", "Besepeda", "Menyepeda"], e: "ber- + sepeda menjadi bersepeda.", d: 1 },
  { q: "Imbuhan 'ber-' pada kata 'layar' membentuk kata ...", c: "Berlayar", w: ["Belayar", "Melayar", "Terlayar"], e: "ber- + layar menjadi berlayar.", d: 1 },
  { q: "Tempat khusus penyeberangan pejalan kaki di jalan raya disebut ...", c: "Zebra cross", w: ["Trotoar", "Halte", "Jembatan tol"], e: "Zebra cross bercorak garis putih hitam untuk penyeberang jalan.", d: 1 },
  { q: "Rambu peringatan di jalan raya umumnya memiliki warna dasar ...", c: "Kuning", w: ["Merah", "Biru", "Hijau"], e: "Warna kuning digunakan sebagai lambang rambu peringatan.", d: 1 },
  { q: "Rambu larangan di jalan raya umumnya menggunakan warna dasar ...", c: "Merah", w: ["Hijau", "Biru", "Cokelat"], e: "Warna merah menandakan larangan keras bagi pengendara.", d: 1 },
  { q: "Rambu perintah atau petunjuk arah umumnya memiliki warna dasar ...", c: "Biru atau hijau", w: ["Kuning atau merah", "Hitam legam", "Oranye menyala"], e: "Biru untuk perintah, hijau untuk penunjuk arah jurusan.", d: 1 },
  { q: "Bagian jalan yang dikhususkan bagi pejalan kaki di tepi jalan adalah ...", c: "Trotoar", w: ["Zebra cross", "Bahu jalan", "Median jalan"], e: "Trotoar dibangun di samping jalan untuk keamanan pejalan kaki.", d: 1 },
  { q: "Kata dasar dari 'berjalan' adalah ...", c: "Jalan", w: ["Berjalan", "Jalankan", "Perjalanan"], e: "Kata dasar berjalan adalah jalan.", d: 1 },

  // d2
  { q: "Imbuhan 'ber-' jika bertemu kata dasar 'ajar' berubah bentuk menjadi ...", c: "Belajar", w: ["Berajar", "Beajar", "Mengajar"], e: "ber- + ajar mengalami perubahan khusus menjadi belajar.", d: 2 },
  { q: "Imbuhan 'ber-' jika bertemu kata dasar 'kerja' berubah bentuk menjadi ...", c: "Bekerja", w: ["Berkerja", "Belkerja", "Pekerja"], e: "Jika suku kata pertama mengandung 'er', r luluh menjadi be-.", d: 2 },
  { q: "Imbuhan 'ber-' jika bertemu kata dasar 'cermin' berubah menjadi ...", c: "Bercermin", w: ["Becermin", "Belcermin", "Pencermin"], e: "ber- + cermin luluh menjadi becermin (atau bercermin yang lazim).", d: 2 },
  { q: "Makna imbuhan 'ber-' pada kalimat 'Andi bersepatu baru' adalah ...", c: "Memakai", w: ["Memiliki", "Menghasilkan", "Melakukan"], e: "Bersepatu berarti memakai atau mengenakan sepatu.", d: 2 },
  { q: "Makna imbuhan 'ber-' pada kalimat 'Ayam paman bertelur tiga butir' adalah ...", c: "Menghasilkan", w: ["Memakai", "Menjadi", "Kumpulan"], e: "Bertelur berarti mengeluarkan atau menghasilkan telur.", d: 2 },
  { q: "Makna imbuhan 'ber-' pada kalimat 'Budi dan Dodi bersalaman' adalah ...", c: "Saling berbalasan", w: ["Mengerjakan sendiri", "Memakai barang", "Menjadi"], e: "Bersalaman menunjukkan perbuatan resiprokal (saling membalas).", d: 2 },
  { q: "Ciri utama paragraf deskripsi yang tepat adalah ...", c: "Melibatkan tangkapan indra", w: ["Menyajikan debat pro kontra", "Berisi ajakan membeli produk", "Hanya menyajikan angka rumus"], e: "Deskripsi membuat pembaca seolah melihat, mendengar, atau merasa.", d: 2 },
  { q: "Perhatikan: 'Ruang kelas itu bersih dan harum semerbak bunga melati.' Kalimat ini menggunakan indra ...", c: "Penglihatan dan penciuman", w: ["Pendengaran dan peraba", "Pengecap dan penglihatan", "Peraba saja"], e: "'Bersih' dilihat mata, 'harum semerbak' dicium hidung.", d: 2 },
  { q: "Paragraf argumentasi harus dilengkapi dengan ...", c: "Alasan logis dan fakta pendukung", w: ["Mantra ajaib fiktif", "Dongeng masa lalu", "Khayalan tokoh kartun"], e: "Alasan logis dan fakta memperkuat argumen penulis.", d: 2 },
  { q: "Rambu huruf 'P' yang dicoret garis merah miring melintang berarti ...", c: "Dilarang parkir", w: ["Boleh parkir", "Tempat putar balik", "Wajib parkir"], e: "P coret adalah rambu larangan parkir kendaraan.", d: 2 },
  { q: "Rambu huruf 'S' yang dicoret garis merah miring melintang berarti ...", c: "Dilarang berhenti", w: ["Dilarang menyalip", "Dilarang putar arah", "Boleh istirahat"], e: "S (Stop) coret berarti dilarang berhenti di area tersebut.", d: 2 },
  { q: "Kata berimbuhan 'ber-' yang bermakna 'mengendarai' terdapat pada kalimat ...", c: "Ayah bermotor ke kantor", w: ["Adik bersedih hati", "Ibu berbelanja di pasar", "Kucing bersembunyi"], e: "Bermotor bermakna mengendarai sepeda motor.", d: 2 },
  { q: "Penulisan kata berimbuhan ber- yang benar adalah ...", c: "Bekerja", w: ["Berkerja", "Berasa-rasa", "Bercermin"], e: "Kata kerja dengan imbuhan ber- yang baku adalah bekerja.", d: 2 },
  { q: "Kalimat di bawah ini yang paling tepat untuk teks argumentasi adalah ...", c: "Kita harus menjaga kebersihan agar tidak tertular penyakit", w: ["Bunga mawar merah itu mekar di taman", "Kancil berlari menghindari buaya", "Ruang tamu itu berukuran 4x5 meter"], e: "Menyajikan pernyataan sikap disertai alasan hubungan sebab akibat.", d: 2 },
  { q: "Saat menyeberang jalan raya, langkah pertama yang aman adalah ...", c: "Tengok kanan, kiri, lalu kanan lagi", w: ["Langsung berlari kencang", "Sambil bermain ponsel pintar", "Menutup mata dan berjalan"], e: "Melihat situasi lalu lintas di kedua arah menjamin keselamatan.", d: 2 },

  // d3
  { q: "Bacalah paragraf: 'Pantai itu berpasir putih lembut. Angin sepoi bertiup membelai wajah.' Paragraf tersebut termasuk jenis ...", c: "Deskripsi", w: ["Argumentasi", "Persuasi", "Eksposisi"], e: "Melukiskan keindahan fisik objek pantai secara mendalam.", d: 3 },
  { q: "Bacalah: 'Membaca buku setiap hari sangat penting karena dapat menambah wawasan dan melatih fokus.' Paragraf ini termasuk teks ...", c: "Argumentasi", w: ["Deskripsi", "Narasi fiksi", "Puisi"], e: "Menyampaikan pendapat yang didukung alasan manfaat membaca.", d: 3 },
  { q: "Perbedaan mendasar antara teks deskripsi dan teks argumentasi adalah ...", c: "Deskripsi melukiskan objek, argumentasi menyajikan alasan", w: ["Deskripsi selalu fiksi, argumentasi selalu fabel", "Deskripsi memakai angka, argumentasi tanpa huruf", "Keduanya tidak memiliki perbedaan"], e: "Tujuan deskripsi adalah menggambarkan, argumentasi meyakinkan pembaca.", d: 3 },
  { q: "Imbuhan 'ber-' pada kalimat 'Kedua petinju itu bertarung di atas ring' menyatakan makna ...", c: "Melakukan tindakan berbalasan", w: ["Menyatakan jumlah dua", "Memakai kostum baru", "Menghasilkan tenaga"], e: "Bertarung bermakna saling menyerang secara timbal balik.", d: 3 },
  { q: "Manakah kalimat berikut yang menggunakan kata berimbuhan ber- dengan makna 'mempunyai'?", c: "Pak Hadi beranak tiga orang", w: ["Kakak berenang di sungai", "Adik bersenandung riang", "Ibu berbelanja di warung"], e: "Beranak tiga bermakna mempunyai tiga orang anak.", d: 3 },
  { q: "Rambu berbentuk belah ketupat kuning dengan gambar tanjakan terjal berfungsi untuk ...", c: "Memperingatkan adanya jalan menanjak berbahaya", w: ["Melarang kendaraan menanjak", "Menyuruh kendaraan mundur", "Menutup jalan secara total"], e: "Rambu kuning bergambar tanjakan adalah peringatan kondisi jalan.", d: 3 },
  { q: "Berikut ini yang merupakan argumen yang logis untuk menolak jajan sembarangan adalah ...", c: "Jajanan terbuka mudah dihinggapi lalat pembawa kuman", w: ["Penjualnya tidak tersenyum ramah", "Warna makanannya kurang cerah", "Bungkusnya terbuat dari daun pisang"], e: "Kebersihan makanan berkaitan langsung dengan kesehatan saluran cerna.", d: 3 },
  { q: "Kata berimbuhan ber- di bawah ini yang mengalami peluluhan huruf 'r' adalah ...", c: "Beternak", w: ["Bermain", "Berputar", "Berpikir"], e: "Kata dasar ternak mendapat imbuhan ber- menjadi beternak.", d: 3 },
  { q: "Ketika kita mendeskripsikan suatu pasar tradisional, rincian indra pengecap yang relevan adalah ...", c: "Manisnya buah mangga arumanis yang dicicipi pembeli", w: ["Bisingnya tawar menawar pedagang", "Harumnya aroma rempah cengkih", "Ramainya kerumunan orang"], e: "Rasa manis mangga dirasakan melalui indra pengecap (lidah).", d: 3 },
  { q: "Penggunaan tanda titik dua (:) yang benar dalam teks adalah ...", c: "Ibu membeli buah: apel, jeruk, dan mangga.", w: ["Ibu: membeli buah apel, jeruk.", "Ibu membeli: apel jeruk dan mangga.", "Ibu membeli buah apel: jeruk dan mangga"], e: "Titik dua dipakai sebelum rincian pemerian yang lengkap.", d: 3 }
];

// -------------------------------------------------------------
// BAB 4: Meliuk dan Menerjang (37 soal: 12 d1, 15 d2, 10 d3)
// -------------------------------------------------------------
const rawB4 = [
  // d1
  { q: "Gagasan yang menjadi pokok pengembangan suatu paragraf disebut ...", c: "Ide pokok", w: ["Ide penjelas", "Judul cerita", "Kalimat penutup"], e: "Ide pokok adalah inti sari pembahasan dalam paragraf.", d: 1 },
  { q: "Kalimat yang memperjelas dan menguraikan ide pokok disebut ...", c: "Kalimat pendukung", w: ["Kalimat tanya", "Kalimat seru", "Kalimat judul"], e: "Kalimat pengembang/pendukung memaparkan rincian ide pokok.", d: 1 },
  { q: "Kegiatan tanya jawab untuk memperoleh informasi dari narasumber disebut ...", c: "Wawancara", w: ["Pidato", "Diskusi", "Debat"], e: "Wawancara bertujuan menggali informasi langsung dari narasumber.", d: 1 },
  { q: "Orang yang memberikan informasi dalam wawancara disebut ...", c: "Narasumber", w: ["Pewawancara", "Moderator", "Notulis"], e: "Narasumber adalah orang yang ahli atau saksi peristiwa.", d: 1 },
  { q: "Orang yang mengajukan pertanyaan dalam wawancara disebut ...", c: "Pewawancara", w: ["Narasumber", "Penonton", "Penyimak"], e: "Pewawancara memandu jalannya tanya jawab.", d: 1 },
  { q: "Gaya bahasa yang mengumpamakan benda mati seolah bersikap seperti manusia disebut majas ...", c: "Personifikasi", w: ["Metafora", "Hiperbola", "Litotes"], e: "Personifikasi meminjam sifat manusia untuk disematkan pada benda.", d: 1 },
  { q: "Teks yang menceritakan urutan peristiwa secara runtut disebut teks ...", c: "Narasi", w: ["Eksposisi", "Laporan", "Persuasi"], e: "Teks narasi mengisahkan alur peristiwa berdasarkan waktu.", d: 1 },
  { q: "Kata tanya yang digunakan untuk menanyakan alasan terjadinya sesuatu adalah ...", c: "Mengapa", w: ["Kapan", "Siapa", "Di mana"], e: "Kata 'mengapa' menanyakan latar belakang atau alasan.", d: 1 },
  { q: "Kata tanya yang digunakan untuk menanyakan waktu kejadian adalah ...", c: "Kapan", w: ["Bagaimana", "Berapa", "Mengapa"], e: "Kata 'kapan' menanyakan hari, jam, atau waktu peristiwa.", d: 1 },
  { q: "Kata tanya yang digunakan untuk menanyakan cara atau proses adalah ...", c: "Bagaimana", w: ["Siapa", "Kapan", "Di mana"], e: "Kata 'bagaimana' menanyakan proses terjadinya suatu hal.", d: 1 },
  { q: "Kata tanya untuk menanyakan pelaku peristiwa adalah ...", c: "Siapa", w: ["Mengapa", "Apa", "Berapa"], e: "Kata 'siapa' menanyakan subjek orang yang terlibat.", d: 1 },
  { q: "Kata tanya untuk menanyakan tempat kejadian adalah ...", c: "Di mana", w: ["Kapan", "Bagaimana", "Mengapa"], e: "Kata 'di mana' menanyakan lokasi berlangsungnya kegiatan.", d: 1 },

  // d2
  { q: "Contoh kalimat bermajas personifikasi berikut adalah ...", c: "Angin malam membisikkan salam ke telingaku", w: ["Suaranya keras menggelegar membelah angkasa", "Budi adalah anak emas di dalam keluarganya", "Ibu memasak gulai ikan kakap di dapur"], e: "Angin diumpamakan bisa berbisik layaknya manusia.", d: 2 },
  { q: "Perhatikan: 'Ombak berkejar-kejaran di tepian pantai.' Majas yang digunakan adalah ...", c: "Personifikasi", w: ["Hiperbola", "Metafora", "Asosiasi"], e: "Ombak digambarkan seolah-olah bernyawa dan saling mengejar.", d: 2 },
  { q: "Sikap santun yang wajib dimiliki pewawancara saat menemui narasumber adalah ...", c: "Mengucapkan salam dan memperkenalkan diri", w: ["Langsung menyela pembicaraan narasumber", "Bermain gawai tanpa meminta izin dulu", "Memaksa narasumber menceritakan rahasia"], e: "Adab wawancara dimulai dengan salam dan perkenalan diri.", d: 2 },
  { q: "Langkah pertama yang harus dilakukan sebelum melakukan wawancara adalah ...", c: "Menentukan topik dan narasumber sasaran", w: ["Membuat laporan kesimpulan akhir tertulis", "Mengunggah rekaman video ke internet", "Menagih upah honorarium wawancara"], e: "Topik dan narasumber yang sesuai adalah pondasi wawancara.", d: 2 },
  { q: "Daftar pertanyaan wawancara sebaiknya disusun menggunakan prinsip ...", c: "5W + 1H (Adiksimba)", w: ["Teka-teki humoris", "Pertanyaan jebakan", "Satu pertanyaan saja"], e: "Adiksimba (Apa, Di mana, Kapan, Siapa, Mengapa, Bagaimana).", d: 2 },
  { q: "Perhatikan kalimat: 'Matahari baru saja bangun dari peraduannya.' Maksud ungkapan tersebut adalah ...", c: "Matahari mulai terbit di pagi hari", w: ["Matahari sedang tidur siang di balik awan", "Terjadi gerhana matahari total di wilayah", "Matahari terbenam perlahan di ufuk barat"], e: "'Bangun dari peraduan' adalah kiasan personifikasi untuk terbit.", d: 2 },
  { q: "Ide pokok dalam sebuah paragraf biasanya tertuang di dalam ...", c: "Kalimat utama", w: ["Kalimat penjelas", "Catatan kaki", "Daftar pustaka"], e: "Kalimat utama memuat gagasan pokok paragraf.", d: 2 },
  { q: "Paragraf yang memiliki kalimat utama di awal dan di akhir disebut paragraf ...", c: "Campuran", w: ["Deduktif", "Induktif", "Naratif"], e: "Paragraf campuran menegaskan gagasan di awal dan ditegaskan lagi di akhir.", d: 2 },
  { q: "Dalam teks narasi, rangkaian peristiwa dari awal hingga akhir cerita disebut ...", c: "Alur atau plot", w: ["Latar tempat", "Amanat cerita", "Tema pokok"], e: "Alur merangkai jalannya kronologi cerita.", d: 2 },
  { q: "Alat bantu yang berguna merekam suara narasumber saat wawancara adalah ...", c: "Perekam suara atau ponsel cerdas", w: ["Kamera video resolusi tinggi", "Kamus bahasa dan ensiklopedia", "Kertas karton lembar jawaban"], e: "Perekam audio membantu mencatat keterangan narasumber secara akurat.", d: 2 },
  { q: "Manakah kalimat berikut yang menggunakan majas personifikasi?", c: "Nyiur melambai-lambai di tepi pantai", w: ["Wajahnya pucat pasi bagaikan mayat", "Ia banting tulang demi masa depan", "Rumahnya sangat megah bagai istana"], e: "Pohon kelapa melambai seperti tangan manusia.", d: 2 },
  { q: "Kalimat tanya yang tepat untuk menggali riwayat hidup seorang atlet berprestasi adalah ...", c: "Kapan Anda pertama kali mulai berlatih silat?", w: ["Berapa uang yang tersimpan di rekening Anda?", "Mengapa Anda suka menyantap nasi goreng?", "Apakah Anda mengenal nama keluarga saya?"], e: "Pertanyaan ini relevan dengan profesi dan capaian narasumber.", d: 2 },
  { q: "Setelah wawancara selesai dilakukan, pewawancara harus menyampaikan ...", c: "Ucapan terima kasih kepada narasumber", w: ["Permintaan uang saku dan ongkos pulang", "Keluhan tentang lamanya waktu tunggu", "Kritik pedas terhadap jawaban narasumber"], e: "Berterima kasih adalah etika wajib penutup wawancara.", d: 2 },
  { q: "Ciri kalimat pendukung yang baik dalam sebuah paragraf adalah ...", c: "Memperjelas dan memperkuat ide pokok", w: ["Menyimpang jauh dari tema paragraf", "Berisi kalimat tanpa makna yang jelas", "Berisi ringkasan seluruh isi buku teks"], e: "Kalimat pendukung berfungsi memperjelas gagasan utama.", d: 2 },
  { q: "Perhatikan: 'Daun-daun menari diiringi hembusan angin sore.' Benda mati yang dipersonifikasikan adalah ...", c: "Daun-daun pepohonan", w: ["Hembusan angin sore", "Gerak tarian gemulai", "Dahan batang tanaman"], e: "Daun digambarkan mampu menari seperti manusia.", d: 2 },

  // d3
  { q: "Bacalah teks: 'Tari saman berasal dari Aceh. Tarian ini dimainkan belasan penari yang duduk berbanjar dengan gerakan tepukan dada serempak.' Ide pokok teks tersebut adalah ...", c: "Asal dan keunikan gerak tari saman", w: ["Rincian warna busana penari adat", "Tata cara pembelian tiket konser", "Daftar instrumen musik pengiring"], e: "Teks menjelaskan daerah asal dan kekhasan formasi gerak tari saman.", d: 3 },
  { q: "Perhatikan: 'Pena itu menari-nari di atas lembaran kertas putih.' Makna majas personifikasi dalam kalimat tersebut adalah ...", c: "Seseorang sedang menulis dengan lancar", w: ["Pena dapat bergerak secara mandiri", "Tinta pada pena tersebut bocor", "Lembaran kertas putih itu terbelah"], e: "Pena yang menari melukiskan kegiatan menulis yang mengalir indah.", d: 3 },
  { q: "Manakah pertanyaan wawancara yang paling efektif untuk menggali informasi cara pembuatan batik tulis?", c: "Bagaimana tahapan membatik yang tepat?", w: ["Apakah batik tulis memiliki corak?", "Mengapa Anda gemar mengenakan batik?", "Berapa jam Anda beristirahat semalam?"], e: "Pertanyaan 'Bagaimana' menggali langkah-langkah detail proses berkarya.", d: 3 },
  { q: "Dalam laporan hasil wawancara, bagian penutup biasanya memuat ...", c: "Kesimpulan dan ucapan terima kasih", w: ["Daftar hidangan makanan penutup", "Biografi lengkap dari pewawancara", "Album dokumentasi masa kecil tamu"], e: "Penutup laporan berisi rangkuman poin penting dan apresiasi.", d: 3 },
  { q: "Perhatikan kutipan: 'Peluit wasit menjerit menghentikan pertandingan.' Majas personifikasi ditunjukkan oleh frasa ...", c: "Peluit wasit menjerit", w: ["Menghentikan pertandingan", "Pertandingan sepak bola", "Wasit lapangan hijau"], e: "Peluit disamakan dengan manusia yang menjerit kencang.", d: 3 },
  { q: "Ketika narasumber memberikan jawaban yang sangat panjang dan mulai keluar dari topik, pewawancara sebaiknya ...", c: "Memotong secara sopan dan terarah", w: ["Membentak narasumber seketika itu", "Mematikan alat rekam dan keluar", "Mengabaikan penjelasan narasumber"], e: "Etika wawancara: potong secara halus dan kembalikan ke fokus topik.", d: 3 },
  { q: "Sebuah paragraf memiliki 4 kalimat. Kalimat 1 menyatakan 'Olahraga teratur menjaga kesehatan jantung.' Kalimat 2-4 menjelaskan aliran darah dan denyut nadi. Kalimat utamanya terletak pada ...", c: "Awal paragraf (deduktif)", w: ["Akhir paragraf (induktif)", "Tengah paragraf bacaan", "Seluruh kalimat paragraf"], e: "Gagasan umum berada di kalimat 1, diikuti penjelasan teknis.", d: 3 },
  { q: "Manakah di bawah ini kalimat yang tidak menggunakan majas personifikasi?", c: "Pesawat terbang melintas di atas awan", w: ["Kabut tebal menelan seluruh perkampungan", "Dinding kamar itu seolah ikut membisu", "Api berkobar melahap deretan toko pasar"], e: "Kalimat pertama adalah peristiwa faktual tanpa kiasan sifat manusia.", d: 3 },
  { q: "Format penulisan laporan wawancara yang terstruktur secara runtut adalah ...", c: "Topik, narasumber, hasil, kesimpulan", w: ["Kesimpulan, tanda tangan, pustaka", "Foto dokumentasi tanpa keterangan", "Daftar presensi seluruh penonton"], e: "Laporan sistematis memuat komponen lengkap dari topik hingga simpulan.", d: 3 },
  { q: "Ungkapan 'Mentari tersenyum menyapa pagi' memberikan kesan suasana ...", c: "Suasana ceria dan penuh harapan", w: ["Suasana seram dan mencekam raga", "Rasa duka cita yang mendalam", "Kondisi marah dan penuh dendam"], e: "Senyum mentari melambangkan suasana pagi yang hangat dan menyenangkan.", d: 3 }
];

function buildBatch(rawList, batchName) {
  const questions = rawList.map((item, idx) => {
    const forcedKey = idx % 4;
    const { options, answer } = assignKey({ correct: item.c, wrong: item.w }, forcedKey);
    return {
      question: item.q,
      options,
      answer,
      explanation: item.e,
      difficulty: item.d,
      timeLimit: 20
    };
  });
  return saveBatch('bahasa-indonesia', batchName, questions);
}

buildBatch(rawB1, 'b1-sudah-besar');
buildBatch(rawB2, 'b2-di-bawah-atap');
buildBatch(rawB3, 'b3-lihat-sekitar');
buildBatch(rawB4, 'b4-meliuk-menerjang');

console.log('🎉 Selesai membangun 150 soal Bahasa Indonesia!');
