import json
import os
import unicodedata

def clean_text(s):
    if not s:
        return ""
    s = unicodedata.normalize('NFC', s.strip())
    while '  ' in s:
        s = s.replace('  ', ' ')
    return s

def build_q(q_text, correct_ans, distractors, expl, diff, idx):
    q_clean = clean_text(q_text)
    c_clean = clean_text(correct_ans)
    d_clean = [clean_text(d) for d in distractors]
    e_clean = clean_text(expl)
    
    target_idx = idx % 4
    opts = list(d_clean)
    opts.insert(target_idx, c_clean)
    
    for opt in opts:
        if len(opt) > 60:
            raise ValueError(f"Option too long ({len(opt)} chars): {opt}")
            
    return {
        "question": q_clean,
        "options": opts,
        "answer": target_idx,
        "explanation": e_clean,
        "difficulty": diff,
        "timeLimit": 25
    }

def save_batch(folder, filename, questions):
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(questions)} questions to {filepath}")

# BAB 1: Seni Rupa (Unsur, Prinsip, Gambar Alam) - 35 soal: 14 d1, 14 d2, 7 d3
b1_data = [
    # d1 (14)
    ("Unsur seni rupa yang paling mendasar dan menjadi awal dari segala bentuk garis adalah ...", "titik atau bintik", ["bidang dua dimensi", "tekstur kasar halus", "ruang berongga"], "Titik adalah unsur seni rupa terkecil yang mengawali terbentuknya garis.", 1),
    ("Goresan yang memanjang dan mempunyai arah tertentu dalam seni rupa disebut ...", "garis", ["warna", "tekstur", "volume"], "Garis terbentuk dari rangkaian titik-titik yang saling terhubung memanjang.", 1),
    ("Tiga warna dasar pokok yang tidak dapat dihasilkan dari campuran warna lain adalah ...", "merah, kuning, dan biru", ["merah, hijau, dan hitam", "kuning, hijau, dan putih", "biru, ungu, dan jingga"], "Warna primer adalah merah, kuning, dan biru sebagai induk semua warna.", 1),
    ("Campuran warna merah dan kuning dengan perbandingan seimbang akan menghasilkan warna ...", "oranye atau jingga", ["hijau lumut muda", "ungu lembayung tua", "cokelat tanah liat"], "Warna sekunder oranye tercipta dari paduan warna primer merah dan kuning.", 1),
    ("Campuran warna biru dan kuning dengan perbandingan seimbang akan menghasilkan warna ...", "hijau", ["jingga", "ungu", "merah muda"], "Pencampuran warna biru dan kuning menghasilkan warna sekunder hijau.", 1),
    ("Campuran warna merah dan biru dengan perbandingan seimbang akan menghasilkan warna ...", "ungu", ["jingga", "hijau", "abu-abu"], "Merah dipadu biru menghasilkan warna sekunder ungu (violet).", 1),
    ("Nilai raba dari permukaan suatu benda (kasar, halus, licin, atau bergelombang) disebut ...", "tekstur", ["proporsi", "komposisi", "dinamika"], "Tekstur adalah sifat permukaan bidang yang dapat diraba oleh kulit.", 1),
    ("Karya seni rupa yang hanya memiliki dimensi panjang dan lebar serta dinikmati satu arah disebut ...", "karya dua dimensi (2D)", ["karya tiga dimensi (3D)", "karya empat dimensi", "karya tanpa dimensi"], "Karya 2D seperti lukisan dan gambar hanya memiliki luas bidang datar.", 1),
    ("Karya seni rupa yang memiliki ukuran panjang, lebar, dan tinggi serta bervolume ruang adalah ...", "karya tiga dimensi (3D)", ["karya dua dimensi (2D)", "karya sketsa garis", "karya kaligrafi datar"], "Patung, vas bunga, dan gerabah memiliki volume ruang tiga dimensi nyata.", 1),
    ("Bentuk bidang seperti lingkaran, segitiga, persegi, dan trapesium termasuk kelompok bidang ...", "geometris", ["organis bebas", "non-geometris", "abstrak maya"], "Bidang geometris memiliki batas teratur dan dapat diukur secara matematis.", 1),
    ("Bentuk bidang yang bebas dan terinspirasi dari bentuk alam seperti daun dan batu disebut ...", "bidang organis", ["bidang geometris", "bidang persegi", "bidang garis lurus"], "Bentuk organis mengikuti lekuk bebas alami tanpa rumus matematika kaku.", 1),
    ("Warna hitam dan putih dalam pembagian jenis warna digolongkan sebagai warna ...", "netral", ["primer", "sekunder", "tersier"], "Warna netral digunakan untuk mengatur intensitas terang-gelap suatu warna.", 1),
    ("Alat pewarna gambar yang terbuat dari bahan lilin padat berpigmen warna adalah ...", "krayon (crayon)", ["cat air (watercolor)", "spidol warna", "tinta bak cina"], "Krayon berbahan lilin (wax) mudah digoreskan tebal di kertas gambar.", 1),
    ("Teknik menggambar menggunakan sapuan kuas basah dengan cat air yang transparan disebut teknik ...", "akuarel", ["plakat tebal", "pointilis bintik", "arsir garis rapat"], "Akuarel adalah teknik melukis cat air transparan dengan media kertas basah.", 1),

    # d2 (14)
    ("Prinsip seni rupa yang menata objek gambar agar tampak serasi, seimbang, dan tidak timpang adalah ...", "keseimbangan (balance)", ["kontras warna tajam", "kecepatan menggores", "kerumitan garis tepi"], "Keseimbangan menata bobot visual gambar agar nyaman dipandang mata.", 2),
    ("Keseimbangan yang bagian sisi kanan dan kirinya memiliki bentuk serta ukuran persis sama disebut ...", "keseimbangan simetris", ["keseimbangan asimetris", "keseimbangan radial", "keseimbangan acak"], "Simetris memiliki kesamaan bentuk cermin antara sisi kanan dan kiri bidang.", 2),
    ("Keseimbangan yang sisi kanan dan kirinya berbeda bentuk tetapi memiliki bobot visual setara adalah ...", "keseimbangan asimetris", ["keseimbangan simetris", "keseimbangan sejajar", "keseimbangan vertikal"], "Asimetris memberikan kesan dinamis tanpa kehilangan keserasian pandang.", 2),
    ("Teknik menggambar untuk memberikan kesan gelap-terang pada gambar menggunakan goresan garis berulang adalah ...", "teknik arsir", ["teknik dussel gosok", "teknik cetak saring", "teknik siluet hitam"], "Goresan garis arsir sejajar atau silang menciptakan gradasi bayangan nyata.", 2),
    ("Teknik menggambar gelap-terang dengan cara menggosokkan serbuk pensil menggunakan jari atau kapas disebut ...", "teknik dussel", ["teknik arsir silang", "teknik pointilis", "teknik cetak tinggi"], "Dussel dilakukan dengan menggosok goresan pensil agar tampak bergradasi halus.", 2),
    ("Teknik membuat gambar yang tersusun dari titik-titik bintik warna berkerapatan tertentu disebut ...", "teknik pointilis", ["teknik kolase kertas", "teknik blok siluet", "teknik lukis akrilik"], "Pointilis memanfaatkan kumpulan jutaan bintik titik untuk membentuk objek gambar.", 2),
    ("Gradasi warna dari hijau tua, hijau muda, hingga kuning pada gambar daun bertujuan untuk ...", "memberikan kesan volume dan pencahayaan", ["membuat gambar menjadi sangat ramai", "menghabiskan seluruh cat warna kita", "menutupi kesalahan coretan pensil"], "Gradasi menampilkan pantulan cahaya matahari dan lekukan tiga dimensi objek.", 2),
    ("Tekstur pada lukisan yang tampak kasar di mata tetapi terasa halus licin saat diraba disebut tekstur ...", "semu atau maya", ["nyata alami", "asli buatan", "mekanis mesin"], "Tekstur semu adalah ilusi optik visual yang berbeda dengan rabaan fisik.", 2),
    ("Unsur rupa yang menjadi pusat perhatian utama (focal point) dalam sebuah lukisan disebut prinsip ...", "penegasan (center of interest)", ["keseragaman corak", "keseimbangan bidang", "irama pengulangan"], "Pusat perhatian menjadi daya tarik pertama yang ditangkap oleh pandangan mata.", 2),
    ("Cara menggambar benda yang letaknya lebih jauh dari mata pengamat adalah digambar dengan ukuran ...", "lebih kecil dan warnanya memudar", ["lebih besar dan warnanya mencolok", "sama persis dengan objek di depan", "bergaris tepi sangat tebal gelap"], "Prinsip perspektif: objek yang jauh tampak lebih kecil dan samar warnanya.", 2),
    ("Perpaduan warna yang letaknya berseberangan dalam lingkaran warna (seperti merah dan hijau) disebut warna ...", "komplementer (kontras)", ["analogis serasi", "monokromatik", "warna primer murni"], "Warna komplementer saling melengkapi dan memberi kontras visual yang kuat.", 2),
    ("Bahan alam yang dapat dimanfaatkan untuk membuat pewarna alami kuning pada gambar kriya adalah ...", "kunyit parut", ["daun suji hijau", "kulit buah naga", "arang kayu bakar"], "Kunyit menghasilkan pigmen kuning kurkumin yang cerah dan alami.", 2),
    ("Sikap yang tepat saat mengapresiasi dan melihat pameran lukisan hasil karya teman sekelas adalah ...", "menghargai keindahan dan memberi saran santun", ["mengejek kekurangan gambar teman", "mencoret-coret lukisan yang dipajang", "membanding-bandingkan dengan nada meremehkan"], "Apresiasi seni menumbuhkan sikap saling menghargai kreativitas sahabat.", 2),
    ("Manfaat membuat sketsa pensil tipis terlebih dahulu sebelum mewarnai lukisan adalah ...", "mempermudah memperbaiki proporsi bentuk objek", ["membuat kertas gambar menjadi basah", "menghabiskan waktu jam pelajaran seni", "membuat warna krayon cepat habis"], "Sketsa tipis adalah panduan komposisi yang mudah dihapus bila terjadi kesalahan.", 2),

    # d3 (7)
    ("Analisis komposisi: Mengapa penempatan objek utama tepat di tengah bidang gambar terkadang terasa kaku?", "kurang dinamis dan minim ruang gerak visual", ["karena objek akan sulit diwarnai kuas", "sebab dilarang oleh aturan menggambar", "karena kertas gambar bisa menjadi robek"], "Prinsip 'rule of thirds' menempatkan objek sedikit ke tepi agar komposisi lebih hidup.", 3),
    ("Evaluasi pencahayaan: Jika sumber cahaya datang dari sisi kanan atas, di manakah letak bayangan objek?", "di sisi kiri bawah objek gambar", ["tepat di atas permukaan objek", "di sisi kanan bawah objek gambar", "di dalam rongga tengah objek"], "Cahaya merambat lurus, bayangan jatuh berlawanan arah dengan datangnya sinar.", 3),
    ("Perbandingan bahan: Mengapa cat poster (plakat) lebih cocok untuk mewarnai bidang warna pekat dibanding cat air?", "cat poster memiliki sifat menutup dan kedap", ["karena cat poster harus dicampur minyak", "sebab cat air tidak bisa menghasilkan warna", "karena cat poster harganya sangat mahal"], "Cat plakat bersifat opaque (menutup) sehingga warna di bawahnya tidak tembus.", 3),
    ("Kritik estetika: Apa dampak buruk jika seorang pelukis mencampurkan terlalu banyak warna sekunder secara acak?", "warna menjadi keruh, kotor, dan berlumpur", ["gambar akan menyala terang di kegelapan", "kertas gambar otomatis mengkilap indah", "warna lukisan menjadi putih bersih"], "Campuran terlalu banyak warna berlawanan menghasilkan warna abu kecokelatan kusam.", 3),
    ("Nilai kearifan lokal: Ragam hias motif batik kawung yang tersusun rapi geometris menyimbolkan ...", "kesucian hati, pengendalian diri, dan keadilan", ["keinginan menguasai harta duniawi", "rasa takut menghadapi kegelapan malam", "kekuatan fisik menaklukkan musuh"], "Filosofi batik kawung mencerminkan kearifan budi pekerti luhur bangsa Indonesia.", 3),
    ("Refleksi Kurikulum Berbasis Cinta (KBC): Menggambar keindahan alam flora Nusantara menumbuhkan rasa ...", "cinta dan syukur atas anugerah ciptaan Tuhan", ["rasa sombong karena memiliki negeri kaya", "keinginan mengeksploitasi hutan semena-mena", "ketidakpedulian terhadap kelestarian bumi"], "Seni mengasah kepekaan hati untuk menyayangi dan menjaga keasrian semesta alam.", 3),
    ("Penerapan inovasi: Bagaimana memanfaatkan limbah serbuk gergaji kayu untuk karya seni rupa dua dimensi?", "ditempelkan dengan lem membentuk tekstur nyata", ["dilarutkan ke dalam segelas air minum", "dibakar di atas kertas gambar basah", "dihamburkan ke udara kelas pameran"], "Serbuk kayu memberi tekstur taktil nyata yang unik pada lukisan kolase.", 3),
]

