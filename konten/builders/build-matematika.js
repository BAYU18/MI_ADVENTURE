#!/usr/bin/env node
const { saveBatch } = require('./helper');

// Helper to balance keys deterministically
function assignKey(optsWithKey, forcedIndex) {
  const { correct, wrong } = optsWithKey;
  const options = [...wrong];
  options.splice(forcedIndex, 0, correct);
  return { options, answer: forcedIndex };
}

// -------------------------------------------------------------
// BAB 1: Bilangan Cacah Besar (38 soal: 13 d1, 15 d2, 10 d3)
// -------------------------------------------------------------
const rawB1 = [
  // d1
  { q: "Lambang bilangan dari sembilan ribu empat ratus lima puluh adalah ...", c: "9.450", w: ["9.045", "9.405", "9.540"], e: "9 ribuan + 4 ratusan + 5 puluhan = 9.450.", d: 1 },
  { q: "Angka 7 pada bilangan 7.625 menempati nilai tempat ...", c: "Ribuan", w: ["Ratusan", "Puluhan", "Satuan"], e: "Pada 7.625, 7 berada di posisi ribuan bernilai 7.000.", d: 1 },
  { q: "Nama bilangan dari 8.012 adalah ...", c: "Delapan ribu dua belas", w: ["Delapan ribu seratus dua", "Delapan ratus dua belas", "Delapan puluh ribu dua belas"], e: "8.012 dibaca delapan ribu dua belas.", d: 1 },
  { q: "Nilai angka 5 pada bilangan 3.582 adalah ...", c: "500", w: ["50", "5.000", "5"], e: "Angka 5 di tempat ratusan bernilai 500.", d: 1 },
  { q: "Bilangan 6.340 jika diuraikan menurut nilai tempatnya adalah ...", c: "6.000 + 300 + 40", w: ["6.000 + 34", "600 + 300 + 40", "6.000 + 30 + 4"], e: "6.340 = 6 ribuan + 3 ratusan + 4 puluhan.", d: 1 },
  { q: "Manakah tanda yang tepat untuk 4.250 ... 4.520?", c: "<", w: [">", "=", "+"], e: "Karena 4.250 lebih kecil dari 4.520, tanda yang tepat adalah <.", d: 1 },
  { q: "Bilangan cacah di antara 5.998 dan 6.000 adalah ...", c: "5.999", w: ["5.997", "6.001", "5.990"], e: "Bilangan tepat setelah 5.998 dan sebelum 6.000 adalah 5.999.", d: 1 },
  { q: "Berapakah jumlah dari 3 ribuan + 2 ratusan + 8 satuan?", c: "3.208", w: ["3.280", "3.028", "3.288"], e: "3.000 + 200 + 0 puluhan + 8 satuan = 3.208.", d: 1 },
  { q: "Lambang bilangan sepuluh ribu adalah ...", c: "10.000", w: ["1.000", "100.000", "10.001"], e: "Sepuluh ribu ditulis dengan angka 10.000.", d: 1 },
  { q: "Angka 0 pada bilangan 4.095 berada pada nilai tempat ...", c: "Ratusan", w: ["Ribuan", "Puluhan", "Satuan"], e: "4 ribuan, 0 ratusan, 9 puluhan, 5 satuan.", d: 1 },
  { q: "Bilangan yang lebih besar dari 7.890 adalah ...", c: "7.900", w: ["7.809", "7.790", "7.889"], e: "7.900 memiliki ratusan lebih besar (900) dibanding 7.890 (800).", d: 1 },
  { q: "Bilangan terkecil dari pilihan berikut adalah ...", c: "2.345", w: ["2.435", "2.534", "2.354"], e: "2.345 memiliki nilai puluhan terkecil (40).", d: 1 },
  { q: "Bentuk panjang dari bilangan 9.007 adalah ...", c: "9.000 + 7", w: ["900 + 7", "9.000 + 70", "9.000 + 700"], e: "9.007 terdiri dari 9 ribuan dan 7 satuan.", d: 1 },

  // d2
  { q: "Urutan bilangan dari yang terkecil adalah ...", c: "3.120, 3.210, 3.250", w: ["3.250, 3.210, 3.120", "3.210, 3.120, 3.250", "3.120, 3.250, 3.210"], e: "3.120 < 3.210 < 3.250.", d: 2 },
  { q: "Sebuah pabrik memproduksi 4.560 kotak susu hari Senin dan 4.650 hari Selasa. Pernyataan yang benar adalah ...", c: "Produksi hari Selasa lebih banyak", w: ["Produksi hari Senin lebih banyak", "Produksi kedua hari sama banyak", "Produksi hari Selasa lebih sedikit"], e: "4.650 > 4.560, jadi Selasa memproduksi lebih banyak.", d: 2 },
  { q: "Bilangan yang terletak 5 angka sebelum 8.002 adalah ...", c: "7.997", w: ["7.995", "8.007", "7.998"], e: "8.002 − 5 = 7.997.", d: 2 },
  { q: "Pak Jaya memanen 6.780 kg beras. Angka 8 pada jumlah panen tersebut bernilai ...", c: "80", w: ["8", "800", "8.000"], e: "Angka 8 menempati puluhan bernilai 80.", d: 2 },
  { q: "Dua bilangan yang masing-masing lebih besar dari 6.450 adalah ...", c: "6.460 dan 6.500", w: ["6.440 dan 6.470", "6.400 dan 6.490", "6.420 dan 6.430"], e: "Keduanya berada di atas 6.450.", d: 2 },
  { q: "Aku adalah bilangan di antara 4.500 dan 4.600. Angka puluhanku 7 dan satuanku 5. Aku adalah ...", c: "4.575", w: ["4.675", "4.750", "4.557"], e: "Ratusan 5, puluhan 7, satuan 5 = 4.575.", d: 2 },
  { q: "Toko Makmur memiliki stok 8.420 buku. Toko Sejahtera memiliki 8.240 buku. Selisih ratusan kedua stok adalah ...", c: "200", w: ["400", "180", "100"], e: "Ratusan pertama 400, ratusan kedua 200, selisihnya 200.", d: 2 },
  { q: "Urutan bilangan 7.600, 7.060, 7.606 dari yang terbesar adalah ...", c: "7.606, 7.600, 7.060", w: ["7.600, 7.606, 7.060", "7.060, 7.600, 7.606", "7.606, 7.060, 7.600"], e: "7.606 terbesar, disusul 7.600, lalu 7.060.", d: 2 },
  { q: "Bilangan 5.482 jika dibulatkan ke ratusan terdekat menjadi ...", c: "5.500", w: ["5.400", "5.480", "6.000"], e: "Puluhannya 8 (>=5), jadi ratusan naik menjadi 5.500.", d: 2 },
  { q: "Bilangan 3.824 jika dibulatkan ke ribuan terdekat menjadi ...", c: "4.000", w: ["3.000", "3.800", "3.900"], e: "Ratusannya 8 (>=5), jadi ribuan naik menjadi 4.000.", d: 2 },
  { q: "Bilangan ganjil di antara 4.230 dan 4.234 adalah ...", c: "4.231 dan 4.233", w: ["4.232 dan 4.233", "4.230 dan 4.232", "4.231 dan 4.235"], e: "Bilangan ganjil satuannya tidak habis dibagi 2: 4.231 dan 4.233.", d: 2 },
  { q: "Angka penyusun bilangan 9.753 yang bernilai paling kecil adalah ...", c: "3", w: ["5", "7", "9"], e: "Angka 3 berada di tempat satuan dengan nilai hanya 3.", d: 2 },
  { q: "Lengkapilah: 4.100, 4.200, ..., 4.400, 4.500.", c: "4.300", w: ["4.250", "4.350", "4.210"], e: "Pola bertambah 100 setiap langkah.", d: 2 },
  { q: "Sebuah truk membawa 5.250 buah kelapa. Berapa ribuan pada bilangan tersebut?", c: "5 ribuan", w: ["50 ribuan", "2 ribuan", "25 ribuan"], e: "Angka 5 di posisi paling kiri bernilai 5 ribuan.", d: 2 },
  { q: "Bilangan yang bernilai 100 lebih banyak dari 7.950 adalah ...", c: "8.050", w: ["8.000", "7.960", "8.150"], e: "7.950 + 100 = 8.050.", d: 2 },

  // d3
  { q: "Dengan angka 3, 7, 0, 8, bilangan empat angka terkecil yang dapat dibuat adalah ...", c: "3.078", w: ["3.708", "3.087", "0.378"], e: "Angka pertama tidak boleh 0, pilih 3, lalu susun urut: 0, 7, 8.", d: 3 },
  { q: "Dengan angka 5, 2, 9, 1, bilangan empat angka terbesar yang dapat dibuat adalah ...", c: "9.521", w: ["9.512", "9.251", "5.921"], e: "Urutkan angka dari yang terbesar: 9, 5, 2, 1 menghasilkan 9.521.", d: 3 },
  { q: "Sebuah bilangan ribuan memiliki angka ribuan 6, ratusan 2 lebih kecil dari ribuan, dan satuan 5. Bilangan itu adalah ...", c: "6.405", w: ["6.205", "6.805", "6.450"], e: "Ribuan = 6, ratusan = 6 − 2 = 4, puluhan = 0, satuan = 5 -> 6.405.", d: 3 },
  { q: "Selisih nilai angka 7 dan angka 3 pada bilangan 7.435 adalah ...", c: "6.970", w: ["6.700", "7.000", "6.900"], e: "Nilai angka 7 = 7.000, nilai angka 3 = 30. Selisihnya 7.000 − 30 = 6.970.", d: 3 },
  { q: "Bilangan X memiliki 4 ribuan, 15 ratusan, dan 6 satuan. Nilai bilangan X sebenarnya adalah ...", c: "5.506", w: ["4.156", "4.506", "5.156"], e: "4.000 + (15 × 100) + 6 = 4.000 + 1.500 + 6 = 5.506.", d: 3 },
  { q: "Sebuah kode loker berupa bilangan genap 4 angka antara 5.000 dan 5.100. Angka puluhannya 8 dan satuannya bukan 0. Kode itu adalah ...", c: "5.084", w: ["5.083", "5.184", "5.080"], e: "Antara 5.000-5.100, puluhan 8, satuan genap bukan 0 (4) = 5.084.", d: 3 },
  { q: "Berapa banyak bilangan ratusan genap yang dapat dibentuk dari angka 2, 4, 6 tanpa pengulangan?", c: "6", w: ["4", "3", "8"], e: "Semua angka genap: 246, 264, 426, 462, 624, 642 = 6 bilangan.", d: 3 },
  { q: "Jumlah nilai tempat angka 4 pada bilangan 4.444 adalah ...", c: "4.444", w: ["1.600", "16", "4.000"], e: "4.000 + 400 + 40 + 4 = 4.444.", d: 3 },
  { q: "Pak Hasan membeli tanah seharga 9.750 ribu rupiah. Pernyataan yang setara adalah ...", c: "9 juta 750 ribu rupiah", w: ["975 ribu rupiah", "90 juta 750 ribu", "97 juta rupiah"], e: "9.750 ribu = 9.750.000 rupiah = 9 juta 750 ribu rupiah.", d: 3 },
  { q: "Bilangan bulat kelipatan 500 yang terletak antara 7.200 dan 7.800 adalah ...", c: "7.500", w: ["7.300", "7.600", "7.400"], e: "Kelipatan 500 di antara 7.200 dan 7.800 hanyalah 7.500.", d: 3 }
];

