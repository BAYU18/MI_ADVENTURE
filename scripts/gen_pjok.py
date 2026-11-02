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

# BAB 1: Bola Besar (Sepak bola, Voli, Basket) - 35 soal: 14 d1, 14 d2, 7 d3
b1_data = [
    # d1 (14)
    ("Gerak berpindah tempat dari satu titik ke titik lain dalam olahraga disebut gerak ...", "lokomotor", ["nonlokomotor", "manipulatif", "statis berdiam"], "Gerak lokomotor ditandai dengan adanya perpindahan tempat tubuh.", 1),
    ("Gerak yang dilakukan tanpa berpindah tempat dari posisi awal disebut gerak ...", "nonlokomotor", ["lokomotor", "manipulatif", "akrobatik"], "Gerak nonlokomotor dilakukan di tempat seperti menekuk, meliuk, dan mengayun.", 1),
    ("Gerak yang menggunakan atau mengendalikan suatu benda luar seperti bola disebut gerak ...", "manipulatif", ["lokomotor", "nonlokomotor", "relaksasi"], "Gerak manipulatif melibatkan penguasaan objek atau alat olahraga.", 1),
    ("Contoh gerak lokomotor dalam permainan sepak bola adalah ...", "berlari kencang mengejar bola", ["menekuk lutut bersiap melompat", "mengayun lengan saat berdiri", "meliukkan pinggang ke kanan"], "Berlari menyebabkan seluruh tubuh berpindah tempat di lapangan.", 1),
    ("Contoh gerak manipulatif dalam permainan sepak bola adalah ...", "menendang bola ke arah gawang", ["berlari mengelilingi lapangan", "berjalan santai menuju teman", "melompat tanpa menyentuh bola"], "Menendang bola melibatkan kendali atas objek (bola).", 1),
    ("Menggiring bola dalam permainan sepak bola bertujuan untuk ...", "membawa bola mendekati sasaran", ["membuang bola keluar lapangan", "mengulur waktu tanpa strategi", "menjatuhkan pemain bertahan"], "Dribbling bertujuan mendekatkan bola ke gawang lawan atau mencari ruang.", 1),
    ("Bagian kaki yang paling sering digunakan untuk mengoper bola jarak dekat adalah ...", "kaki bagian dalam", ["ujung jari jempol kaki", "kaki bagian tumit belakang", "bagian telapak kaki bawah"], "Kaki bagian dalam memberikan operan yang lebih terarah dan akurat.", 1),
    ("Gerak mengoper bola kepada rekan satu tim dengan kedua tangan dari bawah pada bola voli disebut ...", "passing bawah", ["passing atas", "smash keras", "servis lompat"], "Passing bawah digunakan untuk menerima servis dan serangan lawan.", 1),
    ("Sikap kedua lutut yang tepat saat melakukan passing bawah bola voli adalah ...", "ditekuk sedikit mengeper", ["lurus tegak kaku sekali", "berlutut rapat di lantai", "ditekuk hingga menyentuh dada"], "Lutut ditekuk agar tubuh memiliki daya dorong pegas saat bola datang.", 1),
    ("Gerak memantul-mantulkan bola basket ke lantai menggunakan satu tangan disebut ...", "dribbling (menggiring)", ["shooting (menembak)", "passing (mengoper)", "pivot (berputar)"], "Dribble basket dilakukan dengan mendorong bola ke lantai bergantian atau satu tangan.", 1),
    ("Gerakan melempar bola basket setinggi dada kepada teman satu tim disebut ...", "chest pass (operan dada)", ["bounce pass (operan pantul)", "overhead pass (atas kepala)", "slam dunk (hunjaman bola)"], "Chest pass adalah teknik operan cepat sejajar dada rekan tim.", 1),
    ("Gerakan memasukkan bola basket langsung ke dalam keranjang lawan disebut ...", "shooting (menembak)", ["dribbling (menggiring)", "passing (mengoper)", "rebound (merebut)"], "Shooting bertujuan mencetak angka dengan memasukkan bola ke keranjang.", 1),
    ("Jumlah pemain dalam satu tim regu sepak bola di lapangan adalah ...", "11 pemain", ["5 pemain", "6 pemain", "9 pemain"], "Sepak bola dimainkan oleh dua tim yang masing-masing beranggotakan 11 orang.", 1),
    ("Jumlah pemain dalam satu regu pertandingan bola voli di lapangan adalah ...", "6 pemain", ["5 pemain", "8 pemain", "11 pemain"], "Satu regu bola voli lapangan terdiri dari 6 pemain aktif.", 1),

    # d2 (14)
    ("Kombinasi gerak nonlokomotor dan manipulatif pada permainan sepak bola tampak pada gerakan ...", "mengayun kaki lalu menendang bola", ["berlari cepat mengejar operan bola", "melompat tinggi menghindari tekel", "berjalan santai menuju titik penalti"], "Mengayun kaki (nonlokomotor) dipadukan dengan menendang bola (manipulatif).", 2),
    ("Kombinasi gerak lokomotor dan manipulatif pada permainan bola basket tampak pada gerakan ...", "berlari sambil memantulkan bola", ["berdiri tegak memegang bola erat", "menekuk lutut sebelum menembak", "meliukkan badan saat menjaga lawan"], "Berlari (lokomotor) dipadukan dengan dribbling bola (manipulatif).", 2),
    ("Posisi perkenaan bola yang tepat pada lengan saat melakukan passing bawah bola voli adalah ...", "bagian pergelangan tangan bagian atas", ["ujung jari-jemari kedua tangan", "tepat di siku kedua belah lengan", "bagian pundak dekat leher leher"], "Bola harus mengenai bidang datar antara pergelangan tangan dan siku bawah.", 2),
    ("Tujuan utama mengoper bola dengan teknik bounce pass (operan pantul) pada bola basket adalah ...", "mengecoh hadangan tangan lawan", ["memperlambat tempo serangan tim", "membuat bola melambung tinggi", "membuang tenaga pemain penyerang"], "Pantulan lantai menyulitkan lawan berpostur tinggi merebut operan.", 2),
    ("Posisi tubuh yang tepat saat menyundul bola (heading) dalam sepak bola adalah ...", "mengencangkan otot leher dan dahi", ["menutup mata rapat-rapat ketakutan", "menggunakan bagian ubun-ubun kepala", "membiarkan kepala lemas tanpa tenaga"], "Menyundul menggunakan dahi (tulang depan) dengan otot leher terkunci kuat.", 2),
    ("Gerakan berputar dengan satu kaki sebagai poros dalam permainan bola basket disebut ...", "pivot", ["lay up", "rebound", "blocking"], "Pivot digunakan untuk menyelamatkan bola dari sergapan lawan tanpa melangkah.", 2),
    ("Ketika bola keluar melewati garis samping lapangan sepak bola, permainan dilanjutkan dengan ...", "lemparan ke dalam (throw in)", ["tendangan bebas langsung", "tendangan sudut (corner kick)", "tendangan penalti 12 pas"], "Bola keluar garis samping memicu lemparan ke dalam (throw-in) dua tangan.", 2),
    ("Sikap sportivitas yang benar saat tim mengalami kekalahan dalam pertandingan bola voli adalah ...", "menjabat tangan lawan dan memberi selamat", ["menyalahkan keputusan wasit pertandingan", "menolak bersalaman dengan tim pemenang", "merusak fasilitas olahraga di lapangan"], "Sportivitas mengajarkan kerendahan hati menerima hasil pertandingan.", 2),
    ("Peran utama seorang penjaga gawang (kiper) dalam sepak bola adalah ...", "mencegah bola masuk ke dalam gawang", ["mengatur strategi serangan dari tengah", "melakukan tekel keras kepada penyerang", "mencetak gol sebanyak-banyaknya"], "Kiper adalah pemain yang diperbolehkan memegang bola di area kotak penalti.", 2),
    ("Sikap kedua lengan saat melakukan passing atas pada permainan bola voli adalah ...", "membentuk mangkuk terbuka di atas dahi", ["lurus ke bawah di depan lutut kaki", "merapat lurus ke samping badan kita", "disilangkan rapat di depan rongga dada"], "Jari-jari tangan terbuka membentuk mangkuk menyongsong datangnya bola.", 2),
    ("Tujuan gerakan menembak sambil melayang (lay-up shoot) dalam bola basket adalah ...", "mempermudah memasukkan bola dari dekat", ["menjauhkan bola dari keranjang basket", "mengoper bola ke kawan di garis tengah", "menghindari kontak fisik dengan lantai"], "Lay-up adalah tembakan melayang dua langkah mendekati ring basket.", 2),
    ("Mengapa komunikasi antarpemain sangat penting dalam permainan bola voli?", "mencegah tabrakan saat merebut bola", ["agar penonton bersorak lebih gembira", "untuk mengganggu konsentrasi pemain lawan", "supaya pertandingan cepat diselesaikan"], "Komunikasi (misal seruan 'saya!') membagi tugas menyambut bola secara rapi.", 2),
    ("Pemanasan sebelum bermain sepak bola sangat bermanfaat untuk ...", "mencegah cedera otot dan kram", ["membuat perut terasa kenyang lama", "menghabiskan waktu jam pelajaran", "membuat tubuh cepat lelah bertanding"], "Pemanasan meningkatkan suhu otot dan kelenturan sendi tubuh.", 2),
    ("Pendinginan (cooling down) setelah berolahraga bola besar bertujuan untuk ...", "menurunkan detak jantung secara bertahap", ["meningkatkan suhu tubuh setinggi mungkin", "membuat otot langsung menjadi sangat kaku", "mengeluarkan seluruh cadangan energi tubuh"], "Pendinginan mengembalikan tubuh ke kondisi rileks dan normal.", 2),

    # d3 (7)
    ("Analisis taktik: Mengapa operan lambung panjang (long pass) efektif saat serangan balik cepat?", "karena melewati barisan pertahanan lawan", ["karena bola lambung mustahil direbut lawan", "karena pemain penyerang selalu lebih cepat", "karena tidak membutuhkan tenaga yang besar"], "Operan melambung memangkas jarak dan melompati kepadatan pemain lini tengah.", 3),
    ("Evaluasi gerak: Apa yang terjadi jika saat passing bawah bola voli siku ditekuk berlebihan?", "pantulan bola liar dan tidak terarah", ["bola akan meluncur semakin kencang lurus", "arah bola menjadi sangat stabil dan tenang", "pukulan bola otomatis berubah menjadi smash"], "Bidang lengan yang tidak rata membuat sudut pantul bola menyimpang jauh.", 3),
    ("Perbandingan mekanika: Mengapa lemparan dada (chest pass) lebih cepat sampai daripada operan lambung?", "karena lintasan bolanya lurus mendatar", ["karena bola basket memiliki bobot yang ringan", "karena dilakukan dengan melompat sangat tinggi", "karena pemain penerima selalu berdiri diam"], "Gaya dorong horizontal menghasilkan garis edar terpendek menuju sasaran rekan.", 3),
    ("Kritik keselamatan: Bahaya yang ditimbulkan jika bermain sepak bola memakai sepatu tanpa pul di rumput basah adalah ...", "mudah terpeleset dan cedera lutut", ["bola akan pecah saat ditendang keras", "wasit akan memberikan kartu merah langsung", "kaki menjadi terasa sangat hangat dan nyaman"], "Traksi cengkeraman sepatu sangat krusial mencegah cedera sendi dan ligamen.", 3),
    ("Nilai karakter: Bagaimana seorang kapten tim basket menenangkan anggotanya yang melakukan kesalahan passing?", "memberi semangat dan mengajak fokus kembali", ["memarahi dan mencadangkan pemain tersebut", "menyuruh pemain keluar dari lapangan lomba", "menghentikan permainan secara sepihak"], "Kepemimpinan positif membangkitkan rasa percaya diri rekan seperjuangan.", 3),
    ("Penerapan aturan: Mengapa menyentuh net saat pertandingan bola voli dianggap sebagai pelanggaran (net touch)?", "mengganggu sportivitas dan membahayakan lawan", ["karena jaring net sangat mudah robek rusak", "karena pemain harus selalu melompat mundur", "agar tinggi tiang net tidak berubah ukuran"], "Aturan net touch menjaga integritas pemisah wilayah dan keselamatan atlet.", 3),
    ("Refleksi nilai KBC: Menunjukkan rasa cinta dan empati saat rekan setim cedera diwujudkan dengan ...", "menghentikan bola dan membantunya menepi", ["meneruskan serangan demi mencetak angka", "menertawakan kejadian jatuhnya teman kita", "pura-pura tidak melihat cedera rekan tim"], "Kemanusiaan dan kepedulian kawan berada jauh di atas sebatas kemenangan skor.", 3),
]