# BAB 2: Seni Musik (Irama, Birama, Alat Musik, Lagu Daerah) - 33 soal: 13 d1, 13 d2, 7 d3
b2_data = [
    # d1 (13)
    ("Bunyi yang teratur dan memiliki frekuensi getaran tertentu dalam musik disebut ...", "nada", ["desah", "bising", "denting acak"], "Nada adalah bunyi teratur yang menjadi bahan dasar menyusun melodi lagu.", 1),
    ("Urutan tinggi rendahnya nada yang tersusun secara berjenjang teratur disebut ...", "tangga nada", ["tempo ketukan", "birama lagu", "dinamika suara"], "Tangga nada (skala nada) menyusun jenjang do, re, mi, fa, sol, la, si, do.", 1),
    ("Cepat lambatnya suatu lagu dinyanyikan atau dimainkan dalam seni musik disebut ...", "tempo", ["ritme", "nada", "timbre"], "Tempo mengatur laju ketukan cepat lambatnya sebuah komposisi musik.", 1),
    ("Keras lembutnya bunyi nada yang dinyanyikan dalam sebuah lagu disebut ...", "dinamika", ["tangga nada", "birama garis", "harmoni kunci"], "Dinamika memberi ekspresi emosi lagu lewat volume keras atau lembut suara.", 1),
    ("Alat musik yang tidak memiliki tangga nada dan berfungsi mengatur irama disebut alat musik ...", "ritmis", ["melodis", "harmonis", "elektronis"], "Alat musik ritmis mengatur ketukan tempo tanpa menghasilkan untaian melodi lagu.", 1),
    ("Alat musik yang memiliki nada dan dapat memainkan melodi sebuah lagu disebut alat musik ...", "melodis", ["ritmis", "perkusi murni", "statik"], "Pianika, rekorder, seruling, dan gitar adalah contoh alat musik melodis.", 1),
    ("Contoh alat musik ritmis tradisional yang dimainkan dengan cara dipukul adalah ...", "kendang (gendang)", ["seruling bambu", "rebab dawai", "kecapi petik"], "Kendang dimainkan dengan telapak tangan untuk mengatur tempo tarian/gamelan.", 1),
    ("Contoh alat musik melodis modern tiup yang sering dipelajari siswa di sekolah adalah ...", "pianika", ["tamborin", "marakas", "segitiga (triangle)"], "Pianika ditiup sambil tuts tutsnya ditekan untuk menghasilkan melodi nada.", 1),
    ("Alat musik tradisional tiup dari bambu yang berasal dari tanah Sunda Jawa Barat adalah ...", "suling", ["angklung", "calung", "saluang"], "Suling bambu menghasilkan melodi merdu melalui lubang tiup dan petikan nada.", 1),
    ("Lagu daerah 'Bungong Jeumpa' yang menceritakan keindahan bunga cempaka berasal dari provinsi ...", "Aceh", ["Sumatera Barat", "Riau", "Sumatera Utara"], "Bungong Jeumpa adalah lagu daerah kebanggaan masyarakat Serambi Mekkah Aceh.", 1),
    ("Lagu daerah 'Ampar-Ampar Pisang' yang sangat ceria dan terkenal berasal dari provinsi ...", "Kalimantan Selatan", ["Kalimantan Barat", "Sulawesi Selatan", "Papua Barat"], "Lagu Ampar-Ampar Pisang berasal dari tradisi pengolahan pisang di Kalimantan Selatan.", 1),
    ("Tanda birama 4/4 pada sebuah lagu memiliki arti bahwa dalam setiap ruas birama terdapat ...", "4 ketukan nada", ["2 ketukan nada", "3 ketukan nada", "8 ketukan nada"], "Angka pembilang 4 menunjukkan ada 4 ketukan hitungan per satu ruas birama.", 1),
    ("Alat musik tradisional berbahan bambu dari Jawa Barat yang dimainkan dengan digoyang adalah ...", "angklung", ["kendang", "gong", "saron"], "Angklung menghasilkan bunyi nada saat tabung bambunya digoyangkan teratur.", 1),

    # d2 (13)
    ("Tanda birama 3/4 sering digunakan untuk mengiringi tarian dengan irama ayunan langkah seperti tarian ...", "walts (waltz)", ["mars perang", "cha-cha cepat", "dangdut koplo"], "Birama 3/4 memiliki aksen ketukan kuat pada hitungan pertama (TUK-tek-tek).", 2),
    ("Lagu wajib nasional yang dinyanyikan dengan tempo cepat dan bersemangat (marcia) contohnya adalah ...", "Maju Tak Gentar", ["Mengheningkan Cipta", "Gugur Bunga", "Syukur"], "Lagu Maju Tak Gentar berbirama 4/4 dengan tempo mars memompa patriotisme juang.", 2),
    ("Lagu wajib nasional 'Mengheningkan Cipta' dinyanyikan dengan tempo lambat dan khidmat bertujuan untuk ...", "mengenang jasa para pahlawan bangsa", ["mengajak penonton melompat riang", "mempercepat jalannya upacara bendera", "menghibur teman yang sedang berulang tahun"], "Tempo lambat dan dinamika lembut membangkitkan rasa hening, haru, dan takzim.", 2),
    ("Perbedaan mendasar antara tangga nada diatonis mayor dan diatonis minor adalah ...", "mayor bernuansa ceria, minor bernuansa sedih", ["mayor bernuansa murung, minor bernuansa gembira", "mayor hanya memiliki 5 nada, minor memiliki 7 nada", "mayor tidak memiliki nada fa, minor lengkap"], "Tangga nada mayor berjarak 1-1-1/2-1-1-1-1/2 berkarakter riang dan bersemangat.", 2),
    ("Cara memainkan alat musik triangle (segitiga) dari logam adalah dengan cara ...", "dipukul dengan stik logam pemukul", ["ditiup melalui lubang sudutnya", "dipetik menggunakan jari jemari", "digesek dengan busur dawai tali"], "Triangle dipukul menggunakan pemukul besi kecil untuk menghasilkan denting jernih.", 2),
    ("Alat musik marakas dimainkan dengan cara digoyangkan karena di dalam tabungnya terdapat ...", "butiran biji atau kerikil kecil", ["senar baja yang ditarik kencang", "udara bertekanan gas tinggi", "mata pisau pemotong getar"], "Gesekan biji-bijian di dinding labu marakas menghasilkan bunyi gemerisik khas.", 2),
    ("Fungsi tanda istirahat (tanda diam) pada penulisan partitur notasi musik adalah ...", "memberi jeda hening tanpa menyuarakan nada", ["mempercepat tempo lagu seketika", "menaikkan nada menjadi satu oktaf", "mengakhiri lagu secara mendadak"], "Tanda diam mengatur ritme napas dan artikulasi pemenggalan frase musikal.", 2),
    ("Lagu daerah 'Yamko Rambe Yamko' yang berirama penuh semangat berasal dari daerah ...", "Papua", ["Maluku", "Nusa Tenggara Timur", "Sulawesi Utara"], "Yamko Rambe Yamko adalah lagu perjuangan daerah yang berasal dari tanah Papua.", 2),
    ("Sikap tubuh yang benar saat bernyanyi agar suara merdu dan pernapasan leluasa adalah ...", "berdiri tegak rileks dan dada terbuka", ["membungkuk lesu dengan leher tertekuk", "duduk melipat kaki menekan perut", "berbaring santai di atas lantai"], "Postur tegak membuka rongga diafragma sehingga udara mengalir stabil.", 2),
    ("Pernapasan yang paling ideal dan dianjurkan digunakan dalam bernyanyi adalah pernapasan ...", "diafragma (rongga perut)", ["dada yang membusung", "bahu yang terangkat", "tenggorokan sempit"], "Diafragma mampu menampung volume udara banyak dan mengontrol dorongan vokal.", 2),
    ("Penyanyi yang menyanyikan lagu seorang diri tanpa kawan duet disebut bernyanyi secara ...", "solo (tunggal)", ["duet berpasangan", "trio bertiga", "paduan suara (choir)"], "Solo artinya vokal tunggal yang menjadi fokus utama pembawa lagu.", 2),
    ("Menyanyikan lagu secara bersama-sama dalam satu suara tanpa pembagian suara nada disebut bernyanyi ...", "unisono", ["kanon susul menyusul", "akord harmonis", "akustik kamar"], "Unisono adalah teknik bernyanyi serempak pada satu jalur melodi pokok yang sama.", 2),
    ("Alat musik kolintang khas Minahasa Sulawesi Utara dibuat dari bahan dasar bilah ...", "kayu lokal berresonansi", ["lempengan baja tahan karat", "kulit sapi yang dikeringkan", "tanah liat bakar gerabah"], "Bilah kayu kolintang disusun berderet di atas kotak resonator kayu merdu.", 2),

    # d3 (7)
    ("Analisis melodi: Mengapa lagu pengantar tidur (lullaby) selalu dimainkan dengan tempo lambat dan dinamika lembut?", "menenangkan gelombang otak menuju tidur", ["agar penyanyi tidak merasa haus lelah", "karena lagu tidur tidak memiliki nada lagu", "supaya anak cepat terbangun dari tidurnya"], "Frekuensi lembut dan ritme tenang memicu relaksasi saraf pengantar istirahat.", 3),
    ("Evaluasi ensambel: Apa yang terjadi jika pemain drum/kendang tidak menjaga kestabilan tempo birama?", "seluruh pemain musik lain menjadi kacau", ["musik yang dimainkan menjadi semakin merdu", "penyanyi vokal otomatis bernyanyi lebih indah", "penonton akan langsung bertepuk tangan riuh"], "Alat ritmis adalah metronom penuntun keteraturan seluruh instrumen ensambel.", 3),
    ("Perbandingan nada: Mengapa alat musik pianika membutuhkan tiupan udara yang stabil saat ditekan tutsnya?", "tiupan stabil menjaga kemurnian tinggi rendah nada", ["agar pianika tidak meledak karena tekanan", "karena pianika dilarang ditiup dengan lembut", "supaya tuts hitam putihnya tidak terlepas"], "Fluktuasi tiupan napas membuat nada menjadi sumbang (fals) dan patah-patah.", 3),
    ("Refleksi budaya: Mengapa lagu-lagu daerah Nusantara menggunakan bahasa daerah asalnya masing-masing?", "merawat kekayaan tutur dan identitas budaya suku", ["karena penciptanya belum mengenal bahasa persatuan", "agar suku bangsa lain tidak boleh menyanyikannya", "supaya lagu tersebut tidak didengar masyarakat"], "Lagu daerah adalah cermin kearifan lokal, dialek bahasa, dan jiwa suku bangsa.", 3),
    ("Nilai etika KBC: Perilaku seorang penonton yang santun saat menyaksikan konser musik sekolah adalah ...", "menyimak tenang dan bertepuk tangan pada waktunya", ["meneriaki penyanyi saat salah lirik lagu", "bermain ponsel sambil memutar musik keras", "melemparkan bungkus makanan ke panggung"], "Menghargai penampilan seniman adalah cermin kematangan budi pekerti pendengar.", 3),
    ("Kritik musikalitas: Mengapa harmonisasi suara dalam bernyanyi paduan suara memerlukan rasa rendah hati?", "setiap penyanyi harus menahan ego volume suaranya", ["karena penyanyi bersuara keras harus dihukum", "agar lagu selesai lebih cepat dari jadwalnya", "karena paduan suara tidak boleh terdengar penonton"], "Keindahan paduan suara lahir dari peleburan suara serasi, bukan saling menonjolkan diri.", 3),
    ("Penerapan kreativitas: Bagaimana cara menghasilkan bunyi ritmis marakas menggunakan barang bekas rumah tangga?", "mengisi botol plastik bekas dengan butir beras", ["meniup bagian mulut kaleng susu yang kosong", "memukul sendok logam pada permukaan bantal", "meremas-remas lembaran kantong kresek"], "Botol berisi beras meniru gemerisik marakas secara mandiri dan ramah lingkungan.", 3),
]