// -------------------------------------------------------------
// BAB 2: Operasi Hitung Bilangan Cacah (42 soal: 14 d1, 15 d2, 13 d3)
// -------------------------------------------------------------
const rawB2 = [
  // d1
  { q: "Hasil dari 2.340 + 1.520 = ...", c: "3.860", w: ["3.760", "3.850", "4.860"], e: "2.340 + 1.520 = 3.860.", d: 1 },
  { q: "Hasil dari 4.750 − 2.310 = ...", c: "2.440", w: ["2.430", "2.540", "2.340"], e: "4.750 − 2.310 = 2.440.", d: 1 },
  { q: "Hasil dari 25 × 4 = ...", c: "100", w: ["90", "110", "125"], e: "25 × 4 = 100.", d: 1 },
  { q: "Hasil dari 84 ÷ 4 = ...", c: "21", w: ["22", "20", "24"], e: "84 ÷ 4 = 21.", d: 1 },
  { q: "Hasil dari 150 × 6 = ...", c: "900", w: ["800", "850", "950"], e: "150 × 6 = 900.", d: 1 },
  { q: "Hasil dari 500 − 175 = ...", c: "325", w: ["335", "425", "315"], e: "500 − 175 = 325.", d: 1 },
  { q: "Hasil dari 320 ÷ 8 = ...", c: "40", w: ["30", "50", "45"], e: "320 ÷ 8 = 40.", d: 1 },
  { q: "Hasil dari 1.200 + 800 = ...", c: "2.000", w: ["1.900", "2.100", "2.050"], e: "1.200 + 800 = 2.000.", d: 1 },
  { q: "Hasil dari 45 × 10 = ...", c: "450", w: ["405", "455", "540"], e: "Perkalian dengan 10 menambahkan angka 0 di belakang: 450.", d: 1 },
  { q: "Hasil dari 630 ÷ 9 = ...", c: "70", w: ["60", "80", "75"], e: "630 ÷ 9 = 70.", d: 1 },
  { q: "Hasil dari 3.000 − 1.250 = ...", c: "1.750", w: ["1.650", "1.850", "1.700"], e: "3.000 − 1.250 = 1.750.", d: 1 },
  { q: "Hasil dari 16 × 5 = ...", c: "80", w: ["70", "85", "90"], e: "16 × 5 = 80.", d: 1 },
  { q: "Hasil dari 96 ÷ 6 = ...", c: "16", w: ["14", "18", "15"], e: "96 ÷ 6 = 16.", d: 1 },
  { q: "Hasil dari 4.100 + 2.900 = ...", c: "7.000", w: ["6.900", "7.100", "6.800"], e: "4.100 + 2.900 = 7.000.", d: 1 },

  // d2
  { q: "Hasil dari 3.428 + 2.785 = ...", c: "6.213", w: ["6.113", "6.203", "6.313"], e: "3.428 + 2.785 = 6.213 dengan teknik menyimpan.", d: 2 },
  { q: "Hasil dari 5.000 − 2.645 = ...", c: "2.355", w: ["2.455", "3.355", "2.365"], e: "5.000 − 2.645 = 2.355.", d: 2 },
  { q: "Hasil dari 124 × 7 = ...", c: "868", w: ["858", "878", "848"], e: "124 × 7 = (100×7) + (20×7) + (4×7) = 700 + 140 + 28 = 868.", d: 2 },
  { q: "Hasil dari 432 ÷ 6 = ...", c: "72", w: ["68", "74", "76"], e: "432 ÷ 6 = 72.", d: 2 },
  { q: "Sita membeli 3 kotak pensil. Tiap kotak berisi 12 pensil. Jumlah seluruh pensil Sita adalah ...", c: "36", w: ["32", "38", "40"], e: "3 × 12 = 36 pensil.", d: 2 },
  { q: "Sebuah toko roti membuat 240 roti dan dikemas ke dalam 8 kardus sama banyak. Tiap kardus berisi ...", c: "30 roti", w: ["25 roti", "35 roti", "40 roti"], e: "240 ÷ 8 = 30 roti per kardus.", d: 2 },
  { q: "Pak Danu memiliki 1.500 batu bata. Ia membeli lagi 2.750 batu bata. Jumlah seluruh batu bata Pak Danu adalah ...", c: "4.250", w: ["4.150", "4.350", "3.250"], e: "1.500 + 2.750 = 4.250 batu bata.", d: 2 },
  { q: "Paman memetik 450 mangga. Sebanyak 125 mangga dibagikan ke tetangga. Sisa mangga paman adalah ...", c: "325", w: ["335", "315", "345"], e: "450 − 125 = 325 mangga.", d: 2 },
  { q: "Hasil dari 48 × 15 = ...", c: "720", w: ["680", "740", "700"], e: "48 × 15 = 48 × (10 + 5) = 480 + 240 = 720.", d: 2 },
  { q: "Hasil dari 625 ÷ 5 = ...", c: "125", w: ["115", "135", "105"], e: "625 ÷ 5 = 125.", d: 2 },
  { q: "Hasil dari 350 + 250 − 180 = ...", c: "420", w: ["410", "430", "400"], e: "(350 + 250) − 180 = 600 − 180 = 420.", d: 2 },
  { q: "Di perpustakaan ada 8 rak buku. Tiap rak memuat 45 buku. Berapa jumlah seluruh buku di rak?", c: "360", w: ["340", "380", "400"], e: "8 × 45 = 360 buku.", d: 2 },
  { q: "Ibu membeli 5 kg beras seharga Rp60.000. Berapa harga 1 kg beras tersebut?", c: "Rp12.000", w: ["Rp10.000", "Rp15.000", "Rp11.000"], e: "Rp60.000 ÷ 5 = Rp12.000.", d: 2 },
  { q: "Hasil dari 18 × 20 = ...", c: "360", w: ["380", "340", "400"], e: "18 × 2 = 36, jadi 18 × 20 = 360.", d: 2 },
  { q: "Budi memiliki kelereng 145 butir. Diberikan ke adiknya 35 butir, lalu diberi paman 50 butir. Kelereng Budi sekarang adalah ...", c: "160", w: ["150", "170", "155"], e: "145 − 35 + 50 = 110 + 50 = 160 butir.", d: 2 },

  // d3
  { q: "Hasil dari (125 × 4) + (450 ÷ 9) = ...", c: "550", w: ["540", "560", "500"], e: "(125 × 4) + (450 ÷ 9) = 500 + 50 = 550.", d: 3 },
  { q: "Pak Ahmad memanen 6 keranjang apel. Setiap keranjang berisi 75 apel. Jika 50 apel busuk, apel yang bagus adalah ...", c: "400", w: ["410", "390", "450"], e: "(6 × 75) − 50 = 450 − 50 = 400 apel bagus.", d: 3 },
  { q: "Sebuah sekolah memiliki 240 siswa yang dibagi rata ke dalam 8 kelas. Jika tiap kelas mendapat 30 buku cerita, total buku adalah ...", c: "240", w: ["200", "280", "300"], e: "8 kelas × 30 buku per kelas = 240 buku.", d: 3 },
  { q: "Hasil dari 2.500 − (350 × 4) = ...", c: "1.100", w: ["1.200", "1.000", "1.150"], e: "350 × 4 = 1.400. Lalu 2.500 − 1.400 = 1.100.", d: 3 },
  { q: "Rina menabung Rp5.000 setiap hari selama 2 minggu. Uang tabungan Rina seluruhnya adalah ...", c: "Rp70.000", w: ["Rp60.000", "Rp80.000", "Rp75.000"], e: "2 minggu = 14 hari. 14 × Rp5.000 = Rp70.000.", d: 3 },
  { q: "Hasil dari (180 ÷ 6) × (24 ÷ 4) = ...", c: "180", w: ["160", "200", "150"], e: "(180 ÷ 6) × (24 ÷ 4) = 30 × 6 = 180.", d: 3 },
  { q: "Suatu bus memuat 45 penumpang. Di halte A turun 12 orang dan naik 8 orang. Di halte B turun 15 orang. Penumpang sekarang adalah ...", c: "26 orang", w: ["28 orang", "25 orang", "30 orang"], e: "45 − 12 + 8 − 15 = 41 − 15 = 26 orang.", d: 3 },
  { q: "Harga 3 buku tulis adalah Rp15.000. Berapa harga 7 buku tulis yang sama?", c: "Rp35.000", w: ["Rp30.000", "Rp40.000", "Rp32.000"], e: "Harga 1 buku = Rp15.000 ÷ 3 = Rp5.000. 7 buku = 7 × Rp5.000 = Rp35.000.", d: 3 },
  { q: "Sebuah bak mandi berisi 180 liter air. Air dialirkan ke dalam ember 15 liter sampai habis. Banyak ember yang terisi adalah ...", c: "12 ember", w: ["10 ember", "14 ember", "15 ember"], e: "180 ÷ 15 = 12 ember.", d: 3 },
  { q: "Hasil dari 3.200 ÷ 40 + 120 = ...", c: "200", w: ["180", "220", "190"], e: "3.200 ÷ 40 = 80. Lalu 80 + 120 = 200.", d: 3 },
  { q: "Ibu membeli 4 kotak kue. Tiap kotak berisi 18 kue. Kue tersebut dibagikan rata kepada 6 orang anak. Tiap anak menerima ...", c: "12 kue", w: ["10 kue", "14 kue", "15 kue"], e: "Total kue = 4 × 18 = 72. Tiap anak = 72 ÷ 6 = 12 kue.", d: 3 },
  { q: "Jika A + 450 = 1.000 dan B − 250 = 300, maka nilai A + B adalah ...", c: "1.100", w: ["1.050", "1.150", "1.200"], e: "A = 1.000 − 450 = 550. B = 300 + 250 = 550. Maka A + B = 1.100.", d: 3 },
  { q: "Sebuah gedung memiliki 5 lantai. Tiap lantai ada 8 ruangan dan tiap ruangan ada 6 lampu. Banyak lampu seluruhnya adalah ...", c: "240 lampu", w: ["220 lampu", "260 lampu", "200 lampu"], e: "5 × 8 × 6 = 40 × 6 = 240 lampu.", d: 3 }
];