# BAB 2: Atletik (Jalan Cepat, Sprint, Lompat Jauh, Lempar Turbo) - 33 soal: 13 d1, 13 d2, 7 d3
b2_data = [
    # d1 (13)
    ("Induk organisasi cabang olahraga atletik di tingkat nasional Indonesia adalah ...", "PASI", ["PSSI", "PBVSI", "PERBASI"], "PASI adalah singkatan dari Persatuan Atletik Seluruh Indonesia.", 1),
    ("Atletik sering dijuluki sebagai 'Mother of Sports' yang artinya ...", "ibu dari segala cabang olahraga", ["olahraga khusus kaum wanita saja", "olahraga yang paling murah biayanya", "olahraga tertua di benua Amerika"], "Gerakan dasar atletik (jalan, lari, lompat, lempar) adalah fondasi semua olahraga.", 1),
    ("Perbedaan utama antara jalan cepat dan lari terletak pada ...", "fase melayang di udara saat melangkah", ["kecepatan ayunan kedua belah tangan", "arah pandangan mata lari ke depan", "panjang celana olahraga yang dipakai"], "Pada lari ada saat tubuh melayang, sedangkan jalan satu kaki selalu menapak tanah.", 1),
    ("Aba-aba resmi pada perlombaan lari cepat (sprint) jarak pendek adalah ...", "Bersedia, Siap, Ya! (atau bunyi pistol)", ["Satu, Dua, Tiga, Mulai!", "Awas, Hati-hati, Berlari!", "Siap, Lari, Cepat!"], "Urutan standar start jongkok: Bersedia -> Siap -> Ya! (atau pistol start).", 1),
    ("Jenis start yang digunakan untuk lari jarak pendek (sprint) adalah ...", "start jongkok", ["start berdiri", "start melayang", "start duduk"], "Start jongkok (bunch/medium/long start) memberikan daya ledak dorong tercepat.", 1),
    ("Alat pengukur waktu dalam perlombaan lari cepat disebut ...", "stopwatch", ["speedometer", "barometer", "termometer"], "Stopwatch digunakan untuk mencatat waktu tempuh atlet secara presisi.", 1),
    ("Jumlah tahapan teknik gerak dasar dalam lompat jauh ada ...", "4 tahapan", ["2 tahapan", "6 tahapan", "8 tahapan"], "Empat tahapan lompat jauh: awalan, tolakan, melayang, dan mendarat.", 1),
    ("Pada saat melakukan tolakan lompat jauh, atlet harus menolak dengan ...", "satu kaki terkuat", ["kedua belah kaki bersamaan", "kedua lutut yang rapat", "bagian tumit kedua kaki"], "Tolakan papan tumpu lompat jauh wajib menggunakan satu kaki tumpu terkuat.", 1),
    ("Tempat pendaratan atlet pada cabang lompat jauh berupa ...", "bak pasir yang gembur", ["matras busa yang keras", "lantai semen yang licin", "rumput lapangan berbatu"], "Bak pasir lembut berfungsi meredam benturan saat pendaratan kedua kaki.", 1),
    ("Alat yang dilempar pada olahraga atletik nomor lempar anak usia SD adalah ...", "roket atau turbo plastik", ["tombak besi runcing tajam", "cakram logam seberat dua kilo", "martil berantai baja panjang"], "Turbo/roket dirancang aman dan sesuai anatomi anak usia sekolah dasar.", 1),
    ("Arah tolakan dan lemparan turbo yang baik membentuk sudut parabola sekitar ...", "45 derajat ke arah depan atas", ["90 derajat lurus ke atas langit", "10 derajat mendatar ke bawah tanah", "180 derajat ke arah belakang badan"], "Sudut 45 derajat menghasilkan jarak jangkauan lemparan terjauh secara fisika.", 1),
    ("Saat melakukan lari sprint, posisi badan yang benar adalah ...", "condong ke depan secara rileks", ["tegak lurus kaku ke atas", "miring ke samping kanan kiri", "condong ke belakang menengadah"], "Badan condong ke depan membantu memanfaatkan gravitasi untuk percepatan lari.", 1),
    ("Sikap kedua tangan saat melakukan lari cepat (sprint) adalah ...", "ditekuk 90 derajat diayun seirama", ["lurus ke bawah di samping paha", "dilipat rapat di depan dada", "diangkat lurus tinggi ke atas"], "Ayunan siku 90 derajat membantu menjaga keseimbangan dan frekuensi langkah.", 1),

    # d2 (13)
    ("Peraturan penting dalam nomor jalan cepat yang tidak boleh dilanggar adalah ...", "satu kaki harus selalu menyentuh tanah", ["dilarang menoleh ke arah kanan kiri", "tidak boleh minum air selama perlombaan", "kedua tangan wajib lurus di samping paha"], "Pelanggaran 'floating' (kedua kaki melayang bersamaan) memicu diskualifikasi.", 2),
    ("Posisi pinggul saat aba-aba 'SIAP' pada start jongkok lari cepat adalah ...", "diangkat lebih tinggi dari bahu", ["sejajar rata dengan lantai tanah", "ditarik rendah mendekati tumit", "dimiringkan ke sisi kaki terlemah"], "Pinggul terangkat memindahkan titik berat badan ke lengan bersiap meluncur.", 2),
    ("Sikap pendaratan yang tepat pada lompat jauh untuk menghindari cedera lutut adalah ...", "kedua kaki mengeper dan lutut lentur", ["kaki lurus kaku membentur pasir", "mendaratkan pantat terlebih dahulu", "menumpu dengan kedua telapak tangan"], "Lutut mengeper berfungsi sebagai peredam kejut alami persendian kaki.", 2),
    ("Fungsi gerakan ayunan lengan saat melayang di udara pada lompat jauh adalah ...", "menjaga keseimbangan tubuh atlet", ["mempercepat turunnya kaki ke pasir", "membuat tubuh terbang semakin tinggi", "menakut-nakuti lawan perlombaan"], "Ayunan lengan di udara mengendalikan pusat massa agar tidak jatuh ke belakang.", 2),
    ("Cara memegang roket/turbo yang benar pada nomor lempar turbo anak adalah ...", "digenggam pada tali pegangan di atas bahu", ["dijepit dengan kedua jari telunjuk kaki", "dipegang dengan dua tangan di depan dada", "dilemparkan seperti melempar bola bowling"], "Turbo dipegang pada bagian lilitan pegangan di atas garis pundak bahu.", 2),
    ("Gerakan lanjutan setelah melempar turbo (follow through) sangat berguna untuk ...", "menjaga keseimbangan agar tidak jatuh", ["menambah laju lari penonton di pinggir", "membuat turbo berputar di udara bebas", "menghentikan perlombaan secara mendadak"], "Follow-through menyalurkan sisa momentum agar tubuh tidak melewati garis batas.", 2),
    ("Mengapa atlet lompat jauh yang mendarat lalu jatuh ke belakang merugi dalam penilaian?", "jarak diukur dari jejak tubuh terbelakang", ["karena lompatan otomatis dianulir wasit", "karena waktu melayang dinyatakan gugur", "karena pakaian atlet menjadi kotor pasir"], "Jarak diukur dari papan tolakan hingga bekas anggota badan terdekat di bak pasir.", 2),
    ("Gerak langkah kaki yang tepat saat lari sprint jarak pendek adalah ...", "langkah lebar, cepat, dan bertenaga", ["langkah pendek dan diseret santai", "melangkah pelan sambil berjinjit", "melompat-lompat dengan satu kaki"], "Frekuensi langkah tinggi dan dorongan kuat memaksimalkan kecepatan lari.", 2),
    ("Bagian telapak kaki yang digunakan sebagai tumpuan saat berlari cepat adalah ...", "bagian ujung telapak kaki depan", ["bagian tumit kaki belakang penuh", "bagian sisi luar telapak kaki saja", "seluruh telapak kaki secara rata"], "Menumpu pada bola kaki depan memberi pantulan pegas yang eksplosif.", 2),
    ("Pada saat memasuki garis finish lari sprint, gerakan yang dianjurkan adalah ...", "mencondongkan dada ke arah depan", ["melompat tinggi ke atas udara", "mengurangi kecepatan lari mendadak", "menoleh ke belakang melihat lawan"], "Pita finish disentuh oleh bagian torso/dada atlet yang condong ke depan.", 2),
    ("Manfaat utama melakukan lari bolak-balik (shuttle run) dalam latihan atletik adalah ...", "melatih kelincahan dan kecepatan ubah arah", ["membuat tubuh menjadi sangat mengantuk", "meningkatkan tinggi badan secara instan", "mengurangi berat badan dalam satu menit"], "Shuttle run melatih akselerasi, deselerasi, dan koordinasi gerak cepat.", 2),
    ("Sikap mental yang wajib ditunjukkan seorang pelari cepat jika mendahului aba-aba start adalah ...", "mengakui kesalahan dan kembali bersiap", ["marah kepada juri pencatat waktu", "tetap berlari kencang menuju finish", "menuduh lawan mengganggu startnya"], "Start mendahului (false start) harus diulang dengan sikap sportif jujur.", 2),
    ("Latihan lari zig-zag melewati corong (cone) sangat berguna melatih keterampilan ...", "kelincahan gerak menghindar rintangan", ["kekuatan daya cengkeram jari tangan", "kelenturan otot leher dan kepala", "daya tahan bernapas di dalam air"], "Gerak zig-zag melatih fleksibilitas otot paha dan koordinasi gerak kaki.", 2),

    # d3 (7)
    ("Analisis biomekanika: Mengapa panjang awalan pada lompat jauh tidak boleh terlalu pendek?", "karena kecepatan awalan menentukan jarak lompat", ["karena atlet harus menghabiskan seluruh tenaga", "karena papan tumpu terletak sangat jauh di depan", "agar penonton memiliki waktu untuk bertepuk tangan"], "Momentum horizontal lari awalan dikonversi menjadi daya dorong vertikal melayang.", 3),
    ("Evaluasi gerak jalan cepat: Apa bahaya mekanis jika lutut atlet ditekuk saat kaki tumpu mendarat?", "melanggar aturan sah dan terancam diskualifikasi", ["membuat langkah kaki meluncur semakin kencang", "mengurangi rasa pegal pada persendian lutut", "membuat tubuh melayang sangat tinggi di udara"], "Syarat mutlak jalan cepat: kaki tumpu harus lurus sejak kontak pertama tanah.", 3),
    ("Perbandingan teknik: Mengapa lemparan turbo dengan sudut 45 derajat lebih jauh daripada sudut 70 derajat?", "sudut 45 derajat menghasilkan perpaduan gaya optimal", ["sudut 70 derajat membuat turbo langsung hancur", "sudut 45 derajat membuat angin bertiup kencang", "karena roket turbo tidak boleh terbang ke udara"], "Secara proyektil, sudut 45 derajat memaksimalkan jangkauan jarak terjauh di bumi.", 3),
    ("Kritik keselamatan: Mengapa area lempar turbo harus steril dan bebas dari orang yang melintas?", "ujung turbo tajam dan dapat mencederai orang", ["agar rumput lapangan tidak rusak terinjak-injak", "karena angin dari penonton bisa mengubah arah", "supaya petugas lapangan tidak merasa kelelahan"], "Keselamatan jiwa nomor satu: proyektil lempar berpotensi menimbulkan luka fatal.", 3),
    ("Refleksi karakter: Nilai integritas yang diuji saat atlet berlari sendirian di lintasan lari adalah ...", "tetap berlari jujur tanpa memotong lintasan orang", ["berpura-pura terjatuh agar dikasihani juri", "menarik baju lawan saat luput dari pandangan", "berhenti berlari jika merasa tidak akan juara"], "Kejujuran sejati hadir saat kita patuh aturan meski tiada yang mengawasi.", 3),
    ("Analisis fisiologi: Mengapa pelari sprint jarak pendek tidak boleh bernapas tersengal-sengal di awal start?", "agar pasokan oksigen otot stabil dan ritme terjaga", ["karena bernapas dilarang saat lari sprint", "supaya udara di lapangan tidak cepat habis", "agar pelari tidak menelan serangga yang lewat"], "Kontrol napas teratur menjaga ketegangan otot inti dan efisiensi tenaga.", 3),
    ("Korelasi nilai KBC: Menghargai kawan yang finish paling akhir pada lomba lari diwujudkan dengan ...", "memberikan tepuk tangan hangat dan apresiasi", ["mengejek larinya yang lambat seperti kura-kura", "meninggalkan lapangan sebelum kawan sampai", "menertawakan kelelahan yang dialami teman"], "Kasih sayang merangkul setiap usaha perjuangan tanpa memandang nomor urut juara.", 3),
]