# BAB 3: Seni Tari dan Seni Kriya (Gerak Tari, Properti, Anyaman, Kolase) - 32 soal: 13 d1, 13 d2, 6 d3
b3_data = [
    # d1 (13)
    ("Tiga unsur utama yang tidak dapat dipisahkan dalam seni tari adalah ...", "wiraga, wirama, dan wirasa", ["warna, bidang, dan bentuk", "panjang, lebar, dan tinggi", "teks, dialog, dan panggung"], "Wiraga (raga gerak), wirama (irama pengiring), wirasa (ekspresi penghayatan rasa).", 1),
    ("Unsur seni tari yang berkaitan dengan keterampilan gerak tubuh penari disebut ...", "wiraga (raga gerak)", ["wirama (irama musik)", "wirasa (penghayatan rasa)", "wibawa (keberanian diri)"], "Wiraga mengukur keluwesan, ketepatan, dan penguasaan teknik gerak tubuh.", 1),
    ("Unsur seni tari yang menilai keserasian antara gerak penari dengan irama musik pengiring adalah ...", "wirama (irama ketukan)", ["wiraga (gerak badan)", "wirasa (ekspresi jiwa)", "wirupa (tata rias busana)"], "Wirama menuntut penari menari tepat pada ketukan tempo melodi pengiring.", 1),
    ("Unsur seni tari yang menilai kemampuan penari mengekspresikan karakter dan perasaan tarian adalah ...", "wirasa (rasa penjiwaan)", ["wiraga (gerak raga)", "wirama (ketukan musik)", "wirupa (tata rias panggung)"], "Wirasa terpancar dari mimik wajah, pandangan mata, dan kedalaman penghayatan emosi.", 1),
    ("Garis lintasan imajiner yang dilalui penari saat berpindah tempat di atas panggung disebut ...", "pola lantai", ["tata panggung", "garis birama", "level gerak"], "Pola lantai menata formasi pergerakan penari agar sajian tarian lebih indah dan rapi.", 1),
    ("Dua jenis pola lantai dasar dalam seni tari adalah ...", "garis lurus dan garis lengkung", ["garis tebal dan garis putus-putus", "garis tinggi dan garis rendah", "garis acak dan garis bintik"], "Garis lurus (vertikal, horizontal, diagonal) dan garis lengkung (lingkaran, lengkung).", 1),
    ("Tari Saman dari daerah Aceh ditarikan secara berkelompok dengan pola lantai lurus berbentuk ...", "garis horizontal mendatar", ["lingkaran memusat", "garis vertikal membujur", "pola zig-zag menyebar"], "Penari Saman duduk bersimpuh rapat dalam satu deretan garis lurus horizontal.", 1),
    ("Benda atau alat pelengkap yang digunakan penari untuk memperkuat karakter tarian disebut ...", "properti tari", ["tata rias wajah", "lampu sorot pentas", "pakaian penonton"], "Selendang, piring, kipas, payung, dan topeng adalah aneka ragam properti tari.", 1),
    ("Tari Piring adalah tarian tradisional khas Minangkabau yang menggunakan properti utama berupa ...", "dua buah piring porselen", ["sebilah keris pusaka", "kipas lipat bergambar", "payung kertas warna"], "Penari mengayunkan piring di kedua belah telapak tangan dengan lincah tanpa jatuh.", 1),
    ("Karya seni kriya yang dibuat dengan menyilangkan bilah-bilah bahan secara teratur disebut seni ...", "menganyam", ["merajut", "mencetak", "memahat"], "Anyaman dibuat dari lungsi dan pakan yang disusupkan silang bergantian.", 1),
    ("Karya seni rupa dua dimensi yang dibuat dengan menempelkan serpihan bahan sejenis pada pola gambar disebut ...", "kolase", ["anyaman", "patung pahat", "gerabah tanah"], "Kolase memanfaatkan potongan kertas, dedaunan kering, atau biji-bijian yang dilem.", 1),
    ("Bahan alam yang sering digunakan untuk membuat anyaman tradisional di Indonesia adalah ...", "janur kelapa dan bambu", ["kawat besi dan seng", "kaca dan porselen", "plastik dan karet ban"], "Bambu, janur, pandan, dan rotan adalah serat alam primadona anyaman Nusantara.", 1),
    ("Tingkat ketinggian gerak penari dari permukaan lantai panggung disebut ...", "level gerak tari", ["tempo gerak tari", "dinamika panggung", "volume suara tari"], "Level tari terbagi menjadi tiga: level tinggi (melompat), sedang, dan rendah.", 1),

    # d2 (13)
    ("Gerak tari yang dilakukan penari dengan posisi duduk bersimpuh di atas lantai termasuk level ...", "rendah", ["sedang", "tinggi", "campuran acak"], "Level rendah dilakukan menyentuh lantai tanpa posisi berdiri (seperti Tari Saman).", 2),
    ("Gerak tari yang dilakukan penari saat berdiri tegak lalu melompat ke udara termasuk level ...", "tinggi", ["rendah", "sedang", "dasar tanah"], "Level tinggi dilakukan dengan melayang, melompat, atau menjinjitkan kaki ke atas.", 2),
    ("Pola lantai garis lurus vertikal pada seni tari memberikan kesan pesan visual yang bermakna ...", "kuat, teguh, dan mendalam", ["lemah gemulai dan lentur", "sangat kacau dan gelisah", "santai dan tanpa arah tujuan"], "Garis vertikal melambangkan hubungan lurus yang kokoh, sakral, dan berwibawa.", 2),
    ("Pola lantai garis lengkung atau lingkaran dalam seni tari memberi kesan visual yang ...", "lembut, luwes, dan manis", ["kaku, keras, dan tegang", "menakutkan dan menyeramkan", "terburu-buru tanpa aturan"], "Lengkungan melambangkan keluwesan, kehangatan persaudaraan, dan kebersamaan.", 2),
    ("Tari Kecak dari Bali menggunakan pola lantai yang sangat khas dan unik yaitu berbentuk ...", "lingkaran mengelilingi api", ["garis lurus satu baris", "segitiga sama sisi sempit", "garis kotak berpetak-petak"], "Puluhan penari pria duduk melingkar sambil menyerukan 'cak-cak-cak' berirama ritmis.", 2),
    ("Tata rias wajah (make up) dalam pementasan seni tari berfungsi untuk ...", "memperjelas karakter tokoh tarian", ["menutupi seluruh identitas penari", "membuat penari tampak seperti robot", "menggantikan peran musik pengiring"], "Tata rias karakter membedakan tokoh protagonis ramah, ksatria gagah, atau raksasa jahat.", 2),
    ("Dua bagian utama pita atau bilah dalam teknik membuat anyaman dasar disebut ...", "pakan dan lungsi", ["kain dan benang rajut", "jarum dan gunting potong", "lem dan bidang kertas"], "Lungsi adalah pita vertikal tetap, pakan adalah pita horizontal yang disisipkan.", 2),
    ("Teknik dasar anyaman tunggal dilakukan dengan pola susupan bilah pita secara ...", "satu bilah angkat satu bilah tindih", ["dua bilah angkat dua bilah tindih", "tiga bilah angkat satu bilah tindih", "semua bilah ditumpuk sekaligus"], "Anyaman tunggal (bintang 1): satu pakan menyusup di bawah satu lungsi teratur.", 2),
    ("Perbedaan utama antara karya seni tempel kolase dan mozaik adalah ...", "kolase dari aneka bahan, mozaik bahan seragam", ["kolase selalu dari kain, mozaik selalu dari kayu", "kolase dipahat pisau, mozaik digores cat air", "keduanya sama sekali tidak menggunakan lem perekat"], "Mozaik memakai kepingan bahan sewarna/sejenis berukuran teratur (keping kaca/kertas).", 2),
    ("Teknik montase dibuat dengan cara menyusun dan menempelkan potongan gambar dari ...", "berbagai sumber majalah atau foto cetak", ["satu lembar kertas polos yang digunting", "daun-daun basah yang baru dipetik", "pasir pantai yang ditaburkan rata"], "Montase memadukan beberapa gambar yang sudah jadi dari media cetak menjadi cerita baru.", 2),
    ("Fungsi musik pengiring (iringan musik) dalam pementasan seni tari adalah ...", "mempertegas dinamika dan ritme gerak tari", ["mengalihkan perhatian penonton dari penari", "membuat penari tidak perlu menghafal gerak", "menggantikan properti busana penari"], "Iringan musik menghidupkan suasana dan mengunci ketepatan ketukan gerak penari.", 2),
    ("Karya seni kriya anyaman janur kelapa yang sering digunakan masyarakat saat hari raya Idulfitri adalah ...", "selongsong ketupat", ["topi caping tani", "tikar tidur gulung", "wadah bakul nasi"], "Anyaman selongsong ketupat dari janur adalah warisan kriya kuliner Nusantara.", 2),
    ("Sikap gotong royong dalam mempersiapkan pementasan seni tari di sekolah diwujudkan dengan ...", "saling membantu menyiapkan kostum dan properti", ["berebut ingin menari di posisi paling depan", "menolak ikut gladi bersih latihan bersama", "mengejek kostum penari kelompok lain"], "Kekompakan kelompok menjadi penentu suksesnya pergelaran karya seni bersama.", 2),

    # d3 (6)
    ("Analisis koreografi: Mengapa variasi level (tinggi, sedang, rendah) sangat diperlukan dalam tarian kelompok?", "agar penampilan tidak monoton dan lebih dinamis", ["agar panggung tidak roboh karena beban tari", "karena penari bertubuh pendek harus di lantai", "supaya penari tidak merasa kehausan"], "Perbedaan level menciptakan kedalaman visual panggung yang estetis dan memikat.", 3),
    ("Evaluasi keselamatan: Apa yang harus diperhatikan oleh penari Tari Piring saat mengayunkan piringnya?", "keseimbangan genggaman cincin jari dan ritme ayun", ["melempar piring setinggi langit-langit gedung", "meminyaki piring agar licin saat digerakkan", "menutup kedua mata saat berputar kencang"], "Konsentrasi dan kontrol cengkeraman jari mencegah piring melayang membahayakan kawan.", 3),
    ("Perbandingan kriya: Mengapa daun pandan kering harus diserut dan dilemaskan sebelum dianyam?", "agar lentur, tidak mudah patah, dan rapi", ["supaya aromanya menjadi sangat menyengat", "karena daun pandan harus berwarna hitam pekat", "agar daun pandan tidak dimakan oleh serangga"], "Proses pelenturan memudahkan serat disusupkan tanpa sobek atau retak getas.", 3),
    ("Kritik kelestarian: Bagaimana sikap generasi muda pelajar terhadap kepunahan seni tari tradisional daerah?", "giat mempelajari, mementaskan, dan mempromosikannya", ["menganggap tarian tradisional kuno dan memalukan", "menghapus materi tarian dari kurikulum sekolah", "meniru tarian modern asing tanpa disaring moral"], "Melestarikan warisan leluhur adalah bukti cinta tanah air dan jati diri bangsa.", 3),
    ("Refleksi Kurikulum Berbasis Cinta (KBC): Tari bertema kepedulian lingkungan (ekologi) mengajarkan ...", "menyayangi flora, fauna, dan kelestarian rimba", ["menguasai sumber daya alam demi keuntungan ego", "mengeksploitasi hutan lindung demi tambang", "ketakutan berlebihan terhadap hewan hutan"], "Bahasa gerak seni tari menyuarakan pesan damai dan kasih sayang bagi bumi pertiwi.", 3),
    ("Penerapan nilai ekonomis: Karya seni anyaman dan kolase dari limbah sampah daur ulang memiliki nilai tambah berupa ...", "mengurangi pencemaran lingkungan dan bernilai jual", ["membuat rumah menjadi semakin kotor berdebu", "menghabiskan seluruh uang tabungan keluarga", "mewajibkan orang tua membeli mesin pabrik"], "Kriya daur ulang mengasah kecerdasan ekologis sekaligus jiwa kewirausahaan kreatif.", 3),
]

def main():
    target_dir = "/home/maman/play/konten/kelas4-sem1/seni-budaya"
    batches = [
        ("b1-seni-rupa.json", b1_data),
        ("b2-seni-musik.json", b2_data),
        ("b3-seni-tari-dan-kriya.json", b3_data)
    ]
    
    total = 0
    longest_count = 0
    
    for filename, raw_items in batches:
        qs = []
        for i, item in enumerate(raw_items):
            q_text, c_ans, dists, expl, diff = item
            q_obj = build_q(q_text, c_ans, dists, expl, diff, i)
            qs.append(q_obj)
            
            lens = [len(o) for o in q_obj["options"]]
            max_len = max(lens)
            max_idx = lens.index(max_len)
            if max_idx == q_obj["answer"]:
                longest_count += 1
                
        save_batch(target_dir, filename, qs)
        total += len(qs)
        
    print(f"Total Seni Budaya generated: {total} questions across {len(batches)} batches.")
    print(f"Longest key bias check: {longest_count}/{total} = {longest_count/total*100:.1f}%")

if __name__ == "__main__":
    main()