// -------------------------------------------------------------
// BAB 3: Pecahan (35 soal: 12 d1, 13 d2, 10 d3)
// -------------------------------------------------------------
const rawB3 = [
  // d1
  { q: "Pecahan 1/2 senilai dengan ...", c: "2/4", w: ["2/5", "1/4", "3/8"], e: "1/2 × 2/2 = 2/4.", d: 1 },
  { q: "Bentuk desimal dari 3/10 adalah ...", c: "0,3", w: ["0,03", "3,0", "0,33"], e: "Tiga persepuluh ditulis sebagai 0,3.", d: 1 },
  { q: "Pecahan 2/5 senilai dengan ...", c: "4/10", w: ["3/10", "4/15", "5/10"], e: "2/5 × 2/2 = 4/10.", d: 1 },
  { q: "Bentuk pecahan biasa dari 0,7 adalah ...", c: "7/10", w: ["7/100", "70/10", "1/7"], e: "0,7 memiliki satu angka di belakang koma, jadi 7/10.", d: 1 },
  { q: "Manakah pecahan yang paling sederhana dari 4/8?", c: "1/2", w: ["2/4", "4/4", "1/4"], e: "Bagi pembilang dan penyebut dengan 4 menghasilkan 1/2.", d: 1 },
  { q: "Bentuk desimal dari 25/100 adalah ...", c: "0,25", w: ["2,5", "0,025", "25,0"], e: "25/100 ditulis sebagai 0,25.", d: 1 },
  { q: "Tanda yang tepat untuk 1/4 ... 3/4 adalah ...", c: "<", w: [">", "=", "+"], e: "Penyebut sama, pembilang 1 lebih kecil dari 3.", d: 1 },
  { q: "Hasil dari 1/5 + 2/5 = ...", c: "3/5", w: ["3/10", "2/5", "4/5"], e: "Penyebut sudah sama: (1 + 2)/5 = 3/5.", d: 1 },
  { q: "Hasil dari 5/8 − 2/8 = ...", c: "3/8", w: ["3/16", "7/8", "2/8"], e: "Penyebut sama: (5 − 2)/8 = 3/8.", d: 1 },
  { q: "Pecahan 6/9 disederhanakan menjadi ...", c: "2/3", w: ["3/4", "1/3", "3/5"], e: "Bagi pembilang dan penyebut dengan FPB 3: 6÷3 / 9÷3 = 2/3.", d: 1 },
  { q: "Bentuk desimal dari 1/2 adalah ...", c: "0,5", w: ["0,2", "0,05", "0,12"], e: "1/2 = 5/10 = 0,5.", d: 1 },
  { q: "Pecahan yang memiliki nilai terbesar adalah ...", c: "3/4", w: ["1/4", "2/4", "1/2"], e: "3/4 bernilai 0,75, lebih besar dari 1/4 (0,25) dan 2/4 (0,50).", d: 1 },

  // d2
  { q: "Pecahan yang senilai dengan 3/4 adalah ...", c: "9/12", w: ["6/10", "8/12", "9/16"], e: "3/4 × 3/3 = 9/12.", d: 2 },
  { q: "Hasil dari 2/3 senilai dengan pecahan berpenyebut 15, yaitu ...", c: "10/15", w: ["8/15", "12/15", "5/15"], e: "Kalikan pembilang dan penyebut dengan 5: (2×5)/(3×5) = 10/15.", d: 2 },
  { q: "Bentuk persen dari pecahan 1/4 adalah ...", c: "25%", w: ["20%", "40%", "50%"], e: "1/4 = 25/100 = 25%.", d: 2 },
  { q: "Hasil dari 0,45 jika diubah ke pecahan biasa paling sederhana adalah ...", c: "9/20", w: ["45/100", "9/10", "4/5"], e: "45/100 dibagi 5/5 = 9/20.", d: 2 },
  { q: "Manakah perbandingan yang benar?", c: "2/3 > 1/2", w: ["1/3 > 1/2", "3/5 < 2/5", "1/4 > 2/4"], e: "2/3 = 4/6 dan 1/2 = 3/6. Karena 4/6 > 3/6, maka 2/3 > 1/2.", d: 2 },
  { q: "Ibu memotong melon menjadi 8 bagian sama besar. Dina memakan 2 bagian dan Budi 3 bagian. Melon yang tersisa adalah ...", c: "3/8 bagian", w: ["5/8 bagian", "2/8 bagian", "4/8 bagian"], e: "Dimakan = 2/8 + 3/8 = 5/8. Sisa = 8/8 − 5/8 = 3/8 bagian.", d: 2 },
  { q: "Hasil dari 0,4 + 0,35 = ...", c: "0,75", w: ["0,39", "0,49", "0,79"], e: "0,40 + 0,35 = 0,75.", d: 2 },
  { q: "Hasil dari 1 − 3/7 = ...", c: "4/7", w: ["3/7", "2/7", "5/7"], e: "1 = 7/7. 7/7 − 3/7 = 4/7.", d: 2 },
  { q: "Urutan pecahan 1/2, 1/4, 3/4 dari yang terkecil adalah ...", c: "1/4, 1/2, 3/4", w: ["1/2, 1/4, 3/4", "3/4, 1/2, 1/4", "1/4, 3/4, 1/2"], e: "1/4 (0,25) < 1/2 (0,50) < 3/4 (0,75).", d: 2 },
  { q: "Pecahan 15/20 disederhanakan menjadi ...", c: "3/4", w: ["4/5", "2/3", "3/5"], e: "Bagi pembilang dan penyebut dengan 5 menghasilkan 3/4.", d: 2 },
  { q: "Hasil dari 0,8 − 0,25 = ...", c: "0,55", w: ["0,65", "0,53", "0,60"], e: "0,80 − 0,25 = 0,55.", d: 2 },
  { q: "Di meja ada kue tart. Rian mengambil 1/6 bagian dan Salsa mengambil 2/6 bagian. Bagian kue yang diambil seluruhnya adalah ...", c: "1/2 bagian", w: ["3/12 bagian", "2/3 bagian", "1/3 bagian"], e: "1/6 + 2/6 = 3/6 = disederhanakan menjadi 1/2 bagian.", d: 2 },
  { q: "Nilai desimal dari 3/5 adalah ...", c: "0,6", w: ["0,35", "0,5", "0,3"], e: "3/5 = 6/10 = 0,6.", d: 2 },

  // d3
  { q: "Hasil dari 1/2 + 1/4 adalah ...", c: "3/4", w: ["2/6", "2/4", "1/4"], e: "Samakan penyebut: 2/4 + 1/4 = 3/4.", d: 3 },
  { q: "Hasil dari 3/4 − 1/2 adalah ...", c: "1/4", w: ["2/2", "2/4", "1/2"], e: "3/4 − 2/4 = 1/4.", d: 3 },
  { q: "Pecahan di antara 1/4 dan 3/4 yang tepat di tengah-tengahnya adalah ...", c: "1/2", w: ["2/3", "3/8", "1/3"], e: "(1/4 + 3/4) ÷ 2 = 1 ÷ 2 = 1/2.", d: 3 },
  { q: "Tono memiliki tali 1,5 meter. Dipotong 3/4 meter untuk jemuran. Sisa tali Tono adalah ...", c: "0,75 meter", w: ["0,5 meter", "1,25 meter", "0,65 meter"], e: "1,5 − 0,75 = 0,75 meter (karena 3/4 = 0,75).", d: 3 },
  { q: "Jika a/12 = 3/4, maka nilai a adalah ...", c: "9", w: ["6", "8", "10"], e: "3/4 = (3×3)/(4×3) = 9/12, jadi a = 9.", d: 3 },
  { q: "Sebuah botol berisi 4/5 liter sirup. Diminum 1/2 liter. Sisa sirup dalam botol adalah ...", c: "3/10 liter", w: ["3/5 liter", "1/5 liter", "2/10 liter"], e: "4/5 − 1/2 = 8/10 − 5/10 = 3/10 liter.", d: 3 },
  { q: "Manakah pecahan yang nilainya tidak sama dengan lainnya?", c: "4/6", w: ["3/4", "6/8", "9/12"], e: "3/4 = 6/8 = 9/12 = 0,75. Sedangkan 4/6 = 2/3 = 0,67.", d: 3 },
  { q: "Hasil dari 0,75 + 1/2 dalam bentuk desimal adalah ...", c: "1,25", w: ["1,15", "1,20", "1,50"], e: "0,75 + 0,50 = 1,25.", d: 3 },
  { q: "Pak Jaya memiliki sawah seluas 1 hektare. Sebanyak 0,35 hektare ditanami jagung dan 2/5 hektare ditanami padi. Sisa sawah adalah ...", c: "0,25 hektare", w: ["0,30 hektare", "0,20 hektare", "0,15 hektare"], e: "2/5 = 0,40. Terpakai = 0,35 + 0,40 = 0,75. Sisa = 1 − 0,75 = 0,25 hektare.", d: 3 },
  { q: "Jika 2/5 dari uang Beni adalah Rp10.000, maka seluruh uang Beni adalah ...", c: "Rp25.000", w: ["Rp20.000", "Rp30.000", "Rp15.000"], e: "Uang Beni = Rp10.000 ÷ 2 × 5 = Rp25.000.", d: 3 }
];