# BAB 3: Kebugaran Jasmani dan Pola Hidup Sehat - 32 soal: 13 d1, 13 d2, 6 d3
b3_data = [
    # d1 (13)
    ("Kemampuan tubuh melakukan aktivitas sehari-hari tanpa kelelahan berlebih disebut ...", "kebugaran jasmani", ["ketahanan pangan", "kekuatan pikiran", "kecepatan berpikir"], "Kebugaran jasmani membuat tubuh tetap segar bertenaga setelah beraktivitas.", 1),
    ("Latihan push-up secara teratur bermanfaat untuk melatih kekuatan otot ...", "lengan dan dada", ["betis dan paha", "punggung bawah", "leher dan kepala"], "Push-up membebani otot lengan (triceps) dan dada (pectoralis).", 1),
    ("Latihan sit-up sangat berguna untuk meningkatkan kekuatan otot bagian ...", "perut", ["kaki", "tangan", "bahu"], "Gerakan mengangkat badan dari posisi terlentang melatih otot dinding perut.", 1),
    ("Latihan naik turun bangku atau tangga bermanfaat melatih kekuatan otot ...", "tungkai dan kaki", ["leher dan dagu", "jari-jari tangan", "pergelangan siku"], "Tumpuan langkah tangga membebani otot paha, lutut, dan betis kaki.", 1),
    ("Latihan mencium lutut dari posisi duduk selonjor bertujuan untuk melatih ...", "kelenturan tubuh", ["kecepatan lari", "daya ledak tangan", "keseimbangan mata"], "Kelenturan (fleksibilitas) meregangkan otot punggung dan paha belakang.", 1),
    ("Waktu tidur malam yang ideal bagi anak usia sekolah dasar adalah sekitar ...", "8 sampai 9 jam", ["3 sampai 4 jam", "12 sampai 14 jam", "1 sampai 2 jam"], "Istirahat cukup 8-9 jam meregenerasi sel tubuh dan mengoptimalkan pertumbuhan.", 1),
    ("Prinsip susunan menu makanan bergizi seimbang yang dianjurkan pemerintah disebut ...", "Isi Piringku", ["Makanan Cepat Saji", "Kenyang Sepuasnya", "Diet Tanpa Karbohidrat"], "'Isi Piringku' menekankan proporsi seimbang: makanan pokok, lauk, sayur, buah.", 1),
    ("Zat gizi yang berfungsi sebagai sumber energi utama bagi aktivitas tubuh adalah ...", "karbohidrat", ["vitamin C", "kalsium tulang", "mineral air"], "Nasi, jagung, gandum, dan umbi kaya karbohidrat sebagai bahan bakar energi.", 1),
    ("Zat gizi yang berfungsi membangun dan memperbaiki sel-sel tubuh yang rusak adalah ...", "protein", ["karbohidrat", "lemak jenuh", "garam dapur"], "Protein nabati dan hewani adalah zat pembangun utama jaringan tubuh.", 1),
    ("Jumlah konsumsi air putih yang dianjurkan per hari untuk menjaga hidrasi tubuh adalah ...", "sekitar 8 gelas", ["cukup 1 gelas", "harus 20 gelas", "tidak perlu minum"], "Air putih 8 gelas (sekitar 2 liter) menjaga cairan dan fungsi organ ginjal.", 1),
    ("Membiasakan mencuci tangan dengan sabun dan air mengalir paling tepat dilakukan saat ...", "sebelum makan makanan", ["sebelum tidur siang", "setelah membaca buku", "saat menonton televisi"], "Mencuci tangan membunuh kuman patogen penyebab diare dan infeksi cerna.", 1),
    ("Menjaga kebersihan pakaian dalam dilakukan dengan cara menggantinya minimal ...", "2 kali sehari", ["1 kali seminggu", "3 hari sekali", "bila sudah robek"], "Mengganti pakaian dalam dua kali sehari mencegah timbulnya jamur dan bakteri.", 1),
    ("Bagian tubuh pribadi (seperti area dada dan alat kelamin) hanya boleh disentuh oleh ...", "diri sendiri dan orang tua untuk rawatan", ["siapa saja teman di sekolah", "orang asing yang baru dikenal", "semua orang yang meminta"], "Edukasi privasi tubuh menjaga diri dari tindakan pelecehan dan bahaya.", 1),

    # d2 (13)
    ("Gerakan peregangan statis (menahan posisi regang 8-10 hitungan) paling tepat dilakukan saat ...", "pemanasan dan pendinginan", ["sedang tidur lelap malam", "saat makan siang di kantin", "ketika sedang berlari kencang"], "Peregangan statis melenturkan serat otot dan meredakan ketegangan sendi.", 2),
    ("Latihan lari jogging santai selama 15-20 menit secara rutin sangat bermanfaat untuk melatih ...", "daya tahan jantung dan paru-paru", ["kecepatan memukul bola voli", "kekuatan mengangkat beban berat", "kelenturan jari-jari tangan"], "Latihan aerobik melatih sistem kardiorespirasi (jantung-paru) agar efisien.", 2),
    ("Sikap tubuh yang benar saat melakukan gerakan mencium lutut adalah ...", "lutut tetap lurus tidak ditekuk", ["lutut ditekuk rapat ke dagu", "punggung dimiringkan ke samping", "mata terpejam menahan napas"], "Menjaga lutut lurus memaksimalkan regangan pada otot hamstring paha.", 2),
    ("Akibat yang ditimbulkan jika tubuh sering mengonsumsi makanan cepat saji (junk food) adalah ...", "risiko obesitas dan penyakit kronis", ["tubuh menjadi semakin kebal penyakit", "tulang dan gigi menjadi sangat kuat", "daya ingat bertambah cerdas seketika"], "Junk food tinggi lemak jenuh, garam, dan gula pemicu kegemukan berlebih.", 2),
    ("Mengapa mandi dua kali sehari menggunakan sabun mandi sangat penting bagi pelajar?", "membersihkan keringat, debu, dan bakteri", ["agar kulit menjadi kebal benturan", "supaya tubuh tidak memerlukan pakaian", "menghilangkan rasa lapar setelah bermain"], "Kebersihan kulit mencegah penyakit gatal, panu, dan bau badan tak sedap.", 2),
    ("Langkah pertama yang tepat saat membersihkan diri setelah buang air kecil atau besar adalah ...", "membasuh dengan air bersih mengalir", ["mengusap dengan kain kotor basah", "membiarkan basah tanpa dikeringkan", "menyemprotkan parfum wangi semata"], "Air bersih mengalir menyucikan hadas najis secara higienis dan syar'i.", 2),
    ("Sikap yang benar jika ada orang yang berusaha menyentuh bagian tubuh pribadimu adalah ...", "berteriak tolak dan laporkan orang tua", ["diam saja karena merasa sangat takut", "memberikan uang saku kepadanya", "mengajaknya bermain bersama kawan"], "Tolak tegas: KATAKAN TIDAK, LARI KE TEMPAT AMAN, dan LAPORKAN orang dewasa.", 2),
    ("Manfaat utama mengonsumsi sayur-sayuran hijau dan buah-buahan segar adalah ...", "memperlancar pencernaan dan serat tubuh", ["membuat badan cepat merasa mengantuk", "menggantikan fungsi istirahat tidur", "membuat warna kulit menjadi hijau"], "Serat sayur dan vitamin buah menjaga fungsi usus dan metabolisme imun.", 2),
    ("Gejala yang dirasakan tubuh jika mengalami dehidrasi (kekurangan cairan) adalah ...", "mulut kering, pusing, dan urin pekat", ["badan terasa sangat segar bertenaga", "nafsu makan mendadak meningkat tajam", "detak jantung melambat sangat tenang"], "Dehidrasi menurunkan konsentrasi belajar dan stamina fungsi organ.", 2),
    ("Tindakan pertolongan pertama yang tepat saat teman mengalami kram otot kaki adalah ...", "meregangkan otot perlahan dan kompres", ["memaksa teman berdiri dan berlari", "memukul-mukul bagian otot yang kram", "menekuk kaki sekuat-kuatnya paksa"], "Peregangan pasif perlahan mengendurkan kejang kontraksi serat otot.", 2),
    ("Mengapa kuku tangan dan kaki harus dipotong pendek secara teratur seminggu sekali?", "mencegah sarang telur cacing dan kuman", ["agar kuku tidak berbunyi saat berjalan", "supaya jari tangan tidak bertambah panjang", "karena kuku panjang menghabiskan sabun"], "Kuku panjang dan hitam membawa bibit penyakit cacingan saat makan.", 2),
    ("Latihan lari mengelilingi lapangan sekolah (jogging) termasuk dalam bentuk latihan ...", "daya tahan aerobik", ["kekuatan anaerobik", "kelenturan ekstrem", "keseimbangan statis"], "Aktivitas terus menerus ritmis dengan pasokan oksigen disebut latihan aerobik.", 2),
    ("Penerapan pola hidup sehat di lingkungan sekolah yang paling mudah dilakukan adalah ...", "membuang sampah pada tempat pemilahan", ["membeli jajanan yang berwarna mencolok", "berlari-lari di tangga saat jam istirahat", "menumpuk sampah di laci meja belajar"], "Menjaga sanitasi kelas menciptakan lingkungan belajar yang asri dan higienis.", 2),

    # d3 (6)
    ("Analisis fisiologis: Mengapa detak nadi dan napas bertambah cepat saat kita melakukan aktivitas fisik berat?", "jantung memompa oksigen lebih cepat ke otot", ["paru-paru kehabisan tempat menyimpan udara", "darah berhenti mengalir di dalam pembuluh", "otak memerintahkan tubuh untuk segera tidur"], "Kerja otot meningkat menuntut pasokan oksigen dan nutrisi darah lebih banyak.", 3),
    ("Evaluasi kebiasaan: Bahaya radiasi layar gawai (gadget) jika dimainkan larut malam sebelum tidur adalah ...", "merusak ritme tidur karena cahaya biru", ["membuat mata otomatis memiliki daya tembus", "menghentikan detak jantung secara mendadak", "menghapus seluruh ingatan pelajaran hafalan"], "Cahaya biru (blue light) menekan hormon melatonin penginduksi kantuk alami.", 3),
    ("Perbandingan gizi: Mengapa nasi merah atau ubi rebus lebih menyehatkan daripada roti manis berpengawet?", "mengandung serat alami dan indeks glikemik rendah", ["karena nasi merah tidak mengandung kalori apa pun", "karena ubi rebus bisa disimpan selama bertahun-tahun", "sebab roti manis dilarang oleh dokter spesialis"], "Serat kompleks memberi rasa kenyang bertahan lama dan gula darah stabil.", 3),
    ("Pendidikan seksualitas anak: Menghormati batasan tubuh diri dan orang lain (body boundary) mencerminkan ...", "kesadaran martabat diri yang bermoral luhur", ["sikap sombong dan tidak mau berteman akrab", "ketakutan berlebihan terhadap lingkungan luar", "upaya memamerkan pakaian yang dikenakan"], "Menjaga batas fisik adalah benteng harga diri, kesopanan, dan keselamatan.", 3),
    ("Korelasi nilai KBC: Menyayangi tubuh karunia Tuhan diwujudkan dengan perilaku hidup ...", "menjaga makanan sehat, bersih, dan giat berolahraga", ["membiarkan tubuh sakit tanpa perlu berobat", "makan makanan apa saja asal rasanya manis pedas", "begadang setiap malam menonton tayangan video"], "Tubuh adalah amanah suci dari Tuhan yang wajib dirawat dengan penuh cinta.", 3),
    ("Refleksi etika kesehatan: Sikap seorang siswa saat sedang terserang flu dan batuk di dalam kelas adalah ...", "memakai masker dan menutup mulut saat batuk", ["batuk sengaja ke arah teman di sebelahnya", "melepas masker agar bernapas lebih leluasa", "meludah di lantai kelas saat guru menulis"], "Etika batuk dan bermasker memutus rantai penularan kuman kepada sahabat.", 3),
]

def main():
    target_dir = "/home/maman/play/konten/kelas4-sem1/pjok"
    batches = [
        ("b1-bola-besar.json", b1_data),
        ("b2-atletik.json", b2_data),
        ("b3-kebugaran-dan-kesehatan.json", b3_data)
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
        
    print(f"Total PJOK generated: {total} questions across {len(batches)} batches.")
    print(f"Longest key bias check: {longest_count}/{total} = {longest_count/total*100:.1f}%")

if __name__ == "__main__":
    main()