// -------------------------------------------------------------
// BAB 4: Pengukuran dan Pola (35 soal: 11 d1, 14 d2, 10 d3)
// -------------------------------------------------------------
const rawB4 = [
  // d1
  { q: "Keliling persegi dengan panjang sisi 6 cm adalah ...", c: "24 cm", w: ["36 cm", "12 cm", "18 cm"], e: "Keliling persegi = 4 × sisi = 4 × 6 = 24 cm.", d: 1 },
  { q: "Luas persegi dengan panjang sisi 5 cm adalah ...", c: "25 cm²", w: ["20 cm²", "10 cm²", "30 cm²"], e: "Luas persegi = sisi × sisi = 5 × 5 = 25 cm².", d: 1 },
  { q: "Panjang 2 meter sama dengan ...", c: "200 cm", w: ["20 cm", "2.000 cm", "20.000 cm"], e: "1 meter = 100 cm, jadi 2 meter = 200 cm.", d: 1 },
  { q: "Berat 3 kilogram sama dengan ...", c: "3.000 gram", w: ["300 gram", "30 gram", "30.000 gram"], e: "1 kg = 1.000 gram, jadi 3 kg = 3.000 gram.", d: 1 },
  { q: "Keliling persegi panjang dengan panjang 8 cm dan lebar 4 cm adalah ...", c: "24 cm", w: ["32 cm", "16 cm", "28 cm"], e: "Keliling = 2 × (p + l) = 2 × (8 + 4) = 2 × 12 = 24 cm.", d: 1 },
  { q: "Luas persegi panjang dengan panjang 10 cm dan lebar 6 cm adalah ...", c: "60 cm²", w: ["32 cm²", "16 cm²", "50 cm²"], e: "Luas = panjang × lebar = 10 × 6 = 60 cm².", d: 1 },
  { q: "Lanjutan pola bilangan 3, 6, 9, 12, ... adalah ...", c: "15", w: ["14", "16", "18"], e: "Pola bertambah 3 setiap suku.", d: 1 },
  { q: "Lanjutan pola bilangan 2, 4, 8, 16, ... adalah ...", c: "32", w: ["24", "30", "20"], e: "Pola dikali 2 setiap suku.", d: 1 },
  { q: "Satuan baku untuk mengukur luas ruangan adalah ...", c: "Meter persegi (m²)", w: ["Meter (m)", "Kilogram (kg)", "Liter (l)"], e: "Luas diukur dalam satuan persegi seperti m² atau cm².", d: 1 },
  { q: "1 jam sama dengan ...", c: "60 menit", w: ["100 menit", "30 menit", "3.600 menit"], e: "1 jam terdiri atas 60 menit.", d: 1 },
  { q: "Pola bilangan 50, 45, 40, 35, ... memiliki aturan ...", c: "Berkurang 5", w: ["Bertambah 5", "Dibagi 5", "Berkurang 10"], e: "Setiap langkah dikurangi 5.", d: 1 },

  // d2
  { q: "Sebuah persegi panjang memiliki keliling 30 cm. Jika panjangnya 9 cm, lebarnya adalah ...", c: "6 cm", w: ["5 cm", "7 cm", "8 cm"], e: "p + l = 30 ÷ 2 = 15. Maka l = 15 − 9 = 6 cm.", d: 2 },
  { q: "Luas sebuah persegi adalah 64 cm². Panjang sisi persegi tersebut adalah ...", c: "8 cm", w: ["6 cm", "7 cm", "9 cm"], e: "sisi = akar dari 64 = 8 cm karena 8 × 8 = 64.", d: 2 },
  { q: "Ibu membeli 2 kg beras dan 500 gram gula pasir. Berat belanjaan ibu seluruhnya adalah ...", c: "2.500 gram", w: ["2.050 gram", "2.100 gram", "3.000 gram"], e: "2 kg = 2.000 g. 2.000 g + 500 g = 2.500 gram.", d: 2 },
  { q: "Dua utas tali memiliki panjang 150 cm dan 2,5 meter. Panjang kedua tali jika disambung adalah ...", c: "400 cm", w: ["350 cm", "450 cm", "300 cm"], e: "2,5 m = 250 cm. 150 cm + 250 cm = 400 cm.", d: 2 },
  { q: "Perhatikan pola: 4, 9, 14, 19, ... Suku ke-6 dari pola tersebut adalah ...", c: "29", w: ["24", "34", "28"], e: "Suku ke-5 = 19 + 5 = 24. Suku ke-6 = 24 + 5 = 29.", d: 2 },
  { q: "Sebuah meja berbentuk persegi panjang dengan panjang 120 cm dan lebar 80 cm. Keliling meja adalah ...", c: "400 cm", w: ["200 cm", "9.600 cm", "300 cm"], e: "Keliling = 2 × (120 + 80) = 2 × 200 = 400 cm.", d: 2 },
  { q: "Lantai kamar berbentuk persegi dengan sisi 4 meter. Luas lantai kamar tersebut adalah ...", c: "16 m²", w: ["8 m²", "12 m²", "20 m²"], e: "Luas = 4 × 4 = 16 m².", d: 2 },
  { q: "Lanjutan dari pola bilangan 1, 4, 9, 16, ... adalah ...", c: "25", w: ["20", "24", "30"], e: "Pola bilangan kuadrat: 1², 2², 3², 4², 5² = 25.", d: 2 },
  { q: "Sebuah kebun jagung berukuran panjang 15 m dan lebar 10 m dipagari kawat. Panjang kawat yang diperlukan adalah ...", c: "50 m", w: ["150 m", "25 m", "60 m"], e: "Keliling kebun = 2 × (15 + 10) = 50 m.", d: 2 },
  { q: "Jarak rumah Andi ke sekolah adalah 1 km 250 m. Jarak tersebut setara dengan ...", c: "1.250 m", w: ["1.025 m", "1.205 m", "1.500 m"], e: "1 km = 1.000 m. 1.000 m + 250 m = 1.250 m.", d: 2 },
  { q: "Sebuah pita panjangnya 3 meter dipotong menjadi 6 bagian sama panjang. Panjang tiap potongan adalah ...", c: "50 cm", w: ["30 cm", "60 cm", "40 cm"], e: "3 m = 300 cm. 300 ÷ 6 = 50 cm.", d: 2 },
  { q: "Pola bilangan: 100, 92, 84, 76, ... Angka berikutnya adalah ...", c: "68", w: ["70", "66", "72"], e: "Pola selalu berkurang 8. 76 − 8 = 68.", d: 2 },
  { q: "Suatu persegi memiliki keliling 48 cm. Luas persegi tersebut adalah ...", c: "144 cm²", w: ["120 cm²", "96 cm²", "160 cm²"], e: "Sisi = 48 ÷ 4 = 12 cm. Luas = 12 × 12 = 144 cm².", d: 2 },
  { q: "Jika berat sekarung beras adalah 25 kg dan beras dimasak 1 kg per hari, beras akan habis dalam waktu ...", c: "25 hari", w: ["20 hari", "30 hari", "15 hari"], e: "25 kg ÷ 1 kg/hari = 25 hari.", d: 2 },

  // d3
  { q: "Keliling sebuah persegi panjang adalah 40 cm. Jika panjangnya 4 cm lebih panjang dari lebarnya, luasnya adalah ...", c: "96 cm²", w: ["84 cm²", "100 cm²", "90 cm²"], e: "p + l = 20. Jika p = l + 4, maka 2l + 4 = 20 -> l = 8, p = 12. Luas = 12 × 8 = 96 cm².", d: 3 },
  { q: "Dua persegi memiliki panjang sisi masing-masing 4 cm dan 8 cm. Perbandingan luas kedua persegi tersebut adalah ...", c: "1 : 4", w: ["1 : 2", "1 : 8", "1 : 16"], e: "Luas 1 = 16 cm², Luas 2 = 64 cm². Perbandingan 16 : 64 = 1 : 4.", d: 3 },
  { q: "Sebuah kolam renang berbentuk persegi panjang berukuran 20 m × 10 m. Di sekeliling kolam dibuat jalan setapak selebar 1 m. Luas jalan setapak adalah ...", c: "64 m²", w: ["60 m²", "70 m²", "54 m²"], e: "Luas luar = 22 × 12 = 264 m². Luas kolam = 20 × 10 = 200 m². Luas jalan = 264 − 200 = 64 m².", d: 3 },
  { q: "Perhatikan pola: 2, 3, 5, 8, 12, ... Dua suku berikutnya adalah ...", c: "17 dan 23", w: ["16 dan 22", "17 dan 24", "18 dan 25"], e: "Selisih bertambah 1: +1, +2, +3, +4, +5 (12+5=17), +6 (17+6=23).", d: 3 },
  { q: "Pak Toni memasang ubin di ruang tamu berukuran 6 m × 4 m. Jika ukuran tiap ubin 40 cm × 40 cm, banyak ubin yang dibutuhkan adalah ...", c: "150 buah", w: ["120 buah", "160 buah", "200 buah"], e: "Luas ruangan = 600 × 400 = 240.000 cm². Luas ubin = 40 × 40 = 1.600 cm². Banyak ubin = 240.000 ÷ 1.600 = 150 buah.", d: 3 },
  { q: "Sebuah kawat sepanjang 60 cm dibentuk menjadi persegi panjang dengan lebar 10 cm. Luas persegi panjang tersebut adalah ...", c: "200 cm²", w: ["150 cm²", "300 cm²", "250 cm²"], e: "Keliling = 60 cm. p + l = 30 cm -> p = 20 cm. Luas = 20 × 10 = 200 cm².", d: 3 },
  { q: "Pola bilangan segitiga: 1, 3, 6, 10, ... Nilai suku ke-7 dari pola ini adalah ...", c: "28", w: ["21", "25", "30"], e: "Suku ke-n = n×(n+1)/2. Suku ke-7 = 7 × 8 / 2 = 28.", d: 3 },
  { q: "Roni bersepeda menempuh jarak 4,5 km dalam waktu 30 menit. Berapa meter jarak yang ditempuh setiap menitnya?", c: "150 meter", w: ["120 meter", "180 meter", "200 meter"], e: "4,5 km = 4.500 m. Jarak per menit = 4.500 ÷ 30 = 150 meter.", d: 3 },
  { q: "Sebuah lapangan berbentuk persegi memiliki keliling yang sama dengan persegi panjang berukuran 16 m × 8 m. Luas lapangan persegi adalah ...", c: "144 m²", w: ["128 m²", "160 m²", "100 m²"], e: "Keliling persegi panjang = 2 × (16 + 8) = 48 m. Sisi persegi = 48 ÷ 4 = 12 m. Luas = 12 × 12 = 144 m².", d: 3 },
  { q: "Perhatikan pola: 3, 7, 15, 31, ... Suku berikutnya dari pola tersebut adalah ...", c: "63", w: ["55", "60", "64"], e: "Aturan: (angka × 2) + 1. Suku berikutnya = (31 × 2) + 1 = 63.", d: 3 }
];

function buildBatch(rawList, batchName) {
  const questions = rawList.map((item, idx) => {
    // Distribute answer key across 0, 1, 2, 3 evenly
    const forcedKey = idx % 4;
    const { options, answer } = assignKey({ correct: item.c, wrong: item.w }, forcedKey);
    return {
      question: item.q,
      options,
      answer,
      explanation: item.e,
      difficulty: item.d,
      timeLimit: item.d === 3 ? 35 : 20
    };
  });
  return saveBatch('matematika', batchName, questions);
}

buildBatch(rawB1, 'b1-bilangan-cacah');
buildBatch(rawB2, 'b2-operasi-hitung');
buildBatch(rawB3, 'b3-pecahan');
buildBatch(rawB4, 'b4-pengukuran-pola');

console.log('🎉 Selesai membangun 150 soal Matematika!');
